import { create } from 'zustand';
import { Calendar } from '../domain/Calendar';
import { CalendarEvent } from '../domain/Event';
import { loadState, saveState } from './persist';
import { seedCalendars, seedEvent } from './seed';

type AppState = {
    hydrated: boolean;
    calendars: Calendar[];
    events: CalendarEvent[];

    hydrate: () => Promise<void>;

    //Calendars
    addCalendar: (c: Calendar) => void;
    toggleCalendarVisibility: (id: string) => void;

    //Events
    addEvent: (e: CalendarEvent) => void;

    //Selectors/Helpers
    getVisibleCalendars: () => Set<string>;
    getGeneralEvents: () => CalendarEvent[];
};

export const useAppStore = create<AppState>((set, get) => ({
    hydrated: false,
    calendars: [],
    events: [],

    hydrate: async () => {
        const persisted = await loadState();
        if (persisted && Array.isArray(persisted.calendars) && Array.isArray(persisted.events)) {
            set({
                hydrated: true,
                calendars: persisted.calendars as Calendar[],
                events: persisted.events as CalendarEvent[],
            });
            return;
        }
        set({
            hydrated: true,
            calendars: seedCalendars,
            events: seedEvent,
        });
    },

    addCalendar: (c) => {
        const next = [...get().calendars, c];
        set({ calendars: next });
        void saveState({
            calendars: next,
            events: get().events,
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
        });
    },

    addEvent: (e) => {
        const next = [...get().events, e];
        set({ events: next });
        void saveState({
            calendars: get().calendars,
            events: next,
        });

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