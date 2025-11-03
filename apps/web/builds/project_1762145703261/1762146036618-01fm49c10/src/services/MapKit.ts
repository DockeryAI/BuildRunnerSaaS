/**
 * @class MapKit
 * @description Service for handling map-related functionality and operations
 */
export class MapKit {
  private map: google.maps.Map | null = null;
  private markers: Map<string, google.maps.Marker> = new Map();
  private bounds: google.maps.LatLngBounds | null = null;

  /**
   * @description Initializes a new map instance
   * @param {HTMLElement} element - DOM element to render map in
   * @param {google.maps.MapOptions} options - Map configuration options
   * @throws {Error} If element is not found or Google Maps is not loaded
   * @returns {Promise<void>}
   */
  public async initializeMap(
    element: HTMLElement,
    options: google.maps.MapOptions = {}
  ): Promise<void> {
    try {
      if (!element) {
        throw new Error('Map container element not found');
      }

      if (!google?.maps) {
        throw new Error('Google Maps JavaScript API not loaded');
      }

      const defaultOptions: google.maps.MapOptions = {
        zoom: 12,
        center: { lat: 0, lng: 0 },
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        ...options
      };

      this.map = new google.maps.Map(element, defaultOptions);
      this.bounds = new google.maps.LatLngBounds();
    } catch (error) {
      throw new Error(`Failed to initialize map: ${error.message}`);
    }
  }

  /**
   * @description Adds a marker to the map
   * @param {string} id - Unique identifier for the marker
   * @param {google.maps.LatLngLiteral} position - Marker position
   * @param {google.maps.MarkerOptions} options - Marker configuration options
   * @throws {Error} If map is not initialized
   * @returns {void}
   */
  public addMarker(
    id: string,
    position: google.maps.LatLngLiteral,
    options: google.maps.MarkerOptions = {}
  ): void {
    try {
      if (!this.map) {
        throw new Error('Map not initialized');
      }

      const marker = new google.maps.Marker({
        position,
        map: this.map,
        ...options
      });

      this.markers.set(id, marker);
      this.bounds?.extend(position);
    } catch (error) {
      throw new Error(`Failed to add marker: ${error.message}`);
    }
  }

  /**
   * @description Removes a marker from the map
   * @param {string} id - Identifier of marker to remove
   * @returns {void}
   */
  public removeMarker(id: string): void {
    try {
      const marker = this.markers.get(id);
      if (marker) {
        marker.setMap(null);
        this.markers.delete(id);
      }
    } catch (error) {
      throw new Error(`Failed to remove marker: ${error.message}`);
    }
  }

  /**
   * @description Centers the map on a specific location
   * @param {google.maps.LatLngLiteral} position - Position to center on
   * @param {number} zoom - Zoom level
   * @throws {Error} If map is not initialized
   * @returns {void}
   */
  public centerOn(position: google.maps.LatLngLiteral, zoom?: number): void {
    try {
      if (!this.map) {
        throw new Error('Map not initialized');
      }

      this.map.setCenter(position);
      if (zoom) {
        this.map.setZoom(zoom);
      }
    } catch (error) {
      throw new Error(`Failed to center map: ${error.message}`);
    }
  }

  /**
   * @description Fits the map bounds to show all markers
   * @throws {Error} If map is not initialized or no bounds exist
   * @returns {void}
   */
  public fitBounds(): void {
    try {
      if (!this.map || !this.bounds) {
        throw new Error('Map or bounds not initialized');
      }

      if (this.markers.size > 0) {
        this.map.fitBounds(this.bounds);
      }
    } catch (error) {
      throw new Error(`Failed to fit bounds: ${error.message}`);
    }
  }

  /**
   * @description Gets the current map instance
   * @throws {Error} If map is not initialized
   * @returns {google.maps.Map}
   */
  public getMap(): google.maps.Map {
    if (!this.map) {
      throw new Error('Map not initialized');
    }
    return this.map;
  }

  /**
   * @description Gets a specific marker by ID
   * @param {string} id - Marker identifier
   * @returns {google.maps.Marker | undefined}
   */
  public getMarker(id: string): google.maps.Marker | undefined {
    return this.markers.get(id);
  }

  /**
   * @description Clears all markers from the map
   * @returns {void}
   */
  public clearMarkers(): void {
    try {
      this.markers.forEach(marker => marker.setMap(null));
      this.markers.clear();
      this.bounds = new google.maps.LatLngBounds();
    } catch (error) {
      throw new Error(`Failed to clear markers: ${error.message}`);
    }
  }

  /**
   * @description Updates a marker's position and options
   * @param {string} id - Marker identifier
   * @param {google.maps.LatLngLiteral} position - New position
   * @param {google.maps.MarkerOptions} options - New options
   * @throws {Error} If marker is not found
   * @returns {void}
   */
  public updateMarker(
    id: string,
    position: google.maps.LatLngLiteral,
    options: google.maps.MarkerOptions = {}
  ): void {
    try {
      const marker = this.markers.get(id);
      if (!marker) {
        throw new Error(`Marker with id ${id} not found`);
      }

      marker.setPosition(position);
      marker.setOptions(options);
    } catch (error) {
      throw new Error(`Failed to update marker: ${error.message}`);
    }
  }
}

export default MapKit;