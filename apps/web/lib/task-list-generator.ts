import { ProjectPlan } from './build-types';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Task types in the build process
 */
export type TaskType =
  | 'setup'          // Project initialization, dependencies
  | 'database'       // Database models, migrations
  | 'api'            // API endpoints
  | 'component'      // UI components
  | 'integration'    // Connect UI to APIs
  | 'verification';  // Test and verify

/**
 * Task status
 */
export type TaskStatus =
  | 'pending'       // Not started
  | 'in_progress'   // Currently executing
  | 'completed'     // Successfully finished
  | 'failed'        // Failed with error
  | 'obsolete';     // Marked obsolete (PRD changed)

/**
 * Individual task in the build plan
 */
export interface BuildTask {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  dependencies: string[];      // Task IDs this depends on
  status: TaskStatus;
  estimatedMinutes: number;
  featureId?: string;           // Links back to PRD feature
  milestone?: string;           // Links to plan milestone
  expectedFile?: string;        // Expected output file path
  endpoint?: string;            // For API tasks
  componentName?: string;       // For component tasks
  completedAt?: string;
  errorMessage?: string;
  attempts?: number;            // Number of retry attempts
}

/**
 * Task list metadata
 */
export interface TaskList {
  projectId: string;
  projectName: string;
  generatedAt: string;
  totalTasks: number;
  completedTasks: number;
  tasks: BuildTask[];
}

/**
 * Generates detailed task lists from PRD and Project Plan
 */
export class TaskListGenerator {
  /**
   * Generate a complete task list from a project plan
   */
  async generateTaskList(
    projectId: string,
    projectName: string,
    projectPlan: ProjectPlan
  ): Promise<TaskList> {
    const tasks: BuildTask[] = [];

    // 1. Setup tasks (always first)
    tasks.push(this.createSetupTask());

    // 2. For each milestone in the plan, generate tasks
    for (const milestone of projectPlan.milestones) {
      // Database tasks (if applicable)
      if (this.needsDatabase(milestone)) {
        tasks.push(this.createDatabaseTask(milestone));
      }

      // API endpoint tasks
      for (const step of milestone.steps) {
        if (this.isApiComponent(step)) {
          tasks.push(this.createApiTask(milestone, step));
        }
      }

      // UI component tasks
      for (const step of milestone.steps) {
        if (this.isUiComponent(step)) {
          tasks.push(this.createComponentTask(milestone, step, tasks));
        }
      }

      // Integration tasks (connect UI to API)
      for (const step of milestone.steps) {
        if (this.isUiComponent(step) && this.hasApiDependency(step, milestone)) {
          tasks.push(this.createIntegrationTask(milestone, step, tasks));
        }
      }
    }

    // 3. Verification tasks (always last)
    tasks.push(this.createVerificationTask(tasks));

    const taskList: TaskList = {
      projectId,
      projectName,
      generatedAt: new Date().toISOString(),
      totalTasks: tasks.length,
      completedTasks: 0,
      tasks
    };

    return taskList;
  }

  /**
   * Save task list to both JSON and Markdown formats
   */
  async saveTaskList(projectId: string, taskList: TaskList): Promise<void> {
    const buildDir = this.getBuildDirectory(projectId);
    await fs.mkdir(buildDir, { recursive: true });

    // Save JSON (machine-readable)
    const jsonPath = path.join(buildDir, 'tasks.json');
    await fs.writeFile(jsonPath, JSON.stringify(taskList, null, 2));

    // Save Markdown (human-readable)
    const mdPath = path.join(buildDir, 'TASKS.md');
    const markdown = this.generateMarkdown(taskList);
    await fs.writeFile(mdPath, markdown);
  }

  /**
   * Load task list from JSON
   */
  async loadTaskList(projectId: string): Promise<TaskList | null> {
    try {
      const buildDir = this.getBuildDirectory(projectId);
      const jsonPath = path.join(buildDir, 'tasks.json');
      const content = await fs.readFile(jsonPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  /**
   * Update task status
   */
  async updateTaskStatus(
    projectId: string,
    taskId: string,
    status: TaskStatus,
    errorMessage?: string
  ): Promise<void> {
    const taskList = await this.loadTaskList(projectId);
    if (!taskList) {
      throw new Error(`Task list not found for project ${projectId}`);
    }

    const task = taskList.tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    task.status = status;
    if (status === 'completed') {
      task.completedAt = new Date().toISOString();
      taskList.completedTasks++;
    } else if (status === 'failed') {
      task.errorMessage = errorMessage;
      task.attempts = (task.attempts || 0) + 1;
    }

    await this.saveTaskList(projectId, taskList);
  }

  // ==================== Private Helper Methods ====================

  private createSetupTask(): BuildTask {
    return {
      id: 'setup-001',
      title: 'Initialize Project Structure',
      description: 'Create project directories, install dependencies, configure tooling',
      type: 'setup',
      dependencies: [],
      status: 'pending',
      estimatedMinutes: 5
    };
  }

  private createDatabaseTask(milestone: any): BuildTask {
    return {
      id: `db-${this.generateShortId()}`,
      title: `Database Schema for ${milestone.title}`,
      description: `Create database models and migrations for ${milestone.title}`,
      type: 'database',
      dependencies: ['setup-001'],
      status: 'pending',
      estimatedMinutes: 10,
      milestone: milestone.title
    };
  }

  private createApiTask(milestone: any, step: any): BuildTask {
    const endpoint = this.inferEndpointFromStep(step);
    const fileName = this.endpointToFileName(endpoint);

    return {
      id: `api-${this.generateShortId()}`,
      title: `API: ${step.title}`,
      description: step.details || step.description || `Create API endpoint for ${step.title}`,
      type: 'api',
      dependencies: ['setup-001'],
      status: 'pending',
      estimatedMinutes: 15,
      featureId: step.id,
      milestone: milestone.title,
      endpoint,
      expectedFile: fileName
    };
  }

  private createComponentTask(milestone: any, step: any, existingTasks: BuildTask[]): BuildTask {
    const componentName = this.inferComponentName(step);
    const fileName = `src/components/${componentName}.tsx`;

    // Find API dependency
    const apiDependencies = existingTasks
      .filter(t => t.type === 'api' && t.milestone === milestone.title)
      .map(t => t.id);

    return {
      id: `component-${this.generateShortId()}`,
      title: `Component: ${step.title}`,
      description: step.details || step.description || `Create ${componentName} component`,
      type: 'component',
      dependencies: apiDependencies.length > 0 ? apiDependencies : ['setup-001'],
      status: 'pending',
      estimatedMinutes: 20,
      featureId: step.id,
      milestone: milestone.title,
      componentName,
      expectedFile: fileName
    };
  }

  private createIntegrationTask(milestone: any, step: any, existingTasks: BuildTask[]): BuildTask {
    const componentTask = existingTasks.find(
      t => t.type === 'component' && t.featureId === step.id
    );

    const apiTask = existingTasks.find(
      t => t.type === 'api' && t.milestone === milestone.title
    );

    return {
      id: `integration-${this.generateShortId()}`,
      title: `Integrate ${componentTask?.componentName} with API`,
      description: `Connect ${componentTask?.componentName} to ${apiTask?.endpoint}`,
      type: 'integration',
      dependencies: [componentTask?.id || '', apiTask?.id || ''].filter(Boolean),
      status: 'pending',
      estimatedMinutes: 10,
      milestone: milestone.title
    };
  }

  private createVerificationTask(existingTasks: BuildTask[]): BuildTask {
    return {
      id: 'verify-001',
      title: 'Verify Build Completeness',
      description: 'Test all API endpoints, verify UI components, check integrations',
      type: 'verification',
      dependencies: existingTasks.map(t => t.id),
      status: 'pending',
      estimatedMinutes: 15
    };
  }

  // ==================== Detection Helpers ====================

  private needsDatabase(milestone: any): boolean {
    const keywords = ['database', 'model', 'schema', 'table', 'entity'];
    const text = `${milestone.title} ${milestone.description}`.toLowerCase();
    return keywords.some(kw => text.includes(kw));
  }

  private isApiComponent(step: any): boolean {
    const apiKeywords = ['api', 'endpoint', 'route', 'server', 'backend'];
    const text = `${step.title} ${step.description || ''}`.toLowerCase();
    return apiKeywords.some(kw => text.includes(kw)) || step.type === 'api';
  }

  private isUiComponent(step: any): boolean {
    const uiKeywords = ['component', 'page', 'ui', 'frontend', 'view', 'form', 'button'];
    const text = `${step.title} ${step.description || ''}`.toLowerCase();
    return uiKeywords.some(kw => text.includes(kw)) || step.type === 'component';
  }

  private hasApiDependency(step: any, milestone: any): boolean {
    // Check if this UI component likely needs an API
    return milestone.steps.some((s: any) => this.isApiComponent(s));
  }

  // ==================== Naming Helpers ====================

  private inferEndpointFromStep(step: any): string {
    // Try to extract endpoint from step title or description
    const text = step.title.toLowerCase();

    // Common patterns
    if (text.includes('get')) return `/api/${this.kebabCase(step.title.replace(/get/i, ''))}`;
    if (text.includes('create')) return `/api/${this.kebabCase(step.title.replace(/create/i, ''))}`;
    if (text.includes('update')) return `/api/${this.kebabCase(step.title.replace(/update/i, ''))}`;
    if (text.includes('delete')) return `/api/${this.kebabCase(step.title.replace(/delete/i, ''))}`;

    // Default: use step title
    return `/api/${this.kebabCase(step.title)}`;
  }

  private inferComponentName(step: any): string {
    // Convert step title to PascalCase component name
    return this.pascalCase(step.title);
  }

  private endpointToFileName(endpoint: string): string {
    // /api/products → src/api/products/route.ts
    const parts = endpoint.split('/').filter(Boolean).slice(1); // Skip 'api'
    return `src/api/${parts.join('/')}/route.ts`;
  }

  // ==================== Utility Methods ====================

  private generateShortId(): string {
    return Math.random().toString(36).substr(2, 6);
  }

  private kebabCase(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private pascalCase(str: string): string {
    return str
      .replace(/[^a-z0-9]+/gi, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  private getBuildDirectory(projectId: string): string {
    return path.join(process.cwd(), 'builds', projectId);
  }

  /**
   * Generate human-readable markdown from task list
   */
  private generateMarkdown(taskList: TaskList): string {
    const progress = Math.round((taskList.completedTasks / taskList.totalTasks) * 100);

    let md = `# Build Tasks for ${taskList.projectName}\n\n`;
    md += `**Generated:** ${new Date(taskList.generatedAt).toLocaleString()}\n`;
    md += `**Total Tasks:** ${taskList.totalTasks}\n`;
    md += `**Completed:** ${taskList.completedTasks}/${taskList.totalTasks} (${progress}%)\n\n`;
    md += `---\n\n`;

    // Group by type
    const types: TaskType[] = ['setup', 'database', 'api', 'component', 'integration', 'verification'];

    for (const type of types) {
      const typeTasks = taskList.tasks.filter(t => t.type === type);
      if (typeTasks.length === 0) continue;

      md += `## ${this.titleCase(type)} Tasks\n\n`;

      for (const task of typeTasks) {
        const checkbox = task.status === 'completed' ? '[x]' : '[ ]';
        const status = this.getStatusEmoji(task.status);

        md += `${checkbox} **${task.title}** ${status}\n`;
        md += `   - ID: \`${task.id}\`\n`;
        md += `   - Type: ${task.type}\n`;
        md += `   - Status: ${task.status}\n`;

        if (task.dependencies.length > 0) {
          md += `   - Dependencies: ${task.dependencies.join(', ')}\n`;
        }

        if (task.expectedFile) {
          md += `   - File: \`${task.expectedFile}\`\n`;
        }

        if (task.endpoint) {
          md += `   - Endpoint: \`${task.endpoint}\`\n`;
        }

        if (task.completedAt) {
          md += `   - Completed: ${new Date(task.completedAt).toLocaleString()}\n`;
        }

        if (task.errorMessage) {
          md += `   - Error: ${task.errorMessage}\n`;
        }

        md += `\n`;
      }

      md += `\n`;
    }

    return md;
  }

  private titleCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private getStatusEmoji(status: TaskStatus): string {
    switch (status) {
      case 'pending': return '⏳';
      case 'in_progress': return '🔄';
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'obsolete': return '🚫';
      default: return '';
    }
  }
}

// Export singleton instance
export const taskListGenerator = new TaskListGenerator();
