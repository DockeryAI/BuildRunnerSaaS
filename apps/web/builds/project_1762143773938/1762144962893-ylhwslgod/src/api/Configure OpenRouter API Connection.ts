```typescript
/**
 * @file openRouterApi.ts
 * Configuration and interface for OpenRouter API connections
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

/**
 * @interface OpenRouterConfig
 * @description Configuration options for OpenRouter API
 */
interface OpenRouterConfig {
  apiKey: string;
  baseURL: string;
  timeout?: number;
  maxRetries?: number;
}

/**
 * @interface OpenRouterResponse
 * @description Standard response format from OpenRouter API
 */
interface OpenRouterResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * @class OpenRouterAPI
 * @description Handles API connections and requests to OpenRouter
 */
export class OpenRouterAPI {
  private axiosInstance: AxiosInstance;
  private readonly maxRetries: number;
  private readonly config: OpenRouterConfig;

  /**
   * @constructor
   * @param {OpenRouterConfig} config - Configuration options for the API
   */
  constructor(config: OpenRouterConfig) {
    this.config = config;
    this.maxRetries = config.maxRetries || 3;

    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * @private
   * @description Sets up request/response interceptors
   */
  private setupInterceptors(): void {
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config;
        if (!config || !config.retry) {
          config!.retry = 0;
        }

        if (config!.retry >= this.maxRetries) {
          return Promise.reject(error);
        }

        config!.retry += 1;
        const delay = Math.min(1000 * (2 ** config!.retry), 10000);
        
        return new Promise((resolve) => {
          setTimeout(() => resolve(this.axiosInstance(config!)), delay);
        });
      }
    );
  }

  /**
   * @async
   * @template T
   * @param {string} endpoint - API endpoint to call
   * @param {any} data - Request payload
   * @returns {Promise<OpenRouterResponse<T>>}
   */
  public async post<T>(endpoint: string, data: any): Promise<OpenRouterResponse<T>> {
    try {
      const response: AxiosResponse = await this.axiosInstance.post(endpoint, data);
      return {
        success: true,
        data: response.data as T,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.message || error.message,
        };
      }
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  }

  /**
   * @async
   * @template T
   * @param {string} endpoint - API endpoint to call
   * @returns {Promise<OpenRouterResponse<T>>}
   */
  public async get<T>(endpoint: string): Promise<OpenRouterResponse<T>> {
    try {
      const response: AxiosResponse = await this.axiosInstance.get(endpoint);
      return {
        success: true,
        data: response.data as T,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.message || error.message,
        };
      }
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  }

  /**
   * @description Validates the API connection
   * @returns {Promise<boolean>}
   */
  public async validateConnection(): Promise<boolean> {
    try {
      await this.axiosInstance.get('/health');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * @description Updates the API key
   * @param {string} newApiKey - New API key to use
   */
  public updateApiKey(newApiKey: string): void {
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newApiKey}`;
    this.config.apiKey = newApiKey;
  }

  /**
   * @description Gets the current configuration
   * @returns {OpenRouterConfig}
   */
  public getConfig(): OpenRouterConfig {
    return { ...this.config };
  }
}

export default OpenRouterAPI;
```