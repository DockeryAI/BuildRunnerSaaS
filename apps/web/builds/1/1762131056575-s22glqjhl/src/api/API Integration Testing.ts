```typescript
/**
 * @file apiIntegrationTest.ts
 * @description API integration testing utilities and helpers
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

/**
 * Configuration schema for API testing
 */
const ConfigSchema = z.object({
  supabaseUrl: z.string().url(),
  supabaseKey: z.string().min(1),
  timeoutMs: z.number().positive().default(5000)
});

type Config = z.infer<typeof ConfigSchema>;

/**
 * API test result interface
 */
interface TestResult {
  success: boolean;
  error?: string;
  duration: number;
  endpoint: string;
  statusCode?: number;
}

/**
 * API Integration Test Class
 */
export class APIIntegrationTest {
  private client: SupabaseClient;
  private config: Config;
  private results: TestResult[] = [];

  /**
   * Creates an instance of APIIntegrationTest
   * @param config - Configuration object
   */
  constructor(config: Config) {
    try {
      this.config = ConfigSchema.parse(config);
      this.client = createClient(config.supabaseUrl, config.supabaseKey);
    } catch (error) {
      throw new Error(`Invalid configuration: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Tests an API endpoint
   * @param endpoint - API endpoint to test
   * @param method - HTTP method
   * @param payload - Request payload
   * @returns Promise<TestResult>
   */
  public async testEndpoint(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    payload?: unknown
  ): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const response = await Promise.race([
        this.makeRequest(endpoint, method, payload),
        this.timeout()
      ]);

      const result: TestResult = {
        success: true,
        duration: Date.now() - startTime,
        endpoint,
        statusCode: response.status
      };

      this.results.push(result);
      return result;

    } catch (error) {
      const result: TestResult = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
        endpoint
      };

      this.results.push(result);
      return result;
    }
  }

  /**
   * Makes an API request
   * @param endpoint - API endpoint
   * @param method - HTTP method
   * @param payload - Request payload
   * @returns Promise<Response>
   */
  private async makeRequest(
    endpoint: string,
    method: string,
    payload?: unknown
  ): Promise<Response> {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.supabaseKey}`
    };

    const options: RequestInit = {
      method,
      headers,
      body: payload ? JSON.stringify(payload) : undefined
    };

    const response = await fetch(`${this.config.supabaseUrl}${endpoint}`, options);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response;
  }

  /**
   * Creates a timeout promise
   * @returns Promise that rejects after timeout
   */
  private timeout(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timed out after ${this.config.timeoutMs}ms`));
      }, this.config.timeoutMs);
    });
  }

  /**
   * Gets all test results
   * @returns Array of TestResult objects
   */
  public getResults(): TestResult[] {
    return [...this.results];
  }

  /**
   * Clears all test results
   */
  public clearResults(): void {
    this.results = [];
  }

  /**
   * Gets test summary statistics
   * @returns Summary of test results
   */
  public getTestSummary(): {
    total: number;
    successful: number;
    failed: number;
    averageDuration: number;
  } {
    const total = this.results.length;
    const successful = this.results.filter(r => r.success).length;
    const failed = total - successful;
    const averageDuration = total > 0 
      ? this.results.reduce((acc, curr) => acc + curr.duration, 0) / total
      : 0;

    return {
      total,
      successful,
      failed,
      averageDuration
    };
  }
}

/**
 * Creates a new API Integration Test instance
 * @param config - Configuration object
 * @returns APIIntegrationTest instance
 */
export const createAPITest = (config: Config): APIIntegrationTest => {
  return new APIIntegrationTest(config);
};

/**
 * Error class for API Integration Test errors
 */
export class APITestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'APITestError';
  }
}
```