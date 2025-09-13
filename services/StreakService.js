import { supabase } from '../lib/supabase';

export class StreakService {
  // Get user's current streak data
  static async getUserStreak(userId) {
    try {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching streak:', error);
        throw error;
      }

      // Return default streak if none exists
      if (!data) {
        return {
          user_id: userId,
          current_streak: 0,
          longest_streak: 0,
          last_discovery_date: null,
          total_discovery_days: 0
        };
      }

      return data;
    } catch (err) {
      console.error('Error getting user streak:', err);
      return {
        user_id: userId,
        current_streak: 0,
        longest_streak: 0,
        last_discovery_date: null,
        total_discovery_days: 0
      };
    }
  }

  // Update streak when user makes a discovery
  static async updateStreakOnDiscovery(userId) {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const currentStreak = await this.getUserStreak(userId);
      
      // Check if user already discovered something today
      if (currentStreak.last_discovery_date === today) {
        return currentStreak; // No update needed
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];

      let newCurrentStreak;
      let newTotalDays = currentStreak.total_discovery_days + 1;

      // Calculate new streak
      if (currentStreak.last_discovery_date === yesterdayString) {
        // Continuing streak
        newCurrentStreak = currentStreak.current_streak + 1;
      } else if (currentStreak.last_discovery_date === null || currentStreak.current_streak === 0) {
        // Starting new streak
        newCurrentStreak = 1;
      } else {
        // Streak was broken, starting over
        newCurrentStreak = 1;
      }

      const newLongestStreak = Math.max(currentStreak.longest_streak, newCurrentStreak);

      const updatedStreak = {
        user_id: userId,
        current_streak: newCurrentStreak,
        longest_streak: newLongestStreak,
        last_discovery_date: today,
        total_discovery_days: newTotalDays,
        updated_at: new Date().toISOString()
      };

      // Upsert the streak record
      const { data, error } = await supabase
        .from('user_streaks')
        .upsert(updatedStreak)
        .select()
        .single();

      if (error) {
        console.error('Error updating streak:', error);
        throw error;
      }

      console.log('Streak updated:', data);
      return data;
    } catch (err) {
      console.error('Error updating streak:', err);
      throw err;
    }
  }

  // Check if streak needs to be reset (call this on app load)
  static async checkAndUpdateStreakStatus(userId) {
    try {
      const currentStreak = await this.getUserStreak(userId);
      
      if (!currentStreak.last_discovery_date) {
        return currentStreak; // No streak to check
      }

      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];

      // If last discovery was not yesterday or today, reset current streak
      if (currentStreak.last_discovery_date !== today && 
          currentStreak.last_discovery_date !== yesterdayString) {
        
        const resetStreak = {
          ...currentStreak,
          current_streak: 0,
          updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('user_streaks')
          .update(resetStreak)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) {
          console.error('Error resetting streak:', error);
          return currentStreak;
        }

        console.log('Streak reset due to inactivity');
        return data;
      }

      return currentStreak;
    } catch (err) {
      console.error('Error checking streak status:', err);
      return await this.getUserStreak(userId);
    }
  }

  // Get streak milestones and achievements
  static getStreakAchievements(currentStreak, longestStreak) {
    const achievements = [];
    const milestones = [3, 7, 14, 30, 60, 100, 365];

    milestones.forEach(milestone => {
      if (longestStreak >= milestone) {
        achievements.push({
          milestone,
          achieved: true,
          title: this.getMilestoneTitle(milestone),
          description: this.getMilestoneDescription(milestone)
        });
      } else if (currentStreak < milestone) {
        // Show next milestone to achieve
        achievements.push({
          milestone,
          achieved: false,
          title: this.getMilestoneTitle(milestone),
          description: this.getMilestoneDescription(milestone),
          progress: currentStreak
        });
        return; // Only show the next unachieved milestone
      }
    });

    return achievements;
  }

  // Get milestone titles
  static getMilestoneTitle(days) {
    const titles = {
      3: "Explorer",
      7: "Weekly Wanderer", 
      14: "Dedicated Discoverer",
      30: "Monthly Master",
      60: "Seasoned Seeker",
      100: "Exploration Expert",
      365: "Year-Long Legend"
    };
    return titles[days] || `${days} Day Streak`;
  }

  // Get milestone descriptions
  static getMilestoneDescription(days) {
    const descriptions = {
      3: "Discovered glyphs for 3 days in a row",
      7: "A full week of exploration",
      14: "Two weeks of consistent discovery",
      30: "A month of daily exploration",
      60: "Two months of dedication",
      100: "100 days of exploration mastery",
      365: "A full year of discovery"
    };
    return descriptions[days] || `Maintain a ${days} day discovery streak`;
  }

  // Get encouragement message based on streak status
  static getEncouragementMessage(streakData) {
    const { current_streak, last_discovery_date } = streakData;
    const today = new Date().toISOString().split('T')[0];
    
    if (last_discovery_date === today) {
      if (current_streak === 1) {
        return "Great start! Discovery streak begun.";
      } else if (current_streak < 7) {
        return `${current_streak} day streak! Keep exploring.`;
      } else if (current_streak < 30) {
        return `${current_streak} days strong! You're building a great habit.`;
      } else {
        return `Amazing ${current_streak} day streak! You're a true explorer.`;
      }
    } else {
      return "Discover a glyph today to continue your streak!";
    }
  }

  // Check if user discovered today
  static hasDiscoveredToday(streakData) {
    const today = new Date().toISOString().split('T')[0];
    return streakData.last_discovery_date === today;
  }

  // Get days until streak is at risk (returns null if already discovered today)
  static getDaysUntilStreakRisk(streakData) {
    const today = new Date().toISOString().split('T')[0];
    
    if (streakData.last_discovery_date === today) {
      return null; // Already discovered today
    }
    
    if (streakData.current_streak === 0) {
      return null; // No active streak to risk
    }

    // Streak is at risk if no discovery today
    return 0;
  }
}