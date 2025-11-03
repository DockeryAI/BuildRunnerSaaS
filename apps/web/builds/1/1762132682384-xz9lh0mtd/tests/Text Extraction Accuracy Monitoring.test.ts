Here's a comprehensive set of unit tests for the TextExtractionAccuracyMonitor component:

```typescript
import { TextExtractionAccuracyMonitor, TextExtractionResult } from './TextExtractionAccuracyMonitor';

describe('TextExtractionAccuracyMonitor', () => {
  let monitor: TextExtractionAccuracyMonitor;
  
  beforeEach(() => {
    monitor = new TextExtractionAccuracyMonitor(0.8);
  });

  const createValidResult = (overrides = {}): TextExtractionResult => ({
    originalText: 'Hello World',
    extractedText: 'Hello World',
    confidence: 0.9,
    timestamp: new Date(),
    source: 'test',
    ...overrides
  });

  describe('constructor', () => {
    it('should create instance with default threshold', () => {
      const defaultMonitor = new TextExtractionAccuracyMonitor();
      expect(defaultMonitor).toBeInstanceOf(TextExtractionAccuracyMonitor);
    });

    it('should create instance with custom threshold', () => {
      expect(monitor).toBeInstanceOf(TextExtractionAccuracyMonitor);
    });
  });

  describe('recordResult', () => {
    it('should record valid result', () => {
      const result = createValidResult();
      monitor.recordResult(result);
      expect(monitor.getResults()).toHaveLength(1);
      expect(monitor.getResults()[0]).toEqual(result);
    });

    it('should emit newResult event', () => {
      const result = createValidResult();
      const listener = jest.fn();
      monitor.on('newResult', listener);
      
      monitor.recordResult(result);
      
      expect(listener).toHaveBeenCalledWith(result);
    });

    it('should emit lowConfidence event for results below threshold', () => {
      const result = createValidResult({ confidence: 0.7 });
      const listener = jest.fn();
      monitor.on('lowConfidence', listener);
      
      monitor.recordResult(result);
      
      expect(listener).toHaveBeenCalledWith(result);
    });

    it('should throw error for invalid confidence', () => {
      const result = createValidResult({ confidence: 1.5 });
      expect(() => monitor.recordResult(result)).toThrow('Confidence must be between 0 and 1');
    });

    it('should throw error for missing texts', () => {
      const result = createValidResult({ originalText: '' });
      expect(() => monitor.recordResult(result)).toThrow('Original and extracted text are required');
    });

    it('should throw error for invalid timestamp', () => {
      const result = createValidResult({ timestamp: 'invalid' as any });
      expect(() => monitor.recordResult(result)).toThrow('Invalid timestamp');
    });
  });

  describe('getAccuracyMetrics', () => {
    beforeEach(() => {
      const results = [
        createValidResult({ confidence: 0.9, extractedText: 'Hello World' }),
        createValidResult({ confidence: 0.7, extractedText: 'Hello Wrld' }),
        createValidResult({ confidence: 0.95, extractedText: 'Hello World' })
      ];
      
      results.forEach(result => monitor.recordResult(result));
    });

    it('should calculate metrics correctly', () => {
      const metrics = monitor.getAccuracyMetrics();
      
      expect(metrics.sampleSize).toBe(3);
      expect(metrics.errorRate).toBeCloseTo(0.333, 3);
      expect(metrics.confidenceAvg).toBeCloseTo(0.85, 2);
      expect(metrics.overallAccuracy).toBeGreaterThan(0.9);
    });

    it('should return zero metrics for empty results', () => {
      monitor.clearResults();
      const metrics = monitor.getAccuracyMetrics();
      
      expect(metrics).toEqual({
        overallAccuracy: 0,
        sampleSize: 0,
        errorRate: 0,
        confidenceAvg: 0
      });
    });

    it('should calculate metrics within time window', () => {
      const oldResult = createValidResult({
        timestamp: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
      });
      monitor.recordResult(oldResult);

      const metrics = monitor.getAccuracyMetrics(1000 * 60 * 30); // 30 min window
      expect(metrics.sampleSize).toBe(3); // should exclude old result
    });
  });

  describe('clearResults', () => {
    it('should clear all results', () => {
      monitor.recordResult(createValidResult());
      monitor.clearResults();
      expect(monitor.getResults()).toHaveLength(0);
    });

    it('should emit cleared event', () => {
      const listener = jest.fn();
      monitor.on('cleared', listener);
      
      monitor.clearResults();
      
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('text similarity calculation', () => {
    it('should return 1.0 for identical strings', () => {
      const result = createValidResult({
        originalText: 'test',
        extractedText: 'test'
      });
      monitor.recordResult(result);
      const metrics = monitor.getAccuracyMetrics();
      expect(metrics.overallAccuracy).toBe(1.0);
    });

    it('should return lower score for different strings', () => {
      const result = createValidResult({
        originalText: 'test',
        extractedText: 'tst'
      });
      monitor.recordResult(result);
      const metrics = monitor.getAccuracyMetrics();
      expect(metrics.overallAccuracy).toBeLessThan(1.0);
    });

    it('should handle empty strings', () => {
      const result = createValidResult({
        originalText: '',
        extractedText: ''
      });
      expect(() => monitor.recordResult(result)).toThrow();
    });
  });
});
```

This test suite covers:

1. Constructor initialization with default and custom thresholds
2. Result recording functionality
   - Validation of input
   - Event emission
   - Error handling
3. Accuracy metrics calculation
   - Basic metrics calculation
   - Time window filtering
   - Edge cases (empty results)
4. Results management
   - Clearing results
   - Event emission
5. Text similarity calculation
   - Perfect matches
   - Partial matches
   - Edge cases

The tests use:
- Jest's built-in assertion functions
- Mock functions for event listeners
- Helper functions to create test data
- Before/after hooks for test setup
- Various edge cases and error conditions

To run these tests, you'll need to have Jest configured in your project with TypeScript support. You can run them using:

```bash
npm test
```

or

```bash
jest TextExtractionAccuracyMonitor.test.ts
```

Remember to add appropriate error handling and edge cases based on your specific requirements.