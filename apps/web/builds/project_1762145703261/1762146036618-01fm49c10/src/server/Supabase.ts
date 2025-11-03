/**
 * @fileoverview Supabase client configuration and helper functions
 */

import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

/**
 * Configuration interface for Supabase
 */
interface SupabaseConfig {
  supabaseUrl: string;
  supabaseKey: string;
}

/**
 * Generic database response type
 */
type DbResult<T> = {
  data: T | null;
  error: Error | null;
};

/**
 * Supabase service class for handling database operations
 */
export class SupabaseService {
  private client: SupabaseClient;
  private static instance: SupabaseService;

  private constructor(config: SupabaseConfig) {
    this.client = createClient(config.supabaseUrl, config.supabaseKey);
  }

  /**
   * Gets singleton instance of SupabaseService
   */
  public static getInstance(config: SupabaseConfig): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService(config);
    }
    return SupabaseService.instance;
  }

  /**
   * Gets the current authenticated user
   * @returns Current user or null if not authenticated
   */
  public async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await this.client.auth.getUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Performs a database query with error handling
   * @param queryFn Query function to execute
   * @returns Database result with data or error
   */
  public async query<T>(queryFn: () => Promise<{ data: T; error: any }>): Promise<DbResult<T>> {
    try {
      const { data, error } = await queryFn();
      
      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Database query error:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Inserts data into a table
   * @param table Table name
   * @param data Data to insert
   * @returns Inserted data or error
   */
  public async insert<T>(table: string, data: Partial<T>): Promise<DbResult<T>> {
    return this.query<T>(() => 
      this.client.from(table).insert(data).single()
    );
  }

  /**
   * Updates data in a table
   * @param table Table name
   * @param data Update data
   * @param match Match conditions
   * @returns Updated data or error
   */
  public async update<T>(
    table: string, 
    data: Partial<T>, 
    match: Record<string, any>
  ): Promise<DbResult<T>> {
    return this.query<T>(() =>
      this.client.from(table).update(data).match(match).single()
    );
  }

  /**
   * Deletes data from a table
   * @param table Table name
   * @param match Match conditions
   * @returns Deleted data or error
   */
  public async delete<T>(
    table: string,
    match: Record<string, any>
  ): Promise<DbResult<T>> {
    return this.query<T>(() =>
      this.client.from(table).delete().match(match).single()
    );
  }

  /**
   * Selects data from a table
   * @param table Table name
   * @param query Query options
   * @returns Selected data or error
   */
  public async select<T>(
    table: string,
    query?: {
      columns?: string;
      where?: Record<string, any>;
      limit?: number;
      order?: { column: string; ascending?: boolean };
    }
  ): Promise<DbResult<T[]>> {
    return this.query<T[]>(() => {
      let queryBuilder = this.client.from(table).select(query?.columns || '*');

      if (query?.where) {
        queryBuilder = queryBuilder.match(query.where);
      }

      if (query?.limit) {
        queryBuilder = queryBuilder.limit(query.limit);
      }

      if (query?.order) {
        queryBuilder = queryBuilder.order(
          query.order.column,
          { ascending: query.order.ascending ?? true }
        );
      }

      return queryBuilder;
    });
  }

  /**
   * Signs up a new user
   * @param email User email
   * @param password User password
   * @returns User data or error
   */
  public async signUp(
    email: string,
    password: string
  ): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { user: null, error: error as Error };
    }
  }

  /**
   * Signs in a user
   * @param email User email
   * @param password User password
   * @returns User data or error
   */
  public async signIn(
    email: string,
    password: string
  ): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { user: null, error: error as Error };
    }
  }

  /**
   * Signs out the current user
   * @returns void or error
   */
  public async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client.auth.signOut();
      
      if (error) {
        throw error;
      }

      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: error as Error };
    }
  }
}