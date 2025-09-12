export const COLORS = {
  PRIMARY: '#2563eb',
  PRIMARY_HOVER: '#1d4ed8',
  SUCCESS: '#28a745',
  SUCCESS_HOVER: '#218838',
  DANGER: '#dc3545',
  DANGER_HOVER: '#c82333',
  WARNING: '#ffc107',
  WARNING_HOVER: '#e0a800',
  INFO: '#007bff',
  INFO_HOVER: '#0056b3',
  SECONDARY: '#6c757d',
  SECONDARY_HOVER: '#545b62',
  
  // Text colors
  TEXT_PRIMARY: '#333',
  TEXT_SECONDARY: '#666',
  TEXT_MUTED: '#999',
  
  // Background colors
  BG_WHITE: 'white',
  BG_LIGHT: '#f8f9fa',
  BG_MUTED: '#e9ecef',
  
  // Border colors
  BORDER_LIGHT: '#e1e5e9',
  BORDER_MEDIUM: '#dee2e6',
  BORDER_DARK: '#6c757d'
};

// Common button styles
export const BUTTON_STYLES = {
  base: {
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    padding: '10px 15px',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  primary: {
    backgroundColor: COLORS.PRIMARY,
    color: 'white',
    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
  },
  
  success: {
    backgroundColor: COLORS.SUCCESS,
    color: 'white',
    boxShadow: '0 2px 8px rgba(40, 167, 69, 0.3)'
  },
  
  danger: {
    backgroundColor: COLORS.DANGER,
    color: 'white',
    boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)'
  },
  
  secondary: {
    backgroundColor: COLORS.SECONDARY,
    color: 'white'
  },
  
  disabled: {
    backgroundColor: '#ccc',
    color: 'white',
    cursor: 'not-allowed'
  }
};

// Common input styles
export const INPUT_STYLES = {
  base: {
    width: '100%',
    padding: '12px',
    border: `2px solid ${COLORS.BORDER_LIGHT}`,
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  },
  
  textarea: {
    minHeight: '100px',
    resize: 'vertical'
  }
};

// Modal styles
export const MODAL_STYLES = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  
  content: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  
  small: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    minWidth: '350px',
    maxWidth: '400px'
  }
};

// Card styles
export const CARD_STYLES = {
  base: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: `1px solid ${COLORS.BORDER_LIGHT}`
  },
  
  elevated: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    padding: '20px'
  }
};

// Error and success message styles
export const MESSAGE_STYLES = {
  error: {
    background: '#fee',
    color: '#c33',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '15px'
  },
  
  success: {
    background: '#efe',
    color: '#363',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '15px'
  },
  
  info: {
    background: '#e3f2fd',
    color: '#1565c0',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '15px'
  }
};

// Loading styles
export const LOADING_STYLES = {
  overlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '15px 20px',
    borderRadius: '8px',
    zIndex: 1000,
    textAlign: 'center',
    fontSize: '14px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  }
};

// Helper function to merge styles
export const mergeStyles = (...styles) => {
  return Object.assign({}, ...styles);
};