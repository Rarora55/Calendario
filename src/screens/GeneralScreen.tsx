import { router } from "expo-router";
import { useEffect } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { TaskGroupCard } from "@/components/TaskGroupCard";
import { useAppStore } from "@/src/state/store";

export default function GeneralScreen() {
  const hydrated = useAppStore((state) => state.hydrated);
  const hydrate = useAppStore((state) => state.hydrate);
  const taskGroupSummaries = useAppStore((state) => state.taskGroupSummaries);
  const tasks = useAppStore((state) => state.tasks);
  const toggleTaskCompletion = useAppStore((state) => state.toggleTaskCompletion);

  useEffect(() => {
    if (!hydrated) {
      void hydrate();
    }
  }, [hydrate, hydrated]);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff9f2", padding: 18 }}>
      <View style={{ gap: 10, marginBottom: 16 }}>
        <Text style={{ fontSize: 30, fontWeight: "800", color: "#35291f" }}>General</Text>
        <Text style={{ color: "#6c5a4c", fontSize: 15 }}>
          Organize work by group, keep planned value visible, and jump straight into creation.
        </Text>
      </View>

      <Pressable
        onPress={() => router.push("/task-group-editor" as never)}
        style={{
          backgroundColor: "#de8f6e",
          paddingVertical: 14,
          borderRadius: 16,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 16 }}>Create Task Group</Text>
      </Pressable>

      <ScrollView contentContainerStyle={{ gap: 14, paddingBottom: 24 }}>
        {taskGroupSummaries.length ? (
          taskGroupSummaries.map((summary) => (
            <TaskGroupCard
              key={summary.id}
              summary={summary}
              tasks={tasks.filter((task) => task.taskGroupId === summary.id)}
              onEditGroup={() => router.push({ pathname: "/task-group-editor" as never, params: { id: summary.id } })}
              onAddTask={() => router.push({ pathname: "/task-editor" as never, params: { taskGroupId: summary.id } })}
              onEditTask={(taskId) => router.push({ pathname: "/task-editor" as never, params: { id: taskId } })}
              onToggleTask={(taskId) => void toggleTaskCompletion(taskId)}
            />
          ))
        ) : (
          <View
            style={{
              borderRadius: 24,
              borderWidth: 1,
              borderColor: "#dfd2c4",
              padding: 24,
              backgroundColor: "#ffffff",
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "700", color: "#35291f", marginBottom: 8 }}>
              No task groups yet
            </Text>
            <Text style={{ color: "#6c5a4c" }}>
              The repository is now on the task-first architecture. Create a group to start the MVP flow.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
