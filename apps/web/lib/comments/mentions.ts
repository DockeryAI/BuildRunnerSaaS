import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface Mention {
  id: string;
  commentId: string;
  userId: string;
  mentionType: 'user' | 'role' | 'team';
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  entityType: string;
  entityId: string;
  userId: string;
  subscriptionType: 'auto' | 'manual' | 'mentioned';
  isActive: boolean;
  createdAt: string;
}

/**
 * Extract mentions from text using various patterns
 */
export function extractMentions(text: string): Array<{
  type: 'user' | 'role' | 'team';
  value: string;
  position: number;
}> {
  const mentions: Array<{
    type: 'user' | 'role' | 'team';
    value: string;
    position: number;
  }> = [];

  // User mentions: @username
  const userMentionRegex = /@([a-zA-Z0-9_-]+)/g;
  let match;
  while ((match = userMentionRegex.exec(text)) !== null) {
    mentions.push({
      type: 'user',
      value: match[1],
      position: match.index,
    });
  }

  // Role mentions: @role:PM, @role:TechLead
  const roleMentionRegex = /@role:([a-zA-Z]+)/g;
  while ((match = roleMentionRegex.exec(text)) !== null) {
    mentions.push({
      type: 'role',
      value: match[1],
      position: match.index,
    });
  }

  // Team mentions: @team:frontend, @team:backend
  const teamMentionRegex = /@team:([a-zA-Z0-9_-]+)/g;
  while ((match = teamMentionRegex.exec(text)) !== null) {
    mentions.push({
      type: 'team',
      value: match[1],
      position: match.index,
    });
  }

  return mentions;
}

/**
 * Resolve mentions to actual user IDs
 */
export async function resolveMentions(
  mentions: Array<{ type: 'user' | 'role' | 'team'; value: string }>,
  projectId: string
): Promise<string[]> {
  const userIds: string[] = [];

  for (const mention of mentions) {
    switch (mention.type) {
      case 'user':
        // Resolve username to user ID
        const userId = await resolveUsernameToUserId(mention.value);
        if (userId) {
          userIds.push(userId);
        }
        break;

      case 'role':
        // Get all users with this role in the project
        const roleUserIds = await getUsersByRole(projectId, mention.value);
        userIds.push(...roleUserIds);
        break;

      case 'team':
        // Get all users in this team (if teams are implemented)
        const teamUserIds = await getUsersByTeam(mention.value);
        userIds.push(...teamUserIds);
        break;
    }
  }

  // Remove duplicates
  return [...new Set(userIds)];
}

/**
 * Resolve username to user ID
 */
async function resolveUsernameToUserId(username: string): Promise<string | null> {
  try {
    // In a full implementation, this would query a users table
    // For now, return a mock user ID
    return `user_${username}`;
  } catch (error) {
    console.error('Failed to resolve username:', error);
    return null;
  }
}

/**
 * Get users by role in project
 */
async function getUsersByRole(projectId: string, role: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('role_bindings')
      .select('user_id')
      .eq('project_id', projectId)
      .eq('role', role)
      .eq('is_active', true);

    if (error) {
      console.error('Failed to get users by role:', error);
      return [];
    }

    return data.map(item => item.user_id);
  } catch (error) {
    console.error('Failed to get users by role:', error);
    return [];
  }
}

/**
 * Get users by team
 */
async function getUsersByTeam(teamName: string): Promise<string[]> {
  try {
    // Teams are not implemented yet, return empty array
    return [];
  } catch (error) {
    console.error('Failed to get users by team:', error);
    return [];
  }
}

/**
 * Create mentions for a comment
 */
export async function createMentions(
  commentId: string,
  userIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const mentionRecords = userIds.map(userId => ({
      comment_id: commentId,
      user_id: userId,
      mention_type: 'user',
    }));

    const { error } = await supabase
      .from('mentions')
      .insert(mentionRecords);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to create mentions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create mentions',
    };
  }
}

/**
 * Get mentions for a user
 */
export async function getUserMentions(
  userId: string,
  options: {
    isRead?: boolean;
    limit?: number;
    offset?: number;
  } = {}
): Promise<Mention[]> {
  try {
    let query = supabase
      .from('mentions')
      .select(`
        id,
        comment_id,
        user_id,
        mention_type,
        is_read,
        read_at,
        created_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options.isRead !== undefined) {
      query = query.eq('is_read', options.isRead);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data.map(item => ({
      id: item.id,
      commentId: item.comment_id,
      userId: item.user_id,
      mentionType: item.mention_type as 'user' | 'role' | 'team',
      isRead: item.is_read,
      readAt: item.read_at,
      createdAt: item.created_at,
    }));
  } catch (error) {
    console.error('Failed to get user mentions:', error);
    return [];
  }
}

/**
 * Mark mention as read
 */
export async function markMentionAsRead(
  mentionId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('mentions')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', mentionId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to mark mention as read:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark mention as read',
    };
  }
}

/**
 * Subscribe user to entity comments
 */
export async function subscribeToEntity(
  userId: string,
  entityType: string,
  entityId: string,
  subscriptionType: 'auto' | 'manual' | 'mentioned' = 'manual'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('comment_subscriptions')
      .upsert({
        entity_type: entityType,
        entity_id: entityId,
        user_id: userId,
        subscription_type: subscriptionType,
        is_active: true,
      });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to subscribe to entity:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to subscribe',
    };
  }
}

/**
 * Unsubscribe user from entity comments
 */
export async function unsubscribeFromEntity(
  userId: string,
  entityType: string,
  entityId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('comment_subscriptions')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to unsubscribe from entity:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to unsubscribe',
    };
  }
}

/**
 * Get user's subscriptions
 */
export async function getUserSubscriptions(userId: string): Promise<Subscription[]> {
  try {
    const { data, error } = await supabase
      .from('comment_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data.map(item => ({
      id: item.id,
      entityType: item.entity_type,
      entityId: item.entity_id,
      userId: item.user_id,
      subscriptionType: item.subscription_type,
      isActive: item.is_active,
      createdAt: item.created_at,
    }));
  } catch (error) {
    console.error('Failed to get user subscriptions:', error);
    return [];
  }
}

/**
 * Get subscribers for an entity
 */
export async function getEntitySubscribers(
  entityType: string,
  entityId: string
): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('comment_subscriptions')
      .select('user_id')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('is_active', true);

    if (error) {
      throw error;
    }

    return data.map(item => item.user_id);
  } catch (error) {
    console.error('Failed to get entity subscribers:', error);
    return [];
  }
}
