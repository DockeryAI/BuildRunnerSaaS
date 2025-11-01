/**
 * Orchestration Store
 *
 * Zustand store that integrates PRD building with the orchestration system.
 * Auto-syncs all PRD changes to feature registry and triggers verification.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  featureRegistry,
  prdSync,
  verificationEngine,
  orchestrator,
  stateMonitor,
  llmGateway,
  type Feature,
  type PRDFeature,
  type Agent,
} from '@/lib/orchestration';

// ============================================================================
// Types
// ============================================================================

export interface PRDItem {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  citations: string[];
  status: 'active' | 'shelved' | 'future';
  featureId?: string; // Link to feature registry
}

export interface PRDSection {
  id: string;
  name: string;
  items: PRDItem[];
  completed: boolean;
}

export interface Suggestion {
  id: string;
  type: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  citations: string[];
  section: string;
  priority: 'high' | 'medium' | 'low';
}

interface OrchestrationState {
  // PRD State
  productIdea: string;
  currentPhase: number;
  sections: Record<number, PRDSection[]>; // phase -> sections
  suggestions: Suggestion[];

  // Orchestration Status
  isOrchestrationActive: boolean;
  activeAgents: Agent[];
  featureCompletionRate: number;
  totalCost: number;
  lastSync: Date | null;

  // Actions
  setProductIdea: (idea: string) => void;
  setCurrentPhase: (phase: number) => void;
  addSuggestion: (suggestion: Suggestion) => void;
  removeSuggestion: (id: string) => void;
  addItemToSection: (phase: number, sectionId: string, item: PRDItem) => Promise<void>;
  updateItem: (phase: number, sectionId: string, itemId: string, updates: Partial<PRDItem>) => Promise<void>;
  deleteItem: (phase: number, sectionId: string, itemId: string) => Promise<void>;

  // Orchestration Actions
  startOrchestration: () => Promise<void>;
  stopOrchestration: () => void;
  extractFeaturesFromIdea: (idea: string) => Promise<Feature[]>;
  verifyPhase: (phase: number) => Promise<any>;
  syncToRegistry: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

// ============================================================================
// Default Sections by Phase
// ============================================================================

const DEFAULT_SECTIONS: Record<number, PRDSection[]> = {
  1: [
    { id: 'exec-summary', name: 'Executive Summary', items: [], completed: false },
    { id: 'problem', name: 'Problem Statement', items: [], completed: false },
    { id: 'personas', name: 'User Personas', items: [], completed: false },
    { id: 'value-prop', name: 'Value Proposition', items: [], completed: false },
  ],
  2: [
    { id: 'features', name: 'Key Features', items: [], completed: false },
    { id: 'scope', name: 'Scope & Objectives', items: [], completed: false },
    { id: 'user-stories', name: 'User Stories', items: [], completed: false },
  ],
  3: [
    { id: 'metrics', name: 'Success Metrics', items: [], completed: false },
    { id: 'risks', name: 'Risks & Mitigations', items: [], completed: false },
    { id: 'analytics', name: 'Analytics Plan', items: [], completed: false },
  ],
  4: [
    { id: 'monetization', name: 'Monetization Strategy', items: [], completed: false },
    { id: 'rollout', name: 'Rollout Plan', items: [], completed: false },
    { id: 'marketing', name: 'Go-to-Market', items: [], completed: false },
  ],
};

// ============================================================================
// Debounced Sync Helper
// ============================================================================

let syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;

// ============================================================================
// Store
// ============================================================================

export const useOrchestrationStore = create<OrchestrationState>()(
  persist(
    (set, get) => ({
      // Initial State
      productIdea: '',
      currentPhase: 1,
      sections: DEFAULT_SECTIONS,
      suggestions: [],

      isOrchestrationActive: false,
      activeAgents: [],
      featureCompletionRate: 0,
      totalCost: 0,
      lastSync: null,

      // ========================================================================
      // PRD Actions
      // ========================================================================

      setProductIdea: (idea) => {
        set({ productIdea: idea });
      },

      setCurrentPhase: (phase) => {
        set({ currentPhase: phase });
      },

      addSuggestion: (suggestion) => {
        set((state) => ({
          suggestions: [...state.suggestions, suggestion],
        }));
      },

      removeSuggestion: (id) => {
        set((state) => ({
          suggestions: state.suggestions.filter((s) => s.id !== id),
        }));
      },

      addItemToSection: async (phase, sectionId, item) => {
        // Add to PRD
        set((state) => {
          const sections = { ...state.sections };
          const phaseSections = sections[phase].map((section) =>
            section.id === sectionId
              ? { ...section, items: [...section.items, item] }
              : section
          );
          return { sections: { ...sections, [phase]: phaseSections } };
        });

        // Only create feature in registry if it doesn't already exist
        if (!item.featureId) {
          const feature = await featureRegistry.addFeature({
            name: item.title,
            description: item.fullDescription || item.shortDescription,
            status: 'planned',
            phase,
            step: 1,
            priority: 'medium',
            sub_features: [],
            acceptance_criteria: [
              {
                description: `Implement ${item.title}`,
                verified: false,
                verification_method: 'Multi-LLM verification',
              },
            ],
            dependencies: {
              required_features: [],
              required_packages: [],
            },
            blockers: [],
          });

          // Link PRD item to feature
          get().updateItem(phase, sectionId, item.id, { featureId: feature.id });
        }

        // Trigger sync
        await get().syncToRegistry();
      },

      updateItem: async (phase, sectionId, itemId, updates) => {
        set((state) => {
          const sections = { ...state.sections };
          const phaseSections = sections[phase].map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  items: section.items.map((item) =>
                    item.id === itemId ? { ...item, ...updates } : item
                  ),
                }
              : section
          );
          return { sections: { ...sections, [phase]: phaseSections } };
        });

        await get().syncToRegistry();
      },

      deleteItem: async (phase, sectionId, itemId) => {
        // Find the feature ID
        const sections = get().sections[phase];
        const section = sections.find((s) => s.id === sectionId);
        const item = section?.items.find((i) => i.id === itemId);

        // Remove from PRD
        set((state) => {
          const sections = { ...state.sections };
          const phaseSections = sections[phase].map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  items: section.items.filter((item) => item.id !== itemId),
                }
              : section
          );
          return { sections: { ...sections, [phase]: phaseSections } };
        });

        await get().syncToRegistry();
      },

      // ========================================================================
      // Orchestration Actions
      // ========================================================================

      startOrchestration: async () => {
        console.log('🚀 Starting orchestration...');

        // Register code builder agents
        const agent1 = orchestrator.registerAgent({
          id: 'code-builder-1',
          name: 'Primary Code Builder',
          type: 'code-builder',
          model: 'anthropic/claude-sonnet-3.5',
          status: 'idle',
        });

        const agent2 = orchestrator.registerAgent({
          id: 'code-builder-2',
          name: 'Secondary Code Builder',
          type: 'code-builder',
          model: 'openai/gpt-4',
          status: 'idle',
        });

        // Start supervision
        await orchestrator.startSupervision(30000); // Every 30 seconds

        set({
          isOrchestrationActive: true,
          activeAgents: [agent1, agent2],
        });

        console.log('✅ Orchestration started');
      },

      stopOrchestration: () => {
        orchestrator.stopSupervision();
        set({
          isOrchestrationActive: false,
          activeAgents: [],
        });
        console.log('⏹️  Orchestration stopped');
      },

      extractFeaturesFromIdea: async (idea) => {
        console.log('🔍 Extracting features from product idea...');

        const features = await featureRegistry.extractFeaturesFromPRD(idea);

        // Add all extracted features to PRD sections in one batch
        set((state) => {
          const sections = { ...state.sections };
          const phase2Sections = sections[2].map((section) => {
            if (section.id === 'features') {
              const newItems: PRDItem[] = features.map((feature) => ({
                id: feature.id,
                title: feature.name,
                shortDescription: feature.description.substring(0, 100),
                fullDescription: feature.description,
                citations: [],
                status: 'active' as const,
                featureId: feature.id,
              }));
              return {
                ...section,
                items: [...section.items, ...newItems],
              };
            }
            return section;
          });
          return { sections: { ...sections, 2: phase2Sections } };
        });

        // Trigger ONE sync after adding all items
        await get().syncToRegistry();

        console.log(`✅ Extracted ${features.length} features`);
        return features;
      },

      verifyPhase: async (phase) => {
        console.log(`🔍 Verifying Phase ${phase}...`);

        const result = await verificationEngine.verifyPhaseCompletion(phase);

        // Update completion status
        set((state) => {
          const sections = { ...state.sections };
          const phaseSections = sections[phase].map((section) => ({
            ...section,
            completed: result.canProceed,
          }));
          return { sections: { ...sections, [phase]: phaseSections } };
        });

        return result;
      },

      syncToRegistry: async () => {
        // Clear existing timer
        if (syncDebounceTimer) {
          clearTimeout(syncDebounceTimer);
        }

        // Debounce: wait 1000ms after last change before syncing
        return new Promise<void>((resolve) => {
          syncDebounceTimer = setTimeout(async () => {
            const { sections } = get();

            // Convert all PRD items to PRDFeature format
            const prdFeatures: PRDFeature[] = [];

            Object.entries(sections).forEach(([phase, phaseSections]) => {
              phaseSections.forEach((section) => {
                section.items.forEach((item) => {
                  prdFeatures.push({
                    id: item.featureId || item.id,
                    title: item.title,
                    description: item.fullDescription || item.shortDescription,
                    section: `Phase ${phase} - ${section.name}`,
                    added_at: new Date(),
                  });
                });
              });
            });

            // Sync to registry
            await prdSync.syncPRDToRegistry(prdFeatures);

            set({ lastSync: new Date() });
            console.log(`✅ Synced ${prdFeatures.length} features to registry`);
            resolve();
          }, 1000);
        });
      },

      refreshStatus: async () => {
        // Get latest orchestration status
        const allFeatures = featureRegistry.getAllFeatures();
        const completedFeatures = featureRegistry.getFeaturesByStatus('completed');
        const costs = llmGateway.getCostStats();
        const activeAgents = orchestrator.getActiveAgents();

        const completionRate = allFeatures.length > 0
          ? (completedFeatures.length / allFeatures.length) * 100
          : 0;

        const totalCost = Object.values(costs).reduce((sum, cost) => sum + cost, 0);

        set({
          featureCompletionRate: completionRate,
          totalCost,
          activeAgents,
        });
      },
    }),
    {
      name: 'orchestration-storage',
      version: 1,
    }
  )
);

// ============================================================================
// Subscribe to Registry Changes
// ============================================================================

// When registry changes, update store status
if (typeof window !== 'undefined') {
  featureRegistry.subscribe((registry) => {
    const store = useOrchestrationStore.getState();
    store.refreshStatus();
  });
}
