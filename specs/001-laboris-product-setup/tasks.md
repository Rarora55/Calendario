# Tasks: laboris Initial Product Setup

**Input**: Design documents from `/specs/001-laboris-product-setup/`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/auth-sync-contracts.md](./contracts/auth-sync-contracts.md), [quickstart.md](./quickstart.md)

**Tests**: Tests are mandatory. Every phase below includes unit, integration, and end-to-end coverage tasks using Jest, React Native Testing Library, and Playwright.

**Organization**: Tasks are grouped by setup, foundations, and user stories so each story can be built and verified independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align the repository with the mandated stack, quality gates, and development scripts.

- [X] T001 Update root dependency and script definitions in `package.json` and `package-lock.json`
- [X] T002 [P] Update backend dependency and script definitions in `backend/package.json` and `backend/package-lock.json`
- [X] T003 [P] Configure repository linting and formatting in `eslint.config.js`, `.eslintignore`, `.prettierrc.json`, and `.prettierignore`
- [X] T004 [P] Configure Jest and React Native Testing Library scaffolding in `jest.config.ts`, `tests/setup/jest.setup.ts`, and `tsconfig.json`
- [X] T005 [P] Replace placeholder Playwright settings with product E2E scaffolding in `playwright.config.ts` and `tests/e2e/.gitkeep`
- [X] T006 Create backend TypeScript-compatible project configuration in `backend/tsconfig.json` and `backend/src/types/express.d.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the core local-first architecture that every user story depends on.

**CRITICAL**: No user story work should begin until this phase is complete.

### Tests for Foundational Phase

- [X] T006A [P] Add unit tests for SQLite schema contracts and shared sync validators in `tests/unit/foundation/schemaAndContracts.test.ts`
- [X] T006B [P] Add integration tests for SQLite bootstrap, legacy import, and repository persistence in `tests/integration/foundation/sqliteBootstrapAndImport.test.ts`
- [X] T006C [P] Add Playwright smoke coverage for first-launch offline shell rendering and route availability in `tests/e2e/foundation-shell.spec.ts`

### Implementation for Foundational Phase

- [X] T007 Create the PostgreSQL data model and initial Prisma migration in `prisma/schema.prisma` and `prisma/migrations/`
- [X] T008 [P] Configure Supabase client/auth environment wiring in `.env.example`, `backend/.env.example`, `src/lib/supabase.ts`, and `backend/src/lib/supabaseAuth.ts`
- [X] T009 [P] Implement SQLite bootstrap, migrations, and connection helpers in `src/db/client.ts`, `src/db/migrations.ts`, and `src/db/schema.ts`
- [X] T010 [P] Create shared domain types and sync payload validators in `src/features/shared/types.ts`, `src/features/shared/validators.ts`, and `backend/src/schemas/syncSchemas.ts`
- [X] T011 [P] Restructure the Express backend into TS-compatible modules in `backend/src/server.ts`, `backend/src/routes/health.ts`, `backend/src/routes/sync.ts`, `backend/src/middleware/auth.ts`, and `backend/src/config.ts`
- [X] T012 [P] Implement the local legacy import from `AsyncStorage` into SQLite in `src/db/legacyImport.ts` and `src/state/store.ts`
- [X] T013 [P] Create repository shells for task groups, tasks, work sessions, and preferences in `src/db/repositories/taskGroupRepository.ts`, `src/db/repositories/taskRepository.ts`, `src/db/repositories/workSessionRepository.ts`, and `src/db/repositories/userPreferenceRepository.ts`
- [X] T014 [P] Add shared pastel theming, language catalog, and target route skeletons in `src/theme/tokens.ts`, `src/theme/themes.ts`, `src/i18n/messages.ts`, `app/tabs/_layout.tsx`, `app/tabs/timer.tsx`, and `app/tabs/reports.tsx`

**Checkpoint**: SQLite, Prisma, Supabase wiring, shared contracts, migration plumbing, and route skeletons are ready for story work.

---

## Phase 3: User Story 1 - Organize Work by Groups and Tasks (Priority: P1)

**Goal**: Let users create task groups and tasks, then see GENERAL summarize planned work by group.

**Independent Test**: Create one task group and several tasks with dates, values, and estimated times; verify the GENERAL page shows the group, totals, quick actions, and task counts correctly.

### Tests for User Story 1

- [ ] T015 [P] [US1] Add unit tests for task-group summaries and task-state derivation in `tests/unit/task-groups/taskGroupSummary.test.ts`
- [ ] T016 [P] [US1] Add integration tests for task-group/task CRUD flows in `tests/integration/task-groups/taskGroupCrud.test.ts`
- [ ] T017 [P] [US1] Add Playwright E2E coverage for GENERAL create/edit flows in `tests/e2e/general-task-groups.spec.ts`

### Implementation for User Story 1

- [ ] T018 [P] [US1] Implement task-group data access and aggregate queries in `src/db/repositories/taskGroupRepository.ts`
- [ ] T019 [P] [US1] Implement task CRUD and derived status helpers in `src/db/repositories/taskRepository.ts` and `src/features/tasks/status.ts`
- [ ] T020 [P] [US1] Build task-group and task editor screens in `src/screens/TaskGroupEditorScreen.tsx`, `src/screens/TaskEditorScreen.tsx`, `app/task-group-editor.tsx`, and `app/task-editor.tsx`
- [ ] T021 [US1] Rewrite the main overview as a task-group dashboard in `src/screens/GeneralScreen.tsx` and `app/tabs/index.tsx`
- [ ] T022 [US1] Add task-group and task presentation components with quick actions in `components/TaskGroupCard.tsx`, `components/TaskRow.tsx`, and `app/tabs/_layout.tsx`
- [ ] T023 [US1] Replace legacy event-oriented navigation and selection state in `src/state/store.ts`; remove or redirect legacy editor routes in `app/group-editor.tsx`, `app/event-editor.tsx`, and `src/screens/GroupEditorScreen.tsx` so `app/task-group-editor.tsx` and `app/task-editor.tsx` remain the only editor entry points

**Checkpoint**: User Story 1 should now be fully functional and independently testable.

---

## Phase 4: User Story 2 - Plan, Prioritize, and Track Work Time (Priority: P2)

**Goal**: Show scheduled tasks on a monthly calendar, surface urgent work, and record worked time through the timer flow.

**Independent Test**: Create scheduled tasks with different deadlines and priority flags, then verify CALENDAR, PRIORITY, and TIMER update correctly as tasks are worked on.

### Tests for User Story 2

- [ ] T024 [P] [US2] Add unit tests for inclusive date ranges, urgency-window selection, and timer calculations in `tests/unit/scheduling/schedulingSelectors.test.ts`
- [ ] T025 [P] [US2] Add integration tests for work-session persistence and task time updates in `tests/integration/timer/workSessionFlow.test.ts`
- [ ] T025A [P] [US2] Add integration tests for active timer recovery and worked-time persistence after app relaunch in `tests/integration/timer/timerRelaunchRecovery.test.ts`
- [ ] T026 [P] [US2] Add Playwright E2E coverage for CALENDAR, PRIORITY, and TIMER in `tests/e2e/calendar-priority-timer.spec.ts`

### Implementation for User Story 2

- [ ] T027 [P] [US2] Implement work-session persistence and active timer recovery in `src/db/repositories/workSessionRepository.ts` and `src/features/timer/activeTimer.ts`
- [ ] T028 [P] [US2] Implement calendar count expansion and priority selectors in `src/features/calendar/monthCounts.ts` and `src/features/priority/selectors.ts`
- [ ] T029 [P] [US2] Build the TIMER screen and reusable task picker in `src/screens/TimerScreen.tsx`, `app/tabs/timer.tsx`, and `components/TaskPicker.tsx`
- [ ] T030 [US2] Rewrite the monthly calendar view for per-day task counts in `src/screens/CalendarScreen.tsx` and `app/tabs/calendars.tsx`
- [ ] T031 [US2] Rewrite the priority view for overdue, urgent, and explicit-priority tasks in `src/screens/PrioritiesScreen.tsx` and `app/tabs/priorities.tsx`
- [ ] T032 [US2] Connect timer saves to task worked-time caches and offline selectors in `src/state/store.ts` and `src/features/tasks/selectors.ts`

**Checkpoint**: User Stories 1 and 2 should both work independently with local-first behavior.

---

## Phase 5: User Story 3 - Review Weekly Progress and Personalize the App (Priority: P3)

**Goal**: Provide weekly reports, persisted preferences, optional Google sign-in, and sync-aware settings.

**Independent Test**: Complete, leave incomplete, and work on several tasks in the same week; then confirm REPORTS summarizes them correctly and SETTINGS saves visual and account preferences.

### Tests for User Story 3

- [ ] T033 [P] [US3] Add unit tests for weekly report aggregation, preference defaults, and conflict resolution rules in `tests/unit/reports-settings/reportsAndSync.test.ts`
- [ ] T034 [P] [US3] Add integration tests for preferences persistence, bootstrap sync, and conflict handling in `tests/integration/settings/syncAndPreferences.test.ts`
- [ ] T034A [P] [US3] Add integration tests for task data and preferences surviving app restart in `tests/integration/app-state/restartPersistence.test.ts`
- [ ] T035 [P] [US3] Add Playwright E2E coverage for REPORTS and SETTINGS flows in `tests/e2e/reports-settings.spec.ts`

### Implementation for User Story 3

- [ ] T036 [P] [US3] Implement preference persistence, theme tokens, and language lookups in `src/db/repositories/userPreferenceRepository.ts`, `src/theme/tokens.ts`, `src/theme/themes.ts`, and `src/i18n/messages.ts`
- [ ] T037 [P] [US3] Implement weekly report aggregation and the circular summary component in `src/features/reports/weeklyReport.ts` and `components/WeeklyReportChart.tsx`
- [ ] T038 [P] [US3] Implement Supabase auth gateway and secure session storage in `src/features/settings/authGateway.ts`, `src/lib/supabase.ts`, and `src/security/googleSessionStorage.ts`
- [ ] T039 [P] [US3] Implement authenticated sync bootstrap and incremental sync services in `backend/src/routes/sync.ts`, `backend/src/services/syncService.ts`, and `backend/src/services/conflictResolver.ts`
- [ ] T040 [US3] Build the REPORTS screen and weekly metrics UI in `src/screens/ReportsScreen.tsx` and `app/tabs/reports.tsx`
- [ ] T041 [US3] Rewrite SETTINGS for theme, language, urgency window, and account state in `src/screens/SettingsScreen.tsx` and `app/tabs/settings.tsx`
- [ ] T042 [US3] Wire client sync scheduling, bootstrap upload, and conflict application into `src/sync/syncEngine.ts`, `src/state/store.ts`, and `src/screens/SettingsScreen.tsx`

**Checkpoint**: All three user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish migration cleanup, regression coverage, performance tuning, and delivery validation.

- [ ] T043 [P] Update product and backend documentation in `docs/documentacion-funcional-scripts-app.md` and `docs/auth-backend-contract.md`
- [ ] T044 [P] Expand regression coverage for legacy import and offline sync recovery in `tests/integration/migration/legacyImport.test.ts` and `tests/e2e/offline-sync.spec.ts`
- [ ] T044A [P] Add Playwright coverage for theme application and responsive layout stability across primary views in `tests/e2e/theme-and-responsive-layout.spec.ts`
- [ ] T045 Tune calendar/report query performance, theme consistency, and responsive layouts in `src/features/calendar/monthCounts.ts`, `src/screens/CalendarScreen.tsx`, and `src/screens/ReportsScreen.tsx`
- [ ] T046 Harden sync/auth error handling and retry behavior in `backend/src/middleware/auth.ts`, `backend/src/services/syncService.ts`, and `src/sync/syncEngine.ts`
- [ ] T047 Run quickstart validation and align environment examples in `.env.example`, `backend/.env.example`, and `specs/001-laboris-product-setup/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1) has no dependencies and should start immediately.
- Foundational (Phase 2) depends on Setup and blocks all user stories.
- User Story 1 (Phase 3) depends on Foundational completion.
- User Story 2 (Phase 4) depends on Foundational completion and is best started after User Story 1 because it reuses task and group flows.
- User Story 3 (Phase 5) depends on Foundational completion and is best started after User Story 2 because reports and sync consume tasks and work sessions.
- Polish (Phase 6) depends on the desired user stories being complete.

### User Story Dependency Graph

- **US1**: No story dependency after Foundational phase.
- **US2**: Depends on US1 data entry flows and task repositories.
- **US3**: Depends on US1 for task/group data and on US2 for work-session and timer inputs.

### Within Each User Story

- Foundational test tasks must be written and fail before T007-T014 begin.
- Tests must be written and fail before implementation tasks start.
- Repository and domain logic tasks come before screen wiring tasks.
- Screen and navigation tasks come before final state-integration tasks.
- Story checkpoints must pass before moving work into Polish.

## Parallel Opportunities

### Setup

- T002, T003, T004, T005, and T006 can run in parallel after T001 starts dependency alignment.

### Foundational

- T006A, T006B, and T006C can run in parallel before T007-T014 begin.
- T008, T009, T010, T011, T012, T013, and T014 can run in parallel once T007 defines the main data model.

### User Story 1

- T015, T016, and T017 can run in parallel.
- T018, T019, and T020 can run in parallel after the US1 tests exist.

### User Story 2

- T024, T025, and T026 can run in parallel.
- T027, T028, and T029 can run in parallel after US2 tests exist.

### User Story 3

- T033, T034, and T035 can run in parallel.
- T036, T037, T038, and T039 can run in parallel after US3 tests exist.

## Implementation Strategy

### MVP First

- Complete Phases 1 and 2, then deliver Phase 3 as the MVP.
- This yields a usable offline-first task-group and task-management app without waiting on reports or remote sync.

### Incremental Delivery

1. Deliver US1 to replace the current event-centric product core.
2. Deliver US2 to add planning visibility and real worked-time capture.
3. Deliver US3 to add reporting, personalization, and account-linked sync.
4. Finish Phase 6 for migration hardening, performance, and release readiness.

### Validation

- Confirm every task above follows the required checklist format.
- Keep each user story independently testable at its checkpoint before continuing.
