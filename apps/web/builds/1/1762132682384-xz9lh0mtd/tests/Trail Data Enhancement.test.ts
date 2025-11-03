Here's a comprehensive set of unit tests for the TrailDataEnhancementService component using Jest:

```typescript
import { TrailDataEnhancementService, TrailPoint } from './TrailDataEnhancementService';

describe('TrailDataEnhancementService', () => {
  let service: TrailDataEnhancementService;
  
  beforeEach(() => {
    service = new TrailDataEnhancementService();
  });

  describe('enhanceTrailData', () => {
    it('should throw error for empty points array', () => {
      expect(() => service.enhanceTrailData([])).toThrow('Trail points array must not be empty');
    });

    it('should throw error for invalid input', () => {
      expect(() => service.enhanceTrailData(null as any)).toThrow('Trail points array must not be empty');
    });

    it('should correctly enhance trail data with all metrics', () => {
      const points: TrailPoint[] = [
        { latitude: 40.0, longitude: -74.0, elevation: 100, timestamp: new Date('2023-01-01T10:00:00') },
        { latitude: 40.1, longitude: -74.1, elevation: 200, timestamp: new Date('2023-01-01T11:00:00') },
        { latitude: 40.2, longitude: -74.2, elevation: 150, timestamp: new Date('2023-01-01T12:00:00') }
      ];

      const result = service.enhanceTrailData(points);

      expect(result).toMatchObject({
        points: points,
        elevationGain: 100,
        elevationLoss: 50,
        maxElevation: 200,
        minElevation: 100,
        averageElevation: 150,
        duration: 7200000 // 2 hours in milliseconds
      });
      expect(result.totalDistance).toBeGreaterThan(0);
    });

    it('should handle trail data without timestamps', () => {
      const points: TrailPoint[] = [
        { latitude: 40.0, longitude: -74.0, elevation: 100 },
        { latitude: 40.1, longitude: -74.1, elevation: 200 }
      ];

      const result = service.enhanceTrailData(points);

      expect(result.duration).toBeUndefined();
    });
  });

  describe('calculateTotalDistance', () => {
    it('should calculate correct distance between two points', () => {
      const points: TrailPoint[] = [
        { latitude: 0, longitude: 0, elevation: 0 },
        { latitude: 1, longitude: 1, elevation: 0 }
      ];

      const result = service['calculateTotalDistance'](points);
      
      // Approximately 157km between these points
      expect(result).toBeCloseTo(157000, -3);
    });

    it('should return 0 for single point', () => {
      const points: TrailPoint[] = [
        { latitude: 0, longitude: 0, elevation: 0 }
      ];

      const result = service['calculateTotalDistance'](points);
      expect(result).toBe(0);
    });
  });

  describe('calculateElevationChanges', () => {
    it('should calculate correct elevation gain and loss', () => {
      const points: TrailPoint[] = [
        { latitude: 0, longitude: 0, elevation: 100 },
        { latitude: 0, longitude: 0, elevation: 200 },
        { latitude: 0, longitude: 0, elevation: 150 },
        { latitude: 0, longitude: 0, elevation: 300 }
      ];

      const result = service['calculateElevationChanges'](points);
      expect(result).toEqual({
        gain: 250,  // 100 + 150
        loss: 50    // 50
      });
    });

    it('should handle flat terrain', () => {
      const points: TrailPoint[] = [
        { latitude: 0, longitude: 0, elevation: 100 },
        { latitude: 0, longitude: 0, elevation: 100 },
        { latitude: 0, longitude: 0, elevation: 100 }
      ];

      const result = service['calculateElevationChanges'](points);
      expect(result).toEqual({ gain: 0, loss: 0 });
    });
  });

  describe('calculateElevationStats', () => {
    it('should calculate correct elevation statistics', () => {
      const points: TrailPoint[] = [
        { latitude: 0, longitude: 0, elevation: 100 },
        { latitude: 0, longitude: 0, elevation: 200 },
        { latitude: 0, longitude: 0, elevation: 150 }
      ];

      const result = service['calculateElevationStats'](points);
      expect(result).toEqual({
        max: 200,
        min: 100,
        avg: 150
      });
    });
  });

  describe('calculateDuration', () => {
    it('should calculate correct duration with timestamps', () => {
      const points: TrailPoint[] = [
        { latitude: 0, longitude: 0, elevation: 0, timestamp: new Date('2023-01-01T10:00:00') },
        { latitude: 0, longitude: 0, elevation: 0, timestamp: new Date('2023-01-01T11:00:00') }
      ];

      const result = service['calculateDuration'](points);
      expect(result).toBe(3600000); // 1 hour in milliseconds
    });

    it('should return undefined when timestamps are missing', () => {
      const points: TrailPoint[] = [
        { latitude: 0, longitude: 0, elevation: 0 },
        { latitude: 0, longitude: 0, elevation: 0 }
      ];

      const result = service['calculateDuration'](points);
      expect(result).toBeUndefined();
    });
  });

  describe('getDistanceBetweenPoints', () => {
    it('should calculate correct distance between two points', () => {
      const p1: TrailPoint = { latitude: 0, longitude: 0, elevation: 0 };
      const p2: TrailPoint = { latitude: 1, longitude: 1, elevation: 0 };

      const result = service['getDistanceBetweenPoints'](p1, p2);
      expect(result).toBeCloseTo(157000, -3); // Approximately 157km
    });

    it('should return 0 for same point', () => {
      const p: TrailPoint = { latitude: 0, longitude: 0, elevation: 0 };

      const result = service['getDistanceBetweenPoints'](p, p);
      expect(result).toBe(0);
    });
  });
});
```

This test suite includes:

1. Tests for the main `enhanceTrailData` method with various scenarios
2. Tests for all private helper methods
3. Edge cases and error conditions
4. Validation of calculations and results
5. Tests for handling missing or optional data (like timestamps)

Key testing patterns used:

- `beforeEach` to set up fresh service instance for each test
- Private method testing using TypeScript's bracket notation
- Appropriate use of `toBeCloseTo` for floating-point comparisons
- Comprehensive error case testing
- Testing with both valid and invalid inputs
- Testing of edge cases (single points, same points, etc.)
- Validation of complex calculations

Note that for distance calculations, we use approximate comparisons (`toBeCloseTo`) since floating-point math and geographical calculations often involve some degree of imprecision.

To run these tests, you'll need Jest configured with TypeScript support in your project. You can run them using:

```bash
npm test
```

or

```bash
jest
```