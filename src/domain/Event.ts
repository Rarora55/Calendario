export type EventPriority = "baja" | "media" | "alta";

export type CalendarEvent = {
    id: string;
    calendarId: string;
    title: string;
    label?: string;
    description?: string;
    priority?: EventPriority;
    color?: string;
    startISO: string;
    endISO: string;
    allDay?: boolean;
    note?: string;
    location?: string;
}
