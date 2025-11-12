/**
 * Handoff Generation API
 * Generate handoff documents for paused builds
 */

import { NextRequest, NextResponse } from 'next/server';
import { handoffGenerator } from '@/lib/handoff-generator';
import path from 'path';
import os from 'os';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectName, projectPath: customPath } = body;

    if (!projectName) {
      return NextResponse.json(
        { error: 'Missing projectName parameter' },
        { status: 400 }
      );
    }

    // Determine project path
    const projectPath = customPath || path.join(os.homedir(), 'Projects', projectName);

    // Extract handoff data from BUILD_STATE.json
    const handoffData = await handoffGenerator.extractFromBuildState(projectPath);

    if (!handoffData) {
      return NextResponse.json(
        { error: 'Failed to extract build state' },
        { status: 500 }
      );
    }

    // Save handoff document
    await handoffGenerator.save(handoffData);

    return NextResponse.json({
      success: true,
      message: 'Handoff document generated successfully',
      handoffPath: path.join(projectPath, '.buildrunner', 'HANDOFF.md')
    });

  } catch (error) {
    console.error('Handoff generation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
