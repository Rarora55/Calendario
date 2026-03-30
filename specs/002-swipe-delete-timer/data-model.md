# Data Model: Navigation, Deletion, and Timer Selection Improvements

## Scope

This feature does not introduce new persisted business entities. It refines the
behavior of existing `TaskGroup`, `Task`, and `WorkSession` records and adds
ephemeral UI state for timer selection and delete confirmation.

## Modeling Conventions

- Persisted business records continue to use client-generated string IDs.
- Local deletion remains a soft-delete operation using `deletedAt` and
  `syncStatus = pending_delete`.
- Timer selection is UI state only and must not be stored as a durable database
  column.

## Entity: Task Group

### Relevant Persisted Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | Yes | Stable task-group identifier |
| `name` | string | Yes | Display label in GENERAL |
| `deletedAt` | datetime \| null | No | Set when the group is removed |
| `syncStatus` | enum | Yes | Must switch to `pending_delete` on delete |

### Feature-Specific Rules

- A task-group delete request must be confirmed before mutation.
- A task group cannot be deleted while the active timer is running against any
  child task in that group.
- Deleting a task group cascades soft-delete mutations to all non-deleted child
  tasks in the same local operation.

### Relationships

- One `TaskGroup` has many `Task` records.

## Entity: Task

### Relevant Persisted Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | Yes | Stable task identifier |
| `taskGroupId` | string | Yes | Parent task-group reference |
| `title` | string | Yes | Shown in GENERAL, PRIORITY, and TIMER |
| `workedTimeSeconds` | integer | Yes | Cached accumulated time |
| `deletedAt` | datetime \| null | No | Set on soft delete |
| `syncStatus` | enum | Yes | Must switch to `pending_delete` on delete |

### Feature-Specific Rules

- A visible task on GENERAL, PRIORITY, or TIMER exposes a delete action.
- A task delete request must be confirmed before mutation.
- A task cannot be deleted while it is the target of the active timer.
- Once deleted, the task must disappear from active task lists, calendar counts,
  timer options, and report calculations during the same session.

### Relationships

- Many `Task` rows belong to one `TaskGroup`.
- One `Task` has many `WorkSession` rows.

## Entity: Work Session

### Relevant Persisted Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | Yes | Stable session identifier |
| `taskId` | string | Yes | The task chosen when the timer began |
| `startedAt` | datetime | Yes | Session start |
| `endedAt` | datetime | Yes | Session end |
| `durationSeconds` | integer | Yes | Derived from elapsed time |

### Feature-Specific Rules

- A work session must always be linked to the selected task that was active at
  timer start.
- The linked task ID must not change while a session is running.
- Stopping the timer inserts the session and recalculates the selected task's
  cached worked time only.

## Ephemeral UI State: Timer Selection

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `selectedTaskId` | string \| null | No | Currently chosen task before start or after stop |
| `activeTimerTaskId` | string \| null | No | Mirrors the immutable task ID of the active timer |

### Rules

- `selectedTaskId` must reference a non-deleted task or be `null`.
- Starting a timer requires `selectedTaskId` to be non-null.
- While a timer is active, the selected task cannot be changed.
- If the selected task is deleted before a timer starts, `selectedTaskId` must
  be cleared immediately.

## Ephemeral UI State: Delete Confirmation Intent

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `entityType` | `"task"` \| `"taskGroup"` | Yes | Target kind |
| `entityId` | string | Yes | ID to remove |
| `sourceScreen` | `"general"` \| `"priority"` \| `"timer"` | Yes | Where the request originated |
| `blockedReason` | string \| null | No | Reason shown when delete is disallowed |

### Rules

- Delete confirmation must be explicit for both tasks and task groups.
- If `blockedReason` is present because of an active timer dependency, the
  destructive mutation must not proceed.

## State Transitions

### Timer Selection Lifecycle

1. `unselected`
2. `selected` after the user chooses a task in TIMER
3. `active` once the timer starts and the selected task becomes locked
4. `completed` when the timer stops and the work session is written
5. back to `selected` or `unselected` depending on whether the chosen task still
   exists in active state

### Task Delete Lifecycle

1. `visible`
2. `pending confirmation`
3. `blocked` if the active timer targets the task
4. `soft deleted` when `deletedAt` is set
5. excluded from all active selectors and UI lists

### Task Group Delete Lifecycle

1. `visible`
2. `pending confirmation`
3. `blocked` if the active timer targets any child task
4. `soft deleted with child cascade`
5. excluded from all active selectors and UI lists

## Derived View Impacts

- `TaskGroupSummary` excludes deleted groups and deleted child tasks.
- Priority selectors exclude deleted tasks immediately after delete.
- Timer task options exclude deleted tasks and tasks whose group is deleted.
- Calendar count projections exclude deleted tasks immediately after delete.
- Weekly report projections exclude deleted tasks and deleted sessions from
  active reporting calculations.
