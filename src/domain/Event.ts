export type CalendarEvent = {
    id: string;
    calendarId: string;
    title: string;
    startISO: string;
    endISO: string;
    allDay?: boolean;
    note?: string;
    location?: string;
}