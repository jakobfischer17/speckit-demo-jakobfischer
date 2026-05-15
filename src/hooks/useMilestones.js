import { useState, useEffect, useCallback } from 'react';
import {
  getAchievements,
  getPendingAchievements,
  markAchievementDisplayed,
} from '../services/db.js';
import { MILESTONES, subscribeToBroadcast } from '../services/statsService.js';

/**
 * Hook for tracking pomodoro milestones and celebration state.
 * 
 * @returns {Object} Milestones state and actions
 */
export function useMilestones() {
  const [milestones, setMilestones] = useState([]);
  const [pendingCelebration, setPendingCelebration] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load achievements on mount
  const loadAchievements = useCallback(async () => {
    try {
      setIsLoading(true);
      const achievements = await getAchievements();
      
      // Build milestones array with achievement status
      const milestonesWithStatus = MILESTONES.map(threshold => {
        const achievement = achievements.find(a => a.type === `${threshold}-pomodoros`);
        return {
          type: `${threshold}-pomodoros`,
          threshold,
          reached: !!achievement,
          celebrated: achievement?.displayed ?? false,
          unlockedAt: achievement?.unlockedAt ?? null,
        };
      });
      
      setMilestones(milestonesWithStatus);
      
      // Check for pending celebrations
      const pending = await getPendingAchievements();
      if (pending.length > 0) {
        // Get the first uncelebrated achievement
        const firstPending = pending[0];
        const milestoneData = milestonesWithStatus.find(
          m => m.type === firstPending.type
        );
        setPendingCelebration({
          ...firstPending,
          threshold: milestoneData?.threshold,
        });
      }
    } catch (err) {
      console.error('Failed to load milestones:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  // Subscribe to broadcast for cross-tab sync
  useEffect(() => {
    const unsubscribe = subscribeToBroadcast((event) => {
      const { type, achievement } = event.data;
      
      if (type === 'ACHIEVEMENT_UNLOCKED' && achievement) {
        // New achievement unlocked - set as pending celebration
        const threshold = parseInt(achievement.type.split('-')[0], 10);
        setPendingCelebration({
          ...achievement,
          threshold,
        });
        
        // Update milestones list
        setMilestones(prev => prev.map(m => 
          m.type === achievement.type
            ? { ...m, reached: true, celebrated: false }
            : m
        ));
      }
    });

    return unsubscribe;
  }, []);

  // Check if a new milestone was reached
  const checkMilestones = useCallback((totalPomodoros, newAchievement) => {
    if (newAchievement) {
      const threshold = parseInt(newAchievement.type.split('-')[0], 10);
      setPendingCelebration({
        ...newAchievement,
        threshold,
      });
      
      setMilestones(prev => prev.map(m => 
        m.type === newAchievement.type
          ? { ...m, reached: true, celebrated: false }
          : m
      ));
    }
  }, []);

  // Mark celebration as complete
  const markCelebrated = useCallback(async (type) => {
    try {
      await markAchievementDisplayed(type);
      
      // Update local state
      setPendingCelebration(null);
      setMilestones(prev => prev.map(m => 
        m.type === type
          ? { ...m, celebrated: true }
          : m
      ));
    } catch (err) {
      console.error('Failed to mark achievement as celebrated:', err);
    }
  }, []);

  // Clear pending celebration without persisting
  const dismissCelebration = useCallback(() => {
    if (pendingCelebration) {
      markCelebrated(pendingCelebration.type);
    }
  }, [pendingCelebration, markCelebrated]);

  // Get celebration message for a milestone
  const getCelebrationMessage = useCallback((threshold) => {
    const messages = {
      10: { title: '🎉 10 Pomodoros!', subtitle: 'Great start! You\'re building a habit.' },
      25: { title: '🔥 25 Pomodoros!', subtitle: 'Quarter century of focus! Keep going!' },
      50: { title: '⭐ 50 Pomodoros!', subtitle: 'Halfway to mastery! You\'re on fire!' },
      100: { title: '👑 Grand Master!', subtitle: '100 Pomodoros! You\'re a productivity legend!' },
    };
    return messages[threshold] || { title: '🎉 Milestone!', subtitle: 'Congratulations!' };
  }, []);

  return {
    milestones,
    pendingCelebration,
    isLoading,
    
    checkMilestones,
    markCelebrated,
    dismissCelebration,
    getCelebrationMessage,
  };
}

export default useMilestones;
