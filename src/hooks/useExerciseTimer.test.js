import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useExerciseTimer } from './useExerciseTimer'

describe('useExerciseTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes with targetValue', () => {
    const { result } = renderHook(() =>
      useExerciseTimer({ targetType: 'duration', targetValue: 30 })
    )
    expect(result.current.count).toBe(30)
    expect(result.current.isRunning).toBe(false)
  })

  it('starts countdown for duration type', () => {
    const { result } = renderHook(() =>
      useExerciseTimer({ targetType: 'duration', targetValue: 5 })
    )
    act(() => result.current.start())
    expect(result.current.isRunning).toBe(true)

    act(() => vi.advanceTimersByTime(3000))
    expect(result.current.count).toBe(2)
  })

  it('stops at zero', () => {
    const { result } = renderHook(() =>
      useExerciseTimer({ targetType: 'duration', targetValue: 2 })
    )
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(5000))
    expect(result.current.count).toBe(0)
  })

  it('reset restores targetValue', () => {
    const { result } = renderHook(() =>
      useExerciseTimer({ targetType: 'duration', targetValue: 10 })
    )
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(3000))
    act(() => result.current.reset())
    expect(result.current.count).toBe(10)
    expect(result.current.isRunning).toBe(false)
  })

  it('decrement reduces count for reps type', () => {
    const { result } = renderHook(() =>
      useExerciseTimer({ targetType: 'reps', targetValue: 10 })
    )
    act(() => result.current.start())
    act(() => result.current.decrement())
    expect(result.current.count).toBe(9)
  })
})
