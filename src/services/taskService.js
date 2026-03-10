/**
 * Task Service - CRUD operations and multi-tab sync for Daily Planner
 * Uses the shared IndexedDB initializer from db.js so task stores always exist.
 */

import { getDB } from './db.js';

const BROADCAST_CHANNEL_NAME = 'productivity-hub-tasks';

// BroadcastChannel for multi-tab sync
let broadcastChannel = null;
const subscribers = new Set();

/**
 * Get broadcast channel (lazy initialization)
 */
function getBroadcastChannel() {
  if (!broadcastChannel && typeof BroadcastChannel !== 'undefined') {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    broadcastChannel.onmessage = (event) => {
      subscribers.forEach((callback) => callback(event.data));
    };
  }
  return broadcastChannel;
}

/**
 * Subscribe to task broadcast events
 * @param {Function} callback - Called with TaskBroadcastEvent
 * @returns {Function} Unsubscribe function
 */
export function subscribeToTaskBroadcast(callback) {
  getBroadcastChannel();
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

/**
 * Broadcast task change to other tabs
 * @param {Object} event - TaskBroadcastEvent
 */
export function broadcastTaskChange(event) {
  const channel = getBroadcastChannel();
  if (channel) {
    channel.postMessage(event);
  }
}

// ============================================
// Task CRUD Operations
// ============================================

/**
 * Create a new task
 * @param {Object} taskData - Task data without id, createdAt, updatedAt
 * @returns {Promise<Object>} Created task with all fields
 */
export async function createTask(taskData) {
  const db = await getDB();
  const now = Date.now();
  
  // Get highest manual order for new task positioning
  const allTasks = await db.getAll('tasks');
  const maxOrder = allTasks.reduce((max, t) => Math.max(max, t.manualOrder || 0), 0);
  
  const task = {
    id: crypto.randomUUID(),
    title: taskData.title?.trim() || '',
    createdAt: now,
    updatedAt: now,
    dueDate: taskData.dueDate || null,
    priority: taskData.priority || 'medium',
    completedAt: null,
    manualOrder: maxOrder + 1,
    eisenhowerQuadrant: taskData.eisenhowerQuadrant || null,
    riceScores: taskData.riceScores || null,
  };
  
  await db.put('tasks', task);
  broadcastTaskChange({ type: 'TASK_CREATED', task });
  
  return task;
}

/**
 * Get a single task by ID
 * @param {string} id - Task ID
 * @returns {Promise<Object|undefined>} Task or undefined
 */
export async function getTask(id) {
  const db = await getDB();
  return db.get('tasks', id);
}

/**
 * Update an existing task
 * @param {string} id - Task ID
 * @param {Object} updates - Partial task updates
 * @returns {Promise<Object>} Updated task
 */
export async function updateTask(id, updates) {
  const db = await getDB();
  const existing = await db.get('tasks', id);
  
  if (!existing) {
    throw new Error(`Task not found: ${id}`);
  }
  
  const updated = {
    ...existing,
    ...updates,
    id: existing.id, // Ensure ID cannot be changed
    createdAt: existing.createdAt, // Ensure createdAt is immutable
    updatedAt: Date.now(),
  };
  
  await db.put('tasks', updated);
  broadcastTaskChange({ type: 'TASK_UPDATED', task: updated });
  
  return updated;
}

/**
 * Delete a task
 * @param {string} id - Task ID
 */
export async function deleteTask(id) {
  const db = await getDB();
  await db.delete('tasks', id);
  broadcastTaskChange({ type: 'TASK_DELETED', taskId: id });
}

// ============================================
// Task Queries
// ============================================

/**
 * Get all active tasks (not completed)
 * @returns {Promise<Array>} Active tasks sorted by manual order
 */
export async function getAllTasks() {
  const db = await getDB();
  const tasks = await db.getAll('tasks');
  return tasks
    .filter((t) => !t.completedAt)
    .sort((a, b) => (a.manualOrder || 0) - (b.manualOrder || 0));
}

/**
 * Get tasks due today
 * @returns {Promise<Array>} Today's tasks
 */
export async function getTodaysTasks() {
  const db = await getDB();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfDay = today.getTime();
  const endOfDay = startOfDay + 24 * 60 * 60 * 1000;
  
  const tasks = await db.getAll('tasks');
  return tasks
    .filter((t) => !t.completedAt && t.dueDate && t.dueDate >= startOfDay && t.dueDate < endOfDay)
    .sort((a, b) => (a.manualOrder || 0) - (b.manualOrder || 0));
}

/**
 * Get completed tasks (within retention period)
 * @returns {Promise<Array>} Completed tasks sorted by completion date
 */
export async function getCompletedTasks() {
  const db = await getDB();
  const tasks = await db.getAll('tasks');
  return tasks
    .filter((t) => t.completedAt)
    .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
}

/**
 * Get overdue tasks
 * @returns {Promise<Array>} Overdue tasks
 */
export async function getOverdueTasks() {
  const db = await getDB();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfDay = today.getTime();
  
  const tasks = await db.getAll('tasks');
  return tasks
    .filter((t) => !t.completedAt && t.dueDate && t.dueDate < startOfDay)
    .sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0));
}

/**
 * Get tasks by Eisenhower quadrant
 * @param {string} quadrant - Quadrant value
 * @returns {Promise<Array>} Tasks in quadrant
 */
export async function getTasksByQuadrant(quadrant) {
  const db = await getDB();
  const tasks = await db.getAll('tasks');
  return tasks
    .filter((t) => !t.completedAt && t.eisenhowerQuadrant === quadrant)
    .sort((a, b) => (a.manualOrder || 0) - (b.manualOrder || 0));
}

/**
 * Get tasks without Eisenhower quadrant assignment
 * @returns {Promise<Array>} Unassigned tasks
 */
export async function getUnassignedTasks() {
  const db = await getDB();
  const tasks = await db.getAll('tasks');
  return tasks
    .filter((t) => !t.completedAt && !t.eisenhowerQuadrant)
    .sort((a, b) => (a.manualOrder || 0) - (b.manualOrder || 0));
}

// ============================================
// Batch Operations
// ============================================

/**
 * Reorder tasks using fractional indexing
 * @param {string} activeId - ID of task being moved
 * @param {string} overId - ID of task it's being placed after (or 'start' for beginning)
 * @param {Array} currentTasks - Current ordered task list
 * @returns {Promise<void>}
 */
export async function reorderTasks(activeId, overId, currentTasks) {
  const db = await getDB();
  
  // Find positions
  const activeIndex = currentTasks.findIndex((t) => t.id === activeId);
  const overIndex = currentTasks.findIndex((t) => t.id === overId);
  
  if (activeIndex === -1) return;
  
  // Calculate new manual order using fractional indexing
  let newOrder;
  
  if (overIndex === -1 || overId === 'start') {
    // Move to beginning
    const firstTask = currentTasks.find((t) => t.id !== activeId);
    newOrder = firstTask ? (firstTask.manualOrder || 0) / 2 : 1;
  } else if (overIndex === currentTasks.length - 1) {
    // Move to end
    const lastTask = currentTasks[currentTasks.length - 1];
    newOrder = (lastTask.manualOrder || 0) + 1;
  } else {
    // Move between two tasks
    const beforeTask = currentTasks[overIndex];
    const afterTask = currentTasks[overIndex + 1];
    const beforeOrder = beforeTask?.manualOrder || 0;
    const afterOrder = afterTask?.manualOrder || beforeOrder + 2;
    newOrder = (beforeOrder + afterOrder) / 2;
  }
  
  // Update the task
  const task = await db.get('tasks', activeId);
  if (task) {
    task.manualOrder = newOrder;
    task.updatedAt = Date.now();
    await db.put('tasks', task);
    broadcastTaskChange({ type: 'TASKS_REORDERED', taskIds: currentTasks.map((t) => t.id) });
  }
}

/**
 * Archive completed tasks older than retention period
 * @returns {Promise<number>} Number of tasks archived
 */
export async function archiveOldTasks() {
  const db = await getDB();
  const RETENTION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
  const cutoff = Date.now() - RETENTION_MS;
  
  const tasks = await db.getAll('tasks');
  const toArchive = tasks.filter((t) => t.completedAt && t.completedAt < cutoff);
  
  const tx = db.transaction(['tasks', 'archivedTasks'], 'readwrite');
  
  for (const task of toArchive) {
    const archived = {
      id: task.id,
      title: task.title,
      createdAt: task.createdAt,
      completedAt: task.completedAt,
      archivedAt: Date.now(),
      priority: task.priority,
      originalDueDate: task.dueDate,
    };
    
    await tx.objectStore('archivedTasks').put(archived);
    await tx.objectStore('tasks').delete(task.id);
  }
  
  await tx.done;
  return toArchive.length;
}

// ============================================
// Archive Operations
// ============================================

/**
 * Get archived tasks with pagination
 * @param {number} limit - Max tasks to return
 * @param {number} offset - Number to skip
 * @returns {Promise<Array>} Archived tasks
 */
export async function getArchivedTasks(limit = 50, offset = 0) {
  const db = await getDB();
  const all = await db.getAllFromIndex('archivedTasks', 'byArchivedAt');
  // Sort newest first
  all.sort((a, b) => (b.archivedAt || 0) - (a.archivedAt || 0));
  return all.slice(offset, offset + limit);
}

/**
 * Get total count of archived tasks
 * @returns {Promise<number>} Count
 */
export async function getArchivedTasksCount() {
  const db = await getDB();
  return db.count('archivedTasks');
}

// ============================================
// Full Sync (for tab recovery)
// ============================================

/**
 * Request full sync from other tabs
 */
export function requestFullSync() {
  broadcastTaskChange({ type: 'SYNC_REQUEST' });
}

/**
 * Broadcast full task list (response to sync request)
 */
export async function broadcastFullSync() {
  const db = await getDB();
  const tasks = await db.getAll('tasks');
  broadcastTaskChange({ type: 'FULL_SYNC', tasks });
}
