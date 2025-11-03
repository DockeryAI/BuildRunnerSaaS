```typescript
/**
 * @file CoreLocationService.ts
 * Core location service for handling geolocation functionality
 */

import { GeolocationError } from './types';

/**
 * Location coordinates interface
 */
interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null; 
  speed?: number | null;
  timestamp?: number;
}

/**
 * Location options interface
 */
interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

/**
 * Core location service class
 */
export class CoreLocationService {
  private defaultOptions: LocationOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };

  /**
   * Get current position
   * @param options - Location options
   * @returns Promise resolving to coordinates
   * @throws GeolocationError
   */
  public async getCurrentPosition(options: LocationOptions = {}): Promise<Coordinates> {
    const mergedOptions = { ...this.defaultOptions, ...options };

    if (!this.isGeolocationSupported()) {
      throw new GeolocationError('Geolocation is not supported');
    }

    try {
      const position = await this.getPositionPromise(mergedOptions);
      
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp
      };
    } catch (error) {
      throw this.handleGeolocationError(error);
    }
  }

  /**
   * Watch position changes
   * @param successCallback - Success callback function
   * @param errorCallback - Error callback function  
   * @param options - Location options
   * @returns Watch position id
   */
  public watchPosition(
    successCallback: (position: Coordinates) => void,
    errorCallback?: (error: GeolocationError) => void,
    options: LocationOptions = {}
  ): number {
    if (!this.isGeolocationSupported()) {
      if (errorCallback) {
        errorCallback(new GeolocationError('Geolocation is not supported'));
      }
      return -1;
    }

    const mergedOptions = { ...this.defaultOptions, ...options };

    return navigator.geolocation.watchPosition(
      (position: GeolocationPosition) => {
        successCallback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp
        });
      },
      (error: GeolocationPositionError) => {
        if (errorCallback) {
          errorCallback(this.handleGeolocationError(error));
        }
      },
      mergedOptions
    );
  }

  /**
   * Clear watch position
   * @param watchId - Watch position id to clear
   */
  public clearWatch(watchId: number): void {
    if (this.isGeolocationSupported()) {
      navigator.geolocation.clearWatch(watchId);
    }
  }

  /**
   * Calculate distance between two coordinates in meters
   * @param coord1 - First coordinate
   * @param coord2 - Second coordinate
   * @returns Distance in meters
   */
  public calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = this.toRadians(coord1.latitude);
    const φ2 = this.toRadians(coord2.latitude);
    const Δφ = this.toRadians(coord2.latitude - coord1.latitude);
    const Δλ = this.toRadians(coord2.longitude - coord1.longitude);

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  /**
   * Check if coordinates are within radius
   * @param center - Center coordinates
   * @param point - Point coordinates to check
   * @param radius - Radius in meters
   * @returns Boolean indicating if point is within radius
   */
  public isWithinRadius(center: Coordinates, point: Coordinates, radius: number): boolean {
    const distance = this.calculateDistance(center, point);
    return distance <= radius;
  }

  /**
   * Convert degrees to radians
   * @param degrees - Degrees to convert
   * @returns Radians
   */
  private toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }

  /**
   * Check if geolocation is supported
   * @returns Boolean indicating if geolocation is supported
   */
  private isGeolocationSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Get position as promise
   * @param options - Location options
   * @returns Promise resolving to GeolocationPosition
   */
  private getPositionPromise(options: LocationOptions): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  /**
   * Handle geolocation errors
   * @param error - Geolocation error
   * @returns GeolocationError
   */
  private handleGeolocationError(error: GeolocationPositionError): GeolocationError {
    let message: string;

    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = 'User denied the request for geolocation';
        break;
      case error.POSITION_UNAVAILABLE:
        message = 'Location information is unavailable';
        break;
      case error.TIMEOUT:
        message = 'The request to get user location timed out';
        break;
      default:
        message = 'An unknown error occurred';
    }

    return new GeolocationError(message, error.code);
  }
}

export default new CoreLocationService();
```