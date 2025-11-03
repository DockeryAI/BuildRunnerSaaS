// src/api/weather.ts

/**
 * Weather API configuration and interface definitions
 */

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  location: string;
  timestamp: number;
}

export interface WeatherAPIConfig {
  apiKey: string;
  baseUrl: string;
}

export interface WeatherAPIError {
  code: number;
  message: string;
}

/**
 * Weather API client for fetching weather data
 */
export class WeatherAPI {
  private config: WeatherAPIConfig;

  constructor(config: WeatherAPIConfig) {
    this.config = config;
  }

  /**
   * Fetches current weather data for a location
   * @param location - City name or coordinates
   * @returns Promise resolving to WeatherData
   * @throws WeatherAPIError on failed requests
   */
  public async getCurrentWeather(location: string): Promise<WeatherData> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/weather?q=${encodeURIComponent(location)}&appid=${
          this.config.apiKey
        }&units=metric`
      );

      if (!response.ok) {
        throw {
          code: response.status,
          message: `Weather API error: ${response.statusText}`,
        };
      }

      const data = await response.json();

      return {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        description: data.weather[0].description,
        location: data.name,
        timestamp: data.dt * 1000, // Convert to milliseconds
      };
    } catch (error) {
      throw {
        code: error.code || 500,
        message: error.message || 'Failed to fetch weather data',
      };
    }
  }

  /**
   * Fetches 5-day weather forecast for a location
   * @param location - City name or coordinates
   * @returns Promise resolving to array of WeatherData
   * @throws WeatherAPIError on failed requests
   */
  public async getForecast(location: string): Promise<WeatherData[]> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/forecast?q=${encodeURIComponent(location)}&appid=${
          this.config.apiKey
        }&units=metric`
      );

      if (!response.ok) {
        throw {
          code: response.status,
          message: `Weather API error: ${response.statusText}`,
        };
      }

      const data = await response.json();

      return data.list.map((item: any) => ({
        temperature: item.main.temp,
        humidity: item.main.humidity,
        windSpeed: item.wind.speed,
        description: item.weather[0].description,
        location: data.city.name,
        timestamp: item.dt * 1000,
      }));
    } catch (error) {
      throw {
        code: error.code || 500,
        message: error.message || 'Failed to fetch forecast data',
      };
    }
  }
}

/**
 * Creates and configures WeatherAPI instance
 * @returns Configured WeatherAPI instance
 */
export const createWeatherAPI = (): WeatherAPI => {
  const config: WeatherAPIConfig = {
    apiKey: process.env.REACT_APP_WEATHER_API_KEY || '',
    baseUrl: 'https://api.openweathermap.org/data/2.5',
  };

  return new WeatherAPI(config);
};

// Export singleton instance
export const weatherAPI = createWeatherAPI();