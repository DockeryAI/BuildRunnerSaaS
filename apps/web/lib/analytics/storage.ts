import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Analytics storage interfaces
export interface MetricsRun {
  id: string;
  project_id: string;
  phase: number;
  microstep_id: string;
  velocity: number;
  quality: number;
  duration_hours: number;
  ac_passed: number;
  ac_total: number;
  created_by?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CostUsage {
  id: string;
  project_id: string;
  provider: 'openai' | 'anthropic' | 'supabase' | 'vercel' | 'github' | 'other';
  service_type: 'llm_tokens' | 'compute' | 'storage' | 'bandwidth' | 'api_calls';
  tokens_used: number;
  compute_seconds: number;
  storage_gb: number;
  api_calls: number;
  usd_cost: number;
  phase: number;
  microstep_id?: string;
  usage_date: string;
  billing_period?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Anomaly {
  id: string;
  project_id?: string;
  type: 'cost_spike' | 'quality_drop' | 'velocity_drop' | 'usage_anomaly' | 'budget_exceeded';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  threshold_value?: number;
  actual_value?: number;
  phase?: number;
  microstep_id?: string;
  is_resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;
  metadata: Record<string, any>;
  detected_at: string;
  created_at: string;
}

export interface ProjectBudget {
  id: string;
  project_id: string;
  monthly_limit_usd: number;
  current_month_spend: number;
  alert_threshold_percent: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MetricsSummary {
  project_id: string;
  phase: number;
  avg_velocity: number;
  max_velocity: number;
  min_velocity: number;
  total_microsteps: number;
  avg_quality: number;
  max_quality: number;
  min_quality: number;
  avg_ac_pass_rate: number;
  avg_duration_hours: number;
  total_duration_hours: number;
  total_cost: number;
  avg_cost_per_entry: number;
  total_tokens: number;
  total_compute_seconds: number;
  total_api_calls: number;
  provider_breakdown: Record<string, any>;
  first_activity: string;
  last_activity: string;
  unresolved_anomalies: number;
}

/**
 * Analytics Storage Service
 */
export class AnalyticsStorage {
  /**
   * Create a metrics run entry
   */
  static async createMetricsRun(metrics: Omit<MetricsRun, 'id' | 'created_at' | 'updated_at'>): Promise<MetricsRun> {
    const { data, error } = await supabase
      .from('metrics_runs')
      .insert([metrics])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create metrics run: ${error.message}`);
    }

    // Log audit event
    await this.logAuditEvent({
      actor: metrics.created_by || 'system',
      action: 'metrics_collected',
      resource_type: 'metrics',
      resource_id: data.id,
      payload: {
        project_id: metrics.project_id,
        phase: metrics.phase,
        microstep_id: metrics.microstep_id,
        velocity: metrics.velocity,
        quality: metrics.quality,
      },
      metadata: metrics.metadata,
    });

    return data;
  }

  /**
   * Create a cost usage entry
   */
  static async createCostUsage(cost: Omit<CostUsage, 'id' | 'created_at' | 'updated_at'>): Promise<CostUsage> {
    const { data, error } = await supabase
      .from('cost_usage')
      .insert([cost])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create cost usage: ${error.message}`);
    }

    // Log audit event
    await this.logAuditEvent({
      actor: 'system',
      action: 'cost_recorded',
      resource_type: 'cost',
      resource_id: data.id,
      payload: {
        project_id: cost.project_id,
        provider: cost.provider,
        service_type: cost.service_type,
        usd_cost: cost.usd_cost,
        phase: cost.phase,
      },
      metadata: cost.metadata,
    });

    return data;
  }

  /**
   * Create an anomaly entry
   */
  static async createAnomaly(anomaly: Omit<Anomaly, 'id' | 'created_at'>): Promise<Anomaly> {
    const { data, error } = await supabase
      .from('anomalies')
      .insert([anomaly])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create anomaly: ${error.message}`);
    }

    // Log audit event
    await this.logAuditEvent({
      actor: 'system',
      action: 'anomaly_detected',
      resource_type: 'anomaly',
      resource_id: data.id,
      payload: {
        project_id: anomaly.project_id,
        type: anomaly.type,
        severity: anomaly.severity,
        threshold_value: anomaly.threshold_value,
        actual_value: anomaly.actual_value,
      },
      metadata: anomaly.metadata,
    });

    return data;
  }

  /**
   * Get metrics summary for a project
   */
  static async getMetricsSummary(projectId?: string, phase?: number): Promise<MetricsSummary[]> {
    let query = supabase.from('metrics_summary').select('*');

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (phase) {
      query = query.eq('phase', phase);
    }

    const { data, error } = await query.order('phase', { ascending: true });

    if (error) {
      throw new Error(`Failed to get metrics summary: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get cost usage data
   */
  static async getCostUsage(options: {
    projectId?: string;
    provider?: string;
    startDate?: string;
    endDate?: string;
    phase?: number;
    limit?: number;
  } = {}): Promise<CostUsage[]> {
    let query = supabase.from('cost_usage').select('*');

    if (options.projectId) {
      query = query.eq('project_id', options.projectId);
    }

    if (options.provider) {
      query = query.eq('provider', options.provider);
    }

    if (options.phase) {
      query = query.eq('phase', options.phase);
    }

    if (options.startDate) {
      query = query.gte('usage_date', options.startDate);
    }

    if (options.endDate) {
      query = query.lte('usage_date', options.endDate);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query.order('usage_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to get cost usage: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get anomalies
   */
  static async getAnomalies(options: {
    projectId?: string;
    type?: string;
    severity?: string;
    resolved?: boolean;
    limit?: number;
  } = {}): Promise<Anomaly[]> {
    let query = supabase.from('anomalies').select('*');

    if (options.projectId) {
      query = query.eq('project_id', options.projectId);
    }

    if (options.type) {
      query = query.eq('type', options.type);
    }

    if (options.severity) {
      query = query.eq('severity', options.severity);
    }

    if (options.resolved !== undefined) {
      query = query.eq('is_resolved', options.resolved);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query.order('detected_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get anomalies: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Resolve an anomaly
   */
  static async resolveAnomaly(
    anomalyId: string, 
    resolvedBy: string, 
    resolutionNotes?: string
  ): Promise<Anomaly> {
    const { data, error } = await supabase
      .from('anomalies')
      .update({
        is_resolved: true,
        resolved_by: resolvedBy,
        resolved_at: new Date().toISOString(),
        resolution_notes: resolutionNotes,
      })
      .eq('id', anomalyId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to resolve anomaly: ${error.message}`);
    }

    // Log audit event
    await this.logAuditEvent({
      actor: resolvedBy,
      action: 'anomaly_resolved',
      resource_type: 'anomaly',
      resource_id: anomalyId,
      payload: {
        resolution_notes: resolutionNotes,
      },
      metadata: {},
    });

    return data;
  }

  /**
   * Get or create project budget
   */
  static async getProjectBudget(projectId: string): Promise<ProjectBudget | null> {
    const { data, error } = await supabase
      .from('project_budgets')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get project budget: ${error.message}`);
    }

    return data;
  }

  /**
   * Update project budget
   */
  static async updateProjectBudget(
    projectId: string, 
    budget: Partial<ProjectBudget>
  ): Promise<ProjectBudget> {
    const { data, error } = await supabase
      .from('project_budgets')
      .upsert({
        project_id: projectId,
        ...budget,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update project budget: ${error.message}`);
    }

    return data;
  }

  /**
   * Get velocity trend data
   */
  static async getVelocityTrend(projectId: string, days: number = 30) {
    const { data, error } = await supabase
      .rpc('calculate_velocity_trend', {
        p_project_id: projectId,
        p_days: days,
      });

    if (error) {
      throw new Error(`Failed to get velocity trend: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get cost trend data
   */
  static async getCostTrend(projectId: string, days: number = 30) {
    const { data, error } = await supabase
      .rpc('calculate_cost_trend', {
        p_project_id: projectId,
        p_days: days,
      });

    if (error) {
      throw new Error(`Failed to get cost trend: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Detect cost anomalies for a project
   */
  static async detectCostAnomalies(projectId: string): Promise<void> {
    const { error } = await supabase
      .rpc('detect_cost_anomalies', {
        p_project_id: projectId,
      });

    if (error) {
      throw new Error(`Failed to detect cost anomalies: ${error.message}`);
    }
  }

  /**
   * Log audit event to runner_events
   */
  private static async logAuditEvent(event: {
    actor: string;
    action: string;
    resource_type: string;
    resource_id?: string;
    payload: Record<string, any>;
    metadata: Record<string, any>;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('runner_events')
        .insert([{
          actor: event.actor,
          action: event.action,
          payload: {
            resource_type: event.resource_type,
            resource_id: event.resource_id,
            ...event.payload,
          },
          metadata: event.metadata,
        }]);

      if (error) {
        console.error('Failed to log audit event:', error);
        // Don't throw here to avoid breaking the main operation
      }
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }
}
