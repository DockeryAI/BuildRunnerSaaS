import { NextRequest, NextResponse } from 'next/server';
import { BuildOrchestrator, BuildComponent } from '../../../../lib/build-orchestrator';
import { orchestratorManager } from '../../../../lib/orchestrator-manager';

export async function POST(request: NextRequest) {
  console.log('Build start API called');

  try {
    const body = await request.json();
    const { components, config, projectId } = body;

    if (!components || !Array.isArray(components)) {
      console.error('Invalid components:', components);
      return NextResponse.json(
        { error: 'Components array is required' },
        { status: 400 }
      );
    }

    console.log('Build API - Project ID:', projectId || 'using default');

    // Get API keys - prioritize environment variable over client-provided keys
    let openrouterKey = process.env.OPENROUTER_API_KEY || '';

    // Only use client-provided key if no environment variable is set
    if (!openrouterKey) {
      const apiKeys = request.headers.get('x-api-keys');
      if (apiKeys) {
        try {
          const keys = JSON.parse(apiKeys);
          openrouterKey = keys.openrouter || '';
          console.log('Using client-provided OpenRouter key:', !!openrouterKey);
        } catch (e) {
          console.warn('Failed to parse API keys from headers:', e);
        }
      }
    } else {
      console.log('Using environment OpenRouter key:', !!openrouterKey);
    }

    if (!openrouterKey) {
      console.error('No OpenRouter API key available');
      return NextResponse.json(
        { error: 'OpenRouter API key not configured. Please add it in Settings → API Keys.' },
        { status: 400 }
      );
    }

    // Create orchestrator with API key, optional custom config, and projectId
    const orchestrator = new BuildOrchestrator(openrouterKey, config, projectId);

    // Store orchestrator instance in shared manager
    const buildId = (orchestrator as any).state.id;
    orchestratorManager.set(buildId, orchestrator);

    console.log(`Starting build ${buildId} with ${components.length} components`);

    // Start the build asynchronously
    orchestrator.startBuild(components as BuildComponent[]).catch((error) => {
      console.error(`Build ${buildId} failed:`, error);
    });

    return NextResponse.json({
      buildId,
      status: 'started',
      componentsCount: components.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error starting build:', error);
    return NextResponse.json(
      { error: `Failed to start build: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
