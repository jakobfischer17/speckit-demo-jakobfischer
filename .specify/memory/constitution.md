<!--
SYNC IMPACT REPORT
==================
Version change: (new) → 1.0.0
Modified principles: N/A (initial constitution)
Added sections:
  - Core Principles (I–IV)
  - Performance Requirements
  - Development Workflow & Quality Gates
  - Governance
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ Constitution Check gates align with principles below
  - .specify/templates/spec-template.md ✅ No structural changes required
  - .specify/templates/tasks-template.md ✅ Task categories reflect testing and UX consistency tasks
Deferred TODOs: none
-->

# Productivity Hub Constitution

## Core Principles

### I. DRY & Functional Programming (NON-NEGOTIABLE)

Every piece of logic MUST be expressed exactly once. Duplication of business logic,
UI behaviour, or data transformations across components or modules is forbidden.

- New logic MUST be extracted into a pure function or custom hook before being reused
  in two or more locations.
- Components MUST be written as pure functional components; class components are
  prohibited in new code.
- Side effects MUST be isolated inside `useEffect` or custom hooks — never inlined
  directly in render logic.
- Data transformations MUST use declarative array methods (`map`, `filter`, `reduce`)
  over imperative loops wherever clarity is not sacrificed.
- Shared utilities MUST live in `src/utils/` or `src/hooks/` and be independently
  importable without pulling in component-level dependencies.

### II. Code Quality Standards

All code merged to `main` MUST pass automated quality gates without suppression.

- ESLint (project-configured ruleset) MUST report zero errors; warnings MUST be
  reviewed and either fixed or explicitly suppressed with a justification comment.
- Functions MUST remain ≤ 40 lines; components MUST remain ≤ 150 lines. Split when
  these thresholds are reached — no exceptions without a documented rationale.
- Magic numbers and strings MUST be extracted to named constants.
- `console.log` statements MUST NOT appear in committed production code.
- Imports MUST be ordered: external libraries → internal modules → relative paths,
  separated by blank lines.

### III. Testing Standards (NON-NEGOTIABLE)

Tests MUST be written before or alongside new functionality (TDD preferred). No
feature is considered complete until its acceptance criteria are covered by
automated tests.

- Every pure utility function in `src/utils/` MUST have a corresponding unit test
  achieving ≥ 90% branch coverage.
- Every user-facing component MUST have at least one rendering test that verifies
  its primary output given representative props.
- Interaction tests (click, keyboard, timer) MUST cover at least the P1 user story
  acceptance scenario for each component.
- Tests MUST be co-located: `ComponentName.test.jsx` alongside `ComponentName.jsx`,
  `util.test.js` alongside `util.js`.
- No feature branch may be merged while any test is failing (`npm test -- --watch=false`
  exits non-zero).

### IV. User Experience Consistency

All user-facing surfaces MUST follow a single, shared design language. Divergence
from established patterns requires explicit approval and a constitution amendment.

- A global design token file (`src/tokens.css` or equivalent) MUST be the single
  source of truth for colours, spacing, font sizes, border radii, and animation
  durations; hard-coded values for these properties are forbidden.
- Interactive elements (buttons, controls) MUST share the same visual style and
  hover/focus states defined in the shared token system.
- Animated transitions MUST use the project-standard easing and duration tokens;
  custom one-off animations require justification in the PR description.
- All user interactions MUST produce feedback within 100 ms (visual state change,
  loading indicator, or similar) regardless of underlying async work.
- Accessibility: every interactive element MUST be keyboard-reachable and have an
  ARIA label or visible text label; colour contrast MUST meet WCAG AA (4.5:1 normal,
  3:1 large text).

## Performance Requirements

The application MUST remain performant under typical single-user desktop and
mobile usage without requiring manual optimisation after each feature addition.

- **Initial load**: Lighthouse Performance score MUST remain ≥ 85 on a simulated
  mid-range mobile device (Lighthouse throttle preset).
- **Interaction responsiveness**: No user-triggered UI update may block the main
  thread for more than 50 ms (measured via browser DevTools).
- **Bundle size**: The production JS bundle MUST stay under 200 kB (gzipped).
  Dependencies added that would breach this threshold require team discussion.
- **Re-renders**: Components MUST NOT re-render without a change in their own
  props or subscribed state. React DevTools Profiler checks are part of the
  pre-merge review checklist for components with timers or frequent state updates.
- **Memory**: Long-running intervals and event listeners MUST be cleaned up on
  component unmount (`useEffect` cleanup functions are mandatory for all timers).

## Development Workflow & Quality Gates

All work MUST flow through the following gate sequence. Skipping a gate requires
written justification committed alongside the change.

1. **Spec gate** — feature spec exists and is approved before any code is written.
2. **Test gate** — tests for acceptance scenarios are written (may be failing) before
   implementation begins.
3. **Lint gate** — `npm run lint` exits 0 with no suppressions.
4. **Test pass gate** — `npm test -- --watch=false` exits 0.
5. **Performance gate** — Lighthouse score and bundle size checked for any PR
   touching component rendering or adding dependencies.
6. **Constitution check** — PR description explicitly confirms compliance with
   principles I–IV and the Performance Requirements section.

Code review MUST verify each gate. Reviewers MUST NOT approve a PR that skips or
fails a gate without a documented and constitution-backed exception.

## Governance

This constitution supersedes all prior verbal agreements and ad-hoc conventions.
Amendments require:

1. A pull request updating this file with a semantic version bump following the
   versioning policy below.
2. A one-sentence rationale for each changed principle.
3. Updates to all dependent templates listed in the Sync Impact Report header.
4. Approval from at least one additional contributor (or self-review with explicit
   justification for solo projects).

**Versioning policy**:
- MAJOR — backward-incompatible removal or redefinition of a principle.
- MINOR — new principle or section added, or materially expanded guidance.
- PATCH — clarifications, wording fixes, non-semantic refinements.

All PRs and reviews MUST include a Constitution Check confirming no principle is
violated. Complexity MUST be justified; prefer the simplest solution that satisfies
the spec.

**Version**: 1.0.0 | **Ratified**: 2026-04-12 | **Last Amended**: 2026-04-12
