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

interface Suggestion {
  id: string;
  type: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  citations: string[];
  section: string;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Parse JSON suggestion blocks from AI response
 */
function parseSuggestions(content: string): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const regex = /```json-suggestion\s*([\s\S]*?)```/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    try {
      const suggestionData = JSON.parse(match[1].trim());
      suggestions.push(suggestionData);
    } catch (e) {
      console.warn('Failed to parse suggestion JSON:', e);
    }
  }

  return suggestions;
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

Be insightful, direct, and actionable. Think strategically.

## PRD Suggestions Format

When suggesting items that should be added to the PRD (features, risks, objectives, etc.), format them as JSON blocks within your response:

\`\`\`json-suggestion
{
  "id": "unique_id",
  "type": "feature|risk|objective|scope|dependency|analytics|etc",
  "title": "Brief title",
  "shortDescription": "One-line description",
  "fullDescription": "Detailed explanation with reasoning",
  "citations": ["Source 1: Evidence", "Source 2: Study"],
  "section": "features|risks|objectives|scope|dependencies|analytics|non_functional|monetization|rollout|open_questions",
  "priority": "high|medium|low"
}
\`\`\`

Use this format when:
- User asks about what features to add
- Discussing risks or mitigations
- Suggesting objectives or success metrics
- Recommending dependencies or integrations
- Discussing analytics or monitoring
- Suggesting non-functional requirements

You can include multiple suggestions in a single response. Each should be in its own \`\`\`json-suggestion block.`;

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

    // Parse suggestions from response
    const suggestions = parseSuggestions(assistantMessage);

    return NextResponse.json({
      response: assistantMessage,
      suggestions,
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
