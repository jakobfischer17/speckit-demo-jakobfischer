import { useState, useEffect, useCallback } from 'react';
import {
  getCurrentStats,
  recordSession,
  getDailyFocusHistory,
  subscribeToBroadcast,
  formatFocusTime,
} from '../services/statsService.js';

/**
 * Hook for managing focus statistics state with IndexedDB persistence.
 * Handles loading, recording sessions, and multi-tab synchronization.
 * 
 * @returns {Object} Stats state and actions
 */
export function useStats() {
  const [stats, setStats] = useState(null);
  const [dailyHistory, setDailyHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial stats
  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [currentStats, history] = await Promise.all([
        getCurrentStats(),
        getDailyFocusHistory(7),
      ]);
      
      setStats(currentStats);
      setDailyHistory(history);
    } catch (err) {
      console.error('Failed to load stats:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Subscribe to broadcast messages for multi-tab sync
  useEffect(() => {
    const unsubscribe = subscribeToBroadcast((event) => {
      const { type, stats: newStats } = event.data;
      
      if (type === 'STATS_UPDATED' && newStats) {
        setStats(newStats);
        // Refresh daily history as well
        getDailyFocusHistory(7).then(setDailyHistory).catch(console.error);
      }
      
      if (type === 'SESSION_ADDED') {
        // Refresh stats when session added from another tab
        loadStats();
      }
    });

    return unsubscribe;
  }, [loadStats]);

  // Record a completed session
  const handleRecordSession = useCallback(async (sessionData) => {
    try {
      setError(null);
      const result = await recordSession(sessionData);
      
      if (result.stats) {
        setStats(result.stats);
        // Refresh daily history
        const history = await getDailyFocusHistory(7);
        setDailyHistory(history);
      }
      
      return result;
    } catch (err) {
      console.error('Failed to record session:', err);
      setError(err);
      throw err;
    }
  }, []);

  // Refresh stats manually
  const refreshStats = useCallback(async () => {
    await loadStats();
  }, [loadStats]);

  // Computed values
  const formattedTotalTime = stats ? formatFocusTime(stats.totalFocusTime) : '0m';
  const todayFocusTime = stats?.dailyHistory?.[new Date().toISOString().split('T')[0]] || 0;
  const formattedTodayTime = formatFocusTime(todayFocusTime);

  return {
    // State
    stats,
    dailyHistory,
    isLoading,
    error,
    
    // Computed
    formattedTotalTime,
    todayFocusTime,
    formattedTodayTime,
    
    // Actions
    recordSession: handleRecordSession,
    refreshStats,
  };
}

export default useStats;
