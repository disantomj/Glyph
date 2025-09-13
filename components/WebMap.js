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
    openAddGlyphModal,
    closeAddGlyphModal,
    openGlyphDetail,
    closeGlyphDetail,
    clearAllMarkers,
    isGlyphRendered,
    markGlyphAsRendered,
    addMarkerRef,
    handleGlyphDiscovery,
    updateMemoryFilters
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

      // Create a stable marker element
      const markerElement = document.createElement('div');
      const isHighRated = glyph.rating_avg >= RATING_CONFIG.HIGH_RATING_THRESHOLD && 
                   glyph.rating_count >= RATING_CONFIG.MIN_RATINGS_FOR_HIGHLIGHT;

      
      markerElement.innerHTML = getCategoryIcon(glyph.category);
      markerElement.style.cssText = `
        font-size: 24px;
        cursor: pointer;
        filter: ${isHighRated 
          ? 'drop-shadow(0 0 6px rgba(255, 193, 7, 0.8))' 
          : 'drop-shadow(0 0 3px rgba(0,0,0,0.3))'};
        user-select: none;
        pointer-events: auto;
        display: block;
        line-height: 1;
        text-align: center;
        will-change: auto;
      `;
      markerElement.title = `${glyph.category}: ${glyph.text?.substring(0, 50)}...`;

      // Simplified hover effects
      markerElement.addEventListener('mouseenter', () => {
        markerElement.style.opacity = '0.8';
      });
      
      markerElement.addEventListener('mouseleave', () => {
        markerElement.style.opacity = '1';
      });

      // Create marker using the hook's method
      const marker = createMarker(glyph.longitude, glyph.latitude, markerElement);

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

      // Track the marker using the hook's method
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
        top: '10px',
        left: '10px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <button
          onClick={getUserLocation}
          disabled={isLoadingLocation}
          style={{
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isLoadingLocation ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 2px 8px rgba(0,123,255,0.3)',
            transition: 'all 0.2s'
          }}
        >
          {isLoadingLocation ? 'Finding Location...' : '📍 Find My Location'}
        </button>
        
        {userLocation && (
          <button
            onClick={createGlyphHere}
            style={{
              padding: '10px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 2px 8px rgba(40,167,69,0.3)',
              transition: 'all 0.2s'
            }}
          >
            {isPersonalMode ? '💭 Save Memory Here' : '✨ Create Glyph Here'}
          </button>
        )}
      </div>
    )}

      {/* Error displays */}
      {locationError && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#dc3545',
          color: 'white',
          padding: '10px 15px',
          borderRadius: '8px',
          zIndex: 1000,
          maxWidth: '300px',
          textAlign: 'center',
          fontSize: '14px',
          boxShadow: '0 2px 8px rgba(220,53,69,0.3)'
        }}>
          {locationError}
        </div>
      )}

      {glyphError && (
        <div style={{
          position: 'absolute',
          top: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#dc3545',
          color: 'white',
          padding: '10px 15px',
          borderRadius: '8px',
          zIndex: 1000,
          maxWidth: '300px',
          textAlign: 'center',
          fontSize: '14px',
          boxShadow: '0 2px 8px rgba(220,53,69,0.3)'
        }}>
          {glyphError}
        </div>
      )}

      {/* Loading indicator for glyphs */}
      {isLoadingGlyphs && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '15px 20px',
          borderRadius: '8px',
          zIndex: 1000,
          textAlign: 'center',
          fontSize: '14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {isPersonalMode ? 'Loading memories...' : 'Loading nearby glyphs...'}
        </div>
      )}

      {/* Streak Display */}
      {user && streakData && (
        <div style={{
          position: 'absolute',
          top: '180px',
          right: '20px',
          zIndex: 1000
        }}>
          <StreakDisplay streakData={streakData} compact={true} />
        </div>
      )}

      {/* Location info */}
      {userLocation && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e1e5e9'
        }}>
          <div style={{ fontWeight: '500', color: '#333' }}>
            📍 {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
          </div>
          <div style={{ color: '#666', marginTop: '2px' }}>
            Accuracy: ±{Math.round(userLocation.accuracy)}m
          </div>
          {user && (
            <div style={{ color: '#666', marginTop: '2px', fontSize: '11px' }}>
              {isPersonalMode ? `${glyphs.length} memories nearby` : `${glyphs.length} discoveries nearby`}
            </div>
          )}
        </div>
      )}

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
        />
      )}
    </div>
  );
}