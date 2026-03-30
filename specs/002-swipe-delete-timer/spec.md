# Feature Specification: Navigation, Deletion, and Timer Selection Improvements

**Feature Branch**: `002-swipe-delete-timer`  
**Created**: 2026-03-30  
**Status**: Draft  
**Input**: User description: "navigation, deletion and timer selection improvements - implement horizontal swipe navigation between the two main screens so users can switch pages smoothly by scrolling left and right. Add a delete action for both tasks and task groups, using a small bin icon on each item to allow direct removal. Improve the TIMER flow by letting the user select a specific task before starting the timer, so recorded work time is linked to the correct task and progress tracking is more accurate."

## Clarifications

### Session 2026-03-30

- Q: Which screens must expose the new delete actions? -> A: Show delete icons on every visible task/group item in list-based screens: task groups on GENERAL, and tasks on GENERAL, PRIORITY, and TIMER.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start the Timer for the Right Task (Priority: P1)

As a user, I want to select a specific task before starting the timer so every
recorded work session is attached to the intended task and my progress metrics
stay trustworthy.

**Why this priority**: Accurate time attribution directly affects progress
tracking, reporting, and user confidence in the core work-logging flow.

**Independent Test**: Open TIMER, select one task, start and stop the timer,
then confirm the added worked time is applied only to the selected task and that
the timer cannot start without a selected task.

**Acceptance Scenarios**:

1. **Given** the user has at least one active task, **When** they select a task
   in TIMER and start then stop a session, **Then** the recorded work time is
   linked to that selected task and its progress totals update in the same
   session.
2. **Given** the user has opened TIMER but has not selected a task, **When**
   they attempt to start the timer, **Then** the app prevents the session from
   starting and clearly indicates that a task must be selected first.
3. **Given** the user has an active timed session, **When** they view TIMER,
   **Then** the currently tracked task remains clearly identified until the
   session is stopped.

---

### User Story 2 - Delete Tasks and Task Groups Directly (Priority: P2)

As a user, I want a direct delete action on tasks and task groups so I can
remove outdated items without opening a separate edit flow.

**Why this priority**: Quick removal keeps the workspace clean and prevents
obsolete tasks or empty structures from distorting planning and progress views.

**Independent Test**: From GENERAL, PRIORITY, and TIMER, delete a visible task,
and from GENERAL delete a task group containing tasks; confirm each action and
verify the removed items no longer appear in active views.

**Acceptance Scenarios**:

1. **Given** a task is visible on a task list, **When** the user taps its bin
   icon and confirms deletion, **Then** that task is removed from active task
   views and no longer contributes to planning or progress totals.
2. **Given** a task group with one or more tasks is visible, **When** the user
   taps the group's bin icon and confirms deletion, **Then** the task group and
   all tasks inside it are removed from active views together.
3. **Given** a timer is actively running for a task, **When** the user attempts
   to delete that task or its parent group, **Then** the app blocks the delete
   action until the running session is stopped and explains why.

---

### User Story 3 - Swipe Between the Main Overview Screens (Priority: P3)

As a user, I want to move left and right between the app's two main overview
screens so I can browse planning information more fluidly than tapping tab
controls each time.

**Why this priority**: Swipe navigation reduces friction during frequent
overview checks, but it is secondary to accurate time logging and direct item
management.

**Independent Test**: From GENERAL, swipe left to reach CALENDAR and from
CALENDAR swipe right to return to GENERAL, while confirming that ordinary
vertical scrolling still behaves normally.

**Acceptance Scenarios**:

1. **Given** the user is on GENERAL, **When** they perform a leftward horizontal
   swipe, **Then** the app navigates to CALENDAR.
2. **Given** the user is on CALENDAR, **When** they perform a rightward
   horizontal swipe, **Then** the app navigates back to GENERAL.
3. **Given** the user is scrolling vertically within either overview screen,
   **When** their gesture is predominantly vertical, **Then** the app does not
   trigger a page change.

### Edge Cases

- If TIMER has no active tasks to choose from, it must show a clear empty state
  and keep the start action unavailable.
- If the user deletes the currently selected timer task before starting a
  session, the selection must clear automatically and prompt the user to choose
  another task.
- If a task group is deleted, all tasks within that group must disappear from
  GENERAL, CALENDAR, PRIORITY, TIMER, and REPORTS in the same session.
- If a user swipes beyond the first or last screen in scope for this feature,
  the current screen must remain unchanged.
- Horizontal swipe navigation must not interfere with ordinary vertical reading
  and scrolling on long overview pages.
- Offline or delayed synchronization must not restore deleted items to active
  views after the user has already removed them locally.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The TIMER page MUST require the user to select a specific active
  task before a new timed session can begin.
- **FR-002**: The TIMER page MUST clearly display which task is currently
  selected before the timer starts and which task is being tracked while a
  session is active.
- **FR-003**: The system MUST prevent the timer from starting if no task has
  been selected.
- **FR-004**: When a timed session ends, the recorded worked time MUST be added
  only to the task that was selected when that session started.
- **FR-005**: The TIMER page MUST allow the user to change the selected task
  only when no timed session is currently running.
- **FR-006**: Each visible task item on GENERAL, PRIORITY, and TIMER MUST
  expose a direct delete control represented by a bin icon.
- **FR-007**: Each visible task group item on GENERAL MUST expose a direct
  delete control represented by a bin icon.
- **FR-008**: Deleting a task MUST require a confirmation step before the task
  is removed.
- **FR-009**: Deleting a task group MUST require a confirmation step that makes
  it clear the group's tasks will also be removed from active views.
- **FR-010**: When a task is deleted, it MUST stop appearing in active task,
  calendar, priority, timer, and reporting views during the same session.
- **FR-011**: When a task group is deleted, the group and all of its tasks MUST
  stop appearing in active task, calendar, priority, timer, and reporting views
  during the same session.
- **FR-012**: The system MUST block deletion of a task that is currently being
  timed until the active timed session has been stopped.
- **FR-013**: The system MUST block deletion of a task group when the currently
  timed task belongs to that group until the active timed session has been
  stopped.
- **FR-014**: GENERAL and CALENDAR MUST support direct horizontal swipe
  navigation between one another in both directions.
- **FR-015**: Swipe navigation between GENERAL and CALENDAR MUST preserve the
  user's place in the current session without requiring a manual reload or
  losing already visible data.
- **FR-016**: Swipe navigation MUST not trigger from gestures that are primarily
  vertical scrolling interactions.
- **FR-017**: Existing navigation access to GENERAL and CALENDAR MUST remain
  available in addition to the new swipe gesture.

### Technical Constraints *(mandatory)*

- **TC-001**: The feature MUST comply with the repository constitution and its
  mandated stack, quality gates, and dependency policy.
- **TC-002**: The experience MUST remain local-first so that timer selection,
  deletion, and navigation behavior remain usable when connectivity is limited.
- **TC-003**: The UX MUST remain simple, responsive, and touch-friendly on
  supported mobile and web surfaces.
- **TC-004**: The implementation plan and tasks MUST include unit,
  integration, and end-to-end coverage for timer selection, deletion behavior,
  and swipe navigation before the feature is considered complete.
- **TC-005**: Any additional dependency or interaction complexity introduced by
  these improvements MUST be explicitly justified in planning.

### Key Entities *(include if feature involves data)*

- **Task**: A planned unit of work that can be selected for timing, tracked for
  progress, and directly deleted from active views.
- **Task Group**: A container for related tasks that can be directly deleted
  together with all tasks it contains.
- **Work Session**: A recorded period of work time that must always be linked to
  one selected task.
- **Timer Selection State**: The current task choice shown in TIMER before or
  during an active work session.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can begin a timed session for an intended task from TIMER in
  15 seconds or less after opening the page.
- **SC-002**: 100% of timed sessions started through TIMER are associated with a
  user-selected task before recording begins.
- **SC-003**: Users can remove an unwanted task or task group in no more than
  two direct actions from the list surface: delete tap plus confirmation.
- **SC-004**: Users can move from GENERAL to CALENDAR and back with a single
  horizontal gesture per transition, without triggering unintended page changes
  during ordinary vertical scrolling.

## Assumptions

- For this feature, "the two main screens" refers to the GENERAL and CALENDAR
  overview screens.
- Direct deletion is intended to be fast but still protected by a confirmation
  step to reduce accidental removal.
- Deleting a task group also removes all tasks contained within that group from
  active product views.
- Delete controls are shown on every visible list-based task or group item
  included in this feature's scope: task groups on GENERAL, and tasks on
  GENERAL, PRIORITY, and TIMER.
- Existing tab-based or header-based navigation remains available; swipe
  navigation is an additional shortcut rather than a replacement.
- A task or task group that is currently involved in an active timed session
  cannot be deleted until that session is stopped.
