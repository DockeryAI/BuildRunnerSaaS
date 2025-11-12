import { BuildTask, TaskList, taskListGenerator } from './task-list-generator';
import { promises as fs } from 'fs';
import path from 'path';

export interface Gap {
  taskId: string;
  type: 'missing_file' | 'missing_integration' | 'broken_dependency';
  severity: 'high' | 'medium' | 'low';
  message: string;
}

export interface GapAnalysisReport {
  projectId: string;
  analyzedAt: string;
  totalTasks: number;
  completedTasks: number;
  gaps: Gap[];
  severity: 'high' | 'low';
}

/**
 * Analyzes completed build for gaps and missing pieces
 */
export class GapAnalyzer {
  async analyzeGaps(projectId: string): Promise<GapAnalysisReport> {
    const taskList = await taskListGenerator.loadTaskList(projectId);
    if (!taskList) {
      throw new Error(`Task list not found for project ${projectId}`);
    }

    const gaps: Gap[] = [];
    const buildDir = this.getBuildDirectory(projectId);

    // Check each completed task
    for (const task of taskList.tasks.filter(t => t.status === 'completed')) {
      // Check if expected file exists
      if (task.expectedFile) {
        const filePath = path.join(buildDir, task.expectedFile);
        try {
          await fs.access(filePath);
        } catch {
          gaps.push({
            taskId: task.id,
            type: 'missing_file',
            severity: 'high',
            message: `Expected file missing: ${task.expectedFile}`
          });
        }
      }

      // Check API-Component integrations
      if (task.type === 'component' && task.dependencies.length > 0) {
        const apiDeps = taskList.tasks.filter(
          t => task.dependencies.includes(t.id) && t.type === 'api'
        );

        for (const apiDep of apiDeps) {
          const integrationExists = await this.checkIntegration(
            buildDir,
            task,
            apiDep
          );

          if (!integrationExists) {
            gaps.push({
              taskId: task.id,
              type: 'missing_integration',
              severity: 'medium',
              message: `Component ${task.componentName} missing integration with ${apiDep.endpoint}`
            });
          }
        }
      }
    }

    return {
      projectId,
      analyzedAt: new Date().toISOString(),
      totalTasks: taskList.totalTasks,
      completedTasks: taskList.completedTasks,
      gaps,
      severity: gaps.some(g => g.severity === 'high') ? 'high' : 'low'
    };
  }

  /**
   * Fill identified gaps
   */
  async fillGaps(projectId: string, report: GapAnalysisReport): Promise<void> {
    const taskList = await taskListGenerator.loadTaskList(projectId);
    if (!taskList) return;

    for (const gap of report.gaps) {
      const task = taskList.tasks.find(t => t.id === gap.taskId);
      if (!task) continue;

      if (gap.type === 'missing_file') {
        // Re-execute the task
        console.log(`Regenerating ${task.title}...`);
        // TODO: Call task executor to re-run
      } else if (gap.type === 'missing_integration') {
        // Add integration code
        console.log(`Fixing integration for ${task.title}...`);
        // TODO: Call integration fixer
      }
    }
  }

  /**
   * Save gap analysis report
   */
  async saveReport(report: GapAnalysisReport): Promise<void> {
    const buildDir = this.getBuildDirectory(report.projectId);
    const reportPath = path.join(buildDir, 'GAP_ANALYSIS.md');

    let md = `# Gap Analysis Report\n\n`;
    md += `Project: ${report.projectId}\n`;
    md += `Analyzed: ${report.analyzedAt}\n`;
    md += `Total Tasks: ${report.totalTasks}\n`;
    md += `Completed: ${report.completedTasks}\n`;
    md += `Gaps Found: ${report.gaps.length}\n`;
    md += `Severity: ${report.severity}\n\n`;
    md += `---\n\n`;

    if (report.gaps.length === 0) {
      md += `## ✅ No gaps found!\n\nAll tasks completed successfully with expected outputs.\n`;
    } else {
      md += `## Gaps Found\n\n`;

      const highSeverity = report.gaps.filter(g => g.severity === 'high');
      const mediumSeverity = report.gaps.filter(g => g.severity === 'medium');

      if (highSeverity.length > 0) {
        md += `### 🔴 Critical Gaps (High Severity)\n\n`;
        for (const gap of highSeverity) {
          md += `- **Task:** \`${gap.taskId}\`\n`;
          md += `  - **Type:** ${gap.type}\n`;
          md += `  - **Issue:** ${gap.message}\n\n`;
        }
      }

      if (mediumSeverity.length > 0) {
        md += `### 🟡 Minor Gaps (Medium Severity)\n\n`;
        for (const gap of mediumSeverity) {
          md += `- **Task:** \`${gap.taskId}\`\n`;
          md += `  - **Type:** ${gap.type}\n`;
          md += `  - **Issue:** ${gap.message}\n\n`;
        }
      }
    }

    await fs.writeFile(reportPath, md);
  }

  private async checkIntegration(
    buildDir: string,
    componentTask: BuildTask,
    apiTask: BuildTask
  ): Promise<boolean> {
    if (!componentTask.expectedFile) return false;

    const filePath = path.join(buildDir, componentTask.expectedFile);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const apiEndpoint = apiTask.endpoint || '';
      return content.includes(apiEndpoint);
    } catch {
      return false;
    }
  }

  private getBuildDirectory(projectId: string): string {
    return path.join(process.cwd(), 'builds', projectId);
  }
}

export const gapAnalyzer = new GapAnalyzer();
