/**
 * Gap Analyzer V2
 * Analyzes completed Claude builds for gaps and missing pieces
 * Works with ~/Projects/ directory structure and BUILD_STATE.json
 */

import { buildStateManager } from './build-state-manager';
import { promises as fs } from 'fs';
import path from 'path';

export interface Gap {
  taskId: string;
  type: 'missing_file' | 'missing_integration' | 'broken_dependency' | 'incomplete_task' | 'missing_test';
  severity: 'high' | 'medium' | 'low';
  message: string;
  suggestion?: string;
}

export interface GapAnalysisReport {
  projectPath: string;
  projectName: string;
  analyzedAt: string;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  gaps: Gap[];
  severity: 'high' | 'medium' | 'low';
  recommendations: string[];
}

/**
 * Analyzes completed Claude builds for gaps
 */
export class GapAnalyzerV2 {

  /**
   * Analyze gaps in a Claude build
   */
  async analyzeGaps(projectPath: string): Promise<GapAnalysisReport> {
    const buildState = await buildStateManager.load(projectPath);
    if (!buildState) {
      throw new Error('BUILD_STATE.json not found');
    }

    const gaps: Gap[] = [];
    const recommendations: string[] = [];

    // Check completed tasks
    const completedTasks = buildState.tasks.filter(t => t.status === 'completed');
    const failedTasks = buildState.tasks.filter(t => t.status === 'failed');
    const pendingTasks = buildState.tasks.filter(t => t.status === 'pending');

    // Check 1: Failed tasks are gaps
    for (const task of failedTasks) {
      gaps.push({
        taskId: task.id,
        type: 'incomplete_task',
        severity: 'high',
        message: `Task failed: ${task.description}`,
        suggestion: task.error ? `Error: ${task.error}` : 'Retry this task'
      });
    }

    // Check 2: Pending tasks with no blockers are gaps
    const blockersPresent = buildState.blockers && buildState.blockers.length > 0;
    if (pendingTasks.length > 0 && !blockersPresent) {
      gaps.push({
        taskId: 'general',
        type: 'incomplete_task',
        severity: 'medium',
        message: `${pendingTasks.length} tasks still pending`,
        suggestion: 'Resume the build to complete remaining tasks'
      });
    }

    // Check 3: File manifest integrity
    const filesCreated = buildState.fileManifest.filter(f => f.status === 'created');
    for (const file of filesCreated) {
      const fullPath = path.join(projectPath, file.path);
      try {
        await fs.access(fullPath);
      } catch {
        gaps.push({
          taskId: 'file-integrity',
          type: 'missing_file',
          severity: 'high',
          message: `File missing: ${file.path}`,
          suggestion: 'File was created but is now missing - may need regeneration'
        });
      }
    }

    // Check 4: package.json exists and has dependencies
    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

      if (!packageJson.dependencies || Object.keys(packageJson.dependencies).length === 0) {
        gaps.push({
          taskId: 'dependencies',
          type: 'broken_dependency',
          severity: 'medium',
          message: 'No dependencies in package.json',
          suggestion: 'Run dependency auto-detection or install manually'
        });
      }

      // Check if node_modules exists
      try {
        await fs.access(path.join(projectPath, 'node_modules'));
      } catch {
        gaps.push({
          taskId: 'dependencies',
          type: 'broken_dependency',
          severity: 'high',
          message: 'node_modules not found - dependencies not installed',
          suggestion: 'Run npm install or yarn install'
        });
      }
    } catch {
      gaps.push({
        taskId: 'dependencies',
        type: 'missing_file',
        severity: 'high',
        message: 'package.json not found',
        suggestion: 'Project structure may be corrupted'
      });
    }

    // Check 5: Core Next.js files exist
    const coreFiles = [
      'src/app/layout.tsx',
      'src/app/page.tsx',
      'tailwind.config.ts',
      'tsconfig.json'
    ];

    for (const file of coreFiles) {
      try {
        await fs.access(path.join(projectPath, file));
      } catch {
        gaps.push({
          taskId: 'structure',
          type: 'missing_file',
          severity: 'high',
          message: `Core file missing: ${file}`,
          suggestion: 'Project structure incomplete - may need reinitialization'
        });
      }
    }

    // Check 6: Build documents exist
    const buildDocs = [
      '.buildrunner/BUILD_DOC.md',
      '.buildrunner/DESIGN_SYSTEM.md',
      '.buildrunner/COMPONENT_CATALOG.md',
      '.buildrunner/TASKS.md'
    ];

    for (const doc of buildDocs) {
      try {
        await fs.access(path.join(projectPath, doc));
      } catch {
        gaps.push({
          taskId: 'documentation',
          type: 'missing_file',
          severity: 'low',
          message: `Build document missing: ${doc}`,
          suggestion: 'Regenerate build documents'
        });
      }
    }

    // Generate recommendations
    if (gaps.length === 0) {
      recommendations.push('✅ No gaps found - build is complete');
      recommendations.push('✅ All tasks completed successfully');
      recommendations.push('✅ All files present');
    } else {
      const highSeverity = gaps.filter(g => g.severity === 'high').length;
      const mediumSeverity = gaps.filter(g => g.severity === 'medium').length;

      if (highSeverity > 0) {
        recommendations.push(`⚠️  ${highSeverity} high-severity gaps require immediate attention`);
      }
      if (mediumSeverity > 0) {
        recommendations.push(`⚠️  ${mediumSeverity} medium-severity gaps should be addressed`);
      }

      if (failedTasks.length > 0) {
        recommendations.push('🔄 Review failed tasks and retry with fixes');
      }

      if (pendingTasks.length > 0) {
        recommendations.push('▶️  Resume build to complete pending tasks');
      }

      // Check if dependencies need installation
      const depGaps = gaps.filter(g => g.type === 'broken_dependency');
      if (depGaps.length > 0) {
        recommendations.push('📦 Run: npm install');
      }

      // Check if TypeScript/build would work
      recommendations.push('🔨 Test build: npm run build');
      recommendations.push('🧪 Run tests: npm test');
    }

    return {
      projectPath,
      projectName: buildState.projectName,
      analyzedAt: new Date().toISOString(),
      totalTasks: buildState.totalTasks,
      completedTasks: buildState.completedTasks,
      failedTasks: failedTasks.length,
      gaps,
      severity: this.calculateSeverity(gaps),
      recommendations
    };
  }

  /**
   * Calculate overall severity
   */
  private calculateSeverity(gaps: Gap[]): 'high' | 'medium' | 'low' {
    if (gaps.some(g => g.severity === 'high')) {
      return 'high';
    }
    if (gaps.some(g => g.severity === 'medium')) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Save gap analysis report
   */
  async saveReport(report: GapAnalysisReport): Promise<void> {
    const reportPath = path.join(report.projectPath, '.buildrunner', 'GAP_ANALYSIS.md');

    const markdown = this.generateMarkdown(report);
    await fs.writeFile(reportPath, markdown);
  }

  /**
   * Generate markdown report
   */
  private generateMarkdown(report: GapAnalysisReport): string {
    let md = `# Gap Analysis Report\n\n`;
    md += `**Project:** ${report.projectName}\n`;
    md += `**Analyzed:** ${new Date(report.analyzedAt).toLocaleString()}\n`;
    md += `**Overall Severity:** ${report.severity.toUpperCase()}\n\n`;
    md += `---\n\n`;

    md += `## Summary\n\n`;
    md += `- **Total Tasks:** ${report.totalTasks}\n`;
    md += `- **Completed:** ${report.completedTasks}\n`;
    md += `- **Failed:** ${report.failedTasks}\n`;
    md += `- **Gaps Found:** ${report.gaps.length}\n\n`;

    if (report.gaps.length === 0) {
      md += `✅ **No gaps found!** Build is complete and healthy.\n\n`;
    } else {
      md += `## Gaps Identified\n\n`;

      const byType = {
        missing_file: report.gaps.filter(g => g.type === 'missing_file'),
        missing_integration: report.gaps.filter(g => g.type === 'missing_integration'),
        broken_dependency: report.gaps.filter(g => g.type === 'broken_dependency'),
        incomplete_task: report.gaps.filter(g => g.type === 'incomplete_task'),
        missing_test: report.gaps.filter(g => g.type === 'missing_test')
      };

      for (const [type, gaps] of Object.entries(byType)) {
        if (gaps.length === 0) continue;

        md += `### ${type.replace(/_/g, ' ').toUpperCase()} (${gaps.length})\n\n`;

        gaps.forEach(gap => {
          const icon = gap.severity === 'high' ? '🔴' : gap.severity === 'medium' ? '🟡' : '🟢';
          md += `${icon} **[${gap.severity.toUpperCase()}]** ${gap.message}\n`;
          if (gap.suggestion) {
            md += `   💡 *${gap.suggestion}*\n`;
          }
          md += `\n`;
        });
      }
    }

    md += `## Recommendations\n\n`;
    report.recommendations.forEach(rec => {
      md += `${rec}\n`;
    });
    md += `\n`;

    md += `---\n\n`;
    md += `*Gap analysis generated by BuildRunner + Claude CLI*\n`;

    return md;
  }
}

export const gapAnalyzerV2 = new GapAnalyzerV2();
