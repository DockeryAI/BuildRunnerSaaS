import { NextRequest, NextResponse } from 'next/server';

/**
 * Oracle Chat API - Opus 4.1 via OpenRouter
 *
 * Provides strategic AI assistance contextually aware of the current project.
 */

interface Message {
  role: string;
  content: string;
}

interface ChatRequest {
  messages: Message[];
  projectContext?: {
    projectName?: string;
    projectId?: string;
    currentPage?: string;
    prdContent?: string;
    buildStatus?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { messages, projectContext } = await request.json() as ChatRequest;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENROUTER_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Build context-aware system prompt
    let systemContent = `You are BuildRunner Oracle, a strategic AI assistant helping with project development and planning.

You have deep knowledge of product development, software architecture, and project management.

You help users make strategic decisions about:
- Product requirements and features
- Architecture decisions
- Build planning and priorities
- Bug triage and feature requests
- Development workflow optimization

Be insightful, direct, and actionable. Think strategically.`;

    // Add project context if available
    if (projectContext) {
      systemContent += `\n\n## Current Project Context\n\n`;

      if (projectContext.projectName) {
        systemContent += `**Project:** ${projectContext.projectName}\n`;
      }

      if (projectContext.currentPage) {
        systemContent += `**Current Page:** ${projectContext.currentPage}\n`;
      }

      if (projectContext.prdContent) {
        systemContent += `\n**Product Requirements Document:**\n\`\`\`\n${projectContext.prdContent.substring(0, 5000)}\n\`\`\`\n`;
      }

      if (projectContext.buildStatus) {
        systemContent += `\n**Build Status:**\n${projectContext.buildStatus}\n`;
      }
    }

    // Prepare messages with system prompt
    const messagesWithSystem = [
      { role: 'system', content: systemContent },
      ...messages
    ];

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': request.headers.get('referer') || 'http://localhost:3001',
        'X-Title': 'BuildRunner Oracle'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-opus-4.1',
        messages: messagesWithSystem,
        max_tokens: 16384,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      return NextResponse.json(
        { error: `OpenRouter API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({
      response: assistantMessage,
      usage: data.usage
    });

  } catch (error) {
    console.error('Oracle chat error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get response from Oracle',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
