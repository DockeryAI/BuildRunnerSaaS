```typescript
/**
 * @file InstagramApiRegistration.ts
 * @description Handles Instagram API registration and authentication
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { InstagramApiConfig, InstagramAuthResponse } from './types';

/**
 * Configuration interface for Instagram API credentials
 */
interface InstagramCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

/**
 * Class to handle Instagram API registration and auth flow
 */
export class InstagramApiRegistration {
  private supabase: SupabaseClient;
  private credentials: InstagramCredentials;

  /**
   * Initialize Instagram API registration
   * @param supabaseUrl - Supabase project URL
   * @param supabaseKey - Supabase project API key
   * @param credentials - Instagram API credentials
   */
  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    credentials: InstagramCredentials
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.credentials = credentials;
  }

  /**
   * Generate Instagram OAuth URL
   * @returns {string} OAuth authorization URL
   */
  public getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      client_id: this.credentials.clientId,
      redirect_uri: this.credentials.redirectUri,
      scope: 'basic',
      response_type: 'code'
    });

    return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   * @param code - Authorization code from Instagram
   * @returns {Promise<InstagramAuthResponse>} Authentication response
   * @throws {Error} If exchange fails
   */
  public async exchangeCodeForToken(code: string): Promise<InstagramAuthResponse> {
    try {
      const response = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.credentials.clientId,
          client_secret: this.credentials.clientSecret,
          grant_type: 'authorization_code',
          redirect_uri: this.credentials.redirectUri,
          code,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to exchange code: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Store credentials in Supabase
      await this.storeCredentials(data);

      return data;
    } catch (error) {
      throw new Error(`Instagram API registration failed: ${error.message}`);
    }
  }

  /**
   * Store Instagram credentials in Supabase
   * @param credentials - Instagram API credentials to store
   * @private
   */
  private async storeCredentials(credentials: InstagramAuthResponse): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('instagram_credentials')
        .insert([
          {
            access_token: credentials.access_token,
            user_id: credentials.user_id,
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) {
        throw error;
      }
    } catch (error) {
      throw new Error(`Failed to store credentials: ${error.message}`);
    }
  }

  /**
   * Validate stored Instagram credentials
   * @param userId - Instagram user ID to validate
   * @returns {Promise<boolean>} Whether credentials are valid
   */
  public async validateCredentials(userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('instagram_credentials')
        .select('access_token')
        .eq('user_id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (!data?.access_token) {
        return false;
      }

      // Validate token with Instagram API
      const response = await fetch(
        `https://graph.instagram.com/me?access_token=${data.access_token}`
      );

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Revoke Instagram access token
   * @param userId - Instagram user ID to revoke
   * @returns {Promise<void>}
   */
  public async revokeAccess(userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('instagram_credentials')
        .delete()
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
    } catch (error) {
      throw new Error(`Failed to revoke access: ${error.message}`);
    }
  }
}

/**
 * Create Instagram API registration instance
 * @param config - Configuration options
 * @returns {InstagramApiRegistration} Registration instance
 */
export const createInstagramRegistration = (
  config: InstagramApiConfig
): InstagramApiRegistration => {
  return new InstagramApiRegistration(
    config.supabaseUrl,
    config.supabaseKey,
    {
      clientId: config.instagramClientId,
      clientSecret: config.instagramClientSecret,
      redirectUri: config.instagramRedirectUri,
    }
  );
};
```