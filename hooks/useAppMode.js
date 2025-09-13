import { useState, useCallback } from 'react';

export const useAppMode = (defaultMode = 'personal') => {
  const [currentMode, setCurrentMode] = useState(defaultMode);

  const switchMode = useCallback((mode) => {
    setCurrentMode(mode);
    console.log('App mode switched to:', mode);
  }, []);

  const isPersonalMode = currentMode === 'personal';
  const isExploreMode = currentMode === 'explore';

  return {
    currentMode,
    switchMode,
    isPersonalMode,
    isExploreMode
  };
};