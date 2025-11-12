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

      // Subscribe to ALL orchestrator events and forward them
      const sendEvent = (data: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (err) {
          console.error('Failed to send SSE event:', err);
        }
      };

      // Generic event handler that forwards everything
      const createEventHandler = (eventType: string) => {
        return (event: any) => {
          // Handle events without payloads
          const eventData = event || {};
          sendEvent({
            type: eventType,
            ...eventData,
            timestamp: eventData.timestamp || new Date().toISOString()
          });
        };
      };

      // List of ALL events the orchestrator emits
      const eventTypes = [
        'log',
        'build:started',
        'build:completed',
        'build:error',
        'build:paused',
        'build:resumed',
        'build:stopped',
        'build:preview_ready',
        'build:batches',
        'component:started',
        'component:completed',
        'component:recovery_started',
        'component:recovery_succeeded',
        'component:recovery_failed',
        'progress:updated',
        'phase:started',
        'phase:completed',
        'phase:failed',
        'phase:progress',
        'planning:started',
        'planning:completed',
        'wave:start',
        'wave:complete',
        'llm:request',
        'llm:response',
        'llm:error',
        'llm:fallback',
        'consensus:started',
        'consensus:completed',
        'consensus:iteration',
        'consensus:achieved',
        'consensus:message',
        'model:error',
        'verification:started',
        'verification:completed',
        'verification:failed',
        'testing:started',
        'testing:completed',
        'loop_detection:started',
        'loop_detection:stopped',
        'loop:detected',
        'intervention:triggered',
        'intervention:resolved',
        'intervention:brainstorm_completed',
        'intervention:user_input_required',
        'brainstorm:started',
        'brainstorm:completed',
        'brainstorm:model_error',
        'strategy:applying',
        'strategy:applied',
        'microplan:started',
        'microplan:completed',
        'microstep:started',
        'microstep:completed',
        'microstep:failed',
        'microstep:fallback',
        'rollback:started',
        'rollback:completed',
        'message:received',
        'claude:output',
        'claude:error',
        'claude:prompt',
        'task:started',
        'task:completed',
        'task:failed',
        'task:list_generated'
      ];

      // Create handlers map
      const handlers = new Map();
      eventTypes.forEach(eventType => {
        const handler = createEventHandler(eventType);
        handlers.set(eventType, handler);
        orchestrator.on(eventType, handler);
      });

      // Special handling for build completion/error to close stream
      const originalBuildCompleted = handlers.get('build:completed');
      const originalBuildError = handlers.get('build:error');

      orchestrator.off('build:completed', originalBuildCompleted);
      orchestrator.off('build:error', originalBuildError);

      orchestrator.on('build:completed', (event: any) => {
        originalBuildCompleted(event);
        setTimeout(() => controller.close(), 100);
      });

      orchestrator.on('build:error', (event: any) => {
        originalBuildError(event);
        setTimeout(() => controller.close(), 100);
      });

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        console.log(`📡 SSE connection closed for build ${buildId}`);
        eventTypes.forEach(eventType => {
          const handler = handlers.get(eventType);
          if (handler) {
            orchestrator.off(eventType, handler);
          }
        });
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
