import { useState } from 'react';
import './BreathingExercise.css';
import { breathingPatterns } from '../data/breathingPatterns';
import { useBreathingTimer } from '../hooks/useBreathingTimer';

function BreathingExercise() {
  const [exerciseType, setExerciseType] = useState('box');
  const { currentPhase, secondsInPhase, isActive, start, stop } = useBreathingTimer(exerciseType);

  const currentExercise = breathingPatterns[exerciseType];

  const toggleExercise = () => {
    if (isActive) {
      stop();
    } else {
      start();
    }
  };

  const changeExercise = (type) => {
    stop();
    setExerciseType(type);
  };

  const getCircleScale = () => {
    const progress = secondsInPhase / currentPhase.duration;
    if (currentPhase.name === 'inhale') {
      return 1 + progress * 0.5;
    } else if (currentPhase.name === 'exhale') {
      return 1.5 - progress * 0.5;
    }
    return 1.5;
  };

  return (
    <div className="breathing-container">
      <h1>🧘 Breathing Exercises</h1>
      
      <div className="exercise-selector">
        {Object.keys(breathingPatterns).map((type) => (
          <button
            key={type}
            className={exerciseType === type ? 'active' : ''}
            onClick={() => changeExercise(type)}
          >
            {breathingPatterns[type].name}
          </button>
        ))}
      </div>

      <div className="exercise-info">
        <h2>{currentExercise.name}</h2>
        <p>{currentExercise.description}</p>
      </div>

      <div className="breathing-animation">
        <div 
          className={`breathing-circle ${currentPhase.name} ${isActive ? 'active' : ''}`}
          style={{ 
            transform: `scale(${isActive ? getCircleScale() : 1})`,
            transition: 'transform 1s ease-in-out'
          }}
        >
          <div className="breathing-text">
            <div className="instruction">{currentPhase.instruction}</div>
            <div className="countdown">
              {currentPhase.duration - secondsInPhase}
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
