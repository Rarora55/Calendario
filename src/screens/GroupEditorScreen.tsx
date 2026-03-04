import { LABEL_COLOR_OPTIONS } from "@/src/domain/Label";
import { useAppStore } from "@/src/state/store";
import { useTheme } from "@react-navigation/native";
import { router, Stack } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

function normalize(value: string) {
    return value.trim().toLowerCase();
}

export default function GroupEditorScreen() {
    const { colors } = useTheme();
    const hydrated = useAppStore((s) => s.hydrated);
    const hydrate = useAppStore((s) => s.hydrate);
    const labels = useAppStore((s) => s.labels);
    const upsertLabel = useAppStore((s) => s.upsertLabel);

    const [name, setName] = useState("");
    const [color, setColor] = useState<string>(LABEL_COLOR_OPTIONS[0]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!hydrated) void hydrate();
    }, [hydrated, hydrate]);

    const exists = useMemo(() => {
        const key = normalize(name);
        if (!key) return false;
        return labels.some((item) => normalize(item.name) === key);
    }, [labels, name]);

    const saveDisabled = !name.trim() || exists;

    const onSave = () => {
        const cleanName = name.trim();
        if (!cleanName) {
            setError("El nombre del grupo es obligatorio.");
            return;
        }
        if (exists) {
            setError("Ya existe un grupo con ese nombre.");
            return;
        }
        upsertLabel(cleanName, color);
        router.back();
    };

    if (!hydrated) {
        return (
            <View style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
                <Text style={{ color: colors.text }}>Cargando...</Text>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    title: "Crear Grupo",
                    headerRight: () => (
                        <Pressable
                            onPress={onSave}
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
                    gap: 12,
                    backgroundColor: colors.background,
                }}
            >
                <TextInput
                    placeholder="Nombre del grupo"
                    placeholderTextColor={colors.text}
                    value={name}
                    onChangeText={(next) => {
                        setName(next);
                        if (error) setError("");
                    }}
                    style={{
                        borderWidth: 1,
                        borderRadius: 12,
                        padding: 12,
                        borderColor: colors.border,
                        color: colors.text,
                    }}
                />

                <View style={{ gap: 8 }}>
                    <Text style={{ color: colors.text, fontWeight: "700" }}>Color del grupo</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                        {LABEL_COLOR_OPTIONS.map((option) => {
                            const selected = option === color;
                            return (
                                <Pressable
                                    key={option}
                                    onPress={() => setColor(option)}
                                    style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: 8,
                                        backgroundColor: option,
                                        borderWidth: selected ? 2 : 1,
                                        borderColor: selected ? colors.text : colors.border,
                                    }}
                                />
                            );
                        })}
                    </View>
                </View>

                {exists ? (
                    <Text style={{ color: "#ef4444" }}>
                        Ya existe un grupo con ese nombre.
                    </Text>
                ) : null}
                {error ? <Text style={{ color: "#ef4444" }}>{error}</Text> : null}
            </ScrollView>
        </>
    );
}
