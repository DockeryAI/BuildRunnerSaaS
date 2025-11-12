import fs from 'fs/promises';
import path from 'path';

/**
 * Build State Lock
 *
 * Provides file-based locking to prevent race conditions when
 * multiple parallel tasks try to update BUILD_STATE.json simultaneously.
 *
 * Uses a simple lock file (.buildstate.lock) with timeout mechanism.
 */
export class BuildStateLock {
  private lockFilePath: string;
  private lockTimeout: number;
  private maxRetries: number;
  private retryDelay: number;

  constructor(projectPath: string, options?: {
    lockTimeout?: number;
    maxRetries?: number;
    retryDelay?: number;
  }) {
    this.lockFilePath = path.join(projectPath, '.buildrunner', '.buildstate.lock');
    this.lockTimeout = options?.lockTimeout || 5000; // 5 seconds
    this.maxRetries = options?.maxRetries || 20; // 20 retries
    this.retryDelay = options?.retryDelay || 250; // 250ms between retries
  }

  /**
   * Acquire lock (with retry and timeout)
   * @returns Promise that resolves when lock is acquired
   * @throws Error if lock cannot be acquired within timeout
   */
  async acquire(): Promise<void> {
    const startTime = Date.now();

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        // Try to create lock file (exclusive creation)
        await fs.writeFile(
          this.lockFilePath,
          JSON.stringify({
            pid: process.pid,
            acquiredAt: new Date().toISOString(),
            timeout: this.lockTimeout
          }),
          { flag: 'wx' } // Write exclusive - fails if file exists
        );

        // Lock acquired successfully
        return;

      } catch (error: any) {
        // Lock file exists (held by another process)
        if (error.code === 'EEXIST') {
          // Check if lock is stale (older than timeout)
          const isStale = await this.isLockStale();

          if (isStale) {
            // Remove stale lock and retry
            await this.forceRelease();
            continue;
          }

          // Lock is active, wait and retry
          if (Date.now() - startTime >= this.lockTimeout) {
            throw new Error(`Failed to acquire build state lock after ${this.lockTimeout}ms`);
          }

          await this.sleep(this.retryDelay);
          continue;
        }

        // Other error (e.g., permission denied)
        throw error;
      }
    }

    throw new Error('Failed to acquire build state lock: max retries exceeded');
  }

  /**
   * Release lock
   */
  async release(): Promise<void> {
    try {
      await fs.unlink(this.lockFilePath);
    } catch (error: any) {
      // Ignore if lock file doesn't exist
      if (error.code !== 'ENOENT') {
        console.warn('[BuildStateLock] Failed to release lock:', error.message);
      }
    }
  }

  /**
   * Force release lock (for stale locks)
   */
  private async forceRelease(): Promise<void> {
    try {
      await fs.unlink(this.lockFilePath);
      console.log('[BuildStateLock] Removed stale lock file');
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        console.warn('[BuildStateLock] Failed to force release:', error.message);
      }
    }
  }

  /**
   * Check if lock is stale (older than timeout)
   */
  private async isLockStale(): Promise<boolean> {
    try {
      const lockContent = await fs.readFile(this.lockFilePath, 'utf-8');
      const lockData = JSON.parse(lockContent);

      const acquiredAt = new Date(lockData.acquiredAt).getTime();
      const age = Date.now() - acquiredAt;

      return age > this.lockTimeout;

    } catch (error) {
      // If we can't read the lock file, consider it stale
      return true;
    }
  }

  /**
   * Execute function with lock (automatically acquire and release)
   */
  async withLock<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();

    try {
      return await fn();
    } finally {
      await this.release();
    }
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if lock exists
   */
  async isLocked(): Promise<boolean> {
    try {
      await fs.access(this.lockFilePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get lock info (for debugging)
   */
  async getLockInfo(): Promise<{ pid: number; acquiredAt: string; age: number } | null> {
    try {
      const lockContent = await fs.readFile(this.lockFilePath, 'utf-8');
      const lockData = JSON.parse(lockContent);

      return {
        pid: lockData.pid,
        acquiredAt: lockData.acquiredAt,
        age: Date.now() - new Date(lockData.acquiredAt).getTime()
      };
    } catch {
      return null;
    }
  }
}

/**
 * Create a lock instance for a project
 */
export function createBuildStateLock(projectPath: string): BuildStateLock {
  return new BuildStateLock(projectPath);
}
