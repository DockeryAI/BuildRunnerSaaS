```typescript
/**
 * @fileoverview Supabase client configuration and helper methods
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types/supabase';

/**
 * Configuration options for Supabase client
 */
interface SupabaseConfig {
  supabaseUrl: string;
  supabaseKey: string;
  options?: {
    auth?: {
      autoRefreshToken?: boolean;
      persistSession?: boolean;
    };
    db?: {
      schema?: string;
    };
  };
}

/**
 * Error class for Supabase-specific errors
 */
export class SupabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupabaseError';
  }
}

/**
 * Manages Supabase client instance and operations
 */
export class SupabaseService {
  private static instance: SupabaseService;
  private client: SupabaseClient<Database>;

  private constructor(config: SupabaseConfig) {
    try {
      this.client = createClient<Database>(
        config.supabaseUrl,
        config.supabaseKey,
        config.options
      );
    } catch (error) {
      throw new SupabaseError(`Failed to initialize Supabase client: ${error}`);
    }
  }

  /**
   * Gets singleton instance of SupabaseService
   * @param config - Configuration options for Supabase
   * @returns SupabaseService instance
   */
  public static getInstance(config: SupabaseConfig): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService(config);
    }
    return SupabaseService.instance;
  }

  /**
   * Gets the Supabase client instance
   * @returns Supabase client
   */
  public getClient(): SupabaseClient<Database> {
    return this.client;
  }

  /**
   * Generic query executor with error handling
   * @param operation - Async operation to execute
   * @returns Result of the operation
   * @throws SupabaseError
   */
  private async executeQuery<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      throw new SupabaseError(`Query execution failed: ${error}`);
    }
  }

  /**
   * Fetches data from a table
   * @param table - Table name
   * @param query - Query options
   * @returns Query result
   */
  public async select<T>(
    table: keyof Database['public']['Tables'],
    query: {
      columns?: string;
      filter?: Record<string, unknown>;
      range?: [number, number];
    }
  ): Promise<T[]> {
    return this.executeQuery(async () => {
      let queryBuilder = this.client.from(table).select(query.columns || '*');

      if (query.filter) {
        queryBuilder = queryBuilder.match(query.filter);
      }

      if (query.range) {
        queryBuilder = queryBuilder.range(query.range[0], query.range[1]);
      }

      const { data, error } = await queryBuilder;

      if (error) {
        throw new SupabaseError(`Select query failed: ${error.message}`);
      }

      return data as T[];
    });
  }

  /**
   * Inserts data into a table
   * @param table - Table name
   * @param data - Data to insert
   * @returns Inserted data
   */
  public async insert<T>(
    table: keyof Database['public']['Tables'],
    data: Partial<T>
  ): Promise<T> {
    return this.executeQuery(async () => {
      const { data: result, error } = await this.client
        .from(table)
        .insert(data)
        .single();

      if (error) {
        throw new SupabaseError(`Insert operation failed: ${error.message}`);
      }

      return result as T;
    });
  }

  /**
   * Updates data in a table
   * @param table - Table name
   * @param data - Update data
   * @param filter - Filter conditions
   * @returns Updated data
   */
  public async update<T>(
    table: keyof Database['public']['Tables'],
    data: Partial<T>,
    filter: Record<string, unknown>
  ): Promise<T[]> {
    return this.executeQuery(async () => {
      const { data: result, error } = await this.client
        .from(table)
        .update(data)
        .match(filter);

      if (error) {
        throw new SupabaseError(`Update operation failed: ${error.message}`);
      }

      return result as T[];
    });
  }

  /**
   * Deletes data from a table
   * @param table - Table name
   * @param filter - Filter conditions
   * @returns Deleted data
   */
  public async delete<T>(
    table: keyof Database['public']['Tables'],
    filter: Record<string, unknown>
  ): Promise<T[]> {
    return this.executeQuery(async () => {
      const { data: result, error } = await this.client
        .from(table)
        .delete()
        .match(filter);

      if (error) {
        throw new SupabaseError(`Delete operation failed: ${error.message}`);
      }

      return result as T[];
    });
  }

  /**
   * Executes a real-time subscription
   * @param table - Table name
   * @param callback - Callback function for subscription events
   * @returns Subscription cleanup function
   */
  public subscribe<T>(
    table: keyof Database['public']['Tables'],
    callback: (payload: T) => void
  ): () => void {
    const subscription = this.client
      .from(table)
      .on('*', (payload) => {
        callback(payload.new as T);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}

export default SupabaseService;
```