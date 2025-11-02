import { NextRequest, NextResponse } from 'next/server';
import { orchestratorManager } from '../../../../lib/orchestrator-manager';

export async function POST(request: NextRequest) {
  console.log('Build resume API called');

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

    console.log(`Resuming build ${buildId}`);
    orchestrator.resumeBuild();

    return NextResponse.json({
      buildId,
      status: 'resumed',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error resuming build:', error);
    return NextResponse.json(
      { error: `Failed to resume build: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
