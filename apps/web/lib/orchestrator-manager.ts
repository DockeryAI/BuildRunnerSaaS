import { BuildOrchestrator } from './build-orchestrator';

/**
 * Orchestrator Manager - Singleton instance shared across API routes
 *
 * In Next.js, API routes are serverless functions that don't share memory.
 * This manager uses Node.js global to persist orchestrator instances across
 * different API route invocations during development and production.
 */

// Extend global to include our orchestrators map
declare global {
  var orchestrators: Map<string, BuildOrchestrator> | undefined;
}

class OrchestratorManager {
  private static instance: OrchestratorManager;
  private orchestrators: Map<string, BuildOrchestrator>;

  private constructor() {
    // Use global to persist across serverless invocations
    if (!global.orchestrators) {
      global.orchestrators = new Map<string, BuildOrchestrator>();
      console.log('🔧 Initialized new orchestrators map');
    }
    this.orchestrators = global.orchestrators;
  }

  static getInstance(): OrchestratorManager {
    if (!OrchestratorManager.instance) {
      OrchestratorManager.instance = new OrchestratorManager();
    }
    return OrchestratorManager.instance;
  }

  set(buildId: string, orchestrator: BuildOrchestrator): void {
    this.orchestrators.set(buildId, orchestrator);
    console.log(`✅ Stored orchestrator for build ${buildId}. Total: ${this.orchestrators.size}`);
  }

  get(buildId: string): BuildOrchestrator | undefined {
    const orchestrator = this.orchestrators.get(buildId);
    console.log(`🔍 Retrieved orchestrator for build ${buildId}: ${orchestrator ? 'found' : 'not found'}`);
    return orchestrator;
  }

  has(buildId: string): boolean {
    return this.orchestrators.has(buildId);
  }

  delete(buildId: string): boolean {
    const deleted = this.orchestrators.delete(buildId);
    console.log(`🗑️ Deleted orchestrator for build ${buildId}: ${deleted ? 'success' : 'not found'}`);
    return deleted;
  }

  getAll(): Map<string, BuildOrchestrator> {
    return this.orchestrators;
  }

  size(): number {
    return this.orchestrators.size;
  }

  clear(): void {
    this.orchestrators.clear();
    console.log('🧹 Cleared all orchestrators');
  }
}

// Export singleton instance
export const orchestratorManager = OrchestratorManager.getInstance();
