import { useState, useEffect, useRef, useCallback } from 'react';
import { recordSession, recordBreakReminderAction } from '../services/statsService';
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
  const [showBreakReminder, setShowBreakReminder] = useState(false);
  const [reminderStatus, setReminderStatus] = useState('');
  const intervalRef = useRef(null);
  const minutesRef = useRef(durations.work);
  const secondsRef = useRef(0);
  const snoozeTimeoutRef = useRef(null);
  const sessionStartRef = useRef(null);
  const initialDurationRef = useRef(durations.work);

  const { getCelebrationMessage } = useMilestones();

  const modes = {
    work: { duration: durations.work, label: 'Work Time' },
    shortBreak: { duration: durations.shortBreak, label: 'Short Break' },
    longBreak: { duration: durations.longBreak, label: 'Long Break' },
  };

  const playNotificationSound = useCallback(() => {
    // Simple notification (browsers may require user interaction first)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Timer', {
        body: 'Time is up!',
      });
    }
  }, []);

  const clearSnoozeReminder = useCallback(() => {
    if (snoozeTimeoutRef.current) {
      clearTimeout(snoozeTimeoutRef.current);
      snoozeTimeoutRef.current = null;
    }
  }, []);

  // Handle session completion and milestone checking
  const handleSessionComplete = useCallback(async () => {
    let shouldShowReminder = false;

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
      shouldShowReminder = true;

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
    if (shouldShowReminder) {
      clearSnoozeReminder();
      setReminderStatus('');
      setShowBreakReminder(true);
    }
  }, [mode, playNotificationSound, getCelebrationMessage, onMilestoneUnlocked, clearSnoozeReminder]);

  useEffect(() => {
    return () => clearSnoozeReminder();
  }, [clearSnoozeReminder]);

  useEffect(() => {
    minutesRef.current = minutes;
    secondsRef.current = seconds;
  }, [minutes, seconds]);

  useEffect(() => {
    if (!isActive) {
      clearInterval(intervalRef.current);
      return () => clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      const currentMinutes = minutesRef.current;
      const currentSeconds = secondsRef.current;

      if (currentMinutes === 0 && currentSeconds === 0) {
        clearInterval(intervalRef.current);
        setIsActive(false);
        handleSessionComplete();
        return;
      }

      if (currentSeconds === 0) {
        minutesRef.current = currentMinutes - 1;
        secondsRef.current = 59;
        setMinutes(currentMinutes - 1);
        setSeconds(59);
        return;
      }

      secondsRef.current = currentSeconds - 1;
      setSeconds(currentSeconds - 1);
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isActive, handleSessionComplete]);

  const toggleTimer = () => {
    if (!isActive && mode === 'work') {
      // Starting a new session, record the start time and duration
      sessionStartRef.current = Date.now();
      initialDurationRef.current = minutes;
    }
    if (!isActive) {
      clearSnoozeReminder();
      setShowBreakReminder(false);
      setReminderStatus('');
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    clearSnoozeReminder();
    setIsActive(false);
    setShowBreakReminder(false);
    setReminderStatus('');
    setMinutes(modes[mode].duration);
    setSeconds(0);
  };

  const switchMode = (newMode) => {
    clearSnoozeReminder();
    setMode(newMode);
    setIsActive(false);
    setShowBreakReminder(false);
    setReminderStatus('');
    setMinutes(modes[newMode].duration);
    setSeconds(0);
    initialDurationRef.current = modes[newMode].duration;
  };

  const setCustomTimer = () => {
    const mins = parseInt(customMinutes, 10);
    if (mins > 0 && mins <= 120) {
      clearSnoozeReminder();
      setMinutes(mins);
      setSeconds(0);
      setIsActive(false);
      setShowBreakReminder(false);
      setReminderStatus('');
      initialDurationRef.current = mins;
    }
  };

  const handleSkipBreak = () => {
    clearSnoozeReminder();
    setShowBreakReminder(false);
    setReminderStatus('');
    setMode('work');
    setIsActive(false);
    setMinutes(modes.work.duration);
    setSeconds(0);
    initialDurationRef.current = modes.work.duration;

    recordBreakReminderAction({
      action: 'skip',
      mode: 'work',
    }).catch((err) => {
      console.error('Failed to record break reminder action:', err);
    });
  };

  const handleSnoozeBreak = () => {
    clearSnoozeReminder();
    setShowBreakReminder(false);
    setReminderStatus('Break reminder snoozed for 5 minutes');

    recordBreakReminderAction({
      action: 'snooze',
      mode: 'work',
    }).catch((err) => {
      console.error('Failed to record break reminder action:', err);
    });

    snoozeTimeoutRef.current = setTimeout(() => {
      setReminderStatus('');
      setShowBreakReminder(true);
      snoozeTimeoutRef.current = null;
    }, 5 * 60 * 1000);
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  return (
    <div className="pomodoro-container">
      <h1>≡ƒìà Pomodoro Timer</h1>
      
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

      {showBreakReminder && (
        <div className="break-reminder" role="alert">
          <p className="break-reminder__title">Work session complete. Ready for a break?</p>
          <div className="break-reminder__actions">
            <button className="control-btn skip-break" onClick={handleSkipBreak}>
              Skip break
            </button>
            <button className="control-btn snooze-break" onClick={handleSnoozeBreak}>
              Snooze 5 min
            </button>
          </div>
        </div>
      )}

      {!showBreakReminder && reminderStatus && (
        <p className="break-reminder__status" role="status">
          {reminderStatus}
        </p>
      )}

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
