# Quickstart: Navigation, Deletion, and Timer Selection Improvements

## Goal

Implement and verify the feature update that adds explicit timer task
selection, direct task and task-group deletion, and horizontal swipe navigation
between GENERAL and CALENDAR.

## 1. Prepare the Workspace

Use the existing repository setup and install dependencies if the environment is
not already prepared.

Primary commands for this feature:

```bash
npm run start
npm run web
npm run lint
npm run test
npm run test:e2e
npm run typecheck
```

## 2. Review the Current Touch Points

Before implementation, inspect these files:

- `src/state/store.ts`
- `src/hooks/useTabSwipeNavigation.ts`
- `src/screens/GeneralScreen.tsx`
- `src/screens/CalendarScreen.tsx`
- `src/screens/PrioritiesScreen.tsx`
- `src/screens/TimerScreen.tsx`
- `components/TaskRow.tsx`
- `components/TaskGroupCard.tsx`
- `src/db/repositories/taskRepository.ts`
- `src/db/repositories/taskGroupRepository.ts`
- `src/db/repositories/workSessionRepository.ts`

## 3. Implement the Behavior Changes

1. Add explicit timer-selection state and guarded timer-start behavior.
2. Add delete flows for tasks and task groups using soft-delete semantics.
3. Cascade task-group delete to child tasks.
4. Add visible bin controls and confirmation handling on the in-scope screens.
5. Restrict and wire horizontal swipe navigation to `GENERAL <-> CALENDAR`.

## 4. Verify the Main Flows Manually

### Timer Selection

1. Open TIMER.
2. Confirm the timer cannot start before a task is selected.
3. Select a task, start the timer, and stop it.
4. Verify the resulting worked time updates only on that task.

### Direct Deletion

1. Delete a task from GENERAL and confirm it disappears immediately.
2. Delete a task from PRIORITY and confirm it disappears immediately.
3. Delete a task from TIMER and confirm it is removed from timer options.
4. Delete a task group from GENERAL and confirm the group and child tasks
   disappear from GENERAL, PRIORITY, TIMER, CALENDAR counts, and REPORTS.

### Delete Guard

1. Start a timer for a task.
2. Attempt to delete that task.
3. Attempt to delete its parent task group.
4. Confirm both delete actions are blocked until the timer stops.

### Swipe Navigation

1. Open GENERAL and swipe left to CALENDAR.
2. Open CALENDAR and swipe right to GENERAL.
3. Scroll vertically on both screens and confirm no unintended swipe navigation
   occurs.

## 5. Run Automated Coverage

Expected automated coverage for this feature:

- Unit: swipe route targeting, timer-selection state, delete guard logic
- Integration: task soft-delete, task-group cascade delete, selected-task timer
  session persistence
- E2E: timer selection flow, delete flows, and GENERAL/CALENDAR swipe behavior

Run:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
```

## 6. Definition of Ready for Task Generation

Proceed to `/speckit.tasks` once:

- The implementation plan matches the clarified feature scope.
- Delete behavior is defined for every required screen.
- Timer-selection and delete-guard rules are explicit.
- Swipe behavior is limited to the intended overview pair.
- Required tests are identified across unit, integration, and E2E levels.
