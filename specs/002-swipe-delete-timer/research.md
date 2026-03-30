# Research: Navigation, Deletion, and Timer Selection Improvements

## Decision 1: Keep swipe navigation limited to GENERAL and CALENDAR

- Decision: Reuse the existing horizontal swipe mechanism but scope it only to
  the clarified overview pair: `GENERAL <-> CALENDAR`.
- Rationale: The feature spec defines these as the two main screens in scope.
  Narrowing the gesture route set reduces accidental navigation and simplifies
  testing.
- Alternatives considered:
  - Keep swipe navigation across every tab. Rejected because it exceeds the
    clarified feature scope and increases gesture conflicts.
  - Add no swipe support. Rejected because it would fail FR-014 through FR-016.

## Decision 2: Model timer selection separately from the active timer

- Decision: Add explicit selected-task state for TIMER and keep it separate from
  the existing `activeTimer` snapshot.
- Rationale: The user must choose a task before starting a session, and the
  chosen task must remain immutable once timing begins.
- Alternatives considered:
  - Keep per-row start buttons only. Rejected because it bypasses the required
    explicit pre-selection flow.
  - Infer selection from the last tapped task without storing it. Rejected
    because the UI could not reliably show or validate the current choice.

## Decision 3: Prevent timer start until a task is selected

- Decision: `startTimer` should refuse to begin a new session unless a valid,
  non-deleted task is currently selected.
- Rationale: This enforces FR-001 through FR-004 and keeps recorded time
  attached to an intentional user choice.
- Alternatives considered:
  - Auto-select the first visible task. Rejected because it risks silent time
    attribution to the wrong task.
  - Allow a timer without task linkage. Rejected because it breaks progress
    accuracy and the core feature goal.

## Decision 4: Reuse soft-delete semantics rather than hard delete

- Decision: Task and task-group removal should mark rows with `deletedAt` and
  `syncStatus = pending_delete`.
- Rationale: The current repositories, schema, and sync design already assume
  soft deletes. Reusing that model avoids split behavior between create/update
  and delete flows.
- Alternatives considered:
  - Hard delete rows immediately. Rejected because it would complicate sync,
    reduce auditability, and diverge from the existing data model.

## Decision 5: Cascade task-group deletion to child tasks

- Decision: Deleting a task group should soft-delete the group and all active
  child tasks in one coordinated local operation.
- Rationale: The spec requires the group and all its tasks to disappear from
  active views in the same session. Cascading delete is the cleanest way to
  preserve that invariant.
- Alternatives considered:
  - Block group deletion until all tasks are removed manually. Rejected because
    it conflicts with the requested direct-removal workflow.
  - Delete only the group and orphan the tasks. Rejected because it would leave
    invalid task references and inconsistent UI behavior.

## Decision 6: Block deletes that target the currently timed task

- Decision: Prevent deletion of a timed task or its parent group until the
  active session is stopped.
- Rationale: This matches the spec and avoids undefined behavior where an active
  timer points at a deleted entity.
- Alternatives considered:
  - Auto-stop the timer on delete. Rejected because it hides a consequential
    action from the user and makes deletion side effects harder to reason about.
  - Allow the delete and repair later. Rejected because it introduces broken
    state into the active session flow.

## Decision 7: Expose delete actions only on clarified list-based screens

- Decision: Show task delete actions on GENERAL, PRIORITY, and TIMER, and show
  task-group delete actions on GENERAL only.
- Rationale: This is the clarified scope and covers every screen where those
  items are visibly listed.
- Alternatives considered:
  - Restrict deletes to GENERAL only. Rejected because it adds unnecessary
    navigation friction after the clarification step.
  - Add delete actions to CALENDAR. Rejected because CALENDAR shows counts, not
    task or group rows.

## Decision 8: Use confirmation dialogs for both task and task-group delete

- Decision: Both delete flows require an explicit confirmation step, with task
  group confirmation calling out that child tasks are affected.
- Rationale: The spec requires direct removal but also assumes protection
  against accidental taps on compact bin icons.
- Alternatives considered:
  - Single-tap delete. Rejected because small controls make accidental removal
    too likely.
  - Long-press delete. Rejected because it adds hidden interaction complexity.

## Decision 9: Keep backend and sync contracts unchanged

- Decision: This feature should not add backend routes or remote schema changes.
- Rationale: Swipe navigation, explicit timer selection, and UI-triggered soft
  deletes are fully supported by the existing local-first model and sync
  metadata.
- Alternatives considered:
  - Add dedicated delete or timer-selection sync contracts. Rejected because the
    existing entity sync model already carries updated and deleted rows.

## Decision 10: Prioritize regression testing around gesture conflicts and delete propagation

- Decision: Testing should focus on swipe false positives, task-group delete
  cascades, and correct timer-session linkage to the selected task.
- Rationale: These are the highest-risk behavior changes because they affect
  cross-screen navigation, destructive actions, and progress correctness.
- Alternatives considered:
  - UI-only smoke coverage. Rejected because it would miss repository and store
    regressions beneath the screen layer.
