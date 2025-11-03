Here's a comprehensive set of unit tests for the provided component:

```typescript
import { describe, expect, test, jest } from '@jest/globals';
import { CoreLogicTestUtils, TestSuite, TestResult, TestCase } from './CoreLogicTestUtils';

describe('CoreLogicTestUtils', () => {
  describe('assertDefined', () => {
    test('should not throw for defined values', () => {
      const testCases = ['string', 0, false, {}, [], new Date()];
      testCases.forEach(value => {
        expect(() => CoreLogicTestUtils.assertDefined(value)).not.toThrow();
      });
    });

    test('should throw for null and undefined', () => {
      expect(() => CoreLogicTestUtils.assertDefined(null)).toThrow('Value must be defined');
      expect(() => CoreLogicTestUtils.assertDefined(undefined)).toThrow('Value must be defined');
    });
  });

  describe('assertTrue', () => {
    test('should not throw for true conditions', () => {
      expect(() => CoreLogicTestUtils.assertTrue(true)).not.toThrow();
      expect(() => CoreLogicTestUtils.assertTrue(1 === 1)).not.toThrow();
    });

    test('should throw with custom message', () => {
      const customMessage = 'Custom error message';
      expect(() => CoreLogicTestUtils.assertTrue(false, customMessage)).toThrow(customMessage);
    });

    test('should throw default message when no custom message provided', () => {
      expect(() => CoreLogicTestUtils.assertTrue(false)).toThrow('Assertion failed');
    });
  });

  describe('assertEquals', () => {
    test('should not throw for equal values', () => {
      const testCases = [
        [1, 1],
        ['test', 'test'],
        [true, true],
        [null, null],
        [undefined, undefined]
      ];
      
      testCases.forEach(([actual, expected]) => {
        expect(() => CoreLogicTestUtils.assertEquals(actual, expected)).not.toThrow();
      });
    });

    test('should throw for unequal values with descriptive message', () => {
      expect(() => CoreLogicTestUtils.assertEquals(1, 2))
        .toThrow('Expected 2 but got 1');
      expect(() => CoreLogicTestUtils.assertEquals('a', 'b'))
        .toThrow('Expected b but got a');
    });
  });

  describe('createMockFn', () => {
    test('should create a mock function returning specified value', () => {
      const returnValue = { test: 'value' };
      const mockFn = CoreLogicTestUtils.createMockFn(returnValue);
      
      expect(mockFn()).toBe(returnValue);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('should maintain mock function properties', () => {
      const mockFn = CoreLogicTestUtils.createMockFn('test');
      
      mockFn();
      mockFn();
      
      expect(mockFn.mock.calls).toHaveLength(2);
      expect(mockFn.getMockName()).toBe('jest.fn()');
    });
  });

  describe('createAsyncMockFn', () => {
    test('should create an async mock function resolving with specified value', async () => {
      const returnValue = { data: 'test' };
      const mockFn = CoreLogicTestUtils.createAsyncMockFn(returnValue);
      
      await expect(mockFn()).resolves.toBe(returnValue);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('should be chainable with other Promise methods', async () => {
      const mockFn = CoreLogicTestUtils.createAsyncMockFn('test');
      
      const result = await mockFn().then(value => value.toUpperCase());
      expect(result).toBe('TEST');
    });
  });

  describe('delay', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should resolve after specified delay', async () => {
      const delay = CoreLogicTestUtils.delay(1000);
      
      jest.advanceTimersByTime(1000);
      await expect(delay).resolves.toBeUndefined();
    });

    test('should not resolve before specified delay', async () => {
      const delay = CoreLogicTestUtils.delay(1000);
      
      jest.advanceTimersByTime(999);
      const result = jest.fn();
      delay.then(result);
      
      expect(result).not.toHaveBeenCalled();
    });
  });
});

describe('TestSuite', () => {
  describe('addTest and runTests', () => {
    test('should correctly handle mix of sync and async tests', async () => {
      const suite = new TestSuite();
      
      suite.addTest('sync pass', () => expect(true).toBe(true));
      suite.addTest('sync fail', () => { throw new Error('Sync error'); });
      suite.addTest('async pass', async () => {
        await CoreLogicTestUtils.delay(100);
        expect(true).toBe(true);
      });
      suite.addTest('async fail', async () => {
        await CoreLogicTestUtils.delay(100);
        throw new Error('Async error');
      });

      const results = await suite.runTests();

      expect(results).toHaveLength(4);
      expect(results.filter(r => r.passed)).toHaveLength(2);
      expect(results.filter(r => !r.passed)).toHaveLength(2);
    });

    test('should provide detailed error information', async () => {
      const suite = new TestSuite();
      const errorMessage = 'Custom error message';
      
      suite.addTest('failing test', () => {
        throw new Error(errorMessage);
      });

      const results = await suite.runTests();
      
      expect(results[0]).toEqual({
        passed: false,
        message: 'failing test failed',
        error: expect.any(Error)
      });
      expect(results[0].error?.message).toBe(errorMessage);
    });

    test('should handle non-Error throws', async () => {
      const suite = new TestSuite();
      
      suite.addTest('string throw', () => {
        throw 'string error';
      });

      const results = await suite.runTests();
      
      expect(results[0].passed).toBe(false);
      expect(results[0].error).toBeInstanceOf(Error);
      expect(results[0].error?.message).toBe('string error');
    });
  });
});
```

These tests cover:

1. All methods in `CoreLogicTestUtils`
2. Edge cases and error conditions
3. Async functionality
4. The `TestSuite` class functionality
5. Various input types and scenarios

Key features of the tests:

- Uses Jest's fake timers for testing delays
- Tests both synchronous and asynchronous functionality
- Verifies error messages and types
- Checks edge cases and invalid inputs
- Tests mock function behavior and properties
- Verifies test suite execution and result collection
- Includes setup and teardown where needed
- Tests both successful and failing scenarios

The tests are organized using describe blocks for better readability and maintenance. Each test focuses on a specific aspect of the functionality and includes clear assertions and expectations.