```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { InstagramMessage } from '../types/instagram.types';

/**
 * Configuration interface for Instagram message retrieval
 */
interface InstagramConfig {
  supabaseUrl: string;
  supabaseKey: string;
  tableName: string;
}

/**
 * Class to handle Instagram message retrieval operations
 */
export class InstagramMessageRetrieval {
  private supabase: SupabaseClient;
  private tableName: string;

  /**
   * Creates an instance of InstagramMessageRetrieval
   * @param config - Configuration object containing Supabase credentials and table name
   */
  constructor(config: InstagramConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    this.tableName = config.tableName;
  }

  /**
   * Retrieves messages for a specific conversation
   * @param conversationId - ID of the conversation to retrieve messages from
   * @returns Promise containing array of Instagram messages
   * @throws Error if retrieval fails
   */
  public async getMessagesByConversation(conversationId: string): Promise<InstagramMessage[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: false });

      if (error) {
        throw new Error(`Failed to retrieve messages: ${error.message}`);
      }

      return data as InstagramMessage[];
    } catch (error) {
      throw new Error(`Message retrieval error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieves messages by user ID
   * @param userId - ID of the user whose messages to retrieve
   * @returns Promise containing array of Instagram messages
   * @throws Error if retrieval fails
   */
  public async getMessagesByUser(userId: string): Promise<InstagramMessage[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) {
        throw new Error(`Failed to retrieve messages: ${error.message}`);
      }

      return data as InstagramMessage[];
    } catch (error) {
      throw new Error(`Message retrieval error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieves messages within a specific date range
   * @param startDate - Start date for message retrieval
   * @param endDate - End date for message retrieval
   * @returns Promise containing array of Instagram messages
   * @throws Error if retrieval fails
   */
  public async getMessagesByDateRange(startDate: Date, endDate: Date): Promise<InstagramMessage[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .order('timestamp', { ascending: false });

      if (error) {
        throw new Error(`Failed to retrieve messages: ${error.message}`);
      }

      return data as InstagramMessage[];
    } catch (error) {
      throw new Error(`Message retrieval error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieves a single message by its ID
   * @param messageId - ID of the message to retrieve
   * @returns Promise containing the Instagram message
   * @throws Error if retrieval fails
   */
  public async getMessageById(messageId: string): Promise<InstagramMessage | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', messageId)
        .single();

      if (error) {
        throw new Error(`Failed to retrieve message: ${error.message}`);
      }

      return data as InstagramMessage;
    } catch (error) {
      throw new Error(`Message retrieval error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieves the latest messages up to a specified limit
   * @param limit - Maximum number of messages to retrieve
   * @returns Promise containing array of Instagram messages
   * @throws Error if retrieval fails
   */
  public async getLatestMessages(limit: number = 10): Promise<InstagramMessage[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to retrieve messages: ${error.message}`);
      }

      return data as InstagramMessage[];
    } catch (error) {
      throw new Error(`Message retrieval error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
```