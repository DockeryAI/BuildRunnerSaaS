import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export type PlanType = 'free' | 'pro' | 'team' | 'enterprise';

export interface PlanLimits {
  maxSeats: number;
  maxProjects: number;
  maxStorageGB: number;
  features: {
    analytics: boolean;
    templates: boolean;
    integrations: boolean;
    customRoles: boolean;
    prioritySupport: boolean;
    sso: boolean;
    auditLogs: boolean;
    apiAccess: boolean;
  };
}

export interface PlanInfo {
  type: PlanType;
  limits: PlanLimits;
  currentUsage: {
    seats: number;
    projects: number;
    storageGB: number;
  };
  isActive: boolean;
  expiresAt?: string;
}

/**
 * Get plan limits by plan type
 */
export function getPlanLimits(planType: PlanType): PlanLimits {
  switch (planType) {
    case 'free':
      return {
        maxSeats: 3,
        maxProjects: 1,
        maxStorageGB: 1,
        features: {
          analytics: false,
          templates: true,
          integrations: false,
          customRoles: false,
          prioritySupport: false,
          sso: false,
          auditLogs: false,
          apiAccess: false,
        },
      };

    case 'pro':
      return {
        maxSeats: 10,
        maxProjects: 5,
        maxStorageGB: 10,
        features: {
          analytics: true,
          templates: true,
          integrations: true,
          customRoles: false,
          prioritySupport: false,
          sso: false,
          auditLogs: true,
          apiAccess: true,
        },
      };

    case 'team':
      return {
        maxSeats: 50,
        maxProjects: 25,
        maxStorageGB: 100,
        features: {
          analytics: true,
          templates: true,
          integrations: true,
          customRoles: true,
          prioritySupport: true,
          sso: false,
          auditLogs: true,
          apiAccess: true,
        },
      };

    case 'enterprise':
      return {
        maxSeats: 1000,
        maxProjects: 100,
        maxStorageGB: 1000,
        features: {
          analytics: true,
          templates: true,
          integrations: true,
          customRoles: true,
          prioritySupport: true,
          sso: true,
          auditLogs: true,
          apiAccess: true,
        },
      };

    default:
      return getPlanLimits('free');
  }
}

/**
 * Get organization's plan information
 */
export async function getOrgPlan(orgId: string): Promise<PlanInfo | null> {
  try {
    const { data, error } = await supabase
      .from('plan_limits')
      .select('*')
      .eq('org_id', orgId)
      .single();

    if (error || !data) {
      // Return default free plan if no plan found
      return {
        type: 'free',
        limits: getPlanLimits('free'),
        currentUsage: {
          seats: 0,
          projects: 0,
          storageGB: 0,
        },
        isActive: true,
      };
    }

    // Get current usage
    const currentUsage = await getOrgUsage(orgId);

    return {
      type: data.plan_type as PlanType,
      limits: {
        maxSeats: data.max_seats,
        maxProjects: data.max_projects,
        maxStorageGB: data.max_storage_gb,
        features: data.features || getPlanLimits(data.plan_type as PlanType).features,
      },
      currentUsage,
      isActive: data.is_active,
      expiresAt: data.expires_at,
    };
  } catch (error) {
    console.error('Failed to get org plan:', error);
    return null;
  }
}

/**
 * Get organization's current usage
 */
export async function getOrgUsage(orgId: string): Promise<{
  seats: number;
  projects: number;
  storageGB: number;
}> {
  try {
    // Get seat count
    const { data: memberData, error: memberError } = await supabase
      .from('org_members')
      .select('id')
      .eq('org_id', orgId)
      .eq('is_active', true);

    if (memberError) {
      console.error('Failed to get member count:', memberError);
    }

    // Get project count (assuming projects table has org_id)
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('org_id', orgId)
      .eq('is_active', true);

    if (projectError) {
      console.error('Failed to get project count:', projectError);
    }

    // Storage usage would be calculated from file uploads, database size, etc.
    // For now, return a mock value
    const storageGB = 0.5; // Mock storage usage

    return {
      seats: memberData?.length || 0,
      projects: projectData?.length || 0,
      storageGB,
    };
  } catch (error) {
    console.error('Failed to get org usage:', error);
    return {
      seats: 0,
      projects: 0,
      storageGB: 0,
    };
  }
}

/**
 * Check if organization can add more seats
 */
export async function canAddSeat(orgId: string): Promise<{
  canAdd: boolean;
  reason?: string;
  currentSeats?: number;
  maxSeats?: number;
}> {
  try {
    const planInfo = await getOrgPlan(orgId);
    if (!planInfo) {
      return {
        canAdd: false,
        reason: 'Unable to determine plan limits',
      };
    }

    if (!planInfo.isActive) {
      return {
        canAdd: false,
        reason: 'Plan is not active',
        currentSeats: planInfo.currentUsage.seats,
        maxSeats: planInfo.limits.maxSeats,
      };
    }

    if (planInfo.currentUsage.seats >= planInfo.limits.maxSeats) {
      return {
        canAdd: false,
        reason: `Seat limit reached. Upgrade your plan to add more members.`,
        currentSeats: planInfo.currentUsage.seats,
        maxSeats: planInfo.limits.maxSeats,
      };
    }

    return {
      canAdd: true,
      currentSeats: planInfo.currentUsage.seats,
      maxSeats: planInfo.limits.maxSeats,
    };
  } catch (error) {
    console.error('Failed to check seat availability:', error);
    return {
      canAdd: false,
      reason: 'Failed to check seat availability',
    };
  }
}

/**
 * Check if organization can create more projects
 */
export async function canCreateProject(orgId: string): Promise<{
  canCreate: boolean;
  reason?: string;
  currentProjects?: number;
  maxProjects?: number;
}> {
  try {
    const planInfo = await getOrgPlan(orgId);
    if (!planInfo) {
      return {
        canCreate: false,
        reason: 'Unable to determine plan limits',
      };
    }

    if (!planInfo.isActive) {
      return {
        canCreate: false,
        reason: 'Plan is not active',
        currentProjects: planInfo.currentUsage.projects,
        maxProjects: planInfo.limits.maxProjects,
      };
    }

    if (planInfo.currentUsage.projects >= planInfo.limits.maxProjects) {
      return {
        canCreate: false,
        reason: `Project limit reached. Upgrade your plan to create more projects.`,
        currentProjects: planInfo.currentUsage.projects,
        maxProjects: planInfo.limits.maxProjects,
      };
    }

    return {
      canCreate: true,
      currentProjects: planInfo.currentUsage.projects,
      maxProjects: planInfo.limits.maxProjects,
    };
  } catch (error) {
    console.error('Failed to check project creation availability:', error);
    return {
      canCreate: false,
      reason: 'Failed to check project creation availability',
    };
  }
}

/**
 * Check if organization has access to a feature
 */
export async function hasFeatureAccess(
  orgId: string,
  feature: keyof PlanLimits['features']
): Promise<boolean> {
  try {
    const planInfo = await getOrgPlan(orgId);
    if (!planInfo || !planInfo.isActive) {
      return false;
    }

    return planInfo.limits.features[feature];
  } catch (error) {
    console.error('Failed to check feature access:', error);
    return false;
  }
}

/**
 * Update organization plan
 */
export async function updateOrgPlan(
  orgId: string,
  planType: PlanType,
  billingCycle: 'monthly' | 'yearly' = 'monthly',
  expiresAt?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const limits = getPlanLimits(planType);

    const { error } = await supabase
      .from('plan_limits')
      .upsert({
        org_id: orgId,
        plan_type: planType,
        max_seats: limits.maxSeats,
        max_projects: limits.maxProjects,
        max_storage_gb: limits.maxStorageGB,
        features: limits.features,
        billing_cycle: billingCycle,
        is_active: true,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw error;
    }

    // Log audit event
    await supabase
      .from('runner_events')
      .insert([{
        actor: 'system',
        action: 'plan_updated',
        payload: {
          org_id: orgId,
          plan_type: planType,
          billing_cycle: billingCycle,
          expires_at: expiresAt,
        },
        metadata: {
          update_timestamp: new Date().toISOString(),
        },
      }]);

    return { success: true };
  } catch (error) {
    console.error('Failed to update org plan:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update plan',
    };
  }
}

/**
 * Get plan upgrade recommendations
 */
export function getPlanUpgradeRecommendations(
  currentPlan: PlanType,
  usage: { seats: number; projects: number; storageGB: number }
): {
  shouldUpgrade: boolean;
  recommendedPlan?: PlanType;
  reasons: string[];
} {
  const currentLimits = getPlanLimits(currentPlan);
  const reasons: string[] = [];
  let shouldUpgrade = false;
  let recommendedPlan: PlanType | undefined;

  // Check if approaching limits
  if (usage.seats >= currentLimits.maxSeats * 0.8) {
    reasons.push(`Using ${usage.seats}/${currentLimits.maxSeats} seats (80%+ capacity)`);
    shouldUpgrade = true;
  }

  if (usage.projects >= currentLimits.maxProjects * 0.8) {
    reasons.push(`Using ${usage.projects}/${currentLimits.maxProjects} projects (80%+ capacity)`);
    shouldUpgrade = true;
  }

  if (usage.storageGB >= currentLimits.maxStorageGB * 0.8) {
    reasons.push(`Using ${usage.storageGB}/${currentLimits.maxStorageGB}GB storage (80%+ capacity)`);
    shouldUpgrade = true;
  }

  // Recommend next tier
  if (shouldUpgrade) {
    switch (currentPlan) {
      case 'free':
        recommendedPlan = 'pro';
        break;
      case 'pro':
        recommendedPlan = 'team';
        break;
      case 'team':
        recommendedPlan = 'enterprise';
        break;
      default:
        recommendedPlan = undefined;
    }
  }

  return {
    shouldUpgrade,
    recommendedPlan,
    reasons,
  };
}
