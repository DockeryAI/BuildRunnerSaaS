import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, pageContext, conversationHistory } = body;

    // Get API keys from headers
    const apiKeysHeader = request.headers.get('x-api-keys');
    const apiKeys = apiKeysHeader ? JSON.parse(apiKeysHeader) : {};

    // Use OpenRouter API key from header or fallback to environment variable
    const openrouterApiKey = apiKeys.openrouter || process.env.OPENROUTER_API_KEY;

    if (!openrouterApiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 400 }
      );
    }

    // Determine page-specific context
    let systemPrompt = 'You are Strategery, an AI assistant for the BuildRunner platform. ';

    if (pageContext?.includes('/create')) {
      systemPrompt += 'The user is currently on the PRD Builder page. Help them refine their Product Requirements Document, suggest features, and improve the product vision. You can help them add, modify, or remove sections from the PRD.';
    } else if (pageContext?.includes('/plan')) {
      systemPrompt += 'The user is on the Project Plan page. Help them with project milestones, timelines, dependencies, and architecture decisions.';
    } else if (pageContext?.includes('/workbench')) {
      systemPrompt += 'The user is on the Build Workbench. Help them with code architecture, build progress, testing strategies, and technical implementation.';
    } else if (pageContext?.includes('/settings')) {
      systemPrompt += 'The user is on the Settings page. Help them configure API keys, understand governance settings, and manage their account.';
    } else {
      systemPrompt += 'Help the user with general project strategy, feature planning, and navigating the BuildRunner platform.';
    }

    systemPrompt += '\n\nBe concise, actionable, and strategic. Focus on helping the user move forward with their project.';

    // Build conversation history for context
    const messages = [
      { role: 'system', content: systemPrompt },
      ...((conversationHistory || []).slice(-5).map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      }))),
      { role: 'user', content: message },
    ];

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://buildrunner.cloud',
        'X-Title': 'BuildRunner SaaS - Strategery Assistant',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to get AI response' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Error in strategery chat:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process chat' },
      { status: 500 }
    );
  }
}
