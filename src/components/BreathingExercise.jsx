import { useState, useEffect } from 'react';
import './BreathingExercise.css';

function BreathingExercise() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('inhale'); // inhale, hold, exhale
  const [seconds, setSeconds] = useState(0);
  const [exerciseType, setExerciseType] = useState('box'); // box, relax, energize

  const exercises = {
    box: {
      name: 'Box Breathing',
      description: 'Equal time for inhale, hold, exhale, and hold. Great for focus and calm.',
      phases: [
        { name: 'inhale', duration: 4, instruction: 'Breathe In' },
        { name: 'hold', duration: 4, instruction: 'Hold' },
        { name: 'exhale', duration: 4, instruction: 'Breathe Out' },
        { name: 'hold', duration: 4, instruction: 'Hold' }
      ]
    },
    relax: {
      name: '4-7-8 Breathing',
      description: 'Inhale for 4, hold for 7, exhale for 8. Promotes relaxation and sleep.',
      phases: [
        { name: 'inhale', duration: 4, instruction: 'Breathe In' },
        { name: 'hold', duration: 7, instruction: 'Hold' },
        { name: 'exhale', duration: 8, instruction: 'Breathe Out' }
      ]
    },
    energize: {
      name: 'Energizing Breath',
      description: 'Quick inhale and exhale cycles to boost energy.',
      phases: [
        { name: 'inhale', duration: 2, instruction: 'Breathe In' },
        { name: 'exhale', duration: 2, instruction: 'Breathe Out' }
      ]
    }
  };

  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const currentExercise = exercises[exerciseType];
  const currentPhaseData = currentExercise.phases[currentPhaseIndex];

  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds >= currentPhaseData.duration - 1) {
            // Move to next phase
            const nextIndex = (currentPhaseIndex + 1) % currentExercise.phases.length;
            setCurrentPhaseIndex(nextIndex);
            setPhase(currentExercise.phases[nextIndex].name);
            return 0;
          }
          return prevSeconds + 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, currentPhaseData, currentPhaseIndex, currentExercise]);

  const toggleExercise = () => {
    if (!isActive) {
      setCurrentPhaseIndex(0);
      setSeconds(0);
      setPhase(currentExercise.phases[0].name);
    }
    setIsActive(!isActive);
  };

  const changeExercise = (type) => {
    setExerciseType(type);
    setIsActive(false);
    setCurrentPhaseIndex(0);
    setSeconds(0);
    setPhase(exercises[type].phases[0].name);
  };

  const getCircleScale = () => {
    const progress = seconds / currentPhaseData.duration;
    if (phase === 'inhale') {
      return 1 + progress * 0.5; // Grow from 1 to 1.5
    } else if (phase === 'exhale') {
      return 1.5 - progress * 0.5; // Shrink from 1.5 to 1
    }
    return 1.5; // Hold at maximum size
  };

  return (
    <div className="breathing-container">
      <h1>🧘 Breathing Exercises</h1>
      
      <div className="exercise-selector">
        {Object.keys(exercises).map((type) => (
          <button
            key={type}
            className={exerciseType === type ? 'active' : ''}
            onClick={() => changeExercise(type)}
          >
            {exercises[type].name}
          </button>
        ))}
      </div>

      <div className="exercise-info">
        <h2>{currentExercise.name}</h2>
        <p>{currentExercise.description}</p>
      </div>

      <div className="breathing-animation">
        <div 
          className={`breathing-circle ${phase} ${isActive ? 'active' : ''}`}
          style={{ 
            transform: `scale(${isActive ? getCircleScale() : 1})`,
            transition: 'transform 1s ease-in-out'
          }}
        >
          <div className="breathing-text">
            <div className="instruction">{currentPhaseData.instruction}</div>
            <div className="countdown">
              {currentPhaseData.duration - seconds}
            </div>
          </div>
        </div>
      </div>

      <div className="breathing-controls">
        <button className="control-btn" onClick={toggleExercise}>
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
