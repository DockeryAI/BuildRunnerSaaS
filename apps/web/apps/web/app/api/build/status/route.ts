import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

/**
 * Get build status from Claude Builder daemon
 * Reads BUILD_STATUS.md from the project directory
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectName = searchParams.get('projectName');

    if (!projectName) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    // Try to find BUILD_STATUS.md in either location
    const buildRunnerProjectsPath = join(homedir(), 'Projects', 'BuildRunnerProjects', projectName, 'BUILD_STATUS.md');
    const projectsPath = join(homedir(), 'Projects', projectName, 'BUILD_STATUS.md');

    let statusPath = '';
    if (existsSync(buildRunnerProjectsPath)) {
      statusPath = buildRunnerProjectsPath;
    } else if (existsSync(projectsPath)) {
      statusPath = projectsPath;
    } else {
      // No build status file yet - return idle state
      return NextResponse.json({
        status: 'idle',
        progress: {
          totalProgress: 0,
          currentPhase: 'idle',
          phaseProgress: 0,
          components: [],
        },
        plan: {
          phases: [],
        },
      });
    }

    // Read and parse BUILD_STATUS.md
    const content = await readFile(statusPath, 'utf-8');
    const parsed = parseBuildStatus(content);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error reading build status:', error);
    return NextResponse.json(
      { error: 'Failed to read build status' },
      { status: 500 }
    );
  }
}

/**
 * Parse BUILD_STATUS.md content into structured data
 */
function parseBuildStatus(content: string) {
  const lines = content.split('\n');

  let status = 'idle';
  let totalProgress = 0;
  let currentPhase = 'idle';
  let phaseProgress = 0;
  const components: any[] = [];
  const phases: any[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('Status:')) {
      status = line.split(':')[1].trim().toLowerCase();
    }

    if (line.includes('Progress:')) {
      const match = line.match(/(\d+)%/);
      if (match) {
        totalProgress = parseInt(match[1]);
      }
    }

    if (line.startsWith('Phase:') || line.startsWith('Current Phase:')) {
      currentPhase = line.split(':')[1].trim().toLowerCase();
    }

    if (line.startsWith('Phase Progress:')) {
      const match = line.match(/(\d+)%/);
      if (match) {
        phaseProgress = parseInt(match[1]);
      }
    }
  }

  return {
    status,
    progress: {
      totalProgress,
      currentPhase,
      phaseProgress,
      components,
    },
    plan: {
      phases,
      currentPhase,
    },
  };
}
