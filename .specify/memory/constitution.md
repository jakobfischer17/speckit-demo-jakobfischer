<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.1.0
Bump rationale: MINOR - Added new principle (Seamless SPA Experience) and expanded UX/Performance guidance for smooth single-page interactions

Modified principles:
- UX Consistency → Seamless Single-Page Experience (renamed and expanded)
- Performance Requirements → expanded with SPA-specific optimizations

Added sections:
- Principle I: Seamless Single-Page Experience (new primary principle)
- Smooth scrolling requirements
- Section transition guidelines
- State persistence across navigation

Removed sections: None

Templates requiring updates:
- ✅ plan-template.md - Constitution Check section compatible (no changes needed)
- ✅ spec-template.md - Requirements align with principles (no changes needed)
- ✅ tasks-template.md - Phase structure supports quality gates (no changes needed)

Follow-up TODOs: None
-->

# Productivity Hub Constitution

## Core Principles

### I. Seamless Single-Page Experience

The application MUST deliver a fluid, uninterrupted single-page experience where users flow naturally between sections without jarring transitions or page reloads.

- **Smooth Scrolling**: All navigation MUST use CSS `scroll-behavior: smooth` or equivalent JavaScript smooth scrolling; jump cuts are prohibited
- **Section Transitions**: Content sections MUST transition with subtle fade/slide animations (200-300ms duration) to maintain visual continuity
- **Scroll Position Awareness**: The application MUST track and highlight the active section via Intersection Observer; users MUST always know where they are
- **No Full Page Reloads**: Navigation between features MUST NEVER trigger full page reloads; all state changes happen client-side
- **Sticky Navigation**: The section navigation bar MUST remain visible and accessible at all scroll positions
- **Scroll Anchoring**: When content dynamically loads or expands, scroll position MUST be preserved to prevent layout shifts
- **Deep Linking Support**: URL hash fragments SHOULD reflect the current section for shareability without breaking the SPA flow

**Rationale**: A seamless SPA experience keeps users in flow state, reduces cognitive interruption, and makes the productivity hub feel like a native application rather than a website.

### II. Code Quality First

All code MUST adhere to strict quality standards to ensure maintainability and reliability.

- **Linting**: All code MUST pass ESLint checks with zero warnings before merge
- **Component Structure**: React components MUST be single-responsibility; extract logic into custom hooks when state management exceeds 3 state variables
- **File Organization**: Components MUST be co-located with their styles (`.jsx` + `.css` pairs in same directory)
- **Naming Conventions**: Components use PascalCase; hooks use `use` prefix; CSS classes use kebab-case with component-scoped prefixes
- **No Dead Code**: Unused imports, variables, and functions MUST be removed before commit
- **Explicit Dependencies**: All dependencies MUST be declared in `package.json`; no implicit globals

**Rationale**: Consistent code quality reduces cognitive load, accelerates onboarding, and prevents technical debt accumulation.

### III. Testing Standards

Testing MUST validate user-facing behavior and protect against regressions.

- **Component Testing**: Every user-interactive component MUST have at least one test covering its primary user flow
- **Test Isolation**: Tests MUST NOT depend on external state or execution order
- **Acceptance Criteria**: Features MUST include testable acceptance scenarios in Given/When/Then format
- **Timer Testing**: Components using `setInterval`/`setTimeout` MUST use mocked timers in tests
- **Accessibility Testing**: Interactive elements MUST be testable via accessible selectors (role, label)
- **Coverage Threshold**: New features SHOULD maintain or improve overall test coverage

**Rationale**: Tests document expected behavior, enable confident refactoring, and catch regressions before users encounter them.

### IV. Visual & Interaction Consistency

The application MUST provide a cohesive, accessible, and polished user experience that reinforces the seamless SPA feel.

- **Visual Consistency**: All components MUST use the established color palette and spacing system defined in CSS variables
- **Responsive Design**: Components MUST function correctly on viewport widths from 320px to 1920px
- **Micro-Interactions**: User actions MUST provide immediate visual feedback with smooth transitions (hover states, focus rings, loading spinners)
- **Animation Performance**: CSS animations MUST use `transform` and `opacity` only to ensure 60fps rendering; prefer CSS transitions over JavaScript animation
- **Consistent Motion**: All animations MUST follow the same easing curve (`ease-out` for entrances, `ease-in` for exits) and timing scale
- **Accessibility**: All interactive elements MUST be keyboard-navigable; focus indicators MUST be visible and follow smooth scroll behavior
- **Error States**: Components MUST gracefully handle and display error conditions without breaking the page flow

**Rationale**: Consistent visual language and smooth micro-interactions create a premium feel that keeps users engaged and oriented.

### V. Performance for Smooth UX

The application MUST meet performance targets that ensure buttery-smooth interactions and instant responsiveness.

- **Initial Load**: First Contentful Paint MUST occur within 1.5 seconds on 4G connections
- **Bundle Size**: Production JavaScript bundle MUST NOT exceed 200KB gzipped
- **Scroll Performance**: Scroll event handlers MUST be throttled/debounced; layouts MUST NOT reflow during scroll
- **60fps Guarantee**: All animations, transitions, and scroll interactions MUST maintain 60fps; use `will-change` sparingly for animated elements
- **Instant Feedback**: UI interactions MUST respond within 100ms; longer operations MUST show immediate loading state
- **Memory Management**: Components MUST clean up timers, subscriptions, and event listeners on unmount
- **Lazy Loading**: Below-the-fold content and heavy assets SHOULD lazy-load to prioritize above-the-fold interactivity
- **No Layout Shifts**: Cumulative Layout Shift (CLS) MUST stay below 0.1; reserve space for dynamic content

**Rationale**: Performance is the foundation of a smooth experience; even beautiful animations feel broken when they stutter or lag.

## Technology Stack

The following technology choices are mandated for this project:

| Layer | Technology | Version | SPA Relevance |
|-------|------------|---------|---------------|
| Framework | React | 19.x | Client-side routing, virtual DOM |
| Build Tool | Vite | 7.x | Fast HMR, optimized bundles |
| Styling | CSS3 with CSS Variables | - | Smooth transitions, theming |
| Scroll Detection | Intersection Observer API | - | Active section tracking |
| State Persistence | IndexedDB | - | Seamless data across sessions |
| Linting | ESLint | 9.x | Code quality |
| Package Manager | npm | Latest LTS | Dependency management |

**SPA-Specific Constraints**:
- No full page navigation; all routes handled client-side
- No additional UI frameworks (Material UI, Chakra, etc.) without constitution amendment
- No state management libraries for current scope; reassess if component prop drilling exceeds 3 levels
- All scroll-based features MUST use Intersection Observer (not scroll event listeners)
- Browser support: Latest 2 versions of Chrome, Firefox, Safari, Edge

## Development Workflow

### Quality Gates

All code changes MUST pass these gates before merge:

1. **Pre-commit**: ESLint passes with zero errors/warnings
2. **PR Review**: At least one approval from a team member
3. **Build Verification**: `npm run build` completes without errors
4. **Constitution Compliance**: Changes align with all applicable principles

### Code Review Checklist

Reviewers MUST verify:
- [ ] Component follows single-responsibility principle
- [ ] Styles use established CSS variables
- [ ] Interactive elements are keyboard-accessible
- [ ] Timers/subscriptions are properly cleaned up
- [ ] No console.log statements in production code
- [ ] Feature documentation updated if applicable
- [ ] **Smooth scroll behavior preserved** (no jump cuts)
- [ ] **Animations use transform/opacity only** (60fps)
- [ ] **No layout shifts during dynamic content loading**

## Governance

This constitution serves as the authoritative source for development standards in the Productivity Hub project.

**Amendment Process**:
1. Propose changes via documented discussion
2. Evaluate impact on existing code and workflows
3. Update constitution with version increment
4. Communicate changes to all contributors
5. Allow grace period for existing code to comply

**Versioning Policy**:
- MAJOR: Backward-incompatible principle changes or removals
- MINOR: New principles added or existing ones materially expanded
- PATCH: Clarifications, typo fixes, non-semantic refinements

**Compliance**:
- All PRs MUST reference applicable constitution principles when relevant
- Constitution violations MUST be resolved before merge or explicitly waived with documented justification
- Quarterly review of constitution relevance and effectiveness

**Version**: 1.1.0 | **Ratified**: 2026-01-26 | **Last Amended**: 2026-01-27
