# Research: laboris Initial Product Setup

## Decision 1: Keep the client local-first with SQLite as the business-data source of truth

- Decision: Replace the current `AsyncStorage` snapshot model with normalized SQLite tables accessed from the Expo client.
- Rationale: The feature now requires task groups, tasks, work sessions, offline edits, timer-derived writes, and deterministic sync. SQLite supports relational queries, transactional updates, and conflict metadata without duplicating business logic in Zustand.
- Alternatives considered:
  - Keep `AsyncStorage` JSON blobs. Rejected because range queries, reports, and sync metadata become brittle and expensive.
  - Add a heavier local database abstraction. Rejected because the constitution requires minimal dependencies and the SQLite stack is already mandated.

## Decision 2: Limit Zustand to app/session state and derived selectors

- Decision: Use Zustand for hydrated UI state, filters, active timer state, theme/language state, and sync status, while repositories read and write SQLite directly.
- Rationale: This keeps the client architecture simple and respects the constitution requirement that SQLite remains the local business-data layer.
- Alternatives considered:
  - Store all business records in Zustand and persist snapshots. Rejected because it recreates the current migration problem and weakens offline durability.
  - Introduce a second state library. Rejected by the fixed stack and complexity policy.

## Decision 3: Promote Task Group to a first-class entity and retire label-centered grouping

- Decision: The new domain will use `TaskGroup` as the primary organizational entity, with tasks linked by `taskGroupId`.
- Rationale: The spec makes GENERAL group-centric and requires explicit group summaries. The existing label-based grouping is a UI convenience, not a durable domain model.
- Alternatives considered:
  - Reuse labels as groups. Rejected because labels currently lack lifecycle, totals, schedule spans, and sync semantics.
  - Keep calendars as the primary parent. Rejected because the product is no longer a calendar-first event organizer.

## Decision 4: Model scheduling with date-only fields and inclusive date ranges

- Decision: Store `scheduledStartDate` and `scheduledEndDate` as date-only `YYYY-MM-DD` values on each task. A single-day task uses the same date in both fields.
- Rationale: The required views are day and week oriented, not time-of-day calendar events. Date-only values avoid timezone drift and make inclusive monthly counts deterministic.
- Alternatives considered:
  - Store timestamps for all scheduling. Rejected because timezone conversions would create false off-by-one results in calendar and weekly reports.
  - Support multiple ranges per task. Rejected as unnecessary complexity for the initial product.

## Decision 5: Represent explicit priority as a boolean flag

- Decision: Use `isPriority: boolean` instead of low/medium/high levels.
- Rationale: The feature only needs to distinguish explicitly prioritized tasks from the rest. A boolean keeps the PRIORITY rules and `in-progress` inference simple.
- Alternatives considered:
  - Reuse the current event priority enum. Rejected because only "explicitly prioritized" behavior is required and extra levels do not change the planned UX.

## Decision 6: Keep task completion explicit and other progress states derived

- Decision: Persist only the user-controlled completion markers (`isCompleted`, `completedAt`) and derive `in-progress` and `not-completed` from worked time or priority.
- Rationale: This matches the spec exactly and prevents drift between manually stored status labels and the real task state.
- Alternatives considered:
  - Persist a three-state status enum. Rejected because it duplicates logic and risks stale report data.

## Decision 7: Record time in append-only Work Session rows and cache worked time on Task

- Decision: Every timer stop creates a `WorkSession` row and updates the task's cached `workedTimeSeconds` in the same local transaction.
- Rationale: Sessions are the audit trail for reports and sync, while the task cache keeps GENERAL, PRIORITY, and TIMER fast.
- Alternatives considered:
  - Store only an accumulated worked-time number on tasks. Rejected because reports need weekly inputs and later debugging becomes impossible.
  - Store only sessions and sum on every render. Rejected because it increases repeated query cost for common views.

## Decision 8: Compute Weekly Report data as a projection, not a persisted table

- Decision: Do not create a stored `weekly_reports` table. Build weekly report inputs from tasks and work sessions for the selected week.
- Rationale: Weekly summaries are deterministic derived data. Persisting them would duplicate source-of-truth fields and complicate sync.
- Alternatives considered:
  - Store weekly aggregates. Rejected because every task or work-session edit would require backfilling aggregates.

## Decision 9: Use batched push/pull sync with per-row `updatedAt` and most-recent-update-wins

- Decision: Sync `TaskGroup`, `Task`, `WorkSession`, and `UserPreference` in batches through explicit Express endpoints backed by Supabase PostgreSQL. For conflicting synced rows, the version with the latest `updatedAt` wins; deleted rows use `deletedAt`.
- Rationale: The conflict rule is explicit in the spec. Batched sync keeps offline usage simple and avoids streaming complexity.
- Alternatives considered:
  - Full-database snapshot upload. Rejected because it scales poorly and increases conflict risk.
  - CRDT-style merge. Rejected as unnecessary complexity for the initial release.

## Decision 10: Use Supabase Auth directly and keep Express as a thin sync orchestration layer

- Decision: Google sign-in should be implemented through Supabase Auth on the client. Express should only validate the Supabase bearer token, run transactional sync logic with Prisma, and expose minimal health/sync endpoints.
- Rationale: This honors the constitution requirement that Supabase is the primary backend platform and keeps Express focused on logic that Supabase alone does not express cleanly.
- Alternatives considered:
  - Continue issuing a custom app JWT from Express. Rejected because it duplicates the Auth platform already mandated by the constitution.
  - Skip Express entirely. Rejected because sync conflict handling and account bootstrap are clearer and safer in an explicit server layer.

## Decision 11: Bootstrap remote data from local data only on first account attachment

- Decision: When a user signs in and no remote dataset exists for that account, upload the entire local SQLite dataset as the baseline. If the account already has remote rows, run the normal LWW sync instead of force-overwriting remote data.
- Rationale: This satisfies the spec for first attachment while avoiding destructive overwrites when a returning account already has synced history from another device.
- Alternatives considered:
  - Always overwrite remote data with the local device. Rejected because it can destroy existing synced records.
  - Always pull remote first. Rejected because it violates the "local data becomes the baseline" rule for first-time attachment.

## Decision 12: Avoid non-mandated heavy UI dependencies

- Decision: Do not introduce calendar, chart, form, or date libraries for this feature. Use Expo/React Native primitives, internal date utilities, and a lightweight custom circular-report component.
- Rationale: The current app already implements calendar math internally, the constitution requires minimal dependencies, and the feature scope does not justify third-party UI infrastructure.
- Alternatives considered:
  - Add a chart library for REPORTS. Rejected because one donut chart is not enough justification.
  - Add a date utility library. Rejected because the required rules are small and deterministic.

## Decision 13: Planned dependency additions must stay inside the mandated stack

- Decision: The only new implementation dependencies planned are official adapters that realize the mandated stack: `expo-sqlite` for SQLite access, `@supabase/supabase-js` for Supabase access, `@prisma/client` plus Prisma CLI for PostgreSQL schema management, and the required Jest/React Native Testing Library/ESLint/Prettier packages that are currently missing from the root project.
- Rationale: These packages are direct implementation bindings for the fixed stack, not new architectural layers.
- Alternatives considered:
  - Keep the current dependency surface unchanged. Rejected because the repository does not yet include the full mandated stack needed by the spec.

## Decision 14: Plan an explicit data migration from the current event/calendar prototype

- Decision: Ship a one-time local migration that reads the existing `calendario:v1` `AsyncStorage` payload, maps event labels into task groups, maps events into tasks when possible, and archives unsupported fields instead of silently discarding them.
- Rationale: The repo already contains user-facing event data structures. The plan must preserve existing local data when moving to the new task domain.
- Alternatives considered:
  - Hard reset local data. Rejected because it breaks FR-014 and creates avoidable user data loss.
  - Attempt a perfect semantic conversion for every event field. Rejected because some current fields, such as `location` and `allDay`, do not map cleanly to the new task-focused release.
