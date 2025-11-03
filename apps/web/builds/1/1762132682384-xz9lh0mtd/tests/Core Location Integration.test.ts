Here's a comprehensive set of unit tests for the LocationService component using Jest:

```typescript
import { LocationService } from './LocationService';
import { GeolocationError } from './types';

describe('LocationService', () => {
  let locationService: LocationService;
  let mockGeolocation: jest.Mock;

  beforeEach(() => {
    // Mock navigator.geolocation
    mockGeolocation = jest.fn();
    const mockCurrentPosition = jest.fn();
    const mockWatchPosition = jest.fn();
    const mockClearWatch = jest.fn();

    global.navigator.geolocation = {
      getCurrentPosition: mockCurrentPosition,
      watchPosition: mockWatchPosition,
      clearWatch: mockClearWatch,
    };
  });

  describe('getInstance', () => {
    it('should create a singleton instance', () => {
      const instance1 = LocationService.getInstance();
      const instance2 = LocationService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should throw error if geolocation is not available', () => {
      // @ts-ignore
      delete global.navigator.geolocation;
      expect(() => LocationService.getInstance()).toThrow(
        'Geolocation is not supported by this browser'
      );
    });
  });

  describe('getCurrentPosition', () => {
    beforeEach(() => {
      locationService = LocationService.getInstance();
    });

    it('should get current position successfully', async () => {
      const mockPosition = {
        coords: {
          latitude: 51.5074,
          longitude: -0.1278,
          accuracy: 10,
          altitude: 100,
          altitudeAccuracy: 5,
          heading: 90,
          speed: 5,
        },
      };

      global.navigator.geolocation.getCurrentPosition = jest.fn((success) => {
        success(mockPosition);
      });

      const result = await locationService.getCurrentPosition();
      expect(result).toEqual(mockPosition.coords);
    });

    it('should handle permission denied error', async () => {
      const mockError = {
        code: 1,
        message: 'User denied geolocation',
      };

      global.navigator.geolocation.getCurrentPosition = jest.fn((success, error) => {
        error(mockError);
      });

      await expect(locationService.getCurrentPosition()).rejects.toEqual({
        code: 1,
        message: 'Location permission denied',
        originalError: mockError,
      });
    });

    it('should use custom options', async () => {
      const customOptions = {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 1000,
      };

      global.navigator.geolocation.getCurrentPosition = jest.fn();
      
      await locationService.getCurrentPosition(customOptions);
      
      expect(global.navigator.geolocation.getCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        customOptions
      );
    });
  });

  describe('watchPosition', () => {
    const mockSuccessCallback = jest.fn();
    const mockErrorCallback = jest.fn();

    beforeEach(() => {
      locationService = LocationService.getInstance();
      mockSuccessCallback.mockClear();
      mockErrorCallback.mockClear();
    });

    it('should watch position changes', () => {
      const mockWatchId = 123;
      global.navigator.geolocation.watchPosition = jest.fn().mockReturnValue(mockWatchId);

      const result = locationService.watchPosition(
        mockSuccessCallback,
        mockErrorCallback
      );

      expect(result).toBe(mockWatchId);
      expect(global.navigator.geolocation.watchPosition).toHaveBeenCalled();
    });

    it('should handle position updates', () => {
      const mockPosition = {
        coords: {
          latitude: 51.5074,
          longitude: -0.1278,
        },
      };

      global.navigator.geolocation.watchPosition = jest.fn((success) => {
        success(mockPosition);
        return 123;
      });

      locationService.watchPosition(mockSuccessCallback, mockErrorCallback);
      expect(mockSuccessCallback).toHaveBeenCalledWith(mockPosition.coords);
    });
  });

  describe('clearWatch', () => {
    beforeEach(() => {
      locationService = LocationService.getInstance();
    });

    it('should clear watch with provided ID', () => {
      const mockWatchId = 123;
      locationService.clearWatch(mockWatchId);
      expect(global.navigator.geolocation.clearWatch).toHaveBeenCalledWith(mockWatchId);
    });

    it('should clear watch with stored ID', () => {
      global.navigator.geolocation.watchPosition = jest.fn().mockReturnValue(123);
      locationService.watchPosition(jest.fn(), jest.fn());
      locationService.clearWatch();
      expect(global.navigator.geolocation.clearWatch).toHaveBeenCalledWith(123);
    });
  });

  describe('calculateDistance', () => {
    beforeEach(() => {
      locationService = LocationService.getInstance();
    });

    it('should calculate distance between two points correctly', () => {
      const point1 = {
        latitude: 51.5074,
        longitude: -0.1278,
      };
      const point2 = {
        latitude: 48.8566,
        longitude: 2.3522,
      };

      const distance = locationService.calculateDistance(point1, point2);
      // Approximate distance between London and Paris
      expect(Math.round(distance / 1000)).toBe(344); // 344 km (approximately)
    });

    it('should return 0 for same points', () => {
      const point = {
        latitude: 51.5074,
        longitude: -0.1278,
      };

      const distance = locationService.calculateDistance(point, point);
      expect(distance).toBe(0);
    });
  });
});
```

This test suite includes:

1. Mocking of the browser's geolocation API
2. Tests for singleton pattern implementation
3. Tests for getCurrentPosition with success and error cases
4. Tests for watchPosition functionality
5. Tests for clearWatch functionality
6. Tests for distance calculation
7. Error handling tests
8. Tests for custom options handling

Key testing patterns used:

- beforeEach hooks to set up fresh mocks for each test
- Async/await testing for Promise-based methods
- Mock function spies to verify callback execution
- Error case testing
- Edge case testing
- Geometric calculation verification

To run these tests, you'll need to have Jest configured in your project with the following dev dependencies:

```json
{
  "devDependencies": {
    "@types/jest": "^27.0.0",
    "jest": "^27.0.0",
    "ts-jest": "^27.0.0"
  }
}
```

And a jest.config.js that includes:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
};
```

The jsdom test environment is necessary because we're testing browser APIs.