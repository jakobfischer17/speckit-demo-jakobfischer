import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGoals } from './useGoals';
import { todayString } from '../utils/date';

describe('useGoals', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with no goals', () => {
    const { result } = renderHook(() => useGoals());
    expect(result.current.goals).toEqual([]);
  });

  it('adds a goal with a name and icon', () => {
    const { result } = renderHook(() => useGoals());
    act(() => result.current.addGoal('Read 30 min', '📚'));
    expect(result.current.goals).toHaveLength(1);
    expect(result.current.goals[0].name).toBe('Read 30 min');
    expect(result.current.goals[0].icon).toBe('📚');
    expect(result.current.goals[0].completions).toEqual({});
  });

  it('ignores blank goal names', () => {
    const { result } = renderHook(() => useGoals());
    act(() => result.current.addGoal('   '));
    expect(result.current.goals).toHaveLength(0);
  });

  it('toggles today completion on and off', () => {
    const { result } = renderHook(() => useGoals());
    act(() => result.current.addGoal('Exercise'));
    const id = result.current.goals[0].id;

    act(() => result.current.toggleToday(id));
    expect(result.current.goals[0].completions[todayString()]).toBe(true);

    act(() => result.current.toggleToday(id));
    expect(result.current.goals[0].completions[todayString()]).toBeUndefined();
  });

  it('removes a goal', () => {
    const { result } = renderHook(() => useGoals());
    act(() => result.current.addGoal('Meditate'));
    const id = result.current.goals[0].id;
    act(() => result.current.removeGoal(id));
    expect(result.current.goals).toHaveLength(0);
  });

  it('persists goals to localStorage', () => {
    const { result, unmount } = renderHook(() => useGoals());
    act(() => result.current.addGoal('Drink water', '💧'));
    unmount();

    const { result: reloaded } = renderHook(() => useGoals());
    expect(reloaded.current.goals).toHaveLength(1);
    expect(reloaded.current.goals[0].name).toBe('Drink water');
  });

  it('recovers gracefully from corrupted storage', () => {
    localStorage.setItem('productivity-hub-goals', '{ not valid json');
    const { result } = renderHook(() => useGoals());
    expect(result.current.goals).toEqual([]);
  });
});
