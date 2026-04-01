import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { useAppTranslation } from "@/src/i18n/useAppTranslation";
import { useAppStore } from "@/src/state/store";
import { useAppTheme } from "@/src/theme/useAppTheme";

export default function TaskEditorScreen() {
  const { id, taskGroupId } = useLocalSearchParams<{ id?: string; taskGroupId?: string }>();
  const hydrated = useAppStore((state) => state.hydrated);
  const hydrate = useAppStore((state) => state.hydrate);
  const taskGroups = useAppStore((state) => state.taskGroups);
  const tasks = useAppStore((state) => state.tasks);
  const createTask = useAppStore((state) => state.createTask);
  const updateTask = useAppStore((state) => state.updateTask);
  const { colors } = useAppTheme();
  const { copy } = useAppTranslation();

  const inputStyle = {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.card,
    color: colors.text,
  } as const;

  const existingTask = useMemo(() => tasks.find((task) => task.id === id), [id, tasks]);
  const [selectedGroupId, setSelectedGroupId] = useState(taskGroupId ?? "");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [value, setValue] = useState("0");
  const [estimatedMinutes, setEstimatedMinutes] = useState("30");
  const [scheduledStartDate, setScheduledStartDate] = useState("");
  const [scheduledEndDate, setScheduledEndDate] = useState("");
  const [isPriority, setIsPriority] = useState(false);

  useEffect(() => {
    if (!hydrated) {
      void hydrate();
    }
  }, [hydrate, hydrated]);

  useEffect(() => {
    if (!existingTask) {
      return;
    }

    setSelectedGroupId(existingTask.taskGroupId);
    setTitle(existingTask.title);
    setNotes(existingTask.notes ?? "");
    setValue(String(existingTask.value));
    setEstimatedMinutes(String(Math.round(existingTask.estimatedTimeSeconds / 60)));
    setScheduledStartDate(existingTask.scheduledStartDate ?? "");
    setScheduledEndDate(existingTask.scheduledEndDate ?? "");
    setIsPriority(existingTask.isPriority);
  }, [existingTask]);

  async function handleSave() {
    const payload = {
      taskGroupId: selectedGroupId,
      title,
      notes,
      value: Number(value) || 0,
      estimatedTimeSeconds: (Number(estimatedMinutes) || 0) * 60,
      workedTimeSeconds: existingTask?.workedTimeSeconds ?? 0,
      scheduledStartDate: scheduledStartDate || null,
      scheduledEndDate: scheduledEndDate || null,
      isCompleted: existingTask?.isCompleted ?? false,
      completedAt: existingTask?.completedAt ?? null,
      isPriority,
    };

    if (existingTask) {
      await updateTask(existingTask.id, payload);
    } else {
      await createTask(payload);
    }

    router.back();
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 18, gap: 18 }}>
      <Text style={{ fontSize: 28, fontWeight: "800", color: colors.text }}>
        {existingTask ? copy.taskEditor.editTitle : copy.taskEditor.createTitle}
      </Text>

      <View style={{ gap: 10 }}>
        <Text style={{ color: colors.text, fontWeight: "700" }}>{copy.taskEditor.group}</Text>
        <View style={{ gap: 10 }}>
          {taskGroups.map((group) => (
            <Pressable
              key={group.id}
              onPress={() => setSelectedGroupId(group.id)}
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: selectedGroupId === group.id ? colors.text : colors.border,
                backgroundColor: selectedGroupId === group.id ? colors.surfaceMuted : colors.card,
                padding: 12,
              }}
            >
              <Text style={{ color: colors.text, fontWeight: "600" }}>{group.name}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Text style={{ color: colors.text, fontWeight: "700" }}>{copy.taskEditor.title}</Text>
        <TextInput value={title} onChangeText={setTitle} style={inputStyle} placeholder={copy.taskEditor.titlePlaceholder} placeholderTextColor={colors.textMuted} />
      </View>

      <View style={{ gap: 10 }}>
        <Text style={{ color: colors.text, fontWeight: "700" }}>{copy.taskEditor.notes}</Text>
        <TextInput value={notes} onChangeText={setNotes} multiline style={[inputStyle, { minHeight: 120, textAlignVertical: "top" }]} placeholder={copy.taskEditor.notesPlaceholder} placeholderTextColor={colors.textMuted} />
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1, gap: 10 }}>
          <Text style={{ color: colors.text, fontWeight: "700" }}>{copy.taskEditor.value}</Text>
          <TextInput value={value} onChangeText={setValue} keyboardType="numeric" style={inputStyle} />
        </View>
        <View style={{ flex: 1, gap: 10 }}>
          <Text style={{ color: colors.text, fontWeight: "700" }}>{copy.taskEditor.estimatedMinutes}</Text>
          <TextInput value={estimatedMinutes} onChangeText={setEstimatedMinutes} keyboardType="numeric" style={inputStyle} />
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1, gap: 10 }}>
          <Text style={{ color: colors.text, fontWeight: "700" }}>{copy.taskEditor.startDate}</Text>
          <TextInput value={scheduledStartDate} onChangeText={setScheduledStartDate} style={inputStyle} placeholder={copy.taskEditor.datePlaceholder} placeholderTextColor={colors.textMuted} />
        </View>
        <View style={{ flex: 1, gap: 10 }}>
          <Text style={{ color: colors.text, fontWeight: "700" }}>{copy.taskEditor.endDate}</Text>
          <TextInput value={scheduledEndDate} onChangeText={setScheduledEndDate} style={inputStyle} placeholder={copy.taskEditor.datePlaceholder} placeholderTextColor={colors.textMuted} />
        </View>
      </View>

      <Pressable
        onPress={() => setIsPriority((current) => !current)}
        style={{
          borderRadius: 16,
          backgroundColor: isPriority ? colors.text : colors.surfaceMuted,
          paddingVertical: 14,
          alignItems: "center",
        }}
      >
        <Text style={{ color: isPriority ? colors.background : colors.text, fontWeight: "700" }}>
          {isPriority ? copy.taskEditor.priorityEnabled : copy.taskEditor.markPriority}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => void handleSave()}
        style={{
          borderRadius: 16,
          backgroundColor: colors.primary,
          paddingVertical: 14,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 16 }}>{copy.taskEditor.saveTask}</Text>
      </Pressable>
    </ScrollView>
  );
}
