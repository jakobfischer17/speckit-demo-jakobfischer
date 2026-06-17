import { useState, useEffect, useCallback } from 'react';

/**
 * usePreferences - persists user settings across refreshes and visits.
 * Stores break/session timing and theme in localStorage with safe defaults
 * and graceful fallback when values are missing or corrupted.
 */

const STORAGE_KEY = 'productivity-hub-preferences';

export const DEFAULT_PREFERENCES = {
  workDuration: 25,
  shortBreak: 5,
  longBreak: 15,
  theme: 'light', // 'light' | 'dark'
  dailyGoal: 1,   // pomodoros per day target
};

const isValidDuration = (value, min, max) =>
  typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;

/**
 * Merge stored values onto defaults, discarding anything invalid.
 */
function sanitize(raw) {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_PREFERENCES };
  return {
    workDuration: isValidDuration(raw.workDuration, 1, 120)
      ? raw.workDuration
      : DEFAULT_PREFERENCES.workDuration,
    shortBreak: isValidDuration(raw.shortBreak, 1, 60)
      ? raw.shortBreak
      : DEFAULT_PREFERENCES.shortBreak,
    longBreak: isValidDuration(raw.longBreak, 1, 60)
      ? raw.longBreak
      : DEFAULT_PREFERENCES.longBreak,
    theme: raw.theme === 'dark' ? 'dark' : 'light',
    dailyGoal: isValidDuration(raw.dailyGoal, 1, 20)
      ? raw.dailyGoal
      : DEFAULT_PREFERENCES.dailyGoal,
  };
}

function readStored() {
  if (typeof localStorage === 'undefined') return { ...DEFAULT_PREFERENCES };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...DEFAULT_PREFERENCES };
    return sanitize(JSON.parse(stored));
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function usePreferences() {
  const [preferences, setPreferences] = useState(readStored);

  // Persist on every change.
  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // Ignore storage write failures (e.g. private mode quota).
    }
  }, [preferences]);

  // Reflect theme on the document root so CSS can react globally.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', preferences.theme);
  }, [preferences.theme]);

  const updatePreference = useCallback((key, value) => {
    setPreferences((prev) => sanitize({ ...prev, [key]: value }));
  }, []);

  const toggleTheme = useCallback(() => {
    setPreferences((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences({ ...DEFAULT_PREFERENCES });
  }, []);

  return {
    preferences,
    updatePreference,
    toggleTheme,
    resetPreferences,
  };
}

export default usePreferences;
