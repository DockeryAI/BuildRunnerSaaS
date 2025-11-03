```typescript
/**
 * @fileoverview Supabase client configuration and helper functions
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Configuration interface for Supabase initialization
 */
interface SupabaseConfig {
  supabaseUrl: string;
  supabaseKey: string;
}

/**
 * Custom error class for Supabase-related errors
 */
export class SupabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupabaseError';
  }
}

/**
 * Singleton class to manage Supabase client instance
 */
export class SupabaseService {
  private static instance: SupabaseService;
  private client: SupabaseClient | null = null;

  private constructor() {}

  /**
   * Gets singleton instance of SupabaseService
   * @returns SupabaseService instance
   */
  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  /**
   * Initializes Supabase client with provided configuration
   * @param config - Supabase configuration object
   * @throws {SupabaseError} If initialization fails
   */
  public initialize(config: SupabaseConfig): void {
    try {
      this.client = createClient(config.supabaseUrl, config.supabaseKey);
    } catch (error) {
      throw new SupabaseError(`Failed to initialize Supabase client: ${error}`);
    }
  }

  /**
   * Gets initialized Supabase client instance
   * @returns Supabase client instance
   * @throws {SupabaseError} If client is not initialized
   */
  public getClient(): SupabaseClient {
    if (!this.client) {
      throw new SupabaseError('Supabase client not initialized');
    }
    return this.client;
  }

  /**
   * Performs a database query with error handling
   * @param callback - Async function containing the query
   * @returns Result of the query
   * @throws {SupabaseError} If query fails
   */
  public async query<T>(callback: (client: SupabaseClient) => Promise<T>): Promise<T> {
    try {
      const client = this.getClient();
      const result = await callback(client);
      return result;
    } catch (error) {
      throw new SupabaseError(`Database query failed: ${error}`);
    }
  }

  /**
   * Handles real-time subscriptions
   * @param channel - Channel name to subscribe to
   * @param event - Event to listen for
   * @param callback - Callback function to handle events
   * @returns Cleanup function
   * @throws {SupabaseError} If subscription fails
   */
  public subscribe(
    channel: string,
    event: string,
    callback: (payload: any) => void
  ): () => void {
    try {
      const client = this.getClient();
      const subscription = client
        .channel(channel)
        .on('broadcast', { event }, callback)
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      throw new SupabaseError(`Subscription failed: ${error}`);
    }
  }

  /**
   * Closes Supabase client connection
   * @throws {SupabaseError} If closing fails
   */
  public async close(): Promise<void> {
    try {
      const client = this.getClient();
      await client.auth.signOut();
      this.client = null;
    } catch (error) {
      throw new SupabaseError(`Failed to close Supabase connection: ${error}`);
    }
  }
}

// Export singleton instance
export const supabase = SupabaseService.getInstance();

/**
 * Type guard to check if error is instance of SupabaseError
 * @param error - Error to check
 * @returns Boolean indicating if error is SupabaseError
 */
export function isSupabaseError(error: unknown): error is SupabaseError {
  return error instanceof SupabaseError;
}
```