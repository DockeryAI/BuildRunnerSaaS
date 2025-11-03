```typescript
/**
 * @file instagramMessage.ts
 * @description Handles Instagram message retrieval and processing
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { InstagramMessage, ProcessedMessage } from '../types';

/**
 * Configuration interface for Instagram API
 */
interface InstagramConfig {
  accessToken: string;
  apiVersion: string;
  pageId: string;
}

/**
 * Class to handle Instagram message operations
 */
export class InstagramMessageService {
  private supabase: SupabaseClient;
  private config: InstagramConfig;

  /**
   * Creates an instance of InstagramMessageService
   * @param supabaseUrl - Supabase project URL
   * @param supabaseKey - Supabase project API key
   * @param config - Instagram API configuration
   */
  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    config: InstagramConfig
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.config = config;
  }

  /**
   * Retrieves messages from Instagram API
   * @returns Promise containing array of Instagram messages
   * @throws Error if API request fails
   */
  public async getMessages(): Promise<InstagramMessage[]> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v${this.config.apiVersion}/${this.config.pageId}/conversations`,
        {
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }

      const data = await response.json();
      return this.processMessages(data.data);
    } catch (error) {
      console.error('Error retrieving Instagram messages:', error);
      throw error;
    }
  }

  /**
   * Processes raw Instagram messages into standardized format
   * @param messages - Raw messages from Instagram API
   * @returns Array of processed messages
   */
  private processMessages(messages: any[]): ProcessedMessage[] {
    return messages.map((message) => ({
      id: message.id,
      senderId: message.from.id,
      recipientId: message.to.id,
      content: message.message,
      timestamp: new Date(message.created_time),
      platform: 'instagram',
    }));
  }

  /**
   * Stores messages in Supabase database
   * @param messages - Processed messages to store
   * @throws Error if database operation fails
   */
  public async storeMessages(messages: ProcessedMessage[]): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('messages')
        .upsert(messages, { onConflict: 'id' });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error storing messages in Supabase:', error);
      throw error;
    }
  }

  /**
   * Retrieves and stores new Instagram messages
   * @returns Promise that resolves when operation is complete
   */
  public async syncMessages(): Promise<void> {
    try {
      const messages = await this.getMessages();
      await this.storeMessages(messages);
    } catch (error) {
      console.error('Error syncing Instagram messages:', error);
      throw error;
    }
  }

  /**
   * Retrieves messages for a specific user
   * @param userId - Instagram user ID
   * @returns Promise containing array of user messages
   */
  public async getUserMessages(userId: string): Promise<ProcessedMessage[]> {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .select('*')
        .or(`senderId.eq.${userId},recipientId.eq.${userId}`)
        .order('timestamp', { ascending: false });

      if (error) {
        throw error;
      }

      return data as ProcessedMessage[];
    } catch (error) {
      console.error('Error retrieving user messages:', error);
      throw error;
    }
  }
}

/**
 * Type definitions for message data
 */
export type {
  InstagramMessage,
  ProcessedMessage,
};
```