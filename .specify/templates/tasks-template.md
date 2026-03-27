---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md,
data-model.md, contracts/

**Tests**: Tests are MANDATORY. Every feature task list MUST include unit, integration, and
end-to-end coverage tasks using Jest, React Native Testing Library, and Playwright.

**Organization**: Tasks are grouped by user story to enable independent implementation and
testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Client**: `app/`, `components/`, `src/`
- **Backend**: `backend/src/`, `prisma/`, `supabase/`
- **Tests**: `tests/unit/`, `tests/integration/`, `tests/e2e/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize or align required dependencies with the mandated stack
- [ ] T003 [P] Configure ESLint and Prettier
- [ ] T004 [P] Create Jest, React Native Testing Library, and Playwright scaffolding

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Setup Prisma schema and PostgreSQL migrations
- [ ] T006 [P] Configure Supabase Auth, PostgreSQL, Storage, and Sync integration
- [ ] T007 [P] Implement SQLite data layer and local-first persistence
- [ ] T008 [P] Setup Express routing, middleware, and validation structure
- [ ] T009 Create base models, schemas, and shared contracts
- [ ] T010 Configure error handling, logging, and environment management

**Checkpoint**: Foundation ready; user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1

> **NOTE: Write these tests FIRST and ensure they FAIL before implementation**

- [ ] T011 [P] [US1] Add Jest/RNTL unit tests in `tests/unit/[name].test.tsx`
- [ ] T012 [P] [US1] Add integration tests in `tests/integration/[name].test.ts`
- [ ] T013 [P] [US1] Add Playwright E2E coverage in `tests/e2e/[name].spec.ts`

### Implementation for User Story 1

- [ ] T014 [P] [US1] Create or update client module in `src/[path]`
- [ ] T015 [P] [US1] Create or update backend/sync module in `backend/src/[path]`
- [ ] T016 [US1] Implement store, service, or screen in `src/[path]`
- [ ] T017 [US1] Implement endpoint, sync flow, or server logic in `backend/src/[path]`
- [ ] T018 [US1] Add validation, error handling, and responsive UX states

**Checkpoint**: User Story 1 should now be functional and independently testable

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2

- [ ] T019 [P] [US2] Add Jest/RNTL unit tests in `tests/unit/[name].test.tsx`
- [ ] T020 [P] [US2] Add integration tests in `tests/integration/[name].test.ts`
- [ ] T021 [P] [US2] Add Playwright E2E coverage in `tests/e2e/[name].spec.ts`

### Implementation for User Story 2

- [ ] T022 [P] [US2] Create or update client module in `src/[path]`
- [ ] T023 [US2] Implement store, service, or screen in `src/[path]`
- [ ] T024 [US2] Implement endpoint, sync flow, or server logic in `backend/src/[path]`
- [ ] T025 [US2] Integrate with prior stories while preserving independent testability

**Checkpoint**: User Stories 1 and 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3

- [ ] T026 [P] [US3] Add Jest/RNTL unit tests in `tests/unit/[name].test.tsx`
- [ ] T027 [P] [US3] Add integration tests in `tests/integration/[name].test.ts`
- [ ] T028 [P] [US3] Add Playwright E2E coverage in `tests/e2e/[name].spec.ts`

### Implementation for User Story 3

- [ ] T029 [P] [US3] Create or update client module in `src/[path]`
- [ ] T030 [US3] Implement store, service, or screen in `src/[path]`
- [ ] T031 [US3] Implement endpoint, sync flow, or server logic in `backend/src/[path]`

**Checkpoint**: All user stories should now be independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in `docs/`
- [ ] TXXX Code cleanup and simplification
- [ ] TXXX Performance and responsiveness improvements
- [ ] TXXX [P] Expand regression coverage across unit, integration, and E2E suites
- [ ] TXXX Security hardening
- [ ] TXXX Run quickstart validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories
- **User Stories (Phase 3+)**: Depend on Foundational completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Schemas and models before services
- Services and stores before screens and endpoints
- Core implementation before sync/integration wiring
- Story complete before moving to the next priority

### Parallel Opportunities

- Setup tasks marked `[P]` can run in parallel
- Foundational tasks marked `[P]` can run in parallel
- Once Foundational completes, user stories can proceed in parallel if staffing allows
- Test tasks within a story marked `[P]` can run in parallel

---

## Notes

- `[P]` tasks indicate different files with no direct dependency
- Each user story must remain independently completable and testable
- Avoid vague tasks, unnecessary abstractions, and cross-story coupling
- Use the simplest implementation that satisfies the constitution
