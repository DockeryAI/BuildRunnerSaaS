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

export class LocationService {
  private static instance: LocationService;
  private watchId: number | null = null;
  private lastKnownPosition: Coordinates | null = null;

  private constructor() {}

  /**
   * Gets singleton instance of LocationService
   * @returns LocationService instance
   */
  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Checks if geolocation is supported in current browser
   * @returns boolean indicating if geolocation is supported
   */
  public isSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Gets current position
   * @returns Promise resolving to Coordinates
   * @throws LocationError if geolocation fails
   */
  public async getCurrentPosition(): Promise<Coordinates> {
    if (!this.isSupported()) {
      throw this.createError({
        code: 1,
        message: 'Geolocation is not supported'
      });
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      this.lastKnownPosition = this.formatPosition(position.coords);
      return this.lastKnownPosition;
      
    } catch (error) {
      throw this.createError(error as GeolocationPositionError);
    }
  }

  /**
   * Watches position changes
   * @param successCallback Callback for position updates
   * @param errorCallback Optional error callback
   * @returns watch ID
   */
  public watchPosition(
    successCallback: (position: Coordinates) => void,
    errorCallback?: (error: LocationError) => void
  ): number {
    if (!this.isSupported()) {
      if (errorCallback) {
        errorCallback(this.createError({
          code: 1,
          message: 'Geolocation is not supported'
        }));
      }
      return -1;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position: GeolocationPosition) => {
        this.lastKnownPosition = this.formatPosition(position.coords);
        successCallback(this.lastKnownPosition);
      },
      (error: GeolocationPositionError) => {
        if (errorCallback) {
          errorCallback(this.createError(error));
        }
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
   * Clears active position watch
   */
  public clearWatch(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Gets last known position
   * @returns Last known coordinates or null
   */
  public getLastKnownPosition(): Coordinates | null {
    return this.lastKnownPosition;
  }

  /**
   * Calculates distance between two points in meters
   * @param point1 First coordinates
   * @param point2 Second coordinates
   * @returns Distance in meters
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

  /**
   * Formats raw coordinates into standard format
   * @param coords GeolocationCoordinates to format
   * @returns Formatted coordinates
   */
  private formatPosition(coords: GeolocationCoordinates): Coordinates {
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
   * Creates standardized location error
   * @param error Error to format
   * @returns Formatted location error
   */
  private createError(error: GeolocationPositionError | LocationError): LocationError {
    return {
      code: error.code,
      message: error.message || 'Unknown location error'
    };
  }
}

export default LocationService.getInstance();
```