import { z } from 'zod';
import modelRouting from '../config/model-routing.json';

// Types for OpenRouter integration
export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
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

// Suggestion card schema
export const SuggestionCardSchema = z.object({
  title: z.string().max(100),
  summary: z.string().max(300),
  category: z.enum(['strategy', 'product', 'monetization', 'gtm', 'competitor']),
  impact_score: z.number().min(1).max(10),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().max(500),
  implementation_effort: z.enum(['low', 'medium', 'high']),
  dependencies: z.array(z.string()).optional(),
  metrics: z.array(z.string()).optional(),
  risks: z.array(z.string()).optional(),
});

export type SuggestionCard = z.infer<typeof SuggestionCardSchema>;

// Rate limiting state
const rateLimitState = new Map<string, { count: number; resetTime: number }>();

class OpenRouterService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY environment variable is required');
    }
  }

  /**
   * Check rate limits for a given model category
   */
  private checkRateLimit(category: string): boolean {
    const now = Date.now();
    const key = `${category}_minute`;
    const state = rateLimitState.get(key) || { count: 0, resetTime: now + 60000 };

    // Reset if time window has passed
    if (now > state.resetTime) {
      state.count = 0;
      state.resetTime = now + 60000;
    }

    // Check if under limit
    const limit = modelRouting.routing.rate_limit.requests_per_minute;
    if (state.count >= limit) {
      return false;
    }

    // Increment counter
    state.count++;
    rateLimitState.set(key, state);
    return true;
  }

  /**
   * Make a request to OpenRouter API
   */
  private async makeRequest(
    model: string,
    messages: OpenRouterMessage[],
    options: {
      temperature?: number;
      max_tokens?: number;
      stream?: boolean;
    } = {}
  ): Promise<OpenRouterResponse> {
    const request: OpenRouterRequest = {
      model,
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1500,
      stream: options.stream || false,
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://buildrunner.cloud',
        'X-Title': 'BuildRunner SaaS',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${error}`);
    }

    return response.json();
  }

  /**
   * Generate suggestion cards for a given category and prompt
   */
  async generateSuggestions(
    category: keyof typeof modelRouting.models,
    userPrompt: string,
    context?: string
  ): Promise<SuggestionCard[]> {
    // Check rate limits
    if (!this.checkRateLimit(category)) {
      throw new Error(`Rate limit exceeded for category: ${category}`);
    }

    const modelConfig = modelRouting.models[category];
    if (!modelConfig) {
      throw new Error(`Unknown model category: ${category}`);
    }

    // Prepare messages
    const systemPrompt = modelConfig.system_prompt;
    const enhancedPrompt = `${userPrompt}

${context ? `Context: ${context}` : ''}

Please provide 3-5 actionable suggestions in JSON format. Each suggestion should follow this exact schema:
{
  "title": "Brief descriptive title (max 100 chars)",
  "summary": "Concise explanation (max 300 chars)",
  "category": "${category}",
  "impact_score": 1-10,
  "confidence": 0.0-1.0,
  "reasoning": "Why this matters (max 500 chars)",
  "implementation_effort": "low|medium|high",
  "dependencies": ["optional array of dependencies"],
  "metrics": ["optional success metrics"],
  "risks": ["optional potential risks"]
}

Return only a JSON array of suggestions, no additional text.`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: enhancedPrompt },
    ];

    try {
      // Try primary model
      const response = await this.makeRequest(
        modelConfig.primary,
        messages,
        {
          temperature: modelConfig.temperature,
          max_tokens: modelConfig.max_tokens,
        }
      );

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from OpenRouter');
      }

      // Parse and validate JSON response
      const suggestions = JSON.parse(content);
      if (!Array.isArray(suggestions)) {
        throw new Error('Response is not an array');
      }

      // Validate each suggestion
      const validatedSuggestions: SuggestionCard[] = [];
      for (const suggestion of suggestions) {
        try {
          const validated = SuggestionCardSchema.parse(suggestion);
          validatedSuggestions.push(validated);
        } catch (validationError) {
          console.warn('Invalid suggestion card:', validationError);
          // Skip invalid suggestions rather than failing entirely
        }
      }

      return validatedSuggestions;

    } catch (error) {
      console.error(`Primary model failed for ${category}:`, error);

      // Try fallback model if enabled
      if (modelRouting.routing.fallback_enabled && modelConfig.fallback) {
        try {
          const fallbackResponse = await this.makeRequest(
            modelConfig.fallback,
            messages,
            {
              temperature: modelConfig.temperature,
              max_tokens: modelConfig.max_tokens,
            }
          );

          const content = fallbackResponse.choices[0]?.message?.content;
          if (content) {
            const suggestions = JSON.parse(content);
            if (Array.isArray(suggestions)) {
              const validatedSuggestions: SuggestionCard[] = [];
              for (const suggestion of suggestions) {
                try {
                  const validated = SuggestionCardSchema.parse(suggestion);
                  validatedSuggestions.push(validated);
                } catch (validationError) {
                  console.warn('Invalid fallback suggestion card:', validationError);
                }
              }
              return validatedSuggestions;
            }
          }
        } catch (fallbackError) {
          console.error(`Fallback model also failed for ${category}:`, fallbackError);
        }
      }

      throw new Error(`Failed to generate suggestions for ${category}: ${error.message}`);
    }
  }

  /**
   * Generate a conversational response for brainstorming
   */
  async generateResponse(
    category: keyof typeof modelRouting.models,
    messages: OpenRouterMessage[]
  ): Promise<string> {
    // Check rate limits
    if (!this.checkRateLimit(category)) {
      throw new Error(`Rate limit exceeded for category: ${category}`);
    }

    const modelConfig = modelRouting.models[category];
    if (!modelConfig) {
      throw new Error(`Unknown model category: ${category}`);
    }

    // Add system prompt if not present
    const enhancedMessages = [...messages];
    if (enhancedMessages[0]?.role !== 'system') {
      enhancedMessages.unshift({
        role: 'system',
        content: modelConfig.system_prompt,
      });
    }

    try {
      const response = await this.makeRequest(
        modelConfig.primary,
        enhancedMessages,
        {
          temperature: modelConfig.temperature,
          max_tokens: modelConfig.max_tokens,
        }
      );

      return response.choices[0]?.message?.content || '';

    } catch (error) {
      console.error(`Response generation failed for ${category}:`, error);

      // Try fallback model
      if (modelRouting.routing.fallback_enabled && modelConfig.fallback) {
        try {
          const fallbackResponse = await this.makeRequest(
            modelConfig.fallback,
            enhancedMessages,
            {
              temperature: modelConfig.temperature,
              max_tokens: modelConfig.max_tokens,
            }
          );

          return fallbackResponse.choices[0]?.message?.content || '';
        } catch (fallbackError) {
          console.error(`Fallback response generation failed for ${category}:`, fallbackError);
        }
      }

      throw new Error(`Failed to generate response for ${category}: ${error.message}`);
    }
  }

  /**
   * Get available model categories and their configurations
   */
  getModelCategories() {
    return modelRouting.categories;
  }

  /**
   * Get predefined prompts for different brainstorming areas
   */
  getPredefinedPrompts() {
    return modelRouting.prompts;
  }

  /**
   * Health check for OpenRouter service
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: string }> {
    try {
      const testMessages: OpenRouterMessage[] = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "OK" if you can hear me.' },
      ];

      const response = await this.makeRequest(
        'openai/gpt-3.5-turbo',
        testMessages,
        { max_tokens: 10 }
      );

      if (response.choices[0]?.message?.content) {
        return { status: 'healthy', details: 'OpenRouter API is responding' };
      } else {
        return { status: 'unhealthy', details: 'Empty response from OpenRouter' };
      }
    } catch (error) {
      return { 
        status: 'unhealthy', 
        details: `OpenRouter API error: ${error.message}` 
      };
    }
  }
}

// Singleton instance
export const openRouterService = new OpenRouterService();

// Export types and utilities
export { modelRouting };
export type ModelCategory = keyof typeof modelRouting.models;
