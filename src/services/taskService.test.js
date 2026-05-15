import { describe, expect, it } from 'vitest';
import { createTask, getAllTasks } from './taskService';
import { __testing } from './db.js';

async function createLegacyDatabase() {
  await new Promise((resolve, reject) => {
    const request = indexedDB.open(__testing.DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;

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

    request.onsuccess = () => {
      request.result.close();
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

describe('taskService', () => {
  it('upgrades a legacy database before reading and writing tasks', async () => {
    await createLegacyDatabase();

    const task = await createTask({ title: 'Finish migration' });
    const tasks = await getAllTasks();

    expect(task.title).toBe('Finish migration');
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe(task.id);
  });
});
