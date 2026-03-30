# Data Model: laboris Initial Product Setup

## Modeling Conventions

- IDs use client-generated string UUIDs so offline-created rows can sync later without remapping.
- Date-only scheduling fields use `YYYY-MM-DD`.
- All synced entities share `createdAt`, `updatedAt`, nullable `deletedAt`, `syncStatus`, and nullable `lastSyncedAt`.
- Local SQLite stores one active profile per installation. Remote PostgreSQL adds `userId` to every synced entity.

## Entity: Task Group

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | Yes | Client-generated UUID |
| `name` | string | Yes | 1-80 chars, unique per active user among non-deleted groups |
| `colorToken` | string | Yes | Pastel-safe theme token or hex color |
| `sortOrder` | integer | Yes | Stable display ordering in GENERAL |
| `createdAt` | datetime | Yes | Creation timestamp |
| `updatedAt` | datetime | Yes | Updated on every mutation |
| `deletedAt` | datetime \| null | No | Soft delete marker for sync |
| `syncStatus` | enum | Yes | `synced`, `pending_upsert`, `pending_delete` |
| `lastSyncedAt` | datetime \| null | No | Last successful sync time |

### Relationships

- One `TaskGroup` has many `Task` records.

### Derived Summary Fields

These are computed, not stored remotely as source-of-truth business columns:

- `taskCount`
- `totalValue`
- `totalEstimatedTimeSeconds`
- `totalWorkedTimeSeconds`
- `dateSpanStart`
- `dateSpanEnd`
- `progressStateSummary`

### Validation Rules

- Group name must be trimmed and non-empty.
- Soft-deleted groups cannot receive new tasks.
- A delete request for a group with active tasks should either cascade soft-delete tasks or be blocked by product rules; initial implementation should use cascade soft-delete to keep sync predictable.

## Entity: Task

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | Yes | Client-generated UUID |
| `taskGroupId` | string | Yes | FK to `TaskGroup.id` |
| `title` | string | Yes | 1-160 chars |
| `notes` | string | No | Optional free text |
| `value` | integer | Yes | Non-negative whole number |
| `estimatedTimeSeconds` | integer | Yes | Non-negative |
| `workedTimeSeconds` | integer | Yes | Cached accumulated time, non-negative |
| `scheduledStartDate` | string \| null | No | `YYYY-MM-DD` |
| `scheduledEndDate` | string \| null | No | `YYYY-MM-DD`, defaults to start date for single-day scheduling |
| `isCompleted` | boolean | Yes | Explicit user-controlled completion flag |
| `completedAt` | datetime \| null | No | Set when explicitly completed |
| `isPriority` | boolean | Yes | Explicit urgency designation |
| `createdAt` | datetime | Yes | Creation timestamp |
| `updatedAt` | datetime | Yes | Updated on every mutation |
| `deletedAt` | datetime \| null | No | Soft delete marker |
| `syncStatus` | enum | Yes | `synced`, `pending_upsert`, `pending_delete` |
| `lastSyncedAt` | datetime \| null | No | Last successful sync time |

### Relationships

- Many `Task` rows belong to one `TaskGroup`.
- One `Task` has many `WorkSession` rows.

### Derived State

`reportState` is derived and never stored independently:

1. `completed` when `isCompleted === true`
2. `in-progress` when `isCompleted === false` and (`workedTimeSeconds > 0` or `isPriority === true`)
3. `not-completed` otherwise

### Validation Rules

- `scheduledStartDate` and `scheduledEndDate` must either both be null or both be present.
- When present, `scheduledEndDate >= scheduledStartDate`.
- `completedAt` must be null when `isCompleted` is false.
- `workedTimeSeconds` must equal the cached sum of non-deleted work sessions for the task.

## Entity: Work Session

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | Yes | Client-generated UUID |
| `taskId` | string | Yes | FK to `Task.id` |
| `startedAt` | datetime | Yes | Actual session start |
| `endedAt` | datetime | Yes | Actual session end |
| `durationSeconds` | integer | Yes | Non-negative, derived from start/end on save |
| `source` | enum | Yes | `timer` or `manual_adjustment`; initial release should mainly use `timer` |
| `createdAt` | datetime | Yes | Row creation timestamp |
| `updatedAt` | datetime | Yes | Same as create unless edited later |
| `deletedAt` | datetime \| null | No | Soft delete marker if later session correction is supported |
| `syncStatus` | enum | Yes | `synced`, `pending_upsert`, `pending_delete` |
| `lastSyncedAt` | datetime \| null | No | Last successful sync time |

### Relationships

- Many `WorkSession` rows belong to one `Task`.

### Validation Rules

- `endedAt` must be greater than or equal to `startedAt`.
- `durationSeconds` must match the clamped difference between `endedAt` and `startedAt`.
- Sessions cannot be attached to a deleted task.

## Entity: User Preference

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | Yes | Single-row logical preference set per user/install |
| `theme` | enum | Yes | `light`, `dark`, or `system` if supported by UX choice |
| `language` | enum/string | Yes | Initial planned values: `en`, `es` |
| `urgencyWindowDays` | integer | Yes | Default `3`, minimum `0`, maximum `30` |
| `linkedAuthUserId` | string \| null | No | Supabase user id once linked |
| `linkedAuthProvider` | string \| null | No | `google` when attached |
| `lastSyncAt` | datetime \| null | No | Last successful sync completion |
| `createdAt` | datetime | Yes | Creation timestamp |
| `updatedAt` | datetime | Yes | Updated on every mutation |
| `deletedAt` | datetime \| null | No | Kept for LWW consistency even if rarely used |
| `syncStatus` | enum | Yes | `synced`, `pending_upsert`, `pending_delete` |
| `lastSyncedAt` | datetime \| null | No | Last successful row sync time |

### Validation Rules

- Preferences must always exist after first app launch and hydration.
- Theme and language changes must persist locally before any sync attempt.
- `linkedAuthUserId` is null until the user signs in.

## Derived Projection: Weekly Report Inputs

`WeeklyReport` is not a stored table. It is a deterministic projection built from task and work-session data for a selected calendar week.

| Field | Type | Source |
|-------|------|--------|
| `weekStartDate` | string | Selected week start (`YYYY-MM-DD`) |
| `weekEndDate` | string | Selected week end (`YYYY-MM-DD`) |
| `includedTaskIds` | string[] | Tasks scheduled, worked on, or completed during the week |
| `completedCount` | integer | Derived from included tasks |
| `inProgressCount` | integer | Derived from included tasks |
| `notCompletedCount` | integer | Derived from included tasks |
| `completedPercentage` | number | Count / total included tasks |
| `inProgressPercentage` | number | Count / total included tasks |
| `notCompletedPercentage` | number | Count / total included tasks |
| `completedValueTotal` | integer | Sum of `value` for completed tasks in the week |
| `timeInvestedSeconds` | integer | Sum of work-session durations inside the week |

### Inclusion Rules

- Include tasks that were scheduled in the week, had at least one work session in the week, or were completed in the week.
- If no task qualifies, all counts and percentages are zero and the UI renders the empty state.
- Percentages must sum to 100 only when at least one task is included; otherwise all percentages remain 0.

## Remote PostgreSQL Shape

The remote PostgreSQL schema mirrors the core entities with these additions:

- `user_id` on every synced table
- unique constraints scoped by `user_id`
- indexes on `updated_at`, `deleted_at`, `task_group_id`, `task_id`, and reporting date fields

## Migration Mapping From Current Domain

| Current Model | New Model | Notes |
|---------------|-----------|-------|
| `Calendar` | none or import metadata only | Visibility calendars are not part of the new domain |
| `CalendarEvent.label` | `TaskGroup.name` | Distinct labels become imported task groups |
| `CalendarEvent` | `Task` | Title, description, date span, and priority are mapped where meaningful |
| `CalendarEvent.priority === "alta"` | `Task.isPriority = true` | Lower legacy levels collapse to `false` |
| `binEvents` | `deletedAt` soft delete | Imported deleted records should remain deleted if migrated |
| Google local session | `UserPreference.linkedAuthUserId` plus SecureStore session | Auth token ownership moves to Supabase |

## State Transitions

### Task Lifecycle

1. `created`
2. `scheduled` or `unscheduled`
3. `in-progress` once any session exists or `isPriority` becomes true
4. `completed` when the user explicitly marks the task complete
5. `deleted` when `deletedAt` is set

### Sync Lifecycle

1. `synced`
2. `pending_upsert` after local create/update
3. `pending_delete` after local delete
4. back to `synced` after successful server acknowledgement

### Account Attachment Lifecycle

1. Anonymous local-only usage
2. Google sign-in through Supabase Auth
3. First-account bootstrap if remote dataset is empty
4. Ongoing incremental sync using the linked account
