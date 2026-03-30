export type ActiveTimerSnapshot = {
  taskId: string;
  startedAt: string;
};

export function createActiveTimer(taskId: string, startedAt = new Date()) {
  return {
    taskId,
    startedAt: startedAt.toISOString(),
  };
}

export function calculateElapsedSeconds(timer: ActiveTimerSnapshot, endedAt = new Date()) {
  const diff = endedAt.getTime() - new Date(timer.startedAt).getTime();
  return Math.max(0, Math.round(diff / 1000));
}

export function isActiveTimerForTask(timer: ActiveTimerSnapshot | null, taskId: string) {
  return timer?.taskId === taskId;
}
