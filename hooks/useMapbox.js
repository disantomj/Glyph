import { useRef, useEffect, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';

export const useMapbox = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const userMarkerRef = useRef(null);
  const isMapInitialized = useRef(false);

  // Initialize the map
  const initializeMap = useCallback((onMapLoad) => {
    if (map.current || isMapInitialized.current) return; // Prevent multiple initialization
    
    console.log('Initializing Mapbox...');
    
    // Check for token
    if (!process.env.EXPO_PUBLIC_MAPBOX_TOKEN) {
      console.error('Mapbox token not found');
      return;
    }

    mapboxgl.accessToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
    console.log('Creating map with token:', process.env.EXPO_PUBLIC_MAPBOX_TOKEN ? 'Token exists' : 'No token');
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.0060, 40.7128], // Default to NYC
      zoom: 10
    });

    map.current.on('load', () => {
      console.log('Map loaded successfully');
      isMapInitialized.current = true;
      if (onMapLoad) {
        onMapLoad();
      }
    });

    map.current.on('error', (e) => {
      console.error('Map error:', e);
    });
  }, []);

  // Center map on coordinates with animation
  const centerMap = useCallback((lng, lat, zoom = 16) => {
    if (!map.current) return;

    map.current.flyTo({
      center: [lng, lat],
      zoom: zoom,
      duration: 1500
    });
  }, []);

  // Add or update user location marker
  const updateUserLocationMarker = useCallback((userLocation) => {
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

    console.log('User location marker updated');
  }, []);

  // Remove user location marker
  const removeUserLocationMarker = useCallback(() => {
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }, []);

  // Create a generic marker on the map
  const createMarker = useCallback((lng, lat, element, options = {}) => {
    if (!map.current) return null;

    const marker = new mapboxgl.Marker({
      element: element,
      anchor: options.anchor || 'bottom',
      offset: options.offset || [0, 0],
      ...options
    })
      .setLngLat([lng, lat])
      .addTo(map.current);

    return marker;
  }, []);

  // Get map bounds
  const getMapBounds = useCallback(() => {
    if (!map.current) return null;
    return map.current.getBounds();
  }, []);

  // Get map center
  const getMapCenter = useCallback(() => {
    if (!map.current) return null;
    const center = map.current.getCenter();
    return { lng: center.lng, lat: center.lat };
  }, []);

  // Get map zoom level
  const getMapZoom = useCallback(() => {
    if (!map.current) return null;
    return map.current.getZoom();
  }, []);

  // Add click handler to map
  const addMapClickHandler = useCallback((handler) => {
    if (!map.current) return;
    map.current.on('click', handler);
  }, []);

  // Remove click handler from map
  const removeMapClickHandler = useCallback((handler) => {
    if (!map.current) return;
    map.current.off('click', handler);
  }, []);

  // Resize map (useful when container size changes)
  const resizeMap = useCallback(() => {
    if (map.current) {
      map.current.resize();
    }
  }, []);

  // Set map style
  const setMapStyle = useCallback((styleUrl) => {
    if (!map.current) return;
    map.current.setStyle(styleUrl);
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log('Cleaning up Mapbox resources...');
    
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    isMapInitialized.current = false;
  }, []);

  // Effect to handle cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    // Refs for external use
    mapContainer,
    map: map.current,
    
    // Map operations
    initializeMap,
    centerMap,
    resizeMap,
    setMapStyle,
    cleanup,
    
    // Marker operations
    updateUserLocationMarker,
    removeUserLocationMarker,
    createMarker,
    
    // Map info
    getMapBounds,
    getMapCenter,
    getMapZoom,
    
    // Event handlers
    addMapClickHandler,
    removeMapClickHandler,
    
    // State
    isInitialized: isMapInitialized.current
  };
};