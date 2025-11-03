/**
 * @module TextExtractor
 * Text extraction service for processing and extracting text content from various sources
 */

type ExtractorOptions = {
  trim?: boolean;
  removeSpecialChars?: boolean;
  lowercase?: boolean;
  maxLength?: number;
};

type ExtractResult = {
  text: string;
  metadata: {
    length: number;
    wordCount: number;
    charCount: number;
  };
};

/**
 * Service for extracting and processing text content
 */
export class TextExtractor {
  private options: Required<ExtractorOptions>;

  /**
   * Creates a new TextExtractor instance
   * @param options - Configuration options for text extraction
   */
  constructor(options: ExtractorOptions = {}) {
    this.options = {
      trim: options.trim ?? true,
      removeSpecialChars: options.removeSpecialChars ?? false,
      lowercase: options.lowercase ?? false,
      maxLength: options.maxLength ?? Infinity
    };
  }

  /**
   * Extracts text content from a string input
   * @param input - Text content to process
   * @returns Processed text and metadata
   * @throws Error if input is invalid
   */
  public extract(input: string): ExtractResult {
    try {
      if (typeof input !== 'string') {
        throw new Error('Input must be a string');
      }

      let processedText = input;

      if (this.options.trim) {
        processedText = processedText.trim();
      }

      if (this.options.removeSpecialChars) {
        processedText = processedText.replace(/[^\w\s]/gi, '');
      }

      if (this.options.lowercase) {
        processedText = processedText.toLowerCase();
      }

      if (processedText.length > this.options.maxLength) {
        processedText = processedText.substring(0, this.options.maxLength);
      }

      return {
        text: processedText,
        metadata: {
          length: processedText.length,
          wordCount: this.countWords(processedText),
          charCount: this.countChars(processedText)
        }
      };

    } catch (error) {
      throw new Error(`Text extraction failed: ${(error as Error).message}`);
    }
  }

  /**
   * Extracts text from multiple inputs
   * @param inputs - Array of text inputs to process
   * @returns Array of extraction results
   */
  public extractMultiple(inputs: string[]): ExtractResult[] {
    try {
      return inputs.map(input => this.extract(input));
    } catch (error) {
      throw new Error(`Batch text extraction failed: ${(error as Error).message}`);
    }
  }

  /**
   * Counts words in text
   * @param text - Input text
   * @returns Number of words
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  /**
   * Counts characters in text (excluding whitespace)
   * @param text - Input text
   * @returns Number of characters
   */
  private countChars(text: string): number {
    return text.replace(/\s/g, '').length;
  }

  /**
   * Updates extractor options
   * @param newOptions - Updated options to apply
   */
  public updateOptions(newOptions: Partial<ExtractorOptions>): void {
    this.options = {
      ...this.options,
      ...newOptions
    };
  }

  /**
   * Gets current extractor options
   * @returns Current options configuration
   */
  public getOptions(): Required<ExtractorOptions> {
    return { ...this.options };
  }
}