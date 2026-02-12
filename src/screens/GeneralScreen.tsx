import EventCard from "@/components/EventCard";
import { CalendarEvent } from "@/src/domain/Event";
import { useAppStore } from "@/src/state/store";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTheme } from "@react-navigation/native";
import { Link, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

export default function GeneralScreen() {
    const { colors } = useTheme();
    const hydrated = useAppStore((s: any) => s.hydrated);
    const hydrate = useAppStore((s: any) => s.hydrate);
    const calendars = useAppStore((s: any) => s.calendars);
    const events = useAppStore((s: any) => s.events as CalendarEvent[]);
    const deleteEvent = useAppStore((s: any) => s.deleteEvent);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [labelQuery, setLabelQuery] = useState("");

    useEffect(() => {
        if (!hydrated) void hydrate();
    }, [hydrated, hydrate]);

    const generalEvents = useMemo(() => {
        const visibleIds = new Set(
            calendars.filter((c: any) => c.isVisible).map((c: any) => c.id)
        );

        return events
            .filter((e: CalendarEvent) => visibleIds.has(e.calendarId))
            .slice()
            .sort((a: CalendarEvent, b: CalendarEvent) =>
                a.startISO.localeCompare(b.startISO)
            );
    }, [calendars, events]);

    const calendarById = useMemo(() => {
        return new Map(calendars.map((c: any) => [c.id, c]));
    }, [calendars]);

    const filteredEvents = useMemo(() => {
        const query = labelQuery.trim().toLowerCase();
        if (!query) return generalEvents;
        return generalEvents.filter((e: CalendarEvent) =>
            (e.label ?? "").toLowerCase().includes(query)
        );
    }, [generalEvents, labelQuery]);

    useEffect(() => {
        if (selectedEventId && !filteredEvents.some((e) => e.id === selectedEventId)) {
            setSelectedEventId(null);
        }
    }, [filteredEvents, selectedEventId]);

    const onSelectEvent = (id: string) => {
        setSelectedEventId((current) => (current === id ? null : id));
    };

    const onPressBin = () => {
        if (!selectedEventId) return;
        deleteEvent(selectedEventId);
        setSelectedEventId(null);
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
                General
            </Text>

            <TextInput
                placeholder="Filtrar por etiqueta..."
                placeholderTextColor={colors.text}
                value={labelQuery}
                onChangeText={setLabelQuery}
                style={{
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: 12,
                    borderColor: colors.border,
                    color: colors.text,
                }}
            />

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ gap: 12, paddingBottom: 12 }}
            >
                {filteredEvents.length ? (
                    filteredEvents.map((e: CalendarEvent) => {
                        const cal = calendarById.get(e.calendarId);
                        const eventColor = e.color ?? (cal as { color?: string } | undefined)?.color;
                        const isSelected = selectedEventId === e.id;
                        const subtitleBase = new Date(e.startISO).toLocaleString();
                        const subtitle = e.label?.trim()
                            ? `${subtitleBase} · #${e.label}`
                            : subtitleBase;
                        return (
                            <EventCard
                                key={e.id}
                                title={e.title}
                                subtitle={subtitle}
                                color={eventColor}
                                textColor={colors.text}
                                subtitleColor={colors.text}
                                borderColor={isSelected ? "#22c55e" : colors.border}
                                backgroundColor={isSelected ? "rgba(34, 197, 94, 0.14)" : undefined}
                                onPress={() => onSelectEvent(e.id)}
                                actionLabel="Ver"
                                onActionPress={() =>
                                    router.push({ pathname: "/event/[id]", params: { id: e.id } })
                                }
                            />
                        );
                    })
                ) : (
                    <Text style={{ color: colors.text, opacity: 0.7 }}>
                        No hay eventos con esa etiqueta.
                    </Text>
                )}
            </ScrollView>

            <Pressable
                onPress={onPressBin}
                disabled={!selectedEventId}
                style={{
                    padding: 12,
                    borderWidth: 1,
                    borderRadius: 12,
                    borderColor: selectedEventId ? "#ef4444" : colors.border,
                    backgroundColor: selectedEventId ? "rgba(239, 68, 68, 0.12)" : "transparent",
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 8,
                    opacity: selectedEventId ? 1 : 0.6,
                }}
            >
                <FontAwesome
                    name="trash"
                    size={18}
                    color={selectedEventId ? "#ef4444" : colors.text}
                />
                <Text style={{ color: colors.text }}>Bin</Text>
            </Pressable>

            <Link href="/day" asChild>
                <Pressable
                    style={{
                        padding: 14,
                        borderWidth: 1,
                        borderRadius: 12,
                        alignItems: "center",
                        borderColor: colors.border,
                    }}
                >
                    <Text style={{ color: colors.text }}>Abrir dia</Text>
                </Pressable>
            </Link>
        </View>
    );
}
