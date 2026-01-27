# Quickstart: Daily Planner & Task Management

**Feature**: 002-daily-planner  
**Date**: 2026-01-27

---

## Prerequisites

- Node.js 20+ (LTS recommended)
- npm 10+
- Git

---

## Setup

### 1. Clone and Install

```bash
# If not already cloned
git clone <repo-url>
cd speckit-demo-jakobfischer

# Switch to feature branch
git checkout 002-daily-planner

# Install existing dependencies
npm install
```

### 2. Install New Dependencies

```bash
# Drag-and-drop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# List virtualization
npm install @tanstack/react-virtual

# Date utilities (for Top 3 algorithm)
npm install date-fns
```

### 3. Verify Installation

```bash
# Run dev server
npm run dev

# Verify build
npm run build

# Run lint
npm run lint
```

---

## Development Workflow

### Start Development Server

```bash
npm run dev
# Opens at http://localhost:5173
```

### Run E2E Tests

```bash
# Install Playwright browsers (first time)
npx playwright install

# Run all tests
npx playwright test

# Run specific test file
npx playwright test e2e/daily-planner.spec.ts

# Run tests with UI
npx playwright test --ui
```

### Lint Code

```bash
npm run lint
```

---

## Project Structure for This Feature

```
src/
├── components/
│   ├── DailyPlanner/           # ← New directory
│   │   ├── DailyPlanner.jsx    # Main section component
│   │   ├── DailyPlanner.css
│   │   ├── TodayView.jsx       # Date header + summary
│   │   ├── TodayView.css
│   │   ├── TaskList.jsx        # Virtualized list container
│   │   ├── TaskList.css
│   │   ├── TaskItem.jsx        # Individual task row
│   │   ├── TaskItem.css
│   │   ├── QuickAdd.jsx        # Fast task input
│   │   ├── QuickAdd.css
│   │   ├── SortControls.jsx    # Sort dropdown
│   │   └── SortControls.css
│   ├── PrioritizationTools/    # ← New directory
│   │   ├── PrioritizationTools.jsx
│   │   ├── PrioritizationTools.css
│   │   ├── EisenhowerMatrix.jsx
│   │   ├── EisenhowerMatrix.css
│   │   ├── TopThreeFocus.jsx
│   │   ├── TopThreeFocus.css
│   │   ├── RiceScoring.jsx
│   │   └── RiceScoring.css
│   └── TaskHistory/            # ← New directory
│       ├── TaskHistory.jsx
│       └── TaskHistory.css
├── hooks/
│   ├── useTasks.js             # ← New hook
│   ├── useTaskSort.js          # ← New hook
│   ├── useDragAndDrop.js       # ← New hook
│   ├── useTaskArchive.js       # ← New hook
│   └── useTop3Focus.js         # ← New hook
├── services/
│   ├── db.js                   # ← Extend (add tasks store)
│   └── taskService.js          # ← New service
└── data/
    └── priorityConfig.js       # ← New config
```

---

## Key Files to Modify

### 1. `src/services/db.js`

Add tasks and archivedTasks stores (see data-model.md for schema).

```javascript
// Increment version
const DB_VERSION = 2;

// Add in upgrade handler:
if (oldVersion < 2) {
  const tasksStore = db.createObjectStore('tasks', { keyPath: 'id' });
  // ... indexes
}
```

### 2. `src/App.jsx`

Add DailyPlanner and PrioritizationTools sections.

```jsx
import { DailyPlanner } from './components/DailyPlanner/DailyPlanner';
import { PrioritizationTools } from './components/PrioritizationTools/PrioritizationTools';

// Add to render, with appropriate section IDs for navigation
```

### 3. `src/components/Navigation/SectionNav.jsx`

Add navigation links for new sections.

```javascript
const sections = [
  { id: 'today', label: 'Today' },
  { id: 'prioritization', label: 'Prioritization' },
  // ... existing sections
];
```

---

## Implementation Order

### Phase 1: Foundation (Blocking)
1. Extend `db.js` with tasks store
2. Create `taskService.js` with CRUD
3. Create `useTasks.js` hook
4. Basic `TaskItem` component

### Phase 2: Today View (P1)
1. `TodayView` component
2. `QuickAdd` component
3. `TaskList` component
4. Task completion animation

### Phase 3: Reordering & Sorting (P2)
1. `useDragAndDrop.js` hook
2. Drag-and-drop in `TaskList`
3. `SortControls` component
4. `useTaskSort.js` hook

### Phase 4: Prioritization Tools (P3-P4)
1. `EisenhowerMatrix` component
2. `TopThreeFocus` component
3. `RiceScoring` component

### Phase 5: Polish
1. Virtualization for large lists
2. Archive functionality
3. E2E tests

---

## Environment Variables

No new environment variables required.

---

## Common Tasks

### Create a New Component

```bash
# Create component directory
mkdir -p src/components/DailyPlanner

# Create files
touch src/components/DailyPlanner/TaskItem.jsx
touch src/components/DailyPlanner/TaskItem.css
```

### Test IndexedDB Changes

```javascript
// In browser console, clear DB to test migrations:
indexedDB.deleteDatabase('productivity-hub');
// Then refresh page
```

### Debug Drag-and-Drop

```javascript
// Add to DndContext for debugging:
onDragStart={(e) => console.log('drag start', e)}
onDragOver={(e) => console.log('drag over', e)}
onDragEnd={(e) => console.log('drag end', e)}
```

---

## Testing Checklist

### Manual Testing

- [ ] Quick-add creates task on Enter
- [ ] Task checkbox toggles completion
- [ ] Completed tasks show strike-through animation
- [ ] Drag task reorders list
- [ ] Sort options change order
- [ ] Delete shows undo toast
- [ ] Undo restores task within 5 seconds
- [ ] Eisenhower drag updates priority
- [ ] Top 3 generates suggestions
- [ ] RICE scores calculate correctly
- [ ] Multi-tab sync works

### Performance Testing

- [ ] Add 100+ tasks, verify smooth scrolling
- [ ] Drag operation maintains 60fps
- [ ] Task creation < 200ms

---

## Troubleshooting

### IndexedDB Version Conflict

If you see "VersionError", clear the database:
```javascript
indexedDB.deleteDatabase('productivity-hub');
```

### dnd-kit Not Working

Ensure DndContext wraps the draggable area:
```jsx
<DndContext sensors={sensors} onDragEnd={handleDragEnd}>
  <SortableContext items={taskIds}>
    {/* TaskItems here */}
  </SortableContext>
</DndContext>
```

### Virtualization Breaks Drag

Ensure `@tanstack/react-virtual` row refs are properly forwarded:
```jsx
const Row = React.forwardRef((props, ref) => (
  <div ref={ref} {...props} />
));
```

---

## Useful Links

- [dnd-kit Documentation](https://docs.dndkit.com/)
- [TanStack Virtual](https://tanstack.com/virtual/latest)
- [IndexedDB Guide](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Eisenhower Matrix](https://www.eisenhower.me/eisenhower-matrix/)
- [RICE Scoring](https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/)
