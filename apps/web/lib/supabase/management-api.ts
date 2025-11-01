/**
 * Supabase Management API Client
 *
 * Handles programmatic creation and management of Supabase projects
 * Requires SUPABASE_ACCESS_TOKEN in environment
 */

import type {
  CreateSupabaseProjectRequest,
  CreateSupabaseProjectResponse,
  ExecuteSQLRequest,
  ExecuteSQLResponse,
  SupabaseConfig,
  DatabaseTable,
  RLSPolicy,
} from '../project-config/types';

const SUPABASE_API_URL = 'https://api.supabase.com/v1';

export class SupabaseManagementAPI {
  private accessToken: string | null = null;

  constructor() {
    // Don't get token on instantiation - wait until methods are called
  }

  /**
   * Get access token from backend storage or environment (lazy loaded)
   */
  private getAccessToken(): string {
    // Return cached token if available
    if (this.accessToken) {
      return this.accessToken;
    }

    // In browser, this will be called via API route
    if (typeof window === 'undefined') {
      // Try to load from .api-keys.json file first
      try {
        const fs = require('fs');
        const path = require('path');
        const keysFile = path.join(process.cwd(), '.api-keys.json');

        if (fs.existsSync(keysFile)) {
          const keysContent = fs.readFileSync(keysFile, 'utf-8');
          const keys = JSON.parse(keysContent);

          if (keys.supabase_management_token) {
            console.log('✅ Using Supabase Management token from .api-keys.json');
            this.accessToken = keys.supabase_management_token;
            return this.accessToken;
          }
        }
      } catch (error) {
        console.log('No Supabase Management token found in .api-keys.json');
      }

      // Fallback to environment variable
      const token = process.env.SUPABASE_ACCESS_TOKEN;
      if (!token) {
        throw new Error(
          'SUPABASE_ACCESS_TOKEN not found in environment or API keys settings. ' +
          'Add it in Settings → API Keys or get your token from: https://app.supabase.com/account/tokens'
        );
      }
      this.accessToken = token;
      return token;
    }
    return ''; // Will use API routes from browser
  }

  /**
   * Create a new Supabase project
   */
  async createProject(
    request: CreateSupabaseProjectRequest
  ): Promise<SupabaseConfig> {
    console.log(`🚀 Creating Supabase project: ${request.projectName}`);

    try {
      const response = await fetch(`${SUPABASE_API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: request.projectName,
          organization_id: request.organizationId,
          region: request.region || 'us-west-1',
          db_pass: request.dbPassword,
          plan: request.plan || 'free',
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create Supabase project: ${error}`);
      }

      const project: CreateSupabaseProjectResponse = await response.json();

      // Wait for project to be ready and get credentials
      console.log('⏳ Waiting for project provisioning...');
      const config = await this.waitForProjectReady(project.id);

      return config;
    } catch (error) {
      console.error('Supabase project creation failed:', error);
      throw error;
    }
  }

  /**
   * Wait for project to be provisioned and active
   */
  private async waitForProjectReady(
    projectId: string,
    maxAttempts: number = 30
  ): Promise<SupabaseConfig> {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10s

      try {
        const config = await this.getProjectConfig(projectId);

        if (config.status === 'active') {
          console.log('✅ Supabase project is ready!');
          return config;
        }

        console.log(`⏳ Project status: ${config.status} (${i + 1}/${maxAttempts})`);
      } catch (error) {
        console.log(`⏳ Waiting for project... (${i + 1}/${maxAttempts})`);
      }
    }

    throw new Error('Timeout waiting for Supabase project to be ready');
  }

  /**
   * Get project configuration and credentials
   */
  async getProjectConfig(projectRef: string): Promise<SupabaseConfig> {
    const response = await fetch(`${SUPABASE_API_URL}/projects/${projectRef}`, {
      headers: {
        'Authorization': `Bearer ${this.getAccessToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get project config: ${response.statusText}`);
    }

    const project = await response.json();

    // Get API keys
    const keys = await this.getProjectAPIKeys(projectRef);

    return {
      projectId: project.id,
      projectRef: project.ref || projectRef,
      projectName: project.name,
      url: `https://${projectRef}.supabase.co`,
      anonKey: keys.anon,
      serviceRoleKey: keys.service_role,
      databaseUrl: project.database?.host,
      organizationId: project.organization_id,
      region: project.region,
      status: project.status === 'ACTIVE_HEALTHY' ? 'active' :
              project.status === 'COMING_UP' ? 'provisioning' : 'error',
      createdAt: project.inserted_at || new Date().toISOString(),
    };
  }

  /**
   * Get project API keys
   */
  private async getProjectAPIKeys(projectRef: string): Promise<{
    anon: string;
    service_role: string;
  }> {
    const response = await fetch(
      `${SUPABASE_API_URL}/projects/${projectRef}/api-keys`,
      {
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get API keys: ${response.statusText}`);
    }

    const keys = await response.json();

    return {
      anon: keys.find((k: any) => k.name === 'anon')?.api_key || '',
      service_role: keys.find((k: any) => k.name === 'service_role')?.api_key || '',
    };
  }

  /**
   * Execute SQL on a Supabase project
   */
  async executeSQL(request: ExecuteSQLRequest): Promise<ExecuteSQLResponse> {
    console.log(`📝 Executing SQL on project ${request.projectRef}`);

    try {
      const response = await fetch(
        `${SUPABASE_API_URL}/projects/${request.projectRef}/database/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.getAccessToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: request.sql,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        return {
          success: false,
          error: `SQL execution failed: ${error}`,
        };
      }

      const result = await response.json();

      return {
        success: true,
        result,
      };
    } catch (error: any) {
      console.error('SQL execution error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create a database table
   */
  async createTable(
    projectRef: string,
    table: DatabaseTable
  ): Promise<ExecuteSQLResponse> {
    console.log(`🗄️ Creating table: ${table.name}`);

    let sql = table.schema;

    // Enable RLS if specified
    if (table.rlsPolicies && table.rlsPolicies.length > 0) {
      sql += `\n\nALTER TABLE ${table.name} ENABLE ROW LEVEL SECURITY;\n`;

      // Add RLS policies
      for (const policy of table.rlsPolicies) {
        sql += `\nCREATE POLICY "${policy.name}" ON ${table.name}
  FOR ${policy.action}
  ${policy.role ? `TO ${policy.role}` : ''}
  USING (${policy.definition});\n`;
      }
    }

    // Add indexes
    if (table.indexes && table.indexes.length > 0) {
      for (const index of table.indexes) {
        sql += `\n${index}`;
      }
    }

    return this.executeSQL({ projectRef, sql });
  }

  /**
   * Create multiple tables in sequence
   */
  async createTables(
    projectRef: string,
    tables: DatabaseTable[]
  ): Promise<{ [tableName: string]: ExecuteSQLResponse }> {
    const results: { [tableName: string]: ExecuteSQLResponse } = {};

    for (const table of tables) {
      results[table.name] = await this.createTable(projectRef, table);

      // Wait a bit between tables to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }

  /**
   * List all organizations for the user
   */
  async listOrganizations(): Promise<Array<{ id: string; name: string }>> {
    const response = await fetch(`${SUPABASE_API_URL}/organizations`, {
      headers: {
        'Authorization': `Bearer ${this.getAccessToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to list organizations: ${response.statusText}`);
    }

    const orgs = await response.json();
    return orgs.map((org: any) => ({
      id: org.id,
      name: org.name,
    }));
  }

  /**
   * List all projects in an organization
   */
  async listProjects(organizationId: string): Promise<SupabaseConfig[]> {
    const response = await fetch(
      `${SUPABASE_API_URL}/organizations/${organizationId}/projects`,
      {
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to list projects: ${response.statusText}`);
    }

    const data = await response.json();

    // Handle both array response and wrapped response
    const projects = Array.isArray(data) ? data : (data.projects || []);

    console.log(`📋 Found ${projects.length} projects in organization ${organizationId}`);

    // If no projects, return empty array
    if (projects.length === 0) {
      return [];
    }

    // Get full config for each project
    const configs = await Promise.all(
      projects.map((p: any) => this.getProjectConfig(p.ref || p.id))
    );

    return configs;
  }

  /**
   * Pause a project (reduces costs)
   */
  async pauseProject(projectRef: string): Promise<void> {
    await fetch(`${SUPABASE_API_URL}/projects/${projectRef}/pause`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAccessToken()}`,
      },
    });
  }

  /**
   * Resume a paused project
   */
  async resumeProject(projectRef: string): Promise<void> {
    await fetch(`${SUPABASE_API_URL}/projects/${projectRef}/restore`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAccessToken()}`,
      },
    });
  }

  /**
   * Generate a secure database password
   */
  static generateDbPassword(): string {
    const length = 32;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }

    return password;
  }
}

export const supabaseManagementAPI = new SupabaseManagementAPI();
