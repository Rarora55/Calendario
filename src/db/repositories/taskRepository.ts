import type { TaskRecord } from "@/src/features/shared/types";
import { getDatabaseAdapter } from "@/src/db/client";

type TaskRow = {
  id: string;
  task_group_id: string;
  title: string;
  notes: string | null;
  value: number;
  estimated_time_seconds: number;
  worked_time_seconds: number;
  scheduled_start_date: string | null;
  scheduled_end_date: string | null;
  is_completed: number;
  completed_at: string | null;
  is_priority: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sync_status: "synced" | "pending_upsert" | "pending_delete";
  last_synced_at: string | null;
};

function mapTask(row: TaskRow): TaskRecord {
  return {
    id: row.id,
    taskGroupId: row.task_group_id,
    title: row.title,
    notes: row.notes,
    value: row.value,
    estimatedTimeSeconds: row.estimated_time_seconds,
    workedTimeSeconds: row.worked_time_seconds,
    scheduledStartDate: row.scheduled_start_date,
    scheduledEndDate: row.scheduled_end_date,
    isCompleted: Boolean(row.is_completed),
    completedAt: row.completed_at,
    isPriority: Boolean(row.is_priority),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
    syncStatus: row.sync_status,
    lastSyncedAt: row.last_synced_at,
  };
}

export async function listTasks() {
  const database = await getDatabaseAdapter();
  const rows = await database.getAllAsync<TaskRow>(
    "SELECT * FROM tasks WHERE deleted_at IS NULL ORDER BY updated_at DESC;",
  );

  return rows.map(mapTask);
}

export async function listTasksByGroup(taskGroupId: string) {
  const database = await getDatabaseAdapter();
  const rows = await database.getAllAsync<TaskRow>(
    "SELECT * FROM tasks WHERE task_group_id = ? AND deleted_at IS NULL ORDER BY updated_at DESC;",
    [taskGroupId],
  );

  return rows.map(mapTask);
}

export async function getTaskById(id: string) {
  const database = await getDatabaseAdapter();
  const row = await database.getFirstAsync<TaskRow>(
    "SELECT * FROM tasks WHERE id = ? LIMIT 1;",
    [id],
  );

  return row ? mapTask(row) : null;
}

export async function upsertTask(task: TaskRecord) {
  const database = await getDatabaseAdapter();
  await database.runAsync(
    `INSERT INTO tasks (
      id, task_group_id, title, notes, value, estimated_time_seconds, worked_time_seconds,
      scheduled_start_date, scheduled_end_date, is_completed, completed_at, is_priority,
      created_at, updated_at, deleted_at, sync_status, last_synced_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      task_group_id = excluded.task_group_id,
      title = excluded.title,
      notes = excluded.notes,
      value = excluded.value,
      estimated_time_seconds = excluded.estimated_time_seconds,
      worked_time_seconds = excluded.worked_time_seconds,
      scheduled_start_date = excluded.scheduled_start_date,
      scheduled_end_date = excluded.scheduled_end_date,
      is_completed = excluded.is_completed,
      completed_at = excluded.completed_at,
      is_priority = excluded.is_priority,
      updated_at = excluded.updated_at,
      deleted_at = excluded.deleted_at,
      sync_status = excluded.sync_status,
      last_synced_at = excluded.last_synced_at;`,
    [
      task.id,
      task.taskGroupId,
      task.title,
      task.notes,
      task.value,
      task.estimatedTimeSeconds,
      task.workedTimeSeconds,
      task.scheduledStartDate,
      task.scheduledEndDate,
      task.isCompleted ? 1 : 0,
      task.completedAt,
      task.isPriority ? 1 : 0,
      task.createdAt,
      task.updatedAt,
      task.deletedAt,
      task.syncStatus,
      task.lastSyncedAt,
    ],
  );
}

export async function softDeleteTask(id: string, deletedAt = new Date().toISOString()) {
  const database = await getDatabaseAdapter();
  await database.runAsync(
    `UPDATE tasks
     SET deleted_at = ?, updated_at = ?, sync_status = 'pending_delete', last_synced_at = NULL
     WHERE id = ? AND deleted_at IS NULL;`,
    [deletedAt, deletedAt, id],
  );
}
