/**
 * Autonomous Development Orchestration System - Type Definitions
 *
 * This file contains all TypeScript interfaces and types for the
 * self-healing, self-verifying AI development orchestration system.
 */

// ============================================================================
// Feature Registry Types
// ============================================================================

export type FeatureStatus = 'planned' | 'in_progress' | 'completed' | 'blocked' | 'skipped';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface AcceptanceCriteria {
  description: string;
  verified: boolean;
  verification_method: string;
}

export interface Evidence {
  files_modified: string[];
  tests_added: string[];
  tests_passed: boolean;
  verified_by: string;         // Which LLM verified
  verification_timestamp: Date;
  verification_confidence: number; // 0-1
}

export interface Dependencies {
  required_features: string[]; // Feature IDs
  required_packages: string[];
}

export interface Blocker {
  description: string;
  severity: Severity;
  attempts_to_resolve: number;
  multi_llm_consulted: boolean;
  created_at: Date;
}

export interface FeatureMetadata {
  created_at: Date;
  updated_at: Date;
  assigned_to: string;        // Agent name
  estimated_time: string;
  actual_time?: string;
}

export interface Feature {
  id: string;                  // Unique identifier (e.g., "f001")
  name: string;                // Feature name
  description: string;         // Detailed description
  status: FeatureStatus;
  phase: number;               // Which phase this belongs to
  step: number;                // Which step this belongs to
  priority: Priority;

  sub_features: Feature[];     // Nested sub-features
  acceptance_criteria: AcceptanceCriteria[];
  evidence?: Evidence;
  dependencies: Dependencies;
  blockers: Blocker[];
  metadata: FeatureMetadata;
}

export interface FeatureRegistry {
  features: Feature[];
  verification_log: VerificationLog[];
  interventions: Intervention[];
  llm_consultations: LLMConsultation[];
}

// ============================================================================
// LLM Gateway Types
// ============================================================================

export type TaskType = 'reasoning' | 'code' | 'synthesis' | 'extraction' | 'verification';
export type LLMModel =
  | 'anthropic/claude-sonnet-3.5'
  | 'anthropic/claude-opus-4'
  | 'anthropic/claude-haiku'
  | 'openai/gpt-4'
  | 'openai/o1-mini'
  | 'google/gemini-2.5-flash'
  | 'google/gemini-flash-2.0'
  | 'deepseek/deepseek-chat';

export interface LLMRoute {
  task_type: TaskType;
  primary_model: LLMModel | 'multi-llm-consensus';
  fallback_models: LLMModel[];
  temperature: number;
  max_tokens: number;
  caching: boolean;
}

export interface LLMRequest {
  task_type: TaskType;
  prompt: string;
  system_prompt?: string;
  context?: Record<string, any>;
  require_json?: boolean;
}

export interface LLMResponse {
  model: LLMModel;
  content: string;
  confidence?: number;
  reasoning?: string;
  timestamp: Date;
  cost?: number;
  tokens_used?: number;
  cached?: boolean;
}

export interface MultiLLMResponse {
  responses: LLMResponse[];
  consensus?: any;
  synthesis?: LLMResponse;
}

// ============================================================================
// Verification Types
// ============================================================================

export interface VerificationResult {
  status: 'verified' | 'incomplete' | 'failed';
  canProceed: boolean;
  missing?: Feature[];
  requiresWork?: boolean;
  recommendations?: string[];
  verifications?: LLMVerification[];
}

export interface LLMVerification {
  model: LLMModel;
  result: 'complete' | 'incomplete';
  confidence: number;
  missing_features: string[];
  reasoning: string;
  timestamp: Date;
}

export interface VerificationLog {
  phase: number;
  step: number;
  timestamp: Date;
  result: VerificationResult;
  verified_by: string[];
}

// ============================================================================
// State Monitoring & Loop Detection Types
// ============================================================================

export interface Action {
  id: string;
  agent: string;
  type: 'code' | 'test' | 'refactor' | 'debug' | 'verification';
  description: string;
  filesModified: string[];
  outcome: 'success' | 'failure' | 'partial';
  error_message?: string;
  timestamp: Date;
}

export interface Loop {
  type: 'same_error' | 'no_progress' | 'circular_deps';
  actions: Action[];
  detected_at: Date;
  recommendation: 'INTERVENE' | 'MONITOR';
  pattern_details: string;
}

export interface Pattern {
  detected: boolean;
  confidence: number;
  details: string;
}

// ============================================================================
// Intervention Types
// ============================================================================

export interface Problem {
  id: string;
  agent: string;
  type: 'loop' | 'blocker' | 'error' | 'complexity';
  description: string;
  errors: string[];
  stackTraces?: string[];
  actionHistory: Action[];
  context?: ComprehensiveContext;
  severity: Severity;
  created_at: Date;
}

export interface ComprehensiveContext {
  // Code context
  relevantFiles: string[];
  recentCommits: string[];
  dependencies: string[];

  // Error context
  errorMessages: string[];
  stackTraces: string[];
  testFailures: string[];

  // State context
  featureRegistry: FeatureRegistry;
  currentPhase: number;
  currentStep: number;
  previousAttempts: Action[];

  // Environment context
  nodeVersion: string;
  installedPackages: Record<string, string>;
  envVars: Record<string, string>;
}

export interface Strategy {
  id: string;
  model: LLMModel;
  approach: string;
  steps: string[];
  confidence: number;
  estimated_time: string;
  risk_level: 'low' | 'medium' | 'high';
}

export interface Resolution {
  problem_id: string;
  strategy_selected: Strategy;
  outcome: 'success' | 'failure' | 'partial';
  time_taken: string;
  lessons_learned: string[];
}

export interface Intervention {
  id: string;
  agent: string;
  problem: Problem;
  context: ComprehensiveContext;
  resolution?: Resolution;
  timestamp: Date;
  auto_resolved: boolean;
}

// ============================================================================
// Multi-LLM Problem Solving Types
// ============================================================================

export interface LLMSolution {
  model: LLMModel;
  solution: string;
  confidence: number;
  reasoning: string;
  estimated_success: number;
  risks: string[];
}

export interface MicroStep {
  step: number;
  action: string;
  verification: string;
  fallback: string;
  estimated_time: string;
}

export interface MicroPlan {
  plan: MicroStep[];
  reasoning: string;
  risk_level: 'low' | 'medium' | 'high';
  success_probability: number;
  originalProblem?: Problem;
}

export interface ExecutionResult {
  step: number;
  success: boolean;
  output?: string;
  error?: string;
  time_taken: string;
}

export interface Result {
  success: boolean;
  results: ExecutionResult[];
  failedAtStep?: number;
  totalTime: string;
}

export interface LLMConsultation {
  problem_id: string;
  timestamp: Date;
  models_consulted: LLMModel[];
  solutions: LLMSolution[];
  synthesis: MicroPlan;
  result: Result;
}

// ============================================================================
// Orchestrator Types
// ============================================================================

export type AgentStatus = 'idle' | 'working' | 'stuck' | 'waiting';

export interface Agent {
  id: string;
  name: string;
  type: 'code-builder' | 'orchestrator' | 'problem-solver';
  model: LLMModel;
  status: AgentStatus;
  current_task?: string;
  actions_taken: Action[];
  created_at: Date;
}

export interface OrchestrationState {
  active_agents: Agent[];
  stuck_agents: Agent[];
  recent_problems: Problem[];
  learning_history: LearningEntry[];
}

export interface LearningEntry {
  problem_signature: string;
  problem: Problem;
  solution: Resolution;
  success_metrics: {
    time_to_resolve: string;
    attempts_needed: number;
    llms_consulted: LLMModel[];
  };
  created_at: Date;
}

// ============================================================================
// PRD Integration Types
// ============================================================================

export interface PRDFeature {
  id: string;
  title: string;
  description: string;
  section: string;
  added_at: Date;
}

export interface PRDChange {
  type: 'add' | 'remove' | 'update';
  feature: PRDFeature;
  timestamp: Date;
}

export interface SyncStatus {
  in_sync: boolean;
  prd_features: PRDFeature[];
  registry_features: Feature[];
  missing_in_registry: PRDFeature[];
  missing_in_prd: Feature[];
  conflicts: Conflict[];
}

export interface Conflict {
  feature_id: string;
  prd_version: PRDFeature;
  registry_version: Feature;
  resolution_needed: string;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface OrchestrationConfig {
  verification: {
    require_multi_llm_consensus: boolean;
    consensus_threshold: number;
    max_attempts_before_escalation: number;
  };
  loop_detection: {
    same_action_threshold: number;
    same_error_threshold: number;
    no_progress_timeout_seconds: number;
  };
  intervention: {
    auto_halt_on_loop: boolean;
    multi_llm_brainstorm: boolean;
    log_all_interventions: boolean;
  };
  problem_solving: {
    gather_comprehensive_context: boolean;
    consult_models: LLMModel[];
    synthesis_model: LLMModel;
  };
}

// ============================================================================
// API Types
// ============================================================================

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface RegistryUpdateRequest {
  features: Feature[];
  source: 'prd' | 'code' | 'manual';
}

export interface VerificationRequest {
  phase: number;
  step?: number;
  features?: string[]; // Feature IDs to verify
}

export interface InterventionRequest {
  agent: string;
  problem: Problem;
}
