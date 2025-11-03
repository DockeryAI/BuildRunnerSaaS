```typescript
/**
 * @fileoverview OpenAI GPT API service for making requests to OpenAI's GPT models
 */

import { Configuration, OpenAIApi } from 'openai';

/**
 * Configuration options for the OpenAI service
 */
export interface OpenAIConfig {
  apiKey: string;
  organization?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Response from text completion request
 */
export interface CompletionResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Service for interacting with OpenAI's GPT API
 */
export class OpenAIService {
  private openai: OpenAIApi;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  /**
   * Creates an instance of the OpenAI service
   * @param config - Configuration options
   */
  constructor(config: OpenAIConfig) {
    const configuration = new Configuration({
      apiKey: config.apiKey,
      organization: config.organization
    });

    this.openai = new OpenAIApi(configuration);
    this.model = config.model || 'gpt-3.5-turbo';
    this.maxTokens = config.maxTokens || 2048;
    this.temperature = config.temperature || 0.7;
  }

  /**
   * Generates a text completion for the given prompt
   * @param prompt - Input text prompt
   * @returns Promise containing the completion response
   * @throws Error if the API request fails
   */
  public async complete(prompt: string): Promise<CompletionResponse> {
    try {
      const response = await this.openai.createChatCompletion({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      });

      if (!response.data.choices[0]?.message?.content) {
        throw new Error('No completion generated');
      }

      return {
        text: response.data.choices[0].message.content,
        usage: {
          promptTokens: response.data.usage?.prompt_tokens || 0,
          completionTokens: response.data.usage?.completion_tokens || 0,
          totalTokens: response.data.usage?.total_tokens || 0
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`OpenAI API error: ${error.message}`);
      }
      throw new Error('Unknown error occurred');
    }
  }

  /**
   * Updates the service configuration
   * @param config - New configuration options
   */
  public updateConfig(config: Partial<OpenAIConfig>): void {
    if (config.apiKey) {
      const configuration = new Configuration({
        apiKey: config.apiKey,
        organization: config.organization
      });
      this.openai = new OpenAIApi(configuration);
    }
    
    if (config.model) {
      this.model = config.model;
    }
    
    if (config.maxTokens) {
      this.maxTokens = config.maxTokens;
    }
    
    if (config.temperature) {
      this.temperature = config.temperature;
    }
  }

  /**
   * Validates whether the service is properly configured
   * @returns True if configuration is valid
   */
  public isConfigured(): boolean {
    return Boolean(this.openai && this.model);
  }
}

export default OpenAIService;
```