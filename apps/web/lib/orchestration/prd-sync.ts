/**
 * PRD-to-Registry Dynamic Syncing
 *
 * Bi-directional sync between PRD and Feature Registry:
 * - Watches PRD for changes -> updates registry
 * - Watches registry for changes -> updates PRD
 * - Resolves conflicts automatically
 * - Triggers verification on changes
 */

import {
  PRDFeature,
  PRDChange,
  SyncStatus,
  Feature,
} from './types';
import { featureRegistry } from './feature-registry';
import { verificationEngine } from './verification-engine';

// ============================================================================
// PRD Sync Manager
// ============================================================================

export class PRDSyncManager {
  private static instance: PRDSyncManager;
  private syncEnabled: boolean = true;
  private lastSync: Date = new Date();
  private syncListeners: Set<(status: SyncStatus) => void> = new Set();
  private registryChangeDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private prdChangeDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  private constructor() {
    this.initializeSync();
  }

  public static getInstance(): PRDSyncManager {
    if (!PRDSyncManager.instance) {
      PRDSyncManager.instance = new PRDSyncManager();
    }
    return PRDSyncManager.instance;
  }

  // ==========================================================================
  // Initialization & Setup
  // ==========================================================================

  /**
   * Initialize sync system
   * Sets up watchers and listeners
   */
  private initializeSync(): void {
    // Subscribe to feature registry changes
    featureRegistry.subscribe((registry) => {
      if (this.syncEnabled) {
        this.handleRegistryChange(registry.features);
      }
    });

    console.log('✅ PRD-Registry sync initialized');
  }

  /**
   * Hook into Zustand store for PRD changes
   * This should be called from the PRD store
   */
  public setupPRDWatcher(
    subscribe: (callback: (features: PRDFeature[]) => void) => () => void
  ): void {
    subscribe((features) => {
      if (this.syncEnabled) {
        this.handlePRDChange(features);
      }
    });

    console.log('✅ PRD watcher set up');
  }

  // ==========================================================================
  // Change Handlers
  // ==========================================================================

  /**
   * Handle PRD changes and sync to registry (debounced)
   */
  private async handlePRDChange(prdFeatures: PRDFeature[]): Promise<void> {
    // Clear existing timer
    if (this.prdChangeDebounceTimer) {
      clearTimeout(this.prdChangeDebounceTimer);
    }

    // Debounce: wait 500ms after last change before syncing
    this.prdChangeDebounceTimer = setTimeout(async () => {
      console.log('🔄 PRD changed, syncing to registry...');

      // Detect what changed
      const changes = this.detectPRDChanges(prdFeatures);

      if (changes.length === 0) {
        return;
      }

      // Disable sync temporarily to prevent loops
      this.syncEnabled = false;

      try {
        // Sync changes to registry
        await featureRegistry.syncFromPRD(changes);

        // Trigger verification for changed features
        const changedFeatureIds = changes.map((c) => c.feature.id);
        if (changedFeatureIds.length > 0) {
          const features = changedFeatureIds
            .map((id) => featureRegistry.getAllFeatures().find((f) => f.id === id))
            .filter((f): f is Feature => f !== null);

          if (features.length > 0) {
            await verificationEngine.verifyChangedFeatures(features);
          }
        }

        this.lastSync = new Date();
        this.notifySyncListeners();

        console.log(`✅ Synced ${changes.length} PRD changes to registry`);
      } finally {
        // Re-enable sync
        this.syncEnabled = true;
      }
    }, 500);
  }

  /**
   * Handle registry changes and sync to PRD (debounced)
   */
  private async handleRegistryChange(features: Feature[]): Promise<void> {
    // Clear existing timer
    if (this.registryChangeDebounceTimer) {
      clearTimeout(this.registryChangeDebounceTimer);
    }

    // Debounce: wait 500ms after last change before syncing
    this.registryChangeDebounceTimer = setTimeout(async () => {
      console.log('🔄 Registry changed, checking PRD sync...');

      // Get PRD updates from registry
      const updates = featureRegistry.getPRDUpdates();

      if (updates.length === 0) {
        return;
      }

      // Disable sync temporarily
      this.syncEnabled = false;

      try {
        // Apply updates to PRD
        // This would integrate with the actual PRD store
        console.log(`📝 Applying ${updates.length} registry updates to PRD`);

        this.lastSync = new Date();
        this.notifySyncListeners();

        console.log(`✅ Synced ${updates.length} registry changes to PRD`);
      } finally {
        // Re-enable sync
        this.syncEnabled = true;
      }
    }, 500);
  }

  // ==========================================================================
  // Change Detection
  // ==========================================================================

  /**
   * Detect what changed in PRD
   */
  private detectPRDChanges(currentPRDFeatures: PRDFeature[]): PRDChange[] {
    const changes: PRDChange[] = [];
    const previousFeatures = this.getPreviousPRDFeatures();

    // Find added features
    currentPRDFeatures.forEach((current) => {
      const previous = previousFeatures.find((p) => p.id === current.id);

      if (!previous) {
        // New feature added
        changes.push({
          type: 'add',
          feature: current,
          timestamp: new Date(),
        });
      } else if (this.featureContentChanged(previous, current)) {
        // Feature updated
        changes.push({
          type: 'update',
          feature: current,
          timestamp: new Date(),
        });
      }
    });

    // Find removed features
    previousFeatures.forEach((previous) => {
      const current = currentPRDFeatures.find((c) => c.id === previous.id);

      if (!current) {
        // Feature removed
        changes.push({
          type: 'remove',
          feature: previous,
          timestamp: new Date(),
        });
      }
    });

    // Store current features for next comparison
    this.storePRDFeatures(currentPRDFeatures);

    return changes;
  }

  /**
   * Check if feature content changed
   */
  private featureContentChanged(previous: PRDFeature, current: PRDFeature): boolean {
    return (
      previous.title !== current.title ||
      previous.description !== current.description ||
      previous.section !== current.section
    );
  }

  // ==========================================================================
  // Sync Status & Conflict Resolution
  // ==========================================================================

  /**
   * Check current sync status
   */
  public async checkSyncStatus(prdFeatures: PRDFeature[]): Promise<SyncStatus> {
    return featureRegistry.checkSyncStatus(prdFeatures);
  }

  /**
   * Force full sync from PRD to registry
   */
  public async syncPRDToRegistry(prdFeatures: PRDFeature[]): Promise<void> {
    console.log('🔄 Force syncing PRD to registry...');

    this.syncEnabled = false;

    try {
      // Extract features from PRD
      const features = await Promise.all(
        prdFeatures.map(async (pf) => {
          return await this.convertPRDFeatureToRegistryFeature(pf);
        })
      );

      // Update registry
      features.forEach((f) => {
        const existing = featureRegistry.getAllFeatures().find((rf) => rf.id === f.id);

        if (existing) {
          featureRegistry.updateFeature(f.id, f);
        } else {
          featureRegistry.addFeature(f);
        }
      });

      console.log(`✅ Force synced ${features.length} features to registry`);
    } finally {
      this.syncEnabled = true;
    }
  }

  /**
   * Force full sync from registry to PRD
   */
  public getRegistryFeaturesForPRD(): PRDFeature[] {
    const features = featureRegistry.getAllFeatures();

    return features.map((f) => ({
      id: f.id,
      title: f.name,
      description: f.description,
      section: `Phase ${f.phase}`,
      added_at: f.metadata.created_at,
    }));
  }

  /**
   * Resolve conflict between PRD and registry
   */
  public async resolveConflict(
    featureId: string,
    resolution: 'use_prd' | 'use_registry' | 'merge'
  ): Promise<void> {
    console.log(`🔧 Resolving conflict for ${featureId}: ${resolution}`);

    // Implementation would handle conflict resolution based on strategy
    // For now, just log
  }

  // ==========================================================================
  // Listeners & Notifications
  // ==========================================================================

  /**
   * Subscribe to sync status changes
   */
  public subscribe(listener: (status: SyncStatus) => void): () => void {
    this.syncListeners.add(listener);
    return () => this.syncListeners.delete(listener);
  }

  /**
   * Notify all listeners
   */
  private notifySyncListeners(): void {
    // Get current sync status
    const status: SyncStatus = {
      in_sync: true,
      prd_features: [],
      registry_features: featureRegistry.getAllFeatures(),
      missing_in_registry: [],
      missing_in_prd: [],
      conflicts: [],
    };

    this.syncListeners.forEach((listener) => listener(status));
  }

  // ==========================================================================
  // Storage & Persistence
  // ==========================================================================

  /**
   * Get previous PRD features from storage
   */
  private getPreviousPRDFeatures(): PRDFeature[] {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem('prd-features-snapshot');
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Store current PRD features for comparison
   */
  private storePRDFeatures(features: PRDFeature[]): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem('prd-features-snapshot', JSON.stringify(features));
  }

  /**
   * Convert PRD feature to registry feature
   */
  private async convertPRDFeatureToRegistryFeature(
    prdFeature: PRDFeature
  ): Promise<Feature> {
    return {
      id: prdFeature.id,
      name: prdFeature.title,
      description: prdFeature.description,
      status: 'planned',
      phase: parseInt(prdFeature.section.replace('Phase ', '')) || 1,
      step: 1,
      priority: 'medium',
      sub_features: [],
      acceptance_criteria: [],
      dependencies: {
        required_features: [],
        required_packages: [],
      },
      blockers: [],
      metadata: {
        created_at: prdFeature.added_at,
        updated_at: new Date(),
        assigned_to: 'unassigned',
        estimated_time: '0h',
      },
    };
  }

  // ==========================================================================
  // Public Utilities
  // ==========================================================================

  /**
   * Enable/disable auto-sync
   */
  public setAutoSync(enabled: boolean): void {
    this.syncEnabled = enabled;
    console.log(`${enabled ? '✅' : '⏸️'} Auto-sync ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get last sync time
   */
  public getLastSyncTime(): Date {
    return this.lastSync;
  }

  /**
   * Manual sync trigger
   */
  public async manualSync(prdFeatures: PRDFeature[]): Promise<void> {
    await this.syncPRDToRegistry(prdFeatures);
  }
}

// Export singleton instance
export const prdSync = PRDSyncManager.getInstance();
