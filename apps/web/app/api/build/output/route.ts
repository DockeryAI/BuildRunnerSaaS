import { NextRequest } from 'next/server';
import { readFile, stat, watch } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

/**
 * Stream Claude CLI output in real-time
 *
 * This endpoint provides Server-Sent Events (SSE) streaming of the
 * CLAUDE_OUTPUT.log file written by the daemon during builds.
 *
 * The frontend can consume this as an EventSource to display live
 * Claude CLI output in the terminal.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectName = searchParams.get('projectName');

  if (!projectName) {
    return new Response('Project name is required', { status: 400 });
  }

  // Find the CLAUDE_OUTPUT.log file
  const buildRunnerProjectsPath = join(
    homedir(),
    'Projects',
    'BuildRunnerProjects',
    projectName,
    'CLAUDE_OUTPUT.log'
  );
  const projectsPath = join(homedir(), 'Projects', projectName, 'CLAUDE_OUTPUT.log');

  let logPath = '';
  if (existsSync(buildRunnerProjectsPath)) {
    logPath = buildRunnerProjectsPath;
  } else if (existsSync(projectsPath)) {
    logPath = projectsPath;
  } else {
    // No log file yet - return empty stream
    return new Response('No build output available', { status: 404 });
  }

  // Create SSE stream
  const encoder = new TextEncoder();
  let lastSize = 0;
  let aborted = false;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial content
        const initialContent = await readFile(logPath, 'utf-8');
        lastSize = initialContent.length;

        if (initialContent) {
          const lines = initialContent.split('\n');
          for (const line of lines) {
            if (line.trim()) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ line })}\n\n`));
            }
          }
        }

        // Watch for changes
        const watcher = watch(logPath);

        const checkInterval = setInterval(async () => {
          try {
            if (aborted) {
              clearInterval(checkInterval);
              return;
            }

            const stats = await stat(logPath);
            const currentSize = stats.size;

            if (currentSize > lastSize) {
              // New content available
              const content = await readFile(logPath, 'utf-8');
              const newContent = content.slice(lastSize);
              lastSize = currentSize;

              const lines = newContent.split('\n');
              for (const line of lines) {
                if (line.trim()) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ line })}\n\n`));
                }
              }
            }
          } catch (error) {
            // File might have been deleted or build completed
            clearInterval(checkInterval);
            controller.enqueue(encoder.encode('data: {"complete": true}\n\n'));
            controller.close();
          }
        }, 500); // Check every 500ms

        // Handle watcher events
        (async () => {
          try {
            for await (const event of watcher) {
              if (aborted) break;

              if (event.eventType === 'change') {
                try {
                  const stats = await stat(logPath);
                  const currentSize = stats.size;

                  if (currentSize > lastSize) {
                    const content = await readFile(logPath, 'utf-8');
                    const newContent = content.slice(lastSize);
                    lastSize = currentSize;

                    const lines = newContent.split('\n');
                    for (const line of lines) {
                      if (line.trim()) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ line })}\n\n`));
                      }
                    }
                  }
                } catch (error) {
                  // Ignore read errors during streaming
                }
              }
            }
          } catch (error) {
            // Watcher stopped
          } finally {
            clearInterval(checkInterval);
            controller.enqueue(encoder.encode('data: {"complete": true}\n\n'));
            controller.close();
          }
        })();

        // Handle client disconnect
        request.signal.addEventListener('abort', () => {
          aborted = true;
          clearInterval(checkInterval);
          controller.close();
        });
      } catch (error) {
        console.error('Error streaming Claude output:', error);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`)
        );
        controller.close();
      }
    },

    cancel() {
      aborted = true;
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
