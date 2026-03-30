import { useEffect } from "react";
import { ScrollView, Text, View } from "react-native";

import { TaskRow } from "@/components/TaskRow";
import { selectPriorityTasks } from "@/src/features/priority/selectors";
import { useAppStore } from "@/src/state/store";

export default function PrioritiesScreen() {
  const hydrated = useAppStore((state) => state.hydrated);
  const hydrate = useAppStore((state) => state.hydrate);
  const tasks = useAppStore((state) => state.tasks);
  const preferences = useAppStore((state) => state.preferences);
  const toggleTaskCompletion = useAppStore((state) => state.toggleTaskCompletion);

  useEffect(() => {
    if (!hydrated) {
      void hydrate();
    }
  }, [hydrate, hydrated]);

  const prioritizedTasks = selectPriorityTasks(tasks, preferences?.urgencyWindowDays ?? 3);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff9f2" }} contentContainerStyle={{ padding: 18, gap: 14 }}>
      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 28, fontWeight: "800", color: "#35291f" }}>Priority</Text>
        <Text style={{ color: "#6c5a4c" }}>
          Tasks shown here are overdue, within the urgency window, or explicitly marked as priority.
        </Text>
      </View>

      {prioritizedTasks.length ? (
        prioritizedTasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onEdit={() => {}}
            onToggleComplete={() => void toggleTaskCompletion(task.id)}
          />
        ))
      ) : (
        <View style={{ padding: 20, borderRadius: 24, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#dfd2c4" }}>
          <Text style={{ color: "#35291f", fontWeight: "700", marginBottom: 6 }}>Nothing urgent right now</Text>
          <Text style={{ color: "#6c5a4c" }}>
            This view will populate as tasks become urgent or marked as high-priority work.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
