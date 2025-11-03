```typescript
/**
 * @file instagramMessages.ts
 * @description API handler for retrieving Instagram messages from Supabase
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Instagram message interface
 */
interface InstagramMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  message_content: string;
  timestamp: string;
  media_url?: string;
  is_read: boolean;
}

/**
 * Response interface for message retrieval
 */
interface MessageResponse {
  success: boolean;
  data?: InstagramMessage[];
  error?: string;
}

/**
 * Instagram message service class
 */
export class InstagramMessageService {
  private supabase: SupabaseClient;

  /**
   * Initialize Supabase client
   * @param supabaseUrl - Supabase project URL
   * @param supabaseKey - Supabase project API key
   */
  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Retrieve messages for a specific user
   * @param userId - User ID to fetch messages for
   * @param limit - Maximum number of messages to retrieve
   * @param offset - Number of messages to skip
   * @returns Promise containing messages or error
   */
  public async getMessages(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<MessageResponse> {
    try {
      const { data, error } = await this.supabase
        .from('instagram_messages')
        .select('*')
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: data as InstagramMessage[]
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Retrieve unread messages count for a user
   * @param userId - User ID to check unread messages for
   * @returns Promise containing unread count or error
   */
  public async getUnreadCount(userId: string): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const { count, error } = await this.supabase
        .from('instagram_messages')
        .select('*', { count: 'exact' })
        .eq('recipient_id', userId)
        .eq('is_read', false);

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        count: count || 0
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Mark messages as read
   * @param messageIds - Array of message IDs to mark as read
   * @returns Promise indicating success or failure
   */
  public async markAsRead(messageIds: string[]): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('instagram_messages')
        .update({ is_read: true })
        .in('id', messageIds);

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Delete messages
   * @param messageIds - Array of message IDs to delete
   * @param userId - User ID requesting deletion
   * @returns Promise indicating success or failure
   */
  public async deleteMessages(
    messageIds: string[],
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('instagram_messages')
        .delete()
        .in('id', messageIds)
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`);

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export default InstagramMessageService;
```