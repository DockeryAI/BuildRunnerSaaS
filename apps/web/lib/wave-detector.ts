import { BuildTask } from './task-list-generator-v2';

/**
 * Wave Detector
 *
 * Analyzes task dependencies and groups tasks into executable "waves"
 * where all tasks in a wave can run in parallel (no dependencies between them).
 *
 * Algorithm:
 * 1. Calculate dependency depth for each task (recursive)
 * 2. Group tasks by depth level
 * 3. Return waves in execution order
 */
export class WaveDetector {

  /**
   * Detect executable waves from task list
   * @param tasks Array of build tasks
   * @returns Array of waves, where each wave is an array of tasks that can run in parallel
   */
  detectWaves(tasks: BuildTask[]): BuildTask[][] {
    // Only consider pending tasks
    const pendingTasks = tasks.filter(t => t.status === 'pending');

    if (pendingTasks.length === 0) {
      return [];
    }

    // Calculate dependency depth for each task
    const depthMap = this.calculateDependencyDepths(tasks);

    // Group tasks by depth into waves
    const waves = this.groupByDepth(pendingTasks, depthMap);

    // Log wave structure for debugging
    this.logWaveStructure(waves);

    return waves;
  }

  /**
   * Calculate dependency depth for all tasks
   * Depth = maximum depth of dependencies + 1
   * Tasks with no dependencies have depth 0
   */
  private calculateDependencyDepths(tasks: BuildTask[]): Map<string, number> {
    const depthMap = new Map<string, number>();
    const taskMap = new Map(tasks.map(t => [t.id, t]));

    const calculateDepth = (taskId: string, visited: Set<string> = new Set()): number => {
      // Check for circular dependencies
      if (visited.has(taskId)) {
        console.warn(`[WaveDetector] Circular dependency detected for task: ${taskId}`);
        return 0;
      }

      // Return cached depth if already calculated
      if (depthMap.has(taskId)) {
        return depthMap.get(taskId)!;
      }

      const task = taskMap.get(taskId);
      if (!task) {
        // Task not found, assume depth 0
        return 0;
      }

      // If no dependencies, depth is 0
      if (task.dependencies.length === 0) {
        depthMap.set(taskId, 0);
        return 0;
      }

      // Calculate depth as max dependency depth + 1
      visited.add(taskId);
      const dependencyDepths = task.dependencies.map(depId =>
        calculateDepth(depId, new Set(visited))
      );
      visited.delete(taskId);

      const maxDepDepth = Math.max(...dependencyDepths, -1);
      const depth = maxDepDepth + 1;

      depthMap.set(taskId, depth);
      return depth;
    };

    // Calculate depths for all tasks
    tasks.forEach(task => calculateDepth(task.id));

    return depthMap;
  }

  /**
   * Group tasks by dependency depth
   */
  private groupByDepth(tasks: BuildTask[], depthMap: Map<string, number>): BuildTask[][] {
    // Find maximum depth
    const maxDepth = Math.max(...Array.from(depthMap.values()));

    // Group by depth
    const waves: BuildTask[][] = [];

    for (let depth = 0; depth <= maxDepth; depth++) {
      const waveTasks = tasks.filter(t => {
        const taskDepth = depthMap.get(t.id);
        return taskDepth === depth && t.status === 'pending';
      });

      if (waveTasks.length > 0) {
        waves.push(waveTasks);
      }
    }

    return waves;
  }

  /**
   * Log wave structure for debugging
   */
  private logWaveStructure(waves: BuildTask[][]): void {
    console.log(`[WaveDetector] Detected ${waves.length} waves:`);
    waves.forEach((wave, index) => {
      console.log(`  Wave ${index + 1}: ${wave.length} tasks - ${wave.map(t => t.id).join(', ')}`);
    });
  }

  /**
   * Validate that all dependencies in a wave are already completed
   * (Safety check before wave execution)
   */
  validateWave(wave: BuildTask[], allTasks: BuildTask[]): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const taskMap = new Map(allTasks.map(t => [t.id, t]));

    for (const task of wave) {
      for (const depId of task.dependencies) {
        const depTask = taskMap.get(depId);

        if (!depTask) {
          errors.push(`Task ${task.id} depends on non-existent task ${depId}`);
          continue;
        }

        if (depTask.status !== 'completed') {
          errors.push(`Task ${task.id} depends on incomplete task ${depId} (status: ${depTask.status})`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get tasks that should be blocked due to failed dependencies
   */
  getBlockedTasks(tasks: BuildTask[], failedTaskIds: Set<string>): BuildTask[] {
    const blocked: BuildTask[] = [];
    const blockedIds = new Set<string>(failedTaskIds);

    // Recursively find all tasks that depend on failed tasks
    const findBlocked = (taskId: string) => {
      for (const task of tasks) {
        if (task.dependencies.includes(taskId) && !blockedIds.has(task.id)) {
          blockedIds.add(task.id);
          blocked.push(task);
          findBlocked(task.id); // Recursively block dependents
        }
      }
    };

    failedTaskIds.forEach(findBlocked);

    return blocked;
  }
}

// Export singleton instance
export const waveDetector = new WaveDetector();
