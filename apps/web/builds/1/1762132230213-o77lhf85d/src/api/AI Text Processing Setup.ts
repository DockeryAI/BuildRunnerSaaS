```typescript
/**
 * @file aiTextProcessing.ts
 * @description API endpoints and utilities for AI text processing
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Configuration, OpenAIApi } from 'openai';

/**
 * Configuration interface for AI processing
 */
interface AIProcessingConfig {
  supabaseUrl: string;
  supabaseKey: string;
  openAiKey: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Response interface for processed text
 */
interface ProcessedTextResponse {
  success: boolean;
  text?: string;
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
   * Initialize AI text processor
   * @param config - Configuration object
   */
  constructor(config: AIProcessingConfig) {
    this.config = {
      maxTokens: 1000,
      temperature: 0.7,
      ...config
    };

    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    
    const openAiConfig = new Configuration({
      apiKey: config.openAiKey
    });
    
    this.openai = new OpenAIApi(openAiConfig);
  }

  /**
   * Process text using AI
   * @param text - Input text to process
   * @returns ProcessedTextResponse
   */
  public async processText(text: string): Promise<ProcessedTextResponse> {
    try {
      // Validate input
      if (!text || text.trim().length === 0) {
        throw new Error('Input text cannot be empty');
      }

      // Process with OpenAI
      const completion = await this.openai.createCompletion({
        model: "text-davinci-003",
        prompt: text,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
      });

      const processedText = completion.data.choices[0]?.text?.trim();

      if (!processedText) {
        throw new Error('No response from AI processor');
      }

      // Store in Supabase
      const { error } = await this.supabase
        .from('processed_texts')
        .insert({
          original_text: text,
          processed_text: processedText,
          processed_at: new Date().toISOString()
        });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        text: processedText
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Retrieve processing history
   * @param limit - Number of records to retrieve
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
   * Clear processing history
   * @returns Success status
   */
  public async clearHistory() {
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
 * Create AI text processor instance
 * @param config - Configuration object
 * @returns AITextProcessor instance
 */
export const createAITextProcessor = (config: AIProcessingConfig): AITextProcessor => {
  return new AITextProcessor(config);
};
```