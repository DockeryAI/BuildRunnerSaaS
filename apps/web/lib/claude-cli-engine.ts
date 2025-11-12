import { EventEmitter } from 'events';
import { spawn, ChildProcess } from 'child_process';
import { BuildTask } from './task-list-generator';
import fs from 'fs/promises';
import path from 'path';

export interface ClaudeCLIConfig {
  projectId: string;
  projectName: string;
  projectPath: string;
  model?: string;
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
 * Uses actual Claude Code CLI for multi-turn conversations with tools
 *
 * This spawns the `claude` command and lets Claude use its full toolset:
 * - Read/Write/Edit files
 * - Bash commands
 * - Grep/search
 * - Multi-turn context-aware conversations
 */
export class ClaudeCLIEngine extends EventEmitter {
  private config: ClaudeCLIConfig;
  private claudeProcess: ChildProcess | null = null;
  private currentTaskOutput: string = '';

  constructor(config: ClaudeCLIConfig) {
    super();

    this.config = {
      model: 'sonnet',
      ...config
    };

    this.emit('log', { level: 'info', message: '✅ Claude CLI Engine initialized' });
  }

  /**
   * Execute a single task with Claude CLI
   * This spawns `claude` command and gives it full context + tools
   */
  async executeTask(task: BuildTask, context: BuildContext): Promise<{
    success: boolean;
    output: string;
    filesCreated: string[];
    error?: Error;
  }> {
    this.emit('log', { level: 'info', message: `🔨 Executing task with Claude CLI: ${task.title}` });
    this.emit('task:started', { task });

    try {
      // Build comprehensive prompt for Claude
      const prompt = this.buildTaskPrompt(task, context);

      // Write prompt to temp file
      const promptFile = path.join(this.config.projectPath, '.claude-task-prompt.md');
      await fs.writeFile(promptFile, prompt, 'utf-8');

      this.emit('log', {
        level: 'info',
        message: `📝 Task prompt written (${prompt.length} chars)`
      });

      // Spawn Claude CLI
      const output = await this.runClaudeCLI(prompt);

      // Parse output to find created files
      const filesCreated = await this.detectCreatedFiles(task);

      this.emit('task:completed', { task, filesCreated });
      this.emit('log', {
        level: 'success',
        message: `✅ Task completed: ${task.title} (${filesCreated.length} files)`
      });

      return {
        success: true,
        output,
        filesCreated
      };

    } catch (error) {
      const err = error as Error;
      this.emit('task:failed', { task, error: err });
      this.emit('log', { level: 'error', message: `❌ Task failed: ${err.message}` });

      return {
        success: false,
        output: this.currentTaskOutput,
        filesCreated: [],
        error: err
      };
    }
  }

  /**
   * Build comprehensive prompt for Claude CLI
   */
  private buildTaskPrompt(task: BuildTask, context: BuildContext): string {
    const prompt = `You are building a production-ready application using your full toolset.

# PROJECT CONTEXT

${context.buildDoc}

# DESIGN SYSTEM (MUST FOLLOW EXACTLY)

${context.designSystem}

# AVAILABLE COMPONENTS

${context.componentCatalog}

# YOUR TASK

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

1. **Use your tools** (Read, Write, Edit, Bash, Grep) to build this properly
2. **Follow the design system EXACTLY** - colors, typography, spacing must match
3. **Use Tailwind CSS classes** from the design system (bg-primary, text-foreground, etc.)
4. **Use shadcn/ui components** when available (Button, Card, Input, etc.)
5. **TypeScript strict mode** - proper types, no any
6. **Error handling & loading states** for all async operations
7. **Production quality** - Linear/Stripe/Vercel level polish

# IMPORTANT DESIGN STANDARDS

- Never use hardcoded colors (NO bg-blue-500) - always use design tokens (bg-primary)
- All spacing must use the design system scale (space-4, space-8, etc.)
- Use the specified fonts and typography scale
- Include hover states, focus states, and transitions
- Make it responsive (mobile-first)
- Add proper ARIA labels for accessibility

# YOUR APPROACH

1. Read any existing files you need for context
2. Create/edit the required files using Write/Edit tools
3. Ensure consistency with design system
4. Test mentally for edge cases
5. Commit with semantic message when done

Start working on this task now. Use your tools to build it properly.`;

    return prompt;
  }

  /**
   * Run Claude CLI with the prompt
   */
  private async runClaudeCLI(prompt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.currentTaskOutput = '';

      // Spawn claude command with the prompt
      // Using --model flag for model selection
      const args = ['--model', this.config.model || 'sonnet'];

      this.emit('log', {
        level: 'info',
        message: `🚀 Spawning: claude ${args.join(' ')}`
      });

      this.claudeProcess = spawn('claude', args, {
        cwd: this.config.projectPath,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          // Ensure Claude has proper environment
          TERM: 'xterm-256color'
        }
      });

      // Send prompt to stdin
      if (this.claudeProcess.stdin) {
        this.claudeProcess.stdin.write(prompt + '\n');
        this.claudeProcess.stdin.end();
      }

      // Capture stdout (Claude's output)
      if (this.claudeProcess.stdout) {
        this.claudeProcess.stdout.on('data', (data) => {
          const chunk = data.toString();
          this.currentTaskOutput += chunk;

          // Stream output to listeners
          this.emit('claude:output', { chunk });
        });
      }

      // Capture stderr (errors/warnings)
      if (this.claudeProcess.stderr) {
        this.claudeProcess.stderr.on('data', (data) => {
          const chunk = data.toString();
          this.emit('claude:error', { chunk });
        });
      }

      // Handle process completion
      this.claudeProcess.on('close', (code) => {
        if (code === 0) {
          this.emit('log', {
            level: 'success',
            message: `✅ Claude CLI completed successfully`
          });
          resolve(this.currentTaskOutput);
        } else {
          const error = new Error(`Claude CLI exited with code ${code}`);
          this.emit('log', {
            level: 'error',
            message: `❌ Claude CLI error: ${error.message}`
          });
          reject(error);
        }
      });

      // Handle errors
      this.claudeProcess.on('error', (error) => {
        this.emit('log', {
          level: 'error',
          message: `❌ Failed to spawn Claude CLI: ${error.message}`
        });
        reject(error);
      });
    });
  }

  /**
   * Detect files created/modified during task execution
   */
  private async detectCreatedFiles(task: BuildTask): Promise<string[]> {
    const filesCreated: string[] = [];

    // If task specifies expected file, check if it exists
    if (task.expectedFile) {
      const filePath = path.join(this.config.projectPath, task.expectedFile);
      try {
        await fs.access(filePath);
        filesCreated.push(task.expectedFile);
      } catch {
        // File doesn't exist yet
      }
    }

    // Could enhance this by tracking file system changes
    // For now, rely on expectedFile from task definition

    return filesCreated;
  }

  /**
   * Stop current Claude process
   */
  stop(): void {
    if (this.claudeProcess) {
      this.emit('log', { level: 'info', message: '🛑 Stopping Claude CLI process' });
      this.claudeProcess.kill();
      this.claudeProcess = null;
    }
  }

  /**
   * Execute all tasks sequentially
   */
  async executeAllTasks(tasks: BuildTask[], context: BuildContext): Promise<{
    success: boolean;
    results: Array<{
      task: BuildTask;
      success: boolean;
      filesCreated: string[];
    }>;
  }> {
    this.emit('log', {
      level: 'info',
      message: `🚀 Starting sequential execution of ${tasks.length} tasks`
    });

    const results = [];
    let allSuccess = true;

    for (const task of tasks) {
      const result = await this.executeTask(task, context);

      results.push({
        task,
        success: result.success,
        filesCreated: result.filesCreated
      });

      if (!result.success) {
        allSuccess = false;
        this.emit('log', {
          level: 'error',
          message: `❌ Task ${task.id} failed, stopping build`
        });
        break;
      }

      // Small delay between tasks
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return {
      success: allSuccess,
      results
    };
  }
}
