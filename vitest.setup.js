import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { __testing } from './src/services/db.js';

class MockBroadcastChannel {
  static channels = new Map();

  static reset() {
    for (const instances of MockBroadcastChannel.channels.values()) {
      [...instances].forEach((instance) => instance.close());
    }
    MockBroadcastChannel.channels.clear();
  }

  constructor(name) {
    this.name = name;
    this.onmessage = null;
    this.listeners = new Set();

    const instances = MockBroadcastChannel.channels.get(name) ?? new Set();
    instances.add(this);
    MockBroadcastChannel.channels.set(name, instances);
  }

  postMessage(data) {
    const instances = MockBroadcastChannel.channels.get(this.name) ?? new Set();

    for (const instance of instances) {
      if (instance !== this) {
        instance.dispatch(data);
      }
    }
  }

  addEventListener(type, callback) {
    if (type === 'message') {
      this.listeners.add(callback);
    }
  }

  removeEventListener(type, callback) {
    if (type === 'message') {
      this.listeners.delete(callback);
    }
  }

  dispatch(data) {
    const event = { data };
    this.onmessage?.(event);
    this.listeners.forEach((callback) => callback(event));
  }

  close() {
    const instances = MockBroadcastChannel.channels.get(this.name);
    instances?.delete(this);
    if (instances?.size === 0) {
      MockBroadcastChannel.channels.delete(this.name);
    }
    this.listeners.clear();
    this.onmessage = null;
  }
}

async function deleteDatabase(name) {
  await new Promise((resolve) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  });
}

globalThis.BroadcastChannel = MockBroadcastChannel;

if (!globalThis.PointerEvent) {
  globalThis.PointerEvent = MouseEvent;
}

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

beforeEach(async () => {
  vi.restoreAllMocks();
  MockBroadcastChannel.reset();
  await deleteDatabase(__testing.DB_NAME);
});

afterEach(async () => {
  cleanup();
  MockBroadcastChannel.reset();
  await deleteDatabase(__testing.DB_NAME);
});
