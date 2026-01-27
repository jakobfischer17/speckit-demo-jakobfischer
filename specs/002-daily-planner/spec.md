# Feature Specification: Daily Planner & Task Management

**Feature Branch**: `002-daily-planner`  
**Created**: 2026-01-27  
**Status**: Draft  
**Input**: User description: "Daily planner with frictionless today view, task list with add/check/sort/drag capabilities, and prioritization tools including Eisenhower matrix, RICE scoring, and top 3 generator"

## Clarifications

### Session 2026-01-27

- Q: Can users edit or delete existing tasks? → A: Edit inline + delete with undo — Click task title to edit; swipe or trash icon to delete with 5-second undo
- Q: How long are completed tasks retained before cleanup? → A: 7-day retention — Completed tasks auto-archive after 7 days; archived tasks viewable in history
- Q: How does multi-tab synchronization handle conflicts? → A: Real-time sync, last-write-wins — Changes broadcast instantly via BroadcastChannel; most recent edit overwrites previous
- Q: How do Eisenhower quadrants map to task priority levels? → A: Quadrant sets priority — Do First → high, Schedule → medium, Delegate → low, Eliminate → low
- Q: How does the Top 3 Focus generator rank tasks? → A: Deadline-first — Overdue > due today > due this week > high priority > medium > low; tiebreak by creation date (older first)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Frictionless Today View (Priority: P1)

A user opens the Productivity Hub and immediately sees their "Today" view—a clean, focused dashboard showing only what matters for the current day. They can glance at their planned tasks, see what's most important, and start working without any setup or navigation friction.

**Why this priority**: The Today View is the core value proposition—users need a single, seamless entry point that instantly shows their daily focus. Without this, all other features lack context.

**Independent Test**: Can be fully tested by loading the app and verifying the Today section displays with current date, task summary, and quick-add capability. Delivers immediate value as a daily focus dashboard.

**Acceptance Scenarios**:

1. **Given** a user opens the app, **When** the page loads, **Then** the Today View section is visible without scrolling and displays the current date prominently
2. **Given** a user has tasks scheduled for today, **When** viewing the Today View, **Then** tasks appear in priority order with visual distinction for high-priority items
3. **Given** a user has no tasks for today, **When** viewing the Today View, **Then** an encouraging empty state appears with a prominent quick-add option
4. **Given** a user is viewing Today View, **When** they scroll to other sections and return, **Then** the Today View state is preserved (no reload)

---

### User Story 2 - Quick Task Creation (Priority: P1)

A user thinks of something they need to do and wants to capture it instantly. They type into a quick-add field, press Enter, and the task appears in their list—no modals, no forms, no friction.

**Why this priority**: Frictionless capture is essential for productivity; if adding a task takes more than 2 seconds, users will use external tools instead.

**Independent Test**: Can be fully tested by typing text and pressing Enter, verifying task appears instantly. Delivers immediate value as a capture mechanism.

**Acceptance Scenarios**:

1. **Given** the Today View is displayed, **When** a user types in the quick-add field and presses Enter, **Then** a new task is created and appears in the task list within 200ms
2. **Given** a user is typing a task, **When** they press Escape, **Then** the input is cleared without creating a task
3. **Given** a user submits an empty task, **When** they press Enter, **Then** no task is created and the input remains focused
4. **Given** a user creates a task, **When** the task appears, **Then** it has a default "today" date and "medium" priority

---

### User Story 3 - Task Completion (Priority: P1)

A user completes a task and wants to mark it done with a satisfying interaction. They click/tap the checkbox, see a smooth completion animation, and the task visually transitions to a completed state while remaining visible (not immediately hidden).

**Why this priority**: Completing tasks is the core feedback loop; satisfying completion interactions reinforce productive behavior.

**Independent Test**: Can be fully tested by checking off a task and verifying visual feedback. Delivers immediate value as progress tracking.

**Acceptance Scenarios**:

1. **Given** a task exists in the list, **When** a user clicks the checkbox, **Then** the task shows a smooth strike-through animation and visual completion state
2. **Given** a task is marked complete, **When** viewing the task list, **Then** completed tasks appear at the bottom with reduced visual prominence
3. **Given** a completed task, **When** a user clicks the checkbox again, **Then** the task is restored to active state
4. **Given** multiple tasks are completed today, **When** viewing Today View, **Then** a completion count/progress indicator updates in real-time

---

### User Story 4 - Manual Task Reordering (Priority: P2)

A user wants to arrange their tasks in a specific order that reflects their preferred workflow. They drag a task to a new position, and it smoothly animates into place with clear visual feedback during the drag operation.

**Why this priority**: Manual control over task order gives users agency; some prefer personal ordering over algorithmic prioritization.

**Independent Test**: Can be fully tested by dragging a task and verifying it moves to the new position. Delivers value as a personal organization tool.

**Acceptance Scenarios**:

1. **Given** multiple tasks exist, **When** a user starts dragging a task, **Then** the task visually lifts with a shadow and other tasks show insertion indicators
2. **Given** a task is being dragged, **When** it passes over other tasks, **Then** the list smoothly animates to show where the task would be inserted
3. **Given** a user drops a task in a new position, **When** released, **Then** the task animates smoothly into place and the new order persists
4. **Given** a user is dragging a task, **When** they press Escape or drag outside the list, **Then** the task returns to its original position
5. **Given** a keyboard user, **When** they focus a task and use keyboard shortcuts, **Then** they can reorder tasks without a mouse

---

### User Story 5 - Task Sorting Options (Priority: P2)

A user wants to quickly reorganize their task list by different criteria. They click a sort button and choose from options like priority, due date, or creation time, and the list smoothly reorders.

**Why this priority**: Different contexts require different views; morning planning benefits from priority sort, end-of-day review from completion sort.

**Independent Test**: Can be fully tested by selecting different sort options and verifying list reorders correctly. Delivers value as a flexible viewing tool.

**Acceptance Scenarios**:

1. **Given** tasks exist with different priorities, **When** a user selects "Sort by Priority," **Then** tasks reorder with high-priority items first, with smooth animation
2. **Given** tasks exist with different dates, **When** a user selects "Sort by Due Date," **Then** tasks reorder chronologically (earliest first)
3. **Given** a sort is applied, **When** viewing the sort control, **Then** the current sort method is clearly indicated
4. **Given** a user has manually reordered tasks, **When** they apply a sort, **Then** a confirmation appears warning that manual order will be replaced

---

### User Story 6 - Eisenhower Matrix View (Priority: P3)

A user wants to prioritize their tasks using the Eisenhower method. They open the Prioritization Tools section, see their tasks displayed in a 2x2 matrix (Urgent/Important), and can drag tasks between quadrants to categorize them.

**Why this priority**: Eisenhower is a well-known framework that helps users distinguish between urgent and important—valuable but not essential for basic task management.

**Independent Test**: Can be fully tested by opening the matrix view and dragging tasks between quadrants. Delivers value as a decision-making framework.

**Acceptance Scenarios**:

1. **Given** a user navigates to Prioritization Tools, **When** they select Eisenhower Matrix, **Then** a 2x2 grid displays with labeled quadrants (Do First, Schedule, Delegate, Eliminate)
2. **Given** tasks exist without quadrant assignment, **When** viewing the matrix, **Then** unassigned tasks appear in a staging area for categorization
3. **Given** a task is in the matrix, **When** a user drags it to another quadrant, **Then** the task moves smoothly and its priority updates accordingly
4. **Given** tasks are categorized in the matrix, **When** a user returns to the task list, **Then** task priorities reflect their quadrant placement

---

### User Story 7 - Top 3 Focus Generator (Priority: P3)

A user feels overwhelmed by their task list and wants help identifying what to focus on. They click "Generate Top 3" and the system suggests three tasks to prioritize today based on urgency, importance, and deadlines.

**Why this priority**: Reduces decision fatigue for overwhelmed users, but requires existing tasks with metadata to be useful.

**Independent Test**: Can be fully tested by clicking the generator with multiple tasks and verifying three suggestions appear. Delivers value as a focus tool.

**Acceptance Scenarios**:

1. **Given** a user has 5+ tasks, **When** they click "Generate Top 3," **Then** three tasks are highlighted as today's focus with brief reasoning
2. **Given** Top 3 is generated, **When** viewing the Today View, **Then** the Top 3 tasks appear in a special "Focus" section at the top
3. **Given** a user disagrees with a suggestion, **When** they dismiss a Top 3 item, **Then** a replacement is suggested from remaining tasks
4. **Given** a user has fewer than 3 tasks, **When** they click "Generate Top 3," **Then** all existing tasks are shown as the focus items

---

### User Story 8 - RICE Scoring Tool (Priority: P4)

A user wants to objectively prioritize tasks using the RICE framework. They open the RICE tool, input scores for Reach, Impact, Confidence, and Effort for each task, and see a calculated priority score that helps them decide what to work on.

**Why this priority**: RICE is powerful but requires more user input; best for users already comfortable with basic task management who want advanced prioritization.

**Independent Test**: Can be fully tested by scoring a task on all RICE dimensions and verifying the calculated score. Delivers value as an objective prioritization method.

**Acceptance Scenarios**:

1. **Given** a user opens RICE Scoring in Prioritization Tools, **When** viewing the interface, **Then** each task shows input fields for Reach (1-10), Impact (1-5), Confidence (10%-100% displayed as slider), and Effort (1-10)
2. **Given** a user enters RICE values for a task, **When** all values are provided, **Then** a RICE score is calculated and displayed (Reach × Impact × Confidence ÷ Effort, where Confidence is stored as 0.1-1.0)
3. **Given** multiple tasks have RICE scores, **When** a user clicks "Sort by RICE," **Then** tasks reorder by score (highest first)
4. **Given** a task has a RICE score, **When** viewing the task in the main list, **Then** a small score badge is optionally visible

---

### Edge Cases

- What happens when a user has 100+ tasks? The list MUST remain performant with virtualized rendering
- How does the system handle tasks with no due date in date-based sorts? They appear at the end with "No date" indicator
- What happens if a user tries to drag a completed task? Completed tasks cannot be reordered but can be uncompleted first
- How does the system handle conflicting sort (manual order + auto-sort)? Auto-sort replaces manual order with user confirmation
- What happens when RICE effort is 0? System prevents division by zero by requiring minimum effort of 1
- How does Top 3 handle ties in priority? Uses creation date as tiebreaker (older tasks first)
- What happens if undo expires after 5 seconds? Task is permanently deleted; no recovery
- What happens if user edits a task while dragging? Edit mode cancels drag operation
- What happens to archived tasks? They remain in history indefinitely but don't count toward active task limits
- What happens if two tabs edit the same task simultaneously? Last write wins; no merge or conflict resolution UI

## Requirements *(mandatory)*

### Functional Requirements

**Today View**
- **FR-001**: System MUST display a Today View section that loads immediately on app start without user action
- **FR-002**: Today View MUST show the current date and day of week prominently
- **FR-003**: Today View MUST display tasks due today in priority order
- **FR-004**: System MUST provide a quick-add input field visible without scrolling

**Task Management**
- **FR-005**: Users MUST be able to create tasks by typing and pressing Enter (no modal/form required)
- **FR-006**: System MUST create new tasks within 200ms of user submission
- **FR-007**: Users MUST be able to mark tasks as complete with a single click/tap
- **FR-008**: System MUST display a smooth completion animation when tasks are checked off
- **FR-009**: Users MUST be able to uncheck completed tasks to restore them
- **FR-010**: System MUST persist all task data across browser sessions
- **FR-034**: System MUST synchronize task changes across browser tabs in real-time using BroadcastChannel
- **FR-035**: System MUST use last-write-wins strategy for concurrent edits (most recent change overwrites)
- **FR-011**: Completed tasks MUST remain visible in a "completed" section for up to 7 days
- **FR-032**: System MUST auto-archive completed tasks older than 7 days
- **FR-033**: Users MUST be able to view archived tasks in a separate history view
- **FR-029**: Users MUST be able to edit task titles inline by clicking on the task text
- **FR-030**: Users MUST be able to delete tasks via swipe gesture (touch devices) or hover-revealed trash icon (desktop)
- **FR-031**: System MUST provide a 5-second undo option after task deletion

**Task Reordering**
- **FR-012**: Users MUST be able to drag tasks to reorder them manually
- **FR-013**: System MUST show visual feedback during drag operations (lift effect, insertion indicator)
- **FR-014**: System MUST animate task position changes smoothly (200-300ms)
- **FR-015**: Users MUST be able to cancel a drag operation (Escape key or drag outside)
- **FR-016**: System MUST provide keyboard-accessible reordering for accessibility

**Task Sorting**
- **FR-017**: Users MUST be able to sort tasks by priority (high to low)
- **FR-018**: Users MUST be able to sort tasks by due date (chronological)
- **FR-019**: Users MUST be able to sort tasks by creation date
- **FR-020**: System MUST clearly indicate the current active sort method
- **FR-021**: System MUST warn users when auto-sort will replace manual ordering

**Prioritization Tools (Separate Section)**
- **FR-022**: System MUST provide a dedicated "Prioritization Tools" section accessible via navigation
- **FR-023**: System MUST provide an Eisenhower Matrix view with four labeled quadrants
- **FR-024**: Users MUST be able to drag tasks between Eisenhower quadrants
- **FR-036**: System MUST automatically update task priority when moved to a quadrant (Do First → high, Schedule → medium, Delegate → low, Eliminate → low)
- **FR-025**: System MUST provide a "Top 3 Focus" generator that suggests three priority tasks
- **FR-037**: Top 3 generator MUST rank tasks by: overdue first, then due today, then due this week, then by priority (high > medium > low), with creation date as tiebreaker (older first)
- **FR-026**: Users MUST be able to dismiss and replace Top 3 suggestions
- **FR-027**: System MUST provide a RICE scoring interface with four input dimensions
- **FR-028**: System MUST calculate and display RICE scores automatically

### Key Entities

- **Task**: Represents a single actionable item. Attributes: title, created date, due date, priority level, completion status, manual sort position, Eisenhower quadrant (optional), RICE scores (optional)
- **Priority Level**: Categorization of task importance. Values: high, medium, low (default: medium)
- **Eisenhower Quadrant**: Classification for the matrix. Values: do-first (urgent+important) → sets high priority, schedule (important) → sets medium priority, delegate (urgent) → sets low priority, eliminate (neither) → sets low priority
- **RICE Score**: Calculated prioritization metric. Components: reach, impact, confidence, effort; computed as (R × I × C) ÷ E
- **Top 3 Focus**: A generated set of three suggested priority tasks for the current day, ranked by deadline urgency (overdue > today > this week), then priority level, then creation date; refreshable on demand

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can add a new task in under 2 seconds (type + Enter)
- **SC-002**: Task list remains responsive (60fps scrolling) with up to 200 tasks
- **SC-003**: 90% of users successfully create their first task within 30 seconds of app load
- **SC-004**: Drag-and-drop reordering maintains 60fps animation throughout the operation
- **SC-005**: Task completion animation completes within 300ms
- **SC-006**: Users can access any prioritization tool within 2 clicks from the Today View
- **SC-007**: Top 3 generator produces suggestions within 500ms
- **SC-008**: RICE score calculation updates in real-time as users input values
- **SC-009**: All task data persists correctly across browser refresh and multi-tab scenarios

## Assumptions

- Users are familiar with basic task management concepts (todos, priorities, due dates)
- The Eisenhower Matrix labels (Do First, Schedule, Delegate, Eliminate) are self-explanatory for target users
- RICE scoring is an optional power-user feature; most users will rely on simpler prioritization
- "Today" is determined by the user's local timezone
- Tasks without explicit priority default to "medium"
- Tasks without explicit due date are considered "someday" and excluded from Top 3 generation unless no dated tasks exist
