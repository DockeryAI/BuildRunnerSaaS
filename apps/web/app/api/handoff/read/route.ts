/**
 * Handoff Reading API
 * Read handoff context for resuming builds
 */

import { NextRequest, NextResponse } from 'next/server';
import { handoffReader } from '@/lib/handoff-reader';
import path from 'path';
import os from 'os';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectName = searchParams.get('projectName');
    const projectPath = searchParams.get('projectPath');

    if (!projectName && !projectPath) {
      return NextResponse.json(
        { error: 'Missing projectName or projectPath parameter' },
        { status: 400 }
      );
    }

    // Determine project path
    const resolvedPath = projectPath || path.join(os.homedir(), 'Projects', projectName!);

    // Read handoff context
    const context = await handoffReader.read(resolvedPath);

    // Generate resume prompt
    const resumePrompt = handoffReader.generateResumePrompt(context);

    // Get next task
    const nextTask = handoffReader.getNextTask(context);

    return NextResponse.json({
      success: true,
      context,
      resumePrompt,
      nextTask,
      recommendations: context.recommendations
    });

  } catch (error) {
    console.error('Handoff reading error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectName, projectPath: customPath } = body;

    if (!projectName && !customPath) {
      return NextResponse.json(
        { error: 'Missing projectName or projectPath parameter' },
        { status: 400 }
      );
    }

    // Determine project path
    const resolvedPath = customPath || path.join(os.homedir(), 'Projects', projectName);

    // List all handoff snapshots
    const handoffs = await handoffReader.listHandoffs(resolvedPath);

    return NextResponse.json({
      success: true,
      handoffs
    });

  } catch (error) {
    console.error('Handoff listing error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
