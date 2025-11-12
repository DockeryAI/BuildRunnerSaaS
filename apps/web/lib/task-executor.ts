import { BuildTask, TaskList, TaskStatus, taskListGenerator } from './task-list-generator';
import { promises as fs } from 'fs';
import path from 'path';
import { EventEmitter } from 'events';

/**
 * Task execution result
 */
export interface TaskResult {
  success: boolean;
  taskId: string;
  task?: BuildTask;
  output?: string;
  error?: Error;
  done?: boolean;
  message?: string;
}

/**
 * Build log entry
 */
export interface BuildLogEntry {
  timestamp: string;
  taskId: string;
  taskTitle: string;
  status: 'started' | 'completed' | 'failed';
  duration?: number;
  output?: string;
  error?: string;
}

/**
 * Executes build tasks sequentially with proper dependency management
 */
export class TaskExecutor extends EventEmitter {
  private buildLogs: Map<string, BuildLogEntry[]> = new Map();
  private taskStartTimes: Map<string, number> = new Map();

  /**
   * Execute the next available task (respecting dependencies)
   */
  async executeNextTask(projectId: string): Promise<TaskResult> {
    const taskList = await taskListGenerator.loadTaskList(projectId);

    if (!taskList) {
      return {
        success: false,
        taskId: '',
        error: new Error(`Task list not found for project ${projectId}`)
      };
    }

    // Find next executable task
    const nextTask = this.findNextExecutableTask(taskList);

    if (!nextTask) {
      // Check if all tasks are complete
      const allComplete = taskList.tasks.every(
        t => t.status === 'completed' || t.status === 'obsolete'
      );

      if (allComplete) {
        return {
          success: true,
          taskId: '',
          done: true,
          message: 'All tasks completed successfully'
        };
      } else {
        // Some tasks failed or are blocked
        return {
          success: false,
          taskId: '',
          error: new Error('No executable tasks remaining, but build not complete')
        };
      }
    }

    // Mark task as in_progress
    await taskListGenerator.updateTaskStatus(projectId, nextTask.id, 'in_progress');
    this.logTaskStart(projectId, nextTask);

    // Emit event
    this.emit('task:started', { projectId, task: nextTask });

    try {
      // Execute the task
      const startTime = Date.now();
      const output = await this.executeTask(projectId, nextTask);
      const duration = Date.now() - startTime;

      // Mark as completed
      await taskListGenerator.updateTaskStatus(projectId, nextTask.id, 'completed');
      this.logTaskComplete(projectId, nextTask, duration, output);

      // Emit event
      this.emit('task:completed', { projectId, task: nextTask, duration, output });

      return {
        success: true,
        taskId: nextTask.id,
        task: nextTask,
        output
      };
    } catch (error) {
      const err = error as Error;
      // Mark as failed
      await taskListGenerator.updateTaskStatus(
        projectId,
        nextTask.id,
        'failed',
        err.message
      );
      this.logTaskFailed(projectId, nextTask, err);

      // Emit event
      this.emit('task:failed', { projectId, task: nextTask, error: err });

      return {
        success: false,
        taskId: nextTask.id,
        task: nextTask,
        error: err
      };
    }
  }

  /**
   * Find the next task that can be executed (all dependencies met)
   */
  private findNextExecutableTask(taskList: TaskList): BuildTask | null {
    for (const task of taskList.tasks) {
      // Skip if not pending
      if (task.status !== 'pending') continue;

      // Check if all dependencies are completed
      const dependenciesMet = task.dependencies.every(depId => {
        const depTask = taskList.tasks.find(t => t.id === depId);
        return depTask && depTask.status === 'completed';
      });

      if (dependenciesMet) {
        return task;
      }
    }

    return null;
  }

  /**
   * Execute a specific task based on its type
   */
  private async executeTask(projectId: string, task: BuildTask): Promise<string> {
    switch (task.type) {
      case 'setup':
        return await this.executeSetupTask(projectId, task);
      case 'database':
        return await this.executeDatabaseTask(projectId, task);
      case 'api':
        return await this.executeApiTask(projectId, task);
      case 'component':
        return await this.executeComponentTask(projectId, task);
      case 'integration':
        return await this.executeIntegrationTask(projectId, task);
      case 'verification':
        return await this.executeVerificationTask(projectId, task);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  /**
   * Execute setup task (create directories, etc.)
   */
  private async executeSetupTask(projectId: string, task: BuildTask): Promise<string> {
    const buildDir = this.getBuildDirectory(projectId);

    // Create standard project structure
    const dirs = [
      path.join(buildDir, 'src'),
      path.join(buildDir, 'src/api'),
      path.join(buildDir, 'src/components'),
      path.join(buildDir, 'src/lib'),
      path.join(buildDir, 'public')
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }

    // Create package.json if it doesn't exist
    const packageJsonPath = path.join(buildDir, 'package.json');
    try {
      await fs.access(packageJsonPath);
    } catch {
      await fs.writeFile(
        packageJsonPath,
        JSON.stringify({
          name: projectId,
          version: '1.0.0',
          dependencies: {
            'react': '^18.2.0',
            'react-dom': '^18.2.0',
            'next': '^14.2.0'
          }
        }, null, 2)
      );
    }

    return `Created project structure:\n${dirs.map(d => `- ${d}`).join('\n')}`;
  }

  /**
   * Execute database task (create models, migrations)
   */
  private async executeDatabaseTask(projectId: string, task: BuildTask): Promise<string> {
    // TODO: Integrate with AI to generate database schema
    // For now, create placeholder
    const buildDir = this.getBuildDirectory(projectId);
    const schemaPath = path.join(buildDir, 'src/lib/schema.ts');

    await fs.writeFile(
      schemaPath,
      `// Database schema for ${task.title}\n// Generated by TaskExecutor\n\nexport interface Schema {\n  // TODO: Define schema\n}\n`
    );

    return `Created database schema at ${schemaPath}`;
  }

  /**
   * Execute API task (generate API endpoint)
   */
  private async executeApiTask(projectId: string, task: BuildTask): Promise<string> {
    const buildDir = this.getBuildDirectory(projectId);
    const filePath = path.join(buildDir, task.expectedFile || 'src/api/route.ts');

    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // Generate API endpoint using AI
    const apiCode = await this.generateApiCode(task);

    await fs.writeFile(filePath, apiCode);

    return `Created API endpoint at ${filePath}\nEndpoint: ${task.endpoint}`;
  }

  /**
   * Execute component task (generate UI component)
   */
  private async executeComponentTask(projectId: string, task: BuildTask): Promise<string> {
    const buildDir = this.getBuildDirectory(projectId);
    const filePath = path.join(buildDir, task.expectedFile || 'src/components/Component.tsx');

    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // Generate component using AI
    const componentCode = await this.generateComponentCode(task);

    await fs.writeFile(filePath, componentCode);

    return `Created component at ${filePath}\nComponent: ${task.componentName}`;
  }

  /**
   * Execute integration task (connect component to API)
   */
  private async executeIntegrationTask(projectId: string, task: BuildTask): Promise<string> {
    // Find the component and API tasks this integrates
    const taskList = await taskListGenerator.loadTaskList(projectId);
    if (!taskList) {
      throw new Error('Task list not found');
    }

    const componentTask = taskList.tasks.find(
      t => task.dependencies.includes(t.id) && t.type === 'component'
    );

    const apiTask = taskList.tasks.find(
      t => task.dependencies.includes(t.id) && t.type === 'api'
    );

    if (!componentTask || !apiTask) {
      throw new Error('Could not find component or API task for integration');
    }

    const buildDir = this.getBuildDirectory(projectId);
    const componentPath = path.join(buildDir, componentTask.expectedFile!);

    // Read component code
    let componentCode = await fs.readFile(componentPath, 'utf-8');

    // Add API integration code
    const integrationCode = await this.generateIntegrationCode(componentTask, apiTask);

    // Merge integration code into component
    componentCode = this.mergeIntegrationCode(componentCode, integrationCode);

    await fs.writeFile(componentPath, componentCode);

    return `Integrated ${componentTask.componentName} with ${apiTask.endpoint}`;
  }

  /**
   * Execute verification task (check everything works)
   */
  private async executeVerificationTask(projectId: string, task: BuildTask): Promise<string> {
    const buildDir = this.getBuildDirectory(projectId);
    const taskList = await taskListGenerator.loadTaskList(projectId);

    if (!taskList) {
      throw new Error('Task list not found');
    }

    const results: string[] = [];

    // Check all expected files exist
    for (const t of taskList.tasks) {
      if (t.expectedFile && t.status === 'completed') {
        const filePath = path.join(buildDir, t.expectedFile);
        try {
          await fs.access(filePath);
          results.push(`✓ ${t.expectedFile} exists`);
        } catch {
          results.push(`✗ ${t.expectedFile} MISSING`);
        }
      }
    }

    return results.join('\n');
  }

  // ==================== AI Code Generation (Stubs) ====================

  private async generateApiCode(task: BuildTask): Promise<string> {
    // TODO: Call AI to generate actual API code
    // For now, return template

    return `import { NextRequest, NextResponse } from 'next/server';

/**
 * ${task.title}
 * ${task.description}
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Implement GET logic
    return NextResponse.json({ message: 'Success' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // TODO: Implement POST logic
    return NextResponse.json({ message: 'Created', data: body }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`;
  }

  private async generateComponentCode(task: BuildTask): Promise<string> {
    // TODO: Call AI to generate actual component code
    // For now, return template

    const componentName = task.componentName || 'Component';

    return `'use client';

import React, { useState, useEffect } from 'react';

/**
 * ${task.title}
 * ${task.description}
 */
export default function ${componentName}() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">${componentName}</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      <div className="space-y-4">
        {/* TODO: Implement component UI */}
        <p className="text-gray-600">Component content goes here</p>
      </div>
    </div>
  );
}
`;
  }

  private async generateIntegrationCode(componentTask: BuildTask, apiTask: BuildTask): Promise<string> {
    return `
  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('${apiTask.endpoint}');
        if (!response.ok) throw new Error('Failed to fetch');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
`;
  }

  private mergeIntegrationCode(componentCode: string, integrationCode: string): string {
    // Simple merge: add integration code after state declarations
    const stateRegex = /const \[.*?\] = useState.*?;/;
    const match = componentCode.match(stateRegex);

    if (match) {
      const insertPos = componentCode.indexOf(match[0]) + match[0].length;
      return componentCode.slice(0, insertPos) + '\n' + integrationCode + componentCode.slice(insertPos);
    }

    // Fallback: add before return statement
    const returnPos = componentCode.indexOf('return (');
    if (returnPos > 0) {
      return componentCode.slice(0, returnPos) + integrationCode + '\n\n  ' + componentCode.slice(returnPos);
    }

    return componentCode;
  }

  // ==================== Logging ====================

  private logTaskStart(projectId: string, task: BuildTask): void {
    this.taskStartTimes.set(task.id, Date.now());

    const entry: BuildLogEntry = {
      timestamp: new Date().toISOString(),
      taskId: task.id,
      taskTitle: task.title,
      status: 'started'
    };

    this.addLogEntry(projectId, entry);
  }

  private logTaskComplete(projectId: string, task: BuildTask, duration: number, output: string): void {
    const entry: BuildLogEntry = {
      timestamp: new Date().toISOString(),
      taskId: task.id,
      taskTitle: task.title,
      status: 'completed',
      duration,
      output
    };

    this.addLogEntry(projectId, entry);
  }

  private logTaskFailed(projectId: string, task: BuildTask, error: Error): void {
    const startTime = this.taskStartTimes.get(task.id) || Date.now();
    const duration = Date.now() - startTime;

    const entry: BuildLogEntry = {
      timestamp: new Date().toISOString(),
      taskId: task.id,
      taskTitle: task.title,
      status: 'failed',
      duration,
      error: error.message
    };

    this.addLogEntry(projectId, entry);
  }

  private addLogEntry(projectId: string, entry: BuildLogEntry): void {
    if (!this.buildLogs.has(projectId)) {
      this.buildLogs.set(projectId, []);
    }

    this.buildLogs.get(projectId)!.push(entry);

    // Save to file
    this.saveBuildLog(projectId).catch(console.error);
  }

  /**
   * Save build log to BUILD_LOG.md
   */
  private async saveBuildLog(projectId: string): Promise<void> {
    const entries = this.buildLogs.get(projectId) || [];
    const buildDir = this.getBuildDirectory(projectId);
    const logPath = path.join(buildDir, 'BUILD_LOG.md');

    let md = `# Build Log\n\n`;
    md += `Project: ${projectId}\n`;
    md += `Generated: ${new Date().toISOString()}\n\n`;
    md += `---\n\n`;

    for (const entry of entries) {
      md += `## ${entry.taskTitle} (\`${entry.taskId}\`)\n\n`;
      md += `**Started:** ${entry.timestamp}\n`;
      md += `**Status:** ${this.getStatusEmoji(entry.status)} ${entry.status}\n`;

      if (entry.duration) {
        md += `**Duration:** ${(entry.duration / 1000).toFixed(2)}s\n`;
      }

      if (entry.output) {
        md += `\n**Output:**\n\`\`\`\n${entry.output}\n\`\`\`\n`;
      }

      if (entry.error) {
        md += `\n**Error:**\n\`\`\`\n${entry.error}\n\`\`\`\n`;
      }

      md += `\n---\n\n`;
    }

    await fs.writeFile(logPath, md);
  }

  private getStatusEmoji(status: string): string {
    switch (status) {
      case 'started': return '🔄';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '';
    }
  }

  private getBuildDirectory(projectId: string): string {
    return path.join(process.cwd(), 'builds', projectId);
  }
}

// Export singleton
export const taskExecutor = new TaskExecutor();
