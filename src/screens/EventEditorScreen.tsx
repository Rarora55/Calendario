import { useAppStore } from "@/src/state/store";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

function id() {
    return Math.random().toString(36).slice(2, 10);
}

export default function EventEditorScreen() {
    const addEvent = useAppStore((s) => s.addEvent);
    const calendars = useAppStore((s) => s.calendars);

    const [title, setTitle] = useState("");

    const primaryCalendarId = calendars[0]?.id ?? "cal-1";

    return (
        <View style={{ flex: 1, padding: 16, gap: 12 }}>
            <Text style={{ fontSize: 24, fontWeight: "700" }}>Nuevo evento</Text>

            <TextInput
                placeholder="Título"
                value={title}
                onChangeText={setTitle}
                style={{ borderWidth: 1, borderRadius: 12, padding: 12 }}
            />

            <Pressable
                onPress={() => {
                    const now = new Date();
                    const end = new Date(now.getTime() + 60 * 60 * 1000);

                    addEvent({
                        id: `ev-${id()}`,
                        calendarId: primaryCalendarId,
                        title: title.trim() || "Evento sin título",
                        startISO: now.toISOString(),
                        endISO: end.toISOString(),
                    });

                    router.back();
                }}
                style={{ padding: 14, borderWidth: 1, borderRadius: 12, alignItems: "center" }}
            >
                <Text>Guardar</Text>
            </Pressable>
        </View>
    );
}
