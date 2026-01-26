import { useState, useEffect, useRef, useCallback } from 'react';
import { recordSession } from '../services/statsService';
import { useMilestones } from '../hooks/useMilestones';
import './PomodoroTimer.css';

function PomodoroTimer({ onMilestoneUnlocked }) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // work, shortBreak, longBreak
  const [customMinutes, setCustomMinutes] = useState(25);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef(null);
  const sessionStartRef = useRef(null);
  const initialDurationRef = useRef(25);

  const { checkMilestones, getCelebrationMessage } = useMilestones();

  const modes = {
    work: { duration: 25, label: 'Work Time' },
    shortBreak: { duration: 5, label: 'Short Break' },
    longBreak: { duration: 15, label: 'Long Break' },
  };

  const playNotificationSound = useCallback(() => {
    // Simple notification (browsers may require user interaction first)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Timer', {
        body: 'Time is up!',
      });
    }
  }, []);

  // Handle session completion and milestone checking
  const handleSessionComplete = useCallback(async () => {
    if (mode === 'work') {
      // Record the session
      const durationMinutes = initialDurationRef.current;
      const result = await recordSession({
        type: 'pomodoro',
        duration: durationMinutes,
        mode,
        completedAt: new Date().toISOString(),
      });

      setSessionsCompleted(prev => prev + 1);

      // Check for milestones
      if (result?.newMilestone) {
        const celebration = getCelebrationMessage(result.newMilestone);
        onMilestoneUnlocked?.({
          milestone: result.newMilestone,
          ...celebration,
        });
      }
    }
    
    playNotificationSound();
  }, [mode, playNotificationSound, getCelebrationMessage, onMilestoneUnlocked]);

  useEffect(() => {
    if (isActive && (minutes > 0 || seconds > 0)) {
      intervalRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsActive(false);
            handleSessionComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, minutes, seconds, handleSessionComplete]);

  const toggleTimer = () => {
    if (!isActive && mode === 'work') {
      // Starting a new session, record the start time and duration
      sessionStartRef.current = Date.now();
      initialDurationRef.current = minutes;
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(modes[mode].duration);
    setSeconds(0);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    setMinutes(modes[newMode].duration);
    setSeconds(0);
    initialDurationRef.current = modes[newMode].duration;
  };

  const setCustomTimer = () => {
    const mins = parseInt(customMinutes, 10);
    if (mins > 0 && mins <= 120) {
      setMinutes(mins);
      setSeconds(0);
      setIsActive(false);
      initialDurationRef.current = mins;
    }
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  return (
    <div className="pomodoro-container">
      <h1>🍅 Pomodoro Timer</h1>
      
      {sessionsCompleted > 0 && (
        <div className="session-counter">
          <span className="session-count">{sessionsCompleted}</span>
          <span className="session-label">session{sessionsCompleted !== 1 ? 's' : ''} today</span>
        </div>
      )}
      
      <div className="mode-selector">
        <button 
          className={mode === 'work' ? 'active' : ''} 
          onClick={() => switchMode('work')}
        >
          Work
        </button>
        <button 
          className={mode === 'shortBreak' ? 'active' : ''} 
          onClick={() => switchMode('shortBreak')}
        >
          Short Break
        </button>
        <button 
          className={mode === 'longBreak' ? 'active' : ''} 
          onClick={() => switchMode('longBreak')}
        >
          Long Break
        </button>
      </div>

      <div className="timer-display">
        <div className="time">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div className="mode-label">{modes[mode].label}</div>
      </div>

      <div className="timer-controls">
        <button className="control-btn start" onClick={toggleTimer}>
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button className="control-btn reset" onClick={resetTimer}>
          Reset
        </button>
      </div>

      <div className="custom-timer">
        <h3>Set Custom Timer</h3>
        <input 
          type="number" 
          min="1" 
          max="120" 
          value={customMinutes}
          onChange={(e) => setCustomMinutes(e.target.value)}
        />
        <button onClick={setCustomTimer}>Set</button>
      </div>

      <button className="notification-btn" onClick={requestNotificationPermission}>
        Enable Notifications
      </button>
    </div>
  );
}

export default PomodoroTimer;
