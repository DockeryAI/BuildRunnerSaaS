```typescript
/**
 * @file Supabase client configuration and helper functions
 */

import { createClient, SupabaseClient, User, PostgrestError } from '@supabase/supabase-js';

/**
 * Environment variables for Supabase configuration
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Singleton instance of Supabase client
 */
let supabaseInstance: SupabaseClient | null = null;

/**
 * Custom error class for Supabase-related errors
 */
export class SupabaseError extends Error {
  constructor(message: string, public originalError?: PostgrestError | Error) {
    super(message);
    this.name = 'SupabaseError';
  }
}

/**
 * Initialize and get Supabase client instance
 * @returns Initialized Supabase client
 * @throws {SupabaseError} If initialization fails
 */
export const getSupabaseClient = (): SupabaseClient => {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new SupabaseError('Missing Supabase environment variables');
    }

    if (!supabaseInstance) {
      supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

    return supabaseInstance;
  } catch (error) {
    throw new SupabaseError('Failed to initialize Supabase client', error as Error);
  }
};

/**
 * Get current authenticated user
 * @returns Current user or null if not authenticated
 * @throws {SupabaseError} If fetching user fails
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const supabase = getSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      throw new SupabaseError('Failed to get current user', error);
    }

    return user;
  } catch (error) {
    throw new SupabaseError('Error getting current user', error as Error);
  }
};

/**
 * Sign in with email and password
 * @param email User's email
 * @param password User's password
 * @returns User data
 * @throws {SupabaseError} If sign in fails
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new SupabaseError('Failed to sign in', error);
    }

    return data.user;
  } catch (error) {
    throw new SupabaseError('Error signing in', error as Error);
  }
};

/**
 * Sign up with email and password
 * @param email User's email
 * @param password User's password
 * @returns User data
 * @throws {SupabaseError} If sign up fails
 */
export const signUpWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new SupabaseError('Failed to sign up', error);
    }

    return data.user as User;
  } catch (error) {
    throw new SupabaseError('Error signing up', error as Error);
  }
};

/**
 * Sign out current user
 * @throws {SupabaseError} If sign out fails
 */
export const signOut = async (): Promise<void> => {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new SupabaseError('Failed to sign out', error);
    }
  } catch (error) {
    throw new SupabaseError('Error signing out', error as Error);
  }
};

/**
 * Reset password for user
 * @param email User's email
 * @throws {SupabaseError} If password reset fails
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      throw new SupabaseError('Failed to reset password', error);
    }
  } catch (error) {
    throw new SupabaseError('Error resetting password', error as Error);
  }
};

/**
 * Update user's password
 * @param newPassword New password
 * @throws {SupabaseError} If password update fails
 */
export const updatePassword = async (newPassword: string): Promise<void> => {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new SupabaseError('Failed to update password', error);
    }
  } catch (error) {
    throw new SupabaseError('Error updating password', error as Error);
  }
};

/**
 * Generic database query function
 * @param table Table name
 * @param query Query function
 * @returns Query result
 * @throws {SupabaseError} If query fails
 */
export const executeQuery = async <T>(
  table: string,
  query: (queryBuilder: any) => any
): Promise<T[]> => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await query(supabase.from(table));

    if (error) {
      throw new SupabaseError(`Failed to execute query on ${table}`, error);
    }

    return data as T[];
  } catch (error) {
    throw new SupabaseError(`Error executing query on ${table}`, error as Error);
  }
};

export default {
  getSupabaseClient,
  getCurrentUser,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  resetPassword,
  updatePassword,
  executeQuery,
};
```