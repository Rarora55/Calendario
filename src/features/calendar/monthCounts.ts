import type { TaskRecord } from "@/src/features/shared/types";

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseDateOnly(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function getMonthTaskCounts(tasks: TaskRecord[], monthDate: Date) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const counts = new Map<string, number>();

  for (const task of tasks) {
    if (task.deletedAt || !task.scheduledStartDate || !task.scheduledEndDate) {
      continue;
    }

    const rangeStart = parseDateOnly(task.scheduledStartDate);
    const rangeEnd = parseDateOnly(task.scheduledEndDate);
    const start = rangeStart < firstDay ? firstDay : rangeStart;
    const end = rangeEnd > lastDay ? lastDay : rangeEnd;

    if (end < firstDay || start > lastDay) {
      continue;
    }

    let cursor = start;
    while (cursor <= end) {
      const key = toDateKey(cursor);
      counts.set(key, (counts.get(key) ?? 0) + 1);
      cursor = addDays(cursor, 1);
    }
  }

  return counts;
}
