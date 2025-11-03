```typescript
import { describe, expect, test } from '@jest/globals';

/**
 * @jest-environment node
 */

/**
 * Core logic test utilities and helper functions
 */
export class CoreLogicTestUtils {
  /**
   * Validates that a value is defined and not null
   * @param value - Value to check
   * @throws {Error} If value is null or undefined
   */
  static assertDefined<T>(value: T | null | undefined): asserts value is T {
    if (value === null || value === undefined) {
      throw new Error('Value must be defined');
    }
  }

  /**
   * Validates that a condition is true
   * @param condition - Condition to check
   * @param message - Optional error message
   * @throws {Error} If condition is false
   */
  static assertTrue(condition: boolean, message?: string): void {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  /**
   * Validates that two values are equal
   * @param actual - Actual value
   * @param expected - Expected value
   * @throws {Error} If values are not equal
   */
  static assertEquals<T>(actual: T, expected: T): void {
    if (actual !== expected) {
      throw new Error(`Expected ${expected} but got ${actual}`);
    }
  }

  /**
   * Creates a mock function that returns the provided value
   * @param returnValue - Value to return
   * @returns Mock function
   */
  static createMockFn<T>(returnValue: T): jest.Mock<T> {
    return jest.fn().mockReturnValue(returnValue);
  }

  /**
   * Creates an async mock function that resolves with the provided value
   * @param returnValue - Value to resolve with
   * @returns Async mock function
   */
  static createAsyncMockFn<T>(returnValue: T): jest.Mock<Promise<T>> {
    return jest.fn().mockResolvedValue(returnValue);
  }

  /**
   * Waits for the specified number of milliseconds
   * @param ms - Milliseconds to wait
   * @returns Promise that resolves after delay
   */
  static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Tests
describe('CoreLogicTestUtils', () => {
  test('assertDefined validates defined values', () => {
    expect(() => CoreLogicTestUtils.assertDefined('test')).not.toThrow();
    expect(() => CoreLogicTestUtils.assertDefined(null)).toThrow();
    expect(() => CoreLogicTestUtils.assertDefined(undefined)).toThrow();
  });

  test('assertTrue validates conditions', () => {
    expect(() => CoreLogicTestUtils.assertTrue(true)).not.toThrow();
    expect(() => CoreLogicTestUtils.assertTrue(false)).toThrow();
    expect(() => CoreLogicTestUtils.assertTrue(false, 'Custom message')).toThrow('Custom message');
  });

  test('assertEquals validates equality', () => {
    expect(() => CoreLogicTestUtils.assertEquals(1, 1)).not.toThrow();
    expect(() => CoreLogicTestUtils.assertEquals('test', 'test')).not.toThrow();
    expect(() => CoreLogicTestUtils.assertEquals(1, 2)).toThrow();
  });

  test('createMockFn creates mock function', () => {
    const mockFn = CoreLogicTestUtils.createMockFn('test');
    expect(mockFn()).toBe('test');
    expect(mockFn).toHaveBeenCalled();
  });

  test('createAsyncMockFn creates async mock function', async () => {
    const mockFn = CoreLogicTestUtils.createAsyncMockFn('test');
    await expect(mockFn()).resolves.toBe('test');
    expect(mockFn).toHaveBeenCalled();
  });

  test('delay waits specified time', async () => {
    const start = Date.now();
    await CoreLogicTestUtils.delay(100);
    const duration = Date.now() - start;
    expect(duration).toBeGreaterThanOrEqual(100);
  });
});

/**
 * Test result interface
 */
export interface TestResult {
  passed: boolean;
  message?: string;
  error?: Error;
}

/**
 * Test case interface
 */
export interface TestCase {
  name: string;
  fn: () => void | Promise<void>;
}

/**
 * Test suite for running multiple test cases
 */
export class TestSuite {
  private tests: TestCase[] = [];

  /**
   * Adds a test case to the suite
   * @param name - Test name
   * @param fn - Test function
   */
  addTest(name: string, fn: () => void | Promise<void>): void {
    this.tests.push({ name, fn });
  }

  /**
   * Runs all test cases in the suite
   * @returns Array of test results
   */
  async runTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    for (const test of this.tests) {
      try {
        await test.fn();
        results.push({
          passed: true,
          message: `${test.name} passed`
        });
      } catch (error) {
        results.push({
          passed: false,
          message: `${test.name} failed`,
          error: error instanceof Error ? error : new Error(String(error))
        });
      }
    }

    return results;
  }
}

// Test suite tests
describe('TestSuite', () => {
  test('runs tests and collects results', async () => {
    const suite = new TestSuite();

    suite.addTest('passing test', () => {
      expect(true).toBe(true);
    });

    suite.addTest('failing test', () => {
      throw new Error('Test error');
    });

    const results = await suite.runTests();

    expect(results).toHaveLength(2);
    expect(results[0].passed).toBe(true);
    expect(results[1].passed).toBe(false);
    expect(results[1].error?.message).toBe('Test error');
  });

  test('handles async tests', async () => {
    const suite = new TestSuite();

    suite.addTest('async test', async () => {
      await CoreLogicTestUtils.delay(100);
      expect(true).toBe(true);
    });

    const results = await suite.runTests();
    expect(results[0].passed).toBe(true);
  });
});
```