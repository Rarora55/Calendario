import EventCard from "@/components/EventCard";
import { CalendarEvent } from "@/src/domain/Event";
import { useAppStore } from "@/src/state/store";
import { useTheme } from "@react-navigation/native";
import { useEffect } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function BinScreen() {
    const { colors } = useTheme();
    const hydrated = useAppStore((s) => s.hydrated);
    const hydrate = useAppStore((s) => s.hydrate);
    const calendars = useAppStore((s) => s.calendars);
    const binEvents = useAppStore((s) => s.binEvents);
    const restoreEventFromBin = useAppStore((s) => s.restoreEventFromBin);
    const deleteEventPermanently = useAppStore((s) => s.deleteEventPermanently);
    const clearBin = useAppStore((s) => s.clearBin);

    useEffect(() => {
        if (!hydrated) void hydrate();
    }, [hydrated, hydrate]);

    if (!hydrated) {
        return (
            <View style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
                <Text style={{ color: colors.text }}>Cargando...</Text>
            </View>
        );
    }

    const calendarById = new Map(calendars.map((c) => [c.id, c]));

    return (
        <View style={{ flex: 1, padding: 16, gap: 12, backgroundColor: colors.background }}>
            <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>
                Bin
            </Text>

            {binEvents.length ? (
                <Pressable
                    onPress={clearBin}
                    style={{
                        padding: 12,
                        borderWidth: 1,
                        borderRadius: 12,
                        borderColor: colors.border,
                        alignItems: "center",
                    }}
                >
                    <Text style={{ color: colors.text }}>Vaciar papelera</Text>
                </Pressable>
            ) : null}

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ gap: 12, paddingBottom: 12 }}
            >
                {binEvents.length ? (
                    binEvents.map((e: CalendarEvent) => {
                        const cal = calendarById.get(e.calendarId);
                        const eventColor = e.color ?? (cal as { color?: string } | undefined)?.color;
                        return (
                            <View key={e.id} style={{ gap: 8 }}>
                                <EventCard
                                    title={e.title}
                                    subtitle={new Date(e.startISO).toLocaleString()}
                                    color={eventColor}
                                    textColor={colors.text}
                                    subtitleColor={colors.text}
                                    borderColor={colors.border}
                                    actionLabel="Restaurar"
                                    onActionPress={() => restoreEventFromBin(e.id)}
                                />
                                <Pressable
                                    onPress={() => deleteEventPermanently(e.id)}
                                    style={{
                                        padding: 10,
                                        borderWidth: 1,
                                        borderRadius: 10,
                                        borderColor: colors.border,
                                        alignItems: "center",
                                    }}
                                >
                                    <Text style={{ color: colors.text }}>
                                        Eliminar permanentemente
                                    </Text>
                                </Pressable>
                            </View>
                        );
                    })
                ) : (
                    <Text style={{ color: colors.text, opacity: 0.7 }}>
                        La papelera esta vacia.
                    </Text>
                )}
            </ScrollView>
        </View>
    );
}
