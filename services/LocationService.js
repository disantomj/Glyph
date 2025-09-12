export class LocationService {
  // Calculate distance between two coordinates (in meters) using Haversine formula
  static calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  // Check if user is within range of a glyph
  static isUserNearGlyph(userLat, userLng, glyph, radiusMeters = 20) {
    const distance = this.calculateDistance(
      userLat, userLng,
      glyph.latitude, glyph.longitude
    );
    return distance <= radiusMeters;
  }

  // Get the bearing (direction) from one point to another
  static getBearing(lat1, lng1, lat2, lng2) {
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δλ = (lng2 - lng1) * Math.PI/180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    const brng = Math.atan2(y, x) * 180/Math.PI;
    return (brng + 360) % 360; // Normalize to 0-360 degrees
  }

  // Convert bearing to compass direction
  static bearingToCompass(bearing) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(bearing / 22.5) % 16;
    return directions[index];
  }

  // Format distance for display
  static formatDistance(meters) {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    } else if (meters < 10000) {
      return `${(meters / 1000).toFixed(1)}km`;
    } else {
      return `${Math.round(meters / 1000)}km`;
    }
  }

  // Validate latitude value
  static isValidLatitude(lat) {
    return typeof lat === 'number' && lat >= -90 && lat <= 90;
  }

  // Validate longitude value
  static isValidLongitude(lng) {
    return typeof lng === 'number' && lng >= -180 && lng <= 180;
  }

  // Validate coordinate pair
  static isValidCoordinate(lat, lng) {
    return this.isValidLatitude(lat) && this.isValidLongitude(lng);
  }

  // Get location accuracy description
  static getAccuracyDescription(accuracyMeters) {
    if (accuracyMeters <= 5) return 'Excellent';
    if (accuracyMeters <= 10) return 'Good';
    if (accuracyMeters <= 20) return 'Fair';
    if (accuracyMeters <= 50) return 'Poor';
    return 'Very Poor';
  }

  // Check if GPS accuracy is sufficient for creating glyphs
  static isAccuracySufficient(accuracyMeters, threshold = 10) {
    return accuracyMeters <= threshold;
  }
}