```typescript
/**
 * @file Supabase client configuration and helper methods
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types/supabase';

/**
 * Environment variables for Supabase configuration
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Singleton instance of Supabase client
 */
let supabaseInstance: SupabaseClient<Database> | null = null;

/**
 * Creates and returns a Supabase client instance
 * @returns Supabase client instance
 */
export const getSupabaseClient = (): SupabaseClient<Database> => {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }
  return supabaseInstance;
};

/**
 * Generic error handler for Supabase operations
 * @param error Error object from Supabase operation
 * @throws Error with formatted message
 */
export const handleSupabaseError = (error: Error): never => {
  console.error('Supabase operation failed:', error);
  throw new Error(`Database operation failed: ${error.message}`);
};

/**
 * Type guard to check if an error is from Supabase
 * @param error Error object to check
 * @returns Boolean indicating if error is from Supabase
 */
export const isSupabaseError = (error: unknown): error is Error => {
  return error instanceof Error && 'code' in error;
};

/**
 * Wraps a Supabase operation in error handling
 * @param operation Async operation to perform
 * @returns Result of the operation
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (isSupabaseError(error)) {
      handleSupabaseError(error);
    }
    throw error;
  }
}

/**
 * Terminates Supabase client connection
 */
export const closeSupabaseConnection = async (): Promise<void> => {
  if (supabaseInstance) {
    await supabaseInstance.auth.signOut();
    supabaseInstance = null;
  }
};

/**
 * Utility type for Supabase query filters
 */
export type QueryFilters<T> = {
  [K in keyof T]?: T[K] | T[K][];
};

/**
 * Helper function to build Supabase query filters
 * @param query Initial query
 * @param filters Object containing filter conditions
 * @returns Modified query with filters applied
 */
export const applyQueryFilters = <T>(
  query: any,
  filters?: QueryFilters<T>
): any => {
  if (!filters) return query;

  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      query = query.in(key, value);
    } else if (value !== undefined) {
      query = query.eq(key, value);
    }
  });

  return query;
};

export default getSupabaseClient();
```