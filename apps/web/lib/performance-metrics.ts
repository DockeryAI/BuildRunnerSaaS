/**
 * Performance Metrics Collection System
 *
 * Collects and analyzes build performance metrics to identify bottlenecks
 * and measure optimization effectiveness.
 *
 * Metrics tracked:
 * - Total build time
 * - Per-task duration
 * - Quality gate timing
 * - Git commit timing
 * - Claude CLI call duration
 * - Optimization effectiveness
 */

import { EventEmitter } from 'events';

// ============================================================================
// Types
// ============================================================================

export interface MetricEntry {
  name: string;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface TimerResult {
  name: string;
  duration: number;
  startTime: Date;
  endTime: Date;
}

export interface PerformanceReport {
  buildId: string;
  totalDuration: number;
  taskMetrics: {
    total: number;
    completed: number;
    failed: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    slowestTasks: Array<{
      name: string;
      duration: number;
    }>;
  };
  phaseMetrics: Map<string, {
    count: number;
    totalDuration: number;
    avgDuration: number;
  }>;
  optimizationMetrics: {
    persistentSessionsEnabled: boolean;
    parallelExecutionEnabled: boolean;
    sessionReuseCount: number;
    parallelTaskCount: number;
    estimatedTimeSavings: number;
  };
  bottlenecks: Array<{
    phase: string;
    duration: number;
    percentageOfTotal: number;
  }>;
  timestamp: Date;
}

// ============================================================================
// Performance Metrics Class
// ============================================================================

export class PerformanceMetrics extends EventEmitter {
  private buildId: string;
  private metrics: Map<string, MetricEntry[]> = new Map();
  private activeTimers: Map<string, Date> = new Map();
  private buildStartTime: Date | null = null;
  private buildEndTime: Date | null = null;
  private config: {
    persistentSessions: boolean;
    parallelExecution: boolean;
    maxParallelTasks: number;
  };

  constructor(buildId: string, config?: {
    persistentSessions?: boolean;
    parallelExecution?: boolean;
    maxParallelTasks?: number;
  }) {
    super();
    this.buildId = buildId;
    this.config = {
      persistentSessions: config?.persistentSessions ?? false,
      parallelExecution: config?.parallelExecution ?? false,
      maxParallelTasks: config?.maxParallelTasks ?? 4
    };
  }

  /**
   * Start a timer for a named operation
   * Returns a function to call when the operation completes
   */
  startTimer(name: string, metadata?: Record<string, any>): () => TimerResult {
    const startTime = new Date();
    const timerKey = `${name}-${startTime.getTime()}`;
    this.activeTimers.set(timerKey, startTime);

    return () => {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      // Remove from active timers
      this.activeTimers.delete(timerKey);

      // Record metric
      this.recordMetric(name, duration, metadata);

      return {
        name,
        duration,
        startTime,
        endTime
      };
    };
  }

  /**
   * Record a metric manually
   */
  recordMetric(name: string, duration: number, metadata?: Record<string, any>): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const entry: MetricEntry = {
      name,
      duration,
      timestamp: new Date(),
      metadata
    };

    this.metrics.get(name)!.push(entry);

    // Emit event for real-time monitoring
    this.emit('metric:recorded', entry);
  }

  /**
   * Mark the start of the build
   */
  startBuild(): void {
    this.buildStartTime = new Date();
    this.emit('build:started', { buildId: this.buildId, timestamp: this.buildStartTime });
  }

  /**
   * Mark the end of the build
   */
  endBuild(): void {
    this.buildEndTime = new Date();
    this.emit('build:ended', { buildId: this.buildId, timestamp: this.buildEndTime });
  }

  /**
   * Get total build duration
   */
  getTotalDuration(): number {
    if (!this.buildStartTime || !this.buildEndTime) {
      return 0;
    }
    return this.buildEndTime.getTime() - this.buildStartTime.getTime();
  }

  /**
   * Get all metrics for a specific operation
   */
  getMetrics(name: string): MetricEntry[] {
    return this.metrics.get(name) || [];
  }

  /**
   * Get average duration for an operation
   */
  getAverageDuration(name: string): number {
    const entries = this.getMetrics(name);
    if (entries.length === 0) return 0;

    const total = entries.reduce((sum, entry) => sum + entry.duration, 0);
    return total / entries.length;
  }

  /**
   * Generate comprehensive performance report
   */
  getReport(): PerformanceReport {
    const totalDuration = this.getTotalDuration();

    // Analyze task metrics
    const taskEntries = this.getMetrics('task:execution');
    const taskMetrics = {
      total: taskEntries.length,
      completed: taskEntries.filter(e => e.metadata?.status === 'completed').length,
      failed: taskEntries.filter(e => e.metadata?.status === 'failed').length,
      avgDuration: this.getAverageDuration('task:execution'),
      minDuration: taskEntries.length > 0 ? Math.min(...taskEntries.map(e => e.duration)) : 0,
      maxDuration: taskEntries.length > 0 ? Math.max(...taskEntries.map(e => e.duration)) : 0,
      slowestTasks: taskEntries
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5)
        .map(e => ({
          name: e.metadata?.taskName || 'Unknown',
          duration: e.duration
        }))
    };

    // Analyze phase metrics
    const phaseMetrics = new Map<string, { count: number; totalDuration: number; avgDuration: number }>();
    for (const [name, entries] of this.metrics.entries()) {
      if (name.startsWith('phase:')) {
        const totalDuration = entries.reduce((sum, e) => sum + e.duration, 0);
        phaseMetrics.set(name, {
          count: entries.length,
          totalDuration,
          avgDuration: totalDuration / entries.length
        });
      }
    }

    // Calculate optimization metrics
    const sessionReuseCount = this.getMetrics('session:reused').length;
    const parallelTaskCount = this.getMetrics('task:parallel').length;

    // Estimate time savings from optimizations
    let estimatedTimeSavings = 0;
    if (this.config.persistentSessions) {
      // Persistent sessions save ~5s per task on average (session startup time)
      estimatedTimeSavings += sessionReuseCount * 5000;
    }
    if (this.config.parallelExecution) {
      // Parallel execution saves ~40% of sequential time
      estimatedTimeSavings += (totalDuration * 0.4);
    }

    // Identify bottlenecks
    const bottlenecks: Array<{ phase: string; duration: number; percentageOfTotal: number }> = [];
    for (const [phase, metrics] of phaseMetrics.entries()) {
      if (totalDuration > 0) {
        const percentage = (metrics.totalDuration / totalDuration) * 100;
        if (percentage > 10) { // Phases taking more than 10% of total time
          bottlenecks.push({
            phase: phase.replace('phase:', ''),
            duration: metrics.totalDuration,
            percentageOfTotal: percentage
          });
        }
      }
    }

    bottlenecks.sort((a, b) => b.percentageOfTotal - a.percentageOfTotal);

    return {
      buildId: this.buildId,
      totalDuration,
      taskMetrics,
      phaseMetrics,
      optimizationMetrics: {
        persistentSessionsEnabled: this.config.persistentSessions,
        parallelExecutionEnabled: this.config.parallelExecution,
        sessionReuseCount,
        parallelTaskCount,
        estimatedTimeSavings
      },
      bottlenecks,
      timestamp: new Date()
    };
  }

  /**
   * Print a formatted report to console
   */
  printReport(): void {
    const report = this.getReport();

    console.log('\n' + '='.repeat(80));
    console.log('📊 PERFORMANCE REPORT');
    console.log('='.repeat(80));
    console.log(`Build ID: ${report.buildId}`);
    console.log(`Total Duration: ${this.formatDuration(report.totalDuration)}`);
    console.log('');

    // Task metrics
    console.log('📋 TASK METRICS');
    console.log('-'.repeat(80));
    console.log(`Total Tasks: ${report.taskMetrics.total}`);
    console.log(`Completed: ${report.taskMetrics.completed}`);
    console.log(`Failed: ${report.taskMetrics.failed}`);
    console.log(`Average Duration: ${this.formatDuration(report.taskMetrics.avgDuration)}`);
    console.log(`Range: ${this.formatDuration(report.taskMetrics.minDuration)} - ${this.formatDuration(report.taskMetrics.maxDuration)}`);
    console.log('');

    // Slowest tasks
    if (report.taskMetrics.slowestTasks.length > 0) {
      console.log('🐌 SLOWEST TASKS');
      console.log('-'.repeat(80));
      report.taskMetrics.slowestTasks.forEach((task, idx) => {
        console.log(`${idx + 1}. ${task.name.padEnd(50)} ${this.formatDuration(task.duration)}`);
      });
      console.log('');
    }

    // Optimization metrics
    console.log('⚡ OPTIMIZATION METRICS');
    console.log('-'.repeat(80));
    console.log(`Persistent Sessions: ${report.optimizationMetrics.persistentSessionsEnabled ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`Parallel Execution: ${report.optimizationMetrics.parallelExecutionEnabled ? '✅ Enabled' : '❌ Disabled'}`);
    if (report.optimizationMetrics.sessionReuseCount > 0) {
      console.log(`Session Reuses: ${report.optimizationMetrics.sessionReuseCount}`);
    }
    if (report.optimizationMetrics.parallelTaskCount > 0) {
      console.log(`Parallel Tasks: ${report.optimizationMetrics.parallelTaskCount}`);
    }
    if (report.optimizationMetrics.estimatedTimeSavings > 0) {
      console.log(`Estimated Time Savings: ${this.formatDuration(report.optimizationMetrics.estimatedTimeSavings)}`);
    }
    console.log('');

    // Bottlenecks
    if (report.bottlenecks.length > 0) {
      console.log('🔴 BOTTLENECKS (>10% of total time)');
      console.log('-'.repeat(80));
      report.bottlenecks.forEach((bottleneck) => {
        console.log(
          `${bottleneck.phase.padEnd(40)} ${this.formatDuration(bottleneck.duration).padEnd(12)} (${bottleneck.percentageOfTotal.toFixed(1)}%)`
        );
      });
      console.log('');
    }

    console.log('='.repeat(80) + '\n');
  }

  /**
   * Export report as JSON
   */
  exportJSON(): string {
    return JSON.stringify(this.getReport(), (key, value) => {
      // Convert Maps to objects for JSON serialization
      if (value instanceof Map) {
        return Object.fromEntries(value);
      }
      return value;
    }, 2);
  }

  /**
   * Format duration in human-readable format
   */
  private formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`;
    } else {
      const minutes = Math.floor(ms / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      return `${minutes}m ${seconds}s`;
    }
  }

  /**
   * Reset all metrics (for testing)
   */
  reset(): void {
    this.metrics.clear();
    this.activeTimers.clear();
    this.buildStartTime = null;
    this.buildEndTime = null;
  }
}

// ============================================================================
// Singleton Manager
// ============================================================================

class PerformanceMetricsManager {
  private instances: Map<string, PerformanceMetrics> = new Map();

  create(buildId: string, config?: {
    persistentSessions?: boolean;
    parallelExecution?: boolean;
    maxParallelTasks?: number;
  }): PerformanceMetrics {
    const instance = new PerformanceMetrics(buildId, config);
    this.instances.set(buildId, instance);
    return instance;
  }

  get(buildId: string): PerformanceMetrics | undefined {
    return this.instances.get(buildId);
  }

  delete(buildId: string): void {
    this.instances.delete(buildId);
  }

  clear(): void {
    this.instances.clear();
  }
}

export const performanceMetricsManager = new PerformanceMetricsManager();
