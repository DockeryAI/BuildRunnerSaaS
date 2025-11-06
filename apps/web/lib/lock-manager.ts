/**
 * Lock Manager
 * Prevents resource conflicts when multiple agents build components in parallel
 *
 * Handles:
 * - File path locks (prevent multiple agents writing same file)
 * - Dependency locks (prevent building dependent before dependency)
 * - Resource locks (prevent race conditions on shared resources)
 */

export type ResourceType = 'file' | 'dependency' | 'pattern' | 'validation';

export interface Lock {
  resourceId: string;
  resourceType: ResourceType;
  agentId: string;
  acquiredAt: number;
  expiresAt: number;
}

export interface LockRequest {
  resourceId: string;
  resourceType: ResourceType;
  agentId: string;
  timeout?: number; // Max wait time in ms
}

export class LockManager {
  private locks: Map<string, Lock> = new Map();
  private readonly DEFAULT_LOCK_DURATION = 60000; // 60 seconds
  private readonly DEFAULT_WAIT_TIMEOUT = 30000; // 30 seconds max wait

  /**
   * Acquire a lock on a resource
   * Returns true if lock acquired, false if locked by another agent
   */
  async acquireLock(request: LockRequest): Promise<boolean> {
    const { resourceId, resourceType, agentId, timeout = this.DEFAULT_WAIT_TIMEOUT } = request;
    const lockKey = this.getLockKey(resourceType, resourceId);

    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      // Clean up expired locks
      this.cleanupExpiredLocks();

      const existingLock = this.locks.get(lockKey);

      // No lock exists - acquire it
      if (!existingLock) {
        const lock: Lock = {
          resourceId,
          resourceType,
          agentId,
          acquiredAt: Date.now(),
          expiresAt: Date.now() + this.DEFAULT_LOCK_DURATION,
        };

        this.locks.set(lockKey, lock);
        return true;
      }

      // Lock exists but owned by same agent - renew it
      if (existingLock.agentId === agentId) {
        existingLock.expiresAt = Date.now() + this.DEFAULT_LOCK_DURATION;
        return true;
      }

      // Lock exists and owned by different agent - wait
      await this.sleep(100); // Wait 100ms before retry
    }

    // Timeout reached, couldn't acquire lock
    return false;
  }

  /**
   * Release a lock on a resource
   */
  releaseLock(resourceType: ResourceType, resourceId: string, agentId: string): boolean {
    const lockKey = this.getLockKey(resourceType, resourceId);
    const existingLock = this.locks.get(lockKey);

    if (!existingLock) {
      return false; // No lock to release
    }

    // Only the lock owner can release it
    if (existingLock.agentId !== agentId) {
      console.warn(`Agent ${agentId} attempted to release lock owned by ${existingLock.agentId}`);
      return false;
    }

    this.locks.delete(lockKey);
    return true;
  }

  /**
   * Release all locks held by an agent
   */
  releaseAllLocks(agentId: string): number {
    let releasedCount = 0;

    for (const [lockKey, lock] of this.locks.entries()) {
      if (lock.agentId === agentId) {
        this.locks.delete(lockKey);
        releasedCount++;
      }
    }

    return releasedCount;
  }

  /**
   * Check if a resource is locked
   */
  isLocked(resourceType: ResourceType, resourceId: string): boolean {
    this.cleanupExpiredLocks();
    const lockKey = this.getLockKey(resourceType, resourceId);
    return this.locks.has(lockKey);
  }

  /**
   * Get the agent that owns a lock
   */
  getLockOwner(resourceType: ResourceType, resourceId: string): string | null {
    this.cleanupExpiredLocks();
    const lockKey = this.getLockKey(resourceType, resourceId);
    const lock = this.locks.get(lockKey);
    return lock ? lock.agentId : null;
  }

  /**
   * Wait for a lock to be released
   */
  async waitForLock(
    resourceType: ResourceType,
    resourceId: string,
    timeout: number = this.DEFAULT_WAIT_TIMEOUT
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (!this.isLocked(resourceType, resourceId)) {
        return true; // Lock released
      }
      await this.sleep(100);
    }

    return false; // Timeout
  }

  /**
   * Get all active locks
   */
  getActiveLocks(): Lock[] {
    this.cleanupExpiredLocks();
    return Array.from(this.locks.values());
  }

  /**
   * Get locks held by a specific agent
   */
  getAgentLocks(agentId: string): Lock[] {
    this.cleanupExpiredLocks();
    return Array.from(this.locks.values()).filter(lock => lock.agentId === agentId);
  }

  /**
   * Get lock statistics
   */
  getStats(): {
    totalLocks: number;
    locksByType: Record<ResourceType, number>;
    locksByAgent: Record<string, number>;
  } {
    this.cleanupExpiredLocks();

    const locksByType: Record<ResourceType, number> = {
      file: 0,
      dependency: 0,
      pattern: 0,
      validation: 0,
    };

    const locksByAgent: Record<string, number> = {};

    for (const lock of this.locks.values()) {
      locksByType[lock.resourceType]++;
      locksByAgent[lock.agentId] = (locksByAgent[lock.agentId] || 0) + 1;
    }

    return {
      totalLocks: this.locks.size,
      locksByType,
      locksByAgent,
    };
  }

  /**
   * Clear all locks (use with caution!)
   */
  clearAllLocks(): void {
    this.locks.clear();
  }

  /**
   * Clean up expired locks
   */
  private cleanupExpiredLocks(): void {
    const now = Date.now();

    for (const [lockKey, lock] of this.locks.entries()) {
      if (lock.expiresAt < now) {
        this.locks.delete(lockKey);
      }
    }
  }

  /**
   * Generate a unique key for a lock
   */
  private getLockKey(resourceType: ResourceType, resourceId: string): string {
    return `${resourceType}:${resourceId}`;
  }

  /**
   * Sleep for a given duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Force release a lock (admin operation)
   */
  forceReleaseLock(resourceType: ResourceType, resourceId: string): boolean {
    const lockKey = this.getLockKey(resourceType, resourceId);
    const existed = this.locks.has(lockKey);
    this.locks.delete(lockKey);
    return existed;
  }

  /**
   * Extend a lock's expiration time
   */
  extendLock(
    resourceType: ResourceType,
    resourceId: string,
    agentId: string,
    extensionMs: number = this.DEFAULT_LOCK_DURATION
  ): boolean {
    const lockKey = this.getLockKey(resourceType, resourceId);
    const lock = this.locks.get(lockKey);

    if (!lock || lock.agentId !== agentId) {
      return false;
    }

    lock.expiresAt = Date.now() + extensionMs;
    return true;
  }
}
