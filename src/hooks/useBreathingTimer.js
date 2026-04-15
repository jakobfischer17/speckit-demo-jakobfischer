import { useState, useEffect, useCallback } from 'react'
import { breathingPatterns } from '../data/breathingPatterns'

export function useBreathingTimer(patternKey) {
  const pattern = breathingPatterns[patternKey]
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0)
  const [secondsInPhase, setSecondsInPhase] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [cycleCount, setCycleCount] = useState(0)

  const currentPhase = pattern.phases[currentPhaseIndex]

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setSecondsInPhase((prev) => {
        if (prev >= currentPhase.duration - 1) {
          const nextIndex = (currentPhaseIndex + 1) % pattern.phases.length
          setCurrentPhaseIndex(nextIndex)
          if (nextIndex === 0) {
            setCycleCount((c) => c + 1)
          }
          return 0
        }
        return prev + 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, currentPhase, currentPhaseIndex, pattern.phases.length])

  const start = useCallback(() => {
    setIsActive(true)
  }, [])

  const stop = useCallback(() => {
    setIsActive(false)
    setCurrentPhaseIndex(0)
    setSecondsInPhase(0)
    setCycleCount(0)
  }, [])

  return { currentPhase, secondsInPhase, isActive, start, stop, cycleCount }
}
