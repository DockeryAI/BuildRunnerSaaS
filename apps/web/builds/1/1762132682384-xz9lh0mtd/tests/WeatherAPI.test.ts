Here's a comprehensive set of unit tests for the WeatherAPI component using Jest:

```typescript
import { WeatherAPI } from './WeatherAPI';

describe('WeatherAPI', () => {
  let api: WeatherAPI;
  const mockConfig = {
    apiKey: 'test-api-key',
    baseUrl: 'https://api.weather.test',
    units: 'metric' as const
  };

  beforeEach(() => {
    api = new WeatherAPI(mockConfig);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default units if not provided', () => {
      const apiWithoutUnits = new WeatherAPI({
        apiKey: 'test-key',
        baseUrl: 'https://test.com'
      });
      expect(apiWithoutUnits['config'].units).toBe('metric');
    });

    it('should use provided units when specified', () => {
      const apiWithUnits = new WeatherAPI({
        ...mockConfig,
        units: 'imperial'
      });
      expect(apiWithUnits['config'].units).toBe('imperial');
    });
  });

  describe('getCurrentWeather', () => {
    const mockWeatherData = {
      temperature: 20,
      humidity: 65,
      conditions: 'Sunny',
      windSpeed: 10,
      location: {
        city: 'London',
        country: 'UK'
      }
    };

    it('should fetch current weather data successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWeatherData)
      });

      const result = await api.getCurrentWeather('London', 'UK');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/current?location=London,UK'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key'
          })
        })
      );
      expect(result).toEqual(mockWeatherData);
    });

    it('should handle API errors appropriately', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      });

      await expect(api.getCurrentWeather('Invalid')).rejects.toThrow(
        'Failed to fetch weather data: Weather API error: Not Found'
      );
    });

    it('should work without country parameter', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWeatherData)
      });

      await api.getCurrentWeather('London');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/current?location=London'),
        expect.any(Object)
      );
    });
  });

  describe('getForecast', () => {
    const mockForecastData = Array(5).fill({
      temperature: 20,
      humidity: 65,
      conditions: 'Sunny',
      windSpeed: 10,
      location: {
        city: 'London',
        country: 'UK'
      }
    });

    it('should fetch forecast data successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockForecastData)
      });

      const result = await api.getForecast('London', 5, 'UK');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/forecast?location=London,UK&days=5'),
        expect.any(Object)
      );
      expect(result).toEqual(mockForecastData);
    });

    it('should validate days parameter', async () => {
      await expect(api.getForecast('London', 8)).rejects.toThrow(
        'Failed to fetch forecast data: Forecast days must be between 1 and 7'
      );
    });

    it('should use default days value when not provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockForecastData)
      });

      await api.getForecast('London');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('days=5'),
        expect.any(Object)
      );
    });
  });

  describe('updateConfig', () => {
    it('should update configuration correctly', () => {
      const newConfig = {
        apiKey: 'new-key',
        units: 'imperial' as const
      };

      api.updateConfig(newConfig);

      expect(api['config']).toEqual({
        ...mockConfig,
        ...newConfig
      });
    });

    it('should maintain existing config values when partially updated', () => {
      const originalConfig = { ...api['config'] };
      api.updateConfig({ apiKey: 'new-key' });

      expect(api['config']).toEqual({
        ...originalConfig,
        apiKey: 'new-key'
      });
    });
  });

  describe('validateConfig', () => {
    it('should return true for valid config', () => {
      expect(api.validateConfig()).toBe(true);
    });

    it('should return false for invalid config', () => {
      api.updateConfig({ apiKey: '' });
      expect(api.validateConfig()).toBe(false);

      api.updateConfig({ units: 'invalid' as any });
      expect(api.validateConfig()).toBe(false);
    });
  });
});
```

This test suite includes:

1. Tests for the constructor and default values
2. Tests for getCurrentWeather method including:
   - Successful API calls
   - Error handling
   - Optional parameters
3. Tests for getForecast method including:
   - Successful API calls
   - Parameter validation
   - Default parameters
4. Tests for configuration management:
   - Updating config
   - Validating config
5. Proper setup and teardown of mocks

Key testing patterns used:

- Mock of global fetch API
- Testing of both success and error scenarios
- Validation of function parameters
- Testing of default values
- Testing of configuration management
- Proper type checking
- Testing of private configuration through bracket notation
- Use of beforeEach and afterEach for test setup and cleanup

To use these tests, you'll need to:

1. Have Jest configured in your project
2. Add the following to your Jest setup file or config:

```typescript
global.fetch = jest.fn();
```

3. Make sure you have the necessary TypeScript configurations to handle the testing environment.

The tests provide good coverage of the component's functionality while maintaining readability and maintainability.