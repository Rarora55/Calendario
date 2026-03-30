import type { TaskRecord, WeeklyReport, WorkSessionRecord } from "@/src/features/shared/types";
import { deriveTaskReportState } from "@/src/features/tasks/status";

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function getWeekRange(anchorDate = new Date()) {
  const day = anchorDate.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const weekStart = new Date(anchorDate);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(anchorDate.getDate() + mondayOffset);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return {
    weekStartDate: toDateKey(weekStart),
    weekEndDate: toDateKey(weekEnd),
  };
}

export function buildWeeklyReport(tasks: TaskRecord[], sessions: WorkSessionRecord[], anchorDate = new Date()): WeeklyReport {
  const range = getWeekRange(anchorDate);
  const includedTasks = tasks.filter((task) => {
    if (task.deletedAt) {
      return false;
    }

    const scheduledInWeek = Boolean(task.scheduledStartDate && task.scheduledEndDate && task.scheduledStartDate <= range.weekEndDate && task.scheduledEndDate >= range.weekStartDate);
    const completedInWeek = Boolean(task.completedAt && task.completedAt.slice(0, 10) >= range.weekStartDate && task.completedAt.slice(0, 10) <= range.weekEndDate);
    const workedInWeek = sessions.some((session) => !session.deletedAt && session.taskId === task.id && session.startedAt.slice(0, 10) <= range.weekEndDate && session.endedAt.slice(0, 10) >= range.weekStartDate);

    return scheduledInWeek || completedInWeek || workedInWeek;
  });

  const includedTaskIds = includedTasks.map((task) => task.id);
  const states = includedTasks.map(deriveTaskReportState);
  const completedCount = states.filter((state) => state === "completed").length;
  const inProgressCount = states.filter((state) => state === "in-progress").length;
  const notCompletedCount = states.filter((state) => state === "not-completed").length;
  const total = includedTasks.length;
  const timeInvestedSeconds = sessions
    .filter((session) => !session.deletedAt && includedTaskIds.includes(session.taskId) && session.startedAt.slice(0, 10) <= range.weekEndDate && session.endedAt.slice(0, 10) >= range.weekStartDate)
    .reduce((sum, session) => sum + session.durationSeconds, 0);

  return {
    ...range,
    includedTaskIds,
    completedCount,
    inProgressCount,
    notCompletedCount,
    completedPercentage: total === 0 ? 0 : Math.round((completedCount / total) * 100),
    inProgressPercentage: total === 0 ? 0 : Math.round((inProgressCount / total) * 100),
    notCompletedPercentage: total === 0 ? 0 : Math.round((notCompletedCount / total) * 100),
    completedValueTotal: includedTasks.filter((task) => task.isCompleted).reduce((sum, task) => sum + task.value, 0),
    timeInvestedSeconds,
  };
}
