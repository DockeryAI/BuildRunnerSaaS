```typescript
/**
 * @fileoverview Core location service for handling geolocation functionality
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp?: number;
}

export interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export class LocationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LocationError';
  }
}

/**
 * Service for handling location-related functionality
 */
export class LocationService {
  private readonly defaultOptions: LocationOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };

  /**
   * Checks if geolocation is supported in the current environment
   * @returns {boolean} Whether geolocation is supported
   */
  public isSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Gets the current position
   * @param {LocationOptions} options - Optional configuration for getting location
   * @returns {Promise<Coordinates>} Promise resolving to coordinates
   * @throws {LocationError} If location access is denied or unavailable
   */
  public async getCurrentPosition(options: LocationOptions = {}): Promise<Coordinates> {
    if (!this.isSupported()) {
      throw new LocationError('Geolocation is not supported in this environment');
    }

    const mergedOptions = { ...this.defaultOptions, ...options };

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, mergedOptions);
      });

      return this.normalizePosition(position);
    } catch (error) {
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            throw new LocationError('Location permission denied');
          case error.POSITION_UNAVAILABLE:
            throw new LocationError('Location information unavailable');
          case error.TIMEOUT:
            throw new LocationError('Location request timed out');
          default:
            throw new LocationError('Unknown location error occurred');
        }
      }
      throw new LocationError('Failed to get location');
    }
  }

  /**
   * Watches position changes
   * @param {(position: Coordinates) => void} successCallback - Callback for position updates
   * @param {(error: LocationError) => void} errorCallback - Callback for errors
   * @param {LocationOptions} options - Optional configuration for watching location
   * @returns {number} Watch ID that can be used to clear the watch
   */
  public watchPosition(
    successCallback: (position: Coordinates) => void,
    errorCallback: (error: LocationError) => void,
    options: LocationOptions = {}
  ): number {
    if (!this.isSupported()) {
      errorCallback(new LocationError('Geolocation is not supported in this environment'));
      return 0;
    }

    const mergedOptions = { ...this.defaultOptions, ...options };

    return navigator.geolocation.watchPosition(
      (position: GeolocationPosition) => {
        successCallback(this.normalizePosition(position));
      },
      (error: GeolocationPositionError) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorCallback(new LocationError('Location permission denied'));
            break;
          case error.POSITION_UNAVAILABLE:
            errorCallback(new LocationError('Location information unavailable'));
            break;
          case error.TIMEOUT:
            errorCallback(new LocationError('Location request timed out'));
            break;
          default:
            errorCallback(new LocationError('Unknown location error occurred'));
        }
      },
      mergedOptions
    );
  }

  /**
   * Clears a watch operation
   * @param {number} watchId - The ID returned from watchPosition
   */
  public clearWatch(watchId: number): void {
    if (this.isSupported()) {
      navigator.geolocation.clearWatch(watchId);
    }
  }

  /**
   * Calculates distance between two coordinates using the Haversine formula
   * @param {Coordinates} coord1 - First coordinate
   * @param {Coordinates} coord2 - Second coordinate
   * @returns {number} Distance in meters
   */
  public calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (coord1.latitude * Math.PI) / 180;
    const φ2 = (coord2.latitude * Math.PI) / 180;
    const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Normalizes GeolocationPosition to Coordinates interface
   * @param {GeolocationPosition} position - Position to normalize
   * @returns {Coordinates} Normalized coordinates
   * @private
   */
  private normalizePosition(position: GeolocationPosition): Coordinates {
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
  }
}

export default new LocationService();
```