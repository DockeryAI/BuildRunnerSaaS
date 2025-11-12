/**
 * PRD File Watcher
 *
 * Monitors PRD.md for changes and triggers incremental rebuilds
 */

import { EventEmitter } from 'events';
import { watch, FSWatcher } from 'fs';
import { promises as fs } from 'fs';
import * as crypto from 'crypto';
import * as path from 'path';
import { PRDChangeDetector } from './prd-change-detector';

export interface PRDChangedEvent {
  buildId: string;
  changes: any;
  timestamp: Date;
}

export class PRDWatcher extends EventEmitter {
  private watcher: FSWatcher | null = null;
  private prdPath: string;
  private buildId: string;
  private debounceTimer: NodeJS.Timeout | null = null;
  private lastHash: string | null = null;
  private isWatching: boolean = false;

  constructor(prdPath: string, buildId: string) {
    super();
    this.prdPath = prdPath;
    this.buildId = buildId;
  }

  async start(): Promise<void> {
    if (this.isWatching) {
      return;
    }

    // Get initial hash
    this.lastHash = await this.calculateHash();

    // Start watching
    this.watcher = watch(this.prdPath, async (eventType) => {
      if (eventType === 'change') {
        this.handleFileChange();
      }
    });

    this.isWatching = true;
    this.emit('watcher:started', { path: this.prdPath, buildId: this.buildId });
  }

  stop(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    this.isWatching = false;
    this.emit('watcher:stopped', { buildId: this.buildId });
  }

  private handleFileChange(): void {
    // Debounce changes (2s delay)
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(async () => {
      await this.detectAndEmitChanges();
    }, 2000);
  }

  private async detectAndEmitChanges(): Promise<void> {
    try {
      // Calculate new hash
      const newHash = await this.calculateHash();

      // Compare with last hash
      if (newHash === this.lastHash) {
        return; // No actual change
      }

      // Detect what changed using PRDChangeDetector
      const changeDetector = new PRDChangeDetector();

      // Save current version as backup for comparison
      const backupPath = `${this.prdPath}.previous`;
      try {
        const currentContent = await fs.readFile(this.prdPath, 'utf-8');
        await fs.writeFile(backupPath, currentContent);
      } catch (error) {
        // Backup failed, continue anyway
      }

      const changes = await changeDetector.detectChanges(this.prdPath, backupPath);

      // Update last hash
      this.lastHash = newHash;

      // Emit change event
      this.emit('prd:changed', {
        buildId: this.buildId,
        changes,
        timestamp: new Date()
      } as PRDChangedEvent);

    } catch (error) {
      this.emit('error', {
        buildId: this.buildId,
        error,
        message: 'Failed to detect PRD changes'
      });
    }
  }

  private async calculateHash(): Promise<string> {
    try {
      const content = await fs.readFile(this.prdPath, 'utf-8');
      return crypto.createHash('md5').update(content).digest('hex');
    } catch (error) {
      return '';
    }
  }

  isActive(): boolean {
    return this.isWatching;
  }
}

// Manager for multiple PRD watchers
class PRDWatcherManager {
  private watchers: Map<string, PRDWatcher> = new Map();

  create(prdPath: string, buildId: string): PRDWatcher {
    const watcher = new PRDWatcher(prdPath, buildId);
    this.watchers.set(buildId, watcher);
    return watcher;
  }

  get(buildId: string): PRDWatcher | undefined {
    return this.watchers.get(buildId);
  }

  stop(buildId: string): void {
    const watcher = this.watchers.get(buildId);
    if (watcher) {
      watcher.stop();
      this.watchers.delete(buildId);
    }
  }

  stopAll(): void {
    for (const watcher of this.watchers.values()) {
      watcher.stop();
    }
    this.watchers.clear();
  }
}

export const prdWatcherManager = new PRDWatcherManager();
