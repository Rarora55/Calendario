import { mapLegacyStateToRecords } from "@/src/db/legacyImport";
import { runMigrations, type DatabaseAdapter } from "@/src/db/migrations";

describe("foundation bootstrap and import", () => {
  it("runs the migration set against a database adapter", async () => {
    const executedStatements: string[] = [];
    const adapter: DatabaseAdapter = {
      async execAsync(sql) {
        executedStatements.push(sql);
      },
      async getAllAsync() {
        return [];
      },
      async withTransactionAsync(scope) {
        return scope();
      },
    };

    await runMigrations(adapter);

    expect(executedStatements.some((statement) => statement.includes("CREATE TABLE IF NOT EXISTS task_groups"))).toBe(true);
    expect(executedStatements.some((statement) => statement.includes("INSERT INTO migrations"))).toBe(true);
  });

  it("imports legacy calendar data into task groups and tasks", () => {
    const imported = mapLegacyStateToRecords({
      calendars: [
        { id: "calendar-1", name: "Client Work", color: "#8ab7aa" },
        { id: "calendar-2", name: "Personal", color: "#cf7d70" },
      ],
      events: [
        {
          id: "event-1",
          calendarId: "calendar-1",
          title: "Prepare sprint summary",
          description: "Review completed stories",
          location: "Main office",
          priority: "alta",
          startISO: "2026-03-30T09:00:00.000Z",
          endISO: "2026-03-31T09:00:00.000Z",
        },
      ],
      binEvents: [
        {
          id: "event-2",
          calendarId: "calendar-2",
          title: "Old task",
          priority: "media",
          startISO: "2026-03-28T10:00:00.000Z",
          endISO: "2026-03-28T11:00:00.000Z",
        },
      ],
    });

    expect(imported.taskGroups).toHaveLength(2);
    expect(imported.tasks).toHaveLength(2);
    expect(imported.tasks[0]).toMatchObject({
      title: "Prepare sprint summary",
      isPriority: true,
      scheduledStartDate: "2026-03-30",
      scheduledEndDate: "2026-03-31",
    });
    expect(imported.tasks[0].notes).toContain("Imported location: Main office");
    expect(imported.tasks[1].deletedAt).not.toBeNull();
  });
});
