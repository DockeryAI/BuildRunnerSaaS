```typescript
/**
 * @file apiIntegrationTest.ts
 * @description API integration testing utility for Supabase endpoints
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

/**
 * Configuration options for API testing
 */
interface ApiTestConfig {
  supabaseUrl: string;
  supabaseKey: string;
  timeoutMs?: number;
}

/**
 * Test result interface
 */
interface TestResult {
  success: boolean;
  endpoint: string;
  responseTime: number;
  error?: Error;
  data?: unknown;
}

/**
 * API validation schema
 */
const ApiConfigSchema = z.object({
  supabaseUrl: z.string().url(),
  supabaseKey: z.string().min(1),
  timeoutMs: z.number().positive().optional()
});

/**
 * API Integration Test Class
 */
export class ApiIntegrationTest {
  private client: SupabaseClient;
  private config: ApiTestConfig;
  
  /**
   * Creates an instance of ApiIntegrationTest
   * @param config - Configuration options
   */
  constructor(config: ApiTestConfig) {
    try {
      const validatedConfig = ApiConfigSchema.parse(config);
      this.config = validatedConfig;
      this.client = createClient(validatedConfig.supabaseUrl, validatedConfig.supabaseKey);
    } catch (error) {
      throw new Error(`Invalid API configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Tests a GET endpoint
   * @param endpoint - API endpoint to test
   * @returns Promise<TestResult>
   */
  public async testGetEndpoint(endpoint: string): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const { data, error } = await Promise.race([
        this.client.from(endpoint).select('*'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), this.config.timeoutMs ?? 5000)
        )
      ]);

      if (error) throw error;

      return {
        success: true,
        endpoint,
        responseTime: Date.now() - startTime,
        data
      };
    } catch (error) {
      return {
        success: false,
        endpoint,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  }

  /**
   * Tests a POST endpoint
   * @param endpoint - API endpoint to test
   * @param payload - Data to send
   * @returns Promise<TestResult>
   */
  public async testPostEndpoint(endpoint: string, payload: unknown): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const { data, error } = await Promise.race([
        this.client.from(endpoint).insert(payload),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), this.config.timeoutMs ?? 5000)
        )
      ]);

      if (error) throw error;

      return {
        success: true,
        endpoint,
        responseTime: Date.now() - startTime,
        data
      };
    } catch (error) {
      return {
        success: false,
        endpoint,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  }

  /**
   * Tests API health
   * @returns Promise<boolean>
   */
  public async testHealth(): Promise<boolean> {
    try {
      const { error } = await this.client.auth.getSession();
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Runs all API tests
   * @param endpoints - Array of endpoints to test
   * @returns Promise<TestResult[]>
   */
  public async runAllTests(endpoints: string[]): Promise<TestResult[]> {
    const results: TestResult[] = [];

    for (const endpoint of endpoints) {
      results.push(await this.testGetEndpoint(endpoint));
    }

    return results;
  }

  /**
   * Validates API response schema
   * @param schema - Zod schema for validation
   * @param data - Data to validate
   * @returns boolean
   */
  public validateResponseSchema(schema: z.ZodType, data: unknown): boolean {
    try {
      schema.parse(data);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Creates an API test instance
 * @param config - Configuration options
 * @returns ApiIntegrationTest
 */
export const createApiTest = (config: ApiTestConfig): ApiIntegrationTest => {
  return new ApiIntegrationTest(config);
};
```