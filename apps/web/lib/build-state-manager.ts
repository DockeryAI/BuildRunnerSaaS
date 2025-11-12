/**
 * Build State Manager
 * Manages BUILD_STATE.json for tracking build progress
 */

import fs from 'fs/promises';
import path from 'path';

export interface BuildState {
  projectId: string;
  projectName: string;
  projectPath: string;
  currentTask: {
    id: string;
    description: string;
    status: string;
  } | null;
  fileManifest: Array<{
    path: string;
    status: 'created' | 'modified' | 'deleted';
    timestamp: string;
  }>;
  dependencies: Record<string, string>;
  artifacts: {
    components: string[];
    apis: string[];
    pages: string[];
  };
  tasks: Array<{
    id: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'blocked';
    dependencies: string[];
    startedAt?: string;
    completedAt?: string;
    error?: string;
  }>;
  activityLog: Array<{
    timestamp: string;
    type: 'task_started' | 'task_completed' | 'task_failed' | 'file_created' | 'file_modified' | 'git_commit' | 'error';
    description: string;
    metadata?: any;
  }>;
  lastActivity: string;
  buildPhase: 'initialized' | 'planning' | 'in_progress' | 'paused' | 'completed' | 'failed';
  completedTasks: number;
  totalTasks: number;
  designSystemApplied: boolean;
  blockers?: Array<{
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export class BuildStateManager {

  /**
   * Initialize new build state
   */
  async initialize(config: {
    projectId: string;
    projectName: string;
    projectPath: string;
  }): Promise<BuildState> {
    const buildState: BuildState = {
      projectId: config.projectId,
      projectName: config.projectName,
      projectPath: config.projectPath,
      currentTask: null,
      fileManifest: [],
      dependencies: {},
      artifacts: {
        components: [],
        apis: [],
        pages: []
      },
      tasks: [],
      activityLog: [],
      lastActivity: new Date().toISOString(),
      buildPhase: 'initialized',
      completedTasks: 0,
      totalTasks: 0,
      designSystemApplied: false
    };

    await this.save(config.projectPath, buildState);
    return buildState;
  }

  /**
   * Load build state
   */
  async load(projectPath: string): Promise<BuildState | null> {
    try {
      const buildStatePath = path.join(projectPath, '.buildrunner', 'BUILD_STATE.json');
      const content = await fs.readFile(buildStatePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Save build state
   */
  async save(projectPath: string, state: BuildState): Promise<void> {
    const buildStatePath = path.join(projectPath, '.buildrunner', 'BUILD_STATE.json');
    await fs.writeFile(buildStatePath, JSON.stringify(state, null, 2));
  }

  /**
   * Update current task
   */
  async updateCurrentTask(
    projectPath: string,
    task: { id: string; description: string; status: string } | null
  ): Promise<void> {
    const state = await this.load(projectPath);
    if (!state) return;

    state.currentTask = task;
    state.lastActivity = new Date().toISOString();
    await this.save(projectPath, state);
  }

  /**
   * Add file to manifest
   */
  async addFile(
    projectPath: string,
    filePath: string,
    status: 'created' | 'modified' | 'deleted'
  ): Promise<void> {
    const state = await this.load(projectPath);
    if (!state) return;

    // Remove existing entry for this file
    state.fileManifest = state.fileManifest.filter(f => f.path !== filePath);

    // Add new entry
    state.fileManifest.push({
      path: filePath,
      status,
      timestamp: new Date().toISOString()
    });

    state.lastActivity = new Date().toISOString();
    await this.save(projectPath, state);
  }

  /**
   * Add activity log entry
   */
  async addActivity(
    projectPath: string,
    type: BuildState['activityLog'][0]['type'],
    description: string,
    metadata?: any
  ): Promise<void> {
    const state = await this.load(projectPath);
    if (!state) return;

    state.activityLog.push({
      timestamp: new Date().toISOString(),
      type,
      description,
      metadata
    });

    // Keep only last 1000 entries
    if (state.activityLog.length > 1000) {
      state.activityLog = state.activityLog.slice(-1000);
    }

    state.lastActivity = new Date().toISOString();
    await this.save(projectPath, state);
  }

  /**
   * Update task status
   */
  async updateTaskStatus(
    projectPath: string,
    taskId: string,
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'blocked',
    error?: string
  ): Promise<void> {
    const state = await this.load(projectPath);
    if (!state) return;

    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.status = status;

    if (status === 'in_progress') {
      task.startedAt = new Date().toISOString();
    } else if (status === 'completed') {
      task.completedAt = new Date().toISOString();
      state.completedTasks++;
    } else if (status === 'failed') {
      task.error = error;
    }

    state.lastActivity = new Date().toISOString();
    await this.save(projectPath, state);
  }

  /**
   * Set task list
   */
  async setTasks(projectPath: string, tasks: BuildState['tasks']): Promise<void> {
    const state = await this.load(projectPath);
    if (!state) return;

    state.tasks = tasks;
    state.totalTasks = tasks.length;
    state.completedTasks = tasks.filter(t => t.status === 'completed').length;
    state.lastActivity = new Date().toISOString();

    await this.save(projectPath, state);
  }

  /**
   * Update build phase
   */
  async updatePhase(
    projectPath: string,
    phase: BuildState['buildPhase']
  ): Promise<void> {
    const state = await this.load(projectPath);
    if (!state) return;

    state.buildPhase = phase;
    state.lastActivity = new Date().toISOString();
    await this.save(projectPath, state);
  }

  /**
   * Add artifact
   */
  async addArtifact(
    projectPath: string,
    type: 'components' | 'apis' | 'pages',
    name: string
  ): Promise<void> {
    const state = await this.load(projectPath);
    if (!state) return;

    if (!state.artifacts[type].includes(name)) {
      state.artifacts[type].push(name);
    }

    state.lastActivity = new Date().toISOString();
    await this.save(projectPath, state);
  }

  /**
   * Add blocker
   */
  async addBlocker(
    projectPath: string,
    description: string,
    severity: 'low' | 'medium' | 'high'
  ): Promise<void> {
    const state = await this.load(projectPath);
    if (!state) return;

    if (!state.blockers) {
      state.blockers = [];
    }

    state.blockers.push({ description, severity });
    state.lastActivity = new Date().toISOString();
    await this.save(projectPath, state);
  }

  /**
   * Clear blockers
   */
  async clearBlockers(projectPath: string): Promise<void> {
    const state = await this.load(projectPath);
    if (!state) return;

    state.blockers = [];
    state.lastActivity = new Date().toISOString();
    await this.save(projectPath, state);
  }

  /**
   * Get build progress percentage
   */
  async getProgress(projectPath: string): Promise<number> {
    const state = await this.load(projectPath);
    if (!state || state.totalTasks === 0) return 0;

    return Math.round((state.completedTasks / state.totalTasks) * 100);
  }
}

export const buildStateManager = new BuildStateManager();
