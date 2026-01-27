# Component Contracts: Daily Planner & Task Management

**Feature**: 002-daily-planner  
**Date**: 2026-01-27  
**Purpose**: Define component interfaces, props, and hook APIs

---

## Component Hierarchy

```
App.jsx
└── DailyPlanner/
    ├── TodayView
    │   ├── QuickAdd
    │   ├── TopThreeDisplay (from PrioritizationTools)
    │   └── TaskList
    │       └── TaskItem (×n)
    ├── SortControls
    └── CompletedSection
        └── TaskItem (×n, completed variant)

PrioritizationTools/
├── EisenhowerMatrix
│   └── QuadrantZone (×4)
│       └── TaskItem (×n, compact variant)
├── TopThreeFocus
│   └── FocusCard (×3)
└── RiceScoring
    └── RiceTaskRow (×n)

TaskHistory/
└── ArchivedTaskList
    └── ArchivedTaskItem (×n)
```

---

## Hooks API

### useTasks

Primary hook for task state management.

```typescript
interface UseTasksReturn {
  // State
  tasks: Task[];
  completedTasks: Task[];
  isLoading: boolean;
  error: Error | null;
  
  // Pending delete state (for undo)
  pendingDelete: { task: Task; expiresAt: number } | null;
  
  // Actions
  createTask: (title: string, options?: CreateTaskOptions) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => void;  // Triggers 5s undo window
  undoDelete: () => void;
  toggleComplete: (id: string) => Promise<Task>;
  reorderTasks: (activeId: string, overId: string) => Promise<void>;
  
  // Refresh
  refreshTasks: () => Promise<void>;
}

interface CreateTaskOptions {
  dueDate?: Date | null;
  priority?: 'high' | 'medium' | 'low';
}

// Usage
const { tasks, createTask, deleteTask, pendingDelete, undoDelete } = useTasks();
```

### useTaskSort

Sorting logic and state.

```typescript
interface UseTaskSortReturn {
  sortBy: SortOption;
  sortDirection: 'asc' | 'desc';
  isManualOrder: boolean;
  
  setSortBy: (option: SortOption) => void;
  toggleDirection: () => void;
  clearSort: () => void;  // Return to manual order
  
  sortedTasks: (tasks: Task[]) => Task[];
}

type SortOption = 'manual' | 'priority' | 'dueDate' | 'createdAt' | 'rice';

// Usage
const { sortBy, setSortBy, sortedTasks } = useTaskSort();
const displayTasks = sortedTasks(tasks);
```

### useDragAndDrop

dnd-kit wrapper with keyboard support.

```typescript
interface UseDragAndDropReturn {
  sensors: SensorDescriptor<any>[];
  activeId: string | null;
  
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleDragCancel: () => void;
}

// Usage
const { sensors, activeId, handleDragStart, handleDragEnd } = useDragAndDrop({
  onReorder: reorderTasks,
});
```

### useTop3Focus

Top 3 generator with dismissal.

```typescript
interface UseTop3FocusReturn {
  top3: FocusTask[];
  isGenerating: boolean;
  
  generate: () => void;
  dismiss: (taskId: string) => void;
  refresh: () => void;
}

interface FocusTask extends Task {
  focusScore: number;
  reasoning: string;
}

// Usage
const { top3, generate, dismiss } = useTop3Focus(tasks);
```

### useTaskArchive

Archive management.

```typescript
interface UseTaskArchiveReturn {
  archivedTasks: ArchivedTask[];
  isLoading: boolean;
  
  runArchive: () => Promise<number>;  // Returns count archived
  loadMore: () => Promise<void>;      // Pagination
  hasMore: boolean;
}

// Usage
const { archivedTasks, runArchive } = useTaskArchive();
```

---

## Component Props

### DailyPlanner

Root component for the planner section.

```typescript
interface DailyPlannerProps {
  // No required props - self-contained section
}

// Internal state via useTasks, useTaskSort, useDragAndDrop
```

### TodayView

Today's date header and task summary.

```typescript
interface TodayViewProps {
  tasks: Task[];
  top3?: FocusTask[];
  onQuickAdd: (title: string) => void;
}
```

### QuickAdd

Frictionless task input.

```typescript
interface QuickAddProps {
  onAdd: (title: string) => void;
  placeholder?: string;  // Default: "Add a task..."
  autoFocus?: boolean;   // Default: false
  disabled?: boolean;
}

// Behavior:
// - Enter: Submit if non-empty
// - Escape: Clear input
// - Empty submit: No action, stay focused
```

### TaskList

Virtualized task list container.

```typescript
interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onReorder?: (activeId: string, overId: string) => void;
  
  // Virtualization
  virtualize?: boolean;  // Auto-enabled when tasks.length > 50
  
  // Drag-and-drop context (provided by parent)
  isDragging?: boolean;
  activeId?: string | null;
}
```

### TaskItem

Individual task row.

```typescript
interface TaskItemProps {
  task: Task;
  onToggleComplete: () => void;
  onDelete: () => void;
  onEdit: (newTitle: string) => void;
  
  // Variants
  variant?: 'default' | 'compact' | 'completed';
  
  // Drag state
  isDragging?: boolean;
  isOver?: boolean;
  
  // Display options
  showPriorityBadge?: boolean;
  showDueDate?: boolean;
  showRiceScore?: boolean;
}

// CSS classes based on state:
// .task-item
// .task-item--dragging
// .task-item--over
// .task-item--completed
// .task-item--high-priority
// .task-item--overdue
```

### SortControls

Sorting UI.

```typescript
interface SortControlsProps {
  currentSort: SortOption;
  direction: 'asc' | 'desc';
  hasManualOrder: boolean;
  
  onSortChange: (option: SortOption) => void;
  onDirectionToggle: () => void;
  onClearSort: () => void;
}
```

### EisenhowerMatrix

2x2 priority matrix.

```typescript
interface EisenhowerMatrixProps {
  tasks: Task[];
  onQuadrantChange: (taskId: string, quadrant: EisenhowerQuadrant) => void;
}

type EisenhowerQuadrant = 'do-first' | 'schedule' | 'delegate' | 'eliminate';

// Quadrant labels:
// do-first: "Do First" (Urgent + Important)
// schedule: "Schedule" (Important, not Urgent)
// delegate: "Delegate" (Urgent, not Important)
// eliminate: "Eliminate" (Neither)
```

### QuadrantZone

Drop zone within matrix.

```typescript
interface QuadrantZoneProps {
  quadrant: EisenhowerQuadrant;
  tasks: Task[];
  label: string;
  description: string;
  
  // Drop zone state
  isOver?: boolean;
}
```

### TopThreeFocus

Top 3 generator UI.

```typescript
interface TopThreeFocusProps {
  tasks: Task[];
  top3: FocusTask[];
  
  onGenerate: () => void;
  onDismiss: (taskId: string) => void;
  onTaskClick: (taskId: string) => void;
}
```

### FocusCard

Individual focus task card.

```typescript
interface FocusCardProps {
  task: FocusTask;
  position: 1 | 2 | 3;
  
  onDismiss: () => void;
  onClick: () => void;
}

// Displays:
// - Task title
// - Reasoning text
// - Position badge (1, 2, 3)
// - Dismiss button
```

### RiceScoring

RICE scoring interface.

```typescript
interface RiceScoringProps {
  tasks: Task[];
  onScoreUpdate: (taskId: string, scores: Partial<RICEScores>) => void;
  onSortByRice: () => void;
}
```

### RiceTaskRow

Task row with RICE inputs.

```typescript
interface RiceTaskRowProps {
  task: Task;
  onScoreChange: (field: keyof RICEScores, value: number) => void;
}

// Input ranges:
// reach: 1-10 (slider or number)
// impact: 1-5 (dropdown or buttons)
// confidence: 10-100% (slider, stored as 0.1-1.0)
// effort: 1-10 (slider or number)
```

### UndoToast

Delete undo notification.

```typescript
interface UndoToastProps {
  taskTitle: string;
  remainingSeconds: number;
  onUndo: () => void;
}

// Auto-dismisses after remainingSeconds
// Click "Undo" to restore task
```

### TaskHistory

Archived tasks viewer.

```typescript
interface TaskHistoryProps {
  // Self-contained, uses useTaskArchive internally
}
```

---

## Service Contracts

### taskService.js

```typescript
// CRUD Operations
export async function createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
export async function getTask(id: string): Promise<Task | undefined>;
export async function updateTask(id: string, updates: Partial<Task>): Promise<Task>;
export async function deleteTask(id: string): Promise<void>;

// Queries
export async function getAllTasks(): Promise<Task[]>;
export async function getTodaysTasks(): Promise<Task[]>;
export async function getCompletedTasks(): Promise<Task[]>;
export async function getOverdueTasks(): Promise<Task[]>;
export async function getTasksByQuadrant(quadrant: EisenhowerQuadrant): Promise<Task[]>;

// Batch Operations
export async function reorderTasks(orderedIds: string[]): Promise<void>;
export async function archiveOldTasks(): Promise<number>;

// Archive
export async function getArchivedTasks(limit?: number, offset?: number): Promise<ArchivedTask[]>;

// Broadcast
export function subscribeToTaskBroadcast(callback: (event: TaskBroadcastEvent) => void): () => void;
export function broadcastTaskChange(event: TaskBroadcastEvent): void;
```

### Broadcast Event Types

```typescript
type TaskBroadcastEvent =
  | { type: 'TASK_CREATED'; task: Task }
  | { type: 'TASK_UPDATED'; task: Task }
  | { type: 'TASK_DELETED'; taskId: string }
  | { type: 'TASK_COMPLETED'; taskId: string; completedAt: number }
  | { type: 'TASKS_REORDERED'; taskIds: string[] }
  | { type: 'FULL_SYNC'; tasks: Task[] };
```

---

## CSS Class Conventions

Following existing project patterns:

```css
/* Component-scoped prefixes */
.daily-planner { }
.daily-planner__header { }
.daily-planner__content { }

.today-view { }
.today-view__date { }
.today-view__summary { }

.task-list { }
.task-list__container { }
.task-list--virtualized { }

.task-item { }
.task-item__checkbox { }
.task-item__title { }
.task-item__actions { }
.task-item--dragging { }
.task-item--completed { }
.task-item--high-priority { }

.quick-add { }
.quick-add__input { }
.quick-add__input:focus { }

.sort-controls { }
.sort-controls__button { }
.sort-controls__button--active { }

.eisenhower-matrix { }
.eisenhower-matrix__grid { }
.quadrant-zone { }
.quadrant-zone__header { }
.quadrant-zone--do-first { }
.quadrant-zone--schedule { }
.quadrant-zone--delegate { }
.quadrant-zone--eliminate { }
.quadrant-zone--drag-over { }

.top-three { }
.focus-card { }
.focus-card__position { }
.focus-card__reasoning { }

.rice-scoring { }
.rice-task-row { }
.rice-task-row__input { }
.rice-task-row__score { }

.undo-toast { }
.undo-toast__message { }
.undo-toast__button { }
.undo-toast--visible { }
```

---

## Accessibility Requirements

### Keyboard Navigation

| Component | Keys | Action |
|-----------|------|--------|
| QuickAdd | Enter | Submit task |
| QuickAdd | Escape | Clear input |
| TaskItem | Space | Toggle complete |
| TaskItem | Enter | Edit mode |
| TaskItem | Delete | Delete task |
| TaskItem (edit) | Enter | Save edit |
| TaskItem (edit) | Escape | Cancel edit |
| TaskList (drag) | Space | Pick up/drop |
| TaskList (drag) | Arrow keys | Move position |
| TaskList (drag) | Escape | Cancel drag |
| SortControls | Enter/Space | Activate sort option |

### ARIA Attributes

```jsx
// TaskList
<ul role="list" aria-label="Tasks">

// TaskItem
<li role="listitem" aria-label={task.title}>
  <input type="checkbox" aria-label={`Mark ${task.title} complete`} />

// Draggable
<div 
  role="button"
  aria-roledescription="sortable"
  aria-describedby="drag-instructions"
/>

// EisenhowerMatrix quadrant
<div 
  role="region"
  aria-label="Do First - Urgent and Important tasks"
  aria-dropeffect="move"
/>

// UndoToast
<div role="alert" aria-live="polite">
```

---

## Animation Specifications

All animations use `transform` and `opacity` only (constitution requirement).

```css
/* Task completion */
.task-item--completing {
  animation: complete 300ms ease-out forwards;
}

@keyframes complete {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); opacity: 0.7; }
}

/* Drag lift */
.task-item--dragging {
  transform: scale(1.02);
  opacity: 0.9;
  box-shadow: var(--shadow-lg);
}

/* Drop insertion */
.task-item--shifting {
  transition: transform 200ms ease-out;
}

/* List reorder */
.task-list__item-enter {
  opacity: 0;
  transform: translateY(-10px);
}
.task-list__item-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 200ms ease-out;
}

/* Undo toast */
.undo-toast {
  transform: translateY(100%);
  opacity: 0;
  transition: all 300ms ease-out;
}
.undo-toast--visible {
  transform: translateY(0);
  opacity: 1;
}
```
