# Data Model: Daily Planner & Task Management

**Feature**: 002-daily-planner  
**Date**: 2026-01-27  
**Storage**: IndexedDB via `idb` wrapper (extend existing `productivity-hub` database)

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                           Task                                   │
├─────────────────────────────────────────────────────────────────┤
│ id: string (UUID)                    [Primary Key]              │
│ title: string                        [Required, 1-500 chars]    │
│ createdAt: number                    [Timestamp, indexed]       │
│ dueDate: number | null               [Timestamp, indexed]       │
│ priority: 'high' | 'medium' | 'low'  [Default: 'medium', indexed]│
│ completedAt: number | null           [Timestamp, indexed]       │
│ manualOrder: number                  [Float for reordering]     │
│ eisenhowerQuadrant: string | null    [Optional]                 │
│ riceScores: RICEScores | null        [Optional]                 │
│ updatedAt: number                    [Timestamp]                │
├─────────────────────────────────────────────────────────────────┤
│ Indexes: byDueDate, byPriority, byCreatedAt, byCompleted,       │
│          byManualOrder                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ (after 7 days completed)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       ArchivedTask                               │
├─────────────────────────────────────────────────────────────────┤
│ id: string (UUID)                    [Primary Key, from Task]   │
│ title: string                        [From original task]       │
│ createdAt: number                    [From original task]       │
│ completedAt: number                  [When completed]           │
│ archivedAt: number                   [When archived, indexed]   │
│ priority: string                     [From original task]       │
│ originalDueDate: number | null       [Preserved for history]    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       RICEScores (embedded)                      │
├─────────────────────────────────────────────────────────────────┤
│ reach: number                        [1-10]                     │
│ impact: number                       [1-5]                      │
│ confidence: number                   [0.1-1.0]                  │
│ effort: number                       [1-10, minimum 1]          │
│ score: number                        [Computed: R*I*C/E]        │
│ updatedAt: number                    [When last scored]         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Top3Focus (runtime only)                      │
├─────────────────────────────────────────────────────────────────┤
│ taskIds: string[]                    [3 task IDs]               │
│ generatedAt: number                  [Timestamp]                │
│ dismissedIds: string[]               [User-dismissed tasks]     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Task Entity

### Schema Definition

```typescript
interface Task {
  // Identity
  id: string;                    // UUID v4, generated on creation
  
  // Core fields
  title: string;                 // 1-500 characters, trimmed
  createdAt: number;             // Unix timestamp (ms)
  updatedAt: number;             // Unix timestamp (ms), auto-updated
  
  // Scheduling
  dueDate: number | null;        // Unix timestamp (ms), nullable
  
  // Prioritization
  priority: 'high' | 'medium' | 'low';  // Default: 'medium'
  eisenhowerQuadrant: 'do-first' | 'schedule' | 'delegate' | 'eliminate' | null;
  riceScores: RICEScores | null;
  
  // Status
  completedAt: number | null;    // Unix timestamp when completed, null if active
  
  // Ordering
  manualOrder: number;           // Float for fractional ordering
}
```

### Field Validations

| Field | Validation Rules |
|-------|-----------------|
| `id` | UUID v4 format, immutable after creation |
| `title` | Non-empty, 1-500 chars, trimmed whitespace |
| `createdAt` | Immutable after creation |
| `dueDate` | Must be valid timestamp or null; no past date restriction |
| `priority` | Enum: 'high', 'medium', 'low' |
| `eisenhowerQuadrant` | Enum or null; setting quadrant updates priority |
| `completedAt` | null (active) or valid timestamp (completed) |
| `manualOrder` | Positive float; recalculated on reorder |

### Priority-Quadrant Mapping

```javascript
const QUADRANT_PRIORITY_MAP = {
  'do-first': 'high',      // Urgent + Important
  'schedule': 'medium',    // Important, not urgent
  'delegate': 'low',       // Urgent, not important
  'eliminate': 'low',      // Neither urgent nor important
};
```

---

## RICE Scores Entity (Embedded)

```typescript
interface RICEScores {
  reach: number;        // 1-10: How many people/uses affected
  impact: number;       // 1-5: Minimal(1) to Massive(5)
  confidence: number;   // 0.1-1.0: 10%-100% certainty
  effort: number;       // 1-10: Person-days (minimum 1)
  score: number;        // Computed: (reach * impact * confidence) / effort
  updatedAt: number;    // Timestamp of last score update
}
```

### Computed Score Formula

```javascript
function computeRICEScore(scores) {
  const { reach, impact, confidence, effort } = scores;
  return (reach * impact * confidence) / Math.max(effort, 1);
}
```

---

## Archived Task Entity

```typescript
interface ArchivedTask {
  id: string;              // Original task ID preserved
  title: string;           // Original title
  createdAt: number;       // Original creation date
  completedAt: number;     // When marked complete
  archivedAt: number;      // When moved to archive (7 days after completion)
  priority: string;        // Original priority at completion
  originalDueDate: number | null;  // Original due date preserved
}
```

### Archive Trigger

Tasks are archived automatically when:
```javascript
const ARCHIVE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function shouldArchive(task) {
  if (!task.completedAt) return false;
  const age = Date.now() - task.completedAt;
  return age >= ARCHIVE_THRESHOLD_MS;
}
```

---

## IndexedDB Schema

### Database Configuration

```javascript
const DB_NAME = 'productivity-hub';
const DB_VERSION = 2;  // Upgraded from 1
```

### Object Stores

```javascript
upgrade(db, oldVersion) {
  // Existing stores from v1 (preserved)
  // - sessions
  // - stats  
  // - achievements

  if (oldVersion < 2) {
    // NEW: Tasks store
    const tasksStore = db.createObjectStore('tasks', { keyPath: 'id' });
    tasksStore.createIndex('byDueDate', 'dueDate');
    tasksStore.createIndex('byPriority', 'priority');
    tasksStore.createIndex('byCreatedAt', 'createdAt');
    tasksStore.createIndex('byCompleted', 'completedAt');
    tasksStore.createIndex('byManualOrder', 'manualOrder');
    
    // NEW: Archived tasks store
    const archiveStore = db.createObjectStore('archivedTasks', { keyPath: 'id' });
    archiveStore.createIndex('byArchivedAt', 'archivedAt');
  }
}
```

### Index Usage

| Operation | Index Used |
|-----------|-----------|
| Get today's tasks | `byDueDate` with range query |
| Sort by priority | `byPriority` |
| Sort by creation | `byCreatedAt` |
| Get completed tasks | `byCompleted` with range for 7-day window |
| Manual ordering | `byManualOrder` |
| Archive history | `byArchivedAt` for pagination |

---

## Manual Order Strategy

### Fractional Indexing

Uses fractional values for O(1) reordering without shifting all items:

```javascript
// Initial order: 1.0, 2.0, 3.0, 4.0
// Move task 4 between 1 and 2:
// New order: 1.0, 1.5, 2.0, 3.0

function calculateNewOrder(beforeOrder, afterOrder) {
  if (beforeOrder === null) return afterOrder - 1;  // Insert at start
  if (afterOrder === null) return beforeOrder + 1;  // Insert at end
  return (beforeOrder + afterOrder) / 2;            // Insert between
}
```

### Rebalancing

When precision becomes a concern (many insertions between same items):

```javascript
// Rebalance when gap < 0.0001
function shouldRebalance(gap) {
  return gap < 0.0001;
}

function rebalanceOrders(tasks) {
  return tasks.map((task, index) => ({
    ...task,
    manualOrder: (index + 1) * 1.0,
  }));
}
```

---

## State Transitions

### Task Lifecycle

```
                    ┌──────────────┐
                    │   Created    │
                    │ (active)     │
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │  Edited  │    │ Reordered │   │ Deleted  │
    │          │    │           │   │ (5s undo)│
    └────┬─────┘    └─────┬─────┘   └────┬─────┘
         │                │              │
         └────────────────┼──────────────┘
                          │
                          ▼
                    ┌──────────────┐
                    │  Completed   │
                    │ (7-day vis)  │
                    └──────┬───────┘
                           │
                           │ (after 7 days)
                           ▼
                    ┌──────────────┐
                    │   Archived   │
                    │ (history)    │
                    └──────────────┘
```

### Priority Transitions via Eisenhower

```
┌─────────────────────────────────────────────────────────────┐
│                   Eisenhower Matrix                          │
├──────────────────────┬──────────────────────────────────────┤
│                      │         IMPORTANT                     │
│                      ├─────────────────┬────────────────────┤
│                      │      Yes        │       No           │
├──────────────────────┼─────────────────┼────────────────────┤
│ U  │    Yes          │   DO FIRST      │    DELEGATE        │
│ R  │                 │   → high        │    → low           │
│ G  ├─────────────────┼─────────────────┼────────────────────┤
│ E  │    No           │   SCHEDULE      │    ELIMINATE       │
│ N  │                 │   → medium      │    → low           │
│ T  │                 │                 │                    │
└────┴─────────────────┴─────────────────┴────────────────────┘
```

---

## Sample Data

### Task Example

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Review quarterly report",
  "createdAt": 1706313600000,
  "updatedAt": 1706313600000,
  "dueDate": 1706400000000,
  "priority": "high",
  "eisenhowerQuadrant": "do-first",
  "riceScores": null,
  "completedAt": null,
  "manualOrder": 1.0
}
```

### Task with RICE Scores

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Implement user feedback feature",
  "createdAt": 1706227200000,
  "updatedAt": 1706313600000,
  "dueDate": null,
  "priority": "medium",
  "eisenhowerQuadrant": "schedule",
  "riceScores": {
    "reach": 8,
    "impact": 4,
    "confidence": 0.8,
    "effort": 5,
    "score": 5.12,
    "updatedAt": 1706313600000
  },
  "completedAt": null,
  "manualOrder": 2.0
}
```

### Archived Task Example

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "title": "Send meeting notes",
  "createdAt": 1705622400000,
  "completedAt": 1705708800000,
  "archivedAt": 1706313600000,
  "priority": "low",
  "originalDueDate": 1705708800000
}
```

---

## Query Patterns

### Get Today's Tasks

```javascript
async function getTodaysTasks() {
  const db = await getDB();
  const startOfDay = getStartOfDay(Date.now());
  const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;
  
  const range = IDBKeyRange.bound(startOfDay, endOfDay);
  const byDueDate = await db.getAllFromIndex('tasks', 'byDueDate', range);
  
  // Also include overdue tasks
  const overdueRange = IDBKeyRange.upperBound(startOfDay - 1);
  const overdue = await db.getAllFromIndex('tasks', 'byDueDate', overdueRange);
  
  return [...overdue, ...byDueDate].filter(t => !t.completedAt);
}
```

### Get Completed Tasks (7-day window)

```javascript
async function getCompletedTasks() {
  const db = await getDB();
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  
  const range = IDBKeyRange.lowerBound(sevenDaysAgo);
  return db.getAllFromIndex('tasks', 'byCompleted', range);
}
```

### Archive Old Completed Tasks

```javascript
async function archiveOldTasks() {
  const db = await getDB();
  const threshold = Date.now() - (7 * 24 * 60 * 60 * 1000);
  
  const range = IDBKeyRange.upperBound(threshold);
  const toArchive = await db.getAllFromIndex('tasks', 'byCompleted', range);
  
  const tx = db.transaction(['tasks', 'archivedTasks'], 'readwrite');
  
  for (const task of toArchive) {
    if (task.completedAt) {
      const archived = {
        id: task.id,
        title: task.title,
        createdAt: task.createdAt,
        completedAt: task.completedAt,
        archivedAt: Date.now(),
        priority: task.priority,
        originalDueDate: task.dueDate,
      };
      await tx.objectStore('archivedTasks').put(archived);
      await tx.objectStore('tasks').delete(task.id);
    }
  }
  
  await tx.done;
}
```
