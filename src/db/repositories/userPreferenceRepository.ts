import { getDatabaseAdapter } from "@/src/db/client";
import {
  DEFAULT_LANGUAGE,
  DEFAULT_THEME,
  DEFAULT_URGENCY_WINDOW_DAYS,
  type UserPreferenceRecord,
} from "@/src/features/shared/types";

type UserPreferenceRow = {
  id: string;
  theme: "light" | "dark" | "system";
  language: string;
  urgency_window_days: number;
  linked_auth_user_id: string | null;
  linked_auth_provider: "google" | null;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sync_status: "synced" | "pending_upsert" | "pending_delete";
  last_synced_at: string | null;
};

function mapPreference(row: UserPreferenceRow): UserPreferenceRecord {
  return {
    id: row.id,
    theme: row.theme,
    language: row.language,
    urgencyWindowDays: row.urgency_window_days,
    linkedAuthUserId: row.linked_auth_user_id,
    linkedAuthProvider: row.linked_auth_provider,
    lastSyncAt: row.last_sync_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
    syncStatus: row.sync_status,
    lastSyncedAt: row.last_synced_at,
  };
}

export async function getUserPreferences() {
  const database = await getDatabaseAdapter();
  const row = await database.getFirstAsync<UserPreferenceRow>(
    "SELECT * FROM user_preferences WHERE deleted_at IS NULL ORDER BY updated_at DESC LIMIT 1;",
  );

  return row ? mapPreference(row) : null;
}

export async function ensureUserPreferences() {
  const current = await getUserPreferences();
  if (current) {
    return current;
  }

  const now = new Date().toISOString();
  const preferences: UserPreferenceRecord = {
    id: "preferences-local",
    theme: DEFAULT_THEME,
    language: DEFAULT_LANGUAGE,
    urgencyWindowDays: DEFAULT_URGENCY_WINDOW_DAYS,
    linkedAuthUserId: null,
    linkedAuthProvider: null,
    lastSyncAt: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    syncStatus: "pending_upsert",
    lastSyncedAt: null,
  };

  await upsertUserPreferences(preferences);
  return preferences;
}

export async function upsertUserPreferences(preferences: UserPreferenceRecord) {
  const database = await getDatabaseAdapter();
  await database.runAsync(
    `INSERT INTO user_preferences (
      id, theme, language, urgency_window_days, linked_auth_user_id, linked_auth_provider,
      last_sync_at, created_at, updated_at, deleted_at, sync_status, last_synced_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      theme = excluded.theme,
      language = excluded.language,
      urgency_window_days = excluded.urgency_window_days,
      linked_auth_user_id = excluded.linked_auth_user_id,
      linked_auth_provider = excluded.linked_auth_provider,
      last_sync_at = excluded.last_sync_at,
      updated_at = excluded.updated_at,
      deleted_at = excluded.deleted_at,
      sync_status = excluded.sync_status,
      last_synced_at = excluded.last_synced_at;`,
    [
      preferences.id,
      preferences.theme,
      preferences.language,
      preferences.urgencyWindowDays,
      preferences.linkedAuthUserId,
      preferences.linkedAuthProvider,
      preferences.lastSyncAt,
      preferences.createdAt,
      preferences.updatedAt,
      preferences.deletedAt,
      preferences.syncStatus,
      preferences.lastSyncedAt,
    ],
  );
}
