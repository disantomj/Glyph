import React from 'react';
import { StreakService } from '../services/StreakService';
import { COLORS, CARD_STYLES, mergeStyles } from '../constants/styles';

export default function StreakDisplay({ streakData, compact = false }) {
  if (!streakData) return null;

  const { current_streak, longest_streak, total_discovery_days } = streakData;
  const hasDiscoveredToday = StreakService.hasDiscoveredToday(streakData);
  const encouragementMessage = StreakService.getEncouragementMessage(streakData);
  const achievements = StreakService.getStreakAchievements(current_streak, longest_streak);
  const nextMilestone = achievements.find(a => !a.achieved);

  // Compact version for the map overlay
  if (compact) {
    return (
      <div style={mergeStyles(CARD_STYLES.base, {
        padding: '10px 12px',
        minWidth: '120px',
        textAlign: 'center'
      })}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '5px'
        }}>
          <span style={{ 
            fontSize: '20px',
            color: hasDiscoveredToday ? COLORS.SUCCESS : COLORS.WARNING
          }}>
            {hasDiscoveredToday ? '🔥' : '⭐'}
          </span>
          <div>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '600',
              color: current_streak > 0 ? COLORS.SUCCESS : COLORS.TEXT_SECONDARY
            }}>
              {current_streak}
            </div>
            <div style={{ fontSize: '10px', color: COLORS.TEXT_MUTED }}>
              day streak
            </div>
          </div>
        </div>
        
        {!hasDiscoveredToday && current_streak > 0 && (
          <div style={{
            fontSize: '9px',
            color: COLORS.WARNING,
            fontWeight: '500'
          }}>
            Discover today!
          </div>
        )}
      </div>
    );
  }

  // Full version for profile/detail view
  return (
    <div style={mergeStyles(CARD_STYLES.elevated)}>
      <h3 style={{ 
        margin: '0 0 15px 0', 
        fontSize: '18px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        🔥 Exploration Streak
      </h3>

      {/* Current Streak Display */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: current_streak > 0 ? 'rgba(34, 197, 94, 0.1)' : COLORS.BG_LIGHT,
        borderRadius: '12px',
        border: current_streak > 0 ? `2px solid ${COLORS.SUCCESS}` : `1px solid ${COLORS.BORDER_LIGHT}`
      }}>
        <div style={{
          fontSize: '36px',
          fontWeight: 'bold',
          color: current_streak > 0 ? COLORS.SUCCESS : COLORS.TEXT_SECONDARY,
          marginBottom: '5px'
        }}>
          {current_streak}
        </div>
        <div style={{ 
          fontSize: '14px', 
          color: COLORS.TEXT_SECONDARY,
          marginBottom: '8px'
        }}>
          Current Streak
        </div>
        <div style={{
          fontSize: '12px',
          color: hasDiscoveredToday ? COLORS.SUCCESS : COLORS.WARNING,
          fontWeight: '500'
        }}>
          {encouragementMessage}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '20px', 
            fontWeight: '600',
            color: COLORS.PRIMARY
          }}>
            {longest_streak}
          </div>
          <div style={{ fontSize: '12px', color: COLORS.TEXT_SECONDARY }}>
            Longest Streak
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '20px', 
            fontWeight: '600',
            color: COLORS.INFO
          }}>
            {total_discovery_days}
          </div>
          <div style={{ fontSize: '12px', color: COLORS.TEXT_SECONDARY }}>
            Total Days
          </div>
        </div>
      </div>

      {/* Next Milestone */}
      {nextMilestone && (
        <div style={{
          padding: '12px',
          backgroundColor: COLORS.BG_LIGHT,
          borderRadius: '8px',
          marginBottom: '15px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              Next: {nextMilestone.title}
            </span>
            <span style={{ fontSize: '12px', color: COLORS.TEXT_MUTED }}>
              {nextMilestone.milestone - current_streak} days to go
            </span>
          </div>
          
          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: COLORS.BG_MUTED,
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(current_streak / nextMilestone.milestone) * 100}%`,
              height: '100%',
              backgroundColor: COLORS.PRIMARY,
              borderRadius: '3px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}

      {/* Achievements */}
      {achievements.filter(a => a.achieved).length > 0 && (
        <div>
          <h4 style={{ 
            margin: '0 0 10px 0', 
            fontSize: '14px',
            color: COLORS.TEXT_SECONDARY
          }}>
            Achievements Unlocked
          </h4>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {achievements.filter(a => a.achieved).map(achievement => (
              <div key={achievement.milestone} style={{
                padding: '6px 10px',
                backgroundColor: COLORS.SUCCESS,
                color: 'white',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '500'
              }}>
                {achievement.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}