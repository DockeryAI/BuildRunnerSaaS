```typescript
/**
 * @file Supabase client configuration and helper methods
 */

import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { Database } from './types/supabase';

/**
 * Configuration options for Supabase client
 */
interface SupabaseConfig {
  supabaseUrl: string;
  supabaseKey: string;
}

/**
 * Class for managing Supabase interactions
 */
export class SupabaseService {
  private client: SupabaseClient<Database>;
  private static instance: SupabaseService;

  private constructor(config: SupabaseConfig) {
    this.client = createClient<Database>(config.supabaseUrl, config.supabaseKey);
  }

  /**
   * Get singleton instance of SupabaseService
   * @param config - Supabase configuration options
   * @returns SupabaseService instance
   */
  public static getInstance(config: SupabaseConfig): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService(config);
    }
    return SupabaseService.instance;
  }

  /**
   * Get the Supabase client instance
   * @returns Supabase client
   */
  public getClient(): SupabaseClient<Database> {
    return this.client;
  }

  /**
   * Sign up a new user
   * @param email - User's email
   * @param password - User's password
   * @returns Result of sign up operation
   */
  public async signUp(email: string, password: string): Promise<{user: User | null; error: Error | null}> {
    try {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  /**
   * Sign in existing user
   * @param email - User's email
   * @param password - User's password
   * @returns Result of sign in operation
   */
  public async signIn(email: string, password: string): Promise<{user: User | null; error: Error | null}> {
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  /**
   * Sign out current user
   * @returns Result of sign out operation
   */
  public async signOut(): Promise<{error: Error | null}> {
    try {
      const { error } = await this.client.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Get current authenticated user
   * @returns Current user or null if not authenticated
   */
  public async getCurrentUser(): Promise<{user: User | null; error: Error | null}> {
    try {
      const { data: { user }, error } = await this.client.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  /**
   * Generic database query method
   * @param table - Table name to query
   * @param query - Query options
   * @returns Query result
   */
  public async query<T>(
    table: keyof Database['public']['Tables'], 
    query: {
      select?: string;
      eq?: Record<string, unknown>;
      limit?: number;
    }
  ): Promise<{data: T[] | null; error: Error | null}> {
    try {
      let queryBuilder = this.client
        .from(table)
        .select(query.select || '*');

      if (query.eq) {
        Object.entries(query.eq).forEach(([key, value]) => {
          queryBuilder = queryBuilder.eq(key, value);
        });
      }

      if (query.limit) {
        queryBuilder = queryBuilder.limit(query.limit);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;

      return { data: data as T[], error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Insert data into a table
   * @param table - Table name
   * @param data - Data to insert
   * @returns Insert result
   */
  public async insert<T>(
    table: keyof Database['public']['Tables'],
    data: Record<string, unknown>
  ): Promise<{data: T | null; error: Error | null}> {
    try {
      const { data: result, error } = await this.client
        .from(table)
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      return { data: result as T, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Update data in a table
   * @param table - Table name
   * @param match - Match conditions
   * @param data - Data to update
   * @returns Update result
   */
  public async update<T>(
    table: keyof Database['public']['Tables'],
    match: Record<string, unknown>,
    data: Record<string, unknown>
  ): Promise<{data: T | null; error: Error | null}> {
    try {
      const { data: result, error } = await this.client
        .from(table)
        .update(data)
        .match(match)
        .select()
        .single();

      if (error) throw error;

      return { data: result as T, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Delete data from a table
   * @param table - Table name
   * @param match - Match conditions
   * @returns Delete result
   */
  public async delete(
    table: keyof Database['public']['Tables'],
    match: Record<string, unknown>
  ): Promise<{error: Error | null}> {
    try {
      const { error } = await this.client
        .from(table)
        .delete()
        .match(match);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }
}
```