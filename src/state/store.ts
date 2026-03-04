import { create } from "zustand";
import { Calendar } from "../domain/Calendar";
import { CalendarEvent } from "../domain/Event";
import {
    DEFAULT_LABEL_COLOR,
    LABEL_COLOR_OPTIONS,
    LabelDefinition,
} from "../domain/Label";
import { loadState, saveState } from "./persist";
import { seedCalendars, seedEvent } from "./seed";

type AppState = {
    hydrated: boolean;
    calendars: Calendar[];
    events: CalendarEvent[];
    binEvents: CalendarEvent[];
    labelHistory: string[];
    labels: LabelDefinition[];

    hydrate: () => Promise<void>;

    // Calendars
    addCalendar: (c: Calendar) => void;
    toggleCalendarVisibility: (id: string) => void;

    // Events
    addEvent: (e: CalendarEvent) => void;
    updateEvent: (id: string, patch: Partial<CalendarEvent>) => void;
    deleteEvent: (id: string) => void;
    restoreEventFromBin: (id: string) => void;
    deleteEventPermanently: (id: string) => void;
    clearBin: () => void;
    getEventById: (id: string) => CalendarEvent | undefined;
    addLabelToHistory: (label: string) => void;
    upsertLabel: (label: string, color?: string) => void;
    updateLabelColor: (label: string, color: string) => void;

    // Selectors/Helpers
    getVisibleCalendars: () => Set<string>;
    getGeneralEvents: () => CalendarEvent[];
    getLabelColor: (label?: string) => string | undefined;
};

type PersistedSlice = Pick<
    AppState,
    "calendars" | "events" | "binEvents" | "labelHistory" | "labels"
>;

function normalizeLabel(label: string) {
    return label.trim().toLowerCase();
}

function pickLabelColor(label: string) {
    const text = normalizeLabel(label);
    if (!text) return DEFAULT_LABEL_COLOR;
    let hash = 0;
    for (let i = 0; i < text.length; i += 1) {
        hash = (hash << 5) - hash + text.charCodeAt(i);
        hash |= 0;
    }
    const palette = LABEL_COLOR_OPTIONS;
    return palette[Math.abs(hash) % palette.length] ?? DEFAULT_LABEL_COLOR;
}

function normalizeColor(color?: string) {
    const clean = color?.trim();
    return clean || undefined;
}

function sanitizeLabels(raw: unknown) {
    if (!Array.isArray(raw)) return [] as LabelDefinition[];
    const map = new Map<string, LabelDefinition>();

    for (const item of raw) {
        if (!item || typeof item !== "object") continue;
        const maybeName = "name" in item ? item.name : undefined;
        const maybeColor = "color" in item ? item.color : undefined;
        if (typeof maybeName !== "string") continue;
        const cleanName = maybeName.trim();
        if (!cleanName) continue;
        const key = normalizeLabel(cleanName);
        if (map.has(key)) continue;
        map.set(key, {
            name: cleanName,
            color:
                (typeof maybeColor === "string" ? normalizeColor(maybeColor) : undefined) ??
                pickLabelColor(cleanName),
        });
    }

    return Array.from(map.values());
}

function upsertLabelInCatalog(
    current: LabelDefinition[],
    label: string | undefined,
    color?: string
) {
    const cleanName = label?.trim();
    if (!cleanName) return current;
    const key = normalizeLabel(cleanName);
    const nextColor = normalizeColor(color);
    const existing = current.find((item) => normalizeLabel(item.name) === key);

    if (!existing) {
        return [...current, { name: cleanName, color: nextColor ?? pickLabelColor(cleanName) }];
    }

    return current.map((item) =>
        normalizeLabel(item.name) === key
            ? { ...item, name: cleanName, color: nextColor ?? item.color }
            : item
    );
}

function buildLabelsFromEvents(
    events: CalendarEvent[],
    catalog: LabelDefinition[]
) {
    let next = [...catalog];
    for (const event of events) {
        next = upsertLabelInCatalog(next, event.label);
    }
    return next;
}

export const useAppStore = create<AppState>((set, get) => {
    const persistSnapshot = (overrides: Partial<PersistedSlice> = {}) => {
        const state = get();
        void saveState({
            calendars: overrides.calendars ?? state.calendars,
            events: overrides.events ?? state.events,
            binEvents: overrides.binEvents ?? state.binEvents,
            labelHistory: overrides.labelHistory ?? state.labelHistory,
            labels: overrides.labels ?? state.labels,
        });
    };

    return {
        hydrated: false,
        calendars: [],
        events: [],
        binEvents: [],
        labelHistory: [],
        labels: [],

        hydrate: async () => {
            const persisted = await loadState();
            if (persisted && Array.isArray(persisted.calendars) && Array.isArray(persisted.events)) {
                const persistedEvents = persisted.events as CalendarEvent[];
                const initialLabels = buildLabelsFromEvents(
                    persistedEvents,
                    sanitizeLabels(persisted.labels)
                );

                set({
                    hydrated: true,
                    calendars: persisted.calendars as Calendar[],
                    events: persistedEvents,
                    binEvents: Array.isArray(persisted.binEvents)
                        ? (persisted.binEvents as CalendarEvent[])
                        : [],
                    labelHistory: Array.isArray(persisted.labelHistory)
                        ? (persisted.labelHistory as string[])
                        : [],
                    labels: initialLabels,
                });
                return;
            }

            set({
                hydrated: true,
                calendars: seedCalendars,
                events: seedEvent,
                binEvents: [],
                labelHistory: [],
                labels: buildLabelsFromEvents(seedEvent, []),
            });
        },

        addCalendar: (c) => {
            const next = [...get().calendars, c];
            set({ calendars: next });
            persistSnapshot({ calendars: next });
        },

        toggleCalendarVisibility: (id) => {
            const next = get().calendars.map((cal) =>
                cal.id === id ? { ...cal, isVisible: !cal.isVisible } : cal
            );
            set({ calendars: next });
            persistSnapshot({ calendars: next });
        },

        addEvent: (e) => {
            const nextEvents = [...get().events, e];
            const nextLabels = upsertLabelInCatalog(get().labels, e.label);
            set({ events: nextEvents, labels: nextLabels });
            persistSnapshot({ events: nextEvents, labels: nextLabels });
        },

        updateEvent: (id, patch) => {
            const nextEvents = get().events.map((event) =>
                event.id === id ? { ...event, ...patch } : event
            );
            const updatedEvent = nextEvents.find((event) => event.id === id);
            const nextLabels = upsertLabelInCatalog(get().labels, updatedEvent?.label);
            set({ events: nextEvents, labels: nextLabels });
            persistSnapshot({ events: nextEvents, labels: nextLabels });
        },

        deleteEvent: (id) => {
            const current = get().events;
            const toDelete = current.find((event) => event.id === id);
            if (!toDelete) return;
            const nextEvents = current.filter((event) => event.id !== id);
            const nextBin = [...get().binEvents.filter((event) => event.id !== id), toDelete];
            set({ events: nextEvents, binEvents: nextBin });
            persistSnapshot({ events: nextEvents, binEvents: nextBin });
        },

        restoreEventFromBin: (id) => {
            const currentBin = get().binEvents;
            const toRestore = currentBin.find((event) => event.id === id);
            if (!toRestore) return;
            const nextBin = currentBin.filter((event) => event.id !== id);
            const nextEvents = [...get().events.filter((event) => event.id !== id), toRestore];
            const nextLabels = upsertLabelInCatalog(get().labels, toRestore.label);
            set({ events: nextEvents, binEvents: nextBin, labels: nextLabels });
            persistSnapshot({ events: nextEvents, binEvents: nextBin, labels: nextLabels });
        },

        deleteEventPermanently: (id) => {
            const nextBin = get().binEvents.filter((event) => event.id !== id);
            set({ binEvents: nextBin });
            persistSnapshot({ binEvents: nextBin });
        },

        clearBin: () => {
            set({ binEvents: [] });
            persistSnapshot({ binEvents: [] });
        },

        addLabelToHistory: (label) => {
            const clean = label.trim();
            if (!clean) return;
            const normalized = clean.toLowerCase();
            const withoutDuplicates = get().labelHistory.filter(
                (item) => item.trim().toLowerCase() !== normalized
            );
            const next = [clean, ...withoutDuplicates].slice(0, 20);
            set({ labelHistory: next });
            persistSnapshot({ labelHistory: next });
        },

        upsertLabel: (label, color) => {
            const next = upsertLabelInCatalog(get().labels, label, color);
            set({ labels: next });
            persistSnapshot({ labels: next });
        },

        updateLabelColor: (label, color) => {
            const cleanColor = normalizeColor(color);
            if (!cleanColor) return;
            const next = upsertLabelInCatalog(get().labels, label, cleanColor);
            set({ labels: next });
            persistSnapshot({ labels: next });
        },

        getEventById: (id) => {
            return (
                get().events.find((event) => event.id === id) ??
                get().binEvents.find((event) => event.id === id)
            );
        },

        getVisibleCalendars: () => {
            return new Set(get().calendars.filter((cal) => cal.isVisible).map((cal) => cal.id));
        },

        getGeneralEvents: () => {
            const visible = get().getVisibleCalendars();
            return get()
                .events
                .filter((e) => visible.has(e.calendarId))
                .slice()
                .sort((a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime());
        },

        getLabelColor: (label) => {
            const clean = label?.trim();
            if (!clean) return undefined;
            const key = normalizeLabel(clean);
            const match = get().labels.find((item) => normalizeLabel(item.name) === key);
            return match?.color;
        },
    };
});
