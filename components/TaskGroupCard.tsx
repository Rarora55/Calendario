import { Pressable, Text, View } from "react-native";

import type { TaskGroupSummary, TaskRecord } from "@/src/features/shared/types";
import { TaskRow } from "@/components/TaskRow";

type TaskGroupCardProps = {
  summary: TaskGroupSummary;
  tasks: TaskRecord[];
  onEditGroup: () => void;
  onAddTask: () => void;
  onEditTask: (taskId: string) => void;
  onToggleTask: (taskId: string) => void;
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
  onAddTask,
  onEditTask,
  onToggleTask,
}: TaskGroupCardProps) {
  return (
    <View
      style={{
        borderRadius: 24,
        padding: 18,
        gap: 14,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#dfd2c4",
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
            <Text style={{ fontSize: 22, fontWeight: "700", color: "#35291f" }}>{summary.name}</Text>
          </View>
          <Text style={{ color: "#6c5a4c" }}>
            {summary.taskCount} tasks · Value {summary.totalValue} · Estimated {formatDuration(summary.totalEstimatedTimeSeconds)}
          </Text>
          {summary.dateSpanStart && summary.dateSpanEnd ? (
            <Text style={{ color: "#6c5a4c" }}>
              Span {summary.dateSpanStart} to {summary.dateSpanEnd}
            </Text>
          ) : null}
        </View>

        <Pressable
          onPress={onEditGroup}
          style={{
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#dfd2c4",
            paddingHorizontal: 14,
            paddingVertical: 10,
            alignSelf: "flex-start",
          }}
        >
          <Text style={{ color: "#35291f", fontWeight: "600" }}>Edit Group</Text>
        </Pressable>
      </View>

      <View
        style={{
          backgroundColor: "#f4ede4",
          borderRadius: 18,
          padding: 12,
          gap: 6,
        }}
      >
        <Text style={{ color: "#35291f", fontWeight: "600" }}>
          Completed {summary.progressStateSummary.completed} · In Progress {summary.progressStateSummary.inProgress} · Planned {summary.progressStateSummary.notCompleted}
        </Text>
        <Text style={{ color: "#6c5a4c" }}>
          Worked {formatDuration(summary.totalWorkedTimeSeconds)}
        </Text>
      </View>

      <Pressable
        onPress={onAddTask}
        style={{
          borderRadius: 14,
          backgroundColor: "#35291f",
          paddingVertical: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff9f2", fontWeight: "700" }}>Add Task</Text>
      </Pressable>

      <View style={{ gap: 10 }}>
        {tasks.length ? (
          tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onEdit={() => onEditTask(task.id)}
              onToggleComplete={() => onToggleTask(task.id)}
            />
          ))
        ) : (
          <Text style={{ color: "#6c5a4c" }}>No tasks in this group yet.</Text>
        )}
      </View>
    </View>
  );
}
