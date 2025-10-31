import { NextRequest, NextResponse } from 'next/server';

// Real OpenRouter service integration
class OpenRouterService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Model configuration based on use case - following BuildRunner LLM strategy
  private getModelForUseCase(useCase: 'brainstorm' | 'scoring' | 'prd_draft' | 'reasoning' | 'budget'): string {
    const models = {
      // Core creative + planning - balanced creativity, long context, strong guardrails
      brainstorm: 'anthropic/claude-4-sonnet-20250522',

      // Idea scoring / tradeoff analysis - better structured reasoning
      scoring: 'anthropic/claude-4-sonnet-20250522',

      // Concept → PRD drafting - excels at long, structured outputs
      prd_draft: 'anthropic/claude-4-sonnet-20250522',

      // Heavy reasoning - strong deliberate reasoning with "think" traces
      reasoning: 'deepseek/deepseek-r1',

      // Budget option - very capable general chat at low cost
      budget: 'deepseek/deepseek-chat'
    };

    return models[useCase];
  }

  // Auto-fallback strategy for cost/timeouts
  private async callWithFallback(useCase: 'brainstorm' | 'scoring' | 'prd_draft' | 'reasoning' | 'budget', messages: any[], options: any = {}) {
    const primaryModel = this.getModelForUseCase(useCase);
    const fallbackModel = this.getModelForUseCase('budget'); // DeepSeek V3 as fallback

    try {
      // Try primary model first
      return await this.makeAPICall(primaryModel, messages, options);
    } catch (error) {
      console.warn(`Primary model ${primaryModel} failed, falling back to ${fallbackModel}:`, error);

      try {
        // Fallback to budget model
        return await this.makeAPICall(fallbackModel, messages, options);
      } catch (fallbackError) {
        console.error(`Both primary and fallback models failed:`, fallbackError);
        throw fallbackError;
      }
    }
  }

  private async makeAPICall(model: string, messages: any[], options: any = {}) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://buildrunner.cloud',
        'X-Title': 'BuildRunner SaaS',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2000,
        ...options
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  }
  async generateSuggestions(category: string, prompt: string, productIdea?: string, usedSuggestions: string[] = [], useReasoning: boolean = false) {
    const systemPrompt = this.getSystemPrompt(category, productIdea);

    const productContext = productIdea ? `\n\nPRODUCT CONTEXT: The user is developing "${productIdea}". All suggestions must be specifically tailored to this product.` : '';
    const usedContext = usedSuggestions.length > 0 ? `\n\nIMPORTANT: Do NOT suggest these features that have already been added to the PRD: ${usedSuggestions.join(', ')}. Provide NEW, different suggestions.` : '';

    const enhancedPrompt = `${prompt}${productContext}${usedContext}

Please provide 3-5 NEW actionable suggestions in JSON format specifically for this product. Each suggestion should follow this exact schema:
{
  "title": "Brief descriptive title (max 100 chars)",
  "summary": "Concise explanation (max 300 chars)",
  "detailed_description": "Comprehensive explanation of how this feature works technically and functionally",
  "user_interaction": "Step-by-step description of how users will interact with and use this feature",
  "technical_implementation": "High-level technical approach and architecture considerations",
  "business_value": "Clear explanation of the business value and why this feature matters",
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

    try {
      // Use reasoning model for scoring/analysis, brainstorm model for creative tasks
      const useCase = useReasoning ? 'reasoning' : 'brainstorm';

      const data = await this.callWithFallback(useCase, [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: enhancedPrompt }
      ], {
        temperature: useReasoning ? 0.3 : 0.7, // Lower temperature for reasoning
        max_tokens: 2000
      });
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Empty response from OpenRouter');
      }

      // Process suggestions response (internal only)

      try {
        // Clean the content by removing markdown code blocks
        let cleanContent = content.trim();
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const suggestions = JSON.parse(cleanContent);
        // Suggestions parsed successfully
        return Array.isArray(suggestions) ? suggestions : [];
      } catch (parseError) {
        console.error('Failed to parse suggestions JSON:', parseError);
        // Content parsing failed - using fallback
        // Return mock suggestions if parsing fails
        return this.getMockSuggestions(category, prompt);
      }

    } catch (error) {
      console.error('OpenRouter suggestions error:', error);
      // Fallback to mock suggestions if API fails
      return this.getMockSuggestions(category, prompt);
    }
  }

  async generateResponse(category: string, messages: any[], productIdea?: string) {
    const systemPrompt = this.getSystemPrompt(category, productIdea);

    try {
      // Use brainstorm model for conversational responses
      const data = await this.callWithFallback('brainstorm', [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-5) // Last 5 messages for context
      ], {
        temperature: 0.7,
        max_tokens: 1000 // Shorter responses for chat
      });
      const responseContent = data.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response.';
      // Response generated successfully
      return responseContent;

    } catch (error) {
      console.error('OpenRouter response error:', error);
      // Fallback to mock response if API fails
      return this.getMockResponse(category, messages);
    }
  }

  async generateProductDescription(productIdea: string) {
    try {
      // Use PRD drafting model for structured product descriptions
      const data = await this.callWithFallback('prd_draft', [
        {
          role: 'system',
          content: 'You are a product description expert. Create concise, professional product descriptions for PRD documents. Focus on the core value proposition and target users. Keep it under 100 words.'
        },
        {
          role: 'user',
          content: `Create a professional product description for this idea: "${productIdea}". Make it suitable for a Product Requirements Document. Focus on what the product does, who it's for, and the key value it provides.`
        }
      ], {
        temperature: 0.3,
        max_tokens: 300
      });
      return data.choices[0]?.message?.content || productIdea;

    } catch (error) {
      console.error('OpenRouter product description error:', error);
      return productIdea; // Fallback to original idea
    }
  }

  async extractInitialFeatures(productIdea: string) {
    try {
      // Use reasoning model for feature extraction analysis
      const data = await this.callWithFallback('reasoning', [
        {
          role: 'system',
          content: `You are a feature extraction expert. Analyze product ideas and extract specific features mentioned or implied. Return a JSON array of features with detailed descriptions.

Each feature should include:
- title: Clear, specific feature name
- summary: One-line description
- detailed_description: Comprehensive explanation of how it works
- user_interaction: Step-by-step how users will use this feature
- technical_implementation: High-level technical approach
- business_value: Why this feature matters
- impact_score: 1-10 rating
- implementation_effort: low/medium/high
- category: product

Focus on extracting SPECIFIC features mentioned in the user's description, not generic suggestions.`
        },
        {
          role: 'user',
          content: `Extract the specific features mentioned in this product idea: "${productIdea}"

Return only the JSON array, no other text.`
        }
      ], {
        temperature: 0.3, // Lower temperature for analytical tasks
        max_tokens: 2500
      });
      const content = data.choices[0]?.message?.content || '[]';

      try {
        // Clean the content by removing markdown code blocks
        let cleanContent = content.trim();
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const features = JSON.parse(cleanContent);
        console.log('Extracted initial features:', features);
        return Array.isArray(features) ? features : [];
      } catch (parseError) {
        console.error('Failed to parse extracted features:', parseError);
        return [];
      }

    } catch (error) {
      console.error('OpenRouter feature extraction error:', error);
      return [];
    }
  }



  getSystemPrompt(category: string, productIdea?: string) {
    const productContext = productIdea ? `\n\nIMPORTANT: The user is developing "${productIdea}". You must:
1. Keep your response very brief - just say "Here are some ideas for your [product type]:" and stop
2. Do NOT provide long explanations or detailed advice in the main response
3. The detailed suggestions will be provided separately as draggable cards
4. Be concise and direct - maximum 1-2 sentences` : '';

    const prompts = {
      strategy: `You are StrategyGPT, an expert business strategist. Provide very brief responses introducing strategy suggestions.${productContext}`,
      product: `You are ProductGPT, a senior product manager. Provide very brief responses introducing product feature suggestions.${productContext}`,
      monetization: `You are MonetizationGPT, a revenue strategy expert. Provide very brief responses introducing monetization suggestions.${productContext}`,
      gtm: `You are GTMGPT, a go-to-market specialist. Provide very brief responses introducing go-to-market suggestions.${productContext}`,
      competitor: `You are CompetitorGPT, a competitive intelligence analyst. Provide very brief responses introducing competitive analysis suggestions.${productContext}`,
    };

    return prompts[category as keyof typeof prompts] || prompts.strategy;
  }

  getMockSuggestions(category: string, prompt: string) {
    return [
      {
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Suggestion`,
        summary: `AI-generated suggestion for ${category} based on your prompt.`,
        category,
        impact_score: Math.floor(Math.random() * 4) + 7,
        confidence: Math.random() * 0.3 + 0.7,
        reasoning: `This suggestion addresses key ${category} considerations.`,
        implementation_effort: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        dependencies: [`${category} dependency`],
        metrics: [`${category} metric`],
        risks: [`${category} risk`],
      }
    ];
  }

  getMockResponse(category: string, messages: any[]) {
    const lastMessage = messages[messages.length - 1]?.content || '';
    return `Thank you for your question about ${category}. Based on "${lastMessage.substring(0, 100)}...", here are some insights based on current best practices and market trends.`;
  }
}

function getApiKeys() {
  // In a real app, these would come from environment variables or secure storage
  // For now, we'll try to get them from the request headers or use fallback
  return {
    openrouter: process.env.OPENROUTER_API_KEY || '',
  };
}

export async function POST(request: NextRequest) {
  console.log('Brainstorm chat API called');

  try {
    const body = await request.json();
    const { category, message, conversation_history, product_idea, used_suggestions = [], use_reasoning = false } = body;

    // Processing brainstorm request

    if (!category || !message) {
      console.error('Missing required fields:', { category: !!category, message: !!message });
      return NextResponse.json(
        { error: 'Category and message are required' },
        { status: 400 }
      );
    }

    // Get API keys from headers (sent from client)
    const apiKeys = request.headers.get('x-api-keys');
    let openrouterKey = '';

    if (apiKeys) {
      try {
        const keys = JSON.parse(apiKeys);
        openrouterKey = keys.openrouter || '';
        console.log('API keys parsed from headers, OpenRouter key present:', !!openrouterKey);
      } catch (e) {
        console.warn('Failed to parse API keys from headers:', e);
      }
    }

    // Fallback to environment variable
    if (!openrouterKey) {
      openrouterKey = process.env.OPENROUTER_API_KEY || '';
      console.log('Using environment OpenRouter key:', !!openrouterKey);
    }

    if (!openrouterKey) {
      console.error('No OpenRouter API key available');
      return NextResponse.json(
        { error: 'OpenRouter API key not configured. Please add it in Settings → API Keys.' },
        { status: 400 }
      );
    }

    const service = new OpenRouterService(openrouterKey);

    console.log('Generating AI response and suggestions...');

    // Generate response, suggestions, product description, and extract initial features (if first message)
    const isFirstMessage = !conversation_history || conversation_history.length === 0;
    const [response, suggestions, productDescription, initialFeatures] = await Promise.all([
      service.generateResponse(category, conversation_history || [], product_idea),
      service.generateSuggestions(category, message, product_idea, used_suggestions, use_reasoning),
      isFirstMessage && product_idea ? service.generateProductDescription(product_idea) : Promise.resolve(null),
      isFirstMessage && product_idea ? service.extractInitialFeatures(product_idea) : Promise.resolve([])
    ]);

    console.log('AI response generated successfully:', {
      responseLength: response?.length || 0,
      suggestionsCount: suggestions?.length || 0,
      hasProductDescription: !!productDescription,
      initialFeaturesCount: initialFeatures?.length || 0
    });

    return NextResponse.json({
      response,
      suggestions,
      productDescription,
      initialFeatures,
      category,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error in brainstorm chat:', error);
    return NextResponse.json(
      { error: `Failed to process chat request: ${error.message}` },
      { status: 500 }
    );
  }
}
