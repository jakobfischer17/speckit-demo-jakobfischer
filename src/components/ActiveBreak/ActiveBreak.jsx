import { useState, useEffect } from 'react'
import { exercises as allExercises } from '../../data/exercises'
import { useExerciseSession } from '../../hooks/useExerciseSession'
import ExerciseLibrary from './ExerciseLibrary'
import ExercisePlayer from './ExercisePlayer'
import './ActiveBreak.css'

function ActiveBreak({ isBreakActive }) {
  const {
    session,
    currentExercise,
    startExercise,
    completeExercise,
    skipExercise,
    returnToLibrary,
    resetCompleted,
  } = useExerciseSession(allExercises)

  const [isDismissed, setIsDismissed] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [prevBreakActive, setPrevBreakActive] = useState(isBreakActive)

  if (prevBreakActive !== isBreakActive) {
    setPrevBreakActive(isBreakActive)
    if (!prevBreakActive && isBreakActive) {
      setIsDismissed(false)
    }
    if (
      prevBreakActive &&
      !isBreakActive &&
      (session.phase === 'exercising' || session.phase === 'cooldown')
    ) {
      setShowToast(true)
    }
  }

  useEffect(() => {
    if (!showToast) return
    const timeout = setTimeout(() => setShowToast(false), 5000)
    return () => clearTimeout(timeout)
  }, [showToast])

  const handleComplete = () => {
    completeExercise()
    returnToLibrary()
  }

  return (
    <div className="active-break">
      {isBreakActive && !isDismissed && (
        <div className="active-break__banner">
          <span>🏃 Time for an active break!</span>
          <button
            className="active-break__dismiss"
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss break banner"
          >
            ×
          </button>
        </div>
      )}

      {showToast && (
        <div className="active-break__toast" role="alert">
          Your break has ended
        </div>
      )}

      {session.phase === 'library' ? (
        <ExerciseLibrary
          exercises={allExercises}
          completedIds={session.completedIds}
          onSelectExercise={startExercise}
          onResetCompleted={resetCompleted}
        />
      ) : (
        <>
          <ExercisePlayer
            exercise={currentExercise}
            onComplete={handleComplete}
            onSkip={skipExercise}
          />
          {session.phase === 'complete' && (
            <button className="active-break__back" onClick={returnToLibrary}>
              ← Back to Library
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default ActiveBreak
