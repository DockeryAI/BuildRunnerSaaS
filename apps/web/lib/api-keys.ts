/**
 * Centralized API Key Management
 * Handles persistent storage and retrieval of API keys across the application
 */

export interface APIKeys {
  openrouter?: string;
  supabase_url?: string;
  supabase_anon_key?: string;
  supabase_management_token?: string;
  github_token?: string;
  anthropic?: string;
  openai?: string;
  resend?: string;
  sendgrid?: string;
  twilio?: string;
  vercel?: string;
  railway?: string;
  stripe?: string;
  calendly?: string;
  crunchbase?: string;
  producthunt?: string;
  [key: string]: string | undefined;
}

const API_KEYS_STORAGE_KEY = 'buildrunner_api_keys';

/**
 * Get all API keys from localStorage
 */
export function getApiKeys(): APIKeys {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem(API_KEYS_STORAGE_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load API keys:', error);
    return {};
  }
}

/**
 * Get a specific API key by name
 */
export function getApiKey(keyName: string): string | undefined {
  const keys = getApiKeys();
  return keys[keyName];
}

/**
 * Save API keys to localStorage
 */
export function saveApiKeys(keys: APIKeys): boolean {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));

    // Also attempt to save to backend for persistence
    fetch('/api/settings/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(keys),
    }).catch(err => console.warn('Failed to sync API keys to backend:', err));

    return true;
  } catch (error) {
    console.error('Failed to save API keys:', error);
    return false;
  }
}

/**
 * Save a single API key
 */
export function saveApiKey(keyName: string, value: string): boolean {
  const keys = getApiKeys();
  keys[keyName] = value;
  return saveApiKeys(keys);
}

/**
 * Remove an API key
 */
export function removeApiKey(keyName: string): boolean {
  const keys = getApiKeys();
  delete keys[keyName];
  return saveApiKeys(keys);
}

/**
 * Check if a specific API key is configured
 */
export function hasApiKey(keyName: string): boolean {
  const key = getApiKey(keyName);
  return !!key && key.length > 0;
}

/**
 * Get API keys for sending to backend (with proper headers format)
 */
export function getApiKeysHeader(): Record<string, any> {
  return getApiKeys();
}

/**
 * Load API keys from backend on app startup
 */
export async function loadApiKeysFromBackend(): Promise<APIKeys> {
  try {
    const response = await fetch('/api/settings/api-keys');
    const data = await response.json();

    if (data.success && data.keys) {
      // Merge with local storage (local takes precedence)
      const localKeys = getApiKeys();
      const mergedKeys = { ...data.keys, ...localKeys };

      // Save merged result
      saveApiKeys(mergedKeys);

      return mergedKeys;
    }
  } catch (error) {
    console.warn('Failed to load API keys from backend:', error);
  }

  return getApiKeys();
}

/**
 * Technology service mappings for automatic API key detection
 */
export const TECH_TO_API_KEY_MAP: Record<string, string> = {
  'OpenRouter': 'openrouter',
  'Supabase': 'supabase_url',
  'PostgreSQL': 'supabase_url',
  'Anthropic': 'anthropic',
  'OpenAI': 'openai',
  'Resend': 'resend',
  'SendGrid': 'sendgrid',
  'Twilio': 'twilio',
  'Vercel': 'vercel',
  'Railway': 'railway',
  'Stripe': 'stripe',
  'Calendly': 'calendly',
  'GitHub': 'github_token',
};

/**
 * Check if a technology has its API key configured
 */
export function isTechnologyConfigured(techName: string): boolean {
  const keyName = TECH_TO_API_KEY_MAP[techName];
  if (!keyName) return false;
  return hasApiKey(keyName);
}

/**
 * Get required API keys that are missing
 */
export function getMissingRequiredKeys(): string[] {
  const required = ['openrouter'];
  const keys = getApiKeys();
  return required.filter(key => !keys[key] || keys[key].length === 0);
}
