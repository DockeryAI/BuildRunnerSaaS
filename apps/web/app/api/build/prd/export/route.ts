/**
 * PRD Export API
 * Exports PRD to file system and starts watcher
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import * as path from 'path';
import { prdWatcherManager } from '@/lib/prd-watcher';

export async function POST(request: NextRequest) {
  try {
    const { buildId, prdData, projectName, projectPath } = await request.json();

    if (!buildId || !prdData) {
      return NextResponse.json(
        { error: 'buildId and prdData are required' },
        { status: 400 }
      );
    }

    // Determine project path
    const resolvedProjectPath = projectPath ||
      path.join(process.env.HOME || '~', 'Projects', projectName || buildId);

    // Generate PRD markdown
    const prdMarkdown = generatePRDMarkdown(prdData, projectName || buildId);

    // Write PRD.md file
    const prdPath = path.join(resolvedProjectPath, 'PRD.md');
    await fs.writeFile(prdPath, prdMarkdown, 'utf-8');

    // Start PRD watcher if enabled
    if (process.env.ENABLE_PRD_WATCHING !== 'false') {
      const watcher = prdWatcherManager.create(prdPath, buildId);
      await watcher.start();
    }

    return NextResponse.json({
      success: true,
      message: 'PRD exported and watcher started',
      path: prdPath,
      watcherActive: process.env.ENABLE_PRD_WATCHING !== 'false'
    });

  } catch (error) {
    console.error('PRD export error:', error);
    return NextResponse.json(
      {
        error: 'Failed to export PRD',
        details: String(error)
      },
      { status: 500 }
    );
  }
}

function generatePRDMarkdown(prdData: any, projectName: string): string {
  const timestamp = new Date().toISOString();

  let markdown = `# ${projectName} - Product Requirements Document\n\n`;
  markdown += `*Last updated: ${timestamp}*\n\n`;
  markdown += `---\n\n`;

  // Product Overview
  if (prdData.productIdea) {
    markdown += `## Product Overview\n\n${prdData.productIdea}\n\n`;
  }

  // Features
  if (prdData.features && prdData.features.length > 0) {
    markdown += `## Features\n\n`;
    prdData.features.forEach((feature: any, index: number) => {
      markdown += `### ${index + 1}. ${feature.name}\n\n`;
      if (feature.description) {
        markdown += `${feature.description}\n\n`;
      }
      if (feature.priority) {
        markdown += `**Priority:** ${feature.priority}\n\n`;
      }
    });
  }

  // Technical Requirements
  if (prdData.technicalRequirements && prdData.technicalRequirements.length > 0) {
    markdown += `## Technical Requirements\n\n`;
    prdData.technicalRequirements.forEach((req: string) => {
      markdown += `- ${req}\n`;
    });
    markdown += `\n`;
  }

  // User Flows
  if (prdData.userFlows && prdData.userFlows.length > 0) {
    markdown += `## User Flows\n\n`;
    prdData.userFlows.forEach((flow: any) => {
      markdown += `### ${flow.name}\n\n`;
      if (flow.steps && flow.steps.length > 0) {
        flow.steps.forEach((step: string, index: number) => {
          markdown += `${index + 1}. ${step}\n`;
        });
        markdown += `\n`;
      }
    });
  }

  markdown += `---\n\n`;
  markdown += `*This PRD is monitored by BuildRunnerSaaS. Changes will trigger automatic rebuilds.*\n`;

  return markdown;
}
