import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ClaudeDesignAdapter } from '../../../../lib/claude-design-adapter';
import { DesignSpec } from '../../../../lib/design-system-generator';

/**
 * Export PRD to Claude Builder daemon directory
 *
 * POST /api/claude-builder/export-prd
 *
 * Body:
 * {
 *   projectName: string,
 *   prdContent: string
 * }
 *
 * This writes the PRD.md file to ~/Projects/BuildRunnerProjects/{projectName}/
 * which triggers the daemon to detect changes and start a build.
 */
export async function POST(request: NextRequest) {
  try {
    const { projectName, prdContent, designSpec, industry } = await request.json();

    // Validate input
    if (!projectName || !prdContent) {
      return NextResponse.json(
        { error: 'projectName and prdContent are required' },
        { status: 400 }
      );
    }

    // Sanitize project name (remove dangerous characters)
    const sanitizedName = projectName
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!sanitizedName) {
      return NextResponse.json(
        { error: 'Invalid project name' },
        { status: 400 }
      );
    }

    // Get projects root from config or use default
    const homeDir = os.homedir();
    const projectsRoot = path.join(homeDir, 'Projects', 'BuildRunnerProjects');
    const projectPath = path.join(projectsRoot, sanitizedName);
    const prdPath = path.join(projectPath, 'PRD.md');

    // Create project directory if it doesn't exist
    if (!fs.existsSync(projectsRoot)) {
      fs.mkdirSync(projectsRoot, { recursive: true });
    }

    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
    }

    // Inject design system if provided (Material Design 3 integration)
    let finalPRD = prdContent;

    if (designSpec) {
      console.log(`[Claude Builder] Injecting Material Design 3 tokens for ${industry || 'default'} industry`);
      finalPRD = ClaudeDesignAdapter.injectDesignSystemIntoPRD(
        prdContent,
        projectName,
        industry || 'default',
        designSpec as DesignSpec
      );
      console.log(`[Claude Builder] Design system injected (${finalPRD.length - prdContent.length} chars added)`);
    }

    // Write PRD.md
    fs.writeFileSync(prdPath, finalPRD, 'utf8');

    console.log(`[Claude Builder] PRD exported to: ${prdPath}`);

    return NextResponse.json({
      success: true,
      message: 'PRD exported successfully',
      path: prdPath,
      projectName: sanitizedName,
    });

  } catch (error) {
    console.error('[Claude Builder] Export error:', error);

    return NextResponse.json(
      {
        error: 'Failed to export PRD',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Get build status for a project
 *
 * GET /api/claude-builder/export-prd?projectName=MyProject
 *
 * Returns the contents of BUILD_STATUS.md if it exists
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectName = searchParams.get('projectName');

    if (!projectName) {
      return NextResponse.json(
        { error: 'projectName is required' },
        { status: 400 }
      );
    }

    const sanitizedName = projectName.replace(/[^a-zA-Z0-9-_]/g, '-');
    const homeDir = os.homedir();
    const projectsRoot = path.join(homeDir, 'Projects', 'BuildRunnerProjects');
    const projectPath = path.join(projectsRoot, sanitizedName);
    const statusPath = path.join(projectPath, 'BUILD_STATUS.md');

    if (!fs.existsSync(statusPath)) {
      return NextResponse.json({
        exists: false,
        status: 'No build status available',
      });
    }

    const content = fs.readFileSync(statusPath, 'utf8');

    // Parse basic info from markdown
    const progressMatch = content.match(/\*\*Progress:\*\* (\d+)%/);
    const statusMatch = content.match(/\*\*Status:\*\* (.+)/);
    const lastUpdatedMatch = content.match(/\*\*Last Updated:\*\* (.+)/);

    return NextResponse.json({
      exists: true,
      content,
      progress: progressMatch ? parseInt(progressMatch[1]) : 0,
      status: statusMatch ? statusMatch[1] : 'Unknown',
      lastUpdated: lastUpdatedMatch ? lastUpdatedMatch[1] : null,
    });

  } catch (error) {
    console.error('[Claude Builder] Get status error:', error);

    return NextResponse.json(
      {
        error: 'Failed to get build status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
