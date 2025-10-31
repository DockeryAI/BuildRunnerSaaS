import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface ModelProfile {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'local' | 'custom';
  modelId: string;
  taskTypes: string[];
  enabled: boolean;
  config: Record<string, any>;
  costPerInputToken: number;
  costPerOutputToken: number;
  maxTokens: number;
  supportsStreaming: boolean;
  supportsFunctionCalling: boolean;
  qualityRating: number;
  speedRating: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ModelRun {
  id: string;
  projectId?: string;
  taskType: 'planner' | 'builder' | 'qa' | 'explain' | 'rescope' | 'arbitrate';
  modelName: string;
  modelProvider: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  success: boolean;
  qualityScore?: number;
  costUsd: number;
  errorMessage?: string;
  payload: Record<string, any>;
  responsePayload: Record<string, any>;
  userId?: string;
  entityType?: string;
  entityId?: string;
  createdAt: string;
}

export interface ArbitrationResult {
  id: string;
  projectId?: string;
  taskType: string;
  candidateA: Record<string, any>;
  candidateB: Record<string, any>;
  winner: 'candidate_a' | 'candidate_b' | 'tie';
  rationale: string;
  judgeModel: string;
  confidenceScore: number;
  costMultiplier: number;
  totalCostUsd: number;
  userId?: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface Explanation {
  id: string;
  projectId?: string;
  scope: 'project' | 'milestone' | 'step' | 'microstep' | 'weekly' | 'monthly';
  entityId?: string;
  modelName: string;
  modelProvider: string;
  title?: string;
  content: string;
  contentType: 'markdown' | 'html' | 'plain';
  language: string;
  audience: 'technical' | 'business' | 'general';
  tokensUsed: number;
  generationTimeMs: number;
  userId?: string;
  isExported: boolean;
  exportedAt?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectModelSettings {
  id: string;
  projectId: string;
  taskType: string;
  preferredModel: string;
  fallbackModel?: string;
  dualRunEnabled: boolean;
  maxCostMultiplier: number;
  qualityThreshold: number;
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Model Profiles Management
 */
export class ModelProfilesStorage {
  static async getAll(): Promise<ModelProfile[]> {
    try {
      const { data, error } = await supabase
        .from('model_profiles')
        .select('*')
        .order('quality_rating', { ascending: false });

      if (error) throw error;

      return data.map(this.transformModelProfile);
    } catch (error) {
      console.error('Failed to get model profiles:', error);
      return [];
    }
  }

  static async getByTaskType(taskType: string): Promise<ModelProfile[]> {
    try {
      const { data, error } = await supabase
        .from('model_profiles')
        .select('*')
        .contains('task_types', [taskType])
        .eq('enabled', true)
        .order('quality_rating', { ascending: false });

      if (error) throw error;

      return data.map(this.transformModelProfile);
    } catch (error) {
      console.error('Failed to get model profiles by task type:', error);
      return [];
    }
  }

  static async create(profile: Omit<ModelProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<ModelProfile | null> {
    try {
      const { data, error } = await supabase
        .from('model_profiles')
        .insert([{
          name: profile.name,
          provider: profile.provider,
          model_id: profile.modelId,
          task_types: profile.taskTypes,
          enabled: profile.enabled,
          config: profile.config,
          cost_per_input_token: profile.costPerInputToken,
          cost_per_output_token: profile.costPerOutputToken,
          max_tokens: profile.maxTokens,
          supports_streaming: profile.supportsStreaming,
          supports_function_calling: profile.supportsFunctionCalling,
          quality_rating: profile.qualityRating,
          speed_rating: profile.speedRating,
          metadata: profile.metadata,
        }])
        .select()
        .single();

      if (error) throw error;

      // Log audit event
      await supabase
        .from('runner_events')
        .insert([{
          actor: 'system',
          action: 'model_profile_created',
          payload: {
            profile_id: data.id,
            name: profile.name,
            provider: profile.provider,
            task_types: profile.taskTypes,
          },
          metadata: {
            creation_timestamp: new Date().toISOString(),
          },
        }]);

      return this.transformModelProfile(data);
    } catch (error) {
      console.error('Failed to create model profile:', error);
      return null;
    }
  }

  static async update(id: string, updates: Partial<ModelProfile>): Promise<ModelProfile | null> {
    try {
      const updateData: any = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.provider !== undefined) updateData.provider = updates.provider;
      if (updates.modelId !== undefined) updateData.model_id = updates.modelId;
      if (updates.taskTypes !== undefined) updateData.task_types = updates.taskTypes;
      if (updates.enabled !== undefined) updateData.enabled = updates.enabled;
      if (updates.config !== undefined) updateData.config = updates.config;
      if (updates.costPerInputToken !== undefined) updateData.cost_per_input_token = updates.costPerInputToken;
      if (updates.costPerOutputToken !== undefined) updateData.cost_per_output_token = updates.costPerOutputToken;
      if (updates.maxTokens !== undefined) updateData.max_tokens = updates.maxTokens;
      if (updates.supportsStreaming !== undefined) updateData.supports_streaming = updates.supportsStreaming;
      if (updates.supportsFunctionCalling !== undefined) updateData.supports_function_calling = updates.supportsFunctionCalling;
      if (updates.qualityRating !== undefined) updateData.quality_rating = updates.qualityRating;
      if (updates.speedRating !== undefined) updateData.speed_rating = updates.speedRating;
      if (updates.metadata !== undefined) updateData.metadata = updates.metadata;

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('model_profiles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.transformModelProfile(data);
    } catch (error) {
      console.error('Failed to update model profile:', error);
      return null;
    }
  }

  private static transformModelProfile(row: any): ModelProfile {
    return {
      id: row.id,
      name: row.name,
      provider: row.provider,
      modelId: row.model_id,
      taskTypes: row.task_types,
      enabled: row.enabled,
      config: row.config,
      costPerInputToken: row.cost_per_input_token,
      costPerOutputToken: row.cost_per_output_token,
      maxTokens: row.max_tokens,
      supportsStreaming: row.supports_streaming,
      supportsFunctionCalling: row.supports_function_calling,
      qualityRating: row.quality_rating,
      speedRating: row.speed_rating,
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

/**
 * Model Runs Management
 */
export class ModelRunsStorage {
  static async create(run: Omit<ModelRun, 'id' | 'createdAt'>): Promise<ModelRun | null> {
    try {
      const { data, error } = await supabase
        .from('model_runs')
        .insert([{
          project_id: run.projectId,
          task_type: run.taskType,
          model_name: run.modelName,
          model_provider: run.modelProvider,
          input_tokens: run.inputTokens,
          output_tokens: run.outputTokens,
          latency_ms: run.latencyMs,
          success: run.success,
          quality_score: run.qualityScore,
          cost_usd: run.costUsd,
          error_message: run.errorMessage,
          payload: run.payload,
          response_payload: run.responsePayload,
          user_id: run.userId,
          entity_type: run.entityType,
          entity_id: run.entityId,
        }])
        .select()
        .single();

      if (error) throw error;

      return this.transformModelRun(data);
    } catch (error) {
      console.error('Failed to create model run:', error);
      return null;
    }
  }

  static async getByProject(projectId: string, limit = 50): Promise<ModelRun[]> {
    try {
      const { data, error } = await supabase
        .from('model_runs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map(this.transformModelRun);
    } catch (error) {
      console.error('Failed to get model runs by project:', error);
      return [];
    }
  }

  static async getByTaskType(taskType: string, limit = 50): Promise<ModelRun[]> {
    try {
      const { data, error } = await supabase
        .from('model_runs')
        .select('*')
        .eq('task_type', taskType)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map(this.transformModelRun);
    } catch (error) {
      console.error('Failed to get model runs by task type:', error);
      return [];
    }
  }

  private static transformModelRun(row: any): ModelRun {
    return {
      id: row.id,
      projectId: row.project_id,
      taskType: row.task_type,
      modelName: row.model_name,
      modelProvider: row.model_provider,
      inputTokens: row.input_tokens,
      outputTokens: row.output_tokens,
      latencyMs: row.latency_ms,
      success: row.success,
      qualityScore: row.quality_score,
      costUsd: row.cost_usd,
      errorMessage: row.error_message,
      payload: row.payload,
      responsePayload: row.response_payload,
      userId: row.user_id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      createdAt: row.created_at,
    };
  }
}

/**
 * Arbitration Results Management
 */
export class ArbitrationStorage {
  static async create(result: Omit<ArbitrationResult, 'id' | 'createdAt'>): Promise<ArbitrationResult | null> {
    try {
      const { data, error } = await supabase
        .from('arbitration_results')
        .insert([{
          project_id: result.projectId,
          task_type: result.taskType,
          candidate_a: result.candidateA,
          candidate_b: result.candidateB,
          winner: result.winner,
          rationale: result.rationale,
          judge_model: result.judgeModel,
          confidence_score: result.confidenceScore,
          cost_multiplier: result.costMultiplier,
          total_cost_usd: result.totalCostUsd,
          user_id: result.userId,
          metadata: result.metadata,
        }])
        .select()
        .single();

      if (error) throw error;

      // Log audit event
      await supabase
        .from('runner_events')
        .insert([{
          actor: result.userId || 'system',
          action: 'arbitration_completed',
          payload: {
            arbitration_id: data.id,
            task_type: result.taskType,
            winner: result.winner,
            confidence_score: result.confidenceScore,
          },
          metadata: {
            arbitration_timestamp: new Date().toISOString(),
            cost_multiplier: result.costMultiplier,
          },
        }]);

      return this.transformArbitrationResult(data);
    } catch (error) {
      console.error('Failed to create arbitration result:', error);
      return null;
    }
  }

  static async getByProject(projectId: string, limit = 20): Promise<ArbitrationResult[]> {
    try {
      const { data, error } = await supabase
        .from('arbitration_results')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map(this.transformArbitrationResult);
    } catch (error) {
      console.error('Failed to get arbitration results by project:', error);
      return [];
    }
  }

  private static transformArbitrationResult(row: any): ArbitrationResult {
    return {
      id: row.id,
      projectId: row.project_id,
      taskType: row.task_type,
      candidateA: row.candidate_a,
      candidateB: row.candidate_b,
      winner: row.winner,
      rationale: row.rationale,
      judgeModel: row.judge_model,
      confidenceScore: row.confidence_score,
      costMultiplier: row.cost_multiplier,
      totalCostUsd: row.total_cost_usd,
      userId: row.user_id,
      metadata: row.metadata,
      createdAt: row.created_at,
    };
  }
}

/**
 * Explanations Management
 */
export class ExplanationsStorage {
  static async create(explanation: Omit<Explanation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Explanation | null> {
    try {
      const { data, error } = await supabase
        .from('explanations')
        .insert([{
          project_id: explanation.projectId,
          scope: explanation.scope,
          entity_id: explanation.entityId,
          model_name: explanation.modelName,
          model_provider: explanation.modelProvider,
          title: explanation.title,
          content: explanation.content,
          content_type: explanation.contentType,
          language: explanation.language,
          audience: explanation.audience,
          tokens_used: explanation.tokensUsed,
          generation_time_ms: explanation.generationTimeMs,
          user_id: explanation.userId,
          is_exported: explanation.isExported,
          exported_at: explanation.exportedAt,
          metadata: explanation.metadata,
        }])
        .select()
        .single();

      if (error) throw error;

      // Log audit event
      await supabase
        .from('runner_events')
        .insert([{
          actor: explanation.userId || 'system',
          action: 'explanation_generated',
          payload: {
            explanation_id: data.id,
            scope: explanation.scope,
            entity_id: explanation.entityId,
            model_name: explanation.modelName,
            tokens_used: explanation.tokensUsed,
          },
          metadata: {
            generation_timestamp: new Date().toISOString(),
            audience: explanation.audience,
          },
        }]);

      return this.transformExplanation(data);
    } catch (error) {
      console.error('Failed to create explanation:', error);
      return null;
    }
  }

  static async getByScope(
    scope: string,
    entityId?: string,
    projectId?: string,
    limit = 10
  ): Promise<Explanation[]> {
    try {
      let query = supabase
        .from('explanations')
        .select('*')
        .eq('scope', scope)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (entityId) {
        query = query.eq('entity_id', entityId);
      }

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(this.transformExplanation);
    } catch (error) {
      console.error('Failed to get explanations by scope:', error);
      return [];
    }
  }

  static async markAsExported(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('explanations')
        .update({
          is_exported: true,
          exported_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Failed to mark explanation as exported:', error);
      return false;
    }
  }

  private static transformExplanation(row: any): Explanation {
    return {
      id: row.id,
      projectId: row.project_id,
      scope: row.scope,
      entityId: row.entity_id,
      modelName: row.model_name,
      modelProvider: row.model_provider,
      title: row.title,
      content: row.content,
      contentType: row.content_type,
      language: row.language,
      audience: row.audience,
      tokensUsed: row.tokens_used,
      generationTimeMs: row.generation_time_ms,
      userId: row.user_id,
      isExported: row.is_exported,
      exportedAt: row.exported_at,
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

/**
 * Project Model Settings Management
 */
export class ProjectModelSettingsStorage {
  static async getByProject(projectId: string): Promise<ProjectModelSettings[]> {
    try {
      const { data, error } = await supabase
        .from('project_model_settings')
        .select('*')
        .eq('project_id', projectId)
        .order('task_type');

      if (error) throw error;

      return data.map(this.transformProjectModelSettings);
    } catch (error) {
      console.error('Failed to get project model settings:', error);
      return [];
    }
  }

  static async upsert(settings: Omit<ProjectModelSettings, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectModelSettings | null> {
    try {
      const { data, error } = await supabase
        .from('project_model_settings')
        .upsert({
          project_id: settings.projectId,
          task_type: settings.taskType,
          preferred_model: settings.preferredModel,
          fallback_model: settings.fallbackModel,
          dual_run_enabled: settings.dualRunEnabled,
          max_cost_multiplier: settings.maxCostMultiplier,
          quality_threshold: settings.qualityThreshold,
          settings: settings.settings,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return this.transformProjectModelSettings(data);
    } catch (error) {
      console.error('Failed to upsert project model settings:', error);
      return null;
    }
  }

  private static transformProjectModelSettings(row: any): ProjectModelSettings {
    return {
      id: row.id,
      projectId: row.project_id,
      taskType: row.task_type,
      preferredModel: row.preferred_model,
      fallbackModel: row.fallback_model,
      dualRunEnabled: row.dual_run_enabled,
      maxCostMultiplier: row.max_cost_multiplier,
      qualityThreshold: row.quality_threshold,
      settings: row.settings,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
