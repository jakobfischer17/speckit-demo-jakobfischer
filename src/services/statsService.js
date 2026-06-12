import {
  addSession,
  getStats,
  initializeStats,
  updateStats,
  getAchievement,
  unlockAchievement,
  cleanupOldSessions,
  isIndexedDBAvailable,
} from './db.js';

/**
 * Stats service for Focus Enhancement Suite.
 * Handles session recording, stats aggregation, streak calculation,
 * and milestone tracking.
 */

// BroadcastChannel for multi-tab sync
const CHANNEL_NAME = 'productivity-hub-sync';
let broadcastChannel = null;

/**
 * Get or create the broadcast channel
 */
function getBroadcastChannel() {
  if (!broadcastChannel && typeof BroadcastChannel !== 'undefined') {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
  return broadcastChannel;
}

/**
 * Broadcast a message to other tabs
 * @param {Object} message - Message to broadcast
 */
function broadcast(message) {
  const channel = getBroadcastChannel();
  if (channel) {
    channel.postMessage(message);
  }
}

/**
 * Subscribe to broadcast messages
 * @param {Function} callback - Handler for incoming messages
 * @returns {Function} Unsubscribe function
 */
export function subscribeToBroadcast(callback) {
  const channel = getBroadcastChannel();
  if (!channel) {
    return () => {};
  }
  
  channel.addEventListener('message', callback);
  return () => channel.removeEventListener('message', callback);
}

// Milestone thresholds
const MILESTONES = [10, 25, 50, 100];

/**
 * Get the date string for a timestamp in local timezone
 * @param {number} timestamp - Unix timestamp in ms
 * @returns {string} Date string (YYYY-MM-DD)
 */
function getDateString(timestamp) {
  return new Date(timestamp).toISOString().split('T')[0];
}

/**
 * Get today's date string
 * @returns {string} Today's date (YYYY-MM-DD)
 */
function getTodayString() {
  return getDateString(Date.now());
}

/**
 * Get yesterday's date string
 * @returns {string} Yesterday's date (YYYY-MM-DD)
 */
function getYesterdayString() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

/**
 * Calculate streak based on last active date
 * @param {string|null} lastActiveDate - Last activity date
 * @param {number} currentStreak - Current streak count
 * @returns {Object} { newStreak, shouldReset }
 */
function calculateStreak(lastActiveDate, currentStreak) {
  const today = getTodayString();
  const yesterday = getYesterdayString();
  
  if (!lastActiveDate) {
    // First session ever
    return { newStreak: 1, shouldReset: false };
  }
  
  if (lastActiveDate === today) {
    // Already active today, no change
    return { newStreak: currentStreak, shouldReset: false };
  }
  
  if (lastActiveDate === yesterday) {
    // Consecutive day, increment streak
    return { newStreak: currentStreak + 1, shouldReset: false };
  }
  
  // Missed at least one day, reset to 1
  return { newStreak: 1, shouldReset: true };
}

/**
 * Check if a milestone has been reached
 * @param {number} totalPomodoros - Total completed pomodoros
 * @returns {number|null} Milestone number or null
 */
function checkMilestone(totalPomodoros) {
  for (const threshold of MILESTONES) {
    if (totalPomodoros === threshold) {
      return threshold;
    }
  }
  return null;
}

/**
 * Record a completed focus session
 * Updates stats, calculates streak, checks milestones
 * @param {Object} sessionData - Session data
 * @param {number} sessionData.duration - Duration in seconds
 * @param {string} sessionData.type - 'work' | 'shortBreak' | 'longBreak'
 * @returns {Promise<Object>} { session, stats, unlockedMilestone }
 */
export async function recordSession(sessionData) {
  if (!isIndexedDBAvailable()) {
    console.warn('IndexedDB not available, session not recorded');
    return { session: null, stats: null, unlockedMilestone: null };
  }
  
  const timestamp = Date.now();
  
  // Create session record
  const session = await addSession({
    timestamp,
    duration: sessionData.duration,
    type: sessionData.type,
  });
  
  // Get current stats
  let stats = await getStats();
  if (!stats) {
    stats = await initializeStats();
  }
  
  // Only count work sessions for pomodoros and streaks
  const isWorkSession = sessionData.type === 'work';
  
  // Calculate new values
  const newTotalPomodoros = isWorkSession ? stats.totalPomodoros + 1 : stats.totalPomodoros;
  const newTotalFocusTime = stats.totalFocusTime + sessionData.duration;
  
  // Update daily history
  const today = getTodayString();
  const dailyHistory = { ...stats.dailyHistory };
  dailyHistory[today] = (dailyHistory[today] || 0) + sessionData.duration;
  
  // Prune old daily history entries (keep 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
  for (const date of Object.keys(dailyHistory)) {
    if (date < cutoffDate) {
      delete dailyHistory[date];
    }
  }
  
  // Calculate streak (only for work sessions)
  let newStreak = stats.currentStreak;
  let newLongestStreak = stats.longestStreak;
  let lastActiveDate = stats.lastActiveDate;
  
  if (isWorkSession) {
    const streakResult = calculateStreak(stats.lastActiveDate, stats.currentStreak);
    newStreak = streakResult.newStreak;
    lastActiveDate = today;
    
    if (newStreak > newLongestStreak) {
      newLongestStreak = newStreak;
    }
  }
  
  // Update stats
  const updatedStats = await updateStats({
    totalPomodoros: newTotalPomodoros,
    totalFocusTime: newTotalFocusTime,
    currentStreak: newStreak,
    longestStreak: newLongestStreak,
    lastActiveDate,
    dailyHistory,
  });
  
  // Check for milestone (only for work sessions)
  let unlockedMilestone = null;
  if (isWorkSession) {
    const milestone = checkMilestone(newTotalPomodoros);
    if (milestone) {
      const existingAchievement = await getAchievement(`${milestone}-pomodoros`);
      if (!existingAchievement) {
        unlockedMilestone = await unlockAchievement({
          type: `${milestone}-pomodoros`,
          pomodoroCount: milestone,
        });
      }
    }
  }
  
  // Run cleanup (non-blocking)
  cleanupOldSessions(30).catch(err => {
    console.warn('Failed to cleanup old sessions:', err);
  });
  
  // Broadcast to other tabs
  broadcast({ type: 'SESSION_ADDED', session });
  broadcast({ type: 'STATS_UPDATED', stats: updatedStats });
  if (unlockedMilestone) {
    broadcast({ type: 'ACHIEVEMENT_UNLOCKED', achievement: unlockedMilestone });
  }
  
  return { session, stats: updatedStats, unlockedMilestone };
}

/**
 * Record a break reminder action for session analytics.
 * @param {Object} actionData - Reminder action metadata
 * @param {string} actionData.action - 'skip' | 'snooze'
 * @param {string} actionData.mode - Timer mode context
 * @returns {Promise<Object|null>} Recorded analytics event or null
 */
export async function recordBreakReminderAction(actionData) {
  if (!isIndexedDBAvailable()) {
    console.warn('IndexedDB not available, break reminder action not recorded');
    return null;
  }

  const timestamp = Date.now();
  const event = await addSession({
    timestamp,
    duration: 0,
    type: 'breakReminderAction',
    action: actionData.action,
    mode: actionData.mode,
  });

  broadcast({ type: 'BREAK_REMINDER_ACTION_RECORDED', event });
  return event;
}

/**
 * Get current stats, initializing if needed
 * @returns {Promise<Object>} User stats
 */
export async function getCurrentStats() {
  if (!isIndexedDBAvailable()) {
    return createFallbackStats();
  }
  
  let stats = await getStats();
  if (!stats) {
    stats = await initializeStats();
  }
  return stats;
}

/**
 * Create fallback stats when IndexedDB is unavailable
 * @returns {Object} Default stats object
 */
function createFallbackStats() {
  return {
    id: 'user-stats',
    totalPomodoros: 0,
    totalFocusTime: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    dailyHistory: {},
    updatedAt: Date.now(),
  };
}

/**
 * Get focus time data for the past N days
 * @param {number} days - Number of days
 * @returns {Promise<Array>} Array of { date, focusTime } objects
 */
export async function getDailyFocusHistory(days = 7) {
  const stats = await getCurrentStats();
  const result = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    result.push({
      date: dateStr,
      focusTime: stats.dailyHistory[dateStr] || 0,
    });
  }
  
  return result;
}

/**
 * Format seconds into human-readable string
 * @param {number} seconds - Total seconds
 * @returns {string} Formatted string (e.g., "2h 30m")
 */
export function formatFocusTime(seconds) {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours === 0) {
    return `${minutes}m`;
  }
  
  if (minutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${minutes}m`;
}

/**
 * Export milestone thresholds for external use
 */
export { MILESTONES };
