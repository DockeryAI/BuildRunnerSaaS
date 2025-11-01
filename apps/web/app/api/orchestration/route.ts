/**
 * Orchestration System API Routes
 *
 * REST API endpoints for the autonomous development orchestration system.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  orchestrator,
  featureRegistry,
  verificationEngine,
  stateMonitor,
  problemSolver,
  interventionSystem,
  prdSync,
  llmGateway,
  getOrchestrationDashboard,
} from '@/lib/orchestration';

// ============================================================================
// GET - Dashboard & Status
// ============================================================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'dashboard':
        return NextResponse.json({
          success: true,
          data: getOrchestrationDashboard(),
        });

      case 'features':
        return NextResponse.json({
          success: true,
          data: featureRegistry.getAllFeatures(),
        });

      case 'agents':
        return NextResponse.json({
          success: true,
          data: {
            active: orchestrator.getActiveAgents(),
            stuck: orchestrator.getStuckAgents(),
          },
        });

      case 'interventions':
        const limit = parseInt(searchParams.get('limit') || '10');
        return NextResponse.json({
          success: true,
          data: interventionSystem.getRecentInterventions(limit),
        });

      case 'costs':
        return NextResponse.json({
          success: true,
          data: llmGateway.getCostStats(),
        });

      case 'sync-status':
        const syncFeatures = JSON.parse(searchParams.get('features') || '[]');
        const syncStatus = await prdSync.checkSyncStatus(syncFeatures);
        return NextResponse.json({
          success: true,
          data: syncStatus,
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Available: dashboard, features, agents, interventions, costs, sync-status',
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Orchestration API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// ============================================================================
// POST - Actions & Operations
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      // ======================================================================
      // Feature Management
      // ======================================================================

      case 'add-feature':
        const { feature } = body;
        const newFeature = featureRegistry.addFeature(feature);
        return NextResponse.json({
          success: true,
          data: newFeature,
        });

      case 'update-feature':
        const { featureId, updates } = body;
        const updated = featureRegistry.updateFeature(featureId, updates);
        return NextResponse.json({
          success: true,
          data: updated,
        });

      case 'complete-feature':
        const { featureId: completeId, evidence } = body;
        const completed = featureRegistry.completeFeature(completeId, evidence);
        return NextResponse.json({
          success: true,
          data: completed,
        });

      case 'add-blocker':
        const { featureId: blockedId, blocker } = body;
        const blocked = featureRegistry.addBlocker(blockedId, blocker);
        return NextResponse.json({
          success: true,
          data: blocked,
        });

      // ======================================================================
      // Verification
      // ======================================================================

      case 'verify-phase':
        const { phase } = body;
        const phaseResult = await verificationEngine.verifyPhaseCompletion(phase);
        return NextResponse.json({
          success: true,
          data: phaseResult,
        });

      case 'verify-features':
        const { featureIds } = body;
        const featuresResult = await verificationEngine.verifyFeatures(featureIds);
        return NextResponse.json({
          success: true,
          data: featuresResult,
        });

      case 'enforce-completion':
        const { phase: enforcePhase, maxAttempts } = body;
        const enforceResult = await verificationEngine.enforceCompletion(
          enforcePhase,
          maxAttempts || 5
        );
        return NextResponse.json({
          success: true,
          data: { completed: enforceResult },
        });

      // ======================================================================
      // Problem Solving
      // ======================================================================

      case 'solve-problem':
        const { problem } = body;
        const solution = await problemSolver.solveProblem(problem);
        return NextResponse.json({
          success: true,
          data: solution,
        });

      case 'track-action':
        const { agent, actionData } = body;
        const loop = await stateMonitor.trackAction(agent, actionData);
        return NextResponse.json({
          success: true,
          data: { loopDetected: loop !== null, loop },
        });

      // ======================================================================
      // Orchestration Control
      // ======================================================================

      case 'start-supervision':
        const { intervalMs } = body;
        await orchestrator.startSupervision(intervalMs || 30000);
        return NextResponse.json({
          success: true,
          data: { message: 'Supervision started' },
        });

      case 'stop-supervision':
        orchestrator.stopSupervision();
        return NextResponse.json({
          success: true,
          data: { message: 'Supervision stopped' },
        });

      case 'register-agent':
        const { agentData } = body;
        const registeredAgent = orchestrator.registerAgent(agentData);
        return NextResponse.json({
          success: true,
          data: registeredAgent,
        });

      // ======================================================================
      // PRD Sync
      // ======================================================================

      case 'sync-prd':
        const { prdFeatures, direction } = body;

        if (direction === 'to-registry' || !direction) {
          await prdSync.syncPRDToRegistry(prdFeatures);
        }

        const syncedFeatures = direction === 'to-prd'
          ? prdSync.getRegistryFeaturesForPRD()
          : featureRegistry.getAllFeatures();

        return NextResponse.json({
          success: true,
          data: syncedFeatures,
        });

      case 'manual-sync':
        const { features: manualFeatures } = body;
        await prdSync.manualSync(manualFeatures);
        return NextResponse.json({
          success: true,
          data: { message: 'Manual sync completed' },
        });

      // ======================================================================
      // LLM Operations
      // ======================================================================

      case 'llm-request':
        const { llmRequest } = body;
        const llmResponse = await llmGateway.request(llmRequest);
        return NextResponse.json({
          success: true,
          data: llmResponse,
        });

      case 'multi-llm-consult':
        const { request: consultRequest, models } = body;
        const multiResponse = await llmGateway.consultMultiple(consultRequest, models);
        return NextResponse.json({
          success: true,
          data: multiResponse,
        });

      case 'clear-cache':
        llmGateway.clearCache();
        return NextResponse.json({
          success: true,
          data: { message: 'Cache cleared' },
        });

      // ======================================================================
      // Feature Extraction
      // ======================================================================

      case 'extract-from-spec':
        const { specContent } = body;
        const extractedFeatures = await featureRegistry.extractFeaturesFromSpec(specContent);
        return NextResponse.json({
          success: true,
          data: extractedFeatures,
        });

      case 'extract-from-prd':
        const { prdDescription } = body;
        const extractedPRDFeatures = await featureRegistry.extractFeaturesFromPRD(prdDescription);
        return NextResponse.json({
          success: true,
          data: extractedPRDFeatures,
        });

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`,
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Orchestration API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// ============================================================================
// DELETE - Cleanup Operations
// ============================================================================

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'clear-history':
        const agent = searchParams.get('agent');
        if (agent) {
          stateMonitor.clearHistory(agent);
          return NextResponse.json({
            success: true,
            data: { message: `Cleared history for ${agent}` },
          });
        }
        return NextResponse.json({
          success: false,
          error: 'Agent parameter required',
        }, { status: 400 });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Orchestration API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
