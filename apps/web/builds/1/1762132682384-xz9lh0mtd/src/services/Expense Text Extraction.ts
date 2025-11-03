```typescript
/**
 * @module ExpenseTextExtraction
 */

/**
 * Represents the structure of extracted expense data
 */
interface ExtractedExpense {
  amount: number;
  date: Date;
  category?: string;
  vendor?: string;
  description?: string;
}

/**
 * Configuration options for text extraction
 */
interface ExtractionConfig {
  locale?: string;
  dateFormat?: string;
  currency?: string;
  categories?: string[];
}

/**
 * Error thrown when text extraction fails
 */
class TextExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TextExtractionError';
  }
}

/**
 * Service for extracting expense information from text
 */
export class ExpenseTextExtraction {
  private config: ExtractionConfig;

  /**
   * Creates an instance of ExpenseTextExtraction
   * @param {ExtractionConfig} config - Configuration options
   */
  constructor(config: ExtractionConfig = {}) {
    this.config = {
      locale: 'en-US',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
      categories: [],
      ...config
    };
  }

  /**
   * Extracts expense data from input text
   * @param {string} text - Text to extract expense data from
   * @returns {Promise<ExtractedExpense>} Extracted expense data
   * @throws {TextExtractionError} If extraction fails
   */
  public async extractExpense(text: string): Promise<ExtractedExpense> {
    try {
      if (!text || typeof text !== 'string') {
        throw new TextExtractionError('Invalid input text');
      }

      const amount = this.extractAmount(text);
      const date = this.extractDate(text);
      const category = this.extractCategory(text);
      const vendor = this.extractVendor(text);
      const description = this.extractDescription(text);

      return {
        amount,
        date,
        ...(category && { category }),
        ...(vendor && { vendor }),
        ...(description && { description })
      };
    } catch (error) {
      if (error instanceof TextExtractionError) {
        throw error;
      }
      throw new TextExtractionError(`Failed to extract expense data: ${error.message}`);
    }
  }

  /**
   * Extracts amount from text using regex
   * @private
   * @param {string} text - Input text
   * @returns {number} Extracted amount
   */
  private extractAmount(text: string): number {
    const amountRegex = /\$?\d+(\.\d{2})?/;
    const match = text.match(amountRegex);
    
    if (!match) {
      throw new TextExtractionError('Could not find valid amount in text');
    }

    return parseFloat(match[0].replace('$', ''));
  }

  /**
   * Extracts date from text
   * @private
   * @param {string} text - Input text
   * @returns {Date} Extracted date
   */
  private extractDate(text: string): Date {
    const dateRegex = /\d{1,2}\/\d{1,2}\/\d{4}/;
    const match = text.match(dateRegex);

    if (!match) {
      throw new TextExtractionError('Could not find valid date in text');
    }

    const date = new Date(match[0]);
    if (isNaN(date.getTime())) {
      throw new TextExtractionError('Invalid date format');
    }

    return date;
  }

  /**
   * Extracts category from text if it matches configured categories
   * @private
   * @param {string} text - Input text
   * @returns {string|undefined} Extracted category
   */
  private extractCategory(text: string): string | undefined {
    const { categories } = this.config;
    if (!categories?.length) return undefined;

    const found = categories.find(category => 
      text.toLowerCase().includes(category.toLowerCase())
    );

    return found;
  }

  /**
   * Extracts vendor information from text
   * @private
   * @param {string} text - Input text
   * @returns {string|undefined} Extracted vendor
   */
  private extractVendor(text: string): string | undefined {
    // Simple vendor extraction - looks for capitalized words
    const vendorRegex = /([A-Z][A-Za-z]+\s?)+/;
    const match = text.match(vendorRegex);
    return match?.[0];
  }

  /**
   * Extracts description from text
   * @private
   * @param {string} text - Input text
   * @returns {string|undefined} Extracted description
   */
  private extractDescription(text: string): string | undefined {
    // Remove amount and date matches first
    const cleanText = text
      .replace(/\$?\d+(\.\d{2})?/, '')
      .replace(/\d{1,2}\/\d{1,2}\/\d{4}/, '')
      .trim();

    return cleanText || undefined;
  }

  /**
   * Updates the extraction configuration
   * @param {Partial<ExtractionConfig>} newConfig - New configuration options
   */
  public updateConfig(newConfig: Partial<ExtractionConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig
    };
  }
}
```