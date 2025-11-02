/**
 * Orchestrator Agent
 *
 * Meta-level coordinator that:
 * - Supervises all agents continuously
 * - Monitors for stuck agents and loops
 * - Verifies feature completeness
 * - Auto-assigns missing work
 * - Prevents phase progression until verified
 * - Manages the entire autonomous development system
 */

import {
  Agent,
  AgentStatus,
  OrchestrationState,
  Problem,
  Feature,
  FeatureRegistry,
  LearningEntry,
} from './types';
import { stateMonitor } from './state-monitor';
import { verificationEngine } from './verification-engine';
import { problemSolver, interventionSystem } from './problem-solver';
import { featureRegistry } from './feature-registry';

// ============================================================================
// Orchestrator Agent
// ============================================================================

export class OrchestratorAgent {
  private static instance: OrchestratorAgent;
  private state: OrchestrationState;
  private supervisionInterval: NodeJS.Timeout | null = null;
  private isSupervising: boolean = false;

  private constructor() {
    this.state = {
      active_agents: [],
      stuck_agents: [],
      recent_problems: [],
      learning_history: [],
    };
  }

  public static getInstance(): OrchestratorAgent {
    if (!OrchestratorAgent.instance) {
      OrchestratorAgent.instance = new OrchestratorAgent();
    }
    return OrchestratorAgent.instance;
  }

  // ==========================================================================
  // Main Supervision Loop
  // ==========================================================================

  /**
   * Start continuous project supervision
   */
  public async startSupervision(intervalMs: number = 30000): Promise<void> {
    if (this.isSupervising) {
      console.log('⚠️  Supervision already running');
      return;
    }

    console.log('\n🎯 Starting Orchestrator Supervision');
    console.log(`   Checking every ${intervalMs / 1000}s\n`);

    this.isSupervising = true;

    // Run initial check immediately
    await this.supervisionCheck();

    // Then run on interval
    this.supervisionInterval = setInterval(async () => {
      await this.supervisionCheck();
    }, intervalMs);
  }

  /**
   * Stop supervision
   */
  public stopSupervision(): void {
    if (this.supervisionInterval) {
      clearInterval(this.supervisionInterval);
      this.supervisionInterval = null;
    }
    this.isSupervising = false;
    console.log('⏹️  Stopped orchestrator supervision');
  }

  /**
   * Main supervision check - runs periodically
   */
  private async supervisionCheck(): Promise<void> {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 ORCHESTRATOR SUPERVISION CHECK');
    console.log('='.repeat(60));

    // 1. Monitor all active agents
    await this.monitorAgents();

    // 2. Verify feature completeness
    await this.verifyCompleteness();

    // 3. Check for stuck problems
    await this.checkProblems();

    // 4. Update learning history
    await this.updateLearning();

    console.log('='.repeat(60) + '\n');
  }

  // ==========================================================================
  // Agent Monitoring
  // ==========================================================================

  /**
   * Monitor all active agents for issues
   */
  private async monitorAgents(): Promise<void> {
    console.log('\n📊 Agent Monitoring:');

    const activeAgents = this.state.active_agents;

    if (activeAgents.length === 0) {
      console.log('   No active agents');
      return;
    }

    for (const agent of activeAgents) {
      console.log(`\n   Agent: ${agent.name}`);
      console.log(`   Status: ${agent.status}`);
      console.log(`   Type: ${agent.type}`);

      // Check if stuck
      const loop = await stateMonitor.checkIfStuck(agent.id);

      if (loop) {
        console.log(`   🚨 STUCK: Loop detected (${loop.type})`);

        // Move to stuck agents
        this.state.stuck_agents.push(agent);
        agent.status = 'stuck';

        // Create problem
        const problem: Problem = {
          id: `problem_${Date.now()}`,
          agent: agent.id,
          type: 'loop',
          description: `Agent ${agent.name} stuck in ${loop.type} loop`,
          errors: [loop.pattern_details],
          actionHistory: loop.actions,
          severity: 'high',
          created_at: new Date(),
        };

        // Trigger intervention
        await interventionSystem.handleStuckAgent(agent.id, problem);
      } else {
        console.log(`   ✅ Operating normally`);

        // Get stats
        const stats = stateMonitor.getAgentStats(agent.id);
        console.log(`   Actions: ${stats.total_actions} (${(stats.success_rate * 100).toFixed(1)}% success)`);
      }
    }
  }

  /**
   * Register a new agent
   */
  public registerAgent(agent: Omit<Agent, 'actions_taken' | 'created_at'>): Agent {
    const fullAgent: Agent = {
      ...agent,
      actions_taken: [],
      created_at: new Date(),
    };

    this.state.active_agents.push(fullAgent);
    console.log(`✅ Registered agent: ${agent.name}`);

    return fullAgent;
  }

  /**
   * Get all active agents
   */
  public getActiveAgents(): Agent[] {
    return this.state.active_agents.filter((a) => a.status !== 'stuck');
  }

  /**
   * Get stuck agents
   */
  public getStuckAgents(): Agent[] {
    return this.state.stuck_agents;
  }

  // ==========================================================================
  // Feature Completeness Verification
  // ==========================================================================

  /**
   * Verify current phase is complete
   */
  private async verifyCompleteness(): Promise<void> {
    console.log('\n✅ Feature Completeness Verification:');

    const currentPhase = 6; // From state.json

    const result = await verificationEngine.verifyPhaseCompletion(currentPhase);

    if (result.canProceed) {
      console.log(`   ✅ Phase ${currentPhase} is COMPLETE`);
    } else {
      console.log(`   ❌ Phase ${currentPhase} is INCOMPLETE`);

      if (result.missing && result.missing.length > 0) {
        console.log(`\n   Missing Features (${result.missing.length}):`);
        result.missing.forEach((f) => {
          console.log(`      - ${f.id}: ${f.name}`);
        });

        // Auto-assign missing work
        await this.assignMissingWork(result.missing);
      }
    }
  }

  /**
   * Auto-assign missing features to agents
   */
  public async assignMissingWork(features: Feature[]): Promise<void> {
    console.log(`\n📋 Auto-assigning ${features.length} missing features...`);

    for (const feature of features) {
      // Find available agent
      const agent = this.findAvailableAgent();

      if (agent) {
        console.log(`   Assigning ${feature.id} to ${agent.name}`);

        // Update feature
        featureRegistry.updateFeature(feature.id, {
          status: 'in_progress',
          metadata: {
            ...feature.metadata,
            assigned_to: agent.name,
          },
        });

        agent.current_task = feature.name;
        agent.status = 'working';
      } else {
        console.log(`   ⚠️  No available agent for ${feature.id}`);

        // Add to blockers
        featureRegistry.addBlocker(feature.id, {
          description: 'No available agent to work on this feature',
          severity: 'medium',
        });
      }
    }
  }

  /**
   * Find an available agent
   */
  private findAvailableAgent(): Agent | null {
    const available = this.state.active_agents.find(
      (a) => a.status === 'idle' || a.status === 'waiting'
    );

    return available || null;
  }

  // ==========================================================================
  // Problem Identification & Resolution
  // ==========================================================================

  /**
   * Check for stuck problems
   */
  private async checkProblems(): Promise<void> {
    console.log('\n🔍 Problem Detection:');

    // Check for blocked features
    const blockedFeatures = featureRegistry.getFeaturesByStatus('blocked');

    if (blockedFeatures.length > 0) {
      console.log(`   Found ${blockedFeatures.length} blocked features`);

      for (const feature of blockedFeatures) {
        // Check if blockers need multi-LLM consultation
        for (const blocker of feature.blockers) {
          if (!blocker.multi_llm_consulted && blocker.attempts_to_resolve >= 3) {
            console.log(`   🚨 Feature ${feature.id} needs multi-LLM help`);

            // Create problem
            const problem: Problem = {
              id: `problem_${Date.now()}`,
              agent: feature.metadata.assigned_to,
              type: 'blocker',
              description: `Feature ${feature.name} is blocked: ${blocker.description}`,
              errors: [blocker.description],
              actionHistory: [],
              severity: blocker.severity,
              created_at: new Date(),
            };

            // Solve with multi-LLM
            const result = await problemSolver.solveProblem(problem);

            if (result.success) {
              // Remove blocker
              feature.blockers = feature.blockers.filter((b) => b !== blocker);
              feature.status = 'in_progress';
              console.log(`   ✅ Resolved blocker for ${feature.id}`);
            } else {
              blocker.multi_llm_consulted = true;
              blocker.attempts_to_resolve++;
              console.log(`   ❌ Could not resolve blocker for ${feature.id}`);
            }
          }
        }
      }
    } else {
      console.log('   No blocked features');
    }
  }

  /**
   * Identify all current problems
   */
  public async identifyProblems(): Promise<Problem[]> {
    const problems: Problem[] = [];

    // Check stuck agents
    this.state.stuck_agents.forEach((agent) => {
      problems.push({
        id: `problem_stuck_${agent.id}`,
        agent: agent.id,
        type: 'loop',
        description: `Agent ${agent.name} is stuck`,
        errors: [],
        actionHistory: agent.actions_taken,
        severity: 'high',
        created_at: new Date(),
      });
    });

    // Check blocked features
    const blockedFeatures = featureRegistry.getFeaturesByStatus('blocked');
    blockedFeatures.forEach((feature) => {
      feature.blockers.forEach((blocker) => {
        problems.push({
          id: `problem_blocker_${feature.id}`,
          agent: feature.metadata.assigned_to,
          type: 'blocker',
          description: blocker.description,
          errors: [blocker.description],
          actionHistory: [],
          severity: blocker.severity,
          created_at: new Date(),
        });
      });
    });

    return problems;
  }

  // ==========================================================================
  // Learning System
  // ==========================================================================

  /**
   * Update learning history
   */
  private async updateLearning(): Promise<void> {
    // Get recent interventions
    const interventions = interventionSystem.getRecentInterventions(5);

    // Add to learning history
    interventions.forEach((intervention) => {
      if (intervention.resolution) {
        const entry: LearningEntry = {
          problem_signature: this.hashProblem(intervention.problem),
          problem: intervention.problem,
          solution: intervention.resolution,
          success_metrics: {
            time_to_resolve: intervention.resolution.time_taken,
            attempts_needed: 1,
            llms_consulted: ['anthropic/claude-sonnet-3.5', 'openai/gpt-4', 'google/gemini-2.5-flash'],
          },
          created_at: intervention.timestamp,
        };

        // Check if not already in history
        const exists = this.state.learning_history.some(
          (e) => e.problem_signature === entry.problem_signature
        );

        if (!exists) {
          this.state.learning_history.push(entry);
        }
      }
    });
  }

  /**
   * Hash problem for similarity matching
   */
  private hashProblem(problem: Problem): string {
    return `${problem.type}_${problem.description.substring(0, 50)}`;
  }

  /**
   * Find similar past problems
   */
  public findSimilarProblems(problem: Problem): LearningEntry[] {
    const signature = this.hashProblem(problem);

    return this.state.learning_history.filter((entry) =>
      entry.problem_signature.includes(signature) || signature.includes(entry.problem_signature)
    );
  }

  // ==========================================================================
  // User Actions & Dashboard
  // ==========================================================================

  /**
   * Get actions that need user input
   */
  public getUserActions(): Array<{
    id: string;
    type: string;
    description: string;
    priority: string;
  }> {
    const actions: Array<{
      id: string;
      type: string;
      description: string;
      priority: string;
    }> = [];

    // Check for escalated problems
    const escalatedProblems = this.state.recent_problems.filter(
      (p) => p.severity === 'critical'
    );

    escalatedProblems.forEach((problem) => {
      actions.push({
        id: problem.id,
        type: 'problem_escalation',
        description: `Critical problem needs your attention: ${problem.description}`,
        priority: 'critical',
      });
    });

    return actions;
  }

  /**
   * Resolve a user action
   */
  public async resolveUserAction(actionId: string): Promise<void> {
    console.log(`✅ User resolved action: ${actionId}`);
    // Implementation would handle user resolution
  }

  /**
   * Get current orchestration state
   */
  public getState(): OrchestrationState {
    return this.state;
  }

  /**
   * Get dashboard summary
   */
  public getDashboardSummary(): {
    active_agents: number;
    stuck_agents: number;
    total_features: number;
    completed_features: number;
    blocked_features: number;
    recent_interventions: number;
    learning_entries: number;
  } {
    const allFeatures = featureRegistry.getAllFeatures();

    return {
      active_agents: this.getActiveAgents().length,
      stuck_agents: this.state.stuck_agents.length,
      total_features: allFeatures.length,
      completed_features: featureRegistry.getFeaturesByStatus('completed').length,
      blocked_features: featureRegistry.getFeaturesByStatus('blocked').length,
      recent_interventions: interventionSystem.getRecentInterventions().length,
      learning_entries: this.state.learning_history.length,
    };
  }
}

// Export singleton instance
export const orchestrator = OrchestratorAgent.getInstance();
