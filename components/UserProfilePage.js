import React, { useState, useEffect } from 'react';
import { DiscoveryService } from '../services/DiscoveryService';
import { GlyphService } from '../services/GlyphService';
import { useStreak } from '../hooks/useStreak';
import { getCategoryIcon, GLYPH_CATEGORIES } from '../constants/categories';
import { COLORS, CARD_STYLES, mergeStyles } from '../constants/styles';
import { LocationService } from '../services/LocationService';
import { supabase } from '../lib/supabase';
import StreakDisplay from './StreakDisplay';

export default function UserProfilePage({ user, userProfile, onClose }) {
  const [discoveryStats, setDiscoveryStats] = useState(null);
  const [createdGlyphs, setCreatedGlyphs] = useState([]);
  const [discoveredGlyphs, setDiscoveredGlyphs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [deletingGlyphId, setDeletingGlyphId] = useState(null);

  // Use the streak hook
  const { streakData } = useStreak(user);

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

      // Load created glyphs
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

  const handleDeleteMemory = async (glyphId) => {
    if (window.confirm('Are you sure you want to delete this memory? This action cannot be undone.')) {
      try {
        setDeletingGlyphId(glyphId);
        await GlyphService.deleteGlyph(glyphId);
        
        // Remove from local state
        setCreatedGlyphs(prev => prev.filter(g => g.id !== glyphId));
        
        alert('Memory deleted successfully');
      } catch (error) {
        console.error('Error deleting memory:', error);
        alert('Failed to delete memory. Please try again.');
      } finally {
        setDeletingGlyphId(null);
      }
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
            { id: 'streaks', label: 'Streaks', icon: '🔥' },
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
                    Memories Created
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

          {activeTab === 'streaks' && (
            <div>
              <StreakDisplay streakData={streakData} compact={false} />
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
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '15px' 
              }}>
                <div style={{ fontSize: '16px', color: COLORS.TEXT_SECONDARY }}>
                  {createdGlyphs.length} memories created
                </div>
                {createdGlyphs.length > 0 && (
                  <div style={{ fontSize: '12px', color: COLORS.TEXT_MUTED }}>
                    Click memories to manage them
                  </div>
                )}
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '15px'
              }}>
                {createdGlyphs.map(glyph => (
                  <div 
                    key={glyph.id} 
                    style={mergeStyles(CARD_STYLES.base, { 
                      padding: '15px',
                      position: 'relative',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer'
                    })}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                  >
                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMemory(glyph.id);
                      }}
                      disabled={deletingGlyphId === glyph.id}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'rgba(220, 53, 69, 0.8)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: deletingGlyphId === glyph.id ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.7,
                        transition: 'opacity 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.opacity = '1'}
                      onMouseLeave={(e) => e.target.style.opacity = '0.7'}
                      title={deletingGlyphId === glyph.id ? 'Deleting...' : 'Delete memory'}
                    >
                      {deletingGlyphId === glyph.id ? '⏳' : '🗑'}
                    </button>

                    {/* Memory content */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '20px', marginRight: '10px' }}>
                        {getCategoryIcon(glyph.category)}
                      </span>
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>
                          {glyph.category}
                        </div>
                        <div style={{ fontSize: '12px', color: COLORS.TEXT_SECONDARY }}>
                          {formatDate(glyph.created_at)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Photo if exists */}
                    {glyph.photo_url && (
                      <div style={{ marginBottom: '10px' }}>
                        <img 
                          src={glyph.photo_url} 
                          alt="Memory photo"
                          style={{
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            border: '1px solid #e1e5e9'
                          }}
                        />
                      </div>
                    )}
                    
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
              
              {createdGlyphs.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: COLORS.TEXT_MUTED
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>💭</div>
                  <div style={{ fontSize: '16px', marginBottom: '8px' }}>No memories yet</div>
                  <div style={{ fontSize: '14px' }}>
                    Start creating memories by exploring and saving special moments!
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}