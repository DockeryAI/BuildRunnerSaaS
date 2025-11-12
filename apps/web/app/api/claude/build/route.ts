/**
 * Claude Build API
 * Endpoint for starting/managing Claude builds
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildOrchestrator } from '@/lib/build-orchestrator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, projectId, projectName, productIdea, prd, projectPlan, projectPath } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Missing action parameter' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'start':
        // Start new Claude build
        if (!projectName || !productIdea || !prd) {
          return NextResponse.json(
            { error: 'Missing required parameters: projectName, productIdea, prd' },
            { status: 400 }
          );
        }

        // Start build asynchronously (don't await)
        buildOrchestrator.startClaudeBuild({
          projectName,
          projectId: projectId || `project_${Date.now()}`,
          productIdea,
          prd,
          projectPlan: projectPlan || {}
        }).catch(error => {
          console.error('Claude build error:', error);
        });

        return NextResponse.json({
          success: true,
          message: 'Claude build started',
          projectId: projectId || `project_${Date.now()}`
        });

      case 'pause':
        // Pause build (handled by orchestrator events)
        return NextResponse.json({
          success: true,
          message: 'Build pause requested'
        });

      case 'resume':
        // Resume build
        if (!projectPath) {
          return NextResponse.json(
            { error: 'Missing projectPath parameter' },
            { status: 400 }
          );
        }

        // Create orchestrator for resume
        const resumeOrchestrator = new BuildOrchestrator();
        const resumeBuildId = projectId || `claude_resume_${Date.now()}`;

        // Store orchestrator
        orchestratorManager.set(resumeBuildId, resumeOrchestrator);

        // Resume build asynchronously
        resumeOrchestrator.resumeClaudeBuild({
          projectPath,
          projectId: resumeBuildId
        }).catch((error) => {
          console.error(`Claude resume ${resumeBuildId} failed:`, error);
        });

        return NextResponse.json({
          success: true,
          message: 'Build resume started',
          buildId: resumeBuildId
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Claude build API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing projectId parameter' },
        { status: 400 }
      );
    }

    // Get build status (from BUILD_STATE.json)
    // This would need to be implemented
    return NextResponse.json({
      success: true,
      message: 'Build status retrieval not yet implemented'
    });

  } catch (error) {
    console.error('Claude build status API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
