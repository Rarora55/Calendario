import { createTaskFixture } from "@/tests/fixtures/swipeDeleteTimerFixtures";
import { createActiveTimer } from "@/src/features/timer/activeTimer";
import { canDeleteTask, canDeleteTaskGroup } from "@/src/features/tasks/deleteGuards";

describe("delete guards", () => {
  it("blocks deleting the task currently being timed", () => {
    const result = canDeleteTask("task-1", createActiveTimer("task-1", new Date("2026-03-30T20:00:00.000Z")));

    expect(result).toEqual({ ok: false, reason: "active_timer_dependency" });
  });

  it("allows deleting a different task", () => {
    const result = canDeleteTask("task-2", createActiveTimer("task-1", new Date("2026-03-30T20:00:00.000Z")));

    expect(result).toEqual({ ok: true });
  });

  it("blocks deleting a task group that contains the currently timed task", () => {
    const task = createTaskFixture({ id: "task-1", taskGroupId: "group-1" });
    const otherTask = createTaskFixture({ id: "task-2", taskGroupId: "group-2" });

    const result = canDeleteTaskGroup(
      "group-1",
      [task, otherTask],
      createActiveTimer("task-1", new Date("2026-03-30T20:00:00.000Z")),
    );

    expect(result).toEqual({ ok: false, reason: "active_timer_dependency" });
  });
});
