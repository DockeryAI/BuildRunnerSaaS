// src/api/openRouter.ts

import { AxiosError } from 'axios';

/**
 * Configuration interface for OpenRouter API
 */
interface OpenRouterConfig {
  apiKey: string;
  baseURL: string;
}

/**
 * Response interface for OpenRouter API calls
 */
interface OpenRouterResponse<T> {
  data: T;
  status: number;
  error?: string;
}

/**
 * Message interface for chat completions
 */
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Chat completion request parameters
 */
interface ChatCompletionParams {
  messages: Message[];
  model: string;
  temperature?: number;
  max_tokens?: number;
}

/**
 * Chat completion response
 */
interface ChatCompletionResponse {
  id: string;
  choices: {
    message: Message;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * OpenRouter API client class
 */
export class OpenRouterAPI {
  private config: OpenRouterConfig;

  constructor(config: OpenRouterConfig) {
    this.config = config;
  }

  /**
   * Makes a request to the OpenRouter API
   * @param endpoint - API endpoint
   * @param method - HTTP method
   * @param body - Request body
   * @returns Promise with response data
   */
  private async makeRequest<T>(
    endpoint: string,
    method: string,
    body?: any
  ): Promise<OpenRouterResponse<T>> {
    try {
      const response = await fetch(`${this.config.baseURL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: body ? JSON.stringify(body) : undefined
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return {
        data,
        status: response.status
      };

    } catch (error) {
      const apiError = error as AxiosError;
      return {
        data: null as any,
        status: apiError.response?.status || 500,
        error: apiError.message
      };
    }
  }

  /**
   * Creates a chat completion
   * @param params - Chat completion parameters
   * @returns Promise with completion response
   */
  public async createChatCompletion(
    params: ChatCompletionParams
  ): Promise<OpenRouterResponse<ChatCompletionResponse>> {
    return this.makeRequest<ChatCompletionResponse>(
      '/chat/completions',
      'POST',
      params
    );
  }

  /**
   * Gets available models
   * @returns Promise with models list
   */
  public async getModels(): Promise<OpenRouterResponse<string[]>> {
    return this.makeRequest<string[]>('/models', 'GET');
  }
}

// Hook for using OpenRouter API
import { useState, useCallback } from 'react';

export function useOpenRouter(config: OpenRouterConfig) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = new OpenRouterAPI(config);

  const sendMessage = useCallback(
    async (message: string, model: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.createChatCompletion({
          messages: [{ role: 'user', content: message }],
          model
        });

        if (response.error) {
          throw new Error(response.error);
        }

        setLoading(false);
        return response.data.choices[0].message.content;

      } catch (err) {
        const error = err as Error;
        setError(error.message);
        setLoading(false);
        return null;
      }
    },
    [api]
  );

  return {
    sendMessage,
    loading,
    error
  };
}