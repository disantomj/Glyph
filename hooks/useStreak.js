import { useState, useEffect, useCallback } from 'react';
import { StreakService } from '../services/StreakService';

export const useStreak = (user) => {
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasDiscoveredToday, setHasDiscoveredToday] = useState(false);

  // Load initial streak data
  const loadStreakData = useCallback(async () => {
    if (!user) {
      setStreakData(null);
      return;
    }

    try {
      setLoading(true);
      
      // Check and update streak status first (in case it needs to be reset)
      const currentStreak = await StreakService.checkAndUpdateStreakStatus(user.id);
      setStreakData(currentStreak);
      setHasDiscoveredToday(StreakService.hasDiscoveredToday(currentStreak));
      
    } catch (error) {
      console.error('Error loading streak data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Record a discovery and update streak
  const recordDiscovery = useCallback(async () => {
    if (!user || !streakData) return;

    try {
      const updatedStreak = await StreakService.updateStreakOnDiscovery(user.id);
      setStreakData(updatedStreak);
      setHasDiscoveredToday(true);
      
      // Return info about streak changes for potential celebrations
      const streakIncreased = updatedStreak.current_streak > (streakData.current_streak || 0);
      const newRecord = updatedStreak.longest_streak > streakData.longest_streak;
      
      return {
        streakIncreased,
        newRecord,
        currentStreak: updatedStreak.current_streak,
        isNewStreak: updatedStreak.current_streak === 1 && streakData.current_streak === 0
      };
    } catch (error) {
      console.error('Error recording discovery:', error);
      return null;
    }
  }, [user, streakData]);

  // Get encouragement message
  const getEncouragementMessage = useCallback(() => {
    if (!streakData) return '';
    return StreakService.getEncouragementMessage(streakData);
  }, [streakData]);

  // Check if streak is at risk
  const isStreakAtRisk = useCallback(() => {
    if (!streakData) return false;
    return StreakService.getDaysUntilStreakRisk(streakData) === 0;
  }, [streakData]);

  // Get achievements
  const getAchievements = useCallback(() => {
    if (!streakData) return [];
    return StreakService.getStreakAchievements(
      streakData.current_streak, 
      streakData.longest_streak
    );
  }, [streakData]);

  // Load streak data when user changes
  useEffect(() => {
    loadStreakData();
  }, [loadStreakData]);

  // Refresh streak status daily (check when component mounts)
  useEffect(() => {
    if (user && streakData) {
      // Check if we need to refresh streak status
      const checkDaily = async () => {
        const refreshedStreak = await StreakService.checkAndUpdateStreakStatus(user.id);
        if (refreshedStreak.current_streak !== streakData.current_streak) {
          setStreakData(refreshedStreak);
          setHasDiscoveredToday(StreakService.hasDiscoveredToday(refreshedStreak));
        }
      };
      
      checkDaily();
    }
  }, [user]); // Only on user change, not streakData change to avoid loops

  return {
    streakData,
    loading,
    hasDiscoveredToday,
    
    // Actions
    recordDiscovery,
    refreshStreak: loadStreakData,
    
    // Utilities
    getEncouragementMessage,
    isStreakAtRisk,
    getAchievements,
    
    // Computed values
    currentStreak: streakData?.current_streak || 0,
    longestStreak: streakData?.longest_streak || 0,
    totalDays: streakData?.total_discovery_days || 0
  };
};