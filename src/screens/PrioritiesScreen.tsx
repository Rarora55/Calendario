import EventCard from "@/components/EventCard";
import { CalendarEvent } from "@/src/domain/Event";
import { useAppStore } from "@/src/state/store";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import { useEffect, useMemo } from "react";
import { ScrollView, Text, View } from "react-native";

export default function PrioritiesScreen() {
    const { colors } = useTheme();
    const hydrated = useAppStore((s) => s.hydrated);
    const hydrate = useAppStore((s) => s.hydrate);
    const calendars = useAppStore((s) => s.calendars);
    const events = useAppStore((s) => s.events as CalendarEvent[]);

    useEffect(() => {
        if (!hydrated) void hydrate();
    }, [hydrated, hydrate]);

    const highPriorityEvents = useMemo(() => {
        const visibleIds = new Set(
            calendars.filter((c: any) => c.isVisible).map((c: any) => c.id)
        );

        return events
            .filter((e: CalendarEvent) => visibleIds.has(e.calendarId))
            .filter((e: CalendarEvent) => e.priority === "alta")
            .slice()
            .sort((a: CalendarEvent, b: CalendarEvent) =>
                a.startISO.localeCompare(b.startISO)
            );
    }, [calendars, events]);

    const calendarById = useMemo(() => {
        return new Map(calendars.map((c: any) => [c.id, c]));
    }, [calendars]);

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
                Prioridades
            </Text>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 12, paddingBottom: 12 }}>
                {highPriorityEvents.length ? (
                    highPriorityEvents.map((e: CalendarEvent) => {
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
                        No hay eventos con prioridad alta.
                    </Text>
                )}
            </ScrollView>
        </View>
    );
}
