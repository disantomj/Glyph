// components/UserProfile.js
import React from 'react';
import { supabase } from '../lib/supabase';

export default function UserProfile({ user, onSignOut }) {
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      onSignOut();
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      background: 'rgba(255, 255, 255, 0.95)',
      padding: '15px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 100,
      minWidth: '200px'
    }}>
      <div style={{ marginBottom: '10px' }}>
        <div style={{ fontWeight: '600', fontSize: '16px', color: '#333' }}>
          Explorer: {user.username || user.email}
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
          🏆 Explorer XP: 0 {/* You can connect this to your ratings/score system later */}
        </div>
      </div>
      
      <button
        onClick={handleSignOut}
        style={{
          width: '100%',
          padding: '8px 12px',
          backgroundColor: '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        Sign Out
      </button>
    </div>
  );
}