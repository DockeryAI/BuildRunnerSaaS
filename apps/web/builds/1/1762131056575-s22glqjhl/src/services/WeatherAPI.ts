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
 * @description Configuration options for WeatherAPI service
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
 * @description Service for interacting with weather API endpoints
 */
export class WeatherAPI {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly units: string;

  /**
   * @constructor
   * @param {WeatherAPIConfig} config - Configuration options
   */
  constructor(config: WeatherAPIConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
    this.units = config.units || 'metric';
  }

  /**
   * @method getWeatherByCity
   * @description Get current weather data for a specific city
   * @param {string} city - City name to get weather for
   * @returns {Promise<WeatherData>} Weather data for requested city
   * @throws {WeatherAPIError} When API request fails
   */
  public async getWeatherByCity(city: string): Promise<WeatherData> {
    try {
      const response = await fetch(
        `${this.baseUrl}/weather?q=${encodeURIComponent(city)}&units=${
          this.units
        }&appid=${this.apiKey}`
      );

      if (!response.ok) {
        throw new WeatherAPIError(`Failed to fetch weather data: ${response.statusText}`);
      }

      const data = await response.json();

      return this.transformWeatherData(data, city);
    } catch (error) {
      if (error instanceof WeatherAPIError) {
        throw error;
      }
      throw new WeatherAPIError(`Failed to fetch weather data: ${error.message}`);
    }
  }

  /**
   * @method getWeatherByCoordinates
   * @description Get current weather data for specific coordinates
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise<WeatherData>} Weather data for requested coordinates
   * @throws {WeatherAPIError} When API request fails
   */
  public async getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await fetch(
        `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&units=${this.units}&appid=${
          this.apiKey
        }`
      );

      if (!response.ok) {
        throw new WeatherAPIError(`Failed to fetch weather data: ${response.statusText}`);
      }

      const data = await response.json();

      return this.transformWeatherData(data, `${lat},${lon}`);
    } catch (error) {
      if (error instanceof WeatherAPIError) {
        throw error;
      }
      throw new WeatherAPIError(`Failed to fetch weather data: ${error.message}`);
    }
  }

  /**
   * @private
   * @method transformWeatherData
   * @description Transform raw API response into WeatherData format
   * @param {any} data - Raw API response data
   * @param {string} location - Location identifier
   * @returns {WeatherData} Transformed weather data
   */
  private transformWeatherData(data: any, location: string): WeatherData {
    return {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      description: data.weather[0].description,
      location,
      timestamp: new Date()
    };
  }

  /**
   * @method getForecast
   * @description Get weather forecast for next 5 days
   * @param {string} city - City name to get forecast for
   * @returns {Promise<WeatherData[]>} Array of weather data for forecast
   * @throws {WeatherAPIError} When API request fails
   */
  public async getForecast(city: string): Promise<WeatherData[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/forecast?q=${encodeURIComponent(city)}&units=${
          this.units
        }&appid=${this.apiKey}`
      );

      if (!response.ok) {
        throw new WeatherAPIError(`Failed to fetch forecast data: ${response.statusText}`);
      }

      const data = await response.json();

      return data.list.map((item: any) => this.transformWeatherData(item, city));
    } catch (error) {
      if (error instanceof WeatherAPIError) {
        throw error;
      }
      throw new WeatherAPIError(`Failed to fetch forecast data: ${error.message}`);
    }
  }
}
```