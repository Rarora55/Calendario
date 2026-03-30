# Implementation Plan: laboris Initial Product Setup

**Branch**: `001-laboris-product-setup` | **Date**: 2026-03-27 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-laboris-product-setup/spec.md`

## Summary

Transform the current event/calendar prototype into a local-first task management product centered on task groups, scheduled tasks, work sessions, weekly reporting, and optional Google-backed sync. The implementation will move business persistence from `AsyncStorage` snapshots to SQLite, keep Supabase Auth and PostgreSQL as the backend platform, use a thin Express sync layer for transactional pull/push and first-account bootstrap, and preserve a simple pastel-themed UX across Expo native and supported web surfaces.

## Technical Context

**Language/Version**: TypeScript on Expo/React Native 0.81 + Expo Router 6 for the client, plus TypeScript-compatible Express and Prisma patterns for backend work  
**Primary Dependencies**: React Native, Expo, Expo Router, Zustand, SQLite via Expo, Supabase Auth/PostgreSQL, Express, Prisma  
**Storage**: SQLite for local business data; SecureStore only for auth/session secrets; Supabase PostgreSQL for synced data  
**Testing**: Jest, React Native Testing Library, Playwright  
**Target Platform**: Android, iOS, and supported Expo web surfaces  
**Project Type**: Mobile-first application with a minimal sync/auth orchestration backend  
**Performance Goals**: Local CRUD and timer actions should feel immediate (<100 ms perceived latency), monthly calendar/report queries should stay smooth for typical personal datasets (<300 scheduled tasks in view), and incremental sync should complete within about 3 seconds for <1,000 changed rows on a normal connection  
**Constraints**: Clean Code, SOLID, DRY, KISS, simple responsive UX, shared light/dark theme tokens applied consistently across all primary views, accessible touch targets and readable contrast, offline-first behavior, most-recent-update-wins conflict handling, and no non-mandated heavy dependencies  
**Scale/Scope**: Replace the current event/calendar domain across 6 primary product views, 5 core business entities, local migration from existing event data, and single-user productivity scale up to roughly 200 groups, 5,000 tasks, and 20,000 work sessions per account

## Constitution Check

*GATE: Passed before Phase 0 research. Re-checked after Phase 1 design.*

- Pass: The plan uses the mandated stack only, with official implementation adapters for SQLite, Supabase, Prisma, Jest, ESLint, and Prettier where the repo is currently incomplete.
- Pass: Business data remains local-first in SQLite, with sync and remote truth stored in Supabase PostgreSQL.
- Pass: Dependency scope stays minimal. No third-party chart, date, form, or state libraries are proposed.
- Pass: The design includes explicit unit, integration, and end-to-end coverage from the start.
- Pass: The UI plan keeps interactions simple, mobile-first, responsive, and themeable with soft pastel light/dark presentation.

## Project Structure

### Documentation (this feature)

```text
specs/001-laboris-product-setup/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- auth-sync-contracts.md
`-- tasks.md
```

### Source Code (repository root)

```text
app/
|-- tabs/
|-- task-editor.tsx
|-- task-group-editor.tsx
|-- _layout.tsx
`-- +not-found.tsx
src/
|-- db/
|-- features/
|   |-- task-groups/
|   |-- tasks/
|   |-- timer/
|   |-- reports/
|   `-- settings/
|-- sync/
|-- state/
`-- theme/
backend/
`-- src/
prisma/
supabase/
tests/
|-- unit/
|-- integration/
`-- e2e/
```

**Structure Decision**: Keep Expo routes in `app/`, reusable client logic in `src/`, SQLite repositories and migrations under `src/db/`, sync/auth orchestration in `backend/src/`, Prisma schema and SQL migrations in `prisma/`, Supabase configuration in `supabase/`, and automated coverage split into `tests/unit/`, `tests/integration/`, and `tests/e2e/`.

## Technical Architecture

### Client Architecture

- Expo Router will expose six primary views: GENERAL, CALENDAR, PRIORITY, TIMER, REPORTS, and SETTINGS.
- SQLite-backed repositories become the source of truth for task groups, tasks, work sessions, and preferences.
- Zustand will hold only hydrated view state and app state that benefits from in-memory coordination: selected month, urgency window, active timer, sync status, auth session summary, and theme/language application state.
- Task progress stays simple: `completed` is explicit, while `in-progress` and `not-completed` are derived selectors.
- The UI layer will preserve responsive layouts and pastel light/dark themes through shared design tokens instead of ad hoc per-screen colors.

### Local Database Architecture

- Local SQLite tables mirror the core synced entities: `task_groups`, `tasks`, `work_sessions`, and `user_preferences`.
- Each synced row stores `created_at`, `updated_at`, nullable `deleted_at`, and local sync flags such as `sync_status` and `last_synced_at`.
- A one-time migration reads the existing `AsyncStorage` payload under `calendario:v1` and writes normalized rows into SQLite.
- Timer writes are transactional: stopping a timer inserts a `work_sessions` row and increments the related task's cached `worked_time_seconds`.
- Weekly reports are computed from local task and work-session records and are not stored as separate rows.

### Sync Flow

1. The app writes all edits to SQLite immediately, even when offline.
2. Local row mutations mark the affected entity as `pending_upsert` or `pending_delete`.
3. When connectivity and auth are available, the client sends batched pending rows to Express with the active Supabase bearer token.
4. Express validates the Supabase identity, applies transactional upserts/deletes through Prisma, and returns the authoritative remote rows plus a new cursor.
5. The client applies the server payload into SQLite. For conflicts on tasks, task groups, and preferences, the row with the newest `updatedAt` wins automatically.
6. On first account attachment with no existing remote dataset, the client runs a bootstrap upload of all local rows before switching to incremental sync.

### Backend Responsibilities

- Supabase Auth is the primary auth platform and owns Google sign-in, refresh tokens, and identity.
- Express remains intentionally small and only handles:
  - health checks
  - authenticated sync bootstrap
  - authenticated incremental sync pull/push
  - optional server-side validation of sync payload shape and authorization
- Prisma defines the PostgreSQL schema and executes migrations against the Supabase Postgres database.
- The backend will not duplicate business reporting logic that can be derived locally.

### Remote Data Model

- Remote PostgreSQL tables mirror `task_groups`, `tasks`, `work_sessions`, and `user_preferences`.
- All synced tables are scoped by Supabase `user_id`.
- Soft deletion uses `deleted_at` so offline deletes can still win during later sync.
- `updated_at` drives most-recent-update-wins conflict resolution.
- Weekly reports are derived from remote tasks and sessions when needed on another device, not stored as a materialized product table in the first release.

## Dependency Decisions

| Dependency / Package Class | Status | Why It Is Needed | Why Simpler Was Rejected |
|----------------------------|--------|------------------|--------------------------|
| `expo-sqlite` | Add | Required to realize the mandated SQLite local-first architecture in Expo | `AsyncStorage` cannot support normalized offline queries and sync metadata safely |
| `@supabase/supabase-js` | Add | Required client adapter for Supabase Auth and sync access | Rolling custom HTTP auth/session handling would duplicate Supabase |
| Prisma CLI + `@prisma/client` | Add | Required to define and migrate the mandated PostgreSQL schema | Manual SQL-only schema drift would weaken type safety and repeatable migrations |
| Jest + React Native Testing Library packages | Add | Required by the constitution for unit and integration coverage | Existing template tests are insufficient and not aligned with the feature scope |
| ESLint + Prettier packages/config | Add | Required quality gates that the repo constitution mandates | Relying on manual formatting/review would violate the workflow rules |

No chart, date, form, ORM alternative, or extra state-management dependency is justified for this feature.

## Implementation Phases

### Phase 0: Foundation and Migration Scaffold

- Add the missing mandated tooling and project scripts for SQLite, Supabase client access, Prisma, Jest, ESLint, and Prettier.
- Create the SQLite schema, repository layer, and one-time `AsyncStorage` to SQLite migration path.
- Introduce shared theme tokens, language dictionaries, and route skeletons for the six target views.

### Phase 1: Core Task and Group Workflows

- Replace the current label/event domain with `TaskGroup` and `Task`.
- Build GENERAL as the primary task-group overview with totals, counts, schedule span, and quick-add flows.
- Implement task create/edit/remove flows with value, estimated time, worked time cache, scheduled date/date range, completion, and optional priority.

### Phase 2: Calendar and Priority Views

- Implement monthly CALENDAR counts from inclusive task date ranges.
- Implement PRIORITY with overdue tasks, configurable urgency-window tasks, and explicitly prioritized tasks.
- Add unit coverage for date-range expansion and urgency classification before UI completion.

### Phase 3: Timer and Work Session Tracking

- Build the TIMER flow around task selection, active local timer state, session stop/save, and worked-time updates.
- Persist completed sessions locally first, then include them in sync batches.

### Phase 4: Reports and Settings

- Implement REPORTS from derived weekly aggregates for completed, in-progress, and not-completed percentages, completed value, and invested time.
- Implement SETTINGS for theme, language, sync state, and optional Google sign-in through Supabase Auth.
- Preserve pastel light/dark presentation and responsive spacing across all screens.

### Phase 5: Sync, Backend, and Hardening

- Replace the current custom Google-token backend flow with Supabase-authenticated sync endpoints.
- Implement bootstrap sync, incremental pull/push, and LWW conflict handling.
- Finish test coverage, linting, formatting, migration validation, and web-surface E2E coverage.

## Testing Strategy

### Unit Tests

- Task status derivation from completion, worked time, and priority.
- Inclusive date-range expansion for calendar counts.
- Priority window filtering and overdue classification.
- Weekly report percentage and metric calculations, including empty-week behavior.
- Local migration mappers from event/calendar records to task/task-group records.

### Integration Tests

- SQLite repository CRUD and soft-delete behavior.
- Timer stop flow creating `WorkSession` rows and updating task caches transactionally.
- Sync conflict resolution with local newer, remote newer, and delete/update races.
- Express sync endpoints with Supabase-authenticated requests and Prisma-backed persistence.
- Preferences persistence for theme, language, urgency window, and linked account metadata.

### End-to-End Tests

- First-run flow from empty state to first task group and task in GENERAL.
- CALENDAR monthly counts with inclusive date ranges.
- PRIORITY default three-day urgency window and explicit priority surfacing.
- TIMER start/stop producing worked-time updates visible in REPORTS.
- SETTINGS theme/language persistence and optional Google sign-in on supported builds.
- Migration verification path for an existing `AsyncStorage` payload on web or emulated app state.

## Migration Implications From the Current Implementation

- The current `Calendar`, `CalendarEvent`, `LabelDefinition`, and `binEvents` structures are no longer the product domain. They must be replaced with task groups, tasks, work sessions, and synced soft deletes.
- The existing `AsyncStorage` key `calendario:v1` must be read once and converted to SQLite. Event labels become initial task groups; event titles/descriptions map into task content; `priority === "alta"` maps to `isPriority = true`; unsupported fields such as location should be preserved in an import note or ignored explicitly with a migration log.
- Current screens and routes need a domain rewrite:
  - `GeneralScreen` changes from chronological events to group summaries.
  - `CalendarScreen` keeps the monthly shell but changes from event instances to task counts.
  - `PrioritiesScreen` changes from high-priority events only to overdue/urgent/explicit-priority tasks.
  - `BinScreen`, `DayScreen`, `EventDetailScreen`, and `EventEditorScreen` no longer match the target information architecture and should be removed, repurposed, or replaced by task/task-group flows.
- The current settings/auth implementation stores a custom app JWT returned by Express. The new plan removes custom app-token issuance and relies on Supabase Auth sessions plus SecureStore for sensitive tokens.
- Existing Playwright coverage is placeholder-only and must be replaced with real product journeys.
- Existing backend JavaScript files should be migrated to TypeScript-compatible structure and refocused on sync orchestration instead of primary authentication ownership.

## Post-Design Constitution Check

- Pass: The design remains inside the mandated stack and keeps Express intentionally narrow.
- Pass: SQLite is the local business-data system, not an optional cache.
- Pass: Every planned view has explicit test coverage across unit, integration, and E2E layers.
- Pass: The plan rejects unnecessary third-party UI and data dependencies.
- Pass: The UX stays simple, task-focused, and responsive while preserving pastel theming expectations.

## Complexity Tracking

No constitution violations are currently justified by this plan.
