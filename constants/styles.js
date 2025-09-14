// ========================================
// GLYPH DESIGN SYSTEM
// ========================================
// Single source of truth for all visual design
// Change themes, colors, and UI here only

// ========================================
// 1. DESIGN TOKENS (Foundation)
// ========================================

// Color Palette - Change these to completely transform the app
const PALETTE = {
  // Primary Brand Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Main primary
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },
  
  // Secondary Colors
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',  // Main secondary
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  },
  
  // Accent Colors
  accent: {
    purple: {
      500: '#8b5cf6',
      600: '#7c3aed',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    pink: {
      500: '#ec4899',
      600: '#db2777',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    }
  },
  
  // Semantic Colors
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    500: '#10b981',
    600: '#059669',
    700: '#047857'
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309'
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c'
  },
  
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8'
  },
  
  // Neutral Grays
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  },
  
  // Pure Colors
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent'
};

// Typography Scale
const TYPOGRAPHY = {
  // Font Families
  fonts: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace'
  },
  
  // Font Weights
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800'
  },
  
  // Font Sizes (rem equivalent)
  sizes: {
    xs: '12px',    // 0.75rem
    sm: '14px',    // 0.875rem
    base: '16px',  // 1rem
    lg: '18px',    // 1.125rem
    xl: '20px',    // 1.25rem
    '2xl': '24px', // 1.5rem
    '3xl': '30px', // 1.875rem
    '4xl': '36px', // 2.25rem
    '5xl': '48px', // 3rem
    '6xl': '60px'  // 3.75rem
  },
  
  // Line Heights
  lineHeights: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75'
  },
  
  // Letter Spacing
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em'
  }
};

// Spacing Scale (consistent spacing throughout app)
const SPACING = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px'
};

// Border Radius Scale
const RADIUS = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px'
};

// Shadow Definitions
const SHADOWS = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  glow: '0 0 20px rgba(59, 130, 246, 0.3)',
  glowPurple: '0 0 20px rgba(139, 92, 246, 0.3)'
};

// Z-Index Scale
const Z_INDEX = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  overlay: 1000,
  modal: 2000,
  popover: 3000,
  tooltip: 4000
};

// Transition/Animation Settings
const MOTION = {
  durations: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms'
  },
  
  easings: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

// ========================================
// 2. THEME CONFIGURATION
// ========================================

// Current Active Theme
const CURRENT_THEME = {
  // Base Colors (map to palette)
  primary: PALETTE.primary[600],
  primaryHover: PALETTE.primary[700],
  primaryLight: PALETTE.primary[100],
  
  secondary: PALETTE.secondary[500],
  secondaryHover: PALETTE.secondary[600],
  secondaryLight: PALETTE.secondary[100],
  
  // Semantic Colors
  success: PALETTE.success[500],
  successHover: PALETTE.success[600],
  successLight: PALETTE.success[100],
  
  warning: PALETTE.warning[500],
  warningHover: PALETTE.warning[600],
  warningLight: PALETTE.warning[100],
  
  error: PALETTE.error[500],
  errorHover: PALETTE.error[600],
  errorLight: PALETTE.error[100],
  
  info: PALETTE.info[500],
  infoHover: PALETTE.info[600],
  infoLight: PALETTE.info[100],
  
  // Text Colors
  textPrimary: PALETTE.gray[900],
  textSecondary: PALETTE.gray[600],
  textMuted: PALETTE.gray[500],
  textLight: PALETTE.gray[400],
  textInverse: PALETTE.white,
  
  // Background Colors
  bgPrimary: PALETTE.white,
  bgSecondary: PALETTE.gray[50],
  bgMuted: PALETTE.gray[100],
  bgOverlay: 'rgba(0, 0, 0, 0.5)',
  bgOverlayLight: 'rgba(255, 255, 255, 0.95)',
  
  // Border Colors
  borderLight: PALETTE.gray[200],
  borderMedium: PALETTE.gray[300],
  borderDark: PALETTE.gray[400],
  
  // Interactive States
  hover: 'rgba(0, 0, 0, 0.05)',
  focus: PALETTE.primary[500],
  disabled: PALETTE.gray[300],
  
  // App-specific colors
  mapAccent: PALETTE.accent.purple[500],
  glyphGlow: 'rgba(255, 193, 7, 0.8)',
  userLocationGlow: 'rgba(0, 0, 255, 0.7)'
};

// ========================================
// 3. COMPONENT STYLE GENERATORS
// ========================================

// Button Variants
const createButtonVariant = (bg, hover, text = CURRENT_THEME.textInverse) => ({
  backgroundColor: bg,
  color: text,
  border: 'none',
  borderRadius: RADIUS.md,
  cursor: 'pointer',
  fontSize: TYPOGRAPHY.sizes.sm,
  fontWeight: TYPOGRAPHY.weights.medium,
  padding: `${SPACING[3]} ${SPACING[4]}`,
  transition: `all ${MOTION.durations.fast} ${MOTION.easings.default}`,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  userSelect: 'none',
  
  ':hover': {
    backgroundColor: hover,
    transform: 'translateY(-1px)',
    boxShadow: SHADOWS.md
  },
  
  ':active': {
    transform: 'translateY(0)'
  },
  
  ':focus': {
    outline: 'none',
    boxShadow: `0 0 0 3px ${bg}33`
  }
});

// Input Variants
const createInputVariant = (border = CURRENT_THEME.borderLight, focus = CURRENT_THEME.focus) => ({
  width: '100%',
  padding: SPACING[3],
  border: `2px solid ${border}`,
  borderRadius: RADIUS.md,
  fontSize: TYPOGRAPHY.sizes.base,
  fontFamily: TYPOGRAPHY.fonts.primary,
  backgroundColor: CURRENT_THEME.bgPrimary,
  color: CURRENT_THEME.textPrimary,
  transition: `border-color ${MOTION.durations.fast} ${MOTION.easings.default}`,
  
  ':focus': {
    outline: 'none',
    borderColor: focus,
    boxShadow: `0 0 0 3px ${focus}33`
  },
  
  '::placeholder': {
    color: CURRENT_THEME.textMuted
  }
});

// Card Variants
const createCardVariant = (shadow = SHADOWS.md, bg = CURRENT_THEME.bgPrimary) => ({
  backgroundColor: bg,
  borderRadius: RADIUS.lg,
  boxShadow: shadow,
  border: `1px solid ${CURRENT_THEME.borderLight}`,
  overflow: 'hidden',
  transition: `all ${MOTION.durations.normal} ${MOTION.easings.default}`
});

// ========================================
// 4. EXPORTED STYLE OBJECTS
// ========================================

// Core Design Tokens (for direct access)
export const DESIGN_TOKENS = {
  palette: PALETTE,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  radius: RADIUS,
  shadows: SHADOWS,
  zIndex: Z_INDEX,
  motion: MOTION
};

// Theme Colors (semantic naming)
export const COLORS = CURRENT_THEME;

// Component Style Presets
export const BUTTON_STYLES = {
  // Base button style
  base: {
    border: 'none',
    borderRadius: RADIUS.md,
    cursor: 'pointer',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    padding: `${SPACING[3]} ${SPACING[4]}`,
    transition: `all ${MOTION.durations.fast} ${MOTION.easings.default}`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    userSelect: 'none'
  },
  
  // Variants
  primary: createButtonVariant(CURRENT_THEME.primary, CURRENT_THEME.primaryHover),
  secondary: createButtonVariant(CURRENT_THEME.secondary, CURRENT_THEME.secondaryHover),
  success: createButtonVariant(CURRENT_THEME.success, CURRENT_THEME.successHover),
  warning: createButtonVariant(CURRENT_THEME.warning, CURRENT_THEME.warningHover),
  error: createButtonVariant(CURRENT_THEME.error, CURRENT_THEME.errorHover),
  info: createButtonVariant(CURRENT_THEME.info, CURRENT_THEME.infoHover),
  
  // State variants
  disabled: {
    backgroundColor: CURRENT_THEME.disabled,
    color: CURRENT_THEME.textMuted,
    cursor: 'not-allowed',
    opacity: 0.6
  },
  
  // Size variants
  small: {
    padding: `${SPACING[2]} ${SPACING[3]}`,
    fontSize: TYPOGRAPHY.sizes.xs
  },
  
  large: {
    padding: `${SPACING[4]} ${SPACING[6]}`,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold
  },
  
  // Special variants
  ghost: {
    backgroundColor: 'transparent',
    color: CURRENT_THEME.primary,
    border: `1px solid ${CURRENT_THEME.primary}`,
    
    ':hover': {
      backgroundColor: CURRENT_THEME.primaryLight,
      borderColor: CURRENT_THEME.primaryHover
    }
  }
};

export const INPUT_STYLES = {
  base: createInputVariant(),
  error: createInputVariant(CURRENT_THEME.error, CURRENT_THEME.error),
  success: createInputVariant(CURRENT_THEME.success, CURRENT_THEME.success),
  
  textarea: {
    minHeight: '100px',
    resize: 'vertical',
    fontFamily: TYPOGRAPHY.fonts.primary
  },
  
  select: {
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 0.5rem center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '1.5em 1.5em',
    paddingRight: SPACING[8]
  }
};

export const CARD_STYLES = {
  base: createCardVariant(SHADOWS.sm),
  elevated: createCardVariant(SHADOWS.lg),
  interactive: {
    ...createCardVariant(SHADOWS.md),
    cursor: 'pointer',
    transition: `all ${MOTION.durations.normal} ${MOTION.easings.default}`,
    
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: SHADOWS.xl
    }
  },
  
  glass: {
    backgroundColor: CURRENT_THEME.bgOverlayLight,
    borderRadius: RADIUS.xl,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: `1px solid ${CURRENT_THEME.borderLight}`,
    boxShadow: SHADOWS.lg
  }
};

export const MODAL_STYLES = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: CURRENT_THEME.bgOverlay,
    zIndex: Z_INDEX.modal,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING[5]
  },
  
  content: {
    backgroundColor: CURRENT_THEME.bgPrimary,
    borderRadius: RADIUS.xl,
    boxShadow: SHADOWS['2xl'],
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  
  small: {
    backgroundColor: CURRENT_THEME.bgPrimary,
    padding: SPACING[8],
    borderRadius: RADIUS.lg,
    boxShadow: SHADOWS.xl,
    minWidth: '350px',
    maxWidth: '400px'
  }
};

export const MESSAGE_STYLES = {
  base: {
    padding: SPACING[3],
    borderRadius: RADIUS.md,
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING[4],
    border: '1px solid transparent'
  },
  
  error: {
    backgroundColor: CURRENT_THEME.errorLight,
    color: CURRENT_THEME.error,
    borderColor: CURRENT_THEME.error
  },
  
  success: {
    backgroundColor: CURRENT_THEME.successLight,
    color: CURRENT_THEME.success,
    borderColor: CURRENT_THEME.success
  },
  
  info: {
    backgroundColor: CURRENT_THEME.infoLight,
    color: CURRENT_THEME.info,
    borderColor: CURRENT_THEME.info
  },
  
  warning: {
    backgroundColor: CURRENT_THEME.warningLight,
    color: CURRENT_THEME.warning,
    borderColor: CURRENT_THEME.warning
  }
};

// Typography Styles
export const TEXT_STYLES = {
  // Headings
  h1: {
    fontSize: TYPOGRAPHY.sizes['5xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    lineHeight: TYPOGRAPHY.lineHeights.tight,
    color: CURRENT_THEME.textPrimary,
    margin: `0 0 ${SPACING[6]} 0`
  },
  
  h2: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.semibold,
    lineHeight: TYPOGRAPHY.lineHeights.tight,
    color: CURRENT_THEME.textPrimary,
    margin: `0 0 ${SPACING[4]} 0`
  },
  
  h3: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.semibold,
    lineHeight: TYPOGRAPHY.lineHeights.tight,
    color: CURRENT_THEME.textPrimary,
    margin: `0 0 ${SPACING[3]} 0`
  },
  
  // Body text
  body: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.normal,
    lineHeight: TYPOGRAPHY.lineHeights.normal,
    color: CURRENT_THEME.textPrimary
  },
  
  bodySecondary: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.normal,
    lineHeight: TYPOGRAPHY.lineHeights.normal,
    color: CURRENT_THEME.textSecondary
  },
  
  // Small text
  caption: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.normal,
    lineHeight: TYPOGRAPHY.lineHeights.normal,
    color: CURRENT_THEME.textMuted
  },
  
  // Labels
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    lineHeight: TYPOGRAPHY.lineHeights.normal,
    color: CURRENT_THEME.textPrimary,
    display: 'block',
    marginBottom: SPACING[2]
  }
};

// Layout Utilities
export const LAYOUT = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: `0 ${SPACING[4]}`
  },
  
  grid: {
    display: 'grid',
    gap: SPACING[4]
  },
  
  flex: {
    display: 'flex',
    alignItems: 'center'
  },
  
  flexColumn: {
    display: 'flex',
    flexDirection: 'column'
  },
  
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  flexBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }
};

// App-Specific Styles
export const APP_STYLES = {
  // Map styles
  map: {
    userMarker: {
      fontSize: '24px',
      filter: `drop-shadow(0 0 3px ${CURRENT_THEME.userLocationGlow})`
    },
    
    glyphMarker: {
      fontSize: '24px',
      cursor: 'pointer',
      filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.3))',
      transition: `all ${MOTION.durations.fast} ${MOTION.easings.default}`
    },
    
    glyphMarkerHighlighted: {
      filter: `drop-shadow(0 0 6px ${CURRENT_THEME.glyphGlow})`
    }
  },
  
  // Streak display
  streak: {
    active: {
      color: CURRENT_THEME.success,
      fontWeight: TYPOGRAPHY.weights.semibold
    },
    
    inactive: {
      color: CURRENT_THEME.textMuted
    }
  },
  
  // Mode switcher gradients
  modeSwitcher: {
    personal: {
      background: PALETTE.accent.purple.gradient,
      color: CURRENT_THEME.textInverse
    },
    
    explore: {
      background: PALETTE.accent.pink.gradient,
      color: CURRENT_THEME.textInverse
    }
  }
};

// ========================================
// 5. UTILITY FUNCTIONS
// ========================================

// Merge multiple style objects
export const mergeStyles = (...styles) => {
  return Object.assign({}, ...styles);
};

// Create responsive breakpoint styles
export const responsive = {
  mobile: '@media (max-width: 768px)',
  tablet: '@media (max-width: 1024px)',
  desktop: '@media (min-width: 1025px)'
};

// Generate component variants
export const createVariant = (base, overrides) => {
  return mergeStyles(base, overrides);
};

// Opacity utilities
export const withOpacity = (color, opacity) => {
  if (color.startsWith('rgba')) return color;
  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
  }
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

// ========================================
// 6. THEME VARIANTS (for easy switching)
// ========================================

// Alternative theme configurations
export const THEME_VARIANTS = {
  // Dark theme
  dark: {
    ...CURRENT_THEME,
    primary: PALETTE.primary[400],
    textPrimary: PALETTE.gray[100],
    textSecondary: PALETTE.gray[300],
    textMuted: PALETTE.gray[400],
    bgPrimary: PALETTE.gray[900],
    bgSecondary: PALETTE.gray[800],
    bgMuted: PALETTE.gray[700],
    borderLight: PALETTE.gray[700],
    borderMedium: PALETTE.gray[600]
  },
  
  // High contrast theme
  highContrast: {
    ...CURRENT_THEME,
    primary: '#000000',
    textPrimary: '#000000',
    bgPrimary: '#ffffff',
    borderLight: '#000000'
  },
  
  // Nature theme
  nature: {
    ...CURRENT_THEME,
    primary: '#059669',
    success: '#10b981',
    mapAccent: '#047857'
  }
};

// Export current theme configuration
export default {
  DESIGN_TOKENS,
  COLORS,
  BUTTON_STYLES,
  INPUT_STYLES,
  CARD_STYLES,
  MODAL_STYLES,
  MESSAGE_STYLES,
  TEXT_STYLES,
  LAYOUT,
  APP_STYLES,
  mergeStyles,
  responsive,
  createVariant,
  withOpacity,
  THEME_VARIANTS
};