/**
 * @file CreateSupabaseProject.ts
 * @description Service for creating and initializing a Supabase project
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface SupabaseConfig {
  projectName: string;
  dbPassword: string;
  region?: string;
  plan?: 'free' | 'pro' | 'enterprise';
}

interface CreateProjectResponse {
  success: boolean;
  projectId?: string;
  error?: string;
}

/**
 * Service class to handle Supabase project creation
 */
export class CreateSupabaseProject {
  private supabase: SupabaseClient;
  
  /**
   * Initialize Supabase client
   * @param supabaseUrl - Supabase project URL
   * @param supabaseKey - Supabase API key
   */
  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Creates a new Supabase project
   * @param config - Project configuration options
   * @returns Promise with creation result
   */
  public async createProject(config: SupabaseConfig): Promise<CreateProjectResponse> {
    try {
      // Validate config
      if (!config.projectName || !config.dbPassword) {
        throw new Error('Project name and database password are required');
      }

      // Create project
      const { data, error } = await this.supabase.rpc('create_project', {
        name: config.projectName,
        db_pass: config.dbPassword,
        region: config.region || 'us-east-1',
        pricing_plan: config.plan || 'free'
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        projectId: data.id
      };

    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Validates project configuration
   * @param config - Project configuration to validate
   * @throws Error if validation fails
   */
  private validateConfig(config: SupabaseConfig): void {
    if (!config.projectName.match(/^[a-z0-9-]+$/)) {
      throw new Error('Project name must contain only lowercase letters, numbers and hyphens');
    }

    if (config.dbPassword.length < 8) {
      throw new Error('Database password must be at least 8 characters');
    }
  }

  /**
   * Gets project status
   * @param projectId - ID of project to check
   * @returns Promise with project status
   */
  public async getProjectStatus(projectId: string): Promise<{status: string; error?: string}> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select('status')
        .eq('id', projectId)
        .single();

      if (error) {
        throw error;
      }

      return {
        status: data.status
      };

    } catch (err) {
      return {
        status: 'error',
        error: err instanceof Error ? err.message : 'Failed to get project status'
      };
    }
  }

  /**
   * Deletes a Supabase project
   * @param projectId - ID of project to delete
   * @returns Promise indicating success/failure
   */
  public async deleteProject(projectId: string): Promise<{success: boolean; error?: string}> {
    try {
      const { error } = await this.supabase
        .rpc('delete_project', {
          project_id: projectId
        });

      if (error) {
        throw error;
      }

      return {
        success: true
      };

    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to delete project'
      };
    }
  }
}

export type { SupabaseConfig, CreateProjectResponse };