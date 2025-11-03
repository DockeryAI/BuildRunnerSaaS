```typescript
/**
 * @fileoverview Service for validating trip-related data
 */

export interface TripData {
  startDate: Date;
  endDate: Date;
  origin: string;
  destination: string;
  passengers: number;
  distance?: number;
  cost?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export class TripDataValidationService {
  /**
   * Validates a complete trip data object
   * @param tripData - The trip data to validate
   * @returns Validation result with any errors
   */
  public validateTripData(tripData: TripData): ValidationResult {
    const errors: ValidationError[] = [];

    try {
      this.validateDates(tripData.startDate, tripData.endDate, errors);
      this.validateLocations(tripData.origin, tripData.destination, errors);
      this.validatePassengers(tripData.passengers, errors);
      
      if (tripData.distance !== undefined) {
        this.validateDistance(tripData.distance, errors);
      }
      
      if (tripData.cost !== undefined) {
        this.validateCost(tripData.cost, errors);
      }

      return {
        isValid: errors.length === 0,
        errors
      };

    } catch (error) {
      errors.push({
        field: 'general',
        message: `Validation failed: ${error.message}`
      });
      
      return {
        isValid: false,
        errors
      };
    }
  }

  /**
   * Validates trip start and end dates
   * @param startDate - Trip start date
   * @param endDate - Trip end date
   * @param errors - Array to collect validation errors
   */
  private validateDates(startDate: Date, endDate: Date, errors: ValidationError[]): void {
    const now = new Date();

    if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
      errors.push({
        field: 'startDate',
        message: 'Start date is invalid'
      });
    }

    if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
      errors.push({
        field: 'endDate', 
        message: 'End date is invalid'
      });
    }

    if (startDate < now) {
      errors.push({
        field: 'startDate',
        message: 'Start date cannot be in the past'
      });
    }

    if (endDate < startDate) {
      errors.push({
        field: 'endDate',
        message: 'End date must be after start date'
      });
    }
  }

  /**
   * Validates origin and destination locations
   * @param origin - Trip origin location
   * @param destination - Trip destination location
   * @param errors - Array to collect validation errors
   */
  private validateLocations(origin: string, destination: string, errors: ValidationError[]): void {
    if (!origin || origin.trim().length === 0) {
      errors.push({
        field: 'origin',
        message: 'Origin location is required'
      });
    }

    if (!destination || destination.trim().length === 0) {
      errors.push({
        field: 'destination',
        message: 'Destination location is required'
      });
    }

    if (origin === destination) {
      errors.push({
        field: 'destination',
        message: 'Destination must be different from origin'
      });
    }
  }

  /**
   * Validates number of passengers
   * @param passengers - Number of passengers
   * @param errors - Array to collect validation errors
   */
  private validatePassengers(passengers: number, errors: ValidationError[]): void {
    if (!Number.isInteger(passengers)) {
      errors.push({
        field: 'passengers',
        message: 'Number of passengers must be an integer'
      });
    }

    if (passengers < 1) {
      errors.push({
        field: 'passengers',
        message: 'At least one passenger is required'
      });
    }

    if (passengers > 99) {
      errors.push({
        field: 'passengers',
        message: 'Maximum 99 passengers allowed'
      });
    }
  }

  /**
   * Validates trip distance
   * @param distance - Trip distance in kilometers
   * @param errors - Array to collect validation errors
   */
  private validateDistance(distance: number, errors: ValidationError[]): void {
    if (typeof distance !== 'number' || isNaN(distance)) {
      errors.push({
        field: 'distance',
        message: 'Distance must be a valid number'
      });
    }

    if (distance <= 0) {
      errors.push({
        field: 'distance',
        message: 'Distance must be greater than 0'
      });
    }
  }

  /**
   * Validates trip cost
   * @param cost - Trip cost in currency units
   * @param errors - Array to collect validation errors
   */
  private validateCost(cost: number, errors: ValidationError[]): void {
    if (typeof cost !== 'number' || isNaN(cost)) {
      errors.push({
        field: 'cost',
        message: 'Cost must be a valid number'
      });
    }

    if (cost < 0) {
      errors.push({
        field: 'cost',
        message: 'Cost cannot be negative'
      });
    }
  }
}
```