```typescript
/**
 * @fileoverview Handles creation of Supabase projects and database setup
 */

import { createClient, SupabaseClient, PostgrestError } from '@supabase/supabase-js';

/**
 * Configuration options for creating a new Supabase project
 */
interface CreateProjectConfig {
  /** Project name */
  name: string;
  /** Database password */
  dbPassword: string;
  /** Region for hosting */
  region?: string;
  /** Organization ID */
  organizationId?: string;
}

/**
 * Response from creating a Supabase project
 */
interface CreateProjectResponse {
  /** Project ID */
  id: string;
  /** Project API URL */
  apiUrl: string;
  /** Project API keys */
  apiKeys: {
    anon: string;
    service_role: string;
  };
  /** Any errors that occurred */
  error?: PostgrestError;
}

/**
 * Creates a new Supabase project with the specified configuration
 * @param config - Project configuration options
 * @returns Project creation response with credentials
 * @throws Error if project creation fails
 */
export async function createSupabaseProject(
  config: CreateProjectConfig
): Promise<CreateProjectResponse> {
  try {
    // Validate required config
    if (!config.name || !config.dbPassword) {
      throw new Error('Project name and database password are required');
    }

    // Initialize management client
    const managementClient = createClient(
      process.env.SUPABASE_MANAGEMENT_API_URL!,
      process.env.SUPABASE_MANAGEMENT_API_KEY!
    );

    // Create project
    const { data, error } = await managementClient
      .from('projects')
      .insert({
        name: config.name,
        db_pass: config.dbPassword,
        region: config.region || 'us-east-1',
        org_id: config.organizationId
      })
      .single();

    if (error) {
      throw error;
    }

    // Format response
    const response: CreateProjectResponse = {
      id: data.id,
      apiUrl: data.api_url,
      apiKeys: {
        anon: data.anon_key,
        service_role: data.service_role_key
      }
    };

    return response;

  } catch (error) {
    const pgError = error as PostgrestError;
    throw new Error(`Failed to create Supabase project: ${pgError.message}`);
  }
}

/**
 * Initializes a Supabase client with the provided credentials
 * @param apiUrl - Project API URL
 * @param apiKey - Project API key
 * @returns Initialized Supabase client
 */
export function initializeClient(apiUrl: string, apiKey: string): SupabaseClient {
  try {
    return createClient(apiUrl, apiKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  } catch (error) {
    throw new Error(`Failed to initialize Supabase client: ${error}`);
  }
}

/**
 * Validates that a Supabase project exists and is accessible
 * @param client - Initialized Supabase client
 * @returns True if project is valid and accessible
 * @throws Error if project validation fails
 */
export async function validateProject(client: SupabaseClient): Promise<boolean> {
  try {
    const { data, error } = await client.from('_schema').select('*').limit(1);
    
    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    const pgError = error as PostgrestError;
    throw new Error(`Failed to validate Supabase project: ${pgError.message}`);
  }
}

/**
 * Deletes a Supabase project
 * @param projectId - ID of project to delete
 * @throws Error if project deletion fails
 */
export async function deleteProject(projectId: string): Promise<void> {
  try {
    const managementClient = createClient(
      process.env.SUPABASE_MANAGEMENT_API_URL!,
      process.env.SUPABASE_MANAGEMENT_API_KEY!
    );

    const { error } = await managementClient
      .from('projects')
      .delete()
      .match({ id: projectId });

    if (error) {
      throw error;
    }
  } catch (error) {
    const pgError = error as PostgrestError;
    throw new Error(`Failed to delete Supabase project: ${pgError.message}`);
  }
}
```