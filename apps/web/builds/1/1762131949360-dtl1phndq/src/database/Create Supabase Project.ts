```typescript
/**
 * @module CreateSupabaseProject
 * @description Creates and configures a new Supabase project programmatically
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface CreateProjectConfig {
  name: string;
  dbPassword: string;
  region?: string;
  pricingTier?: 'free' | 'pro' | 'enterprise';
  organization?: string;
}

interface ProjectResponse {
  id: string;
  name: string;
  region: string;
  createdAt: string;
  status: 'ACTIVE' | 'CREATING' | 'FAILED';
  connectionString?: string;
}

/**
 * Creates a new Supabase project with the specified configuration
 * @param {CreateProjectConfig} config - Project configuration options
 * @returns {Promise<ProjectResponse>} Created project details
 * @throws {Error} If project creation fails
 */
export async function createSupabaseProject(
  config: CreateProjectConfig
): Promise<ProjectResponse> {
  try {
    // Validate required config
    if (!config.name || !config.dbPassword) {
      throw new Error('Project name and database password are required');
    }

    // Initialize Supabase management client
    const managementClient = createClient(
      process.env.SUPABASE_MANAGEMENT_URL as string,
      process.env.SUPABASE_MANAGEMENT_KEY as string,
      {
        auth: {
          persistSession: false
        }
      }
    );

    // Project creation payload
    const projectPayload = {
      name: config.name,
      db_pass: config.dbPassword,
      region: config.region || 'us-east-1',
      pricing_tier: config.pricingTier || 'free',
      organization_id: config.organization
    };

    // Create project
    const { data: project, error } = await managementClient
      .from('projects')
      .insert(projectPayload)
      .single();

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }

    // Wait for project to be ready
    const projectDetails = await waitForProjectCreation(
      managementClient,
      project.id
    );

    return {
      id: projectDetails.id,
      name: projectDetails.name,
      region: projectDetails.region,
      createdAt: projectDetails.created_at,
      status: projectDetails.status,
      connectionString: projectDetails.connection_string
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Project creation failed: ${errorMessage}`);
  }
}

/**
 * Waits for project creation to complete
 * @param {SupabaseClient} client - Supabase management client
 * @param {string} projectId - ID of project being created
 * @returns {Promise<any>} Project details once creation is complete
 */
async function waitForProjectCreation(
  client: SupabaseClient,
  projectId: string,
  maxAttempts = 30
): Promise<any> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const { data: project, error } = await client
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) {
      throw new Error(`Failed to check project status: ${error.message}`);
    }

    if (project.status === 'ACTIVE') {
      return project;
    }

    if (project.status === 'FAILED') {
      throw new Error('Project creation failed');
    }

    // Wait 2 seconds before checking again
    await new Promise(resolve => setTimeout(resolve, 2000));
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
  const nameRegex = /^[a-z0-9-]{3,48}$/;
  return nameRegex.test(name);
}

/**
 * Validates database password requirements
 * @param {string} password - Database password to validate
 * @returns {boolean} Whether password meets requirements
 */
export function isValidDatabasePassword(password: string): boolean {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegex.test(password);
}
```