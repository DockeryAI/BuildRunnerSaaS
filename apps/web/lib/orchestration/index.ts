/**
 * Autonomous Development Orchestration System
 * Main Index File
 *
 * Exports all components of the self-healing, self-verifying
 * AI development orchestration system.
 */

// ============================================================================
// Core Components
// ============================================================================

// Multi-LLM Gateway
export { llmGateway, LLMGateway } from './llm-gateway';
import { llmGateway } from './llm-gateway';

// Feature Registry
export { featureRegistry, FeatureRegistryManager } from './feature-registry';
import { featureRegistry } from './feature-registry';

// Verification Engine
export { verificationEngine, VerificationEngine } from './verification-engine';
import { verificationEngine } from './verification-engine';

// State Monitor
export { stateMonitor, StateMonitor } from './state-monitor';
import { stateMonitor } from './state-monitor';

// Problem Solver & Intervention
export {
  problemSolver,
  interventionSystem,
  MultiLLMProblemSolver,
  InterventionSystem,
} from './problem-solver';
import { problemSolver, interventionSystem } from './problem-solver';

// Orchestrator Agent
export { orchestrator, OrchestratorAgent } from './orchestrator';
import { orchestrator } from './orchestrator';

// PRD Sync
export { prdSync, PRDSyncManager } from './prd-sync';
import { prdSync } from './prd-sync';

// ============================================================================
// Types
// ============================================================================

import type { Problem } from './types';

export type {
  // Feature types
  Feature,
  FeatureStatus,
  Priority,
  FeatureRegistry,
  AcceptanceCriteria,
  Evidence,
  Blocker,

  // LLM types
  LLMRoute,
  LLMRequest,
  LLMResponse,
  MultiLLMResponse,
  LLMModel,
  TaskType,

  // Verification types
  VerificationResult,
  LLMVerification,
  VerificationLog,

  // State monitoring types
  Action,
  Loop,
  Pattern,

  // Problem solving types
  Problem,
  ComprehensiveContext,
  Strategy,
  Resolution,
  LLMSolution,
  MicroPlan,
  MicroStep,
  Result,

  // Intervention types
  Intervention,

  // Orchestrator types
  Agent,
  AgentStatus,
  OrchestrationState,
  LearningEntry,

  // PRD sync types
  PRDFeature,
  PRDChange,
  SyncStatus,
  Conflict,

  // API types
  APIResponse,
  RegistryUpdateRequest,
  VerificationRequest,
  InterventionRequest,
} from './types';

// ============================================================================
// Initialization Helper
// ============================================================================

/**
 * Initialize the entire orchestration system
 */
export async function initializeOrchestration(options?: {
  autoExtractFeatures?: boolean;
  startSupervision?: boolean;
  supervisionIntervalMs?: number;
  enablePRDSync?: boolean;
}) {
  const {
    autoExtractFeatures = false,
    startSupervision = false,
    supervisionIntervalMs = 30000,
    enablePRDSync = true,
  } = options || {};

  console.log('\n🎯 Initializing Autonomous Development Orchestration System');
  console.log('='.repeat(60));

  // 1. Initialize LLM Gateway
  console.log('✅ LLM Gateway initialized');

  // 2. Initialize Feature Registry
  if (autoExtractFeatures) {
    console.log('📋 Auto-extracting features from spec...');
    // Would extract features from spec here
  }
  console.log('✅ Feature Registry initialized');

  // 3. Initialize Verification Engine
  console.log('✅ Verification Engine initialized');

  // 4. Initialize State Monitor
  console.log('✅ State Monitor initialized');

  // 5. Initialize Problem Solver & Intervention System
  console.log('✅ Problem Solver & Intervention System initialized');

  // 6. Initialize PRD Sync
  if (enablePRDSync) {
    console.log('✅ PRD Sync initialized');
  }

  // 7. Initialize Orchestrator
  if (startSupervision) {
    console.log(`🔄 Starting supervision (every ${supervisionIntervalMs / 1000}s)...`);
    await orchestrator.startSupervision(supervisionIntervalMs);
  }
  console.log('✅ Orchestrator initialized');

  console.log('='.repeat(60));
  console.log('🎉 Orchestration System Ready!\n');

  return {
    llmGateway: llmGateway,
    featureRegistry: featureRegistry,
    verificationEngine: verificationEngine,
    stateMonitor: stateMonitor,
    problemSolver: problemSolver,
    interventionSystem: interventionSystem,
    orchestrator: orchestrator,
    prdSync: prdSync,
  };
}

/**
 * Get orchestration dashboard summary
 */
export function getOrchestrationDashboard() {
  return {
    summary: orchestrator.getDashboardSummary(),
    activeAgents: orchestrator.getActiveAgents(),
    stuckAgents: orchestrator.getStuckAgents(),
    recentInterventions: interventionSystem.getRecentInterventions(5),
    features: {
      total: featureRegistry.getAllFeatures().length,
      completed: featureRegistry.getFeaturesByStatus('completed').length,
      inProgress: featureRegistry.getFeaturesByStatus('in_progress').length,
      blocked: featureRegistry.getFeaturesByStatus('blocked').length,
      planned: featureRegistry.getFeaturesByStatus('planned').length,
    },
    llmCosts: llmGateway.getCostStats(),
  };
}

/**
 * Quick start for development
 */
export async function quickStart() {
  console.log('🚀 Quick Start - Orchestration System\n');

  const system = await initializeOrchestration({
    autoExtractFeatures: false,
    startSupervision: false, // Don't auto-start in development
    enablePRDSync: true,
  });

  console.log('💡 System ready! Available commands:');
  console.log('   - orchestrator.startSupervision()  # Start auto-supervision');
  console.log('   - getOrchestrationDashboard()      # View dashboard');
  console.log('   - featureRegistry.getAllFeatures() # List all features');
  console.log('   - verificationEngine.verifyPhaseCompletion(6) # Verify phase');
  console.log('\n');

  return system;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Extract features from spec file
 */
export async function extractFeaturesFromSpec(specPath: string) {
  // Would read and parse spec file
  console.log(`📖 Extracting features from ${specPath}...`);
  // Implementation would go here
}

/**
 * Verify entire project
 */
export async function verifyProject() {
  console.log('🔍 Verifying entire project...\n');

  const phases = [1, 2, 3, 4, 5, 6, 7, 8];
  const results = [];

  for (const phase of phases) {
    console.log(`Verifying Phase ${phase}...`);
    const result = await verificationEngine.verifyPhaseCompletion(phase);
    results.push({ phase, result });

    if (!result.canProceed) {
      console.log(`❌ Phase ${phase} has ${result.missing?.length || 0} missing features`);
    } else {
      console.log(`✅ Phase ${phase} complete`);
    }
  }

  return results;
}

/**
 * Run problem solver on a specific problem
 */
export async function solveProblem(description: string, errors: string[] = []) {
  const problem: Problem = {
    id: `problem_${Date.now()}`,
    agent: 'manual',
    type: 'error',
    description,
    errors,
    actionHistory: [],
    severity: 'high',
    created_at: new Date(),
  };

  return await problemSolver.solveProblem(problem);
}
