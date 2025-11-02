import { NextRequest, NextResponse } from 'next/server';
import { orchestratorManager } from '../../../../lib/orchestrator-manager';

export async function POST(request: NextRequest) {
  console.log('Build message API called');

  try {
    const body = await request.json();
    const { buildId, message } = body;

    if (!buildId || !message) {
      console.error('Missing required fields:', { buildId: !!buildId, message: !!message });
      return NextResponse.json(
        { error: 'buildId and message are required' },
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

    console.log(`Sending message to build ${buildId}:`, message);
    const response = await orchestrator.sendMessage(message);

    return NextResponse.json({
      buildId,
      message,
      response,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error sending message to build:', error);
    return NextResponse.json(
      { error: `Failed to send message: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
