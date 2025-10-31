/**
 * Offline Sync Queue Engine
 * 
 * Manages the offline sync queue with:
 * - Exponential backoff with jitter
 * - Circuit breaker pattern
 * - Persistent queue storage
 * - Conflict detection and resolution
 * - Health monitoring integration
 */

import { offlineDB, OutboxItem } from './db';

// Configuration types
interface SyncBackoffConfig {
  minMs: number;
  maxMs: number;
  factor: number;
  jitter: boolean;
  maxAttempts: number;
}

interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  cooldownMs: number;
  halfOpenMaxCalls: number;
}

// Circuit breaker states
type CircuitState = 'closed' | 'open' | 'half-open';

// Default configuration
const DEFAULT_BACKOFF_CONFIG: SyncBackoffConfig = {
  minMs: 500,
  maxMs: 30000,
  factor: 2,
  jitter: true,
  maxAttempts: 5,
};

const DEFAULT_CIRCUIT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 3,
  cooldownMs: 60000,
  halfOpenMaxCalls: 3,
};

// Circuit breaker state management
class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private halfOpenCalls = 0;

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime < this.config.cooldownMs) {
        throw new Error('Circuit breaker is open');
      }
      this.state = 'half-open';
      this.halfOpenCalls = 0;
    }

    if (this.state === 'half-open' && this.halfOpenCalls >= this.config.halfOpenMaxCalls) {
      throw new Error('Circuit breaker half-open limit exceeded');
    }

    try {
      if (this.state === 'half-open') {
        this.halfOpenCalls++;
      }

      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    
    if (this.state === 'half-open') {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        this.state = 'closed';
        this.successCount = 0;
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.state === 'closed' && this.failureCount >= this.config.failureThreshold) {
      this.state = 'open';
    } else if (this.state === 'half-open') {
      this.state = 'open';
      this.successCount = 0;
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  getStats() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
    };
  }

  reset(): void {
    this.state = 'closed';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
    this.halfOpenCalls = 0;
  }
}

// Sync queue manager
export class SyncQueue {
  private isProcessing = false;
  private circuitBreaker: CircuitBreaker;
  private backoffConfig: SyncBackoffConfig;
  private processingInterval?: NodeJS.Timeout;

  constructor(
    backoffConfig: Partial<SyncBackoffConfig> = {},
    circuitConfig: Partial<CircuitBreakerConfig> = {}
  ) {
    this.backoffConfig = { ...DEFAULT_BACKOFF_CONFIG, ...backoffConfig };
    this.circuitBreaker = new CircuitBreaker({ ...DEFAULT_CIRCUIT_CONFIG, ...circuitConfig });
  }

  /**
   * Add an item to the sync queue
   */
  async enqueue(
    kind: OutboxItem['kind'],
    payload: any,
    projectId?: string
  ): Promise<string> {
    const id = await offlineDB.addToOutbox({
      projectId,
      kind,
      payload,
      status: 'queued',
      attempts: 0,
      maxAttempts: this.backoffConfig.maxAttempts,
      nextRunAt: new Date(),
    });

    // Start processing if not already running
    this.startProcessing();

    return id;
  }

  /**
   * Start the queue processing loop
   */
  startProcessing(): void {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.processingInterval = setInterval(() => {
      this.processQueue().catch(console.error);
    }, 1000); // Check every second
  }

  /**
   * Stop the queue processing loop
   */
  stopProcessing(): void {
    this.isProcessing = false;
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = undefined;
    }
  }

  /**
   * Process queued items
   */
  private async processQueue(): Promise<void> {
    if (!navigator.onLine) {
      return; // Skip processing when offline
    }

    const queuedItems = await offlineDB.getQueuedItems(10);
    
    for (const item of queuedItems) {
      try {
        await this.processItem(item);
      } catch (error) {
        console.error('Error processing queue item:', error);
      }
    }
  }

  /**
   * Process a single queue item
   */
  private async processItem(item: OutboxItem): Promise<void> {
    // Update status to processing
    await offlineDB.updateOutboxItem(item.id, {
      status: 'processing',
    });

    try {
      await this.circuitBreaker.execute(async () => {
        await this.syncItem(item);
      });

      // Mark as completed
      await offlineDB.updateOutboxItem(item.id, {
        status: 'completed',
      });

    } catch (error) {
      const attempts = item.attempts + 1;
      const isMaxAttempts = attempts >= item.maxAttempts;

      if (isMaxAttempts) {
        // Mark as failed
        await offlineDB.updateOutboxItem(item.id, {
          status: 'failed',
          attempts,
          lastError: error instanceof Error ? error.message : String(error),
        });
      } else {
        // Schedule retry with backoff
        const nextRunAt = this.calculateNextRunTime(attempts);
        await offlineDB.updateOutboxItem(item.id, {
          status: 'queued',
          attempts,
          nextRunAt,
          lastError: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  /**
   * Sync a single item to the server
   */
  private async syncItem(item: OutboxItem): Promise<void> {
    const { kind, payload, projectId } = item;

    switch (kind) {
      case 'plan_edit':
        await this.syncPlanEdit(projectId!, payload);
        break;
      case 'microstep_update':
        await this.syncMicrostepUpdate(projectId!, payload);
        break;
      case 'spec_sync':
        await this.syncSpec(projectId!, payload);
        break;
      case 'state_update':
        await this.syncStateUpdate(projectId!, payload);
        break;
      case 'comment_add':
        await this.syncCommentAdd(projectId!, payload);
        break;
      case 'file_upload':
        await this.syncFileUpload(projectId!, payload);
        break;
      default:
        throw new Error(`Unknown sync kind: ${kind}`);
    }
  }

  /**
   * Calculate next run time with exponential backoff and jitter
   */
  private calculateNextRunTime(attempts: number): Date {
    const { minMs, maxMs, factor, jitter } = this.backoffConfig;
    
    let delayMs = Math.min(minMs * Math.pow(factor, attempts - 1), maxMs);
    
    if (jitter) {
      // Add random jitter (±25%)
      const jitterAmount = delayMs * 0.25;
      delayMs += (Math.random() - 0.5) * 2 * jitterAmount;
    }
    
    return new Date(Date.now() + delayMs);
  }

  /**
   * Sync methods for different item types
   */
  private async syncPlanEdit(projectId: string, payload: any): Promise<void> {
    const response = await fetch(`/api/projects/${projectId}/plan`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 409) {
        // Conflict detected - handle separately
        const conflictData = await response.json();
        await this.handleConflict(projectId, 'plan', payload, conflictData);
        throw new Error('Conflict detected');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Update local cache with synced data
    const syncedData = await response.json();
    await offlineDB.cachePlan(projectId, syncedData, syncedData.version);
  }

  private async syncMicrostepUpdate(projectId: string, payload: any): Promise<void> {
    const response = await fetch(`/api/projects/${projectId}/microsteps/${payload.microstepId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  private async syncSpec(projectId: string, payload: any): Promise<void> {
    const response = await fetch(`/api/projects/${projectId}/spec`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  private async syncStateUpdate(projectId: string, payload: any): Promise<void> {
    const response = await fetch(`/api/projects/${projectId}/state`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Update local cache
    const syncedData = await response.json();
    await offlineDB.cacheState(projectId, syncedData, syncedData.version);
  }

  private async syncCommentAdd(projectId: string, payload: any): Promise<void> {
    const response = await fetch(`/api/projects/${projectId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  private async syncFileUpload(projectId: string, payload: any): Promise<void> {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('metadata', JSON.stringify(payload.metadata));

    const response = await fetch(`/api/projects/${projectId}/files`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Handle conflicts by storing them for resolution
   */
  private async handleConflict(
    projectId: string,
    entity: string,
    localData: any,
    conflictData: any
  ): Promise<void> {
    await offlineDB.addConflict({
      projectId,
      entity,
      entityId: conflictData.entityId || entity,
      base: conflictData.base,
      local: localData,
      remote: conflictData.remote,
      autoResolved: false,
    });
  }

  /**
   * Get queue statistics
   */
  async getStats() {
    const dbStats = await offlineDB.getStats();
    const circuitStats = this.circuitBreaker.getStats();

    return {
      ...dbStats,
      circuitBreaker: circuitStats,
      isProcessing: this.isProcessing,
    };
  }

  /**
   * Retry failed items
   */
  async retryFailedItems(): Promise<void> {
    const failedItems = await offlineDB.getFailedItems();
    
    for (const item of failedItems) {
      await offlineDB.updateOutboxItem(item.id, {
        status: 'queued',
        attempts: 0,
        nextRunAt: new Date(),
        lastError: undefined,
      });
    }
  }

  /**
   * Clear completed items
   */
  async clearCompleted(): Promise<number> {
    return offlineDB.clearCompletedItems();
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker(): void {
    this.circuitBreaker.reset();
  }
}

// Singleton instance
export const syncQueue = new SyncQueue();
