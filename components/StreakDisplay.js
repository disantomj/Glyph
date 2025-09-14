import React from 'react';
import { StreakService } from '../services/StreakService';
import {
  COLORS,
  CARD_STYLES,
  TEXT_STYLES,
  DESIGN_TOKENS,
  LAYOUT,
  APP_STYLES,
  mergeStyles
} from '../constants/styles';

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
      <div style={mergeStyles(CARD_STYLES.glass, {
        padding: `${DESIGN_TOKENS.spacing[2]} ${DESIGN_TOKENS.spacing[3]}`,
        minWidth: '120px',
        textAlign: 'center'
      })}>
        <div style={mergeStyles(LAYOUT.flexCenter, {
          gap: DESIGN_TOKENS.spacing[2],
          marginBottom: DESIGN_TOKENS.spacing[1]
        })}>
          <span style={{ 
            fontSize: DESIGN_TOKENS.typography.sizes.xl,
            color: hasDiscoveredToday ? COLORS.success : COLORS.warning,
            filter: hasDiscoveredToday 
              ? `drop-shadow(0 0 4px ${COLORS.success})` 
              : `drop-shadow(0 0 4px ${COLORS.warning})`,
            transition: `all ${DESIGN_TOKENS.motion.durations.normal} ease`
          }}>
            {hasDiscoveredToday ? '🔥' : '⭐'}
          </span>
          <div>
            <div style={mergeStyles(TEXT_STYLES.body, {
              fontWeight: DESIGN_TOKENS.typography.weights.semibold,
              color: current_streak > 0 ? COLORS.success : COLORS.textSecondary,
              fontSize: DESIGN_TOKENS.typography.sizes.lg
            })}>
              {current_streak}
            </div>
            <div style={mergeStyles(TEXT_STYLES.caption, {
              color: COLORS.textMuted,
              fontSize: DESIGN_TOKENS.typography.sizes.xs
            })}>
              day streak
            </div>
          </div>
        </div>
        
        {!hasDiscoveredToday && current_streak > 0 && (
          <div style={mergeStyles(TEXT_STYLES.caption, {
            color: COLORS.warning,
            fontWeight: DESIGN_TOKENS.typography.weights.medium,
            fontSize: DESIGN_TOKENS.typography.sizes.xs,
            animation: 'gentle-pulse 2s infinite'
          })}>
            Discover today!
          </div>
        )}

        <style>
          {`
            @keyframes gentle-pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.7; }
            }
          `}
        </style>
      </div>
    );
  }

  // Full version for profile/detail view
  return (
    <div style={CARD_STYLES.elevated}>
      <h3 style={mergeStyles(TEXT_STYLES.h3, {
        margin: `0 0 ${DESIGN_TOKENS.spacing[4]} 0`,
        display: 'flex',
        alignItems: 'center',
        gap: DESIGN_TOKENS.spacing[2]
      })}>
        <span style={{
          fontSize: DESIGN_TOKENS.typography.sizes.xl,
          filter: `drop-shadow(0 0 4px ${COLORS.warning})`
        }}>
          🔥
        </span>
        Exploration Streak
      </h3>

      {/* Current Streak Display */}
      <div style={mergeStyles(CARD_STYLES.base, {
        textAlign: 'center',
        marginBottom: DESIGN_TOKENS.spacing[5],
        padding: DESIGN_TOKENS.spacing[4],
        backgroundColor: current_streak > 0 ? `${COLORS.success}15` : COLORS.bgSecondary,
        border: current_streak > 0 
          ? `2px solid ${COLORS.success}30` 
          : `1px solid ${COLORS.borderLight}`,
        borderRadius: DESIGN_TOKENS.radius.lg,
        position: 'relative',
        overflow: 'hidden'
      })}>
        {/* Background decoration for active streaks */}
        {current_streak > 0 && (
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '100%',
            height: '100%',
            background: `radial-gradient(circle, ${COLORS.success}10 0%, transparent 70%)`,
            zIndex: 0
          }} />
        )}
        
        <div style={{
          position: 'relative',
          zIndex: 1
        }}>
          <div style={mergeStyles(TEXT_STYLES.h1, {
            fontSize: DESIGN_TOKENS.typography.sizes['6xl'],
            fontWeight: DESIGN_TOKENS.typography.weights.extrabold,
            color: current_streak > 0 ? COLORS.success : COLORS.textSecondary,
            margin: `0 0 ${DESIGN_TOKENS.spacing[1]} 0`,
            textShadow: current_streak > 0 ? `0 0 20px ${COLORS.success}30` : 'none'
          })}>
            {current_streak}
          </div>
          
          <div style={mergeStyles(TEXT_STYLES.caption, {
            color: COLORS.textSecondary,
            marginBottom: DESIGN_TOKENS.spacing[2],
            fontWeight: DESIGN_TOKENS.typography.weights.medium,
            textTransform: 'uppercase',
            letterSpacing: DESIGN_TOKENS.typography.letterSpacing.wide
          })}>
            Current Streak
          </div>
          
          <div style={mergeStyles(TEXT_STYLES.caption, {
            color: hasDiscoveredToday ? COLORS.success : COLORS.warning,
            fontWeight: DESIGN_TOKENS.typography.weights.medium,
            padding: `${DESIGN_TOKENS.spacing[1]} ${DESIGN_TOKENS.spacing[2]}`,
            backgroundColor: hasDiscoveredToday ? `${COLORS.success}20` : `${COLORS.warning}20`,
            borderRadius: DESIGN_TOKENS.radius.full,
            display: 'inline-block'
          })}>
            {encouragementMessage}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: DESIGN_TOKENS.spacing[4],
        marginBottom: DESIGN_TOKENS.spacing[5]
      }}>
        <div style={mergeStyles(CARD_STYLES.base, {
          textAlign: 'center',
          padding: DESIGN_TOKENS.spacing[4],
          backgroundColor: COLORS.bgSecondary
        })}>
          <div style={mergeStyles(TEXT_STYLES.h2, {
            fontWeight: DESIGN_TOKENS.typography.weights.bold,
            color: COLORS.primary,
            margin: `0 0 ${DESIGN_TOKENS.spacing[1]} 0`
          })}>
            {longest_streak}
          </div>
          <div style={mergeStyles(TEXT_STYLES.caption, {
            color: COLORS.textSecondary,
            fontWeight: DESIGN_TOKENS.typography.weights.medium
          })}>
            Longest Streak
          </div>
        </div>
        
        <div style={mergeStyles(CARD_STYLES.base, {
          textAlign: 'center',
          padding: DESIGN_TOKENS.spacing[4],
          backgroundColor: COLORS.bgSecondary
        })}>
          <div style={mergeStyles(TEXT_STYLES.h2, {
            fontWeight: DESIGN_TOKENS.typography.weights.bold,
            color: COLORS.info,
            margin: `0 0 ${DESIGN_TOKENS.spacing[1]} 0`
          })}>
            {total_discovery_days}
          </div>
          <div style={mergeStyles(TEXT_STYLES.caption, {
            color: COLORS.textSecondary,
            fontWeight: DESIGN_TOKENS.typography.weights.medium
          })}>
            Total Days
          </div>
        </div>
      </div>

      {/* Next Milestone */}
      {nextMilestone && (
        <div style={mergeStyles(CARD_STYLES.base, {
          padding: DESIGN_TOKENS.spacing[3],
          backgroundColor: COLORS.bgSecondary,
          borderRadius: DESIGN_TOKENS.radius.md,
          marginBottom: DESIGN_TOKENS.spacing[4]
        })}>
          <div style={mergeStyles(LAYOUT.flexBetween, {
            marginBottom: DESIGN_TOKENS.spacing[2]
          })}>
            <span style={mergeStyles(TEXT_STYLES.caption, {
              fontWeight: DESIGN_TOKENS.typography.weights.medium,
              color: COLORS.textPrimary
            })}>
              Next: {nextMilestone.title}
            </span>
            <span style={mergeStyles(TEXT_STYLES.caption, {
              color: COLORS.textMuted,
              fontSize: DESIGN_TOKENS.typography.sizes.xs
            })}>
              {nextMilestone.milestone - current_streak} days to go
            </span>
          </div>
          
          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: DESIGN_TOKENS.spacing[1],
            backgroundColor: COLORS.borderMedium,
            borderRadius: DESIGN_TOKENS.radius.sm,
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              width: `${Math.min((current_streak / nextMilestone.milestone) * 100, 100)}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.primaryHover})`,
              borderRadius: DESIGN_TOKENS.radius.sm,
              transition: `width ${DESIGN_TOKENS.motion.durations.slow} ${DESIGN_TOKENS.motion.easings.default}`,
              boxShadow: `0 0 8px ${COLORS.primary}40`
            }} />
          </div>
        </div>
      )}

      {/* Achievements */}
      {achievements.filter(a => a.achieved).length > 0 && (
        <div>
          <h4 style={mergeStyles(TEXT_STYLES.h3, {
            margin: `0 0 ${DESIGN_TOKENS.spacing[3]} 0`,
            color: COLORS.textSecondary,
            fontSize: DESIGN_TOKENS.typography.sizes.sm
          })}>
            Achievements Unlocked
          </h4>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: DESIGN_TOKENS.spacing[2]
          }}>
            {achievements.filter(a => a.achieved).map(achievement => (
              <div key={achievement.milestone} style={mergeStyles(CARD_STYLES.base, {
                padding: `${DESIGN_TOKENS.spacing[1]} ${DESIGN_TOKENS.spacing[2]}`,
                backgroundColor: COLORS.success,
                color: COLORS.textInverse,
                borderRadius: DESIGN_TOKENS.radius.full,
                fontSize: DESIGN_TOKENS.typography.sizes.xs,
                fontWeight: DESIGN_TOKENS.typography.weights.medium,
                boxShadow: DESIGN_TOKENS.shadows.sm,
                border: `1px solid ${COLORS.success}`
              })}>
                {achievement.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}