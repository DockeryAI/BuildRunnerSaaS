```typescript
/**
 * @module CoreLocation
 * @description Service for handling geolocation functionality and location-based operations
 */

export interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

export interface LocationError {
  code: number;
  message: string;
}

export class CoreLocation {
  private static instance: CoreLocation;
  private watchId: number | null = null;
  private lastPosition: GeolocationPosition | null = null;

  private constructor() {
    if (!this.isGeolocationAvailable()) {
      throw new Error('Geolocation is not supported by this browser');
    }
  }

  /**
   * Gets singleton instance of CoreLocation
   * @returns {CoreLocation} Singleton instance
   */
  public static getInstance(): CoreLocation {
    if (!CoreLocation.instance) {
      CoreLocation.instance = new CoreLocation();
    }
    return CoreLocation.instance;
  }

  /**
   * Checks if geolocation is available in current browser
   * @returns {boolean} Whether geolocation is supported
   */
  private isGeolocationAvailable(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Gets current position once
   * @returns {Promise<GeolocationPosition>} Promise resolving to position data
   */
  public async getCurrentPosition(): Promise<GeolocationPosition> {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos: GeolocationPosition) => resolve(pos),
          (error: LocationError) => reject(error),
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      });
      this.lastPosition = position;
      return position;
    } catch (error) {
      throw new Error(`Failed to get current position: ${(error as Error).message}`);
    }
  }

  /**
   * Starts watching position with continuous updates
   * @param {(position: GeolocationPosition) => void} successCallback - Callback for position updates
   * @param {(error: LocationError) => void} errorCallback - Callback for errors
   * @returns {number} Watch ID that can be used to clear the watch
   */
  public watchPosition(
    successCallback: (position: GeolocationPosition) => void,
    errorCallback: (error: LocationError) => void
  ): number {
    if (this.watchId !== null) {
      this.clearWatch();
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position: GeolocationPosition) => {
        this.lastPosition = position;
        successCallback(position);
      },
      (error: LocationError) => {
        errorCallback(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    return this.watchId;
  }

  /**
   * Stops watching position updates
   */
  public clearWatch(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Gets the last known position
   * @returns {GeolocationPosition | null} Last recorded position or null if none exists
   */
  public getLastPosition(): GeolocationPosition | null {
    return this.lastPosition;
  }

  /**
   * Calculates distance between two points using Haversine formula
   * @param {number} lat1 - Latitude of first point
   * @param {number} lon1 - Longitude of first point
   * @param {number} lat2 - Latitude of second point
   * @param {number} lon2 - Longitude of second point
   * @returns {number} Distance in kilometers
   */
  public calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Converts degrees to radians
   * @param {number} degrees - Angle in degrees
   * @returns {number} Angle in radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Checks if coordinates are valid
   * @param {number} latitude - Latitude to validate
   * @param {number} longitude - Longitude to validate
   * @returns {boolean} Whether coordinates are valid
   */
  public isValidCoordinates(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 && 
      latitude <= 90 && 
      longitude >= -180 && 
      longitude <= 180
    );
  }
}

export default CoreLocation;
```