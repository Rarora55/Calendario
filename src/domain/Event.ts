export type CalendarEvent = {
    id: string;
    calendarId: string;
    title: string;
    description?: string;
    color?: string;
    startISO: string;
    endISO: string;
    allDay?: boolean;
    note?: string;
    location?: string;
}
