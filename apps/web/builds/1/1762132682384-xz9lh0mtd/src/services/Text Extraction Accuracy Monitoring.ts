```typescript
/**
 * @fileoverview Service for monitoring and analyzing text extraction accuracy
 */

import { EventEmitter } from 'events';

type TextExtractionResult = {
  originalText: string;
  extractedText: string;
  confidence: number;
  timestamp: Date;
  source: string;
};

type AccuracyMetrics = {
  overallAccuracy: number;
  sampleSize: number;
  errorRate: number;
  confidenceAvg: number;
};

/**
 * Service for monitoring text extraction accuracy and generating metrics
 */
export class TextExtractionAccuracyMonitor extends EventEmitter {
  private results: TextExtractionResult[] = [];
  private readonly minConfidenceThreshold: number;
  
  /**
   * Creates a new TextExtractionAccuracyMonitor instance
   * @param minConfidenceThreshold - Minimum confidence threshold (0-1)
   */
  constructor(minConfidenceThreshold = 0.8) {
    super();
    this.minConfidenceThreshold = minConfidenceThreshold;
  }

  /**
   * Records a new text extraction result
   * @param result - The text extraction result to record
   * @throws Error if confidence is invalid
   */
  public recordResult(result: TextExtractionResult): void {
    try {
      this.validateResult(result);
      this.results.push(result);
      this.emit('newResult', result);
      
      if (result.confidence < this.minConfidenceThreshold) {
        this.emit('lowConfidence', result);
      }
    } catch (error) {
      throw new Error(`Failed to record result: ${error.message}`);
    }
  }

  /**
   * Calculates accuracy metrics based on recorded results
   * @param timeWindow - Optional time window in ms to calculate metrics for
   * @returns Accuracy metrics
   */
  public getAccuracyMetrics(timeWindow?: number): AccuracyMetrics {
    try {
      const relevantResults = timeWindow 
        ? this.results.filter(r => 
            r.timestamp.getTime() > Date.now() - timeWindow)
        : this.results;

      if (relevantResults.length === 0) {
        return {
          overallAccuracy: 0,
          sampleSize: 0, 
          errorRate: 0,
          confidenceAvg: 0
        };
      }

      const accuracySum = relevantResults.reduce((sum, result) => 
        sum + this.calculateTextSimilarity(
          result.originalText,
          result.extractedText
        ), 0);

      const confidenceSum = relevantResults.reduce((sum, result) =>
        sum + result.confidence, 0);

      const errorCount = relevantResults.filter(r => 
        r.confidence < this.minConfidenceThreshold).length;

      return {
        overallAccuracy: accuracySum / relevantResults.length,
        sampleSize: relevantResults.length,
        errorRate: errorCount / relevantResults.length,
        confidenceAvg: confidenceSum / relevantResults.length
      };

    } catch (error) {
      throw new Error(`Failed to calculate metrics: ${error.message}`);
    }
  }

  /**
   * Clears all recorded results
   */
  public clearResults(): void {
    this.results = [];
    this.emit('cleared');
  }

  /**
   * Gets all recorded results
   */
  public getResults(): ReadonlyArray<TextExtractionResult> {
    return [...this.results];
  }

  /**
   * Validates a text extraction result
   * @param result - Result to validate
   * @throws Error if result is invalid
   */
  private validateResult(result: TextExtractionResult): void {
    if (result.confidence < 0 || result.confidence > 1) {
      throw new Error('Confidence must be between 0 and 1');
    }

    if (!result.originalText || !result.extractedText) {
      throw new Error('Original and extracted text are required');
    }

    if (!(result.timestamp instanceof Date)) {
      throw new Error('Invalid timestamp');
    }
  }

  /**
   * Calculates similarity between two text strings
   * @param str1 - First string
   * @param str2 - Second string
   * @returns Similarity score between 0-1
   */
  private calculateTextSimilarity(str1: string, str2: string): number {
    try {
      const longer = str1.length > str2.length ? str1 : str2;
      const shorter = str1.length > str2.length ? str2 : str1;
      
      if (longer.length === 0) {
        return 1.0;
      }

      const editDistance = this.levenshteinDistance(longer, shorter);
      return (longer.length - editDistance) / longer.length;
    } catch (error) {
      throw new Error(`Failed to calculate text similarity: ${error.message}`);
    }
  }

  /**
   * Calculates Levenshtein distance between two strings
   * @param str1 - First string
   * @param str2 - Second string
   * @returns Edit distance
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str1.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str1.length; i++) {
      for (let j = 1; j <= str2.length; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[str1.length][str2.length];
  }
}

export type { TextExtractionResult, AccuracyMetrics };
```