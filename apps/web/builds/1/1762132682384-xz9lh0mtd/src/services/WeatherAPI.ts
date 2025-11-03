```typescript
/**
 * @interface WeatherData
 * Represents the structure of weather data returned from the API
 */
interface WeatherData {
  temperature: number;
  humidity: number;
  conditions: string;
  windSpeed: number;
  location: {
    city: string;
    country: string;
  };
}

/**
 * @interface WeatherAPIConfig
 * Configuration options for the WeatherAPI service
 */
interface WeatherAPIConfig {
  apiKey: string;
  baseUrl: string;
  units?: 'metric' | 'imperial';
}

/**
 * Service for interacting with weather API endpoints
 */
export class WeatherAPI {
  private readonly config: WeatherAPIConfig;
  private readonly defaultHeaders: HeadersInit;

  /**
   * Creates an instance of WeatherAPI service
   * @param config - Configuration options for the API
   */
  constructor(config: WeatherAPIConfig) {
    this.config = {
      units: 'metric',
      ...config
    };

    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`
    };
  }

  /**
   * Fetches current weather data for a specific location
   * @param city - City name to get weather for
   * @param country - Optional country code
   * @returns Promise containing weather data
   * @throws Error if the API request fails
   */
  public async getCurrentWeather(city: string, country?: string): Promise<WeatherData> {
    try {
      const location = country ? `${city},${country}` : city;
      const url = new URL(`${this.config.baseUrl}/current`);
      url.searchParams.append('location', location);
      url.searchParams.append('units', this.config.units);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.defaultHeaders
      });

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }

      const data: WeatherData = await response.json();
      return data;

    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch weather data: ${error.message}`);
      }
      throw new Error('An unknown error occurred while fetching weather data');
    }
  }

  /**
   * Fetches weather forecast for a specific location
   * @param city - City name to get forecast for
   * @param days - Number of days to forecast (max 7)
   * @param country - Optional country code
   * @returns Promise containing array of weather data
   * @throws Error if the API request fails
   */
  public async getForecast(city: string, days: number = 5, country?: string): Promise<WeatherData[]> {
    try {
      if (days < 1 || days > 7) {
        throw new Error('Forecast days must be between 1 and 7');
      }

      const location = country ? `${city},${country}` : city;
      const url = new URL(`${this.config.baseUrl}/forecast`);
      url.searchParams.append('location', location);
      url.searchParams.append('days', days.toString());
      url.searchParams.append('units', this.config.units);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.defaultHeaders
      });

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }

      const data: WeatherData[] = await response.json();
      return data;

    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch forecast data: ${error.message}`);
      }
      throw new Error('An unknown error occurred while fetching forecast data');
    }
  }

  /**
   * Updates the API configuration
   * @param config - Partial configuration updates
   */
  public updateConfig(config: Partial<WeatherAPIConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };
  }

  /**
   * Validates the API configuration
   * @returns boolean indicating if config is valid
   */
  public validateConfig(): boolean {
    return Boolean(
      this.config.apiKey &&
      this.config.baseUrl &&
      ['metric', 'imperial'].includes(this.config.units)
    );
  }
}
```