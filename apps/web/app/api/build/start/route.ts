import { NextRequest, NextResponse } from 'next/server';
import { BuildOrchestrator, BuildComponent } from '../../../../lib/build-orchestrator';
import { orchestratorManager } from '../../../../lib/orchestrator-manager';

export async function POST(request: NextRequest) {
  console.log('Build start API called');

  try {
    const body = await request.json();
    const { components, config, projectId, productIdea, appConfig, prd, buildEngine, projectName, projectPlan } = body;

    if (!components || !Array.isArray(components)) {
      console.error('Invalid components:', components);
      return NextResponse.json(
        { error: 'Components array is required' },
        { status: 400 }
      );
    }

    // CRITICAL: PRD is single source of truth - auto-generate from prompt if needed
    let finalPRD = prd;

    if (!prd && productIdea) {
      // Auto-generate simple PRD from prompt (brainstorm is optional enhancement)
      console.log('📝 Auto-generating simple PRD from prompt...');
      finalPRD = {
        productName: projectId || 'Unnamed Project',
        productIdea: productIdea,
        description: productIdea,
        features: [],
        targetAudience: '',
        valueProposition: '',
        technicalRequirements: [],
        generatedAt: new Date().toISOString(),
        source: 'auto-generated-from-prompt'
      };
      console.log('✅ Simple PRD auto-generated - brainstorm can enhance later');
    } else if (!prd && !productIdea) {
      // No prompt at all - this is an error
      console.error('❌ BLOCKED: No prompt or PRD provided');
      return NextResponse.json(
        {
          error: 'Product idea or PRD required - provide a description of what you want to build',
          code: 'PROMPT_REQUIRED'
        },
        { status: 400 }
      );
    }

    console.log('Build API - Project ID:', projectId || 'using default');
    console.log('Build API - Build Engine: claude (ONLY OPTION)');
    console.log('Build API - PRD type:', finalPRD?.source || (prd ? 'full-brainstorm' : 'unknown'));
    console.log('Build API - Product Idea:', productIdea ? `"${productIdea.substring(0, 50)}..."` : 'not provided');

    // CLAUDE IS THE ONLY BUILD ENGINE
    // OpenRouter has been archived and is no longer available
    console.log('🤖 Using Claude CLI build engine');

    // Create orchestrator for Claude build
    const orchestrator = new BuildOrchestrator();
    const buildId = `claude_${Date.now()}`;

    // Store orchestrator
    orchestratorManager.set(buildId, orchestrator);

    // Start Claude build asynchronously
    orchestrator.startClaudeBuild({
      projectName: projectName || finalPRD?.productName || `Project ${buildId}`,
      projectId: buildId,
      productIdea: productIdea || finalPRD?.description || '',
      prd: finalPRD,
      projectPlan: projectPlan || {}
    }).catch((error) => {
      console.error(`Claude build ${buildId} failed:`, error);
    });

    return NextResponse.json({
      buildId,
      status: 'started',
      buildEngine: 'claude',
      projectName: projectName || finalPRD?.productName,
      timestamp: new Date().toISOString(),
    });

    /* ARCHIVED: OpenRouter multi-agent build engine (DEPRECATED)
     * This code has been archived and is no longer available for use.
     * All builds now use the Claude CLI sequential task-based system.
     *
     * Reason for archival: User explicitly requested Claude as the only build engine.
     * The OpenRouter system was producing failed builds and placeholder apps.
     *
     * Original OpenRouter build engine code below:

    // Get API keys - prioritize client-provided keys (from UI) over environment variable
    let openrouterKey = '';

    // First check for client-provided key from UI
    const apiKeys = request.headers.get('x-api-keys');
    if (apiKeys) {
      try {
        const keys = JSON.parse(apiKeys);
        openrouterKey = keys.openrouter || '';
        if (openrouterKey) {
          console.log('Using client-provided OpenRouter key from UI');
        }
      } catch (e) {
        console.warn('Failed to parse API keys from headers:', e);
      }
    }

    // Fall back to environment variable if no client key provided
    if (!openrouterKey) {
      openrouterKey = process.env.OPENROUTER_API_KEY || '';
      if (openrouterKey) {
        console.log('Using environment OpenRouter key');
      }
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

    // CRITICAL: Always set PRD as single source of truth (auto-generated or full)
    if (finalPRD) {
      const prdType = finalPRD.source === 'auto-generated-from-prompt' ? 'simple' : 'enhanced';
      console.log(`✅ Setting ${prdType} PRD as single source of truth`);
      (orchestrator as any).prdContext = finalPRD;
    }

    // Set product idea for backwards compatibility
    if (productIdea) {
      (orchestrator as any).productIdea = productIdea;
    }
    if (appConfig) {
      (orchestrator as any).appConfig = appConfig;
    }

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
    */
    // END OF ARCHIVED OPENROUTER CODE

  } catch (error) {
    console.error('Error starting build:', error);
    return NextResponse.json(
      { error: `Failed to start build: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
