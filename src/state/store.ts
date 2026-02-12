import { create } from 'zustand';
import { Calendar } from '../domain/Calendar';
import { CalendarEvent } from '../domain/Event';
import { loadState, saveState } from './persist';
import { seedCalendars, seedEvent } from './seed';

type AppState = {
    hydrated: boolean;
    calendars: Calendar[];
    events: CalendarEvent[];
    binEvents: CalendarEvent[];

    hydrate: () => Promise<void>;

    //Calendars
    addCalendar: (c: Calendar) => void;
    toggleCalendarVisibility: (id: string) => void;

    //Events
    addEvent: (e: CalendarEvent) => void;
    updateEvent: (id: string, patch: Partial<CalendarEvent>) => void;
    deleteEvent: (id: string) => void;
    restoreEventFromBin: (id: string) => void;
    deleteEventPermanently: (id: string) => void;
    clearBin: () => void;
    getEventById: (id: string) => CalendarEvent | undefined;

    //Selectors/Helpers
    getVisibleCalendars: () => Set<string>;
    getGeneralEvents: () => CalendarEvent[];
};

export const useAppStore = create<AppState>((set, get) => ({
    hydrated: false,
    calendars: [],
    events: [],
    binEvents: [],

    hydrate: async () => {
        const persisted = await loadState();
        if (persisted && Array.isArray(persisted.calendars) && Array.isArray(persisted.events)) {
            set({
                hydrated: true,
                calendars: persisted.calendars as Calendar[],
                events: persisted.events as CalendarEvent[],
                binEvents: Array.isArray(persisted.binEvents)
                    ? (persisted.binEvents as CalendarEvent[])
                    : [],
            });
            return;
        }
        set({
            hydrated: true,
            calendars: seedCalendars,
            events: seedEvent,
            binEvents: [],
        });
    },

    addCalendar: (c) => {
        const next = [...get().calendars, c];
        set({ calendars: next });
        void saveState({
            calendars: next,
            events: get().events,
            binEvents: get().binEvents,
        });
    },

    toggleCalendarVisibility: (id) => {
        const next = get().calendars.map((cal) =>
            cal.id === id ? { ...cal, isVisible: !cal.isVisible } : cal
        );
        set({ calendars: next });
        void saveState({
            calendars: next,
            events: get().events,
            binEvents: get().binEvents,
        });
    },

    addEvent: (e) => {
        const next = [...get().events, e];
        set({ events: next });
        void saveState({
            calendars: get().calendars,
            events: next,
            binEvents: get().binEvents,
        });

    },

    updateEvent: (id, patch) => {
        const next = get().events.map((event) =>
            event.id === id ? { ...event, ...patch } : event
        );
        set({ events: next });
        void saveState({
            calendars: get().calendars,
            events: next,
            binEvents: get().binEvents,
        });
    },

    deleteEvent: (id) => {
        const current = get().events;
        const toDelete = current.find((event) => event.id === id);
        if (!toDelete) return;
        const nextEvents = current.filter((event) => event.id !== id);
        const nextBin = [...get().binEvents.filter((event) => event.id !== id), toDelete];
        set({ events: nextEvents, binEvents: nextBin });
        void saveState({
            calendars: get().calendars,
            events: nextEvents,
            binEvents: nextBin,
        });
    },

    restoreEventFromBin: (id) => {
        const currentBin = get().binEvents;
        const toRestore = currentBin.find((event) => event.id === id);
        if (!toRestore) return;
        const nextBin = currentBin.filter((event) => event.id !== id);
        const nextEvents = [...get().events.filter((event) => event.id !== id), toRestore];
        set({ events: nextEvents, binEvents: nextBin });
        void saveState({
            calendars: get().calendars,
            events: nextEvents,
            binEvents: nextBin,
        });
    },

    deleteEventPermanently: (id) => {
        const nextBin = get().binEvents.filter((event) => event.id !== id);
        set({ binEvents: nextBin });
        void saveState({
            calendars: get().calendars,
            events: get().events,
            binEvents: nextBin,
        });
    },

    clearBin: () => {
        set({ binEvents: [] });
        void saveState({
            calendars: get().calendars,
            events: get().events,
            binEvents: [],
        });
    },

    getEventById: (id) => {
        return (
            get().events.find((event) => event.id === id) ??
            get().binEvents.find((event) => event.id === id)
        );
    },

    getVisibleCalendars: () => {

        return new Set(get().calendars.filter(cal => cal.isVisible).map(cal => cal.id));

    },

    getGeneralEvents: () => {
        const visible = get().getVisibleCalendars();
        return get()
            .events
            .filter((e) => visible.has(e.calendarId))
            .slice()
            .sort((a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime());

    },
}));
