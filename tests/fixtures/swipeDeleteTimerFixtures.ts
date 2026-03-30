import type {
  TaskGroupRecord,
  TaskRecord,
  UserPreferenceRecord,
  WorkSessionRecord,
} from "@/src/features/shared/types";

const defaultTimestamp = "2026-03-30T20:00:00.000Z";

export function createTaskGroupFixture(overrides: Partial<TaskGroupRecord> = {}): TaskGroupRecord {
  return {
    id: "group-1",
    name: "Client Work",
    colorToken: "#de8f6e",
    sortOrder: 0,
    createdAt: defaultTimestamp,
    updatedAt: defaultTimestamp,
    deletedAt: null,
    syncStatus: "pending_upsert",
    lastSyncedAt: null,
    ...overrides,
  };
}

export function createTaskFixture(overrides: Partial<TaskRecord> = {}): TaskRecord {
  return {
    id: "task-1",
    taskGroupId: "group-1",
    title: "Prepare sprint summary",
    notes: "Review completed stories",
    value: 20,
    estimatedTimeSeconds: 1800,
    workedTimeSeconds: 0,
    scheduledStartDate: "2026-03-30",
    scheduledEndDate: "2026-03-30",
    isCompleted: false,
    completedAt: null,
    isPriority: false,
    createdAt: defaultTimestamp,
    updatedAt: defaultTimestamp,
    deletedAt: null,
    syncStatus: "pending_upsert",
    lastSyncedAt: null,
    ...overrides,
  };
}

export function createWorkSessionFixture(overrides: Partial<WorkSessionRecord> = {}): WorkSessionRecord {
  return {
    id: "session-1",
    taskId: "task-1",
    startedAt: defaultTimestamp,
    endedAt: "2026-03-30T20:30:00.000Z",
    durationSeconds: 1800,
    source: "timer",
    createdAt: defaultTimestamp,
    updatedAt: defaultTimestamp,
    deletedAt: null,
    syncStatus: "pending_upsert",
    lastSyncedAt: null,
    ...overrides,
  };
}

export function createPreferenceFixture(
  overrides: Partial<UserPreferenceRecord> = {},
): UserPreferenceRecord {
  return {
    id: "preferences-local",
    theme: "system",
    language: "en",
    urgencyWindowDays: 3,
    linkedAuthUserId: null,
    linkedAuthProvider: null,
    lastSyncAt: null,
    createdAt: defaultTimestamp,
    updatedAt: defaultTimestamp,
    deletedAt: null,
    syncStatus: "pending_upsert",
    lastSyncedAt: null,
    ...overrides,
  };
}
