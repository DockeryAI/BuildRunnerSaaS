import { BuildSpec, CreatePlanRequest, SpecSyncResponse, SpecDiffResponse } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new ApiError(response.status, error);
  }

  return response.json();
}

// Plan Generation
export async function generatePlan(request: CreatePlanRequest): Promise<BuildSpec> {
  return fetchApi<BuildSpec>('/api/plans/generate', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// Spec Sync (Phase 2 functions)
export async function syncSpec(spec: BuildSpec): Promise<SpecSyncResponse> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Server-side only
  
  if (!supabaseUrl) {
    throw new Error('Supabase URL not configured');
  }

  return fetchApi<SpecSyncResponse>(`${supabaseUrl}/functions/v1/spec-sync`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceKey}`,
    },
    body: JSON.stringify(spec),
  });
}

export async function diffSpec(projectId: string, localHash?: string, version?: string): Promise<SpecDiffResponse> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Server-side only
  
  if (!supabaseUrl) {
    throw new Error('Supabase URL not configured');
  }

  const params = new URLSearchParams({ project_id: projectId });
  if (localHash) params.append('local_hash', localHash);
  if (version) params.append('version', version);

  return fetchApi<SpecDiffResponse>(`${supabaseUrl}/functions/v1/spec-diff?${params}`, {
    headers: {
      'Authorization': `Bearer ${serviceKey}`,
    },
  });
}

// Health Checks
export async function healthCheck(projectRef: string) {
  return fetchApi('/api/provision/health', {
    method: 'POST',
    body: JSON.stringify({ 
      userId: 'current-user', // TODO: Get from auth
      projectRef 
    }),
  });
}

// Local Plan Management
export async function loadLocalPlan(): Promise<BuildSpec | null> {
  try {
    const response = await fetch('/api/plans/local');
    if (response.ok) {
      return response.json();
    }
    return null;
  } catch (error) {
    console.error('Failed to load local plan:', error);
    return null;
  }
}

export async function saveLocalPlan(spec: BuildSpec): Promise<void> {
  await fetchApi('/api/plans/local', {
    method: 'POST',
    body: JSON.stringify(spec),
  });
}
