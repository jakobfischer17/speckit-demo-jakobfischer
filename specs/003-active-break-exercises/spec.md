# Feature Specification: Active Break Exercises

**Feature Branch**: `003-active-break-exercises`  
**Created**: 2026-04-12  
**Status**: Draft  
**Input**: User description: "create an active break section that has some light, and some intense sports exercises with graphical animations for explaining, breathing patterns etc. They need to be finished quickly, e.g. 10 pushups or something like that but not '30 min run'. Since this aims to fuel the break of e.g. a pomodoro timer with some physical activity. also include stretches"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Follow a Guided Exercise During a Break (Priority: P1)

A user whose Pomodoro break timer fires wants to do a quick physical activity. They open the Active Break panel, pick or receive a suggested exercise, follow the animated step-by-step guide, and complete it — all within the break window.

**Why this priority**: This is the core value proposition. Without a working animated exercise guide there is no feature.

**Independent Test**: Navigate directly to the Active Break component, start any single exercise, follow its animated guide until the rep/set counter reaches zero. The component delivers standalone value.

**Acceptance Scenarios**:

1. **Given** the Active Break panel is open, **When** the user selects "Push-ups (10 reps)", **Then** an animated illustration plays showing correct form and a rep counter counts down from 10.
2. **Given** an exercise animation is playing, **When** the rep counter reaches zero, **Then** the exercise is marked complete and the user is shown a completion state.
3. **Given** the user is mid-exercise, **When** they press "Skip", **Then** the exercise ends immediately and they return to the exercise selection view.

---

### User Story 2 - Browse & Filter Exercises by Category (Priority: P2)

A user wants to choose what kind of movement suits their current energy level. They can filter the exercise library by category (Light, Intense, Stretch) and pick something intentionally rather than getting a random suggestion.

**Why this priority**: Personalisation of intensity is a key differentiator; users must not be forced into pushups when they have back pain.

**Independent Test**: Render the exercise library view in isolation; verify that selecting each filter category updates the displayed exercise list to show only matching entries.

**Acceptance Scenarios**:

1. **Given** the exercise library is shown with all categories, **When** the user selects the "Stretch" filter, **Then** only stretching exercises are displayed.
2. **Given** only "Intense" exercises are shown, **When** the user clears the filter, **Then** all categories reappear.
3. **Given** a category is selected that has no exercises, **Then** an empty-state message is shown instead of a blank area.

---

### User Story 3 - Automatic Breathing Cool-Down After Intense Exercise (Priority: P3)

After completing an intense exercise (e.g., burpees, jumping jacks), the system automatically transitions into a brief breathing cool-down so the user recovers before returning to focused work.

**Why this priority**: Without cool-down guidance, intense exercises can leave users more distracted than before. It also reuses the existing BreathingExercise component, making implementation low-cost.

**Independent Test**: Complete any exercise tagged "Intense" and verify the breathing cool-down sequence starts automatically without user interaction; verify it does NOT appear after a "Light" or "Stretch" exercise.

**Acceptance Scenarios**:

1. **Given** the user completes an Intense exercise, **When** the completion screen appears, **Then** a breathing cool-down (e.g., 4-7-8 pattern, ~1 min) starts automatically after a 2-second pause.
2. **Given** the user completes a Light or Stretch exercise, **When** the completion screen appears, **Then** no automatic breathing cool-down is triggered.
3. **Given** a breathing cool-down is underway, **When** the user presses "Skip Cool-Down", **Then** the cool-down ends and the user returns to the exercise library.

---

### User Story 4 - Pomodoro Break Integration (Priority: P4)

When the Pomodoro timer transitions into a break phase, the Active Break panel is surfaced automatically so the user does not have to navigate there manually.

**Why this priority**: Discoverability integration adds user delight but is not required for the core exercise functionality to work.

**Independent Test**: Trigger a Pomodoro break and verify the Active Break component is promoted/displayed; verify no change to non-break Pomodoro phases.

**Acceptance Scenarios**:

1. **Given** a Pomodoro work session ends, **When** the timer enters a short or long break, **Then** the Active Break panel is highlighted or a prompt invites the user to start an active break.
2. **Given** the user dismisses the Active Break prompt, **When** they remain in the break phase, **Then** the prompt does not reappear for that same break.
3. **Given** the Pomodoro timer is in a work phase, **When** the user navigates to Active Break manually, **Then** the panel opens normally with no integration-related side effects.

---

### Edge Cases

- What happens when the user resizes the browser to a very small viewport mid-animation — does the animation remain legible?
- How does the system handle a break that ends (Pomodoro work phase resumes) while an exercise is still in progress — does it warn the user or let them finish?
- What if the user has no break selected (using Active Break standalone without Pomodoro) — is the panel fully functional in isolation?
- What if all exercises in a chosen category have already been completed in the current session — does the system reset, suggest cross-category, or show a congratulations state?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a library of at least 12 exercises covering three categories: Light (e.g., desk stretches, shoulder rolls), Intense (e.g., push-ups, jumping jacks, burpees, squat jumps), and Stretch (e.g., hip flexor stretch, neck rolls, forward fold).
- **FR-002**: Every exercise MUST have a duration or rep target that can be completed in 5 minutes or fewer under normal conditions.
- **FR-003**: Every exercise MUST include a looping animated illustration demonstrating correct form; the animation MUST be understandable without sound.
- **FR-004**: Exercises MUST be filterable by category; the default view shows all categories.
- **FR-005**: Each exercise session MUST display a live progress indicator (rep countdown or time countdown) that updates in real time.
- **FR-006**: Completing an exercise tagged as "Intense" MUST automatically trigger a breathing cool-down sequence before returning to the library.
- **FR-007**: Users MUST be able to skip any exercise or any cool-down at any point without losing their place in the session.
- **FR-008**: The Active Break panel MUST function as a standalone component independent of the Pomodoro timer.
- **FR-009**: When the Pomodoro timer enters a break phase, the system MUST surface an invitation to start an active break (non-blocking prompt, dismissible).
- **FR-010**: Breathing patterns used in the cool-down MUST reuse the existing BreathingExercise component or its underlying logic without duplicating behaviour.

### Key Entities

- **Exercise**: name, category (Light | Intense | Stretch), rep count OR duration in seconds, animated illustration, step-by-step instruction text, cool-down required (boolean).
- **ActiveBreakSession**: list of completed exercises, current exercise index, session start time, completion status.
- **BreathingCoolDown**: reference to a breathing pattern (reuses BreathingExercise data shape), auto-triggered flag.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can start and complete a full active break (1–3 exercises including cool-down) in 5 minutes or fewer.
- **SC-002**: Users can identify the correct movement for any exercise from the animation alone, without referring to external resources (validated by usability observation: ≥80% of test users perform the correct motion on first attempt).
- **SC-003**: A breathing cool-down begins automatically within 3 seconds of completing an Intense exercise — zero additional user interactions required.
- **SC-004**: The Active Break prompt appears on every Pomodoro break transition with no additional user configuration.
- **SC-005**: All exercise animations remain legible and performant (no dropped frames visible to the naked eye) on common desktop and mobile viewport sizes.

## Assumptions

- The existing `BreathingExercise` component and its breathing-pattern data structures will be reused directly for cool-down sequences; no separate breathing implementation will be created.
- Exercises are defined as static data (not fetched from a remote API) in the initial version; dynamic or user-added exercises are out of scope.
- Exercise animations are CSS/SVG-based to avoid large binary asset downloads and stay within the 200 kB bundle budget defined in the project constitution.
- Audio cues (voice coaching, sound effects) are out of scope for v1; the feature must be fully usable in silence.
- The Pomodoro integration is a soft prompt only — the Active Break panel does not pause or control the Pomodoro timer.
- Mobile-first layout is assumed; the animations must degrade gracefully on viewports as small as 320 px wide.
