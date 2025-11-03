/**
 * @fileoverview Testing service that provides comprehensive app testing utilities
 */

import { Observable, Subject, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

/**
 * Interface for test configuration options
 */
export interface TestConfig {
  /** Maximum number of retries */
  maxRetries?: number;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Whether to run in parallel */
  parallel?: boolean;
  /** Test environment */
  environment?: 'dev' | 'staging' | 'prod';
}

/**
 * Interface for test result data
 */
export interface TestResult {
  /** Test name/identifier */
  testId: string;
  /** Test status */
  status: 'pass' | 'fail' | 'error';
  /** Duration in milliseconds */
  duration: number;
  /** Error message if applicable */
  error?: string;
  /** Test metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Service for managing comprehensive application testing
 */
export class AppTestingService {
  private readonly testResults$ = new Subject<TestResult>();
  private readonly defaultConfig: TestConfig = {
    maxRetries: 3,
    timeout: 5000,
    parallel: false,
    environment: 'dev'
  };

  constructor(private config: TestConfig = {}) {
    this.config = { ...this.defaultConfig, ...config };
  }

  /**
   * Runs a single test case
   * @param testId - Unique identifier for the test
   * @param testFn - Test function to execute
   * @returns Observable of test result
   */
  public runTest(testId: string, testFn: () => Promise<void>): Observable<TestResult> {
    const startTime = Date.now();

    return new Observable<TestResult>(subscriber => {
      const executeTest = async () => {
        try {
          await Promise.race([
            testFn(),
            new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Test timeout')), this.config.timeout);
            })
          ]);

          const result: TestResult = {
            testId,
            status: 'pass',
            duration: Date.now() - startTime
          };

          subscriber.next(result);
          subscriber.complete();
          this.testResults$.next(result);

        } catch (error) {
          const result: TestResult = {
            testId,
            status: 'fail',
            duration: Date.now() - startTime,
            error: error instanceof Error ? error.message : 'Unknown error'
          };

          subscriber.next(result);
          subscriber.complete();
          this.testResults$.next(result);
        }
      };

      executeTest();
    }).pipe(
      retry(this.config.maxRetries ?? 0),
      catchError(error => throwError(() => new Error(`Test execution failed: ${error.message}`)))
    );
  }

  /**
   * Runs multiple test cases
   * @param tests - Map of test IDs to test functions
   * @returns Observable of test results
   */
  public runTests(tests: Map<string, () => Promise<void>>): Observable<TestResult[]> {
    return new Observable<TestResult[]>(subscriber => {
      const results: TestResult[] = [];
      const runTest = async ([testId, testFn]: [string, () => Promise<void>]) => {
        const result = await this.runTest(testId, testFn).toPromise();
        if (result) {
          results.push(result);
        }
      };

      const execute = async () => {
        try {
          if (this.config.parallel) {
            await Promise.all([...tests.entries()].map(runTest));
          } else {
            for (const test of tests.entries()) {
              await runTest(test);
            }
          }
          subscriber.next(results);
          subscriber.complete();
        } catch (error) {
          subscriber.error(error);
        }
      };

      execute();
    });
  }

  /**
   * Gets stream of test results
   * @returns Observable of test results
   */
  public getTestResults(): Observable<TestResult> {
    return this.testResults$.asObservable();
  }

  /**
   * Updates test configuration
   * @param config - New configuration options
   */
  public updateConfig(config: Partial<TestConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Cleans up testing resources
   */
  public dispose(): void {
    this.testResults$.complete();
  }
}