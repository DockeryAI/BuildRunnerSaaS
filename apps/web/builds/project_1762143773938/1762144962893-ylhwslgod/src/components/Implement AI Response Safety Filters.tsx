```typescript
/**
 * @file AIResponseSafetyFilter.ts
 * Safety filter implementation for AI responses to detect and handle potentially unsafe content
 */

import { z } from 'zod';

/**
 * Configuration options for the safety filter
 */
export interface SafetyFilterConfig {
  profanityThreshold: number;
  contentWarningLevel: 'strict' | 'moderate' | 'lenient';
  maxTokenLength: number;
  blockedTerms: string[];
}

/**
 * Schema for validating AI responses
 */
const responseSchema = z.object({
  text: z.string(),
  metadata: z.object({
    safety_rating: z.number().optional(),
    content_flags: z.array(z.string()).optional()
  }).optional()
});

/**
 * Result of safety filter check
 */
export interface SafetyCheckResult {
  isAllowed: boolean;
  flags: string[];
  risk: number;
  filteredContent?: string;
}

/**
 * Default safety filter configuration
 */
const DEFAULT_CONFIG: SafetyFilterConfig = {
  profanityThreshold: 0.7,
  contentWarningLevel: 'moderate',
  maxTokenLength: 2048,
  blockedTerms: []
};

/**
 * AI Response Safety Filter class
 */
export class AIResponseSafetyFilter {
  private config: SafetyFilterConfig;
  private profanityRegex: RegExp;

  /**
   * Creates an instance of AIResponseSafetyFilter
   * @param config - Optional configuration options
   */
  constructor(config: Partial<SafetyFilterConfig> = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config
    };
    this.profanityRegex = this.buildProfanityRegex();
  }

  /**
   * Checks if AI response content is safe
   * @param response - Raw AI response to check
   * @returns SafetyCheckResult
   * @throws Error if response validation fails
   */
  public async checkSafety(response: unknown): Promise<SafetyCheckResult> {
    try {
      const validated = responseSchema.parse(response);
      
      const flags: string[] = [];
      let risk = 0;

      // Check content length
      if (validated.text.length > this.config.maxTokenLength) {
        flags.push('EXCESSIVE_LENGTH');
        risk += 0.3;
      }

      // Check profanity
      if (this.containsProfanity(validated.text)) {
        flags.push('PROFANITY');
        risk += 0.5;
      }

      // Check blocked terms
      if (this.containsBlockedTerms(validated.text)) {
        flags.push('BLOCKED_TERMS');
        risk += 0.8;
      }

      // Check metadata safety rating if available
      if (validated.metadata?.safety_rating) {
        risk = Math.max(risk, validated.metadata.safety_rating);
      }

      // Add metadata content flags if available
      if (validated.metadata?.content_flags) {
        flags.push(...validated.metadata.content_flags);
      }

      const isAllowed = this.evaluateSafety(risk, flags);
      const filteredContent = isAllowed ? validated.text : this.filterContent(validated.text);

      return {
        isAllowed,
        flags: [...new Set(flags)],
        risk,
        filteredContent
      };
    } catch (error) {
      throw new Error(`Safety check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Updates safety filter configuration
   * @param newConfig - New configuration options
   */
  public updateConfig(newConfig: Partial<SafetyFilterConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig
    };
    this.profanityRegex = this.buildProfanityRegex();
  }

  /**
   * Builds regex for profanity detection
   * @private
   */
  private buildProfanityRegex(): RegExp {
    const terms = [...this.config.blockedTerms];
    return new RegExp(terms.join('|'), 'gi');
  }

  /**
   * Checks if content contains profanity
   * @private
   */
  private containsProfanity(content: string): boolean {
    return this.profanityRegex.test(content);
  }

  /**
   * Checks if content contains blocked terms
   * @private
   */
  private containsBlockedTerms(content: string): boolean {
    return this.config.blockedTerms.some(term => 
      content.toLowerCase().includes(term.toLowerCase())
    );
  }

  /**
   * Evaluates if content is safe based on risk and flags
   * @private
   */
  private evaluateSafety(risk: number, flags: string[]): boolean {
    switch (this.config.contentWarningLevel) {
      case 'strict':
        return risk < 0.3 && flags.length === 0;
      case 'moderate':
        return risk < 0.7 && !flags.includes('BLOCKED_TERMS');
      case 'lenient':
        return risk < 0.9;
      default:
        return true;
    }
  }

  /**
   * Filters unsafe content
   * @private
   */
  private filterContent(content: string): string {
    let filtered = content;
    
    // Replace profanity
    filtered = filtered.replace(this.profanityRegex, '***');
    
    // Replace blocked terms
    this.config.blockedTerms.forEach(term => {
      const regex = new RegExp(term, 'gi');
      filtered = filtered.replace(regex, '***');
    });

    return filtered;
  }
}

/**
 * Creates a new instance of AIResponseSafetyFilter with default config
 */
export const createSafetyFilter = (config?: Partial<SafetyFilterConfig>) => {
  return new AIResponseSafetyFilter(config);
};
```