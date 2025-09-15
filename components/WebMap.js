import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import AddGlyph from './AddGlyph';
import GlyphDetailModal from './GlyphDetailModal';
import ModeSwitcher from './ModeSwitcher';
import MemoryFilters from './MemoryFilters';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useLocation } from '../hooks/useLocation';
import { useGlyphs } from '../hooks/useGlyphs';
import { useMapbox } from '../hooks/useMapbox';
import { useStreak } from '../hooks/useStreak';
import { useAppMode } from '../hooks/useAppMode';
import { getCategoryIcon } from '../constants/categories';
import StreakDisplay from './StreakDisplay';
import { 
  LOCATION_CONFIG, 
  ERROR_MESSAGES,
  RATING_CONFIG 
} from '../constants/config';
import {
  COLORS,
  BUTTON_STYLES,
  CARD_STYLES,
  TEXT_STYLES,
  MESSAGE_STYLES,
  DESIGN_TOKENS,
  LAYOUT,
  APP_STYLES,
  mergeStyles
} from '../constants/styles';

export default function WebMap({ user, userProfile }) {
  console.log('WebMap rendering with user:', user?.email, 'profile:', userProfile?.username);

  // Use the location hook
  const { 
    userLocation, 
    locationError, 
    isLoadingLocation, 
    getUserLocation 
  } = useLocation();

  // Use the glyphs hook
  const {
    glyphs,
    selectedGlyph,
    showAddGlyph,
    selectedCoords,
    isLoadingGlyphs,
    glyphError,
    loadNearbyGlyphs,
    loadPersonalMemories,
    addGlyph,
    updateGlyph,
    removeGlyph,
    openAddGlyphModal,
    closeAddGlyphModal,
    openGlyphDetail,
    closeGlyphDetail,
    clearAllMarkers,
    isGlyphRendered,
    markGlyphAsRendered,
    addMarkerRef,
    handleGlyphDiscovery,
    updateMemoryFilters,
    deleteGlyph
  } = useGlyphs();

  // Use the mapbox hook
  const {
    mapContainer,
    map,
    initializeMap,
    centerMap,
    updateUserLocationMarker,
    createMarker
  } = useMapbox();

  // Use the streak hook
  const { streakData, recordDiscovery } = useStreak(user);

  // Use the app mode hook
  const { currentMode, switchMode, isPersonalMode, isExploreMode } = useAppMode('personal');

  // Add markers to map (only add new ones, don't recreate existing)
  const addMarkersToMap = () => {
    if (!map) return;

    console.log('Adding markers for glyphs:', glyphs.length);

    glyphs.forEach(glyph => {
      // Skip if this glyph is already rendered
      if (isGlyphRendered(glyph.id)) {
        return;
      }

      // Mark this glyph as rendered
      markGlyphAsRendered(glyph.id);

      // Create a stable marker element using ORIGINAL working approach
      const markerElement = document.createElement('div');
      const isHighRated = glyph.rating_avg >= RATING_CONFIG.HIGH_RATING_THRESHOLD && 
                   glyph.rating_count >= RATING_CONFIG.MIN_RATINGS_FOR_HIGHLIGHT;

      markerElement.innerHTML = getCategoryIcon(glyph.category);
      
      // Use original working styling approach but with design tokens
      markerElement.style.cssText = `
        font-size: ${DESIGN_TOKENS.typography.sizes['2xl']};
        cursor: pointer;
        filter: ${isHighRated 
          ? `drop-shadow(0 0 6px ${COLORS.glyphGlow || 'rgba(255, 193, 7, 0.8)'})` 
          : `drop-shadow(0 0 3px rgba(0,0,0,0.3))`};
        user-select: none;
        pointer-events: auto;
        display: block;
        line-height: 1;
        text-align: center;
        will-change: auto;
      `;
      markerElement.title = `${glyph.category}: ${glyph.text?.substring(0, 50)}...`;

      // Original working hover effects
      markerElement.addEventListener('mouseenter', () => {
        markerElement.style.opacity = '0.8';
      });
      
      markerElement.addEventListener('mouseleave', () => {
        markerElement.style.opacity = '1';
      });

      // CREATE MARKER DIRECTLY - bypass the hook that might be causing issues
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([glyph.longitude, glyph.latitude])
        .addTo(map);

      // Add click handler to marker element
      markerElement.addEventListener('click', async(e) => {
        e.stopPropagation();
        e.preventDefault();
        
        // Only handle discovery in explore mode (not for personal memories)
        if (isExploreMode) {
          await handleGlyphDiscovery(user, userLocation, glyph);
        }
        
        // Open detailed modal
        openGlyphDetail(glyph);
      });

      // Track the marker for cleanup using the hook's method
      if (marker) {
        addMarkerRef(marker);
      }
    });

    console.log('Total markers on map:', glyphs.length);
  };

  // Create glyph at user's current location
  const createGlyphHere = () => {
    if (!userLocation) {
      alert(ERROR_MESSAGES.LOCATION_NOT_AVAILABLE);
      return;
    }
    
    if (userLocation.accuracy > 10) {
      alert(ERROR_MESSAGES.GPS_ACCURACY_LOW);
      return;
    }
    
    // Use the hook's method to open the add glyph modal
    openAddGlyphModal({ lat: userLocation.lat, lng: userLocation.lng });
  };

  // Handle map load
  const handleMapLoad = () => {
    if (user) {
      getUserLocation();
    }
  };

  // Initialize map only once
  useEffect(() => {
    console.log('Map initialization effect running...');
    initializeMap(handleMapLoad);
  }, [user, initializeMap]);

  // Load glyphs when user location is obtained or mode changes
  useEffect(() => {
    if (userLocation) {
      if (isPersonalMode && user) {
        // Load personal memories
        loadPersonalMemories(user.id, 200);
      } else if (isExploreMode) {
        // Load nearby glyphs from others
        loadNearbyGlyphs(userLocation.lat, userLocation.lng, 200);
      }
      
      // Center map on user location using the hook's method
      centerMap(userLocation.lng, userLocation.lat, 16);
    }
  }, [userLocation, currentMode, user]);

  // Update markers when glyphs change
  useEffect(() => {
    if (map && glyphs.length > 0) {
      addMarkersToMap();
    }
  }, [glyphs, map]);

  // Update user location marker when location changes
  useEffect(() => {
    updateUserLocationMarker(userLocation);
  }, [userLocation, updateUserLocationMarker]);

  // Clear markers when mode changes
  useEffect(() => {
    if (user) {
      clearAllMarkers();
    }
  }, [currentMode, user]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      
      {/* Mode Switcher - only show when user is logged in */}
      {user && (
        <ModeSwitcher 
          currentMode={currentMode} 
          onModeChange={switchMode} 
        />
      )}

      {/* Memory Filters - only show in personal mode */}
      {user && isPersonalMode && (
        <MemoryFilters 
          onFilterChange={updateMemoryFilters}
          memoryCount={glyphs.length}
        />
      )}
      
      {/* Location controls */}
      {user && (
        <div style={{
          position: 'absolute',
          top: DESIGN_TOKENS.spacing[5],
          left: DESIGN_TOKENS.spacing[2],
          zIndex: DESIGN_TOKENS.zIndex.overlay,
          display: 'flex',
          flexDirection: 'column',
          gap: DESIGN_TOKENS.spacing[2]
        }}>
          <button
            onClick={getUserLocation}
            disabled={isLoadingLocation}
            style={mergeStyles(
              BUTTON_STYLES.base,
              isLoadingLocation ? BUTTON_STYLES.disabled : BUTTON_STYLES.info,
              {
                display: 'flex',
                alignItems: 'center',
                gap: DESIGN_TOKENS.spacing[2],
                backdropFilter: 'blur(8px)',
                backgroundColor: `${COLORS.info}EE`,
                boxShadow: DESIGN_TOKENS.shadows.lg
              }
            )}
          >
            <span style={{ fontSize: DESIGN_TOKENS.typography.sizes.sm }}>
              {isLoadingLocation ? '⏳' : '🧭'}
            </span>
            {isLoadingLocation ? 'Finding Location...' : 'Find My Location'}
          </button>
          
          {userLocation && (
            <button
              onClick={createGlyphHere}
              style={mergeStyles(
                BUTTON_STYLES.base,
                BUTTON_STYLES.success,
                {
                  display: 'flex',
                  alignItems: 'center',
                  gap: DESIGN_TOKENS.spacing[2],
                  backdropFilter: 'blur(8px)',
                  backgroundColor: `${COLORS.success}EE`,
                  boxShadow: DESIGN_TOKENS.shadows.lg
                }
              )}
            >
              <span style={{ fontSize: DESIGN_TOKENS.typography.sizes.sm }}>
                {isPersonalMode ? '💭' : '✨'}
              </span>
              {isPersonalMode ? 'Save Memory Here' : 'Create Glyph Here'}
            </button>
          )}
        </div>
      )}

      {/* Error displays */}
      {locationError && (
        <div style={mergeStyles(MESSAGE_STYLES.base, MESSAGE_STYLES.error, {
          position: 'absolute',
          top: DESIGN_TOKENS.spacing[2],
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: DESIGN_TOKENS.zIndex.overlay,
          maxWidth: '300px',
          textAlign: 'center',
          backdropFilter: 'blur(8px)',
          backgroundColor: `${COLORS.errorLight}F0`,
          boxShadow: DESIGN_TOKENS.shadows.lg
        })}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: DESIGN_TOKENS.spacing[2]
          }}>
            <span style={{ fontSize: DESIGN_TOKENS.typography.sizes.lg }}>⚠️</span>
            <span>{locationError}</span>
          </div>
        </div>
      )}

      {glyphError && (
        <div style={mergeStyles(MESSAGE_STYLES.base, MESSAGE_STYLES.error, {
          position: 'absolute',
          top: DESIGN_TOKENS.spacing[12],
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: DESIGN_TOKENS.zIndex.overlay,
          maxWidth: '300px',
          textAlign: 'center',
          backdropFilter: 'blur(8px)',
          backgroundColor: `${COLORS.errorLight}F0`,
          boxShadow: DESIGN_TOKENS.shadows.lg
        })}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: DESIGN_TOKENS.spacing[2]
          }}>
            <span style={{ fontSize: DESIGN_TOKENS.typography.sizes.lg }}>❌</span>
            <span>{glyphError}</span>
          </div>
        </div>
      )}

      {/* Loading indicator for glyphs */}
      {isLoadingGlyphs && (
        <div style={mergeStyles(CARD_STYLES.glass, {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: `${DESIGN_TOKENS.spacing[4]} ${DESIGN_TOKENS.spacing[5]}`,
          zIndex: DESIGN_TOKENS.zIndex.overlay,
          textAlign: 'center',
          backdropFilter: 'blur(12px)',
          boxShadow: DESIGN_TOKENS.shadows.xl
        })}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: DESIGN_TOKENS.spacing[3]
          }}>
            <div style={{
              width: DESIGN_TOKENS.spacing[5],
              height: DESIGN_TOKENS.spacing[5],
              border: `3px solid ${COLORS.primary}30`,
              borderTop: `3px solid ${COLORS.primary}`,
              borderRadius: DESIGN_TOKENS.radius.full,
              animation: 'spin 1s linear infinite'
            }} />
            <span style={mergeStyles(TEXT_STYLES.body, {
              color: COLORS.textPrimary,
              fontWeight: DESIGN_TOKENS.typography.weights.medium
            })}>
              {isPersonalMode ? 'Loading memories...' : 'Loading nearby glyphs...'}
            </span>
          </div>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      )}

      {/* Streak Display */}
      {user && streakData && (
        <div style={{
          position: 'absolute',
          top: DESIGN_TOKENS.spacing[32],
          left: DESIGN_TOKENS.spacing[5],
          zIndex: DESIGN_TOKENS.zIndex.overlay
        }}>
          <StreakDisplay streakData={streakData} compact={true} />
        </div>
      )}

      {/* Location info */}
      {userLocation && (
        <div style={mergeStyles(CARD_STYLES.glass, {
          position: 'absolute',
          bottom: DESIGN_TOKENS.spacing[2],
          left: DESIGN_TOKENS.spacing[2],
          padding: `${DESIGN_TOKENS.spacing[2]} ${DESIGN_TOKENS.spacing[3]}`,
          zIndex: DESIGN_TOKENS.zIndex.overlay,
          backdropFilter: 'blur(12px)',
          border: `1px solid ${COLORS.borderLight}50`
        })}>
          <div style={mergeStyles(TEXT_STYLES.caption, {
            fontWeight: DESIGN_TOKENS.typography.weights.medium,
            color: COLORS.textPrimary,
            display: 'flex',
            alignItems: 'center',
            gap: DESIGN_TOKENS.spacing[1],
            marginBottom: DESIGN_TOKENS.spacing[1]
          })}>
            <span style={{ 
              fontSize: DESIGN_TOKENS.typography.sizes.sm,
              filter: `drop-shadow(0 0 3px ${COLORS.primary})`
            }}>
              📍
            </span>
            {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
          </div>
          
          <div style={mergeStyles(TEXT_STYLES.caption, {
            color: COLORS.textMuted,
            fontSize: DESIGN_TOKENS.typography.sizes.xs,
            marginBottom: DESIGN_TOKENS.spacing[1]
          })}>
            Accuracy: ±{Math.round(userLocation.accuracy)}m
          </div>
          
          {user && (
            <div style={mergeStyles(TEXT_STYLES.caption, {
              color: COLORS.textSecondary,
              fontSize: DESIGN_TOKENS.typography.sizes.xs,
              display: 'flex',
              alignItems: 'center',
              gap: DESIGN_TOKENS.spacing[1]
            })}>
              <span style={{
                width: DESIGN_TOKENS.spacing[2],
                height: DESIGN_TOKENS.spacing[2],
                borderRadius: DESIGN_TOKENS.radius.full,
                backgroundColor: glyphs.length > 0 ? COLORS.success : COLORS.textMuted,
                display: 'inline-block',
                animation: glyphs.length > 0 ? 'gentle-pulse 2s infinite' : 'none'
              }} />
              {isPersonalMode 
                ? `${glyphs.length} memories nearby` 
                : `${glyphs.length} discoveries nearby`
              }
            </div>
          )}
          
          <style>
            {`
              @keyframes gentle-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.6; }
              }
            `}
          </style>
        </div>
      )}

      {/* Map Attribution Enhancement */}
      <div style={{
        position: 'absolute',
        bottom: DESIGN_TOKENS.spacing[1],
        right: DESIGN_TOKENS.spacing[1],
        zIndex: DESIGN_TOKENS.zIndex.base + 1,
        fontSize: DESIGN_TOKENS.typography.sizes.xs,
        color: COLORS.textMuted,
        backgroundColor: `${COLORS.bgPrimary}CC`,
        padding: `${DESIGN_TOKENS.spacing[1]} ${DESIGN_TOKENS.spacing[2]}`,
        borderRadius: DESIGN_TOKENS.radius.sm,
        backdropFilter: 'blur(4px)'
      }}>
        <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: DESIGN_TOKENS.spacing[1]
        }}>
          <span style={{ filter: `drop-shadow(0 0 2px ${COLORS.primary})` }}>🗺️</span>
          Glyph Explorer
        </span>
      </div>

      {/* Add Glyph Modal */}
      {showAddGlyph && (
        <AddGlyph 
          coordinates={selectedCoords}
          onClose={closeAddGlyphModal}
          onGlyphCreated={addGlyph}
          user={user}
          isMemoryMode={isPersonalMode}
        />
      )}

      {/* Glyph Detail Modal */}
      {selectedGlyph && (
        <GlyphDetailModal
          glyph={selectedGlyph}
          user={user}
          onClose={closeGlyphDetail}
          onGlyphUpdated={updateGlyph}
          onGlyphDeleted={(glyphId) => {
            // Remove the glyph from the map immediately
            removeGlyph(glyphId);
            // Close the detail modal since the glyph is now deleted
            closeGlyphDetail();
          }}
        />
      )}
    </div>
  );
}