import { schemaStatements } from "@/src/db/schema";
import {
  taskGroupRecordSchema,
  taskRecordSchema,
  userPreferenceRecordSchema,
  workSessionRecordSchema,
} from "@/src/features/shared/validators";

describe("foundation schema and contracts", () => {
  it("defines the required local tables", () => {
    expect(schemaStatements.some((statement) => statement.includes("CREATE TABLE IF NOT EXISTS task_groups"))).toBe(true);
    expect(schemaStatements.some((statement) => statement.includes("CREATE TABLE IF NOT EXISTS tasks"))).toBe(true);
    expect(schemaStatements.some((statement) => statement.includes("CREATE TABLE IF NOT EXISTS work_sessions"))).toBe(true);
    expect(schemaStatements.some((statement) => statement.includes("CREATE TABLE IF NOT EXISTS user_preferences"))).toBe(true);
  });

  it("validates synced task-group, task, work-session, and preference records", () => {
    const timestamps = {
      createdAt: "2026-03-30T18:00:00.000Z",
      updatedAt: "2026-03-30T18:00:00.000Z",
      deletedAt: null,
      syncStatus: "pending_upsert" as const,
      lastSyncedAt: null,
    };

    expect(() =>
      taskGroupRecordSchema.parse({
        ...timestamps,
        id: "group-1",
        name: "Client Work",
        colorToken: "#de8f6e",
        sortOrder: 0,
      }),
    ).not.toThrow();

    expect(() =>
      taskRecordSchema.parse({
        ...timestamps,
        id: "task-1",
        taskGroupId: "group-1",
        title: "Prepare sprint summary",
        notes: "Imported from legacy app",
        value: 20,
        estimatedTimeSeconds: 1800,
        workedTimeSeconds: 0,
        scheduledStartDate: "2026-03-30",
        scheduledEndDate: "2026-03-31",
        isCompleted: false,
        completedAt: null,
        isPriority: true,
      }),
    ).not.toThrow();

    expect(() =>
      workSessionRecordSchema.parse({
        ...timestamps,
        id: "session-1",
        taskId: "task-1",
        startedAt: "2026-03-30T18:00:00.000Z",
        endedAt: "2026-03-30T18:30:00.000Z",
        durationSeconds: 1800,
        source: "timer",
      }),
    ).not.toThrow();

    expect(() =>
      userPreferenceRecordSchema.parse({
        ...timestamps,
        id: "preferences-local",
        theme: "system",
        language: "en",
        urgencyWindowDays: 3,
        linkedAuthUserId: null,
        linkedAuthProvider: null,
        lastSyncAt: null,
      }),
    ).not.toThrow();
  });
});
