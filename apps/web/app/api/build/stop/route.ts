import { NextRequest, NextResponse } from 'next/server';
import { orchestratorManager } from '../../../../lib/orchestrator-manager';

export async function POST(request: NextRequest) {
  console.log('Build stop API called');

  try {
    const body = await request.json();
    const { buildId } = body;

    if (!buildId) {
      return NextResponse.json(
        { error: 'buildId is required' },
        { status: 400 }
      );
    }

    console.log('🛑 Stopping build:', buildId);

    const orchestrator = orchestratorManager.get(buildId);

    if (!orchestrator) {
      return NextResponse.json(
        { error: 'Build session not found' },
        { status: 404 }
      );
    }

    orchestrator.stopBuild();

    return NextResponse.json({
      success: true,
      buildId,
      message: 'Build stopped successfully'
    });

  } catch (error) {
    console.error('Error stopping build:', error);
    return NextResponse.json(
      { error: `Failed to stop build: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
