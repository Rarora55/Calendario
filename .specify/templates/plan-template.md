# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See
`.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

**Language/Version**: TypeScript for Expo/React Native client and Express server  
**Primary Dependencies**: React Native, Expo, Expo Router, Zustand, SQLite, Supabase, Express, Prisma  
**Storage**: SQLite locally; Supabase PostgreSQL remotely; Supabase Storage for assets  
**Testing**: Jest, React Native Testing Library, Playwright  
**Target Platform**: Android, iOS, and supported Expo web surfaces  
**Project Type**: Mobile application with supporting API/backend services  
**Performance Goals**: [e.g., 60 fps, cold start budget, sync latency target]  
**Constraints**: Clean Code, SOLID, DRY, KISS, simple UX, responsive design, minimal dependencies, mandatory testing, local-first data model  
**Scale/Scope**: [e.g., screens touched, entities affected, expected user/data scale]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Uses the mandated stack or documents an approved exception.
- Keeps business data local-first with SQLite and sync/remote state in Supabase/PostgreSQL.
- Limits dependencies to the minimum justified set.
- Includes explicit unit, integration, and E2E coverage using Jest, React Native Testing Library,
  and Playwright.
- Preserves simple UX and responsive behavior for every touched screen or supported surface.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
`-- tasks.md
```

### Source Code (repository root)

```text
app/
components/
src/
backend/
|-- src/
prisma/
supabase/
tests/
|-- unit/
|-- integration/
`-- e2e/
```

**Structure Decision**: Keep the Expo client in `app/` and `src/`, backend logic in
`backend/src/`, database schema and migrations in `prisma/`, Supabase resources in
`supabase/`, and automated tests in `tests/unit/`, `tests/integration/`, and `tests/e2e/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., temporary extra dependency] | [current need] | [why existing stack was insufficient] |
