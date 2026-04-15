import { useState, useEffect, useCallback } from 'react'

export function useExerciseTimer({ targetType, targetValue }) {
  const [count, setCount] = useState(targetValue)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    if (!isRunning || count <= 0) return

    if (targetType === 'duration') {
      const interval = setInterval(() => {
        setCount((prev) => Math.max(prev - 1, 0))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isRunning, count, targetType])

  const start = useCallback(() => {
    setIsRunning(true)
  }, [])

  const pause = useCallback(() => {
    setIsRunning(false)
  }, [])

  const reset = useCallback(() => {
    setIsRunning(false)
    setCount(targetValue)
  }, [targetValue])

  const decrement = useCallback(() => {
    setCount((prev) => Math.max(prev - 1, 0))
  }, [])

  return { count, isRunning, start, pause, reset, decrement }
}
