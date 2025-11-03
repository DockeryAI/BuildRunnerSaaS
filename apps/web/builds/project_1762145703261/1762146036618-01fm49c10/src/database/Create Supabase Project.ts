/**
 * @module CreateSupabaseProject
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DatabaseError } from './types/errors';

/**
 * Configuration interface for Supabase project
 */
interface SupabaseConfig {
  projectUrl: string;
  apiKey: string;
  options?: {
    schema?: string;
    headers?: Record<string, string>;
    autoRefreshToken?: boolean;
    persistSession?: boolean;
    detectSessionInUrl?: boolean;
  };
}

/**
 * Creates and initializes a Supabase client instance
 * @param {SupabaseConfig} config - Configuration object for Supabase
 * @returns {Promise<SupabaseClient>} Initialized Supabase client
 * @throws {DatabaseError} When client initialization fails
 */
export async function createSupabaseProject(
  config: SupabaseConfig
): Promise<SupabaseClient> {
  try {
    const { projectUrl, apiKey, options = {} } = config;

    if (!projectUrl || !apiKey) {
      throw new DatabaseError('Missing required Supabase configuration');
    }

    const client = createClient(projectUrl, apiKey, {
      auth: {
        autoRefreshToken: options.autoRefreshToken ?? true,
        persistSession: options.persistSession ?? true,
        detectSessionInUrl: options.detectSessionInUrl ?? true
      },
      global: {
        headers: options.headers ?? {}
      },
      db: {
        schema: options.schema
      }
    });

    // Verify connection
    const { error } = await client.auth.getSession();
    if (error) {
      throw new DatabaseError(`Failed to initialize Supabase client: ${error.message}`);
    }

    return client;
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError(
      `Unexpected error creating Supabase project: ${(error as Error).message}`
    );
  }
}

/**
 * Validates Supabase configuration object
 * @param {SupabaseConfig} config - Configuration to validate
 * @returns {boolean} True if valid, throws error if invalid
 * @throws {DatabaseError} When configuration is invalid
 */
export function validateSupabaseConfig(config: SupabaseConfig): boolean {
  if (!config) {
    throw new DatabaseError('Supabase configuration is required');
  }

  if (typeof config.projectUrl !== 'string' || !config.projectUrl.startsWith('http')) {
    throw new DatabaseError('Invalid project URL');
  }

  if (typeof config.apiKey !== 'string' || config.apiKey.length < 1) {
    throw new DatabaseError('Invalid API key');
  }

  if (config.options?.schema && typeof config.options.schema !== 'string') {
    throw new DatabaseError('Schema must be a string');
  }

  return true;
}

/**
 * Destroys Supabase client instance and cleans up resources
 * @param {SupabaseClient} client - Supabase client to destroy
 * @returns {Promise<void>}
 */
export async function destroySupabaseClient(client: SupabaseClient): Promise<void> {
  try {
    await client.auth.signOut();
  } catch (error) {
    console.error('Error destroying Supabase client:', error);
  }
}

/**
 * Helper to get database schema name
 * @param {SupabaseClient} client - Supabase client instance
 * @returns {string | null} Current schema name or null
 */
export function getCurrentSchema(client: SupabaseClient): string | null {
  try {
    return client.auth.session()?.user?.app_metadata?.schema || null;
  } catch {
    return null;
  }
}

/**
 * Health check for Supabase connection
 * @param {SupabaseClient} client - Supabase client to check
 * @returns {Promise<boolean>} True if healthy, false if not
 */
export async function checkSupabaseHealth(client: SupabaseClient): Promise<boolean> {
  try {
    const { error } = await client.auth.getSession();
    return !error;
  } catch {
    return false;
  }
}