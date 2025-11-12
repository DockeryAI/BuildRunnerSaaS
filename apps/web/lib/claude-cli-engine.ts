import { EventEmitter } from 'events';
import { spawn, ChildProcess } from 'child_process';
import { BuildTask } from './task-list-generator-v2';
import { SessionPool } from './session-pool';
import { CircuitBreaker } from './circuit-breaker';
import fs from 'fs/promises';
import path from 'path';

export interface ClaudeCLIConfig {
  projectId: string;
  projectName: string;
  projectPath: string;
  model?: string;
  usePersistentSessions?: boolean; // Feature flag
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
  private contextCache: BuildContext | null = null; // In-memory context cache
  private contextCacheTime: number = 0; // Timestamp of last cache
  private sessionPool: SessionPool | null = null; // Persistent session pool
  private circuitBreaker: CircuitBreaker; // Failure detection and auto-degradation
  private usePersistentSessions: boolean;

  constructor(config: ClaudeCLIConfig) {
    super();

    this.config = {
      model: 'sonnet',
      ...config
    };

    this.usePersistentSessions = config.usePersistentSessions ?? false;

    // Initialize circuit breaker for graceful degradation
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 30000,
      windowSize: 10
    });

    this.emit('log', {
      level: 'info',
      message: `✅ Claude CLI Engine initialized (persistent sessions: ${this.usePersistentSessions ? 'enabled' : 'disabled'})`
    });
  }

  /**
   * Initialize session pool (call before executing tasks)
   * @param options Optional pool configuration (maxPoolSize, warmStandbyCount)
   */
  async initializeSessionPool(options?: { maxPoolSize?: number; warmStandbyCount?: number }): Promise<void> {
    if (!this.usePersistentSessions) {
      this.emit('log', {
        level: 'info',
        message: '⏭️  Persistent sessions disabled, skipping session pool initialization'
      });
      return;
    }

    if (this.sessionPool) {
      this.emit('log', {
        level: 'warn',
        message: '⚠️  Session pool already initialized'
      });
      return;
    }

    try {
      this.sessionPool = new SessionPool({
        projectPath: this.config.projectPath,
        model: this.config.model,
        maxPoolSize: options?.maxPoolSize ?? 3,
        warmStandbyCount: options?.warmStandbyCount ?? 1,
        healthCheckInterval: 30000
      });

      // Forward session pool events
      this.sessionPool.on('log', (data) => this.emit('log', data));
      this.sessionPool.on('session:error', (data) => this.emit('session:error', data));
      this.sessionPool.on('session:failover', (data) => this.emit('session:failover', data));

      await this.sessionPool.initialize();

      this.emit('log', {
        level: 'success',
        message: '✅ Session pool initialized and ready'
      });

    } catch (error) {
      this.emit('log', {
        level: 'error',
        message: `❌ Failed to initialize session pool: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      // Disable persistent sessions on initialization failure
      this.usePersistentSessions = false;
      this.circuitBreaker.open();
    }
  }

  /**
   * Shutdown session pool (call after build completes)
   */
  async shutdownSessionPool(): Promise<void> {
    if (this.sessionPool) {
      await this.sessionPool.shutdown();
      this.sessionPool = null;
      this.emit('log', {
        level: 'info',
        message: '✅ Session pool shutdown complete'
      });
    }
  }

  /**
   * Get session pool for parallel execution
   */
  getSessionPool(): SessionPool | null {
    return this.sessionPool;
  }

  /**
   * Check if task is critical (should always use fresh session)
   */
  private isCriticalTask(task: BuildTask): boolean {
    const criticalTypes = ['quality_gate', 'test', 'integration_test', 'e2e_test'];
    return criticalTypes.includes(task.type);
  }

  /**
   * Execute a single task with Claude CLI
   * Routes to persistent session or fresh session based on configuration and circuit breaker state
   */
  async executeTask(task: BuildTask, context: BuildContext): Promise<{
    success: boolean;
    output: string;
    filesCreated: string[];
    error?: Error;
  }> {
    this.emit('log', { level: 'info', message: `🔨 Executing task with Claude CLI: ${task.description}` });
    this.emit('task:started', { task });

    // Determine execution mode
    const shouldUsePersistentSession =
      this.usePersistentSessions &&
      this.circuitBreaker.canAttempt() &&
      !this.isCriticalTask(task) &&
      this.sessionPool !== null;

    if (shouldUsePersistentSession) {
      this.emit('log', {
        level: 'info',
        message: `♻️  Using persistent session for task: ${task.id}`
      });
      return await this.executeWithPersistentSession(task, context);
    } else {
      const reason = this.isCriticalTask(task)
        ? 'critical task'
        : this.circuitBreaker.getState() === 'OPEN'
        ? 'circuit breaker open'
        : 'persistent sessions disabled';

      this.emit('log', {
        level: 'info',
        message: `🆕 Using fresh session for task: ${task.id} (${reason})`
      });
      return await this.executeWithFreshSession(task, context);
    }
  }

  /**
   * Execute task using persistent session from pool
   */
  private async executeWithPersistentSession(task: BuildTask, context: BuildContext): Promise<{
    success: boolean;
    output: string;
    filesCreated: string[];
    error?: Error;
  }> {
    try {
      if (!this.sessionPool) {
        throw new Error('Session pool not initialized');
      }

      // Get healthy session from pool
      const session = await this.sessionPool.getHealthySession();

      // Execute task using persistent session
      const output = await session.executeTask(task, context);

      // Parse output to find created files
      const filesCreated = await this.detectCreatedFiles(task);

      // Record success in circuit breaker
      this.circuitBreaker.recordSuccess();

      this.emit('task:completed', { task, filesCreated });
      this.emit('log', {
        level: 'success',
        message: `✅ Task completed with persistent session: ${task.description} (${filesCreated.length} files)`
      });

      return {
        success: true,
        output,
        filesCreated
      };

    } catch (error) {
      const err = error as Error;

      // Record failure in circuit breaker
      this.circuitBreaker.recordFailure(err);

      this.emit('log', {
        level: 'warn',
        message: `⚠️  Persistent session failed, retrying with fresh session: ${err.message}`
      });

      // Fallback to fresh session
      return await this.executeWithFreshSession(task, context);
    }
  }

  /**
   * Execute task using fresh (per-task) Claude CLI session
   */
  private async executeWithFreshSession(task: BuildTask, context: BuildContext): Promise<{
    success: boolean;
    output: string;
    filesCreated: string[];
    error?: Error;
  }> {
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
        message: `✅ Task completed: ${task.description} (${filesCreated.length} files)`
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
**Description:** ${task.description}

${(task as any).expectedFile ? `**Expected File:** ${(task as any).expectedFile}` : ''}
${(task as any).endpoint ? `**Endpoint:** ${(task as any).endpoint}` : ''}
${(task as any).componentName ? `**Component Name:** ${(task as any).componentName}` : ''}

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
   * Load context files for Claude (with caching for performance)
   */
  async loadContext(projectPath: string): Promise<BuildContext> {
    const buildRunnerDir = path.join(projectPath, '.buildrunner');

    // Check if cache is still fresh (files haven't changed)
    const contextFiles = [
      'BUILD_DOC.md',
      'TASKS.md',
      'DESIGN_SYSTEM.md',
      'COMPONENT_CATALOG.md',
      'HANDOFF.md'
    ];

    const isCacheFresh = await this.isContextCacheFresh(buildRunnerDir, contextFiles);

    if (isCacheFresh && this.contextCache) {
      this.emit('log', {
        level: 'info',
        message: '⚡ Using cached context (no files changed)'
      });
      return this.contextCache;
    }

    // Cache miss or stale - reload context
    this.emit('log', {
      level: 'info',
      message: '📂 Loading fresh context from disk'
    });

    const context: BuildContext = {
      buildDoc: await this.readFileOrEmpty(path.join(buildRunnerDir, 'BUILD_DOC.md')),
      tasks: await this.readFileOrEmpty(path.join(buildRunnerDir, 'TASKS.md')),
      designSystem: await this.readFileOrEmpty(path.join(buildRunnerDir, 'DESIGN_SYSTEM.md')),
      componentCatalog: await this.readFileOrEmpty(path.join(buildRunnerDir, 'COMPONENT_CATALOG.md')),
      handoff: await this.readFileOrEmpty(path.join(buildRunnerDir, 'HANDOFF.md'))
    };

    // Update cache
    this.contextCache = context;
    this.contextCacheTime = Date.now();

    return context;
  }

  /**
   * Check if context cache is still fresh (files haven't changed since last load)
   */
  private async isContextCacheFresh(buildRunnerDir: string, files: string[]): Promise<boolean> {
    // No cache yet
    if (!this.contextCache || this.contextCacheTime === 0) {
      return false;
    }

    // Check if any context files were modified after cache time
    try {
      for (const file of files) {
        const filePath = path.join(buildRunnerDir, file);
        try {
          const stats = await fs.stat(filePath);
          const fileModTime = stats.mtimeMs;

          // If file was modified after cache, cache is stale
          if (fileModTime > this.contextCacheTime) {
            return false;
          }
        } catch {
          // File doesn't exist, skip
          continue;
        }
      }

      // All files are older than cache or don't exist - cache is fresh
      return true;
    } catch {
      // Error checking files - invalidate cache to be safe
      return false;
    }
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

      // Removed 1s delay between tasks for performance
    }

    return {
      success: allSuccess,
      results
    };
  }
}
