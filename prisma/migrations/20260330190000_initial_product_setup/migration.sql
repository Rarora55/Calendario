CREATE TYPE "WorkSessionSource" AS ENUM ('timer', 'manual_adjustment');

CREATE TABLE "task_groups" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "colorToken" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "task_groups_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tasks" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "taskGroupId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "notes" TEXT,
  "value" INTEGER NOT NULL,
  "estimatedTimeSeconds" INTEGER NOT NULL,
  "workedTimeSeconds" INTEGER NOT NULL,
  "scheduledStartDate" TEXT,
  "scheduledEndDate" TEXT,
  "isCompleted" BOOLEAN NOT NULL,
  "completedAt" TIMESTAMP(3),
  "isPriority" BOOLEAN NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "work_sessions" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL,
  "endedAt" TIMESTAMP(3) NOT NULL,
  "durationSeconds" INTEGER NOT NULL,
  "source" "WorkSessionSource" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "work_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_preferences" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "theme" TEXT NOT NULL,
  "language" TEXT NOT NULL,
  "urgencyWindowDays" INTEGER NOT NULL,
  "linkedAuthUserId" TEXT,
  "linkedAuthProvider" TEXT,
  "lastSyncAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "task_groups_userId_name_key" ON "task_groups"("userId", "name");
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");
CREATE INDEX "task_groups_userId_updatedAt_idx" ON "task_groups"("userId", "updatedAt");
CREATE INDEX "task_groups_userId_deletedAt_idx" ON "task_groups"("userId", "deletedAt");
CREATE INDEX "tasks_userId_taskGroupId_idx" ON "tasks"("userId", "taskGroupId");
CREATE INDEX "tasks_userId_updatedAt_idx" ON "tasks"("userId", "updatedAt");
CREATE INDEX "tasks_userId_deletedAt_idx" ON "tasks"("userId", "deletedAt");
CREATE INDEX "work_sessions_userId_taskId_idx" ON "work_sessions"("userId", "taskId");
CREATE INDEX "work_sessions_userId_updatedAt_idx" ON "work_sessions"("userId", "updatedAt");
CREATE INDEX "work_sessions_userId_deletedAt_idx" ON "work_sessions"("userId", "deletedAt");
CREATE INDEX "user_preferences_userId_updatedAt_idx" ON "user_preferences"("userId", "updatedAt");

ALTER TABLE "tasks"
ADD CONSTRAINT "tasks_taskGroupId_fkey"
FOREIGN KEY ("taskGroupId")
REFERENCES "task_groups"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "work_sessions"
ADD CONSTRAINT "work_sessions_taskId_fkey"
FOREIGN KEY ("taskId")
REFERENCES "tasks"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;
