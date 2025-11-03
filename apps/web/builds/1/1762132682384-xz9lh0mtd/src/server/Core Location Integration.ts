```typescript
/**
 * @fileoverview Core location service for handling geolocation functionality
 */

import { GeolocationError } from './types';

/**
 * Location coordinates interface
 * @interface
 */
interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

/**
 * Location options interface
 * @interface  
 */
interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

/**
 * Core location service class
 */
export class LocationService {
  private static instance: LocationService;
  private watchId: number | null = null;
  private defaultOptions: LocationOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };

  private constructor() {
    if (!this.isGeolocationAvailable()) {
      throw new Error('Geolocation is not supported by this browser');
    }
  }

  /**
   * Get singleton instance
   * @returns {LocationService} LocationService instance
   */
  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Check if geolocation is available
   * @returns {boolean} Whether geolocation is supported
   */
  private isGeolocationAvailable(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Get current position
   * @param {LocationOptions} options - Geolocation options
   * @returns {Promise<Coordinates>} Location coordinates
   */
  public async getCurrentPosition(options: LocationOptions = {}): Promise<Coordinates> {
    const geolocationOptions = { ...this.defaultOptions, ...options };

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, geolocationOptions);
      });

      return this.formatCoordinates(position.coords);
    } catch (error) {
      throw this.handleLocationError(error as GeolocationPositionError);
    }
  }

  /**
   * Watch position changes
   * @param {(coords: Coordinates) => void} successCallback - Success callback
   * @param {(error: GeolocationError) => void} errorCallback - Error callback
   * @param {LocationOptions} options - Geolocation options
   * @returns {number} Watch ID
   */
  public watchPosition(
    successCallback: (coords: Coordinates) => void,
    errorCallback: (error: GeolocationError) => void,
    options: LocationOptions = {}
  ): number {
    const geolocationOptions = { ...this.defaultOptions, ...options };

    this.watchId = navigator.geolocation.watchPosition(
      (position: GeolocationPosition) => {
        successCallback(this.formatCoordinates(position.coords));
      },
      (error: GeolocationPositionError) => {
        errorCallback(this.handleLocationError(error));
      },
      geolocationOptions
    );

    return this.watchId;
  }

  /**
   * Clear position watch
   * @param {number} watchId - Watch ID to clear
   */
  public clearWatch(watchId?: number): void {
    if (watchId || this.watchId) {
      navigator.geolocation.clearWatch(watchId || this.watchId!);
      this.watchId = null;
    }
  }

  /**
   * Format coordinates to standard format
   * @param {GeolocationCoordinates} coords - Raw coordinates
   * @returns {Coordinates} Formatted coordinates
   */
  private formatCoordinates(coords: GeolocationCoordinates): Coordinates {
    return {
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      altitude: coords.altitude,
      altitudeAccuracy: coords.altitudeAccuracy,
      heading: coords.heading,
      speed: coords.speed
    };
  }

  /**
   * Handle location errors
   * @param {GeolocationPositionError} error - Geolocation error
   * @returns {GeolocationError} Formatted error
   */
  private handleLocationError(error: GeolocationPositionError): GeolocationError {
    let message: string;

    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = 'Location permission denied';
        break;
      case error.POSITION_UNAVAILABLE:
        message = 'Location information unavailable';
        break;
      case error.TIMEOUT:
        message = 'Location request timed out';
        break;
      default:
        message = 'Unknown location error';
    }

    return {
      code: error.code,
      message,
      originalError: error
    };
  }

  /**
   * Calculate distance between two points
   * @param {Coordinates} point1 - First point
   * @param {Coordinates} point2 - Second point
   * @returns {number} Distance in meters
   */
  public calculateDistance(point1: Coordinates, point2: Coordinates): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}

export default LocationService;
```