import { NextRequest, NextResponse } from 'next/server';
import { orchestratorManager } from '../../../../lib/orchestrator-manager';

export async function POST(request: NextRequest) {
  console.log('Build pause API called');

  try {
    const body = await request.json();
    const { buildId } = body;

    if (!buildId) {
      console.error('Missing buildId');
      return NextResponse.json(
        { error: 'buildId is required' },
        { status: 400 }
      );
    }

    const orchestrator = orchestratorManager.get(buildId);

    if (!orchestrator) {
      console.error(`Build ${buildId} not found`);
      return NextResponse.json(
        { error: 'Build session not found' },
        { status: 404 }
      );
    }

    console.log(`Pausing build ${buildId}`);
    orchestrator.pauseBuild();

    return NextResponse.json({
      buildId,
      status: 'paused',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error pausing build:', error);
    return NextResponse.json(
      { error: `Failed to pause build: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
