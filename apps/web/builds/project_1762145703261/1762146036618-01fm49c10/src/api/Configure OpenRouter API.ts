/**
 * @file openRouterApi.ts
 * @description Configuration and helper functions for OpenRouter API integration
 */

import { createClient } from '@supabase/supabase-js';

/**
 * OpenRouter API configuration interface
 */
interface OpenRouterConfig {
  apiKey: string;
  baseUrl: string;
  defaultModel: string;
  timeoutMs: number;
}

/**
 * Chat completion request parameters
 */
interface ChatCompletionRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

/**
 * Chat completion response interface
 */
interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * OpenRouter API error
 */
class OpenRouterError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

/**
 * OpenRouter API client class
 */
export class OpenRouterApi {
  private config: OpenRouterConfig;
  private supabase;

  /**
   * Initialize OpenRouter API client
   * @param config API configuration options
   */
  constructor(config: Partial<OpenRouterConfig> = {}) {
    this.config = {
      apiKey: process.env.OPENROUTER_API_KEY || '',
      baseUrl: 'https://openrouter.ai/api/v1',
      defaultModel: 'gpt-3.5-turbo',
      timeoutMs: 30000,
      ...config
    };

    // Initialize Supabase client
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
  }

  /**
   * Create chat completion
   * @param params Chat completion request parameters
   * @returns Promise with completion response
   */
  async createChatCompletion(
    params: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || '',
        },
        body: JSON.stringify({
          model: params.model || this.config.defaultModel,
          messages: params.messages,
          temperature: params.temperature || 0.7,
          max_tokens: params.max_tokens || 500
        }),
        signal: AbortSignal.timeout(this.config.timeoutMs)
      });

      if (!response.ok) {
        throw new OpenRouterError(
          `API request failed: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      
      // Log completion to Supabase
      await this.logCompletion(data);

      return data;
    } catch (error) {
      if (error instanceof OpenRouterError) {
        throw error;
      }
      throw new OpenRouterError(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }

  /**
   * Log completion to Supabase
   * @param completion Chat completion response
   */
  private async logCompletion(completion: ChatCompletionResponse): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('completions')
        .insert({
          completion_id: completion.id,
          usage: completion.usage,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to log completion:', error);
    }
  }

  /**
   * Get API configuration
   * @returns Current API configuration
   */
  getConfig(): OpenRouterConfig {
    return { ...this.config };
  }

  /**
   * Update API configuration
   * @param updates Partial configuration updates
   */
  updateConfig(updates: Partial<OpenRouterConfig>): void {
    this.config = {
      ...this.config,
      ...updates
    };
  }
}

/**
 * Create default OpenRouter API instance
 */
export const openRouter = new OpenRouterApi();

export default openRouter;