/**
 * Handoff Reader
 * Reads and parses handoff documents when resuming builds
 */

import fs from 'fs/promises';
import path from 'path';

export interface HandoffContext {
  projectPath: string;
  lastHandoff?: {
    timestamp: string;
    content: string;
    summary: string;
  };
  buildState?: any;
  designSystem?: string;
  componentCatalog?: string;
  buildDoc?: string;
  taskList?: string;
  recommendations: string[];
}

export class HandoffReader {

  /**
   * Read all handoff context for resuming a build
   */
  async read(projectPath: string): Promise<HandoffContext> {
    const buildRunnerDir = path.join(projectPath, '.buildrunner');
    const context: HandoffContext = {
      projectPath,
      recommendations: []
    };

    // Read last handoff
    try {
      const handoffPath = path.join(buildRunnerDir, 'HANDOFF.md');
      const handoffContent = await fs.readFile(handoffPath, 'utf-8');

      // Extract timestamp
      const timestampMatch = handoffContent.match(/\*Generated: (.*?)\*/);
      const timestamp = timestampMatch ? timestampMatch[1] : 'Unknown';

      // Extract summary (first few sections)
      const summaryMatch = handoffContent.match(/## Current Status(.*?)## Project Context/s);
      const summary = summaryMatch ? summaryMatch[1].trim() : 'No summary available';

      context.lastHandoff = {
        timestamp,
        content: handoffContent,
        summary
      };

      context.recommendations.push('Review HANDOFF.md for recent build activity');
    } catch {
      context.recommendations.push('No handoff found - this may be a fresh build');
    }

    // Read BUILD_STATE.json
    try {
      const buildStatePath = path.join(buildRunnerDir, 'BUILD_STATE.json');
      const buildStateContent = await fs.readFile(buildStatePath, 'utf-8');
      context.buildState = JSON.parse(buildStateContent);
      context.recommendations.push('BUILD_STATE.json loaded successfully');
    } catch {
      context.recommendations.push('⚠️ Warning: BUILD_STATE.json not found or invalid');
    }

    // Read DESIGN_SYSTEM.md
    try {
      const designSystemPath = path.join(buildRunnerDir, 'DESIGN_SYSTEM.md');
      context.designSystem = await fs.readFile(designSystemPath, 'utf-8');
      context.recommendations.push('Design system loaded - maintain consistency');
    } catch {
      context.recommendations.push('⚠️ Warning: DESIGN_SYSTEM.md not found');
    }

    // Read COMPONENT_CATALOG.md
    try {
      const catalogPath = path.join(buildRunnerDir, 'COMPONENT_CATALOG.md');
      context.componentCatalog = await fs.readFile(catalogPath, 'utf-8');
      context.recommendations.push('Component catalog loaded');
    } catch {
      context.recommendations.push('⚠️ Warning: COMPONENT_CATALOG.md not found');
    }

    // Read BUILD_DOC.md
    try {
      const buildDocPath = path.join(buildRunnerDir, 'BUILD_DOC.md');
      context.buildDoc = await fs.readFile(buildDocPath, 'utf-8');
      context.recommendations.push('BUILD_DOC.md loaded - review requirements');
    } catch {
      context.recommendations.push('⚠️ Warning: BUILD_DOC.md not found');
    }

    // Read TASKS.md
    try {
      const tasksPath = path.join(buildRunnerDir, 'TASKS.md');
      context.taskList = await fs.readFile(tasksPath, 'utf-8');
      context.recommendations.push('Task list loaded');
    } catch {
      context.recommendations.push('⚠️ Warning: TASKS.md not found');
    }

    return context;
  }

  /**
   * Generate Claude prompt from handoff context
   */
  generateResumePrompt(context: HandoffContext): string {
    let prompt = `# Resuming Build

You are resuming a build that was previously paused. Here is the context:

`;

    if (context.lastHandoff) {
      prompt += `## Last Handoff (${context.lastHandoff.timestamp})

${context.lastHandoff.summary}

`;
    }

    if (context.buildState) {
      const { completedTasks, totalTasks, currentTask, buildPhase } = context.buildState;
      prompt += `## Build Progress

- **Phase:** ${buildPhase}
- **Completed Tasks:** ${completedTasks}/${totalTasks}
${currentTask ? `- **Current Task:** ${currentTask.description} (${currentTask.status})` : ''}

`;
    }

    prompt += `## Available Context Documents

`;

    if (context.buildDoc) {
      prompt += `✅ BUILD_DOC.md - Project requirements and overview\n`;
    }
    if (context.designSystem) {
      prompt += `✅ DESIGN_SYSTEM.md - Design standards to maintain\n`;
    }
    if (context.componentCatalog) {
      prompt += `✅ COMPONENT_CATALOG.md - Available components\n`;
    }
    if (context.taskList) {
      prompt += `✅ TASKS.md - Complete task list\n`;
    }

    prompt += `\n## Recommendations

${context.recommendations.map(r => `- ${r}`).join('\n')}

---

**Next Action:** Review the handoff details and continue with the next pending task. Maintain all quality standards and design consistency established in previous work.
`;

    return prompt;
  }

  /**
   * Get next task from context
   */
  getNextTask(context: HandoffContext): any | null {
    if (!context.buildState || !context.buildState.tasks) {
      return null;
    }

    // Find next executable task (dependencies met, status = pending)
    const tasks = context.buildState.tasks;
    const completedTaskIds = new Set(
      tasks.filter((t: any) => t.status === 'completed').map((t: any) => t.id)
    );

    return tasks.find((task: any) =>
      task.status === 'pending' &&
      (!task.dependencies || task.dependencies.every((dep: string) => completedTaskIds.has(dep)))
    ) || null;
  }

  /**
   * List all available handoff snapshots
   */
  async listHandoffs(projectPath: string): Promise<Array<{
    timestamp: string;
    path: string;
  }>> {
    const handoffsDir = path.join(projectPath, '.buildrunner', 'handoffs');

    try {
      const files = await fs.readdir(handoffsDir);
      return files
        .filter(f => f.startsWith('handoff-') && f.endsWith('.md'))
        .map(f => ({
          timestamp: f.replace('handoff-', '').replace('.md', ''),
          path: path.join(handoffsDir, f)
        }))
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    } catch {
      return [];
    }
  }
}

export const handoffReader = new HandoffReader();
