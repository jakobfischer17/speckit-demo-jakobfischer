# Implementation Plan: Focus Enhancement Suite

**Branch**: `001-focus-enhancement-suite` | **Date**: 2026-01-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-focus-enhancement-suite/spec.md`

## Summary

Enhance the Productivity Hub SPA with four new capabilities: (1) Focus Audio Player using Web Audio API for generated binaural beats plus embedded YouTube content for ambient tracks, (2) Milestone Reward System with confetti animations at pomodoro thresholds, (3) Focus Statistics Dashboard with IndexedDB persistence showing streaks and historical data, and (4) expanded science-backed productivity tips. All features integrate into the existing single-page layout with sticky section navigation.

## Technical Context

**Language/Version**: JavaScript ES2022+ (React 19.x)  
**Primary Dependencies**: React 19, Vite 7, Web Audio API (native), IndexedDB (native via idb wrapper)  
**Storage**: IndexedDB for session data with 30-day retention + lifetime aggregates  
**Testing**: Playwright E2E tests (cross-browser)  
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)  
**Project Type**: Single-page web application  
**Performance Goals**: 60fps animations, <500ms audio latency, <200ms stats load, <200KB bundle  
**Constraints**: No external UI libraries, vanilla JS where possible, offline-capable data  
**Scale/Scope**: Single user, browser-local data, ~8 component sections

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status | Notes |
|-----------|------------|--------|-------|
| I. Code Quality First | ESLint zero warnings, single-responsibility components, co-located styles | ✅ PASS | New components will follow existing patterns |
| I. Code Quality First | Extract to hooks when >3 state variables | ✅ PASS | Audio player, stats will use custom hooks |
| II. Testing Standards | Component tests for user-interactive components | ✅ PASS | Playwright E2E tests for all user stories |
| II. Testing Standards | Timer components use mocked timers | ✅ PASS | Playwright page.clock for time manipulation |
| III. UX Consistency | CSS variables, responsive 320-1920px | ✅ PASS | Extend existing CSS system |
| III. UX Consistency | Animations use transform/opacity only | ✅ PASS | Canvas confetti, no DOM animations |
| III. UX Consistency | Keyboard navigable, accessible | ✅ PASS | Contracts specify ARIA requirements |
| IV. Performance | Bundle <200KB gzipped | ✅ PASS | idb ~1.5KB; Web Audio/Canvas are native |
| IV. Performance | 60fps animations, cleanup on unmount | ✅ PASS | Canvas confetti, useEffect cleanup |
| Technology Stack | React 19, Vite 7, CSS3, no UI frameworks | ✅ PASS | Using vanilla + native APIs |

**Gate Status**: ✅ PASS (Post-Design) - All requirements addressed in design artifacts

## Project Structure

### Documentation (this feature)

```text
specs/001-focus-enhancement-suite/
├── plan.md              # This file
├── research.md          # Phase 0 output ✅
├── data-model.md        # Phase 1 output ✅
├── quickstart.md        # Phase 1 output ✅
├── contracts/           # Phase 1 output ✅
│   └── components.md    # Hook and component interfaces
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── App.jsx                      # Main app with section navigation
├── App.css                      # Global styles + CSS variables
├── main.jsx                     # Entry point
├── components/
│   ├── PomodoroTimer.jsx        # [EXISTING] Enhanced with milestone hooks
│   ├── PomodoroTimer.css
│   ├── BreathingExercise.jsx    # [EXISTING] Unchanged
│   ├── BreathingExercise.css
│   ├── ProductivityTips.jsx     # [EXISTING] Enhanced with categories
│   ├── ProductivityTips.css
│   ├── AudioPlayer/             # [NEW] Focus audio section
│   │   ├── AudioPlayer.jsx
│   │   ├── AudioPlayer.css
│   │   ├── BinauralGenerator.jsx
│   │   └── AmbientPlayer.jsx
│   ├── Statistics/              # [NEW] Stats dashboard section
│   │   ├── Statistics.jsx
│   │   ├── Statistics.css
│   │   ├── StatsCard.jsx
│   │   └── WeeklyChart.jsx
│   ├── Rewards/                 # [NEW] Milestone celebrations
│   │   ├── Confetti.jsx
│   │   ├── Confetti.css
│   │   └── AchievementToast.jsx
│   └── Navigation/              # [NEW] Sticky section nav
│       ├── SectionNav.jsx
│       └── SectionNav.css
├── hooks/                       # [NEW] Custom hooks
│   ├── useAudioContext.js       # Web Audio API management
│   ├── useBinauralBeat.js       # Binaural beat generation
│   ├── useStats.js              # Statistics state + IndexedDB
│   ├── useMilestones.js         # Achievement tracking
│   └── useScrollSpy.js          # Active section detection
├── services/                    # [NEW] Data layer
│   ├── db.js                    # IndexedDB wrapper
│   └── statsService.js          # Session CRUD + aggregation
└── data/                        # [NEW] Static content
    └── productivityTips.js      # Categorized tips with citations

e2e/
├── playwright.config.ts         # Playwright configuration
├── audio-player.spec.ts         # US1 E2E tests
├── milestone-rewards.spec.ts    # US2 E2E tests
├── statistics.spec.ts           # US3 E2E tests
├── productivity-tips.spec.ts    # US4 E2E tests
├── navigation.spec.ts           # Navigation E2E tests
└── fixtures/
    └── test-utils.ts            # Shared test helpers
```

**Structure Decision**: Single-project SPA structure matching existing codebase. New features added as component directories with co-located styles. Shared logic extracted to `hooks/` and `services/` directories for reusability and testability.

## Complexity Tracking

> No constitution violations requiring justification.
