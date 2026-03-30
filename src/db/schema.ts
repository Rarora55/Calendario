export const databaseName = "calendario.db";

export const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS migrations (
    id TEXT PRIMARY KEY NOT NULL,
    applied_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS task_groups (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    color_token TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    sync_status TEXT NOT NULL,
    last_synced_at TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY NOT NULL,
    task_group_id TEXT NOT NULL,
    title TEXT NOT NULL,
    notes TEXT,
    value INTEGER NOT NULL,
    estimated_time_seconds INTEGER NOT NULL,
    worked_time_seconds INTEGER NOT NULL,
    scheduled_start_date TEXT,
    scheduled_end_date TEXT,
    is_completed INTEGER NOT NULL,
    completed_at TEXT,
    is_priority INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    sync_status TEXT NOT NULL,
    last_synced_at TEXT,
    FOREIGN KEY (task_group_id) REFERENCES task_groups(id)
  );`,
  `CREATE TABLE IF NOT EXISTS work_sessions (
    id TEXT PRIMARY KEY NOT NULL,
    task_id TEXT NOT NULL,
    started_at TEXT NOT NULL,
    ended_at TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL,
    source TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    sync_status TEXT NOT NULL,
    last_synced_at TEXT,
    FOREIGN KEY (task_id) REFERENCES tasks(id)
  );`,
  `CREATE TABLE IF NOT EXISTS user_preferences (
    id TEXT PRIMARY KEY NOT NULL,
    theme TEXT NOT NULL,
    language TEXT NOT NULL,
    urgency_window_days INTEGER NOT NULL,
    linked_auth_user_id TEXT,
    linked_auth_provider TEXT,
    last_sync_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    sync_status TEXT NOT NULL,
    last_synced_at TEXT
  );`,
  `CREATE INDEX IF NOT EXISTS idx_task_groups_updated_at ON task_groups(updated_at);`,
  `CREATE INDEX IF NOT EXISTS idx_tasks_group_id ON tasks(task_group_id);`,
  `CREATE INDEX IF NOT EXISTS idx_tasks_updated_at ON tasks(updated_at);`,
  `CREATE INDEX IF NOT EXISTS idx_work_sessions_task_id ON work_sessions(task_id);`,
];
