```typescript
/**
 * @fileoverview Service for enhancing trail data with additional metadata and calculations
 */

export interface TrailPoint {
  latitude: number;
  longitude: number;
  elevation: number;
  timestamp?: Date;
}

export interface EnhancedTrailData {
  points: TrailPoint[];
  totalDistance: number;
  elevationGain: number;
  elevationLoss: number;
  maxElevation: number;
  minElevation: number;
  averageElevation: number;
  duration?: number;
}

export class TrailDataEnhancementService {
  /**
   * Enhances raw trail point data with calculated metrics
   * @param points Array of trail points with coordinates and elevation
   * @returns Enhanced trail data with additional metrics
   * @throws Error if points array is empty or invalid
   */
  public enhanceTrailData(points: TrailPoint[]): EnhancedTrailData {
    if (!Array.isArray(points) || points.length === 0) {
      throw new Error('Trail points array must not be empty');
    }

    try {
      const totalDistance = this.calculateTotalDistance(points);
      const {gain, loss} = this.calculateElevationChanges(points);
      const {max, min, avg} = this.calculateElevationStats(points);
      const duration = this.calculateDuration(points);

      return {
        points,
        totalDistance,
        elevationGain: gain,
        elevationLoss: loss,
        maxElevation: max,
        minElevation: min,
        averageElevation: avg,
        duration
      };
    } catch (error) {
      throw new Error(`Failed to enhance trail data: ${error.message}`);
    }
  }

  /**
   * Calculates the total distance of the trail in meters
   * @param points Array of trail points
   * @returns Total distance in meters
   * @private
   */
  private calculateTotalDistance(points: TrailPoint[]): number {
    let total = 0;
    
    for (let i = 0; i < points.length - 1; i++) {
      total += this.getDistanceBetweenPoints(points[i], points[i + 1]);
    }

    return total;
  }

  /**
   * Calculates elevation gain and loss between trail points
   * @param points Array of trail points
   * @returns Object containing total elevation gain and loss
   * @private
   */
  private calculateElevationChanges(points: TrailPoint[]): {gain: number, loss: number} {
    let gain = 0;
    let loss = 0;

    for (let i = 0; i < points.length - 1; i++) {
      const elevationChange = points[i + 1].elevation - points[i].elevation;
      if (elevationChange > 0) {
        gain += elevationChange;
      } else {
        loss += Math.abs(elevationChange);
      }
    }

    return {gain, loss};
  }

  /**
   * Calculates elevation statistics for the trail
   * @param points Array of trail points
   * @returns Object containing max, min and average elevation
   * @private
   */
  private calculateElevationStats(points: TrailPoint[]): {max: number, min: number, avg: number} {
    const elevations = points.map(p => p.elevation);
    
    return {
      max: Math.max(...elevations),
      min: Math.min(...elevations),
      avg: elevations.reduce((sum, el) => sum + el, 0) / elevations.length
    };
  }

  /**
   * Calculates duration between first and last timestamp if available
   * @param points Array of trail points
   * @returns Duration in milliseconds or undefined if timestamps not available
   * @private
   */
  private calculateDuration(points: TrailPoint[]): number | undefined {
    const start = points[0].timestamp;
    const end = points[points.length - 1].timestamp;

    if (start && end) {
      return end.getTime() - start.getTime();
    }
    return undefined;
  }

  /**
   * Calculates the distance between two points using the Haversine formula
   * @param p1 First trail point
   * @param p2 Second trail point
   * @returns Distance in meters
   * @private
   */
  private getDistanceBetweenPoints(p1: TrailPoint, p2: TrailPoint): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = p1.latitude * Math.PI / 180;
    const φ2 = p2.latitude * Math.PI / 180;
    const Δφ = (p2.latitude - p1.latitude) * Math.PI / 180;
    const Δλ = (p2.longitude - p1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }
}
```