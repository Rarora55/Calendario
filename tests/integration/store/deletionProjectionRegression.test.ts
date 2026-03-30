import { createTaskFixture, createWorkSessionFixture } from "@/tests/fixtures/swipeDeleteTimerFixtures";
import { getMonthTaskCounts } from "@/src/features/calendar/monthCounts";
import { buildWeeklyReport } from "@/src/features/reports/weeklyReport";

describe("deletion projection regression", () => {
  it("excludes deleted tasks from calendar counts and weekly reports", () => {
    const activeTask = createTaskFixture({
      id: "task-active",
      scheduledStartDate: "2026-03-30",
      scheduledEndDate: "2026-03-31",
    });
    const deletedTask = createTaskFixture({
      id: "task-deleted",
      deletedAt: "2026-03-30T20:00:00.000Z",
      scheduledStartDate: "2026-03-30",
      scheduledEndDate: "2026-03-30",
    });
    const session = createWorkSessionFixture({ taskId: "task-active" });

    const counts = getMonthTaskCounts([activeTask, deletedTask], new Date("2026-03-30T20:00:00.000Z"));
    const report = buildWeeklyReport([activeTask, deletedTask], [session], new Date("2026-03-30T20:00:00.000Z"));

    expect(counts.get("2026-03-30")).toBe(1);
    expect(report.includedTaskIds).toEqual(["task-active"]);
  });
});
