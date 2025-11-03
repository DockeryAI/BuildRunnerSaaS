```typescript
/**
 * @file createSupabaseProject.ts
 * @description Creates and initializes a new Supabase project with default configuration
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types/database.types';

interface CreateProjectConfig {
  projectName: string;
  organizationId: string;
  dbPassword: string;
  region?: string;
  plan?: 'free' | 'pro' | 'enterprise';
}

interface ProjectResponse {
  projectId: string;
  endpoint: string;
  apiKey: string;
  status: 'created' | 'failed';
}

/**
 * Creates a new Supabase project with specified configuration
 * @param {CreateProjectConfig} config - Project configuration options
 * @returns {Promise<ProjectResponse>} Created project details
 * @throws {Error} If project creation fails
 */
export async function createSupabaseProject(
  config: CreateProjectConfig
): Promise<ProjectResponse> {
  try {
    // Validate required config
    if (!config.projectName || !config.organizationId || !config.dbPassword) {
      throw new Error('Missing required project configuration');
    }

    // Initialize admin client
    const supabaseAdmin = createClient<Database>(
      process.env.SUPABASE_ADMIN_URL!,
      process.env.SUPABASE_ADMIN_KEY!,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true
        }
      }
    );

    // Create project
    const { data: project, error } = await supabaseAdmin.rpc('create_project', {
      name: config.projectName,
      organization_id: config.organizationId,
      db_password: config.dbPassword,
      region: config.region || 'us-east-1',
      plan: config.plan || 'free'
    });

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }

    // Wait for project to be ready
    await waitForProjectReady(supabaseAdmin, project.id);

    // Get project details
    const { data: projectDetails, error: detailsError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', project.id)
      .single();

    if (detailsError) {
      throw new Error(`Failed to get project details: ${detailsError.message}`);
    }

    return {
      projectId: projectDetails.id,
      endpoint: projectDetails.api_endpoint,
      apiKey: projectDetails.api_key,
      status: 'created'
    };

  } catch (error) {
    return {
      projectId: '',
      endpoint: '',
      apiKey: '',
      status: 'failed'
    };
  }
}

/**
 * Waits for a project to be fully provisioned and ready
 * @param {SupabaseClient} client - Supabase admin client
 * @param {string} projectId - ID of project to check
 * @returns {Promise<void>}
 */
async function waitForProjectReady(
  client: SupabaseClient<Database>,
  projectId: string
): Promise<void> {
  const maxAttempts = 30;
  const delayMs = 2000;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const { data: status, error } = await client
      .from('projects')
      .select('status')
      .eq('id', projectId)
      .single();

    if (error) {
      throw new Error(`Failed to check project status: ${error.message}`);
    }

    if (status === 'ACTIVE') {
      return;
    }

    await new Promise(resolve => setTimeout(resolve, delayMs));
    attempts++;
  }

  throw new Error('Project creation timed out');
}

/**
 * Validates project name format
 * @param {string} name - Project name to validate
 * @returns {boolean} Whether name is valid
 */
export function isValidProjectName(name: string): boolean {
  const nameRegex = /^[a-z0-9-]{3,40}$/;
  return nameRegex.test(name);
}

/**
 * Gets available regions for project creation
 * @returns {Promise<string[]>} List of available region codes
 */
export async function getAvailableRegions(): Promise<string[]> {
  try {
    const supabaseAdmin = createClient<Database>(
      process.env.SUPABASE_ADMIN_URL!,
      process.env.SUPABASE_ADMIN_KEY!
    );

    const { data: regions, error } = await supabaseAdmin
      .from('regions')
      .select('code')
      .eq('available', true);

    if (error) {
      throw new Error(`Failed to get regions: ${error.message}`);
    }

    return regions.map(r => r.code);

  } catch (error) {
    return ['us-east-1']; // Default fallback
  }
}
```