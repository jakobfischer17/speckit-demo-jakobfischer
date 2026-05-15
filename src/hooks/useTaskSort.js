import { useState, useCallback, useMemo } from 'react';
import { PRIORITY_ORDER } from '../data/priorityConfig';

/**
 * useTaskSort - Sorting logic and state for task lists
 */

export const SORT_OPTIONS = {
  MANUAL: 'manual',
  PRIORITY: 'priority',
  DUE_DATE: 'dueDate',
  CREATED_AT: 'createdAt',
  RICE: 'rice',
};

export function useTaskSort() {
  const [sortBy, setSortByState] = useState(SORT_OPTIONS.MANUAL);
  const [sortDirection, setSortDirection] = useState('asc');

  const isManualOrder = sortBy === SORT_OPTIONS.MANUAL;

  // Set sort option with confirmation callback for manual order override
  const setSortBy = useCallback((option, onConfirm) => {
    if (sortBy === SORT_OPTIONS.MANUAL && option !== SORT_OPTIONS.MANUAL) {
      // If switching from manual to auto sort, optionally confirm
      if (onConfirm && typeof onConfirm === 'function') {
        onConfirm();
      }
    }
    setSortByState(option);
  }, [sortBy]);

  // Toggle sort direction
  const toggleDirection = useCallback(() => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  // Return to manual order
  const clearSort = useCallback(() => {
    setSortByState(SORT_OPTIONS.MANUAL);
    setSortDirection('asc');
  }, []);

  // Sort function
  const sortedTasks = useCallback((tasks) => {
    if (!tasks || tasks.length === 0) return [];
    
    const sorted = [...tasks];
    const direction = sortDirection === 'asc' ? 1 : -1;

    switch (sortBy) {
      case SORT_OPTIONS.MANUAL:
        return sorted.sort((a, b) => (a.manualOrder || 0) - (b.manualOrder || 0));

      case SORT_OPTIONS.PRIORITY:
        return sorted.sort((a, b) => {
          const priorityDiff = (PRIORITY_ORDER[a.priority] || 1) - (PRIORITY_ORDER[b.priority] || 1);
          if (priorityDiff !== 0) return priorityDiff * direction;
          // Secondary sort by due date
          return ((a.dueDate || Infinity) - (b.dueDate || Infinity)) * direction;
        });

      case SORT_OPTIONS.DUE_DATE:
        return sorted.sort((a, b) => {
          // Tasks with no due date go to the end
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return (a.dueDate - b.dueDate) * direction;
        });

      case SORT_OPTIONS.CREATED_AT:
        return sorted.sort((a, b) => {
          return ((a.createdAt || 0) - (b.createdAt || 0)) * direction;
        });

      case SORT_OPTIONS.RICE:
        return sorted.sort((a, b) => {
          const scoreA = a.riceScores?.score || 0;
          const scoreB = b.riceScores?.score || 0;
          // RICE sort is typically highest first (descending)
          return (scoreB - scoreA) * direction;
        });

      default:
        return sorted;
    }
  }, [sortBy, sortDirection]);

  // Sort label for UI
  const sortLabel = useMemo(() => {
    switch (sortBy) {
      case SORT_OPTIONS.MANUAL:
        return 'Manual Order';
      case SORT_OPTIONS.PRIORITY:
        return 'Priority';
      case SORT_OPTIONS.DUE_DATE:
        return 'Due Date';
      case SORT_OPTIONS.CREATED_AT:
        return 'Created';
      case SORT_OPTIONS.RICE:
        return 'RICE Score';
      default:
        return 'Sort';
    }
  }, [sortBy]);

  return {
    sortBy,
    sortDirection,
    isManualOrder,
    sortLabel,
    setSortBy,
    toggleDirection,
    clearSort,
    sortedTasks,
  };
}

export default useTaskSort;
