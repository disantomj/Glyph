import { useState, useEffect, useCallback } from 'react';
import { ProximityService } from '../services/ProximityService';
import { DiscoveryService } from '../services/DiscoveryService';

export const useProximity = (user, userLocation, glyphs) => {
  const [undiscoveredGlyphs, setUndiscoveredGlyphs] = useState([]);
  const [proximityTrackingId, setProximityTrackingId] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(false);

  // Filter out already discovered glyphs
  const updateUndiscoveredGlyphs = useCallback(async () => {
    if (!user || !glyphs || glyphs.length === 0) {
      setUndiscoveredGlyphs([]);
      return;
    }

    try {
      const undiscovered = [];
      
      for (const glyph of glyphs) {
        const hasDiscovered = await DiscoveryService.hasUserDiscoveredGlyph(user.id, glyph.id);
        if (!hasDiscovered) {
          undiscovered.push(glyph);
        }
      }
      
      setUndiscoveredGlyphs(undiscovered);
    } catch (error) {
      console.error('Error filtering undiscovered glyphs:', error);
      setUndiscoveredGlyphs(glyphs); // Fallback to showing all glyphs
    }
  }, [user, glyphs]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    const granted = await ProximityService.requestNotificationPermission();
    setNotificationPermission(granted);

    if (granted) {
        console.log('Notifications enabled successfully');
    } else {
        console.log('Notification permission denied');
    }

    return granted;
  }, []);

  // Start proximity tracking
  const startProximityTracking = useCallback(() => {
    if (!user || proximityTrackingId) return;

    const getCurrentLocation = () => userLocation;
    
    const trackingId = ProximityService.startProximityTracking(
      user.id,
      getCurrentLocation,
      15000 // Check every 15 seconds
    );
    
    setProximityTrackingId(trackingId);
    console.log('Proximity tracking started');
  }, [user, userLocation, proximityTrackingId]);

  // Stop proximity tracking
  const stopProximityTracking = useCallback(() => {
    if (proximityTrackingId) {
      ProximityService.stopProximityTracking(proximityTrackingId);
      setProximityTrackingId(null);
      console.log('Proximity tracking stopped');
    }
  }, [proximityTrackingId]);

  // Manual proximity check
  const checkProximityNow = useCallback(async () => {
    if (!user || !userLocation) return [];

    try {
      const nearbyUndiscovered = await ProximityService.checkProximity(
        user.id,
        userLocation.lat,
        userLocation.lng
      );
      return nearbyUndiscovered;
    } catch (error) {
      console.error('Error checking proximity:', error);
      return [];
    }
  }, [user, userLocation]);

  // Clear notification history
  const clearNotificationHistory = useCallback(() => {
    ProximityService.clearNotificationHistory();
  }, []);

  // Update undiscovered glyphs when dependencies change
  useEffect(() => {
    updateUndiscoveredGlyphs();
  }, [updateUndiscoveredGlyphs]);

  // Handle proximity tracking lifecycle
  useEffect(() => {
    if (user && userLocation && undiscoveredGlyphs.length > 0) {
      // Start tracking when conditions are met
      if (!proximityTrackingId) {
        startProximityTracking();
      }
    } else {
      // Stop tracking when conditions aren't met
      stopProximityTracking();
    }

    // Cleanup on unmount
    return () => {
      stopProximityTracking();
    };
  }, [user, userLocation, undiscoveredGlyphs.length, startProximityTracking, stopProximityTracking]);

  // Request permissions on mount if user is present
  useEffect(() => {
    if (user) {
      requestNotificationPermission();
    }
  }, [user, requestNotificationPermission]);

  useEffect(() => {
  // Check current notification permission status
    if ("Notification" in window) {
        setNotificationPermission(Notification.permission === "granted");
    }
    }, []);

  return {
    undiscoveredGlyphs,
    notificationPermission,
    isTrackingProximity: !!proximityTrackingId,
    
    // Actions
    requestNotificationPermission,
    startProximityTracking,
    stopProximityTracking,
    checkProximityNow,
    clearNotificationHistory,
    
    // Utility
    proximityStatus: userLocation ? 
      ProximityService.getProximityStatus(
        userLocation.lat, 
        userLocation.lng, 
        undiscoveredGlyphs
      ) : null
  };
};