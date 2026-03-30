jest.mock("@/src/db/client", () => ({
  getDatabaseAdapter: jest.fn(),
}));

import { getDatabaseAdapter } from "@/src/db/client";
import { softDeleteTask } from "@/src/db/repositories/taskRepository";
import { softDeleteTaskGroupCascade } from "@/src/db/repositories/taskGroupRepository";

describe("task deletion repository flows", () => {
  it("soft-deletes a task with pending_delete sync status", async () => {
    const runAsync = jest.fn().mockResolvedValue(undefined);
    (getDatabaseAdapter as jest.Mock).mockResolvedValue({
      runAsync,
    });

    await softDeleteTask("task-1", "2026-03-30T20:00:00.000Z");

    expect(runAsync).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE tasks"),
      ["2026-03-30T20:00:00.000Z", "2026-03-30T20:00:00.000Z", "task-1"],
    );
  });

  it("soft-deletes a task group and its child tasks in one transaction", async () => {
    const runAsync = jest.fn().mockResolvedValue(undefined);
    const withTransactionAsync = jest.fn(async (scope: () => Promise<void>) => scope());
    (getDatabaseAdapter as jest.Mock).mockResolvedValue({
      runAsync,
      withTransactionAsync,
    });

    await softDeleteTaskGroupCascade("group-1", "2026-03-30T20:00:00.000Z");

    expect(withTransactionAsync).toHaveBeenCalled();
    expect(runAsync).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("UPDATE task_groups"),
      ["2026-03-30T20:00:00.000Z", "2026-03-30T20:00:00.000Z", "group-1"],
    );
    expect(runAsync).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("UPDATE tasks"),
      ["2026-03-30T20:00:00.000Z", "2026-03-30T20:00:00.000Z", "group-1"],
    );
  });
});
