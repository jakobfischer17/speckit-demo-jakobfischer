# Quickstart: Active Break Exercises
**Phase 1 Output** | Branch: `003-active-break-exercises` | Date: 2026-04-12

---

## Prerequisites

- Node.js ≥ 18, npm ≥ 9
- Repo cloned and `npm install` completed
- `npm run dev` serves the app at `http://localhost:5173`

---

## Step 1 — Install lottie-react

```bash
npm install lottie-react
```

Verify the bundle size increase is acceptable:

```bash
npm run build
# Check: dist/assets/*.js gzipped total should remain under 200 kB
```

---

## Step 2 — Extract Shared Breathing Logic

Before building new components, extract the existing breathing timer logic to avoid duplication.

**a. Create `src/data/breathingPatterns.js`** — move the `exercises` object out of `BreathingExercise.jsx`:

```js
// src/data/breathingPatterns.js
export const breathingPatterns = {
  box:      { name: 'Box Breathing', description: '...', phases: [...] },
  relax:    { name: '4-7-8 Breathing', description: '...', phases: [...] },
  energize: { name: 'Energizing Breath', description: '...', phases: [...] },
}
```

**b. Create `src/hooks/useBreathingTimer.js`** — move the `useEffect` timer logic:

```js
// src/hooks/useBreathingTimer.js
import { useState, useEffect } from 'react'
import { breathingPatterns } from '../data/breathingPatterns'

export function useBreathingTimer(patternKey) {
  // ... extracted timer logic
  return { currentPhase, secondsInPhase, isActive, start, stop, cycleCount }
}
```

**c. Update `BreathingExercise.jsx`** to import from the new shared locations.  
Run `npm test` to confirm zero regressions.

---

## Step 3 — Add Lottie Animation Assets

Create the animations directory:

```bash
mkdir -p src/assets/animations/exercises
```

Download free Lottie JSON files from [lottiefiles.com](https://lottiefiles.com/search?q=exercise&type=lottie) for each exercise in the catalogue.  
Save them as: `src/assets/animations/exercises/{exercise-id}.json`

Example filenames:
```
push-ups.json
jumping-jacks.json
burpees.json
squat-jumps.json
high-knees.json
desk-push-ups.json
shoulder-rolls.json
...
```

---

## Step 4 — Create Exercise Data Catalogue

```js
// src/data/exercises.js
import pushUpsAnimation from '../assets/animations/exercises/push-ups.json'
// ... other imports

export const exercises = [
  {
    id: 'push-ups',
    name: 'Push-ups',
    category: 'Intense',
    targetType: 'reps',
    targetValue: 10,
    animationFile: pushUpsAnimation,
    instructions: ['Get into plank position', 'Lower chest to floor', 'Push back up'],
    coolDownRequired: true,
    coolDownPattern: 'relax',
  },
  // ... 12 more exercises per data-model.md catalogue
]
```

---

## Step 5 — Build Components (dependency order)

```
useExerciseTimer  →  ExercisePlayer
useExerciseSession →  ActiveBreak
ExerciseCard      →  ExerciseLibrary  →  ActiveBreak
BreathingCoolDown  →  ExercisePlayer
```

Build order:
1. `src/hooks/useExerciseTimer.js`
2. `src/hooks/useExerciseSession.js`
3. `src/components/ActiveBreak/ExerciseCard.jsx` + `.css` + `.test.jsx`
4. `src/components/ActiveBreak/ExerciseLibrary.jsx` + `.css` + `.test.jsx`
5. `src/components/ActiveBreak/BreathingCoolDown.jsx` + `.css`
6. `src/components/ActiveBreak/ExercisePlayer.jsx` + `.css` + `.test.jsx`
7. `src/components/ActiveBreak/ActiveBreak.jsx` + `.css` + `.test.jsx`

---

## Step 6 — Wire Into App.jsx

```jsx
// App.jsx additions
import ActiveBreak from './components/ActiveBreak/ActiveBreak'

const [isBreakActive, setIsBreakActive] = useState(false)
const [previousMode, setPreviousMode] = useState('work')

const handleModeChange = ({ mode, previousMode }) => {
  setIsBreakActive(mode === 'shortBreak' || mode === 'longBreak')
  setPreviousMode(previousMode)
}

// In renderContent():
case 'active-break':
  return <ActiveBreak isBreakActive={isBreakActive} />

// In PomodoroTimer:
<PomodoroTimer onModeChange={handleModeChange} />

// In nav:
<button onClick={() => setActiveTab('active-break')}>🏃 Active Break</button>
```

---

## Step 7 — Run Tests

```bash
npm test -- --watch=false
```

Expected: all existing tests pass + new component tests pass.

---

## Step 8 — Verify Constitution Gates

```bash
# Lint gate
npm run lint

# Test gate
npm test -- --watch=false

# Bundle size gate
npm run build && du -sh dist/assets/*.js
```

All three MUST pass before merging.
