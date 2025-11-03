/**
 * @fileoverview Geocoding service to convert between addresses and coordinates
 */

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface ReverseGeocodingResult {
  formattedAddress: string;
  streetNumber?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface GeocodingError extends Error {
  code: string;
  details?: unknown;
}

/**
 * Service for handling geocoding operations
 */
export class GeocodingService {
  private apiKey: string;
  private baseUrl: string;

  /**
   * Creates a new GeocodingService instance
   * @param apiKey - API key for geocoding provider
   * @param baseUrl - Base URL for geocoding API
   */
  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Converts an address string to coordinates
   * @param address - The address to geocode
   * @returns Promise resolving to geocoding result
   * @throws {GeocodingError} If geocoding fails
   */
  public async geocode(address: string): Promise<GeocodingResult> {
    try {
      const params = new URLSearchParams({
        address,
        key: this.apiKey
      });

      const response = await fetch(`${this.baseUrl}/geocode?${params}`);

      if (!response.ok) {
        throw this.createError('REQUEST_FAILED', `HTTP error ${response.status}`);
      }

      const data = await response.json();

      if (!data.results?.length) {
        throw this.createError('NO_RESULTS', 'No results found');
      }

      const result = data.results[0];

      return {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
        city: this.extractAddressComponent(result.address_components, 'locality'),
        state: this.extractAddressComponent(result.address_components, 'administrative_area_level_1'),
        country: this.extractAddressComponent(result.address_components, 'country'),
        postalCode: this.extractAddressComponent(result.address_components, 'postal_code')
      };
    } catch (error) {
      throw this.createError('GEOCODING_FAILED', error);
    }
  }

  /**
   * Converts coordinates to an address
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   * @returns Promise resolving to reverse geocoding result
   * @throws {GeocodingError} If reverse geocoding fails
   */
  public async reverseGeocode(latitude: number, longitude: number): Promise<ReverseGeocodingResult> {
    try {
      const params = new URLSearchParams({
        latlng: `${latitude},${longitude}`,
        key: this.apiKey
      });

      const response = await fetch(`${this.baseUrl}/geocode?${params}`);

      if (!response.ok) {
        throw this.createError('REQUEST_FAILED', `HTTP error ${response.status}`);
      }

      const data = await response.json();

      if (!data.results?.length) {
        throw this.createError('NO_RESULTS', 'No results found');
      }

      const result = data.results[0];

      return {
        formattedAddress: result.formatted_address,
        streetNumber: this.extractAddressComponent(result.address_components, 'street_number'),
        street: this.extractAddressComponent(result.address_components, 'route'),
        city: this.extractAddressComponent(result.address_components, 'locality'),
        state: this.extractAddressComponent(result.address_components, 'administrative_area_level_1'),
        country: this.extractAddressComponent(result.address_components, 'country'),
        postalCode: this.extractAddressComponent(result.address_components, 'postal_code')
      };
    } catch (error) {
      throw this.createError('REVERSE_GEOCODING_FAILED', error);
    }
  }

  /**
   * Creates a GeocodingError with the specified code and details
   * @param code - Error code
   * @param details - Additional error details
   * @returns GeocodingError instance
   */
  private createError(code: string, details?: unknown): GeocodingError {
    const error = new Error('Geocoding operation failed') as GeocodingError;
    error.code = code;
    error.details = details;
    return error;
  }

  /**
   * Extracts a specific component from address components array
   * @param components - Array of address components
   * @param type - Type of component to extract
   * @returns Component short name or undefined if not found
   */
  private extractAddressComponent(
    components: Array<{ types: string[]; short_name: string }>,
    type: string
  ): string | undefined {
    return components?.find(component => component.types.includes(type))?.short_name;
  }
}