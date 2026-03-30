export type SyncStatus = "synced" | "pending_upsert" | "pending_delete";
export type ThemePreference = "light" | "dark" | "system";
export type WorkSessionSource = "timer" | "manual_adjustment";
export type AuthProvider = "google";
export type TimerStartBlockedReason = "selection_required" | "task_missing" | "active_timer_exists";
export type DeleteBlockedReason = "active_timer_dependency";
export type DeleteEntityType = "task" | "taskGroup";
export type DeleteSourceScreen = "general" | "priority" | "timer";

export type SyncedRecordEnvelope = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
};

export type TaskGroupRecord = SyncedRecordEnvelope & {
  name: string;
  colorToken: string;
  sortOrder: number;
};

export type TaskRecord = SyncedRecordEnvelope & {
  taskGroupId: string;
  title: string;
  notes: string | null;
  value: number;
  estimatedTimeSeconds: number;
  workedTimeSeconds: number;
  scheduledStartDate: string | null;
  scheduledEndDate: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  isPriority: boolean;
};

export type WorkSessionRecord = SyncedRecordEnvelope & {
  taskId: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  source: WorkSessionSource;
};

export type UserPreferenceRecord = SyncedRecordEnvelope & {
  theme: ThemePreference;
  language: string;
  urgencyWindowDays: number;
  linkedAuthUserId: string | null;
  linkedAuthProvider: AuthProvider | null;
  lastSyncAt: string | null;
};

export type AuthIdentity = {
  userId: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  provider: AuthProvider;
};

export type AuthSession = {
  identity: AuthIdentity;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
};

export type TimerStartResult =
  | { ok: true; taskId: string }
  | { ok: false; reason: TimerStartBlockedReason };

export type DeleteActionResult =
  | { ok: true }
  | { ok: false; reason: DeleteBlockedReason };

export type DeleteRequest = {
  entityType: DeleteEntityType;
  entityId: string;
  sourceScreen: DeleteSourceScreen;
};

export type TaskReportState = "completed" | "in-progress" | "not-completed";

export type TaskGroupSummary = TaskGroupRecord & {
  taskCount: number;
  totalValue: number;
  totalEstimatedTimeSeconds: number;
  totalWorkedTimeSeconds: number;
  dateSpanStart: string | null;
  dateSpanEnd: string | null;
  progressStateSummary: {
    completed: number;
    inProgress: number;
    notCompleted: number;
  };
};

export type WeeklyReport = {
  weekStartDate: string;
  weekEndDate: string;
  includedTaskIds: string[];
  completedCount: number;
  inProgressCount: number;
  notCompletedCount: number;
  completedPercentage: number;
  inProgressPercentage: number;
  notCompletedPercentage: number;
  completedValueTotal: number;
  timeInvestedSeconds: number;
};

export type SyncPayload = {
  taskGroups: TaskGroupRecord[];
  tasks: TaskRecord[];
  workSessions: WorkSessionRecord[];
  preferences: UserPreferenceRecord[];
};

export const DEFAULT_THEME: ThemePreference = "system";
export const DEFAULT_LANGUAGE = "en";
export const DEFAULT_URGENCY_WINDOW_DAYS = 3;
