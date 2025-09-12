import { useState, useRef, useCallback} from 'react';
import { GlyphService } from '../services/GlyphService';
import { LocationService } from '../services/LocationService';
import { DiscoveryService } from '../services/DiscoveryService';

export const useGlyphs = () => {
  const [glyphs, setGlyphs] = useState([]);
  const [selectedGlyph, setSelectedGlyph] = useState(null);
  const [showAddGlyph, setShowAddGlyph] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [isLoadingGlyphs, setIsLoadingGlyphs] = useState(false);
  const [glyphError, setGlyphError] = useState(null);
  
  const markersRef = useRef([]);
  const glyphsRenderedRef = useRef(new Set());

  // Load nearby glyphs using GlyphService
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

  // Record glyph discovery if user is close enough
  const handleGlyphDiscovery = async (user, userLocation, glyph, discoveryRadius = 50) => {
    if (!user || !userLocation) return;

    if (LocationService.isUserNearGlyph(userLocation.lat, userLocation.lng, glyph, discoveryRadius)) {
      try {
        await DiscoveryService.recordGlyphDiscovery(user.id, glyph.id, userLocation.lat, userLocation.lng);
        console.log('Glyph discovery recorded for user:', user.id);
      } catch (error) {
        console.log('Discovery already recorded or error:', error);
      }
    }
  };

  // Clear all data (useful for logout or reset)
  const resetGlyphData = () => {
    setGlyphs([]);
    setSelectedGlyph(null);
    setShowAddGlyph(false);
    setSelectedCoords(null);
    setGlyphError(null);
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
    
    // Actions
    loadNearbyGlyphs,
    addGlyph,
    updateGlyph,
    removeGlyph,
    openAddGlyphModal,
    closeAddGlyphModal,
    openGlyphDetail,
    closeGlyphDetail,
    resetGlyphData,
    handleGlyphDiscovery,
    
    // Map marker management
    clearAllMarkers,
    isGlyphRendered,
    markGlyphAsRendered,
    addMarkerRef,
    
    // Utility functions
    getGlyphsByCategory,
    getGlyphsWithinDistance
  };
};