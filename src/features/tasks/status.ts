import type { TaskRecord, TaskReportState } from "@/src/features/shared/types";

export function deriveTaskReportState(task: Pick<TaskRecord, "isCompleted" | "workedTimeSeconds" | "isPriority">): TaskReportState {
  if (task.isCompleted) {
    return "completed";
  }

  if (task.workedTimeSeconds > 0 || task.isPriority) {
    return "in-progress";
  }

  return "not-completed";
}
