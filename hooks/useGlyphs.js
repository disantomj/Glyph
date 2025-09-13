import { useState, useRef, useCallback } from 'react';
import { GlyphService } from '../services/GlyphService';
import { LocationService } from '../services/LocationService';
import { DiscoveryService } from '../services/DiscoveryService';
import { StreakService } from '../services/StreakService';
import { supabase } from '../lib/supabase';

export const useGlyphs = () => {
  const [glyphs, setGlyphs] = useState([]);
  const [selectedGlyph, setSelectedGlyph] = useState(null);
  const [showAddGlyph, setShowAddGlyph] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [isLoadingGlyphs, setIsLoadingGlyphs] = useState(false);
  const [glyphError, setGlyphError] = useState(null);
  const [memoryFilters, setMemoryFilters] = useState({ category: 'all', timeframe: 'all' });
  
  const markersRef = useRef([]);
  const glyphsRenderedRef = useRef(new Set());

  // Load nearby glyphs using GlyphService (for explore mode)
  const loadNearbyGlyphs = useCallback(async (userLat, userLng, radiusMeters = 200) => {
    try {
      setIsLoadingGlyphs(true);
      setGlyphError(null);
      
      const nearbyGlyphs = await GlyphService.loadNearbyGlyphs(userLat, userLng, radiusMeters);
      setGlyphs(nearbyGlyphs);
      
      console.log('Loaded nearby glyphs:', nearbyGlyphs.length);
    } catch (error) {
      console.error('Failed to load nearby glyphs:', error);
      setGlyphError('Failed to load nearby glyphs. Please try again.');
    } finally {
      setIsLoadingGlyphs(false);
    }
  }, []);

  // Filter personal memories by category and timeframe
  const getFilteredPersonalGlyphs = useCallback((userGlyphs, filters) => {
    let filtered = [...userGlyphs];
    
    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(glyph => glyph.category === filters.category);
    }
    
    // Filter by timeframe
    if (filters.timeframe !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.timeframe) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          return filtered;
      }
      
      filtered = filtered.filter(glyph => 
        new Date(glyph.created_at) >= filterDate
      );
    }
    
    return filtered;
  }, []);

  // Load personal memories (for memory mode)
  const loadPersonalMemories = useCallback(async (userId, radiusMeters = null) => {
    if (!userId) return;
    
    try {
      setIsLoadingGlyphs(true);
      setGlyphError(null);
      
      let query = supabase
        .from('glyphs')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Failed to load personal memories:', error);
        setGlyphError('Failed to load your memories. Please try again.');
        return;
      }
      
      let filteredMemories = data || [];
      
      // Apply filters
      filteredMemories = getFilteredPersonalGlyphs(filteredMemories, memoryFilters);
      
      setGlyphs(filteredMemories);
      console.log('Loaded personal memories:', filteredMemories.length);
    } catch (error) {
      console.error('Failed to load personal memories:', error);
      setGlyphError('Failed to load your memories. Please try again.');
    } finally {
      setIsLoadingGlyphs(false);
    }
  }, [memoryFilters, getFilteredPersonalGlyphs]);

  // Delete a glyph (soft delete - sets is_active to false)
  const deleteGlyph = useCallback(async (glyphId) => {
    try {
      await GlyphService.deleteGlyph(glyphId);
      
      // Remove from local state immediately for better UX
      removeGlyph(glyphId);
      
      console.log('Glyph deleted successfully:', glyphId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting glyph:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Add a new glyph to the list
  const addGlyph = (newGlyph) => {
    setGlyphs(prev => [...prev, newGlyph]);
    setShowAddGlyph(false);
    setSelectedCoords(null);
  };

  // Update an existing glyph in the list
  const updateGlyph = (updatedGlyph) => {
    setGlyphs(prev => prev.map(g => g.id === updatedGlyph.id ? updatedGlyph : g));
  };

  // Remove a glyph from the list
  const removeGlyph = (glyphId) => {
    setGlyphs(prev => prev.filter(g => g.id !== glyphId));
  };

  // Clear all glyph markers from map
  const clearAllMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    glyphsRenderedRef.current.clear();
  };

  // Open the add glyph modal at specific coordinates
  const openAddGlyphModal = (coordinates) => {
    setSelectedCoords(coordinates);
    setShowAddGlyph(true);
  };

  // Close the add glyph modal
  const closeAddGlyphModal = () => {
    setShowAddGlyph(false);
    setSelectedCoords(null);
  };

  // Open glyph detail modal
  const openGlyphDetail = (glyph) => {
    setSelectedGlyph(glyph);
  };

  // Close glyph detail modal
  const closeGlyphDetail = () => {
    setSelectedGlyph(null);
  };

  // Check if a glyph has already been rendered on the map
  const isGlyphRendered = (glyphId) => {
    return glyphsRenderedRef.current.has(glyphId);
  };

  // Mark a glyph as rendered
  const markGlyphAsRendered = (glyphId) => {
    glyphsRenderedRef.current.add(glyphId);
  };

  // Add a marker reference to track for cleanup
  const addMarkerRef = (marker) => {
    markersRef.current.push(marker);
  };

  // Get glyphs by category
  const getGlyphsByCategory = (category) => {
    return glyphs.filter(glyph => glyph.category === category);
  };

  // Get glyphs within a certain distance from user
  const getGlyphsWithinDistance = (userLat, userLng, maxDistance) => {
    return glyphs.filter(glyph => {
      const distance = LocationService.calculateDistance(
        userLat, userLng,
        glyph.latitude, glyph.longitude
      );
      return distance <= maxDistance;
    });
  };

  // Clear markers when switching modes
  const clearMarkersForModeSwitch = useCallback(() => {
    clearAllMarkers();
    // Also reset the rendered tracking
    glyphsRenderedRef.current.clear();
  }, []);

  // Record glyph discovery if user is close enough
  const handleGlyphDiscovery = async (user, userLocation, glyph, discoveryRadius = 50) => {
    if (!user || !userLocation) return;

    if (LocationService.isUserNearGlyph(userLocation.lat, userLocation.lng, glyph, discoveryRadius)) {
      try {
        await DiscoveryService.recordGlyphDiscovery(user.id, glyph.id, userLocation.lat, userLocation.lng);
        
        // Also update streak
        await StreakService.updateStreakOnDiscovery(user.id);
        
        console.log('Glyph discovery and streak recorded for user:', user.id);
      } catch (error) {
        console.log('Discovery already recorded or error:', error);
      }
    }
  };

  // Update memory filters
  const updateMemoryFilters = useCallback((newFilters) => {
    setMemoryFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Get memory statistics
  const getMemoryStats = useCallback(() => {
    const stats = {
      total: glyphs.length,
      byCategory: {},
      byTimeframe: {
        today: 0,
        week: 0,
        month: 0,
        year: 0
      }
    };
    
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    glyphs.forEach(glyph => {
      // Category stats
      stats.byCategory[glyph.category] = (stats.byCategory[glyph.category] || 0) + 1;
      
      // Time stats
      const glyphDate = new Date(glyph.created_at);
      if (glyphDate >= today) stats.byTimeframe.today++;
      if (glyphDate >= new Date(now - 7 * 24 * 60 * 60 * 1000)) stats.byTimeframe.week++;
      if (glyphDate >= new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())) stats.byTimeframe.month++;
      if (glyphDate >= new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())) stats.byTimeframe.year++;
    });
    
    return stats;
  }, [glyphs]);

  // Clear all data (useful for logout or reset)
  const resetGlyphData = () => {
    setGlyphs([]);
    setSelectedGlyph(null);
    setShowAddGlyph(false);
    setSelectedCoords(null);
    setGlyphError(null);
    setMemoryFilters({ category: 'all', timeframe: 'all' });
    clearAllMarkers();
  };

  return {
    // State
    glyphs,
    selectedGlyph,
    showAddGlyph,
    selectedCoords,
    isLoadingGlyphs,
    glyphError,
    memoryFilters,
    
    // Actions
    loadNearbyGlyphs,
    loadPersonalMemories,
    addGlyph,
    updateGlyph,
    removeGlyph,
    openAddGlyphModal,
    closeAddGlyphModal,
    openGlyphDetail,
    closeGlyphDetail,
    resetGlyphData,
    handleGlyphDiscovery,
    updateMemoryFilters,
    deleteGlyph,
    
    // Map marker management
    clearAllMarkers,
    isGlyphRendered,
    markGlyphAsRendered,
    addMarkerRef,
    
    // Utility functions
    getGlyphsByCategory,
    getGlyphsWithinDistance,
    getMemoryStats
  };
};