/**
 * Multi-LLM Gateway
 *
 * Intelligent routing system for multi-LLM requests with:
 * - Task-based model selection
 * - Automatic fallback chains
 * - Response caching
 * - Cost tracking
 * - Parallel multi-LLM consultation
 */

import {
  LLMRoute,
  LLMRequest,
  LLMResponse,
  MultiLLMResponse,
  TaskType,
  LLMModel,
} from './types';

// ============================================================================
// Configuration
// ============================================================================

const LLM_ROUTES: LLMRoute[] = [
  {
    task_type: 'reasoning',
    primary_model: 'anthropic/claude-3.5-sonnet',
    fallback_models: ['openai/gpt-4o', 'openai/gpt-4o-mini'],
    temperature: 0.3,
    max_tokens: 4096,
    caching: true,
  },
  {
    task_type: 'code',
    primary_model: 'deepseek/deepseek-chat',
    fallback_models: ['anthropic/claude-3.5-sonnet', 'openai/gpt-4o'],
    temperature: 0.2,
    max_tokens: 8192,
    caching: true,
  },
  {
    task_type: 'synthesis',
    primary_model: 'anthropic/claude-opus-4',
    fallback_models: ['anthropic/claude-3.5-sonnet'],
    temperature: 0.4,
    max_tokens: 8192,
    caching: false,
  },
  {
    task_type: 'extraction',
    primary_model: 'anthropic/claude-3.5-haiku',
    fallback_models: ['google/gemini-2.0-flash-exp', 'openai/gpt-4o-mini'],
    temperature: 0.2,
    max_tokens: 2048,
    caching: true,
  },
  {
    task_type: 'verification',
    primary_model: 'multi-llm-consensus',
    fallback_models: [],
    temperature: 0.1,
    max_tokens: 2048,
    caching: false,
  },
];

// ============================================================================
// LLM Gateway Class
// ============================================================================

export class LLMGateway {
  private static instance: LLMGateway;
  private cache: Map<string, LLMResponse>;
  private costTracker: Map<LLMModel, number>;

  private constructor() {
    this.cache = new Map();
    this.costTracker = new Map();
  }

  public static getInstance(): LLMGateway {
    if (!LLMGateway.instance) {
      LLMGateway.instance = new LLMGateway();
    }
    return LLMGateway.instance;
  }

  /**
   * Main entry point for LLM requests
   * Routes to appropriate model based on task type
   */
  public async request(request: LLMRequest): Promise<LLMResponse> {
    const route = this.getRoute(request.task_type);

    // Check cache if caching is enabled
    if (route.caching) {
      const cached = this.checkCache(request);
      if (cached) {
        console.log(`✅ Cache hit for ${request.task_type}`);
        return cached;
      }
    }

    // Handle multi-LLM consensus requests
    if (route.primary_model === 'multi-llm-consensus') {
      return await this.handleConsensusRequest(request, route);
    }

    // Try primary model
    try {
      const response = await this.callModel(
        route.primary_model as LLMModel,
        request,
        route
      );

      // Cache if enabled
      if (route.caching) {
        this.cacheResponse(request, response);
      }

      return response;
    } catch (error) {
      console.error(`❌ Primary model ${route.primary_model} failed:`, error);

      // Try fallback models
      for (const fallbackModel of route.fallback_models) {
        try {
          console.log(`🔄 Trying fallback model: ${fallbackModel}`);
          const response = await this.callModel(fallbackModel, request, route);

          if (route.caching) {
            this.cacheResponse(request, response);
          }

          return response;
        } catch (fallbackError) {
          console.error(`❌ Fallback model ${fallbackModel} failed:`, fallbackError);
          continue;
        }
      }

      throw new Error(`All models failed for task: ${request.task_type}`);
    }
  }

  /**
   * Multi-LLM consultation for complex problems
   * Queries multiple models in parallel and returns all responses
   */
  public async consultMultiple(
    request: LLMRequest,
    models: LLMModel[]
  ): Promise<MultiLLMResponse> {
    const route = this.getRoute(request.task_type);

    console.log(`🔍 Consulting ${models.length} LLMs in parallel...`);

    // Query all models in parallel
    const responses = await Promise.all(
      models.map(async (model) => {
        try {
          return await this.callModel(model, request, route);
        } catch (error) {
          console.error(`❌ Model ${model} failed:`, error);
          return null;
        }
      })
    );

    // Filter out failed responses
    const successfulResponses = responses.filter((r): r is LLMResponse => r !== null);

    if (successfulResponses.length === 0) {
      throw new Error('All models failed in multi-LLM consultation');
    }

    return {
      responses: successfulResponses,
    };
  }

  /**
   * Synthesize multiple LLM responses into a single best answer
   * Uses Claude Opus for synthesis
   */
  public async synthesize(
    multiResponse: MultiLLMResponse,
    originalPrompt: string
  ): Promise<LLMResponse> {
    const synthesisPrompt = this.buildSynthesisPrompt(multiResponse, originalPrompt);

    const synthesisRoute: LLMRoute = {
      task_type: 'synthesis',
      primary_model: 'anthropic/claude-opus-4',
      fallback_models: ['anthropic/claude-sonnet-3.5'],
      temperature: 0.4,
      max_tokens: 8192,
      caching: false,
    };

    const synthesis = await this.callModel(
      synthesisRoute.primary_model as LLMModel,
      {
        task_type: 'synthesis',
        prompt: synthesisPrompt,
        require_json: true,
      },
      synthesisRoute
    );

    return synthesis;
  }

  /**
   * Get cost statistics
   */
  public getCostStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    this.costTracker.forEach((cost, model) => {
      stats[model] = cost;
    });
    return stats;
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
    console.log('🗑️  LLM cache cleared');
  }

  // ==========================================================================
  // Private Methods
  // ==========================================================================

  private getRoute(taskType: TaskType): LLMRoute {
    const route = LLM_ROUTES.find((r) => r.task_type === taskType);
    if (!route) {
      throw new Error(`No route configured for task type: ${taskType}`);
    }
    return route;
  }

  private async handleConsensusRequest(
    request: LLMRequest,
    route: LLMRoute
  ): Promise<LLMResponse> {
    // Query Claude, GPT-4, and Gemini in parallel
    const consensusModels: LLMModel[] = [
      'anthropic/claude-sonnet-3.5',
      'openai/gpt-4',
      'google/gemini-pro',
    ];

    const multiResponse = await this.consultMultiple(request, consensusModels);

    // Analyze consensus
    const consensus = this.analyzeConsensus(multiResponse);

    return {
      model: 'multi-llm-consensus' as any,
      content: JSON.stringify(consensus),
      confidence: consensus.agreement_score,
      timestamp: new Date(),
    };
  }

  private async callModel(
    model: LLMModel,
    request: LLMRequest,
    route: LLMRoute
  ): Promise<LLMResponse> {
    const startTime = Date.now();

    // Build request for OpenRouter
    const messages = [];

    // Add system prompt (with JSON enforcement if needed)
    let systemPrompt = request.system_prompt;
    if (request.require_json && !systemPrompt) {
      systemPrompt = 'You are a helpful assistant that returns responses in valid JSON format only. Never include explanations, markdown formatting, or any text outside the JSON structure.';
    }

    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: route.caching
          ? [
              {
                type: 'text',
                text: systemPrompt,
                cache_control: { type: 'ephemeral' },
              },
            ]
          : systemPrompt,
      });
    }

    messages.push({
      role: 'user',
      content: request.prompt,
    });

    // Get API key from localStorage, backend file, or environment
    const getApiKey = (): string | undefined => {
      if (typeof window !== 'undefined') {
        // Browser: Read from localStorage
        console.log('🔑 Attempting to read API key from localStorage...');
        const savedKeys = localStorage.getItem('buildrunner_api_keys');
        console.log('📦 Raw localStorage value:', savedKeys ? 'exists' : 'null');

        if (savedKeys) {
          try {
            const keys = JSON.parse(savedKeys);
            console.log('🔍 Available keys:', Object.keys(keys));
            const apiKey = keys.openrouter || keys.OPENROUTER_API_KEY;
            console.log('🔑 Found OpenRouter key:', apiKey ? 'yes (hidden)' : 'no');
            return apiKey;
          } catch (e) {
            console.error('❌ Failed to parse API keys from localStorage:', e);
          }
        } else {
          console.warn('⚠️  No API keys found in localStorage');
        }
      } else {
        // Server: Try to read from file first, then environment variable
        try {
          const fs = require('fs');
          const path = require('path');
          const keysFile = path.join(process.cwd(), '.api-keys.json');

          if (fs.existsSync(keysFile)) {
            const fileContent = fs.readFileSync(keysFile, 'utf-8');
            const keys = JSON.parse(fileContent);
            if (keys.openrouter) {
              console.log('✅ Loaded OpenRouter key from backend file');
              return keys.openrouter;
            }
          }
        } catch (e) {
          console.warn('Could not read API keys from file:', e);
        }

        // Fallback to environment variable
        return process.env.OPENROUTER_API_KEY;
      }
    };

    const apiKey = getApiKey();
    if (!apiKey) {
      console.error('❌ No OpenRouter API key found!');
      throw new Error('OpenRouter API key not configured. Please add it in Settings → API Keys.');
    }
    console.log('✅ API key loaded successfully');

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
        'X-Title': 'BuildRunner SaaS',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: route.temperature,
        max_tokens: route.max_tokens,
        ...(request.require_json && { response_format: { type: 'json_object' } }),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const tokensUsed = data.usage?.total_tokens || 0;
    const cost = this.calculateCost(model, tokensUsed);

    // Track cost
    const currentCost = this.costTracker.get(model) || 0;
    this.costTracker.set(model, currentCost + cost);

    const timeTaken = Date.now() - startTime;
    console.log(
      `✅ ${model} responded in ${timeTaken}ms (${tokensUsed} tokens, $${cost.toFixed(4)})`
    );

    return {
      model,
      content,
      timestamp: new Date(),
      cost,
      tokens_used: tokensUsed,
      cached: false,
    };
  }

  private checkCache(request: LLMRequest): LLMResponse | null {
    const cacheKey = this.getCacheKey(request);
    const cached = this.cache.get(cacheKey);

    if (cached) {
      // Check if cache is still valid (5 minutes)
      const age = Date.now() - cached.timestamp.getTime();
      if (age < 5 * 60 * 1000) {
        return { ...cached, cached: true };
      } else {
        this.cache.delete(cacheKey);
      }
    }

    return null;
  }

  private cacheResponse(request: LLMRequest, response: LLMResponse): void {
    const cacheKey = this.getCacheKey(request);
    this.cache.set(cacheKey, response);
  }

  private getCacheKey(request: LLMRequest): string {
    return `${request.task_type}:${request.prompt.substring(0, 100)}`;
  }

  private analyzeConsensus(multiResponse: MultiLLMResponse): any {
    const responses = multiResponse.responses;

    // Simple consensus: count similar responses
    const responseCounts = new Map<string, number>();

    responses.forEach((r) => {
      const key = r.content.substring(0, 200); // Use first 200 chars as key
      responseCounts.set(key, (responseCounts.get(key) || 0) + 1);
    });

    // Find most common response
    let maxCount = 0;
    let consensusContent = '';

    responseCounts.forEach((count, content) => {
      if (count > maxCount) {
        maxCount = count;
        consensusContent = content;
      }
    });

    const agreementScore = maxCount / responses.length;

    return {
      consensus_reached: agreementScore >= 0.67, // 2 out of 3 agree
      agreement_score: agreementScore,
      majority_response: consensusContent,
      all_responses: responses.map((r) => ({
        model: r.model,
        content: r.content,
      })),
    };
  }

  private buildSynthesisPrompt(
    multiResponse: MultiLLMResponse,
    originalPrompt: string
  ): string {
    return `You are the synthesis agent. ${multiResponse.responses.length} LLMs have provided solutions to this problem:

ORIGINAL PROBLEM:
${originalPrompt}

${multiResponse.responses
  .map(
    (r, i) => `
=== Solution ${i + 1} from ${r.model} ===
${r.content}
Confidence: ${r.confidence || 'N/A'}
Reasoning: ${r.reasoning || 'N/A'}
`
  )
  .join('\n\n')}

Your task:
1. Identify commonalities and best ideas from each solution
2. Create a comprehensive solution combining the best elements
3. Explain your reasoning
4. Rate the overall confidence (0-1)

Output format (JSON):
{
  "synthesized_solution": "...",
  "reasoning": "Why this approach is best",
  "confidence": 0.85,
  "elements_from": ["model1", "model2", ...]
}`;
  }

  private calculateCost(model: LLMModel, tokens: number): number {
    // Approximate costs per 1M tokens (you should update these)
    const costs: Record<LLMModel, { input: number; output: number }> = {
      'anthropic/claude-sonnet-3.5': { input: 3.0, output: 15.0 },
      'anthropic/claude-opus-4': { input: 15.0, output: 75.0 },
      'anthropic/claude-haiku': { input: 0.25, output: 1.25 },
      'openai/gpt-4': { input: 30.0, output: 60.0 },
      'openai/o1-mini': { input: 3.0, output: 12.0 },
      'google/gemini-pro': { input: 0.5, output: 1.5 },
      'google/gemini-flash-2.0': { input: 0.075, output: 0.3 },
      'deepseek/deepseek-chat': { input: 0.14, output: 0.28 },
    };

    const modelCost = costs[model] || { input: 1.0, output: 2.0 };
    // Simplified: assume 50/50 input/output
    const avgCost = (modelCost.input + modelCost.output) / 2;
    return (avgCost / 1_000_000) * tokens;
  }
}

// Export singleton instance
export const llmGateway = LLMGateway.getInstance();
