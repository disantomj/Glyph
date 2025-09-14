import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  COLORS,
  BUTTON_STYLES,
  INPUT_STYLES,
  MODAL_STYLES,
  MESSAGE_STYLES,
  TEXT_STYLES,
  DESIGN_TOKENS,
  mergeStyles
} from '../constants/styles';

export default function Auth({ onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Use the auth hook instead of local state
  const {
    loading,
    error,
    message,
    signIn,
    signUp,
    resetPassword,
    clearMessages,
    validateEmail
  } = useAuth();

  const handleAuth = async (e) => {
    e.preventDefault();
    clearMessages();

    // Basic validation
    if (!validateEmail(email)) {
      return;
    }

    try {
      if (isSignUp) {
        const { data, error } = await signUp(email, password);
        
        if (!error && data) {
          setIsSignUp(false); // Switch to sign in view after successful signup
        }
      } else {
        const { data, error } = await signIn(email, password);
        
        if (!error && data?.user) {
          onAuthSuccess(data.user);
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    const { error } = await resetPassword(email);
    
    if (!error) {
      setShowPasswordReset(false);
    }
  };

  // Password Reset View - NOW WITH PROPER OVERLAY!
  if (showPasswordReset) {
    return (
      <div style={MODAL_STYLES.overlay}>
        <div style={MODAL_STYLES.small}>
          <h2 style={mergeStyles(TEXT_STYLES.h2, { 
            textAlign: 'center', 
            marginBottom: DESIGN_TOKENS.spacing[5] 
          })}>
            Reset Password
          </h2>
          
          <p style={mergeStyles(TEXT_STYLES.bodySecondary, { 
            textAlign: 'center', 
            marginBottom: DESIGN_TOKENS.spacing[5],
            fontSize: TEXT_STYLES.caption.fontSize
          })}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
          
          {/* Error Message */}
          {error && (
            <div style={mergeStyles(MESSAGE_STYLES.base, MESSAGE_STYLES.error)}>
              {error}
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div style={mergeStyles(MESSAGE_STYLES.base, MESSAGE_STYLES.success)}>
              {message}
            </div>
          )}

          <form onSubmit={handlePasswordReset}>
            <div style={{ marginBottom: DESIGN_TOKENS.spacing[5] }}>
              <label style={TEXT_STYLES.label}>
                Email:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={INPUT_STYLES.base}
                placeholder="your@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={mergeStyles(
                BUTTON_STYLES.base,
                loading ? BUTTON_STYLES.disabled : BUTTON_STYLES.primary,
                { 
                  width: '100%',
                  marginBottom: DESIGN_TOKENS.spacing[4]
                }
              )}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordReset(false);
                  clearMessages();
                }}
                style={mergeStyles(BUTTON_STYLES.ghost, {
                  background: 'none',
                  border: 'none',
                  color: COLORS.primary,
                  textDecoration: 'underline',
                  fontSize: TEXT_STYLES.caption.fontSize
                })}
              >
                Back to Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Main Auth View
  return (
    <div style={MODAL_STYLES.overlay}>
      <div style={MODAL_STYLES.small}>
        <h2 style={mergeStyles(TEXT_STYLES.h2, { 
          textAlign: 'center', 
          marginBottom: DESIGN_TOKENS.spacing[5] 
        })}>
          {isSignUp ? 'Join the Explorers' : 'Welcome Back, Explorer'}
        </h2>
        
        {/* Error Message */}
        {error && (
          <div style={mergeStyles(MESSAGE_STYLES.base, MESSAGE_STYLES.error)}>
            {error}
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div style={mergeStyles(MESSAGE_STYLES.base, MESSAGE_STYLES.success)}>
            {message}
          </div>
        )}

        <form onSubmit={handleAuth}>
          <div style={{ marginBottom: DESIGN_TOKENS.spacing[4] }}>
            <label style={TEXT_STYLES.label}>
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={INPUT_STYLES.base}
              placeholder="your@email.com"
            />
          </div>

          <div style={{ marginBottom: DESIGN_TOKENS.spacing[5] }}>
            <label style={TEXT_STYLES.label}>
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={INPUT_STYLES.base}
              placeholder="Create a secure password (min 6 chars)"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={mergeStyles(
              BUTTON_STYLES.base,
              loading ? BUTTON_STYLES.disabled : BUTTON_STYLES.primary,
              { 
                width: '100%',
                marginBottom: DESIGN_TOKENS.spacing[4]
              }
            )}
          >
            {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>

          <div style={{ 
            textAlign: 'center', 
            marginBottom: DESIGN_TOKENS.spacing[3] 
          }}>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                clearMessages();
              }}
              style={mergeStyles(BUTTON_STYLES.ghost, {
                background: 'none',
                border: 'none',
                color: COLORS.primary,
                textDecoration: 'underline',
                fontSize: TEXT_STYLES.caption.fontSize
              })}
            >
              {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </div>

          {!isSignUp && (
            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordReset(true);
                  clearMessages();
                }}
                style={mergeStyles(BUTTON_STYLES.ghost, {
                  background: 'none',
                  border: 'none',
                  color: COLORS.textMuted,
                  textDecoration: 'underline',
                  fontSize: TEXT_STYLES.caption.fontSize
                })}
              >
                Forgot your password?
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}