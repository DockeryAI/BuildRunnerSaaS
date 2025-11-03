```typescript
/**
 * @fileoverview Service for interacting with OpenAI's GPT API
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
 * Service class for interacting with OpenAI's GPT API
 */
export class OpenAIService {
  private openai: OpenAIApi;
  private config: OpenAIConfig;
  private static readonly DEFAULT_MODEL = 'text-davinci-003';
  private static readonly DEFAULT_MAX_TOKENS = 2048;
  private static readonly DEFAULT_TEMPERATURE = 0.7;

  /**
   * Creates an instance of OpenAIService
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
   * Generates text completion using GPT
   * @param params - Completion parameters
   * @returns Generated text
   * @throws {Error} If the API call fails
   */
  public async generateCompletion(params: CompletionParams): Promise<string> {
    try {
      const response = await this.openai.createCompletion({
        model: params.model || OpenAIService.DEFAULT_MODEL,
        prompt: params.prompt,
        max_tokens: params.maxTokens || OpenAIService.DEFAULT_MAX_TOKENS,
        temperature: params.temperature || OpenAIService.DEFAULT_TEMPERATURE,
        top_p: params.topP,
        n: params.n,
        stream: params.stream,
        stop: params.stop,
        presence_penalty: params.presencePenalty,
        frequency_penalty: params.frequencyPenalty,
        user: params.user
      });

      if (!response.data.choices || response.data.choices.length === 0) {
        throw new Error('No completion choices returned from API');
      }

      return response.data.choices[0].text?.trim() ?? '';

    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`OpenAI API Error: ${error.message}`);
      }
      throw new Error('Unknown error occurred while calling OpenAI API');
    }
  }

  /**
   * Generates chat completion using GPT
   * @param messages - Array of chat messages
   * @returns Generated chat response
   * @throws {Error} If the API call fails
   */
  public async generateChatCompletion(messages: Array<{role: string; content: string}>): Promise<string> {
    try {
      const response = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages
      });

      if (!response.data.choices || response.data.choices.length === 0) {
        throw new Error('No chat completion choices returned from API');
      }

      return response.data.choices[0].message?.content?.trim() ?? '';

    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`OpenAI Chat API Error: ${error.message}`);
      }
      throw new Error('Unknown error occurred while calling OpenAI Chat API');
    }
  }

  /**
   * Sets a new API key
   * @param apiKey - New OpenAI API key
   */
  public setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
    const configuration = new Configuration({
      apiKey,
      organization: this.config.organization
    });
    this.openai = new OpenAIApi(configuration);
  }

  /**
   * Gets the current configuration
   * @returns Current configuration object
   */
  public getConfig(): Readonly<OpenAIConfig> {
    return Object.freeze({ ...this.config });
  }
}

export default OpenAIService;
```