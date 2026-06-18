import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useStreak, STREAK_MILESTONES } from './useStreak';
import { dateStringWithOffset } from '../utils/date';

const today = dateStringWithOffset(0);
const yesterday = dateStringWithOffset(-1);
const twoDaysAgo = dateStringWithOffset(-2);
const fourDaysAgo = dateStringWithOffset(-4);

describe('useStreak', () => {
  it('returns a 28-day calendar', () => {
    const { result } = renderHook(() => useStreak({ completions: {} }));
    expect(result.current.calendar).toHaveLength(28);
  });

  it('marks today as isToday with the correct local key', () => {
    const { result } = renderHook(() => useStreak({ completions: {} }));
    const todayEntry = result.current.calendar.find((d) => d.isToday);
    expect(todayEntry).toBeDefined();
    expect(todayEntry.key).toBe(today);
  });

  it('marks a day completed when present in the completions map', () => {
    const { result } = renderHook(() => useStreak({ completions: { [today]: true } }));
    const todayEntry = result.current.calendar.find((d) => d.isToday);
    expect(todayEntry.completed).toBe(true);
  });

  it('does not mark a day completed when absent', () => {
    const { result } = renderHook(() => useStreak({ completions: {} }));
    const todayEntry = result.current.calendar.find((d) => d.isToday);
    expect(todayEntry.completed).toBe(false);
  });

  it('streak is 0 with no completions', () => {
    const { result } = renderHook(() => useStreak({ completions: {} }));
    expect(result.current.streak).toBe(0);
  });

  it('streak counts today when completed today', () => {
    const { result } = renderHook(() => useStreak({ completions: { [today]: true } }));
    expect(result.current.streak).toBe(1);
  });

  it('streak counts consecutive days ending today', () => {
    const completions = { [today]: true, [yesterday]: true, [twoDaysAgo]: true };
    const { result } = renderHook(() => useStreak({ completions }));
    expect(result.current.streak).toBe(3);
  });

  it('streak stops at a gap', () => {
    const completions = { [today]: true, [yesterday]: true, [fourDaysAgo]: true };
    const { result } = renderHook(() => useStreak({ completions }));
    expect(result.current.streak).toBe(2);
  });

  it('streak counts from yesterday when today not yet done', () => {
    const completions = { [yesterday]: true, [twoDaysAgo]: true };
    const { result } = renderHook(() => useStreak({ completions }));
    expect(result.current.streak).toBe(2);
  });

  it('currentReward is null for streak < 3', () => {
    const completions = { [today]: true, [yesterday]: true };
    const { result } = renderHook(() => useStreak({ completions }));
    expect(result.current.currentReward).toBeNull();
  });

  it('currentReward is the highest matched milestone', () => {
    const completions = {};
    for (let i = 0; i < 7; i++) {
      completions[dateStringWithOffset(-i)] = true;
    }
    const { result } = renderHook(() => useStreak({ completions }));
    expect(result.current.streak).toBe(7);
    expect(result.current.currentReward?.days).toBe(7);
    expect(result.current.currentReward?.icon).toBe('🏆');
  });

  it('exports STREAK_MILESTONES in descending day order', () => {
    for (let i = 1; i < STREAK_MILESTONES.length; i++) {
      expect(STREAK_MILESTONES[i - 1].days).toBeGreaterThan(STREAK_MILESTONES[i].days);
    }
  });
});
