import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { useAppStore } from "@/src/state/store";
import { useAppTheme } from "@/src/theme/useAppTheme";

const colorOptions = ["#de8f6e", "#8ab7aa", "#d7a45e", "#cf7d70", "#8c9fd6"];

export default function TaskGroupEditorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const hydrated = useAppStore((state) => state.hydrated);
  const hydrate = useAppStore((state) => state.hydrate);
  const taskGroups = useAppStore((state) => state.taskGroups);
  const createTaskGroup = useAppStore((state) => state.createTaskGroup);
  const updateTaskGroup = useAppStore((state) => state.updateTaskGroup);
  const { colors } = useAppTheme();

  const existingGroup = useMemo(() => taskGroups.find((group) => group.id === id), [id, taskGroups]);
  const [name, setName] = useState("");
  const [colorToken, setColorToken] = useState(colorOptions[0]);

  useEffect(() => {
    if (!hydrated) {
      void hydrate();
    }
  }, [hydrate, hydrated]);

  useEffect(() => {
    if (!existingGroup) {
      return;
    }

    setName(existingGroup.name);
    setColorToken(existingGroup.colorToken);
  }, [existingGroup]);

  async function handleSave() {
    if (existingGroup) {
      await updateTaskGroup(existingGroup.id, { name, colorToken });
    } else {
      await createTaskGroup({ name, colorToken });
    }

    router.back();
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 18, gap: 18 }}>
      <Text style={{ fontSize: 28, fontWeight: "800", color: colors.text }}>
        {existingGroup ? "Edit Task Group" : "Create Task Group"}
      </Text>

      <View style={{ gap: 10 }}>
        <Text style={{ color: colors.text, fontWeight: "700" }}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Client work, School, Personal..."
          placeholderTextColor={colors.textMuted}
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 16,
            paddingHorizontal: 14,
            paddingVertical: 12,
            backgroundColor: colors.card,
            color: colors.text,
          }}
        />
      </View>

      <View style={{ gap: 10 }}>
        <Text style={{ color: colors.text, fontWeight: "700" }}>Color</Text>
        <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
          {colorOptions.map((candidate) => (
            <Pressable
              key={candidate}
              onPress={() => setColorToken(candidate)}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: candidate,
                borderWidth: colorToken === candidate ? 3 : 0,
                borderColor: colors.text,
              }}
            />
          ))}
        </View>
      </View>

      <Pressable
        onPress={() => void handleSave()}
        style={{
          marginTop: "auto",
          borderRadius: 16,
          backgroundColor: colors.text,
          paddingVertical: 14,
          alignItems: "center",
        }}
      >
        <Text style={{ color: colors.background, fontWeight: "700", fontSize: 16 }}>Save Group</Text>
      </Pressable>
    </View>
  );
}
