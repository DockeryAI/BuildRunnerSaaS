/**
 * Preview Chat API
 * Handles contextual chat messages during preview
 */

import { NextRequest, NextResponse } from 'next/server';
import { ClaudeCLIEngine } from '@/lib/claude-cli-engine';
import { CodeChangeParser } from '@/lib/code-change-parser';
import * as path from 'path';

// In-memory storage for build sessions (replace with Redis in production)
const buildSessions = new Map<string, ClaudeCLIEngine>();

export async function POST(request: NextRequest) {
  try {
    const { buildId, message, context } = await request.json();

    if (!buildId || !message) {
      return NextResponse.json(
        { error: 'buildId and message are required' },
        { status: 400 }
      );
    }

    // Get or create Claude engine for this build
    let claudeEngine = buildSessions.get(buildId);
    if (!claudeEngine) {
      // Initialize Claude engine
      claudeEngine = new ClaudeCLIEngine({
        projectId: buildId,
        projectName: context?.projectName || 'preview-project',
        projectPath: context?.projectPath || path.join(process.env.HOME || '~', 'Projects', buildId),
        model: 'sonnet',
        usePersistentSessions: true
      });
      buildSessions.set(buildId, claudeEngine);
    }

    // Build context-aware prompt
    const prompt = buildChatPrompt(message, context);

    // Execute with Claude
    const response = await claudeEngine.executeTask({
      id: `chat-${Date.now()}`,
      type: 'component',
      description: 'Preview chat interaction',
      prompt,
      priority: 5,
      dependencies: [],
      estimatedComplexity: 'low',
      status: 'pending'
    });

    // Parse response for code changes
    const parser = new CodeChangeParser();
    const changes = parser.parse(response.output);

    // Return response
    return NextResponse.json({
      message: response.output,
      changes,
      requiresApproval: changes.length > 0
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Chat request failed', details: String(error) },
      { status: 500 }
    );
  }
}

function buildChatPrompt(userMessage: string, context: any): string {
  return `# Preview Chat Context

You are helping the user modify their application in real-time through a preview interface.

## Current State

${context?.route ? `**Route:** ${context.route}` : ''}
${context?.component ? `**Component:** ${context.component}` : ''}
${context?.viewport ? `**Viewport:** ${context.viewport}` : ''}

## User Message

"${userMessage}"

## Instructions

1. Understand what the user wants to change
2. Identify which files need modification
3. Provide specific code changes

If code changes are needed, format them as:

\`\`\`change
FILE: path/to/file.tsx
OLD:
[code to replace]
NEW:
[replacement code]
\`\`\`

Otherwise, provide a conversational response explaining what you'd do.

Keep responses concise and actionable.
`;
}
