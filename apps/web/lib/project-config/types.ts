/**
 * Project Configuration Types
 *
 * Each user project has its own isolated configuration
 * separate from BuildRunner's infrastructure
 */

export type BackendType = 'supabase' | 'firebase' | 'custom' | 'none';
export type ProjectStatus = 'creating' | 'active' | 'error' | 'archived';

export interface SupabaseConfig {
  // Project identifiers
  projectId: string;           // Supabase project ID
  projectRef: string;          // Project reference (e.g., "abc123def456")
  projectName?: string;        // Human-readable project name

  // Connection details
  url: string;                 // https://abc123def456.supabase.co
  anonKey: string;             // Public anon key
  serviceRoleKey: string;      // Service role key (admin)

  // Database details
  databaseUrl?: string;        // Direct database connection
  databasePassword?: string;   // Database password

  // Organization (optional)
  organizationId?: string;
  region?: string;             // e.g., "us-west-1"

  // Status
  status: 'provisioning' | 'active' | 'paused' | 'error';
  createdAt: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export interface ServiceCredentials {
  // AI Services
  openai?: string;
  anthropic?: string;

  // Payment
  stripe?: {
    publishableKey: string;
    secretKey: string;
    webhookSecret?: string;
  };

  // Email
  sendgrid?: string;
  resend?: string;

  // Storage
  s3?: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucket: string;
  };

  // Other services
  [key: string]: any;
}

export interface DatabaseTable {
  name: string;
  schema: string;              // SQL schema definition
  columns: DatabaseColumn[];
  rlsPolicies?: RLSPolicy[];
  indexes?: string[];
  status: 'pending' | 'creating' | 'created' | 'error';
  error?: string;
}

export interface DatabaseColumn {
  name: string;
  type: string;                // e.g., "text", "integer", "uuid"
  nullable: boolean;
  defaultValue?: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  references?: {
    table: string;
    column: string;
  };
}

export interface RLSPolicy {
  name: string;
  action: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
  definition: string;          // SQL policy definition
  role?: string;
}

export interface ProjectConfig {
  // Project metadata
  id: string;                  // BuildRunner project ID
  name: string;
  description?: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;

  // Backend configuration
  backend: {
    type: BackendType;
    supabase?: SupabaseConfig;
    firebase?: FirebaseConfig;
  };

  // Service credentials
  services: ServiceCredentials;

  // Database schema
  database: {
    tables: DatabaseTable[];
    migrations: DatabaseMigration[];
  };

  // Environment variables
  envVars: {
    [key: string]: string;
  };

  // Deployment configuration
  deployment?: {
    platform: 'vercel' | 'netlify' | 'aws' | 'custom';
    url?: string;
    lastDeployedAt?: string;
  };
}

export interface DatabaseMigration {
  id: string;
  name: string;
  sql: string;
  status: 'pending' | 'applied' | 'error';
  appliedAt?: string;
  error?: string;
}

// API Request/Response types

export interface CreateSupabaseProjectRequest {
  projectName: string;
  organizationId: string;
  region?: string;
  dbPassword: string;
  plan?: 'free' | 'pro' | 'team';
}

export interface CreateSupabaseProjectResponse {
  id: string;
  organization_id: string;
  name: string;
  region: string;
  status: string;
  database: {
    host: string;
    version: string;
  };
}

export interface CreateTableRequest {
  projectRef: string;
  tableName: string;
  schema: string;
  enableRLS?: boolean;
  rlsPolicies?: RLSPolicy[];
}

export interface ExecuteSQLRequest {
  projectRef: string;
  sql: string;
}

export interface ExecuteSQLResponse {
  success: boolean;
  result?: any;
  error?: string;
}
