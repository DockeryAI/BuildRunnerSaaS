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
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ============================================================================
// Types & Interfaces
// ============================================================================

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
  loopDetections: LoopDetection[];
  projectMetadata?: {
    prd?: string;
    buildPlan?: string;
  };
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
    require_multi_llm_consensus: true,
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
    ]
  },
  loop_detection: {
    same_action_threshold: 3,
    same_error_threshold: 2,
    no_progress_timeout_seconds: 300,
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
  private appConfig: any;

  constructor(apiKey?: string, config?: Partial<OrchestrationConfig>, projectId?: string) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config } as OrchestrationConfig;
    this.state = this.initializeState();
    this.apiKey = apiKey || '';
    this.projectId = projectId || '1';

    // Initialize new components
    this.appTypeDetector = new AppTypeDetector();
    this.dependencyAnalyzer = new DependencyAnalyzer();
    this.parallelBuilder = new ParallelBuilder({ maxConcurrency: 5 });

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

        // NEW: Assemble into working application
        await this.assembleApplication();
      });

      // Phase 3: Verification
      this.state.status = 'verifying';
      await this.executePhase('verification', async () => {
        await this.verifyBuild();
      });

      // Phase 4: Testing
      this.state.status = 'testing';
      await this.executePhase('testing', async () => {
        await this.testBuild();
      });

      // Complete
      this.state.status = 'completed';
      this.state.endTime = new Date();
      this.state.progress = 100;
      this.stopLoopDetection();

      // Calculate build metadata
      const completedComponents = this.state.components.filter(c => c.status === 'completed');
      const duration = this.state.endTime.getTime() - (this.state.startTime?.getTime() || 0);

      // Check if this is a web app based on detected app type
      const isWebApp = this.appConfig?.appType === 'web' ||
                       this.appConfig?.framework?.toLowerCase().includes('next') ||
                       this.appConfig?.framework?.toLowerCase().includes('react') ||
                       completedComponents.some(c => c.type === 'frontend');

      this.emit('build:completed', {
        buildId: this.state.id,
        timestamp: this.state.endTime.toISOString(),
        componentCount: completedComponents.length,
        fileCount: completedComponents.length, // Approximate - each component = 1 file
        status: 'completed' as const,
        buildDirectory: `builds/${this.projectId}/${this.state.id}`,
        duration,
        isWebApp,
      });

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
    const sortedComponents = this.topologicalSort(this.state.components);
    this.state.components = sortedComponents;

    // Get multi-LLM consensus on build plan
    const planVerification = await this.getMultiLLMConsensus(
      'verify_build_plan',
      `Verify this build plan is correct and dependencies are properly ordered: ${JSON.stringify(sortedComponents.map(c => ({ id: c.id, name: c.name, dependencies: c.dependencies })))}`
    );

    if (!planVerification.agreed) {
      const disagreementDetails = planVerification.responses
        .map(r => `${r.model}: ${r.response.substring(0, 200)}...`)
        .join('\n');
      await this.triggerIntervention(
        'verification_failed',
        `Build plan failed multi-LLM consensus check.\nAgreement: ${planVerification.agreementCount}/${planVerification.totalModels} models (${(planVerification.agreementRatio * 100).toFixed(0)}%)\n\nResponses:\n${disagreementDetails}`
      );
    }

    this.emit('planning:completed', { components: sortedComponents.length });
  }

  private async buildComponents(): Promise<void> {
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

  private async buildComponent(component: BuildComponent): Promise<void> {
    // Step 1: Generate prompt
    this.emit('log', {
      level: 'info',
      message: `Generating build prompt for ${component.name} (${component.type})`
    });

    const prompt = this.generateBuildPrompt(component);

    this.emit('log', {
      level: 'info',
      message: `Prompt generated (${prompt.length} characters)`
    });

    // Step 2: Call LLM to generate code
    this.emit('log', {
      level: 'info',
      message: `Calling AI model (claude-3.5-sonnet) to generate code for ${component.name}...`
    });

    const model = 'anthropic/claude-3.5-sonnet';
    this.emit('llm:request', {
      model,
      component: component.name,
      promptLength: prompt.length
    });

    const code = await this.callLLM(model, prompt);

    this.emit('llm:response', {
      model,
      component: component.name,
      codeLength: code?.length || 0,
      codePreview: code?.substring(0, 2000) || '' // First 2000 chars for terminal display
    });

    this.emit('log', {
      level: 'success',
      message: `Generated ${code?.length || 0} characters of code for ${component.name}`
    });

    component.code = code;
    component.progress = 80;

    // Step 3: Write file to disk
    if (this.fileWriter && code) {
      try {
        const filePath = inferFilePath({
          name: component.name,
          type: component.type,
          language: 'typescript'
        });

        this.emit('log', {
          level: 'info',
          message: `Writing file: ${filePath}`
        });

        // Strip markdown code fences before writing
        const cleanCode = this.stripMarkdownCodeFences(code);

        await this.fileWriter.writeFile(filePath, cleanCode);

        this.emit('log', {
          level: 'success',
          message: `File written successfully: ${filePath}`
        });

        console.log(`✅ Wrote component file: ${filePath}`);
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

    if (!this.fileWriter) {
      console.error('File writer not initialized');
      return;
    }

    try {
      const buildDir = this.fileWriter.getBuildDir();
      await execAsync('npm install', {
        cwd: buildDir,
        timeout: 300000, // 5 minutes
      });

      console.log('✅ Dependencies installed');
    } catch (error) {
      console.error('Failed to install dependencies:', error);
      // Don't throw - allow build to continue
    }
  }

  private async verifyBuild(): Promise<void> {
    this.emit('verification:started');

    let verifiedCount = 0;
    let skippedCount = 0;

    for (const component of this.state.components) {
      if (component.status === 'completed' && component.code) {
        const criticality = this.classifyComponentCriticality(component);
        const strategy = this.config.verification.component_verification_strategy[criticality];

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
    }

    this.emit('log', {
      level: 'info',
      message: `Verification complete: ${verifiedCount} verified, ${skippedCount} skipped`
    });

    this.emit('verification:completed');
  }

  private classifyComponentCriticality(component: BuildComponent): 'critical' | 'important' | 'standard' {
    const nameLower = component.name.toLowerCase();
    const descLower = (component.description || '').toLowerCase();
    const combined = `${nameLower} ${descLower}`;

    // Check if matches critical patterns
    const isCritical = this.config.verification.critical_patterns.some(pattern =>
      combined.includes(pattern.toLowerCase())
    );

    if (isCritical) {
      return 'critical';
    }

    // Classify by component type
    if (component.type === 'api' || component.type === 'database' || component.type === 'service') {
      return 'important';
    }

    // Default to standard (UI, utils, config)
    return 'standard';
  }

  private async testBuild(): Promise<void> {
    this.emit('testing:started');

    // Generate and run tests for each component
    for (const component of this.state.components) {
      if (component.status === 'completed' && component.code) {
        const tests = await this.generateTests(component);
        component.tests = tests;

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
      }
    }

    this.emit('testing:completed');
  }

  // ============================================================================
  // Multi-LLM Verification
  // ============================================================================

  private async getMultiLLMConsensus(
    task: string,
    prompt: string
  ): Promise<ConsensusResult> {
    const models = this.config.verification.verification_models;
    const responses: LLMResponse[] = [];

    this.emit('consensus:started', { task, models: models.length });

    // Query all models in parallel
    const modelPromises = models.map(async (model) => {
      try {
        const response = await this.callLLM(model, prompt);
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

    // Analyze responses for consensus
    const consensus = this.analyzeConsensus(responses);

    this.emit('consensus:completed', {
      task,
      agreed: consensus.agreed,
      agreementRatio: consensus.agreementRatio
    });

    return consensus;
  }

  private analyzeConsensus(responses: LLMResponse[]): ConsensusResult {
    if (responses.length === 0) {
      return {
        agreed: false,
        agreementCount: 0,
        totalModels: 0,
        agreementRatio: 0,
        responses: []
      };
    }

    // Simple consensus: check if responses are similar
    // In production, use more sophisticated similarity analysis
    const positiveResponses = responses.filter(r =>
      r.response.toLowerCase().includes('yes') ||
      r.response.toLowerCase().includes('correct') ||
      r.response.toLowerCase().includes('valid') ||
      r.confidence > 0.7
    );

    const agreementRatio = positiveResponses.length / responses.length;
    const agreed = agreementRatio >= this.config.verification.consensus_threshold;

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
CRITICAL FRAMEWORK CONSTRAINTS:
- This is a Next.js web application
- ONLY use Next.js compatible libraries and patterns
- DO NOT use iOS/Swift/SwiftUI code or syntax
- DO NOT use React Native or mobile-specific libraries
- DO NOT import non-existent services or utilities
- Use React components with TypeScript
- Use Next.js App Router patterns ('use client' for client components)
- Stick to standard React hooks and Next.js APIs only
- Only use libraries that exist in package.json
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

    return `
Generate complete, production-ready code for this component:

Component: ${component.name}
Type: ${component.type}
Priority: ${component.priority}
Framework: ${framework}
App Type: ${appType}

Dependencies:
${dependencies.map(dep => `- ${dep?.name} (${dep?.id})`).join('\n')}

${frameworkConstraints}

Requirements:
- Follow TypeScript best practices
- Include proper error handling
- Add comprehensive JSDoc comments
- Use modern ES6+ features
- Ensure type safety
- ONLY use libraries and APIs compatible with ${framework}

Provide only the code, no explanations.
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

    // Remove opening fence (```typescript, ```tsx, ```javascript, ```jsx, ```json, or just ```)
    cleaned = cleaned.replace(/^```(?:typescript|tsx|javascript|jsx|json|ts|js)?\s*\n/i, '');

    // Remove closing fence
    cleaned = cleaned.replace(/\n```\s*$/, '');

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
