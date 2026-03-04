import EventCard from "@/components/EventCard";
import { CalendarEvent } from "@/src/domain/Event";
import { useTabSwipeNavigation } from "@/src/hooks/useTabSwipeNavigation";
import { useAppStore } from "@/src/state/store";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTheme } from "@react-navigation/native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

function normalizeLabel(label: string) {
    return label.trim().toLowerCase();
}

function toParamValue(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
}

export default function LabelEventsScreen() {
    const { colors } = useTheme();
    const swipeHandlers = useTabSwipeNavigation();
    const { name: rawName, empty: rawEmpty } = useLocalSearchParams<{
        name?: string | string[];
        empty?: string | string[];
    }>();
    const hydrated = useAppStore((s: any) => s.hydrated);
    const hydrate = useAppStore((s: any) => s.hydrate);
    const calendars = useAppStore((s: any) => s.calendars);
    const events = useAppStore((s: any) => s.events as CalendarEvent[]);
    const deleteEvent = useAppStore((s: any) => s.deleteEvent);

    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    const labelName = toParamValue(rawName)?.trim() ?? "";
    const isEmptyGroup = toParamValue(rawEmpty) === "1";
    const title = isEmptyGroup ? "Sin grupo" : labelName;

    useEffect(() => {
        if (!hydrated) void hydrate();
    }, [hydrated, hydrate]);

    const calendarById = useMemo(() => {
        return new Map(calendars.map((c: any) => [c.id, c]));
    }, [calendars]);

    const filteredEvents = useMemo(() => {
        const visibleIds = new Set(calendars.filter((c: any) => c.isVisible).map((c: any) => c.id));

        return events
            .filter((event) => visibleIds.has(event.calendarId))
            .filter((event) => {
                const current = event.label?.trim() ?? "";
                if (isEmptyGroup) return !current;
                if (!labelName) return false;
                return normalizeLabel(current) === normalizeLabel(labelName);
            })
            .slice()
            .sort((a, b) => a.startISO.localeCompare(b.startISO));
    }, [calendars, events, isEmptyGroup, labelName]);

    useEffect(() => {
        if (selectedEventId && !filteredEvents.some((event) => event.id === selectedEventId)) {
            setSelectedEventId(null);
        }
    }, [filteredEvents, selectedEventId]);

    const onPressBin = () => {
        if (!selectedEventId) return;
        deleteEvent(selectedEventId);
        setSelectedEventId(null);
    };

    if (!hydrated) {
        return (
            <View
                {...swipeHandlers}
                style={{ flex: 1, padding: 16, backgroundColor: colors.background }}
            >
                <Text style={{ color: colors.text }}>Cargando...</Text>
            </View>
        );
    }

    return (
        <View
            {...swipeHandlers}
            style={{ flex: 1, padding: 16, gap: 12, backgroundColor: colors.background }}
        >
            <Stack.Screen options={{ title }} />

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 12, paddingBottom: 12 }}>
                {filteredEvents.length ? (
                    filteredEvents.map((event) => {
                        const cal = calendarById.get(event.calendarId);
                        const eventColor = event.color ?? (cal as { color?: string } | undefined)?.color;
                        const isSelected = selectedEventId === event.id;
                        const subtitle = new Date(event.startISO).toLocaleString();

                        return (
                            <EventCard
                                key={event.id}
                                title={event.title}
                                subtitle={subtitle}
                                color={eventColor}
                                textColor={colors.text}
                                subtitleColor={colors.text}
                                borderColor={isSelected ? "#22c55e" : colors.border}
                                backgroundColor={isSelected ? "rgba(34, 197, 94, 0.14)" : undefined}
                                onPress={() =>
                                    setSelectedEventId((current) =>
                                        current === event.id ? null : event.id
                                    )
                                }
                                actionLabel="Ver"
                                onActionPress={() =>
                                    router.push({ pathname: "/event/[id]", params: { id: event.id } })
                                }
                            />
                        );
                    })
                ) : (
                    <Text style={{ color: colors.text, opacity: 0.7 }}>
                        No hay eventos en este supergrupo.
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
        </View>
    );
}
