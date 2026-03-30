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
  listTasks: jest.fn().mockResolvedValue([]),
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
import { useAppStore } from "@/src/state/store";

describe("timer selection state", () => {
  beforeEach(() => {
    const task = createTaskFixture();

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

  it("blocks timer start when no task is selected", () => {
    const result = useAppStore.getState().startTimer();

    expect(result).toEqual({ ok: false, reason: "selection_required" });
    expect(useAppStore.getState().activeTimer).toBeNull();
  });

  it("starts the timer for the explicitly selected task", () => {
    const task = useAppStore.getState().tasks[0];
    useAppStore.getState().selectTimerTask(task.id);

    const result = useAppStore.getState().startTimer();

    expect(result).toEqual({ ok: true, taskId: task.id });
    expect(useAppStore.getState().activeTimer?.taskId).toBe(task.id);
  });

  it("does not allow changing the selected task while a timer is active", () => {
    const firstTask = useAppStore.getState().tasks[0];
    const secondTask = createTaskFixture({ id: "task-2", title: "Follow up" });
    useAppStore.setState({ tasks: [firstTask, secondTask] });
    useAppStore.getState().selectTimerTask(firstTask.id);
    useAppStore.getState().startTimer();

    useAppStore.getState().selectTimerTask(secondTask.id);

    expect(useAppStore.getState().selectedTimerTaskId).toBe(firstTask.id);
  });
});
