/**
 * Offline Database using Dexie (IndexedDB wrapper)
 * 
 * Provides persistent storage for offline operations including:
 * - Outbox queue for pending sync operations
 * - Plan cache for offline browsing
 * - State cache for local modifications
 * - Conflict resolution data
 */

import Dexie, { Table } from 'dexie';

// Types for offline storage
export interface OutboxItem {
  id: string;
  projectId?: string;
  kind: 'plan_edit' | 'microstep_update' | 'spec_sync' | 'state_update' | 'comment_add' | 'file_upload';
  payload: any;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'conflict';
  attempts: number;
  maxAttempts: number;
  nextRunAt: Date;
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanCacheItem {
  id: string;
  projectId: string;
  planData: any;
  version: string;
  lastModified: Date;
  syncedAt?: Date;
  isDirty: boolean;
}

export interface StateCacheItem {
  id: string;
  projectId: string;
  stateData: any;
  version: string;
  lastModified: Date;
  syncedAt?: Date;
  isDirty: boolean;
}

export interface ConflictItem {
  id: string;
  projectId: string;
  entity: string;
  entityId: string;
  base: any;
  local: any;
  remote: any;
  resolution?: any;
  resolutionStrategy?: 'auto' | 'manual_local' | 'manual_remote' | 'manual_merge';
  autoResolved: boolean;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface HealthSnapshot {
  id: string;
  target: string;
  ok: boolean;
  latencyMs?: number;
  responseCode?: number;
  errorMessage?: string;
  metadata: Record<string, any>;
  takenAt: Date;
}

// Dexie database class
export class OfflineDatabase extends Dexie {
  // Tables
  outbox!: Table<OutboxItem>;
  planCache!: Table<PlanCacheItem>;
  stateCache!: Table<StateCacheItem>;
  conflicts!: Table<ConflictItem>;
  healthSnapshots!: Table<HealthSnapshot>;

  constructor() {
    super('BuildRunnerOfflineDB');
    
    this.version(1).stores({
      outbox: 'id, projectId, kind, status, nextRunAt, createdAt',
      planCache: 'id, projectId, lastModified, isDirty',
      stateCache: 'id, projectId, lastModified, isDirty',
      conflicts: 'id, projectId, entity, entityId, createdAt, resolvedAt',
      healthSnapshots: 'id, target, takenAt, ok'
    });

    // Hooks for automatic timestamp updates
    this.outbox.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.outbox.hook('updating', (modifications, primKey, obj, trans) => {
      modifications.updatedAt = new Date();
    });

    this.planCache.hook('creating', (primKey, obj, trans) => {
      obj.lastModified = new Date();
    });

    this.planCache.hook('updating', (modifications, primKey, obj, trans) => {
      modifications.lastModified = new Date();
    });

    this.stateCache.hook('creating', (primKey, obj, trans) => {
      obj.lastModified = new Date();
    });

    this.stateCache.hook('updating', (modifications, primKey, obj, trans) => {
      modifications.lastModified = new Date();
    });

    this.conflicts.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date();
    });

    this.healthSnapshots.hook('creating', (primKey, obj, trans) => {
      obj.takenAt = new Date();
    });
  }

  // Utility methods for outbox management
  async addToOutbox(item: Omit<OutboxItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = crypto.randomUUID();
    const outboxItem: OutboxItem = {
      ...item,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await this.outbox.add(outboxItem);
    return id;
  }

  async getQueuedItems(limit = 10): Promise<OutboxItem[]> {
    return this.outbox
      .where('status')
      .equals('queued')
      .and(item => item.nextRunAt <= new Date())
      .orderBy('createdAt')
      .limit(limit)
      .toArray();
  }

  async getFailedItems(): Promise<OutboxItem[]> {
    return this.outbox
      .where('status')
      .equals('failed')
      .orderBy('createdAt')
      .toArray();
  }

  async updateOutboxItem(id: string, updates: Partial<OutboxItem>): Promise<void> {
    await this.outbox.update(id, updates);
  }

  async removeFromOutbox(id: string): Promise<void> {
    await this.outbox.delete(id);
  }

  async clearCompletedItems(): Promise<number> {
    return this.outbox
      .where('status')
      .equals('completed')
      .delete();
  }

  // Plan cache methods
  async cachePlan(projectId: string, planData: any, version: string): Promise<void> {
    const id = `plan_${projectId}`;
    const existing = await this.planCache.get(id);
    
    if (existing) {
      await this.planCache.update(id, {
        planData,
        version,
        lastModified: new Date(),
        isDirty: false,
        syncedAt: new Date(),
      });
    } else {
      await this.planCache.add({
        id,
        projectId,
        planData,
        version,
        lastModified: new Date(),
        syncedAt: new Date(),
        isDirty: false,
      });
    }
  }

  async getCachedPlan(projectId: string): Promise<PlanCacheItem | undefined> {
    return this.planCache.get(`plan_${projectId}`);
  }

  async markPlanDirty(projectId: string, planData: any): Promise<void> {
    const id = `plan_${projectId}`;
    await this.planCache.update(id, {
      planData,
      isDirty: true,
      lastModified: new Date(),
    });
  }

  // State cache methods
  async cacheState(projectId: string, stateData: any, version: string): Promise<void> {
    const id = `state_${projectId}`;
    const existing = await this.stateCache.get(id);
    
    if (existing) {
      await this.stateCache.update(id, {
        stateData,
        version,
        lastModified: new Date(),
        isDirty: false,
        syncedAt: new Date(),
      });
    } else {
      await this.stateCache.add({
        id,
        projectId,
        stateData,
        version,
        lastModified: new Date(),
        syncedAt: new Date(),
        isDirty: false,
      });
    }
  }

  async getCachedState(projectId: string): Promise<StateCacheItem | undefined> {
    return this.stateCache.get(`state_${projectId}`);
  }

  async markStateDirty(projectId: string, stateData: any): Promise<void> {
    const id = `state_${projectId}`;
    await this.stateCache.update(id, {
      stateData,
      isDirty: true,
      lastModified: new Date(),
    });
  }

  // Conflict management
  async addConflict(conflict: Omit<ConflictItem, 'id' | 'createdAt'>): Promise<string> {
    const id = crypto.randomUUID();
    const conflictItem: ConflictItem = {
      ...conflict,
      id,
      createdAt: new Date(),
    };
    
    await this.conflicts.add(conflictItem);
    return id;
  }

  async getUnresolvedConflicts(projectId?: string): Promise<ConflictItem[]> {
    let query = this.conflicts.where('resolvedAt').equals(undefined);
    
    if (projectId) {
      query = query.and(item => item.projectId === projectId);
    }
    
    return query.orderBy('createdAt').toArray();
  }

  async resolveConflict(
    id: string, 
    resolution: any, 
    strategy: ConflictItem['resolutionStrategy'],
    autoResolved = false
  ): Promise<void> {
    await this.conflicts.update(id, {
      resolution,
      resolutionStrategy: strategy,
      autoResolved,
      resolvedAt: new Date(),
    });
  }

  // Health monitoring
  async recordHealthSnapshot(snapshot: Omit<HealthSnapshot, 'id' | 'takenAt'>): Promise<void> {
    const id = crypto.randomUUID();
    await this.healthSnapshots.add({
      ...snapshot,
      id,
      takenAt: new Date(),
    });
  }

  async getLatestHealthSnapshots(): Promise<HealthSnapshot[]> {
    // Get the latest snapshot for each target
    const targets = await this.healthSnapshots
      .orderBy('target')
      .uniqueKeys();
    
    const latestSnapshots: HealthSnapshot[] = [];
    
    for (const target of targets) {
      const latest = await this.healthSnapshots
        .where('target')
        .equals(target as string)
        .orderBy('takenAt')
        .last();
      
      if (latest) {
        latestSnapshots.push(latest);
      }
    }
    
    return latestSnapshots;
  }

  async cleanupOldData(): Promise<void> {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Clean up old completed outbox items
    await this.outbox
      .where('status')
      .equals('completed')
      .and(item => item.updatedAt < oneWeekAgo)
      .delete();
    
    // Clean up old health snapshots (keep last 24 hours per target)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await this.healthSnapshots
      .where('takenAt')
      .below(oneDayAgo)
      .delete();
    
    // Clean up resolved conflicts older than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await this.conflicts
      .where('resolvedAt')
      .below(thirtyDaysAgo)
      .delete();
  }

  // Database statistics
  async getStats(): Promise<{
    outboxCount: number;
    queuedCount: number;
    failedCount: number;
    conflictCount: number;
    planCacheCount: number;
    stateCacheCount: number;
  }> {
    const [
      outboxCount,
      queuedCount,
      failedCount,
      conflictCount,
      planCacheCount,
      stateCacheCount,
    ] = await Promise.all([
      this.outbox.count(),
      this.outbox.where('status').equals('queued').count(),
      this.outbox.where('status').equals('failed').count(),
      this.conflicts.where('resolvedAt').equals(undefined).count(),
      this.planCache.count(),
      this.stateCache.count(),
    ]);

    return {
      outboxCount,
      queuedCount,
      failedCount,
      conflictCount,
      planCacheCount,
      stateCacheCount,
    };
  }
}

// Singleton instance
export const offlineDB = new OfflineDatabase();
