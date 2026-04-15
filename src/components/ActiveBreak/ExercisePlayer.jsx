import { useEffect, useState } from 'react'
import Lottie from 'lottie-react'
import { useExerciseTimer } from '../../hooks/useExerciseTimer'
import BreathingCoolDown from './BreathingCoolDown'
import './ExercisePlayer.css'

function ExercisePlayer({ exercise, onComplete, onSkip }) {
  const { count, isRunning, start, decrement } = useExerciseTimer({
    targetType: exercise.targetType,
    targetValue: exercise.targetValue,
  })
  const [showCoolDown, setShowCoolDown] = useState(false)
  const [coolDownReady, setCoolDownReady] = useState(false)

  useEffect(() => {
    if (exercise.targetType === 'duration') {
      start()
    }
  }, [exercise.targetType, start])

  useEffect(() => {
    if (count <= 0 && isRunning !== undefined) {
      if (exercise.coolDownRequired) {
        const timeout = setTimeout(() => {
          setCoolDownReady(true)
          setShowCoolDown(true)
        }, 2000)
        return () => clearTimeout(timeout)
      } else if (count === 0 && exercise.targetType === 'duration') {
        onComplete()
      }
    }
  }, [count, exercise.coolDownRequired, exercise.targetType, isRunning, onComplete])

  const handleRepClick = () => {
    if (exercise.targetType === 'reps') {
      decrement()
      if (count - 1 <= 0) {
        if (!exercise.coolDownRequired) {
          onComplete()
        }
      }
    }
  }

  const handleCoolDownComplete = () => {
    setShowCoolDown(false)
    onComplete()
  }

  if (showCoolDown && coolDownReady) {
    return (
      <BreathingCoolDown
        patternKey={exercise.coolDownPattern}
        onComplete={handleCoolDownComplete}
        onSkip={handleCoolDownComplete}
      />
    )
  }

  return (
    <div className="exercise-player">
      <h2 className="exercise-player__name">{exercise.name}</h2>
      <div className="exercise-player__animation">
        <Lottie animationData={exercise.animationFile} loop autoplay />
      </div>
      <div className="exercise-player__counter" role="status">
        <span className="exercise-player__count">{count}</span>
        <span className="exercise-player__label">
          {exercise.targetType === 'reps' ? 'reps remaining' : 'seconds remaining'}
        </span>
      </div>
      {exercise.targetType === 'reps' && (
        <button className="exercise-player__rep-btn" onClick={handleRepClick}>
          Count Rep
        </button>
      )}
      <div className="exercise-player__instructions">
        <ol>
          {exercise.instructions.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>
      <button className="exercise-player__skip" onClick={onSkip} aria-label="Skip exercise">
        Skip
      </button>
    </div>
  )
}

export default ExercisePlayer
