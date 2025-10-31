import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Role hierarchy and permissions
export type ProjectRole = 'PM' | 'TechLead' | 'QA' | 'Contributor' | 'Viewer';
export type OrgRole = 'owner' | 'admin' | 'member';

export interface RolePermissions {
  canComment: boolean;
  canDeleteComments: boolean;
  canPromoteToMicrostep: boolean;
  canManageRoles: boolean;
  canViewProject: boolean;
  canEditProject: boolean;
  canManageIntegrations: boolean;
  canViewAnalytics: boolean;
  canExportData: boolean;
}

export interface UserContext {
  userId: string;
  projectId?: string;
  orgId?: string;
  projectRole?: ProjectRole;
  orgRole?: OrgRole;
  permissions: RolePermissions;
}

/**
 * Get role permissions based on project role
 */
export function getRolePermissions(role: ProjectRole): RolePermissions {
  const basePermissions: RolePermissions = {
    canComment: false,
    canDeleteComments: false,
    canPromoteToMicrostep: false,
    canManageRoles: false,
    canViewProject: false,
    canEditProject: false,
    canManageIntegrations: false,
    canViewAnalytics: false,
    canExportData: false,
  };

  switch (role) {
    case 'PM':
      return {
        ...basePermissions,
        canComment: true,
        canDeleteComments: true,
        canPromoteToMicrostep: true,
        canManageRoles: true,
        canViewProject: true,
        canEditProject: true,
        canManageIntegrations: true,
        canViewAnalytics: true,
        canExportData: true,
      };

    case 'TechLead':
      return {
        ...basePermissions,
        canComment: true,
        canDeleteComments: true,
        canPromoteToMicrostep: true,
        canViewProject: true,
        canEditProject: true,
        canViewAnalytics: true,
        canExportData: true,
      };

    case 'QA':
      return {
        ...basePermissions,
        canComment: true,
        canViewProject: true,
        canEditProject: true,
        canViewAnalytics: true,
      };

    case 'Contributor':
      return {
        ...basePermissions,
        canComment: true,
        canViewProject: true,
        canEditProject: true,
      };

    case 'Viewer':
      return {
        ...basePermissions,
        canViewProject: true,
      };

    default:
      return basePermissions;
  }
}

/**
 * Get user's role in a project
 */
export async function getUserProjectRole(userId: string, projectId: string): Promise<ProjectRole | null> {
  try {
    const { data, error } = await supabase
      .from('role_bindings')
      .select('role')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return data.role as ProjectRole;
  } catch (error) {
    console.error('Failed to get user project role:', error);
    return null;
  }
}

/**
 * Get user's role in an organization
 */
export async function getUserOrgRole(userId: string, orgId: string): Promise<OrgRole | null> {
  try {
    const { data, error } = await supabase
      .from('org_members')
      .select('role')
      .eq('user_id', userId)
      .eq('org_id', orgId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    return data.role as OrgRole;
  } catch (error) {
    console.error('Failed to get user org role:', error);
    return null;
  }
}

/**
 * Build user context with roles and permissions
 */
export async function buildUserContext(
  userId: string,
  projectId?: string,
  orgId?: string
): Promise<UserContext> {
  let projectRole: ProjectRole | undefined;
  let orgRole: OrgRole | undefined;

  if (projectId) {
    projectRole = (await getUserProjectRole(userId, projectId)) || undefined;
  }

  if (orgId) {
    orgRole = (await getUserOrgRole(userId, orgId)) || undefined;
  }

  // Default to Viewer if no role found
  const effectiveRole = projectRole || 'Viewer';
  const permissions = getRolePermissions(effectiveRole);

  return {
    userId,
    projectId,
    orgId,
    projectRole,
    orgRole,
    permissions,
  };
}

/**
 * Extract user ID from request (from auth token)
 */
export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    // In production, this would extract from JWT token
    // For now, use a header or mock user
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return null;
    }

    // Mock user extraction - in production, verify JWT
    const userId = request.headers.get('x-user-id');
    return userId || 'mock-user-id';
  } catch (error) {
    console.error('Failed to extract user ID from request:', error);
    return null;
  }
}

/**
 * Middleware to check if user has required permission
 */
export async function requirePermission(
  request: NextRequest,
  projectId: string,
  permission: keyof RolePermissions
): Promise<{ authorized: boolean; userContext?: UserContext; error?: string }> {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return {
        authorized: false,
        error: 'Authentication required',
      };
    }

    const userContext = await buildUserContext(userId, projectId);
    
    if (!userContext.permissions[permission]) {
      return {
        authorized: false,
        userContext,
        error: `Insufficient permissions. Required: ${permission}. Your role: ${userContext.projectRole || 'None'}`,
      };
    }

    return {
      authorized: true,
      userContext,
    };
  } catch (error) {
    console.error('Permission check failed:', error);
    return {
      authorized: false,
      error: 'Permission check failed',
    };
  }
}

/**
 * Check if user can perform a specific action
 */
export async function canUserPerformAction(
  userId: string,
  projectId: string,
  action: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('can_user_perform_action', {
        p_user_id: userId,
        p_project_id: projectId,
        p_action: action,
      });

    if (error) {
      console.error('Failed to check user action permission:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Failed to check user action permission:', error);
    return false;
  }
}

/**
 * Assign role to user in project
 */
export async function assignProjectRole(
  userId: string,
  projectId: string,
  role: ProjectRole,
  assignedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if assigner has permission to manage roles
    const canAssign = await canUserPerformAction(assignedBy, projectId, 'manage_roles');
    if (!canAssign) {
      return {
        success: false,
        error: 'Insufficient permissions to assign roles',
      };
    }

    // Deactivate existing role bindings
    await supabase
      .from('role_bindings')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('project_id', projectId);

    // Create new role binding
    const { error } = await supabase
      .from('role_bindings')
      .insert([{
        user_id: userId,
        project_id: projectId,
        role,
        assigned_by: assignedBy,
      }]);

    if (error) {
      throw error;
    }

    // Log audit event
    await supabase
      .from('runner_events')
      .insert([{
        actor: assignedBy,
        action: 'role_assigned',
        payload: {
          user_id: userId,
          project_id: projectId,
          role,
          previous_role: null, // Could be enhanced to track previous role
        },
        metadata: {
          assignment_timestamp: new Date().toISOString(),
        },
      }]);

    return { success: true };
  } catch (error) {
    console.error('Failed to assign project role:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to assign role',
    };
  }
}

/**
 * Get project members with their roles
 */
export async function getProjectMembers(projectId: string): Promise<Array<{
  userId: string;
  role: ProjectRole;
  assignedAt: string;
  assignedBy?: string;
}>> {
  try {
    const { data, error } = await supabase
      .from('role_bindings')
      .select('user_id, role, assigned_at, assigned_by')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .order('assigned_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data.map(item => ({
      userId: item.user_id,
      role: item.role as ProjectRole,
      assignedAt: item.assigned_at,
      assignedBy: item.assigned_by,
    }));
  } catch (error) {
    console.error('Failed to get project members:', error);
    return [];
  }
}

/**
 * Remove user from project
 */
export async function removeProjectMember(
  userId: string,
  projectId: string,
  removedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if remover has permission to manage roles
    const canRemove = await canUserPerformAction(removedBy, projectId, 'manage_roles');
    if (!canRemove) {
      return {
        success: false,
        error: 'Insufficient permissions to remove members',
      };
    }

    // Deactivate role binding
    const { error } = await supabase
      .from('role_bindings')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('project_id', projectId);

    if (error) {
      throw error;
    }

    // Log audit event
    await supabase
      .from('runner_events')
      .insert([{
        actor: removedBy,
        action: 'member_removed',
        payload: {
          user_id: userId,
          project_id: projectId,
        },
        metadata: {
          removal_timestamp: new Date().toISOString(),
        },
      }]);

    return { success: true };
  } catch (error) {
    console.error('Failed to remove project member:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove member',
    };
  }
}
