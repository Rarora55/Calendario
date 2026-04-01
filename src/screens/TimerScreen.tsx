import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { confirmDeleteAction } from "@/src/features/tasks/confirmDelete";
import { useTabSwipeNavigation } from "@/src/hooks/useTabSwipeNavigation";
import { useAppTranslation } from "@/src/i18n/useAppTranslation";
import { useAppStore } from "@/src/state/store";
import { useAppTheme } from "@/src/theme/useAppTheme";

export default function TimerScreen() {
  const hydrated = useAppStore((state) => state.hydrated);
  const hydrate = useAppStore((state) => state.hydrate);
  const tasks = useAppStore((state) => state.tasks);
  const activeTimer = useAppStore((state) => state.activeTimer);
  const selectedTimerTaskId = useAppStore((state) => state.selectedTimerTaskId);
  const selectTimerTask = useAppStore((state) => state.selectTimerTask);
  const startTimer = useAppStore((state) => state.startTimer);
  const stopTimer = useAppStore((state) => state.stopTimer);
  const deleteTask = useAppStore((state) => state.deleteTask);
  const { colors } = useAppTheme();
  const { copy } = useAppTranslation();
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const panHandlers = useTabSwipeNavigation();

  useEffect(() => {
    if (!hydrated) {
      void hydrate();
    }
  }, [hydrate, hydrated]);

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTimerTaskId) ?? null,
    [selectedTimerTaskId, tasks],
  );

  const activeTask = useMemo(
    () => tasks.find((task) => task.id === activeTimer?.taskId) ?? null,
    [activeTimer, tasks],
  );

  const handleStartTimer = () => {
    const result = startTimer();
    if (!result.ok) {
      setFeedbackMessage(
        result.reason === "selection_required"
          ? copy.timer.selectBeforeStart
          : copy.timer.chooseAvailableBeforeStart,
      );
      return;
    }

    setFeedbackMessage(null);
  };

  const handleDeleteTask = async (taskId: string, title: string) => {
    const confirmed = await confirmDeleteAction({
      title: copy.deleteDialogs.taskTitle,
      message: copy.deleteDialogs.taskMessage(title),
      confirmLabel: copy.common.delete,
      cancelLabel: copy.common.cancel,
    });

    if (!confirmed) {
      return;
    }

    const result = await deleteTask(taskId);
    setFeedbackMessage(result.ok ? null : copy.timer.deleteTaskBlocked);
  };

  return (
    <ScrollView
      {...panHandlers}
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 18, gap: 14 }}
    >
      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 28, fontWeight: "800", color: colors.text }}>{copy.timer.title}</Text>
        <Text style={{ color: colors.textMuted }}>{copy.timer.description}</Text>
        {feedbackMessage ? <Text style={{ color: colors.warning, fontWeight: "600" }}>{feedbackMessage}</Text> : null}
      </View>

      {activeTimer ? (
          <Pressable
            onPress={() => void stopTimer()}
            style={{ borderRadius: 18, backgroundColor: colors.text, paddingVertical: 16, alignItems: "center", gap: 4 }}
          >
            <Text style={{ color: colors.background, fontWeight: "700" }}>{copy.timer.stopActiveTimer}</Text>
            <Text style={{ color: "#ffffff", fontWeight: "700" }}>
              {copy.timer.tracking(activeTask?.title ?? copy.timer.fallbackTrackedTask)}
            </Text>
          </Pressable>
      ) : (
        <View style={{ backgroundColor: colors.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 10 }}>
          <Text style={{ color: colors.text, fontWeight: "700", fontSize: 18 }}>{copy.timer.selectedTask}</Text>
          <Text style={{ color: colors.textMuted }}>{selectedTask ? selectedTask.title : copy.timer.chooseTask}</Text>
          <Pressable
            accessibilityLabel={copy.timer.startTimer}
            onPress={handleStartTimer}
            style={{
              borderRadius: 12,
              backgroundColor: selectedTask ? colors.primary : colors.surfaceMuted,
              paddingVertical: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: selectedTask ? "#ffffff" : colors.textMuted, fontWeight: "700" }}>{copy.timer.startTimer}</Text>
          </Pressable>
        </View>
      )}

      {tasks.length ? (
        tasks.map((task) => {
          const isSelected = selectedTimerTaskId === task.id;
          const isActiveTask = activeTimer?.taskId === task.id;

          return (
            <View
              key={task.id}
              style={{
                backgroundColor: colors.card,
                borderRadius: 20,
                padding: 16,
                borderWidth: 1,
                borderColor: isSelected || isActiveTask ? colors.primary : colors.border,
                gap: 10,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={{ color: colors.text, fontWeight: "700", fontSize: 18 }}>{task.title}</Text>
                  <Text style={{ color: colors.textMuted }}>{copy.timer.workedMinutes(Math.round(task.workedTimeSeconds / 60))}</Text>
                  <Text style={{ color: colors.textMuted }}>
                    {isActiveTask ? copy.timer.currentlyRunning : isSelected ? copy.timer.selectedNextSession : copy.timer.availableToTrack}
                  </Text>
                </View>
                <Pressable
                  accessibilityLabel={copy.timer.deleteTaskA11y(task.title)}
                  onPress={() => void handleDeleteTask(task.id, task.title)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: colors.border,
                    justifyContent: "center",
                    alignItems: "center",
                    alignSelf: "flex-start",
                  }}
                >
                  <FontAwesome color={colors.textMuted} name="trash-o" size={16} />
                </Pressable>
              </View>
              <Pressable
                accessibilityLabel={copy.timer.selectTaskA11y(task.title)}
                disabled={Boolean(activeTimer)}
                onPress={() => {
                  selectTimerTask(task.id);
                  setFeedbackMessage(null);
                }}
                style={{
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isSelected ? colors.primary : colors.border,
                  backgroundColor: isSelected ? colors.surfaceMuted : colors.card,
                  paddingVertical: 10,
                  alignItems: "center",
                  opacity: activeTimer ? 0.55 : 1,
                }}
              >
                <Text style={{ color: colors.text, fontWeight: "700" }}>
                  {isActiveTask ? copy.timer.running : isSelected ? copy.timer.selected : copy.timer.selectTask}
                </Text>
              </Pressable>
            </View>
          );
        })
      ) : (
        <View style={{ backgroundColor: colors.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 8 }}>
          <Text style={{ color: colors.text, fontWeight: "700" }}>{copy.timer.noActiveTasks}</Text>
          <Text style={{ color: colors.textMuted }}>{copy.timer.noActiveTasksDescription}</Text>
        </View>
      )}
    </ScrollView>
  );
}
