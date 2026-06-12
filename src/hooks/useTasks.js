import { useState, useEffect, useCallback, useRef } from 'react';
import {
  createTask as createTaskService,
  updateTask as updateTaskService,
  deleteTask as deleteTaskService,
  getAllTasks,
  getCompletedTasks,
  reorderTasks as reorderTasksService,
  subscribeToTaskBroadcast,
} from '../services/taskService';

/**
 * useTasks - Primary hook for task state management
 * Handles CRUD operations, pending delete with undo, and multi-tab sync
 */
export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  
  const deleteTimeoutRef = useRef(null);

  // Load tasks on mount
  const refreshTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const [active, completed] = await Promise.all([
        getAllTasks(),
        getCompletedTasks(),
      ]);
      setTasks(active);
      setCompletedTasks(completed);
      setError(null);
    } catch (err) {
      setError(err);
      console.error('Failed to load tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Subscribe to broadcast channel for multi-tab sync
  useEffect(() => {
    refreshTasks();

    const unsubscribe = subscribeToTaskBroadcast((event) => {
      switch (event.type) {
        case 'TASK_CREATED':
          setTasks((prev) => [...prev, event.task].sort((a, b) => a.manualOrder - b.manualOrder));
          break;
        case 'TASK_UPDATED':
          setTasks((prev) =>
            prev.map((t) => (t.id === event.task.id ? event.task : t))
          );
          setCompletedTasks((prev) =>
            prev.map((t) => (t.id === event.task.id ? event.task : t))
          );
          // Handle completion state change
          if (event.task.completedAt) {
            setTasks((prev) => prev.filter((t) => t.id !== event.task.id));
            setCompletedTasks((prev) => {
              if (prev.some((t) => t.id === event.task.id)) {
                return prev.map((t) => (t.id === event.task.id ? event.task : t));
              }
              return [event.task, ...prev];
            });
          } else {
            setCompletedTasks((prev) => prev.filter((t) => t.id !== event.task.id));
            setTasks((prev) => {
              if (prev.some((t) => t.id === event.task.id)) {
                return prev.map((t) => (t.id === event.task.id ? event.task : t));
              }
              return [...prev, event.task].sort((a, b) => a.manualOrder - b.manualOrder);
            });
          }
          break;
        case 'TASK_DELETED':
          setTasks((prev) => prev.filter((t) => t.id !== event.taskId));
          setCompletedTasks((prev) => prev.filter((t) => t.id !== event.taskId));
          break;
        case 'FULL_SYNC': {
          const active = event.tasks.filter((t) => !t.completedAt);
          const completed = event.tasks.filter((t) => t.completedAt);
          setTasks(active.sort((a, b) => a.manualOrder - b.manualOrder));
          setCompletedTasks(completed.sort((a, b) => b.completedAt - a.completedAt));
          break;
        }
        case 'TASKS_REORDERED':
          refreshTasks();
          break;
        default:
          break;
      }
    });

    return () => {
      unsubscribe();
      if (deleteTimeoutRef.current) {
        clearTimeout(deleteTimeoutRef.current);
      }
    };
  }, [refreshTasks]);

  // Create a new task
  const createTask = useCallback(async (title, options = {}) => {
    try {
      // Set default due date to today if not specified
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      const task = await createTaskService({
        title,
        dueDate: options.dueDate !== undefined ? options.dueDate : today.getTime(),
        priority: options.priority || 'medium',
      });
      
      setTasks((prev) => [...prev, task].sort((a, b) => a.manualOrder - b.manualOrder));
      return task;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  // Update an existing task
  const updateTask = useCallback(async (id, updates) => {
    try {
      const task = await updateTaskService(id, updates);
      
      // Handle completion state changes locally
      if (updates.completedAt !== undefined) {
        if (updates.completedAt) {
          setTasks((prev) => prev.filter((t) => t.id !== id));
          setCompletedTasks((prev) => [task, ...prev]);
        } else {
          setCompletedTasks((prev) => prev.filter((t) => t.id !== id));
          setTasks((prev) => [...prev, task].sort((a, b) => a.manualOrder - b.manualOrder));
        }
      } else {
        setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
        setCompletedTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
      }
      
      return task;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  // Delete task with 5-second undo window
  const deleteTask = useCallback((id) => {
    const taskToDelete = tasks.find((t) => t.id === id) || completedTasks.find((t) => t.id === id);
    if (!taskToDelete) return;

    // Clear any existing pending delete
    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current);
      // Execute the previous pending delete immediately
      if (pendingDelete) {
        deleteTaskService(pendingDelete.task.id).catch(console.error);
      }
    }

    // Remove from UI immediately
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setCompletedTasks((prev) => prev.filter((t) => t.id !== id));

    // Set pending delete state
    const expiresAt = Date.now() + 5000;
    setPendingDelete({ task: taskToDelete, expiresAt });

    // Schedule actual deletion
    deleteTimeoutRef.current = setTimeout(async () => {
      try {
        await deleteTaskService(id);
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
      setPendingDelete(null);
      deleteTimeoutRef.current = null;
    }, 5000);
  }, [tasks, completedTasks, pendingDelete]);

  // Undo pending delete
  const undoDelete = useCallback(() => {
    if (!pendingDelete) return;

    // Clear the timeout
    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current);
      deleteTimeoutRef.current = null;
    }

    // Restore the task
    const task = pendingDelete.task;
    if (task.completedAt) {
      setCompletedTasks((prev) => [task, ...prev]);
    } else {
      setTasks((prev) => [...prev, task].sort((a, b) => a.manualOrder - b.manualOrder));
    }

    setPendingDelete(null);
  }, [pendingDelete]);

  // Toggle task completion
  const toggleComplete = useCallback(async (id) => {
    const task = tasks.find((t) => t.id === id) || completedTasks.find((t) => t.id === id);
    if (!task) return;

    const updates = task.completedAt
      ? { completedAt: null }
      : { completedAt: Date.now() };

    return updateTask(id, updates);
  }, [tasks, completedTasks, updateTask]);

  // Reorder tasks
  const reorderTasks = useCallback(async (activeId, overId) => {
    // Optimistically update UI
    setTasks((prev) => {
      const oldIndex = prev.findIndex((t) => t.id === activeId);
      const newIndex = prev.findIndex((t) => t.id === overId);
      
      if (oldIndex === -1 || newIndex === -1) return prev;
      
      const newTasks = [...prev];
      const [removed] = newTasks.splice(oldIndex, 1);
      newTasks.splice(newIndex, 0, removed);
      
      return newTasks;
    });

    // Persist to database
    try {
      await reorderTasksService(activeId, overId, tasks);
    } catch (err) {
      console.error('Failed to reorder tasks:', err);
      // Refresh to get correct state
      refreshTasks();
    }
  }, [tasks, refreshTasks]);

  return {
    tasks,
    completedTasks,
    isLoading,
    error,
    pendingDelete,
    createTask,
    updateTask,
    deleteTask,
    undoDelete,
    toggleComplete,
    reorderTasks,
    refreshTasks,
  };
}

export default useTasks;
