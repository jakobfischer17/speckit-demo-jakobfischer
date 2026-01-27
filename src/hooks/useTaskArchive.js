import { useState, useEffect, useCallback } from 'react';
import {
  archiveOldTasks,
  getArchivedTasks,
  getArchivedTasksCount,
} from '../services/taskService';
import { ARCHIVE_CONFIG } from '../data/priorityConfig';

/**
 * useTaskArchive - 7-day retention and archive management
 * Handles automatic archiving of old completed tasks
 */
export function useTaskArchive() {
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const PAGE_SIZE = 50;

  /**
   * Load archived tasks with pagination
   */
  const loadArchivedTasks = useCallback(async (reset = false) => {
    try {
      setIsLoading(true);
      const newOffset = reset ? 0 : offset;
      const tasks = await getArchivedTasks(PAGE_SIZE, newOffset);
      const count = await getArchivedTasksCount();
      
      if (reset) {
        setArchivedTasks(tasks);
        setOffset(PAGE_SIZE);
      } else {
        setArchivedTasks((prev) => [...prev, ...tasks]);
        setOffset((prev) => prev + PAGE_SIZE);
      }
      
      setTotalCount(count);
    } catch (err) {
      console.error('Failed to load archived tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [offset]);

  /**
   * Run archive process - moves old completed tasks to archive
   * @returns {Promise<number>} Number of tasks archived
   */
  const runArchive = useCallback(async () => {
    try {
      const count = await archiveOldTasks();
      if (count > 0) {
        // Refresh archived tasks list
        await loadArchivedTasks(true);
      }
      return count;
    } catch (err) {
      console.error('Failed to run archive:', err);
      return 0;
    }
  }, [loadArchivedTasks]);

  /**
   * Load more archived tasks (pagination)
   */
  const loadMore = useCallback(async () => {
    if (isLoading || archivedTasks.length >= totalCount) return;
    await loadArchivedTasks(false);
  }, [isLoading, archivedTasks.length, totalCount, loadArchivedTasks]);

  /**
   * Check if more tasks are available
   */
  const hasMore = archivedTasks.length < totalCount;

  // Run archive check on mount and periodically
  useEffect(() => {
    // Initial archive check
    runArchive();

    // Check for tasks to archive every hour
    const interval = setInterval(() => {
      runArchive();
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [runArchive]);

  return {
    archivedTasks,
    isLoading,
    totalCount,
    hasMore,
    runArchive,
    loadMore,
    refresh: () => loadArchivedTasks(true),
  };
}

export default useTaskArchive;
