import { z } from "zod";

const isoDateTime = z.string().datetime();
const syncedRecordEnvelope = z.object({
  id: z.string().min(1),
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
  deletedAt: isoDateTime.nullable(),
});

export const taskGroupSchema = syncedRecordEnvelope.extend({
  name: z.string().trim().min(1).max(80),
  colorToken: z.string().trim().min(1),
  sortOrder: z.number().int().min(0),
});

export const taskSchema = syncedRecordEnvelope.extend({
  taskGroupId: z.string().min(1),
  title: z.string().trim().min(1).max(160),
  notes: z.string().nullable(),
  value: z.number().int().min(0),
  estimatedTimeSeconds: z.number().int().min(0),
  workedTimeSeconds: z.number().int().min(0),
  scheduledStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  scheduledEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  isCompleted: z.boolean(),
  completedAt: isoDateTime.nullable(),
  isPriority: z.boolean(),
});

export const workSessionSchema = syncedRecordEnvelope.extend({
  taskId: z.string().min(1),
  startedAt: isoDateTime,
  endedAt: isoDateTime,
  durationSeconds: z.number().int().min(0),
  source: z.enum(["timer", "manual_adjustment"]),
});

export const userPreferenceSchema = syncedRecordEnvelope.extend({
  theme: z.enum(["light", "dark", "system"]),
  language: z.string().trim().min(2),
  urgencyWindowDays: z.number().int().min(0).max(30),
  linkedAuthUserId: z.string().nullable(),
  linkedAuthProvider: z.enum(["google"]).nullable(),
  lastSyncAt: isoDateTime.nullable(),
});

export const syncPayloadSchema = z.object({
  taskGroups: z.array(taskGroupSchema),
  tasks: z.array(taskSchema),
  workSessions: z.array(workSessionSchema),
  preferences: z.array(userPreferenceSchema),
});

export const bootstrapRequestSchema = z.object({
  deviceId: z.string().min(1),
  requestedAt: isoDateTime,
  payload: syncPayloadSchema,
});

export const changesRequestSchema = z.object({
  deviceId: z.string().min(1),
  cursor: isoDateTime.nullish(),
  changes: syncPayloadSchema,
});
