import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, Text, View } from "react-native";

import { TaskRow } from "@/components/TaskRow";
import type { TaskGroupSummary, TaskRecord } from "@/src/features/shared/types";
import { useAppTheme } from "@/src/theme/useAppTheme";

type TaskGroupCardProps = {
  summary: TaskGroupSummary;
  tasks: TaskRecord[];
  onEditGroup: () => void;
  onDeleteGroup: () => void;
  onAddTask: () => void;
  onEditTask: (taskId: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
};

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours === 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
}

export function TaskGroupCard({
  summary,
  tasks,
  onEditGroup,
  onDeleteGroup,
  onAddTask,
  onEditTask,
  onToggleTask,
  onDeleteTask,
}: TaskGroupCardProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        borderRadius: 24,
        padding: 18,
        gap: 14,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
        <View style={{ flex: 1, gap: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                backgroundColor: summary.colorToken,
              }}
            />
            <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>{summary.name}</Text>
          </View>
          <Text style={{ color: colors.textMuted }}>
            {summary.taskCount} tasks - Value {summary.totalValue} - Estimated {formatDuration(summary.totalEstimatedTimeSeconds)}
          </Text>
          {summary.dateSpanStart && summary.dateSpanEnd ? (
            <Text style={{ color: colors.textMuted }}>
              Span {summary.dateSpanStart} to {summary.dateSpanEnd}
            </Text>
          ) : null}
        </View>

        <View style={{ flexDirection: "row", gap: 10, alignSelf: "flex-start" }}>
          <Pressable
            accessibilityLabel={`Delete group ${summary.name}`}
            onPress={onDeleteGroup}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: colors.border,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <FontAwesome color={colors.textMuted} name="trash-o" size={16} />
          </Pressable>
          <Pressable
            onPress={onEditGroup}
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 14,
              paddingVertical: 10,
              alignSelf: "flex-start",
            }}
          >
            <Text style={{ color: colors.text, fontWeight: "600" }}>Edit Group</Text>
          </Pressable>
        </View>
      </View>

      <View
        style={{
          backgroundColor: colors.surfaceMuted,
          borderRadius: 18,
          padding: 12,
          gap: 6,
        }}
      >
        <Text style={{ color: colors.text, fontWeight: "600" }}>
          Completed {summary.progressStateSummary.completed} - In Progress {summary.progressStateSummary.inProgress} - Planned {summary.progressStateSummary.notCompleted}
        </Text>
        <Text style={{ color: colors.textMuted }}>
          Worked {formatDuration(summary.totalWorkedTimeSeconds)}
        </Text>
      </View>

      <Pressable
        onPress={onAddTask}
        style={{
          borderRadius: 14,
          backgroundColor: colors.text,
          paddingVertical: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: colors.background, fontWeight: "700" }}>Add Task</Text>
      </Pressable>

      <View style={{ gap: 10 }}>
        {tasks.length ? (
          tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onEdit={() => onEditTask(task.id)}
              onToggleComplete={() => onToggleTask(task.id)}
              onDelete={() => onDeleteTask(task.id)}
            />
          ))
        ) : (
          <Text style={{ color: colors.textMuted }}>No tasks in this group yet.</Text>
        )}
      </View>
    </View>
  );
}
