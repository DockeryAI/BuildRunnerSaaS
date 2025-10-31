import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface AdminDashboardStats {
  totalProjects: number;
  activeProjects: number;
  monthlySpend: number;
  monthlyTokens: number;
  qualityScore: number;
  activeIssues: number;
  openTickets: number;
}

export interface ProjectOverview {
  id: string;
  name: string;
  orgId: string;
  status: string;
  monthlySpend: number;
  monthlyBudget: number;
  budgetUsedPercent: number;
  tokenUsage: number;
  qualityScore: number;
  lastActivity: string;
  issueCount: number;
}

export interface CostBudget {
  id: string;
  projectId: string;
  monthlyUsd: number;
  hardCap: boolean;
  alertThreshold: number;
  enabled: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiKey {
  id: string;
  projectId: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  enabled: boolean;
  lastUsedAt?: string;
  expiresAt?: string;
  createdBy: string;
  createdAt: string;
}

export interface ImpersonationSession {
  id: string;
  adminId: string;
  userId: string;
  projectId?: string;
  reason: string;
  startAt: string;
  endAt?: string;
  durationMinutes?: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface MaintenanceWindow {
  id: string;
  projectId?: string;
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  blocksOperations: string[];
  createdBy: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'budget' | 'reliability' | 'governance' | 'integrations' | 'billing' | 'performance';
  assignedTo?: string;
  reporterId?: string;
  resolution?: string;
  meta: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export class AdminManager {
  /**
   * Get admin dashboard statistics
   */
  static async getDashboardStats(): Promise<AdminDashboardStats> {
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';

    // Get project counts
    const { data: projects } = await supabase
      .from('projects')
      .select('id, status');

    const totalProjects = projects?.length || 0;
    const activeProjects = projects?.filter(p => p.status === 'active').length || 0;

    // Get monthly spend
    const { data: costSnapshots } = await supabase
      .from('cost_snapshots')
      .select('usd_spend, token_usage')
      .eq('month', currentMonth);

    const monthlySpend = costSnapshots?.reduce((sum, cs) => sum + parseFloat(cs.usd_spend), 0) || 0;
    const monthlyTokens = costSnapshots?.reduce((sum, cs) => sum + cs.token_usage, 0) || 0;

    // Get quality score (mock for now)
    const qualityScore = 85; // TODO: Calculate from actual quality metrics

    // Get active issues
    const { data: tickets } = await supabase
      .from('support_tickets')
      .select('id, status')
      .in('status', ['open', 'in_progress']);

    const activeIssues = tickets?.filter(t => t.status === 'open').length || 0;
    const openTickets = tickets?.length || 0;

    return {
      totalProjects,
      activeProjects,
      monthlySpend,
      monthlyTokens,
      qualityScore,
      activeIssues,
      openTickets,
    };
  }

  /**
   * Get project overviews for admin dashboard
   */
  static async getProjectOverviews(): Promise<ProjectOverview[]> {
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';

    const { data: projects } = await supabase
      .from('projects')
      .select(`
        id, name, org_id, status, updated_at,
        cost_snapshots!inner(usd_spend, token_usage),
        cost_budgets(monthly_usd),
        support_tickets(id)
      `)
      .eq('cost_snapshots.month', currentMonth);

    return projects?.map(project => {
      const monthlySpend = project.cost_snapshots?.[0]?.usd_spend || 0;
      const monthlyBudget = project.cost_budgets?.[0]?.monthly_usd || 0;
      const budgetUsedPercent = monthlyBudget > 0 ? (monthlySpend / monthlyBudget) * 100 : 0;

      return {
        id: project.id,
        name: project.name,
        orgId: project.org_id,
        status: project.status,
        monthlySpend,
        monthlyBudget,
        budgetUsedPercent,
        tokenUsage: project.cost_snapshots?.[0]?.token_usage || 0,
        qualityScore: 85, // TODO: Calculate from actual metrics
        lastActivity: project.updated_at,
        issueCount: project.support_tickets?.length || 0,
      };
    }) || [];
  }

  /**
   * Get cost budget for project
   */
  static async getCostBudget(projectId: string): Promise<CostBudget | null> {
    const { data, error } = await supabase
      .from('cost_budgets')
      .select('*')
      .eq('project_id', projectId)
      .eq('enabled', true)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapCostBudget(data);
  }

  /**
   * Create or update cost budget
   */
  static async upsertCostBudget(
    projectId: string,
    monthlyUsd: number,
    options: {
      hardCap?: boolean;
      alertThreshold?: number;
      createdBy: string;
    }
  ): Promise<CostBudget> {
    const { data, error } = await supabase
      .from('cost_budgets')
      .upsert({
        project_id: projectId,
        monthly_usd: monthlyUsd,
        hard_cap: options.hardCap || false,
        alert_threshold: options.alertThreshold || 0.8,
        enabled: true,
        created_by: options.createdBy,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to upsert cost budget: ${error.message}`);
    }

    // Log admin action
    await this.logAdminAction(
      options.createdBy,
      'cost_budget_updated',
      'cost_budget',
      data.id,
      projectId,
      { monthly_usd: monthlyUsd, hard_cap: options.hardCap }
    );

    return this.mapCostBudget(data);
  }

  /**
   * Create API key with hashed storage
   */
  static async createApiKey(
    projectId: string,
    name: string,
    scopes: string[],
    createdBy: string,
    expiresAt?: string
  ): Promise<{ apiKey: ApiKey; plainKey: string }> {
    // Generate random API key
    const plainKey = `br_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    const keyHash = await bcrypt.hash(plainKey, 12);
    const keyPrefix = plainKey.substring(0, 8);

    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        project_id: projectId,
        name,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        scopes,
        enabled: true,
        expires_at: expiresAt,
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create API key: ${error.message}`);
    }

    // Log admin action
    await this.logAdminAction(
      createdBy,
      'api_key_created',
      'api_key',
      data.id,
      projectId,
      { name, scopes, key_prefix: keyPrefix }
    );

    return {
      apiKey: this.mapApiKey(data),
      plainKey,
    };
  }

  /**
   * Verify API key
   */
  static async verifyApiKey(plainKey: string): Promise<ApiKey | null> {
    const keyPrefix = plainKey.substring(0, 8);

    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key_prefix', keyPrefix)
      .eq('enabled', true);

    if (error || !data || data.length === 0) {
      return null;
    }

    // Check each potential match
    for (const keyRecord of data) {
      const isValid = await bcrypt.compare(plainKey, keyRecord.key_hash);
      if (isValid) {
        // Update last used timestamp
        await supabase
          .from('api_keys')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', keyRecord.id);

        return this.mapApiKey(keyRecord);
      }
    }

    return null;
  }

  /**
   * Start impersonation session
   */
  static async startImpersonation(
    adminId: string,
    userId: string,
    projectId: string | undefined,
    reason: string,
    durationMinutes: number = 60
  ): Promise<ImpersonationSession> {
    const startAt = new Date();
    const endAt = new Date(startAt.getTime() + durationMinutes * 60 * 1000);

    const { data, error } = await supabase
      .from('impersonation_sessions')
      .insert({
        admin_id: adminId,
        user_id: userId,
        project_id: projectId,
        reason,
        start_at: startAt.toISOString(),
        end_at: endAt.toISOString(),
        duration_minutes: durationMinutes,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to start impersonation: ${error.message}`);
    }

    // Log admin action
    await this.logAdminAction(
      adminId,
      'impersonation_started',
      'impersonation_session',
      data.id,
      projectId,
      { user_id: userId, reason, duration_minutes: durationMinutes }
    );

    return this.mapImpersonationSession(data);
  }

  /**
   * End impersonation session
   */
  static async endImpersonation(sessionId: string, adminId: string): Promise<void> {
    const { error } = await supabase
      .from('impersonation_sessions')
      .update({ end_at: new Date().toISOString() })
      .eq('id', sessionId)
      .eq('admin_id', adminId);

    if (error) {
      throw new Error(`Failed to end impersonation: ${error.message}`);
    }

    // Log admin action
    await this.logAdminAction(
      adminId,
      'impersonation_ended',
      'impersonation_session',
      sessionId,
      undefined,
      { session_id: sessionId }
    );
  }

  /**
   * Create maintenance window
   */
  static async createMaintenanceWindow(
    projectId: string | undefined,
    title: string,
    description: string,
    startsAt: string,
    endsAt: string,
    blocksOperations: string[],
    createdBy: string
  ): Promise<MaintenanceWindow> {
    const { data, error } = await supabase
      .from('maintenance_windows')
      .insert({
        project_id: projectId,
        title,
        description,
        starts_at: startsAt,
        ends_at: endsAt,
        blocks_operations: blocksOperations,
        status: 'scheduled',
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create maintenance window: ${error.message}`);
    }

    // Log admin action
    await this.logAdminAction(
      createdBy,
      'maintenance_window_created',
      'maintenance_window',
      data.id,
      projectId,
      { title, starts_at: startsAt, ends_at: endsAt, blocks_operations: blocksOperations }
    );

    return this.mapMaintenanceWindow(data);
  }

  /**
   * Create support ticket
   */
  static async createSupportTicket(
    projectId: string,
    title: string,
    description: string,
    priority: string,
    category: string,
    reporterId: string,
    meta: Record<string, any> = {}
  ): Promise<SupportTicket> {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        project_id: projectId,
        title,
        description,
        status: 'open',
        priority,
        category,
        reporter_id: reporterId,
        meta,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create support ticket: ${error.message}`);
    }

    return this.mapSupportTicket(data);
  }

  /**
   * Log admin action
   */
  static async logAdminAction(
    actor: string,
    action: string,
    resourceType?: string,
    resourceId?: string,
    projectId?: string,
    payload: Record<string, any> = {}
  ): Promise<void> {
    await supabase
      .from('admin_actions')
      .insert({
        actor,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        project_id: projectId,
        payload,
      });
  }

  // Mapping functions
  private static mapCostBudget(data: any): CostBudget {
    return {
      id: data.id,
      projectId: data.project_id,
      monthlyUsd: parseFloat(data.monthly_usd),
      hardCap: data.hard_cap,
      alertThreshold: parseFloat(data.alert_threshold),
      enabled: data.enabled,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private static mapApiKey(data: any): ApiKey {
    return {
      id: data.id,
      projectId: data.project_id,
      name: data.name,
      keyPrefix: data.key_prefix,
      scopes: data.scopes,
      enabled: data.enabled,
      lastUsedAt: data.last_used_at,
      expiresAt: data.expires_at,
      createdBy: data.created_by,
      createdAt: data.created_at,
    };
  }

  private static mapImpersonationSession(data: any): ImpersonationSession {
    return {
      id: data.id,
      adminId: data.admin_id,
      userId: data.user_id,
      projectId: data.project_id,
      reason: data.reason,
      startAt: data.start_at,
      endAt: data.end_at,
      durationMinutes: data.duration_minutes,
      ipAddress: data.ip_address,
      userAgent: data.user_agent,
    };
  }

  private static mapMaintenanceWindow(data: any): MaintenanceWindow {
    return {
      id: data.id,
      projectId: data.project_id,
      title: data.title,
      description: data.description,
      startsAt: data.starts_at,
      endsAt: data.ends_at,
      status: data.status,
      blocksOperations: data.blocks_operations,
      createdBy: data.created_by,
      createdAt: data.created_at,
    };
  }

  private static mapSupportTicket(data: any): SupportTicket {
    return {
      id: data.id,
      projectId: data.project_id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      category: data.category,
      assignedTo: data.assigned_to,
      reporterId: data.reporter_id,
      resolution: data.resolution,
      meta: data.meta,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      resolvedAt: data.resolved_at,
    };
  }
}

export default AdminManager;
