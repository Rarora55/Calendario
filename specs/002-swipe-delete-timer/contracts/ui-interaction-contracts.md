# UI Interaction Contracts

## Scope

This feature adds UI-level contracts for explicit timer task selection, direct
delete actions, and horizontal swipe navigation between GENERAL and CALENDAR.
No backend or remote sync contract changes are required.

## Timer Selection Contract

```ts
export type TimerSelectionState = {
  selectedTaskId: string | null;
  activeTimerTaskId: string | null;
};

export interface TimerInteractionContract {
  selectTask(taskId: string): void;
  startSelectedTaskTimer(): void;
  stopActiveTimer(): Promise<void>;
}
```

### Rules

- `selectTask(taskId)` is only valid when no timer session is active.
- `startSelectedTaskTimer()` must fail fast when `selectedTaskId` is `null`.
- The started session must use the task ID that was selected at the moment of
  start.
- `stopActiveTimer()` writes a `WorkSession` for the active task and clears the
  active state.

## Delete Action Contract

```ts
export type DeleteSourceScreen = "general" | "priority" | "timer";

export type DeleteRequest =
  | {
      entityType: "task";
      entityId: string;
      sourceScreen: DeleteSourceScreen;
    }
  | {
      entityType: "taskGroup";
      entityId: string;
      sourceScreen: "general";
    };

export interface DeleteInteractionContract {
  requestDelete(input: DeleteRequest): Promise<DeleteGuardResult>;
  confirmDelete(input: DeleteRequest): Promise<void>;
}

export type DeleteGuardResult =
  | { allowed: true }
  | { allowed: false; reason: "active_timer_dependency" };
```

### Rules

- Every delete request must show confirmation before mutation.
- Task delete controls are available on GENERAL, PRIORITY, and TIMER.
- Task-group delete controls are available on GENERAL only.
- `confirmDelete()` for `taskGroup` must soft-delete the group and all active
  child tasks.
- If the active timer depends on the target task or one of the target group's
  child tasks, deletion must be blocked with `reason:
  "active_timer_dependency"`.

## Swipe Navigation Contract

```ts
export type SwipeOverviewRoute = "/tabs" | "/tabs/calendars";

export interface SwipeNavigationContract {
  canHandle(pathname: string): boolean;
  getSwipeTarget(pathname: SwipeOverviewRoute, direction: "left" | "right"): SwipeOverviewRoute | null;
}
```

### Rules

- A left swipe from `/tabs` targets `/tabs/calendars`.
- A right swipe from `/tabs/calendars` targets `/tabs`.
- Swipes on routes outside this pair must produce `null`.
- Predominantly vertical gestures must not trigger navigation.

## Visible Outcome Contract

| Interaction | Required visible result |
|-------------|-------------------------|
| Select timer task | Selected task is visibly identified before start |
| Start timer without selection | No session starts; user sees that selection is required |
| Delete task | Task disappears from active views in the same session |
| Delete task group | Group and child tasks disappear from active views in the same session |
| Delete blocked by active timer | No delete occurs; user sees the block reason |
| Swipe GENERAL left | CALENDAR opens |
| Swipe CALENDAR right | GENERAL opens |

## Non-Goals

- No new API route, sync payload, or Prisma contract is introduced here.
- No swipe contract is defined for PRIORITY, TIMER, REPORTS, or SETTINGS in this
  feature.
