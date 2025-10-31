import { createClient } from '@supabase/supabase-js';
import plans from '../../../../billing/plans.json';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface BillingAccount {
  id: string;
  orgId: string;
  stripeCustomerId?: string;
  plan: 'free' | 'pro' | 'team' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended' | 'cancelled';
  renewalDate?: string;
  trialEndsAt?: string;
  seatsIncluded: number;
  seatsUsed: number;
  billingEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  billingAccountId: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  plan: 'free' | 'pro' | 'team' | 'enterprise';
  seats: number;
  usageLimitTokens: number;
  usageLimitApiCalls: number;
  usageLimitStorageGb: number;
  active: boolean;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsageEvent {
  id: string;
  projectId: string;
  orgId: string;
  billingAccountId?: string;
  eventType: 'tokens' | 'api_calls' | 'storage' | 'compute' | 'integrations';
  quantity: number;
  unit: string;
  phase?: number;
  stepId?: string;
  microstepId?: string;
  modelName?: string;
  integrationProvider?: string;
  usdCost: number;
  recordedAt: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  billingAccountId: string;
  stripeInvoiceId: string;
  invoiceNumber?: string;
  totalUsd: number;
  subtotalUsd: number;
  taxUsd: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  paid: boolean;
  hostedInvoiceUrl?: string;
  invoicePdf?: string;
  dueDate?: string;
  paidAt?: string;
  periodStart?: string;
  periodEnd?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsageQuota {
  id: string;
  billingAccountId: string;
  quotaType: 'tokens' | 'api_calls' | 'storage' | 'seats' | 'integrations';
  limitValue: number;
  usedValue: number;
  resetPeriod: 'monthly' | 'daily' | 'never';
  lastResetAt: string;
  alertThreshold: number;
  alertSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export class BillingManager {
  /**
   * Get billing account for organization
   */
  static async getBillingAccount(orgId: string): Promise<BillingAccount | null> {
    const { data, error } = await supabase
      .from('billing_accounts')
      .select('*')
      .eq('org_id', orgId)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapBillingAccount(data);
  }

  /**
   * Create billing account for organization
   */
  static async createBillingAccount(
    orgId: string,
    plan: string = 'free',
    billingEmail?: string
  ): Promise<BillingAccount> {
    const { data, error } = await supabase
      .from('billing_accounts')
      .insert([{
        org_id: orgId,
        plan,
        billing_email: billingEmail,
        seats_included: plans.plans[plan as keyof typeof plans.plans]?.limits.seats || 1,
        seats_used: 1,
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create billing account: ${error.message}`);
    }

    // Create default quotas
    await this.createDefaultQuotas(data.id, plan);

    // Log audit event
    await this.logBillingEvent(data.id, 'subscription_created', 'system', 'Billing account created', {}, { plan, org_id: orgId });

    return this.mapBillingAccount(data);
  }

  /**
   * Update billing account
   */
  static async updateBillingAccount(
    id: string,
    updates: Partial<{
      plan: string;
      status: string;
      stripeCustomerId: string;
      renewalDate: string;
      seatsIncluded: number;
      seatsUsed: number;
      billingEmail: string;
    }>
  ): Promise<BillingAccount> {
    const { data, error } = await supabase
      .from('billing_accounts')
      .update({
        plan: updates.plan,
        status: updates.status,
        stripe_customer_id: updates.stripeCustomerId,
        renewal_date: updates.renewalDate,
        seats_included: updates.seatsIncluded,
        seats_used: updates.seatsUsed,
        billing_email: updates.billingEmail,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update billing account: ${error.message}`);
    }

    return this.mapBillingAccount(data);
  }

  /**
   * Get current subscription for billing account
   */
  static async getCurrentSubscription(billingAccountId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('billing_account_id', billingAccountId)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapSubscription(data);
  }

  /**
   * Create subscription
   */
  static async createSubscription(
    billingAccountId: string,
    plan: string,
    stripeSubscriptionId?: string,
    stripePriceId?: string
  ): Promise<Subscription> {
    const planConfig = plans.plans[plan as keyof typeof plans.plans];
    if (!planConfig) {
      throw new Error(`Invalid plan: ${plan}`);
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .insert([{
        billing_account_id: billingAccountId,
        stripe_subscription_id: stripeSubscriptionId,
        stripe_price_id: stripePriceId,
        plan,
        seats: planConfig.limits.seats,
        usage_limit_tokens: planConfig.limits.tokens_per_month,
        usage_limit_api_calls: planConfig.limits.api_calls_per_month,
        usage_limit_storage_gb: planConfig.limits.storage_gb,
        active: true,
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create subscription: ${error.message}`);
    }

    return this.mapSubscription(data);
  }

  /**
   * Record usage event
   */
  static async recordUsage(
    projectId: string,
    orgId: string,
    eventType: string,
    quantity: number,
    unit: string,
    options: {
      phase?: number;
      stepId?: string;
      microstepId?: string;
      modelName?: string;
      integrationProvider?: string;
      usdCost?: number;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<UsageEvent> {
    // Get billing account
    const billingAccount = await this.getBillingAccount(orgId);
    
    const { data, error } = await supabase
      .rpc('record_usage_event', {
        p_project_id: projectId,
        p_org_id: orgId,
        p_event_type: eventType,
        p_quantity: quantity,
        p_unit: unit,
        p_usd_cost: options.usdCost || 0,
        p_metadata: {
          phase: options.phase,
          step_id: options.stepId,
          microstep_id: options.microstepId,
          model_name: options.modelName,
          integration_provider: options.integrationProvider,
          ...options.metadata,
        },
      });

    if (error) {
      throw new Error(`Failed to record usage: ${error.message}`);
    }

    // Log to runner_events for governance
    await supabase
      .from('runner_events')
      .insert([{
        actor: 'system',
        action: 'usage_recorded',
        payload: {
          project_id: projectId,
          org_id: orgId,
          event_type: eventType,
          quantity,
          unit,
          usd_cost: options.usdCost || 0,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          billing_account_id: billingAccount?.id,
        },
      }]);

    return {
      id: data,
      projectId,
      orgId,
      billingAccountId: billingAccount?.id,
      eventType: eventType as any,
      quantity,
      unit,
      phase: options.phase,
      stepId: options.stepId,
      microstepId: options.microstepId,
      modelName: options.modelName,
      integrationProvider: options.integrationProvider,
      usdCost: options.usdCost || 0,
      recordedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Check usage limits
   */
  static async checkUsageLimit(
    billingAccountId: string,
    quotaType: string,
    additionalUsage: number = 0
  ): Promise<{ allowed: boolean; currentUsage: number; limit: number }> {
    const { data, error } = await supabase
      .rpc('check_usage_limit', {
        p_billing_account_id: billingAccountId,
        p_quota_type: quotaType,
        p_additional_usage: additionalUsage,
      });

    if (error) {
      throw new Error(`Failed to check usage limit: ${error.message}`);
    }

    // Get current usage and limit
    const currentUsage = await supabase
      .rpc('get_current_usage', {
        p_billing_account_id: billingAccountId,
        p_quota_type: quotaType,
      });

    const { data: quota } = await supabase
      .from('usage_quotas')
      .select('limit_value')
      .eq('billing_account_id', billingAccountId)
      .eq('quota_type', quotaType)
      .single();

    return {
      allowed: data,
      currentUsage: currentUsage.data || 0,
      limit: quota?.limit_value || 0,
    };
  }

  /**
   * Get usage summary for billing account
   */
  static async getUsageSummary(
    billingAccountId: string,
    startDate?: string,
    endDate?: string
  ): Promise<Record<string, { quantity: number; cost: number }>> {
    let query = supabase
      .from('usage_events')
      .select('event_type, quantity, usd_cost')
      .eq('billing_account_id', billingAccountId);

    if (startDate) {
      query = query.gte('recorded_at', startDate);
    }
    if (endDate) {
      query = query.lte('recorded_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get usage summary: ${error.message}`);
    }

    const summary: Record<string, { quantity: number; cost: number }> = {};

    for (const event of data || []) {
      if (!summary[event.event_type]) {
        summary[event.event_type] = { quantity: 0, cost: 0 };
      }
      summary[event.event_type].quantity += event.quantity;
      summary[event.event_type].cost += parseFloat(event.usd_cost);
    }

    return summary;
  }

  /**
   * Create default quotas for a plan
   */
  private static async createDefaultQuotas(billingAccountId: string, plan: string): Promise<void> {
    const planConfig = plans.plans[plan as keyof typeof plans.plans];
    if (!planConfig) return;

    const quotas = [
      { quota_type: 'tokens', limit_value: planConfig.limits.tokens_per_month },
      { quota_type: 'api_calls', limit_value: planConfig.limits.api_calls_per_month },
      { quota_type: 'storage', limit_value: planConfig.limits.storage_gb },
      { quota_type: 'seats', limit_value: planConfig.limits.seats },
      { quota_type: 'integrations', limit_value: planConfig.limits.integrations },
    ];

    for (const quota of quotas) {
      await supabase
        .from('usage_quotas')
        .upsert({
          billing_account_id: billingAccountId,
          ...quota,
        });
    }
  }

  /**
   * Log billing event
   */
  private static async logBillingEvent(
    billingAccountId: string,
    eventType: string,
    actor: string,
    description: string,
    oldValues: Record<string, any> = {},
    newValues: Record<string, any> = {}
  ): Promise<void> {
    await supabase
      .from('billing_events')
      .insert([{
        billing_account_id: billingAccountId,
        event_type: eventType,
        actor,
        description,
        old_values: oldValues,
        new_values: newValues,
      }]);
  }

  /**
   * Map database record to BillingAccount
   */
  private static mapBillingAccount(data: any): BillingAccount {
    return {
      id: data.id,
      orgId: data.org_id,
      stripeCustomerId: data.stripe_customer_id,
      plan: data.plan,
      status: data.status,
      renewalDate: data.renewal_date,
      trialEndsAt: data.trial_ends_at,
      seatsIncluded: data.seats_included,
      seatsUsed: data.seats_used,
      billingEmail: data.billing_email,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Map database record to Subscription
   */
  private static mapSubscription(data: any): Subscription {
    return {
      id: data.id,
      billingAccountId: data.billing_account_id,
      stripeSubscriptionId: data.stripe_subscription_id,
      stripePriceId: data.stripe_price_id,
      plan: data.plan,
      seats: data.seats,
      usageLimitTokens: data.usage_limit_tokens,
      usageLimitApiCalls: data.usage_limit_api_calls,
      usageLimitStorageGb: data.usage_limit_storage_gb,
      active: data.active,
      currentPeriodStart: data.current_period_start,
      currentPeriodEnd: data.current_period_end,
      cancelAtPeriodEnd: data.cancel_at_period_end,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export default BillingManager;
