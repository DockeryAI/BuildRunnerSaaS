import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, content, projectId } = body;

    console.log(`[SOURCE OF TRUTH] Updating ${type} for project ${projectId}`);

    // Get API keys from headers
    const apiKeysHeader = request.headers.get('x-api-keys');
    const apiKeys = apiKeysHeader ? JSON.parse(apiKeysHeader) : {};

    if (!apiKeys.openrouter) {
      return NextResponse.json(
        { error: 'OpenRouter API key required' },
        { status: 400 }
      );
    }

    // Use AI to intelligently update the source of truth
    const updatePrompt = `You are updating the source of truth for a software project.

Type of update: ${type}
New content/feature: ${content}

Based on this, generate an updated section that should be added to the ${type === 'prd' ? 'PRD (Product Requirements Document)' : 'Build Plan'}.

Provide a concise, well-structured update that integrates this new content appropriately.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKeys.openrouter}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_APP_URL || '' : '',
        'X-Title': 'BuildRunner SaaS'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'user',
            content: updatePrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate update');
    }

    const data = await response.json();
    const updatedContent = data.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      updatedContent,
      type,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[SOURCE OF TRUTH] Error:', error);
    return NextResponse.json(
      { error: `Failed to update source of truth: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
