import { z } from "zod";

export const syncStatusSchema = z.enum(["synced", "pending_upsert", "pending_delete"]);
export const themePreferenceSchema = z.enum(["light", "dark", "system"]);
export const workSessionSourceSchema = z.enum(["timer", "manual_adjustment"]);

export const syncedRecordEnvelopeSchema = z.object({
  id: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable(),
  syncStatus: syncStatusSchema,
  lastSyncedAt: z.string().datetime().nullable(),
});

export const taskGroupRecordSchema = syncedRecordEnvelopeSchema.extend({
  name: z.string().trim().min(1).max(80),
  colorToken: z.string().trim().min(1),
  sortOrder: z.number().int().min(0),
});

export const taskRecordSchema = syncedRecordEnvelopeSchema
  .extend({
    taskGroupId: z.string().min(1),
    title: z.string().trim().min(1).max(160),
    notes: z.string().nullable(),
    value: z.number().int().min(0),
    estimatedTimeSeconds: z.number().int().min(0),
    workedTimeSeconds: z.number().int().min(0),
    scheduledStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
    scheduledEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
    isCompleted: z.boolean(),
    completedAt: z.string().datetime().nullable(),
    isPriority: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if ((value.scheduledStartDate && !value.scheduledEndDate) || (!value.scheduledStartDate && value.scheduledEndDate)) {
      ctx.addIssue({ code: "custom", message: "Scheduled dates must both be set or both be null." });
    }

    if (value.scheduledStartDate && value.scheduledEndDate && value.scheduledEndDate < value.scheduledStartDate) {
      ctx.addIssue({ code: "custom", message: "Scheduled end date cannot be before the start date." });
    }

    if (!value.isCompleted && value.completedAt) {
      ctx.addIssue({ code: "custom", message: "Incomplete tasks cannot have a completion timestamp." });
    }
  });

export const workSessionRecordSchema = syncedRecordEnvelopeSchema
  .extend({
    taskId: z.string().min(1),
    startedAt: z.string().datetime(),
    endedAt: z.string().datetime(),
    durationSeconds: z.number().int().min(0),
    source: workSessionSourceSchema,
  })
  .superRefine((value, ctx) => {
    if (new Date(value.endedAt).getTime() < new Date(value.startedAt).getTime()) {
      ctx.addIssue({ code: "custom", message: "Work session end must be after the start." });
    }
  });

export const userPreferenceRecordSchema = syncedRecordEnvelopeSchema.extend({
  theme: themePreferenceSchema,
  language: z.string().trim().min(2),
  urgencyWindowDays: z.number().int().min(0).max(30),
  linkedAuthUserId: z.string().nullable(),
  linkedAuthProvider: z.enum(["google"]).nullable(),
  lastSyncAt: z.string().datetime().nullable(),
});

export const taskGroupInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  colorToken: z.string().trim().min(1),
});

export const taskInputSchema = z
  .object({
    taskGroupId: z.string().trim().min(1),
    title: z.string().trim().min(1).max(160),
    notes: z.string().trim().max(2000).optional().nullable(),
    value: z.number().int().min(0),
    estimatedTimeSeconds: z.number().int().min(0),
    workedTimeSeconds: z.number().int().min(0).default(0),
    scheduledStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
    scheduledEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
    isCompleted: z.boolean().default(false),
    completedAt: z.string().datetime().optional().nullable(),
    isPriority: z.boolean().default(false),
  })
  .superRefine((value, ctx) => {
    if ((value.scheduledStartDate && !value.scheduledEndDate) || (!value.scheduledStartDate && value.scheduledEndDate)) {
      ctx.addIssue({ code: "custom", message: "Scheduled dates must both be set or both be null." });
    }

    if (value.scheduledStartDate && value.scheduledEndDate && value.scheduledEndDate < value.scheduledStartDate) {
      ctx.addIssue({ code: "custom", message: "Scheduled end date cannot be before the start date." });
    }
  });

export function parseTaskGroupInput(input: unknown) {
  return taskGroupInputSchema.parse(input);
}

export function parseTaskInput(input: unknown) {
  return taskInputSchema.parse(input);
}
