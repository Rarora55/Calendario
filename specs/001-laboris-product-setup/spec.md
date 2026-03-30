# Feature Specification: labōris Initial Product Setup

**Feature Branch**: `001-laboris-product-setup`  
**Created**: 2026-03-27  
**Status**: Draft  
**Input**: User description: "Initial product setup for labōris, a task calendar,
task quantification, and weekly progress tracking application."

## Clarifications

### Session 2026-03-27

- Q: Should the app require Google sign-in before use, or stay usable offline first and attach account sync later? → A: The app works without sign-in; when the user later signs in with Google, their existing local data becomes the baseline for that account's sync data.
- Q: How should task status be managed for reporting and progress states? → A: `completed` is set manually, `in-progress` is inferred once any worked time is recorded or the task is marked priority, and otherwise the task is `not-completed`.
- Q: How should tasks with a scheduled date range appear in calendar counts? → A: A task with a date range counts as scheduled on every day in that range, inclusive.
- Q: How should synchronization conflicts be resolved when local and remote data differ? → A: On sync conflicts, the most recently updated version of a task, group, or preference wins automatically.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Organize Work by Groups and Tasks (Priority: P1)

As a user, I want to create task groups and tasks so I can organize my work,
estimate effort, and understand the value of what is planned.

**Why this priority**: Without task groups and tasks, the rest of the product
has nothing meaningful to display, prioritize, time, or report on.

**Independent Test**: Create one task group and several tasks with dates,
values, and estimated times; verify the General page shows the group, totals,
quick actions, and task counts correctly.

**Acceptance Scenarios**:

1. **Given** a user has no task groups, **When** they create a new group with a
   name and color, **Then** the group appears in GENERAL with its main
   attributes and a quick action to add tasks.
2. **Given** a user has a task group, **When** they create tasks inside it with
   a value, estimated time, and scheduled date, **Then** the group updates its
   task count, value summary, estimated time, date span, and progress status.

---

### User Story 2 - Plan, Prioritize, and Track Work Time (Priority: P2)

As a user, I want to see my tasks on a calendar, understand what is urgent, and
record the real time spent working so I can stay on top of deadlines and effort.

**Why this priority**: Once tasks exist, the next most valuable need is to know
when they happen, what requires attention now, and how much time is actually
being invested.

**Independent Test**: Create scheduled tasks with different deadlines and
priority flags, then verify the Calendar, Priority, and Timer pages update
correctly as tasks are worked on.

**Acceptance Scenarios**:

1. **Given** a month with scheduled tasks, **When** the user opens CALENDAR,
   **Then** each day shows how many tasks are scheduled for that date.
2. **Given** tasks are overdue, due soon, or explicitly marked as priority,
   **When** the user opens PRIORITY, **Then** the page highlights those items
   based on the selected deadline window, including overdue work and work due
   within three days by default.
3. **Given** the user selects a task in TIMER and starts then stops a work
   session, **When** the session ends, **Then** the task's real worked time is
   increased and available for progress reporting.

---

### User Story 3 - Review Weekly Progress and Personalize the App (Priority: P3)

As a user, I want to review weekly performance and adjust my preferences so the
app feels personal, useful, and easy to understand over time.

**Why this priority**: Reports and preferences turn raw task data into feedback
and make the experience sustainable for regular weekly use.

**Independent Test**: Complete, leave incomplete, and work on several tasks in
the same week; then confirm REPORTS summarizes them correctly and SETTINGS saves
visual and account preferences.

**Acceptance Scenarios**:

1. **Given** a week contains tasks the system classifies as completed,
   in-progress, and not-completed, **When** the user opens REPORTS, **Then**
   they see a circular summary with percentages for each status and summary
   metrics for completed value and time invested.
2. **Given** a user changes theme or language in SETTINGS, **When** they return
   to the app later, **Then** those preferences remain applied.
3. **Given** a user signs in with Google, **When** authentication succeeds,
   **Then** the signed-in state is shown in SETTINGS and available for the
   user's ongoing app experience.

### Edge Cases

- What happens when a week has no tasks at all? REPORTS must still render a
  valid empty state with zeroed metrics and no broken percentages.
- How does the system handle a task with no scheduled date? It remains visible
  in GENERAL and TIMER but is excluded from CALENDAR counts until scheduled.
- How does the system count a task with a date range? It appears in CALENDAR
  counts on every day from its start date through its end date, inclusive.
- How does the flow behave if the user stops the timer after the due date has
  passed? The worked time is still recorded, and urgency/reporting reflect the
  task's latest state.
- How are progress states controlled? `completed` is user-set, `in-progress`
  is inferred from worked time or priority designation, and otherwise the task
  remains `not-completed`.
- How does the system behave when multiple tasks share the same deadline? All
  applicable tasks must appear in PRIORITY without arbitrary omissions.
- How does the system handle offline usage or delayed synchronization? Users
  must still be able to create, update, and track work, with their latest known
  state preserved until syncing is possible.
- How are synchronization conflicts handled after offline changes? The most
  recently updated version of a task, group, or preference wins automatically.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow users to create, edit, and remove task
  groups.
- **FR-002**: Each task group MUST expose at least a color, name, number of
  tasks, relevant dates, total value, total estimated time, progress status, and
  quick actions to add a task or another group.
- **FR-003**: The system MUST allow users to create, edit, and remove tasks
  inside task groups.
- **FR-004**: Each task MUST support at least a title, group, scheduled date or
  date range, value, estimated time, real worked time, completion state, and
  optional priority designation.
- **FR-004a**: The task `completed` state MUST be explicitly set by the user.
- **FR-004b**: A task MUST be treated as `in-progress` once any worked time is
  recorded or the task is marked as priority; otherwise it MUST be treated as
  `not-completed` unless the user has marked it `completed`.
- **FR-005**: The GENERAL page MUST present task groups as the primary overview
  surface for planned work.
- **FR-006**: The CALENDAR page MUST display a monthly view and show the number
  of scheduled tasks for each day.
- **FR-006a**: A task scheduled with a date range MUST count toward each day in
  that range, inclusive of both the start and end dates.
- **FR-007**: The PRIORITY page MUST list overdue tasks, tasks inside the
  selected urgency window, and any items explicitly marked as priority.
- **FR-008**: The REPORTS page MUST summarize the selected week's tasks by
  completed, in-progress, and not-completed states using a circular chart with
  green, yellow, and red segments respectively.
- **FR-009**: The REPORTS page MUST also show summary metrics for completed
  value and time invested during the selected week.
- **FR-010**: The TIMER page MUST let the user choose a task, start work,
  stop work, and save the resulting worked time to that task.
- **FR-011**: The SETTINGS page MUST let the user choose a light or dark theme.
- **FR-012**: The SETTINGS page MUST let the user select the app language.
- **FR-013**: The SETTINGS page MUST support optional sign-in with Google and
  show the current account state without blocking app usage while signed out.
- **FR-014**: The system MUST preserve user-created work data and preferences
  across app restarts.
- **FR-015**: The product MUST provide selectable light and dark themes through
  shared design tokens, with both themes applied consistently across GENERAL,
  CALENDAR, PRIORITY, TIMER, REPORTS, and SETTINGS.
- **FR-015a**: Interactive controls MUST maintain accessible touch targets and
  readable visual contrast on supported mobile and web surfaces.
- **FR-015b**: Layouts for the six primary views MUST remain legible and usable
  on supported phone widths and Expo web without horizontal overflow during
  standard task-management flows.
- **FR-016**: If a user signs in with Google after already using the app
  locally, the existing local data MUST become the baseline dataset associated
  with that signed-in account for subsequent synchronization.
- **FR-017**: When synchronization detects conflicting versions of the same
  task, task group, or user preference, the most recently updated version MUST
  win automatically.

### Technical Constraints *(mandatory)*

- **TC-001**: The feature MUST comply with the repository constitution and its
  mandated stack, quality gates, and dependency policy.
- **TC-002**: The experience MUST remain local-first so that planning, task
  updates, and time tracking continue to work even when connectivity is limited.
- **TC-003**: The solution MUST keep interactions simple, responsive, and easy
  to understand on supported surfaces.
- **TC-004**: The implementation plan and tasks MUST include unit,
  integration, and end-to-end test coverage before implementation work is
  considered complete.
- **TC-005**: Any additional dependency or complexity introduced for this
  product setup MUST be explicitly justified in the implementation plan.

### Key Entities *(include if feature involves data)*

- **Task Group**: A container that organizes related tasks and summarizes their
  color, count, dates, value, estimated effort, and progress.
- **Task**: A planned unit of work with scheduling, value, estimated effort,
  worked time, status, and urgency-related attributes.
- **Work Session**: A recorded period of real time spent on a selected task.
- **Weekly Report**: A weekly summary of task outcomes, percentages, value
  achieved, and time invested.
- **User Preference**: A saved choice such as theme, language, or signed-in
  account state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can create their first task group and first task and
  see them reflected in GENERAL in under 3 minutes.
- **SC-002**: Users can identify all overdue work and all work inside the
  selected urgency window from PRIORITY without needing to inspect each task
  manually.
- **SC-003**: Weekly REPORTS always account for 100% of tasks relevant to the
  selected week across completed, in-progress, and not-completed states.
- **SC-004**: Users can start and stop time tracking for a selected task and
  see the resulting worked time reflected in the app on the same session.

## Assumptions

- The initial release is focused on individual productivity rather than shared
  multi-user collaboration.
- Google sign-in is optional for initial use, and a later sign-in attaches the
  current local dataset to the authenticated account as its starting state.
- The default urgency rule highlights overdue tasks and tasks due within three
  days, while allowing the user to choose a different deadline window.
- A task can exist without a scheduled date, but unscheduled tasks do not
  contribute to monthly calendar day counts until a date is assigned.
- A task with a scheduled date range contributes to every calendar day in that
  inclusive range.
- The `completed` state is user-controlled, while `in-progress` is inferred
  from worked time or priority designation.
- Synchronization conflicts for tasks, groups, and preferences use an automatic
  most-recent-update-wins rule.
- Weekly reporting uses a standard calendar week and includes any task that was
  scheduled, worked on, or completed during that period.
