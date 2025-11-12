import { EventEmitter } from 'events';
import { BuildTask } from './task-list-generator-v2';
import { ClaudeCLIEngine } from './claude-cli-engine'; // Use Claude CLI (spawns actual claude command)
import { gitManager } from './git-manager';
import { buildStateManager } from './build-state-manager';
import { dependencyDetector } from './dependency-detector';
import { waveDetector } from './wave-detector';
import { createBuildStateLock } from './build-state-lock';
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
  enableParallelExecution?: boolean;
  maxParallelTasks?: number;
}

/**
 * Executes build tasks sequentially using Claude CLI Engine
 */
export class ClaudeTaskExecutorV2 extends EventEmitter {
  private buildEngine: ClaudeCLIEngine;
  private config: Required<TaskExecutorConfig>;
  private currentTaskId?: string;
  private tasksExecutedCount: number = 0; // Track for batched quality gates
  private scannedFiles: Set<string> = new Set(); // Track scanned files for smart dependency detection
  private knownDependencies: Set<string> = new Set(); // Cache of known dependencies
  private tasksSinceLastCommit: BuildTask[] = []; // Track tasks for batched commits
  private buildStateLock: any; // Build state lock for parallel execution

  constructor(config: TaskExecutorConfig, buildEngine: ClaudeCLIEngine) {
    super();
    this.config = {
      maxRetries: 3,
      runQualityGates: true,
      enableParallelExecution: false,
      maxParallelTasks: 4,
      ...config
    };
    this.buildEngine = buildEngine;
    this.buildStateLock = createBuildStateLock(config.projectPath);

    // Forward Claude engine events
    this.buildEngine.on('log', (data) => this.emit('log', data));
    this.buildEngine.on('claude:prompt', (data) => this.emit('claude:prompt', data));
    this.buildEngine.on('claude:output', (data) => this.emit('claude:output', data));
    this.buildEngine.on('claude:error', (data) => this.emit('claude:error', data));
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
          message: `🔨 Executing task: ${nextTask.description}${attempt > 1 ? ` (Attempt ${attempt})` : ''}`
        });

        // Load context
        const context = await this.buildEngine.loadContext(this.config.projectPath);

        // Execute with Claude
        const result = await this.buildEngine.executeTask(nextTask, context);

        if (!result.success) {
          throw result.error || new Error('Task execution failed');
        }

        // Increment task counter
        this.tasksExecutedCount++;

        // Run quality gates (batched for performance)
        // Run every 4 tasks OR on critical tasks (api, quality, test types)
        const isCriticalTask = ['api', 'quality', 'test'].includes(nextTask.type);
        const shouldRunQualityGates =
          isCriticalTask ||
          this.tasksExecutedCount % 4 === 0 ||
          buildState.completedTasks + 1 === buildState.totalTasks; // Always run on last task

        if (this.config.runQualityGates && shouldRunQualityGates) {
          this.emit('log', {
            level: 'info',
            message: `🎯 Running quality gates (${isCriticalTask ? 'critical task' : `batch #${Math.floor(this.tasksExecutedCount / 4) + 1}`})`
          });
          await this.runQualityGates(nextTask);
        } else if (this.config.runQualityGates) {
          this.emit('log', {
            level: 'info',
            message: `⚡ Skipping quality gates for performance (will run at next checkpoint)`
          });
        }

        // Auto-install missing dependencies
        await this.checkDependencies();

        // Mark as completed
        await buildStateManager.updateTaskStatus(this.config.projectPath, nextTask.id, 'completed');
        await buildStateManager.updateCurrentTask(this.config.projectPath, null);
        await buildStateManager.addActivity(
          this.config.projectPath,
          'task_completed',
          `Completed: ${nextTask.description}`
        );

        // Add to commit batch
        this.tasksSinceLastCommit.push(nextTask);

        // Commit to git (batched for performance)
        // Commit every 4 tasks OR on critical tasks OR on last task
        const shouldCommit =
          isCriticalTask ||
          this.tasksSinceLastCommit.length >= 4 ||
          buildState.completedTasks + 1 === buildState.totalTasks; // Last task

        if (shouldCommit) {
          await this.gitCommitBatch(this.tasksSinceLastCommit);
          this.tasksSinceLastCommit = []; // Clear batch
        } else {
          this.emit('log', {
            level: 'info',
            message: `⚡ Deferring git commit (${this.tasksSinceLastCommit.length} tasks in batch, will commit at next checkpoint)`
          });
        }

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
    // Route to wave-based or sequential execution based on config
    if (this.config.enableParallelExecution) {
      this.emit('log', {
        level: 'info',
        message: `🌊 Using wave-based parallel execution (max ${this.config.maxParallelTasks} concurrent tasks)`
      });
      return await this.executeAllWaves();
    } else {
      this.emit('log', {
        level: 'info',
        message: '📝 Using sequential execution'
      });
      return await this.executeAllSequential();
    }
  }

  /**
   * Execute all tasks sequentially (original logic)
   */
  private async executeAllSequential(): Promise<{
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
   * Execute all tasks using wave-based parallel execution
   */
  private async executeAllWaves(): Promise<{
    success: boolean;
    completedTasks: number;
    failedTasks: number;
  }> {
    let completedTasks = 0;
    let failedTasks = 0;

    while (true) {
      // Load current build state
      const buildState = await buildStateManager.load(this.config.projectPath);
      if (!buildState || !buildState.tasks) {
        throw new Error('Build state not found');
      }

      // Detect waves
      const waves = waveDetector.detectWaves(buildState.tasks);

      if (waves.length === 0) {
        // All tasks complete or blocked
        this.emit('log', {
          level: 'success',
          message: `🎉 All waves completed! (${completedTasks} successful, ${failedTasks} failed)`
        });
        break;
      }

      // Execute first wave
      const wave = waves[0];
      this.emit('log', {
        level: 'info',
        message: `🌊 Executing wave with ${wave.length} tasks: ${wave.map(t => t.id).join(', ')}`
      });

      // Emit wave start event for UI
      this.emit('wave:start', {
        waveIndex: Math.floor(completedTasks / 4) + 1,
        componentCount: wave.length,
        taskIds: wave.map(t => t.id),
        timestamp: new Date().toISOString()
      });

      const waveResult = await this.executeWave(wave, buildState.tasks);

      completedTasks += waveResult.completed;
      failedTasks += waveResult.failed;

      // Emit wave complete event for UI
      this.emit('wave:complete', {
        waveIndex: Math.floor((completedTasks - waveResult.completed) / 4) + 1,
        completed: waveResult.completed,
        failed: waveResult.failed,
        totalCompleted: completedTasks,
        totalFailed: failedTasks,
        timestamp: new Date().toISOString()
      });

      // If any failures, stop (user intervention needed)
      if (waveResult.failed > 0) {
        this.emit('log', {
          level: 'error',
          message: `⏸️  Build paused: ${waveResult.failed} tasks failed in wave`
        });
        break;
      }

      // Run quality gates after each wave (if enabled)
      // Quality gates are always run sequentially for safety
      if (this.config.runQualityGates) {
        const hasCriticalTasks = wave.some(t => ['api', 'quality', 'test'].includes(t.type));
        const shouldRunQualityGates =
          hasCriticalTasks ||
          completedTasks % 4 === 0 || // Every 4 tasks
          buildState.completedTasks + waveResult.completed === buildState.totalTasks; // Last wave

        if (shouldRunQualityGates) {
          this.emit('log', {
            level: 'info',
            message: `🎯 Running quality gates after wave (${hasCriticalTasks ? 'critical tasks' : 'batch check'})`
          });

          try {
            // Use the last completed task from the wave for quality gate context
            const lastTask = wave[wave.length - 1];
            await this.runQualityGates(lastTask);
          } catch (error) {
            this.emit('log', {
              level: 'warn',
              message: `⚠️  Quality gate warnings detected (build continues)`
            });
            // Quality gates don't fail the build, just warn
          }
        }
      }
    }

    return {
      success: failedTasks === 0,
      completedTasks,
      failedTasks
    };
  }

  /**
   * Execute a single wave of tasks in parallel
   */
  private async executeWave(wave: BuildTask[], allTasks: BuildTask[]): Promise<{
    completed: number;
    failed: number;
  }> {
    // Validate wave (all dependencies met)
    const validation = waveDetector.validateWave(wave, allTasks);
    if (!validation.valid) {
      this.emit('log', {
        level: 'error',
        message: `❌ Wave validation failed: ${validation.errors.join(', ')}`
      });
      return { completed: 0, failed: wave.length };
    }

    // Get sessions from pool (up to maxParallelTasks)
    const sessionCount = Math.min(wave.length, this.config.maxParallelTasks);
    const sessions = await this.buildEngine.getSessionPool()?.getMultipleSessions(sessionCount) || [];

    if (sessions.length === 0) {
      // Fallback to sequential if no sessions available
      this.emit('log', {
        level: 'warn',
        message: '⚠️  No sessions available, falling back to sequential execution'
      });
      return await this.executeWaveSequential(wave);
    }

    // Execute tasks in parallel using Promise.allSettled
    const taskPromises = wave.map(async (task, index) => {
      const session = sessions[index % sessions.length]; // Round-robin session allocation
      return await this.executeTaskWithLock(task, session);
    });

    const results = await Promise.allSettled(taskPromises);

    // Release sessions back to pool
    this.buildEngine.getSessionPool()?.releaseSessions(sessions);

    // Count results
    let completed = 0;
    let failed = 0;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        completed++;
      } else {
        failed++;
        const task = wave[index];
        this.emit('log', {
          level: 'error',
          message: `❌ Task ${task.id} failed: ${result.status === 'rejected' ? result.reason : 'Unknown error'}`
        });
      }
    });

    return { completed, failed };
  }

  /**
   * Execute wave sequentially (fallback)
   */
  private async executeWaveSequential(wave: BuildTask[]): Promise<{
    completed: number;
    failed: number;
  }> {
    let completed = 0;
    let failed = 0;

    for (const task of wave) {
      try {
        const result = await this.executeTaskWithLock(task);
        if (result.success) {
          completed++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
        this.emit('log', {
          level: 'error',
          message: `❌ Task ${task.id} failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }

    return { completed, failed };
  }

  /**
   * Execute a single task with build state locking
   */
  private async executeTaskWithLock(task: BuildTask, session?: any): Promise<{
    success: boolean;
  }> {
    // Mark as in_progress (with lock)
    await this.buildStateLock.withLock(async () => {
      await buildStateManager.updateTaskStatus(this.config.projectPath, task.id, 'in_progress');
    });

    try {
      // Execute task
      const result = await this.buildEngine.executeTask(task, {
        buildDoc: '', // TODO: Load from file
        designSystem: '', // TODO: Load from file
        projectName: this.config.projectName
      });

      // Mark as completed (with lock)
      await this.buildStateLock.withLock(async () => {
        await buildStateManager.updateTaskStatus(this.config.projectPath, task.id, 'completed');
      });

      return { success: true };

    } catch (error) {
      // Mark as failed (with lock)
      await this.buildStateLock.withLock(async () => {
        await buildStateManager.updateTaskStatus(
          this.config.projectPath,
          task.id,
          'failed',
          error instanceof Error ? error.message : 'Unknown error'
        );
      });

      return { success: false };
    }
  }

  /**
   * Get list of source files in project
   */
  private async getSourceFiles(projectPath: string): Promise<string[]> {
    const files: string[] = [];
    const srcDir = path.join(projectPath, 'src');

    const scan = async (dir: string) => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            // Skip node_modules and other ignored directories
            if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
              await scan(fullPath);
            }
          } else if (entry.isFile()) {
            // Only scan TypeScript/JavaScript files
            if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') ||
                entry.name.endsWith('.js') || entry.name.endsWith('.jsx')) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        // Directory doesn't exist or can't be read - skip
      }
    };

    await scan(srcDir);
    return files;
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
   * Check and auto-install dependencies (smart incremental scanning)
   */
  private async checkDependencies(): Promise<void> {
    try {
      // Get all current source files
      const currentFiles = await this.getSourceFiles(this.config.projectPath);

      // Find files that haven't been scanned yet
      const newFiles = currentFiles.filter(f => !this.scannedFiles.has(f));

      if (newFiles.length === 0 && this.scannedFiles.size > 0) {
        // No new files - skip dependency check
        this.emit('log', {
          level: 'info',
          message: '⚡ Skipping dependency check (no new files since last check)'
        });
        return;
      }

      this.emit('log', {
        level: 'info',
        message: `📦 Checking dependencies (${newFiles.length} new files)...`
      });

      // Scan only new files for dependencies
      const detected = await dependencyDetector.scanProject(this.config.projectPath);

      // Mark files as scanned
      newFiles.forEach(f => this.scannedFiles.add(f));

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

          // Cache installed dependencies
          missing.forEach(d => this.knownDependencies.add(d.name));

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
   * Commit batch of tasks to git (for performance)
   */
  private async gitCommitBatch(tasks: BuildTask[]): Promise<void> {
    if (tasks.length === 0) return;

    try {
      this.emit('log', {
        level: 'info',
        message: `📦 Committing ${tasks.length} tasks to git...`
      });

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

      // Build commit message with all tasks
      const taskList = tasks.map(t => `- ${t.description}`).join('\n');
      const taskIds = tasks.map(t => t.id).join(', ');
      const message = `Batch: ${tasks.length} tasks completed\n\n${taskList}\n\nTask IDs: ${taskIds}`;

      // Commit with batch message
      await gitManager.commit(this.config.projectPath, {
        message,
        taskId: tasks[tasks.length - 1].id, // Use last task ID
        type: 'feat' // Batches are always features
      });

      // Track in build state
      await buildStateManager.addActivity(
        this.config.projectPath,
        'git_commit',
        `Committed: ${tasks.length} tasks (${tasks.map(t => t.id).join(', ')})`
      );

      this.emit('log', {
        level: 'success',
        message: `✅ Git batch commit created (${tasks.length} tasks)`
      });

    } catch (error: any) {
      // Log but don't fail (git might not be initialized yet)
      this.emit('log', {
        level: 'warning',
        message: `⚠️  Git commit skipped: ${error.message}`
      });
    }
  }

  /**
   * Commit task to git (legacy single-task method - kept for compatibility)
   */
  private async gitCommit(task: BuildTask): Promise<void> {
    return this.gitCommitBatch([task]);
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
