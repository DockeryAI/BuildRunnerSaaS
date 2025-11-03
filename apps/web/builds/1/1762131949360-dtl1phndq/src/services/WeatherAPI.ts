```typescript
/**
 * @class WeatherAPI
 * @description Service for fetching weather data from a weather API
 */
export class WeatherAPI {
  private readonly API_KEY: string;
  private readonly BASE_URL = 'https://api.weatherapi.com/v1';

  /**
   * @constructor
   * @param apiKey - API key for authentication
   */
  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    this.API_KEY = apiKey;
  }

  /**
   * @interface WeatherData
   * @description Interface for weather data response
   */
  interface WeatherData {
    location: {
      name: string;
      region: string;
      country: string;
      lat: number;
      lon: number;
      localtime: string;
    };
    current: {
      temp_c: number;
      temp_f: number;
      condition: {
        text: string;
        icon: string;
      };
      wind_kph: number;
      wind_dir: string;
      humidity: number;
      precip_mm: number;
      feelslike_c: number;
    };
  }

  /**
   * Fetches current weather for a location
   * @param location - City name or coordinates
   * @returns Promise<WeatherData>
   * @throws Error if the API request fails
   */
  public async getCurrentWeather(location: string): Promise<WeatherData> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/current.json?key=${this.API_KEY}&q=${encodeURIComponent(location)}`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }

      const data: WeatherData = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch weather data: ${error.message}`);
    }
  }

  /**
   * Fetches weather forecast for a location
   * @param location - City name or coordinates
   * @param days - Number of days to forecast (1-7)
   * @returns Promise<any>
   * @throws Error if the API request fails
   */
  public async getForecast(location: string, days: number = 3): Promise<any> {
    if (days < 1 || days > 7) {
      throw new Error('Days must be between 1 and 7');
    }

    try {
      const response = await fetch(
        `${this.BASE_URL}/forecast.json?key=${this.API_KEY}&q=${encodeURIComponent(location)}&days=${days}`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch forecast data: ${error.message}`);
    }
  }

  /**
   * Searches for locations matching a query
   * @param query - Search query
   * @returns Promise<any>
   * @throws Error if the API request fails
   */
  public async searchLocations(query: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/search.json?key=${this.API_KEY}&q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to search locations: ${error.message}`);
    }
  }

  /**
   * Validates the API key by making a test request
   * @returns Promise<boolean>
   */
  public async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/current.json?key=${this.API_KEY}&q=London`
      );
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default WeatherAPI;
```