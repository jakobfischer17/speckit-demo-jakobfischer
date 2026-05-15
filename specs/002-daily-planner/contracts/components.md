# Component & Service Contracts: Daily Planner Validation & Supporting UX

**Feature**: 002-daily-planner  
**Date**: 2026-03-10  
**Purpose**: Document the internal contracts that planner, sync, breathing, and deterministic tests must rely on

---

## Component Hierarchy

```text
App.jsx
├── DailyPlanner/
│   ├── TodayView
│   │   ├── QuickAdd
│   │   └── TaskList
│   │       └── TaskItem (n)
│   ├── SortControls
│   ├── CompletedSection
│   │   └── TaskItem (n, completed variant)
│   └── UndoToast
├── PrioritizationTools/
│   ├── EisenhowerMatrix
│   ├── TopThreeFocus
│   └── RiceScoring
└── BreathingExercise
```

---

## Hook Contract

### `useTasks()`

Primary state coordinator for planner data and multi-tab synchronization.

```ts
interface UseTasksReturn {
  tasks: Task[]
  completedTasks: Task[]
  isLoading: boolean
  error: Error | null
  pendingDelete: { task: Task; expiresAt: number } | null

  createTask: (title: string, options?: { dueDate?: number | null; priority?: 'high' | 'medium' | 'low' }) => Promise<Task>
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>
  deleteTask: (id: string) => void
  undoDelete: () => void
  toggleComplete: (id: string) => Promise<Task | undefined>
  reorderTasks: (activeId: string, overId: string) => Promise<void>
  refreshTasks: () => Promise<void>
}
```

**Behavioral Guarantees**

- Loads active + completed tasks on mount.
- Subscribes to task BroadcastChannel updates and reconciles local state.
- Deletes are optimistic in the UI and become permanent only after the undo timer expires.
- Reorder calls may optimistically update the task list before persistence completes.

---

## Service Contract

### `taskService.js`

Storage and sync boundary for planner operations.

```ts
createTask(taskData) => Promise<Task>
getTask(id) => Promise<Task | undefined>
updateTask(id, updates) => Promise<Task>
deleteTask(id) => Promise<void>
getAllTasks() => Promise<Task[]>
getTodaysTasks() => Promise<Task[]>
getCompletedTasks() => Promise<Task[]>
getOverdueTasks() => Promise<Task[]>
getTasksByQuadrant(quadrant) => Promise<Task[]>
getUnassignedTasks() => Promise<Task[]>
reorderTasks(activeId, overId, currentTasks) => Promise<void>
archiveOldTasks() => Promise<number>
getArchivedTasks(limit?, offset?) => Promise<ArchivedTask[]>
subscribeToTaskBroadcast(callback) => () => void
broadcastTaskChange(event) => void
```

**Storage Guarantees**

- All methods must use the shared `getDB()` initializer from `db.js`.
- Legacy databases must upgrade before CRUD operations touch task stores.
- Task mutations emit a BroadcastChannel event after persistence.

---

## Broadcast Event Contract

```ts
type TaskBroadcastEvent =
  | { type: 'TASK_CREATED'; task: Task }
  | { type: 'TASK_UPDATED'; task: Task }
  | { type: 'TASK_DELETED'; taskId: string }
  | { type: 'TASKS_REORDERED'; taskIds: string[] }
  | { type: 'FULL_SYNC'; tasks: Task[] }
```

**Consumer Rules**

- Unknown event types must be ignored safely.
- `TASKS_REORDERED` may trigger a full refresh instead of manual merge.
- `FULL_SYNC` is authoritative and replaces active/completed task collections.

---

## Daily Planner UI Contract

### Quick Add

- Input must be reachable via an accessible label.
- `Enter` creates a task when the trimmed value is non-empty.
- `Escape` clears the draft without creating a task.

### Task Item

- Completion control must be keyboard reachable and semantically exposed as a checkbox/button.
- Inline editing must be triggered from the task title and expose an accessible edit field.
- Delete affordance must identify the task title in its accessible name.

### Undo Toast

- Undo feedback must render as an `alert`-like status element.
- Undo remains valid only until the pending-delete timeout expires.

---

## Breathing Exercise Contract

### User-Facing Contract

- Exercise selection is exposed through semantic buttons.
- Current instruction and countdown are always visible.
- Each routine renders a distinct visual guide tied to its phase pattern.

### Runtime Contract

```ts
interface BreathingExerciseState {
  exerciseType: 'box' | 'relax' | 'energize'
  isActive: boolean
  currentPhaseIndex: number
  seconds: number
}
```

### Testability Contract

- Phase advancement must be fully controllable via mocked timers.
- The active visual must remain easy to assert without depending on CSS class internals alone.
- Countdown and instruction text must be stable assertions for timer-based tests.
- Preferred future refinement: expose stable `data-phase`, `data-progress`, or equivalent metadata if visual assertions need to become less style-dependent.

---

## Verification Contract

### Deterministic Test Coverage Requirements

- `taskService.test.js` must protect legacy DB upgrade behavior and core CRUD reads/writes.
- `DailyPlanner.test.jsx` must cover quick-add, edit, completion, delete, and undo flows.
- `BreathingExercise.test.jsx` must cover exercise switching and timer-driven phase/countdown changes with fake timers.

### Build/Quality Requirements

- Production build must complete successfully.
- Touched files must not introduce new lint failures.
- Tests must stay isolated from external state and execution order.
