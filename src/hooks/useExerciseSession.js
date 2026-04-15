import { useState, useCallback } from 'react'

export function useExerciseSession(exercises) {
  const [session, setSession] = useState({
    exercises,
    currentIndex: -1,
    phase: 'library',
    completedIds: [],
    sessionStartedAt: null,
  })

  const startExercise = useCallback((exercise) => {
    const index = exercises.findIndex((e) => e.id === exercise.id)
    setSession((prev) => ({
      ...prev,
      currentIndex: index,
      phase: 'exercising',
      sessionStartedAt: prev.sessionStartedAt ?? Date.now(),
    }))
  }, [exercises])

  const completeExercise = useCallback(() => {
    setSession((prev) => {
      const exercise = prev.exercises[prev.currentIndex]
      return {
        ...prev,
        phase: 'complete',
        completedIds: prev.completedIds.includes(exercise.id)
          ? prev.completedIds
          : [...prev.completedIds, exercise.id],
      }
    })
  }, [])

  const skipExercise = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      phase: 'library',
      currentIndex: -1,
    }))
  }, [])

  const returnToLibrary = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      phase: 'library',
      currentIndex: -1,
    }))
  }, [])

  const resetCompleted = useCallback((category) => {
    setSession((prev) => {
      const idsToReset = category === 'All'
        ? prev.exercises.map((e) => e.id)
        : prev.exercises.filter((e) => e.category === category).map((e) => e.id)
      return {
        ...prev,
        completedIds: prev.completedIds.filter((id) => !idsToReset.includes(id)),
      }
    })
  }, [])

  const currentExercise = session.currentIndex >= 0
    ? session.exercises[session.currentIndex]
    : null

  return {
    session,
    currentExercise,
    startExercise,
    completeExercise,
    skipExercise,
    returnToLibrary,
    resetCompleted,
  }
}
