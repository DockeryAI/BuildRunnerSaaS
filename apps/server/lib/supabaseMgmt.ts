import { vault } from './vault.js';

const SUPABASE_MGMT_BASE = process.env.SUPABASE_MGMT_BASE || 'https://api.supabase.com';

export interface SupabaseProject {
  id: string;
  ref: string;
  name: string;
  organization_id: string;
  region: string;
  created_at: string;
  status: string;
}

export interface SupabaseApiKeys {
  anon: string;
  service_role: string;
}

export interface CreateProjectRequest {
  name: string;
  organization_id: string;
  region?: string;
  plan?: string;
}

export class SupabaseMgmtClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  static async fromVault(userId: string): Promise<SupabaseMgmtClient | null> {
    const token = await vault.retrieve(`supabase_token_${userId}`);
    if (!token) {
      return null;
    }
    return new SupabaseMgmtClient(token);
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${SUPABASE_MGMT_BASE}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Supabase API error: ${response.status} ${error}`);
    }

    return response.json();
  }

  async getOrganizations(): Promise<any[]> {
    return this.request('/v1/organizations');
  }

  async createProject(request: CreateProjectRequest): Promise<SupabaseProject> {
    console.log(`[SUPABASE_MGMT] Creating project: ${request.name} in org: ${vault.maskValue(request.organization_id)}`);
    
    const project = await this.request('/v1/projects', {
      method: 'POST',
      body: JSON.stringify({
        name: request.name,
        organization_id: request.organization_id,
        region: request.region || 'us-east-1',
        plan: request.plan || 'free',
      }),
    });

    console.log(`[SUPABASE_MGMT] Project created with ref: ${project.ref}`);
    return project;
  }

  async getProject(ref: string): Promise<SupabaseProject> {
    return this.request(`/v1/projects/${ref}`);
  }

  async getApiKeys(ref: string): Promise<SupabaseApiKeys> {
    console.log(`[SUPABASE_MGMT] Fetching API keys for project: ${ref}`);
    
    const keys = await this.request(`/v1/projects/${ref}/api-keys`);
    
    console.log(`[SUPABASE_MGMT] Retrieved keys - anon: ${vault.maskValue(keys.anon)}, service: ${vault.maskValue(keys.service_role)}`);
    
    return {
      anon: keys.anon,
      service_role: keys.service_role,
    };
  }

  async waitForProjectReady(ref: string, maxWaitMs: number = 300000): Promise<SupabaseProject> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitMs) {
      const project = await this.getProject(ref);
      
      if (project.status === 'ACTIVE_HEALTHY') {
        console.log(`[SUPABASE_MGMT] Project ${ref} is ready`);
        return project;
      }
      
      console.log(`[SUPABASE_MGMT] Project ${ref} status: ${project.status}, waiting...`);
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
    }
    
    throw new Error(`Project ${ref} did not become ready within ${maxWaitMs}ms`);
  }
}
