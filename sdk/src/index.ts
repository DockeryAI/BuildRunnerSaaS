/**
 * BuildRunner SDK
 * Official TypeScript/JavaScript SDK for BuildRunner API
 */

import 'cross-fetch/polyfill';

// Types
export interface BuildRunnerConfig {
  /** Base URL for the BuildRunner API */
  baseUrl?: string;
  /** Project ID for API calls */
  projectId?: string;
  /** API key for authentication */
  apiKey: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Custom headers to include with requests */
  headers?: Record<string, string>;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  code?: string;
  details?: Record<string, any>;
  timestamp?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'archived' | 'draft';
  org_id?: string;
  template_id?: string;
  settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  project_id: string;
  phases: Phase[];
  version: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Phase {
  id: string;
  title: string;
  description?: string;
  steps: Step[];
  status?: 'not_started' | 'in_progress' | 'completed' | 'blocked';
}

export interface Step {
  id: string;
  title: string;
  description?: string;
  microsteps: Microstep[];
  status?: 'not_started' | 'in_progress' | 'completed' | 'blocked';
}

export interface Microstep {
  id: string;
  title: string;
  description?: string;
  criteria: string[];
  status?: 'not_started' | 'in_progress' | 'completed' | 'blocked';
}

export interface SyncResult {
  success: boolean;
  changes_applied: number;
  summary: {
    phases_synced: number;
    steps_synced: number;
    microsteps_synced: number;
    errors: string[];
  };
  dry_run?: boolean;
  timestamp: string;
}

// Base API Client
class ApiClient {
  private config: Required<BuildRunnerConfig>;

  constructor(config: BuildRunnerConfig) {
    this.config = {
      baseUrl: 'https://api.buildrunner.com',
      projectId: '',
      timeout: 30000,
      headers: {},
      ...config,
    };

    if (!this.config.apiKey) {
      throw new Error('API key is required. Please provide a valid API key.');
    }

    // Validate API key format (basic check)
    if (!this.config.apiKey.startsWith('br_')) {
      console.warn('API key should start with "br_". Please verify your API key format.');
    }
  }

  /**
   * Make an authenticated HTTP request
   */
  async request<T = any>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      body?: any;
      headers?: Record<string, string>;
      projectId?: string;
    } = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      projectId = this.config.projectId,
    } = options;

    const url = `${this.config.baseUrl}${endpoint}`;
    
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
      'User-Agent': `BuildRunner-SDK/1.7.0`,
      ...this.config.headers,
      ...headers,
    };

    // Add project ID to headers if available
    if (projectId) {
      requestHeaders['X-Project-ID'] = projectId;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseData = await response.json();

      if (!response.ok) {
        return {
          error: responseData.error || `HTTP ${response.status}`,
          code: responseData.code || 'HTTP_ERROR',
          details: responseData.details,
          timestamp: responseData.timestamp || new Date().toISOString(),
        };
      }

      return {
        data: responseData,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            error: 'Request timeout',
            code: 'TIMEOUT',
            timestamp: new Date().toISOString(),
          };
        }
        
        return {
          error: error.message,
          code: 'NETWORK_ERROR',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        error: 'Unknown error occurred',
        code: 'UNKNOWN_ERROR',
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Projects API
export class ProjectsApi extends ApiClient {
  /**
   * List projects
   */
  async list(options: {
    org_id?: string;
    status?: 'active' | 'archived' | 'draft';
    limit?: number;
    offset?: number;
  } = {}): Promise<ApiResponse<{ projects: Project[]; total: number; limit: number; offset: number }>> {
    const params = new URLSearchParams();
    
    if (options.org_id) params.append('org_id', options.org_id);
    if (options.status) params.append('status', options.status);
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());

    const query = params.toString();
    const endpoint = `/projects${query ? `?${query}` : ''}`;

    return this.request<{ projects: Project[]; total: number; limit: number; offset: number }>(endpoint);
  }

  /**
   * Get a specific project
   */
  async get(projectId: string): Promise<ApiResponse<Project>> {
    return this.request<Project>(`/projects/${projectId}`);
  }

  /**
   * Create a new project
   */
  async create(project: {
    name: string;
    description: string;
    org_id?: string;
    template_id?: string;
    settings?: Record<string, any>;
  }): Promise<ApiResponse<Project>> {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: project,
    });
  }

  /**
   * Update an existing project
   */
  async update(projectId: string, updates: {
    name?: string;
    description?: string;
    status?: 'active' | 'archived' | 'draft';
    settings?: Record<string, any>;
  }): Promise<ApiResponse<Project>> {
    return this.request<Project>(`/projects/${projectId}`, {
      method: 'PUT',
      body: updates,
    });
  }

  /**
   * Delete a project
   */
  async delete(projectId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  }
}

// Planning API
export class PlanningApi extends ApiClient {
  /**
   * Get project plan
   */
  async getPlan(projectId?: string): Promise<ApiResponse<Plan>> {
    const id = projectId || this.config.projectId;
    if (!id) {
      throw new Error('Project ID is required. Provide it in the method call or SDK config.');
    }
    
    return this.request<Plan>(`/projects/${id}/plan`);
  }

  /**
   * Create or update project plan
   */
  async updatePlan(plan: {
    phases: Phase[];
    metadata?: Record<string, any>;
  }, projectId?: string): Promise<ApiResponse<Plan>> {
    const id = projectId || this.config.projectId;
    if (!id) {
      throw new Error('Project ID is required. Provide it in the method call or SDK config.');
    }

    return this.request<Plan>(`/projects/${id}/plan`, {
      method: 'POST',
      body: plan,
    });
  }
}

// Execution API
export class ExecutionApi extends ApiClient {
  /**
   * Sync project with plan
   */
  async sync(options: {
    dry_run?: boolean;
    phases?: string[];
  } = {}, projectId?: string): Promise<ApiResponse<SyncResult>> {
    const id = projectId || this.config.projectId;
    if (!id) {
      throw new Error('Project ID is required. Provide it in the method call or SDK config.');
    }

    return this.request<SyncResult>(`/projects/${id}/sync`, {
      method: 'POST',
      body: options,
    });
  }
}

// Main SDK Class
export class BuildRunnerSDK {
  public projects: ProjectsApi;
  public planning: PlanningApi;
  public execution: ExecutionApi;

  constructor(config: BuildRunnerConfig) {
    this.projects = new ProjectsApi(config);
    this.planning = new PlanningApi(config);
    this.execution = new ExecutionApi(config);
  }

  /**
   * Create a new SDK instance with different configuration
   */
  static create(config: BuildRunnerConfig): BuildRunnerSDK {
    return new BuildRunnerSDK(config);
  }

  /**
   * Test API connectivity
   */
  async ping(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.projects.request<{ status: string; timestamp: string }>('/health');
  }
}

// Default export
export default BuildRunnerSDK;

// Convenience function for quick setup
export function createClient(config: BuildRunnerConfig): BuildRunnerSDK {
  return new BuildRunnerSDK(config);
}
