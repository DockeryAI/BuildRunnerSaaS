/**
 * Git Manager
 * Handles git operations for builds
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface GitCommitOptions {
  message: string;
  taskId?: string;
  type?: 'feat' | 'fix' | 'chore' | 'docs' | 'style' | 'refactor' | 'test';
}

export interface GitStatus {
  branch: string;
  modified: string[];
  untracked: string[];
  staged: string[];
  ahead: number;
  behind: number;
}

export class GitManager {

  /**
   * Initialize git repository
   */
  async init(projectPath: string): Promise<void> {
    try {
      await execAsync('git init', { cwd: projectPath });
      await execAsync('git branch -M main', { cwd: projectPath });
    } catch (error) {
      throw new Error(`Git init failed: ${error}`);
    }
  }

  /**
   * Get git status
   */
  async status(projectPath: string): Promise<GitStatus> {
    try {
      const { stdout: branchOutput } = await execAsync('git branch --show-current', { cwd: projectPath });
      const { stdout: statusOutput } = await execAsync('git status --porcelain', { cwd: projectPath });

      const lines = statusOutput.trim().split('\n').filter(Boolean);

      const modified: string[] = [];
      const untracked: string[] = [];
      const staged: string[] = [];

      lines.forEach(line => {
        const status = line.substring(0, 2);
        const file = line.substring(3);

        if (status.includes('M')) modified.push(file);
        if (status.includes('?')) untracked.push(file);
        if (status[0] !== ' ' && status[0] !== '?') staged.push(file);
      });

      // Get ahead/behind status
      let ahead = 0;
      let behind = 0;
      try {
        const { stdout: aheadBehind } = await execAsync('git rev-list --left-right --count HEAD...@{u}', { cwd: projectPath });
        const [aheadStr, behindStr] = aheadBehind.trim().split('\t');
        ahead = parseInt(aheadStr) || 0;
        behind = parseInt(behindStr) || 0;
      } catch {
        // No upstream set
      }

      return {
        branch: branchOutput.trim() || 'main',
        modified,
        untracked,
        staged,
        ahead,
        behind
      };
    } catch (error) {
      throw new Error(`Git status failed: ${error}`);
    }
  }

  /**
   * Stage files
   */
  async add(projectPath: string, files: string[] | '.'): Promise<void> {
    try {
      const fileArg = Array.isArray(files) ? files.join(' ') : files;
      await execAsync(`git add ${fileArg}`, { cwd: projectPath });
    } catch (error) {
      throw new Error(`Git add failed: ${error}`);
    }
  }

  /**
   * Commit with semantic message
   */
  async commit(projectPath: string, options: GitCommitOptions): Promise<void> {
    try {
      const message = this.formatCommitMessage(options);

      // Escape special characters in commit message
      const escapedMessage = message.replace(/"/g, '\\"');

      await execAsync(`git commit -m "${escapedMessage}"`, { cwd: projectPath });
    } catch (error) {
      throw new Error(`Git commit failed: ${error}`);
    }
  }

  /**
   * Format semantic commit message
   */
  private formatCommitMessage(options: GitCommitOptions): string {
    const { message, taskId, type } = options;

    let formattedMessage = '';

    // Add type prefix if provided
    if (type) {
      formattedMessage += `${type}: `;
    }

    // Add message
    formattedMessage += message;

    // Add task ID if provided
    if (taskId) {
      formattedMessage += `\n\nTask-ID: ${taskId}`;
    }

    // Add BuildRunner footer
    formattedMessage += '\n\n🤖 Generated with BuildRunner + Claude CLI';
    formattedMessage += '\nCo-Authored-By: Claude <noreply@anthropic.com>';

    return formattedMessage;
  }

  /**
   * Create GitHub repository
   */
  async createGitHubRepo(projectPath: string, projectName: string): Promise<string | null> {
    try {
      const repoName = projectName.replace(/\s+/g, '-').toLowerCase();

      // Check if gh CLI is available
      try {
        await execAsync('gh --version');
      } catch {
        console.warn('GitHub CLI (gh) not available - skipping repo creation');
        return null;
      }

      // Create repo
      const { stdout } = await execAsync(
        `gh repo create ${repoName} --private --source=. --remote=origin --push`,
        { cwd: projectPath }
      );

      // Extract repo URL
      const urlMatch = stdout.match(/https:\/\/github\.com\/[^\s]+/);
      return urlMatch ? urlMatch[0] : null;

    } catch (error) {
      console.warn('GitHub repo creation failed:', error);
      return null;
    }
  }

  /**
   * Push to remote
   */
  async push(projectPath: string, force: boolean = false): Promise<void> {
    try {
      const forceFlag = force ? ' --force' : '';
      await execAsync(`git push${forceFlag}`, { cwd: projectPath });
    } catch (error) {
      throw new Error(`Git push failed: ${error}`);
    }
  }

  /**
   * Create and checkout branch
   */
  async createBranch(projectPath: string, branchName: string): Promise<void> {
    try {
      await execAsync(`git checkout -b ${branchName}`, { cwd: projectPath });
    } catch (error) {
      throw new Error(`Git branch creation failed: ${error}`);
    }
  }

  /**
   * Checkout branch
   */
  async checkout(projectPath: string, branchName: string): Promise<void> {
    try {
      await execAsync(`git checkout ${branchName}`, { cwd: projectPath });
    } catch (error) {
      throw new Error(`Git checkout failed: ${error}`);
    }
  }

  /**
   * Get commit history
   */
  async log(projectPath: string, limit: number = 10): Promise<Array<{
    hash: string;
    message: string;
    author: string;
    date: string;
  }>> {
    try {
      const { stdout } = await execAsync(
        `git log -${limit} --pretty=format:"%H|%s|%an|%ai"`,
        { cwd: projectPath }
      );

      return stdout.trim().split('\n').map(line => {
        const [hash, message, author, date] = line.split('|');
        return { hash, message, author, date };
      });
    } catch (error) {
      return [];
    }
  }

  /**
   * Get diff summary
   */
  async diff(projectPath: string): Promise<string> {
    try {
      const { stdout } = await execAsync('git diff --stat', { cwd: projectPath });
      return stdout;
    } catch (error) {
      return '';
    }
  }

  /**
   * Check if directory is git repository
   */
  async isRepo(projectPath: string): Promise<boolean> {
    try {
      await execAsync('git rev-parse --git-dir', { cwd: projectPath });
      return true;
    } catch {
      return false;
    }
  }
}

export const gitManager = new GitManager();
