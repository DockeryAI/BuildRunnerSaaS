```typescript
/**
 * @fileoverview Service for executing load and performance testing
 */

import * as http from 'http';
import { EventEmitter } from 'events';

interface TestResult {
  requestCount: number;
  successCount: number;
  failureCount: number;
  avgResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  errorRate: number;
  startTime: Date;
  endTime: Date;
}

interface TestConfig {
  url: string;
  method?: string;
  concurrentUsers?: number;
  durationSeconds?: number;
  requestHeaders?: Record<string, string>;
  requestBody?: any;
}

/**
 * Service class for executing load and performance tests
 */
export class LoadTestService extends EventEmitter {
  private static readonly DEFAULT_CONCURRENT_USERS = 10;
  private static readonly DEFAULT_DURATION_SECONDS = 60;
  private static readonly DEFAULT_METHOD = 'GET';

  private isRunning = false;
  private startTime: Date | null = null;
  private endTime: Date | null = null;
  private requestCount = 0;
  private successCount = 0;
  private failureCount = 0;
  private responseTimes: number[] = [];

  /**
   * Creates a new LoadTestService instance
   */
  constructor() {
    super();
  }

  /**
   * Starts a load test with the given configuration
   * @param config - Test configuration options
   * @returns Promise that resolves with test results
   * @throws Error if test is already running
   */
  public async startTest(config: TestConfig): Promise<TestResult> {
    if (this.isRunning) {
      throw new Error('Test is already running');
    }

    this.resetMetrics();
    this.isRunning = true;
    this.startTime = new Date();

    const concurrentUsers = config.concurrentUsers || LoadTestService.DEFAULT_CONCURRENT_USERS;
    const durationMs = (config.durationSeconds || LoadTestService.DEFAULT_DURATION_SECONDS) * 1000;
    const method = config.method || LoadTestService.DEFAULT_METHOD;

    try {
      const userPromises = Array.from({ length: concurrentUsers }, () =>
        this.simulateUser(config.url, method, durationMs, config.requestHeaders, config.requestBody)
      );

      await Promise.all(userPromises);

      return this.generateResults();
    } catch (error) {
      this.isRunning = false;
      throw error;
    }
  }

  /**
   * Stops the currently running test
   */
  public stopTest(): void {
    this.isRunning = false;
  }

  /**
   * Resets all test metrics
   */
  private resetMetrics(): void {
    this.requestCount = 0;
    this.successCount = 0;
    this.failureCount = 0;
    this.responseTimes = [];
    this.startTime = null;
    this.endTime = null;
  }

  /**
   * Simulates a single user making requests
   */
  private async simulateUser(
    url: string,
    method: string,
    durationMs: number,
    headers?: Record<string, string>,
    body?: any
  ): Promise<void> {
    const endTime = Date.now() + durationMs;

    while (this.isRunning && Date.now() < endTime) {
      try {
        const startTime = Date.now();
        await this.makeRequest(url, method, headers, body);
        const responseTime = Date.now() - startTime;

        this.requestCount++;
        this.successCount++;
        this.responseTimes.push(responseTime);
        
        this.emit('request', {
          success: true,
          responseTime,
          timestamp: new Date()
        });
      } catch (error) {
        this.requestCount++;
        this.failureCount++;
        
        this.emit('request', {
          success: false,
          error,
          timestamp: new Date()
        });
      }
    }
  }

  /**
   * Makes an HTTP request
   */
  private makeRequest(
    url: string,
    method: string,
    headers?: Record<string, string>,
    body?: any
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const requestOptions: http.RequestOptions = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      const req = http.request(url, requestOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            reject(new Error(`Request failed with status ${res.statusCode}`));
          }
        });
      });

      req.on('error', reject);

      if (body) {
        req.write(JSON.stringify(body));
      }
      
      req.end();
    });
  }

  /**
   * Generates final test results
   */
  private generateResults(): TestResult {
    this.endTime = new Date();

    const avgResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
    const maxResponseTime = Math.max(...this.responseTimes);
    const minResponseTime = Math.min(...this.responseTimes);
    const errorRate = (this.failureCount / this.requestCount) * 100;

    return {
      requestCount: this.requestCount,
      successCount: this.successCount,
      failureCount: this.failureCount,
      avgResponseTime,
      maxResponseTime,
      minResponseTime,
      errorRate,
      startTime: this.startTime!,
      endTime: this.endTime
    };
  }
}
```