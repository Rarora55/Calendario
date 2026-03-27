# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`  
**Created**: [DATE]  
**Status**: Draft  
**Input**: User description: "$ARGUMENTS"

## User Scenarios & Testing *(mandatory)*

User stories MUST be prioritized user journeys ordered by importance. Each story MUST be
independently testable and valuable on its own.

### User Story 1 - [Brief Title] (Priority: P1)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 2 - [Brief Title] (Priority: P2)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 3 - [Brief Title] (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

### Edge Cases

- What happens when [boundary condition]?
- How does the system handle [error scenario]?
- How does the flow behave offline, with stale local data, or after sync conflicts?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST [specific capability]
- **FR-002**: System MUST [specific capability]
- **FR-003**: Users MUST be able to [key interaction]
- **FR-004**: System MUST [data requirement]
- **FR-005**: System MUST [behavior]

### Technical Constraints *(mandatory)*

- **TC-001**: The implementation MUST use the repository constitution stack: React Native, Expo,
  TypeScript, Expo Router, Zustand, SQLite, Supabase, Express, PostgreSQL, Prisma, ESLint,
  Prettier, Jest, React Native Testing Library, and Playwright where applicable.
- **TC-002**: The design MUST remain local-first, with SQLite on-device and Supabase/PostgreSQL
  for remote synchronization or shared persistence.
- **TC-003**: The solution MUST follow Clean Code, SOLID, DRY, and KISS, and MUST justify every
  new dependency.
- **TC-004**: The feature MUST include unit, integration, and end-to-end test coverage in the
  implementation plan and task breakdown.
- **TC-005**: The UX MUST stay simple and responsive across the affected supported surfaces.

### Key Entities *(include if feature involves data)*

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: [Measurable user or system metric]
- **SC-002**: [Performance, reliability, or usability metric]
- **SC-003**: [Testability, adoption, or completion metric]
- **SC-004**: [Business or operational metric]

## Assumptions

- [Assumption about target users]
- [Assumption about scope boundaries]
- [Assumption about data/environment]
- [Dependency on existing system/service]
