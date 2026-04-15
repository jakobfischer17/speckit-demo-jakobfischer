# Research: Active Break Exercises
**Phase 0 Output** | Branch: `003-active-break-exercises` | Date: 2026-04-12

---

## 1. Animation Library for Exercise Illustrations

**Decision**: Use **lottie-react** for animated exercise illustrations.

**Rationale**:
- Gzipped bundle cost ≈ 50 kB. Combined with React (~45 kB) the total is ~95 kB — well within the 200 kB constitution limit, leaving ~105 kB for all application code.
- LottieFiles offers hundreds of free fitness/exercise animations (push-up, jumping jacks, yoga stretches, etc.) that can be used directly as JSON assets — no custom animation authoring needed for the initial exercise set.
- Lottie animations are vector-based SVG-equivalent; they scale perfectly to any screen size with no resolution degradation.
- Looping, play, and pause are first-class features via simple React props (`loop`, `autoplay`, `lottieRef`).
- Fully compatible with React 19 and Vite's asset pipeline (JSON imports).

**Alternatives considered**:

| Candidate | Gzipped size | Verdict | Reason rejected |
|---|---|---|---|
| Three.js + @react-three/fiber | ~150–160 kB | ❌ REJECTED | Exceeds budget alone (React 45 + Three 155 = 200 kB, zero room for app code); 3D overkill for 2D exercise guides |
| Framer Motion | ~38 kB | ⚠️ Secondary role | No pre-made exercise assets; designed for UI transitions not body-movement illustration |
| Pure CSS + SVG | ~2–5 kB per animation | ✅ Supplemental | Zero dependencies and lightest possible; used for breathing phase animation (already pattern-matched in existing `BreathingExercise`) and as fallback for any exercise without a Lottie asset |

**Three.js specific evaluation** (user-requested):
Three.js would enable true 3D skeletal human animations. However:
1. The library alone is ~160 kB gzipped — consuming the entire remaining bundle budget leaving ≈0 kB for React code.
2. Human body rigging requires additional libraries (drei, react-three-fiber) and GLTF model files (typically 200 kB–2 MB each uncompressed).
3. The visual complexity of 3D rendering provides no pedagogical advantage over Lottie's polished 2D illustrations for simple reps-based exercises.
4. **Conclusion: Three.js is not suitable for this project under the current 200 kB constitution constraint.**

**Bundle breakdown post-decision**:
```
React 19          ~45 kB gzipped
lottie-react      ~50 kB gzipped
App code + CSS    ~30–50 kB gzipped (estimated)
Lottie JSON files ~10–30 kB per exercise (lazy-loaded, not part of JS bundle)
─────────────────────────────────────────
Estimated total   ~125–145 kB gzipped  ✅ under 200 kB limit
```

Note: Lottie animation JSON files are imported statically but Vite can split them per-exercise into separate async chunks if bundle pressure grows.

---

## 2. Integration with Existing BreathingExercise Component

**Decision**: Extract the breathing-phase data schema and `useBreathingTimer` logic from `BreathingExercise.jsx` into a standalone hook/utility so the cool-down sequence reuses the same code path.

**Rationale**:
- The existing `BreathingExercise.jsx` already implements the full phase-cycling logic (inhale / hold / exhale countdown) via `useEffect` + `setInterval`. Duplicating this for cool-down would violate Constitution Principle I (DRY).
- The refactor is minimal: extract `exercises` data object → `src/data/breathingPatterns.js`, extract timer logic → `src/hooks/useBreathingTimer.js`.
- Both `BreathingExercise.jsx` and the new `BreathingCoolDown.jsx` component consume the same hook.

**Alternatives considered**:
- Embedding a fresh breathing timer directly in `ExercisePlayer.jsx`: Rejected — violates DRY principle.
- Rendering a full `<BreathingExercise />` as a sub-component: Rejected — the full BreathingExercise renders exercise-type selectors and header UI that are not appropriate inside an exercise completion flow.

---

## 3. Pomodoro Timer Integration Pattern

**Decision**: Lift shared break-phase state up to `App.jsx` via a callback prop on `PomodoroTimer`. `App.jsx` will hold `isOnBreak` state and pass a prompt to `ActiveBreak`.

**Rationale**:
- `PomodoroTimer` currently manages mode state internally. A single `onModeChange(mode)` callback prop is the minimal change that exposes break transitions to the parent without mutating PomodoroTimer's internals.
- `App.jsx` already owns tab routing; augmenting it to also track `isOnBreak` is a natural extension of its orchestration role.
- No external state library (Redux, Zustand) is needed; the integration scope is narrow.

**Alternatives considered**:
- React Context / global state: Overkill for a two-component signal. Rejected.
- Custom event / DOM event: Non-idiomatic in React. Rejected.

---

## 4. Exercise Data Strategy

**Decision**: Static data defined in `src/data/exercises.js` as a frozen array of `Exercise` objects. No API, no database.

**Rationale**:
- Spec assumption confirmed: dynamic/user-added exercises are out of scope.
- Static data keeps the component tree purely functional (no async loading state).
- The data file doubles as the source of truth for unit tests (snapshot the catalogue shape).
- Lottie animation files are co-located in `src/assets/animations/exercises/` and imported by filename reference within the data objects.

---

## 5. Exercise Catalogue (minimum 12, spec requirement)

Confirmed catalogue covering all three categories:

| # | Name | Category | Target | Cool-down needed |
|---|---|---|---|---|
| 1 | Push-ups | Intense | 10 reps | Yes |
| 2 | Jumping Jacks | Intense | 20 reps | Yes |
| 3 | Burpees | Intense | 5 reps | Yes |
| 4 | Squat Jumps | Intense | 10 reps | Yes |
| 5 | High Knees | Intense | 20 sec | Yes |
| 6 | Desk Push-ups | Light | 10 reps | No |
| 7 | Shoulder Rolls | Light | 30 sec | No |
| 8 | Neck Circles | Light | 30 sec | No |
| 9 | Seated Leg Raises | Light | 10 reps | No |
| 10 | Hip Flexor Stretch | Stretch | 30 sec each side | No |
| 11 | Forward Fold | Stretch | 30 sec | No |
| 12 | Chest Opener | Stretch | 30 sec | No |
| 13 | Seated Spinal Twist | Stretch | 30 sec each side | No |

All exercises complete in ≤ 5 minutes. ✅ Meets FR-002.
