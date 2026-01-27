/**
 * Priority Configuration for Daily Planner
 * Includes Eisenhower quadrant mapping and RICE scoring formula
 */

// Priority levels
export const PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

// Priority display order (for sorting)
export const PRIORITY_ORDER = {
  high: 0,
  medium: 1,
  low: 2,
};

// Eisenhower quadrant definitions
export const EISENHOWER_QUADRANTS = {
  DO_FIRST: 'do-first',
  SCHEDULE: 'schedule',
  DELEGATE: 'delegate',
  ELIMINATE: 'eliminate',
};

// Quadrant labels and descriptions
export const QUADRANT_INFO = {
  'do-first': {
    label: 'Do First',
    description: 'Urgent and Important',
    color: 'var(--color-priority-high)',
  },
  schedule: {
    label: 'Schedule',
    description: 'Important, not Urgent',
    color: 'var(--color-priority-medium)',
  },
  delegate: {
    label: 'Delegate',
    description: 'Urgent, not Important',
    color: 'var(--color-priority-low)',
  },
  eliminate: {
    label: 'Eliminate',
    description: 'Neither Urgent nor Important',
    color: 'var(--color-muted)',
  },
};

// Quadrant to priority mapping (FR-036)
export const QUADRANT_PRIORITY_MAP = {
  'do-first': PRIORITIES.HIGH,
  schedule: PRIORITIES.MEDIUM,
  delegate: PRIORITIES.LOW,
  eliminate: PRIORITIES.LOW,
};

/**
 * Get priority from Eisenhower quadrant
 * @param {string} quadrant - Eisenhower quadrant value
 * @returns {string} Priority level
 */
export function getPriorityFromQuadrant(quadrant) {
  return QUADRANT_PRIORITY_MAP[quadrant] || PRIORITIES.MEDIUM;
}

// RICE scoring configuration
export const RICE_CONFIG = {
  reach: { min: 1, max: 10, default: 5, label: 'Reach', description: 'How many people/uses affected' },
  impact: { min: 1, max: 5, default: 3, label: 'Impact', description: 'Minimal (1) to Massive (5)' },
  confidence: { min: 0.1, max: 1.0, default: 0.8, label: 'Confidence', description: '10%-100% certainty' },
  effort: { min: 1, max: 10, default: 5, label: 'Effort', description: 'Person-days (minimum 1)' },
};

/**
 * Compute RICE score
 * Formula: (Reach × Impact × Confidence) ÷ Effort
 * @param {Object} scores - RICE score components
 * @param {number} scores.reach - 1-10
 * @param {number} scores.impact - 1-5
 * @param {number} scores.confidence - 0.1-1.0
 * @param {number} scores.effort - 1-10 (minimum 1)
 * @returns {number} Computed RICE score
 */
export function computeRICEScore({ reach, impact, confidence, effort }) {
  // Prevent division by zero
  const safeEffort = Math.max(effort, 1);
  return (reach * impact * confidence) / safeEffort;
}

/**
 * Create default RICE scores object
 * @returns {Object} Default RICE scores
 */
export function createDefaultRICEScores() {
  return {
    reach: RICE_CONFIG.reach.default,
    impact: RICE_CONFIG.impact.default,
    confidence: RICE_CONFIG.confidence.default,
    effort: RICE_CONFIG.effort.default,
    score: computeRICEScore({
      reach: RICE_CONFIG.reach.default,
      impact: RICE_CONFIG.impact.default,
      confidence: RICE_CONFIG.confidence.default,
      effort: RICE_CONFIG.effort.default,
    }),
    updatedAt: null,
  };
}

/**
 * Validate RICE score values
 * @param {Object} scores - RICE scores to validate
 * @returns {Object} Validated scores with any out-of-range values clamped
 */
export function validateRICEScores(scores) {
  return {
    reach: Math.min(Math.max(scores.reach, RICE_CONFIG.reach.min), RICE_CONFIG.reach.max),
    impact: Math.min(Math.max(scores.impact, RICE_CONFIG.impact.min), RICE_CONFIG.impact.max),
    confidence: Math.min(Math.max(scores.confidence, RICE_CONFIG.confidence.min), RICE_CONFIG.confidence.max),
    effort: Math.min(Math.max(scores.effort, RICE_CONFIG.effort.min), RICE_CONFIG.effort.max),
  };
}

// Archive configuration
export const ARCHIVE_CONFIG = {
  retentionDays: 7, // Days to keep completed tasks before archiving
  retentionMs: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

/**
 * Check if a completed task should be archived
 * @param {Object} task - Task to check
 * @returns {boolean} True if task should be archived
 */
export function shouldArchiveTask(task) {
  if (!task.completedAt) return false;
  const age = Date.now() - task.completedAt;
  return age >= ARCHIVE_CONFIG.retentionMs;
}

// Top 3 Focus configuration
export const TOP3_CONFIG = {
  maxTasks: 3,
  // Scoring weights for Top 3 algorithm (FR-037)
  // Overdue > due today > due this week > priority > creation date
  weights: {
    overdue: 1000,
    dueToday: 500,
    dueThisWeek: 200,
    highPriority: 100,
    mediumPriority: 50,
    lowPriority: 10,
  },
};

/**
 * Generate reasoning text for why a task is in Top 3
 * @param {Object} task - Task with focus score data
 * @returns {string} Human-readable reasoning
 */
export function generateTop3Reasoning(task) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = today.getTime() + 24 * 60 * 60 * 1000;
  const weekEnd = today.getTime() + 7 * 24 * 60 * 60 * 1000;

  if (task.dueDate && task.dueDate < today.getTime()) {
    return 'Overdue - needs immediate attention';
  }
  if (task.dueDate && task.dueDate < todayEnd) {
    return 'Due today';
  }
  if (task.dueDate && task.dueDate < weekEnd) {
    return 'Due this week';
  }
  if (task.priority === PRIORITIES.HIGH) {
    return 'High priority task';
  }
  if (task.priority === PRIORITIES.MEDIUM) {
    return 'Important task';
  }
  return 'Oldest pending task';
}
