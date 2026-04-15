# UI Contracts: Active Break Exercises
**Phase 1 Output** | Branch: `003-active-break-exercises` | Date: 2026-04-12

These contracts define the public prop interface each component exposes to its parent.
They serve as the integration boundary between components and as the basis for test assertions.

---

## `<ActiveBreak />`

Top-level container. Rendered by `App.jsx` as a tab panel.

```jsx
<ActiveBreak
  isBreakActive={boolean}   // true when Pomodoro is in a break phase; shows prompt banner
/>
```

**Internal behaviour**:
- Owns `ActiveBreakSession` state via `useExerciseSession`.
- Renders `<ExerciseLibrary>` when `session.phase === 'library'`.
- Renders `<ExercisePlayer>` when `session.phase === 'exercising' | 'cooldown' | 'complete'`.

**Emits**: nothing (self-contained).

---

## `<ExerciseLibrary />`

Browse + filter view. Receives the full exercise catalogue and selection callback.

```jsx
<ExerciseLibrary
  exercises={Exercise[]}             // Full catalogue from exercises.js
  completedIds={string[]}            // IDs completed this session (shown as ✓)
  onSelectExercise={(exercise) => void} // Called when user taps an exercise card
/>
```

**Internal behaviour**:
- Maintains `activeFilter: 'All' | 'Light' | 'Intense' | 'Stretch'` as local state.
- Derives `filteredExercises` via a pure filter function (no side effects).
- Shows empty-state message when `filteredExercises.length === 0`.

---

## `<ExerciseCard />`

Single exercise tile in the library grid.

```jsx
<ExerciseCard
  exercise={Exercise}
  completed={boolean}
  onClick={() => void}
/>
```

**Visual states**: default, hover/focus, completed (shows tick badge).

---

## `<ExercisePlayer />`

Full-screen exercise runner. Plays animation, shows counter, handles transitions.

```jsx
<ExercisePlayer
  exercise={Exercise}
  onComplete={() => void}   // Called when counter reaches 0 (before cool-down)
  onSkip={() => void}       // Called when user presses Skip
/>
```

**Internal behaviour**:
- Uses `useExerciseTimer(exercise)` hook for countdown state.
- Renders `<LottieAnimation animationFile={exercise.animationFile} />`.
- After `onComplete`, if `exercise.coolDownRequired`, renders `<BreathingCoolDown>` before calling `onComplete` externally; `onComplete` fires only after cool-down is dismissed or ends.

---

## `<BreathingCoolDown />`

Brief cool-down sequence post-Intense exercise. Reuses breathing timer logic.

```jsx
<BreathingCoolDown
  patternKey={string}        // Key into breathingPatterns, e.g. 'relax'
  onComplete={() => void}    // Called when pattern cycle ends (auto after ~60s)
  onSkip={() => void}        // Called when user presses Skip Cool-Down
/>
```

**Internal behaviour**:
- Uses `useBreathingTimer(patternKey)` hook (shared with BreathingExercise.jsx).
- Renders a simplified breathing circle animation (CSS, no Lottie) matching the existing BreathingExercise visual language.
- Auto-completes after one full pattern cycle (~30–60 seconds depending on pattern).

---

## `useExerciseSession` Hook Contract

```js
const {
  session,           // ActiveBreakSession
  startExercise,     // (exercise: Exercise) => void
  completeExercise,  // () => void
  skipExercise,      // () => void
  returnToLibrary,   // () => void
} = useExerciseSession(exercises)
```

---

## `useExerciseTimer` Hook Contract

```js
const {
  count,      // number — current countdown value (reps remaining or seconds remaining)
  isRunning,  // boolean
  start,      // () => void
  pause,      // () => void
  reset,      // () => void
} = useExerciseTimer({ targetType, targetValue })
```

Cleanup: cancels `setInterval` on unmount. ✅ Constitution Performance Requirement.

---

## `useBreathingTimer` Hook Contract (extracted from BreathingExercise.jsx)

```js
const {
  currentPhase,       // { name, duration, instruction }
  secondsInPhase,     // number
  isActive,           // boolean
  start,              // () => void
  stop,               // () => void
  cycleCount,         // number — increments each full pattern cycle
} = useBreathingTimer(patternKey)
```

Cleanup: cancels `setInterval` on unmount. ✅ Constitution Performance Requirement.

---

## PomodoroTimer Integration Contract

**Change to existing `PomodoroTimer.jsx`**: Add optional `onModeChange` prop.

```jsx
<PomodoroTimer
  onModeChange={({ mode, previousMode }) => void}  // optional, no-op if omitted
/>
```

- Called each time the internal `mode` state changes.
- `App.jsx` uses this to set `isBreakActive` which is passed into `<ActiveBreak>`.
- No other changes to `PomodoroTimer` internals.
