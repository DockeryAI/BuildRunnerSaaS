import MapKit from 'mapkit-js';

/**
 * Configuration interface for MapKit initialization
 */
interface MapKitConfig {
  /** JWT token for MapKit authentication */
  token: string;
  /** Language code for map labels */
  language?: string;
  /** Initial map center coordinates */
  center?: {
    latitude: number;
    longitude: number;
  };
  /** Initial zoom level */
  zoomLevel?: number;
}

/**
 * Service class to handle MapKit integration and initialization
 */
export class MapKitService {
  private static instance: MapKitService;
  private mapKit: typeof MapKit | null = null;
  private initialized = false;

  private constructor() {}

  /**
   * Gets singleton instance of MapKitService
   */
  public static getInstance(): MapKitService {
    if (!MapKitService.instance) {
      MapKitService.instance = new MapKitService();
    }
    return MapKitService.instance;
  }

  /**
   * Initializes MapKit with provided configuration
   * @param config - MapKit configuration options
   * @throws Error if initialization fails
   */
  public async initialize(config: MapKitConfig): Promise<void> {
    try {
      if (this.initialized) {
        return;
      }

      if (!config.token) {
        throw new Error('MapKit token is required');
      }

      mapkit.init({
        authorizationCallback: (done: (token: string) => void) => {
          done(config.token);
        },
        language: config.language || 'en'
      });

      this.mapKit = mapkit;
      this.initialized = true;

    } catch (error) {
      throw new Error(`Failed to initialize MapKit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Creates a new map instance
   * @param elementId - DOM element ID to mount the map
   * @param options - Map configuration options
   * @returns MapKit map instance
   * @throws Error if MapKit is not initialized
   */
  public createMap(elementId: string, options?: {
    center?: { latitude: number; longitude: number };
    zoomLevel?: number;
  }): MapKit.Map {
    if (!this.initialized || !this.mapKit) {
      throw new Error('MapKit must be initialized before creating a map');
    }

    try {
      const defaultCenter = new mapkit.Coordinate(37.3316850890998, -122.030067374026);
      const center = options?.center 
        ? new mapkit.Coordinate(options.center.latitude, options.center.longitude)
        : defaultCenter;

      return new mapkit.Map(elementId, {
        center,
        zoom: options?.zoomLevel || 10,
        showsZoom: true,
        showsScale: true,
        showsCompass: true
      });

    } catch (error) {
      throw new Error(`Failed to create map: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Adds a marker to the map
   * @param map - MapKit map instance
   * @param coordinate - Marker coordinates
   * @param title - Marker title
   * @returns MapKit annotation object
   */
  public addMarker(
    map: MapKit.Map,
    coordinate: { latitude: number; longitude: number },
    title?: string
  ): MapKit.Annotation {
    try {
      const annotation = new mapkit.MarkerAnnotation(
        new mapkit.Coordinate(coordinate.latitude, coordinate.longitude),
        { title }
      );
      map.addAnnotation(annotation);
      return annotation;

    } catch (error) {
      throw new Error(`Failed to add marker: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Removes a marker from the map
   * @param map - MapKit map instance
   * @param marker - Marker to remove
   */
  public removeMarker(map: MapKit.Map, marker: MapKit.Annotation): void {
    try {
      map.removeAnnotation(marker);
    } catch (error) {
      throw new Error(`Failed to remove marker: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Updates map center and zoom level
   * @param map - MapKit map instance
   * @param center - New center coordinates
   * @param zoomLevel - New zoom level
   */
  public updateMapView(
    map: MapKit.Map,
    center: { latitude: number; longitude: number },
    zoomLevel?: number
  ): void {
    try {
      const newCenter = new mapkit.Coordinate(center.latitude, center.longitude);
      map.setCenterAnimated(newCenter);
      
      if (zoomLevel !== undefined) {
        map.setZoomLevelAnimated(zoomLevel);
      }
    } catch (error) {
      throw new Error(`Failed to update map view: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Checks if MapKit is initialized
   * @returns boolean indicating initialization status
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Cleans up MapKit resources
   */
  public destroy(): void {
    this.mapKit = null;
    this.initialized = false;
  }
}

export default MapKitService.getInstance();