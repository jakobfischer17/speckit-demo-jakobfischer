import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useExerciseSession } from './useExerciseSession'

const mockExercises = [
  { id: 'push-ups', name: 'Push-ups', category: 'Intense' },
  { id: 'desk-push-ups', name: 'Desk Push-ups', category: 'Light' },
  { id: 'forward-fold', name: 'Forward Fold', category: 'Stretch' },
]

describe('useExerciseSession', () => {
  it('initial phase is library', () => {
    const { result } = renderHook(() => useExerciseSession(mockExercises))
    expect(result.current.session.phase).toBe('library')
  })

  it('startExercise transitions to exercising', () => {
    const { result } = renderHook(() => useExerciseSession(mockExercises))
    act(() => result.current.startExercise(mockExercises[0]))
    expect(result.current.session.phase).toBe('exercising')
  })

  it('completeExercise transitions to complete', () => {
    const { result } = renderHook(() => useExerciseSession(mockExercises))
    act(() => result.current.startExercise(mockExercises[0]))
    act(() => result.current.completeExercise())
    expect(result.current.session.phase).toBe('complete')
  })

  it('completedIds grows after completeExercise', () => {
    const { result } = renderHook(() => useExerciseSession(mockExercises))
    act(() => result.current.startExercise(mockExercises[0]))
    act(() => result.current.completeExercise())
    expect(result.current.session.completedIds).toContain('push-ups')
  })

  it('skipExercise returns to library', () => {
    const { result } = renderHook(() => useExerciseSession(mockExercises))
    act(() => result.current.startExercise(mockExercises[0]))
    act(() => result.current.skipExercise())
    expect(result.current.session.phase).toBe('library')
  })

  it('returnToLibrary resets phase to library', () => {
    const { result } = renderHook(() => useExerciseSession(mockExercises))
    act(() => result.current.startExercise(mockExercises[0]))
    act(() => result.current.completeExercise())
    act(() => result.current.returnToLibrary())
    expect(result.current.session.phase).toBe('library')
  })

  it('resetCompleted clears completedIds for category', () => {
    const { result } = renderHook(() => useExerciseSession(mockExercises))
    act(() => result.current.startExercise(mockExercises[0]))
    act(() => result.current.completeExercise())
    act(() => result.current.resetCompleted('Intense'))
    expect(result.current.session.completedIds).not.toContain('push-ups')
  })
})
