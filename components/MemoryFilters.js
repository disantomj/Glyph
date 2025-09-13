import React, { useState } from 'react';
import { getCategoryIcon, GLYPH_CATEGORIES } from '../constants/categories';
import { COLORS, CARD_STYLES, mergeStyles } from '../constants/styles';

export default function MemoryFilters({ onFilterChange, memoryCount = 0 }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');

  const timeframes = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  const categories = [
    { value: 'all', label: 'All Categories', icon: '📍' },
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
    <div style={{
      position: 'absolute',
      top: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      border: `1px solid ${COLORS.BORDER_LIGHT}`,
      overflow: 'hidden'
    }}>
      {/* Collapsed View */}
      <div 
        style={{
          padding: '10px 16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: COLORS.TEXT_PRIMARY
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>📋</span>
        <span>{memoryCount} memories</span>
        <span style={{ 
          fontSize: '12px', 
          color: COLORS.TEXT_MUTED,
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s'
        }}>
          ▼
        </span>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div style={{
          borderTop: `1px solid ${COLORS.BORDER_LIGHT}`,
          padding: '15px'
        }}>
          {/* Category Filter */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '12px', 
              fontWeight: '600',
              color: COLORS.TEXT_SECONDARY,
              textTransform: 'uppercase'
            }}>
              Category
            </label>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px'
            }}>
              {categories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat.value)}
                  style={{
                    padding: '6px 10px',
                    border: 'none',
                    borderRadius: '16px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s',
                    backgroundColor: selectedCategory === cat.value 
                      ? COLORS.PRIMARY 
                      : COLORS.BG_LIGHT,
                    color: selectedCategory === cat.value 
                      ? 'white' 
                      : COLORS.TEXT_SECONDARY
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Filter */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '12px', 
              fontWeight: '600',
              color: COLORS.TEXT_SECONDARY,
              textTransform: 'uppercase'
            }}>
              Timeframe
            </label>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px'
            }}>
              {timeframes.map(time => (
                <button
                  key={time.value}
                  onClick={() => handleTimeframeChange(time.value)}
                  style={{
                    padding: '6px 12px',
                    border: 'none',
                    borderRadius: '16px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: selectedTimeframe === time.value 
                      ? COLORS.SUCCESS 
                      : COLORS.BG_LIGHT,
                    color: selectedTimeframe === time.value 
                      ? 'white' 
                      : COLORS.TEXT_SECONDARY
                  }}
                >
                  {time.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}