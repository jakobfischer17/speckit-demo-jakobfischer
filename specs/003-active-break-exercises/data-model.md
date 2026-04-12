# Data Model: Active Break Exercises
**Phase 1 Output** | Branch: `003-active-break-exercises` | Date: 2026-04-12

---

## Entities

### Exercise

Represents a single exercise entry in the static catalogue.

```js
// src/data/exercises.js
{
  id: string,               // Unique slug, e.g. "push-ups"
  name: string,             // Display name, e.g. "Push-ups"
  category: 'Light' | 'Intense' | 'Stretch',
  targetType: 'reps' | 'duration',
  targetValue: number,      // Rep count OR seconds
  animationFile: string,    // Filename in src/assets/animations/exercises/, e.g. "push-ups.json"
  instructions: string[],   // Step-by-step cues, 2–4 items
  coolDownRequired: boolean,// true for all Intense exercises
  coolDownPattern: string | null, // key of breathing pattern (e.g. 'relax'), null if not required
}
```

**Validation rules**:
- `targetValue` MUST be a positive integer.
- `targetType === 'reps'` → `targetValue` represents rep count (1–50).
- `targetType === 'duration'` → `targetValue` represents seconds (5–300).
- `coolDownRequired === true` REQUIRES `coolDownPattern !== null`.
- `category === 'Intense'` MUST have `coolDownRequired === true`.
- `animationFile` MUST resolve to a valid `.json` file in the animations directory.

---

### BreathingPattern

Reused from existing `BreathingExercise` logic, extracted to `src/data/breathingPatterns.js`.

```js
{
  key: string,             // e.g. 'box', 'relax', 'energize'
  name: string,            // Display name
  description: string,
  phases: [
    {
      name: 'inhale' | 'hold' | 'exhale',
      duration: number,    // seconds
      instruction: string, // e.g. 'Breathe In'
    }
  ]
}
```

**State transitions**: inhale → hold? → exhale → hold? → inhale (cycles indefinitely or until stopped).

---

### ActiveBreakSession (runtime state, not persisted)

Holds the in-progress session state. Lives in `useExerciseSession` hook.

```js
{
  exercises: Exercise[],        // Filtered/selected exercise list for this session
  currentIndex: number,         // Index into exercises array
  phase: 'library'              // browsing the exercise library
        | 'exercising'          // exercise animation + counter running
        | 'cooldown'            // breathing cool-down in progress
        | 'complete',           // exercise complete, awaiting next action
  completedIds: string[],       // IDs of exercises completed this session
  sessionStartedAt: number | null, // Date.now() when first exercise started
}
```

**State transition rules**:
```
library ──(start exercise)──► exercising
exercising ──(counter reaches 0, coolDownRequired)──► cooldown
exercising ──(counter reaches 0, !coolDownRequired)──► complete
exercising ──(skip)──────────────────────────────────► library
cooldown ──(cool-down ends)──► complete
cooldown ──(skip cool-down)──► complete
complete ──(next exercise)──► exercising
complete ──(back to library)──► library
```

---

### PomodoroBreakSignal (inter-component contract)

Slim data shape passed via `onModeChange` callback from `PomodoroTimer` to `App.jsx`.

```js
{
  mode: 'work' | 'shortBreak' | 'longBreak',
  previousMode: 'work' | 'shortBreak' | 'longBreak',
}
```

`App.jsx` surfaces an Active Break prompt when `mode` is `'shortBreak'` or `'longBreak'` and `previousMode` was `'work'`.

---

## Relationships

```
App.jsx
  ├─ PomodoroTimer  ──(onModeChange)──► App.jsx holds isOnBreak: boolean
  └─ ActiveBreak
       ├─ ExerciseLibrary  ──(exercises[])──► derived from exercises.js + filter state
       └─ ExercisePlayer
            ├─ LottieAnimation  ──(animationData)──► exercises[i].animationFile (JSON)
            └─ BreathingCoolDown  ──(pattern)──► breathingPatterns[coolDownPattern]
                  └─ uses useBreathingTimer hook (shared with BreathingExercise.jsx)
```

---

## File Locations

| Entity / Data | File |
|---|---|
| Exercise catalogue | `src/data/exercises.js` |
| Breathing patterns | `src/data/breathingPatterns.js` |
| Session state hook | `src/hooks/useExerciseSession.js` |
| Exercise timer hook | `src/hooks/useExerciseTimer.js` |
| Breathing timer hook | `src/hooks/useBreathingTimer.js` (extracted from BreathingExercise.jsx) |
| Lottie animation JSONs | `src/assets/animations/exercises/*.json` |
