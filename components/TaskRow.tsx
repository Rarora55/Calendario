import { Pressable, Text, View } from "react-native";

import type { TaskRecord } from "@/src/features/shared/types";
import { deriveTaskReportState } from "@/src/features/tasks/status";

type TaskRowProps = {
  task: TaskRecord;
  onEdit: () => void;
  onToggleComplete: () => void;
};

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours === 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
}

export function TaskRow({ task, onEdit, onToggleComplete }: TaskRowProps) {
  const state = deriveTaskReportState(task);
  const badgeLabel =
    state === "completed" ? "Completed" : state === "in-progress" ? "In Progress" : "Planned";

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: "#dfd2c4",
        borderRadius: 16,
        padding: 12,
        gap: 8,
        backgroundColor: "#ffffff",
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#35291f" }}>{task.title}</Text>
          {task.notes ? <Text style={{ color: "#6c5a4c" }}>{task.notes}</Text> : null}
        </View>
        <View
          style={{
            alignSelf: "flex-start",
            backgroundColor: state === "completed" ? "#dcefe4" : state === "in-progress" ? "#eef3da" : "#f4ede4",
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 6,
          }}
        >
          <Text style={{ color: "#35291f", fontSize: 12, fontWeight: "600" }}>{badgeLabel}</Text>
        </View>
      </View>

      <Text style={{ color: "#6c5a4c" }}>
        Value {task.value} · Estimated {formatDuration(task.estimatedTimeSeconds)} · Worked {formatDuration(task.workedTimeSeconds)}
      </Text>

      {task.scheduledStartDate && task.scheduledEndDate ? (
        <Text style={{ color: "#6c5a4c" }}>
          Scheduled {task.scheduledStartDate} to {task.scheduledEndDate}
        </Text>
      ) : (
        <Text style={{ color: "#6c5a4c" }}>Unscheduled</Text>
      )}

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Pressable
          onPress={onEdit}
          style={{
            flex: 1,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#dfd2c4",
            paddingVertical: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#35291f", fontWeight: "600" }}>Edit</Text>
        </Pressable>
        <Pressable
          onPress={onToggleComplete}
          style={{
            flex: 1,
            borderRadius: 12,
            backgroundColor: "#de8f6e",
            paddingVertical: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "700" }}>
            {task.isCompleted ? "Reopen" : "Complete"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
