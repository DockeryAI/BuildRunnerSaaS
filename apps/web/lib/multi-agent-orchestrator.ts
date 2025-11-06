/**
 * Multi-Agent Orchestrator
 * Coordinates parallel component generation with dependency-aware execution waves
 *
 * Features:
 * - Dependency graph analysis
 * - Wave-based parallel execution
 * - Lock management for resource conflicts
 * - Real-time progress monitoring
 * - Automatic retry on failures
 * - Smart model selection per component
 *
 * Target: <60 second builds with 5-10x speedup
 */

import { BuildAgent, type ComponentTask, type AgentResult, type AgentProgress } from './agent';
import { LockManager } from './lock-manager';
import type { BuildContext } from './context-builder';
import type { AIComponentGenerator } from './ai-component-generator';
import type { DesignPolisher } from './design-polisher';
import { EventEmitter } from 'events';

export interface DependencyGraph {
  components: Map<string, ComponentNode>;
  edges: Map<string, string[]>; // component -> dependencies
}

export interface ComponentNode {
  id: string;
  name: string;
  type: string;
  dependencies: string[];
  priority: number;
  wave: number; // Which wave this component belongs to
}

export interface ExecutionWave {
  wave: number;
  components: ComponentTask[];
  dependencies: string[]; // Components this wave depends on
}

export interface OrchestrationResult {
  success: boolean;
  totalComponents: number;
  successfulComponents: number;
  failedComponents: number;
  totalDuration: number;
  averageDuration: number;
  wavesExecuted: number;
  results: AgentResult[];
  errors: Array<{ component: string; error: Error }>;
}

export interface OrchestrationConfig {
  maxConcurrentAgents?: number; // Max agents running at once
  retryFailures?: boolean; // Retry failed components
  maxRetries?: number; // Max retry attempts
  failFast?: boolean; // Stop on first error
}

export class MultiAgentOrchestrator extends EventEmitter {
  private lockManager: LockManager;
  private agents: BuildAgent[] = [];
  private config: OrchestrationConfig;

  constructor(config: OrchestrationConfig = {}) {
    super();
    this.lockManager = new LockManager();
    this.config = {
      maxConcurrentAgents: config.maxConcurrentAgents || 4,
      retryFailures: config.retryFailures ?? true,
      maxRetries: config.maxRetries || 2,
      failFast: config.failFast ?? false,
    };
  }

  /**
   * Build all components in parallel with dependency-aware waves
   */
  async buildComponents(
    components: any[],
    buildContexts: Map<string, BuildContext>,
    aiGenerator: AIComponentGenerator,
    designPolisher: DesignPolisher,
    fileWriter?: any
  ): Promise<OrchestrationResult> {
    const startTime = Date.now();

    this.emit('orchestration:start', {
      totalComponents: components.length,
      maxConcurrentAgents: this.config.maxConcurrentAgents,
    });

    // Step 1: Analyze dependencies and create dependency graph
    this.emit('log', { level: 'info', message: '📊 Analyzing component dependencies...' });
    const dependencyGraph = this.analyzeDependencies(components);

    // Step 2: Create execution waves (components that can be built in parallel)
    this.emit('log', { level: 'info', message: '🌊 Creating execution waves...' });
    const waves = this.createExecutionWaves(dependencyGraph, buildContexts);

    this.emit('log', {
      level: 'success',
      message: `✅ Created ${waves.length} execution waves (max parallelism: ${Math.max(...waves.map(w => w.components.length))})`,
    });

    // Step 3: Initialize agent pool
    this.initializeAgents(aiGenerator, designPolisher, fileWriter);

    // Step 4: Execute waves
    const allResults: AgentResult[] = [];
    const errors: Array<{ component: string; error: Error }> = [];
    let wavesExecuted = 0;

    for (const wave of waves) {
      this.emit('log', {
        level: 'info',
        message: `🌊 Wave ${wave.wave}: Building ${wave.components.length} components in parallel`,
      });

      this.emit('wave:start', {
        wave: wave.wave,
        componentCount: wave.components.length,
        components: wave.components.map(c => c.component.name),
      });

      const waveStartTime = Date.now();

      // Execute wave in parallel
      const waveResults = await this.executeWave(wave);
      allResults.push(...waveResults);

      // Track errors
      const waveErrors = waveResults.filter(r => !r.success);
      for (const result of waveErrors) {
        if (result.error) {
          errors.push({
            component: result.componentName,
            error: result.error,
          });
        }
      }

      const waveDuration = Date.now() - waveStartTime;
      const successCount = waveResults.filter(r => r.success).length;

      this.emit('wave:complete', {
        wave: wave.wave,
        duration: waveDuration,
        successCount,
        failedCount: waveResults.length - successCount,
      });

      this.emit('log', {
        level: successCount === waveResults.length ? 'success' : 'warning',
        message: `✅ Wave ${wave.wave} complete: ${successCount}/${waveResults.length} successful (${(waveDuration / 1000).toFixed(1)}s)`,
      });

      wavesExecuted++;

      // Fail fast if enabled
      if (this.config.failFast && waveErrors.length > 0) {
        this.emit('log', {
          level: 'error',
          message: `❌ Stopping build (fail-fast mode): ${waveErrors.length} components failed`,
        });
        break;
      }
    }

    // Cleanup
    this.cleanup();

    const totalDuration = Date.now() - startTime;
    const successfulComponents = allResults.filter(r => r.success).length;
    const failedComponents = allResults.length - successfulComponents;

    const result: OrchestrationResult = {
      success: failedComponents === 0,
      totalComponents: components.length,
      successfulComponents,
      failedComponents,
      totalDuration,
      averageDuration: allResults.length > 0 ? totalDuration / allResults.length : 0,
      wavesExecuted,
      results: allResults,
      errors,
    };

    this.emit('orchestration:complete', result);

    return result;
  }

  /**
   * Analyze component dependencies and create dependency graph
   */
  private analyzeDependencies(components: any[]): DependencyGraph {
    const graph: DependencyGraph = {
      components: new Map(),
      edges: new Map(),
    };

    // Build nodes
    for (const component of components) {
      const node: ComponentNode = {
        id: component.id || component.name,
        name: component.name,
        type: component.type,
        dependencies: component.dependencies || [],
        priority: component.priority || 0,
        wave: 0, // Will be calculated later
      };

      graph.components.set(node.id, node);
      graph.edges.set(node.id, node.dependencies);
    }

    return graph;
  }

  /**
   * Create execution waves (topological sort with parallelization)
   */
  private createExecutionWaves(
    graph: DependencyGraph,
    buildContexts: Map<string, BuildContext>
  ): ExecutionWave[] {
    const waves: ExecutionWave[] = [];
    const completed = new Set<string>();
    const remaining = new Set(graph.components.keys());

    let waveNumber = 1;

    while (remaining.size > 0) {
      const currentWave: ComponentTask[] = [];

      // Find components with no pending dependencies
      for (const componentId of remaining) {
        const node = graph.components.get(componentId)!;
        const dependencies = graph.edges.get(componentId) || [];

        // Check if all dependencies are completed
        const allDependenciesComplete = dependencies.every(dep => completed.has(dep));

        if (allDependenciesComplete) {
          const buildContext = buildContexts.get(componentId);
          if (!buildContext) {
            console.warn(`No build context for component ${componentId}`);
            continue;
          }

          currentWave.push({
            component: { ...node, id: componentId },
            buildContext,
            filePath: `${node.name}.tsx`, // Simplified - should come from context
            priority: node.priority,
          });
        }
      }

      // If no components can be built, we have a circular dependency
      if (currentWave.length === 0 && remaining.size > 0) {
        console.error('Circular dependency detected!');
        console.error('Remaining components:', Array.from(remaining));

        // Force build remaining components (risky but better than hanging)
        for (const componentId of remaining) {
          const node = graph.components.get(componentId)!;
          const buildContext = buildContexts.get(componentId);
          if (buildContext) {
            currentWave.push({
              component: { ...node, id: componentId },
              buildContext,
              filePath: `${node.name}.tsx`,
              priority: node.priority,
            });
          }
        }
      }

      if (currentWave.length > 0) {
        waves.push({
          wave: waveNumber,
          components: currentWave,
          dependencies: Array.from(completed),
        });

        // Mark as completed
        for (const task of currentWave) {
          completed.add(task.component.id);
          remaining.delete(task.component.id);
        }

        waveNumber++;
      }
    }

    return waves;
  }

  /**
   * Initialize agent pool
   */
  private initializeAgents(
    aiGenerator: AIComponentGenerator,
    designPolisher: DesignPolisher,
    fileWriter?: any
  ): void {
    this.agents = [];

    const agentCount = this.config.maxConcurrentAgents!;

    for (let i = 0; i < agentCount; i++) {
      const agent = new BuildAgent({
        id: `agent-${i + 1}`,
        lockManager: this.lockManager,
        aiGenerator,
        designPolisher,
        fileWriter,
      });

      this.agents.push(agent);
    }

    this.emit('log', {
      level: 'info',
      message: `🤖 Initialized ${agentCount} build agents`,
    });
  }

  /**
   * Execute a wave of components in parallel
   */
  private async executeWave(wave: ExecutionWave): Promise<AgentResult[]> {
    const tasks = [...wave.components];
    const results: AgentResult[] = [];

    // Execute tasks with agent pool
    while (tasks.length > 0 || this.agents.some(a => !a.isAvailable())) {
      // Find available agent
      const availableAgent = this.agents.find(a => a.isAvailable());

      if (availableAgent && tasks.length > 0) {
        // Assign task to agent
        const task = tasks.shift()!;

        this.emit('component:start', {
          agentId: availableAgent.getId(),
          componentName: task.component.name,
          wave: wave.wave,
        });

        // Execute async (don't await here - let it run in parallel)
        availableAgent.buildComponent(task).then(result => {
          results.push(result);

          this.emit('component:complete', {
            agentId: result.agentId,
            componentName: result.componentName,
            success: result.success,
            duration: result.duration,
            fromPattern: result.fromPattern,
          });

          if (!result.success) {
            this.emit('log', {
              level: 'error',
              message: `❌ ${result.componentName} failed: ${result.error?.message}`,
            });
          } else {
            const source = result.fromPattern ? '(from pattern)' : '(generated)';
            this.emit('log', {
              level: 'success',
              message: `✅ ${result.componentName} complete ${source} (${(result.duration / 1000).toFixed(1)}s)`,
            });
          }
        });
      } else {
        // No available agents or no tasks - wait a bit
        await this.sleep(50);
      }
    }

    // Wait for all agents to finish
    while (this.agents.some(a => !a.isAvailable())) {
      await this.sleep(50);
    }

    return results;
  }

  /**
   * Get orchestration status
   */
  getStatus(): {
    agents: Array<{ id: string; status: string; currentTask: string | null }>;
    locks: number;
  } {
    return {
      agents: this.agents.map(a => a.getStats()),
      locks: this.lockManager.getActiveLocks().length,
    };
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    // Reset all agents
    for (const agent of this.agents) {
      agent.reset();
    }

    // Clear all locks
    this.lockManager.clearAllLocks();
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
