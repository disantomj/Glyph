import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import UserProfilePage from './UserProfilePage';
import {
  COLORS,
  BUTTON_STYLES,
  CARD_STYLES,
  TEXT_STYLES,
  DESIGN_TOKENS,
  LAYOUT,
  mergeStyles
} from '../constants/styles';

export default function UserProfile({ user, userProfile, onSignOut }) {
  const [showProfilePage, setShowProfilePage] = useState(false);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      onSignOut();
    }
  };

  return (
    <>
      <div style={mergeStyles(CARD_STYLES.glass, {
        position: 'absolute',
        top: DESIGN_TOKENS.spacing[5],
        right: DESIGN_TOKENS.spacing[5],
        padding: DESIGN_TOKENS.spacing[4],
        zIndex: DESIGN_TOKENS.zIndex.dropdown,
        minWidth: '200px',
        maxWidth: '280px'
      })}>
        {/* User Info Section */}
        <div style={{ marginBottom: DESIGN_TOKENS.spacing[3] }}>
          <div style={mergeStyles(TEXT_STYLES.body, {
            fontWeight: DESIGN_TOKENS.typography.weights.semibold,
            marginBottom: DESIGN_TOKENS.spacing[1],
            display: 'flex',
            alignItems: 'center',
            gap: DESIGN_TOKENS.spacing[2]
          })}>
            <span style={{ 
              fontSize: DESIGN_TOKENS.typography.sizes.lg,
              filter: `drop-shadow(0 0 4px ${COLORS.primary})`
            }}>
              🧭
            </span>
            Explorer: {userProfile?.username || user.email}
          </div>
          
          <div style={mergeStyles(TEXT_STYLES.caption, {
            color: COLORS.textMuted,
            display: 'flex',
            alignItems: 'center',
            gap: DESIGN_TOKENS.spacing[1]
          })}>
            <span style={{ 
              fontSize: DESIGN_TOKENS.typography.sizes.sm,
              filter: `drop-shadow(0 0 2px ${COLORS.warning})`
            }}>
              🏆
            </span>
            Explorer Level: Discoverer
          </div>
        </div>
        
        {/* Action Buttons */}
        <div style={mergeStyles(LAYOUT.flexColumn, { gap: DESIGN_TOKENS.spacing[2] })}>
          <button
            onClick={() => setShowProfilePage(true)}
            style={mergeStyles(
              BUTTON_STYLES.base,
              BUTTON_STYLES.primary,
              {
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: DESIGN_TOKENS.spacing[2]
              }
            )}
          >
            <span style={{ fontSize: DESIGN_TOKENS.typography.sizes.sm }}>📊</span>
            View Profile
          </button>
          
          <button
            onClick={handleSignOut}
            style={mergeStyles(
              BUTTON_STYLES.base,
              BUTTON_STYLES.secondary,
              {
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: DESIGN_TOKENS.spacing[2],
                transition: `all ${DESIGN_TOKENS.motion.durations.fast} ease`
              }
            )}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = COLORS.error;
              e.target.style.borderColor = COLORS.error;
              e.target.style.color = COLORS.textInverse;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = COLORS.secondary;
              e.target.style.borderColor = 'transparent';
              e.target.style.color = COLORS.textInverse;
            }}
          >
            <span style={{ fontSize: DESIGN_TOKENS.typography.sizes.sm }}>🚪</span>
            Sign Out
          </button>
        </div>

        {/* Quick Stats Preview */}
        <div style={mergeStyles(CARD_STYLES.base, {
          marginTop: DESIGN_TOKENS.spacing[3],
          padding: DESIGN_TOKENS.spacing[3],
          backgroundColor: COLORS.bgSecondary,
          borderRadius: DESIGN_TOKENS.radius.md
        })}>
          <div style={mergeStyles(TEXT_STYLES.caption, {
            color: COLORS.textMuted,
            marginBottom: DESIGN_TOKENS.spacing[2],
            textAlign: 'center',
            fontWeight: DESIGN_TOKENS.typography.weights.medium,
            textTransform: 'uppercase',
            letterSpacing: DESIGN_TOKENS.typography.letterSpacing.wide
          })}>
            Quick Stats
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: DESIGN_TOKENS.spacing[2],
            textAlign: 'center'
          }}>
            <div>
              <div style={mergeStyles(TEXT_STYLES.body, {
                fontWeight: DESIGN_TOKENS.typography.weights.bold,
                color: COLORS.primary,
                fontSize: DESIGN_TOKENS.typography.sizes.lg
              })}>
                —
              </div>
              <div style={mergeStyles(TEXT_STYLES.caption, {
                color: COLORS.textMuted,
                fontSize: DESIGN_TOKENS.typography.sizes.xs
              })}>
                Discoveries
              </div>
            </div>
            
            <div>
              <div style={mergeStyles(TEXT_STYLES.body, {
                fontWeight: DESIGN_TOKENS.typography.weights.bold,
                color: COLORS.success,
                fontSize: DESIGN_TOKENS.typography.sizes.lg
              })}>
                —
              </div>
              <div style={mergeStyles(TEXT_STYLES.caption, {
                color: COLORS.textMuted,
                fontSize: DESIGN_TOKENS.typography.sizes.xs
              })}>
                Memories
              </div>
            </div>
          </div>
          
          <div style={{
            textAlign: 'center',
            marginTop: DESIGN_TOKENS.spacing[2],
            paddingTop: DESIGN_TOKENS.spacing[2],
            borderTop: `1px solid ${COLORS.borderLight}`
          }}>
            <button
              onClick={() => setShowProfilePage(true)}
              style={{
                background: 'none',
                border: 'none',
                color: COLORS.primary,
                fontSize: DESIGN_TOKENS.typography.sizes.xs,
                cursor: 'pointer',
                textDecoration: 'underline',
                fontWeight: DESIGN_TOKENS.typography.weights.medium,
                transition: `color ${DESIGN_TOKENS.motion.durations.fast} ease`
              }}
              onMouseEnter={(e) => e.target.style.color = COLORS.primaryHover}
              onMouseLeave={(e) => e.target.style.color = COLORS.primary}
            >
              View detailed stats →
            </button>
          </div>
        </div>

        {/* Status Indicator */}
        <div style={{
          marginTop: DESIGN_TOKENS.spacing[3],
          padding: DESIGN_TOKENS.spacing[2],
          backgroundColor: `${COLORS.success}15`,
          border: `1px solid ${COLORS.success}30`,
          borderRadius: DESIGN_TOKENS.radius.md,
          textAlign: 'center'
        }}>
          <div style={mergeStyles(TEXT_STYLES.caption, {
            color: COLORS.success,
            fontWeight: DESIGN_TOKENS.typography.weights.medium,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: DESIGN_TOKENS.spacing[1]
          })}>
            <span style={{
              width: DESIGN_TOKENS.spacing[2],
              height: DESIGN_TOKENS.spacing[2],
              backgroundColor: COLORS.success,
              borderRadius: DESIGN_TOKENS.radius.full,
              display: 'inline-block',
              animation: 'pulse 2s infinite'
            }}></span>
            Online & Exploring
          </div>
          
          <style>
            {`
              @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
              }
            `}
          </style>
        </div>
      </div>

      {showProfilePage && (
        <UserProfilePage
          user={user}
          userProfile={userProfile}
          onClose={() => setShowProfilePage(false)}
        />
      )}
    </>
  );
}