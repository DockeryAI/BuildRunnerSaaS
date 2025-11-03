```typescript
/**
 * @file aiTextProcessing.ts
 * @description API endpoints and utilities for AI text processing
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Configuration, OpenAIApi } from 'openai';

/**
 * Configuration options for AI text processing
 */
interface AIProcessingConfig {
  supabaseUrl: string;
  supabaseKey: string;
  openAIKey: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Response format for processed text
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
  private config: AIProcessingConfig;

  /**
   * Initialize the AI text processor
   * @param config - Configuration options
   */
  constructor(config: AIProcessingConfig) {
    this.config = {
      maxTokens: 1000,
      temperature: 0.7,
      ...config
    };

    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    
    const openAIConfig = new Configuration({
      apiKey: config.openAIKey
    });
    
    this.openai = new OpenAIApi(openAIConfig);
  }

  /**
   * Process text using AI
   * @param text - Input text to process
   * @returns Processed text response
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
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
      });

      const result = completion.data.choices[0]?.text?.trim();

      if (!result) {
        throw new Error('No result from AI processing');
      }

      // Store in Supabase
      const { error: dbError } = await this.supabase
        .from('processed_texts')
        .insert({
          original_text: text,
          processed_text: result,
          processed_at: new Date().toISOString()
        });

      if (dbError) {
        throw dbError;
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
   * Get processing history from database
   * @param limit - Maximum number of records to return
   * @returns Array of processing history
   */
  public async getProcessingHistory(limit: number = 10) {
    try {
      const { data, error } = await this.supabase
        .from('processed_texts')
        .select('*')
        .order('processed_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return {
        success: true,
        result: data
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
   * @returns Success status
   */
  public async clearHistory(): Promise<ProcessedTextResponse> {
    try {
      const { error } = await this.supabase
        .from('processed_texts')
        .delete()
        .not('id', 'is', null);

      if (error) {
        throw error;
      }

      return {
        success: true
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

/**
 * Create database tables and initialize schema
 * @param supabase - Supabase client instance
 */
export async function initializeDatabase(supabase: SupabaseClient): Promise<void> {
  const { error } = await supabase.rpc('initialize_ai_processing_schema', {});
  
  if (error) {
    throw new Error(`Failed to initialize database: ${error.message}`);
  }
}

export type { AIProcessingConfig, ProcessedTextResponse };
```