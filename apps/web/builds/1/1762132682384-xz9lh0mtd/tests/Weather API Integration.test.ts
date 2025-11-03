Here's a comprehensive set of unit tests for the WeatherAPI component using Jest:

```typescript
// weatherAPI.test.ts

import { WeatherAPI, WeatherAPIConfig, WeatherData } from './weatherAPI';
import { createClient } from '@supabase/supabase-js';

describe('WeatherAPI', () => {
  let weatherAPI: WeatherAPI;
  let mockFetch: jest.Mock;
  let mockSupabaseInsert: jest.Mock;

  const mockConfig: WeatherAPIConfig = {
    apiKey: 'test-api-key',
    baseUrl: 'https://api.weather.com',
    supabase: createClient('https://test.supabase.co', 'test-key')
  };

  const mockWeatherResponse = {
    main: {
      temp: 20,
      humidity: 65
    },
    wind: {
      speed: 10
    },
    weather: [
      { main: 'Cloudy' }
    ]
  };

  beforeEach(() => {
    // Mock fetch
    mockFetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockWeatherResponse)
      })
    );
    global.fetch = mockFetch;

    // Mock Supabase insert
    mockSupabaseInsert = jest.fn(() => Promise.resolve({ error: null }));
    mockConfig.supabase.from = jest.fn().mockReturnValue({
      insert: mockSupabaseInsert
    });

    weatherAPI = new WeatherAPI(mockConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with valid config', () => {
      expect(weatherAPI).toBeInstanceOf(WeatherAPI);
      expect(weatherAPI.validateConfig()).toBe(true);
    });
  });

  describe('getWeather', () => {
    const location = 'London';

    it('should fetch weather data successfully', async () => {
      const result = await weatherAPI.getWeather(location);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockFetch).toHaveBeenCalledWith(
        `${mockConfig.baseUrl}/weather?q=${location}&appid=${mockConfig.apiKey}`
      );
    });

    it('should return cached data if available and not expired', async () => {
      // First call to populate cache
      await weatherAPI.getWeather(location);
      mockFetch.mockClear();

      // Second call should use cache
      const result = await weatherAPI.getWeather(location);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 404
        })
      );

      const result = await weatherAPI.getWeather(location);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should store data in Supabase', async () => {
      await weatherAPI.getWeather(location);

      expect(mockSupabaseInsert).toHaveBeenCalled();
      const insertedData = mockSupabaseInsert.mock.calls[0][0][0];
      expect(insertedData).toHaveProperty('temperature');
      expect(insertedData).toHaveProperty('location', location);
    });
  });

  describe('data transformation', () => {
    it('should transform raw weather data correctly', async () => {
      const result = await weatherAPI.getWeather('Paris');
      const weatherData = result.data as WeatherData;

      expect(weatherData).toEqual({
        temperature: mockWeatherResponse.main.temp,
        humidity: mockWeatherResponse.main.humidity,
        windSpeed: mockWeatherResponse.wind.speed,
        conditions: mockWeatherResponse.weather[0].main,
        location: 'Paris',
        timestamp: expect.any(Date)
      });
    });
  });

  describe('cache management', () => {
    it('should clear expired cache entries', async () => {
      const location = 'Tokyo';
      
      // Mock Date.now to simulate time passing
      const realDateNow = Date.now.bind(global.Date);
      const dateNowStub = jest.fn(() => 0);
      global.Date.now = dateNowStub;
      
      // First call
      await weatherAPI.getWeather(location);
      
      // Simulate 31 minutes passing (beyond TTL)
      dateNowStub.mockImplementation(() => 31 * 60 * 1000);
      
      // Second call should trigger new fetch
      await weatherAPI.getWeather(location);
      
      expect(mockFetch).toHaveBeenCalledTimes(2);
      
      // Restore original Date.now
      global.Date.now = realDateNow;
    });
  });

  describe('config validation', () => {
    it('should return false for invalid config', () => {
      const invalidAPI = new WeatherAPI({
        apiKey: '',
        baseUrl: mockConfig.baseUrl,
        supabase: mockConfig.supabase
      });

      expect(invalidAPI.validateConfig()).toBe(false);
    });

    it('should return true for valid config', () => {
      expect(weatherAPI.validateConfig()).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

      const result = await weatherAPI.getWeather('Berlin');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should handle Supabase storage errors', async () => {
      mockSupabaseInsert.mockImplementationOnce(() => 
        Promise.resolve({ error: new Error('Storage error') })
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      await weatherAPI.getWeather('Madrid');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Supabase Storage Error:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });
});
```

This test suite covers:

1. Basic initialization and configuration validation
2. Weather data fetching functionality
3. Caching mechanism
4. Data transformation
5. Error handling
6. Supabase integration
7. Cache expiration and management

Key testing approaches used:

- Mock implementations for external dependencies (fetch, Supabase)
- Time manipulation for testing cache expiration
- Error scenario testing
- Data transformation verification
- Console error logging verification
- Configuration validation

The tests use Jest's mocking capabilities to avoid actual API calls and database operations while still thoroughly testing the component's functionality.

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

And a jest.config.js that includes TypeScript support:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts']
};
```