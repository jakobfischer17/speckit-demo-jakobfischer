# Implementation Plan: Active Break Exercises

**Branch**: `003-active-break-exercises` | **Date**: 2026-04-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-active-break-exercises/spec.md`

## Summary

Add an **Active Break** tab to the Productivity Hub that serves a library of 13 quick physical exercises (Light, Intense, Stretch) with Lottie-powered animated illustrations and per-exercise rep/duration countdowns. Intense exercises automatically trigger a breathing cool-down after completion, reusing the extracted `useBreathingTimer` hook from the existing `BreathingExercise` component. Light Pomodoro integration surfaces an invitation-to-break prompt whenever the timer enters a break phase.

Animation approach: **lottie-react** (~50 kB gzipped) chosen over Three.js (rejected: ~160 kB gzipped alone, exceeds bundle budget) and Framer Motion (no exercise assets available). CSS/SVG used for the breathing cool-down circle, consistent with the existing BreathingExercise visual language.

## Technical Context

**Language/Version**: JavaScript (ES2022) / JSX, React 19.2  
**Primary Dependencies**: React 19, Vite 7, lottie-react (new), ESLint 9  
**Storage**: N/A — all exercise data is static; no session persistence  
**Testing**: Vitest + React Testing Library (to be added; currently no test runner configured)  
**Target Platform**: Web SPA — desktop-first, responsive to 320 px mobile  
**Project Type**: Web application (single-page, tab-based)  
**Performance Goals**: Lighthouse ≥ 85 (mobile), no main-thread block > 50 ms, production JS bundle < 200 kB gzipped  
**Constraints**: No audio; no remote API; animations must be legible without sound; Lottie JSON assets lazy-loaded if bundle pressure rises  
**Scale/Scope**: Single user, ~13 exercises, 4 new components, 3 new hooks, 2 data files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status | Notes |
|---|---|---|---|
| I. DRY & Functional Programming | `useBreathingTimer` extracted and shared; no logic duplication between BreathingExercise and BreathingCoolDown | ✅ PASS | Refactor of BreathingExercise.jsx required as first task |
| I. DRY & Functional Programming | Exercise filter logic in pure functions in `src/utils/exercises.js` | ✅ PASS | Designed as pure `filterExercises(exercises, category)` |
| I. DRY & Functional Programming | All components as functional components; no class components | ✅ PASS | React 19, all new components are FC |
| II. Code Quality Standards | ESLint must report zero errors post-implementation | ✅ PASS (gate) | Enforced before merge |
| II. Code Quality Standards | `lottie-react` adds ~50 kB gzipped — new dependency justified | ✅ PASS | No alternative provides pre-made exercise animations within budget |
| III. Testing Standards | Tests co-located with each new component | ✅ PASS | `*.test.jsx` alongside each component per constitution |
| III. Testing Standards | No test runner currently installed | ⚠️ PREREQUISITE | Vitest + RTL must be added in setup phase (T001) |
| IV. UX Consistency | Lottie player and category filter use existing token system colours/spacing | ✅ PASS | Design tokens applied to all new CSS files |
| IV. UX Consistency | Breathing cool-down uses same circle animation style as existing BreathingExercise | ✅ PASS | CSS animation reused, not reinvented |
| Performance | `lottie-react` Budget: React 45 + Lottie 50 + App code ~50 = ~145 kB gzipped | ✅ PASS | Under 200 kB limit with ~55 kB to spare |
| Performance | `setInterval` cleanup in `useExerciseTimer` and `useBreathingTimer` on unmount | ✅ PASS | Cleanup functions mandatory in all timer hooks |

**Post-Phase-1 re-check**: All gates pass. `useBreathingTimer` extraction resolves DRY gate. Test runner addition resolves prerequisite. No constitution violations.

**Complexity Tracking**: No violations requiring justification. `lottie-react` dependency explicitly justified above.

---

## Project Structure

### Documentation (this feature)

```text
specs/003-active-break-exercises/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── ui-contracts.md  ← Phase 1 output
└── tasks.md             ← Phase 2 output (created by /speckit.tasks, not this command)
```

### Source Code (repository root)

```text
src/
├── App.jsx                         ← modified: add activeBreak tab + onModeChange wiring
├── App.css                         ← unchanged
├── assets/
│   └── animations/
│       └── exercises/              ← NEW: Lottie JSON files (one per exercise)
│           ├── push-ups.json
│           ├── jumping-jacks.json
│           └── ... (13 total)
├── data/
│   ├── exercises.js                ← NEW: static exercise catalogue (13 entries)
│   └── breathingPatterns.js        ← NEW: extracted from BreathingExercise.jsx
├── hooks/
│   ├── useBreathingTimer.js        ← NEW: extracted from BreathingExercise.jsx
│   ├── useExerciseSession.js       ← NEW: session state machine
│   └── useExerciseTimer.js         ← NEW: rep/duration countdown
├── utils/
│   └── exercises.js                ← NEW: pure filter/transform functions
└── components/
    ├── BreathingExercise.jsx       ← modified: import from shared data/hooks
    ├── BreathingExercise.css       ← unchanged
    ├── PomodoroTimer.jsx           ← modified: add optional onModeChange prop
    ├── PomodoroTimer.css           ← unchanged
    ├── ProductivityTips.jsx        ← unchanged
    ├── ProductivityTips.css        ← unchanged
    └── ActiveBreak/                ← NEW directory
        ├── ActiveBreak.jsx         ← main container
        ├── ActiveBreak.css
        ├── ActiveBreak.test.jsx
        ├── ExerciseLibrary.jsx     ← browse + filter view
        ├── ExerciseLibrary.css
        ├── ExerciseLibrary.test.jsx
        ├── ExerciseCard.jsx        ← single exercise tile
        ├── ExerciseCard.css
        ├── ExerciseCard.test.jsx
        ├── ExercisePlayer.jsx      ← animation + counter full-screen runner
        ├── ExercisePlayer.css
        ├── ExercisePlayer.test.jsx
        ├── BreathingCoolDown.jsx   ← post-intense cool-down (reuses useBreathingTimer)
        └── BreathingCoolDown.css
```

**Structure Decision**: Single-project web app layout. All new files co-located with their tests per constitution Principle III. Shared logic in `src/data/`, `src/hooks/`, and `src/utils/` per Principle I.

