import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface Notification {
  id: string;
  userId: string;
  type: 'comment' | 'mention' | 'promotion' | 'role_change' | 'project_invite' | 'system';
  title: string;
  body?: string;
  link?: string;
  entityType?: string;
  entityId?: string;
  actorId?: string;
  isRead: boolean;
  readAt?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  metadata: Record<string, any>;
  createdAt: string;
}

export interface NotificationOptions {
  type: Notification['type'];
  title: string;
  body?: string;
  link?: string;
  entityType?: string;
  entityId?: string;
  actorId?: string;
  priority?: Notification['priority'];
  metadata?: Record<string, any>;
  sendEmail?: boolean;
  sendWebhook?: boolean;
}

/**
 * Notification Service
 */
export class NotificationService {
  /**
   * Create a notification for a user
   */
  static async createNotification(
    userId: string,
    options: NotificationOptions
  ): Promise<{ success: boolean; notification?: Notification; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          type: options.type,
          title: options.title,
          body: options.body,
          link: options.link,
          entity_type: options.entityType,
          entity_id: options.entityId,
          actor_id: options.actorId,
          priority: options.priority || 'normal',
          metadata: options.metadata || {},
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      const notification: Notification = {
        id: data.id,
        userId: data.user_id,
        type: data.type,
        title: data.title,
        body: data.body,
        link: data.link,
        entityType: data.entity_type,
        entityId: data.entity_id,
        actorId: data.actor_id,
        isRead: data.is_read,
        readAt: data.read_at,
        priority: data.priority,
        metadata: data.metadata,
        createdAt: data.created_at,
      };

      // Send email if requested
      if (options.sendEmail) {
        await this.sendEmailNotification(userId, notification);
      }

      // Send webhook if requested
      if (options.sendWebhook && options.entityType) {
        await this.sendWebhookNotification(userId, notification);
      }

      return { success: true, notification };
    } catch (error) {
      console.error('Failed to create notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create notification',
      };
    }
  }

  /**
   * Get notifications for a user
   */
  static async getUserNotifications(
    userId: string,
    options: {
      isRead?: boolean;
      type?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Notification[]> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (options.isRead !== undefined) {
        query = query.eq('is_read', options.isRead);
      }

      if (options.type) {
        query = query.eq('type', options.type);
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
        userId: item.user_id,
        type: item.type,
        title: item.title,
        body: item.body,
        link: item.link,
        entityType: item.entity_type,
        entityId: item.entity_id,
        actorId: item.actor_id,
        isRead: item.is_read,
        readAt: item.read_at,
        priority: item.priority,
        metadata: item.metadata,
        createdAt: item.created_at,
      }));
    } catch (error) {
      console.error('Failed to get user notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark as read',
      };
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark all as read',
      };
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  /**
   * Send email notification (stub)
   */
  private static async sendEmailNotification(
    userId: string,
    notification: Notification
  ): Promise<void> {
    try {
      // In production, this would integrate with an email service
      // For now, just log the email that would be sent
      console.log(`[EMAIL] Sending notification to user ${userId}:`, {
        subject: notification.title,
        body: notification.body,
        link: notification.link,
      });

      // Simulate email sending
      if (process.env.EMAIL_ENABLED === 'true') {
        // Would integrate with SendGrid, AWS SES, etc.
      }
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  /**
   * Send webhook notification
   */
  private static async sendWebhookNotification(
    userId: string,
    notification: Notification
  ): Promise<void> {
    try {
      // Get project integrations if this is a project-related notification
      if (notification.entityType && notification.entityId) {
        const projectId = await this.getProjectIdFromEntity(
          notification.entityType,
          notification.entityId
        );

        if (projectId) {
          const { data: integration } = await supabase
            .from('project_integrations')
            .select('slack_webhook, discord_webhook, webhook_events')
            .eq('project_id', projectId)
            .eq('is_active', true)
            .single();

          if (integration) {
            // Send Slack webhook
            if (integration.slack_webhook && integration.webhook_events.includes(notification.type)) {
              await this.sendSlackWebhook(integration.slack_webhook, notification);
            }

            // Send Discord webhook
            if (integration.discord_webhook && integration.webhook_events.includes(notification.type)) {
              await this.sendDiscordWebhook(integration.discord_webhook, notification);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to send webhook notification:', error);
    }
  }

  /**
   * Send Slack webhook
   */
  private static async sendSlackWebhook(webhookUrl: string, notification: Notification): Promise<void> {
    try {
      const payload = {
        text: notification.title,
        attachments: [
          {
            color: this.getSlackColor(notification.priority),
            fields: [
              {
                title: 'Type',
                value: notification.type,
                short: true,
              },
              {
                title: 'Priority',
                value: notification.priority,
                short: true,
              },
            ],
            text: notification.body,
            footer: 'BuildRunner',
            ts: Math.floor(new Date(notification.createdAt).getTime() / 1000),
          },
        ],
      };

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Failed to send Slack webhook:', error);
    }
  }

  /**
   * Send Discord webhook
   */
  private static async sendDiscordWebhook(webhookUrl: string, notification: Notification): Promise<void> {
    try {
      const payload = {
        content: notification.title,
        embeds: [
          {
            title: notification.title,
            description: notification.body,
            color: this.getDiscordColor(notification.priority),
            fields: [
              {
                name: 'Type',
                value: notification.type,
                inline: true,
              },
              {
                name: 'Priority',
                value: notification.priority,
                inline: true,
              },
            ],
            timestamp: notification.createdAt,
            footer: {
              text: 'BuildRunner',
            },
          },
        ],
      };

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Failed to send Discord webhook:', error);
    }
  }

  /**
   * Get Slack color for priority
   */
  private static getSlackColor(priority: string): string {
    switch (priority) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'normal': return 'good';
      case 'low': return '#36a64f';
      default: return 'good';
    }
  }

  /**
   * Get Discord color for priority
   */
  private static getDiscordColor(priority: string): number {
    switch (priority) {
      case 'urgent': return 0xff0000; // Red
      case 'high': return 0xff9900; // Orange
      case 'normal': return 0x0099ff; // Blue
      case 'low': return 0x00ff00; // Green
      default: return 0x0099ff;
    }
  }

  /**
   * Get project ID from entity
   */
  private static async getProjectIdFromEntity(entityType: string, entityId: string): Promise<string | null> {
    try {
      // This would need to be implemented based on how entities are structured
      // For now, return null
      return null;
    } catch (error) {
      console.error('Failed to get project ID from entity:', error);
      return null;
    }
  }
}
