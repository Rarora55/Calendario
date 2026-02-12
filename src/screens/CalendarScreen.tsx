import EventCard from "@/components/EventCard";
import { CalendarEvent } from "@/src/domain/Event";
import { useAppStore } from "@/src/state/store";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const dayLabels = ["L", "M", "X", "J", "V", "S", "D"];
const monthLabels = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
];

function monthStart(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthMatrix(year: number, month: number): (Date | null)[] {
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = (first.getDay() + 6) % 7;
    const cells: (Date | null)[] = [];
    for (let i = 0; i < offset; i += 1) cells.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
}

function sameDay(a: Date, b: Date) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function dayKey(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate()
    ).padStart(2, "0")}`;
}

function startOfDay(date: Date) {
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    return next;
}

function addDays(date: Date, days: number) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
}

export default function CalendarScreen() {
    const { colors } = useTheme();
    const hydrated = useAppStore((s) => s.hydrated);
    const hydrate = useAppStore((s) => s.hydrate);
    const calendars = useAppStore((s) => s.calendars);
    const events = useAppStore((s) => s.events as CalendarEvent[]);

    const [viewDate, setViewDate] = useState(() => monthStart(new Date()));
    const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));

    useEffect(() => {
        if (!hydrated) void hydrate();
    }, [hydrated, hydrate]);

    const monthDays = useMemo(
        () => getMonthMatrix(viewDate.getFullYear(), viewDate.getMonth()),
        [viewDate]
    );

    const visibleIds = useMemo(
        () => new Set(calendars.filter((c: any) => c.isVisible).map((c: any) => c.id)),
        [calendars]
    );

    const monthEvents = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const monthStartDate = startOfDay(new Date(year, month, 1));
        const monthEndDate = startOfDay(new Date(year, month + 1, 0));

        return events
            .filter((e: CalendarEvent) => visibleIds.has(e.calendarId))
            .filter((e: CalendarEvent) => {
                const start = startOfDay(new Date(e.startISO));
                const endRaw = startOfDay(new Date(e.endISO));
                if (Number.isNaN(start.getTime()) || Number.isNaN(endRaw.getTime())) {
                    return false;
                }
                const end = endRaw < start ? start : endRaw;
                return start <= monthEndDate && end >= monthStartDate;
            })
            .slice()
            .sort((a: CalendarEvent, b: CalendarEvent) => a.startISO.localeCompare(b.startISO));
    }, [events, visibleIds, viewDate]);

    const monthEventsByDay = useMemo(() => {
        const monthStartDate = startOfDay(new Date(viewDate.getFullYear(), viewDate.getMonth(), 1));
        const monthEndDate = startOfDay(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0));
        const map = new Map<string, CalendarEvent[]>();

        for (const event of monthEvents) {
            const start = startOfDay(new Date(event.startISO));
            const endRaw = startOfDay(new Date(event.endISO));
            if (Number.isNaN(start.getTime()) || Number.isNaN(endRaw.getTime())) {
                continue;
            }
            const end = endRaw < start ? start : endRaw;
            const rangeStart = start < monthStartDate ? monthStartDate : start;
            const rangeEnd = end > monthEndDate ? monthEndDate : end;

            let cursor = rangeStart;
            while (cursor <= rangeEnd) {
                const key = dayKey(cursor);
                const current = map.get(key) ?? [];
                current.push(event);
                map.set(key, current);
                cursor = addDays(cursor, 1);
            }
        }
        return map;
    }, [monthEvents, viewDate]);

    const selectedEvents = useMemo(() => {
        return monthEventsByDay.get(dayKey(selectedDate)) ?? [];
    }, [monthEventsByDay, selectedDate]);

    const calendarById = useMemo(() => {
        return new Map(calendars.map((c: any) => [c.id, c]));
    }, [calendars]);

    const moveMonth = (delta: number) => {
        const next = new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1);
        setViewDate(next);
        setSelectedDate(startOfDay(next));
    };

    if (!hydrated) {
        return (
            <View style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
                <Text style={{ color: colors.text }}>Cargando...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, padding: 16, gap: 12, backgroundColor: colors.background }}>
            <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>
                Calendario
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Pressable
                    onPress={() => moveMonth(-1)}
                    style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderWidth: 1,
                        borderRadius: 8,
                        borderColor: colors.border,
                    }}
                >
                    <Text style={{ color: colors.text }}>{"<"}</Text>
                </Pressable>
                <Text style={{ color: colors.text, fontWeight: "700" }}>
                    {monthLabels[viewDate.getMonth()]} {viewDate.getFullYear()}
                </Text>
                <Pressable
                    onPress={() => moveMonth(1)}
                    style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderWidth: 1,
                        borderRadius: 8,
                        borderColor: colors.border,
                    }}
                >
                    <Text style={{ color: colors.text }}>{">"}</Text>
                </Pressable>
            </View>

            <View
                style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    paddingVertical: 8,
                    paddingHorizontal: 4,
                }}
            >
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    {dayLabels.map((d) => (
                        <View key={d} style={{ width: "14.28%", paddingVertical: 6 }}>
                            <Text style={{ textAlign: "center", color: colors.text }}>{d}</Text>
                        </View>
                    ))}
                    {monthDays.map((date, idx) => {
                        if (!date) {
                            return <View key={`empty-${idx}`} style={{ width: "14.28%", padding: 8 }} />;
                        }

                        const key = dayKey(date);
                        const dayEvents = monthEventsByDay.get(key) ?? [];
                        const isSelected = sameDay(date, selectedDate);

                        return (
                            <Pressable
                                key={date.toISOString()}
                                onPress={() => setSelectedDate(startOfDay(date))}
                                style={{ width: "14.28%", padding: 6, alignItems: "center", gap: 4 }}
                            >
                                <View
                                    style={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: 15,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderWidth: 1,
                                        borderColor: isSelected ? colors.primary : colors.border,
                                        backgroundColor: isSelected ? colors.primary : "transparent",
                                    }}
                                >
                                    <Text style={{ color: isSelected ? "#ffffff" : colors.text }}>
                                        {date.getDate()}
                                    </Text>
                                </View>
                                <View style={{ minHeight: 8, justifyContent: "center" }}>
                                    {dayEvents.length ? (
                                        <Text style={{ color: colors.text, fontSize: 10 }}>
                                            {Math.min(dayEvents.length, 9)}
                                        </Text>
                                    ) : null}
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            <Text style={{ color: colors.text, fontWeight: "700" }}>
                Eventos del {selectedDate.toLocaleDateString()}
            </Text>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 10, paddingBottom: 12 }}>
                {selectedEvents.length ? (
                    selectedEvents.map((e: CalendarEvent) => {
                        const cal = calendarById.get(e.calendarId);
                        const eventColor = e.color ?? (cal as { color?: string } | undefined)?.color;
                        return (
                            <EventCard
                                key={e.id}
                                title={e.title}
                                subtitle={new Date(e.startISO).toLocaleString()}
                                color={eventColor}
                                textColor={colors.text}
                                subtitleColor={colors.text}
                                borderColor={colors.border}
                                actionLabel="Ver"
                                onActionPress={() =>
                                    router.push({ pathname: "/event/[id]", params: { id: e.id } })
                                }
                            />
                        );
                    })
                ) : (
                    <Text style={{ color: colors.text, opacity: 0.7 }}>
                        No hay eventos en el dia seleccionado.
                    </Text>
                )}
            </ScrollView>
        </View>
    );
}
