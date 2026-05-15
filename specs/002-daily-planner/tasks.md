# Tasks: Daily Planner Validation & Experience Completion

**Input**: Design documents from `/specs/002-daily-planner/`  
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/components.md, quickstart.md

**Tests**: Test tasks are included because the feature specification requires independent validation per story and the implementation plan explicitly replaces the broken browser-driven suite with deterministic component and service tests.

**Organization**: Tasks are grouped by user story so each story can be implemented, validated, and delivered independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (`[US1]` to `[US8]`)
- Every task includes the exact file path it changes

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Finalize the cross-platform Vitest-based test stack and repo-level validation entrypoints.

- [ ] T001 Update Vitest scripts for full, watch, and planner-focused runs in package.json
- [ ] T002 [P] Configure jsdom-based test execution in vite.config.js
- [ ] T003 [P] Finalize shared test environment mocks and cleanup in vitest.setup.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Complete the shared persistence and state foundations that all planner stories depend on.

**⚠️ CRITICAL**: No user story work should start until this phase is complete.

- [ ] T004 Export and stabilize the shared IndexedDB initializer in src/services/db.js
- [ ] T005 Refactor planner persistence to use the shared DB initializer in src/services/taskService.js
- [ ] T006 [P] Add legacy IndexedDB upgrade regression coverage in src/services/taskService.test.js
- [ ] T007 [P] Normalize broadcast reconciliation, load state, and undo bookkeeping in src/hooks/useTasks.js

**Checkpoint**: The storage, sync, and test foundation is stable enough for story-level work.

---

## Phase 3: User Story 1 - Frictionless Today View (Priority: P1) 🎯 MVP

**Goal**: Users land on a stable Today view that immediately shows the date, summary state, and active tasks without planner errors.

**Independent Test**: Load the app and verify the Today section renders the current date, an empty or populated task summary, and an active task list without requiring navigation or refresh.

### Tests for User Story 1

- [ ] T008 [P] [US1] Add Today view render and empty-state coverage in src/components/DailyPlanner/DailyPlanner.test.jsx

### Implementation for User Story 1

- [ ] T009 [US1] Refine current-date and summary rendering in src/components/DailyPlanner/TodayView.jsx
- [ ] T010 [US1] Align planner section composition and loading behavior in src/components/DailyPlanner/DailyPlanner.jsx
- [ ] T011 [US1] Tighten active/completed list separation in src/components/DailyPlanner/TaskList.jsx

**Checkpoint**: User Story 1 works independently as the entry-point planner experience.

---

## Phase 4: User Story 2 - Quick Task Creation (Priority: P1)

**Goal**: Users can capture tasks instantly and edit them inline with predictable defaults.

**Independent Test**: Type a task into quick add, press Enter, verify it appears with default today/medium metadata, then click the title and save an inline edit successfully.

### Tests for User Story 2

- [ ] T012 [P] [US2] Add quick-add and inline-edit coverage in src/components/DailyPlanner/DailyPlanner.test.jsx

### Implementation for User Story 2

- [ ] T013 [US2] Finalize Enter/Escape quick-add behavior in src/components/DailyPlanner/QuickAdd.jsx
- [ ] T014 [US2] Finalize accessible inline title editing in src/components/DailyPlanner/TaskItem.jsx
- [ ] T015 [US2] Enforce default due-date and priority creation behavior in src/hooks/useTasks.js

**Checkpoint**: User Story 2 works independently as a frictionless capture/edit flow.

---

## Phase 5: User Story 3 - Task Completion (Priority: P1)

**Goal**: Users can complete, restore, delete, and undo-delete tasks with stable feedback.

**Independent Test**: Complete a task, verify it moves into the completed section with visual feedback, restore it, then delete it and undo within the toast window.

### Tests for User Story 3

- [ ] T016 [P] [US3] Add completion, delete, and undo regression coverage in src/components/DailyPlanner/DailyPlanner.test.jsx

### Implementation for User Story 3

- [ ] T017 [US3] Finalize completed-task rendering and summary behavior in src/components/DailyPlanner/CompletedSection.jsx
- [ ] T018 [US3] Finalize completion-state styling and delete affordance motion in src/components/DailyPlanner/TaskItem.css
- [ ] T019 [US3] Stabilize undo timeout visibility and messaging in src/components/DailyPlanner/UndoToast.jsx
- [ ] T020 [US3] Finalize optimistic delete and restore behavior in src/hooks/useTasks.js

**Checkpoint**: User Story 3 works independently and completes the P1 MVP loop.

---

## Phase 6: User Story 4 - Manual Task Reordering (Priority: P2)

**Goal**: Users can reorder tasks manually with pointer and keyboard support while preserving persistent order.

**Independent Test**: Reorder a task with drag or keyboard controls, refresh/reload state, and verify the chosen manual order persists.

### Tests for User Story 4

- [ ] T021 [P] [US4] Add manual reorder regression coverage in src/hooks/useTasks.test.js

### Implementation for User Story 4

- [ ] T022 [US4] Finalize drag sensor and keyboard reorder flow in src/hooks/useDragAndDrop.js
- [ ] T023 [US4] Finalize sortable list behavior and insertion handling in src/components/DailyPlanner/TaskList.jsx
- [ ] T024 [US4] Harden fractional manual-order persistence in src/services/taskService.js

**Checkpoint**: User Story 4 works independently for personal ordering control.

---

## Phase 7: User Story 5 - Task Sorting Options (Priority: P2)

**Goal**: Users can switch between manual, priority, due-date, creation-date, and RICE-aware sorting with clear UI feedback.

**Independent Test**: Apply each sort mode, confirm the list order changes correctly, and verify the active mode is visibly indicated.

### Tests for User Story 5

- [ ] T025 [P] [US5] Add sort-mode coverage in src/hooks/useTaskSort.test.js

### Implementation for User Story 5

- [ ] T026 [US5] Finalize sort mode logic and warning behavior in src/hooks/useTaskSort.js
- [ ] T027 [US5] Finalize sort controls UI and active-sort indication in src/components/DailyPlanner/SortControls.jsx
- [ ] T028 [US5] Integrate sort state with planner rendering in src/components/DailyPlanner/DailyPlanner.jsx

**Checkpoint**: User Story 5 works independently as a flexible task viewing layer.

---

## Phase 8: User Story 6 - Eisenhower Matrix View (Priority: P3)

**Goal**: Users can classify tasks into quadrants and have planner priorities update accordingly.

**Independent Test**: Open the matrix, move tasks between staging/quadrants, and verify quadrant assignment changes the resulting priority.

### Tests for User Story 6

- [ ] T029 [P] [US6] Add Eisenhower matrix interaction coverage in src/components/PrioritizationTools/PrioritizationTools.test.jsx

### Implementation for User Story 6

- [ ] T030 [US6] Finalize quadrant assignment and staging behavior in src/components/PrioritizationTools/EisenhowerMatrix.jsx
- [ ] T031 [US6] Finalize quadrant-to-priority constants in src/data/priorityConfig.js
- [ ] T032 [US6] Enforce quadrant-driven priority persistence in src/services/taskService.js
- [ ] T033 [US6] Integrate matrix state and section wiring in src/components/PrioritizationTools/PrioritizationTools.jsx

**Checkpoint**: User Story 6 works independently as a prioritization framework.

---

## Phase 9: User Story 7 - Top 3 Focus Generator (Priority: P3)

**Goal**: Users can generate and adjust a focused top-three set based on deadlines and priority.

**Independent Test**: Generate a Top 3 set from several tasks, dismiss one focus item, and verify a replacement is surfaced without breaking the ranking rules.

### Tests for User Story 7

- [ ] T034 [P] [US7] Extend prioritization coverage for Top 3 generation and dismissal in src/components/PrioritizationTools/PrioritizationTools.test.jsx

### Implementation for User Story 7

- [ ] T035 [US7] Finalize deadline-first ranking and replacement logic in src/hooks/useTop3Focus.js
- [ ] T036 [US7] Finalize Top 3 generation and dismissal UI in src/components/PrioritizationTools/TopThreeFocus.jsx
- [ ] T037 [US7] Surface focus cards in the Today view in src/components/DailyPlanner/TodayView.jsx

**Checkpoint**: User Story 7 works independently as a decision-support layer.

---

## Phase 10: User Story 8 - RICE Scoring Tool (Priority: P4)

**Goal**: Users can score tasks with RICE inputs and use that score in planner ranking and display.

**Independent Test**: Enter RICE values for tasks, verify score calculation updates immediately, and confirm RICE sort/badge behavior reflects those scores.

### Tests for User Story 8

- [ ] T038 [P] [US8] Extend prioritization coverage for RICE scoring in src/components/PrioritizationTools/PrioritizationTools.test.jsx

### Implementation for User Story 8

- [ ] T039 [US8] Finalize live RICE input, calculation, and persistence in src/components/PrioritizationTools/RiceScoring.jsx
- [ ] T040 [US8] Finalize RICE-based sort ordering in src/hooks/useTaskSort.js
- [ ] T041 [US8] Finalize optional RICE badge rendering in src/components/DailyPlanner/TaskItem.jsx

**Checkpoint**: User Story 8 works independently as the advanced prioritization layer.

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Finish adjacent UX polish and documentation that support the planner release as a stable product increment.

- [ ] T042 [P] Add breathing visual and timer regression coverage in src/components/BreathingExercise.test.jsx
- [ ] T043 [P] Refine breathing routine state and visual metadata in src/components/BreathingExercise.jsx
- [ ] T044 [P] Refine breathing animation performance and reduced-motion behavior in src/components/BreathingExercise.css
- [ ] T045 [P] Update user-facing testing and feature documentation in README.md
- [ ] T046 [P] Update validation and execution guidance in specs/002-daily-planner/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies, can start immediately.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user-story work.
- **User Stories (Phases 3-10)**: Depend on Foundational completion.
- **Polish (Phase 11)**: Depends on the desired story phases being complete.

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2 and does not depend on any other story.
- **US2 (P1)**: Starts after Phase 2 and builds on the planner shell from US1 while remaining independently testable.
- **US3 (P1)**: Starts after Phase 2 and depends only on the shared planner/task state.
- **US4 (P2)**: Starts after Phase 2 and can proceed in parallel with US5-US8.
- **US5 (P2)**: Starts after Phase 2 and integrates with the shared task collections.
- **US6 (P3)**: Starts after Phase 2 and integrates with prioritization data only.
- **US7 (P3)**: Starts after Phase 2 and depends on task metadata, not on matrix completion.
- **US8 (P4)**: Starts after Phase 2 and extends sorting/display behavior independently.

### Recommended Delivery Order

1. Phase 1 → Phase 2
2. US1 → US2 → US3 for MVP stabilization
3. US4 and US5 in either order
4. US6 and US7 in either order
5. US8
6. Polish

### Within Each User Story

- Story-specific tests come first and should fail before the corresponding implementation tasks are completed.
- Data/state tasks precede UI integration tasks when both exist.
- Each story should be revalidated independently before moving to the next priority band.

---

## Parallel Example: User Story 1

```bash
# Run the test and UI refinements in parallel once foundational work is done:
Task: T008 Add Today view render and empty-state coverage in src/components/DailyPlanner/DailyPlanner.test.jsx
Task: T009 Refine current-date and summary rendering in src/components/DailyPlanner/TodayView.jsx
Task: T011 Tighten active/completed list separation in src/components/DailyPlanner/TaskList.jsx
```

## Parallel Example: User Story 4

```bash
# Split reorder work across test, hook, and persistence layers:
Task: T021 Add manual reorder regression coverage in src/hooks/useTasks.test.js
Task: T022 Finalize drag sensor and keyboard reorder flow in src/hooks/useDragAndDrop.js
Task: T024 Harden fractional manual-order persistence in src/services/taskService.js
```

## Parallel Example: User Story 6

```bash
# Develop matrix behavior, constants, and section wiring concurrently:
Task: T029 Add Eisenhower matrix interaction coverage in src/components/PrioritizationTools/PrioritizationTools.test.jsx
Task: T031 Finalize quadrant-to-priority constants in src/data/priorityConfig.js
Task: T033 Integrate matrix state and section wiring in src/components/PrioritizationTools/PrioritizationTools.jsx
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Setup.
2. Complete Foundational.
3. Complete US1, US2, and US3.
4. Validate the planner MVP: Today view, quick add/edit, completion, delete, and undo.
5. Demo or ship the stabilized MVP before tackling advanced prioritization.

### Incremental Delivery

1. **Increment 1**: Setup + Foundational + US1-US3
2. **Increment 2**: US4-US5
3. **Increment 3**: US6-US7
4. **Increment 4**: US8 + Polish

### Parallel Team Strategy

With multiple contributors after Phase 2:

- Engineer A: US1-US3
- Engineer B: US4-US5
- Engineer C: US6-US8
- Shared follow-up: Polish tasks T042-T046

---

## Task Counts

- **Setup**: 3
- **Foundational**: 4
- **US1**: 4
- **US2**: 4
- **US3**: 5
- **US4**: 4
- **US5**: 4
- **US6**: 5
- **US7**: 4
- **US8**: 4
- **Polish**: 5
- **Total**: 46

## Independent Test Criteria by Story

- **US1**: Today view shows date, summary, and task list immediately on load.
- **US2**: Quick add creates a task on Enter and inline editing persists title changes.
- **US3**: Completion, restore, delete, and undo all work without losing task state.
- **US4**: Manual reorder updates visible order and persists across refresh.
- **US5**: Each sort mode changes order predictably and exposes the active sort state.
- **US6**: Matrix movements update both quadrant placement and resulting priority.
- **US7**: Top 3 generation and dismissal follow deadline-first ranking rules.
- **US8**: RICE inputs compute scores live and can drive sorting/display.

## Notes

- `[P]` tasks touch different files or isolated layers and can safely run in parallel.
- Repeated file paths across phases are intentional where the same module supports multiple user stories.
- Breathing tasks are kept in Polish because they support the validated release but are not part of the original Daily Planner story set.
