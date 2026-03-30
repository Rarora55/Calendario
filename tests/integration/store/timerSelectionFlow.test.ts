jest.mock("@/src/db/legacyImport", () => ({
  loadLegacyImportBundle: jest.fn().mockResolvedValue(null),
}));

jest.mock("@/src/db/repositories/taskGroupRepository", () => ({
  listTaskGroups: jest.fn().mockResolvedValue([]),
  listTaskGroupSummaries: jest.fn().mockResolvedValue([]),
  upsertTaskGroup: jest.fn(),
  softDeleteTaskGroupCascade: jest.fn(),
}));

jest.mock("@/src/db/repositories/taskRepository", () => ({
  getTaskById: jest.fn(),
  listTasks: jest.fn(),
  upsertTask: jest.fn(),
  softDeleteTask: jest.fn(),
}));

jest.mock("@/src/db/repositories/userPreferenceRepository", () => ({
  ensureUserPreferences: jest.fn(),
  getUserPreferences: jest.fn().mockResolvedValue(null),
  upsertUserPreferences: jest.fn(),
}));

jest.mock("@/src/db/repositories/workSessionRepository", () => ({
  listWorkSessions: jest.fn().mockResolvedValue([]),
  upsertWorkSession: jest.fn(),
}));

import { createTaskFixture } from "@/tests/fixtures/swipeDeleteTimerFixtures";
import { listTasks } from "@/src/db/repositories/taskRepository";
import { upsertWorkSession } from "@/src/db/repositories/workSessionRepository";
import { useAppStore } from "@/src/state/store";

describe("timer selection integration flow", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-03-30T20:00:00.000Z"));

    const task = createTaskFixture();
    (listTasks as jest.Mock).mockResolvedValue([task]);

    useAppStore.setState({
      hydrated: true,
      taskGroups: [],
      taskGroupSummaries: [],
      tasks: [task],
      workSessions: [],
      preferences: null,
      activeTimer: null,
      selectedTimerTaskId: null,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("persists a work session against the selected task when the timer stops", async () => {
    const task = useAppStore.getState().tasks[0];
    useAppStore.getState().selectTimerTask(task.id);

    expect(useAppStore.getState().startTimer()).toEqual({ ok: true, taskId: task.id });

    jest.setSystemTime(new Date("2026-03-30T20:15:00.000Z"));
    await useAppStore.getState().stopTimer();

    expect(upsertWorkSession).toHaveBeenCalledWith(
      expect.objectContaining({
        taskId: task.id,
        durationSeconds: 900,
        source: "timer",
      }),
    );
    expect(useAppStore.getState().activeTimer).toBeNull();
    expect(useAppStore.getState().selectedTimerTaskId).toBe(task.id);
  });
});
