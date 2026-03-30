import { PrismaClient } from "@prisma/client";

import { resolveMostRecentRecord } from "./conflictResolver.js";

const prisma = new PrismaClient();

type SyncPayload = {
  taskGroups: any[];
  tasks: any[];
  workSessions: any[];
  preferences: any[];
};

type UserContext = {
  userId: string;
};

async function upsertTaskGroups(userId: string, taskGroups: any[]) {
  const applied: any[] = [];
  for (const taskGroup of taskGroups) {
    const saved = await prisma.taskGroup.upsert({
      where: { id: taskGroup.id },
      update: {
        name: taskGroup.name,
        colorToken: taskGroup.colorToken,
        sortOrder: taskGroup.sortOrder,
        updatedAt: new Date(taskGroup.updatedAt),
        deletedAt: taskGroup.deletedAt ? new Date(taskGroup.deletedAt) : null,
      },
      create: {
        id: taskGroup.id,
        userId,
        name: taskGroup.name,
        colorToken: taskGroup.colorToken,
        sortOrder: taskGroup.sortOrder,
        createdAt: new Date(taskGroup.createdAt),
        updatedAt: new Date(taskGroup.updatedAt),
        deletedAt: taskGroup.deletedAt ? new Date(taskGroup.deletedAt) : null,
      },
    });

    applied.push(saved);
  }

  return applied;
}

async function upsertTasks(userId: string, tasks: any[]) {
  const applied: any[] = [];
  const conflicts: any[] = [];

  for (const task of tasks) {
    const existing = await prisma.task.findUnique({ where: { id: task.id } });
    if (existing) {
      const winner = resolveMostRecentRecord(
        { updatedAt: task.updatedAt, deletedAt: task.deletedAt },
        { updatedAt: existing.updatedAt.toISOString(), deletedAt: existing.deletedAt?.toISOString() ?? null },
      );

      if (winner.updatedAt !== task.updatedAt || winner.deletedAt !== task.deletedAt) {
        conflicts.push(existing);
        applied.push(existing);
        continue;
      }
    }

    const saved = await prisma.task.upsert({
      where: { id: task.id },
      update: {
        taskGroupId: task.taskGroupId,
        title: task.title,
        notes: task.notes,
        value: task.value,
        estimatedTimeSeconds: task.estimatedTimeSeconds,
        workedTimeSeconds: task.workedTimeSeconds,
        scheduledStartDate: task.scheduledStartDate,
        scheduledEndDate: task.scheduledEndDate,
        isCompleted: task.isCompleted,
        completedAt: task.completedAt ? new Date(task.completedAt) : null,
        isPriority: task.isPriority,
        updatedAt: new Date(task.updatedAt),
        deletedAt: task.deletedAt ? new Date(task.deletedAt) : null,
      },
      create: {
        id: task.id,
        userId,
        taskGroupId: task.taskGroupId,
        title: task.title,
        notes: task.notes,
        value: task.value,
        estimatedTimeSeconds: task.estimatedTimeSeconds,
        workedTimeSeconds: task.workedTimeSeconds,
        scheduledStartDate: task.scheduledStartDate,
        scheduledEndDate: task.scheduledEndDate,
        isCompleted: task.isCompleted,
        completedAt: task.completedAt ? new Date(task.completedAt) : null,
        isPriority: task.isPriority,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        deletedAt: task.deletedAt ? new Date(task.deletedAt) : null,
      },
    });

    applied.push(saved);
  }

  return { applied, conflicts };
}

async function upsertWorkSessions(userId: string, workSessions: any[]) {
  const applied: any[] = [];
  for (const workSession of workSessions) {
    const saved = await prisma.workSession.upsert({
      where: { id: workSession.id },
      update: {
        taskId: workSession.taskId,
        startedAt: new Date(workSession.startedAt),
        endedAt: new Date(workSession.endedAt),
        durationSeconds: workSession.durationSeconds,
        source: workSession.source,
        updatedAt: new Date(workSession.updatedAt),
        deletedAt: workSession.deletedAt ? new Date(workSession.deletedAt) : null,
      },
      create: {
        id: workSession.id,
        userId,
        taskId: workSession.taskId,
        startedAt: new Date(workSession.startedAt),
        endedAt: new Date(workSession.endedAt),
        durationSeconds: workSession.durationSeconds,
        source: workSession.source,
        createdAt: new Date(workSession.createdAt),
        updatedAt: new Date(workSession.updatedAt),
        deletedAt: workSession.deletedAt ? new Date(workSession.deletedAt) : null,
      },
    });
    applied.push(saved);
  }

  return applied;
}

async function upsertPreferences(userId: string, preferences: any[]) {
  const applied: any[] = [];
  for (const preference of preferences) {
    const saved = await prisma.userPreference.upsert({
      where: { id: preference.id },
      update: {
        theme: preference.theme,
        language: preference.language,
        urgencyWindowDays: preference.urgencyWindowDays,
        linkedAuthUserId: preference.linkedAuthUserId,
        linkedAuthProvider: preference.linkedAuthProvider,
        lastSyncAt: preference.lastSyncAt ? new Date(preference.lastSyncAt) : null,
        updatedAt: new Date(preference.updatedAt),
        deletedAt: preference.deletedAt ? new Date(preference.deletedAt) : null,
      },
      create: {
        id: preference.id,
        userId,
        theme: preference.theme,
        language: preference.language,
        urgencyWindowDays: preference.urgencyWindowDays,
        linkedAuthUserId: preference.linkedAuthUserId,
        linkedAuthProvider: preference.linkedAuthProvider,
        lastSyncAt: preference.lastSyncAt ? new Date(preference.lastSyncAt) : null,
        createdAt: new Date(preference.createdAt),
        updatedAt: new Date(preference.updatedAt),
        deletedAt: preference.deletedAt ? new Date(preference.deletedAt) : null,
      },
    });
    applied.push(saved);
  }

  return applied;
}

export async function bootstrapSync(user: UserContext, payload: SyncPayload) {
  const existingTaskGroupCount = await prisma.taskGroup.count({ where: { userId: user.userId } });
  if (existingTaskGroupCount > 0) {
    const error = new Error("Remote data already exists for this account.");
    (error as Error & { statusCode?: number }).statusCode = 409;
    throw error;
  }

  const [taskGroups, taskResult, workSessions, preferences] = await Promise.all([
    upsertTaskGroups(user.userId, payload.taskGroups),
    upsertTasks(user.userId, payload.tasks),
    upsertWorkSessions(user.userId, payload.workSessions),
    upsertPreferences(user.userId, payload.preferences),
  ]);

  const serverTime = new Date().toISOString();

  return {
    serverTime,
    bootstrapApplied: true,
    nextCursor: serverTime,
    authoritative: {
      taskGroups,
      tasks: taskResult.applied,
      workSessions,
      preferences,
    },
  };
}

export async function syncChanges(user: UserContext, payload: SyncPayload, cursor?: string | null) {
  const [taskGroups, taskResult, workSessions, preferences] = await Promise.all([
    upsertTaskGroups(user.userId, payload.taskGroups),
    upsertTasks(user.userId, payload.tasks),
    upsertWorkSessions(user.userId, payload.workSessions),
    upsertPreferences(user.userId, payload.preferences),
  ]);

  const cursorDate = cursor ? new Date(cursor) : null;
  const [remoteTaskGroups, remoteTasks, remoteWorkSessions, remotePreferences] = await Promise.all([
    prisma.taskGroup.findMany({ where: { userId: user.userId, ...(cursorDate ? { updatedAt: { gt: cursorDate } } : {}) } }),
    prisma.task.findMany({ where: { userId: user.userId, ...(cursorDate ? { updatedAt: { gt: cursorDate } } : {}) } }),
    prisma.workSession.findMany({ where: { userId: user.userId, ...(cursorDate ? { updatedAt: { gt: cursorDate } } : {}) } }),
    prisma.userPreference.findMany({ where: { userId: user.userId, ...(cursorDate ? { updatedAt: { gt: cursorDate } } : {}) } }),
  ]);

  const serverTime = new Date().toISOString();

  return {
    serverTime,
    nextCursor: serverTime,
    applied: {
      taskGroups,
      tasks: taskResult.applied,
      workSessions,
      preferences,
    },
    remoteChanges: {
      taskGroups: remoteTaskGroups,
      tasks: remoteTasks,
      workSessions: remoteWorkSessions,
      preferences: remotePreferences,
    },
    conflicts: {
      taskGroups: [],
      tasks: taskResult.conflicts,
      preferences: [],
    },
  };
}
