# Research: Daily Planner Validation & Supporting UX

**Feature**: 002-daily-planner  
**Date**: 2026-03-10  
**Purpose**: Confirm implementation decisions for planner delivery, deterministic testing, persistence hardening, and adjacent breathing-experience polish

---

## 1. Test Suite Strategy

### Decision

Use **Vitest + Testing Library + jsdom + fake-indexeddb** as the primary automated test suite, with mocked timers for timer-driven components and accessible selectors for UI flows.

### Rationale

- The planner and breathing features depend on IndexedDB, BroadcastChannel, and timer-driven UI, which are better covered deterministically at component/service level than through browser-heavy E2E.
- Vitest integrates directly with the existing Vite 7 stack and keeps test feedback fast enough for iterative UI work.
- Testing Library aligns with the constitution's accessibility requirements by favoring role/label-based selectors over styling hooks.
- fake-indexeddb and a BroadcastChannel mock provide stable, isolated coverage for local persistence and multi-tab sync scenarios.

### Alternatives Considered

- **Keep Playwright as the main suite**: Rejected because timer, storage, and dev-server dependencies created flaky failures and slow feedback loops.
- **Service-only tests**: Rejected because planner editing, completion, undo, and breathing interactions still need DOM-level behavior coverage.
- **Test IDs as the default query strategy**: Rejected because they weaken accessibility pressure and are more brittle than semantic queries.

---

## 2. IndexedDB Initialization & Regression Protection

### Decision

Centralize database schema ownership in `src/services/db.js` and require `taskService.js` to consume the shared `getDB()` initializer so legacy databases upgrade transparently before any task operation runs.

### Rationale

- A single schema owner prevents store-creation drift between services.
- Using the shared upgrade path fixes the observed failure mode where older databases lacked `tasks` and `archivedTasks` object stores.
- The safest regression anchor is a service-level test that creates a legacy database shape first, then verifies create/read behavior succeeds after automatic upgrade.

### Alternatives Considered

- **Open IndexedDB directly inside each service**: Rejected because it duplicates upgrade logic and caused the original planner breakage.
- **Manual migration scripts outside app startup**: Rejected because they add operational steps and weaken local-first behavior.
- **Delete old databases on startup**: Rejected because it would silently destroy user data.

---

## 3. Multi-Tab Sync Contract

### Decision

Keep BroadcastChannel-based last-write-wins synchronization, with a small, explicit event vocabulary and refresh-based fallback for reorder/full-sync cases.

### Rationale

- BroadcastChannel is already part of the app architecture and is the lowest-complexity way to keep tabs aligned.
- Last-write-wins matches the spec and avoids conflict-resolution UI for a single-user productivity tool.
- Reorder and full refresh events are simpler and safer to reconcile by re-reading persisted state than by attempting client-side merge logic.

### Alternatives Considered

- **Polling IndexedDB from each tab**: Rejected because it wastes resources and adds latency.
- **Service worker mediation**: Rejected because it adds architectural weight without solving a current product need.
- **Conflict-resolution UI**: Rejected because the spec explicitly accepts last-write-wins.

---

## 4. Planner Interaction Stack

### Decision

Retain **`@dnd-kit`** for drag-and-drop and **`@tanstack/react-virtual`** for larger task lists, while keeping manual ordering in `manualOrder` and higher-level orchestration in hooks.

### Rationale

- `@dnd-kit` already fits the codebase, supports keyboard interaction, and uses transform-based motion suitable for 60fps dragging.
- `@tanstack/react-virtual` protects scroll performance when active task counts grow.
- Fractional `manualOrder` values allow stable reordering without rewriting every sibling record during each drag.

### Alternatives Considered

- **Native HTML5 drag/drop**: Rejected because keyboard accessibility and touch support would require extra custom work.
- **Always render full lists without virtualization**: Rejected because it risks violating the planner's responsiveness criteria for larger datasets.
- **Integer-only order fields**: Rejected because repeated reordering would require frequent list-wide rewrites.

---

## 5. Breathing Visuals & Testability

### Decision

Represent breathing routines as declarative phase arrays and render pattern-specific visuals with CSS-friendly, motion-safe animation primitives. Expose stable, testable phase and visual markers through semantic buttons plus targeted visual hooks.

### Rationale

- The breathing component is fundamentally timer-driven state plus visual mapping, so the routine definition should stay data-first and easy to test.
- Box, relax, and energizing exercises benefit from distinct visuals that communicate the intended pacing rather than a single generic pulse.
- Motion should prefer transform/opacity and respect reduced-motion needs to stay consistent with the constitution's animation rules.
- Fake timers make phase advancement, countdowns, and exercise switching deterministic in tests.

### Alternatives Considered

- **Single generic breathing animation for all routines**: Rejected because it does not communicate exercise-specific pacing well.
- **Canvas animation**: Rejected because the visuals are simple enough for CSS/DOM and do not justify extra rendering complexity.
- **Real-time waits in tests**: Rejected because they are slow and flaky compared with fake timers.
