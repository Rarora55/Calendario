import { useAppStore } from "@/src/state/store";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";

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

export default function EventEditorScreen() {
    const { colors } = useTheme();
    const hydrated = useAppStore((s) => s.hydrated);
    const hydrate = useAppStore((s) => s.hydrate);
    const addEvent = useAppStore((s) => s.addEvent);
    const calendars = useAppStore((s) => s.calendars);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [allDay, setAllDay] = useState(false);
    const [color, setColor] = useState("");
    const [startDate, setStartDate] = useState(() => new Date());
    const [endDate, setEndDate] = useState(() => new Date(Date.now() + 60 * 60 * 1000));

    useEffect(() => {
        if (!hydrated) void hydrate();
    }, [hydrated, hydrate]);

    const primaryCalendarId = calendars[0]?.id;

    if (!hydrated) {
        return (
            <View style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
                <Text style={{ color: colors.text }}>Cargando...</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12, backgroundColor: colors.background }}>
            <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>
                Nuevo evento
            </Text>

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
                placeholder="Ubicacion"
                placeholderTextColor={colors.text}
                value={location}
                onChangeText={setLocation}
                style={{
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: 12,
                    borderColor: colors.border,
                    color: colors.text,
                }}
            />

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

            <Pressable
                onPress={() => {
                    if (!primaryCalendarId) return;
                    const now = new Date();
                    const end = new Date(now.getTime() + 60 * 60 * 1000);

                    addEvent({
                        id: `ev-${id()}`,
                        calendarId: primaryCalendarId,
                        title: title.trim() || "Evento sin titulo",
                        description: description.trim() || undefined,
                        color: color.trim() || undefined,
                        location: location.trim() || undefined,
                        allDay,
                        startISO: startDate?.toISOString() || now.toISOString(),
                        endISO: endDate?.toISOString() || end.toISOString(),
                    });

                    router.back();
                }}
                style={{
                    padding: 14,
                    borderWidth: 1,
                    borderRadius: 12,
                    alignItems: "center",
                    borderColor: colors.border,
                    opacity: primaryCalendarId ? 1 : 0.5,
                }}
                disabled={!primaryCalendarId}
            >
                <Text style={{ color: colors.text }}>Guardar</Text>
            </Pressable>
        </ScrollView>
    );
}
