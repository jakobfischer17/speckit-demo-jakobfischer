import { test as base, expect, Page } from '@playwright/test';

/**
 * Common test utilities for Focus Enhancement Suite E2E tests.
 */

/**
 * IndexedDB database name used by the app
 */
const DB_NAME = 'productivity-hub';
const DB_VERSION = 2;

/**
 * Task interface for type safety
 */
interface Task {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  dueDate: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  completedAt: number | null;
  manualOrder: number;
  eisenhowerQuadrant: string | null;
  riceScores: {
    reach: number;
    impact: number;
    confidence: number;
    effort: number;
    score: number;
  } | null;
}

/**
 * Seed IndexedDB with test data (v2 schema)
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
  tasks?: Task[];
}) {
  await page.evaluate(async ({ dbName, dbVersion, data }) => {
    const request = indexedDB.open(dbName, dbVersion);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const oldVersion = (event as IDBVersionChangeEvent).oldVersion;
      
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
      
      // v2 additions: tasks and archivedTasks
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains('tasks')) {
          const tasksStore = db.createObjectStore('tasks', { keyPath: 'id' });
          tasksStore.createIndex('byDueDate', 'dueDate');
          tasksStore.createIndex('byPriority', 'priority');
          tasksStore.createIndex('byCreatedAt', 'createdAt');
          tasksStore.createIndex('byCompleted', 'completedAt');
          tasksStore.createIndex('byManualOrder', 'manualOrder');
        }
        
        if (!db.objectStoreNames.contains('archivedTasks')) {
          const archivedStore = db.createObjectStore('archivedTasks', { keyPath: 'id' });
          archivedStore.createIndex('byArchivedAt', 'archivedAt');
        }
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
        
        // Seed tasks (v2)
        if (data.tasks?.length && db.objectStoreNames.contains('tasks')) {
          const tx = db.transaction('tasks', 'readwrite');
          const store = tx.objectStore('tasks');
          for (const task of data.tasks) {
            store.put(task);
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
  }, { dbName: DB_NAME, dbVersion: DB_VERSION, data });
}

/**
 * Clear IndexedDB database
 */
export async function clearIndexedDB(page: Page) {
  await page.evaluate(async (dbName) => {
    return new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase(dbName);
      request.onsuccess = () => resolve();
      request.onerror = () => resolve(); // Resolve on error to prevent hanging
      request.onblocked = () => resolve();
      // Timeout fallback to prevent hanging
      setTimeout(() => resolve(), 2000);
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
 * Create test task object
 */
export function createTestTask(overrides: Partial<Task> = {}): Task {
  const now = Date.now();
  return {
    id: overrides.id || crypto.randomUUID(),
    title: overrides.title || 'Test Task',
    createdAt: overrides.createdAt || now,
    updatedAt: overrides.updatedAt || now,
    dueDate: overrides.dueDate || null,
    priority: overrides.priority || 'medium',
    completedAt: overrides.completedAt || null,
    manualOrder: overrides.manualOrder || 1,
    eisenhowerQuadrant: overrides.eisenhowerQuadrant || null,
    riceScores: overrides.riceScores || null,
  };
}

/**
 * Seed tasks via the UI (more reliable than direct DB seeding)
 */
export async function addTaskViaUI(page: Page, title: string) {
  // Navigate to Today section
  const todaySection = page.locator('#today');
  await todaySection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  
  // Add task via Quick Add
  const quickAddInput = page.locator('.quick-add__input');
  await quickAddInput.fill(title);
  await quickAddInput.press('Enter');
  
  // Wait for task to appear
  await page.locator('.task-item').filter({ hasText: title }).waitFor({ state: 'visible', timeout: 5000 });
}

/**
 * Clear the database completely
 */
export async function clearDatabaseCompletely(page: Page) {
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      const deleteRequest = indexedDB.deleteDatabase('productivity-hub');
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => resolve();
      deleteRequest.onblocked = () => resolve();
    });
  });
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
 * Scroll to a section by ID
 */
export async function scrollToSection(page: Page, sectionId: string) {
  await page.locator(`#${sectionId}`).scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
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
