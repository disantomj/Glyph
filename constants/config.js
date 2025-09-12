export const MAP_CONFIG = {
  DEFAULT_CENTER: [-74.0060, 40.7128], // NYC coordinates
  DEFAULT_ZOOM: 10,
  USER_LOCATION_ZOOM: 16,
  ANIMATION_DURATION: 1500,
  STYLE_URL: 'mapbox://styles/mapbox/streets-v11'
};

// Location settings
export const LOCATION_CONFIG = {
  MAX_GPS_ACCURACY: 10, // meters
  DISCOVERY_RADIUS: 50, // meters
  GLYPH_SEARCH_RADIUS: 200, // meters
  LOCATION_OPTIONS: {
    enableHighAccuracy: true,
    timeout: 30000,
    maximumAge: 0
  }
};

// File upload limits
export const FILE_LIMITS = {
  MAX_SIZE_MB: 5,
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
};

// Text limits
export const TEXT_LIMITS = {
  GLYPH_MESSAGE_MAX: 280,
  COMMENT_MAX: 500,
  USERNAME_MAX: 50,
  PASSWORD_MIN: 6
};

// Rating system
export const RATING_CONFIG = {
  MIN_RATING: 1,
  MAX_RATING: 5,
  HIGH_RATING_THRESHOLD: 4.0,
  MIN_RATINGS_FOR_HIGHLIGHT: 3
};

// UI settings
export const UI_CONFIG = {
  Z_INDEX: {
    MAP: 0,
    CONTROLS: 1000,
    MODALS: 2000,
    ERRORS: 3000
  },
  TRANSITIONS: {
    FAST: '0.2s',
    NORMAL: '0.3s',
    SLOW: '0.5s'
  },
  SHADOWS: {
    LIGHT: '0 2px 8px rgba(0,0,0,0.1)',
    MEDIUM: '0 4px 12px rgba(0,0,0,0.15)',
    HEAVY: '0 8px 32px rgba(0,0,0,0.2)'
  }
};

// Error messages
export const ERROR_MESSAGES = {
  LOCATION_DENIED: 'Location access denied by user',
  LOCATION_UNAVAILABLE: 'Location information unavailable',
  LOCATION_TIMEOUT: 'Location request timed out',
  LOCATION_UNKNOWN: 'An unknown location error occurred',
  GPS_ACCURACY_LOW: 'GPS accuracy is too low. Please move to an open area and try again.',
  LOCATION_NOT_AVAILABLE: 'Location not available. Please enable location services and try again.',
  FILE_TOO_LARGE: 'File size must be less than 5MB',
  INVALID_FILE_TYPE: 'Please select an image file',
  GLYPH_LOAD_FAILED: 'Failed to load nearby glyphs. Please try again.',
  AUTH_REQUIRED: 'Please sign in to perform this action'
};

// Success messages
export const SUCCESS_MESSAGES = {
  GLYPH_CREATED: 'Glyph created! Other explorers can now discover it.',
  ACCOUNT_CREATED: 'Account created successfully! You can now sign in.',
  PASSWORD_RESET_SENT: 'Check your email for a password reset link!',
  PASSWORD_UPDATED: 'Password updated successfully! You will be signed out and need to sign in again with your new password.',
  COMMENT_ADDED: 'Comment added successfully',
  RATING_SUBMITTED: 'Rating submitted successfully'
};

// Default values
export const DEFAULTS = {
  USERNAME: 'Explorer',
  GLYPH_CATEGORY: 'Hint',
  MAP_MARKER_SIZE: '24px',
  USER_MARKER_SIZE: '24px'
};