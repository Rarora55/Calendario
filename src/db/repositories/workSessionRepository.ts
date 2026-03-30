import type { WorkSessionRecord } from "@/src/features/shared/types";
import { getDatabaseAdapter } from "@/src/db/client";

type WorkSessionRow = {
  id: string;
  task_id: string;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  source: "timer" | "manual_adjustment";
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sync_status: "synced" | "pending_upsert" | "pending_delete";
  last_synced_at: string | null;
};

function mapWorkSession(row: WorkSessionRow): WorkSessionRecord {
  return {
    id: row.id,
    taskId: row.task_id,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    durationSeconds: row.duration_seconds,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
    syncStatus: row.sync_status,
    lastSyncedAt: row.last_synced_at,
  };
}

export async function listWorkSessions() {
  const database = await getDatabaseAdapter();
  const rows = await database.getAllAsync<WorkSessionRow>(
    "SELECT * FROM work_sessions WHERE deleted_at IS NULL ORDER BY started_at DESC;",
  );
  return rows.map(mapWorkSession);
}

export async function upsertWorkSession(workSession: WorkSessionRecord) {
  const database = await getDatabaseAdapter();
  await database.withTransactionAsync(async () => {
    await database.runAsync(
      `INSERT INTO work_sessions (
        id, task_id, started_at, ended_at, duration_seconds, source,
        created_at, updated_at, deleted_at, sync_status, last_synced_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        task_id = excluded.task_id,
        started_at = excluded.started_at,
        ended_at = excluded.ended_at,
        duration_seconds = excluded.duration_seconds,
        source = excluded.source,
        updated_at = excluded.updated_at,
        deleted_at = excluded.deleted_at,
        sync_status = excluded.sync_status,
        last_synced_at = excluded.last_synced_at;`,
      [
        workSession.id,
        workSession.taskId,
        workSession.startedAt,
        workSession.endedAt,
        workSession.durationSeconds,
        workSession.source,
        workSession.createdAt,
        workSession.updatedAt,
        workSession.deletedAt,
        workSession.syncStatus,
        workSession.lastSyncedAt,
      ],
    );

    await database.runAsync(
      `UPDATE tasks
       SET worked_time_seconds = COALESCE((
         SELECT SUM(duration_seconds)
         FROM work_sessions
         WHERE task_id = ? AND deleted_at IS NULL
       ), 0), updated_at = ?
       WHERE id = ?;`,
      [workSession.taskId, workSession.updatedAt, workSession.taskId],
    );
  });
}
