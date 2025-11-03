```typescript
/**
 * @module CreateSupabaseProject
 * @description Handles creation and configuration of a new Supabase project
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Configuration options for creating a new Supabase project
 */
interface CreateProjectConfig {
  /** Project name */
  name: string;
  /** Database password */
  dbPassword: string;
  /** Region for project hosting */
  region?: string;
  /** Pricing tier */
  pricingTier?: 'free' | 'pro' | 'enterprise';
  /** Organization ID */
  organizationId?: string;
}

/**
 * Response from project creation
 */
interface CreateProjectResponse {
  /** Project ID */
  projectId: string;
  /** Project API URL */
  apiUrl: string;
  /** Project API key */
  apiKey: string;
  /** Project status */
  status: 'created' | 'failed';
  /** Error message if creation failed */
  error?: string;
}

/**
 * Creates a new Supabase project with the specified configuration
 * @param config - Project configuration options
 * @returns Project creation response
 * @throws Error if project creation fails
 */
export async function createSupabaseProject(
  config: CreateProjectConfig
): Promise<CreateProjectResponse> {
  try {
    // Validate required fields
    if (!config.name || !config.dbPassword) {
      throw new Error('Project name and database password are required');
    }

    // Generate project ID
    const projectId = uuidv4();

    // Default configuration values
    const projectConfig = {
      name: config.name,
      dbPassword: config.dbPassword,
      region: config.region || 'us-east-1',
      pricingTier: config.pricingTier || 'free',
      organizationId: config.organizationId
    };

    // Initialize Supabase management client
    const managementClient = createClient(
      process.env.SUPABASE_MANAGEMENT_API_URL!,
      process.env.SUPABASE_MANAGEMENT_API_KEY!
    );

    // Create project
    const { data, error } = await managementClient.rpc('create_project', {
      project_id: projectId,
      ...projectConfig
    });

    if (error) {
      throw error;
    }

    // Wait for project to be ready
    await waitForProjectReady(managementClient, projectId);

    // Get project details
    const { data: projectDetails, error: detailsError } = await managementClient
      .from('projects')
      .select('api_url, api_key')
      .eq('id', projectId)
      .single();

    if (detailsError) {
      throw detailsError;
    }

    return {
      projectId,
      apiUrl: projectDetails.api_url,
      apiKey: projectDetails.api_key,
      status: 'created'
    };

  } catch (error) {
    return {
      projectId: '',
      apiUrl: '',
      apiKey: '',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Waits for a project to be ready
 * @param client - Supabase client instance
 * @param projectId - ID of project to check
 * @returns Promise that resolves when project is ready
 */
async function waitForProjectReady(
  client: SupabaseClient,
  projectId: string
): Promise<void> {
  const maxAttempts = 30;
  const delayMs = 2000;

  for (let i = 0; i < maxAttempts; i++) {
    const { data, error } = await client
      .from('projects')
      .select('status')
      .eq('id', projectId)
      .single();

    if (error) {
      throw error;
    }

    if (data.status === 'ACTIVE') {
      return;
    }

    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  throw new Error('Timeout waiting for project to be ready');
}

/**
 * Validates project configuration
 * @param config - Project configuration to validate
 * @throws Error if configuration is invalid
 */
function validateProjectConfig(config: CreateProjectConfig): void {
  if (!config.name.match(/^[a-z0-9-]+$/)) {
    throw new Error('Project name must contain only lowercase letters, numbers and hyphens');
  }

  if (config.dbPassword.length < 8) {
    throw new Error('Database password must be at least 8 characters');
  }

  const validRegions = ['us-east-1', 'us-west-1', 'eu-central-1', 'ap-southeast-1'];
  if (config.region && !validRegions.includes(config.region)) {
    throw new Error('Invalid region specified');
  }
}

/**
 * Deletes a Supabase project
 * @param projectId - ID of project to delete
 * @returns Promise that resolves when project is deleted
 * @throws Error if project deletion fails
 */
export async function deleteSupabaseProject(projectId: string): Promise<void> {
  try {
    const managementClient = createClient(
      process.env.SUPABASE_MANAGEMENT_API_URL!,
      process.env.SUPABASE_MANAGEMENT_API_KEY!
    );

    const { error } = await managementClient.rpc('delete_project', {
      project_id: projectId
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    throw new Error(
      `Failed to delete project: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
```