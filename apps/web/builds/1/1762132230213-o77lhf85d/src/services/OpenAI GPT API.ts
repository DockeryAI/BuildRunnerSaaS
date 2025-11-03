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
  maxRetries?: number;
  timeout?: number;
}

/**
 * Parameters for generating completions
 */
export interface CompletionParams {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  n?: number;
  stream?: boolean;
  stop?: string | string[];
  presencePenalty?: number;
  frequencyPenalty?: number;
  user?: string;
}

/**
 * Response from the completion API
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
 * Error thrown by the OpenAI service
 */
export class OpenAIError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly data?: any
  ) {
    super(message);
    this.name = 'OpenAIError';
  }
}

/**
 * Service for interacting with OpenAI's GPT API
 */
export class OpenAIService {
  private openai: OpenAIApi;
  private config: Required<OpenAIConfig>;

  /**
   * Creates an instance of the OpenAI service
   * @param config - Configuration options
   */
  constructor(config: OpenAIConfig) {
    this.config = {
      maxRetries: 3,
      timeout: 30000,
      ...config
    };

    const configuration = new Configuration({
      apiKey: this.config.apiKey,
      organization: this.config.organization
    });

    this.openai = new OpenAIApi(configuration);
  }

  /**
   * Generates a completion for the given prompt
   * @param params - Completion parameters
   * @returns Completion response
   * @throws {OpenAIError}
   */
  public async createCompletion(params: CompletionParams): Promise<CompletionResponse> {
    try {
      const response = await this.openai.createCompletion({
        model: params.model || 'text-davinci-003',
        prompt: params.prompt,
        max_tokens: params.maxTokens,
        temperature: params.temperature,
        top_p: params.topP,
        n: params.n,
        stream: params.stream,
        stop: params.stop,
        presence_penalty: params.presencePenalty,
        frequency_penalty: params.frequencyPenalty,
        user: params.user
      });

      if (!response.data.choices?.[0]?.text) {
        throw new OpenAIError('No completion generated');
      }

      return {
        text: response.data.choices[0].text,
        usage: {
          promptTokens: response.data.usage?.prompt_tokens || 0,
          completionTokens: response.data.usage?.completion_tokens || 0,
          totalTokens: response.data.usage?.total_tokens || 0
        }
      };
    } catch (error: any) {
      if (error?.response) {
        throw new OpenAIError(
          error.response.data.error.message || 'OpenAI API error',
          error.response.status,
          error.response.data
        );
      }
      throw new OpenAIError(error.message || 'Unknown error occurred');
    }
  }

  /**
   * Generates a chat completion using the GPT-3.5/4 chat models
   * @param messages - Array of chat messages
   * @param params - Additional parameters
   * @returns Chat completion response
   * @throws {OpenAIError}
   */
  public async createChatCompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    params: Omit<CompletionParams, 'prompt'> = {}
  ): Promise<CompletionResponse> {
    try {
      const response = await this.openai.createChatCompletion({
        model: params.model || 'gpt-3.5-turbo',
        messages,
        max_tokens: params.maxTokens,
        temperature: params.temperature,
        top_p: params.topP,
        n: params.n,
        stream: params.stream,
        stop: params.stop,
        presence_penalty: params.presencePenalty,
        frequency_penalty: params.frequencyPenalty,
        user: params.user
      });

      if (!response.data.choices?.[0]?.message?.content) {
        throw new OpenAIError('No completion generated');
      }

      return {
        text: response.data.choices[0].message.content,
        usage: {
          promptTokens: response.data.usage?.prompt_tokens || 0,
          completionTokens: response.data.usage?.completion_tokens || 0,
          totalTokens: response.data.usage?.total_tokens || 0
        }
      };
    } catch (error: any) {
      if (error?.response) {
        throw new OpenAIError(
          error.response.data.error.message || 'OpenAI API error',
          error.response.status,
          error.response.data
        );
      }
      throw new OpenAIError(error.message || 'Unknown error occurred');
    }
  }
}
```