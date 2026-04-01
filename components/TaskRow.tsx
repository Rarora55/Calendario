import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, Text, View } from "react-native";

import type { TaskRecord } from "@/src/features/shared/types";
import { deriveTaskReportState } from "@/src/features/tasks/status";
import { useAppTranslation } from "@/src/i18n/useAppTranslation";
import { useAppTheme } from "@/src/theme/useAppTheme";

type TaskRowProps = {
  task: TaskRecord;
  onEdit?: () => void;
  onToggleComplete: () => void;
  onDelete?: () => void;
};

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours === 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
}

export function TaskRow({ task, onEdit, onToggleComplete, onDelete }: TaskRowProps) {
  const { copy } = useAppTranslation();
  const state = deriveTaskReportState(task);
  const badgeLabel =
    state === "completed" ? copy.taskRow.completed : state === "in-progress" ? copy.taskRow.inProgress : copy.taskRow.planned;
  const { colors, mode } = useAppTheme();
  const badgeBackgroundColor =
    state === "completed" ? colors.success : state === "in-progress" ? colors.warning : colors.surfaceMuted;
  const badgeTextColor = state === "not-completed" ? colors.text : mode === "dark" ? colors.background : colors.text;

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        padding: 12,
        gap: 8,
        backgroundColor: colors.card,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>{task.title}</Text>
          {task.notes ? <Text style={{ color: colors.textMuted }}>{task.notes}</Text> : null}
        </View>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
          <View
            style={{
              alignSelf: "flex-start",
              backgroundColor: badgeBackgroundColor,
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 6,
            }}
          >
            <Text style={{ color: badgeTextColor, fontSize: 12, fontWeight: "600" }}>{badgeLabel}</Text>
          </View>
          {onDelete ? (
            <Pressable
              accessibilityLabel={copy.taskRow.deleteTaskA11y(task.title)}
              onPress={onDelete}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <FontAwesome color={colors.textMuted} name="trash-o" size={16} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <Text style={{ color: colors.textMuted }}>
        {copy.taskRow.summary(task.value, formatDuration(task.estimatedTimeSeconds), formatDuration(task.workedTimeSeconds))}
      </Text>

      {task.scheduledStartDate && task.scheduledEndDate ? (
        <Text style={{ color: colors.textMuted }}>
          {copy.taskRow.scheduled(task.scheduledStartDate, task.scheduledEndDate)}
        </Text>
      ) : (
        <Text style={{ color: colors.textMuted }}>{copy.common.unscheduled}</Text>
      )}

      <View style={{ flexDirection: "row", gap: 10 }}>
        {onEdit ? (
          <Pressable
            onPress={onEdit}
            style={{
              flex: 1,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              paddingVertical: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: colors.text, fontWeight: "600" }}>{copy.taskRow.edit}</Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={onToggleComplete}
          style={{
            flex: 1,
            borderRadius: 12,
            backgroundColor: colors.primary,
            paddingVertical: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "700" }}>
            {task.isCompleted ? copy.taskRow.reopen : copy.taskRow.complete}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
