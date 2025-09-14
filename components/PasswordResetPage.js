import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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

export default function PasswordResetPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    // Check if this is a valid password reset session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsValidSession(true);
      } else {
        setError('Invalid or expired reset link. Please request a new password reset.');
      }
    };

    checkSession();
  }, []);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setMessage('Password updated successfully! You will be signed out and need to sign in again with your new password.');
      
      // Sign out the user and redirect after a few seconds
      setTimeout(async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
      }, 3000);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isValidSession) {
    return (
      <div style={MODAL_STYLES.overlay}>
        <div style={MODAL_STYLES.small}>
          <h2 style={mergeStyles(TEXT_STYLES.h2, {
            textAlign: 'center',
            marginBottom: DESIGN_TOKENS.spacing[5],
            color: COLORS.error
          })}>
            Reset Link Invalid
          </h2>
          
          <p style={mergeStyles(TEXT_STYLES.bodySecondary, {
            textAlign: 'center',
            marginBottom: DESIGN_TOKENS.spacing[5]
          })}>
            {error || 'This password reset link is invalid or has expired.'}
          </p>
          
          <button
            onClick={() => window.location.href = '/'}
            style={mergeStyles(
              BUTTON_STYLES.base,
              BUTTON_STYLES.primary,
              { width: '100%' }
            )}
          >
            Return to Glyph
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={MODAL_STYLES.overlay}>
      <div style={MODAL_STYLES.small}>
        <h2 style={mergeStyles(TEXT_STYLES.h2, {
          textAlign: 'center',
          marginBottom: DESIGN_TOKENS.spacing[5]
        })}>
          Set New Password
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

        <form onSubmit={handlePasswordReset}>
          <div style={{ marginBottom: DESIGN_TOKENS.spacing[4] }}>
            <label style={TEXT_STYLES.label}>
              New Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={INPUT_STYLES.base}
              placeholder="Enter new password"
            />
          </div>

          <div style={{ marginBottom: DESIGN_TOKENS.spacing[5] }}>
            <label style={TEXT_STYLES.label}>
              Confirm Password:
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              style={INPUT_STYLES.base}
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={mergeStyles(
              BUTTON_STYLES.base,
              loading ? BUTTON_STYLES.disabled : BUTTON_STYLES.success,
              { width: '100%' }
            )}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}