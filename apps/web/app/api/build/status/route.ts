import { NextRequest } from 'next/server';
import { orchestratorManager } from '../../../../lib/orchestrator-manager';

/**
 * GET /api/build/status?buildId=xxx
 *
 * Streams BuildOrchestrator events via Server-Sent Events (SSE)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const buildId = searchParams.get('buildId');

  if (!buildId) {
    return new Response(
      JSON.stringify({ error: 'buildId is required' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Get orchestrator instance
  const orchestrator = orchestratorManager.get(buildId);

  if (!orchestrator) {
    return new Response(
      JSON.stringify({ error: `Build ${buildId} not found or has completed` }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Set up Server-Sent Events stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      console.log(`📡 SSE connection opened for build ${buildId}`);

      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
        type: 'connected',
        buildId,
        message: 'Connected to build stream'
      })}\n\n`));

      // Subscribe to orchestrator events
      const sendEvent = (data: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (err) {
          console.error('Failed to send SSE event:', err);
        }
      };

      // Log events
      const onLog = (event: any) => {
        sendEvent({
          type: 'log',
          level: event.level,
          message: event.message,
          timestamp: new Date().toISOString()
        });
      };

      // Component progress
      const onComponentStarted = (event: any) => {
        sendEvent({
          type: 'component:started',
          componentId: event.componentId,
          componentName: event.componentName,
          status: 'building',
          progress: 0
        });
      };

      const onComponentCompleted = (event: any) => {
        sendEvent({
          type: 'component:completed',
          componentId: event.componentId,
          componentName: event.componentName,
          status: 'completed',
          progress: 100
        });
      };

      const onProgressUpdated = (event: any) => {
        sendEvent({
          type: 'progress:updated',
          componentId: event.componentId,
          componentName: event.componentName,
          progress: event.progress
        });
      };

      // Phase events
      const onPhaseStarted = (event: any) => {
        sendEvent({
          type: 'phase:started',
          phase: event.phase
        });
      };

      const onPhaseCompleted = (event: any) => {
        sendEvent({
          type: 'phase:completed',
          phase: event.phase
        });
      };

      // Build lifecycle
      const onBuildCompleted = (event: any) => {
        sendEvent({
          type: 'build:completed',
          buildId: event.buildId,
          status: 'completed'
        });
        controller.close();
      };

      const onBuildError = (event: any) => {
        sendEvent({
          type: 'build:error',
          buildId: event.buildId,
          error: event.error,
          status: 'error'
        });
        controller.close();
      };

      // Attach event listeners
      orchestrator.on('log', onLog);
      orchestrator.on('component:started', onComponentStarted);
      orchestrator.on('component:completed', onComponentCompleted);
      orchestrator.on('progress:updated', onProgressUpdated);
      orchestrator.on('phase:started', onPhaseStarted);
      orchestrator.on('phase:completed', onPhaseCompleted);
      orchestrator.on('build:completed', onBuildCompleted);
      orchestrator.on('build:error', onBuildError);

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        console.log(`📡 SSE connection closed for build ${buildId}`);
        orchestrator.off('log', onLog);
        orchestrator.off('component:started', onComponentStarted);
        orchestrator.off('component:completed', onComponentCompleted);
        orchestrator.off('progress:updated', onProgressUpdated);
        orchestrator.off('phase:started', onPhaseStarted);
        orchestrator.off('phase:completed', onPhaseCompleted);
        orchestrator.off('build:completed', onBuildCompleted);
        orchestrator.off('build:error', onBuildError);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
