/**
 * State Monitor
 *
 * Real-time tracking and loop detection system that:
 * - Tracks all agent actions
 * - Detects infinite loops
 * - Identifies stuck agents
 * - Triggers automatic intervention
 */

import { Action, Loop, Pattern, Agent } from './types';

// ============================================================================
// State Monitor Class
// ============================================================================

export class StateMonitor {
  private static instance: StateMonitor;
  private actionHistory: Map<string, Action[]>; // agent -> actions
  private loopDetectionThresholds = {
    same_action: 3,
    same_error: 2,
    no_progress_timeout: 300, // seconds
  };

  private constructor() {
    this.actionHistory = new Map();
  }

  public static getInstance(): StateMonitor {
    if (!StateMonitor.instance) {
      StateMonitor.instance = new StateMonitor();
    }
    return StateMonitor.instance;
  }

  // ==========================================================================
  // Action Tracking
  // ==========================================================================

  /**
   * Track a new action by an agent
   * Automatically checks for loops
   */
  public async trackAction(agent: string, action: Omit<Action, 'id' | 'timestamp'>): Promise<Loop | null> {
    const fullAction: Action = {
      ...action,
      id: this.generateActionId(),
      timestamp: new Date(),
    };

    // Get or create action history for this agent
    const history = this.actionHistory.get(agent) || [];
    history.push(fullAction);
    this.actionHistory.set(agent, history);

    console.log(`📝 Tracked action for ${agent}: ${fullAction.type} - ${fullAction.description}`);

    // Check for loops
    const loop = await this.detectLoop(agent);

    if (loop) {
      console.log(`🚨 LOOP DETECTED for ${agent}: ${loop.type}`);
      return loop;
    }

    return null;
  }

  /**
   * Get action history for an agent
   */
  public getActionHistory(agent: string, limit?: number): Action[] {
    const history = this.actionHistory.get(agent) || [];
    return limit ? history.slice(-limit) : history;
  }

  /**
   * Get recent actions across all agents
   */
  public getAllRecentActions(limit: number = 50): Action[] {
    const allActions: Action[] = [];

    this.actionHistory.forEach((actions) => {
      allActions.push(...actions);
    });

    // Sort by timestamp descending
    allActions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return allActions.slice(0, limit);
  }

  /**
   * Clear action history for an agent
   */
  public clearHistory(agent: string): void {
    this.actionHistory.delete(agent);
    console.log(`🗑️  Cleared action history for ${agent}`);
  }

  // ==========================================================================
  // Loop Detection
  // ==========================================================================

  /**
   * Main loop detection method
   * Checks for various loop patterns
   */
  public async detectLoop(agent: string): Promise<Loop | null> {
    const recentActions = this.getRecentActions(agent, 10);

    if (recentActions.length < 3) {
      return null; // Not enough data
    }

    // Check for different loop patterns
    const patterns = {
      sameError: this.detectSameErrorPattern(recentActions),
      noProgress: this.detectNoProgressPattern(recentActions),
      circularDeps: this.detectCircularDeps(recentActions),
      repeatingActions: this.detectRepeatingActions(recentActions),
    };

    // Check if any pattern is detected
    for (const [patternName, pattern] of Object.entries(patterns)) {
      if (pattern.detected) {
        return {
          type: this.getLoopType(patternName),
          actions: recentActions,
          detected_at: new Date(),
          recommendation: 'INTERVENE',
          pattern_details: pattern.details,
        };
      }
    }

    return null;
  }

  /**
   * Check if agent is currently stuck
   */
  public async checkIfStuck(agent: string): Promise<Loop | null> {
    return this.detectLoop(agent);
  }

  // ==========================================================================
  // Pattern Detection Methods
  // ==========================================================================

  /**
   * Detect if same error is repeated
   */
  private detectSameErrorPattern(actions: Action[]): Pattern {
    const errors = actions
      .filter((a) => a.outcome === 'failure' && a.error_message)
      .map((a) => a.error_message);

    if (errors.length < this.loopDetectionThresholds.same_error) {
      return { detected: false, confidence: 0, details: '' };
    }

    // Check if recent errors are the same
    const recentErrors = errors.slice(-this.loopDetectionThresholds.same_error);
    const firstError = recentErrors[0];
    const allSame = recentErrors.every((e) => this.errorsAreSimilar(e!, firstError!));

    if (allSame) {
      return {
        detected: true,
        confidence: 0.9,
        details: `Same error repeated ${recentErrors.length} times: "${firstError}"`,
      };
    }

    return { detected: false, confidence: 0, details: '' };
  }

  /**
   * Detect if agent is making no progress
   */
  private detectNoProgressPattern(actions: Action[]): Pattern {
    if (actions.length < 3) {
      return { detected: false, confidence: 0, details: '' };
    }

    // Check if same files are being modified repeatedly with no success
    const recentActions = actions.slice(-5);
    const filesModified = new Set<string>();
    const successfulActions = recentActions.filter((a) => a.outcome === 'success');

    recentActions.forEach((a) => {
      a.filesModified.forEach((f) => filesModified.add(f));
    });

    // No progress if:
    // 1. Modifying same files repeatedly
    // 2. No successful actions
    // 3. Actions span more than no_progress_timeout
    const timeSpan =
      (recentActions[recentActions.length - 1].timestamp.getTime() -
        recentActions[0].timestamp.getTime()) /
      1000;

    const noProgress =
      filesModified.size <= 2 &&
      successfulActions.length === 0 &&
      timeSpan > this.loopDetectionThresholds.no_progress_timeout;

    if (noProgress) {
      return {
        detected: true,
        confidence: 0.8,
        details: `No progress for ${Math.round(timeSpan)}s. Same ${filesModified.size} files modified repeatedly with no success.`,
      };
    }

    return { detected: false, confidence: 0, details: '' };
  }

  /**
   * Detect circular dependencies in actions
   */
  private detectCircularDeps(actions: Action[]): Pattern {
    if (actions.length < 4) {
      return { detected: false, confidence: 0, details: '' };
    }

    // Build dependency graph from actions
    const graph = this.buildActionDependencyGraph(actions);

    // Check for cycles
    const cycles = this.detectCycles(graph);

    if (cycles.length > 0) {
      return {
        detected: true,
        confidence: 0.85,
        details: `Circular dependency detected: ${cycles[0].join(' → ')}`,
      };
    }

    return { detected: false, confidence: 0, details: '' };
  }

  /**
   * Detect repeating action sequences
   */
  private detectRepeatingActions(actions: Action[]): Pattern {
    if (actions.length < this.loopDetectionThresholds.same_action * 2) {
      return { detected: false, confidence: 0, details: '' };
    }

    // Check if action descriptions repeat
    const descriptions = actions.map((a) => a.description);
    const recentDescriptions = descriptions.slice(-this.loopDetectionThresholds.same_action);

    // Count occurrences
    const descriptionCounts = new Map<string, number>();
    recentDescriptions.forEach((desc) => {
      descriptionCounts.set(desc, (descriptionCounts.get(desc) || 0) + 1);
    });

    // Check if any description appears too many times
    for (const [desc, count] of Array.from(descriptionCounts.entries())) {
      if (count >= this.loopDetectionThresholds.same_action) {
        return {
          detected: true,
          confidence: 0.9,
          details: `Action "${desc}" repeated ${count} times`,
        };
      }
    }

    return { detected: false, confidence: 0, details: '' };
  }

  // ==========================================================================
  // Helper Methods
  // ==========================================================================

  private getRecentActions(agent: string, limit: number): Action[] {
    const history = this.actionHistory.get(agent) || [];
    return history.slice(-limit);
  }

  private generateActionId(): string {
    return `a${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private errorsAreSimilar(error1: string, error2: string): boolean {
    // Simple similarity check - could be enhanced with fuzzy matching
    const normalized1 = error1.toLowerCase().trim();
    const normalized2 = error2.toLowerCase().trim();

    // Check if errors are exactly the same
    if (normalized1 === normalized2) return true;

    // Check if one contains the other
    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
      return true;
    }

    // Check Levenshtein distance for fuzzy matching
    const distance = this.levenshteinDistance(normalized1, normalized2);
    const maxLength = Math.max(normalized1.length, normalized2.length);
    const similarity = 1 - distance / maxLength;

    return similarity > 0.8; // 80% similar
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  private buildActionDependencyGraph(actions: Action[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    // Build graph based on files modified
    actions.forEach((action) => {
      action.filesModified.forEach((file) => {
        if (!graph.has(file)) {
          graph.set(file, []);
        }

        // Find previous actions that modified this file
        const previousActions = actions.filter(
          (a) =>
            a.timestamp < action.timestamp &&
            a.filesModified.some((f) => action.filesModified.includes(f))
        );

        previousActions.forEach((prevAction) => {
          prevAction.filesModified.forEach((prevFile) => {
            const deps = graph.get(file) || [];
            if (!deps.includes(prevFile)) {
              deps.push(prevFile);
              graph.set(file, deps);
            }
          });
        });
      });
    });

    return graph;
  }

  private detectCycles(graph: Map<string, string[]>): string[][] {
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const cycles: string[][] = [];

    const dfs = (node: string, path: string[]): void => {
      visited.add(node);
      recStack.add(node);
      path.push(node);

      const neighbors = graph.get(node) || [];

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, [...path]);
        } else if (recStack.has(neighbor)) {
          // Found a cycle
          const cycleStart = path.indexOf(neighbor);
          const cycle = path.slice(cycleStart);
          cycles.push(cycle);
        }
      }

      recStack.delete(node);
    };

    for (const node of Array.from(graph.keys())) {
      if (!visited.has(node)) {
        dfs(node, []);
      }
    }

    return cycles;
  }

  private getLoopType(patternName: string): 'same_error' | 'no_progress' | 'circular_deps' {
    switch (patternName) {
      case 'sameError':
      case 'repeatingActions':
        return 'same_error';
      case 'noProgress':
        return 'no_progress';
      case 'circularDeps':
        return 'circular_deps';
      default:
        return 'same_error';
    }
  }

  /**
   * Get statistics about agent activity
   */
  public getAgentStats(agent: string): {
    total_actions: number;
    successful_actions: number;
    failed_actions: number;
    success_rate: number;
    recent_loop_detected: boolean;
  } {
    const actions = this.actionHistory.get(agent) || [];

    const successful = actions.filter((a) => a.outcome === 'success').length;
    const failed = actions.filter((a) => a.outcome === 'failure').length;

    return {
      total_actions: actions.length,
      successful_actions: successful,
      failed_actions: failed,
      success_rate: actions.length > 0 ? successful / actions.length : 0,
      recent_loop_detected: this.detectLoop(agent) !== null,
    };
  }
}

// Export singleton instance
export const stateMonitor = StateMonitor.getInstance();
