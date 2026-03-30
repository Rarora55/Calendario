import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { TaskRow } from "@/components/TaskRow";
import { selectPriorityTasks } from "@/src/features/priority/selectors";
import { confirmDeleteAction } from "@/src/features/tasks/confirmDelete";
import { useTabSwipeNavigation } from "@/src/hooks/useTabSwipeNavigation";
import { useAppStore } from "@/src/state/store";
import { useAppTheme } from "@/src/theme/useAppTheme";

export default function PrioritiesScreen() {
  const hydrated = useAppStore((state) => state.hydrated);
  const hydrate = useAppStore((state) => state.hydrate);
  const tasks = useAppStore((state) => state.tasks);
  const preferences = useAppStore((state) => state.preferences);
  const toggleTaskCompletion = useAppStore((state) => state.toggleTaskCompletion);
  const deleteTask = useAppStore((state) => state.deleteTask);
  const { colors } = useAppTheme();
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const panHandlers = useTabSwipeNavigation();

  useEffect(() => {
    if (!hydrated) {
      void hydrate();
    }
  }, [hydrate, hydrated]);

  const prioritizedTasks = selectPriorityTasks(tasks, preferences?.urgencyWindowDays ?? 3);

  const handleDeleteTask = async (taskId: string, title: string) => {
    const confirmed = await confirmDeleteAction({
      title: "Delete task?",
      message: `Remove "${title}" from active views?`,
    });

    if (!confirmed) {
      return;
    }

    const result = await deleteTask(taskId);
    setFeedbackMessage(result.ok ? null : "Stop the active timer before deleting this task.");
  };

  return (
    <ScrollView
      {...panHandlers}
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 18, gap: 14 }}
    >
      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 28, fontWeight: "800", color: colors.text }}>Priority</Text>
        <Text style={{ color: colors.textMuted }}>
          Tasks shown here are overdue, within the urgency window, or explicitly marked as priority.
        </Text>
        {feedbackMessage ? <Text style={{ color: colors.warning, fontWeight: "600" }}>{feedbackMessage}</Text> : null}
      </View>

      {prioritizedTasks.length ? (
        prioritizedTasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onEdit={undefined}
            onToggleComplete={() => void toggleTaskCompletion(task.id)}
            onDelete={() => void handleDeleteTask(task.id, task.title)}
          />
        ))
      ) : (
        <View style={{ padding: 20, borderRadius: 24, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.text, fontWeight: "700", marginBottom: 6 }}>Nothing urgent right now</Text>
          <Text style={{ color: colors.textMuted }}>
            This view will populate as tasks become urgent or marked as high-priority work.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
