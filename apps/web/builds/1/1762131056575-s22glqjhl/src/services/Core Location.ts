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
}

export interface LocationError {
  code: number;
  message: string;
}

export class CoreLocationService {
  private watchId: number | null = null;
  
  /**
   * Checks if geolocation is supported in the current browser
   * @returns {boolean} Whether geolocation is supported
   */
  public isSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Gets the current position once
   * @returns {Promise<Coordinates>} Promise resolving to coordinates
   * @throws {LocationError} If getting location fails
   */
  public async getCurrentPosition(): Promise<Coordinates> {
    if (!this.isSupported()) {
      throw {
        code: -1,
        message: 'Geolocation is not supported in this browser'
      };
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          resolve(this.formatCoordinates(position.coords));
        },
        (error: GeolocationPositionError) => {
          reject(this.formatError(error));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  /**
   * Watches position continuously and calls callback on updates
   * @param {function} successCallback - Called when position updates
   * @param {function} errorCallback - Called on errors
   * @returns {number} Watch ID that can be used to clear the watch
   */
  public watchPosition(
    successCallback: (coords: Coordinates) => void,
    errorCallback: (error: LocationError) => void
  ): number {
    if (!this.isSupported()) {
      errorCallback({
        code: -1,
        message: 'Geolocation is not supported in this browser'
      });
      return -1;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position: GeolocationPosition) => {
        successCallback(this.formatCoordinates(position.coords));
      },
      (error: GeolocationPositionError) => {
        errorCallback(this.formatError(error));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return this.watchId;
  }

  /**
   * Stops watching position updates
   * @param {number} watchId - The watch ID to clear
   */
  public clearWatch(watchId: number): void {
    if (watchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
      this.watchId = null;
    }
  }

  /**
   * Calculates distance between two points in kilometers
   * @param {Coordinates} point1 - First point
   * @param {Coordinates} point2 - Second point
   * @returns {number} Distance in kilometers
   */
  public calculateDistance(point1: Coordinates, point2: Coordinates): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(point2.latitude - point1.latitude);
    const dLon = this.toRad(point2.longitude - point1.longitude);
    const lat1 = this.toRad(point1.latitude);
    const lat2 = this.toRad(point2.latitude);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.sin(dLon/2) * Math.sin(dLon/2) * 
              Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Formats raw coordinates into standard format
   * @param {GeolocationCoordinates} coords - Raw coordinates
   * @returns {Coordinates} Formatted coordinates
   * @private
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
   * Formats geolocation errors into standard format
   * @param {GeolocationPositionError} error - Raw error
   * @returns {LocationError} Formatted error
   * @private
   */
  private formatError(error: GeolocationPositionError): LocationError {
    return {
      code: error.code,
      message: error.message
    };
  }

  /**
   * Converts degrees to radians
   * @param {number} degrees - Value in degrees
   * @returns {number} Value in radians
   * @private
   */
  private toRad(degrees: number): number {
    return degrees * Math.PI / 180;
  }
}

export default new CoreLocationService();
```