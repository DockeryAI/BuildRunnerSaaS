```typescript
/**
 * @fileoverview OpenAI GPT API service for making completion and chat requests
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
 * Options for completion requests
 */
export interface CompletionOptions {
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
 * Options for chat completion requests
 */
export interface ChatCompletionOptions {
  messages: Array<{role: 'system' | 'user' | 'assistant', content: string}>;
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
 * Service class for interacting with OpenAI's GPT API
 */
export class OpenAIService {
  private openai: OpenAIApi;
  private config: OpenAIConfig;
  
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
   * Makes a completion request to the OpenAI API
   * @param options - Completion request options
   * @returns The completion response text
   * @throws {Error} If the API request fails
   */
  public async complete(options: CompletionOptions): Promise<string> {
    try {
      const response = await this.openai.createCompletion({
        model: options.model || 'text-davinci-003',
        prompt: options.prompt,
        max_tokens: options.maxTokens,
        temperature: options.temperature,
        top_p: options.topP,
        n: options.n,
        stream: options.stream,
        stop: options.stop,
        presence_penalty: options.presencePenalty,
        frequency_penalty: options.frequencyPenalty,
        user: options.user
      });

      if (!response.data.choices?.[0]?.text) {
        throw new Error('No completion was generated');
      }

      return response.data.choices[0].text.trim();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`OpenAI API Error: ${error.message}`);
      }
      throw new Error('Unknown error occurred while calling OpenAI API');
    }
  }

  /**
   * Makes a chat completion request to the OpenAI API
   * @param options - Chat completion request options
   * @returns The chat completion response text
   * @throws {Error} If the API request fails
   */
  public async chatComplete(options: ChatCompletionOptions): Promise<string> {
    try {
      const response = await this.openai.createChatCompletion({
        model: options.model || 'gpt-3.5-turbo',
        messages: options.messages,
        max_tokens: options.maxTokens,
        temperature: options.temperature,
        top_p: options.topP,
        n: options.n,
        stream: options.stream,
        stop: options.stop,
        presence_penalty: options.presencePenalty,
        frequency_penalty: options.frequencyPenalty,
        user: options.user
      });

      if (!response.data.choices?.[0]?.message?.content) {
        throw new Error('No chat completion was generated');
      }

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`OpenAI API Error: ${error.message}`);
      }
      throw new Error('Unknown error occurred while calling OpenAI API');
    }
  }

  /**
   * Gets the current configuration
   * @returns The current configuration object
   */
  public getConfig(): OpenAIConfig {
    return { ...this.config };
  }

  /**
   * Updates the service configuration
   * @param config - New configuration options
   */
  public updateConfig(config: Partial<OpenAIConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };

    if (config.apiKey) {
      const configuration = new Configuration({
        apiKey: this.config.apiKey,
        organization: this.config.organization
      });
      this.openai = new OpenAIApi(configuration);
    }
  }
}
```