```typescript
/**
 * @interface WeatherData
 * @description Interface representing weather data returned from API
 */
interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  location: string;
  timestamp: Date;
}

/**
 * @interface WeatherAPIConfig 
 * @description Configuration options for the WeatherAPI service
 */
interface WeatherAPIConfig {
  apiKey: string;
  baseUrl: string;
  units?: 'metric' | 'imperial';
}

/**
 * @class WeatherAPIError
 * @extends Error
 * @description Custom error class for WeatherAPI related errors
 */
class WeatherAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherAPIError';
  }
}

/**
 * @class WeatherAPI
 * @description Service for fetching weather data from a weather API
 */
export class WeatherAPI {
  private readonly config: WeatherAPIConfig;
  private readonly cache: Map<string, {data: WeatherData, timestamp: number}>;
  private readonly CACHE_DURATION = 300000; // 5 minutes in milliseconds

  /**
   * @constructor
   * @param {WeatherAPIConfig} config - Configuration for the WeatherAPI service
   */
  constructor(config: WeatherAPIConfig) {
    this.config = config;
    this.cache = new Map();
  }

  /**
   * @method getCurrentWeather
   * @description Fetches current weather data for a given location
   * @param {string} location - Location to fetch weather for
   * @returns {Promise<WeatherData>} Weather data for the specified location
   * @throws {WeatherAPIError} If the API request fails
   */
  public async getCurrentWeather(location: string): Promise<WeatherData> {
    try {
      // Check cache first
      const cached = this.getCachedData(location);
      if (cached) {
        return cached;
      }

      const url = this.buildRequestUrl(location);
      const response = await fetch(url);

      if (!response.ok) {
        throw new WeatherAPIError(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const weatherData = this.transformResponse(data, location);
      
      // Cache the result
      this.cacheData(location, weatherData);

      return weatherData;
    } catch (error) {
      if (error instanceof WeatherAPIError) {
        throw error;
      }
      throw new WeatherAPIError(`Failed to fetch weather data: ${error.message}`);
    }
  }

  /**
   * @private
   * @method buildRequestUrl
   * @description Builds the API request URL
   * @param {string} location - Location to fetch weather for
   * @returns {string} Complete API request URL
   */
  private buildRequestUrl(location: string): string {
    const params = new URLSearchParams({
      q: location,
      appid: this.config.apiKey,
      units: this.config.units || 'metric'
    });

    return `${this.config.baseUrl}?${params.toString()}`;
  }

  /**
   * @private
   * @method transformResponse
   * @description Transforms raw API response into WeatherData format
   * @param {any} data - Raw API response data
   * @param {string} location - Original location query
   * @returns {WeatherData} Transformed weather data
   */
  private transformResponse(data: any, location: string): WeatherData {
    return {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      description: data.weather[0].description,
      location: location,
      timestamp: new Date()
    };
  }

  /**
   * @private
   * @method getCachedData
   * @description Retrieves cached weather data if available and not expired
   * @param {string} location - Location to get cached data for
   * @returns {WeatherData | null} Cached weather data or null if not available
   */
  private getCachedData(location: string): WeatherData | null {
    const cached = this.cache.get(location);
    
    if (!cached) {
      return null;
    }

    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(location);
      return null;
    }

    return cached.data;
  }

  /**
   * @private
   * @method cacheData
   * @description Caches weather data for a location
   * @param {string} location - Location to cache data for
   * @param {WeatherData} data - Weather data to cache
   */
  private cacheData(location: string, data: WeatherData): void {
    this.cache.set(location, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * @method clearCache
   * @description Clears all cached weather data
   */
  public clearCache(): void {
    this.cache.clear();
  }
}
```