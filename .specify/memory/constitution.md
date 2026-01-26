<!--
SYNC IMPACT REPORT
==================
Version change: 0.0.0 → 1.0.0
Bump rationale: Initial constitution ratification (MAJOR)

Modified principles: N/A (initial version)

Added sections:
- Core Principles (4 principles: Code Quality, Testing Standards, UX Consistency, Performance)
- Technology Stack (React 19, Vite, CSS3)
- Development Workflow (quality gates and review process)
- Governance (amendment procedures)

Removed sections: N/A (initial version)

Templates requiring updates:
- ✅ plan-template.md - Constitution Check section compatible
- ✅ spec-template.md - Requirements align with principles
- ✅ tasks-template.md - Phase structure supports quality gates

Follow-up TODOs: None
-->

# Productivity Hub Constitution

## Core Principles

### I. Code Quality First

All code MUST adhere to strict quality standards to ensure maintainability and reliability.

- **Linting**: All code MUST pass ESLint checks with zero warnings before merge
- **Component Structure**: React components MUST be single-responsibility; extract logic into custom hooks when state management exceeds 3 state variables
- **File Organization**: Components MUST be co-located with their styles (`.jsx` + `.css` pairs in same directory)
- **Naming Conventions**: Components use PascalCase; hooks use `use` prefix; CSS classes use kebab-case with component-scoped prefixes
- **No Dead Code**: Unused imports, variables, and functions MUST be removed before commit
- **Explicit Dependencies**: All dependencies MUST be declared in `package.json`; no implicit globals

**Rationale**: Consistent code quality reduces cognitive load, accelerates onboarding, and prevents technical debt accumulation.

### II. Testing Standards

Testing MUST validate user-facing behavior and protect against regressions.

- **Component Testing**: Every user-interactive component MUST have at least one test covering its primary user flow
- **Test Isolation**: Tests MUST NOT depend on external state or execution order
- **Acceptance Criteria**: Features MUST include testable acceptance scenarios in Given/When/Then format
- **Timer Testing**: Components using `setInterval`/`setTimeout` MUST use mocked timers in tests
- **Accessibility Testing**: Interactive elements MUST be testable via accessible selectors (role, label)
- **Coverage Threshold**: New features SHOULD maintain or improve overall test coverage

**Rationale**: Tests document expected behavior, enable confident refactoring, and catch regressions before users encounter them.

### III. User Experience Consistency

The application MUST provide a cohesive, accessible, and delightful user experience.

- **Visual Consistency**: All components MUST use the established color palette and spacing system defined in CSS variables
- **Responsive Design**: Components MUST function correctly on viewport widths from 320px to 1920px
- **Interaction Feedback**: User actions MUST provide immediate visual feedback (hover states, loading indicators, transitions)
- **Animation Performance**: CSS animations MUST use `transform` and `opacity` only to ensure 60fps rendering
- **Accessibility**: All interactive elements MUST be keyboard-navigable; color MUST NOT be the only means of conveying information
- **Error States**: Components MUST gracefully handle and display error conditions to users
- **Browser Notifications**: Features using notifications MUST request permission gracefully and provide fallbacks

**Rationale**: Consistent UX builds user trust, reduces learning curve, and ensures the application is usable by all users.

### IV. Performance Requirements

The application MUST meet performance targets to ensure a responsive user experience.

- **Initial Load**: First Contentful Paint MUST occur within 1.5 seconds on 4G connections
- **Bundle Size**: Production JavaScript bundle MUST NOT exceed 200KB gzipped
- **Runtime Performance**: UI interactions MUST respond within 100ms; animations MUST maintain 60fps
- **Memory Management**: Components MUST clean up timers, subscriptions, and event listeners on unmount
- **Asset Optimization**: Images MUST be appropriately sized and compressed; use modern formats (WebP) where supported
- **No Memory Leaks**: Long-running features (timers, breathing exercises) MUST NOT accumulate memory over time

**Rationale**: Performance directly impacts user satisfaction, engagement, and accessibility on lower-powered devices.

## Technology Stack

The following technology choices are mandated for this project:

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | React | 19.x |
| Build Tool | Vite | 7.x |
| Styling | CSS3 with CSS Variables | - |
| Linting | ESLint | 9.x |
| Package Manager | npm | Latest LTS |

**Constraints**:
- No additional UI frameworks (Material UI, Chakra, etc.) without constitution amendment
- No state management libraries for current scope; reassess if component prop drilling exceeds 3 levels
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

**Version**: 1.0.0 | **Ratified**: 2026-01-26 | **Last Amended**: 2026-01-26
