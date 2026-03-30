import type { TaskGroupRecord, TaskGroupSummary } from "@/src/features/shared/types";
import { deriveTaskReportState } from "@/src/features/tasks/status";
import { getDatabaseAdapter } from "@/src/db/client";

type TaskGroupRow = {
  id: string;
  name: string;
  color_token: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sync_status: "synced" | "pending_upsert" | "pending_delete";
  last_synced_at: string | null;
};

type SummaryRow = TaskGroupRow & {
  task_count: number;
  total_value: number | null;
  total_estimated_time_seconds: number | null;
  total_worked_time_seconds: number | null;
  date_span_start: string | null;
  date_span_end: string | null;
};

type TaskStateRow = {
  task_group_id: string;
  is_completed: number;
  worked_time_seconds: number;
  is_priority: number;
};

function mapTaskGroup(row: TaskGroupRow): TaskGroupRecord {
  return {
    id: row.id,
    name: row.name,
    colorToken: row.color_token,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
    syncStatus: row.sync_status,
    lastSyncedAt: row.last_synced_at,
  };
}

export async function listTaskGroups() {
  const database = await getDatabaseAdapter();
  const rows = await database.getAllAsync<TaskGroupRow>(
    "SELECT * FROM task_groups WHERE deleted_at IS NULL ORDER BY sort_order ASC, updated_at DESC;",
  );

  return rows.map(mapTaskGroup);
}

export async function getTaskGroupById(id: string) {
  const database = await getDatabaseAdapter();
  const row = await database.getFirstAsync<TaskGroupRow>(
    "SELECT * FROM task_groups WHERE id = ? LIMIT 1;",
    [id],
  );

  return row ? mapTaskGroup(row) : null;
}

export async function upsertTaskGroup(taskGroup: TaskGroupRecord) {
  const database = await getDatabaseAdapter();
  await database.runAsync(
    `INSERT INTO task_groups (
      id, name, color_token, sort_order, created_at, updated_at, deleted_at, sync_status, last_synced_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      color_token = excluded.color_token,
      sort_order = excluded.sort_order,
      updated_at = excluded.updated_at,
      deleted_at = excluded.deleted_at,
      sync_status = excluded.sync_status,
      last_synced_at = excluded.last_synced_at;`,
    [
      taskGroup.id,
      taskGroup.name,
      taskGroup.colorToken,
      taskGroup.sortOrder,
      taskGroup.createdAt,
      taskGroup.updatedAt,
      taskGroup.deletedAt,
      taskGroup.syncStatus,
      taskGroup.lastSyncedAt,
    ],
  );
}

export async function softDeleteTaskGroupCascade(id: string, deletedAt = new Date().toISOString()) {
  const database = await getDatabaseAdapter();
  await database.withTransactionAsync(async () => {
    await database.runAsync(
      `UPDATE task_groups
       SET deleted_at = ?, updated_at = ?, sync_status = 'pending_delete', last_synced_at = NULL
       WHERE id = ? AND deleted_at IS NULL;`,
      [deletedAt, deletedAt, id],
    );

    await database.runAsync(
      `UPDATE tasks
       SET deleted_at = ?, updated_at = ?, sync_status = 'pending_delete', last_synced_at = NULL
       WHERE task_group_id = ? AND deleted_at IS NULL;`,
      [deletedAt, deletedAt, id],
    );
  });
}

export async function listTaskGroupSummaries() {
  const database = await getDatabaseAdapter();
  const [rows, taskRows] = await Promise.all([
    database.getAllAsync<SummaryRow>(
      `SELECT
        tg.*,
        COUNT(t.id) AS task_count,
        SUM(COALESCE(t.value, 0)) AS total_value,
        SUM(COALESCE(t.estimated_time_seconds, 0)) AS total_estimated_time_seconds,
        SUM(COALESCE(t.worked_time_seconds, 0)) AS total_worked_time_seconds,
        MIN(t.scheduled_start_date) AS date_span_start,
        MAX(t.scheduled_end_date) AS date_span_end
      FROM task_groups tg
      LEFT JOIN tasks t ON t.task_group_id = tg.id AND t.deleted_at IS NULL
      WHERE tg.deleted_at IS NULL
      GROUP BY tg.id
      ORDER BY tg.sort_order ASC, tg.updated_at DESC;`,
    ),
    database.getAllAsync<TaskStateRow>(
      "SELECT task_group_id, is_completed, worked_time_seconds, is_priority FROM tasks WHERE deleted_at IS NULL;",
    ),
  ]);

  const tasksByGroup = new Map<string, TaskStateRow[]>();
  for (const task of taskRows) {
    const current = tasksByGroup.get(task.task_group_id) ?? [];
    current.push(task);
    tasksByGroup.set(task.task_group_id, current);
  }

  return rows.map((row) => {
    const groupTasks = tasksByGroup.get(row.id) ?? [];
    return {
      ...mapTaskGroup(row),
      taskCount: Number(row.task_count ?? 0),
      totalValue: Number(row.total_value ?? 0),
      totalEstimatedTimeSeconds: Number(row.total_estimated_time_seconds ?? 0),
      totalWorkedTimeSeconds: Number(row.total_worked_time_seconds ?? 0),
      dateSpanStart: row.date_span_start,
      dateSpanEnd: row.date_span_end,
      progressStateSummary: {
        completed: groupTasks.filter((task) => deriveTaskReportState({ isCompleted: Boolean(task.is_completed), workedTimeSeconds: task.worked_time_seconds, isPriority: Boolean(task.is_priority) }) === "completed").length,
        inProgress: groupTasks.filter((task) => deriveTaskReportState({ isCompleted: Boolean(task.is_completed), workedTimeSeconds: task.worked_time_seconds, isPriority: Boolean(task.is_priority) }) === "in-progress").length,
        notCompleted: groupTasks.filter((task) => deriveTaskReportState({ isCompleted: Boolean(task.is_completed), workedTimeSeconds: task.worked_time_seconds, isPriority: Boolean(task.is_priority) }) === "not-completed").length,
      },
    } satisfies TaskGroupSummary;
  });
}
