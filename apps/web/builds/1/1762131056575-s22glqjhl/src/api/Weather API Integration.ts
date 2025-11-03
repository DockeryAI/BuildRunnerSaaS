```typescript
/**
 * @fileoverview Weather API integration service
 */

import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Weather data interface
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
 * Weather API configuration interface
 */
interface WeatherApiConfig {
  apiKey: string;
  baseUrl: string;
}

/**
 * Weather API service class
 */
export class WeatherApiService {
  private supabase: SupabaseClient;
  private config: WeatherApiConfig;

  /**
   * Creates an instance of WeatherApiService
   * @param supabase - Supabase client instance
   * @param config - Weather API configuration
   */
  constructor(supabase: SupabaseClient, config: WeatherApiConfig) {
    this.supabase = supabase;
    this.config = config;
  }

  /**
   * Fetches current weather data for a location
   * @param location - Location to fetch weather for
   * @returns Promise containing weather data
   * @throws Error if API request fails
   */
  public async getCurrentWeather(location: string): Promise<WeatherData> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/current?location=${encodeURIComponent(
          location
        )}&key=${this.config.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      const weatherData: WeatherData = {
        temperature: data.temp_c,
        humidity: data.humidity,
        windSpeed: data.wind_kph,
        description: data.condition.text,
        location: data.location.name,
        timestamp: new Date(data.last_updated)
      };

      await this.saveWeatherData(weatherData);

      return weatherData;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }

  /**
   * Saves weather data to Supabase
   * @param data - Weather data to save
   * @returns Promise that resolves when data is saved
   * @throws Error if database operation fails
   */
  private async saveWeatherData(data: WeatherData): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('weather_history')
        .insert([data]);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error saving weather data:', error);
      throw error;
    }
  }

  /**
   * Gets weather history for a location
   * @param location - Location to get history for
   * @param limit - Maximum number of records to return
   * @returns Promise containing array of weather data
   * @throws Error if database query fails
   */
  public async getWeatherHistory(
    location: string,
    limit: number = 10
  ): Promise<WeatherData[]> {
    try {
      const { data, error } = await this.supabase
        .from('weather_history')
        .select('*')
        .eq('location', location)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data as WeatherData[];
    } catch (error) {
      console.error('Error fetching weather history:', error);
      throw error;
    }
  }

  /**
   * Gets average temperature for a location over a time period
   * @param location - Location to get average for
   * @param startDate - Start of time period
   * @param endDate - End of time period
   * @returns Promise containing average temperature
   * @throws Error if database query fails
   */
  public async getAverageTemperature(
    location: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('weather_history')
        .select('temperature')
        .eq('location', location)
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      if (error) {
        throw error;
      }

      if (!data.length) {
        return 0;
      }

      const sum = data.reduce((acc, curr) => acc + curr.temperature, 0);
      return sum / data.length;
    } catch (error) {
      console.error('Error calculating average temperature:', error);
      throw error;
    }
  }
}

/**
 * Creates a new WeatherApiService instance
 * @param supabase - Supabase client instance
 * @param config - Weather API configuration
 * @returns WeatherApiService instance
 */
export const createWeatherApiService = (
  supabase: SupabaseClient,
  config: WeatherApiConfig
): WeatherApiService => {
  return new WeatherApiService(supabase, config);
};
```