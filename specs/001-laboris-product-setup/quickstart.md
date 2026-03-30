# Quickstart: laboris Initial Product Setup

## Goal

Stand up the planned local-first task-management stack in this repository, verify the migration from the current event prototype, and exercise the core product flows on Expo native and supported web surfaces.

## 1. Prepare Environment

Client environment should provide:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
```

Backend environment should provide:

```env
DATABASE_URL=
DIRECT_URL=
SUPABASE_JWT_SECRET=
PORT=4000
```

## 2. Install the Mandated Stack Bindings

The implementation should add the missing packages needed to realize the mandated stack:

- Expo SQLite client support
- Supabase JavaScript client
- Prisma CLI and `@prisma/client`
- Jest and React Native Testing Library packages
- ESLint and Prettier packages

No chart, date, or extra state-management package should be added.

## 3. Initialize Local and Remote Data Layers

1. Create the Prisma schema for `task_groups`, `tasks`, `work_sessions`, and `user_preferences`.
2. Run Prisma migrations against the Supabase PostgreSQL database.
3. Create the matching SQLite schema and local migration runner in the Expo app.
4. Implement the one-time importer from `AsyncStorage` key `calendario:v1` into SQLite.

## 4. Run the App and Backend

Planned development flow:

```bash
npm run start
npm run web
cd backend
npm run dev
```

The completed implementation should also expose repository-level quality commands:

```bash
npm run lint
npm run test
npm run test:e2e
```

## 5. Verify Core Product Flows

Use these manual checks while implementing:

1. Create a task group and a task in GENERAL.
2. Confirm CALENDAR shows per-day counts for a single date and for an inclusive date range.
3. Mark a task priority or make it overdue and confirm PRIORITY includes it.
4. Start and stop the TIMER for a task and verify worked time increases immediately.
5. Open REPORTS for the same week and confirm percentages, completed value, and invested time.
6. Change theme and language in SETTINGS, restart the app, and confirm the preferences persist.
7. Sign in with Google after local-only usage and verify bootstrap sync uploads the local dataset.

## 6. Run Automated Coverage

Minimum automated coverage expected by the plan:

- Unit: task status derivation, date-range expansion, weekly report calculations, migration mappers
- Integration: SQLite repositories, timer transaction flow, sync conflict handling, Express sync endpoints
- E2E: GENERAL, CALENDAR, PRIORITY, TIMER, REPORTS, and SETTINGS flows on Expo web

## 7. Migration Acceptance

Before calling the feature ready:

- Import an existing event payload from the current app.
- Confirm labels become task groups.
- Confirm event titles and schedule ranges map into tasks.
- Confirm legacy high-priority events become prioritized tasks.
- Confirm deleted/bin records remain deleted after migration.

If any legacy field cannot map cleanly, the migration must ignore it explicitly and document the behavior rather than silently dropping it.
