# Implementation Plan: Navigation, Deletion, and Timer Selection Improvements

**Branch**: `002-swipe-delete-timer` | **Date**: 2026-03-30 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-swipe-delete-timer/spec.md`

## Summary

Refine the current local-first task workflow by adding explicit timer task
selection, direct soft-delete actions for visible task and task-group rows, and
horizontal swipe navigation between GENERAL and CALENDAR. The implementation
will stay inside the existing Expo Router, Zustand, and SQLite architecture,
reuse the current soft-delete and timer session model, and avoid backend or sync
protocol changes.

## Technical Context

**Language/Version**: TypeScript on Expo/React Native 0.81 + Expo Router 6, with existing backend TypeScript-compatible services unchanged for this feature  
**Primary Dependencies**: React Native, Expo, Expo Router, Zustand, Expo SQLite, Supabase, Express, Prisma  
**Storage**: SQLite-backed local business data with existing sync metadata; transient timer/swipe UI state in Zustand memory  
**Testing**: Jest, React Native Testing Library, Playwright  
**Target Platform**: Android, iOS, and supported Expo web surfaces  
**Project Type**: Mobile-first application with local-first task management flows  
**Performance Goals**: Swipe transitions should feel immediate (<100 ms perceived response after gesture release), task/group deletion should disappear from active views in the same session, and timer selection/start-stop should update visible state without a manual refresh  
**Constraints**: Clean Code, SOLID, DRY, KISS, simple responsive UX, no unnecessary dependencies, local-first behavior, soft-delete sync semantics, active-timer safety on delete, and no regression to vertical scrolling behavior  
**Scale/Scope**: Touch 4 user-facing screens (`GENERAL`, `CALENDAR`, `PRIORITY`, `TIMER`), 2 shared row/card components, 1 swipe hook, the central Zustand store, and the existing task/task-group/work-session repositories

## Constitution Check

*GATE: Passed before Phase 0 research. Re-checked after Phase 1 design.*

- Pass: The plan stays inside the mandated stack and reuses the existing Expo, Zustand, SQLite, and routing foundations.
- Pass: Business data remains local-first; deletes and timer writes continue to originate in SQLite before any later sync.
- Pass: No new dependency is required for swipe, delete, or timer-selection behavior.
- Pass: The plan includes explicit unit, integration, and E2E coverage for the new behavior.
- Pass: The UX remains simple, touch-friendly, and responsive across the affected screens.

## Project Structure

### Documentation (this feature)

```text
specs/002-swipe-delete-timer/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- ui-interaction-contracts.md
`-- tasks.md
```

### Source Code (repository root)

```text
app/
|-- tabs/
|   |-- index.tsx
|   |-- calendars.tsx
|   |-- priorities.tsx
|   `-- timer.tsx
components/
|-- TaskGroupCard.tsx
`-- TaskRow.tsx
src/
|-- db/
|   `-- repositories/
|-- features/
|   |-- timer/
|   `-- shared/
|-- hooks/
|   `-- useTabSwipeNavigation.ts
|-- screens/
|   |-- GeneralScreen.tsx
|   |-- CalendarScreen.tsx
|   |-- PrioritiesScreen.tsx
|   `-- TimerScreen.tsx
`-- state/
    `-- store.ts
tests/
|-- unit/
|-- integration/
`-- e2e/
```

**Structure Decision**: Keep route entrypoints in `app/`, screen composition in
`src/screens/`, reusable row/card UI in `components/`, persistence and soft-delete
logic in `src/db/repositories/`, ephemeral selection/timer coordination in
`src/state/store.ts`, and automated coverage in the existing `tests/` split.

## Technical Architecture

### UI Interaction Architecture

- `GENERAL` remains the primary place for task-group cards and nested task rows.
- `PRIORITY` and `TIMER` reuse task-row presentation semantics so task deletion
  behaves consistently wherever tasks are visible.
- `CALENDAR` participates only in horizontal swipe navigation; it does not gain
  direct delete controls in this feature.
- Delete interactions will use a small bin control per in-scope row plus a
  confirmation step before any soft-delete mutation is committed.

### State and Persistence Architecture

- Add explicit timer-selection state in Zustand, separate from the active timer
  snapshot, so a task can be selected before a session begins.
- Keep `activeTimer.taskId` immutable for the life of the running session.
- Reuse existing `deletedAt` and `syncStatus = pending_delete` semantics for
  both task and task-group deletion rather than introducing hard deletes.
- Implement task-group deletion as a local transactional cascade that marks the
  group and all active child tasks deleted in the same write cycle.
- Keep work-session persistence unchanged: stopping a timer still inserts a
  `WorkSession` row and recomputes `worked_time_seconds` for the chosen task.

### Navigation Architecture

- Reuse `useTabSwipeNavigation` rather than introducing a new gesture library.
- Narrow swipe scope to the clarified screen pair: `GENERAL <-> CALENDAR`.
- Attach swipe handlers where they do not interfere with ordinary vertical
  scrolling in the screen body.
- Preserve tab-based navigation as the primary stable fallback path.

### Sync and Backend Impact

- No new backend endpoints or remote schema changes are required.
- Pending-delete rows should continue to flow through the existing sync model.
- This feature is entirely compatible with the current local-first + later-sync
  approach as long as delete cascades mark all affected rows consistently.

## Dependency Decisions

| Dependency / Package Class | Status | Why It Is Needed | Why Simpler Was Rejected |
|----------------------------|--------|------------------|--------------------------|
| Existing `react-native` gesture primitives | Reuse | Already sufficient for horizontal swipe detection and gesture thresholds | Adding a gesture library would increase complexity for a narrow screen pair |
| Existing Zustand store | Reuse | Already coordinates hydration and active timer state | Adding a second state layer would violate simplicity goals |
| Existing SQLite repositories | Reuse and extend | Already own task, task-group, and work-session persistence | Bypassing repositories in UI code would weaken consistency and testability |

No new dependency is justified for this feature update.

## Implementation Phases

### Phase 0: Behavior Decisions and Research

- Finalize the UI-scope decisions for swipe targets, delete visibility, delete
  blocking, and timer selection persistence.
- Confirm the safest local-first pattern for cascading task-group deletes and
  immutable timer-session task linkage.

### Phase 1: State and Repository Changes

- Extend the app store with explicit selected-task timer state and guarded
  timer-start actions.
- Add repository/store delete flows for tasks and task groups using
  `deletedAt`/`pending_delete`.
- Ensure task-group delete cascades mark descendant tasks deleted in the same
  local transaction or coordinated write path.

### Phase 2: Screen and Component Updates

- Update `TimerScreen` to support selecting a task before start, identifying the
  selected task clearly, and locking selection changes during an active session.
- Add bin-icon delete actions to `TaskRow` and `TaskGroupCard`.
- Thread delete handlers through `GeneralScreen`, `PrioritiesScreen`, and
  `TimerScreen`.
- Apply horizontal swipe navigation only to `GENERAL` and `CALENDAR`.

### Phase 3: Quality Hardening

- Add unit coverage for timer-selection, delete guards, and swipe-target
  resolution.
- Add integration coverage for soft-delete persistence, cascade delete, and
  timer stop/write correctness after explicit selection.
- Add E2E coverage for the visible user flows across GENERAL, CALENDAR,
  PRIORITY, and TIMER.
- Run lint, tests, and typecheck before task generation or implementation signoff.

## Testing Strategy

### Unit Tests

- Swipe route selection and horizontal-dominance threshold behavior for
  `GENERAL <-> CALENDAR`.
- Timer selection state transitions: select, start, block-start-without-selection,
  lock-during-active-session, and post-stop behavior.
- Delete guard rules for active timed tasks and parent task groups.

### Integration Tests

- Task soft-delete persistence and exclusion from active repository queries.
- Task-group cascade delete marking the group and child tasks deleted together.
- Timer stop flow writing a `WorkSession` against the selected task and updating
  that task's cached worked time only.
- Store refresh behavior after delete and timer mutations across affected screens.

### End-to-End Tests

- Select a task in TIMER, start the timer, stop it, and verify worked time
  updates on the intended task.
- Delete a task from GENERAL, PRIORITY, and TIMER and confirm it disappears from
  active views.
- Delete a task group from GENERAL and confirm the group plus child tasks vanish
  from GENERAL, TIMER, PRIORITY, and REPORTS.
- Swipe from GENERAL to CALENDAR and back without accidental navigation during
  normal vertical scrolling.

## Current-State Impact

- `useTabSwipeNavigation` currently includes routes outside the clarified scope
  and is not yet wired into the screen surfaces; this feature should tighten its
  route model and actual usage.
- `TimerScreen` currently exposes per-task start buttons rather than an explicit
  pre-selection flow; this needs a stateful selection-first interaction.
- `TaskRow` and `TaskGroupCard` currently expose edit/complete actions but no
  direct delete affordance; they need a bin control and confirmation integration.
- The store currently supports create/update/toggle/start/stop but not delete or
  selected-timer-task state; those gaps are the main implementation delta.

## Post-Design Constitution Check

- Pass: The design uses the existing mandated client stack with no replacement
  or exception.
- Pass: All meaningful changes still originate in local persistence and state.
- Pass: No new dependency is introduced for gestures, confirmation, or deletion.
- Pass: The plan explicitly requires unit, integration, and E2E coverage.
- Pass: The feature keeps the UI focused, lightweight, and responsive.

## Complexity Tracking

No constitution violations are currently justified by this plan.
