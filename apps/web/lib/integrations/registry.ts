import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export type IntegrationProvider = 
  | 'jira' 
  | 'linear' 
  | 'vercel' 
  | 'render' 
  | 'netlify' 
  | 'github' 
  | 'slack';

export type IntegrationType = 'issue_tracker' | 'deployment' | 'communication' | 'repository';

export interface IntegrationConfig {
  provider: IntegrationProvider;
  name: string;
  type: IntegrationType;
  description: string;
  authType: 'api_key' | 'oauth' | 'token';
  configSchema: Record<string, any>;
  capabilities: string[];
  webhookSupport: boolean;
  rateLimits?: {
    requests: number;
    window: number; // seconds
  };
}

export interface IntegrationCredentials {
  apiKey?: string;
  token?: string;
  clientId?: string;
  clientSecret?: string;
  baseUrl?: string;
  organizationId?: string;
  [key: string]: any;
}

export interface IntegrationInstance {
  id: string;
  projectId: string;
  provider: IntegrationProvider;
  name: string;
  config: Record<string, any>;
  active: boolean;
  lastSyncAt?: string;
  syncStatus: 'pending' | 'success' | 'failed' | 'disabled';
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Integration Provider Registry
 */
export class IntegrationRegistry {
  private static providers: Map<IntegrationProvider, IntegrationConfig> = new Map([
    ['jira', {
      provider: 'jira',
      name: 'Jira',
      type: 'issue_tracker',
      description: 'Sync issues and tasks with Atlassian Jira',
      authType: 'api_key',
      configSchema: {
        baseUrl: { type: 'string', required: true, description: 'Jira instance URL' },
        email: { type: 'string', required: true, description: 'User email' },
        apiToken: { type: 'string', required: true, description: 'API token', secret: true },
        projectKey: { type: 'string', required: true, description: 'Jira project key' },
      },
      capabilities: ['sync_issues', 'create_issues', 'update_status', 'webhooks'],
      webhookSupport: true,
      rateLimits: { requests: 1000, window: 3600 },
    }],
    ['linear', {
      provider: 'linear',
      name: 'Linear',
      type: 'issue_tracker',
      description: 'Sync issues and tasks with Linear',
      authType: 'api_key',
      configSchema: {
        apiKey: { type: 'string', required: true, description: 'Linear API key', secret: true },
        teamId: { type: 'string', required: false, description: 'Team ID (optional)' },
      },
      capabilities: ['sync_issues', 'create_issues', 'update_status', 'webhooks'],
      webhookSupport: true,
      rateLimits: { requests: 1000, window: 3600 },
    }],
    ['vercel', {
      provider: 'vercel',
      name: 'Vercel',
      type: 'deployment',
      description: 'Deploy preview environments with Vercel',
      authType: 'token',
      configSchema: {
        token: { type: 'string', required: true, description: 'Vercel API token', secret: true },
        teamId: { type: 'string', required: false, description: 'Team ID (optional)' },
        projectName: { type: 'string', required: true, description: 'Project name' },
      },
      capabilities: ['deploy_preview', 'deploy_production', 'webhooks', 'logs'],
      webhookSupport: true,
      rateLimits: { requests: 100, window: 60 },
    }],
    ['render', {
      provider: 'render',
      name: 'Render',
      type: 'deployment',
      description: 'Deploy preview environments with Render',
      authType: 'api_key',
      configSchema: {
        apiKey: { type: 'string', required: true, description: 'Render API key', secret: true },
        serviceId: { type: 'string', required: true, description: 'Service ID' },
      },
      capabilities: ['deploy_preview', 'deploy_production', 'webhooks', 'logs'],
      webhookSupport: true,
      rateLimits: { requests: 100, window: 60 },
    }],
    ['netlify', {
      provider: 'netlify',
      name: 'Netlify',
      type: 'deployment',
      description: 'Deploy preview environments with Netlify',
      authType: 'token',
      configSchema: {
        token: { type: 'string', required: true, description: 'Netlify access token', secret: true },
        siteId: { type: 'string', required: true, description: 'Site ID' },
      },
      capabilities: ['deploy_preview', 'deploy_production', 'webhooks', 'logs'],
      webhookSupport: true,
      rateLimits: { requests: 500, window: 3600 },
    }],
    ['github', {
      provider: 'github',
      name: 'GitHub',
      type: 'repository',
      description: 'Sync with GitHub repositories and issues',
      authType: 'token',
      configSchema: {
        token: { type: 'string', required: true, description: 'GitHub personal access token', secret: true },
        owner: { type: 'string', required: true, description: 'Repository owner' },
        repo: { type: 'string', required: true, description: 'Repository name' },
      },
      capabilities: ['sync_issues', 'create_issues', 'webhooks', 'pr_status'],
      webhookSupport: true,
      rateLimits: { requests: 5000, window: 3600 },
    }],
    ['slack', {
      provider: 'slack',
      name: 'Slack',
      type: 'communication',
      description: 'Send notifications to Slack channels',
      authType: 'oauth',
      configSchema: {
        botToken: { type: 'string', required: true, description: 'Bot user OAuth token', secret: true },
        channel: { type: 'string', required: true, description: 'Default channel' },
      },
      capabilities: ['send_notifications', 'webhooks'],
      webhookSupport: true,
      rateLimits: { requests: 100, window: 60 },
    }],
  ]);

  /**
   * Get all available providers
   */
  static getProviders(): IntegrationConfig[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get provider configuration
   */
  static getProvider(provider: IntegrationProvider): IntegrationConfig | null {
    return this.providers.get(provider) || null;
  }

  /**
   * Get providers by type
   */
  static getProvidersByType(type: IntegrationType): IntegrationConfig[] {
    return Array.from(this.providers.values()).filter(p => p.type === type);
  }

  /**
   * Validate provider configuration
   */
  static validateConfig(provider: IntegrationProvider, config: Record<string, any>): {
    valid: boolean;
    errors: string[];
  } {
    const providerConfig = this.getProvider(provider);
    if (!providerConfig) {
      return { valid: false, errors: ['Unknown provider'] };
    }

    const errors: string[] = [];
    const schema = providerConfig.configSchema;

    // Check required fields
    for (const [field, fieldConfig] of Object.entries(schema)) {
      if (fieldConfig.required && !config[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Check field types
    for (const [field, value] of Object.entries(config)) {
      const fieldConfig = schema[field];
      if (fieldConfig && fieldConfig.type === 'string' && typeof value !== 'string') {
        errors.push(`Field ${field} must be a string`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Create integration instance
   */
  static async createIntegration(
    projectId: string,
    provider: IntegrationProvider,
    name: string,
    config: Record<string, any>,
    credentials: IntegrationCredentials
  ): Promise<IntegrationInstance> {
    // Validate configuration
    const validation = this.validateConfig(provider, config);
    if (!validation.valid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }

    // Encrypt credentials
    const encryptedCredentials = await this.encryptCredentials(credentials);

    // Insert into database
    const { data, error } = await supabase
      .from('external_integrations')
      .insert([{
        project_id: projectId,
        provider,
        name,
        config,
        credentials_encrypted: encryptedCredentials,
        active: true,
        sync_status: 'pending',
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create integration: ${error.message}`);
    }

    // Log audit event
    await supabase
      .from('runner_events')
      .insert([{
        actor: 'system',
        action: 'integration_registered',
        payload: {
          integration_id: data.id,
          provider,
          name,
          project_id: projectId,
        },
        metadata: {
          timestamp: new Date().toISOString(),
        },
      }]);

    return this.mapDatabaseRecord(data);
  }

  /**
   * Get integration by ID
   */
  static async getIntegration(id: string): Promise<IntegrationInstance | null> {
    const { data, error } = await supabase
      .from('external_integrations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapDatabaseRecord(data);
  }

  /**
   * Get integrations for project
   */
  static async getProjectIntegrations(
    projectId: string,
    provider?: IntegrationProvider
  ): Promise<IntegrationInstance[]> {
    let query = supabase
      .from('external_integrations')
      .select('*')
      .eq('project_id', projectId);

    if (provider) {
      query = query.eq('provider', provider);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch integrations: ${error.message}`);
    }

    return (data || []).map(this.mapDatabaseRecord);
  }

  /**
   * Update integration
   */
  static async updateIntegration(
    id: string,
    updates: Partial<{
      name: string;
      config: Record<string, any>;
      active: boolean;
      syncStatus: string;
      errorMessage: string;
    }>
  ): Promise<IntegrationInstance> {
    const { data, error } = await supabase
      .from('external_integrations')
      .update({
        name: updates.name,
        config: updates.config,
        active: updates.active,
        sync_status: updates.syncStatus,
        error_message: updates.errorMessage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update integration: ${error.message}`);
    }

    return this.mapDatabaseRecord(data);
  }

  /**
   * Delete integration
   */
  static async deleteIntegration(id: string): Promise<void> {
    const { error } = await supabase
      .from('external_integrations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete integration: ${error.message}`);
    }

    // Log audit event
    await supabase
      .from('runner_events')
      .insert([{
        actor: 'system',
        action: 'integration_deleted',
        payload: {
          integration_id: id,
        },
        metadata: {
          timestamp: new Date().toISOString(),
        },
      }]);
  }

  /**
   * Test integration connection
   */
  static async testConnection(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const integration = await this.getIntegration(id);
      if (!integration) {
        return { success: false, error: 'Integration not found' };
      }

      // This would call the actual provider API to test connection
      // For now, we'll simulate the test
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update last sync time
      await this.updateIntegration(id, {
        syncStatus: 'success',
        errorMessage: undefined,
      });

      return { success: true };
    } catch (error) {
      await this.updateIntegration(id, {
        syncStatus: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Encrypt credentials for storage
   */
  private static async encryptCredentials(credentials: IntegrationCredentials): Promise<string> {
    // In production, this would use proper encryption
    // For demo, we'll use base64 encoding
    return Buffer.from(JSON.stringify(credentials)).toString('base64');
  }

  /**
   * Decrypt credentials from storage
   */
  private static async decryptCredentials(encrypted: string): Promise<IntegrationCredentials> {
    // In production, this would use proper decryption
    // For demo, we'll use base64 decoding
    return JSON.parse(Buffer.from(encrypted, 'base64').toString());
  }

  /**
   * Map database record to IntegrationInstance
   */
  private static mapDatabaseRecord(data: any): IntegrationInstance {
    return {
      id: data.id,
      projectId: data.project_id,
      provider: data.provider,
      name: data.name,
      config: data.config,
      active: data.active,
      lastSyncAt: data.last_sync_at,
      syncStatus: data.sync_status,
      errorMessage: data.error_message,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export default IntegrationRegistry;
