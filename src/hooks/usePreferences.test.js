import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePreferences, DEFAULT_PREFERENCES } from './usePreferences';

describe('usePreferences', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('returns defaults when nothing is stored', () => {
    const { result } = renderHook(() => usePreferences());
    expect(result.current.preferences).toEqual(DEFAULT_PREFERENCES);
  });

  it('falls back to safe defaults for invalid stored values', () => {
    localStorage.setItem(
      'productivity-hub-preferences',
      JSON.stringify({ workDuration: 9999, theme: 'neon' })
    );
    const { result } = renderHook(() => usePreferences());
    expect(result.current.preferences.workDuration).toBe(DEFAULT_PREFERENCES.workDuration);
    expect(result.current.preferences.theme).toBe('light');
  });

  it('persists updates and reflects theme on the document root', () => {
    const { result } = renderHook(() => usePreferences());

    act(() => result.current.toggleTheme());
    expect(result.current.preferences.theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    const stored = JSON.parse(localStorage.getItem('productivity-hub-preferences'));
    expect(stored.theme).toBe('dark');
  });

  it('resets to defaults', () => {
    const { result } = renderHook(() => usePreferences());
    act(() => result.current.updatePreference('workDuration', 50));
    expect(result.current.preferences.workDuration).toBe(50);

    act(() => result.current.resetPreferences());
    expect(result.current.preferences).toEqual(DEFAULT_PREFERENCES);
  });
});
