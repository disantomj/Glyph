import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import AddGlyph from './AddGlyph';
import { supabase } from '../lib/supabase';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function WebMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [showAddGlyph, setShowAddGlyph] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [glyphs, setGlyphs] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const markersRef = useRef([]); // Keep track of markers for cleanup
  const userMarkerRef = useRef(null); // Keep track of user location marker

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
        maximumAge: 0 // Accept cached location up to 1 minute old
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

  // Load glyphs from database
  const loadGlyphs = async () => {
    try {
      const { data, error } = await supabase
        .from('glyphs')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error loading glyphs:', error);
      } else {
        console.log('Loaded glyphs from database:', data);
        console.log('Number of glyphs loaded:', data?.length);
        setGlyphs(data || []);
      }
    } catch (err) {
      console.error('Unexpected error loading glyphs:', err);
    }
  };

  // Clear existing markers
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  // Add markers to map
  const addMarkersToMap = () => {
    if (!map.current) return;

    console.log('Adding markers for glyphs:', glyphs);
    console.log('Number of glyphs to display:', glyphs.length);

    clearMarkers();

    glyphs.forEach(glyph => {
      // Create a custom marker element
      const markerElement = document.createElement('div');
      markerElement.innerHTML = categoryIcons[glyph.category] || '📍';
      markerElement.style.fontSize = '24px';
      markerElement.style.cursor = 'pointer';
      markerElement.title = `${glyph.category}: ${glyph.text?.substring(0, 50)}...`;

      // Create and add marker
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([glyph.longitude, glyph.latitude])
        .addTo(map.current);

      // Add click handler to marker
      markerElement.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent map click
        
        // Create popup with glyph info
        new mapboxgl.Popup()
          .setLngLat([glyph.longitude, glyph.latitude])
          .setHTML(`
            <div style="padding: 10px;">
              <h4>${categoryIcons[glyph.category]} ${glyph.category}</h4>
              <p>${glyph.text}</p>
              <small>Created: ${new Date(glyph.created_at).toLocaleDateString()}</small>
            </div>
          `)
          .addTo(map.current);
      });

      markersRef.current.push(marker);
    });
  };

  // Create glyph at user's current location
  const createGlyphHere = () => {
  if (!userLocation) {
    alert('Location not available. Please enable location services and try again.');
    return;
  }
  
  if (userLocation.accuracy > 10) { // Only allow if accuracy is within 10 meters
    alert(`GPS accuracy is too low (±${Math.round(userLocation.accuracy)}m). Please move to an open area and try again.`);
    return;
  }
  
  setSelectedCoords({ lat: userLocation.lat, lng: userLocation.lng });
  setShowAddGlyph(true);
};

  useEffect(() => {
    console.log('Map effect running...');
    
    if (map.current) return; // initialize map only once
    
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
      loadGlyphs(); // Load glyphs when map is ready
      getUserLocation(); // Get user location when map is ready
    });

    // Remove the old click handler for glyph creation
    // Users will now use the "Create Glyph Here" button instead
  }, []);

  // Add markers when glyphs change
  useEffect(() => {
    if (map.current && glyphs.length > 0) {
      addMarkersToMap();
    }
  }, [glyphs]);

  // Update user location marker when location changes
  useEffect(() => {
    updateUserLocationMarker();
  }, [userLocation]);

  const handleGlyphCreated = () => {
    setShowAddGlyph(false);
    loadGlyphs(); // Reload glyphs to show the new one
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      
      {/* Location controls */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
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
            borderRadius: '4px',
            cursor: isLoadingLocation ? 'not-allowed' : 'pointer',
            fontSize: '14px'
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
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ✨ Create Glyph Here
          </button>
        )}
      </div>

      {/* Location error display */}
      {locationError && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: '#dc3545',
          color: 'white',
          padding: '10px',
          borderRadius: '4px',
          zIndex: 1000,
          maxWidth: '300px'
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
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 1000
        }}>
          Location: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
          <br />
          Accuracy: ±{Math.round(userLocation.accuracy)}m
        </div>
      )}

      {showAddGlyph && (
        <AddGlyph 
          coordinates={selectedCoords}
          onClose={() => setShowAddGlyph(false)}
          onGlyphCreated={handleGlyphCreated}
        />
      )}
    </div>
  );
}