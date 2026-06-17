import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useStreak, STREAK_MILESTONES } from './useStreak';

// Helper: returns a YYYY-MM-DD string for a date N days from today
function dateOffset(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

const today = dateOffset(0);
const yesterday = dateOffset(-1);
const twoDaysAgo = dateOffset(-2);
const fourDaysAgo = dateOffset(-4);

describe('useStreak', () => {
  it('returns a 28-day calendar', () => {
    const { result } = renderHook(() => useStreak({ dailyPomodoros: {}, dailyGoal: 1 }));
    expect(result.current.calendar).toHaveLength(28);
  });

  it('marks today as isToday', () => {
    const { result } = renderHook(() => useStreak({ dailyPomodoros: {}, dailyGoal: 1 }));
    const todayEntry = result.current.calendar.find((d) => d.isToday);
    expect(todayEntry).toBeDefined();
    expect(todayEntry.key).toBe(today);
  });

  it('marks a day as goalMet when count >= dailyGoal', () => {
    const dailyPomodoros = { [today]: 2 };
    const { result } = renderHook(() =>
      useStreak({ dailyPomodoros, dailyGoal: 2 }),
    );
    const todayEntry = result.current.calendar.find((d) => d.isToday);
    expect(todayEntry.goalMet).toBe(true);
  });

  it('does not mark a day as goalMet when count < dailyGoal', () => {
    const dailyPomodoros = { [today]: 1 };
    const { result } = renderHook(() =>
      useStreak({ dailyPomodoros, dailyGoal: 3 }),
    );
    const todayEntry = result.current.calendar.find((d) => d.isToday);
    expect(todayEntry.goalMet).toBe(false);
  });

  it('goalStreak is 0 with no activity', () => {
    const { result } = renderHook(() => useStreak({ dailyPomodoros: {}, dailyGoal: 1 }));
    expect(result.current.goalStreak).toBe(0);
  });

  it('goalStreak counts today when goal is met today', () => {
    const dailyPomodoros = { [today]: 1 };
    const { result } = renderHook(() =>
      useStreak({ dailyPomodoros, dailyGoal: 1 }),
    );
    expect(result.current.goalStreak).toBe(1);
  });

  it('goalStreak counts consecutive days ending today', () => {
    const dailyPomodoros = {
      [today]:       2,
      [yesterday]:   2,
      [twoDaysAgo]:  2,
    };
    const { result } = renderHook(() =>
      useStreak({ dailyPomodoros, dailyGoal: 2 }),
    );
    expect(result.current.goalStreak).toBe(3);
  });

  it('goalStreak stops at a gap', () => {
    // today + yesterday met, two days ago not met, four days ago met
    const dailyPomodoros = {
      [today]:       1,
      [yesterday]:   1,
      [fourDaysAgo]: 1,
    };
    const { result } = renderHook(() =>
      useStreak({ dailyPomodoros, dailyGoal: 1 }),
    );
    expect(result.current.goalStreak).toBe(2);
  });

  it('goalStreak counts from yesterday when today goal not yet met', () => {
    const dailyPomodoros = {
      [yesterday]:   1,
      [twoDaysAgo]:  1,
    };
    const { result } = renderHook(() =>
      useStreak({ dailyPomodoros, dailyGoal: 1 }),
    );
    // today is not met (skip), yesterday + twoDaysAgo = 2
    expect(result.current.goalStreak).toBe(2);
  });

  it('currentReward is null for streak < 3', () => {
    const dailyPomodoros = { [today]: 1, [yesterday]: 1 };
    const { result } = renderHook(() =>
      useStreak({ dailyPomodoros, dailyGoal: 1 }),
    );
    expect(result.current.currentReward).toBeNull();
  });

  it('currentReward is the highest matched milestone', () => {
    // Build 7 consecutive days of met goals
    const dailyPomodoros = {};
    for (let i = 0; i < 7; i++) {
      dailyPomodoros[dateOffset(-i)] = 1;
    }
    const { result } = renderHook(() =>
      useStreak({ dailyPomodoros, dailyGoal: 1 }),
    );
    expect(result.current.goalStreak).toBe(7);
    expect(result.current.currentReward?.days).toBe(7);
    expect(result.current.currentReward?.icon).toBe('🏆');
  });

  it('exports STREAK_MILESTONES in descending day order', () => {
    for (let i = 1; i < STREAK_MILESTONES.length; i++) {
      expect(STREAK_MILESTONES[i - 1].days).toBeGreaterThan(STREAK_MILESTONES[i].days);
    }
  });
});
