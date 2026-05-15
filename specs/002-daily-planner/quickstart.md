# Quickstart: Daily Planner Validation & Supporting UX

**Feature**: 002-daily-planner  
**Date**: 2026-03-10

---

## Prerequisites

- Node.js 20+ (Node 22 recommended)
- npm 10+
- Git
- Modern Chromium, Firefox, or Safari browser for manual UI validation

---

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Verify the Core Toolchain

```bash
npm run build
npm run lint
npm test
```

Note: the current repository contains unrelated baseline lint failures outside this feature area. Treat them as existing debt unless the touched files are part of the current work.

---

## Local Development Workflow

### Start the SPA

```bash
npm run dev
```

Expected outcome:

- Vite serves the SPA locally
- Today view, planner, prioritization tools, and breathing sections render client-side without reloads

### Run the Deterministic Test Suite

```bash
# Full component/service suite
npm test

# Interactive watch mode
npm run test:watch

# Planner-focused regression slice
npm run test:tasks
```

### Build Verification

```bash
npm run build
```

---

## Recommended Implementation Order

### Phase 1: Persistence Hardening

1. Confirm `taskService.js` uses shared `getDB()` from `db.js`
2. Add/maintain regression coverage for legacy IndexedDB upgrade behavior
3. Validate archive and completed-task lifecycle behavior at service level

### Phase 2: Planner Flow Coverage

1. Cover quick-add, inline edit, completion, delete, and undo in `DailyPlanner.test.jsx`
2. Add focused coverage for reorder/sort edge cases where practical
3. Keep selectors semantic (`role`, `label`, `alert`) rather than styling-based

### Phase 3: Breathing Experience Polish

1. Keep breathing routines data-driven
2. Ensure visuals are pattern-specific and motion-safe
3. Add deterministic timer coverage for exercise switching and phase advancement

### Phase 4: Final Verification

1. Re-run targeted tests
2. Re-run full Vitest suite
3. Run production build
4. Check touched files for lint regressions

---

## Key Files in Scope

```text
src/components/DailyPlanner/DailyPlanner.jsx
src/components/DailyPlanner/DailyPlanner.test.jsx
src/components/DailyPlanner/TaskList.jsx
src/components/DailyPlanner/TaskItem.jsx
src/components/DailyPlanner/UndoToast.jsx
src/components/BreathingExercise.jsx
src/components/BreathingExercise.css
src/components/BreathingExercise.test.jsx
src/hooks/useTasks.js
src/services/db.js
src/services/taskService.js
src/services/taskService.test.js
vitest.setup.js
vite.config.js
package.json
README.md
```

---

## Common Validation Tasks

### Clear Local Planner Data

```javascript
indexedDB.deleteDatabase('productivity-hub')
```

Use this in the browser console when validating fresh-start behavior or DB upgrade paths manually.

### Run a Single Test File

```bash
vitest run src/components/BreathingExercise.test.jsx
vitest run src/components/DailyPlanner/DailyPlanner.test.jsx
vitest run src/services/taskService.test.js
```

### Validate Reduced-Motion Friendly UI

Manual check:

1. Enable reduced motion at OS/browser level
2. Open the breathing section
3. Verify motion remains understandable without relying on aggressive animation

---

## Definition of Done for This Plan

- Planner persistence works on both fresh and legacy local databases
- Multi-tab task changes remain synchronized with last-write-wins behavior
- Core planner interactions are covered by deterministic component/service tests
- Breathing exercises present pattern-specific guidance and remain testable with fake timers
- `npm run build` succeeds after the changes
