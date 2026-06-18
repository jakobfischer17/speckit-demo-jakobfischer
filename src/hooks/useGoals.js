import { useState, useEffect, useCallback } from 'react';
import { todayString } from '../utils/date.js';

/**
 * useGoals – manages user-defined daily goals and their completion history.
 *
 * Each goal is a named habit the user ticks off once per day. Completions are
 * stored as a { 'YYYY-MM-DD': true } map so the streak math can run over them.
 * Persisted to localStorage with safe defaults and graceful fallback when the
 * stored value is missing or corrupted (mirrors usePreferences).
 */

const STORAGE_KEY = 'productivity-hub-goals';

export const GOAL_ICONS = ['🎯', '📚', '🏃', '💧', '🧘', '✍️', '🛌', '🥗', '🎸', '🧠'];

const MAX_NAME_LENGTH = 40;

function makeId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `goal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Coerce stored completions into a clean { dateString: true } map.
 */
function sanitizeCompletions(raw) {
  if (!raw || typeof raw !== 'object') return {};
  const clean = {};
  for (const [key, value] of Object.entries(raw)) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(key) && value) {
      clean[key] = true;
    }
  }
  return clean;
}

/**
 * Coerce one stored goal into a valid shape, or null if unusable.
 */
function sanitizeGoal(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const name = typeof raw.name === 'string' ? raw.name.trim().slice(0, MAX_NAME_LENGTH) : '';
  if (!name) return null;
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : makeId(),
    name,
    icon: typeof raw.icon === 'string' && raw.icon ? raw.icon : GOAL_ICONS[0],
    createdAt: Number.isFinite(raw.createdAt) ? raw.createdAt : Date.now(),
    completions: sanitizeCompletions(raw.completions),
  };
}

function readStored() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(sanitizeGoal).filter(Boolean);
  } catch {
    return [];
  }
}

export function useGoals() {
  const [goals, setGoals] = useState(readStored);

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
    } catch {
      // Ignore write failures (e.g. private mode quota).
    }
  }, [goals]);

  const addGoal = useCallback((name, icon = GOAL_ICONS[0]) => {
    const trimmed = typeof name === 'string' ? name.trim().slice(0, MAX_NAME_LENGTH) : '';
    if (!trimmed) return;
    setGoals((prev) => [
      ...prev,
      {
        id: makeId(),
        name: trimmed,
        icon,
        createdAt: Date.now(),
        completions: {},
      },
    ]);
  }, []);

  const removeGoal = useCallback((id) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const renameGoal = useCallback((id, name) => {
    const trimmed = typeof name === 'string' ? name.trim().slice(0, MAX_NAME_LENGTH) : '';
    if (!trimmed) return;
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, name: trimmed } : g)));
  }, []);

  /**
   * Toggle completion for a specific date (defaults to today).
   */
  const toggleDate = useCallback((id, date = todayString()) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const completions = { ...g.completions };
        if (completions[date]) {
          delete completions[date];
        } else {
          completions[date] = true;
        }
        return { ...g, completions };
      }),
    );
  }, []);

  const toggleToday = useCallback((id) => toggleDate(id, todayString()), [toggleDate]);

  return {
    goals,
    addGoal,
    removeGoal,
    renameGoal,
    toggleDate,
    toggleToday,
    GOAL_ICONS,
  };
}

export default useGoals;
