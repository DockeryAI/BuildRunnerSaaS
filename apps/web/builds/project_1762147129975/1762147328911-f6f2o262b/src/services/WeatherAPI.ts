/**
 * @fileoverview Weather API service for fetching weather data
 */

/**
 * Weather data interface
 */
export interface WeatherData {
  temperature: number;
  conditions: string;
  humidity: number;
  windSpeed: number;
  location: string;
}

/**
 * Error response interface
 */
export interface WeatherError {
  message: string;
  code: number;
}

/**
 * Weather API configuration
 */
interface WeatherConfig {
  apiKey: string;
  baseUrl: string;
}

/**
 * Weather API service class
 */
export class WeatherAPI {
  private config: WeatherConfig;

  constructor(apiKey: string) {
    this.config = {
      apiKey,
      baseUrl: 'https://api.weatherapi.com/v1'
    };
  }

  /**
   * Fetches current weather for a location
   * @param location - City name or coordinates
   * @returns Promise with weather data
   * @throws {WeatherError}
   */
  public async getCurrentWeather(location: string): Promise<WeatherData> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/current.json?key=${this.config.apiKey}&q=${encodeURIComponent(location)}`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        temperature: data.current.temp_c,
        conditions: data.current.condition.text,
        humidity: data.current.humidity,
        windSpeed: data.current.wind_kph,
        location: data.location.name
      };
    } catch (error) {
      const weatherError: WeatherError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 500
      };
      throw weatherError;
    }
  }

  /**
   * Fetches weather forecast for specified days
   * @param location - City name or coordinates 
   * @param days - Number of days to forecast
   * @returns Promise with array of weather data
   * @throws {WeatherError}
   */
  public async getForecast(location: string, days: number = 5): Promise<WeatherData[]> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/forecast.json?key=${this.config.apiKey}&q=${encodeURIComponent(location)}&days=${days}`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }

      const data = await response.json();

      return data.forecast.forecastday.map((day: any) => ({
        temperature: day.day.avgtemp_c,
        conditions: day.day.condition.text,
        humidity: day.day.avghumidity,
        windSpeed: day.day.maxwind_kph,
        location: data.location.name
      }));
    } catch (error) {
      const weatherError: WeatherError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 500
      };
      throw weatherError;
    }
  }

  /**
   * Validates API key
   * @returns Promise<boolean>
   */
  public async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/current.json?key=${this.config.apiKey}&q=London`
      );
      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * Create singleton instance
 */
export const weatherApi = new WeatherAPI(process.env.REACT_APP_WEATHER_API_KEY || '');

export default weatherApi;