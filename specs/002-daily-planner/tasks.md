# Tasks: Daily Planner & Task Management

**Input**: Design documents from `/specs/002-daily-planner/`  
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/components.md ✓

**Tests**: Test tasks are NOT included (not explicitly requested). Add E2E tests in Polish phase.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US8)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependencies, and database schema

- [x] T001 Install new dependencies: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @tanstack/react-virtual date-fns`
- [x] T002 [P] Create priority config data in src/data/priorityConfig.js (Eisenhower mapping, RICE formula)
- [x] T003 [P] Extend database schema in src/services/db.js (add tasks + archivedTasks stores, upgrade to v2)
- [x] T004 Create task service layer in src/services/taskService.js (CRUD operations, multi-tab sync via BroadcastChannel)
- [x] T005 [P] Create directory structure: src/components/DailyPlanner/, src/components/PrioritizationTools/, src/components/TaskHistory/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core hooks and navigation that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Implement useTasks hook in src/hooks/useTasks.js (task state, CRUD actions, pending delete with undo, BroadcastChannel sync)
- [x] T007 [P] Implement useTaskSort hook in src/hooks/useTaskSort.js (sortBy, sortDirection, sortedTasks function)
- [x] T008 [P] Implement useDragAndDrop hook in src/hooks/useDragAndDrop.js (dnd-kit sensors, drag handlers, keyboard support)
- [x] T009 [P] Implement useTop3Focus hook in src/hooks/useTop3Focus.js (generate, dismiss, deadline-first algorithm)
- [x] T010 [P] Implement useTaskArchive hook in src/hooks/useTaskArchive.js (7-day retention, archive logic)
- [x] T011 Extend SectionNav in src/components/Navigation/SectionNav.jsx (add Today, Prioritization Tools links)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Frictionless Today View (Priority: P1) 🎯 MVP

**Goal**: Users see a clean Today dashboard immediately on app load with current date and task summary

**Independent Test**: Load app → verify Today section visible → verify current date displayed → verify task list appears

### Implementation for User Story 1

- [x] T012 [P] [US1] Create DailyPlanner.jsx root component in src/components/DailyPlanner/DailyPlanner.jsx
- [x] T013 [P] [US1] Create DailyPlanner.css styles in src/components/DailyPlanner/DailyPlanner.css
- [x] T014 [P] [US1] Create TodayView.jsx component in src/components/DailyPlanner/TodayView.jsx (date header, task count, empty state)
- [x] T015 [P] [US1] Create TodayView.css styles in src/components/DailyPlanner/TodayView.css
- [x] T016 [P] [US1] Create TaskList.jsx component in src/components/DailyPlanner/TaskList.jsx (list container with virtualization-ready structure; actual useVirtualizer enabled in T054 when >50 tasks)
- [x] T017 [P] [US1] Create TaskList.css styles in src/components/DailyPlanner/TaskList.css
- [x] T018 [P] [US1] Create TaskItem.jsx component in src/components/DailyPlanner/TaskItem.jsx (checkbox, title, priority badge)
- [x] T019 [P] [US1] Create TaskItem.css styles in src/components/DailyPlanner/TaskItem.css
- [x] T020 [US1] Integrate DailyPlanner section into src/App.jsx (add as new scrollable section)

**Checkpoint**: Today View displays with date and task list - User Story 1 testable independently

---

## Phase 4: User Story 2 - Quick Task Creation (Priority: P1) 🎯 MVP

**Goal**: Users can type + Enter to instantly add tasks without modals or forms; users can edit existing tasks inline

**Independent Test**: Type in quick-add → press Enter → verify task appears in <200ms → verify default today date + medium priority → click task title → verify inline edit works

### Implementation for User Story 2

- [x] T021 [P] [US2] Create QuickAdd.jsx component in src/components/DailyPlanner/QuickAdd.jsx (input field, Enter/Escape handlers)
- [x] T022 [P] [US2] Create QuickAdd.css styles in src/components/DailyPlanner/QuickAdd.css (prominent, always-visible input)
- [x] T023 [US2] Integrate QuickAdd into TodayView in src/components/DailyPlanner/TodayView.jsx (wire to createTask action)
- [x] T024 [US2] Add inline edit to TaskItem in src/components/DailyPlanner/TaskItem.jsx (click-to-edit title, FR-029)

**Checkpoint**: Quick task creation AND inline editing work - Users can add and edit tasks frictionlessly

---

## Phase 5: User Story 3 - Task Completion (Priority: P1) 🎯 MVP

**Goal**: Users can check off tasks with satisfying animation; completed tasks remain visible; users can delete tasks with undo

**Independent Test**: Click checkbox → verify strike-through animation → verify task moves to completed section → verify uncheck restores → delete task → verify 5-second undo toast

### Implementation for User Story 3

- [x] T025 [US3] Add completion animation to TaskItem in src/components/DailyPlanner/TaskItem.jsx (toggleComplete handler, visual states)
- [x] T026 [US3] Add completion CSS animations in src/components/DailyPlanner/TaskItem.css (strike-through, fade, 200-300ms)
- [x] T027 [P] [US3] Create CompletedSection.jsx component in src/components/DailyPlanner/CompletedSection.jsx (completed tasks list)
- [x] T028 [P] [US3] Create CompletedSection.css styles in src/components/DailyPlanner/CompletedSection.css
- [x] T029 [US3] Integrate CompletedSection into DailyPlanner in src/components/DailyPlanner/DailyPlanner.jsx
- [x] T030 [US3] Add delete with undo to TaskItem in src/components/DailyPlanner/TaskItem.jsx (trash icon, hover reveal on desktop, 5-second undo toast, FR-030/FR-031)

**Checkpoint**: Task completion AND deletion flow works - P1 user stories complete (MVP ready!)

---

## Phase 6: User Story 4 - Manual Task Reordering (Priority: P2)

**Goal**: Users can drag tasks to reorder with smooth animations and keyboard support

**Independent Test**: Drag task → verify lift effect → verify insertion indicator → drop → verify persisted order

### Implementation for User Story 4

- [x] T031 [US4] Add drag-and-drop context to TaskList in src/components/DailyPlanner/TaskList.jsx (DndContext, SortableContext)
- [x] T032 [US4] Make TaskItem sortable in src/components/DailyPlanner/TaskItem.jsx (useSortable hook integration)
- [x] T033 [US4] Add drag styles in src/components/DailyPlanner/TaskItem.css (lift effect, shadow, insertion indicator)
- [x] T034 [US4] Implement fractional indexing in src/services/taskService.js (manualOrder calculation on reorder)

**Checkpoint**: Drag-and-drop reordering works with 60fps animations

---

## Phase 7: User Story 5 - Task Sorting Options (Priority: P2)

**Goal**: Users can sort by priority, due date, or creation time with smooth reordering

**Independent Test**: Select sort option → verify list reorders → verify current sort indicated → verify manual order warning

### Implementation for User Story 5

- [x] T035 [P] [US5] Create SortControls.jsx component in src/components/DailyPlanner/SortControls.jsx (dropdown, active indicator)
- [x] T036 [P] [US5] Create SortControls.css styles in src/components/DailyPlanner/SortControls.css
- [x] T037 [US5] Integrate SortControls with TaskList in src/components/DailyPlanner/DailyPlanner.jsx (wire to useTaskSort)
- [x] T038 [US5] Add sort transition animation in src/components/DailyPlanner/TaskList.css (smooth reorder on sort change)

**Checkpoint**: All sorting options work - P2 user stories complete

---

## Phase 8: User Story 6 - Eisenhower Matrix View (Priority: P3)

**Goal**: Users can view tasks in a 2x2 matrix and drag between quadrants to set priority

**Independent Test**: Open Prioritization Tools → verify 4 quadrants displayed → drag task to new quadrant → verify priority updated

### Implementation for User Story 6

- [x] T039 [P] [US6] Create PrioritizationTools.jsx root component in src/components/PrioritizationTools/PrioritizationTools.jsx
- [x] T040 [P] [US6] Create PrioritizationTools.css styles in src/components/PrioritizationTools/PrioritizationTools.css
- [x] T041 [P] [US6] Create EisenhowerMatrix.jsx component in src/components/PrioritizationTools/EisenhowerMatrix.jsx (4 quadrants, staging area)
- [x] T042 [P] [US6] Create EisenhowerMatrix.css styles in src/components/PrioritizationTools/EisenhowerMatrix.css (2x2 grid layout)
- [x] T043 [US6] Implement quadrant drag-drop in src/components/PrioritizationTools/EisenhowerMatrix.jsx (cross-quadrant drag, priority mapping)
- [x] T044 [US6] Integrate PrioritizationTools section into src/App.jsx (add as new scrollable section)

**Checkpoint**: Eisenhower Matrix works with drag-and-drop categorization

---

## Phase 9: User Story 7 - Top 3 Focus Generator (Priority: P3)

**Goal**: Users can generate 3 suggested focus tasks based on urgency/deadlines with dismissal

**Independent Test**: Click "Generate Top 3" with 5+ tasks → verify 3 tasks highlighted → dismiss one → verify replacement suggested

### Implementation for User Story 7

- [x] T045 [P] [US7] Create TopThreeFocus.jsx component in src/components/PrioritizationTools/TopThreeFocus.jsx (generate button, focus cards)
- [x] T046 [P] [US7] Create TopThreeFocus.css styles in src/components/PrioritizationTools/TopThreeFocus.css (focus card styling)
- [x] T047 [US7] Integrate Top 3 display into TodayView in src/components/DailyPlanner/TodayView.jsx (special focus section at top, shown after generation)
- [x] T048 [US7] Add Top 3 to PrioritizationTools section in src/components/PrioritizationTools/PrioritizationTools.jsx

**Checkpoint**: Top 3 Focus generator works - P3 user stories complete

---

## Phase 10: User Story 8 - RICE Scoring Tool (Priority: P4)

**Goal**: Users can input RICE scores for tasks and see calculated priority scores

**Independent Test**: Open RICE tool → input R/I/C/E values → verify score calculated → verify sort by RICE works

### Implementation for User Story 8

- [x] T049 [P] [US8] Create RiceScoring.jsx component in src/components/PrioritizationTools/RiceScoring.jsx (score inputs, calculation display)
- [x] T050 [P] [US8] Create RiceScoring.css styles in src/components/PrioritizationTools/RiceScoring.css
- [x] T051 [US8] Add RICE badge to TaskItem in src/components/DailyPlanner/TaskItem.jsx (optional score display)
- [x] T052 [US8] Add RICE sort option to useTaskSort in src/hooks/useTaskSort.js (sort by calculated score)
- [x] T053 [US8] Integrate RiceScoring into PrioritizationTools in src/components/PrioritizationTools/PrioritizationTools.jsx

**Checkpoint**: RICE Scoring works - All user stories complete

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Performance optimization (virtualization for 100+ tasks), archive history view, and E2E tests

- [x] T054 [P] Enable virtualization in TaskList in src/components/DailyPlanner/TaskList.jsx (activate useVirtualizer when task count > 50, per SC-002)
- [x] T055 [P] Create TaskHistory.jsx component in src/components/TaskHistory/TaskHistory.jsx (archived tasks view, FR-033 - optional for MVP)
- [x] T056 [P] Create TaskHistory.css styles in src/components/TaskHistory/TaskHistory.css
- [x] T057 [P] Add TaskHistory link to navigation in src/components/Navigation/SectionNav.jsx
- [x] T058 [P] Create daily-planner.spec.ts E2E tests in e2e/daily-planner.spec.ts (task CRUD, inline edit, delete with undo, completion flow)
- [x] T059 [P] Create task-drag-drop.spec.ts E2E tests in e2e/task-drag-drop.spec.ts (drag reordering, keyboard a11y)
- [x] T060 [P] Create prioritization-tools.spec.ts E2E tests in e2e/prioritization-tools.spec.ts (Eisenhower, Top 3, RICE)
- [x] T061 Run quickstart.md validation to verify all setup steps work

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-10)**: All depend on Foundational phase completion
  - Stories can proceed sequentially (P1 → P2 → P3 → P4) or in parallel if staffed
- **Polish (Phase 11)**: Depends on all user stories being complete

### User Story Dependencies

| Story | Priority | Can Start After | Depends On Other Stories |
|-------|----------|-----------------|--------------------------|
| US1 - Today View | P1 | Phase 2 (Foundational) | None |
| US2 - Quick Add | P1 | Phase 2 | None (integrates with US1 components) |
| US3 - Completion | P1 | Phase 2 | None (integrates with US1 components) |
| US4 - Drag Reorder | P2 | Phase 2 | None |
| US5 - Sorting | P2 | Phase 2 | None |
| US6 - Eisenhower | P3 | Phase 2 | None |
| US7 - Top 3 Focus | P3 | Phase 2 | None (displays in US1 view) |
| US8 - RICE Scoring | P4 | Phase 2 | None |

### Parallel Opportunities

**Within Phase 1 (Setup)**:
```
T002, T003, T005 can run in parallel
```

**Within Phase 2 (Foundational)**:
```
T007, T008, T009, T010 can run in parallel (after T006)
```

**Within Each User Story (Example: US1)**:
```
T012, T013, T014, T015, T016, T017, T018, T019 can ALL run in parallel
```

**Across User Stories (with multiple developers)**:
```
After Phase 2 completes:
- Developer A: US1 → US2 → US3 (P1 MVP track)
- Developer B: US4 → US5 (P2 track)
- Developer C: US6 → US7 → US8 (P3/P4 track)
```

---

## Implementation Strategy

### MVP First (P1 User Stories Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: US1 - Today View
4. Complete Phase 4: US2 - Quick Add
5. Complete Phase 5: US3 - Task Completion
6. **STOP and VALIDATE**: Test MVP independently - users can view, add, and complete tasks
7. Deploy/demo if ready

### Incremental Delivery

| Increment | Stories | Value Delivered |
|-----------|---------|-----------------|
| MVP | US1 + US2 + US3 | Basic task management with Today View |
| v1.1 | + US4 + US5 | Personalized ordering and flexible views |
| v1.2 | + US6 + US7 | Prioritization decision support |
| v1.3 | + US8 | Advanced RICE scoring |

### Task Counts

| Phase | Task Count | Parallel Tasks |
|-------|------------|----------------|
| Setup | 5 | 3 |
| Foundational | 6 | 4 |
| US1 (P1) | 9 | 8 |
| US2 (P1) | 4 | 2 |
| US3 (P1) | 6 | 2 |
| US4 (P2) | 4 | 0 |
| US5 (P2) | 4 | 2 |
| US6 (P3) | 6 | 4 |
| US7 (P3) | 4 | 2 |
| US8 (P4) | 5 | 2 |
| Polish | 8 | 7 |
| **Total** | **61** | **36** |

---

## Notes

- All `[P]` tasks can run in parallel (different files, no dependencies)
- `[Story]` labels map tasks to user stories for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- P1 stories (US1-US3) form the MVP - prioritize these first
