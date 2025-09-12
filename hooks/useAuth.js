import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Clear error and message
  const clearMessages = useCallback(() => {
    setError('');
    setMessage('');
  }, []);

  // Sign in with email and password
  const signIn = useCallback(async (email, password) => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      console.log('Sign in successful:', data.user.email);
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign up with email and password
  const signUp = useCallback(async (email, password) => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      setMessage('Account created successfully! You can now sign in.');
      console.log('Sign up successful:', data.user?.email || 'User created');
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out current user
  const signOut = useCallback(async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) throw signOutError;

      console.log('Sign out successful');
      return { error: null };
    } catch (err) {
      setError(err.message);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset password for email
  const resetPassword = useCallback(async (email) => {
    if (!email) {
      setError('Please enter your email address');
      return { error: new Error('Email is required') };
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;

      setMessage('Check your email for a password reset link!');
      console.log('Password reset email sent to:', email);
      return { error: null };
    } catch (err) {
      setError(err.message);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user password (for password reset flow)
  const updatePassword = useCallback(async (newPassword) => {
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return { error: new Error('Invalid password') };
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      setMessage('Password updated successfully! You will be signed out and need to sign in again with your new password.');
      console.log('Password updated successfully');
      
      // Sign out after successful password update
      setTimeout(async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
      }, 3000);

      return { error: null };
    } catch (err) {
      setError(err.message);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get current session
  const getCurrentSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        return { session: null, error };
      }

      return { session, error: null };
    } catch (err) {
      console.error('Unexpected error getting session:', err);
      return { session: null, error: err };
    }
  }, []);

  // Validate email format
  const validateEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Validate password strength
  const validatePassword = useCallback((password) => {
    return {
      isValid: password.length >= 6,
      minLength: password.length >= 6,
      // Add more validation rules as needed
    };
  }, []);

  return {
    // State
    loading,
    error,
    message,
    
    // Actions
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    getCurrentSession,
    clearMessages,
    
    // Utilities
    validateEmail,
    validatePassword
  };
};