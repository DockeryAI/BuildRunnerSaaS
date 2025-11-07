/**
 * Intelligent LLM Model Router for BuildRunner
 *
 * Routes different build tasks to optimal models based on:
 * - Task complexity (simple, standard, complex, critical)
 * - Cost efficiency
 * - Speed requirements
 * - Quality/accuracy needs
 *
 * Leverages OpenRouter's 500+ model catalog with smart fallbacks
 */

// ============================================================================
// Task Complexity Classification
// ============================================================================

export type TaskComplexity =
  | 'trivial'      // Simple, repetitive, pattern-based (e.g., formatting, boilerplate)
  | 'standard'     // Well-defined CRUD, standard features
  | 'complex'      // Novel problems, architectural decisions, optimization
  | 'critical';    // Security, payments, complex algorithms, multi-system coordination

export type BuildTask =
  // PRD & Planning
  | 'prd_analysis'              // Analyze user requirements → standard
  | 'prd_generation'            // Generate comprehensive PRD → standard
  | 'architecture_design'       // Design system architecture → complex
  | 'component_planning'        // Break down features into components → standard

  // Code Generation
  | 'component_generation'      // Generate React components → standard
  | 'api_generation'            // Generate API routes → standard
  | 'database_schema'           // Design database schema → complex
  | 'auth_implementation'       // Implement authentication → critical
  | 'payment_integration'       // Payment processing code → critical
  | 'algorithm_optimization'    // Optimize complex algorithms → complex

  // Build System
  | 'dependency_resolution'     // Resolve component dependencies → standard
  | 'file_organization'         // Organize project structure → trivial
  | 'boilerplate_generation'    // Generate config files, package.json → trivial
  | 'multi_agent_coordination'  // Coordinate parallel agents → complex

  // Design System
  | 'design_system_generation'  // Generate design tokens → standard
  | 'design_profile_detection'  // Detect design preferences → standard
  | 'design_token_validation'   // Validate token usage → trivial
  | 'ui_polishing'              // Polish visual design → standard

  // Quality & Testing
  | 'code_validation'           // Lint, type-check → trivial
  | 'bug_diagnosis_simple'      // Debug simple errors → standard
  | 'bug_diagnosis_complex'     // Debug race conditions, async bugs → complex
  | 'test_generation'           // Generate unit tests → standard
  | 'integration_testing'       // Test multi-component integration → standard
  | 'security_audit'            // Security vulnerability scan → critical

  // Assembly & Integration
  | 'component_assembly'        // Assemble components into app → standard
  | 'dependency_installation'   // Install packages → trivial
  | 'build_verification'        // Verify build succeeds → standard
  | 'deployment_prep'           // Prepare for deployment → standard;

// ============================================================================
// OpenRouter Model Catalog (Top Performers by Tier)
// ============================================================================

export interface ModelConfig {
  id: string;                    // OpenRouter model ID
  provider: string;              // Provider name (Anthropic, OpenAI, etc.)
  tier: 'premium' | 'balanced' | 'fast' | 'free';
  costPer1M: number;            // Cost per 1M tokens (input + output avg)
  speed: 'very_fast' | 'fast' | 'medium' | 'slow';
  reasoning: 'excellent' | 'good' | 'moderate' | 'basic';
  codeQuality: 'excellent' | 'good' | 'moderate' | 'basic';
  contextWindow: number;         // Max tokens
}

export const AVAILABLE_MODELS: Record<string, ModelConfig> = {
  // ========== PREMIUM TIER (Highest Quality) ==========

  'claude-opus-4': {
    id: 'anthropic/claude-opus-4',
    provider: 'Anthropic',
    tier: 'premium',
    costPer1M: 15.00,             // $15 per 1M input, $75 per 1M output (avg ~$30)
    speed: 'slow',
    reasoning: 'excellent',
    codeQuality: 'excellent',
    contextWindow: 200000,
  },

  'o1-preview': {
    id: 'openai/o1-preview',
    provider: 'OpenAI',
    tier: 'premium',
    costPer1M: 15.00,             // $15 input, $60 output
    speed: 'slow',
    reasoning: 'excellent',
    codeQuality: 'excellent',
    contextWindow: 128000,
  },

  'gemini-2-flash-thinking': {
    id: 'google/gemini-2.0-flash-thinking-exp:free',
    provider: 'Google',
    tier: 'premium',
    costPer1M: 0.00,              // FREE with thinking mode!
    speed: 'medium',
    reasoning: 'excellent',
    codeQuality: 'excellent',
    contextWindow: 32768,
  },

  // ========== BALANCED TIER (Best Value) ==========

  'claude-sonnet-4': {
    id: 'anthropic/claude-sonnet-4',
    provider: 'Anthropic',
    tier: 'balanced',
    costPer1M: 3.00,              // $3 input, $15 output
    speed: 'fast',
    reasoning: 'excellent',
    codeQuality: 'excellent',
    contextWindow: 200000,
  },

  'gpt-4o': {
    id: 'openai/gpt-4o',
    provider: 'OpenAI',
    tier: 'balanced',
    costPer1M: 2.50,              // $2.50 input, $10 output
    speed: 'fast',
    reasoning: 'good',
    codeQuality: 'excellent',
    contextWindow: 128000,
  },

  'gemini-pro-1.5': {
    id: 'google/gemini-pro-1.5',
    provider: 'Google',
    tier: 'balanced',
    costPer1M: 1.25,              // $1.25 input, $5 output
    speed: 'fast',
    reasoning: 'good',
    codeQuality: 'good',
    contextWindow: 2000000,       // 2M context!
  },

  'deepseek-r1': {
    id: 'deepseek/deepseek-r1',
    provider: 'DeepSeek',
    tier: 'balanced',
    costPer1M: 0.55,              // $0.55 input, $2.19 output
    speed: 'fast',
    reasoning: 'excellent',       // DeepSeek-R1 has strong reasoning
    codeQuality: 'excellent',
    contextWindow: 64000,
  },

  // ========== FAST TIER (Speed Optimized) ==========

  'claude-haiku-4': {
    id: 'anthropic/claude-haiku-4',
    provider: 'Anthropic',
    tier: 'fast',
    costPer1M: 0.25,              // $0.25 input, $1.25 output
    speed: 'very_fast',
    reasoning: 'good',
    codeQuality: 'good',
    contextWindow: 200000,
  },

  'gpt-4o-mini': {
    id: 'openai/gpt-4o-mini',
    provider: 'OpenAI',
    tier: 'fast',
    costPer1M: 0.15,              // $0.15 input, $0.60 output
    speed: 'very_fast',
    reasoning: 'good',
    codeQuality: 'good',
    contextWindow: 128000,
  },

  'gemini-flash-1.5': {
    id: 'google/gemini-flash-1.5',
    provider: 'Google',
    tier: 'fast',
    costPer1M: 0.075,             // $0.075 input, $0.30 output
    speed: 'very_fast',
    reasoning: 'moderate',
    codeQuality: 'good',
    contextWindow: 1000000,
  },

  'deepseek-chat': {
    id: 'deepseek/deepseek-chat',
    provider: 'DeepSeek',
    tier: 'fast',
    costPer1M: 0.27,              // $0.27 input, $1.10 output
    speed: 'very_fast',
    reasoning: 'good',
    codeQuality: 'excellent',
    contextWindow: 64000,
  },

  // ========== FREE TIER ==========

  'gemini-flash-free': {
    id: 'google/gemini-flash-1.5-8b:free',
    provider: 'Google',
    tier: 'free',
    costPer1M: 0.00,
    speed: 'very_fast',
    reasoning: 'moderate',
    codeQuality: 'moderate',
    contextWindow: 1000000,
  },

  'qwen-2.5-72b-free': {
    id: 'qwen/qwen-2.5-72b-instruct:free',
    provider: 'Qwen',
    tier: 'free',
    costPer1M: 0.00,
    speed: 'fast',
    reasoning: 'good',
    codeQuality: 'good',
    contextWindow: 32768,
  },
};

// ============================================================================
// Task → Model Mapping Strategy
// ============================================================================

/**
 * Map each build task to optimal model based on complexity and requirements
 */
export const TASK_MODEL_MAPPING: Record<BuildTask, {
  primary: string;              // Primary model to use
  fallback: string;             // Fallback if primary fails
  complexity: TaskComplexity;   // Task complexity level
  rationale: string;            // Why this model?
}> = {
  // ========== PRD & Planning ==========

  'prd_analysis': {
    primary: 'claude-sonnet-4',
    fallback: 'deepseek-r1',
    complexity: 'standard',
    rationale: 'Sonnet excels at analyzing requirements and extracting structured data',
  },

  'prd_generation': {
    primary: 'claude-sonnet-4',
    fallback: 'gpt-4o',
    complexity: 'standard',
    rationale: 'Sonnet produces well-structured PRDs with clear milestones',
  },

  'architecture_design': {
    primary: 'gemini-2-flash-thinking',  // FREE + excellent reasoning!
    fallback: 'claude-opus-4',
    complexity: 'complex',
    rationale: 'Gemini 2.0 Flash Thinking is FREE and excellent for architectural decisions',
  },

  'component_planning': {
    primary: 'claude-sonnet-4',
    fallback: 'deepseek-r1',
    complexity: 'standard',
    rationale: 'Breaking down features into components is standard work for Sonnet',
  },

  // ========== Code Generation ==========

  'component_generation': {
    primary: 'deepseek-chat',           // Excellent code quality, very cheap
    fallback: 'claude-sonnet-4',
    complexity: 'standard',
    rationale: 'DeepSeek Chat has excellent code quality at 1/10th the cost of Sonnet',
  },

  'api_generation': {
    primary: 'deepseek-chat',
    fallback: 'claude-sonnet-4',
    complexity: 'standard',
    rationale: 'API routes are standard CRUD - DeepSeek handles this excellently',
  },

  'database_schema': {
    primary: 'gemini-2-flash-thinking',
    fallback: 'claude-opus-4',
    complexity: 'complex',
    rationale: 'Schema design requires reasoning about relationships - use free thinking model',
  },

  'auth_implementation': {
    primary: 'claude-opus-4',           // Security is critical - use best
    fallback: 'claude-sonnet-4',
    complexity: 'critical',
    rationale: 'Authentication is security-critical - needs highest quality model',
  },

  'payment_integration': {
    primary: 'claude-opus-4',
    fallback: 'o1-preview',
    complexity: 'critical',
    rationale: 'Payment processing is critical - no room for errors',
  },

  'algorithm_optimization': {
    primary: 'gemini-2-flash-thinking',
    fallback: 'o1-preview',
    complexity: 'complex',
    rationale: 'Optimization requires deep reasoning - use thinking models',
  },

  // ========== Build System ==========

  'dependency_resolution': {
    primary: 'claude-sonnet-4',
    fallback: 'deepseek-r1',
    complexity: 'standard',
    rationale: 'Dependency graphs are well-defined problems for Sonnet',
  },

  'file_organization': {
    primary: 'gemini-flash-free',       // Trivial task - use free model
    fallback: 'claude-haiku-4',
    complexity: 'trivial',
    rationale: 'File organization is pattern-based - free model is sufficient',
  },

  'boilerplate_generation': {
    primary: 'gemini-flash-free',
    fallback: 'gpt-4o-mini',
    complexity: 'trivial',
    rationale: 'Boilerplate is repetitive - free models handle this well',
  },

  'multi_agent_coordination': {
    primary: 'gemini-2-flash-thinking',
    fallback: 'claude-opus-4',
    complexity: 'complex',
    rationale: 'Coordinating parallel agents requires reasoning about dependencies',
  },

  // ========== Design System ==========

  'design_system_generation': {
    primary: 'claude-sonnet-4',
    fallback: 'gpt-4o',
    complexity: 'standard',
    rationale: 'Design tokens are structured data - Sonnet excels here',
  },

  'design_profile_detection': {
    primary: 'claude-sonnet-4',
    fallback: 'gemini-pro-1.5',
    complexity: 'standard',
    rationale: 'Pattern detection in PRD text - standard NLP task',
  },

  'design_token_validation': {
    primary: 'claude-haiku-4',          // Fast validation
    fallback: 'gpt-4o-mini',
    complexity: 'trivial',
    rationale: 'Token validation is pattern matching - fast model is sufficient',
  },

  'ui_polishing': {
    primary: 'claude-sonnet-4',
    fallback: 'gpt-4o',
    complexity: 'standard',
    rationale: 'UI refinement benefits from Sonnet\'s aesthetic understanding',
  },

  // ========== Quality & Testing ==========

  'code_validation': {
    primary: 'gemini-flash-free',
    fallback: 'claude-haiku-4',
    complexity: 'trivial',
    rationale: 'Linting and type-checking are rule-based - free model works',
  },

  'bug_diagnosis_simple': {
    primary: 'claude-haiku-4',
    fallback: 'deepseek-chat',
    complexity: 'standard',
    rationale: 'Simple bugs (syntax, types) are quick fixes for Haiku',
  },

  'bug_diagnosis_complex': {
    primary: 'gemini-2-flash-thinking',
    fallback: 'claude-opus-4',
    complexity: 'complex',
    rationale: 'Race conditions and async bugs need reasoning models',
  },

  'test_generation': {
    primary: 'deepseek-chat',
    fallback: 'claude-sonnet-4',
    complexity: 'standard',
    rationale: 'Test generation is structured code - DeepSeek handles well',
  },

  'integration_testing': {
    primary: 'claude-sonnet-4',
    fallback: 'gpt-4o',
    complexity: 'standard',
    rationale: 'Multi-component testing needs good reasoning',
  },

  'security_audit': {
    primary: 'claude-opus-4',
    fallback: 'o1-preview',
    complexity: 'critical',
    rationale: 'Security audits are critical - use best available',
  },

  // ========== Assembly & Integration ==========

  'component_assembly': {
    primary: 'claude-sonnet-4',
    fallback: 'deepseek-chat',
    complexity: 'standard',
    rationale: 'Assembling components requires understanding imports/exports',
  },

  'dependency_installation': {
    primary: 'gemini-flash-free',
    fallback: 'claude-haiku-4',
    complexity: 'trivial',
    rationale: 'Running npm install is trivial - free model is fine',
  },

  'build_verification': {
    primary: 'claude-haiku-4',
    fallback: 'gpt-4o-mini',
    complexity: 'standard',
    rationale: 'Checking build output is fast work for Haiku',
  },

  'deployment_prep': {
    primary: 'claude-sonnet-4',
    fallback: 'gpt-4o',
    complexity: 'standard',
    rationale: 'Deployment config needs accuracy - Sonnet is reliable',
  },
};

// ============================================================================
// Model Router Class
// ============================================================================

export class ModelRouter {
  private costTracking: Map<string, number> = new Map();
  private requestCounts: Map<string, number> = new Map();

  /**
   * Get the optimal model for a given task
   */
  getModelForTask(task: BuildTask): ModelConfig {
    const mapping = TASK_MODEL_MAPPING[task];
    const modelKey = mapping.primary;
    const model = AVAILABLE_MODELS[modelKey];

    if (!model) {
      console.warn(`⚠️  Model ${modelKey} not found, using fallback`);
      const fallbackKey = mapping.fallback;
      return AVAILABLE_MODELS[fallbackKey] || AVAILABLE_MODELS['claude-sonnet-4'];
    }

    return model;
  }

  /**
   * Get fallback model if primary fails
   */
  getFallbackForTask(task: BuildTask): ModelConfig {
    const mapping = TASK_MODEL_MAPPING[task];
    const fallbackKey = mapping.fallback;
    return AVAILABLE_MODELS[fallbackKey] || AVAILABLE_MODELS['claude-sonnet-4'];
  }

  /**
   * Track model usage and costs
   */
  trackUsage(modelId: string, tokensUsed: number): void {
    const model = Object.values(AVAILABLE_MODELS).find(m => m.id === modelId);
    if (!model) return;

    const cost = (tokensUsed / 1_000_000) * model.costPer1M;
    const currentCost = this.costTracking.get(modelId) || 0;
    this.costTracking.set(modelId, currentCost + cost);

    const currentCount = this.requestCounts.get(modelId) || 0;
    this.requestCounts.set(modelId, currentCount + 1);
  }

  /**
   * Get cost breakdown for current build
   */
  getCostSummary(): {
    totalCost: number;
    byModel: Array<{
      model: string;
      provider: string;
      requests: number;
      cost: number;
    }>;
  } {
    const byModel: Array<{
      model: string;
      provider: string;
      requests: number;
      cost: number;
    }> = [];

    let totalCost = 0;

    for (const [modelId, cost] of this.costTracking.entries()) {
      const model = Object.values(AVAILABLE_MODELS).find(m => m.id === modelId);
      if (!model) continue;

      totalCost += cost;
      byModel.push({
        model: model.id,
        provider: model.provider,
        requests: this.requestCounts.get(modelId) || 0,
        cost,
      });
    }

    return {
      totalCost,
      byModel: byModel.sort((a, b) => b.cost - a.cost),
    };
  }

  /**
   * Reset cost tracking (call at start of new build)
   */
  resetTracking(): void {
    this.costTracking.clear();
    this.requestCounts.clear();
  }

  /**
   * Get model recommendations for custom complexity
   */
  getModelByComplexity(complexity: TaskComplexity): ModelConfig {
    switch (complexity) {
      case 'trivial':
        return AVAILABLE_MODELS['gemini-flash-free'];
      case 'standard':
        return AVAILABLE_MODELS['deepseek-chat'];
      case 'complex':
        return AVAILABLE_MODELS['gemini-2-flash-thinking'];
      case 'critical':
        return AVAILABLE_MODELS['claude-opus-4'];
    }
  }

  /**
   * Log model selection decision
   */
  logModelSelection(task: BuildTask, reason?: string): void {
    const mapping = TASK_MODEL_MAPPING[task];
    const model = this.getModelForTask(task);

    console.log(`🤖 [Model Router] Task: ${task}`);
    console.log(`   ├─ Model: ${model.id} (${model.provider})`);
    console.log(`   ├─ Tier: ${model.tier}`);
    console.log(`   ├─ Complexity: ${mapping.complexity}`);
    console.log(`   ├─ Cost/1M: $${model.costPer1M.toFixed(2)}`);
    console.log(`   └─ Rationale: ${reason || mapping.rationale}`);
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const modelRouter = new ModelRouter();

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get model ID for a task (shorthand)
 */
export function getModelIdForTask(task: BuildTask): string {
  return modelRouter.getModelForTask(task).id;
}

/**
 * Get all models by tier
 */
export function getModelsByTier(tier: 'premium' | 'balanced' | 'fast' | 'free'): ModelConfig[] {
  return Object.values(AVAILABLE_MODELS).filter(m => m.tier === tier);
}

/**
 * Compare costs between two approaches
 */
export function compareCosts(
  tasks1: BuildTask[],
  tasks2: BuildTask[]
): {
  approach1Cost: number;
  approach2Cost: number;
  savings: number;
  recommendation: 'approach1' | 'approach2';
} {
  const cost1 = tasks1.reduce((sum, task) => {
    const model = modelRouter.getModelForTask(task);
    return sum + model.costPer1M;
  }, 0);

  const cost2 = tasks2.reduce((sum, task) => {
    const model = modelRouter.getModelForTask(task);
    return sum + model.costPer1M;
  }, 0);

  return {
    approach1Cost: cost1,
    approach2Cost: cost2,
    savings: Math.abs(cost1 - cost2),
    recommendation: cost1 <= cost2 ? 'approach1' : 'approach2',
  };
}
