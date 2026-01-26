import { openDB } from 'idb';

/**
 * IndexedDB service for Focus Enhancement Suite.
 * Database: productivity-hub (version 1)
 * Stores: sessions, stats, achievements
 */

const DB_NAME = 'productivity-hub';
const DB_VERSION = 1;

/**
 * Initialize and get database connection
 */
async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Sessions store - completed pomodoro records
      if (!db.objectStoreNames.contains('sessions')) {
        const sessionsStore = db.createObjectStore('sessions', { keyPath: 'id' });
        sessionsStore.createIndex('byDate', 'timestamp');
        sessionsStore.createIndex('byType', 'type');
      }

      // Stats store - singleton for user statistics
      if (!db.objectStoreNames.contains('stats')) {
        db.createObjectStore('stats', { keyPath: 'id' });
      }

      // Achievements store - unlocked milestones
      if (!db.objectStoreNames.contains('achievements')) {
        db.createObjectStore('achievements', { keyPath: 'type' });
      }
    },
  });
}

// ============================================
// Session Operations
// ============================================

/**
 * Add a completed focus session
 * @param {Object} session - Session data without id
 * @returns {Promise<Object>} Created session with id
 */
export async function addSession(session) {
  const db = await getDB();
  const id = crypto.randomUUID();
  const fullSession = {
    ...session,
    id,
    completedAt: new Date(session.timestamp).toISOString(),
  };
  await db.put('sessions', fullSession);
  return fullSession;
}

/**
 * Get all sessions within a date range
 * @param {number} startTimestamp - Start of range (inclusive)
 * @param {number} endTimestamp - End of range (inclusive)
 * @returns {Promise<Array>} Sessions in range
 */
export async function getSessionsByDateRange(startTimestamp, endTimestamp) {
  const db = await getDB();
  const range = IDBKeyRange.bound(startTimestamp, endTimestamp);
  return db.getAllFromIndex('sessions', 'byDate', range);
}

/**
 * Get today's sessions
 * @returns {Promise<Array>} Today's sessions
 */
export async function getTodaySessions() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfDay = today.getTime();
  const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;
  return getSessionsByDateRange(startOfDay, endOfDay);
}

/**
 * Get sessions for the past N days
 * @param {number} days - Number of days to look back
 * @returns {Promise<Array>} Sessions from the past N days
 */
export async function getRecentSessions(days = 7) {
  const now = Date.now();
  const startTimestamp = now - days * 24 * 60 * 60 * 1000;
  return getSessionsByDateRange(startTimestamp, now);
}

/**
 * Delete sessions older than the specified number of days
 * @param {number} days - Age threshold in days (default 30)
 * @returns {Promise<number>} Number of deleted sessions
 */
export async function cleanupOldSessions(days = 30) {
  const db = await getDB();
  const cutoffTimestamp = Date.now() - days * 24 * 60 * 60 * 1000;
  
  const tx = db.transaction('sessions', 'readwrite');
  const store = tx.objectStore('sessions');
  const index = store.index('byDate');
  
  let cursor = await index.openCursor(IDBKeyRange.upperBound(cutoffTimestamp));
  let deletedCount = 0;
  
  while (cursor) {
    await cursor.delete();
    deletedCount++;
    cursor = await cursor.continue();
  }
  
  await tx.done;
  return deletedCount;
}

// ============================================
// Stats Operations
// ============================================

const STATS_ID = 'user-stats';

/**
 * Get user statistics
 * @returns {Promise<Object|null>} User stats or null if none exist
 */
export async function getStats() {
  const db = await getDB();
  return db.get('stats', STATS_ID);
}

/**
 * Initialize default stats if none exist
 * @returns {Promise<Object>} Initial stats object
 */
export async function initializeStats() {
  const db = await getDB();
  const existing = await db.get('stats', STATS_ID);
  
  if (existing) {
    return existing;
  }
  
  const initialStats = {
    id: STATS_ID,
    totalPomodoros: 0,
    totalFocusTime: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    dailyHistory: {},
    updatedAt: Date.now(),
  };
  
  await db.put('stats', initialStats);
  return initialStats;
}

/**
 * Update user statistics
 * @param {Object} updates - Partial stats to update
 * @returns {Promise<Object>} Updated stats
 */
export async function updateStats(updates) {
  const db = await getDB();
  const current = await getStats() || await initializeStats();
  
  const updated = {
    ...current,
    ...updates,
    updatedAt: Date.now(),
  };
  
  await db.put('stats', updated);
  return updated;
}

// ============================================
// Achievement Operations
// ============================================

/**
 * Get all achievements
 * @returns {Promise<Array>} All achievements
 */
export async function getAchievements() {
  const db = await getDB();
  return db.getAll('achievements');
}

/**
 * Get achievement by type
 * @param {string} type - Achievement type
 * @returns {Promise<Object|null>} Achievement or null
 */
export async function getAchievement(type) {
  const db = await getDB();
  return db.get('achievements', type);
}

/**
 * Unlock a new achievement
 * @param {Object} achievement - Achievement data
 * @returns {Promise<Object>} Created achievement
 */
export async function unlockAchievement(achievement) {
  const db = await getDB();
  const fullAchievement = {
    ...achievement,
    unlockedAt: Date.now(),
    displayed: false,
  };
  await db.put('achievements', fullAchievement);
  return fullAchievement;
}

/**
 * Mark achievement as displayed (celebration shown)
 * @param {string} type - Achievement type
 * @returns {Promise<Object>} Updated achievement
 */
export async function markAchievementDisplayed(type) {
  const db = await getDB();
  const achievement = await db.get('achievements', type);
  
  if (achievement) {
    achievement.displayed = true;
    await db.put('achievements', achievement);
  }
  
  return achievement;
}

/**
 * Get achievements that haven't been displayed yet
 * @returns {Promise<Array>} Pending achievements
 */
export async function getPendingAchievements() {
  const achievements = await getAchievements();
  return achievements.filter(a => !a.displayed);
}

// ============================================
// Database Utilities
// ============================================

/**
 * Check if IndexedDB is available
 * @returns {boolean} True if available
 */
export function isIndexedDBAvailable() {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}

/**
 * Export for testing
 */
export const __testing = {
  DB_NAME,
  DB_VERSION,
  STATS_ID,
  getDB,
};
