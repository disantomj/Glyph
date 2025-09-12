import { useState } from 'react';

export const useLocation = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

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

  const clearLocationError = () => {
    setLocationError(null);
  };

  const resetLocation = () => {
    setUserLocation(null);
    setLocationError(null);
    setIsLoadingLocation(false);
  };

  return {
    userLocation,
    locationError,
    isLoadingLocation,
    getUserLocation,
    clearLocationError,
    resetLocation
  };
};