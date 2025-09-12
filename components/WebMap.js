import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import AddGlyph from './AddGlyph';
import GlyphDetailModal from './GlyphDetailModal';
import 'mapbox-gl/dist/mapbox-gl.css';
import { GlyphService } from '../services/GlyphService';

export default function WebMap({ user, userProfile }) {
  console.log('WebMap rendering with user:', user?.email, 'profile:', userProfile?.username);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [showAddGlyph, setShowAddGlyph] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [selectedGlyph, setSelectedGlyph] = useState(null);
  const [glyphs, setGlyphs] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const glyphsRenderedRef = useRef(new Set()); // Track which glyphs have been rendered

  // Category icons mapping
  const categoryIcons = {
    'Hint': '💡',
    'Warning': '⚠️',
    'Secret': '💰',
    'Praise': '❤️',
    'Lore': '👁️'
  };

  // Request user location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const location = { lat: latitude, lng: longitude, accuracy };
        
        console.log('User location obtained:', location);
        setUserLocation(location);
        setIsLoadingLocation(false);

        // Load nearby glyphs once we have user location
        loadNearbyGlyphs(latitude, longitude);

        // Center map on user location
        if (map.current) {
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 16
          });
        }
      },
      (error) => {
        console.error('Location error:', error);
        setIsLoadingLocation(false);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied by user');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out');
            break;
          default:
            setLocationError('An unknown error occurred');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0
      }
    );
  };

  // Add or update user location marker
  const updateUserLocationMarker = () => {
    if (!map.current || !userLocation) return;

    // Remove existing user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    // Create user location marker element
    const userMarkerElement = document.createElement('div');
    userMarkerElement.innerHTML = '📍';
    userMarkerElement.style.fontSize = '24px';
    userMarkerElement.style.filter = 'drop-shadow(0 0 3px rgba(0,0,255,0.7))';
    userMarkerElement.title = `Your location (±${Math.round(userLocation.accuracy)}m accuracy)`;

    // Create and add user marker
    userMarkerRef.current = new mapboxgl.Marker(userMarkerElement)
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current);
  };

  // Load nearby glyphs using GlyphService
  const loadNearbyGlyphs = async (userLat, userLng) => {
    try {
      const nearbyGlyphs = await GlyphService.loadNearbyGlyphs(userLat, userLng, 200);
      setGlyphs(nearbyGlyphs);
    } catch (error) {
      console.error('Failed to load nearby glyphs:', error);
    }
  };

  // Clear all existing glyph markers
  const clearAllMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    glyphsRenderedRef.current.clear();
  };

  // Add markers to map (only add new ones, don't recreate existing)
  const addMarkersToMap = () => {
    if (!map.current) return;

    console.log('Adding markers for glyphs:', glyphs.length);

    glyphs.forEach(glyph => {
      // Skip if this glyph is already rendered
      if (glyphsRenderedRef.current.has(glyph.id)) {
        return;
      }

      // Mark this glyph as rendered
      glyphsRenderedRef.current.add(glyph.id);

      // Create a stable marker element
      const markerElement = document.createElement('div');
      const isHighRated = glyph.rating_avg >= 4.0 && glyph.rating_count >= 3;
      
      markerElement.innerHTML = categoryIcons[glyph.category] || '📍';
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

      // Simplified hover effects that don't interfere with positioning
      markerElement.addEventListener('mouseenter', () => {
        markerElement.style.opacity = '0.8';
      });
      
      markerElement.addEventListener('mouseleave', () => {
        markerElement.style.opacity = '1';
      });

      // Create marker with stable options
      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: 'bottom',
        offset: [0, 0]
      })
        .setLngLat([glyph.longitude, glyph.latitude])
        .addTo(map.current);

      // Add click handler to marker element
      markerElement.addEventListener('click', async(e) => {
        e.stopPropagation();
        e.preventDefault();
        
        // Track discovery if user is close enough and logged in
        if (user && userLocation && GlyphService.isUserNearGlyph(userLocation.lat, userLocation.lng, glyph, 50)) {
          try {
            await GlyphService.recordGlyphDiscovery(user.id, glyph.id, userLocation.lat, userLocation.lng);
            console.log('Glyph discovery recorded for user:', user.id);
          } catch (error) {
            console.log('Discovery already recorded or error:', error);
          }
        }
        
        // Open detailed modal
        setSelectedGlyph(glyph);
      });

      markersRef.current.push(marker);
    });

    console.log('Total markers on map:', markersRef.current.length);
  };

  // Create glyph at user's current location
  const createGlyphHere = () => {
    if (!userLocation) {
      alert('Location not available. Please enable location services and try again.');
      return;
    }
    
    if (userLocation.accuracy > 10) {
      alert(`GPS accuracy is too low (±${Math.round(userLocation.accuracy)}m). Please move to an open area and try again.`);
      return;
    }
    
    setSelectedCoords({ lat: userLocation.lat, lng: userLocation.lng });
    setShowAddGlyph(true);
  };

  // Initialize map only once
  useEffect(() => {
    console.log('Map effect running...');
    
    if (map.current) return; // Initialize map only once
    
    mapboxgl.accessToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
    console.log('Creating map with token:', process.env.EXPO_PUBLIC_MAPBOX_TOKEN ? 'Token exists' : 'No token');
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.0060, 40.7128],
      zoom: 10
    });

    map.current.on('load', () => {
      console.log('Map loaded successfully');
      if (user) {
        getUserLocation();
      }
    });

    // Cleanup function
    return () => {
      if (map.current) {
        clearAllMarkers();
        if (userMarkerRef.current) {
          userMarkerRef.current.remove();
        }
      }
    };
  }, [user]); // Empty dependency array - run only once

  // Update markers when glyphs change (but don't clear existing ones)
  useEffect(() => {
    if (map.current && glyphs.length > 0) {
      addMarkersToMap();
    }
  }, [glyphs]); // Only depend on glyphs array

  // Update user location marker when location changes
  useEffect(() => {
    updateUserLocationMarker();
  }, [userLocation]);

  const handleGlyphCreated = (newGlyph) => {
    setShowAddGlyph(false);
    // Add the new glyph to the list
    setGlyphs(prev => [...prev, newGlyph]);
  };

  const handleGlyphUpdated = (updatedGlyph) => {
    // Update the glyph in the list
    setGlyphs(prev => prev.map(g => g.id === updatedGlyph.id ? updatedGlyph : g));
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      
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
            ✨ Create Glyph Here
          </button>
        )}
      </div>
    )}

      {/* Location error display */}
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
        </div>
      )}

      {/* Add Glyph Modal */}
      {showAddGlyph && (
        <AddGlyph 
          coordinates={selectedCoords}
          onClose={() => setShowAddGlyph(false)}
          onGlyphCreated={handleGlyphCreated}
          user={user}
        />
      )}

      {/* Glyph Detail Modal */}
      {selectedGlyph && (
        <GlyphDetailModal
          glyph={selectedGlyph}
          user={user}
          onClose={() => setSelectedGlyph(null)}
          onGlyphUpdated={handleGlyphUpdated}
        />
      )}
    </div>
  );
}