import { useState, useEffect, useRef, useCallback } from 'react';
import { recordSession } from '../services/statsService';
import { useMilestones } from '../hooks/useMilestones';
import './PomodoroTimer.css';

function PomodoroTimer({ onMilestoneUnlocked, preferences }) {
  const durations = {
    work: preferences?.workDuration ?? 25,
    shortBreak: preferences?.shortBreak ?? 5,
    longBreak: preferences?.longBreak ?? 15,
  };

  const [minutes, setMinutes] = useState(durations.work);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // work, shortBreak, longBreak
  const [customMinutes, setCustomMinutes] = useState(durations.work);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [breakActionLog, setBreakActionLog] = useState({ skipped: 0, snoozed: 0 });
  const intervalRef = useRef(null);
  const sessionStartRef = useRef(null);
  const initialDurationRef = useRef(durations.work);

  const { getCelebrationMessage } = useMilestones();

  const modes = {
    work: { duration: durations.work, label: 'Work Time' },
    shortBreak: { duration: durations.shortBreak, label: 'Short Break' },
    longBreak: { duration: durations.longBreak, label: 'Long Break' },
  };

  const isBreak = mode === 'shortBreak' || mode === 'longBreak';

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

  // Skip the current break and jump straight back to a work session.
  const skipBreak = () => {
    setBreakActionLog((prev) => ({ ...prev, skipped: prev.skipped + 1 }));
    switchMode('work');
  };

  // Add 5 minutes to the current break without disrupting the countdown.
  const snoozeBreak = () => {
    setBreakActionLog((prev) => ({ ...prev, snoozed: prev.snoozed + 1 }));
    setMinutes((prev) => Math.min(prev + 5, 120));
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

      {isBreak && (
        <div className="break-actions">
          <button
            className="control-btn break-skip"
            onClick={skipBreak}
            aria-label="Skip break and start a work session"
          >
            ⏭️ Skip break
          </button>
          <button
            className="control-btn break-snooze"
            onClick={snoozeBreak}
            aria-label="Snooze break for 5 more minutes"
          >
            😴 Snooze 5 min
          </button>
        </div>
      )}

      {(breakActionLog.skipped > 0 || breakActionLog.snoozed > 0) && (
        <p className="break-action-log" aria-live="polite">
          Breaks skipped: {breakActionLog.skipped} · snoozed: {breakActionLog.snoozed}
        </p>
      )}

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
