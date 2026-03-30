import type {
  ActiveTimerSnapshot,
} from "@/src/features/timer/activeTimer";
import { isActiveTimerForTask } from "@/src/features/timer/activeTimer";
import type { DeleteActionResult, TaskRecord } from "@/src/features/shared/types";

export function canDeleteTask(
  taskId: string,
  activeTimer: ActiveTimerSnapshot | null,
): DeleteActionResult {
  if (isActiveTimerForTask(activeTimer, taskId)) {
    return { ok: false, reason: "active_timer_dependency" };
  }

  return { ok: true };
}

export function canDeleteTaskGroup(
  taskGroupId: string,
  tasks: TaskRecord[],
  activeTimer: ActiveTimerSnapshot | null,
): DeleteActionResult {
  if (!activeTimer) {
    return { ok: true };
  }

  const hasActiveTimedTask = tasks.some(
    (task) => task.taskGroupId === taskGroupId && task.id === activeTimer.taskId,
  );

  if (hasActiveTimedTask) {
    return { ok: false, reason: "active_timer_dependency" };
  }

  return { ok: true };
}
