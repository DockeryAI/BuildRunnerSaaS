import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Configuration interface for Supabase client
 */
interface SupabaseConfig {
  supabaseUrl: string;
  supabaseKey: string;
}

/**
 * Error types for Supabase operations
 */
export enum SupabaseErrorType {
  AUTH_ERROR = 'AUTH_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Custom error class for Supabase operations
 */
export class SupabaseError extends Error {
  type: SupabaseErrorType;
  
  constructor(message: string, type: SupabaseErrorType) {
    super(message);
    this.type = type;
    this.name = 'SupabaseError';
  }
}

/**
 * Supabase service class for handling database operations
 */
export class SupabaseService {
  private client: SupabaseClient;
  
  /**
   * Initialize Supabase client with configuration
   */
  constructor(config: SupabaseConfig) {
    try {
      this.client = createClient(config.supabaseUrl, config.supabaseKey);
    } catch (error) {
      throw new SupabaseError(
        'Failed to initialize Supabase client',
        SupabaseErrorType.UNKNOWN_ERROR
      );
    }
  }

  /**
   * Get the Supabase client instance
   */
  public getClient(): SupabaseClient {
    return this.client;
  }

  /**
   * Generic fetch data method with error handling
   */
  public async fetchData<T>(
    table: string,
    query?: Record<string, any>
  ): Promise<T[]> {
    try {
      let builder = this.client.from(table).select();

      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          builder = builder.eq(key, value);
        });
      }

      const { data, error } = await builder;

      if (error) {
        throw new SupabaseError(
          error.message,
          SupabaseErrorType.DATABASE_ERROR
        );
      }

      return data as T[];
    } catch (error) {
      if (error instanceof SupabaseError) {
        throw error;
      }
      throw new SupabaseError(
        'Failed to fetch data',
        SupabaseErrorType.NETWORK_ERROR
      );
    }
  }

  /**
   * Generic insert method with error handling
   */
  public async insert<T>(
    table: string,
    data: Partial<T>
  ): Promise<T> {
    try {
      const { data: insertedData, error } = await this.client
        .from(table)
        .insert(data)
        .single();

      if (error) {
        throw new SupabaseError(
          error.message,
          SupabaseErrorType.DATABASE_ERROR
        );
      }

      return insertedData as T;
    } catch (error) {
      if (error instanceof SupabaseError) {
        throw error;
      }
      throw new SupabaseError(
        'Failed to insert data',
        SupabaseErrorType.DATABASE_ERROR
      );
    }
  }

  /**
   * Generic update method with error handling
   */
  public async update<T>(
    table: string,
    match: Record<string, any>,
    data: Partial<T>
  ): Promise<T> {
    try {
      const { data: updatedData, error } = await this.client
        .from(table)
        .update(data)
        .match(match)
        .single();

      if (error) {
        throw new SupabaseError(
          error.message,
          SupabaseErrorType.DATABASE_ERROR
        );
      }

      return updatedData as T;
    } catch (error) {
      if (error instanceof SupabaseError) {
        throw error;
      }
      throw new SupabaseError(
        'Failed to update data',
        SupabaseErrorType.DATABASE_ERROR
      );
    }
  }

  /**
   * Generic delete method with error handling
   */
  public async delete(
    table: string,
    match: Record<string, any>
  ): Promise<void> {
    try {
      const { error } = await this.client
        .from(table)
        .delete()
        .match(match);

      if (error) {
        throw new SupabaseError(
          error.message,
          SupabaseErrorType.DATABASE_ERROR
        );
      }
    } catch (error) {
      if (error instanceof SupabaseError) {
        throw error;
      }
      throw new SupabaseError(
        'Failed to delete data',
        SupabaseErrorType.DATABASE_ERROR
      );
    }
  }

  /**
   * Sign in user with email and password
   */
  public async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new SupabaseError(
          error.message,
          SupabaseErrorType.AUTH_ERROR
        );
      }

      return data;
    } catch (error) {
      if (error instanceof SupabaseError) {
        throw error;
      }
      throw new SupabaseError(
        'Failed to sign in',
        SupabaseErrorType.AUTH_ERROR
      );
    }
  }

  /**
   * Sign out current user
   */
  public async signOut() {
    try {
      const { error } = await this.client.auth.signOut();

      if (error) {
        throw new SupabaseError(
          error.message,
          SupabaseErrorType.AUTH_ERROR
        );
      }
    } catch (error) {
      if (error instanceof SupabaseError) {
        throw error;
      }
      throw new SupabaseError(
        'Failed to sign out',
        SupabaseErrorType.AUTH_ERROR
      );
    }
  }
}

export default SupabaseService;