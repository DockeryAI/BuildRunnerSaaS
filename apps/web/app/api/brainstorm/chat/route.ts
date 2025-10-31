import { NextRequest, NextResponse } from 'next/server';

// Mock OpenRouter service for development
class MockOpenRouterService {
  async generateSuggestions(category: string, prompt: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockSuggestions = [
      {
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Suggestion 1`,
        summary: `This is a mock suggestion for ${category} based on your prompt: "${prompt.substring(0, 50)}..."`,
        category,
        impact_score: Math.floor(Math.random() * 4) + 7, // 7-10
        confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
        reasoning: `This suggestion addresses key ${category} considerations and aligns with best practices in the industry.`,
        implementation_effort: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        dependencies: [`Dependency for ${category}`, 'Market research'],
        metrics: [`${category} success metric`, 'User engagement'],
        risks: [`Potential ${category} risk`, 'Market competition'],
      },
      {
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Suggestion 2`,
        summary: `Another strategic recommendation for ${category} optimization and growth.`,
        category,
        impact_score: Math.floor(Math.random() * 4) + 6, // 6-9
        confidence: Math.random() * 0.4 + 0.6, // 0.6-1.0
        reasoning: `This approach leverages current market trends and addresses user pain points effectively.`,
        implementation_effort: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        dependencies: [`Technical requirement for ${category}`],
        metrics: [`Performance indicator for ${category}`],
        risks: [`Implementation risk for ${category}`],
      }
    ];
    
    return mockSuggestions;
  }
  
  async generateResponse(category: string, messages: any[]) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const lastMessage = messages[messages.length - 1]?.content || '';
    
    const responses = {
      strategy: `Great question about strategy! Based on your query "${lastMessage.substring(0, 100)}...", I recommend focusing on market differentiation and value proposition clarity. Consider these key strategic elements...`,
      product: `For product development, your question "${lastMessage.substring(0, 100)}..." touches on important UX and feature considerations. I suggest prioritizing user value and technical feasibility...`,
      monetization: `Regarding monetization strategy for "${lastMessage.substring(0, 100)}...", consider a freemium model with clear value tiers. Focus on usage-based pricing that scales with customer success...`,
      gtm: `For go-to-market strategy around "${lastMessage.substring(0, 100)}...", I recommend a product-led growth approach with strong developer community engagement...`,
      competitor: `In terms of competitive analysis for "${lastMessage.substring(0, 100)}...", focus on identifying unique differentiators and market gaps that you can exploit...`
    };
    
    return responses[category as keyof typeof responses] || `Thank you for your question about ${category}. Let me provide some insights based on current best practices and market trends...`;
  }
}

const mockService = new MockOpenRouterService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, message, conversation_history } = body;
    
    if (!category || !message) {
      return NextResponse.json(
        { error: 'Category and message are required' },
        { status: 400 }
      );
    }
    
    // Generate response and suggestions
    const [response, suggestions] = await Promise.all([
      mockService.generateResponse(category, conversation_history || []),
      mockService.generateSuggestions(category, message)
    ]);
    
    return NextResponse.json({
      response,
      suggestions,
      category,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Error in brainstorm chat:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
