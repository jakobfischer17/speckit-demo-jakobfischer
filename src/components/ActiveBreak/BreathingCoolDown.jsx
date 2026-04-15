import { useEffect } from 'react'
import { useBreathingTimer } from '../../hooks/useBreathingTimer'
import './BreathingCoolDown.css'

function BreathingCoolDown({ patternKey, onComplete, onSkip }) {
  const { currentPhase, secondsInPhase, isActive, start, cycleCount } = useBreathingTimer(patternKey)

  useEffect(() => {
    start()
  }, [start])

  useEffect(() => {
    if (cycleCount >= 1) {
      onComplete()
    }
  }, [cycleCount, onComplete])

  const getCircleScale = () => {
    if (!isActive) return 1
    const progress = secondsInPhase / currentPhase.duration
    if (currentPhase.name === 'inhale') {
      return 1 + progress * 0.5
    } else if (currentPhase.name === 'exhale') {
      return 1.5 - progress * 0.5
    }
    return 1.5
  }

  return (
    <div className="breathing-cooldown">
      <h2>Cool Down</h2>
      <p className="breathing-cooldown__subtitle">Take a moment to catch your breath</p>

      <div className="breathing-cooldown__animation">
        <div
          className={`breathing-cooldown__circle ${currentPhase.name}`}
          style={{
            width: 'var(--cooldown-circle-size)',
            height: 'var(--cooldown-circle-size)',
            transform: `scale(${getCircleScale()})`,
            transition: 'transform 1s ease-in-out',
          }}
        >
          <div className="breathing-cooldown__text">
            <div className="breathing-cooldown__instruction">{currentPhase.instruction}</div>
            <div className="breathing-cooldown__countdown" role="status">
              {currentPhase.duration - secondsInPhase}
            </div>
          </div>
        </div>
      </div>

      <button
        className="breathing-cooldown__skip"
        onClick={onSkip}
        aria-label="Skip cool-down"
      >
        Skip Cool-Down
      </button>
    </div>
  )
}

export default BreathingCoolDown
