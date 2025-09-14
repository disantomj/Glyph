import React, { useState } from 'react';
import { getCategoryIcon, GLYPH_CATEGORIES } from '../constants/categories';
import {
  COLORS,
  CARD_STYLES,
  TEXT_STYLES,
  DESIGN_TOKENS,
  LAYOUT,
  mergeStyles
} from '../constants/styles';

export default function MemoryFilters({ onFilterChange, memoryCount = 0 }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');

  const timeframes = [
    { value: 'all', label: 'All Time', icon: '📅' },
    { value: 'today', label: 'Today', icon: '🌅' },
    { value: 'week', label: 'This Week', icon: '📆' },
    { value: 'month', label: 'This Month', icon: '🗓️' },
    { value: 'year', label: 'This Year', icon: '📊' }
  ];

  const categories = [
    { value: 'all', label: 'All Categories', icon: '📋' },
    ...Object.values(GLYPH_CATEGORIES).map(cat => ({
      value: cat,
      label: cat,
      icon: getCategoryIcon(cat)
    }))
  ];

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    onFilterChange({ category, timeframe: selectedTimeframe });
  };

  const handleTimeframeChange = (timeframe) => {
    setSelectedTimeframe(timeframe);
    onFilterChange({ category: selectedCategory, timeframe });
  };

  return (
    <div style={mergeStyles(CARD_STYLES.glass, {
      position: 'absolute',
      top: DESIGN_TOKENS.spacing[20],
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: DESIGN_TOKENS.zIndex.overlay,
      overflow: 'hidden',
      minWidth: '280px',
      maxWidth: '400px'
    })}>
      {/* Collapsed View Header */}
      <div 
        style={{
          padding: `${DESIGN_TOKENS.spacing[2]} ${DESIGN_TOKENS.spacing[4]}`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: DESIGN_TOKENS.spacing[2],
          transition: `all ${DESIGN_TOKENS.motion.durations.fast} ease`,
          borderBottom: isExpanded ? `1px solid ${COLORS.borderLight}` : 'none'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={(e) => {
          if (!isExpanded) {
            e.currentTarget.style.backgroundColor = `${COLORS.primary}10`;
          }
        }}
        onMouseLeave={(e) => {
          if (!isExpanded) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <span style={{
          fontSize: DESIGN_TOKENS.typography.sizes.lg,
          filter: `drop-shadow(0 0 3px ${COLORS.primary})`
        }}>
          📋
        </span>
        
        <div style={{ flex: 1 }}>
          <div style={mergeStyles(TEXT_STYLES.caption, {
            fontWeight: DESIGN_TOKENS.typography.weights.semibold,
            color: COLORS.textPrimary,
            marginBottom: DESIGN_TOKENS.spacing[0]
          })}>
            {memoryCount} Memories
          </div>
          
          {(selectedCategory !== 'all' || selectedTimeframe !== 'all') && (
            <div style={mergeStyles(TEXT_STYLES.caption, {
              color: COLORS.textMuted,
              fontSize: DESIGN_TOKENS.typography.sizes.xs
            })}>
              Filtered • {selectedCategory !== 'all' ? selectedCategory : ''} {selectedTimeframe !== 'all' ? selectedTimeframe : ''}
            </div>
          )}
        </div>
        
        <span style={{ 
          fontSize: DESIGN_TOKENS.typography.sizes.xs,
          color: COLORS.textMuted,
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: `transform ${DESIGN_TOKENS.motion.durations.fast} ease`
        }}>
          ▼
        </span>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div style={{
          padding: DESIGN_TOKENS.spacing[4],
          backgroundColor: `${COLORS.bgPrimary}95`,
          backdropFilter: 'blur(8px)'
        }}>
          {/* Category Filter */}
          <div style={{ marginBottom: DESIGN_TOKENS.spacing[4] }}>
            <label style={mergeStyles(TEXT_STYLES.label, {
              marginBottom: DESIGN_TOKENS.spacing[2],
              fontSize: DESIGN_TOKENS.typography.sizes.xs,
              fontWeight: DESIGN_TOKENS.typography.weights.semibold,
              color: COLORS.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: DESIGN_TOKENS.typography.letterSpacing.wide
            })}>
              Category
            </label>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: DESIGN_TOKENS.spacing[1]
            }}>
              {categories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat.value)}
                  style={mergeStyles(CARD_STYLES.base, {
                    padding: `${DESIGN_TOKENS.spacing[1]} ${DESIGN_TOKENS.spacing[2]}`,
                    border: 'none',
                    borderRadius: DESIGN_TOKENS.radius.full,
                    fontSize: DESIGN_TOKENS.typography.sizes.xs,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: DESIGN_TOKENS.spacing[1],
                    transition: `all ${DESIGN_TOKENS.motion.durations.fast} ease`,
                    backgroundColor: selectedCategory === cat.value 
                      ? COLORS.primary 
                      : COLORS.bgSecondary,
                    color: selectedCategory === cat.value 
                      ? COLORS.textInverse 
                      : COLORS.textSecondary,
                    fontWeight: selectedCategory === cat.value 
                      ? DESIGN_TOKENS.typography.weights.medium 
                      : DESIGN_TOKENS.typography.weights.normal,
                    boxShadow: selectedCategory === cat.value 
                      ? DESIGN_TOKENS.shadows.sm 
                      : 'none',
                    transform: selectedCategory === cat.value ? 'scale(1.05)' : 'scale(1)'
                  })}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== cat.value) {
                      e.target.style.backgroundColor = `${COLORS.primary}20`;
                      e.target.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== cat.value) {
                      e.target.style.backgroundColor = COLORS.bgSecondary;
                      e.target.style.transform = 'scale(1)';
                    }
                  }}
                >
                  <span style={{ fontSize: DESIGN_TOKENS.typography.sizes.sm }}>
                    {cat.icon}
                  </span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Filter */}
          <div>
            <label style={mergeStyles(TEXT_STYLES.label, {
              marginBottom: DESIGN_TOKENS.spacing[2],
              fontSize: DESIGN_TOKENS.typography.sizes.xs,
              fontWeight: DESIGN_TOKENS.typography.weights.semibold,
              color: COLORS.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: DESIGN_TOKENS.typography.letterSpacing.wide
            })}>
              Timeframe
            </label>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: DESIGN_TOKENS.spacing[1]
            }}>
              {timeframes.map(time => (
                <button
                  key={time.value}
                  onClick={() => handleTimeframeChange(time.value)}
                  style={mergeStyles(CARD_STYLES.base, {
                    padding: `${DESIGN_TOKENS.spacing[1]} ${DESIGN_TOKENS.spacing[3]}`,
                    border: 'none',
                    borderRadius: DESIGN_TOKENS.radius.full,
                    fontSize: DESIGN_TOKENS.typography.sizes.xs,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: DESIGN_TOKENS.spacing[1],
                    transition: `all ${DESIGN_TOKENS.motion.durations.fast} ease`,
                    backgroundColor: selectedTimeframe === time.value 
                      ? COLORS.success 
                      : COLORS.bgSecondary,
                    color: selectedTimeframe === time.value 
                      ? COLORS.textInverse 
                      : COLORS.textSecondary,
                    fontWeight: selectedTimeframe === time.value 
                      ? DESIGN_TOKENS.typography.weights.medium 
                      : DESIGN_TOKENS.typography.weights.normal,
                    boxShadow: selectedTimeframe === time.value 
                      ? DESIGN_TOKENS.shadows.sm 
                      : 'none',
                    transform: selectedTimeframe === time.value ? 'scale(1.05)' : 'scale(1)'
                  })}
                  onMouseEnter={(e) => {
                    if (selectedTimeframe !== time.value) {
                      e.target.style.backgroundColor = `${COLORS.success}20`;
                      e.target.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedTimeframe !== time.value) {
                      e.target.style.backgroundColor = COLORS.bgSecondary;
                      e.target.style.transform = 'scale(1)';
                    }
                  }}
                >
                  <span style={{ fontSize: DESIGN_TOKENS.typography.sizes.sm }}>
                    {time.icon}
                  </span>
                  <span>{time.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters Button */}
          {(selectedCategory !== 'all' || selectedTimeframe !== 'all') && (
            <div style={{
              marginTop: DESIGN_TOKENS.spacing[4],
              paddingTop: DESIGN_TOKENS.spacing[3],
              borderTop: `1px solid ${COLORS.borderLight}`,
              textAlign: 'center'
            }}>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedTimeframe('all');
                  onFilterChange({ category: 'all', timeframe: 'all' });
                }}
                style={{
                  background: 'none',
                  border: `1px solid ${COLORS.borderMedium}`,
                  borderRadius: DESIGN_TOKENS.radius.md,
                  padding: `${DESIGN_TOKENS.spacing[1]} ${DESIGN_TOKENS.spacing[3]}`,
                  color: COLORS.textMuted,
                  fontSize: DESIGN_TOKENS.typography.sizes.xs,
                  cursor: 'pointer',
                  transition: `all ${DESIGN_TOKENS.motion.durations.fast} ease`,
                  fontWeight: DESIGN_TOKENS.typography.weights.medium
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = COLORS.bgMuted;
                  e.target.style.borderColor = COLORS.primary;
                  e.target.style.color = COLORS.primary;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = COLORS.borderMedium;
                  e.target.style.color = COLORS.textMuted;
                }}
              >
                🗑️ Clear Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}