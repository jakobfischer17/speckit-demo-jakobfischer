---
description: "Task list for Active Break Exercises feature implementation"
---

# Tasks: Active Break Exercises

**Input**: Design documents from `specs/003-active-break-exercises/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ui-contracts.md ✅, quickstart.md ✅

**Tests**: Not explicitly requested in spec — tests are included because constitution Principle III mandates co-located component tests.

**Organization**: Tasks grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Exact file paths included in every task description

---

## Phase 1: Setup (Project Infrastructure)

**Purpose**: Install dependencies and configure the test runner — required before any component work begins.

- [ ] T001 Install Vitest and React Testing Library; add `test` script and Vitest config to `vite.config.js`; add `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` as devDependencies in `package.json`
- [ ] T002 Install `lottie-react` runtime dependency in `package.json`; run `npm run build` and confirm gzipped JS bundle stays under 200 kB

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared data, hooks, and assets that EVERY user story depends on. No story work begins until this phase is complete.

**⚠️ CRITICAL**: T003–T005 must complete in order (extract → hook → update consumer). T006–T010 and T027 can then run in parallel.

- [ ] T003 Create `src/data/breathingPatterns.js` by moving the `exercises` object out of `src/components/BreathingExercise.jsx`; export named `breathingPatterns` constant
- [ ] T004 Create `src/hooks/useBreathingTimer.js` by extracting the `useEffect`/`setInterval` phase-cycling logic from `src/components/BreathingExercise.jsx`; hook accepts `patternKey` string and returns `{ currentPhase, secondsInPhase, isActive, start, stop, cycleCount }`; include `clearInterval` cleanup in `useEffect` return
- [ ] T005 Update `src/components/BreathingExercise.jsx` to import `breathingPatterns` from `src/data/breathingPatterns.js` and use `useBreathingTimer` from `src/hooks/useBreathingTimer.js`; remove all duplicated inline data and timer logic; confirm app still renders correctly
- [ ] T006 [P] Create `src/utils/exercises.js` with pure functions: `filterExercises(exercises, category)` returns exercises matching category or all when category is `'All'`; export functions individually (no default export)
- [ ] T006a [P] Create `src/utils/exercises.test.js` with unit tests for `filterExercises`: returns all exercises when category is `'All'`, returns only matching exercises for `'Light'`, `'Intense'`, and `'Stretch'` categories, returns empty array when no exercises match; ≥90% branch coverage required per constitution Principle III
- [ ] T007 [P] Create `src/data/exercises.js` with the complete 13-exercise static catalogue (Push-ups, Jumping Jacks, Burpees, Squat Jumps, High Knees, Desk Push-ups, Shoulder Rolls, Neck Circles, Seated Leg Raises, Hip Flexor Stretch, Forward Fold, Chest Opener, Seated Spinal Twist) following the `Exercise` data shape from `specs/003-active-break-exercises/data-model.md`; import Lottie JSON animation files by filename reference; freeze array with `Object.freeze`
- [ ] T008 [P] Add placeholder Lottie animation JSON stubs to `src/assets/animations/exercises/` — one `.json` file per exercise (13 files): `push-ups.json`, `jumping-jacks.json`, `burpees.json`, `squat-jumps.json`, `high-knees.json`, `desk-push-ups.json`, `shoulder-rolls.json`, `neck-circles.json`, `seated-leg-raises.json`, `hip-flexor-stretch.json`, `forward-fold.json`, `chest-opener.json`, `seated-spinal-twist.json`; each stub must be a valid minimal Lottie JSON `{"v":"5.0","fr":30,"ip":0,"op":60,"w":400,"h":400,"layers":[]}`
- [ ] T009 [P] Create `src/hooks/useExerciseSession.js` implementing the `ActiveBreakSession` state machine from `data-model.md`; export `useExerciseSession(exercises)` returning `{ session, startExercise, completeExercise, skipExercise, returnToLibrary }`; phases: `'library' | 'exercising' | 'cooldown' | 'complete'`
- [ ] T009a [P] Create `src/hooks/useExerciseSession.test.js` with tests for the state machine: initial phase is `'library'`, `startExercise` transitions to `'exercising'`, `completeExercise` transitions to `'complete'`, `skipExercise` returns to `'library'`, `returnToLibrary` resets phase to `'library'`, `completedIds` grows after `completeExercise`; mock exercises array
- [ ] T010 [P] Create `src/hooks/useExerciseTimer.js` accepting `{ targetType, targetValue }`; manages `count` countdown from `targetValue` to 0 using `setInterval`; returns `{ count, isRunning, start, pause, reset }`; cancel interval in `useEffect` cleanup; create `src/hooks/useExerciseTimer.test.js` with unit tests covering start, countdown, and completion
- [ ] T027 [P] Add CSS custom property design tokens to `src/index.css`: `--exercise-card-radius`, `--exercise-card-gap`, `--filter-chip-height`, `--animation-highlight-color`, `--cooldown-circle-size`; all subsequent component CSS tasks MUST reference these tokens — no hard-coded colour or spacing values permitted per constitution Principle IV

**Checkpoint**: All foundational files and design tokens exist → user story phases can now begin.

---

## Phase 3: User Story 1 — Follow a Guided Exercise (Priority: P1) 🎯 MVP

**Goal**: User can select any exercise, follow its Lottie-animated guide with a live rep/duration counter, and reach a completion state. Skip at any time returns to library.

**Independent Test**: Render `<ActiveBreak />` in isolation → select any exercise card → verify Lottie animation plays and counter counts down → counter reaches 0 → completion state shown. No Pomodoro timer required.

- [ ] T011 [P] [US1] Create `src/components/ActiveBreak/ExerciseCard.jsx` displaying exercise name, category badge, target (e.g. "10 reps"), and a completed checkmark when `completed` prop is true; add `src/components/ActiveBreak/ExerciseCard.css` with card hover/focus styles using existing App.css token variables
- [ ] T012 [P] [US1] Create `src/components/ActiveBreak/ExerciseCard.test.jsx` with rendering tests: renders exercise name, renders category badge, renders completed badge when `completed=true`, calls `onClick` when clicked
- [ ] T013 [US1] Create `src/components/ActiveBreak/ExercisePlayer.jsx` consuming `useExerciseTimer`; render `<Lottie animationData={exercise.animationFile} loop autoplay />` from `lottie-react`; show live `count` display; render "Skip" button triggering `onSkip`; when `count` reaches 0 and `exercise.coolDownRequired === false` call `onComplete`; add `src/components/ActiveBreak/ExercisePlayer.css`
- [ ] T014 [US1] Create `src/components/ActiveBreak/ExercisePlayer.test.jsx` with tests: renders exercise name, renders Skip button, calls `onSkip` when Skip clicked, calls `onComplete` when timer reaches zero (mock timer with vitest fake timers)
- [ ] T015 [US1] Create `src/components/ActiveBreak/ActiveBreak.jsx` as the top-level container; accept `isBreakActive` prop (unused in this phase); own `useExerciseSession(exercises)` state; render `<ExerciseLibrary>` when `session.phase === 'library'`; render `<ExercisePlayer>` when `session.phase === 'exercising' | 'complete'`; add `src/components/ActiveBreak/ActiveBreak.css`
- [ ] T016 [US1] Create `src/components/ActiveBreak/ActiveBreak.test.jsx` with tests: renders ExerciseLibrary by default, switches to ExercisePlayer when `startExercise` called, returns to library when `returnToLibrary` called
- [ ] T017 [US1] Update `src/App.jsx` to import `ActiveBreak` from `src/components/ActiveBreak/ActiveBreak.jsx`; add `'active-break'` case to `renderContent` switch; add "🏃 Active Break" nav button to the nav bar; pass `isBreakActive={false}` as placeholder prop (wired in US4)

**US1 Checkpoint**: `npm run dev` → navigate to Active Break tab → select an exercise → animation plays + counter counts down → completion state shown ✅

---

## Phase 4: User Story 2 — Browse & Filter Exercises by Category (Priority: P2)

**Goal**: Category filter bar (All / Light / Intense / Stretch) narrows the exercise grid; empty state shown for category with no results.

**Independent Test**: Render `<ExerciseLibrary exercises={exercises} completedIds={[]} onSelectExercise={fn} />` in isolation; click each filter chip; assert only matching exercises render; assert empty state message when no matches.

- [ ] T018 [P] [US2] Create `src/components/ActiveBreak/ExerciseLibrary.jsx` with local `activeFilter` state defaulting to `'All'`; use `filterExercises` from `src/utils/exercises.js` to derive displayed list; render filter chip buttons for `['All', 'Light', 'Intense', 'Stretch']`; render `<ExerciseCard>` per filtered result; show empty-state `<p>` when `filteredExercises.length === 0`; add `src/components/ActiveBreak/ExerciseLibrary.css`
- [ ] T019 [P] [US2] Create `src/components/ActiveBreak/ExerciseLibrary.test.jsx` with tests: renders all exercises by default, renders only Stretch exercises when Stretch filter active, renders only Intense exercises when Intense filter active, shows empty-state when filtered result is empty, calls `onSelectExercise` with correct exercise when card clicked
- [ ] T020 [US2] Update `src/components/ActiveBreak/ActiveBreak.jsx` to render `<ExerciseLibrary exercises={allExercises} completedIds={session.completedIds} onSelectExercise={startExercise} />` replacing any previous library placeholder; confirm filter + selection round-trip works end-to-end
- [ ] T033 [US2] Handle all-exercises-completed edge case (FR-011): add `resetCompleted(category)` action to `src/hooks/useExerciseSession.js`; update `ExerciseLibrary.jsx` to render a congratulations banner and "Reset & Go Again" button when all filtered exercises are in `session.completedIds`; clicking reset clears `completedIds` for that category; add tests to `ExerciseLibrary.test.jsx` and `useExerciseSession.test.js`

**US2 Checkpoint**: Active Break tab → filter chips change exercise grid → empty state shown for empty category → congratulations state shown when all exercises in a category completed ✅

---

## Phase 5: User Story 3 — Automatic Breathing Cool-Down (Priority: P3)

**Goal**: Completing an Intense exercise automatically starts a breathing cool-down sequence (using `useBreathingTimer`). Non-intense exercises skip directly to completion. User can skip cool-down.

**Independent Test**: Complete any exercise with `coolDownRequired: true` → `<BreathingCoolDown>` renders automatically within 3 seconds → skip button ends cool-down → library restored.

- [ ] T021 [P] [US3] Create `src/components/ActiveBreak/BreathingCoolDown.jsx` consuming `useBreathingTimer(patternKey)`; render breathing phase instruction text, seconds remaining, and the CSS expanding-circle animation matching the existing `BreathingExercise` visual language (reuse `.breathing-circle` CSS class pattern); render "Skip Cool-Down" button triggering `onSkip`; when `cycleCount >= 1` call `onComplete`; add `src/components/ActiveBreak/BreathingCoolDown.css`
- [ ] T022 [US3] Update `src/components/ActiveBreak/ExercisePlayer.jsx` to handle post-exercise cool-down: when `count` reaches 0 and `exercise.coolDownRequired === true`, transition to an internal `showCoolDown` state (2-second `setTimeout` then render `<BreathingCoolDown patternKey={exercise.coolDownPattern} onComplete={onComplete} onSkip={onComplete} />`); call parent `onComplete` only after cool-down resolves; cancel setTimeout in cleanup

**US3 Checkpoint**: Start any Intense exercise → complete it → BreathingCoolDown appears automatically → skip or complete → library restored ✅

---

## Phase 6: User Story 4 — Pomodoro Break Integration (Priority: P4)

**Goal**: When PomodoroTimer transitions to a break phase, a dismissible invitation banner appears in the Active Break panel. Dismissed once per break, never reappears for that break. Active Break works normally without Pomodoro timer.

**Independent Test**: Render `<ActiveBreak isBreakActive={true} />` → prompt banner visible; set `isBreakActive={false}` → no banner. Render `<App />`, switch Pomodoro to shortBreak mode → `isBreakActive` becomes true → prompt appears on Active Break tab.

- [ ] T023 [US4] Update `src/components/PomodoroTimer.jsx` to accept optional `onModeChange` prop (default no-op); call `onModeChange({ mode, previousMode })` inside `switchMode` and whenever the timer auto-transitions at countdown zero; no other changes to PomodoroTimer internals
- [ ] T024 [US4] Update `src/App.jsx` to add `isBreakActive` and `dismissedBreakId` state; add `handleModeChange({ mode, previousMode })` callback passed to `<PomodoroTimer>`; set `isBreakActive = true` when `mode` is `'shortBreak'` or `'longBreak'`; reset `isBreakActive = false` when mode returns to `'work'`; pass `isBreakActive` to `<ActiveBreak>`
- [ ] T025 [US4] Update `src/components/ActiveBreak/ActiveBreak.jsx` to render a dismissible banner at the top when `isBreakActive === true`; banner contains "🏃 Time for an active break!" text and a dismiss (`×`) button; dismissing sets local `isDismissed` state to true, hiding banner for rest of that break; `isDismissed` resets to false when `isBreakActive` transitions from false to true (use `useEffect`)
- [ ] T026 [P] [US4] Update `src/components/ActiveBreak/ActiveBreak.test.jsx` to add tests: banner visible when `isBreakActive={true}`, banner hidden when `isBreakActive={false}`, banner hides after dismiss button clicked, banner reappears on next break (`isBreakActive` false → true transition)
- [ ] T034 [US4] Handle break-ends-mid-exercise notification (FR-012): update `ActiveBreak.jsx` to detect when `isBreakActive` transitions from `true` to `false` while `session.phase` is `'exercising'` or `'cooldown'`; show a non-blocking toast "Your break has ended" that auto-dismisses after 5 seconds; exercise continues uninterrupted; add a test to `ActiveBreak.test.jsx`

**US4 Checkpoint**: Start Pomodoro, switch to shortBreak → Active Break tab shows banner → dismiss → banner gone → switch back to work → switch to break again → banner reappears → complete exercise during break then return to work → “Your break has ended” toast appears ✅

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, responsive layout, and all constitution quality gates. Design tokens were established in Phase 2 (T027).

- [ ] T028 [P] Verify responsive layout at 320 px viewport: add `@media (max-width: 400px)` rules to `ExerciseLibrary.css` (single-column grid), `ExerciseCard.css` (full-width), and `ExercisePlayer.css` (full-width animation container); manually test in browser DevTools
- [ ] T029 Add `aria-label` attributes to all icon-only buttons (Skip, dismiss ×, filter chips) and `role="status"` to countdown display in `ExercisePlayer.jsx` and `BreathingCoolDown.jsx`; confirm keyboard tab order reaches all interactive elements
- [ ] T030 Run `npm run lint` and fix all ESLint errors; ensure zero errors, no `eslint-disable` suppressions without justification comment
- [ ] T031 Run `npm test -- --watch=false` and confirm all tests pass with zero failures
- [ ] T032 Run `npm run build`; verify gzipped JS bundle is under 200 kB; if over budget, convert large Lottie JSON imports to `React.lazy` + dynamic `import()` chunks

---

## Dependencies (Story Completion Order)

```
Phase 1 (T001–T002)
  └─► Phase 2 (T003–T010, T006a, T009a, T027)
        ├─► Phase 3 US1 (T011–T017)  ← MVP — independently shippable
        │     └─► Phase 4 US2 (T018–T020, T033)
        │           └─► Phase 5 US3 (T021–T022)
        │                 └─► Phase 6 US4 (T023–T026, T034)
        │                       └─► Phase 7 Polish (T028–T032)
        └─► [T006/T006a util + T009a session + T010 hook needed by US1 via ExercisePlayer/ExerciseLibrary]
```

US2, US3, US4 each extend US1's components — implement in order. All four stories share the foundational data/hooks from Phase 2.

---

## Parallel Execution Examples

### Within Phase 2 (after T005 completes):
```
T006 (utils)         ──┬
T006a (utils test)   ──┤
T007 (data)          ──┤
T008 (assets)        ──┼─► All can run simultaneously (different files)
T009 (session hook)  ──┤
T009a (session test) ──┤
T010 (timer hook)    ──┤
T027 (tokens)        ──┘
```

### Within Phase 3 (US1):
```
T011 ExerciseCard.jsx  ──┐
T012 ExerciseCard.test ──┘  (parallel pair)
then:
T013 ExercisePlayer.jsx ──► T014 ExercisePlayer.test (sequential)
then:
T015 ActiveBreak.jsx ──► T016 ActiveBreak.test ──► T017 App.jsx wire-up
```

### Within Phase 7 (Polish):
```
T028 responsive ──┬
T029 a11y ────────┘─► Can run simultaneously
then T030 lint ──► T031 tests ──► T032 bundle check
```

---

## Implementation Strategy

### MVP Scope (Phase 1 + 2 + 3 = T001–T017)
Ship US1 first: exercise catalogue with Lottie animations and countdown. This is independently testable and delivers the core "animated exercise guide" value. US2–US4 are progressive enhancements.

### Incremental Delivery
| Increment | Tasks | Value Delivered |
|---|---|---|
| MVP | T001–T017 | Animated exercise guide with completion state |
| +Filtering | T018–T020 | Category filter; personalised exercise choice |
| +Cool-down | T021–T022 | Auto breathing cool-down after Intense exercises |
| +Pomodoro | T023–T026, T034 | Break prompt + break-ends-mid-exercise notification |
| +Polish | T028–T032 | A11y, responsive, quality gates ✅ (tokens in Phase 2) |

---

## Summary

| Metric | Value |
|---|---|
| Total tasks | 36 |
| Setup (Phase 1) | 2 |
| Foundational (Phase 2) | 11 |
| US1 — Guided Exercise (P1) | 7 |
| US2 — Filter (P2) | 4 |
| US3 — Cool-Down (P3) | 2 |
| US4 — Pomodoro Integration (P4) | 5 |
| Polish (Phase 7) | 5 |
| Parallelizable tasks [P] | 19 |
| Format validation | ✅ All tasks: checkbox + ID + labels + file path |
