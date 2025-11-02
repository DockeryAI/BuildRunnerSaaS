import { NextRequest, NextResponse } from 'next/server';

// Import orchestrators map from start endpoint
let orchestrators: Map<string, any>;

async function getOrchestrators() {
  if (!orchestrators) {
    const startModule = await import('../start/route');
    orchestrators = startModule.orchestrators;
  }
  return orchestrators;
}

export async function GET(request: NextRequest) {
  console.log('Build status API called');

  const { searchParams } = new URL(request.url);
  const buildId = searchParams.get('buildId');

  if (!buildId) {
    return NextResponse.json(
      { error: 'buildId query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const orchestratorsMap = await getOrchestrators();
    const orchestrator = orchestratorsMap.get(buildId);

    if (!orchestrator) {
      console.error(`Build ${buildId} not found`);
      return NextResponse.json(
        { error: 'Build session not found' },
        { status: 404 }
      );
    }

    console.log(`Getting status for build ${buildId}`);
    const status = orchestrator.getStatus();

    return NextResponse.json({
      buildId,
      status,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error getting build status:', error);
    return NextResponse.json(
      { error: `Failed to get build status: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
