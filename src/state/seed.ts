import { Calendar } from "../domain/Calendar";
import { CalendarEvent } from "../domain/Event";

export const seedCalendars: Calendar[] = [
    { id: "cal-1", name: "Personal", color: "#3b82f6", isVisible: true },
    { id: "cal-2", name: "Trabajo", color: "#ef4444", isVisible: true },
];

const now = new Date();
const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
const inTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

export const seedEvent: CalendarEvent[] = [
    {
        id: "event-1",
        calendarId: "cal-1",
        title: "Reunion con amigos",
        label: "Social",
        description: "Cena y charla en el centro",
        location: "Barcelona",
        priority: "media",
        startISO: now.toISOString(),
        endISO: inOneHour.toISOString(),
    },
    {
        id: "event-2",
        calendarId: "cal-2",
        title: "Revision de proyecto",
        label: "Trabajo",
        description: "Revisar hitos y proximo sprint",
        location: "Oficina",
        priority: "alta",
        startISO: inOneHour.toISOString(),
        endISO: inTwoHours.toISOString(),
    },
];
