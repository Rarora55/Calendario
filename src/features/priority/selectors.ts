import type { TaskRecord } from "@/src/features/shared/types";

function dateOnlyKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function selectPriorityTasks(tasks: TaskRecord[], urgencyWindowDays: number, today = new Date()) {
  const todayKey = dateOnlyKey(today);
  const cutoff = new Date(today);
  cutoff.setDate(today.getDate() + urgencyWindowDays);
  const cutoffKey = dateOnlyKey(cutoff);

  return tasks.filter((task) => {
    if (task.deletedAt || task.isCompleted) {
      return false;
    }

    const overdue = Boolean(task.scheduledEndDate && task.scheduledEndDate < todayKey);
    const urgent = Boolean(task.scheduledEndDate && task.scheduledEndDate >= todayKey && task.scheduledEndDate <= cutoffKey);
    return task.isPriority || overdue || urgent;
  });
}
