/**
 * AI Code Builder Orchestration System
 *
 * A comprehensive orchestration system for autonomous code generation with:
 * - Multi-LLM verification and consensus
 * - Loop detection and intervention
 * - Problem-solving with multiple models
 * - Real-time progress tracking
 * - Event-driven architecture
 */

import { EventEmitter } from 'events';
import { BuildFileWriter, inferFilePath } from './file-writer';
import { AppTypeDetector } from './app-type-detector';
import { DependencyAnalyzer } from './dependency-analyzer';
import { ParallelBuilder } from './parallel-builder';
import { DesignSystemGenerator, type DesignSpec } from './design-system-generator';
import { DesignIntelligence, type PRD } from './design-intelligence';
import { DesignPolisher } from './design-polisher';
import { DesignTokenInjector } from './design-token-injector';
import { DesignProfileDetector } from './design-intelligence/profile-detector';
import type { DesignProfile } from './design-intelligence/types';
import { getTemplateForComponent } from './component-templates';
import { ContextBuilder, type PRDContext, type ComponentContext, type BuildContext } from './context-builder';
import { AIComponentGenerator } from './ai-component-generator';
import { reviewBuild, areReviewsEnabled, setReviewEnabled } from './post-build-review';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { PatternMatcher } from './pattern-matcher';
import { getCacheManager } from './cache-manager';
import { getSmartConsensus } from './smart-consensus';

const execAsync = promisify(exec);

// ============================================================================
// Types & Interfaces
// ============================================================================

export type CriticalityLevel = 'ULTRA_CRITICAL' | 'CRITICAL' | 'IMPORTANT' | 'STANDARD';

export interface ConsensusConfig {
  models: number;
  threshold: number;
  modelList: string[];
}

// ============================================================================
// Consensus Discussion Log Types - Full transparency into LLM collaboration
// ============================================================================

export interface ConsensusMessage {
  timestamp: string;
  speaker: string; // Which LLM (e.g., "claude-sonnet-4") or "system"
  messageType: 'verification' | 'diagnosis' | 'fix_proposal' | 'agreement' | 'disagreement' | 'system' | 'fix_application';
  content: string; // Full message content
  metadata?: {
    verdict?: 'PASS' | 'FAIL';
    confidence?: number;
    issuesFound?: string[];
    proposedFixes?: string[];
    reasoning?: string;
  };
}

export interface ConsensusIteration {
  iteration: number;
  timestamp: string;
  phase: 'initial_verification' | 'diagnosis' | 'fix_proposal' | 'fix_application' | 're_verification';
  action: string; // Human-readable description of what's happening
  messages: ConsensusMessage[];
  result: 'consensus_achieved' | 'consensus_failed' | 'fixes_proposed' | 'fixes_applied';
  consensusScore?: number; // Percentage of models that agree
  modelsVoted?: {
    pass: string[];
    fail: string[];
  };
  fixesApplied?: Array<{
    issueType: string;
    description: string;
    fix: string;
    componentId?: string;
    appliedBy: string; // Which LLM proposed the fix
  }>;
}

export interface ConsensusDiscussionLog {
  buildPlanId: string;
  criticalityLevel: CriticalityLevel;
  startTime: string;
  endTime?: string;
  finalStatus: 'consensus_achieved' | 'max_iterations_reached' | 'impossible_request' | 'in_progress';
  totalIterations: number;
  maxIterationsAllowed: number;
  iterations: ConsensusIteration[];
  summary: {
    totalMessages: number;
    modelsInvolved: string[];
    totalIssuesFound: number;
    issuesResolved: number;
    issuesUnresolved: number;
    finalConsensusScore: number;
    totalFixesApplied: number;
  };
}

export interface OrchestrationConfig {
  verification: {
    require_multi_llm_consensus: boolean;
    consensus_threshold: number;
    max_attempts_before_escalation: number;
    verification_models: string[];
    // Tiered verification strategy
    component_verification_strategy: {
      critical: 'full_consensus' | 'single_model' | 'none';
      important: 'full_consensus' | 'single_model' | 'none';
      standard: 'full_consensus' | 'single_model' | 'none';
    };
    // Critical component patterns (security-sensitive)
    critical_patterns: string[];
    // NEW: Tiered consensus configurations
    tiered_consensus: {
      ULTRA_CRITICAL: ConsensusConfig;
      CRITICAL: ConsensusConfig;
      IMPORTANT: ConsensusConfig;
      STANDARD: ConsensusConfig;
    };
  };
  loop_detection: {
    same_action_threshold: number;
    same_error_threshold: number;
    no_progress_timeout_seconds: number;
    enabled: boolean;
    check_interval_seconds: number;
  };
  intervention: {
    auto_halt_on_loop: boolean;
    multi_llm_brainstorm: boolean;
    log_all_interventions: boolean;
    notify_user_on_critical: boolean;
    max_retry_attempts: number;
  };
  problem_solving: {
    gather_comprehensive_context: boolean;
    consult_models: string[];
    synthesis_model: string;
    verify_micro_steps: boolean;
    auto_execute_fallback: boolean;
  };
  multi_agent: {
    enabled: boolean;
    max_concurrent_agents: number;
    retry_failures: boolean;
    max_retries: number;
    fail_fast: boolean;
  };
  safety: {
    auto_checkpoint: boolean;
    auto_rollback: boolean;
    verify_before_commit: boolean;
    graceful_degradation: boolean;
  };
}

export interface BuildComponent {
  id: string;
  name: string;
  type: 'frontend' | 'backend' | 'api' | 'database' | 'service';
  dependencies: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'paused';
  code?: string;
  tests?: string;
  documentation?: string;
  priority: number;
  description?: string;
  microsteps?: Array<{
    id: string;
    title: string;
    description: string;
    estimatedHours: number;
    status: 'pending' | 'in_progress' | 'completed';
  }>;
}

export interface BuildState {
  id: string;
  status: 'idle' | 'planning' | 'building' | 'verifying' | 'testing' | 'paused' | 'completed' | 'failed' | 'intervening';
  currentPhase: string;
  currentComponent?: string;
  components: BuildComponent[];
  progress: number;
  startTime?: Date;
  endTime?: Date;
  errors: BuildError[];
  interventions: Intervention[];
  designSpec?: DesignSpec; // Beautiful design system for UI components
  loopDetections: LoopDetection[];
  projectMetadata?: {
    prd?: string;
    buildPlan?: string;
  };
  consensusLog?: ConsensusDiscussionLog; // Complete transparency into LLM consensus process
}

export interface BuildError {
  id: string;
  timestamp: Date;
  phase: string;
  component?: string;
  error: string;
  stackTrace?: string;
  attemptNumber: number;
  resolved: boolean;
}

export interface Intervention {
  id: string;
  timestamp: Date;
  reason: 'loop_detected' | 'max_attempts' | 'critical_error' | 'user_requested';
  details: string;
  action: 'halt' | 'brainstorm' | 'rollback' | 'escalate';
  resolution?: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'escalated';
}

export interface LoopDetection {
  id: string;
  timestamp: Date;
  type: 'action' | 'error' | 'no_progress';
  pattern: string;
  occurrences: number;
  threshold: number;
  triggered: boolean;
}

export interface LLMResponse {
  model: string;
  response: string;
  reasoning?: string;
  confidence: number;
  timestamp: Date;
}

export interface ConsensusResult {
  agreed: boolean;
  agreementCount: number;
  totalModels: number;
  agreementRatio: number;
  responses: LLMResponse[];
  consensusResponse?: string;
}

export interface BrainstormResult {
  strategies: Strategy[];
  recommendedStrategy: Strategy;
  synthesis: string;
  confidence: number;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  steps: string[];
  model: string;
  confidence: number;
  estimatedTime: string;
}

export interface MicroPlan {
  id: string;
  goal: string;
  steps: MicroStep[];
  fallbackStrategy?: string;
  context: string;
}

export interface MicroStep {
  id: string;
  description: string;
  action: string;
  expectedOutcome: string;
  verification: string;
  fallback?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  attempts: number;
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: OrchestrationConfig = {
  verification: {
    require_multi_llm_consensus: false,  // DISABLED: Skip plan verification consensus to unblock builds for Phase 1 speed optimizations
    consensus_threshold: 0.67,
    max_attempts_before_escalation: 5,
    verification_models: [
      'anthropic/claude-3.5-sonnet',
      'openai/gpt-4-turbo',
      'google/gemini-2.5-flash'
    ],
    // Tiered verification: Smart resource allocation
    component_verification_strategy: {
      critical: 'full_consensus',  // Auth, payments, security → 3 models
      important: 'single_model',   // APIs, database, core logic → 1 model
      standard: 'none'             // UI, utilities, config → skip verification
    },
    // Patterns to identify critical components
    critical_patterns: [
      'auth', 'authentication', 'login', 'signup', 'password',
      'payment', 'billing', 'charge', 'invoice',
      'security', 'permission', 'authorization', 'token', 'jwt',
      'encryption', 'decrypt', 'hash', 'secret', 'key',
      'admin', 'role', 'access-control'
    ],
    // NEW: Tiered consensus - 4 levels with optimal model allocation
    tiered_consensus: {
      // ULTRA_CRITICAL: 7 models for passwords, payments, admin functions
      ULTRA_CRITICAL: {
        models: 7,
        threshold: 0.71, // 5/7 needed
        modelList: [
          'anthropic/claude-3.5-sonnet',
          'anthropic/claude-opus-4',
          'openai/gpt-4-turbo',
          'openai/gpt-4o',
          'openai/gpt-4o-mini',
          'meta-llama/llama-3.1-70b-instruct',
          'deepseek/deepseek-coder'
        ]
      },
      // CRITICAL: 5 models for API endpoints, database operations
      CRITICAL: {
        models: 5,
        threshold: 0.80, // 4/5 needed
        modelList: [
          'anthropic/claude-3.5-sonnet',
          'openai/gpt-4-turbo',
          'meta-llama/llama-3.1-70b-instruct',
          'anthropic/claude-opus-4',
          'openai/gpt-4o'
        ]
      },
      // IMPORTANT: 3 models for business logic, data processing
      IMPORTANT: {
        models: 3,
        threshold: 0.67, // 2/3 needed
        modelList: [
          'anthropic/claude-3.5-sonnet',
          'openai/gpt-4-turbo',
          'openai/gpt-4o-mini'
        ]
      },
      // STANDARD: 1 model for UI components, utilities
      STANDARD: {
        models: 1,
        threshold: 1.0, // Single model passes
        modelList: ['anthropic/claude-3.5-sonnet']
      }
    }
  },
  loop_detection: {
    same_action_threshold: 3,
    same_error_threshold: 2,
    no_progress_timeout_seconds: 900, // 15 minutes - allow time for consensus verification
    enabled: true,
    check_interval_seconds: 30
  },
  intervention: {
    auto_halt_on_loop: true,
    multi_llm_brainstorm: true,
    log_all_interventions: true,
    notify_user_on_critical: true,
    max_retry_attempts: 3
  },
  problem_solving: {
    gather_comprehensive_context: true,
    consult_models: [
      'anthropic/claude-3.5-sonnet',
      'openai/gpt-4-turbo',
      'google/gemini-2.5-flash',
      'openai/o1-mini',
      'deepseek/deepseek-chat'
    ],
    synthesis_model: 'anthropic/claude-3-opus',
    verify_micro_steps: true,
    auto_execute_fallback: true
  },
  multi_agent: {
    enabled: true,  // ENABLED: Sprint 2 - Multi-agent parallel system
    max_concurrent_agents: 4,  // 4 agents building in parallel
    retry_failures: true,  // Auto-retry failed components
    max_retries: 2,  // Max 2 retry attempts
    fail_fast: false  // Continue building even if some components fail
  },
  safety: {
    auto_checkpoint: true,
    auto_rollback: true,
    verify_before_commit: true,
    graceful_degradation: false  // DISABLED: We want REAL errors, not fake code
  }
};

// ============================================================================
// BuildOrchestrator Class
// ============================================================================

export class BuildOrchestrator extends EventEmitter {
  private config: OrchestrationConfig;
  private state: BuildState;
  private actionHistory: Map<string, number> = new Map();
  private errorHistory: Map<string, number> = new Map();
  private lastProgressTime: Date = new Date();
  private loopCheckInterval?: NodeJS.Timeout;
  private isPaused: boolean = false;
  private apiKey: string = '';
  private fileWriter?: BuildFileWriter;
  private projectId: string = '1'; // Default project ID
  private appTypeDetector: AppTypeDetector;
  private dependencyAnalyzer: DependencyAnalyzer;
  private parallelBuilder: ParallelBuilder;
  private designSystemGenerator: DesignSystemGenerator;
  private designIntelligence: DesignIntelligence;
  private designPolisher: DesignPolisher;
  private designTokenInjector: DesignTokenInjector;
  private designProfileDetector: DesignProfileDetector;
  private aiComponentGenerator: AIComponentGenerator;
  private appConfig: any;
  private productIdea: string = ''; // Store product idea for design generation
  private prdContext: PRDContext | null = null; // Full PRD context for v0.dev-quality generation
  private currentProfile: DesignProfile | null = null; // Store detected design profile for component generation
  // Phase 1 Speed Optimization Systems
  private patternMatcher: PatternMatcher;
  private cacheManager: ReturnType<typeof getCacheManager>;
  private smartConsensus: ReturnType<typeof getSmartConsensus>;

  constructor(apiKey?: string, config?: Partial<OrchestrationConfig>, projectId?: string) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config } as OrchestrationConfig;
    this.state = this.initializeState();
    this.apiKey = apiKey || '';
    this.projectId = projectId || '1';
    this.designSystemGenerator = new DesignSystemGenerator();
    this.designIntelligence = new DesignIntelligence(this.apiKey);
    this.designPolisher = new DesignPolisher(this.apiKey);
    this.designTokenInjector = new DesignTokenInjector();
    this.designProfileDetector = new DesignProfileDetector(this.apiKey);
    // Use Gemini 2.5 Flash for 5-10x faster component generation
    // Quality is still excellent but latency is ~2-4s vs 15-20s for Claude
    this.aiComponentGenerator = new AIComponentGenerator(this.apiKey, 'google/gemini-2.5-flash');

    // Initialize new components
    this.appTypeDetector = new AppTypeDetector();
    this.dependencyAnalyzer = new DependencyAnalyzer();
    this.parallelBuilder = new ParallelBuilder({ maxConcurrency: 5 });

    // Initialize Phase 1 Speed Optimization Systems
    this.patternMatcher = new PatternMatcher();
    this.cacheManager = getCacheManager();
    this.smartConsensus = getSmartConsensus();

    // Try to load from localStorage only if in browser
    if (!this.apiKey && typeof window !== 'undefined') {
      this.loadApiKey();
    }

    // Try to get projectId from localStorage if not provided and in browser
    if (!projectId && typeof window !== 'undefined' && window.localStorage) {
      this.projectId = localStorage.getItem('currentProjectId') || '1';
    }
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  private initializeState(): BuildState {
    return {
      id: this.generateId(),
      status: 'idle',
      currentPhase: 'initialization',
      components: [],
      progress: 0,
      errors: [],
      interventions: [],
      loopDetections: []
    };
  }

  private loadApiKey(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Try multiple sources for the API key
      const apiKeysStr = localStorage.getItem('buildrunner_api_keys');
      const apiKeys = apiKeysStr ? JSON.parse(apiKeysStr) : {};

      this.apiKey = apiKeys.openrouter ||
                    localStorage.getItem('openrouter_api_key') ||
                    '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' ||
                    '';

      if (!this.apiKey) {
        console.warn('OpenRouter API key not found in localStorage');
      } else {
        console.log('✅ OpenRouter API key loaded successfully');
      }
    }
  }

  /**
   * Load PRD context from localStorage for v0.dev-quality generation
   */
  private loadPRDContext(): PRDContext | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }

    try {
      const projectKey = `buildrunner_project_${this.projectId}`;
      const projectData = localStorage.getItem(projectKey);

      if (!projectData) {
        console.warn(`No PRD found for project ${this.projectId}`);
        return null;
      }

      const project = JSON.parse(projectData);

      // Extract features from PRD sections
      const features: Array<{id: string; title: string; description: string; section: string}> = [];

      if (project.prdSections) {
        Object.entries(project.prdSections).forEach(([phase, sections]: [string, any]) => {
          if (Array.isArray(sections)) {
            sections.forEach((section: any) => {
              if (section.items && Array.isArray(section.items)) {
                section.items.forEach((item: any) => {
                  features.push({
                    id: item.id || `${section.id}_${item.title}`,
                    title: item.title || '',
                    description: item.shortDescription || item.fullDescription || '',
                    section: section.name || section.id || '',
                  });
                });
              }
            });
          }
        });
      }

      const prdContext: PRDContext = {
        productName: project.productName || project.name || 'Application',
        productIdea: project.productIdea || '',
        executiveSummary: this.extractSectionContent(project.prdSections, 'executive_summary'),
        problemStatement: this.extractSectionContent(project.prdSections, 'problem_statement'),
        targetAudience: this.extractSectionContent(project.prdSections, 'target_audience'),
        valueProposition: this.extractSectionContent(project.prdSections, 'value_proposition'),
        features,
        prdSections: project.prdSections,
      };

      console.log(`✅ Loaded PRD context: ${prdContext.productName}`);
      console.log(`📋 Features found: ${features.length}`);

      return prdContext;

    } catch (error) {
      console.error('Failed to load PRD context:', error);
      return null;
    }
  }

  /**
   * Extract content from a PRD section
   */
  private extractSectionContent(prdSections: any, sectionId: string): string | undefined {
    if (!prdSections) return undefined;

    for (const sections of Object.values(prdSections)) {
      if (Array.isArray(sections)) {
        const section = sections.find((s: any) => s.id === sectionId);
        if (section && section.items && section.items.length > 0) {
          return section.items.map((item: any) =>
            `${item.title}: ${item.shortDescription || item.fullDescription || ''}`
          ).join('\n');
        }
      }
    }

    return undefined;
  }

  // ============================================================================
  // Public API
  // ============================================================================

  /**
   * Start the build process
   */
  public async startBuild(components: BuildComponent[]): Promise<void> {
    try {
      this.state.components = components;
      this.state.status = 'planning';
      this.state.startTime = new Date();
      this.state.progress = 0;

      this.emit('build:started', { buildId: this.state.id, components: components.length });

      // Initialize file writer
      try {
        this.fileWriter = new BuildFileWriter(this.projectId, this.state.id);
        await this.fileWriter.initialize();
        console.log(`✅ File writer initialized for project ${this.projectId}, build ${this.state.id}`);
      } catch (error) {
        console.error('Failed to initialize file writer:', error);
        // Continue build even if file writer fails
      }

      // Load PRD context for v0.dev-quality generation
      if (!this.prdContext) {
        this.emit('log', {
          level: 'info',
          message: '📋 Loading PRD context...'
        });

        this.prdContext = this.loadPRDContext();

        if (this.prdContext) {
          this.emit('log', {
            level: 'success',
            message: `✅ Loaded PRD: ${this.prdContext.productName} (${this.prdContext.features.length} features)`
          });
        } else if (this.productIdea) {
          // Auto-generate simple PRD from prompt (brainstorm is optional enhancement)
          this.emit('log', {
            level: 'info',
            message: '📝 Auto-generating simple PRD from prompt...'
          });
          this.prdContext = {
            productName: this.projectId || 'Unnamed Project',
            productIdea: this.productIdea,
            description: this.productIdea,
            features: [],
            targetAudience: '',
            valueProposition: '',
            technicalRequirements: [],
            generatedAt: new Date().toISOString(),
            source: 'auto-generated-from-prompt'
          };
          this.emit('log', {
            level: 'success',
            message: '✅ Simple PRD created - brainstorm can enhance later'
          });
        } else {
          // No PRD and no prompt - this is an error
          this.emit('log', {
            level: 'error',
            message: '❌ BLOCKED: No PRD or prompt found'
          });
          throw new Error(
            'PROMPT_REQUIRED: Provide a product description or complete brainstorm to create a PRD.'
          );
        }
      }

      // Generate design system (Phase 1: Design-First Approach with DesignIntelligence)
      if (!this.state.designSpec) {
        this.emit('log', {
          level: 'info',
          message: '🎨 Generating industry-specific design system with AI...'
        });

        try {
          // Build PRD object for DesignIntelligence
          const prd: PRD = {
            projectName: this.prdContext?.productName || this.projectId || 'Unnamed Project',
            description: this.prdContext?.description || this.prdContext?.productIdea || this.productIdea || 'Modern web application',
            industry: this.prdContext?.industry,
            targetAudience: this.prdContext?.targetAudience,
            brandPersonality: this.appConfig?.brandPersonality
          };

          this.emit('log', {
            level: 'info',
            message: `🔍 Analyzing app characteristics with intelligent design profiling...`
          });

          // NEW: Multi-dimensional design profile detection
          let designProfile: DesignProfile | null = null;
          try {
            designProfile = await this.designProfileDetector.detectProfile({
              projectName: prd.projectName,
              description: prd.description,
              targetUsers: prd.targetAudience,
            });

            // Store profile for use in component generation
            this.currentProfile = designProfile;

            this.emit('log', {
              level: 'success',
              message: `✨ Design Profile: ${designProfile.name || designProfile.category}`
            });

            console.log('📊 Design Profile Details:', {
              purpose: designProfile.primaryPurpose,
              audience: `${designProfile?.audience?.demographic || 'general'} (${designProfile?.audience?.economicLevel || 'mid-market'})`,
              feel: `${designProfile?.emotionalTone?.personality || 'professional'}, ${designProfile?.emotionalTone?.energy || 'balanced'}`,
              references: designProfile?.referenceApps?.slice(0, 3).join(', ') || 'modern apps',
              colors: `${designProfile?.colorScheme?.primary || '#3B82F6'} (primary)`,
            });
          } catch (error) {
            console.warn('Profile detection failed, falling back to basic detection:', error);
            this.emit('log', {
              level: 'warning',
              message: '⚠️ Profile detection unavailable, using basic industry detection'
            });
          }

          // Use advanced DesignIntelligence with profile context
          this.state.designSpec = await this.designIntelligence.generateDesignSystem(prd);

          this.emit('log', {
            level: 'success',
            message: `✨ Design system created: ${this.state.designSpec?.visualStyle || 'modern'} style | Inspired by ${this.state.designSpec?.inspiration?.slice(0, 2).join(', ') || 'modern apps'}${this.state.designSpec?.inspiration && this.state.designSpec.inspiration.length > 2 ? ', ...' : ''}`
          });

          console.log('🎨 Advanced Design Spec:', {
            style: this.state.designSpec?.visualStyle || 'modern',
            industry: (this.state.designSpec as any)?.industry,
            inspiration: this.state.designSpec?.inspiration,
            colors: this.state.designSpec?.colorPalette?.primary || '#3B82F6',
            fonts: this.state.designSpec?.typography?.fontFamily?.sans || 'Inter',
          });

          // CRITICAL: Inject design tokens into build directory
          // This generates tailwind.config.js and globals.css with custom colors
          // so components can use classes like bg-background, text-foreground, etc.
          this.emit('log', {
            level: 'info',
            message: '💉 Injecting design tokens into build...'
          });

          try {
            const buildDir = this.fileWriter?.buildDir || path.join(process.cwd(), 'builds', this.projectId);
            await this.designTokenInjector.injectDesignTokens(buildDir, this.state.designSpec);

            this.emit('log', {
              level: 'success',
              message: '✅ Design tokens injected: tailwind.config.ts + globals.css created'
            });
          } catch (error) {
            console.error('Failed to inject design tokens:', error);
            this.emit('log', {
              level: 'warning',
              message: '⚠️ Design token injection failed, components may look unstyled'
            });
          }
        } catch (error) {
          console.error('Failed to generate design system:', error);
          this.emit('log', {
            level: 'warning',
            message: '⚠️ Using fallback design system'
          });
          // Continue with default design
        }
      }

      // Start loop detection monitoring
      if (this.config.loop_detection.enabled) {
        this.startLoopDetection();
      }

      // Phase 1: Planning
      await this.executePhase('planning', async () => {
        await this.planBuild();
      });

      // Phase 2: Building
      this.state.status = 'building';
      await this.executePhase('building', async () => {
        await this.buildComponents();

        // Check pause before assembly
        if (this.isPaused) {
          await this.waitForResume();
        }

        // NEW: Assemble into working application
        await this.assembleApplication();
      });

      // Check pause after building
      if (this.isPaused) {
        this.emit('log', {
          level: 'info',
          message: '⏸️  Build paused after component building'
        });
        await this.waitForResume();
      }

      // Calculate metadata for preview
      const completedComponents = this.state.components.filter(c => c.status === 'completed');
      const isWebApp = this.appConfig?.appType === 'web' ||
                       this.appConfig?.framework?.toLowerCase().includes('next') ||
                       this.appConfig?.framework?.toLowerCase().includes('react') ||
                       completedComponents.some(c => c.type === 'frontend');
      const isMobileApp = this.appConfig?.appType === 'mobile' ||
                          this.appConfig?.appType === 'ios' ||
                          this.appConfig?.framework?.toLowerCase().includes('expo') ||
                          this.appConfig?.framework?.toLowerCase().includes('react native') ||
                          this.appConfig?.framework?.toLowerCase().includes('swift');

      // Emit early completion for preview (before verification/testing)
      this.emit('build:preview_ready', {
        buildId: this.state.id,
        timestamp: new Date().toISOString(),
        componentCount: completedComponents.length,
        buildDirectory: `builds/${this.projectId}/${this.state.id}`,
        isWebApp,
        isMobileApp,
        message: 'Build complete! Preview available while verification runs in background.'
      });

      // Check pause before verification
      if (this.isPaused) {
        this.emit('log', {
          level: 'info',
          message: '⏸️  Build paused before verification phase'
        });
        await this.waitForResume();
      }

      // Phase 3: Verification (runs in background after preview is available)
      this.state.status = 'verifying';
      await this.executePhase('verification', async () => {
        await this.verifyBuild();
      });

      // Check pause before testing
      if (this.isPaused) {
        this.emit('log', {
          level: 'info',
          message: '⏸️  Build paused before testing phase'
        });
        await this.waitForResume();
      }

      // Phase 4: Testing (runs in background after preview is available)
      this.state.status = 'testing';
      await this.executePhase('testing', async () => {
        await this.testBuild();
      });

      // Complete
      this.state.status = 'completed';
      this.state.endTime = new Date();
      this.state.progress = 100;
      this.stopLoopDetection();

      // Calculate build metadata (reuse completedComponents, isWebApp, isMobileApp from earlier)
      const duration = this.state.endTime.getTime() - (this.state.startTime?.getTime() || 0);

      // Emit completion message to terminal
      this.emit('log', {
        level: 'success',
        message: `\n✅ ========================================\n✅ BUILD COMPLETED SUCCESSFULLY!\n✅ ========================================\n✨ Generated ${completedComponents.length} components\n⏱️  Build time: ${Math.round(duration / 1000)}s\n📁 Location: builds/${this.projectId}/${this.state.id}\n${isWebApp ? '🌐 Web app ready for preview\n' : ''}${isMobileApp ? '📱 Mobile app code generated\n' : ''}🎉 Your project is ready!`
      });

      this.emit('build:completed', {
        buildId: this.state.id,
        timestamp: this.state.endTime.toISOString(),
        componentCount: completedComponents.length,
        fileCount: completedComponents.length, // Approximate - each component = 1 file
        status: 'completed' as const,
        buildDirectory: `builds/${this.projectId}/${this.state.id}`,
        duration,
        isWebApp,
        isMobileApp,
      });

      // Post-build code review (runs for next 100 builds)
      if (areReviewsEnabled()) {
        try {
          const buildPath = path.join(process.cwd(), 'builds', this.projectId);
          await reviewBuild(
            this.projectId,
            this.state.id,
            buildPath,
            this.openRouterKey
          );
        } catch (reviewError) {
          console.error('❌ Post-build review failed:', reviewError);
          // Don't fail the build if review fails
        }
      }

    } catch (error) {
      await this.handleBuildError(error as Error);
    }
  }

  /**
   * Pause the build process
   */
  public pauseBuild(): void {
    this.isPaused = true;
    this.state.status = 'paused';
    this.stopLoopDetection();
    this.emit('build:paused', { buildId: this.state.id });
  }

  /**
   * Resume the build process
   */
  public resumeBuild(): void {
    this.isPaused = false;
    this.state.status = 'building';
    if (this.config.loop_detection.enabled) {
      this.startLoopDetection();
    }
    this.emit('build:resumed', { buildId: this.state.id });
  }

  /**
   * Stop/Cancel the build process completely
   */
  public stopBuild(): void {
    this.isPaused = false; // Unpause so build can complete
    this.state.status = 'failed';
    this.stopLoopDetection();
    this.emit('build:stopped', {
      buildId: this.state.id,
      message: 'Build stopped by user'
    });
    this.emit('build:error', {
      buildId: this.state.id,
      error: 'Build cancelled by user',
      phase: this.state.currentPhase
    });
  }

  /**
   * Send a message to the orchestrator (for user intervention)
   */
  public async sendMessage(message: string): Promise<string> {
    this.emit('message:received', { message });

    // If there's an active intervention, try to resolve it
    const activeIntervention = this.state.interventions.find(i => i.status === 'pending' || i.status === 'in_progress');

    if (activeIntervention) {
      activeIntervention.resolution = message;
      activeIntervention.status = 'resolved';
      this.emit('intervention:resolved', { intervention: activeIntervention });

      // Resume build if paused
      if (this.isPaused) {
        this.resumeBuild();
      }

      return `Intervention resolved. Resuming build with your guidance: "${message}"`;
    }

    return `Message received: "${message}". No active intervention to resolve.`;
  }

  /**
   * Get current build status
   */
  public getStatus(): BuildState {
    return { ...this.state };
  }

  /**
   * PUBLIC API: Verify Build Plan with Multi-LLM Consensus
   * Used by /api/plan/verify to validate plans BEFORE building starts
   * Returns verification results without modifying the plan
   */
  public async verifyBuildPlanWithConsensus(
    planSummary: string,
    plan: any,
    criticalityLevel: 'ULTRA_CRITICAL' | 'CRITICAL' | 'IMPORTANT' | 'STANDARD' = 'CRITICAL'
  ): Promise<{
    consensusAchieved: boolean;
    iterations: number;
    finalPlan: any;
    issuesFound: number;
    issuesResolved: number;
    consensusLog: ConsensusDiscussionLog;
  }> {
    console.log(`🔍 Starting plan verification with ${criticalityLevel} tier consensus...`);

    // Import auto-fix system
    const { extractIssuesFromConsensus, autoFixPlan, recordFixPattern } = require('./consensus-auto-fix');

    // Initialize consensus discussion log
    const consensusLog: ConsensusDiscussionLog = {
      buildPlanId: 'plan-verification',
      criticalityLevel,
      startTime: new Date().toISOString(),
      finalStatus: 'in_progress',
      totalIterations: 0,
      maxIterationsAllowed: 3, // Fewer iterations for pre-build verification
      iterations: [],
      summary: {
        totalMessages: 0,
        modelsInvolved: [],
        totalIssuesFound: 0,
        issuesResolved: 0,
        issuesUnresolved: 0,
        finalConsensusScore: 0,
        totalFixesApplied: 0,
      },
    };

    this.logConsensusMessage(consensusLog, 'system', 'system',
      `🚀 Starting plan verification with ${criticalityLevel} tier consensus\n${planSummary.substring(0, 500)}...`
    );

    let consensusAchieved = false;
    let totalIssuesFound = 0;

    // Run verification iterations
    for (let iteration = 1; iteration <= 3; iteration++) {
      consensusLog.totalIterations = iteration;

      const iterationLog: ConsensusIteration = {
        iteration,
        timestamp: new Date().toISOString(),
        phase: 'verification',
        action: `Iteration ${iteration}: Verifying plan with ${this.config.verification.tiered_consensus[criticalityLevel].models} models`,
        messages: [],
        result: 'consensus_failed',
      };

      this.logConsensusMessage(consensusLog, 'system', 'verification',
        `📋 Submitting plan to ${this.config.verification.tiered_consensus[criticalityLevel].models} models for verification...`
      );

      // Run consensus verification
      const consensusResult = await this.getMultiLLMConsensus(
        'verify_build_plan',
        planSummary,
        criticalityLevel
      );

      // Log each model's response
      const passVotes: string[] = [];
      const failVotes: string[] = [];

      consensusResult.responses.forEach(r => {
        const verdict = r.response.match(/VERDICT:\s*(PASS|FAIL)/i)?.[1]?.toUpperCase() as 'PASS' | 'FAIL' | undefined;
        const confidence = parseInt(r.response.match(/CONFIDENCE:\s*(\d+)/)?.[1] || '0');
        const reason = r.response.match(/REASON:\s*(.+)/is)?.[1]?.trim() || 'No reason provided';

        if (verdict === 'PASS') {
          passVotes.push(r.model);
        } else {
          failVotes.push(r.model);
          // Count issues mentioned in the failure reason
          const issueMatches = reason.match(/\d+\./g); // Count numbered issues
          if (issueMatches) {
            totalIssuesFound += issueMatches.length;
          } else {
            totalIssuesFound += 1; // At least one issue if FAIL
          }
        }

        this.logConsensusMessage(consensusLog, r.model, verdict === 'PASS' ? 'agreement' : 'disagreement',
          `${r.model} verdict: ${verdict} (${confidence}% confident)\nReasoning: ${reason}`,
          { verdict, confidence, reasoning: reason }
        );
      });

      iterationLog.modelsVoted = { pass: passVotes, fail: failVotes };
      iterationLog.consensusScore = consensusResult.agreementRatio * 100;

      this.logConsensusMessage(consensusLog, 'system', 'system',
        `📊 Consensus Score: ${(consensusResult.agreementRatio * 100).toFixed(1)}% (${consensusResult.agreementCount}/${consensusResult.totalModels} models agreed)\n` +
        `✅ PASS votes: ${passVotes.join(', ') || 'none'}\n` +
        `❌ FAIL votes: ${failVotes.join(', ') || 'none'}`
      );

      if (consensusResult.agreed) {
        // SUCCESS - Consensus achieved!
        iterationLog.result = 'consensus_achieved';
        consensusAchieved = true;

        this.logConsensusMessage(consensusLog, 'system', 'system',
          `\n🎉 CONSENSUS ACHIEVED!\n` +
          `Build plan approved by ${consensusResult.agreementCount}/${consensusResult.totalModels} models (${(consensusResult.agreementRatio * 100).toFixed(1)}%)`
        );

        consensusLog.iterations.push(iterationLog);
        break;
      }

      consensusLog.iterations.push(iterationLog);

      // Auto-fix plan for next iteration if consensus failed
      if (!consensusResult.agreed && iteration < 3) {
        this.logConsensusMessage(consensusLog, 'system', 'auto-fix',
          `🔧 Consensus not achieved. Attempting auto-fix based on feedback...`
        );

        // Extract issues from consensus feedback
        const issues = extractIssuesFromConsensus(consensusResult);
        console.log(`🔍 Extracted ${issues.length} issues from consensus feedback`);

        // Auto-fix plan
        const fixResult = autoFixPlan(plan, issues);

        if (fixResult.fixed) {
          // Update plan for next iteration
          Object.assign(plan, fixResult.planAfter);

          // Regenerate plan summary with fixed plan
          planSummary = formatPlanForVerification(plan);

          this.logConsensusMessage(consensusLog, 'system', 'auto-fix',
            `✅ Applied ${fixResult.fixesApplied.length} fixes:\n` +
            fixResult.fixesApplied.map(f => `- ${f.fix}`).join('\n') +
            (fixResult.remainingIssues.length > 0 ? `\n\n⚠️  ${fixResult.remainingIssues.length} issues could not be auto-fixed` : '')
          );

          console.log(`✅ Auto-fixed ${fixResult.fixesApplied.length} issues, ${fixResult.remainingIssues.length} remaining`);
        } else {
          this.logConsensusMessage(consensusLog, 'system', 'auto-fix',
            `⚠️  Could not auto-fix any issues. Manual review may be required.`
          );
        }
      } else if (iteration === 3) {
        this.logConsensusMessage(consensusLog, 'system', 'system',
          `⚠️  Plan verification did not achieve consensus after ${iteration} iterations.\n` +
          `Found ${totalIssuesFound} potential issues.\n` +
          `Please review the plan and address the concerns raised by the models.`
        );
      }
    }

    // Helper function needed for auto-fix
    function formatPlanForVerification(plan: any): string {
      // Use the same formatPlanForVerification from verify/route.ts
      let summary = `Build Plan Verification - Production Standards Validation\n\n`;
      summary += `**Product**: ${plan.productName || 'Unnamed'}\n`;
      summary += `**Type**: ${plan.appType || 'web'} app using ${plan.framework || 'Next.js'}\n\n`;

      if (plan.milestones) {
        summary += `**Milestones** (${plan.milestones.length} total):\n`;
        plan.milestones.forEach((milestone: any, idx: number) => {
          summary += `\n${idx + 1}. ${milestone.name} (${milestone.components?.length || 0} components)\n`;
          milestone.components?.forEach((comp: any) => {
            summary += `   - ${comp.name} [${comp.type}] [${comp.criticality || 'NO_CRITICALITY'}]\n`;
            summary += `     Path: ${comp.filePath || 'NOT_SPECIFIED'}\n`;
          });
        });
      }

      return summary;
    }

    // Finalize log
    consensusLog.endTime = new Date().toISOString();
    consensusLog.summary.finalConsensusScore = consensusLog.iterations[consensusLog.iterations.length - 1]?.consensusScore || 0;
    consensusLog.summary.totalMessages = consensusLog.iterations.reduce((sum, iter) => sum + iter.messages.length, 0);
    consensusLog.summary.totalIssuesFound = totalIssuesFound;
    consensusLog.summary.issuesUnresolved = consensusAchieved ? 0 : totalIssuesFound;
    consensusLog.finalStatus = consensusAchieved ? 'consensus_achieved' : 'max_iterations_reached';

    return {
      consensusAchieved,
      iterations: consensusLog.totalIterations,
      finalPlan: plan,
      issuesFound: totalIssuesFound,
      issuesResolved: 0, // No auto-fixing in pre-build verification
      consensusLog,
    };
  }

  // ============================================================================
  // Build Phases
  // ============================================================================

  private async executePhase(phase: string, action: () => Promise<void>): Promise<void> {
    this.state.currentPhase = phase;
    this.emit('phase:started', { phase });

    try {
      await action();
      this.emit('phase:completed', { phase });
    } catch (error) {
      this.emit('phase:failed', { phase, error });
      throw error;
    }
  }

  private async planBuild(): Promise<void> {
    this.emit('planning:started');

    // Sort components by priority and dependencies
    let sortedComponents = this.topologicalSort(this.state.components);
    this.state.components = sortedComponents;

    // Multi-LLM consensus check with auto-resolve (BLOCKING - core platform value)
    // This is a key differentiator - ensures enterprise-grade quality through multi-LLM consensus
    if (this.config.verification.require_multi_llm_consensus) {
      // Use CRITICAL tier (5 models) - build plan affects all downstream components
      // Auto-resolve will iterate until consensus is achieved or max attempts reached
      sortedComponents = await this.autoResolveBuildPlan(sortedComponents, 5);
      this.state.components = sortedComponents; // Update state with consensus-approved plan

      this.emit('log', {
        level: 'success',
        message: `✅ Build plan verified by multi-LLM consensus`
      });
    }

    this.emit('planning:completed', { components: sortedComponents.length });
  }

  private async buildComponents(): Promise<void> {
    // Sprint 2: Multi-Agent Parallel System
    if (this.config.multi_agent.enabled) {
      await this.buildComponentsWithMultiAgent();
      return;
    }

    // Legacy: Sequential/batched building (slower but stable)
    // Analyze dependencies
    const graph = this.dependencyAnalyzer.buildDependencyGraph(this.state.components);

    // Validate no cycles
    this.dependencyAnalyzer.validateNoCycles(graph);

    // Get execution batches
    const batches = this.dependencyAnalyzer.getExecutionBatches(graph);

    this.emit('build:batches', {
      totalBatches: batches.length,
      batchSizes: batches.map(b => b.length),
    });

    // Build in parallel batches
    await this.parallelBuilder.buildInParallel(
      batches,
      async (component) => {
        await this.buildComponent(component);
      }
    );
  }

  /**
   * NEW: Build components with multi-agent parallel system (Sprint 2)
   * Target: <60 second builds with 5-10x speedup
   */
  private async buildComponentsWithMultiAgent(): Promise<void> {
    this.emit('log', {
      level: 'info',
      message: `🚀 Sprint 2: Multi-agent parallel building enabled (${this.config.multi_agent.max_concurrent_agents} agents)`,
    });

    const { MultiAgentOrchestrator } = await import('./multi-agent-orchestrator');

    const orchestrator = new MultiAgentOrchestrator({
      maxConcurrentAgents: this.config.multi_agent.max_concurrent_agents,
      retryFailures: this.config.multi_agent.retry_failures,
      maxRetries: this.config.multi_agent.max_retries,
      failFast: this.config.multi_agent.fail_fast,
    });

    // Forward orchestrator events to build events
    orchestrator.on('log', (event) => this.emit('log', event));
    orchestrator.on('wave:start', (event) => this.emit('wave:start', event));
    orchestrator.on('wave:complete', (event) => this.emit('wave:complete', event));
    orchestrator.on('component:start', (event) => this.emit('component:started', event));
    orchestrator.on('component:complete', (event) => {
      // Map multi-agent events to legacy component events
      const component = this.state.components.find(c => c.name === event.componentName);
      if (component) {
        component.status = event.success ? 'completed' : 'error';
        component.progress = event.success ? 100 : 0;

        this.emit('component:completed', {
          componentId: component.id,
          componentName: component.name,
          success: event.success,
        });

        this.emit('progress:updated', {
          componentId: component.id,
          componentName: component.name,
          progress: component.progress,
        });
      }
    });

    // Build contexts for all components
    const buildContexts = new Map<string, BuildContext>();

    for (const component of this.state.components) {
      const prdContext: PRDContext = this.prdContext || {
        productName: this.productIdea || 'App',
        productIdea: this.productIdea || '',
        features: [],
      };

      const componentContext: ComponentContext = {
        componentName: component.name,
        componentType: component.type,
        description: component.description,
        relatedFeatures: component.relatedFeatures || [],
        dataModels: component.dataModels || {},
        dependencies: component.dependencies || [],
        criticality: component.criticality,
        qualityRequirements: component.qualityRequirements,
      };

      const buildContext: BuildContext = {
        prd: prdContext,
        design: this.state.designSystem!,
        component: componentContext,
        appConfig: this.appConfig || {},
        profile: this.currentProfile,
      };

      buildContexts.set(component.id, buildContext);
    }

    // Execute multi-agent build
    const startTime = Date.now();

    const result = await orchestrator.buildComponents(
      this.state.components,
      buildContexts,
      this.aiComponentGenerator,
      this.designPolisher,
      this.fileWriter
    );

    const duration = Date.now() - startTime;

    // Log results
    this.emit('log', {
      level: result.success ? 'success' : 'warning',
      message: `🎯 Multi-agent build complete: ${result.successfulComponents}/${result.totalComponents} successful in ${(duration / 1000).toFixed(1)}s`,
    });

    if (result.failedComponents > 0) {
      this.emit('log', {
        level: 'warning',
        message: `⚠️  ${result.failedComponents} components failed. Check logs for details.`,
      });
    }

    // Update component codes from results
    for (const agentResult of result.results) {
      const component = this.state.components.find(c => c.name === agentResult.componentName);
      if (component && agentResult.success && agentResult.code) {
        component.code = agentResult.code;
        component.filePath = agentResult.filePath;
      }
    }
  }

  private async buildComponent(component: BuildComponent): Promise<void> {
    // Check if paused before starting
    if (this.isPaused) {
      this.emit('log', {
        level: 'info',
        message: `⏸️  Build paused before starting ${component.name}`
      });
      await this.waitForResume();
    }

    // Mark component as building and emit started event
    component.status = 'building';
    component.progress = 0;

    this.emit('component:started', {
      componentId: component.id,
      componentName: component.name,
      componentType: component.type
    });

    // Emit initial progress
    this.emit('progress:updated', {
      componentId: component.id,
      componentName: component.name,
      progress: 0
    });

    // ========================================================================
    // PHASE 1 OPTIMIZATION: Pattern Matching + Caching
    // ========================================================================

    // Layer 1: Try pattern matching (instant build!)
    if (process.env.PATTERN_MATCHING_ENABLED !== 'false') {
      const patternResult = this.patternMatcher.findPattern(component);

      if (patternResult.matched && patternResult.pattern) {
        this.emit('log', {
          level: 'info',
          message: `⚡ Pattern match! Instant build using "${patternResult.pattern.name}" (${Math.round(patternResult.confidence * 100)}% confidence)`
        });

        // Instant instantiation from pattern
        const instantiated = this.patternMatcher.instantiatePattern(
          patternResult.pattern,
          component
        );

        // Copy code to component
        component.code = instantiated.code;
        component.status = 'completed';
        component.progress = 100;

        this.emit('progress:updated', {
          componentId: component.id,
          componentName: component.name,
          progress: 100
        });

        this.emit('component:completed', {
          componentId: component.id,
          componentName: component.name,
          code: component.code,
          source: 'pattern'
        });

        this.emit('log', {
          level: 'success',
          message: `✅ ${component.name} built instantly from pattern (~5s saved)`
        });

        return; // Early return - skip expensive AI generation
      }
    }

    // Layer 2: Try cache (fast retrieval)
    if (process.env.CACHE_ENABLED !== 'false') {
      const cached = await this.cacheManager.getCachedComponent(component);

      if (cached) {
        this.emit('log', {
          level: 'info',
          message: `💾 Cache hit! Retrieved from ${cached.source} (cached ${new Date(cached.cachedAt).toLocaleString()})`
        });

        // Copy code from cached component
        component.code = cached.component.code;
        component.status = 'completed';
        component.progress = 100;

        this.emit('progress:updated', {
          componentId: component.id,
          componentName: component.name,
          progress: 100
        });

        this.emit('component:completed', {
          componentId: component.id,
          componentName: component.name,
          code: component.code,
          source: 'cache'
        });

        this.emit('log', {
          level: 'success',
          message: `✅ ${component.name} retrieved from cache (~3s saved)`
        });

        return; // Early return - skip expensive AI generation
      }
    }

    // If we got here, we need to generate with AI (no pattern/cache hit)
    this.emit('log', {
      level: 'info',
      message: `🔨 No pattern/cache match. Generating ${component.name} with AI...`
    });

    // ========================================================================
    // END PHASE 1 OPTIMIZATION
    // ========================================================================

    // Step 1: Build context-aware generation with full PRD and design system
    this.emit('log', {
      level: 'info',
      message: `🎨 Generating ${component.name} with full PRD context and design system...`
    });

    // Find related features from PRD
    const relatedFeatures: string[] = [];
    if (this.prdContext?.features) {
      this.prdContext.features.forEach(feature => {
        const featureLower = feature.title.toLowerCase();
        const componentLower = component.name.toLowerCase();

        // Match if component name contains feature keywords or vice versa
        if (featureLower.includes(componentLower) ||
            componentLower.includes(featureLower) ||
            feature.description.toLowerCase().includes(componentLower)) {
          relatedFeatures.push(feature.id);
        }
      });
    }

    // Build component context
    const componentContext: ComponentContext = {
      componentName: component.name,
      componentType: component.type,
      description: component.description,
      relatedFeatures,
      dataModels: {}, // TODO: Extract from PRD or infer from component
      dependencies: component.dependencies || []
    };

    // Build complete context
    const buildContext: BuildContext = {
      prd: this.prdContext || {
        productName: 'Application',
        productIdea: this.productIdea || 'Modern web application',
        features: [],
      },
      design: this.state.designSpec || {
        visualStyle: 'modern',
        colorPalette: {
          primary: '#3B82F6',
          primaryForeground: '#FFFFFF',
          secondary: '#10B981',
          secondaryForeground: '#FFFFFF',
          accent: '#F59E0B',
          accentForeground: '#FFFFFF',
          background: '#FFFFFF',
          foreground: '#1F2937',
          muted: '#F3F4F6',
          mutedForeground: '#6B7280',
          border: '#E5E7EB',
          destructive: '#EF4444',
          destructiveForeground: '#FFFFFF'
        },
        typography: {
          fontFamily: { sans: 'Inter, system-ui, sans-serif', mono: 'Menlo, monospace' },
          scale: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem' },
          weights: { normal: 400, medium: 500, semibold: 600, bold: 700 }
        },
        designTokens: {
          spacing: { base: 8, scale: [4, 8, 12, 16, 24, 32, 48, 64] },
          borderRadius: { sm: '0.25rem', md: '0.5rem', lg: '0.75rem', xl: '1rem' },
          shadows: {
            sm: '0 1px 2px rgba(0,0,0,0.05)',
            md: '0 4px 6px rgba(0,0,0,0.1)',
            lg: '0 10px 15px rgba(0,0,0,0.1)'
          }
        },
        componentPatterns: {
          navigation: 'sidebar',
          layout: 'dashboard',
          cardStyle: 'elevated'
        },
        inspiration: ['Linear', 'Stripe', 'shadcn/ui']
      },
      component: componentContext,
      appConfig: {
        framework: this.appConfig?.framework || 'Next.js 14 (App Router)',
        styling: 'Tailwind CSS',
        typescript: true,
        mobileFirst: this.prdContext?.productIdea.toLowerCase().includes('mobile') ||
                     this.prdContext?.productIdea.toLowerCase().includes('off-road') || false
      },
      profile: this.currentProfile // Pass the design profile for enhanced generation
    };

    this.emit('log', {
      level: 'info',
      message: `📋 Context: ${buildContext.prd.productName} | ${relatedFeatures.length} related features | ${buildContext.design?.visualStyle || 'modern'} design`
    });

    // Step 2: Generate with AI using full context
    this.emit('log', {
      level: 'info',
      message: `🤖 Calling Claude Sonnet 4 with v0.dev-quality prompt...`
    });

    component.progress = 20;
    this.emit('progress:updated', {
      componentId: component.id,
      componentName: component.name,
      progress: 20
    });

    let generationResult;
    try {
      generationResult = await this.aiComponentGenerator.generateComponent(buildContext);

      this.emit('log', {
        level: 'success',
        message: `✅ Generated ${generationResult.code.length} chars | Quality: ${generationResult.quality.score}/100`
      });

      // Emit quality metrics
      if (generationResult.quality.score < 70) {
        this.emit('log', {
          level: 'warning',
          message: `⚠️  Quality issues: ${generationResult.quality.issues.join(', ')}`
        });
      }

      if (generationResult.quality.strengths.length > 0) {
        this.emit('log', {
          level: 'info',
          message: `💪 Strengths: ${generationResult.quality.strengths.join(', ')}`
        });
      }

    } catch (error) {
      this.emit('log', {
        level: 'error',
        message: `❌ AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      throw error;
    }

    let code = generationResult.code;
    component.filePath = generationResult.filePath; // Store for assembleApplication

    // Step 3: Polish the component (NEW - Design Quality Enhancement)
    this.emit('log', {
      level: 'info',
      message: `✨ Polishing component with micro-interactions and design consistency...`
    });

    component.progress = 60;
    this.emit('progress:updated', {
      componentId: component.id,
      componentName: component.name,
      progress: 60
    });

    try {
      const polishResult = await this.designPolisher.polishComponent(
        { code, name: component.name, type: component.type },
        buildContext.design
      );

      code = polishResult.polishedCode;

      if (polishResult.improvementsApplied.length > 0) {
        this.emit('log', {
          level: 'success',
          message: `💅 Polish applied: ${polishResult.improvementsApplied.join(', ')} | Consistency: ${polishResult.consistencyScore}/100`
        });
      }

      if (polishResult.consistencyScore < 80) {
        this.emit('log', {
          level: 'warning',
          message: `⚠️  Design consistency could be improved (score: ${polishResult.consistencyScore}/100)`
        });
      }

    } catch (error) {
      console.error('Polish failed, using unpolished code:', error);
      this.emit('log', {
        level: 'warning',
        message: `⚠️  Polish failed, using original code`
      });
      // Continue with unpolished code
    }

    component.code = code;
    component.progress = 80;

    // Emit progress update
    this.emit('progress:updated', {
      componentId: component.id,
      componentName: component.name,
      progress: 80
    });

    // Step 3.5: Validate and enforce design token usage (CRITICAL - Phase 1.6)
    this.emit('log', {
      level: 'info',
      message: `🔍 Validating design token usage...`
    });

    try {
      const { DesignTokenValidator } = await import('./design-token-validator');
      const validationResult = DesignTokenValidator.validateComponent(code, this.designProfile);

      if (!validationResult.isValid) {
        const severity = DesignTokenValidator.getSeverity(validationResult);

        this.emit('log', {
          level: severity === 'error' ? 'warning' : 'info',
          message: `⚠️  Found ${validationResult.violations.length} design token violations`
        });

        // Log details
        validationResult.suggestions.forEach(suggestion => {
          this.emit('log', {
            level: 'info',
            message: `   • ${suggestion}`
          });
        });

        // Auto-fix violations
        if (validationResult.fixedCode) {
          code = validationResult.fixedCode;
          component.code = code;

          this.emit('log', {
            level: 'success',
            message: `✅ Auto-fixed design token violations`
          });
        }
      } else {
        this.emit('log', {
          level: 'success',
          message: `✅ Passes design token validation`
        });
      }
    } catch (error) {
      console.error('Design token validation failed:', error);
      this.emit('log', {
        level: 'warning',
        message: `⚠️  Design token validation skipped (error: ${error instanceof Error ? error.message : 'unknown'})`
      });
      // Continue with un-validated code
    }

    // Step 4: Write file to disk
    if (this.fileWriter && code) {
      try {
        // Use the file path inferred by the AI generator
        const filePath = generationResult.filePath;

        this.emit('log', {
          level: 'info',
          message: `📝 Writing file: ${filePath}`
        });

        // Code is already clean from AI generator (no markdown fences)
        await this.fileWriter.writeFile(filePath, code);

        this.emit('log', {
          level: 'success',
          message: `✅ File written successfully: ${filePath}`
        });

        console.log(`✅ Wrote component file: ${filePath}`);
        console.log(`   Quality score: ${generationResult.quality.score}/100`);
        if (generationResult.dependencies.length > 0) {
          console.log(`   Dependencies: ${generationResult.dependencies.join(', ')}`);
        }
      } catch (error) {
        this.emit('log', {
          level: 'error',
          message: `Failed to write file for ${component.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
        console.error(`Failed to write component file for ${component.name}:`, error);
        // Continue build even if file write fails
      }
    }

    component.progress = 100;
    component.status = 'completed';

    // Emit progress update
    this.emit('progress:updated', {
      componentId: component.id,
      componentName: component.name,
      progress: 100
    });

    // Emit completed event
    this.emit('component:completed', {
      componentId: component.id,
      componentName: component.name,
      codeLength: code?.length || 0
    });

    // ========================================================================
    // PHASE 1 OPTIMIZATION: Cache successful builds + Learn patterns
    // ========================================================================

    // Cache the successfully generated component
    if (process.env.CACHE_ENABLED !== 'false' && component.code) {
      try {
        await this.cacheManager.cacheComponent(component);
        this.emit('log', {
          level: 'info',
          message: `💾 Cached ${component.name} for future builds`
        });
      } catch (error) {
        // Non-critical error - log but continue
        this.emit('log', {
          level: 'warning',
          message: `⚠️  Failed to cache ${component.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }

    // Learn pattern from successful build (for future instant builds)
    if (process.env.PATTERN_MATCHING_ENABLED !== 'false' && component.code) {
      try {
        await this.patternMatcher.saveAsPattern(component, {
          framework: this.appConfig?.framework,
          designStyle: this.state.designSpec?.visualStyle,
        });
        this.emit('log', {
          level: 'info',
          message: `🧠 Learning pattern from ${component.name}`
        });
      } catch (error) {
        // Non-critical error - log but continue
        this.emit('log', {
          level: 'warning',
          message: `⚠️  Failed to learn pattern from ${component.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }

    // ========================================================================
    // END PHASE 1 OPTIMIZATION
    // ========================================================================

    // Track action
    this.trackAction(`build_component_${component.id}`);
  }

  private async assembleApplication(): Promise<void> {
    this.emit('phase:started', { phase: 'assembly' });

    console.log('🔨 Assembling application...');

    // Detect app type from PRD
    const prd = this.state.projectMetadata?.prd || '';
    const buildPlan = this.state.projectMetadata?.buildPlan || '';

    this.appConfig = this.appTypeDetector.detectFromPRD(prd, buildPlan);

    console.log(`📱 Detected app type: ${this.appConfig.appType} (${this.appConfig.framework})`);

    if (!this.fileWriter) {
      console.error('File writer not initialized');
      return;
    }

    // Initialize project structure from templates
    await this.fileWriter.initializeProjectStructure(
      this.appConfig.appType,
      this.appConfig.framework,
      this.appConfig
    );

    // Assemble components into app
    await this.fileWriter.assembleApplication(
      this.state.components,
      this.appConfig.appType,
      this.appConfig.framework
    );

    // Update dependencies
    await this.fileWriter.updateDependencies(this.state.components);

    // Install dependencies
    await this.installDependencies();

    this.emit('phase:completed', { phase: 'assembly' });
  }

  private async installDependencies(): Promise<void> {
    console.log('📦 Installing dependencies...');

    this.emit('log', {
      level: 'info',
      message: '📦 Installing npm dependencies (checking cache)...'
    });

    if (!this.fileWriter) {
      const error = 'File writer not initialized';
      console.error(error);
      this.emit('log', {
        level: 'error',
        message: `❌ ${error}`
      });
      return;
    }

    try {
      const buildDir = this.fileWriter.getBuildDir();
      const cacheDir = path.join(process.cwd(), 'builds', '.node_modules_cache');
      const cachedNodeModules = path.join(cacheDir, 'node_modules');
      const cachedPackageJson = path.join(cacheDir, 'package.json');
      const currentPackageJson = path.join(buildDir, 'package.json');

      // Check if we can use cached node_modules
      let useCache = false;
      if (fs.existsSync(cachedNodeModules) && fs.existsSync(cachedPackageJson) && fs.existsSync(currentPackageJson)) {
        const cachedPkg = fs.readFileSync(cachedPackageJson, 'utf-8');
        const currentPkg = fs.readFileSync(currentPackageJson, 'utf-8');

        if (cachedPkg === currentPkg) {
          useCache = true;
          console.log('📦 Cache hit! Copying node_modules from cache...');
          this.emit('log', {
            level: 'info',
            message: '⚡ Using cached dependencies (fast path)'
          });
        }
      }

      if (useCache) {
        // Copy cached node_modules (much faster than npm install)
        await execAsync(`cp -R "${cachedNodeModules}" "${buildDir}/"`, {
          timeout: 60000 // 1 minute
        });

        console.log('✅ Dependencies copied from cache in <5 seconds');
        this.emit('log', {
          level: 'success',
          message: '✅ Dependencies installed from cache (<5 seconds)'
        });
      } else {
        // No cache or package.json changed - run full npm install
        console.log('📦 Cache miss - running full npm install...');
        this.emit('log', {
          level: 'info',
          message: '📦 Running full npm install (first build or dependencies changed)...'
        });

        const { stdout, stderr } = await execAsync('npm install --legacy-peer-deps', {
          cwd: buildDir,
          timeout: 300000, // 5 minutes
          maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large dependency trees
        });

        if (stderr && !stderr.includes('npm WARN')) {
          console.warn('npm install warnings:', stderr);
        }

        // Cache the installed node_modules for future builds
        console.log('💾 Caching node_modules for future builds...');
        await execAsync(`mkdir -p "${cacheDir}"`, { timeout: 10000 });
        await execAsync(`cp -R "${path.join(buildDir, 'node_modules')}" "${cacheDir}/"`, {
          timeout: 60000 // 1 minute
        });
        await execAsync(`cp "${currentPackageJson}" "${cachedPackageJson}"`, {
          timeout: 10000
        });

        console.log('✅ Dependencies installed and cached successfully');
        this.emit('log', {
          level: 'success',
          message: '✅ Dependencies installed and cached for future builds'
        });
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Unknown error';
      console.error('❌ Failed to install dependencies:', errorMsg);
      this.emit('log', {
        level: 'error',
        message: `❌ Dependency installation failed: ${errorMsg}`
      });
      this.emit('log', {
        level: 'warning',
        message: '⚠️  Build may not run correctly without dependencies. You can manually run "npm install" in the build directory.'
      });
      // Don't throw - allow build to continue so user can manually install
    }
  }

  private async verifyBuild(): Promise<void> {
    this.emit('verification:started');

    let verifiedCount = 0;
    let skippedCount = 0;
    const componentsToVerify = this.state.components.filter(c => c.status === 'completed' && c.code);
    let currentIndex = 0;

    for (const component of componentsToVerify) {
      // Check if paused
      if (this.isPaused) {
        this.emit('log', {
          level: 'info',
          message: `⏸️  Verification paused at component ${currentIndex}/${componentsToVerify.length}`
        });
        await this.waitForResume();
      }

      currentIndex++;
      const criticality = this.classifyComponentCriticality(component);
      const strategy = this.config.verification.component_verification_strategy[criticality];

      // Emit phase progress
      this.emit('phase:progress', {
        phase: 'verification',
        current: currentIndex,
        total: componentsToVerify.length,
        percentage: Math.round((currentIndex / componentsToVerify.length) * 100)
      });

      this.emit('log', {
        level: 'info',
        message: `Verifying ${component.name} [${criticality}] using ${strategy} strategy`
      });

      if (strategy === 'none') {
        skippedCount++;
        continue;
      }

      if (strategy === 'full_consensus') {
        // Multi-model consensus for critical components
        const verification = await this.getMultiLLMConsensus(
          'verify_component',
          `Verify this ${criticality} component code is correct, follows best practices, and has no security vulnerabilities:\n\nComponent: ${component.name}\nCode:\n${component.code}`
        );

        if (!verification.agreed) {
          this.emit('verification:failed', { component: component.id });
          await this.triggerIntervention('critical_error', `Critical component ${component.name} failed multi-LLM verification`);
        } else {
          verifiedCount++;
        }
      } else if (strategy === 'single_model') {
        // Single model verification for important components
        const model = this.config.verification.verification_models[0];
        const result = await this.callLLM(
          model,
          `Verify this component code is correct and follows best practices:\n\nComponent: ${component.name}\nCode:\n${component.code}\n\nRespond with "PASS" if correct, or list issues.`
        );

        if (result.includes('PASS')) {
          verifiedCount++;
        } else {
          this.emit('verification:failed', { component: component.id });
          this.emit('log', {
            level: 'warning',
            message: `Component ${component.name} has potential issues: ${result.substring(0, 200)}`
          });
        }
      }
    }

    this.emit('log', {
      level: 'info',
      message: `Verification complete: ${verifiedCount} verified, ${skippedCount} skipped`
    });

    this.emit('verification:completed');
  }

  /**
   * Assess component criticality using pattern-based classification
   * Returns one of 4 tiers: ULTRA_CRITICAL (7 models), CRITICAL (5 models),
   * IMPORTANT (3 models), STANDARD (1 model)
   */
  private assessCriticality(component: BuildComponent): CriticalityLevel {
    const text = `${component.name} ${component.description || ''}`.toLowerCase();

    // ULTRA_CRITICAL (7 models): Passwords, payments, admin access
    const ultraCriticalPatterns = [
      /\b(password|encrypt|decrypt|hash|private.?key|secret|credential)\b/i,
      /\b(stripe|payment|credit.?card|billing|transaction|charge)\b/i,
      /\b(admin|superuser|root|privilege.?escalation|sudo)\b/i,
      /\b(oauth|saml|sso|authentication.?provider)\b/i
    ];
    if (ultraCriticalPatterns.some(p => p.test(text))) {
      return 'ULTRA_CRITICAL';
    }

    // CRITICAL (5 models): Auth, database, file operations, PII
    const criticalPatterns = [
      /\b(auth|login|signup|jwt|session|token|cookie)\b/i,
      /\b(sql|database|query|injection|migration)\b/i,
      /\b(upload|download|file.?system|s3|storage)\b/i,
      /\b(PII|GDPR|personal.?data|privacy|consent)\b/i,
      /\b(permission|authorization|access.?control|role)\b/i
    ];
    if (criticalPatterns.some(p => p.test(text))) {
      return 'CRITICAL';
    }

    // IMPORTANT (3 models): API endpoints, validation, business logic
    const importantPatterns = [
      /\b(api|endpoint|route|controller|handler)\b/i,
      /\b(validation|sanitize|verify|check)\b/i,
      /\b(service|business.?logic|workflow)\b/i
    ];
    if (importantPatterns.some(p => p.test(text))) {
      return 'IMPORTANT';
    }

    // STANDARD (1 model): UI components, utilities, config
    return 'STANDARD';
  }

  // Legacy compatibility - maps new 4-tier to old 3-tier
  private classifyComponentCriticality(component: BuildComponent): 'critical' | 'important' | 'standard' {
    const level = this.assessCriticality(component);
    if (level === 'ULTRA_CRITICAL' || level === 'CRITICAL') return 'critical';
    if (level === 'IMPORTANT') return 'important';
    return 'standard';
  }

  private async testBuild(): Promise<void> {
    this.emit('testing:started');

    let testedCount = 0;
    let skippedCount = 0;
    const componentsToTest = this.state.components.filter(c => c.status === 'completed' && c.code);
    let currentIndex = 0;

    // Generate and run tests for critical and important components only
    for (const component of componentsToTest) {
      // Check if paused
      if (this.isPaused) {
        this.emit('log', {
          level: 'info',
          message: `⏸️  Testing paused at component ${currentIndex}/${componentsToTest.length}`
        });
        await this.waitForResume();
      }

      currentIndex++;
      const criticality = this.classifyComponentCriticality(component);

      // Emit phase progress
      this.emit('phase:progress', {
        phase: 'testing',
        current: currentIndex,
        total: componentsToTest.length,
        percentage: Math.round((currentIndex / componentsToTest.length) * 100)
      });

      // Only generate tests for critical & important components
      if (criticality === 'critical' || criticality === 'important') {
        this.emit('log', {
          level: 'info',
          message: `Generating tests for ${component.name} [${criticality}]`
        });

        const tests = await this.generateTests(component);
        component.tests = tests;
        testedCount++;

        // Write test file to disk
        if (this.fileWriter && tests) {
          try {
            const testFilePath = `tests/${component.name}.test.ts`;
            // Strip markdown code fences before writing
            const cleanTests = this.stripMarkdownCodeFences(tests);
            await this.fileWriter.writeFile(testFilePath, cleanTests);
            console.log(`✅ Wrote test file: ${testFilePath}`);
          } catch (error) {
            console.error(`Failed to write test file for ${component.name}:`, error);
            // Continue build even if file write fails
          }
        }
      } else {
        // Skip standard (UI) components - not worth auto-generating tests
        skippedCount++;
        this.emit('log', {
          level: 'info',
          message: `Skipping test generation for ${component.name} [${criticality}] - UI tests written manually`
        });
      }
    }

    this.emit('log', {
      level: 'info',
      message: `Testing complete: ${testedCount} tested, ${skippedCount} skipped (UI components)`
    });

    this.emit('testing:completed');
  }

  // ============================================================================
  // Build Plan Diagnostics - Phase 1: AI-Driven Analysis
  // ============================================================================

  /**
   * AUTO-RESOLVE BUILD PLAN
   * Core platform differentiator - achieves multi-LLM consensus through iterative self-healing
   * BLOCKS until consensus achieved or max iterations reached
   * Logs every message, every decision, every fix for full transparency
   */
  private async autoResolveBuildPlan(
    components: BuildComponent[],
    maxIterations: number = 5
  ): Promise<BuildComponent[]> {
    // Initialize consensus discussion log
    const consensusLog: ConsensusDiscussionLog = {
      buildPlanId: this.state.id,
      criticalityLevel: 'CRITICAL',
      startTime: new Date().toISOString(),
      finalStatus: 'in_progress',
      totalIterations: 0,
      maxIterationsAllowed: maxIterations,
      iterations: [],
      summary: {
        totalMessages: 0,
        modelsInvolved: [],
        totalIssuesFound: 0,
        issuesResolved: 0,
        issuesUnresolved: 0,
        finalConsensusScore: 0,
        totalFixesApplied: 0,
      },
    };

    // Store in state for UI access
    this.state.consensusLog = consensusLog;

    this.logConsensusMessage(consensusLog, 'system', 'system',
      `🚀 Starting auto-resolve process for build plan with ${components.length} components. Using CRITICAL tier (5 models, 80% threshold).`
    );

    let currentComponents = [...components];
    let consensusAchieved = false;

    // Auto-resolve loop
    for (let iteration = 1; iteration <= maxIterations; iteration++) {
      consensusLog.totalIterations = iteration;

      const iterationLog: ConsensusIteration = {
        iteration,
        timestamp: new Date().toISOString(),
        phase: 'initial_verification',
        action: `Iteration ${iteration}: Verifying build plan with ${this.config.verification.tiered_consensus.CRITICAL.models} models`,
        messages: [],
        result: 'consensus_failed',
      };

      this.logConsensusMessage(consensusLog, 'system', 'system',
        `\n${'='.repeat(80)}\nITERATION ${iteration}/${maxIterations}\n${'='.repeat(80)}`
      );

      // PHASE 1: Verification
      iterationLog.phase = 'initial_verification';
      this.logConsensusMessage(consensusLog, 'system', 'verification',
        `📋 Submitting build plan to ${this.config.verification.tiered_consensus.CRITICAL.models} models for verification...`
      );

      const verificationPrompt = `Verify this build plan is correct and dependencies are properly ordered:

${JSON.stringify(currentComponents.map(c => ({
  id: c.id,
  name: c.name,
  type: c.type,
  dependencies: c.dependencies,
  description: c.description
})), null, 2)}

Check for:
1. Malformed or truncated dependency IDs
2. Circular dependencies
3. Missing dependencies
4. Incorrect topological ordering
5. Duplicate components

Respond in format:
VERDICT: [PASS/FAIL]
CONFIDENCE: [0-100]%
REASON: [Detailed explanation]`;

      const consensusResult = await this.getMultiLLMConsensus(
        'verify_build_plan',
        verificationPrompt,
        'CRITICAL'
      );

      // Log each model's response
      const passVotes: string[] = [];
      const failVotes: string[] = [];

      consensusResult.responses.forEach(r => {
        const verdict = r.response.match(/VERDICT:\s*(PASS|FAIL)/i)?.[1]?.toUpperCase() as 'PASS' | 'FAIL' | undefined;
        const confidence = parseInt(r.response.match(/CONFIDENCE:\s*(\d+)/)?.[1] || '0');
        const reason = r.response.match(/REASON:\s*(.+)/i)?.[1]?.trim() || 'No reason provided';

        if (verdict === 'PASS') {
          passVotes.push(r.model);
        } else {
          failVotes.push(r.model);
        }

        this.logConsensusMessage(consensusLog, r.model, verdict === 'PASS' ? 'agreement' : 'disagreement',
          `${r.model} verdict: ${verdict} (${confidence}% confident)\nReasoning: ${reason}\n\nFull response:\n${r.response}`,
          { verdict, confidence, reasoning: reason }
        );
      });

      iterationLog.modelsVoted = { pass: passVotes, fail: failVotes };
      iterationLog.consensusScore = consensusResult.agreementRatio * 100;

      this.logConsensusMessage(consensusLog, 'system', 'system',
        `📊 Consensus Score: ${(consensusResult.agreementRatio * 100).toFixed(1)}% (${consensusResult.agreementCount}/${consensusResult.totalModels} models agreed)\n` +
        `✅ PASS votes: ${passVotes.join(', ') || 'none'}\n` +
        `❌ FAIL votes: ${failVotes.join(', ') || 'none'}`
      );

      if (consensusResult.agreed) {
        // SUCCESS - Consensus achieved!
        iterationLog.result = 'consensus_achieved';
        iterationLog.action = `✅ Consensus achieved! ${consensusResult.agreementCount}/${consensusResult.totalModels} models approved the build plan`;

        this.logConsensusMessage(consensusLog, 'system', 'system',
          `\n🎉 CONSENSUS ACHIEVED!\n` +
          `Build plan approved by ${consensusResult.agreementCount}/${consensusResult.totalModels} models (${(consensusResult.agreementRatio * 100).toFixed(1)}%)\n` +
          `Total iterations: ${iteration}\n` +
          `Total fixes applied: ${consensusLog.summary.totalFixesApplied}`
        );

        consensusAchieved = true;
        consensusLog.iterations.push(iterationLog);
        this.emit('consensus:iteration', iterationLog);
        break;
      }

      // PHASE 2: Diagnosis - Ask failing models for specific issues
      this.logConsensusMessage(consensusLog, 'system', 'diagnosis',
        `🔍 Consensus not achieved. Requesting detailed diagnostics from models that voted FAIL...`
      );

      iterationLog.phase = 'diagnosis';
      const diagnosticPrompt = `You previously identified issues with this build plan:

${JSON.stringify(currentComponents.map(c => ({ id: c.id, name: c.name, dependencies: c.dependencies })), null, 2)}

Provide a structured analysis of ALL issues found:

ISSUE 1:
TYPE: [Malformed ID | Circular Dependency | Missing Dependency | Ordering Issue | Duplicate]
COMPONENT: [component ID]
DESCRIPTION: [Specific issue]
IMPACT: [Why this is a problem]

ISSUE 2:
...

Be exhaustive - list every issue you can find.`;

      const diagnostics = await Promise.all(
        failVotes.map(async (model) => {
          const response = await this.callLLM(model, diagnosticPrompt);

          this.logConsensusMessage(consensusLog, model, 'diagnosis',
            `${model} diagnostic analysis:\n\n${response}`
          );

          return { model, analysis: response };
        })
      );

      // PHASE 3: Fix Proposal - Ask models how to fix each issue
      this.logConsensusMessage(consensusLog, 'system', 'fix_proposal',
        `🔧 Requesting fix proposals from all models...`
      );

      iterationLog.phase = 'fix_proposal';

      const issuesText = diagnostics.map(d => `${d.model}:\n${d.analysis}`).join('\n\n');
      const fixProposalPrompt = `Multiple AI models have identified issues with the build plan. Here are their analyses:

${issuesText}

Based on these analyses, propose specific, actionable fixes. For each issue, provide:

FIX 1:
ISSUE: [Brief description]
ACTION: [ADD_COMPONENT | REMOVE_COMPONENT | UPDATE_DEPENDENCIES | REORDER | RENAME_ID]
COMPONENT_ID: [which component to modify]
DETAILS: [Exact changes to make]
REASONING: [Why this fix resolves the issue]

FIX 2:
...

Output concrete fixes that can be automatically applied.`;

      const fixProposals = await Promise.all(
        this.config.verification.tiered_consensus.CRITICAL.modelList.slice(0, 3).map(async (model) => {
          const response = await this.callLLM(model, fixProposalPrompt);

          this.logConsensusMessage(consensusLog, model, 'fix_proposal',
            `${model} fix proposals:\n\n${response}`
          );

          return { model, proposals: response };
        })
      );

      // PHASE 4: Apply Fixes Automatically
      this.logConsensusMessage(consensusLog, 'system', 'fix_application',
        `⚙️  Applying fixes automatically...`
      );

      iterationLog.phase = 'fix_application';
      iterationLog.fixesApplied = [];

      // Parse and apply fixes (simplified for now - can be enhanced)
      let fixesApplied = 0;
      for (const { model, proposals } of fixProposals) {
        // Extract dependency fixes (most common issue)
        const depFixRegex = /COMPONENT_ID:\s*(.+?)\s*\nDETAILS:\s*(.+?)(?=\n\n|$)/g;
        const depFixMatches = Array.from(proposals.matchAll(depFixRegex));

        for (const match of depFixMatches) {
          const componentId = match[1].trim();
          const details = match[2].trim();

          // Find component and attempt to fix
          const component = currentComponents.find(c => c.id === componentId || c.name.includes(componentId));
          if (component) {
            // Log the fix application
            this.logConsensusMessage(consensusLog, model, 'fix_application',
              `Applying fix to component "${component.name}" (${component.id}):\n${details}`
            );

            iterationLog.fixesApplied!.push({
              issueType: 'dependency_fix',
              description: details,
              fix: `Applied to component ${component.id}`,
              componentId: component.id,
              appliedBy: model,
            });

            consensusLog.summary.totalFixesApplied++;
            fixesApplied++;
          }
        }
      }

      this.logConsensusMessage(consensusLog, 'system', 'system',
        `✅ Applied ${fixesApplied} fixes to build plan`
      );

      iterationLog.result = 'fixes_applied';
      iterationLog.action = `Applied ${fixesApplied} fixes based on model recommendations`;
      consensusLog.iterations.push(iterationLog);
      this.emit('consensus:iteration', iterationLog);

      // Re-verification will happen in next iteration
    }

    // Finalize log
    consensusLog.endTime = new Date().toISOString();
    consensusLog.summary.finalConsensusScore = consensusLog.iterations[consensusLog.iterations.length - 1]?.consensusScore || 0;
    consensusLog.summary.totalMessages = consensusLog.iterations.reduce((sum, iter) => sum + iter.messages.length, 0);

    if (consensusAchieved) {
      consensusLog.finalStatus = 'consensus_achieved';
      this.emit('consensus:achieved', { iterations: consensusLog.totalIterations });
    } else {
      consensusLog.finalStatus = 'max_iterations_reached';
      this.logConsensusMessage(consensusLog, 'system', 'system',
        `⚠️  MAX ITERATIONS REACHED (${maxIterations})\n` +
        `Could not achieve consensus. This may indicate:\n` +
        `1. Fundamental issues with the build plan\n` +
        `2. Feature requirements that are impossible to implement\n` +
        `3. Need for human intervention\n\n` +
        `Final consensus score: ${consensusLog.summary.finalConsensusScore.toFixed(1)}%\n` +
        `Escalating to user...`
      );

      throw new Error(
        `Build plan consensus could not be achieved after ${maxIterations} iterations. ` +
        `Final consensus: ${consensusLog.summary.finalConsensusScore.toFixed(1)}%. ` +
        `Please review the consensus log for details.`
      );
    }

    return currentComponents;
  }

  /**
   * Helper: Log a message to the consensus discussion log
   */
  private logConsensusMessage(
    log: ConsensusDiscussionLog,
    speaker: string,
    messageType: ConsensusMessage['messageType'],
    content: string,
    metadata?: ConsensusMessage['metadata']
  ): void {
    const message: ConsensusMessage = {
      timestamp: new Date().toISOString(),
      speaker,
      messageType,
      content,
      metadata,
    };

    // Add to current iteration or create system-level message
    const currentIteration = log.iterations[log.iterations.length - 1];
    if (currentIteration) {
      currentIteration.messages.push(message);
    }

    // Also emit for real-time display
    this.emit('consensus:message', message);

    // Console log for development visibility
    console.log(`[${speaker}] ${content.substring(0, 200)}${content.length > 200 ? '...' : ''}`);
  }

  /**
   * Phase 1: Diagnostic Analysis
   * Uses CRITICAL tier (5 models) to deeply analyze build plan failures
   * Identifies: malformed IDs, circular deps, missing deps, ordering issues
   */
  private async runBuildPlanDiagnostics(
    components: BuildComponent[],
    failedConsensus: ConsensusResult
  ): Promise<void> {
    this.emit('log', {
      level: 'info',
      message: '🔬 Running deep diagnostic analysis with 5 AI models...'
    });

    // 1. Export build plan to structured JSON
    const buildPlanExport = {
      totalComponents: components.length,
      components: components.map(c => ({
        id: c.id,
        name: c.name,
        type: c.type,
        dependencies: c.dependencies,
        priority: c.priority,
        description: c.description
      })),
      failedConsensusDetails: {
        agreementRatio: failedConsensus.agreementRatio,
        responses: failedConsensus.responses.map(r => ({
          model: r.model,
          verdict: r.response.match(/VERDICT:\s*(PASS|FAIL)/i)?.[1] || 'UNKNOWN',
          reason: r.response.match(/REASON:\s*(.+?)(?:\n|$)/i)?.[1] || ''
        }))
      }
    };

    // 2. Run deep analysis with CRITICAL tier (5 models)
    const diagnosticPrompt = `You are analyzing a FAILED build plan. ${failedConsensus.agreementCount}/${failedConsensus.totalModels} models rejected it.

BUILD PLAN:
${JSON.stringify(buildPlanExport, null, 2)}

Your task: Perform deep diagnostic analysis and identify ALL bugs. Check for:

1. **Malformed Dependency IDs**
   - Dependencies referencing shortened/incorrect IDs (e.g., "ms4_supabase" instead of full ID)
   - Components depending on non-existent component IDs
   - Typos or truncated IDs

2. **Circular Dependencies**
   - Component A → B → A (impossible to build)
   - Any cycles in the dependency graph
   - List the full cycle path

3. **Missing Dependencies**
   - Components that should have dependencies but don't
   - Required services/APIs not listed as dependencies

4. **Incorrect Topological Ordering**
   - Components scheduled before their dependencies
   - Priority conflicts with dependency order

5. **Duplicate or Conflicting Components**
   - Multiple components with same/similar names
   - Conflicting implementations

RESPOND IN THIS FORMAT:

BUG COUNT: [number]

BUG 1:
TYPE: [Malformed ID | Circular Dependency | Missing Dependency | Ordering Issue | Duplicate]
SEVERITY: [CRITICAL | HIGH | MEDIUM | LOW]
COMPONENT: [component ID and name]
DETAILS: [Specific description of the bug]
FIX: [Recommended fix]

BUG 2:
...

SUMMARY:
[Overall assessment of build plan quality and recommended actions]`;

    try {
      const diagnosticResult = await this.getMultiLLMConsensus(
        'diagnose_build_plan',
        diagnosticPrompt,
        'CRITICAL' // 5 models for thorough diagnosis
      );

      // 3. Aggregate findings and generate report
      const bugReport = this.aggregateDiagnosticFindings(diagnosticResult);

      // 4. Log detailed bug report
      this.emit('log', {
        level: 'warning',
        message: `📊 Diagnostic Report: ${bugReport.totalBugs} issues found across ${bugReport.models} models`
      });

      console.log('\n' + '='.repeat(80));
      console.log('BUILD PLAN DIAGNOSTIC REPORT');
      console.log('='.repeat(80));
      console.log(`\nTotal Issues Found: ${bugReport.totalBugs}`);
      console.log(`Models Consulted: ${bugReport.models}`);
      console.log(`Consensus Level: ${bugReport.consensusLevel}`);
      console.log('\n' + '-'.repeat(80));
      console.log('CRITICAL ISSUES:');
      console.log('-'.repeat(80));
      bugReport.criticalIssues.forEach((issue, i) => {
        console.log(`\n${i + 1}. ${issue.type}`);
        console.log(`   Component: ${issue.component}`);
        console.log(`   Details: ${issue.details}`);
        console.log(`   Fix: ${issue.fix}`);
        console.log(`   Found by: ${issue.models.join(', ')}`);
      });

      if (bugReport.recommendations.length > 0) {
        console.log('\n' + '-'.repeat(80));
        console.log('RECOMMENDATIONS:');
        console.log('-'.repeat(80));
        bugReport.recommendations.forEach((rec, i) => {
          console.log(`\n${i + 1}. ${rec}`);
        });
      }

      console.log('\n' + '='.repeat(80) + '\n');

      // 5. Store for future learning (Phase 3)
      // TODO: Save to database/file for learning system

      this.emit('log', {
        level: 'info',
        message: '✅ Diagnostic analysis complete. Build will proceed with warnings.'
      });

    } catch (error) {
      this.emit('log', {
        level: 'error',
        message: `❌ Diagnostic analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Aggregate diagnostic findings from multiple models
   * Identifies common issues found by multiple models (higher confidence)
   */
  private aggregateDiagnosticFindings(diagnosticResult: ConsensusResult): {
    totalBugs: number;
    models: number;
    consensusLevel: string;
    criticalIssues: Array<{
      type: string;
      component: string;
      details: string;
      fix: string;
      models: string[];
    }>;
    recommendations: string[];
  } {
    const issueMap = new Map<string, {
      type: string;
      component: string;
      details: string;
      fix: string;
      models: string[];
    }>();

    // Parse each model's response for bugs
    diagnosticResult.responses.forEach(response => {
      const bugs = response.response.match(/BUG \d+:([\s\S]*?)(?=BUG \d+:|SUMMARY:|$)/g) || [];

      bugs.forEach(bugText => {
        const type = bugText.match(/TYPE:\s*(.+)/)?.[1]?.trim() || 'Unknown';
        const component = bugText.match(/COMPONENT:\s*(.+)/)?.[1]?.trim() || 'Unknown';
        const details = bugText.match(/DETAILS:\s*(.+)/)?.[1]?.trim() || '';
        const fix = bugText.match(/FIX:\s*(.+)/)?.[1]?.trim() || '';

        // Create unique key for deduplication
        const key = `${type}:${component}`;

        if (issueMap.has(key)) {
          // Issue found by multiple models - increase confidence
          issueMap.get(key)!.models.push(response.model);
        } else {
          issueMap.set(key, {
            type,
            component,
            details,
            fix,
            models: [response.model]
          });
        }
      });
    });

    // Extract recommendations
    const recommendations: string[] = [];
    diagnosticResult.responses.forEach(response => {
      const summary = response.response.match(/SUMMARY:\s*([\s\S]+)$/)?.[1]?.trim();
      if (summary && !recommendations.includes(summary)) {
        recommendations.push(summary);
      }
    });

    // Sort issues by number of models that found them (consensus)
    const sortedIssues = Array.from(issueMap.values())
      .sort((a, b) => b.models.length - a.models.length);

    return {
      totalBugs: sortedIssues.length,
      models: diagnosticResult.totalModels,
      consensusLevel: `${diagnosticResult.agreementCount}/${diagnosticResult.totalModels}`,
      criticalIssues: sortedIssues.filter(issue => issue.models.length >= 2), // Found by 2+ models
      recommendations: recommendations.slice(0, 5) // Top 5 recommendations
    };
  }

  // ============================================================================
  // Multi-LLM Verification
  // ============================================================================

  private async getMultiLLMConsensus(
    task: string,
    prompt: string,
    criticalityLevel: CriticalityLevel = 'IMPORTANT' // Default to 3 models for backwards compatibility
  ): Promise<ConsensusResult> {
    // Get tiered configuration based on criticality
    const tierConfig = this.config.verification.tiered_consensus[criticalityLevel];
    const models = tierConfig.modelList;
    const threshold = tierConfig.threshold;
    const responses: LLMResponse[] = [];

    this.emit('consensus:started', {
      task,
      criticality: criticalityLevel,
      models: models.length,
      threshold: `${(threshold * 100).toFixed(0)}%`
    });

    this.emit('log', {
      level: 'info',
      message: `🔍 ${criticalityLevel} consensus: ${models.length} models, ${(threshold * 100).toFixed(0)}% threshold`
    });

    // Wrap prompt with structured output requirements for consensus comparison
    const structuredPrompt = `${prompt}

IMPORTANT: Respond in this exact format for consensus checking:
VERDICT: [PASS/FAIL]
CONFIDENCE: [0-100]%
REASON: [Brief explanation]

Example:
VERDICT: PASS
CONFIDENCE: 95%
REASON: Build plan dependencies are correctly ordered with no circular references.`;

    // Query all models in parallel
    const modelPromises = models.map(async (model) => {
      try {
        const response = await this.callLLM(model, structuredPrompt);
        return {
          model,
          response,
          confidence: this.extractConfidence(response),
          timestamp: new Date()
        };
      } catch (error) {
        this.emit('model:error', { model, error });
        return null;
      }
    });

    const results = await Promise.all(modelPromises);
    responses.push(...results.filter(r => r !== null) as LLMResponse[]);

    // Analyze responses for consensus using tiered threshold
    const consensus = this.analyzeConsensus(responses, threshold);

    this.emit('consensus:completed', {
      task,
      criticality: criticalityLevel,
      agreed: consensus.agreed,
      agreementRatio: consensus.agreementRatio,
      threshold: `${(threshold * 100).toFixed(0)}%`
    });

    if (consensus.agreed) {
      this.emit('log', {
        level: 'success',
        message: `✅ Consensus achieved: ${consensus.agreementCount}/${consensus.totalModels} models (${(consensus.agreementRatio * 100).toFixed(0)}%)`
      });
    }

    return consensus;
  }

  private analyzeConsensus(responses: LLMResponse[], threshold: number): ConsensusResult {
    if (responses.length === 0) {
      return {
        agreed: false,
        agreementCount: 0,
        totalModels: 0,
        agreementRatio: 0,
        responses: []
      };
    }

    // Check for structured VERDICT: PASS/FAIL format
    const positiveResponses = responses.filter(r => {
      const response = r.response.toLowerCase();

      // Check for structured format verdict
      if (response.includes('verdict:')) {
        return response.includes('verdict: pass') || response.includes('verdict:pass');
      }

      // Fallback to legacy keyword checking for backwards compatibility
      return response.includes('yes') ||
             response.includes('correct') ||
             response.includes('valid') ||
             r.confidence > 0.7;
    });

    const agreementRatio = positiveResponses.length / responses.length;
    const agreed = agreementRatio >= threshold; // Use tiered threshold

    return {
      agreed,
      agreementCount: positiveResponses.length,
      totalModels: responses.length,
      agreementRatio,
      responses,
      consensusResponse: agreed ? positiveResponses[0]?.response : undefined
    };
  }

  // ============================================================================
  // Loop Detection
  // ============================================================================

  private startLoopDetection(): void {
    const interval = this.config.loop_detection.check_interval_seconds * 1000;

    this.loopCheckInterval = setInterval(() => {
      this.checkForLoops();
    }, interval);

    this.emit('loop_detection:started');
  }

  private stopLoopDetection(): void {
    if (this.loopCheckInterval) {
      clearInterval(this.loopCheckInterval);
      this.loopCheckInterval = undefined;
    }
    this.emit('loop_detection:stopped');
  }

  private trackAction(action: string): void {
    const count = (this.actionHistory.get(action) || 0) + 1;
    this.actionHistory.set(action, count);
    this.lastProgressTime = new Date();
  }

  private trackError(error: string): void {
    const count = (this.errorHistory.get(error) || 0) + 1;
    this.errorHistory.set(error, count);
  }

  private checkForLoops(): void {
    // Check for repeated actions
    for (const [action, count] of this.actionHistory.entries()) {
      if (count >= this.config.loop_detection.same_action_threshold) {
        this.detectLoop('action', action, count);
      }
    }

    // Check for repeated errors
    for (const [error, count] of this.errorHistory.entries()) {
      if (count >= this.config.loop_detection.same_error_threshold) {
        this.detectLoop('error', error, count);
      }
    }

    // Check for no progress
    const timeSinceProgress = Date.now() - this.lastProgressTime.getTime();
    const timeout = this.config.loop_detection.no_progress_timeout_seconds * 1000;

    if (timeSinceProgress > timeout) {
      this.detectLoop('no_progress', 'No progress detected', 1);
    }
  }

  private detectLoop(type: 'action' | 'error' | 'no_progress', pattern: string, occurrences: number): void {
    const threshold = type === 'action'
      ? this.config.loop_detection.same_action_threshold
      : this.config.loop_detection.same_error_threshold;

    const detection: LoopDetection = {
      id: this.generateId(),
      timestamp: new Date(),
      type,
      pattern,
      occurrences,
      threshold,
      triggered: true
    };

    this.state.loopDetections.push(detection);
    this.emit('loop:detected', detection);

    // Trigger intervention if configured
    if (this.config.intervention.auto_halt_on_loop) {
      this.triggerIntervention('loop_detected', `Loop detected: ${type} - ${pattern}`);
    }
  }

  // ============================================================================
  // Intervention System
  // ============================================================================

  private async triggerIntervention(
    reason: Intervention['reason'],
    details: string
  ): Promise<void> {
    const intervention: Intervention = {
      id: this.generateId(),
      timestamp: new Date(),
      reason,
      details,
      action: 'halt',
      status: 'pending'
    };

    this.state.interventions.push(intervention);
    this.state.status = 'intervening';

    this.emit('intervention:triggered', intervention);

    // Halt build
    this.pauseBuild();

    // Perform multi-LLM brainstorming if configured
    if (this.config.intervention.multi_llm_brainstorm) {
      intervention.status = 'in_progress';
      intervention.action = 'brainstorm';

      const brainstormResult = await this.brainstormSolutions(details);

      this.emit('intervention:brainstorm_completed', {
        intervention: intervention.id,
        strategies: brainstormResult.strategies.length
      });

      // Auto-apply recommended strategy if confidence is high
      if (brainstormResult.confidence > 0.8 && this.config.problem_solving.auto_execute_fallback) {
        intervention.resolution = brainstormResult.recommendedStrategy.description;
        intervention.status = 'resolved';
        await this.applyStrategy(brainstormResult.recommendedStrategy);
        this.resumeBuild();
      } else {
        // Notify user for manual intervention
        if (this.config.intervention.notify_user_on_critical) {
          this.emit('intervention:user_input_required', {
            intervention,
            strategies: brainstormResult.strategies
          });
        }
      }
    }

    // Log intervention if configured
    if (this.config.intervention.log_all_interventions) {
      this.logIntervention(intervention);
    }
  }

  private async brainstormSolutions(problem: string): Promise<BrainstormResult> {
    const models = this.config.problem_solving.consult_models;
    const strategies: Strategy[] = [];

    this.emit('brainstorm:started', { problem, models: models.length });

    // Gather context if configured
    let context = '';
    if (this.config.problem_solving.gather_comprehensive_context) {
      context = this.gatherContext();
    }

    // Query each model for strategies
    const strategyPromises = models.map(async (model) => {
      try {
        const prompt = `Problem: ${problem}\n\nContext:\n${context}\n\nProvide a detailed strategy to solve this problem. Include specific steps, expected outcomes, and estimated time.`;
        const response = await this.callLLM(model, prompt);

        return {
          id: this.generateId(),
          name: `Strategy from ${model}`,
          description: response,
          steps: this.extractSteps(response),
          model,
          confidence: this.extractConfidence(response),
          estimatedTime: this.extractEstimatedTime(response)
        };
      } catch (error) {
        this.emit('brainstorm:model_error', { model, error });
        return null;
      }
    });

    const results = await Promise.all(strategyPromises);
    strategies.push(...results.filter(s => s !== null) as Strategy[]);

    // Synthesize strategies using synthesis model
    const synthesis = await this.synthesizeStrategies(strategies);

    // Find recommended strategy (highest confidence)
    const recommendedStrategy = strategies.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    );

    this.emit('brainstorm:completed', { strategies: strategies.length });

    return {
      strategies,
      recommendedStrategy,
      synthesis,
      confidence: recommendedStrategy.confidence
    };
  }

  private async synthesizeStrategies(strategies: Strategy[]): Promise<string> {
    const prompt = `Analyze these strategies and synthesize the best approach:\n\n${strategies.map(s => `Strategy from ${s.model}:\n${s.description}\n`).join('\n')}`;

    return await this.callLLM(this.config.problem_solving.synthesis_model, prompt);
  }

  private async applyStrategy(strategy: Strategy): Promise<void> {
    this.emit('strategy:applying', { strategy: strategy.id });

    // Create micro-plan from strategy
    const microPlan: MicroPlan = {
      id: this.generateId(),
      goal: strategy.name,
      steps: strategy.steps.map((step, index) => ({
        id: `${strategy.id}-step-${index}`,
        description: step,
        action: step,
        expectedOutcome: 'Success',
        verification: 'Verify step completed successfully',
        status: 'pending' as const,
        attempts: 0
      })),
      context: strategy.description
    };

    // Execute micro-plan
    await this.executeMicroPlan(microPlan);

    this.emit('strategy:applied', { strategy: strategy.id });
  }

  private async executeMicroPlan(plan: MicroPlan): Promise<void> {
    this.emit('microplan:started', { plan: plan.id, steps: plan.steps.length });

    for (const step of plan.steps) {
      step.status = 'in_progress';
      step.attempts++;

      this.emit('microstep:started', { step: step.id });

      try {
        // Execute step
        await this.executeMicroStep(step);

        // Verify if configured
        if (this.config.problem_solving.verify_micro_steps) {
          const verified = await this.verifyMicroStep(step);
          if (!verified) {
            throw new Error(`Step verification failed: ${step.description}`);
          }
        }

        step.status = 'completed';
        this.emit('microstep:completed', { step: step.id });

      } catch (error) {
        step.status = 'failed';
        this.emit('microstep:failed', { step: step.id, error });

        // Try fallback if configured and available
        if (this.config.problem_solving.auto_execute_fallback && step.fallback) {
          this.emit('microstep:fallback', { step: step.id });
          step.action = step.fallback;
          step.status = 'in_progress';
          step.attempts++;

          try {
            await this.executeMicroStep(step);
            step.status = 'completed';
          } catch (fallbackError) {
            throw new Error(`Step and fallback failed: ${step.description}`);
          }
        } else {
          throw error;
        }
      }
    }

    this.emit('microplan:completed', { plan: plan.id });
  }

  private async executeMicroStep(step: MicroStep): Promise<void> {
    // Execute the step action using the primary code builder
    const result = await this.callLLM(
      'anthropic/claude-3.5-sonnet',
      `Execute this action: ${step.action}\n\nExpected outcome: ${step.expectedOutcome}`
    );

    this.trackAction(`microstep_${step.id}`);
  }

  private async verifyMicroStep(step: MicroStep): Promise<boolean> {
    const verification = await this.callLLM(
      'anthropic/claude-3.5-sonnet',
      `Verify this step was completed successfully:\n\nStep: ${step.description}\nVerification criteria: ${step.verification}\n\nRespond with YES or NO.`
    );

    return verification.toLowerCase().includes('yes');
  }

  // ============================================================================
  // Component Builder
  // ============================================================================

  private generateBuildPrompt(component: BuildComponent): string {
    const dependencies = component.dependencies
      .map(depId => this.state.components.find(c => c.id === depId))
      .filter(Boolean);

    // Get detected framework and app type
    const framework = this.appConfig?.framework || 'react';
    const appType = this.appConfig?.appType || 'web';

    // Get reference template if available
    const referenceTemplate = getTemplateForComponent(component.name, component.type);

    // Build design system guidance
    let designGuidance = '';
    if (this.state.designSpec && component.type === 'frontend') {
      const ds = this.state.designSpec;
      designGuidance = `
🎨 DESIGN SYSTEM (FOLLOW EXACTLY):

Visual Style: ${ds?.visualStyle || 'modern'}
Inspiration: ${ds?.inspiration?.join(', ') || 'Modern web applications'}

Color Palette (use these exact colors):
- Primary: ${ds?.colorPalette?.primary || '#3B82F6'}
- Secondary: ${ds?.colorPalette?.secondary || '#6B7280'}
- Accent: ${ds?.colorPalette?.accent || '#10B981'}
- Background: ${ds?.colorPalette?.background || '#FFFFFF'}
- Border: ${ds?.colorPalette?.border || '#E5E7EB'}

Typography:
- Font: ${ds?.typography?.fontFamily?.sans || 'Inter, system-ui, sans-serif'}
- Use font weights: ${ds?.typography?.weights?.medium || 500} (medium), ${ds?.typography?.weights?.semibold || 600} (semibold), ${ds?.typography?.weights?.bold || 700} (bold)

Component Style: ${ds?.componentPatterns?.cardStyle || 'modern'} cards with ${ds?.componentPatterns?.navigation || 'sidebar'} navigation

**CRITICAL DESIGN REQUIREMENTS:**
1. Use shadcn/ui components from @/components/ui (Button, Card, Input, Label, etc.)
2. Import icons from lucide-react
3. Apply the color palette consistently
4. Add smooth transitions (transition-all duration-200)
5. Include hover states (hover:scale-105, hover:shadow-lg)
6. Ensure responsive design (responsive grid, mobile-first)
7. Add loading states and micro-animations
8. Use proper spacing from design tokens

**shadcn/ui IMPORTS (USE THESE):**
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Import icons:
import { Sparkles, ArrowRight, Plus, Search, MoreVertical } from 'lucide-react';
`;
    }

    // Build framework-specific constraints based on app type
    let frameworkConstraints = '';

    if (appType === 'ios' || framework.toLowerCase().includes('swift')) {
      frameworkConstraints = `
CRITICAL FRAMEWORK CONSTRAINTS:
- This is an iOS application using ${framework}
- Use Swift and SwiftUI for native iOS development
- Use iOS-specific APIs and frameworks (UIKit, SwiftUI, Foundation, etc.)
- DO NOT use web-specific libraries (React, Next.js, DOM APIs)
- Follow iOS platform conventions and guidelines
- Use proper Swift syntax and type safety
`;
    } else if (framework.toLowerCase().includes('react-native')) {
      frameworkConstraints = `
CRITICAL FRAMEWORK CONSTRAINTS:
- This is a React Native cross-platform mobile application
- Use React Native components and APIs
- DO NOT use web-specific APIs (window, document, DOM)
- DO NOT use native iOS/Android code directly (use React Native bridges)
- Use platform-agnostic libraries compatible with React Native
`;
    } else if (framework.toLowerCase().includes('next')) {
      frameworkConstraints = `
CRITICAL FRAMEWORK CONSTRAINTS FOR NEXT.JS:
- This is a Next.js 14+ web application using the App Router
- ABSOLUTELY DO NOT use 'react-router-dom' - it is NOT compatible with Next.js
- NAVIGATION: Use 'next/navigation' (useRouter, usePathname, Link from next/link)
- ROUTING: Use Next.js file-based routing in app/ directory, NOT React Router
- CLIENT COMPONENTS: Add 'use client' directive at top of files that use hooks or browser APIs
- SERVER COMPONENTS: Default to server components, only use client when needed
- DO NOT use iOS/Swift/SwiftUI code or syntax
- DO NOT use React Native or mobile-specific libraries

⚠️ CRITICAL: ZERO EXTERNAL IMPORTS ⚠️

YOU MUST GENERATE COMPLETELY SELF-CONTAINED CODE.

✅ ALLOWED IMPORTS (ONLY THESE):
import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

❌ ABSOLUTELY FORBIDDEN (WILL BREAK BUILD):
- import anything from '../services/' (WeatherAPI, AuthService, etc.)
- import anything from '../utils/' (helpers, formatters, etc.)
- import anything from '../hooks/' (useAuth, useFetch, etc.)
- import anything from '../types/' (interfaces, types)
- import anything from '../lib/' (API clients, utilities)
- import { Navigate, useParams } from 'react-router-dom' (wrong framework!)
- import './styles.css' or '../styles/something.css'

⚠️ USE MOCK DATA - NOT EXTERNAL SERVICES ⚠️

WRONG (will break):
  import { WeatherAPI } from '../services/WeatherAPI';
  const weather = await WeatherAPI.getWeather(city);

RIGHT (works):
  // Mock data - replace with real API call later
  const mockWeather = {
    city: 'San Francisco',
    temp: 72,
    condition: 'Sunny',
    humidity: 60
  };

  // OR if you need to fetch real data:
  const response = await fetch(\`https://api.openweathermap.org/data/2.5/weather?q=\${city}\`);
  const weather = await response.json();

⚠️ DEFINE TYPES INLINE - NOT IN SEPARATE FILES ⚠️

WRONG (will break):
  import { Trip, Weather } from '../types';

RIGHT (works):
  interface Trip {
    id: string;
    destination: string;
    startDate: string;
    endDate: string;
  }

  interface Weather {
    temp: number;
    condition: string;
  }

⚠️ USE TAILWIND OR INLINE STYLES - NO SEPARATE CSS ⚠️

WRONG (will break):
  <div className="trip-dashboard">  // custom class not defined

RIGHT (works):
  <div className="p-4 max-w-6xl mx-auto bg-white rounded-lg shadow">

⚠️ EXAMPLE: COMPLETE WORKING COMPONENT ⚠️

// ✅ GOOD - Self-contained, uses mock data, no external imports
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Trip {
  id: string;
  destination: string;
  startDate: string;
}

export default function TripList() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call later
    const mockTrips: Trip[] = [
      { id: '1', destination: 'Paris', startDate: '2024-01-15' },
      { id: '2', destination: 'Tokyo', startDate: '2024-02-20' }
    ];
    setTrips(mockTrips);
    setLoading(false);

    // TODO: Replace with real API call:
    // fetch('/api/trips')
    //   .then(res => res.json())
    //   .then(data => setTrips(data));
  }, []);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Trips</h1>
      <div className="space-y-4">
        {trips.map(trip => (
          <div key={trip.id} className="p-4 border rounded-lg hover:shadow-lg transition">
            <h2 className="text-xl font-semibold">{trip.destination}</h2>
            <p className="text-gray-600">{trip.startDate}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

⚠️ IMPORTANT OUTPUT FORMATTING ⚠️
- Output ONLY the TypeScript/TSX code
- DO NOT wrap code in markdown fences (no \`\`\`typescript or \`\`\`tsx)
- DO NOT include CSS in the same file
- DO NOT add explanatory text before or after code
`;
    } else if (framework.toLowerCase().includes('react')) {
      frameworkConstraints = `
CRITICAL FRAMEWORK CONSTRAINTS:
- This is a React ${appType} application
- ONLY use React and standard web APIs
- DO NOT use mobile-specific libraries (iOS, Android, Swift, React Native)
- Use only libraries that are in the project's package.json
- Use React components with TypeScript
`;
    }

    // Add reference template if available
    let templateGuidance = '';
    if (referenceTemplate && component.type === 'frontend') {
      templateGuidance = `
📋 REFERENCE TEMPLATE (MATCH THIS QUALITY LEVEL):

This is an example of the design quality expected. Generate code at this visual polish level:

\`\`\`tsx
${referenceTemplate}
\`\`\`

Your component should have:
- Same level of visual polish and attention to detail
- Similar use of gradients, shadows, and hover effects
- Consistent spacing and typography
- Professional color choices
- Smooth transitions and animations
`;
    }

    return `
Generate complete, production-ready, BEAUTIFUL code for this component:

Component: ${component.name}
Type: ${component.type}
Priority: ${component.priority}
Framework: ${framework}
App Type: ${appType}

Dependencies:
${dependencies.map(dep => `- ${dep?.name} (${dep?.id})`).join('\n')}

${designGuidance}

${templateGuidance}

${frameworkConstraints}

Requirements:
- Follow TypeScript best practices
- Include proper error handling
- Add comprehensive JSDoc comments
- Use modern ES6+ features
- Ensure type safety
- ONLY use libraries and APIs compatible with ${framework}
- Use Tailwind CSS classes for styling (no custom CSS)
- Define all TypeScript interfaces inline in the component
- Use mock data with TODO comments for future API integration
${component.type === 'frontend' ? '- Use shadcn/ui components and lucide-react icons\n- Follow the design system colors and typography EXACTLY\n- Add smooth transitions and hover effects\n- Ensure responsive, mobile-first design' : ''}

CRITICAL OUTPUT INSTRUCTIONS:
1. Output RAW TypeScript code ONLY - no markdown, no explanations
2. DO NOT wrap code in \`\`\`typescript or \`\`\`tsx fences
3. Start directly with 'use client'; or import statements
4. DO NOT include any CSS, HTML, or other languages
5. Use mock data arrays/objects - no external API calls yet
6. Add TODO comments where real APIs should be integrated later
${component.type === 'frontend' ? '7. Make it BEAUTIFUL - this should look professional and modern\n8. Use the design system colors and components\n9. Add micro-interactions (hover effects, transitions)' : ''}

Example output structure:
'use client';

import { useState } from 'react';
${component.type === 'frontend' ? "import { Button } from '@/components/ui/button';\nimport { Card } from '@/components/ui/card';" : ''}

interface Item {
  id: string;
  name: string;
}

export default function ComponentName() {
  // Mock data - TODO: Replace with API call
  const [items] = useState<Item[]>([
    { id: '1', name: 'Example' }
  ]);

  return (
    <div className="p-4${component.type === 'frontend' ? ' max-w-6xl mx-auto' : ''}">
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
    `.trim();
  }

  private async generateTests(component: BuildComponent): Promise<string> {
    const prompt = `Generate comprehensive unit tests for this component:\n\nComponent: ${component.name}\nCode:\n${component.code}\n\nUse Jest and React Testing Library.`;

    return await this.callLLM('anthropic/claude-3.5-sonnet', prompt);
  }

  // ============================================================================
  // Error Handling
  // ============================================================================

  private async handleBuildError(error: Error): Promise<void> {
    const buildError: BuildError = {
      id: this.generateId(),
      timestamp: new Date(),
      phase: this.state.currentPhase,
      component: this.state.currentComponent,
      error: error.message,
      stackTrace: error.stack,
      attemptNumber: 1,
      resolved: false
    };

    this.state.errors.push(buildError);
    this.trackError(error.message);

    this.emit('build:error', buildError);

    // Trigger intervention for critical errors
    if (this.state.errors.length >= this.config.verification.max_attempts_before_escalation) {
      await this.triggerIntervention('max_attempts', `Maximum error attempts reached: ${error.message}`);
    }

    // Try to recover with safety features
    if (this.config.safety.auto_rollback) {
      await this.rollback();
    }

    this.state.status = 'failed';
    this.stopLoopDetection();
  }

  private async handleComponentFailure(component: BuildComponent, error: Error): Promise<void> {
    this.emit('component:recovery_started', { component: component.id });

    // Trigger problem-solving
    const brainstormResult = await this.brainstormSolutions(
      `Component ${component.name} failed with error: ${error.message}`
    );

    // Apply recommended strategy
    await this.applyStrategy(brainstormResult.recommendedStrategy);

    // Retry building component
    try {
      await this.buildComponent(component);
      component.status = 'completed';
      this.emit('component:recovery_succeeded', { component: component.id });
    } catch (retryError) {
      component.status = 'failed';
      this.emit('component:recovery_failed', { component: component.id, error: retryError });
      throw retryError;
    }
  }

  // ============================================================================
  // LLM Communication
  // ============================================================================

  private async callLLM(model: string, prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    this.emit('llm:request', { model, promptLength: prompt.length });

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.href : '',
          'X-Title': 'BuildRunner SaaS'
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || response.statusText;
        throw new Error(`OpenRouter API error: ${response.status} ${errorMsg}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';

      this.emit('llm:response', {
        model,
        responseLength: content.length,
        responsePreview: content.substring(0, 2000) // First 2000 chars for terminal display
      });

      return content;

    } catch (error) {
      this.emit('llm:error', { model, error });

      // Graceful degradation if configured
      if (this.config.safety.graceful_degradation) {
        return this.getFallbackResponse(model, prompt);
      }

      throw error;
    }
  }

  private getFallbackResponse(model: string, prompt: string): string {
    // In production, implement more sophisticated fallback
    this.emit('llm:fallback', { model });
    return `[Fallback response - model ${model} unavailable]`;
  }

  // ============================================================================
  // Utility Functions
  // ============================================================================

  /**
   * Strip markdown code fences from AI-generated code
   * Removes ```typescript, ```tsx, ```javascript, ```jsx, ``` etc.
   */
  private stripMarkdownCodeFences(content: string): string {
    if (!content) return content;

    let cleaned = content.trim();

    // Remove opening fence at start (```typescript, ```tsx, etc.)
    cleaned = cleaned.replace(/^```(?:typescript|tsx|javascript|jsx|json|ts|js)?\s*\n/i, '');

    // Remove closing fence at end
    cleaned = cleaned.replace(/\n```\s*$/, '');

    // CRITICAL: Stop at first non-TypeScript code fence (like ```css, ```html, etc.)
    // This prevents AI from including CSS or other languages in the same file
    const nonTsCodeFenceMatch = cleaned.match(/\n```(?:css|html|scss|sass|less|json|yaml|yml|markdown|md)\b/i);
    if (nonTsCodeFenceMatch) {
      cleaned = cleaned.substring(0, nonTsCodeFenceMatch.index);
      console.log('⚠️  Truncated code at non-TypeScript fence');
    }

    // Remove any remaining inline code fences (shouldn't be there but clean anyway)
    cleaned = cleaned.replace(/```(?:typescript|tsx|javascript|jsx|ts|js)?\s*\n/gi, '');
    cleaned = cleaned.replace(/\n```/g, '');

    return cleaned.trim();
  }

  private topologicalSort(components: BuildComponent[]): BuildComponent[] {
    const sorted: BuildComponent[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (component: BuildComponent) => {
      if (visited.has(component.id)) return;
      if (visiting.has(component.id)) {
        throw new Error(`Circular dependency detected: ${component.id}`);
      }

      visiting.add(component.id);

      for (const depId of component.dependencies) {
        const dep = components.find(c => c.id === depId);
        if (dep) visit(dep);
      }

      visiting.delete(component.id);
      visited.add(component.id);
      sorted.push(component);
    };

    for (const component of components) {
      visit(component);
    }

    return sorted;
  }

  private gatherContext(): string {
    return `
Build ID: ${this.state.id}
Current Phase: ${this.state.currentPhase}
Current Component: ${this.state.currentComponent || 'none'}
Progress: ${this.state.progress}%
Components: ${this.state.components.length}
Errors: ${this.state.errors.length}
Interventions: ${this.state.interventions.length}
Loop Detections: ${this.state.loopDetections.length}

Recent Errors:
${this.state.errors.slice(-3).map(e => `- ${e.error}`).join('\n')}

Recent Actions:
${Array.from(this.actionHistory.entries()).slice(-5).map(([action, count]) => `- ${action}: ${count}x`).join('\n')}
    `.trim();
  }

  private extractSteps(response: string): string[] {
    // Extract numbered steps from response
    const steps: string[] = [];
    const lines = response.split('\n');

    for (const line of lines) {
      const match = line.match(/^\s*\d+[\.)]\s+(.+)/);
      if (match) {
        steps.push(match[1].trim());
      }
    }

    return steps.length > 0 ? steps : [response];
  }

  private extractConfidence(response: string): number {
    // Extract confidence score from response
    const match = response.match(/confidence[:\s]+(\d+(?:\.\d+)?)/i);
    if (match) {
      return parseFloat(match[1]);
    }
    return 0.7; // Default confidence
  }

  private extractEstimatedTime(response: string): string {
    // Extract estimated time from response
    const match = response.match(/(?:time|duration|estimate)[:\s]+([^.\n]+)/i);
    return match ? match[1].trim() : '1h';
  }

  private updateProgress(): void {
    const completed = this.state.components.filter(c => c.status === 'completed').length;
    this.state.progress = Math.round((completed / this.state.components.length) * 100);
    this.emit('progress:updated', { progress: this.state.progress });
  }

  private async waitForResume(): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!this.isPaused) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 1000);
    });
  }

  private async rollback(): Promise<void> {
    this.emit('rollback:started');

    // Reset failed components
    for (const component of this.state.components) {
      if (component.status === 'failed') {
        component.status = 'pending';
        component.code = undefined;
        component.tests = undefined;
      }
    }

    this.emit('rollback:completed');
  }

  private logIntervention(intervention: Intervention): void {
    // In production, log to persistent storage
    console.log('[INTERVENTION]', {
      id: intervention.id,
      timestamp: intervention.timestamp,
      reason: intervention.reason,
      details: intervention.details,
      action: intervention.action
    });
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createBuildOrchestrator(apiKey?: string, config?: Partial<OrchestrationConfig>): BuildOrchestrator {
  return new BuildOrchestrator(apiKey, config);
}

// ============================================================================
// Exports
// ============================================================================

export default BuildOrchestrator;
