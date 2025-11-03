```typescript
/**
 * @file aiTextProcessing.ts
 * @description API handlers for AI text processing functionality
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Configuration, OpenAIApi } from 'openai';

/**
 * @interface ProcessingResult
 * @description Interface for the text processing result
 */
interface ProcessingResult {
  success: boolean;
  processedText?: string;
  error?: string;
}

/**
 * @interface TextProcessingConfig 
 * @description Configuration options for text processing
 */
interface TextProcessingConfig {
  maxTokens: number;
  temperature: number;
  model: string;
}

/**
 * @class AITextProcessor
 * @description Handles AI text processing operations
 */
export class AITextProcessor {
  private supabase: SupabaseClient;
  private openai: OpenAIApi;
  private config: TextProcessingConfig;

  /**
   * @constructor
   * @param supabaseUrl Supabase project URL
   * @param supabaseKey Supabase API key
   * @param openAIKey OpenAI API key
   */
  constructor(
    supabaseUrl: string,
    supabaseKey: string, 
    openAIKey: string
  ) {
    // Initialize Supabase client
    this.supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize OpenAI configuration
    const configuration = new Configuration({
      apiKey: openAIKey,
    });
    this.openai = new OpenAIApi(configuration);

    // Default config
    this.config = {
      maxTokens: 1000,
      temperature: 0.7,
      model: 'text-davinci-003'
    };
  }

  /**
   * @method processText
   * @description Process text using OpenAI API
   * @param text Input text to process
   * @returns ProcessingResult
   */
  public async processText(text: string): Promise<ProcessingResult> {
    try {
      // Validate input
      if (!text || typeof text !== 'string') {
        throw new Error('Invalid input text');
      }

      // Process with OpenAI
      const completion = await this.openai.createCompletion({
        model: this.config.model,
        prompt: text,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      });

      const processedText = completion.data.choices[0]?.text?.trim();

      if (!processedText) {
        throw new Error('No processed text received from OpenAI');
      }

      // Store result in Supabase
      const { error: dbError } = await this.supabase
        .from('processed_texts')
        .insert({
          original_text: text,
          processed_text: processedText,
          processed_at: new Date().toISOString(),
        });

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      return {
        success: true,
        processedText
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * @method updateConfig
   * @description Update the text processing configuration
   * @param newConfig Partial config to update
   */
  public updateConfig(newConfig: Partial<TextProcessingConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig
    };
  }

  /**
   * @method getProcessingHistory
   * @description Retrieve processing history from database
   * @returns Array of processing records
   */
  public async getProcessingHistory() {
    try {
      const { data, error } = await this.supabase
        .from('processed_texts')
        .select('*')
        .order('processed_at', { ascending: false });

      if (error) {
        throw error;
      }

      return {
        success: true,
        history: data
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * @method validateApiKeys
   * @description Validate that all required API keys are working
   * @returns Boolean indicating if keys are valid
   */
  public async validateApiKeys(): Promise<boolean> {
    try {
      // Test Supabase connection
      const { error: supabaseError } = await this.supabase.from('processed_texts').select('count');
      if (supabaseError) throw new Error('Supabase connection failed');

      // Test OpenAI connection
      const completion = await this.openai.createCompletion({
        model: this.config.model,
        prompt: 'test',
        max_tokens: 5
      });
      if (!completion.data) throw new Error('OpenAI connection failed');

      return true;

    } catch (error) {
      console.error('API key validation failed:', error);
      return false;
    }
  }
}

export default AITextProcessor;
```