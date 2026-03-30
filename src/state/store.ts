import { create } from "zustand";

import { loadLegacyImportBundle } from "@/src/db/legacyImport";
import {
  listTaskGroupSummaries,
  listTaskGroups,
  softDeleteTaskGroupCascade,
  upsertTaskGroup,
} from "@/src/db/repositories/taskGroupRepository";
import { getTaskById, listTasks, softDeleteTask, upsertTask } from "@/src/db/repositories/taskRepository";
import { ensureUserPreferences, getUserPreferences, upsertUserPreferences } from "@/src/db/repositories/userPreferenceRepository";
import { listWorkSessions, upsertWorkSession } from "@/src/db/repositories/workSessionRepository";
import { calculateElapsedSeconds, createActiveTimer, type ActiveTimerSnapshot } from "@/src/features/timer/activeTimer";
import { canDeleteTask, canDeleteTaskGroup } from "@/src/features/tasks/deleteGuards";
import type {
  DeleteActionResult,
  TaskGroupRecord,
  TaskGroupSummary,
  TaskRecord,
  TimerStartResult,
  UserPreferenceRecord,
  WorkSessionRecord,
} from "@/src/features/shared/types";
import { parseTaskGroupInput, parseTaskInput } from "@/src/features/shared/validators";

type CreateTaskGroupInput = {
  name: string;
  colorToken: string;
};

type CreateTaskInput = {
  taskGroupId: string;
  title: string;
  notes?: string | null;
  value: number;
  estimatedTimeSeconds: number;
  workedTimeSeconds?: number;
  scheduledStartDate?: string | null;
  scheduledEndDate?: string | null;
  isCompleted?: boolean;
  completedAt?: string | null;
  isPriority?: boolean;
};

type AppState = {
  hydrated: boolean;
  taskGroups: TaskGroupRecord[];
  taskGroupSummaries: TaskGroupSummary[];
  tasks: TaskRecord[];
  workSessions: WorkSessionRecord[];
  preferences: UserPreferenceRecord | null;
  activeTimer: ActiveTimerSnapshot | null;
  selectedTimerTaskId: string | null;
  hydrate: () => Promise<void>;
  refresh: () => Promise<void>;
  createTaskGroup: (input: CreateTaskGroupInput) => Promise<void>;
  updateTaskGroup: (id: string, input: CreateTaskGroupInput) => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<void>;
  updateTask: (id: string, input: CreateTaskInput) => Promise<void>;
  toggleTaskCompletion: (id: string) => Promise<void>;
  savePreferences: (patch: Partial<UserPreferenceRecord>) => Promise<void>;
  selectTimerTask: (taskId: string | null) => void;
  startTimer: () => TimerStartResult;
  stopTimer: () => Promise<void>;
  deleteTask: (id: string) => Promise<DeleteActionResult>;
  deleteTaskGroup: (id: string) => Promise<DeleteActionResult>;
};

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

async function refreshState(
  set: (partial: Partial<AppState>) => void,
  get: () => AppState,
) {
  const [taskGroups, taskGroupSummaries, tasks, workSessions, preferences] = await Promise.all([
    listTaskGroups(),
    listTaskGroupSummaries(),
    listTasks(),
    listWorkSessions(),
    getUserPreferences(),
  ]);

  const previousSelectedTaskId = get().selectedTimerTaskId;
  const selectedTimerTaskId = previousSelectedTaskId && tasks.some((task) => task.id === previousSelectedTaskId)
    ? previousSelectedTaskId
    : null;

  set({
    taskGroups,
    taskGroupSummaries,
    tasks,
    workSessions,
    preferences,
    selectedTimerTaskId,
    hydrated: true,
  });
}

export const useAppStore = create<AppState>((set, get) => ({
  hydrated: false,
  taskGroups: [],
  taskGroupSummaries: [],
  tasks: [],
  workSessions: [],
  preferences: null,
  activeTimer: null,
  selectedTimerTaskId: null,
  async hydrate() {
    await ensureUserPreferences();
    const legacyBundle = await loadLegacyImportBundle();
    const hasLocalData = (await listTasks()).length > 0 || (await listTaskGroups()).length > 0;

    if (!hasLocalData && legacyBundle) {
      for (const taskGroup of legacyBundle.taskGroups) {
        await upsertTaskGroup(taskGroup);
      }

      for (const task of legacyBundle.tasks) {
        await upsertTask(task);
      }
    }

    await refreshState(set, get);
  },
  async refresh() {
    await refreshState(set, get);
  },
  async createTaskGroup(input) {
    const parsed = parseTaskGroupInput(input);
    const now = new Date().toISOString();
    const currentSortOrder = get().taskGroups.length;

    await upsertTaskGroup({
      id: createId("group"),
      name: parsed.name,
      colorToken: parsed.colorToken,
      sortOrder: currentSortOrder,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      syncStatus: "pending_upsert",
      lastSyncedAt: null,
    });

    await refreshState(set, get);
  },
  async updateTaskGroup(id, input) {
    const parsed = parseTaskGroupInput(input);
    const existing = get().taskGroups.find((group) => group.id === id);
    if (!existing) {
      return;
    }

    await upsertTaskGroup({
      ...existing,
      name: parsed.name,
      colorToken: parsed.colorToken,
      updatedAt: new Date().toISOString(),
      syncStatus: "pending_upsert",
    });

    await refreshState(set, get);
  },
  async createTask(input) {
    const parsed = parseTaskInput(input);
    const now = new Date().toISOString();

    await upsertTask({
      id: createId("task"),
      taskGroupId: parsed.taskGroupId,
      title: parsed.title,
      notes: parsed.notes ?? null,
      value: parsed.value,
      estimatedTimeSeconds: parsed.estimatedTimeSeconds,
      workedTimeSeconds: parsed.workedTimeSeconds ?? 0,
      scheduledStartDate: parsed.scheduledStartDate ?? null,
      scheduledEndDate: parsed.scheduledEndDate ?? null,
      isCompleted: parsed.isCompleted ?? false,
      completedAt: parsed.completedAt ?? null,
      isPriority: parsed.isPriority ?? false,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      syncStatus: "pending_upsert",
      lastSyncedAt: null,
    });

    await refreshState(set, get);
  },
  async updateTask(id, input) {
    const parsed = parseTaskInput(input);
    const existing = get().tasks.find((task) => task.id === id);
    if (!existing) {
      return;
    }

    await upsertTask({
      ...existing,
      taskGroupId: parsed.taskGroupId,
      title: parsed.title,
      notes: parsed.notes ?? null,
      value: parsed.value,
      estimatedTimeSeconds: parsed.estimatedTimeSeconds,
      workedTimeSeconds: parsed.workedTimeSeconds ?? existing.workedTimeSeconds,
      scheduledStartDate: parsed.scheduledStartDate ?? null,
      scheduledEndDate: parsed.scheduledEndDate ?? null,
      isCompleted: parsed.isCompleted ?? existing.isCompleted,
      completedAt: parsed.isCompleted ? parsed.completedAt ?? existing.completedAt ?? new Date().toISOString() : null,
      isPriority: parsed.isPriority ?? false,
      updatedAt: new Date().toISOString(),
      syncStatus: "pending_upsert",
    });

    await refreshState(set, get);
  },
  async toggleTaskCompletion(id) {
    const existing = await getTaskById(id);
    if (!existing) {
      return;
    }

    const isCompleted = !existing.isCompleted;
    await upsertTask({
      ...existing,
      isCompleted,
      completedAt: isCompleted ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
      syncStatus: "pending_upsert",
    });

    await refreshState(set, get);
  },
  async savePreferences(patch) {
    const current = (await getUserPreferences()) ?? (await ensureUserPreferences());
    await upsertUserPreferences({
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
      syncStatus: "pending_upsert",
    });

    await refreshState(set, get);
  },
  selectTimerTask(taskId) {
    if (get().activeTimer) {
      return;
    }

    set({ selectedTimerTaskId: taskId });
  },
  startTimer() {
    if (get().activeTimer) {
      return { ok: false, reason: "active_timer_exists" };
    }

    const selectedTaskId = get().selectedTimerTaskId;
    if (!selectedTaskId) {
      return { ok: false, reason: "selection_required" };
    }

    const selectedTask = get().tasks.find((task) => task.id === selectedTaskId);
    if (!selectedTask) {
      set({ selectedTimerTaskId: null });
      return { ok: false, reason: "task_missing" };
    }

    set({ activeTimer: createActiveTimer(selectedTaskId) });
    return { ok: true, taskId: selectedTaskId };
  },
  async stopTimer() {
    const timer = get().activeTimer;
    if (!timer) {
      return;
    }

    const endedAt = new Date();
    const durationSeconds = calculateElapsedSeconds(timer, endedAt);
    const now = endedAt.toISOString();

    await upsertWorkSession({
      id: createId("session"),
      taskId: timer.taskId,
      startedAt: timer.startedAt,
      endedAt: now,
      durationSeconds,
      source: "timer",
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      syncStatus: "pending_upsert",
      lastSyncedAt: null,
    });

    set({ activeTimer: null });
    await refreshState(set, get);
  },
  async deleteTask(id) {
    const guard = canDeleteTask(id, get().activeTimer);
    if (!guard.ok) {
      return guard;
    }

    await softDeleteTask(id);

    const selectedTimerTaskId = get().selectedTimerTaskId === id ? null : get().selectedTimerTaskId;
    set({ selectedTimerTaskId });
    await refreshState(set, get);
    return { ok: true };
  },
  async deleteTaskGroup(id) {
    const guard = canDeleteTaskGroup(id, get().tasks, get().activeTimer);
    if (!guard.ok) {
      return guard;
    }

    const selectedTask = get().tasks.find((task) => task.id === get().selectedTimerTaskId);
    await softDeleteTaskGroupCascade(id);

    if (selectedTask?.taskGroupId === id) {
      set({ selectedTimerTaskId: null });
    }

    await refreshState(set, get);
    return { ok: true };
  },
}));
