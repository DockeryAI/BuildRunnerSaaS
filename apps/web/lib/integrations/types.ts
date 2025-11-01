/**
 * Integration System Types
 *
 * Manages user connections to external services (GitHub, Supabase, etc.)
 * All credentials are collected in-app, never via .env files
 */

export type IntegrationType =
  | 'github'
  | 'supabase'
  | 'openrouter'
  | 'vercel'
  | 'stripe'
  | 'sendgrid'
  | 'aws';

export type ConnectionStatus =
  | 'not_connected'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'expired';

export interface Integration {
  id: string;
  type: IntegrationType;
  name: string;
  description: string;
  icon: string;
  required: boolean;
  usesOAuth: boolean;
  capabilities: string[];
  setupUrl?: string;
  docsUrl?: string;
}

export interface UserConnection {
  id: string;
  userId: string;
  integrationType: IntegrationType;
  status: ConnectionStatus;
  connectedAt: string;
  expiresAt?: string;
  lastUsed?: string;

  // OAuth connections (GitHub, etc.)
  oauth?: {
    accessToken: string;
    refreshToken?: string;
    tokenType: string;
    scope: string;
    expiresIn?: number;
  };

  // API Key connections (Supabase, OpenRouter, etc.)
  apiKey?: {
    key: string;
    keyPreview: string; // e.g., "sbp_abc...xyz" (first 7 + last 3)
  };

  // Service-specific metadata
  metadata?: {
    // GitHub
    username?: string;
    avatarUrl?: string;

    // Supabase
    organizationId?: string;
    organizationName?: string;

    // OpenRouter
    credits?: number;

    [key: string]: any;
  };

  error?: string;
}

export interface ProjectIntegrationRequirement {
  integration: IntegrationType;
  reason: string;
  required: boolean;
  features: string[]; // Which features need this
  alternatives?: string[]; // Alternative integrations that could work
}

export interface IntegrationPrompt {
  integration: IntegrationType;
  title: string;
  message: string;
  ctaText: string;
  skipable: boolean;
  onConnect: () => Promise<void>;
  onSkip?: () => void;
}

// GitHub OAuth configuration
export interface GitHubOAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string[];
}

export interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  htmlUrl: string;
  defaultBranch: string;
  createdAt: string;
}

export interface CreateGitHubRepoRequest {
  name: string;
  description?: string;
  private?: boolean;
  autoInit?: boolean;
  gitignoreTemplate?: string;
  licenseTemplate?: string;
}

// Supabase connection (uses access token, not OAuth)
export interface SupabaseConnection {
  accessToken: string;
  organizations: Array<{
    id: string;
    name: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    ref: string;
    region: string;
  }>;
}

// OpenRouter connection options
export interface OpenRouterConnection {
  // Option 1: User brings own key
  useOwnKey: boolean;
  apiKey?: string;

  // Option 2: Use BuildRunner's key (with markup)
  useBuildRunnerKey?: boolean;
  acceptedPricing?: boolean;
}

// Token usage tracking (for markup billing)
export interface TokenUsage {
  id: string;
  userId: string;
  projectId: string;
  provider: 'openrouter' | 'openai' | 'anthropic';
  model: string;
  tokensUsed: number;
  costUSD: number;
  markupUSD?: number;
  timestamp: string;
  request: {
    taskType: string;
    feature?: string;
  };
}

// Billing/Pricing
export interface PricingPlan {
  id: string;
  name: string;
  description: string;

  // Token markup (if using BuildRunner's keys)
  tokenMarkup: number; // e.g., 1.2 = 20% markup

  // Monthly limits
  monthlyTokenLimit?: number;
  monthlyProjectLimit?: number;

  // Features
  features: string[];

  priceUSD: number; // Monthly price
}

export const AVAILABLE_INTEGRATIONS: Integration[] = [
  {
    id: 'github',
    type: 'github',
    name: 'GitHub',
    description: 'Create and manage repositories, push code, create pull requests',
    icon: '🐙',
    required: true,
    usesOAuth: true,
    capabilities: ['create_repo', 'push_code', 'create_pr', 'manage_branches'],
    setupUrl: '/integrations/github',
    docsUrl: 'https://docs.github.com/en/apps',
  },
  {
    id: 'supabase',
    type: 'supabase',
    name: 'Supabase',
    description: 'Create database projects, manage tables, handle authentication',
    icon: '⚡',
    required: false,
    usesOAuth: false, // Uses access token
    capabilities: ['create_project', 'create_tables', 'run_sql', 'manage_auth'],
    setupUrl: '/integrations/supabase',
    docsUrl: 'https://supabase.com/docs/guides/platform/access-tokens',
  },
  {
    id: 'openrouter',
    type: 'openrouter',
    name: 'OpenRouter (AI)',
    description: 'Access to GPT-4, Claude, and other AI models for code generation',
    icon: '🤖',
    required: true,
    usesOAuth: false,
    capabilities: ['code_generation', 'feature_extraction', 'prd_generation'],
    setupUrl: '/integrations/openrouter',
    docsUrl: 'https://openrouter.ai/docs',
  },
  {
    id: 'vercel',
    type: 'vercel',
    name: 'Vercel',
    description: 'Deploy your applications automatically',
    icon: '▲',
    required: false,
    usesOAuth: true,
    capabilities: ['deploy', 'manage_domains', 'env_vars'],
    setupUrl: '/integrations/vercel',
    docsUrl: 'https://vercel.com/docs',
  },
];

export const DEFAULT_PRICING: PricingPlan = {
  id: 'free',
  name: 'Free',
  description: 'Bring your own API keys',
  tokenMarkup: 1.0, // No markup if using own keys
  features: [
    'Unlimited projects',
    'Bring your own API keys',
    'All AI models',
    'GitHub integration',
    'Community support',
  ],
  priceUSD: 0,
};

export const PRO_PRICING: PricingPlan = {
  id: 'pro',
  name: 'Pro',
  description: 'Use our API keys with 20% markup',
  tokenMarkup: 1.2, // 20% markup
  monthlyTokenLimit: 1000000,
  monthlyProjectLimit: 50,
  features: [
    'Use BuildRunner API keys',
    '20% markup on token costs',
    'Priority support',
    'Advanced analytics',
    'Team collaboration',
  ],
  priceUSD: 29,
};
