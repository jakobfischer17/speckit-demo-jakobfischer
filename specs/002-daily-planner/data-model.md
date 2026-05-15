# Data Model: Daily Planner Validation & Supporting UX

**Feature**: 002-daily-planner  
**Date**: 2026-03-10  
**Storage**: IndexedDB via `idb` wrapper for planner data; in-memory runtime state for UI-only focus/breathing selections

---

## Core Domain Entities

### Task

Represents a single actionable planner item.

| Field | Type | Rules |
|------|------|-------|
| `id` | string | UUID, immutable |
| `title` | string | Required, trimmed, 1-500 chars |
| `createdAt` | number | Unix ms timestamp, immutable |
| `updatedAt` | number | Unix ms timestamp, auto-updated |
| `dueDate` | number \| null | Defaults to end-of-day for quick-add |
| `priority` | `'high' \| 'medium' \| 'low'` | Default `'medium'` |
| `completedAt` | number \| null | Null for active tasks |
| `manualOrder` | number | Fractional ordering value |
| `eisenhowerQuadrant` | `'do-first' \| 'schedule' \| 'delegate' \| 'eliminate' \| null` | Optional, drives priority |
| `riceScores` | `RICEScores \| null` | Optional |

**Relationships**

- A Task may have zero or one `RICEScores` value object.
- A completed Task may later transition into an `ArchivedTask`.
- A Task may appear in a generated `Top3FocusSet`.

**Validation Rules**

- Empty or whitespace-only titles are invalid.
- `createdAt` must remain unchanged after creation.
- `manualOrder` must always be sortable and gap-tolerant.
- `completedAt` toggles whether the task belongs to active or completed collections.

---

### RICEScores

Embedded prioritization metrics stored on a task.

| Field | Type | Rules |
|------|------|-------|
| `reach` | number | 1-10 |
| `impact` | number | 1-5 |
| `confidence` | number | 0.1-1.0 |
| `effort` | number | Minimum 1 |
| `score` | number | Computed as `(reach * impact * confidence) / effort` |
| `updatedAt` | number | Unix ms timestamp |

---

### ArchivedTask

Historical representation of a completed task moved out of the active planner after the retention window.

| Field | Type | Rules |
|------|------|-------|
| `id` | string | Same identifier as original task |
| `title` | string | Preserved from task |
| `createdAt` | number | Preserved from task |
| `completedAt` | number | Required |
| `archivedAt` | number | Unix ms timestamp |
| `priority` | string | Preserved from task |
| `originalDueDate` | number \| null | Preserved from task |

**State Transition**

- `Task (completedAt != null)` -> `ArchivedTask` after 7 days via `archiveOldTasks()`.

---

### Top3FocusSet

Runtime-only selection representing the current top-three recommendation set.

| Field | Type | Rules |
|------|------|-------|
| `taskIds` | string[] | Up to 3 active task IDs |
| `generatedAt` | number | Unix ms timestamp |
| `dismissedIds` | string[] | Tracks replacements within the same generation window |

**Selection Order**

- Overdue tasks
- Due today
- Due this week
- Higher priority
- Older creation date as final tie-breaker

---

## Runtime Interaction Entities

### TaskBroadcastEvent

Represents a cross-tab synchronization message emitted through BroadcastChannel.

| Field | Type | Rules |
|------|------|-------|
| `type` | string | One of `TASK_CREATED`, `TASK_UPDATED`, `TASK_DELETED`, `TASKS_REORDERED`, `FULL_SYNC` |
| `task` | Task \| undefined | Present for create/update |
| `taskId` | string \| undefined | Present for delete |
| `taskIds` | string[] \| undefined | Present for reorder |
| `tasks` | Task[] \| undefined | Present for full sync |

**Validation Rules**

- Payload shape must match event type.
- Consumers must ignore unknown event types safely.
- Reorder/full-sync events may trigger a storage refresh instead of optimistic merge.

---

### BreathingRoutine

Declarative configuration for one breathing exercise mode.

| Field | Type | Rules |
|------|------|-------|
| `key` | `'box' \| 'relax' \| 'energize'` | Unique routine id |
| `name` | string | User-facing label |
| `description` | string | Explains the pacing/visual cue |
| `visual` | `'box' \| 'relax' \| 'energize'` | Determines visual renderer |
| `phases` | `BreathingPhase[]` | Non-empty ordered list |

### BreathingPhase

| Field | Type | Rules |
|------|------|-------|
| `name` | `'inhale' \| 'hold' \| 'exhale'` | Phase type |
| `duration` | number | Whole seconds, > 0 |
| `instruction` | string | User-facing cue |

### BreathingSessionState

Runtime UI state for the breathing component.

| Field | Type | Rules |
|------|------|-------|
| `exerciseType` | string | Active routine key |
| `isActive` | boolean | Interval running or paused |
| `currentPhaseIndex` | number | Valid index within routine phases |
| `seconds` | number | Elapsed seconds inside current phase |

**State Transitions**

- `paused` -> `active` when Start is pressed.
- `active` -> next phase when `seconds === duration - 1`.
- Routine change resets `isActive`, `currentPhaseIndex`, and `seconds` to initial state.

---

## Storage Schema Notes

### IndexedDB Stores

- `sessions`
- `stats`
- `achievements`
- `tasks`
- `archivedTasks`

### Task Indexes

- `byDueDate`
- `byPriority`
- `byCreatedAt`
- `byCompleted`
- `byManualOrder`

### Archived Task Indexes

- `byArchivedAt`

---

## Test-Relevant Invariants

- Legacy databases must upgrade before any task CRUD call runs.
- Task creation defaults to today's due date and medium priority unless specified otherwise.
- Completed tasks move out of the active list but remain visible in a completed collection until archived.
- Undo-delete restores the original task payload if the timeout window has not elapsed.
- Breathing countdown and phase transitions must be deterministic under mocked timers.
