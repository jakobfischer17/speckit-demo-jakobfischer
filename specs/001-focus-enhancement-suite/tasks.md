# Tasks: Focus Enhancement Suite

**Input**: Design documents from `/specs/001-focus-enhancement-suite/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Testing**: Playwright E2E tests for all components (cross-browser: Chromium, Firefox, WebKit)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Tests are written alongside implementation per TDD principles.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Add new dependencies, create directory structure, and configure testing

- [X] T001 Install `idb` package for IndexedDB wrapper: `npm install idb`
- [X] T002 Install Playwright test framework: `npm install -D @playwright/test && npx playwright install`
- [X] T003 [P] Create directory structure: `src/hooks/`, `src/services/`, `src/data/`
- [X] T004 [P] Create component directories: `src/components/AudioPlayer/`, `src/components/Statistics/`, `src/components/Rewards/`, `src/components/Navigation/`
- [X] T005 [P] Create test directory: `e2e/`
- [X] T006 Create playwright.config.ts with multi-browser setup (Chromium, Firefox, WebKit)
- [X] T007 [P] Create e2e/fixtures/test-utils.ts with common test helpers (IndexedDB seeding, page setup)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T008 Implement IndexedDB service with schema in src/services/db.js (sessions, stats, achievements stores per data-model.md)
- [X] T009 Implement statsService with session recording and aggregation in src/services/statsService.js
- [X] T010 [P] Create useStats hook for statistics state management in src/hooks/useStats.js
- [X] T011 [P] Create useScrollSpy hook using Intersection Observer in src/hooks/useScrollSpy.js
- [X] T012 Implement SectionNav component with sticky positioning in src/components/Navigation/SectionNav.jsx
- [X] T013 [P] Create SectionNav styles with CSS variables in src/components/Navigation/SectionNav.css
- [X] T014 Refactor App.jsx to use section-based layout with scroll navigation (replace tab-based navigation)
- [X] T015 Update App.css with section layout styles and new CSS variables for new components
- [X] T016 [TEST] Create e2e/navigation.spec.ts - test scroll navigation, section highlighting, keyboard nav

**Checkpoint**: Foundation ready - section navigation works, database initialized, user story implementation can begin

---

## Phase 3: User Story 1 - Focus Audio Player (Priority: P1) 🎯 MVP

**Goal**: Enable users to play binaural beats and ambient music to enhance focus

**Independent Test**: Select a binaural preset, click play, hear audio with volume control; select ambient track, see YouTube embed play

### Implementation for User Story 1

- [X] T017 [P] [US1] Create useAudioContext singleton hook in src/hooks/useAudioContext.js
- [X] T018 [P] [US1] Create useBinauralBeat hook with oscillator management in src/hooks/useBinauralBeat.js
- [X] T019 [P] [US1] Create audio track configuration data in src/data/audioTracks.js (3 binaural presets, 3 ambient tracks)
- [X] T020 [US1] Implement BinauralGenerator component with frequency presets in src/components/AudioPlayer/BinauralGenerator.jsx
- [X] T021 [US1] Implement AmbientPlayer component with YouTube IFrame API in src/components/AudioPlayer/AmbientPlayer.jsx
- [X] T022 [US1] Implement AudioPlayer container with tabs and volume control in src/components/AudioPlayer/AudioPlayer.jsx
- [X] T023 [P] [US1] Create AudioPlayer styles in src/components/AudioPlayer/AudioPlayer.css
- [X] T024 [US1] Add AudioPlayer section to App.jsx with section id for navigation
- [X] T025 [US1] Add error handling for unavailable YouTube content with fallback message
- [X] T026 [TEST] [US1] Create e2e/audio-player.spec.ts - test binaural preset selection, play/pause, volume control, tab switching, YouTube embed

**Checkpoint**: Audio player fully functional - binaural beats generate, ambient tracks play, volume control works

---

## Phase 4: User Story 2 - Pomodoro Milestone Rewards (Priority: P2)

**Goal**: Celebrate user achievements with confetti animations at pomodoro milestones (10, 25, 50, 100)

**Independent Test**: Complete 10th pomodoro, see confetti animation and achievement toast

### Implementation for User Story 2

- [X] T027 [P] [US2] Create useMilestones hook for achievement tracking in src/hooks/useMilestones.js
- [X] T028 [US2] Implement Confetti component with Canvas animation in src/components/Rewards/Confetti.jsx
- [X] T029 [P] [US2] Create Confetti styles (canvas overlay) in src/components/Rewards/Confetti.css
- [X] T030 [US2] Implement AchievementToast component with slide-in animation in src/components/Rewards/AchievementToast.jsx
- [X] T031 [US2] Integrate milestone checking into PomodoroTimer.jsx on session completion
- [X] T032 [US2] Connect PomodoroTimer to statsService to record completed sessions
- [X] T033 [US2] Add Confetti and AchievementToast to App.jsx (global overlay)
- [X] T034 [TEST] [US2] Create e2e/milestone-rewards.spec.ts - test confetti trigger at milestones (10, 25, 50, 100), toast display, animation completion

**Checkpoint**: Milestone rewards working - completing pomodoros triggers celebrations at thresholds

---

## Phase 5: User Story 3 - Focus Statistics Dashboard (Priority: P3)

**Goal**: Display focus statistics including totals, streaks, and 7-day chart

**Independent Test**: Complete pomodoros, navigate to Stats section, see accurate totals and streak calculations

### Implementation for User Story 3

- [X] T035 [P] [US3] Implement StatsCard component in src/components/Statistics/StatsCard.jsx
- [X] T036 [P] [US3] Implement WeeklyChart component (CSS-only bars) in src/components/Statistics/WeeklyChart.jsx
- [X] T037 [US3] Implement Statistics container component in src/components/Statistics/Statistics.jsx
- [X] T038 [P] [US3] Create Statistics styles in src/components/Statistics/Statistics.css
- [X] T039 [US3] Add Statistics section to App.jsx with section id for navigation
- [X] T040 [US3] Add BroadcastChannel listener in useStats for multi-tab sync
- [X] T041 [US3] Implement 30-day session cleanup in statsService.js
- [X] T042 [TEST] [US3] Create e2e/statistics.spec.ts - test stats display, streak calculation, weekly chart rendering, multi-tab sync

**Checkpoint**: Statistics dashboard complete - shows accurate totals, streaks, and weekly chart

---

## Phase 6: User Story 4 - Science-Backed Productivity Tips (Priority: P4)

**Goal**: Enhance productivity tips with categorization and research citations

**Independent Test**: Navigate to Tips section, see organized categories with citations

### Implementation for User Story 4

- [X] T043 [P] [US4] Create categorized productivity tips data with citations in src/data/productivityTips.js
- [X] T044 [US4] Refactor ProductivityTips.jsx to display categories and citations
- [X] T045 [US4] Update ProductivityTips.css for category layout and citation styling
- [X] T046 [TEST] [US4] Create e2e/productivity-tips.spec.ts - test category display, citation links, responsive layout

**Checkpoint**: Enhanced tips section complete - categories displayed with science citations

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements affecting multiple user stories

- [X] T047 Add ARIA labels and keyboard navigation to all new interactive components
- [X] T048 [P] Verify responsive design 320px-1920px for all new sections
- [X] T049 [P] Run ESLint and fix any warnings: `npm run lint`
- [X] T050 Verify all useEffect cleanup functions properly dispose resources (timers, AudioContext, observers)
- [X] T051 [P] Update README.md with new features documentation
- [ ] T052 Run quickstart.md validation - verify all documented workflows work
- [X] T053 [TEST] Create e2e/accessibility.spec.ts - test keyboard navigation, ARIA labels, focus management across all components
- [ ] T054 [TEST] Run full Playwright test suite across all browsers: `npx playwright test`

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ─────────────────────────────────────────────────────►
                │
                ▼
Phase 2 (Foundational) ──────────────────────────────────────────────►
                │
                ├──────────────┬──────────────┬──────────────┐
                ▼              ▼              ▼              ▼
         Phase 3 (US1)   Phase 4 (US2)  Phase 5 (US3)  Phase 6 (US4)
         Audio Player    Rewards        Statistics     Tips
                │              │              │              │
                └──────────────┴──────────────┴──────────────┘
                                      │
                                      ▼
                              Phase 7 (Polish)
```

### User Story Dependencies

| Story | Depends On | Can Parallelize With |
|-------|------------|---------------------|
| US1 (Audio) | Phase 2 only | US2, US3, US4 |
| US2 (Rewards) | Phase 2 + PomodoroTimer integration | US1, US3, US4 |
| US3 (Stats) | Phase 2 + statsService | US1, US2, US4 |
| US4 (Tips) | Phase 2 only | US1, US2, US3 |

### Within Each User Story

1. Hooks/services before components
2. Sub-components before container components
3. Styles can run in parallel with implementation
4. Integration into App.jsx last

---

## Parallel Execution Examples

### Phase 2 Parallel Tasks
```
T006 useStats hook          ─┬─► (parallel)
T007 useScrollSpy hook      ─┘
T009 SectionNav.css         ─► (parallel with T008)
```

### User Story 1 Parallel Tasks
```
T012 useAudioContext        ─┬─► (parallel)
T013 useBinauralBeat        ─┤
T014 audioTracks.js data    ─┘
T018 AudioPlayer.css        ─► (parallel with T017)
```

### Cross-Story Parallel Tasks
After Phase 2, all user stories can start in parallel if team capacity allows.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1: Setup (~15 min)
2. Complete Phase 2: Foundational (~2 hours)
3. Complete Phase 3: User Story 1 - Audio Player (~3 hours)
4. **STOP and VALIDATE**: Audio plays, navigation works
5. Deploy/demo as MVP

### Incremental Delivery
1. MVP (Audio Player) → Demo
2. Add US2 (Rewards) → Demo gamification
3. Add US3 (Stats) → Demo analytics
4. Add US4 (Tips) → Demo content enhancement
5. Polish → Final release

### Task Counts by Phase

| Phase | Tasks | Test Tasks | Parallel Opportunities |
|-------|-------|------------|----------------------|
| Setup | 7 | 0 | 4 |
| Foundational | 9 | 1 | 3 |
| US1 Audio | 10 | 1 | 4 |
| US2 Rewards | 8 | 1 | 2 |
| US3 Stats | 8 | 1 | 3 |
| US4 Tips | 4 | 1 | 1 |
| Polish | 8 | 2 | 3 |
| **Total** | **54** | **7** | **20** |

---

## Notes

- All tasks include exact file paths per plan.md structure
- [P] tasks can run in parallel within their phase/story
- [TEST] tasks create Playwright E2E tests for the preceding implementation
- Each user story checkpoint = independently deployable increment
- US2 (Rewards) requires PomodoroTimer.jsx modification to record sessions
- Multi-tab sync (T040) should be tested with 2 browser windows
- Canvas confetti (T028) must use requestAnimationFrame for 60fps
- Run `npx playwright test --ui` for interactive test debugging
- Run `npx playwright test --project=chromium` to test single browser during development
