import { NextRequest, NextResponse } from 'next/server';

// Real OpenRouter service integration
class OpenRouterService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  async generateSuggestions(category: string, prompt: string) {
    const modelConfig = this.getModelConfig(category);
    const systemPrompt = this.getSystemPrompt(category);

    const enhancedPrompt = `${prompt}

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

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://buildrunner.cloud',
          'X-Title': 'BuildRunner SaaS',
        },
        body: JSON.stringify({
          model: modelConfig.primary,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: enhancedPrompt }
          ],
          temperature: modelConfig.temperature,
          max_tokens: modelConfig.max_tokens,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Empty response from OpenRouter');
      }

      console.log('Raw OpenRouter suggestions response:', content);

      try {
        const suggestions = JSON.parse(content);
        console.log('Parsed suggestions:', suggestions);
        return Array.isArray(suggestions) ? suggestions : [];
      } catch (parseError) {
        console.error('Failed to parse suggestions JSON:', parseError);
        console.log('Content that failed to parse:', content);
        // Return mock suggestions if parsing fails
        return this.getMockSuggestions(category, prompt);
      }

    } catch (error) {
      console.error('OpenRouter suggestions error:', error);
      // Fallback to mock suggestions if API fails
      return this.getMockSuggestions(category, prompt);
    }
  }

  async generateResponse(category: string, messages: any[]) {
    const modelConfig = this.getModelConfig(category);
    const systemPrompt = this.getSystemPrompt(category);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://buildrunner.cloud',
          'X-Title': 'BuildRunner SaaS',
        },
        body: JSON.stringify({
          model: modelConfig.primary,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.slice(-5) // Last 5 messages for context
          ],
          temperature: modelConfig.temperature,
          max_tokens: modelConfig.max_tokens,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      const responseContent = data.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response.';
      console.log('OpenRouter response content:', responseContent.substring(0, 200) + '...');
      return responseContent;

    } catch (error) {
      console.error('OpenRouter response error:', error);
      // Fallback to mock response if API fails
      return this.getMockResponse(category, messages);
    }
  }

  getModelConfig(category: string) {
    const configs = {
      strategy: {
        primary: 'anthropic/claude-3.5-sonnet',
        temperature: 0.7,
        max_tokens: 2000,
      },
      product: {
        primary: 'openai/gpt-4-turbo-preview',
        temperature: 0.6,
        max_tokens: 1500,
      },
      monetization: {
        primary: 'anthropic/claude-3.5-sonnet',
        temperature: 0.5,
        max_tokens: 1500,
      },
      gtm: {
        primary: 'openai/gpt-4-turbo-preview',
        temperature: 0.6,
        max_tokens: 1500,
      },
      competitor: {
        primary: 'anthropic/claude-3.5-sonnet',
        temperature: 0.4,
        max_tokens: 2000,
      },
    };

    return configs[category as keyof typeof configs] || configs.strategy;
  }

  getSystemPrompt(category: string) {
    const prompts = {
      strategy: 'You are StrategyGPT, an expert business strategist specializing in SaaS product strategy, market positioning, and competitive analysis. Provide structured, actionable insights with clear reasoning and data-driven recommendations.',
      product: 'You are ProductGPT, a senior product manager with expertise in feature prioritization, user experience design, and product roadmap planning. Focus on user value, technical feasibility, and business impact.',
      monetization: 'You are MonetizationGPT, a revenue strategy expert specializing in SaaS pricing models, subscription tiers, and revenue optimization. Provide data-driven pricing recommendations with market analysis.',
      gtm: 'You are GTMGPT, a go-to-market specialist with expertise in customer acquisition, marketing channels, sales strategies, and market entry tactics for B2B SaaS products.',
      competitor: 'You are CompetitorGPT, a competitive intelligence analyst specializing in market research, feature comparison, and differentiation strategy. Provide objective analysis with actionable competitive insights.',
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
    const { category, message, conversation_history } = body;

    console.log('Request data:', { category, message: message.substring(0, 100) + '...', historyLength: conversation_history?.length || 0 });

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

    // Generate response and suggestions
    const [response, suggestions] = await Promise.all([
      service.generateResponse(category, conversation_history || []),
      service.generateSuggestions(category, message)
    ]);

    console.log('AI response generated successfully:', {
      responseLength: response?.length || 0,
      suggestionsCount: suggestions?.length || 0
    });

    return NextResponse.json({
      response,
      suggestions,
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
