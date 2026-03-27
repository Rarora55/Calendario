<!--
Sync Impact Report
- Version change: template -> 1.0.0
- Modified principles:
  - Template Principle 1 -> I. Clean Code and Simplicity
  - Template Principle 2 -> II. Mandatory Technology Stack
  - Template Principle 3 -> III. Local-First Data and Sync Architecture
  - Template Principle 4 -> IV. Mandatory Testing and Quality Gates
  - Template Principle 5 -> V. Simple UX and Responsive Design
- Added sections:
  - Technology Standards
  - Delivery Workflow
- Removed sections:
  - None
- Templates requiring updates:
  - .specify/templates/plan-template.md ✅ updated
  - .specify/templates/spec-template.md ✅ updated
  - .specify/templates/tasks-template.md ✅ updated
  - .specify/templates/agent-file-template.md ✅ updated
- Follow-up TODOs:
  - None
-->
# Calendario Constitution

## Core Principles

### I. Clean Code and Simplicity
All code MUST follow Clean Code, SOLID, DRY, and KISS. Implementations MUST prefer the
simplest correct solution, avoid speculative abstractions, and keep modules focused on one
clear responsibility. Dependencies MUST be justified by concrete value; if the same outcome
can be achieved with the existing stack or a small internal utility, no new dependency may
be introduced.

### II. Mandatory Technology Stack
The project stack is fixed and supersedes conflicting guidance. Client work MUST use React
Native, Expo, TypeScript, Expo Router, Zustand, SQLite, Supabase, ESLint, Prettier, Jest,
and React Native Testing Library. Server work MUST use Express, PostgreSQL, Prisma, and
TypeScript-compatible patterns even when legacy files still exist. Supabase MUST be used for
Auth, PostgreSQL, Storage, and synchronization concerns. Any proposal that removes or replaces
these technologies is non-compliant unless the constitution is formally amended first.

### III. Local-First Data and Sync Architecture
User-facing features MUST be designed local-first. The mobile app MUST store business data in
SQLite and use Zustand as the primary client state layer. Supabase and PostgreSQL MUST serve
as the remote source of truth for authentication, storage, synchronization, and shared data.
Express services MUST remain small, explicit, and focused on application-specific orchestration,
security, or domain logic that cannot be handled cleanly by Supabase alone. Prisma MUST define
and evolve the PostgreSQL schema.

### IV. Mandatory Testing and Quality Gates
Testing is mandatory for every meaningful change. Unit and integration coverage MUST use Jest
and React Native Testing Library where applicable, and Playwright MUST cover end-to-end flows
and any supported web journeys. No feature is complete without automated tests that fail before
implementation and pass after implementation. Linting and formatting with ESLint and Prettier
are mandatory gates for all production code.

### V. Simple UX and Responsive Design
UX MUST stay simple, legible, and responsive across supported mobile form factors and web
surfaces when present. Screens and interactions MUST prioritize clarity over novelty, reduce
user effort, and avoid feature bloat. Responsive layouts, accessible touch targets, and stable
navigation are required. Design decisions MUST favor understandable flows and a minimal visual
surface area.

## Technology Standards

- Mobile application MUST use React Native + Expo with TypeScript.
- Navigation MUST use Expo Router.
- Client state MUST use Zustand.
- Local persistence MUST use SQLite for business data and SecureStore only for secrets or
  session-sensitive values.
- Supabase MUST be the platform for Auth, PostgreSQL, Storage, and Sync.
- Express MUST be the custom backend layer when additional server-side logic is required.
- PostgreSQL MUST be accessed through Prisma-managed schemas and migrations.
- Code quality MUST use ESLint + Prettier.
- Automated tests MUST use Jest + React Native Testing Library + Playwright.
- New dependencies MUST be minimal, justified, and documented in the implementation plan.

## Delivery Workflow

- Every spec and implementation plan MUST include a constitution check against this document.
- Every task breakdown MUST include explicit test tasks for unit, integration, and end-to-end
  coverage before implementation tasks.
- Pull requests or reviews MUST reject code that bypasses the mandated stack, skips tests,
  introduces unjustified dependencies, or adds unnecessary architectural complexity.
- Temporary exceptions MUST be documented in the relevant plan with a rationale, scope, and
  removal strategy.

## Governance

This constitution supersedes ad hoc project guidance, preferences, and conflicting local
instructions for this repository. Amendments require documented rationale, explicit approval,
and synchronized updates to dependent templates. Compliance MUST be checked during planning,
specification, task generation, implementation, and review. Versioning follows semantic
versioning: MAJOR for incompatible governance changes, MINOR for new principles or materially
expanded rules, and PATCH for clarifications that do not alter meaning.

**Version**: 1.0.0 | **Ratified**: 2026-03-27 | **Last Amended**: 2026-03-27
