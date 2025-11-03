```typescript
/**
 * @file weatherAPI.ts
 * @description Weather API integration service for fetching weather data
 */

import { SupabaseClient } from '@supabase/supabase-js';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  conditions: string;
  location: string;
  timestamp: Date;
}

interface WeatherAPIConfig {
  apiKey: string;
  baseUrl: string;
  supabase: SupabaseClient;
}

interface WeatherAPIResponse {
  success: boolean;
  data?: WeatherData;
  error?: string;
}

export class WeatherAPI {
  private config: WeatherAPIConfig;
  private cache: Map<string, {data: WeatherData, timestamp: number}>;
  private readonly CACHE_TTL = 1800000; // 30 minutes in milliseconds

  /**
   * Creates an instance of WeatherAPI service
   * @param config - Configuration object containing API credentials and Supabase instance
   */
  constructor(config: WeatherAPIConfig) {
    this.config = config;
    this.cache = new Map();
  }

  /**
   * Fetches weather data for a specific location
   * @param location - Location string (city, coordinates, etc.)
   * @returns Promise resolving to WeatherAPIResponse
   */
  public async getWeather(location: string): Promise<WeatherAPIResponse> {
    try {
      // Check cache first
      const cachedData = this.getCachedData(location);
      if (cachedData) {
        return {
          success: true,
          data: cachedData
        };
      }

      const response = await fetch(
        `${this.config.baseUrl}/weather?q=${encodeURIComponent(location)}&appid=${this.config.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Weather API responded with status: ${response.status}`);
      }

      const rawData = await response.json();
      const weatherData = this.transformWeatherData(rawData, location);

      // Cache the results
      this.cacheData(location, weatherData);

      // Store in Supabase
      await this.storeWeatherData(weatherData);

      return {
        success: true,
        data: weatherData
      };

    } catch (error) {
      console.error('Weather API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Transforms raw API response into standardized WeatherData format
   * @param rawData - Raw API response data
   * @param location - Original location string
   * @returns Formatted WeatherData object
   */
  private transformWeatherData(rawData: any, location: string): WeatherData {
    return {
      temperature: rawData.main.temp,
      humidity: rawData.main.humidity,
      windSpeed: rawData.wind.speed,
      conditions: rawData.weather[0].main,
      location: location,
      timestamp: new Date()
    };
  }

  /**
   * Stores weather data in Supabase
   * @param data - Weather data to store
   */
  private async storeWeatherData(data: WeatherData): Promise<void> {
    try {
      const { error } = await this.config.supabase
        .from('weather_history')
        .insert([data]);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Supabase Storage Error:', error);
    }
  }

  /**
   * Retrieves cached weather data if valid
   * @param location - Location string
   * @returns WeatherData if valid cache exists, null otherwise
   */
  private getCachedData(location: string): WeatherData | null {
    const cached = this.cache.get(location);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  /**
   * Caches weather data for a location
   * @param location - Location string
   * @param data - Weather data to cache
   */
  private cacheData(location: string, data: WeatherData): void {
    this.cache.set(location, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clears expired cache entries
   */
  private clearExpiredCache(): void {
    const now = Date.now();
    for (const [location, cached] of this.cache.entries()) {
      if (now - cached.timestamp > this.CACHE_TTL) {
        this.cache.delete(location);
      }
    }
  }

  /**
   * Validates API configuration
   * @returns boolean indicating if config is valid
   */
  public validateConfig(): boolean {
    return Boolean(
      this.config.apiKey &&
      this.config.baseUrl &&
      this.config.supabase
    );
  }
}

export type { WeatherData, WeatherAPIConfig, WeatherAPIResponse };
```