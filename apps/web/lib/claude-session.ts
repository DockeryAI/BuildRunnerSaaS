import { EventEmitter } from 'events';
import { spawn, ChildProcess } from 'child_process';
import { BuildTask } from './task-list-generator-v2';
import { BuildContext } from './claude-cli-engine';

export interface ClaudeSessionConfig {
  projectPath: string;
  model?: string;
  sessionId: string;
}

export interface ClaudeSessionMetrics {
  sessionId: string;
  tasksExecuted: number;
  successfulTasks: number;
  failedTasks: number;
  totalUptime: number;
  lastHeartbeat: number;
  avgResponseTime: number;
  isHealthy: boolean;
}

/**
 * Persistent Claude CLI Session
 *
 * Wraps a long-running Claude CLI process that can execute multiple tasks
 * without restarting. Includes health monitoring and task isolation.
 */
export class ClaudeSession extends EventEmitter {
  private config: ClaudeSessionConfig;
  private process: ChildProcess | null = null;
  private currentOutput: string = '';
  private isActive: boolean = false;
  private currentlyExecuting: boolean = false; // Track if task is actively executing
  private metrics: {
    tasksExecuted: number;
    successfulTasks: number;
    failedTasks: number;
    startTime: number;
    lastHeartbeat: number;
    responseTimeHistory: number[];
  };

  constructor(config: ClaudeSessionConfig) {
    super();
    this.config = {
      model: 'sonnet',
      ...config
    };
    this.metrics = {
      tasksExecuted: 0,
      successfulTasks: 0,
      failedTasks: 0,
      startTime: Date.now(),
      lastHeartbeat: Date.now(),
      responseTimeHistory: []
    };
  }

  /**
   * Initialize and start the persistent Claude CLI session
   */
  async initialize(): Promise<void> {
    if (this.isActive) {
      throw new Error('Session already initialized');
    }

    this.emit('log', {
      level: 'info',
      message: `🚀 Initializing persistent Claude session: ${this.config.sessionId}`
    });

    try {
      // Spawn Claude CLI process in interactive mode
      this.process = spawn('claude', ['--model', this.config.model || 'sonnet'], {
        cwd: this.config.projectPath,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          TERM: 'xterm-256color'
        }
      });

      // Set up event handlers
      this.setupProcessHandlers();

      this.isActive = true;
      this.metrics.lastHeartbeat = Date.now();

      this.emit('session:initialized', { sessionId: this.config.sessionId });
      this.emit('log', {
        level: 'success',
        message: `✅ Claude session initialized: ${this.config.sessionId}`
      });

    } catch (error) {
      this.emit('session:failed', { sessionId: this.config.sessionId, error });
      throw error;
    }
  }

  /**
   * Execute a task using this persistent session
   */
  async executeTask(task: BuildTask, context: BuildContext): Promise<string> {
    if (!this.isActive || !this.process) {
      throw new Error('Session not initialized or terminated');
    }

    this.emit('log', {
      level: 'info',
      message: `🔨 [Session ${this.config.sessionId}] Executing task: ${task.description}`
    });

    const startTime = Date.now();
    this.currentlyExecuting = true; // Mark as actively executing

    try {
      // Build task prompt with explicit task boundary
      const prompt = this.buildIsolatedTaskPrompt(task, context);

      // Send prompt to Claude session
      this.currentOutput = '';
      await this.sendToSession(prompt);

      // Wait for task completion (monitor output for completion markers)
      const output = await this.waitForTaskCompletion();

      // Record metrics
      const responseTime = Date.now() - startTime;
      this.currentlyExecuting = false; // Task completed
      this.recordSuccess(responseTime);

      this.emit('log', {
        level: 'success',
        message: `✅ [Session ${this.config.sessionId}] Task completed in ${responseTime}ms`
      });

      return output;

    } catch (error) {
      this.currentlyExecuting = false; // Task failed, no longer executing
      this.recordFailure();
      this.emit('log', {
        level: 'error',
        message: `❌ [Session ${this.config.sessionId}] Task failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      throw error;
    }
  }

  /**
   * Health check - verify session is responsive
   */
  async ping(): Promise<{ success: boolean; responseTime: number }> {
    if (!this.isActive || !this.process) {
      return { success: false, responseTime: -1 };
    }

    const startTime = Date.now();

    try {
      // Send simple ping command
      await this.sendToSession('Respond with OK');

      // Wait for response (with timeout)
      const response = await this.waitForResponse(5000);

      const responseTime = Date.now() - startTime;
      this.metrics.lastHeartbeat = Date.now();

      return { success: response.includes('OK'), responseTime };

    } catch (error) {
      return { success: false, responseTime: Date.now() - startTime };
    }
  }

  /**
   * Check if session is healthy
   */
  isHealthy(): boolean {
    // Debug: Log the check
    const debugInfo = {
      sessionId: this.config.sessionId,
      isActive: this.isActive,
      hasProcess: this.process !== null,
      currentlyExecuting: this.currentlyExecuting,
      tasksExecuted: this.metrics.tasksExecuted
    };

    if (!this.isActive || !this.process) {
      this.emit('log', {
        level: 'debug',
        message: `❌ Session ${this.config.sessionId} unhealthy: isActive=${this.isActive}, hasProcess=${this.process !== null}`
      });
      return false;
    }

    // If currently executing a task, consider the session healthy
    // (tasks can take 30+ seconds, which is expected)
    if (this.currentlyExecuting) {
      return true;
    }

    // For sessions that have never executed a task (e.g., standby sessions),
    // just check if the process is still active. No heartbeat check needed
    // since idle sessions don't update their heartbeat.
    if (this.metrics.tasksExecuted === 0) {
      const healthy = this.isActive && this.process !== null;
      this.emit('log', {
        level: 'debug',
        message: `✅ Idle session ${this.config.sessionId} health: ${healthy} (isActive=${this.isActive}, hasProcess=${this.process !== null})`
      });
      return healthy;
    }

    // Check if last heartbeat was recent (for sessions that have been used)
    const timeSinceHeartbeat = Date.now() - this.metrics.lastHeartbeat;
    if (timeSinceHeartbeat > 60000) { // 60 seconds
      return false;
    }

    // Check average response time (only when not actively executing)
    const avgResponseTime = this.getAverageResponseTime();
    if (avgResponseTime > 15000) { // 15 seconds
      return false;
    }

    return true;
  }

  /**
   * Get session metrics
   */
  getMetrics(): ClaudeSessionMetrics {
    return {
      sessionId: this.config.sessionId,
      tasksExecuted: this.metrics.tasksExecuted,
      successfulTasks: this.metrics.successfulTasks,
      failedTasks: this.metrics.failedTasks,
      totalUptime: Date.now() - this.metrics.startTime,
      lastHeartbeat: this.metrics.lastHeartbeat,
      avgResponseTime: this.getAverageResponseTime(),
      isHealthy: this.isHealthy()
    };
  }

  /**
   * Terminate the session
   */
  async terminate(): Promise<void> {
    if (this.process) {
      this.emit('log', {
        level: 'info',
        message: `🛑 Terminating Claude session: ${this.config.sessionId}`
      });

      this.process.kill('SIGTERM');
      this.process = null;
      this.isActive = false;

      this.emit('session:terminated', { sessionId: this.config.sessionId });
    }
  }

  /**
   * Build task prompt with explicit isolation boundaries
   */
  private buildIsolatedTaskPrompt(task: BuildTask, context: BuildContext): string {
    return `
=== TASK BOUNDARY ===
=== NEW TASK: ${task.id} ===

IMPORTANT: This is a new task. Discard all context from previous tasks.

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

Start working on this task now. When complete, respond with "TASK_COMPLETE: ${task.id}"
`;
  }

  /**
   * Send input to Claude session
   */
  private async sendToSession(input: string): Promise<void> {
    if (!this.process || !this.process.stdin) {
      throw new Error('Session stdin not available');
    }

    return new Promise((resolve, reject) => {
      this.process!.stdin!.write(input + '\n', (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  /**
   * Wait for task completion marker
   */
  private async waitForTaskCompletion(): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Task execution timeout'));
      }, 600000); // 10 minute timeout

      const outputHandler = (data: string) => {
        this.currentOutput += data;

        // Check for completion marker
        if (this.currentOutput.includes('TASK_COMPLETE:')) {
          clearTimeout(timeout);
          this.process?.stdout?.off('data', outputHandler);
          resolve(this.currentOutput);
        }
      };

      if (this.process?.stdout) {
        this.process.stdout.on('data', outputHandler);
      } else {
        clearTimeout(timeout);
        reject(new Error('Session stdout not available'));
      }
    });
  }

  /**
   * Wait for response with timeout
   */
  private async waitForResponse(timeoutMs: number): Promise<string> {
    return new Promise((resolve, reject) => {
      let output = '';
      const timeout = setTimeout(() => {
        this.process?.stdout?.off('data', outputHandler);
        reject(new Error('Response timeout'));
      }, timeoutMs);

      const outputHandler = (data: Buffer) => {
        output += data.toString();
        // Assume we got a response after any output
        clearTimeout(timeout);
        this.process?.stdout?.off('data', outputHandler);
        resolve(output);
      };

      if (this.process?.stdout) {
        this.process.stdout.on('data', outputHandler);
      } else {
        clearTimeout(timeout);
        reject(new Error('Session stdout not available'));
      }
    });
  }

  /**
   * Set up process event handlers
   */
  private setupProcessHandlers(): void {
    if (!this.process) return;

    // Capture stdout
    if (this.process.stdout) {
      this.process.stdout.on('data', (data) => {
        const chunk = data.toString();
        this.emit('output', { sessionId: this.config.sessionId, chunk });
      });
    }

    // Capture stderr
    if (this.process.stderr) {
      this.process.stderr.on('data', (data) => {
        const chunk = data.toString();
        this.emit('error', { sessionId: this.config.sessionId, chunk });
      });
    }

    // Handle process exit
    this.process.on('close', (code) => {
      this.isActive = false;
      this.emit('session:closed', { sessionId: this.config.sessionId, code });
    });

    // Handle process error
    this.process.on('error', (error) => {
      this.isActive = false;
      this.emit('session:error', { sessionId: this.config.sessionId, error });
    });
  }

  /**
   * Record successful task execution
   */
  private recordSuccess(responseTime: number): void {
    this.metrics.tasksExecuted++;
    this.metrics.successfulTasks++;
    this.metrics.responseTimeHistory.push(responseTime);

    // Keep only last 10 response times
    if (this.metrics.responseTimeHistory.length > 10) {
      this.metrics.responseTimeHistory.shift();
    }

    this.metrics.lastHeartbeat = Date.now();
  }

  /**
   * Record failed task execution
   */
  private recordFailure(): void {
    this.metrics.tasksExecuted++;
    this.metrics.failedTasks++;
  }

  /**
   * Get average response time
   */
  private getAverageResponseTime(): number {
    if (this.metrics.responseTimeHistory.length === 0) return 0;

    const sum = this.metrics.responseTimeHistory.reduce((a, b) => a + b, 0);
    return sum / this.metrics.responseTimeHistory.length;
  }
}
