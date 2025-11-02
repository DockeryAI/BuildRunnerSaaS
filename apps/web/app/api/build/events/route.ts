import { NextRequest } from 'next/server';
import { orchestratorManager } from '../../../../lib/orchestrator-manager';

export async function GET(request: NextRequest) {
  console.log('Build events SSE API called');

  const { searchParams } = new URL(request.url);
  const buildId = searchParams.get('buildId');

  if (!buildId) {
    return new Response('buildId query parameter is required', { status: 400 });
  }

  try {
    const orchestrator = orchestratorManager.get(buildId);

    if (!orchestrator) {
      return new Response('Build session not found', { status: 404 });
    }

    console.log(`Starting SSE stream for build ${buildId}`);

    // Create a ReadableStream for Server-Sent Events
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();

        // Helper function to send SSE messages
        const sendEvent = (event: string, data: any) => {
          const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        // Send initial connection event
        sendEvent('connected', {
          buildId,
          timestamp: new Date().toISOString(),
        });

        // Listen to all orchestrator events
        const eventHandlers: { [key: string]: (data: any) => void } = {
          // Build lifecycle events
          'build:started': (data) => sendEvent('build_started', data),
          'build:completed': (data) => sendEvent('build_completed', data),
          'build:paused': (data) => sendEvent('build_paused', data),
          'build:resumed': (data) => sendEvent('build_resumed', data),
          'build:error': (data) => sendEvent('build_error', data),

          // Phase events
          'phase:started': (data) => sendEvent('phase_started', data),
          'phase:completed': (data) => sendEvent('phase_completed', data),
          'phase:failed': (data) => sendEvent('phase_failed', data),

          // Component events
          'component:started': (data) => sendEvent('component_started', data),
          'component:completed': (data) => sendEvent('component_completed', data),
          'component:failed': (data) => sendEvent('component_failed', data),
          'component:recovery_started': (data) => sendEvent('component_recovery_started', data),
          'component:recovery_succeeded': (data) => sendEvent('component_recovery_succeeded', data),
          'component:recovery_failed': (data) => sendEvent('component_recovery_failed', data),

          // Progress events
          'progress:updated': (data) => sendEvent('progress_updated', data),

          // Planning events
          'planning:started': (data) => sendEvent('planning_started', data),
          'planning:completed': (data) => sendEvent('planning_completed', data),

          // Verification events
          'verification:started': (data) => sendEvent('verification_started', data),
          'verification:completed': (data) => sendEvent('verification_completed', data),
          'verification:failed': (data) => sendEvent('verification_failed', data),

          // Testing events
          'testing:started': (data) => sendEvent('testing_started', data),
          'testing:completed': (data) => sendEvent('testing_completed', data),

          // Consensus events
          'consensus:started': (data) => sendEvent('consensus_started', data),
          'consensus:completed': (data) => sendEvent('consensus_completed', data),

          // Loop detection events
          'loop_detection:started': (data) => sendEvent('loop_detection_started', data),
          'loop_detection:stopped': (data) => sendEvent('loop_detection_stopped', data),
          'loop:detected': (data) => sendEvent('loop_detected', data),

          // Intervention events
          'intervention:triggered': (data) => sendEvent('intervention_triggered', data),
          'intervention:resolved': (data) => sendEvent('intervention_resolved', data),
          'intervention:brainstorm_completed': (data) => sendEvent('intervention_brainstorm_completed', data),
          'intervention:user_input_required': (data) => sendEvent('intervention_user_input_required', data),

          // Brainstorm events
          'brainstorm:started': (data) => sendEvent('brainstorm_started', data),
          'brainstorm:completed': (data) => sendEvent('brainstorm_completed', data),
          'brainstorm:model_error': (data) => sendEvent('brainstorm_model_error', data),

          // Strategy events
          'strategy:applying': (data) => sendEvent('strategy_applying', data),
          'strategy:applied': (data) => sendEvent('strategy_applied', data),

          // Micro-plan events
          'microplan:started': (data) => sendEvent('microplan_started', data),
          'microplan:completed': (data) => sendEvent('microplan_completed', data),
          'microstep:started': (data) => sendEvent('microstep_started', data),
          'microstep:completed': (data) => sendEvent('microstep_completed', data),
          'microstep:failed': (data) => sendEvent('microstep_failed', data),
          'microstep:fallback': (data) => sendEvent('microstep_fallback', data),

          // LLM events
          'llm:request': (data) => sendEvent('llm_request', data),
          'llm:response': (data) => sendEvent('llm_response', data),
          'llm:error': (data) => sendEvent('llm_error', data),
          'llm:fallback': (data) => sendEvent('llm_fallback', data),

          // Logging events
          'log': (data) => sendEvent('log', data),

          // Message events
          'message:received': (data) => sendEvent('message_received', data),

          // Model events
          'model:error': (data) => sendEvent('model_error', data),

          // Rollback events
          'rollback:started': (data) => sendEvent('rollback_started', data),
          'rollback:completed': (data) => sendEvent('rollback_completed', data),
        };

        // Attach all event listeners
        Object.entries(eventHandlers).forEach(([event, handler]) => {
          orchestrator.on(event, handler);
        });

        // Send periodic heartbeat to keep connection alive
        const heartbeatInterval = setInterval(() => {
          sendEvent('heartbeat', { timestamp: new Date().toISOString() });
        }, 15000); // Every 15 seconds

        // Send current status immediately
        const currentStatus = orchestrator.getStatus();
        sendEvent('build_status', currentStatus);

        // Cleanup on client disconnect
        request.signal.addEventListener('abort', () => {
          console.log(`SSE connection closed for build ${buildId}`);
          clearInterval(heartbeatInterval);

          // Remove all event listeners
          Object.entries(eventHandlers).forEach(([event, handler]) => {
            orchestrator.off(event, handler);
          });

          controller.close();
        });
      },
    });

    // Return SSE response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error creating SSE stream:', error);
    return new Response(`Failed to create event stream: ${(error as Error).message}`, {
      status: 500,
    });
  }
}
