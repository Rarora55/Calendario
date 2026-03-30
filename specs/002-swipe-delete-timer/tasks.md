# Tasks: Navigation, Deletion, and Timer Selection Improvements

**Input**: Design documents from `/specs/002-swipe-delete-timer/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md), [contracts/ui-interaction-contracts.md](./contracts/ui-interaction-contracts.md)

**Tests**: Tests are MANDATORY. This feature requires unit, integration, and
end-to-end coverage using Jest, React Native Testing Library, and Playwright.

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel when dependencies are already complete
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare reusable test scaffolding and feature-specific helpers

- [x] T001 Align feature-specific test setup and custom matchers in `tests/setup/jest.setup.ts`
- [x] T002 [P] Create reusable task/group/session fixtures for this feature in `tests/fixtures/swipeDeleteTimerFixtures.ts`
- [x] T003 [P] Create Playwright seeding and navigation helpers for this feature in `tests/e2e/swipe-delete-timer.helpers.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core store, repository, and shared-contract work that all user stories depend on

**CRITICAL**: No user story work should begin until this phase is complete

- [x] T004 Add timer-selection and delete-request shared types in `src/features/shared/types.ts`
- [x] T005 [P] Add task soft-delete repository operations in `src/db/repositories/taskRepository.ts`
- [x] T006 [P] Add task-group soft-delete and child-cascade repository operations in `src/db/repositories/taskGroupRepository.ts`
- [x] T007 [P] Add active-timer delete guard helpers in `src/features/tasks/deleteGuards.ts`
- [x] T008 Extend Zustand state and actions for selected timer task and delete flows in `src/state/store.ts`

**Checkpoint**: Shared timer-selection, delete, and repository primitives are ready

---

## Phase 3: User Story 1 - Start the Timer for the Right Task (Priority: P1)

**Goal**: Let users explicitly choose a task before starting the timer and keep
the recorded work session linked to that chosen task.

**Independent Test**: Open TIMER, select one task, start and stop the timer,
then confirm the worked time updates only on the selected task and the timer
cannot start without a selection.

### Tests for User Story 1

> **NOTE: Write these tests FIRST and ensure they FAIL before implementation**

- [x] T009 [P] [US1] Add unit tests for timer selection state and start guards in `tests/unit/timer/timerSelectionState.test.ts`
- [x] T010 [P] [US1] Add integration coverage for selected-task timer persistence in `tests/integration/store/timerSelectionFlow.test.ts`
- [x] T011 [P] [US1] Add Playwright coverage for explicit timer task selection in `tests/e2e/timer-selection.spec.ts`

### Implementation for User Story 1

- [x] T012 [P] [US1] Refine active timer helper behavior for selected-task linkage in `src/features/timer/activeTimer.ts`
- [x] T013 [US1] Implement selected-task timer actions and guardrails in `src/state/store.ts`
- [x] T014 [US1] Implement selected-task timer UI, empty state, and locked active-session behavior in `src/screens/TimerScreen.tsx`

**Checkpoint**: User Story 1 is functional and independently testable

---

## Phase 4: User Story 2 - Delete Tasks and Task Groups Directly (Priority: P2)

**Goal**: Let users remove visible tasks and task groups directly from in-scope
screens while protecting active timer sessions and cascading group removal.

**Independent Test**: From GENERAL, PRIORITY, and TIMER, delete a visible task,
and from GENERAL delete a task group with tasks; confirm each removal disappears
from active views and that active-timer deletes are blocked.

### Tests for User Story 2

- [x] T015 [P] [US2] Add unit tests for delete guards and removal rules in `tests/unit/tasks/deleteGuards.test.ts`
- [x] T016 [P] [US2] Add integration tests for task soft-delete and task-group cascade delete in `tests/integration/repositories/taskDeletionFlows.test.ts`
- [x] T017 [P] [US2] Add Playwright coverage for direct delete actions in `tests/e2e/direct-delete-actions.spec.ts`

### Implementation for User Story 2

- [x] T018 [P] [US2] Add task-row bin actions, accessibility labels, and confirmation wiring in `components/TaskRow.tsx`
- [x] T019 [P] [US2] Add task-group bin actions, accessibility labels, and confirmation wiring in `components/TaskGroupCard.tsx`
- [x] T020 [US2] Wire task and task-group delete flows through `src/screens/GeneralScreen.tsx`
- [x] T021 [US2] Wire task delete flows and active-timer delete guards through `src/screens/PrioritiesScreen.tsx` and `src/screens/TimerScreen.tsx`
- [x] T022 [US2] Finalize store-backed task and task-group delete behavior in `src/state/store.ts`

**Checkpoint**: User Stories 1 and 2 both work independently

---

## Phase 5: User Story 3 - Swipe Between the Main Overview Screens (Priority: P3)

**Goal**: Add horizontal swipe navigation between GENERAL and CALENDAR without
breaking ordinary vertical scrolling.

**Independent Test**: From GENERAL, swipe left to CALENDAR and from CALENDAR
swipe right to GENERAL while verifying that normal vertical scrolling does not
trigger unintended navigation.

### Tests for User Story 3

- [x] T023 [P] [US3] Add unit tests for swipe target resolution and gesture thresholds in `tests/unit/navigation/useTabSwipeNavigation.test.ts`
- [x] T024 [P] [US3] Add integration tests for GENERAL and CALENDAR swipe behavior in `tests/integration/screens/overviewSwipeNavigation.test.ts`
- [x] T025 [P] [US3] Add Playwright coverage for overview swipe navigation in `tests/e2e/overview-swipe-navigation.spec.ts`

### Implementation for User Story 3

- [x] T026 [US3] Narrow swipe route handling to GENERAL and CALENDAR in `src/hooks/useTabSwipeNavigation.ts`
- [x] T027 [US3] Attach swipe navigation handlers to `src/screens/GeneralScreen.tsx` and `src/screens/CalendarScreen.tsx`

**Checkpoint**: All user stories are now independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Stabilize behavior that spans multiple stories and confirm the documented flow

- [x] T028 [P] Add regression coverage for deletion impact on calendar and report projections in `tests/integration/store/deletionProjectionRegression.test.ts`
- [x] T029 [P] Polish touch targets, confirmation copy, and accessibility labels in `components/TaskRow.tsx`, `components/TaskGroupCard.tsx`, and `src/screens/TimerScreen.tsx`
- [ ] T030 Run feature validation commands and update implementation notes in `specs/002-swipe-delete-timer/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup** has no dependencies and can begin immediately.
- **Phase 2: Foundational** depends on Phase 1 and blocks all user story work.
- **Phase 3: US1** depends on Phase 2.
- **Phase 4: US2** depends on Phase 2 and reuses the foundational delete/store primitives.
- **Phase 5: US3** depends on Phase 2 and can proceed after the foundational swipe helper work is ready.
- **Phase 6: Polish** depends on all desired user stories being complete.

### User Story Dependencies

- **US1 (P1)** is the recommended MVP and should be completed first.
- **US2 (P2)** depends on the foundational delete/store work from T005-T008 and benefits from the active-timer behavior stabilized in US1.
- **US3 (P3)** depends on T007-T008 only and can be implemented after US1 or in parallel with US2 if staffing allows.

### Within Each User Story

- Tests MUST be written and fail before implementation.
- Shared types and repository/store actions before screen wiring.
- Screen/component wiring before cross-screen regression validation.
- Story completion must preserve independent testability.

## Parallel Opportunities

### Setup

- T002 and T003 can run in parallel after T001.

### Foundational

- T005, T006, and T007 can run in parallel after T004.
- T008 depends on T004-T007.

### User Story 1

- T009, T010, and T011 can run in parallel.
- T012 can run alongside the test tasks.
- T013 depends on T012 and foundational completion.
- T014 depends on T013.

### User Story 2

- T015, T016, and T017 can run in parallel.
- T018 and T019 can run in parallel after foundational completion.
- T020 depends on T019 and T022.
- T021 depends on T018 and T022.
- T022 depends on T015-T016 and foundational completion.

### User Story 3

- T023, T024, and T025 can run in parallel.
- T026 must complete before T027.

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Deliver **US1** as the MVP so timer accuracy is fixed first.
3. Validate US1 with unit, integration, and E2E coverage before expanding scope.

### Incremental Delivery

1. Add **US2** next to unlock direct task and task-group cleanup.
2. Add **US3** after the interaction model is stable, or in parallel with US2 if staffing allows.
3. Finish with Phase 6 regression and quickstart validation.

### Verification Expectations

- Run `npm run lint`
- Run `npm run typecheck`
- Run `npm run test`
- Run `npm run test:e2e`

## Notes

- All delete operations should use soft-delete semantics already defined by the repository layer.
- No backend or sync endpoint work is required for this feature.
- Keep implementations simple and avoid new dependencies for gestures or confirmation flows.
