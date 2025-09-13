import React, { useState } from 'react';
import { COLORS } from '../constants/styles';

export default function ModeSwitcher({ currentMode, onModeChange }) {
  const [isAnimating, setIsAnimating] = useState(false);

  const modes = [
    { 
      id: 'personal', 
      label: 'My Memories', 
      icon: '💭',
      description: 'Your saved memories and moments',
      color: '#667eea'
    },
    { 
      id: 'explore', 
      label: 'Explore', 
      icon: '🌍',
      description: 'Discover experiences from others',
      color: '#f093fb'
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
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
    }}>
      {/* Main switcher container */}
      <div style={{
        display: 'flex',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        padding: '6px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background slider */}
        <div
          style={{
            position: 'absolute',
            top: '6px',
            left: currentMode === 'personal' ? '6px' : 'calc(50% + 3px)',
            width: 'calc(50% - 6px)',
            height: 'calc(100% - 12px)',
            background: `linear-gradient(135deg, ${currentModeData?.color}22 0%, ${currentModeData?.color}11 100%)`,
            borderRadius: '12px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: `1px solid ${currentModeData?.color}33`,
            zIndex: 0
          }}
        />

        {modes.map((mode, index) => {
          const isActive = currentMode === mode.id;
          
          return (
            <button
              key={mode.id}
              onClick={() => handleModeChange(mode.id)}
              disabled={isAnimating}
              style={{
                position: 'relative',
                zIndex: 1,
                padding: '12px 20px',
                border: 'none',
                borderRadius: '12px',
                cursor: isAnimating ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: isActive ? '600' : '500',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: '140px',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                color: isActive ? mode.color : COLORS.TEXT_SECONDARY,
                transform: isActive ? 'scale(1.02)' : 'scale(1)',
                opacity: isAnimating && !isActive ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!isActive && !isAnimating) {
                  e.target.style.color = mode.color;
                  e.target.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.target.style.color = COLORS.TEXT_SECONDARY;
                  e.target.style.transform = 'scale(1)';
                }
              }}
              title={mode.description}
            >
              <span 
                style={{ 
                  fontSize: '18px',
                  transition: 'transform 0.2s ease',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)'
                }}
              >
                {mode.icon}
              </span>
              <span style={{ 
                transition: 'opacity 0.2s ease',
                opacity: isAnimating && !isActive ? 0.7 : 1
              }}>
                {mode.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Subtle description text below */}
      <div style={{
        textAlign: 'center',
        marginTop: '8px',
        fontSize: '12px',
        color: COLORS.TEXT_MUTED,
        opacity: 0.8,
        transition: 'opacity 0.3s ease',
        fontWeight: '400'
      }}>
        {currentModeData?.description}
      </div>

      {/* Optional: Activity indicator */}
      {isAnimating && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: `conic-gradient(from 0deg, ${currentModeData?.color}, transparent)`,
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