# Research: Daily Planner & Task Management

**Feature**: 002-daily-planner  
**Date**: 2026-01-27  
**Purpose**: Resolve technical unknowns and establish best practices before implementation

---

## 1. Drag-and-Drop Library Selection

### Decision: `@dnd-kit/core`

### Rationale
- **60fps performance**: Uses CSS transforms (not layout properties), meeting constitution requirement for smooth animations
- **Keyboard accessibility**: Built-in keyboard sensors for accessible reordering (arrow keys, Enter, Escape)
- **Lightweight**: ~10KB gzipped (vs react-beautiful-dnd at ~30KB)
- **Active maintenance**: Regular releases, React 19 compatible
- **Flexible**: Works for both vertical lists (task reordering) and grid layouts (Eisenhower matrix)

### Alternatives Considered

| Library | Bundle Size | React 19 | Keyboard A11y | Why Rejected |
|---------|------------|----------|---------------|--------------|
| react-beautiful-dnd | ~30KB | ⚠️ Deprecated | ✅ Excellent | Deprecated; no longer maintained |
| react-dnd | ~20KB | ✅ Yes | ❌ Manual setup | More complex API; requires separate keyboard implementation |
| native HTML5 drag | 0KB | ✅ Yes | ❌ Poor | No built-in keyboard support; inconsistent touch behavior |
| Sortable.js | ~10KB | ✅ Via adapter | ⚠️ Limited | Less React-native; requires wrapper |

### Implementation Pattern

```javascript
// Recommended: Single DndContext at DailyPlanner level
// Reusable sensors for keyboard + pointer
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
);
```

---

## 2. List Virtualization for 100+ Tasks

### Decision: `@tanstack/react-virtual`

### Rationale
- **Performance**: Only renders visible items + overscan buffer; handles 10,000+ items
- **Lightweight**: ~3KB gzipped
- **Flexible**: Works with any scroll container; not opinionated about styling
- **Headless**: No styling conflicts; works with existing CSS patterns
- **Maintained**: TanStack ecosystem is actively developed

### Alternatives Considered

| Library | Bundle Size | API Style | Why Rejected |
|---------|------------|-----------|--------------|
| react-window | ~6KB | Component-based | Less flexible; requires fixed heights or complex measurement |
| react-virtuoso | ~15KB | Component-based | Heavier; more features than needed |
| Native CSS contain | 0KB | CSS property | Doesn't help with DOM node count; only paint containment |

### Implementation Pattern

```javascript
// Recommended: Virtualize TaskList when tasks.length > 50
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: tasks.length,
  getScrollElement: () => scrollRef.current,
  estimateSize: () => 56, // Estimate row height in px
  overscan: 5,
});
```

### Threshold Strategy
- **<50 tasks**: Render all (virtualization overhead not worth it)
- **≥50 tasks**: Enable virtualization automatically
- **200+ tasks**: Virtualization required; meets SC-002 (60fps scrolling)

---

## 3. IndexedDB Schema Extension

### Decision: Extend existing `productivity-hub` database (version 2)

### Rationale
- Leverages existing `idb` wrapper pattern in `services/db.js`
- Separates active tasks from archived (7-day retention) for query performance
- Indexes support all required sort operations efficiently

### New Object Stores

```javascript
// Version 2 upgrade
upgrade(db, oldVersion) {
  if (oldVersion < 2) {
    // Tasks store - active tasks
    const tasksStore = db.createObjectStore('tasks', { keyPath: 'id' });
    tasksStore.createIndex('byDueDate', 'dueDate');
    tasksStore.createIndex('byPriority', 'priority');
    tasksStore.createIndex('byCreatedAt', 'createdAt');
    tasksStore.createIndex('byCompleted', 'completedAt');
    tasksStore.createIndex('byManualOrder', 'manualOrder');
    
    // Archived tasks store - completed > 7 days
    const archiveStore = db.createObjectStore('archivedTasks', { keyPath: 'id' });
    archiveStore.createIndex('byArchivedAt', 'archivedAt');
  }
}
```

### Migration Strategy
- Increment DB_VERSION to 2
- Add upgrade handler in `getDB()` function
- No data migration needed (new stores)

---

## 4. Multi-Tab Sync Pattern

### Decision: Extend existing BroadcastChannel pattern

### Rationale
- Already implemented for stats sync (`subscribeToBroadcast` in statsService.js)
- Last-write-wins is appropriate for personal productivity tool
- No additional dependencies needed

### Message Types

```javascript
// New broadcast message types for tasks
const TASK_CHANNEL = new BroadcastChannel('productivity-hub-tasks');

// Message types:
{ type: 'TASK_CREATED', task: {...} }
{ type: 'TASK_UPDATED', task: {...} }
{ type: 'TASK_DELETED', taskId: '...' }
{ type: 'TASKS_REORDERED', taskIds: [...] }
{ type: 'TASK_COMPLETED', taskId: '...', completedAt: '...' }
{ type: 'FULL_SYNC', tasks: [...] }  // Fallback for complex changes
```

---

## 5. Task Completion Animation

### Decision: CSS-only animation with transform/opacity

### Rationale
- Meets constitution requirement (60fps, transform/opacity only)
- No JavaScript animation library needed
- Hardware-accelerated

### Animation Specification

```css
/* Task completion: strike-through + fade */
.task-item--completing {
  animation: task-complete 300ms ease-out forwards;
}

@keyframes task-complete {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
}

/* Strike-through uses pseudo-element for smooth animation */
.task-item__title::after {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 0;
  height: 2px;
  background: var(--text-muted);
  transition: width 200ms ease-out;
}

.task-item--completed .task-item__title::after {
  width: 100%;
}
```

---

## 6. Undo Deletion Pattern

### Decision: Optimistic UI with 5-second timer

### Rationale
- Immediate visual feedback (task disappears instantly)
- Simple state management (hold deleted task in memory)
- No complex undo stack needed for single-action undo

### Implementation Pattern

```javascript
// useTasks hook pattern
const [pendingDelete, setPendingDelete] = useState(null);
const deleteTimerRef = useRef(null);

const deleteTask = (taskId) => {
  const task = tasks.find(t => t.id === taskId);
  setPendingDelete({ task, deletedAt: Date.now() });
  
  // Remove from UI immediately
  setTasks(prev => prev.filter(t => t.id !== taskId));
  
  // Start 5-second timer for permanent deletion
  deleteTimerRef.current = setTimeout(async () => {
    await taskService.permanentlyDelete(taskId);
    setPendingDelete(null);
  }, 5000);
};

const undoDelete = () => {
  if (pendingDelete) {
    clearTimeout(deleteTimerRef.current);
    setTasks(prev => [...prev, pendingDelete.task]);
    setPendingDelete(null);
  }
};
```

---

## 7. Top 3 Focus Algorithm

### Decision: Deadline-first ranking with score calculation

### Rationale
- Matches clarified spec: overdue > today > this week > priority > age
- Transparent scoring helps with "brief reasoning" requirement
- Efficient: O(n log n) sort, no complex ML needed

### Algorithm Implementation

```javascript
function calculateFocusScore(task, now = new Date()) {
  let score = 0;
  
  // Deadline urgency (higher = more urgent)
  if (task.dueDate) {
    const daysUntilDue = differenceInDays(task.dueDate, now);
    if (daysUntilDue < 0) score += 10000; // Overdue
    else if (daysUntilDue === 0) score += 5000; // Due today
    else if (daysUntilDue <= 7) score += 1000; // Due this week
  }
  
  // Priority level
  const priorityScores = { high: 300, medium: 200, low: 100 };
  score += priorityScores[task.priority] || 200;
  
  // Age tiebreaker (older tasks get slight boost)
  const ageInDays = differenceInDays(now, task.createdAt);
  score += Math.min(ageInDays, 30); // Cap at 30 days
  
  return score;
}

function generateTop3(tasks) {
  const activeTasks = tasks.filter(t => !t.completedAt);
  const scored = activeTasks.map(t => ({
    ...t,
    focusScore: calculateFocusScore(t),
    reasoning: generateReasoning(t),
  }));
  
  return scored
    .sort((a, b) => b.focusScore - a.focusScore)
    .slice(0, 3);
}

function generateReasoning(task) {
  if (isOverdue(task)) return 'Overdue - needs immediate attention';
  if (isDueToday(task)) return 'Due today';
  if (isDueThisWeek(task)) return 'Due this week';
  if (task.priority === 'high') return 'High priority';
  return 'Oldest pending task';
}
```

---

## 8. RICE Score Formula

### Decision: Standard RICE with percentage-based confidence

### Formula
```
RICE Score = (Reach × Impact × Confidence) ÷ Effort
```

### Input Ranges
| Dimension | Range | Description |
|-----------|-------|-------------|
| Reach | 1-10 | How many people/uses this affects |
| Impact | 1-5 | Minimal (1) to Massive (5) |
| Confidence | 0.1-1.0 | 10%-100% certainty |
| Effort | 1-10 | Person-days/weeks (minimum 1 to avoid division by zero) |

### Implementation
```javascript
function calculateRICE({ reach, impact, confidence, effort }) {
  // Validate effort minimum
  const safeEffort = Math.max(effort, 1);
  return (reach * impact * confidence) / safeEffort;
}
```

---

## 9. Inline Edit Pattern

### Decision: Click-to-edit with contentEditable

### Rationale
- No modal or form overlay (frictionless per spec)
- Native browser support; accessible
- Escape to cancel, Enter or blur to save

### Implementation Pattern
```jsx
const [isEditing, setIsEditing] = useState(false);
const inputRef = useRef(null);

const handleClick = () => {
  setIsEditing(true);
  // Focus after render
  requestAnimationFrame(() => inputRef.current?.focus());
};

const handleKeyDown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    saveAndClose();
  }
  if (e.key === 'Escape') {
    cancelEdit();
  }
};

return isEditing ? (
  <input
    ref={inputRef}
    defaultValue={task.title}
    onBlur={saveAndClose}
    onKeyDown={handleKeyDown}
    className="task-item__edit-input"
  />
) : (
  <span onClick={handleClick} className="task-item__title">
    {task.title}
  </span>
);
```

---

## 10. Swipe-to-Delete (Touch Support)

### Decision: CSS transform-based swipe with threshold

### Rationale
- 60fps capable (transform only)
- Works alongside dnd-kit (differentiated by gesture direction)
- Progressive enhancement (falls back to trash icon on desktop)

### Implementation Notes
- Horizontal swipe = delete intent
- Vertical drag = reorder intent
- Threshold: 50% of task width to confirm delete
- Snap back if threshold not reached

---

## Summary of Dependencies

| Package | Version | Size (gzipped) | Purpose |
|---------|---------|----------------|---------|
| @dnd-kit/core | ^6.x | ~10KB | Drag-and-drop framework |
| @dnd-kit/sortable | ^8.x | ~3KB | Sortable list preset |
| @tanstack/react-virtual | ^3.x | ~3KB | List virtualization |
| date-fns | ^3.x | ~2KB (tree-shaken) | Date calculations for Top 3 |

**Total new bundle impact**: ~18KB gzipped (within 200KB constitution limit)

---

## Open Questions Resolved

| Question | Resolution |
|----------|------------|
| Which drag-and-drop library? | @dnd-kit/core - best performance + accessibility |
| How to handle 100+ tasks? | @tanstack/react-virtual with 50-task threshold |
| Multi-tab sync strategy? | Extend existing BroadcastChannel, last-write-wins |
| Undo deletion UX? | 5-second timer with toast; optimistic UI |
| Top 3 algorithm? | Score-based: deadline urgency + priority + age |
| Inline edit approach? | Click-to-edit with input element, Enter/Escape/blur |
