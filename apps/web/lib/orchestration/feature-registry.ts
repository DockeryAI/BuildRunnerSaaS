/**
 * Feature Registry System
 *
 * Central source of truth for all features in the project.
 * Integrates with PRD for bi-directional syncing.
 * Tracks implementation status, verification, and blockers.
 */

import {
  Feature,
  FeatureRegistry,
  FeatureStatus,
  Priority,
  PRDFeature,
  PRDChange,
  SyncStatus,
  Conflict,
  RegistryUpdateRequest,
} from './types';
import { llmGateway } from './llm-gateway';

// ============================================================================
// Feature Registry Class
// ============================================================================

export class FeatureRegistryManager {
  private static instance: FeatureRegistryManager;
  private registry: FeatureRegistry;
  private syncListeners: Set<(registry: FeatureRegistry) => void>;
  private batchMode: boolean = false;

  private constructor() {
    this.registry = {
      features: [],
      verification_log: [],
      interventions: [],
      llm_consultations: [],
    };
    this.syncListeners = new Set();
    this.loadFromStorage();
  }

  public static getInstance(): FeatureRegistryManager {
    if (!FeatureRegistryManager.instance) {
      FeatureRegistryManager.instance = new FeatureRegistryManager();
    }
    return FeatureRegistryManager.instance;
  }

  // ==========================================================================
  // Feature Management
  // ==========================================================================

  /**
   * Add a new feature to the registry
   */
  public addFeature(feature: Omit<Feature, 'id' | 'metadata'>): Feature {
    const newFeature: Feature = {
      ...feature,
      id: this.generateFeatureId(),
      metadata: {
        created_at: new Date(),
        updated_at: new Date(),
        assigned_to: 'unassigned',
        estimated_time: '0h',
      },
    };

    this.registry.features.push(newFeature);
    this.saveToStorage();
    this.notifyListeners();

    console.log(`✅ Added feature: ${newFeature.id} - ${newFeature.name}`);
    return newFeature;
  }

  /**
   * Update an existing feature
   */
  public updateFeature(featureId: string, updates: Partial<Feature>): Feature | null {
    const feature = this.findFeature(featureId);
    if (!feature) {
      console.error(`❌ Feature not found: ${featureId}`);
      return null;
    }

    Object.assign(feature, updates);
    feature.metadata.updated_at = new Date();

    this.saveToStorage();
    this.notifyListeners();

    console.log(`✅ Updated feature: ${featureId}`);
    return feature;
  }

  /**
   * Mark feature as complete with evidence
   */
  public completeFeature(
    featureId: string,
    evidence: {
      files_modified: string[];
      tests_added: string[];
      verified_by: string;
    }
  ): Feature | null {
    const feature = this.findFeature(featureId);
    if (!feature) {
      return null;
    }

    feature.status = 'completed';
    feature.evidence = {
      ...evidence,
      tests_passed: true,
      verification_timestamp: new Date(),
      verification_confidence: 1.0,
    };

    this.saveToStorage();
    this.notifyListeners();

    console.log(`✅ Completed feature: ${featureId} - ${feature.name}`);
    return feature;
  }

  /**
   * Add blocker to a feature
   */
  public addBlocker(
    featureId: string,
    blocker: {
      description: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
    }
  ): Feature | null {
    const feature = this.findFeature(featureId);
    if (!feature) {
      return null;
    }

    feature.status = 'blocked';
    feature.blockers.push({
      ...blocker,
      attempts_to_resolve: 0,
      multi_llm_consulted: false,
      created_at: new Date(),
    });

    this.saveToStorage();
    this.notifyListeners();

    console.log(`🚫 Added blocker to feature: ${featureId}`);
    return feature;
  }

  /**
   * Get all features
   */
  public getAllFeatures(): Feature[] {
    return this.registry.features;
  }

  /**
   * Get features by phase
   */
  public getFeaturesByPhase(phase: number): Feature[] {
    return this.registry.features.filter((f) => f.phase === phase);
  }

  /**
   * Get features by status
   */
  public getFeaturesByStatus(status: FeatureStatus): Feature[] {
    return this.registry.features.filter((f) => f.status === status);
  }

  /**
   * Get incomplete features for a phase
   */
  public getIncompleteFeatures(phase: number): Feature[] {
    return this.registry.features.filter(
      (f) => f.phase === phase && f.status !== 'completed' && f.status !== 'skipped'
    );
  }

  /**
   * Get full registry
   */
  public getRegistry(): FeatureRegistry {
    return this.registry;
  }

  // ==========================================================================
  // PRD Integration & Syncing
  // ==========================================================================

  /**
   * Sync features from PRD changes
   */
  public async syncFromPRD(changes: PRDChange[]): Promise<void> {
    console.log(`🔄 Syncing ${changes.length} PRD changes to registry...`);

    for (const change of changes) {
      switch (change.type) {
        case 'add':
          await this.handlePRDAdd(change.feature);
          break;
        case 'remove':
          await this.handlePRDRemove(change.feature);
          break;
        case 'update':
          await this.handlePRDUpdate(change.feature);
          break;
      }
    }

    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Sync registry changes to PRD
   */
  public getPRDUpdates(): PRDChange[] {
    const updates: PRDChange[] = [];

    // Find completed features that should update PRD status
    const recentlyCompleted = this.registry.features.filter(
      (f) =>
        f.status === 'completed' &&
        f.evidence &&
        Date.now() - f.evidence.verification_timestamp.getTime() < 5 * 60 * 1000 // Last 5 mins
    );

    recentlyCompleted.forEach((feature) => {
      updates.push({
        type: 'update',
        feature: this.featureToPRDFeature(feature),
        timestamp: new Date(),
      });
    });

    return updates;
  }

  /**
   * Check sync status between PRD and Registry
   */
  public checkSyncStatus(prdFeatures: PRDFeature[]): SyncStatus {
    const registryFeatures = this.registry.features;

    // Find features missing in registry
    const missingInRegistry = prdFeatures.filter(
      (pf) => !registryFeatures.some((rf) => this.featuresMatch(pf, rf))
    );

    // Find features missing in PRD
    const missingInPRD = registryFeatures.filter(
      (rf) => !prdFeatures.some((pf) => this.featuresMatch(pf, rf))
    );

    // Find conflicts (same feature, different content)
    const conflicts: Conflict[] = [];
    prdFeatures.forEach((pf) => {
      const matchingFeature = registryFeatures.find((rf) => rf.id === pf.id);
      if (matchingFeature && !this.contentMatches(pf, matchingFeature)) {
        conflicts.push({
          feature_id: pf.id,
          prd_version: pf,
          registry_version: matchingFeature,
          resolution_needed: 'User must choose which version to keep',
        });
      }
    });

    const inSync = missingInRegistry.length === 0 && missingInPRD.length === 0 && conflicts.length === 0;

    return {
      in_sync: inSync,
      prd_features: prdFeatures,
      registry_features: registryFeatures,
      missing_in_registry: missingInRegistry,
      missing_in_prd: missingInPRD,
      conflicts,
    };
  }

  // ==========================================================================
  // Feature Extraction from Spec/PRD
  // ==========================================================================

  /**
   * Extract features from specification document using Claude Haiku
   */
  public async extractFeaturesFromSpec(specContent: string): Promise<Feature[]> {
    console.log('🔍 Extracting features from specification...');

    const response = await llmGateway.request({
      task_type: 'extraction',
      prompt: `Extract all features from this specification document.

For each feature, identify:
- Name
- Description
- Which phase it belongs to (1-8)
- Priority (critical/high/medium/low)
- Any sub-features
- Acceptance criteria

Specification:
${specContent}

Return as JSON array:
[
  {
    "name": "...",
    "description": "...",
    "phase": 1,
    "priority": "high",
    "sub_features": [...],
    "acceptance_criteria": [{"description": "...", "verified": false, "verification_method": "..."}]
  }
]`,
      require_json: true,
    });

    const extractedFeatures = JSON.parse(response.content);

    // Convert to Feature objects
    const features = extractedFeatures.map((ef: any) =>
      this.addFeature({
        name: ef.name,
        description: ef.description,
        status: 'planned' as FeatureStatus,
        phase: ef.phase || 1,
        step: 1,
        priority: ef.priority || 'medium',
        sub_features: ef.sub_features || [],
        acceptance_criteria: ef.acceptance_criteria || [],
        dependencies: { required_features: [], required_packages: [] },
        blockers: [],
      })
    );

    console.log(`✅ Extracted ${features.length} features from spec`);
    return features;
  }

  /**
   * Extract features from PRD description using Claude Haiku
   */
  public async extractFeaturesFromPRD(prdDescription: string): Promise<Feature[]> {
    console.log('🔍 Extracting features from PRD description...');

    const response = await llmGateway.request({
      task_type: 'extraction',
      prompt: `Extract all features mentioned in this product description.

Product Description:
${prdDescription}

IMPORTANT: Return ONLY a valid JSON array. No explanations, no markdown, no text before or after. Just the JSON array.

Format:
[
  {"name": "Feature Name", "description": "Feature description"},
  {"name": "Feature Name 2", "description": "Feature description 2"}
]`,
      require_json: true,
    });

    // Extract JSON from response (handle markdown code blocks and conversational wrappers)
    let jsonContent = response.content.trim();

    // Remove markdown code blocks if present
    if (jsonContent.includes('```json')) {
      const match = jsonContent.match(/```json\s*([\s\S]*?)\s*```/);
      if (match) {
        jsonContent = match[1].trim();
      }
    } else if (jsonContent.includes('```')) {
      const match = jsonContent.match(/```\s*([\s\S]*?)\s*```/);
      if (match) {
        jsonContent = match[1].trim();
      }
    }

    // Try to find JSON array in the response
    const arrayMatch = jsonContent.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      jsonContent = arrayMatch[0];
    }

    console.log('🔍 Parsing JSON content:', jsonContent.substring(0, 200) + '...');
    const extractedFeatures = JSON.parse(jsonContent);

    // Enable batch mode to prevent notifications during feature addition
    this.batchMode = true;
    const features = extractedFeatures.map((ef: any) =>
      this.addFeature({
        name: ef.name,
        description: ef.description,
        status: 'planned' as FeatureStatus,
        phase: 1,
        step: 1,
        priority: 'medium' as Priority,
        sub_features: [],
        acceptance_criteria: [],
        dependencies: { required_features: [], required_packages: [] },
        blockers: [],
      })
    );
    this.batchMode = false;

    // Manually notify listeners once after all features are added
    this.notifyListeners();

    console.log(`✅ Extracted ${features.length} features from PRD`);
    return features;
  }

  // ==========================================================================
  // Listeners & Storage
  // ==========================================================================

  /**
   * Subscribe to registry changes
   */
  public subscribe(listener: (registry: FeatureRegistry) => void): () => void {
    this.syncListeners.add(listener);
    return () => this.syncListeners.delete(listener);
  }

  /**
   * Save registry to storage
   */
  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('feature-registry', JSON.stringify(this.registry));
    }
  }

  /**
   * Load registry from storage
   */
  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('feature-registry');
      if (stored) {
        this.registry = JSON.parse(stored);
        console.log(`✅ Loaded ${this.registry.features.length} features from storage`);
      }
    }
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
    if (!this.batchMode) {
      this.syncListeners.forEach((listener) => listener(this.registry));
    }
  }

  // ==========================================================================
  // Private Helper Methods
  // ==========================================================================

  private findFeature(featureId: string): Feature | null {
    // Search top-level features
    const topLevel = this.registry.features.find((f) => f.id === featureId);
    if (topLevel) return topLevel;

    // Search sub-features recursively
    for (const feature of this.registry.features) {
      const subFeature = this.findFeatureRecursive(feature.sub_features, featureId);
      if (subFeature) return subFeature;
    }

    return null;
  }

  private findFeatureRecursive(features: Feature[], featureId: string): Feature | null {
    for (const feature of features) {
      if (feature.id === featureId) return feature;
      const subFeature = this.findFeatureRecursive(feature.sub_features, featureId);
      if (subFeature) return subFeature;
    }
    return null;
  }

  private generateFeatureId(): string {
    const count = this.registry.features.length;
    return `f${String(count + 1).padStart(3, '0')}`;
  }

  private async handlePRDAdd(prdFeature: PRDFeature): Promise<void> {
    // Check if feature already exists
    const existing = this.registry.features.find((f) => f.name === prdFeature.title);
    if (existing) {
      console.log(`⚠️  Feature already exists: ${prdFeature.title}`);
      return;
    }

    // Add new feature
    this.addFeature({
      name: prdFeature.title,
      description: prdFeature.description,
      status: 'planned' as FeatureStatus,
      phase: 1,
      step: 1,
      priority: 'medium' as Priority,
      sub_features: [],
      acceptance_criteria: [],
      dependencies: { required_features: [], required_packages: [] },
      blockers: [],
    });
  }

  private async handlePRDRemove(prdFeature: PRDFeature): Promise<void> {
    const featureIndex = this.registry.features.findIndex((f) => f.id === prdFeature.id);
    if (featureIndex >= 0) {
      this.registry.features.splice(featureIndex, 1);
      console.log(`🗑️  Removed feature: ${prdFeature.title}`);
    }
  }

  private async handlePRDUpdate(prdFeature: PRDFeature): Promise<void> {
    const feature = this.findFeature(prdFeature.id);
    if (feature) {
      feature.name = prdFeature.title;
      feature.description = prdFeature.description;
      feature.metadata.updated_at = new Date();
      console.log(`✅ Updated feature: ${prdFeature.title}`);
    }
  }

  private featuresMatch(prdFeature: PRDFeature, registryFeature: Feature): boolean {
    return prdFeature.id === registryFeature.id || prdFeature.title === registryFeature.name;
  }

  private contentMatches(prdFeature: PRDFeature, registryFeature: Feature): boolean {
    return (
      prdFeature.title === registryFeature.name &&
      prdFeature.description === registryFeature.description
    );
  }

  private featureToPRDFeature(feature: Feature): PRDFeature {
    return {
      id: feature.id,
      title: feature.name,
      description: feature.description,
      section: `Phase ${feature.phase}`,
      added_at: feature.metadata.created_at,
    };
  }
}

// Export singleton instance
export const featureRegistry = FeatureRegistryManager.getInstance();
