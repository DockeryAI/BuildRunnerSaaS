/**
 * Intent Router
 * Uses Claude to classify user intent and route to appropriate handler
 */

import Anthropic from '@anthropic-ai/sdk';
import { voiceContext, VoicePage } from './VoiceContext';

export interface Intent {
  action: string;
  page: VoicePage;
  params: Record<string, any>;
  confidence: number;
  response: string;
}

export interface IntentHandler {
  canHandle(intent: Intent): boolean;
  handle(intent: Intent): Promise<{ success: boolean; message: string; data?: any }>;
}

export class IntentRouter {
  private anthropic: Anthropic;
  private handlers: Map<string, IntentHandler> = new Map();

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  }

  /**
   * Register an intent handler
   */
  registerHandler(name: string, handler: IntentHandler): void {
    this.handlers.set(name, handler);
  }

  /**
   * Classify user intent using Claude
   */
  async classifyIntent(transcript: string): Promise<Intent> {
    const context = voiceContext.getContextForIntent();

    const prompt = `You are an AI assistant for BuildRunnerSaaS, a platform for AI-powered software development.

Current Context:
- Page: ${context.page}
- Project: ${context.project ? `${context.project.name || context.project.id}` : 'None'}
- Recent conversation:
${context.recentHistory
  .map((msg) => `  ${msg.role}: ${msg.content}`)
  .join('\n') || '  (No recent conversation)'}

User said: "${transcript}"

Analyze the user's intent and respond with a JSON object containing:
{
  "action": "<specific action to take>",
  "page": "<target page: projects|create|plan|workbench|coordination|cost|analytics|settings|templates>",
  "params": {<any parameters extracted from the command>},
  "confidence": <0-1 confidence score>,
  "response": "<friendly response to user>"
}

Available actions by page:

**projects**:
- create_project: Create a new project
- open_project: Open an existing project
- delete_project: Delete a project
- search_projects: Search for projects
- filter_projects: Filter projects by criteria

**create (PRD Builder)**:
- add_section: Add content to PRD section
- generate_prd: Generate PRD content
- edit_section: Edit PRD section
- read_back: Read back PRD content
- save_prd: Save PRD
- brainstorm: Start brainstorming session

**plan**:
- view_timeline: Show project timeline
- add_milestone: Add a new milestone
- mark_complete: Mark item as complete
- reorder: Reorder plan items
- estimate: Update time estimates

**workbench**:
- start_build: Start building
- pause_build: Pause the build
- view_progress: Check build progress
- inspect_component: View component details
- test: Run tests
- deploy: Deploy the build

**coordination**:
- view_consensus: Show agent consensus
- query_agent: Ask a specific agent
- vote: Vote on a decision

**cost**:
- view_spend: Show spending
- set_budget: Set budget alert
- optimize: Get optimization suggestions

**analytics**:
- view_metrics: Show analytics
- export: Export data

**settings**:
- update_setting: Change a setting
- add_api_key: Add API key

**templates**:
- search_templates: Find templates
- apply_template: Use a template

Consider:
1. The current page context
2. Recent conversation history
3. Natural language variations
4. Implied actions (e.g., "what's next" on plan page = view_timeline)

Respond ONLY with the JSON object, no other text.`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response format from Claude');
      }

      // Parse JSON response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Claude response');
      }

      const intent: Intent = JSON.parse(jsonMatch[0]);

      // Validate intent
      if (!intent.action || !intent.page || !intent.response) {
        throw new Error('Invalid intent structure');
      }

      return intent;
    } catch (error) {
      console.error('Failed to classify intent:', error);

      // Fallback intent
      return {
        action: 'unknown',
        page: context.page,
        params: {},
        confidence: 0,
        response: "I'm sorry, I didn't quite understand that. Could you rephrase?",
      };
    }
  }

  /**
   * Route intent to appropriate handler
   */
  async routeIntent(intent: Intent): Promise<{ success: boolean; message: string; data?: any }> {
    // Find handler for this intent
    for (const [name, handler] of this.handlers.entries()) {
      if (handler.canHandle(intent)) {
        console.log(`Routing intent to handler: ${name}`);
        return await handler.handle(intent);
      }
    }

    // No handler found
    console.warn(`No handler found for intent:`, intent);
    return {
      success: false,
      message: "I understand what you want, but I'm not sure how to do that yet. This feature is coming soon!",
    };
  }

  /**
   * Process voice command end-to-end
   */
  async processCommand(
    transcript: string
  ): Promise<{ intent: Intent; result: { success: boolean; message: string; data?: any } }> {
    // Add to conversation history
    voiceContext.addUserMessage(transcript);

    // Classify intent
    const intent = await this.classifyIntent(transcript);

    // Route to handler
    const result = await this.routeIntent(intent);

    // Add response to history
    voiceContext.addAssistantMessage(result.message);

    return { intent, result };
  }
}
