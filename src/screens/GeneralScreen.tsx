import { useAppStore } from "@/src/state/store";
import { useTheme } from "@react-navigation/native";
import { Link } from "expo-router";
import { useEffect, useMemo } from "react";
import { Pressable, Text, View } from "react-native";

export default function GeneralScreen() {
    const { colors } = useTheme();
    const hydrated = useAppStore((s: any) => s.hydrated);
    const hydrate = useAppStore((s: any) => s.hydrate);
    const calendars = useAppStore((s: any) => s.calendars);
    const events = useAppStore((s: any) => s.events);

    useEffect(() => {
        if (!hydrated) void hydrate();
    }, [hydrated, hydrate]);

    const generalEvents = useMemo(() => {
        const visibleIds = new Set(
            calendars.filter((c: any) => c.isVisible).map((c: any) => c.id)
        );

        return events
            .filter((e: typeof events[0]) => visibleIds.has(e.calendarId))
            .slice()
            .sort((a: typeof events[0], b: typeof events[0]) => a.startISO.localeCompare(b.startISO));
    }, [calendars, events]);

    if (!hydrated) {
        return (
            <View style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
                <Text style={{ color: colors.text }}>Cargando…</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, padding: 16, gap: 12, backgroundColor: colors.background }}>
            <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>General</Text>

            {generalEvents.map((e: typeof events[0]) => (
                <View
                    key={e.id}
                    style={{ padding: 12, borderWidth: 1, borderRadius: 12, borderColor: colors.border }}
                >
                    <Text style={{ fontWeight: "700", color: colors.text }}>{e.title}</Text>
                    <Text style={{ color: colors.text }}>{new Date(e.startISO).toLocaleString()}</Text>
                </View>
            ))}

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
                    <Text style={{ color: colors.text }}>Abrir día</Text>
                </Pressable>
            </Link>
        </View>
    );
}
