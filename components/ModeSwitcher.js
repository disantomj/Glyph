import React, { useState } from 'react';
import {
  COLORS,
  DESIGN_TOKENS,
  TEXT_STYLES,
  CARD_STYLES,
  APP_STYLES,
  mergeStyles
} from '../constants/styles';

export default function ModeSwitcher({ currentMode, onModeChange }) {
  const [isAnimating, setIsAnimating] = useState(false);

  const modes = [
    { 
      id: 'personal', 
      label: 'My Memories', 
      icon: '💭',
      description: 'Your saved memories and moments',
      gradient: DESIGN_TOKENS.palette.accent.purple.gradient
    },
    { 
      id: 'explore', 
      label: 'Explore', 
      icon: '🌍',
      description: 'Discover experiences from others',
      gradient: DESIGN_TOKENS.palette.accent.pink.gradient
    }
  ];

  const handleModeChange = async (newMode) => {
    if (newMode === currentMode || isAnimating) return;
    
    setIsAnimating(true);
    
    // Add a subtle delay for the animation effect
    setTimeout(() => {
      onModeChange(newMode);
      setIsAnimating(false);
    }, 150);
  };

  const currentModeData = modes.find(m => m.id === currentMode);

  return (
    <div style={{
      position: 'absolute',
      top: DESIGN_TOKENS.spacing[5],
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: DESIGN_TOKENS.zIndex.overlay,
    }}>
      {/* Main switcher container */}
      <div style={mergeStyles(CARD_STYLES.glass, {
        display: 'flex',
        padding: DESIGN_TOKENS.spacing[1],
        position: 'relative',
        overflow: 'hidden'
      })}>
        {/* Animated background slider */}
        <div
          style={{
            position: 'absolute',
            top: DESIGN_TOKENS.spacing[1],
            left: currentMode === 'personal' ? DESIGN_TOKENS.spacing[1] : 'calc(50% + 3px)',
            width: 'calc(50% - 6px)',
            height: `calc(100% - ${DESIGN_TOKENS.spacing[3]})`,
            background: currentModeData?.gradient,
            borderRadius: DESIGN_TOKENS.radius.lg,
            transition: `all ${DESIGN_TOKENS.motion.durations.normal} ${DESIGN_TOKENS.motion.easings.default}`,
            border: `1px solid ${COLORS.primary}33`,
            zIndex: 0,
            boxShadow: DESIGN_TOKENS.shadows.md
          }}
        />

        {modes.map((mode) => {
          const isActive = currentMode === mode.id;
          
          return (
            <button
              key={mode.id}
              onClick={() => handleModeChange(mode.id)}
              disabled={isAnimating}
              style={{
                position: 'relative',
                zIndex: 1,
                padding: `${DESIGN_TOKENS.spacing[3]} ${DESIGN_TOKENS.spacing[5]}`,
                border: 'none',
                borderRadius: DESIGN_TOKENS.radius.lg,
                cursor: isAnimating ? 'not-allowed' : 'pointer',
                fontSize: DESIGN_TOKENS.typography.sizes.sm,
                fontWeight: isActive ? DESIGN_TOKENS.typography.weights.semibold : DESIGN_TOKENS.typography.weights.medium,
                transition: `all ${DESIGN_TOKENS.motion.durations.normal} ${DESIGN_TOKENS.motion.easings.default}`,
                display: 'flex',
                alignItems: 'center',
                gap: DESIGN_TOKENS.spacing[2],
                minWidth: '140px',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                color: isActive ? COLORS.textInverse : COLORS.textSecondary,
                transform: isActive ? 'scale(1.02)' : 'scale(1)',
                opacity: isAnimating && !isActive ? 0.5 : 1,
                fontFamily: DESIGN_TOKENS.typography.fonts.primary
              }}
              onMouseEnter={(e) => {
                if (!isActive && !isAnimating) {
                  e.target.style.color = COLORS.primary;
                  e.target.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.target.style.color = COLORS.textSecondary;
                  e.target.style.transform = 'scale(1)';
                }
              }}
              title={mode.description}
            >
              <span 
                style={{ 
                  fontSize: DESIGN_TOKENS.typography.sizes.lg,
                  transition: `transform ${DESIGN_TOKENS.motion.durations.fast} ease`,
                  transform: isActive ? 'scale(1.1)' : 'scale(1)'
                }}
              >
                {mode.icon}
              </span>
              <span style={{ 
                transition: `opacity ${DESIGN_TOKENS.motion.durations.fast} ease`,
                opacity: isAnimating && !isActive ? 0.7 : 1
              }}>
                {mode.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Subtle description text below */}
      <div style={mergeStyles(TEXT_STYLES.caption, {
        textAlign: 'center',
        marginTop: DESIGN_TOKENS.spacing[2],
        opacity: 0.8,
        transition: `opacity ${DESIGN_TOKENS.motion.durations.normal} ease`,
        fontWeight: DESIGN_TOKENS.typography.weights.normal
      })}>
        {currentModeData?.description}
      </div>

      {/* Activity indicator */}
      {isAnimating && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: DESIGN_TOKENS.spacing[5],
          height: DESIGN_TOKENS.spacing[5],
          borderRadius: DESIGN_TOKENS.radius.full,
          background: `conic-gradient(from 0deg, ${COLORS.primary}, transparent)`,
          animation: 'spin 1s linear infinite',
          zIndex: 10
        }}>
          <style>
            {`
              @keyframes spin {
                from { transform: translate(-50%, -50%) rotate(0deg); }
                to { transform: translate(-50%, -50%) rotate(360deg); }
              }
            `}
          </style>
        </div>
      )}
    </div>
  );
}