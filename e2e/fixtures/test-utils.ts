import { test as base, expect, Page } from '@playwright/test';

/**
 * Common test utilities for Focus Enhancement Suite E2E tests.
 */

/**
 * IndexedDB database name used by the app
 */
const DB_NAME = 'productivity-hub';

/**
 * Seed IndexedDB with test data
 */
export async function seedIndexedDB(page: Page, data: {
  sessions?: Array<{
    id: string;
    timestamp: number;
    duration: number;
    type: 'work' | 'shortBreak' | 'longBreak';
    completedAt: string;
  }>;
  stats?: {
    id: string;
    totalPomodoros: number;
    totalFocusTime: number;
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string;
    dailyHistory: Record<string, number>;
    updatedAt: number;
  };
  achievements?: Array<{
    type: string;
    unlockedAt: number;
    pomodoroCount: number;
    displayed: boolean;
  }>;
}) {
  await page.evaluate(async ({ dbName, data }) => {
    const request = indexedDB.open(dbName, 1);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains('sessions')) {
        const sessionsStore = db.createObjectStore('sessions', { keyPath: 'id' });
        sessionsStore.createIndex('byDate', 'timestamp');
        sessionsStore.createIndex('byType', 'type');
      }
      
      if (!db.objectStoreNames.contains('stats')) {
        db.createObjectStore('stats', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('achievements')) {
        db.createObjectStore('achievements', { keyPath: 'type' });
      }
    };

    return new Promise<void>((resolve, reject) => {
      request.onsuccess = async (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Seed sessions
        if (data.sessions?.length) {
          const tx = db.transaction('sessions', 'readwrite');
          const store = tx.objectStore('sessions');
          for (const session of data.sessions) {
            store.put(session);
          }
          await new Promise<void>((res, rej) => {
            tx.oncomplete = () => res();
            tx.onerror = () => rej(tx.error);
          });
        }
        
        // Seed stats
        if (data.stats) {
          const tx = db.transaction('stats', 'readwrite');
          const store = tx.objectStore('stats');
          store.put(data.stats);
          await new Promise<void>((res, rej) => {
            tx.oncomplete = () => res();
            tx.onerror = () => rej(tx.error);
          });
        }
        
        // Seed achievements
        if (data.achievements?.length) {
          const tx = db.transaction('achievements', 'readwrite');
          const store = tx.objectStore('achievements');
          for (const achievement of data.achievements) {
            store.put(achievement);
          }
          await new Promise<void>((res, rej) => {
            tx.oncomplete = () => res();
            tx.onerror = () => rej(tx.error);
          });
        }
        
        db.close();
        resolve();
      };
      
      request.onerror = () => reject(request.error);
    });
  }, { dbName: DB_NAME, data });
}

/**
 * Clear IndexedDB database
 */
export async function clearIndexedDB(page: Page) {
  await page.evaluate(async (dbName) => {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase(dbName);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }, DB_NAME);
}

/**
 * Setup test database with initial data
 * Simplified helper for common test scenarios
 */
export async function setupTestDatabase(page: Page, data: {
  stats?: {
    totalSessions?: number;
    totalFocusMinutes?: number;
    currentStreak?: number;
    longestStreak?: number;
  };
  achievements?: Array<{
    type: string;
    pomodoroCount: number;
  }>;
}) {
  const today = new Date().toISOString().split('T')[0];
  
  const statsData = data.stats ? {
    id: 'user-stats',
    totalPomodoros: data.stats.totalSessions ?? 0,
    totalFocusTime: (data.stats.totalFocusMinutes ?? 0) * 60, // Convert to seconds
    currentStreak: data.stats.currentStreak ?? 0,
    longestStreak: data.stats.longestStreak ?? data.stats.currentStreak ?? 0,
    lastActiveDate: today,
    dailyHistory: {},
    updatedAt: Date.now(),
  } : undefined;

  const achievementsData = data.achievements?.map(a => ({
    type: a.type,
    unlockedAt: Date.now(),
    pomodoroCount: a.pomodoroCount,
    displayed: true,
  }));

  await seedIndexedDB(page, {
    stats: statsData,
    achievements: achievementsData,
  });
}

/**
 * Get data from IndexedDB
 */
export async function getIndexedDBData(page: Page, storeName: string) {
  return await page.evaluate(async ({ dbName, storeName }) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => {
          db.close();
          resolve(getAllRequest.result);
        };
        getAllRequest.onerror = () => {
          db.close();
          reject(getAllRequest.error);
        };
      };
      
      request.onerror = () => reject(request.error);
    });
  }, { dbName: DB_NAME, storeName });
}

/**
 * Create a test session object
 */
export function createTestSession(overrides: Partial<{
  id: string;
  timestamp: number;
  duration: number;
  type: 'work' | 'shortBreak' | 'longBreak';
  completedAt: string;
}> = {}) {
  const now = Date.now();
  return {
    id: overrides.id || crypto.randomUUID(),
    timestamp: overrides.timestamp || now,
    duration: overrides.duration || 1500, // 25 minutes
    type: overrides.type || 'work',
    completedAt: overrides.completedAt || new Date(now).toISOString(),
  };
}

/**
 * Create test stats object
 */
export function createTestStats(overrides: Partial<{
  totalPomodoros: number;
  totalFocusTime: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  dailyHistory: Record<string, number>;
}> = {}) {
  const today = new Date().toISOString().split('T')[0];
  return {
    id: 'user-stats',
    totalPomodoros: overrides.totalPomodoros ?? 0,
    totalFocusTime: overrides.totalFocusTime ?? 0,
    currentStreak: overrides.currentStreak ?? 0,
    longestStreak: overrides.longestStreak ?? 0,
    lastActiveDate: overrides.lastActiveDate ?? today,
    dailyHistory: overrides.dailyHistory ?? {},
    updatedAt: Date.now(),
  };
}

/**
 * Wait for app to be fully loaded
 */
export async function waitForAppReady(page: Page) {
  // Wait for the main app container to be visible
  await page.waitForSelector('[data-testid="app"]', { state: 'visible', timeout: 10000 });
}

/**
 * Navigate to a section using the nav bar
 */
export async function navigateToSection(page: Page, sectionName: string) {
  await page.getByRole('link', { name: new RegExp(sectionName, 'i') }).click();
  // Wait for scroll to complete
  await page.waitForTimeout(500);
}

/**
 * Extended test fixtures with common setup
 */
export const test = base.extend<{
  cleanDB: void;
}>({
  cleanDB: async ({ page }, use) => {
    // Clear database before test
    await page.goto('/');
    await clearIndexedDB(page);
    await page.reload();
    await use();
  },
});

export { expect };
