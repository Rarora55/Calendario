import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { useAppStore } from "@/src/state/store";

const inputStyle = {
  borderWidth: 1,
  borderColor: "#dfd2c4",
  borderRadius: 16,
  paddingHorizontal: 14,
  paddingVertical: 12,
  backgroundColor: "#ffffff",
  color: "#35291f",
} as const;

export default function TaskEditorScreen() {
  const { id, taskGroupId } = useLocalSearchParams<{ id?: string; taskGroupId?: string }>();
  const hydrated = useAppStore((state) => state.hydrated);
  const hydrate = useAppStore((state) => state.hydrate);
  const taskGroups = useAppStore((state) => state.taskGroups);
  const tasks = useAppStore((state) => state.tasks);
  const createTask = useAppStore((state) => state.createTask);
  const updateTask = useAppStore((state) => state.updateTask);

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
    <ScrollView style={{ flex: 1, backgroundColor: "#fff9f2" }} contentContainerStyle={{ padding: 18, gap: 18 }}>
      <Text style={{ fontSize: 28, fontWeight: "800", color: "#35291f" }}>
        {existingTask ? "Edit Task" : "Create Task"}
      </Text>

      <View style={{ gap: 10 }}>
        <Text style={{ color: "#35291f", fontWeight: "700" }}>Task Group</Text>
        <View style={{ gap: 10 }}>
          {taskGroups.map((group) => (
            <Pressable
              key={group.id}
              onPress={() => setSelectedGroupId(group.id)}
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: selectedGroupId === group.id ? "#35291f" : "#dfd2c4",
                backgroundColor: selectedGroupId === group.id ? "#f4ede4" : "#ffffff",
                padding: 12,
              }}
            >
              <Text style={{ color: "#35291f", fontWeight: "600" }}>{group.name}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Text style={{ color: "#35291f", fontWeight: "700" }}>Title</Text>
        <TextInput value={title} onChangeText={setTitle} style={inputStyle} placeholder="Prepare sprint summary" placeholderTextColor="#9f8f81" />
      </View>

      <View style={{ gap: 10 }}>
        <Text style={{ color: "#35291f", fontWeight: "700" }}>Notes</Text>
        <TextInput value={notes} onChangeText={setNotes} multiline style={[inputStyle, { minHeight: 120, textAlignVertical: "top" }]} placeholder="Optional context" placeholderTextColor="#9f8f81" />
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1, gap: 10 }}>
          <Text style={{ color: "#35291f", fontWeight: "700" }}>Value</Text>
          <TextInput value={value} onChangeText={setValue} keyboardType="numeric" style={inputStyle} />
        </View>
        <View style={{ flex: 1, gap: 10 }}>
          <Text style={{ color: "#35291f", fontWeight: "700" }}>Est. Minutes</Text>
          <TextInput value={estimatedMinutes} onChangeText={setEstimatedMinutes} keyboardType="numeric" style={inputStyle} />
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1, gap: 10 }}>
          <Text style={{ color: "#35291f", fontWeight: "700" }}>Start Date</Text>
          <TextInput value={scheduledStartDate} onChangeText={setScheduledStartDate} style={inputStyle} placeholder="YYYY-MM-DD" placeholderTextColor="#9f8f81" />
        </View>
        <View style={{ flex: 1, gap: 10 }}>
          <Text style={{ color: "#35291f", fontWeight: "700" }}>End Date</Text>
          <TextInput value={scheduledEndDate} onChangeText={setScheduledEndDate} style={inputStyle} placeholder="YYYY-MM-DD" placeholderTextColor="#9f8f81" />
        </View>
      </View>

      <Pressable
        onPress={() => setIsPriority((current) => !current)}
        style={{
          borderRadius: 16,
          backgroundColor: isPriority ? "#35291f" : "#f4ede4",
          paddingVertical: 14,
          alignItems: "center",
        }}
      >
        <Text style={{ color: isPriority ? "#fff9f2" : "#35291f", fontWeight: "700" }}>
          {isPriority ? "Priority Enabled" : "Mark as Priority"}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => void handleSave()}
        style={{
          borderRadius: 16,
          backgroundColor: "#de8f6e",
          paddingVertical: 14,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 16 }}>Save Task</Text>
      </Pressable>
    </ScrollView>
  );
}
