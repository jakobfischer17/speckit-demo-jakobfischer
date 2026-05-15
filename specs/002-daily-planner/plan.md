# Implementation Plan: Daily Planner Validation & Experience Completion

**Branch**: `002-daily-planner` | **Date**: 2026-03-10 | **Spec**: `/specs/002-daily-planner/spec.md`
**Input**: Feature specification from `/specs/002-daily-planner/spec.md`

## Summary

Complete the Daily Planner feature set by hardening the persistence and multi-tab sync path, replacing flaky browser-driven testing with deterministic component and service tests, and aligning adjacent breathing exercise motion design with the constitution's smooth, accessible SPA requirements. The implementation will stay inside the existing React 19 + Vite single-page app, preserve IndexedDB + BroadcastChannel as the runtime backbone, and validate key user flows through Vitest, Testing Library, jsdom, fake-indexeddb, and mocked timers.

## Technical Context

**Language/Version**: JavaScript (ES modules) with React 19 on Node.js 20+  
**Primary Dependencies**: React 19, Vite 7, `idb`, `@dnd-kit/*`, `@tanstack/react-virtual`, `date-fns`, Vitest 4, Testing Library, jsdom, fake-indexeddb  
**Storage**: IndexedDB (`productivity-hub`) via shared `db.js`; BroadcastChannel for multi-tab sync  
**Testing**: Vitest 4 + Testing Library + jsdom + fake-indexeddb + mocked timers  
**Target Platform**: Modern desktop/mobile browsers on Windows/macOS/Linux (latest Chrome, Edge, Firefox, Safari)  
**Project Type**: Single-page web application  
**Performance Goals**: Task creation under 200ms, Top 3 generation under 500ms, 60fps animations/interactions, responsive planner behavior with 200 active tasks  
**Constraints**: No full page reloads, transform/opacity-preferred motion, keyboard accessibility, last-write-wins sync, offline-capable local persistence, no new UI framework  
**Scale/Scope**: One SPA codebase with Today view, task CRUD/reordering/sorting, prioritization tools, breathing exercises, and colocated service/component tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Gate Review

- **I. Seamless Single-Page Experience**: PASS. The work stays inside the existing SPA, keeps section-level continuity, and avoids route/page reload additions.
- **II. Code Quality First**: PASS WITH FOLLOW-UP. The plan preserves the current co-located component/style structure and shared service boundaries. The repo has unrelated existing lint debt; feature work must avoid introducing new lint issues and should reduce touched-file debt where feasible.
- **III. Testing Standards**: PASS. The plan replaces brittle browser-driven coverage with deterministic service/component tests, uses mocked timers for timer-driven UI, and relies on accessible selectors.
- **IV. Visual & Interaction Consistency**: PASS. Breathing visuals and planner interactions will use the existing visual system, include reduced-motion handling, and prefer smooth transform-based motion.
- **V. Performance for Smooth UX**: PASS. Existing virtualization and lightweight service architecture are retained; testing changes reduce feedback latency and planner interactions remain within SPA performance targets.

### Post-Design Gate Review

- PASS. The design keeps a single-project SPA structure, adds no constitution violations, and does not require any exceptions or governance waivers.

## Project Structure

### Documentation (this feature)

```text
specs/002-daily-planner/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── components.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── App.jsx
├── components/
│   ├── BreathingExercise.jsx
│   ├── BreathingExercise.css
│   ├── BreathingExercise.test.jsx
│   ├── DailyPlanner/
│   │   ├── DailyPlanner.jsx
│   │   ├── DailyPlanner.css
│   │   ├── DailyPlanner.test.jsx
│   │   ├── TodayView.jsx
│   │   ├── TaskList.jsx
│   │   ├── TaskItem.jsx
│   │   ├── QuickAdd.jsx
│   │   ├── SortControls.jsx
│   │   ├── CompletedSection.jsx
│   │   └── UndoToast.jsx
│   ├── Navigation/
│   ├── PrioritizationTools/
│   ├── Rewards/
│   └── Statistics/
├── data/
├── hooks/
│   ├── useDragAndDrop.js
│   ├── useTaskArchive.js
│   ├── useTasks.js
│   ├── useTaskSort.js
│   └── useTop3Focus.js
├── services/
│   ├── db.js
│   ├── statsService.js
│   ├── taskService.js
│   └── taskService.test.js
└── main.jsx

.vscode/
└── settings.json

vitest.setup.js
vite.config.js
package.json
README.md
```

**Structure Decision**: Use the existing single-project SPA structure rooted in `src/`, with component tests colocated beside interactive UI and service regression tests kept beside the relevant service module. No backend or separate test harness project is needed.

## Complexity Tracking

No constitution exceptions are required for this plan.
