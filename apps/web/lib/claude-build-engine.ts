import Anthropic from '@anthropic-ai/sdk';
import { EventEmitter } from 'events';
import { BuildTask } from './task-list-generator';
import fs from 'fs/promises';
import path from 'path';

export interface ClaudeBuildConfig {
  projectId: string;
  projectName: string;
  projectPath: string;
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface BuildContext {
  buildDoc: string;
  tasks: string;
  designSystem: string;
  componentCatalog: string;
  handoff?: string;
  relevantFiles?: string[];
}

/**
 * Claude CLI Build Engine
 * Direct integration with Claude API for high-quality code generation
 */
export class ClaudeBuildEngine extends EventEmitter {
  private anthropic: Anthropic;
  private config: ClaudeBuildConfig;
  private conversationHistory: Anthropic.MessageParam[] = [];

  constructor(config: ClaudeBuildConfig) {
    super();

    this.config = {
      model: 'claude-sonnet-4-20250514',
      maxTokens: 32000,
      temperature: 0.3,
      ...config
    };

    // Initialize Anthropic client
    const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not found in environment or config');
    }

    this.anthropic = new Anthropic({ apiKey });

    this.emit('log', { level: 'info', message: '✅ Claude Build Engine initialized' });
  }

  /**
   * Execute a single task with Claude
   */
  async executeTask(task: BuildTask, context: BuildContext): Promise<{
    success: boolean;
    output: string;
    filesCreated: string[];
    error?: Error;
  }> {
    this.emit('log', { level: 'info', message: `🔨 Executing task: ${task.title}` });
    this.emit('task:started', { task });

    try {
      // Build prompt with full context
      const prompt = this.buildTaskPrompt(task, context);

      this.emit('claude:prompt', {
        task: task.id,
        promptLength: prompt.length,
        truncated: prompt.substring(0, 500) + '...'
      });

      // Call Claude with streaming
      const response = await this.callClaudeStreaming(prompt);

      // Parse response and extract files
      const filesCreated = await this.processClaudeResponse(response, task);

      this.emit('task:completed', { task, filesCreated });
      this.emit('log', { level: 'success', message: `✅ Task completed: ${task.title}` });

      return {
        success: true,
        output: response,
        filesCreated
      };

    } catch (error) {
      const err = error as Error;
      this.emit('task:failed', { task, error: err });
      this.emit('log', { level: 'error', message: `❌ Task failed: ${err.message}` });

      return {
        success: false,
        output: '',
        filesCreated: [],
        error: err
      };
    }
  }

  /**
   * Build comprehensive prompt for Claude
   */
  private buildTaskPrompt(task: BuildTask, context: BuildContext): string {
    const prompt = `You are an expert full-stack developer building a production-ready application.

# PROJECT CONTEXT

${context.buildDoc}

# DESIGN SYSTEM

${context.designSystem}

# AVAILABLE COMPONENTS

${context.componentCatalog}

# CURRENT TASK

**ID:** ${task.id}
**Type:** ${task.type}
**Title:** ${task.title}
**Description:** ${task.description}

${task.expectedFile ? `**Expected File:** ${task.expectedFile}` : ''}
${task.endpoint ? `**Endpoint:** ${task.endpoint}` : ''}
${task.componentName ? `**Component Name:** ${task.componentName}` : ''}

# DEPENDENCIES COMPLETED

${task.dependencies.length > 0 ? task.dependencies.join(', ') : 'None'}

${context.handoff ? `\n# HANDOFF NOTES\n\n${context.handoff}\n` : ''}

# REQUIREMENTS

1. Generate production-ready, type-safe code
2. Follow the design system exactly (colors, typography, spacing)
3. Use Tailwind 4 CSS-first approach
4. Use shadcn/ui components when available
5. Include proper TypeScript types
6. Add error handling and loading states
7. Make it beautiful and polished (Linear/Stripe quality)
8. Follow Next.js 14 App Router patterns
9. Use Server Components when possible
10. Include JSDoc comments for functions

# OUTPUT FORMAT

Provide your response in this exact format:

\`\`\`typescript
// File: [file path]
[complete file contents]
\`\`\`

If multiple files are needed, use multiple code blocks.

Begin implementation:`;

    return prompt;
  }

  /**
   * Call Claude with streaming support
   */
  private async callClaudeStreaming(prompt: string): Promise<string> {
    let fullResponse = '';

    this.emit('log', { level: 'info', message: '🤖 Calling Claude...' });

    const stream = await this.anthropic.messages.create({
      model: this.config.model!,
      max_tokens: this.config.maxTokens!,
      temperature: this.config.temperature,
      messages: [
        ...this.conversationHistory,
        {
          role: 'user',
          content: prompt
        }
      ],
      stream: true
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const text = event.delta.text;
        fullResponse += text;

        // Emit streaming chunks to UI
        this.emit('claude:stream', {
          chunk: text,
          accumulated: fullResponse.length
        });
      }
    }

    // Store in conversation history for context continuity
    this.conversationHistory.push(
      { role: 'user', content: prompt },
      { role: 'assistant', content: fullResponse }
    );

    // Trim history if too large (keep last 10 exchanges)
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }

    this.emit('log', {
      level: 'success',
      message: `✅ Claude response received (${fullResponse.length} chars)`
    });

    return fullResponse;
  }

  /**
   * Process Claude's response and extract/write files
   */
  private async processClaudeResponse(response: string, task: BuildTask): Promise<string[]> {
    const filesCreated: string[] = [];

    // Extract code blocks with file paths
    const codeBlockRegex = /```(\w+)?\n\/\/ File: (.+?)\n([\s\S]+?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(response)) !== null) {
      const [, language, filePath, content] = match;

      const fullPath = path.join(this.config.projectPath, filePath.trim());

      // Ensure directory exists
      await fs.mkdir(path.dirname(fullPath), { recursive: true });

      // Write file
      await fs.writeFile(fullPath, content.trim());

      filesCreated.push(filePath.trim());

      this.emit('claude:file_written', { path: filePath, size: content.length });
      this.emit('log', {
        level: 'success',
        message: `📄 Created: ${filePath}`
      });
    }

    if (filesCreated.length === 0) {
      this.emit('log', {
        level: 'warning',
        message: '⚠️  No files extracted from Claude response. Checking for alternate format...'
      });

      // Try alternate format without "File:" comment
      const altRegex = /```(\w+)?\n(.+?\.\w+)\n([\s\S]+?)```/g;
      while ((match = altRegex.exec(response)) !== null) {
        const [, language, filePath, content] = match;

        if (filePath.includes('/')) {
          const fullPath = path.join(this.config.projectPath, filePath.trim());
          await fs.mkdir(path.dirname(fullPath), { recursive: true });
          await fs.writeFile(fullPath, content.trim());
          filesCreated.push(filePath.trim());
          this.emit('log', { level: 'success', message: `📄 Created: ${filePath}` });
        }
      }
    }

    return filesCreated;
  }

  /**
   * Load context files for Claude
   */
  async loadContext(projectPath: string): Promise<BuildContext> {
    const buildRunnerDir = path.join(projectPath, '.buildrunner');

    const context: BuildContext = {
      buildDoc: await this.readFileOrEmpty(path.join(buildRunnerDir, 'BUILD_DOC.md')),
      tasks: await this.readFileOrEmpty(path.join(buildRunnerDir, 'TASKS.md')),
      designSystem: await this.readFileOrEmpty(path.join(buildRunnerDir, 'DESIGN_SYSTEM.md')),
      componentCatalog: await this.readFileOrEmpty(path.join(buildRunnerDir, 'COMPONENT_CATALOG.md')),
      handoff: await this.readFileOrEmpty(path.join(buildRunnerDir, 'HANDOFF.md'))
    };

    return context;
  }

  /**
   * Helper to read file or return empty string
   */
  private async readFileOrEmpty(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch {
      return '';
    }
  }

  /**
   * Reset conversation history (for new build)
   */
  resetConversation() {
    this.conversationHistory = [];
    this.emit('log', { level: 'info', message: '🔄 Conversation history reset' });
  }

  /**
   * Get conversation history for debugging
   */
  getConversationHistory() {
    return this.conversationHistory;
  }
}
