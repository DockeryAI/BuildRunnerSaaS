/**
 * Service for validating trail location data
 */
export class TrailLocationValidator {
  /**
   * Validates coordinates are within valid ranges
   * @param latitude - Latitude coordinate to validate
   * @param longitude - Longitude coordinate to validate
   * @returns True if coordinates are valid, false otherwise
   * @throws {Error} If coordinates are invalid types
   */
  public validateCoordinates(latitude: number, longitude: number): boolean {
    try {
      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        throw new Error('Coordinates must be numbers');
      }

      return this.isValidLatitude(latitude) && this.isValidLongitude(longitude);
    } catch (error) {
      throw new Error(`Error validating coordinates: ${error.message}`);
    }
  }

  /**
   * Validates a trail location object
   * @param location - Location object to validate
   * @returns True if location is valid, false otherwise
   * @throws {Error} If location object is invalid
   */
  public validateLocation(location: TrailLocation): boolean {
    try {
      if (!location || typeof location !== 'object') {
        throw new Error('Invalid location object');
      }

      const { latitude, longitude, elevation, name } = location;

      if (!this.validateCoordinates(latitude, longitude)) {
        return false;
      }

      if (!this.isValidElevation(elevation)) {
        return false;
      }

      if (!this.isValidName(name)) {
        return false;
      }

      return true;
    } catch (error) {
      throw new Error(`Error validating location: ${error.message}`);
    }
  }

  /**
   * Validates an array of trail locations
   * @param locations - Array of locations to validate
   * @returns Array of validation results
   * @throws {Error} If locations array is invalid
   */
  public validateLocations(locations: TrailLocation[]): ValidationResult[] {
    try {
      if (!Array.isArray(locations)) {
        throw new Error('Locations must be an array');
      }

      return locations.map((location, index) => {
        try {
          const isValid = this.validateLocation(location);
          return {
            index,
            location,
            isValid,
            errors: isValid ? [] : ['Invalid location data']
          };
        } catch (error) {
          return {
            index,
            location,
            isValid: false,
            errors: [error.message]
          };
        }
      });
    } catch (error) {
      throw new Error(`Error validating locations: ${error.message}`);
    }
  }

  /**
   * Checks if latitude is within valid range
   * @param latitude - Latitude to validate
   * @returns True if latitude is valid
   */
  private isValidLatitude(latitude: number): boolean {
    return latitude >= -90 && latitude <= 90;
  }

  /**
   * Checks if longitude is within valid range
   * @param longitude - Longitude to validate
   * @returns True if longitude is valid
   */
  private isValidLongitude(longitude: number): boolean {
    return longitude >= -180 && longitude <= 180;
  }

  /**
   * Validates elevation value
   * @param elevation - Elevation in meters to validate
   * @returns True if elevation is valid
   */
  private isValidElevation(elevation: number): boolean {
    return typeof elevation === 'number' && 
           elevation >= -418 && // Dead Sea
           elevation <= 8848; // Mount Everest
  }

  /**
   * Validates location name
   * @param name - Name string to validate
   * @returns True if name is valid
   */
  private isValidName(name: string): boolean {
    return typeof name === 'string' && 
           name.length >= 1 &&
           name.length <= 100;
  }
}

/**
 * Trail location interface
 */
export interface TrailLocation {
  latitude: number;
  longitude: number;
  elevation: number;
  name: string;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  index: number;
  location: TrailLocation;
  isValid: boolean;
  errors: string[];
}