import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth'; // Import the new hook

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

  // Password Reset View
  if (showPasswordReset) {
    return (
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        minWidth: '350px',
        maxWidth: '400px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
          Reset Password
        </h2>
        
        <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666', fontSize: '14px' }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        {error && (
          <div style={{
            background: '#fee',
            color: '#c33',
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '15px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{
            background: '#efe',
            color: '#363',
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '15px',
            fontSize: '14px'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handlePasswordReset}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e1e5e9',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="your@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading ? '#ccc' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '15px',
              transition: 'background-color 0.2s'
            }}
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
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Back to Sign In
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Main Auth View
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'white',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      minWidth: '350px',
      maxWidth: '400px'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
        {isSignUp ? 'Join the Explorers' : 'Welcome Back, Explorer'}
      </h2>
      
      {error && (
        <div style={{
          background: '#fee',
          color: '#c33',
          padding: '10px',
          borderRadius: '6px',
          marginBottom: '15px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {message && (
        <div style={{
          background: '#efe',
          color: '#363',
          padding: '10px',
          borderRadius: '6px',
          marginBottom: '15px',
          fontSize: '14px'
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleAuth}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Email:
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e1e5e9',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            placeholder="your@email.com"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Password:
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e1e5e9',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            placeholder="Create a secure password (min 6 chars)"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: loading ? '#ccc' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '15px',
            transition: 'background-color 0.2s'
          }}
        >
          {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
        </button>

        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              clearMessages();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '14px'
            }}
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
              style={{
                background: 'none',
                border: 'none',
                color: '#666',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Forgot your password?
            </button>
          </div>
        )}
      </form>
    </div>
  );
}