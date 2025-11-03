```typescript
/**
 * @file aiTextProcessing.ts
 * @description API handlers for AI text processing functionality
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Configuration, OpenAIApi } from 'openai';

/**
 * Configuration interface for AI text processing
 */
interface AIConfig {
  supabaseUrl: string;
  supabaseKey: string;
  openAIKey: string;
  maxTokens: number;
}

/**
 * Response interface for processed text
 */
interface ProcessedTextResponse {
  success: boolean;
  result?: string;
  error?: string;
}

/**
 * Class handling AI text processing operations
 */
export class AITextProcessor {
  private supabase: SupabaseClient;
  private openai: OpenAIApi;
  private config: AIConfig;

  /**
   * Initialize AI text processor
   * @param config - Configuration object
   */
  constructor(config: AIConfig) {
    this.config = config;
    
    // Initialize Supabase
    this.supabase = createClient(
      config.supabaseUrl,
      config.supabaseKey
    );

    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: config.openAIKey
    });
    this.openai = new OpenAIApi(configuration);
  }

  /**
   * Process text using AI
   * @param text - Input text to process
   * @returns ProcessedTextResponse
   */
  public async processText(text: string): Promise<ProcessedTextResponse> {
    try {
      // Validate input
      if (!text || typeof text !== 'string') {
        throw new Error('Invalid input text');
      }

      // Process with OpenAI
      const completion = await this.openai.createCompletion({
        model: "text-davinci-003",
        prompt: text,
        max_tokens: this.config.maxTokens
      });

      const result = completion.data.choices[0]?.text?.trim();

      if (!result) {
        throw new Error('No result from AI processing');
      }

      // Store in Supabase
      const { error } = await this.supabase
        .from('processed_texts')
        .insert({
          original_text: text,
          processed_text: result,
          processed_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      return {
        success: true,
        result
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get processing history
   * @returns Array of processed text entries
   */
  public async getHistory(): Promise<ProcessedTextResponse> {
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
        result: JSON.stringify(data)
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Clear processing history
   * @returns ProcessedTextResponse
   */
  public async clearHistory(): Promise<ProcessedTextResponse> {
    try {
      const { error } = await this.supabase
        .from('processed_texts')
        .delete()
        .neq('id', 0); // Delete all records

      if (error) {
        throw error;
      }

      return {
        success: true,
        result: 'History cleared successfully'
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export const createAITextProcessor = (config: AIConfig): AITextProcessor => {
  return new AITextProcessor(config);
};
```