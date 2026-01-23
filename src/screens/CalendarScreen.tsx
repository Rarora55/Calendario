import { useAppStore } from "@/src/state/store";
import { Pressable, Text, View } from "react-native";

export default function CalendarsScreen() {
    const calendars = useAppStore((s) => s.calendars);
    const toggle = useAppStore((s) => s.toggleCalendarVisibility);

    return (
        <View style={{ flex: 1, padding: 16, gap: 12 }}>
            <Text style={{ fontSize: 24, fontWeight: "700" }}>Calendarios</Text>

            {calendars.map((c) => (
                <Pressable
                    key={c.id}
                    onPress={() => toggle(c.id)}
                    style={{
                        padding: 12,
                        borderWidth: 1,
                        borderRadius: 12,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Text style={{ fontWeight: "700" }}>{c.name}</Text>
                    <Text>{c.isVisible ? "Visible" : "Oculto"}</Text>
                </Pressable>
            ))}
        </View>
    );
}
