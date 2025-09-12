import React, { useState, useEffect } from 'react';
import { DiscoveryService } from '../services/DiscoveryService';
import { GlyphService } from '../services/GlyphService';
import { getCategoryIcon, GLYPH_CATEGORIES } from '../constants/categories';
import { COLORS, CARD_STYLES, BUTTON_STYLES, mergeStyles } from '../constants/styles';
import { supabase } from '../lib/supabase';

export default function UserProfilePage({ user, userProfile, onClose }) {
  const [discoveryStats, setDiscoveryStats] = useState(null);
  const [createdGlyphs, setCreatedGlyphs] = useState([]);
  const [discoveredGlyphs, setDiscoveredGlyphs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load discovery stats
      const stats = await DiscoveryService.getUserDiscoveryStats(user.id);
      setDiscoveryStats(stats);

      // Load discovered glyphs
      const discovered = await DiscoveryService.getUserDiscoveredGlyphs(user.id);
      setDiscoveredGlyphs(discovered);

      // Load created glyphs (simplified query)
      const { data: created } = await supabase
        .from('glyphs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      setCreatedGlyphs(created || []);

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeForCategory = (category) => {
    const count = discoveryStats?.categoriesDiscovered[category] || 0;
    if (count >= 10) return { level: 'Gold', color: '#ffd700' };
    if (count >= 5) return { level: 'Silver', color: '#c0c0c0' };
    if (count >= 1) return { level: 'Bronze', color: '#cd7f32' };
    return null;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getExplorerRank = (totalDiscoveries) => {
    if (totalDiscoveries >= 50) return { title: 'Master Explorer', icon: '🏆' };
    if (totalDiscoveries >= 20) return { title: 'Expert Explorer', icon: '🥇' };
    if (totalDiscoveries >= 10) return { title: 'Skilled Explorer', icon: '🥈' };
    if (totalDiscoveries >= 5) return { title: 'Novice Explorer', icon: '🥉' };
    return { title: 'New Explorer', icon: '🌟' };
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          Loading profile...
        </div>
      </div>
    );
  }

  const explorerRank = getExplorerRank(discoveryStats?.totalDiscoveries || 0);

  return (
    <div style={{
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
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '25px',
          borderBottom: `1px solid ${COLORS.BORDER_LIGHT}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <div>
            <h2 style={{ 
              margin: '0 0 5px 0', 
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              {explorerRank.icon} {userProfile?.username || user.email}
            </h2>
            <p style={{ 
              margin: 0, 
              fontSize: '16px',
              opacity: 0.9
            }}>
              {explorerRank.title}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'white',
              padding: '5px',
              borderRadius: '50%',
              width: '40px',
              height: '40px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: `1px solid ${COLORS.BORDER_LIGHT}`,
          backgroundColor: COLORS.BG_LIGHT
        }}>
          {[
            { id: 'stats', label: 'Statistics', icon: '📊' },
            { id: 'discovered', label: 'Discovered', icon: '🔍' },
            { id: 'created', label: 'Created', icon: '✨' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '15px',
                border: 'none',
                backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
                borderBottom: activeTab === tab.id ? `3px solid ${COLORS.PRIMARY}` : '3px solid transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? '600' : 'normal',
                color: activeTab === tab.id ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '25px'
        }}>
          {activeTab === 'stats' && (
            <div>
              {/* Overview Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '25px'
              }}>
                <div style={mergeStyles(CARD_STYLES.elevated, { textAlign: 'center' })}>
                  <div style={{ fontSize: '32px', color: COLORS.PRIMARY, marginBottom: '10px' }}>
                    {discoveryStats?.totalDiscoveries || 0}
                  </div>
                  <div style={{ fontSize: '14px', color: COLORS.TEXT_SECONDARY }}>
                    Total Discoveries
                  </div>
                </div>
                
                <div style={mergeStyles(CARD_STYLES.elevated, { textAlign: 'center' })}>
                  <div style={{ fontSize: '32px', color: COLORS.SUCCESS, marginBottom: '10px' }}>
                    {createdGlyphs.length}
                  </div>
                  <div style={{ fontSize: '14px', color: COLORS.TEXT_SECONDARY }}>
                    Glyphs Created
                  </div>
                </div>

                <div style={mergeStyles(CARD_STYLES.elevated, { textAlign: 'center' })}>
                  <div style={{ fontSize: '32px', color: COLORS.WARNING, marginBottom: '10px' }}>
                    {Object.keys(discoveryStats?.categoriesDiscovered || {}).length}
                  </div>
                  <div style={{ fontSize: '14px', color: COLORS.TEXT_SECONDARY }}>
                    Categories Explored
                  </div>
                </div>
              </div>

              {/* Category Badges */}
              <div style={mergeStyles(CARD_STYLES.elevated, { marginBottom: '25px' })}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>
                  Category Achievements
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '15px'
                }}>
                  {Object.values(GLYPH_CATEGORIES).map(category => {
                    const count = discoveryStats?.categoriesDiscovered[category] || 0;
                    const badge = getBadgeForCategory(category);
                    
                    return (
                      <div key={category} style={{
                        textAlign: 'center',
                        padding: '15px',
                        borderRadius: '8px',
                        backgroundColor: count > 0 ? COLORS.BG_LIGHT : COLORS.BG_MUTED
                      }}>
                        <div style={{ fontSize: '24px', marginBottom: '5px' }}>
                          {getCategoryIcon(category)}
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: '500', marginBottom: '5px' }}>
                          {category}
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: badge?.color || COLORS.TEXT_MUTED }}>
                          {count}
                        </div>
                        {badge && (
                          <div style={{ fontSize: '10px', color: badge.color, fontWeight: '500' }}>
                            {badge.level}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Timeline */}
              {discoveryStats?.firstDiscovery && (
                <div style={mergeStyles(CARD_STYLES.elevated)}>
                  <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>
                    Explorer Timeline
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <div>
                      <div style={{ color: COLORS.TEXT_SECONDARY }}>First Discovery</div>
                      <div style={{ fontWeight: '500' }}>
                        {formatDate(discoveryStats.firstDiscovery)}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: COLORS.TEXT_SECONDARY }}>Latest Discovery</div>
                      <div style={{ fontWeight: '500' }}>
                        {formatDate(discoveryStats.lastDiscovery)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'discovered' && (
            <div>
              <div style={{ marginBottom: '15px', fontSize: '16px', color: COLORS.TEXT_SECONDARY }}>
                {discoveredGlyphs.length} glyphs discovered
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '15px'
              }}>
                {discoveredGlyphs.map(glyph => (
                  <div key={glyph.id} style={mergeStyles(CARD_STYLES.base, { padding: '15px' })}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '20px', marginRight: '10px' }}>
                        {getCategoryIcon(glyph.category)}
                      </span>
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>
                          {glyph.category}
                        </div>
                        <div style={{ fontSize: '12px', color: COLORS.TEXT_SECONDARY }}>
                          {formatDate(glyph.discovered_at)}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', lineHeight: '1.4', marginBottom: '10px' }}>
                      {glyph.text?.substring(0, 100)}{glyph.text?.length > 100 ? '...' : ''}
                    </div>
                    <div style={{ fontSize: '12px', color: COLORS.TEXT_MUTED }}>
                      📍 {glyph.latitude.toFixed(4)}, {glyph.longitude.toFixed(4)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'created' && (
            <div>
              <div style={{ marginBottom: '15px', fontSize: '16px', color: COLORS.TEXT_SECONDARY }}>
                {createdGlyphs.length} glyphs created
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '15px'
              }}>
                {createdGlyphs.map(glyph => (
                  <div key={glyph.id} style={mergeStyles(CARD_STYLES.base, { padding: '15px' })}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '20px', marginRight: '10px' }}>
                        {getCategoryIcon(glyph.category)}
                      </span>
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>
                          {glyph.category}
                        </div>
                        <div style={{ fontSize: '12px', color: COLORS.TEXT_SECONDARY }}>
                          {formatDate(glyph.discovered_at)}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', lineHeight: '1.4', marginBottom: '10px' }}>
                      {glyph.text?.substring(0, 100)}{glyph.text?.length > 100 ? '...' : ''}
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      fontSize: '12px', 
                      color: COLORS.TEXT_MUTED 
                    }}>
                      <span>⭐ {(glyph.rating_avg || 0).toFixed(1)} ({glyph.rating_count || 0})</span>
                      <span>📍 {glyph.latitude.toFixed(4)}, {glyph.longitude.toFixed(4)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}