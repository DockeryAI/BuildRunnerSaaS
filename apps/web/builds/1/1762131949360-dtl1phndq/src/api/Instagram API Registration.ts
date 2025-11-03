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
 * Class to handle Instagram API registration and authentication
 */
export class InstagramApiRegistration {
  private supabase: SupabaseClient;
  private credentials: InstagramCredentials;

  /**
   * Creates an instance of InstagramApiRegistration
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
   * Generates Instagram OAuth URL for user authorization
   * @returns {string} Authorization URL
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
   * Exchanges authorization code for access token
   * @param code - Authorization code from Instagram callback
   * @returns {Promise<InstagramAuthResponse>} Authentication response
   * @throws {Error} If token exchange fails
   */
  public async exchangeCodeForToken(code: string): Promise<InstagramAuthResponse> {
    try {
      const response = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: this.credentials.clientId,
          client_secret: this.credentials.clientSecret,
          grant_type: 'authorization_code',
          redirect_uri: this.credentials.redirectUri,
          code
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to exchange code: ${response.statusText}`);
      }

      const data = await response.json();
      return this.storeAuthCredentials(data);
    } catch (error) {
      throw new Error(`Token exchange failed: ${error.message}`);
    }
  }

  /**
   * Stores Instagram authentication credentials in Supabase
   * @param authData - Authentication response from Instagram
   * @returns {Promise<InstagramAuthResponse>} Stored authentication data
   * @throws {Error} If storage fails
   */
  private async storeAuthCredentials(
    authData: InstagramAuthResponse
  ): Promise<InstagramAuthResponse> {
    try {
      const { data, error } = await this.supabase
        .from('instagram_credentials')
        .upsert({
          access_token: authData.access_token,
          user_id: authData.user_id,
          updated_at: new Date().toISOString()
        })
        .single();

      if (error) {
        throw new Error(`Failed to store credentials: ${error.message}`);
      }

      return data;
    } catch (error) {
      throw new Error(`Credential storage failed: ${error.message}`);
    }
  }

  /**
   * Validates stored Instagram credentials
   * @param userId - Instagram user ID
   * @returns {Promise<boolean>} Validation result
   */
  public async validateCredentials(userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('instagram_credentials')
        .select('access_token')
        .eq('user_id', userId)
        .single();

      if (error || !data?.access_token) {
        return false;
      }

      const response = await fetch(
        `https://graph.instagram.com/me?access_token=${data.access_token}`
      );

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Revokes Instagram API access and removes stored credentials
   * @param userId - Instagram user ID
   * @returns {Promise<void>}
   * @throws {Error} If revocation fails
   */
  public async revokeAccess(userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('instagram_credentials')
        .delete()
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to revoke access: ${error.message}`);
      }
    } catch (error) {
      throw new Error(`Access revocation failed: ${error.message}`);
    }
  }
}

/**
 * Creates and configures Instagram API registration instance
 * @param config - Configuration options
 * @returns {InstagramApiRegistration} Configured instance
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
      redirectUri: config.instagramRedirectUri
    }
  );
};
```