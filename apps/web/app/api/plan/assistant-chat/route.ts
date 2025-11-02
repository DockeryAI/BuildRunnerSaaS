import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, technologies } = body;

    // Get API keys from headers or environment
    const apiKeysHeader = request.headers.get('x-api-keys');
    const apiKeys = apiKeysHeader ? JSON.parse(apiKeysHeader) : {};

    const openrouterKey = apiKeys.openrouter || process.env.OPENROUTER_API_KEY;

    if (!openrouterKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 400 }
      );
    }

    // Build context about the technologies
    let techContext = '';
    if (technologies && technologies.length > 0) {
      techContext = '\n\nTechnologies in the current project plan:\n';
      technologies.forEach((tech: any) => {
        techContext += `- ${tech.name} (${tech.category}, difficulty: ${tech.difficulty}): ${tech.reasoning}\n`;
        if (tech.signupUrl) {
          techContext += `  Signup: ${tech.signupUrl}\n`;
        }
        if (tech.setupGuideUrl) {
          techContext += `  Setup Guide: ${tech.setupGuideUrl}\n`;
        }
      });
    }

    // System prompt for the assistant
    const systemPrompt = `You are a helpful project setup assistant for BuildRunner SaaS. Your role is to help users:

1. Get API keys for the services in their project plan
2. Understand how to set up and configure different technologies
3. Find easier alternatives to complex integrations
4. Answer questions about the project plan and recommended technologies

Core Principles:
- Always suggest the EASIEST way to achieve their goals
- For advanced/complex services, suggest simpler alternatives
- Provide step-by-step guidance for getting API keys
- Be encouraging and supportive for non-technical users
- Reference the specific technologies in their plan when relevant
- Keep responses concise and actionable (2-4 paragraphs max)

Recommended Alternatives:
- For AI/LLM: Always suggest OpenRouter (supports multiple models with one key)
- For email: Suggest Resend over SendGrid (simpler setup)
- For database: Suggest Supabase (includes auth, storage, and API)
- For email/calendar: Suggest Gmail API over Microsoft Graph (easier for beginners)
- For deployment: Suggest Vercel or Railway (simple setup, free tiers)

${techContext}

Be friendly, helpful, and concise. Always prioritize simplicity and ease of use.`;

    // Call OpenRouter API with Claude 3.5 Sonnet for good conversational quality
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://buildrunner.cloud',
        'X-Title': 'BuildRunner SaaS - Plan Assistant',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet', // Good balance of quality and speed for support chat
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          ...messages,
        ],
        temperature: 0.7, // Conversational but focused
        max_tokens: 800, // Keep responses concise
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to get response from AI' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error('No response from AI');
    }

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error('Error in assistant chat:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process chat' },
      { status: 500 }
    );
  }
}
