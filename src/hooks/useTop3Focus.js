import { useState, useCallback, useMemo } from 'react';
import { TOP3_CONFIG, PRIORITY_ORDER, generateTop3Reasoning } from '../data/priorityConfig';

/**
 * useTop3Focus - Top 3 generator with dismissal
 * Implements FR-037: Deadline-first algorithm
 * Overdue > due today > due this week > priority > creation date
 */
export function useTop3Focus(tasks = []) {
  const [dismissedIds, setDismissedIds] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAt, setGeneratedAt] = useState(null);

  /**
   * Calculate focus score for a task based on FR-037 algorithm
   */
  const calculateFocusScore = useCallback((task) => {
    const now = Date.now();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfDay = today.getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000;
    const endOfWeek = startOfDay + 7 * 24 * 60 * 60 * 1000;

    let score = 0;

    // Deadline scoring (FR-037 priority order)
    if (task.dueDate) {
      if (task.dueDate < startOfDay) {
        // Overdue - highest priority
        score += TOP3_CONFIG.weights.overdue;
        // More overdue = higher score
        const daysOverdue = Math.floor((startOfDay - task.dueDate) / (24 * 60 * 60 * 1000));
        score += daysOverdue * 10;
      } else if (task.dueDate < endOfDay) {
        // Due today
        score += TOP3_CONFIG.weights.dueToday;
      } else if (task.dueDate < endOfWeek) {
        // Due this week
        score += TOP3_CONFIG.weights.dueThisWeek;
      }
    }

    // Priority scoring
    switch (task.priority) {
      case 'high':
        score += TOP3_CONFIG.weights.highPriority;
        break;
      case 'medium':
        score += TOP3_CONFIG.weights.mediumPriority;
        break;
      case 'low':
        score += TOP3_CONFIG.weights.lowPriority;
        break;
    }

    // Creation date tiebreaker (older tasks first)
    // Subtract a small amount based on age (older = higher score)
    const ageInDays = (now - task.createdAt) / (24 * 60 * 60 * 1000);
    score += Math.min(ageInDays, 30) * 0.1; // Cap at 30 days of bonus

    return score;
  }, []);

  /**
   * Generate Top 3 focus tasks
   */
  const generate = useCallback(() => {
    setIsGenerating(true);
    
    // Simulate brief processing for UX
    setTimeout(() => {
      setDismissedIds([]);
      setGeneratedAt(Date.now());
      setIsGenerating(false);
    }, 100);
  }, []);

  /**
   * Dismiss a task from Top 3 (get replacement)
   */
  const dismiss = useCallback((taskId) => {
    setDismissedIds((prev) => [...prev, taskId]);
  }, []);

  /**
   * Refresh Top 3 (same as generate but keeps dismissed)
   */
  const refresh = useCallback(() => {
    setGeneratedAt(Date.now());
  }, []);

  /**
   * Clear generation state
   */
  const clear = useCallback(() => {
    setDismissedIds([]);
    setGeneratedAt(null);
  }, []);

  /**
   * Computed Top 3 tasks
   */
  const top3 = useMemo(() => {
    // Only return tasks if generation has been triggered
    if (!generatedAt) return [];

    // Filter out completed and dismissed tasks
    const eligibleTasks = tasks.filter(
      (t) => !t.completedAt && !dismissedIds.includes(t.id)
    );

    // Calculate scores and sort
    const scored = eligibleTasks.map((task) => ({
      ...task,
      focusScore: calculateFocusScore(task),
      reasoning: generateTop3Reasoning(task),
    }));

    scored.sort((a, b) => b.focusScore - a.focusScore);

    // Return top 3 (or all if fewer than 3)
    return scored.slice(0, TOP3_CONFIG.maxTasks);
  }, [tasks, dismissedIds, generatedAt, calculateFocusScore]);

  return {
    top3,
    isGenerating,
    generatedAt,
    generate,
    dismiss,
    refresh,
    clear,
  };
}

export default useTop3Focus;
