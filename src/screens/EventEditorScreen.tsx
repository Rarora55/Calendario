import { useAppStore } from "@/src/state/store";
import type { EventPriority } from "@/src/domain/Event";
import { useTheme } from "@react-navigation/native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Linking, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";

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

const colorOptions = ["#111827", "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];
const priorityOptions: { value: EventPriority; label: string }[] = [
    { value: "baja", label: "Baja" },
    { value: "media", label: "Media" },
    { value: "alta", label: "Alta" },
];

type CalendarPickerProps = {
    label: string;
    value: Date;
    onChange: (next: Date) => void;
    colors: {
        text: string;
        border: string;
        background: string;
        primary: string;
    };
};

function getMonthMatrix(year: number, month: number): (Date | null)[] {
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = (first.getDay() + 6) % 7;
    const cells: (Date | null)[] = [];
    for (let i = 0; i < offset; i += 1) cells.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) {
        cells.push(new Date(year, month, d));
    }
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

function withYMD(base: Date, year: number, month: number, day: number) {
    const next = new Date(base);
    next.setFullYear(year, month, day);
    return next;
}

function CalendarPicker({ label, value, onChange, colors }: CalendarPickerProps) {
    const [viewYear, setViewYear] = useState(value.getFullYear());
    const [viewMonth, setViewMonth] = useState(value.getMonth());

    useEffect(() => {
        setViewYear(value.getFullYear());
        setViewMonth(value.getMonth());
    }, [value]);

    const days = useMemo(() => getMonthMatrix(viewYear, viewMonth), [viewYear, viewMonth]);

    const moveMonth = (delta: number) => {
        const next = new Date(viewYear, viewMonth + delta, 1);
        setViewYear(next.getFullYear());
        setViewMonth(next.getMonth());
    };

    return (
        <View style={{ gap: 8 }}>
            <Text style={{ color: colors.text, fontWeight: "700" }}>{label}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Pressable
                    onPress={() => moveMonth(-1)}
                    style={{ paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderRadius: 8, borderColor: colors.border }}
                >
                    <Text style={{ color: colors.text }}>{"<"}</Text>
                </Pressable>
                <Text style={{ color: colors.text }}>
                    {monthLabels[viewMonth]} {viewYear}
                </Text>
                <Pressable
                    onPress={() => moveMonth(1)}
                    style={{ paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderRadius: 8, borderColor: colors.border }}
                >
                    <Text style={{ color: colors.text }}>{">"}</Text>
                </Pressable>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {dayLabels.map((d) => (
                    <View key={d} style={{ width: "14.28%", paddingVertical: 6 }}>
                        <Text style={{ textAlign: "center", color: colors.text }}>{d}</Text>
                    </View>
                ))}
                {days.map((date, idx) => {
                    if (!date) {
                        return <View key={`empty-${idx}`} style={{ width: "14.28%", padding: 8 }} />;
                    }
                    const selected = sameDay(date, value);
                    return (
                        <Pressable
                            key={date.toISOString()}
                            onPress={() =>
                                onChange(withYMD(value, date.getFullYear(), date.getMonth(), date.getDate()))
                            }
                            style={{
                                width: "14.28%",
                                padding: 6,
                                alignItems: "center",
                            }}
                        >
                            <View
                                style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 15,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    backgroundColor: selected ? colors.primary : "transparent",
                                }}
                            >
                                <Text style={{ color: selected ? "#ffffff" : colors.text }}>
                                    {date.getDate()}
                                </Text>
                            </View>
                        </Pressable>
                    );
                })}
            </View>

            <Text style={{ color: colors.text, opacity: 0.7 }}>
                Seleccionada: {value.toLocaleDateString()}
            </Text>
        </View>
    );
}

function id() {
    return Math.random().toString(36).slice(2, 10);
}

function safeDate(iso: string | undefined, fallback: Date) {
    const parsed = iso ? new Date(iso) : fallback;
    return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function buildGoogleMapsSearchUrl(address: string) {
    const query = encodeURIComponent(address.trim());
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function getAddressFromLocation(value: string | undefined) {
    const trimmed = value?.trim();
    if (!trimmed) return "";

    try {
        const url = new URL(trimmed);
        const query = url.searchParams.get("query");
        if (!query) return trimmed;
        return decodeURIComponent(query).replace(/\+/g, " ");
    } catch {
        return trimmed;
    }
}

export default function EventEditorScreen() {
    const { colors } = useTheme();
    const { id: rawId } = useLocalSearchParams<{ id?: string | string[] }>();
    const eventId = Array.isArray(rawId) ? rawId[0] : rawId;
    const hydrated = useAppStore((s) => s.hydrated);
    const hydrate = useAppStore((s) => s.hydrate);
    const addEvent = useAppStore((s) => s.addEvent);
    const updateEvent = useAppStore((s) => s.updateEvent);
    const existingEvent = useAppStore((s) => (eventId ? s.getEventById(eventId) : undefined));
    const calendars = useAppStore((s) => s.calendars);
    const isEditMode = Boolean(eventId);

    const [title, setTitle] = useState("");
    const [label, setLabel] = useState("");
    const [description, setDescription] = useState("");
    const [locationQuery, setLocationQuery] = useState("");
    const [priority, setPriority] = useState<EventPriority>("media");
    const [allDay, setAllDay] = useState(false);
    const [color, setColor] = useState("");
    const [startDate, setStartDate] = useState(() => new Date());
    const [endDate, setEndDate] = useState(() => new Date(Date.now() + 60 * 60 * 1000));

    useEffect(() => {
        if (!hydrated) void hydrate();
    }, [hydrated, hydrate]);

    useEffect(() => {
        if (!hydrated || !eventId || !existingEvent) return;
        setTitle(existingEvent.title ?? "");
        setLabel(existingEvent.label ?? "");
        setDescription(existingEvent.description ?? "");
        setLocationQuery(getAddressFromLocation(existingEvent.location));
        setPriority(existingEvent.priority ?? "media");
        setAllDay(Boolean(existingEvent.allDay));
        setColor(existingEvent.color ?? "");
        setStartDate(safeDate(existingEvent.startISO, new Date()));
        setEndDate(safeDate(existingEvent.endISO, new Date(Date.now() + 60 * 60 * 1000)));
    }, [hydrated, eventId, existingEvent]);

    const primaryCalendarId = calendars[0]?.id;
    const saveDisabled = isEditMode ? !existingEvent : !primaryCalendarId;
    const locationLink = locationQuery.trim()
        ? buildGoogleMapsSearchUrl(locationQuery)
        : undefined;

    const handleSave = () => {
        if (isEditMode) {
            if (!eventId || !existingEvent) return;
            updateEvent(eventId, {
                title: title.trim() || "Evento sin titulo",
                label: label.trim() || undefined,
                description: description.trim() || undefined,
                priority,
                color: color.trim() || undefined,
                location: locationLink,
                allDay,
                startISO: startDate.toISOString(),
                endISO: endDate.toISOString(),
            });
            router.back();
            return;
        }
        if (!primaryCalendarId) return;
        const now = new Date();
        const end = new Date(now.getTime() + 60 * 60 * 1000);

        addEvent({
            id: `ev-${id()}`,
            calendarId: primaryCalendarId,
            title: title.trim() || "Evento sin titulo",
            label: label.trim() || undefined,
            description: description.trim() || undefined,
            priority,
            color: color.trim() || undefined,
            location: locationLink,
            allDay,
            startISO: startDate?.toISOString() || now.toISOString(),
            endISO: endDate?.toISOString() || end.toISOString(),
        });

        router.back();
    };

    if (!hydrated) {
        return (
            <View style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
                <Text style={{ color: colors.text }}>Cargando...</Text>
            </View>
        );
    }

    if (isEditMode && !existingEvent) {
        return (
            <View style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
                <Text style={{ color: colors.text }}>No se encontro el evento a editar.</Text>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    title: "Crear Evento",
                    headerRight: () => (
                        <Pressable
                            onPress={handleSave}
                            disabled={saveDisabled}
                            style={{ opacity: saveDisabled ? 0.5 : 1, paddingHorizontal: 8, paddingVertical: 4 }}
                        >
                            <Text style={{ color: colors.primary, fontWeight: "700" }}>Guardar</Text>
                        </Pressable>
                    ),
                }}
            />
            <ScrollView
                contentContainerStyle={{
                    padding: 16,
                    paddingBottom: 96,
                    gap: 12,
                    backgroundColor: colors.background,
                }}
            >

            <TextInput
                placeholder="Titulo"
                placeholderTextColor={colors.text}
                value={title}
                onChangeText={setTitle}
                style={{
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: 12,
                    borderColor: colors.border,
                    color: colors.text,
                }}
            />

            <TextInput
                placeholder="Etiqueta"
                placeholderTextColor={colors.text}
                value={label}
                onChangeText={setLabel}
                style={{
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: 12,
                    borderColor: colors.border,
                    color: colors.text,
                }}
            />

            <TextInput
                placeholder="Descripcion"
                placeholderTextColor={colors.text}
                value={description}
                onChangeText={setDescription}
                style={{
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: 12,
                    borderColor: colors.border,
                    color: colors.text,
                }}
                multiline
            />

            <TextInput
                placeholder="Localizacion"
                placeholderTextColor={colors.text}
                value={locationQuery}
                onChangeText={setLocationQuery}
                style={{
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: 12,
                    borderColor: colors.border,
                    color: colors.text,
                }}
            />
            {locationLink ? (
                <Pressable
                    onPress={() => void Linking.openURL(locationLink)}
                    style={{
                        padding: 12,
                        borderWidth: 1,
                        borderRadius: 12,
                        borderColor: colors.border,
                        alignItems: "center",
                    }}
                >
                    <Text style={{ color: colors.primary, fontWeight: "700" }}>
                        Abrir busqueda en Google Maps
                    </Text>
                </Pressable>
            ) : null}

            <View style={{ gap: 8 }}>
                <Text style={{ color: colors.text, fontWeight: "700" }}>Prioridad</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                    {priorityOptions.map((option) => {
                        const selected = option.value === priority;
                        return (
                            <Pressable
                                key={option.value}
                                onPress={() => setPriority(option.value)}
                                style={{
                                    paddingHorizontal: 12,
                                    paddingVertical: 8,
                                    borderWidth: 1,
                                    borderRadius: 10,
                                    borderColor: selected ? colors.primary : colors.border,
                                    backgroundColor: selected ? colors.primary : "transparent",
                                }}
                            >
                                <Text style={{ color: selected ? "#ffffff" : colors.text }}>
                                    {option.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Switch
                    value={allDay}
                    onValueChange={setAllDay}
                    trackColor={{ false: colors.border, true: colors.border }}
                    thumbColor={colors.text}
                />
                <Text style={{ color: colors.text }}>Todo el dia</Text>
            </View>

            <CalendarPicker
                label="Fecha inicio"
                value={startDate}
                onChange={setStartDate}
                colors={colors}
            />

            <CalendarPicker
                label="Fecha fin"
                value={endDate}
                onChange={setEndDate}
                colors={colors}
            />

            <View style={{ gap: 8 }}>
                <Text style={{ color: colors.text, fontWeight: "700" }}>Color del evento</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                    {colorOptions.map((c) => {
                        const selected = c === color;
                        return (
                            <Pressable
                                key={c}
                                onPress={() => setColor(c)}
                                style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 6,
                                    backgroundColor: c,
                                    borderWidth: selected ? 2 : 1,
                                    borderColor: selected ? colors.text : colors.border,
                                }}
                            />
                        );
                    })}
                    <Pressable
                        onPress={() => setColor("")}
                        style={{
                            paddingHorizontal: 10,
                            height: 30,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderColor: colors.border,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Text style={{ color: colors.text }}>Sin color</Text>
                    </Pressable>
                </View>
            </View>

            {!primaryCalendarId ? (
                <Text style={{ color: colors.text }}>
                    No hay calendarios disponibles para asignar este evento.
                </Text>
            ) : null}

            </ScrollView>
        </>
    );
}
