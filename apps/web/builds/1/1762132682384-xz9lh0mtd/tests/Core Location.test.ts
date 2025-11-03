Here's a comprehensive set of unit tests for the CoreLocation component:

```typescript
// CoreLocation.test.ts
import { CoreLocation, GeolocationPosition, LocationError } from './CoreLocation';

describe('CoreLocation', () => {
  let mockGeolocation: any;
  
  beforeEach(() => {
    // Mock the navigator.geolocation API
    mockGeolocation = {
      getCurrentPosition: jest.fn(),
      watchPosition: jest.fn(),
      clearWatch: jest.fn(),
    };
    
    // @ts-ignore
    global.navigator.geolocation = mockGeolocation;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Singleton Instance', () => {
    it('should create only one instance', () => {
      const instance1 = CoreLocation.getInstance();
      const instance2 = CoreLocation.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('getCurrentPosition', () => {
    it('should resolve with position when successful', async () => {
      const mockPosition: GeolocationPosition = {
        coords: {
          latitude: 51.5074,
          longitude: -0.1278,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        },
        timestamp: Date.now()
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      const location = CoreLocation.getInstance();
      const result = await location.getCurrentPosition();
      
      expect(result).toEqual(mockPosition);
      expect(location.getLastPosition()).toEqual(mockPosition);
    });

    it('should reject with error when failed', async () => {
      const mockError: LocationError = {
        code: 1,
        message: 'User denied geolocation'
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error(mockError);
      });

      const location = CoreLocation.getInstance();
      await expect(location.getCurrentPosition()).rejects.toThrow();
    });
  });

  describe('watchPosition', () => {
    it('should set up position watching and handle updates', () => {
      const mockWatchId = 123;
      const successCallback = jest.fn();
      const errorCallback = jest.fn();

      mockGeolocation.watchPosition.mockReturnValue(mockWatchId);

      const location = CoreLocation.getInstance();
      const watchId = location.watchPosition(successCallback, errorCallback);

      expect(watchId).toBe(mockWatchId);
      expect(mockGeolocation.watchPosition).toHaveBeenCalled();
    });

    it('should clear existing watch before starting new one', () => {
      const successCallback = jest.fn();
      const errorCallback = jest.fn();

      const location = CoreLocation.getInstance();
      location.watchPosition(successCallback, errorCallback);
      location.watchPosition(successCallback, errorCallback);

      expect(mockGeolocation.clearWatch).toHaveBeenCalled();
    });
  });

  describe('clearWatch', () => {
    it('should clear active watch', () => {
      const location = CoreLocation.getInstance();
      const successCallback = jest.fn();
      const errorCallback = jest.fn();

      location.watchPosition(successCallback, errorCallback);
      location.clearWatch();

      expect(mockGeolocation.clearWatch).toHaveBeenCalled();
    });
  });

  describe('calculateDistance', () => {
    it('should calculate correct distance between two points', () => {
      const location = CoreLocation.getInstance();
      // London to Paris coordinates
      const distance = location.calculateDistance(
        51.5074, -0.1278,  // London
        48.8566, 2.3522    // Paris
      );

      // Approximate distance between London and Paris is 344 km
      expect(distance).toBeCloseTo(344, 0);
    });

    it('should return 0 for same coordinates', () => {
      const location = CoreLocation.getInstance();
      const distance = location.calculateDistance(
        51.5074, -0.1278,
        51.5074, -0.1278
      );

      expect(distance).toBe(0);
    });
  });

  describe('isValidCoordinates', () => {
    it('should validate correct coordinates', () => {
      const location = CoreLocation.getInstance();
      expect(location.isValidCoordinates(51.5074, -0.1278)).toBe(true);
      expect(location.isValidCoordinates(90, 180)).toBe(true);
      expect(location.isValidCoordinates(-90, -180)).toBe(true);
    });

    it('should invalidate incorrect coordinates', () => {
      const location = CoreLocation.getInstance();
      expect(location.isValidCoordinates(91, 0)).toBe(false);
      expect(location.isValidCoordinates(0, 181)).toBe(false);
      expect(location.isValidCoordinates(-91, 0)).toBe(false);
      expect(location.isValidCoordinates(0, -181)).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should throw error if geolocation is not available', () => {
      // @ts-ignore
      delete global.navigator.geolocation;
      
      expect(() => {
        CoreLocation.getInstance();
      }).toThrow('Geolocation is not supported by this browser');
    });
  });
});
```

This test suite covers:

1. Singleton pattern implementation
2. Getting current position (success and failure cases)
3. Watch position functionality
4. Clearing position watch
5. Distance calculation
6. Coordinate validation
7. Error handling
8. Edge cases

Key testing approaches used:

- Mocking the browser's geolocation API
- Testing async operations
- Testing mathematical calculations
- Testing error conditions
- Testing edge cases
- Testing input validation

The tests use Jest's mocking capabilities to simulate the browser's geolocation API and verify that the component interacts with it correctly. The distance calculation tests use known distances between cities to verify accuracy.

To run these tests, you'll need to have Jest configured in your project with TypeScript support. You might also need to add the following to your Jest configuration to handle the global navigator object:

```javascript
// jest.config.js
module.exports = {
  // ... other config
  testEnvironment: 'jsdom',
};
```