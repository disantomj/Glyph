import React from 'react';
import { COLORS, BUTTON_STYLES, mergeStyles } from '../constants/styles';

export default function ModeSwitcher({ currentMode, onModeChange }) {
  const modes = [
    { 
      id: 'personal', 
      label: 'My Memories', 
      icon: '🗓️',
      description: 'View your saved memories'
    },
    { 
      id: 'explore', 
      label: 'Explore', 
      icon: '🔍',
      description: 'Discover others\' experiences'
    }
  ];

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      display: 'flex',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '12px',
      padding: '4px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      border: `1px solid ${COLORS.BORDER_LIGHT}`
    }}>
      {modes.map(mode => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          style={mergeStyles(
            {
              padding: '8px 16px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              minWidth: '120px',
              justifyContent: 'center'
            },
            currentMode === mode.id 
              ? {
                  backgroundColor: COLORS.PRIMARY,
                  color: 'white',
                  boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)'
                }
              : {
                  backgroundColor: 'transparent',
                  color: COLORS.TEXT_SECONDARY
                }
          )}
          title={mode.description}
        >
          <span style={{ fontSize: '16px' }}>{mode.icon}</span>
          <span>{mode.label}</span>
        </button>
      ))}
    </div>
  );
}