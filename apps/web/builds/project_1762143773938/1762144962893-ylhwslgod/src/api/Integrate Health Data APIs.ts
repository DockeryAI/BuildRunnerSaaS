```typescript
import axios, { AxiosError, AxiosResponse } from 'axios';
import { z } from 'zod';

/**
 * Health data types and schemas
 */
export const HealthDataSchema = z.object({
  userId: z.string(),
  timestamp: z.string(),
  mentalState: z.number().min(1).max(10),
  sleepHours: z.number().min(0).max(24),
  anxietyLevel: z.number().min(1).max(10),
  moodRating: z.number().min(1).max(10),
  notes: z.string().optional()
});

export type HealthData = z.infer<typeof HealthDataSchema>;

/**
 * API response types
 */
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Health data API integration class
 */
export class HealthDataAPI {
  private baseUrl: string;
  private apiKey: string;

  /**
   * Initialize the health data API client
   * @param baseUrl - Base URL for the API
   * @param apiKey - API authentication key
   */
  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Get health data for a specific user
   * @param userId - Unique identifier for the user
   * @returns Promise with health data
   */
  public async getUserHealthData(userId: string): Promise<APIResponse<HealthData[]>> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseUrl}/users/${userId}/health`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          }
        }
      );

      const validatedData = z.array(HealthDataSchema).safeParse(response.data);
      
      if (!validatedData.success) {
        throw new Error('Invalid data format received from API');
      }

      return {
        success: true,
        data: validatedData.data
      };

    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Submit new health data entry
   * @param data - Health data to submit
   * @returns Promise with submission status
   */
  public async submitHealthData(data: HealthData): Promise<APIResponse<HealthData>> {
    try {
      const validatedData = HealthDataSchema.parse(data);

      const response: AxiosResponse = await axios.post(
        `${this.baseUrl}/health`,
        validatedData,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update existing health data entry
   * @param entryId - ID of entry to update
   * @param data - Updated health data
   * @returns Promise with update status
   */
  public async updateHealthData(entryId: string, data: Partial<HealthData>): Promise<APIResponse<HealthData>> {
    try {
      const response: AxiosResponse = await axios.put(
        `${this.baseUrl}/health/${entryId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const validatedData = HealthDataSchema.parse(response.data);

      return {
        success: true,
        data: validatedData
      };

    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete health data entry
   * @param entryId - ID of entry to delete
   * @returns Promise with deletion status
   */
  public async deleteHealthData(entryId: string): Promise<APIResponse<void>> {
    try {
      await axios.delete(
        `${this.baseUrl}/health/${entryId}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        success: true
      };

    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Handle API errors
   * @param error - Error object
   * @returns Formatted error response
   */
  private handleError(error: unknown): APIResponse<never> {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: axiosError.response?.data?.message || axiosError.message
      };
    }

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: false,
      error: 'An unknown error occurred'
    };
  }
}

/**
 * Create health data API instance
 * @param baseUrl - Base URL for the API
 * @param apiKey - API authentication key
 * @returns HealthDataAPI instance
 */
export const createHealthDataAPI = (baseUrl: string, apiKey: string): HealthDataAPI => {
  return new HealthDataAPI(baseUrl, apiKey);
};
```