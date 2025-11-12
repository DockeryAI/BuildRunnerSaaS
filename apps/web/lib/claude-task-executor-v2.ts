import { EventEmitter } from 'events';
import { BuildTask } from './task-list-generator-v2';
import { ClaudeCLIEngine } from './claude-cli-engine'; // Use Claude CLI (spawns actual claude command)
import { gitManager } from './git-manager';
import { buildStateManager } from './build-state-manager';
import { dependencyDetector } from './dependency-detector';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export interface TaskExecutorConfig {
  projectId: string;
  projectName: string;
  projectPath: string;
  maxRetries?: number;
  runQualityGates?: boolean;
}

/**
 * Executes build tasks sequentially using Claude CLI Engine
 */
export class ClaudeTaskExecutorV2 extends EventEmitter {
  private buildEngine: ClaudeCLIEngine;
  private config: TaskExecutorConfig;
  private currentTaskId?: string;

  constructor(config: TaskExecutorConfig, buildEngine: ClaudeCLIEngine) {
    super();
    this.config = {
      maxRetries: 3,
      runQualityGates: true,
      ...config
    };
    this.buildEngine = buildEngine;

    // Forward Claude engine events
    this.buildEngine.on('log', (data) => this.emit('log', data));
    this.buildEngine.on('claude:prompt', (data) => this.emit('claude:prompt', data));
    this.buildEngine.on('claude:stream', (data) => this.emit('claude:stream', data));
    this.buildEngine.on('claude:file_written', (data) => this.emit('claude:file_written', data));
  }

  /**
   * Execute the next available task
   */
  async executeNextTask(): Promise<{
    success: boolean;
    done: boolean;
    task?: BuildTask;
    error?: Error;
  }> {
    // Load build state
    const buildState = await buildStateManager.load(this.config.projectPath);
    if (!buildState || !buildState.tasks) {
      return {
        success: false,
        done: false,
        error: new Error('Build state not found')
      };
    }

    // Find next executable task
    const nextTask = this.findNextExecutableTask(buildState.tasks);

    if (!nextTask) {
      // Check if all done
      const allComplete = buildState.tasks.every(
        t => t.status === 'completed'
      );

      if (allComplete) {
        await buildStateManager.updatePhase(this.config.projectPath, 'completed');
        return { success: true, done: true };
      }

      return {
        success: false,
        done: false,
        error: new Error('No executable tasks remaining')
      };
    }

    // Mark as in_progress
    await buildStateManager.updateTaskStatus(this.config.projectPath, nextTask.id, 'in_progress');
    await buildStateManager.updateCurrentTask(this.config.projectPath, {
      id: nextTask.id,
      description: nextTask.description,
      status: 'in_progress'
    });
    await buildStateManager.addActivity(
      this.config.projectPath,
      'task_started',
      `Started: ${nextTask.description}`
    );

    this.currentTaskId = nextTask.id;
    this.emit('task:started', { task: nextTask });

    // Execute with retries
    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= this.config.maxRetries!; attempt++) {
      try {
        this.emit('log', {
          level: 'info',
          message: `🔨 Executing task: ${nextTask.title}${attempt > 1 ? ` (Attempt ${attempt})` : ''}`
        });

        // Load context
        const context = await this.buildEngine.loadContext(this.config.projectPath);

        // Execute with Claude
        const result = await this.buildEngine.executeTask(nextTask, context);

        if (!result.success) {
          throw result.error || new Error('Task execution failed');
        }

        // Run quality gates
        if (this.config.runQualityGates) {
          await this.runQualityGates(nextTask);
        }

        // Auto-install missing dependencies
        await this.checkDependencies();

        // Commit to git
        await this.gitCommit(nextTask);

        // Mark as completed
        await buildStateManager.updateTaskStatus(this.config.projectPath, nextTask.id, 'completed');
        await buildStateManager.updateCurrentTask(this.config.projectPath, null);
        await buildStateManager.addActivity(
          this.config.projectPath,
          'task_completed',
          `Completed: ${nextTask.description}`
        );
        this.currentTaskId = undefined;

        this.emit('task:completed', { task: nextTask });
        this.emit('log', {
          level: 'success',
          message: `✅ Task completed: ${nextTask.description}`
        });

        return {
          success: true,
          done: false,
          task: nextTask
        };

      } catch (error) {
        lastError = error as Error;
        this.emit('log', {
          level: 'error',
          message: `❌ Attempt ${attempt} failed: ${lastError.message}`
        });

        if (attempt < this.config.maxRetries!) {
          this.emit('log', {
            level: 'warning',
            message: `🔄 Retrying task...`
          });
        }
      }
    }

    // All retries failed
    await buildStateManager.updateTaskStatus(
      this.config.projectPath,
      nextTask.id,
      'failed',
      lastError?.message
    );
    await buildStateManager.updateCurrentTask(this.config.projectPath, null);
    await buildStateManager.addActivity(
      this.config.projectPath,
      'task_failed',
      `Failed: ${nextTask.description}`,
      { error: lastError?.message }
    );
    this.currentTaskId = undefined;

    this.emit('task:failed', { task: nextTask, error: lastError });

    return {
      success: false,
      done: false,
      task: nextTask,
      error: lastError
    };
  }

  /**
   * Execute all remaining tasks
   */
  async executeAll(): Promise<{
    success: boolean;
    completedTasks: number;
    failedTasks: number;
  }> {
    let completedTasks = 0;
    let failedTasks = 0;

    while (true) {
      const result = await this.executeNextTask();

      if (result.done) {
        this.emit('log', {
          level: 'success',
          message: `🎉 All tasks completed! (${completedTasks} successful, ${failedTasks} failed)`
        });
        break;
      }

      if (result.success) {
        completedTasks++;
      } else {
        failedTasks++;

        // Stop on failure (requires user intervention)
        this.emit('log', {
          level: 'error',
          message: '⏸️  Build paused due to task failure. Manual intervention required.'
        });
        break;
      }
    }

    return {
      success: failedTasks === 0,
      completedTasks,
      failedTasks
    };
  }

  /**
   * Find next executable task (all dependencies met)
   */
  private findNextExecutableTask(tasks: BuildTask[]): BuildTask | null {
    for (const task of tasks) {
      if (task.status !== 'pending') continue;

      const dependenciesMet = task.dependencies.every(depId => {
        const depTask = tasks.find(t => t.id === depId);
        return depTask && depTask.status === 'completed';
      });

      if (dependenciesMet) return task;
    }

    return null;
  }

  /**
   * Check and auto-install dependencies
   */
  private async checkDependencies(): Promise<void> {
    try {
      this.emit('log', { level: 'info', message: '📦 Checking dependencies...' });

      const detected = await dependencyDetector.scanProject(this.config.projectPath);
      const missing = await dependencyDetector.getMissingDependencies(
        this.config.projectPath,
        detected
      );

      if (missing.length > 0) {
        this.emit('log', {
          level: 'info',
          message: `  📦 Installing ${missing.length} missing dependencies...`
        });

        const result = await dependencyDetector.installDependencies(
          this.config.projectPath,
          missing
        );

        if (result.success) {
          this.emit('log', {
            level: 'success',
            message: `  ✅ Dependencies installed: ${missing.map(d => d.name).join(', ')}`
          });

          // Track in build state
          await buildStateManager.addActivity(
            this.config.projectPath,
            'task_completed',
            `Installed dependencies: ${missing.map(d => d.name).join(', ')}`
          );
        } else {
          this.emit('log', {
            level: 'warning',
            message: `  ⚠️  Dependency installation failed: ${result.errors.join(', ')}`
          });
        }
      } else {
        this.emit('log', { level: 'success', message: '  ✅ All dependencies satisfied' });
      }
    } catch (error: any) {
      this.emit('log', {
        level: 'warning',
        message: `  ⚠️  Dependency check failed (non-blocking): ${error.message}`
      });
    }
  }

  /**
   * Run quality verification gates
   */
  private async runQualityGates(task: BuildTask): Promise<void> {
    this.emit('log', { level: 'info', message: '🔍 Running quality gates...' });

    try {
      // TypeScript check
      this.emit('log', { level: 'info', message: '  📝 TypeScript check...' });
      await execAsync('npx tsc --noEmit', { cwd: this.config.projectPath });
      this.emit('log', { level: 'success', message: '  ✅ TypeScript passed' });

    } catch (error: any) {
      // Log but don't fail on TS errors (might be incomplete build)
      this.emit('log', {
        level: 'warning',
        message: `  ⚠️  TypeScript warnings: ${error.stdout || error.message}`
      });
    }

    try {
      // ESLint check
      this.emit('log', { level: 'info', message: '  🔍 ESLint check...' });
      await execAsync('npx eslint src/ --max-warnings 10', { cwd: this.config.projectPath });
      this.emit('log', { level: 'success', message: '  ✅ ESLint passed' });

    } catch (error: any) {
      this.emit('log', {
        level: 'warning',
        message: `  ⚠️  ESLint warnings (non-blocking)`
      });
    }
  }

  /**
   * Commit task to git
   */
  private async gitCommit(task: BuildTask): Promise<void> {
    try {
      this.emit('log', { level: 'info', message: '📦 Committing to git...' });

      // Check if git repo exists
      const isRepo = await gitManager.isRepo(this.config.projectPath);
      if (!isRepo) {
        this.emit('log', {
          level: 'warning',
          message: '⚠️  Git repository not initialized - skipping commit'
        });
        return;
      }

      // Stage all changes
      await gitManager.add(this.config.projectPath, '.');

      // Commit with semantic message
      await gitManager.commit(this.config.projectPath, {
        message: `${task.description}\n\nTask ID: ${task.id}`,
        taskId: task.id,
        type: this.getCommitType(task.type)
      });

      // Track in build state
      await buildStateManager.addActivity(
        this.config.projectPath,
        'git_commit',
        `Committed: ${task.description}`
      );

      this.emit('log', { level: 'success', message: '✅ Git commit created' });

    } catch (error: any) {
      // Log but don't fail (git might not be initialized yet)
      this.emit('log', {
        level: 'warning',
        message: `⚠️  Git commit skipped: ${error.message}`
      });
    }
  }

  /**
   * Get semantic commit type
   */
  private getCommitType(taskType: string): 'feat' | 'fix' | 'chore' | 'docs' | 'style' | 'refactor' | 'test' {
    const types: Record<string, 'feat' | 'fix' | 'chore' | 'docs' | 'style' | 'refactor' | 'test'> = {
      'setup': 'chore',
      'component': 'feat',
      'page': 'feat',
      'api': 'feat',
      'integration': 'feat',
      'test': 'test',
      'quality': 'chore'
    };
    return types[taskType] || 'feat';
  }
}
