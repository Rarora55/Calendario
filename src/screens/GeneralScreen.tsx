import { useTabSwipeNavigation } from "@/src/hooks/useTabSwipeNavigation";
import { LabelDefinition } from "@/src/domain/Label";
import { CalendarEvent } from "@/src/domain/Event";
import { useAppStore } from "@/src/state/store";
import { useTheme } from "@react-navigation/native";
import { Link, router } from "expo-router";
import { useEffect, useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type EventSuperGroup = {
    key: string;
    label: string;
    routeLabel: string;
    empty: boolean;
    color: string;
    count: number;
    nextEventISO: string;
    nextEventTitle: string;
};

function normalizeLabel(label: string) {
    return label.trim().toLowerCase();
}

const UNLABELED_GROUP_KEY = "__unlabeled__";
const UNLABELED_GROUP_COLOR = "#9ca3af";
const DEFAULT_GROUP_COLOR = "#6b7280";

export default function GeneralScreen() {
    const { colors } = useTheme();
    const swipeHandlers = useTabSwipeNavigation();
    const hydrated = useAppStore((s: any) => s.hydrated);
    const hydrate = useAppStore((s: any) => s.hydrate);
    const calendars = useAppStore((s: any) => s.calendars);
    const events = useAppStore((s: any) => s.events as CalendarEvent[]);
    const labels = useAppStore((s: any) => s.labels as LabelDefinition[]);

    useEffect(() => {
        if (!hydrated) void hydrate();
    }, [hydrated, hydrate]);

    const visibleEvents = useMemo(() => {
        const visibleIds = new Set(calendars.filter((c: any) => c.isVisible).map((c: any) => c.id));
        return events
            .filter((event) => visibleIds.has(event.calendarId))
            .slice()
            .sort((a, b) => a.startISO.localeCompare(b.startISO));
    }, [calendars, events]);

    const labelColorByKey = useMemo(() => {
        const map = new Map<string, string>();
        for (const label of labels) {
            map.set(normalizeLabel(label.name), label.color);
        }
        return map;
    }, [labels]);

    const superGroups = useMemo(() => {
        const grouped = new Map<string, EventSuperGroup>();

        for (const event of visibleEvents) {
            const raw = event.label?.trim();
            const empty = !raw;
            const key = empty ? UNLABELED_GROUP_KEY : normalizeLabel(raw);
            const label = empty ? "Sin grupo" : raw;
            const routeLabel = empty ? "sin-etiqueta" : raw;

            if (!grouped.has(key)) {
                grouped.set(key, {
                    key,
                    label,
                    routeLabel,
                    empty,
                    color: empty
                        ? UNLABELED_GROUP_COLOR
                        : labelColorByKey.get(key) ?? DEFAULT_GROUP_COLOR,
                    count: 1,
                    nextEventISO: event.startISO,
                    nextEventTitle: event.title,
                });
                continue;
            }

            const current = grouped.get(key);
            if (!current) continue;
            current.count += 1;
            if (event.startISO < current.nextEventISO) {
                current.nextEventISO = event.startISO;
                current.nextEventTitle = event.title;
            }
        }

        return Array.from(grouped.values()).sort((a, b) => {
            const dateSort = a.nextEventISO.localeCompare(b.nextEventISO);
            if (dateSort !== 0) return dateSort;
            return a.label.localeCompare(b.label, "es");
        });
    }, [labelColorByKey, visibleEvents]);

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
            <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>General</Text>

            <Text style={{ color: colors.text, opacity: 0.75 }}>
                Grupos creados
            </Text>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ gap: 12, paddingBottom: 12 }}
            >
                {superGroups.length ? (
                    superGroups.map((group) => (
                        <Pressable
                            key={group.key}
                            onPress={() =>
                                router.push({
                                    pathname: "/label/[name]",
                                    params: {
                                        name: group.routeLabel,
                                        empty: group.empty ? "1" : "0",
                                    },
                                } as never)
                            }
                            style={{
                                borderWidth: 1,
                                borderRadius: 12,
                                borderColor: colors.border,
                                padding: 12,
                                gap: 8,
                            }}
                        >
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                <View
                                    style={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: 3,
                                        backgroundColor: group.color,
                                    }}
                                />
                                <Text
                                    style={{
                                        color: colors.text,
                                        fontWeight: "700",
                                        flexShrink: 1,
                                    }}
                                >
                                    {group.empty ? "Sin etiqueta" : group.label}
                                </Text>
                            </View>

                            <Text style={{ color: colors.text, opacity: 0.85 }}>
                                {group.count} {group.count === 1 ? "evento" : "eventos"}
                            </Text>
                            <Text style={{ color: colors.text, opacity: 0.7 }}>
                                Proximo: {new Date(group.nextEventISO).toLocaleString()} -{" "}
                                {group.nextEventTitle}
                            </Text>
                        </Pressable>
                    ))
                ) : (
                    <Text style={{ color: colors.text, opacity: 0.7 }}>
                        No hay eventos visibles para agrupar.
                    </Text>
                )}
            </ScrollView>

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
