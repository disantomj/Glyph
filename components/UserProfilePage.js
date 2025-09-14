import React, { useState, useEffect } from 'react';
import { DiscoveryService } from '../services/DiscoveryService';
import { GlyphService } from '../services/GlyphService';
import { useStreak } from '../hooks/useStreak';
import { getCategoryIcon, GLYPH_CATEGORIES } from '../constants/categories';
import { LocationService } from '../services/LocationService';
import { supabase } from '../lib/supabase';
import StreakDisplay from './StreakDisplay';
import {
  COLORS,
  BUTTON_STYLES,
  CARD_STYLES,
  TEXT_STYLES,
  MODAL_STYLES,
  DESIGN_TOKENS,
  LAYOUT,
  mergeStyles
} from '../constants/styles';

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
    if (count >= 10) return { level: 'Gold', color: COLORS.warning, glow: `0 0 12px ${COLORS.warning}40` };
    if (count >= 5) return { level: 'Silver', color: COLORS.textMuted, glow: `0 0 8px ${COLORS.textMuted}30` };
    if (count >= 1) return { level: 'Bronze', color: '#cd7f32', glow: '0 0 6px rgba(205, 127, 50, 0.4)' };
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
    if (totalDiscoveries >= 50) return { 
      title: 'Master Explorer', 
      icon: '🏆', 
      color: COLORS.warning,
      gradient: `linear-gradient(135deg, ${COLORS.warning} 0%, #f59e0b 100%)`
    };
    if (totalDiscoveries >= 20) return { 
      title: 'Expert Explorer', 
      icon: '🥇', 
      color: COLORS.warning,
      gradient: `linear-gradient(135deg, ${COLORS.warning} 0%, ${COLORS.primary} 100%)`
    };
    if (totalDiscoveries >= 10) return { 
      title: 'Skilled Explorer', 
      icon: '🥈', 
      color: COLORS.textMuted,
      gradient: `linear-gradient(135deg, ${COLORS.textMuted} 0%, ${COLORS.primary} 100%)`
    };
    if (totalDiscoveries >= 5) return { 
      title: 'Novice Explorer', 
      icon: '🥉', 
      color: '#cd7f32',
      gradient: `linear-gradient(135deg, #cd7f32 0%, ${COLORS.primary} 100%)`
    };
    return { 
      title: 'New Explorer', 
      icon: '🌟', 
      color: COLORS.primary,
      gradient: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`
    };
  };

  if (loading) {
    return (
      <div style={MODAL_STYLES.overlay}>
        <div style={mergeStyles(CARD_STYLES.elevated, {
          padding: DESIGN_TOKENS.spacing[8],
          textAlign: 'center'
        })}>
          <div style={{
            fontSize: DESIGN_TOKENS.typography.sizes['2xl'],
            marginBottom: DESIGN_TOKENS.spacing[4]
          }}>
            🔍
          </div>
          <div style={mergeStyles(TEXT_STYLES.body, {
            color: COLORS.textSecondary
          })}>
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  const explorerRank = getExplorerRank(discoveryStats?.totalDiscoveries || 0);

  const tabs = [
    { id: 'stats', label: 'Statistics', icon: '📊' },
    { id: 'streaks', label: 'Streaks', icon: '🔥' },
    { id: 'discovered', label: 'Discovered', icon: '🔍', count: discoveredGlyphs.length },
    { id: 'created', label: 'Created', icon: '✨', count: createdGlyphs.length }
  ];

  return (
    <div style={MODAL_STYLES.overlay}>
      <div style={mergeStyles(MODAL_STYLES.content, {
        maxWidth: '900px',
        width: '95%'
      })}>
        {/* Header with Gradient Background */}
        <div style={{
          padding: DESIGN_TOKENS.spacing[6],
          borderBottom: `1px solid ${COLORS.borderLight}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: explorerRank.gradient,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background decoration */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '40%',
            height: '200%',
            background: `radial-gradient(circle, ${COLORS.textInverse}15 0%, transparent 70%)`,
            transform: 'rotate(15deg)'
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={mergeStyles(TEXT_STYLES.h2, {
              margin: `0 0 ${DESIGN_TOKENS.spacing[1]} 0`,
              display: 'flex',
              alignItems: 'center',
              gap: DESIGN_TOKENS.spacing[2],
              color: COLORS.textInverse,
              textShadow: '0 2px 8px rgba(0,0,0,0.3)'
            })}>
              <span style={{
                fontSize: DESIGN_TOKENS.typography.sizes['2xl'],
                filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.3))'
              }}>
                {explorerRank.icon}
              </span>
              {userProfile?.username || user.email}
            </h2>
            <p style={mergeStyles(TEXT_STYLES.body, {
              margin: 0,
              color: `${COLORS.textInverse}CC`,
              fontWeight: DESIGN_TOKENS.typography.weights.medium
            })}>
              {explorerRank.title}
            </p>
          </div>
          
          <button
            onClick={onClose}
            style={{
              position: 'relative',
              zIndex: 1,
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              fontSize: DESIGN_TOKENS.typography.sizes['2xl'],
              cursor: 'pointer',
              color: COLORS.textInverse,
              padding: DESIGN_TOKENS.spacing[1],
              borderRadius: DESIGN_TOKENS.radius.full,
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: `all ${DESIGN_TOKENS.motion.durations.fast} ease`,
              backdropFilter: 'blur(8px)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.3)';
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: `1px solid ${COLORS.borderLight}`,
          backgroundColor: COLORS.bgSecondary,
          overflow: 'auto'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: '1 0 auto',
                padding: DESIGN_TOKENS.spacing[4],
                border: 'none',
                backgroundColor: activeTab === tab.id ? COLORS.bgPrimary : 'transparent',
                borderBottom: activeTab === tab.id ? `3px solid ${COLORS.primary}` : '3px solid transparent',
                cursor: 'pointer',
                fontSize: DESIGN_TOKENS.typography.sizes.sm,
                fontWeight: activeTab === tab.id ? DESIGN_TOKENS.typography.weights.semibold : DESIGN_TOKENS.typography.weights.normal,
                color: activeTab === tab.id ? COLORS.primary : COLORS.textSecondary,
                transition: `all ${DESIGN_TOKENS.motion.durations.fast} ease`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: DESIGN_TOKENS.spacing[1],
                minWidth: '120px'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.backgroundColor = `${COLORS.primary}10`;
                  e.target.style.color = COLORS.primary;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = COLORS.textSecondary;
                }
              }}
            >
              <span style={{ fontSize: DESIGN_TOKENS.typography.sizes.lg }}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span style={mergeStyles(CARD_STYLES.base, {
                  backgroundColor: activeTab === tab.id ? COLORS.primary : COLORS.bgMuted,
                  color: activeTab === tab.id ? COLORS.textInverse : COLORS.textMuted,
                  padding: `${DESIGN_TOKENS.spacing[0]} ${DESIGN_TOKENS.spacing[1]}`,
                  borderRadius: DESIGN_TOKENS.radius.full,
                  fontSize: DESIGN_TOKENS.typography.sizes.xs,
                  fontWeight: DESIGN_TOKENS.typography.weights.medium,
                  minWidth: '20px',
                  textAlign: 'center'
                })}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: DESIGN_TOKENS.spacing[6]
        }}>
          {activeTab === 'stats' && (
            <div>
              {/* Overview Stats Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: DESIGN_TOKENS.spacing[4],
                marginBottom: DESIGN_TOKENS.spacing[6]
              }}>
                <div style={mergeStyles(CARD_STYLES.elevated, {
                  textAlign: 'center',
                  padding: DESIGN_TOKENS.spacing[5],
                  background: `linear-gradient(135deg, ${COLORS.primary}15 0%, ${COLORS.primary}05 100%)`
                })}>
                  <div style={mergeStyles(TEXT_STYLES.h1, {
                    fontSize: DESIGN_TOKENS.typography.sizes['4xl'],
                    color: COLORS.primary,
                    marginBottom: DESIGN_TOKENS.spacing[2],
                    textShadow: `0 0 20px ${COLORS.primary}30`
                  })}>
                    {discoveryStats?.totalDiscoveries || 0}
                  </div>
                  <div style={mergeStyles(TEXT_STYLES.caption, {
                    color: COLORS.textSecondary,
                    fontWeight: DESIGN_TOKENS.typography.weights.medium,
                    textTransform: 'uppercase',
                    letterSpacing: DESIGN_TOKENS.typography.letterSpacing.wide
                  })}>
                    Total Discoveries
                  </div>
                </div>
                
                <div style={mergeStyles(CARD_STYLES.elevated, {
                  textAlign: 'center',
                  padding: DESIGN_TOKENS.spacing[5],
                  background: `linear-gradient(135deg, ${COLORS.success}15 0%, ${COLORS.success}05 100%)`
                })}>
                  <div style={mergeStyles(TEXT_STYLES.h1, {
                    fontSize: DESIGN_TOKENS.typography.sizes['4xl'],
                    color: COLORS.success,
                    marginBottom: DESIGN_TOKENS.spacing[2],
                    textShadow: `0 0 20px ${COLORS.success}30`
                  })}>
                    {createdGlyphs.length}
                  </div>
                  <div style={mergeStyles(TEXT_STYLES.caption, {
                    color: COLORS.textSecondary,
                    fontWeight: DESIGN_TOKENS.typography.weights.medium,
                    textTransform: 'uppercase',
                    letterSpacing: DESIGN_TOKENS.typography.letterSpacing.wide
                  })}>
                    Memories Created
                  </div>
                </div>

                <div style={mergeStyles(CARD_STYLES.elevated, {
                  textAlign: 'center',
                  padding: DESIGN_TOKENS.spacing[5],
                  background: `linear-gradient(135deg, ${COLORS.warning}15 0%, ${COLORS.warning}05 100%)`
                })}>
                  <div style={mergeStyles(TEXT_STYLES.h1, {
                    fontSize: DESIGN_TOKENS.typography.sizes['4xl'],
                    color: COLORS.warning,
                    marginBottom: DESIGN_TOKENS.spacing[2],
                    textShadow: `0 0 20px ${COLORS.warning}30`
                  })}>
                    {Object.keys(discoveryStats?.categoriesDiscovered || {}).length}
                  </div>
                  <div style={mergeStyles(TEXT_STYLES.caption, {
                    color: COLORS.textSecondary,
                    fontWeight: DESIGN_TOKENS.typography.weights.medium,
                    textTransform: 'uppercase',
                    letterSpacing: DESIGN_TOKENS.typography.letterSpacing.wide
                  })}>
                    Categories Explored
                  </div>
                </div>
              </div>

              {/* Category Achievements */}
              <div style={mergeStyles(CARD_STYLES.elevated, {
                marginBottom: DESIGN_TOKENS.spacing[6]
              })}>
                <h3 style={mergeStyles(TEXT_STYLES.h3, {
                  margin: `0 0 ${DESIGN_TOKENS.spacing[4]} 0`
                })}>
                  Category Achievements
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: DESIGN_TOKENS.spacing[3]
                }}>
                  {Object.values(GLYPH_CATEGORIES).map(category => {
                    const count = discoveryStats?.categoriesDiscovered[category] || 0;
                    const badge = getBadgeForCategory(category);
                    
                    return (
                      <div key={category} style={mergeStyles(CARD_STYLES.base, {
                        textAlign: 'center',
                        padding: DESIGN_TOKENS.spacing[4],
                        backgroundColor: count > 0 ? COLORS.bgSecondary : COLORS.bgMuted,
                        transition: `all ${DESIGN_TOKENS.motion.durations.normal} ease`,
                        border: badge ? `2px solid ${badge.color}30` : `1px solid ${COLORS.borderLight}`,
                        boxShadow: badge ? badge.glow : DESIGN_TOKENS.shadows.sm
                      })}>
                        <div style={{ 
                          fontSize: DESIGN_TOKENS.typography.sizes['2xl'], 
                          marginBottom: DESIGN_TOKENS.spacing[2],
                          filter: badge ? `drop-shadow(0 0 4px ${badge.color}40)` : 'none'
                        }}>
                          {getCategoryIcon(category)}
                        </div>
                        <div style={mergeStyles(TEXT_STYLES.caption, {
                          fontWeight: DESIGN_TOKENS.typography.weights.medium,
                          marginBottom: DESIGN_TOKENS.spacing[1]
                        })}>
                          {category}
                        </div>
                        <div style={mergeStyles(TEXT_STYLES.h3, {
                          color: badge?.color || COLORS.textMuted,
                          margin: `0 0 ${DESIGN_TOKENS.spacing[1]} 0`,
                          textShadow: badge ? `0 0 8px ${badge.color}40` : 'none'
                        })}>
                          {count}
                        </div>
                        {badge && (
                          <div style={mergeStyles(TEXT_STYLES.caption, {
                            color: badge.color,
                            fontWeight: DESIGN_TOKENS.typography.weights.semibold,
                            fontSize: DESIGN_TOKENS.typography.sizes.xs,
                            textTransform: 'uppercase',
                            letterSpacing: DESIGN_TOKENS.typography.letterSpacing.wide
                          })}>
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
                <div style={CARD_STYLES.elevated}>
                  <h3 style={mergeStyles(TEXT_STYLES.h3, {
                    margin: `0 0 ${DESIGN_TOKENS.spacing[4]} 0`
                  })}>
                    Explorer Timeline
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: DESIGN_TOKENS.spacing[4]
                  }}>
                    <div style={mergeStyles(CARD_STYLES.base, {
                      padding: DESIGN_TOKENS.spacing[4],
                      backgroundColor: COLORS.bgSecondary,
                      textAlign: 'center'
                    })}>
                      <div style={mergeStyles(TEXT_STYLES.caption, {
                        color: COLORS.textSecondary,
                        marginBottom: DESIGN_TOKENS.spacing[1]
                      })}>
                        First Discovery
                      </div>
                      <div style={mergeStyles(TEXT_STYLES.body, {
                        fontWeight: DESIGN_TOKENS.typography.weights.medium,
                        color: COLORS.primary
                      })}>
                        {formatDate(discoveryStats.firstDiscovery)}
                      </div>
                    </div>
                    <div style={mergeStyles(CARD_STYLES.base, {
                      padding: DESIGN_TOKENS.spacing[4],
                      backgroundColor: COLORS.bgSecondary,
                      textAlign: 'center'
                    })}>
                      <div style={mergeStyles(TEXT_STYLES.caption, {
                        color: COLORS.textSecondary,
                        marginBottom: DESIGN_TOKENS.spacing[1]
                      })}>
                        Latest Discovery
                      </div>
                      <div style={mergeStyles(TEXT_STYLES.body, {
                        fontWeight: DESIGN_TOKENS.typography.weights.medium,
                        color: COLORS.success
                      })}>
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
              <div style={mergeStyles(TEXT_STYLES.body, {
                marginBottom: DESIGN_TOKENS.spacing[4],
                color: COLORS.textSecondary
              })}>
                {discoveredGlyphs.length} glyphs discovered
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: DESIGN_TOKENS.spacing[4]
              }}>
                {discoveredGlyphs.map(glyph => (
                  <div key={glyph.id} style={mergeStyles(CARD_STYLES.interactive, {
                    padding: DESIGN_TOKENS.spacing[4]
                  })}>
                    <div style={mergeStyles(LAYOUT.flex, {
                      marginBottom: DESIGN_TOKENS.spacing[3],
                      gap: DESIGN_TOKENS.spacing[2]
                    })}>
                      <span style={{ 
                        fontSize: DESIGN_TOKENS.typography.sizes.xl,
                        filter: `drop-shadow(0 0 3px ${COLORS.primary}40)`
                      }}>
                        {getCategoryIcon(glyph.category)}
                      </span>
                      <div>
                        <div style={mergeStyles(TEXT_STYLES.caption, {
                          fontWeight: DESIGN_TOKENS.typography.weights.medium,
                          color: COLORS.textPrimary
                        })}>
                          {glyph.category}
                        </div>
                        <div style={mergeStyles(TEXT_STYLES.caption, {
                          color: COLORS.textMuted,
                          fontSize: DESIGN_TOKENS.typography.sizes.xs
                        })}>
                          {formatDate(glyph.discovered_at)}
                        </div>
                      </div>
                    </div>
                    <div style={mergeStyles(TEXT_STYLES.body, {
                      lineHeight: DESIGN_TOKENS.typography.lineHeights.normal,
                      marginBottom: DESIGN_TOKENS.spacing[2],
                      color: COLORS.textSecondary
                    })}>
                      {glyph.text?.substring(0, 100)}{glyph.text?.length > 100 ? '...' : ''}
                    </div>
                    <div style={mergeStyles(TEXT_STYLES.caption, {
                      color: COLORS.textMuted,
                      fontSize: DESIGN_TOKENS.typography.sizes.xs
                    })}>
                      📍 {glyph.latitude.toFixed(4)}, {glyph.longitude.toFixed(4)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'created' && (
            <div>
              <div style={mergeStyles(LAYOUT.flexBetween, {
                marginBottom: DESIGN_TOKENS.spacing[4]
              })}>
                <div style={mergeStyles(TEXT_STYLES.body, {
                  color: COLORS.textSecondary
                })}>
                  {createdGlyphs.length} memories created
                </div>
                {createdGlyphs.length > 0 && (
                  <div style={mergeStyles(TEXT_STYLES.caption, {
                    color: COLORS.textMuted
                  })}>
                    Click memories to manage them
                  </div>
                )}
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: DESIGN_TOKENS.spacing[4]
              }}>
                {createdGlyphs.map(glyph => (
                  <div 
                    key={glyph.id} 
                    style={mergeStyles(CARD_STYLES.interactive, {
                      padding: DESIGN_TOKENS.spacing[4],
                      position: 'relative'
                    })}
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
                        top: DESIGN_TOKENS.spacing[2],
                        right: DESIGN_TOKENS.spacing[2],
                        background: `${COLORS.error}DD`,
                        color: COLORS.textInverse,
                        border: 'none',
                        borderRadius: DESIGN_TOKENS.radius.full,
                        width: '24px',
                        height: '24px',
                        cursor: deletingGlyphId === glyph.id ? 'not-allowed' : 'pointer',
                        fontSize: DESIGN_TOKENS.typography.sizes.xs,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.7,
                        transition: `opacity ${DESIGN_TOKENS.motion.durations.fast} ease`,
                        backdropFilter: 'blur(4px)'
                      }}
                      onMouseEnter={(e) => e.target.style.opacity = '1'}
                      onMouseLeave={(e) => e.target.style.opacity = '0.7'}
                      title={deletingGlyphId === glyph.id ? 'Deleting...' : 'Delete memory'}
                    >
                      {deletingGlyphId === glyph.id ? '⏳' : '🗑️'}
                    </button>

                    {/* Memory content */}
                    <div style={mergeStyles(LAYOUT.flex, {
                      marginBottom: DESIGN_TOKENS.spacing[3],
                      gap: DESIGN_TOKENS.spacing[2]
                    })}>
                      <span style={{ 
                        fontSize: DESIGN_TOKENS.typography.sizes.xl,
                        filter: `drop-shadow(0 0 3px ${COLORS.success}40)`
                      }}>
                        {getCategoryIcon(glyph.category)}
                      </span>
                      <div>
                        <div style={mergeStyles(TEXT_STYLES.caption, {
                          fontWeight: DESIGN_TOKENS.typography.weights.medium,
                          color: COLORS.textPrimary
                        })}>
                          {glyph.category}
                        </div>
                        <div style={mergeStyles(TEXT_STYLES.caption, {
                          color: COLORS.textMuted,
                          fontSize: DESIGN_TOKENS.typography.sizes.xs
                        })}>
                          {formatDate(glyph.created_at)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Photo if exists */}
                    {glyph.photo_url && (
                      <div style={{ marginBottom: DESIGN_TOKENS.spacing[3] }}>
                        <img 
                          src={glyph.photo_url} 
                          alt="Memory photo"
                          style={{
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: DESIGN_TOKENS.radius.md,
                            border: `1px solid ${COLORS.borderLight}`
                          }}
                        />
                      </div>
                    )}
                    
                    <div style={mergeStyles(TEXT_STYLES.body, {
                      lineHeight: DESIGN_TOKENS.typography.lineHeights.normal,
                      marginBottom: DESIGN_TOKENS.spacing[3],
                      color: COLORS.textSecondary
                    })}>
                      {glyph.text?.substring(0, 100)}{glyph.text?.length > 100 ? '...' : ''}
                    </div>
                    
                    <div style={mergeStyles(LAYOUT.flexBetween, {
                      fontSize: DESIGN_TOKENS.typography.sizes.xs,
                      color: COLORS.textMuted
                    })}>
                      <span style={mergeStyles(LAYOUT.flex, {
                        alignItems: 'center',
                        gap: DESIGN_TOKENS.spacing[1]
                      })}>
                        <span>⭐</span>
                        <span>{(glyph.rating_avg || 0).toFixed(1)} ({glyph.rating_count || 0})</span>
                      </span>
                      <span>📍 {glyph.latitude.toFixed(4)}, {glyph.longitude.toFixed(4)}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {createdGlyphs.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: DESIGN_TOKENS.spacing[12],
                  color: COLORS.textMuted
                }}>
                  <div style={{ 
                    fontSize: DESIGN_TOKENS.typography.sizes['5xl'], 
                    marginBottom: DESIGN_TOKENS.spacing[4] 
                  }}>
                    💭
                  </div>
                  <div style={mergeStyles(TEXT_STYLES.body, {
                    marginBottom: DESIGN_TOKENS.spacing[2],
                    color: COLORS.textSecondary
                  })}>
                    No memories yet
                  </div>
                  <div style={TEXT_STYLES.caption}>
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