import { useEffect, useMemo, useState } from 'react';
import './BreathingExercise.css';

const EXERCISES = {
  box: {
    name: 'Box Breathing',
    description: 'Trace a steady square: inhale across the top, hold down the side, exhale across the bottom, hold back up.',
    visual: 'box',
    phases: [
      { name: 'inhale', duration: 4, instruction: 'Breathe In' },
      { name: 'hold', duration: 4, instruction: 'Hold' },
      { name: 'exhale', duration: 4, instruction: 'Breathe Out' },
      { name: 'hold', duration: 4, instruction: 'Hold' },
    ],
  },
  relax: {
    name: '4-7-8 Breathing',
    description: 'Follow a slow vertical glide: rise with the inhale, stay lifted through the hold, then release on a long exhale.',
    visual: 'relax',
    phases: [
      { name: 'inhale', duration: 4, instruction: 'Breathe In' },
      { name: 'hold', duration: 7, instruction: 'Hold' },
      { name: 'exhale', duration: 8, instruction: 'Breathe Out' },
    ],
  },
  energize: {
    name: 'Energizing Breath',
    description: 'Use quick, rhythmic breaths to drive the bars up and down and wake up your nervous system.',
    visual: 'energize',
    phases: [
      { name: 'inhale', duration: 2, instruction: 'Breathe In' },
      { name: 'exhale', duration: 2, instruction: 'Breathe Out' },
    ],
  },
};

function getProgress(seconds, duration) {
  if (!duration) {
    return 0;
  }

  return Math.min(seconds / duration, 1);
}

function getBoxDotPosition(phaseIndex, progress) {
  const clampedProgress = Math.max(0, Math.min(progress, 1));

  switch (phaseIndex % 4) {
    case 0:
      return { x: clampedProgress * 100, y: 0 };
    case 1:
      return { x: 100, y: clampedProgress * 100 };
    case 2:
      return { x: 100 - clampedProgress * 100, y: 100 };
    default:
      return { x: 0, y: 100 - clampedProgress * 100 };
  }
}

function getRelaxMarkerPosition(phase, progress) {
  if (phase === 'inhale') {
    return 100 - progress * 100;
  }

  if (phase === 'hold') {
    return 0;
  }

  return progress * 100;
}

function getEnergizeBarHeights(phase, progress) {
  const baseHeight = phase === 'inhale'
    ? 28 + progress * 54
    : 82 - progress * 54;

  return [0.58, 0.78, 1, 0.78, 0.58].map((multiplier) => `${Math.max(16, baseHeight * multiplier)}%`);
}

function BreathingExercise() {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [exerciseType, setExerciseType] = useState('box');
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);

  const currentExercise = EXERCISES[exerciseType];
  const currentPhaseData = currentExercise.phases[currentPhaseIndex];
  const phase = currentPhaseData.name;
  const progress = getProgress(seconds, currentPhaseData.duration);
  const secondsRemaining = currentPhaseData.duration - seconds;

  const boxDot = useMemo(
    () => getBoxDotPosition(currentPhaseIndex, progress),
    [currentPhaseIndex, progress]
  );
  const relaxMarker = useMemo(
    () => getRelaxMarkerPosition(phase, progress),
    [phase, progress]
  );
  const energizeBars = useMemo(
    () => getEnergizeBarHeights(phase, progress),
    [phase, progress]
  );

  useEffect(() => {
    let interval;

    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds >= currentPhaseData.duration - 1) {
            setCurrentPhaseIndex((prevIndex) => (prevIndex + 1) % currentExercise.phases.length);
            return 0;
          }

          return prevSeconds + 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, currentExercise.phases.length, currentPhaseData.duration]);

  const toggleExercise = () => {
    if (!isActive) {
      setCurrentPhaseIndex(0);
      setSeconds(0);
    }

    setIsActive((prev) => !prev);
  };

  const changeExercise = (type) => {
    setExerciseType(type);
    setIsActive(false);
    setCurrentPhaseIndex(0);
    setSeconds(0);
  };

  const renderVisual = () => {
    if (currentExercise.visual === 'box') {
      return (
        <div className="breathing-stage breathing-stage--box" data-testid="box-breathing-visual">
          <div className="breathing-box">
            <div className="breathing-box__outline" aria-hidden="true" />
            <div
              className={`breathing-box__dot ${isActive ? 'breathing-box__dot--active' : ''}`}
              data-testid="box-breathing-dot"
              style={{
                left: `calc(${boxDot.x}% - 0.65rem)`,
                top: `calc(${boxDot.y}% - 0.65rem)`,
              }}
            />
            <div className="breathing-stage__content">
              <div className="instruction" data-testid="breathing-instruction">{currentPhaseData.instruction}</div>
              <div className="countdown" data-testid="breathing-countdown">{secondsRemaining}</div>
            </div>
          </div>
        </div>
      );
    }

    if (currentExercise.visual === 'relax') {
      return (
        <div className="breathing-stage breathing-stage--relax" data-testid="relax-breathing-visual">
          <div className="breathing-column">
            <div className="breathing-column__rail" aria-hidden="true" />
            <div
              className={`breathing-column__marker ${isActive ? 'breathing-column__marker--active' : ''}`}
              style={{ top: `calc(${relaxMarker}% - 0.8rem)` }}
            />
            <div className="breathing-stage__content breathing-stage__content--overlay">
              <div className="instruction" data-testid="breathing-instruction">{currentPhaseData.instruction}</div>
              <div className="countdown" data-testid="breathing-countdown">{secondsRemaining}</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="breathing-stage breathing-stage--energize" data-testid="energizing-breath-visual">
        <div className="breathing-bars" aria-hidden="true">
          {energizeBars.map((height, index) => (
            <span
              key={`${exerciseType}-${index}`}
              className={`breathing-bars__bar ${isActive ? 'breathing-bars__bar--active' : ''}`}
              style={{ height }}
            />
          ))}
        </div>
        <div className="breathing-stage__content breathing-stage__content--stacked">
          <div className="instruction" data-testid="breathing-instruction">{currentPhaseData.instruction}</div>
          <div className="countdown" data-testid="breathing-countdown">{secondsRemaining}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="breathing-container">
      <h1>🧘 Breathing Exercises</h1>

      <div className="exercise-selector">
        {Object.keys(EXERCISES).map((type) => (
          <button
            key={type}
            type="button"
            className={exerciseType === type ? 'active' : ''}
            onClick={() => changeExercise(type)}
            aria-pressed={exerciseType === type}
          >
            {EXERCISES[type].name}
          </button>
        ))}
      </div>

      <div className="exercise-info">
        <h2>{currentExercise.name}</h2>
        <p>{currentExercise.description}</p>
      </div>

      <div className="breathing-animation">
        {renderVisual()}
      </div>

      <div className="breathing-phase-list" aria-label="Breathing cycle phases">
        {currentExercise.phases.map((phaseItem, index) => (
          <div
            key={`${phaseItem.name}-${index}`}
            className={`breathing-phase-list__item ${index === currentPhaseIndex ? 'breathing-phase-list__item--active' : ''}`}
          >
            <span className="breathing-phase-list__name">{phaseItem.instruction}</span>
            <span className="breathing-phase-list__duration">{phaseItem.duration}s</span>
          </div>
        ))}
      </div>

      <div className="breathing-controls">
        <button type="button" className="control-btn" onClick={toggleExercise}>
          {isActive ? 'Pause' : 'Start'}
        </button>
      </div>

      <div className="breathing-guide">
        <h3>How to Practice</h3>
        <ol>
          <li>Find a comfortable seated position</li>
          <li>Close your eyes or soften your gaze</li>
          <li>Follow the visual guide and instructions</li>
          <li>Breathe naturally through your nose</li>
          <li>Practice for 2-5 minutes daily</li>
        </ol>
      </div>
    </div>
  );
}

export default BreathingExercise;
