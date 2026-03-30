import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { TaskGroupCard } from "@/components/TaskGroupCard";
import { useTabSwipeNavigation } from "@/src/hooks/useTabSwipeNavigation";
import { confirmDeleteAction } from "@/src/features/tasks/confirmDelete";
import { useAppStore } from "@/src/state/store";
import { useAppTheme } from "@/src/theme/useAppTheme";

export default function GeneralScreen() {
  const hydrated = useAppStore((state) => state.hydrated);
  const hydrate = useAppStore((state) => state.hydrate);
  const taskGroupSummaries = useAppStore((state) => state.taskGroupSummaries);
  const tasks = useAppStore((state) => state.tasks);
  const toggleTaskCompletion = useAppStore((state) => state.toggleTaskCompletion);
  const deleteTask = useAppStore((state) => state.deleteTask);
  const deleteTaskGroup = useAppStore((state) => state.deleteTaskGroup);
  const { colors } = useAppTheme();
  const panHandlers = useTabSwipeNavigation();
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) {
      void hydrate();
    }
  }, [hydrate, hydrated]);

  const handleDeleteTask = async (taskId: string, title: string) => {
    const confirmed = await confirmDeleteAction({
      title: "Delete task?",
      message: `Remove "${title}" from active views?`,
    });

    if (!confirmed) {
      return;
    }

    const result = await deleteTask(taskId);
    setFeedbackMessage(
      result.ok ? null : "Stop the active timer before deleting this task.",
    );
  };

  const handleDeleteTaskGroup = async (taskGroupId: string, name: string) => {
    const confirmed = await confirmDeleteAction({
      title: "Delete task group?",
      message: `Remove "${name}" and all tasks inside it from active views?`,
    });

    if (!confirmed) {
      return;
    }

    const result = await deleteTaskGroup(taskGroupId);
    setFeedbackMessage(
      result.ok ? null : "Stop the active timer before deleting this task group.",
    );
  };

  return (
    <View {...panHandlers} style={{ flex: 1, backgroundColor: colors.background, padding: 18 }}>
      <View style={{ gap: 10, marginBottom: 16 }}>
        <Text style={{ fontSize: 30, fontWeight: "800", color: colors.text }}>General</Text>
        <Text style={{ color: colors.textMuted, fontSize: 15 }}>
          Organize work by group, keep planned value visible, and jump straight into creation.
        </Text>
        {feedbackMessage ? <Text style={{ color: colors.warning, fontWeight: "600" }}>{feedbackMessage}</Text> : null}
      </View>

      <Pressable
        onPress={() => router.push("/task-group-editor" as never)}
        style={{
          backgroundColor: colors.primary,
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
              onDeleteGroup={() => void handleDeleteTaskGroup(summary.id, summary.name)}
              onAddTask={() => router.push({ pathname: "/task-editor" as never, params: { taskGroupId: summary.id } })}
              onEditTask={(taskId) => router.push({ pathname: "/task-editor" as never, params: { id: taskId } })}
              onToggleTask={(taskId) => void toggleTaskCompletion(taskId)}
              onDeleteTask={(taskId) => {
                const task = tasks.find((candidate) => candidate.id === taskId);
                if (!task) {
                  return;
                }

                void handleDeleteTask(taskId, task.title);
              }}
            />
          ))
        ) : (
          <View
            style={{
              borderRadius: 24,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 24,
              backgroundColor: colors.card,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: 8 }}>
              No task groups yet
            </Text>
            <Text style={{ color: colors.textMuted }}>
              The repository is now on the task-first architecture. Create a group to start the MVP flow.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
