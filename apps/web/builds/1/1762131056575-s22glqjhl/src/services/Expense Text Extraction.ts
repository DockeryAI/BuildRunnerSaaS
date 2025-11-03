```typescript
/**
 * @fileoverview Service for extracting expense information from text using OCR and NLP
 */

import { createWorker } from 'tesseract.js';
import natural from 'natural';
import { DateTime } from 'luxon';

export interface ExtractedExpense {
  amount: number;
  date: Date | null; 
  description: string;
  category?: string;
  vendor?: string;
}

export class ExpenseTextExtractionService {
  private readonly tokenizer: natural.WordTokenizer;
  private readonly classifier: natural.BayesClassifier;

  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.classifier = new natural.BayesClassifier();
    this.trainClassifier();
  }

  /**
   * Extracts expense information from an image using OCR
   * @param imagePath - Path to the receipt/invoice image
   * @returns Promise resolving to extracted expense details
   * @throws Error if OCR or parsing fails
   */
  public async extractFromImage(imagePath: string): Promise<ExtractedExpense> {
    try {
      const worker = await createWorker();
      const { data: { text } } = await worker.recognize(imagePath);
      await worker.terminate();

      return this.parseText(text);
    } catch (error) {
      throw new Error(`Failed to extract expense from image: ${error.message}`);
    }
  }

  /**
   * Extracts expense information from text
   * @param text - Raw text to parse expense details from
   * @returns Parsed expense details
   * @throws Error if parsing fails
   */
  public parseText(text: string): ExtractedExpense {
    try {
      const tokens = this.tokenizer.tokenize(text);
      
      return {
        amount: this.extractAmount(text),
        date: this.extractDate(text),
        description: this.extractDescription(tokens),
        category: this.classifyExpense(text),
        vendor: this.extractVendor(text)
      };
    } catch (error) {
      throw new Error(`Failed to parse expense text: ${error.message}`);
    }
  }

  /**
   * Extracts monetary amount from text
   * @param text - Text to extract amount from
   * @returns Extracted amount as number
   */
  private extractAmount(text: string): number {
    const amountRegex = /\$?\d+(\.\d{2})?/;
    const match = text.match(amountRegex);
    
    if (!match) {
      return 0;
    }

    return parseFloat(match[0].replace('$', ''));
  }

  /**
   * Extracts date from text
   * @param text - Text to extract date from
   * @returns Extracted date or null if not found
   */
  private extractDate(text: string): Date | null {
    const dateRegex = /\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/;
    const match = text.match(dateRegex);

    if (!match) {
      return null;
    }

    const parsed = DateTime.fromFormat(match[0], 'M/d/yyyy');
    return parsed.isValid ? parsed.toJSDate() : null;
  }

  /**
   * Extracts expense description from tokens
   * @param tokens - Tokenized text
   * @returns Extracted description
   */
  private extractDescription(tokens: string[]): string {
    return tokens
      .filter(token => !token.match(/\d+/))
      .slice(0, 5)
      .join(' ');
  }

  /**
   * Extracts vendor name from text
   * @param text - Text to extract vendor from
   * @returns Extracted vendor name or undefined
   */
  private extractVendor(text: string): string | undefined {
    const commonVendors = ['walmart', 'target', 'amazon', 'costco'];
    const tokens = text.toLowerCase().split(' ');
    
    return commonVendors.find(vendor => tokens.includes(vendor));
  }

  /**
   * Classifies expense into category
   * @param text - Text to classify
   * @returns Classified category
   */
  private classifyExpense(text: string): string {
    return this.classifier.classify(text);
  }

  /**
   * Trains the expense classifier
   */
  private trainClassifier(): void {
    this.classifier.addDocument('grocery food produce meat dairy', 'Groceries');
    this.classifier.addDocument('restaurant meal dinner lunch', 'Dining');
    this.classifier.addDocument('gas fuel automotive', 'Transportation');
    this.classifier.addDocument('movie entertainment show concert', 'Entertainment');
    this.classifier.train();
  }
}

export default ExpenseTextExtractionService;
```