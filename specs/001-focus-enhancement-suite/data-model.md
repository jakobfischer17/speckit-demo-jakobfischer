# Data Model: Focus Enhancement Suite

**Date**: 2026-01-26  
**Storage**: IndexedDB (database name: `productivity-hub`)

## Database Schema

### Database: `productivity-hub` (version 1)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        productivity-hub                              │
├─────────────────────────────────────────────────────────────────────┤
│  Object Store: sessions                                              │
│  ├── keyPath: id (auto-generated UUID)                              │
│  ├── index: byDate (timestamp) - for date range queries             │
│  └── index: byType (type) - for filtering work vs break             │
├─────────────────────────────────────────────────────────────────────┤
│  Object Store: stats                                                 │
│  └── keyPath: id (singleton: "user-stats")                          │
├─────────────────────────────────────────────────────────────────────┤
│  Object Store: achievements                                          │
│  └── keyPath: type (milestone identifier)                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Entities

### FocusSession

Represents a single completed pomodoro session (work or break).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | UUID v4, auto-generated |
| `timestamp` | number | Yes | Unix timestamp (ms) when session completed |
| `duration` | number | Yes | Duration in seconds (e.g., 1500 for 25min) |
| `type` | string | Yes | Enum: `"work"` \| `"shortBreak"` \| `"longBreak"` |
| `completedAt` | string | Yes | ISO 8601 date string for human readability |

**Example**:
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "timestamp": 1737878400000,
  "duration": 1500,
  "type": "work",
  "completedAt": "2026-01-26T10:00:00.000Z"
}
```

**Validation Rules**:
- `duration` must be positive integer
- `type` must be one of the enum values
- `timestamp` must be valid Unix timestamp

**Retention Policy**: Sessions older than 30 days are automatically deleted during cleanup operations. Aggregate totals remain in UserStats.

---

### UserStats

Singleton record containing lifetime aggregate statistics.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Always `"user-stats"` (singleton pattern) |
| `totalPomodoros` | number | Yes | Lifetime count of completed work sessions |
| `totalFocusTime` | number | Yes | Lifetime focus time in seconds |
| `currentStreak` | number | Yes | Current consecutive days with at least 1 pomodoro |
| `longestStreak` | number | Yes | Best streak ever achieved |
| `lastActiveDate` | string | Yes | ISO 8601 date (YYYY-MM-DD) of last activity |
| `dailyHistory` | object | Yes | Map of date → focus time for recent days |
| `updatedAt` | number | Yes | Unix timestamp of last update |

**Example**:
```json
{
  "id": "user-stats",
  "totalPomodoros": 142,
  "totalFocusTime": 213000,
  "currentStreak": 5,
  "longestStreak": 12,
  "lastActiveDate": "2026-01-26",
  "dailyHistory": {
    "2026-01-26": 5400,
    "2026-01-25": 3600,
    "2026-01-24": 7200,
    "2026-01-23": 1800,
    "2026-01-22": 2700,
    "2026-01-21": 4500,
    "2026-01-20": 3000
  },
  "updatedAt": 1737878400000
}
```

**Computed Properties** (derived in UI, not stored):
- `formattedTotalTime`: Convert seconds to "X hours Y minutes"
- `averageDailyFocus`: `totalFocusTime / days since first session`
- `todayFocusTime`: `dailyHistory[today] || 0`

**Streak Calculation Logic**:
1. On session completion, check if `lastActiveDate` is today
2. If today: increment totals only (streak unchanged)
3. If yesterday: increment `currentStreak`, update `lastActiveDate`
4. If older: reset `currentStreak` to 1, update `lastActiveDate`
5. If `currentStreak > longestStreak`: update `longestStreak`

---

### Achievement

Represents a milestone the user has unlocked.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Enum: `"10-pomodoros"` \| `"25-pomodoros"` \| `"50-pomodoros"` \| `"100-pomodoros"` |
| `unlockedAt` | number | Yes | Unix timestamp when achievement was earned |
| `pomodoroCount` | number | Yes | Total pomodoros at time of unlock |
| `displayed` | boolean | Yes | Whether celebration has been shown |

**Example**:
```json
{
  "type": "10-pomodoros",
  "unlockedAt": 1737878400000,
  "pomodoroCount": 10,
  "displayed": true
}
```

**Milestone Thresholds**:
| Type | Threshold | Celebration Level |
|------|-----------|-------------------|
| `10-pomodoros` | 10 | Standard confetti |
| `25-pomodoros` | 25 | Enhanced confetti + sound |
| `50-pomodoros` | 50 | Grand confetti |
| `100-pomodoros` | 100 | "Grand Master" special |

---

### AudioTrack (In-Memory Only)

Static configuration for available audio tracks. Not persisted to IndexedDB.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `name` | string | Yes | Display name |
| `category` | string | Yes | Enum: `"binaural"` \| `"ambient"` |
| `description` | string | Yes | Brief explanation of the track |
| `config` | object | Yes | Category-specific configuration |

**Binaural Config**:
```typescript
{
  baseFrequency: number,  // Hz, e.g., 200
  beatFrequency: number,  // Hz difference, e.g., 10 for alpha
  waveType: "sine"
}
```

**Ambient Config**:
```typescript
{
  youtubeId: string,      // YouTube video ID
  startTime?: number      // Optional start position in seconds
}
```

**Example Tracks**:
```json
[
  {
    "id": "alpha-focus",
    "name": "Alpha Waves (Focus)",
    "category": "binaural",
    "description": "10Hz beat for relaxed alertness",
    "config": { "baseFrequency": 200, "beatFrequency": 10, "waveType": "sine" }
  },
  {
    "id": "lofi-ambient",
    "name": "Lo-fi Beats",
    "category": "ambient",
    "description": "Chill beats for concentration",
    "config": { "youtubeId": "jfKfPfyJRdk" }
  }
]
```

---

## State Transitions

### Session Lifecycle

```
[Timer Running] 
      │
      ▼ (timer reaches 0)
[Session Complete]
      │
      ├──▶ Create FocusSession record
      ├──▶ Update UserStats (totals, streak)
      ├──▶ Check milestone thresholds
      │         │
      │         ▼ (threshold reached)
      │    [Create/Update Achievement]
      │         │
      │         ▼ (displayed: false)
      │    [Trigger Celebration]
      │         │
      │         ▼
      │    [Mark displayed: true]
      │
      ▼
[Ready for Next Session]
```

### Streak State Machine

```
                    ┌────────────────────┐
                    │   No Activity      │
                    │  (currentStreak=0) │
                    └─────────┬──────────┘
                              │ first pomodoro
                              ▼
                    ┌────────────────────┐
              ┌────▶│   Active Streak    │◀────┐
              │     │ (currentStreak≥1)  │     │
              │     └─────────┬──────────┘     │
              │               │                │
    pomodoro  │    ┌──────────┴──────────┐     │ pomodoro
    same day  │    │                     │     │ next day
              │    ▼                     ▼     │
        ┌─────┴────────┐         ┌─────────────┴┐
        │ Same Day     │         │ Next Day     │
        │ (no change)  │         │ (streak++)   │
        └──────────────┘         └──────────────┘
                              
              │ miss a day
              ▼
        ┌──────────────┐
        │ Streak Broken│
        │ (reset to 0) │
        └──────────────┘
```

---

## Data Operations

### Queries

| Operation | Input | Output | Index Used |
|-----------|-------|--------|------------|
| Get sessions for date range | startDate, endDate | FocusSession[] | `byDate` |
| Get today's sessions | none (computed) | FocusSession[] | `byDate` |
| Get user stats | none | UserStats | keyPath |
| Get all achievements | none | Achievement[] | full scan |
| Get pending celebrations | none | Achievement[] where displayed=false | full scan |

### Mutations

| Operation | Input | Side Effects |
|-----------|-------|--------------|
| Record session | FocusSession data | Creates session, updates stats, checks milestones |
| Mark achievement displayed | achievement type | Updates displayed flag |
| Cleanup old sessions | none | Deletes sessions > 30 days |

### Cleanup Strategy

**When**: On app initialization and after each session completion  
**Logic**:
1. Calculate cutoff date (now - 30 days)
2. Open cursor on `byDate` index
3. Delete all sessions with `timestamp < cutoff`
4. Aggregate deleted sessions' focus time is preserved in UserStats

---

## Multi-Tab Synchronization

Using BroadcastChannel API for cross-tab communication.

**Channel Name**: `productivity-hub-sync`

**Message Types**:
```typescript
type SyncMessage = 
  | { type: "SESSION_ADDED", session: FocusSession }
  | { type: "STATS_UPDATED", stats: UserStats }
  | { type: "ACHIEVEMENT_UNLOCKED", achievement: Achievement }
```

**Sync Flow**:
1. Tab A completes pomodoro → writes to IndexedDB
2. Tab A broadcasts `SESSION_ADDED` message
3. Tab B receives message → refreshes stats from IndexedDB
4. Tab B updates UI with new data
