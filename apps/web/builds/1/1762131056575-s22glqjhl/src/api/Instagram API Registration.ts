```typescript
/**
 * @file instagramRegistration.ts
 * @description Handler for Instagram API registration and authentication
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { InstagramAuthResponse, InstagramUserProfile } from './types';

/**
 * Configuration interface for Instagram API
 */
interface InstagramConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
}

/**
 * Instagram API registration and auth handler class
 */
export class InstagramRegistration {
  private supabase: SupabaseClient;
  private config: InstagramConfig;

  /**
   * @param supabaseUrl - Supabase project URL
   * @param supabaseKey - Supabase project API key
   * @param instagramConfig - Instagram API configuration
   */
  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    instagramConfig: InstagramConfig
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.config = instagramConfig;
  }

  /**
   * Generates Instagram OAuth authorization URL
   * @returns {string} Authorization URL
   */
  public getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope.join(' '),
      response_type: 'code'
    });

    return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchanges authorization code for access token
   * @param code - Authorization code from Instagram
   * @returns {Promise<InstagramAuthResponse>} Authentication response
   * @throws {Error} If exchange fails
   */
  public async exchangeCodeForToken(code: string): Promise<InstagramAuthResponse> {
    try {
      const response = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          grant_type: 'authorization_code',
          redirect_uri: this.config.redirectUri,
          code
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to exchange code: ${response.statusText}`);
      }

      const data: InstagramAuthResponse = await response.json();
      await this.storeAuthData(data);
      return data;
    } catch (error) {
      throw new Error(`Token exchange failed: ${error.message}`);
    }
  }

  /**
   * Retrieves user profile from Instagram
   * @param accessToken - Instagram access token
   * @returns {Promise<InstagramUserProfile>} User profile data
   * @throws {Error} If profile fetch fails
   */
  public async getUserProfile(accessToken: string): Promise<InstagramUserProfile> {
    try {
      const response = await fetch(
        `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Profile fetch failed: ${error.message}`);
    }
  }

  /**
   * Stores authentication data in Supabase
   * @param authData - Instagram authentication response data
   * @returns {Promise<void>}
   * @throws {Error} If storage fails
   */
  private async storeAuthData(authData: InstagramAuthResponse): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('instagram_auth')
        .upsert({
          user_id: authData.user_id,
          access_token: authData.access_token,
          created_at: new Date().toISOString()
        });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      throw new Error(`Failed to store auth data: ${error.message}`);
    }
  }

  /**
   * Revokes Instagram access token
   * @param accessToken - Instagram access token to revoke
   * @returns {Promise<void>}
   * @throws {Error} If revocation fails
   */
  public async revokeAccess(accessToken: string): Promise<void> {
    try {
      const response = await fetch(
        `https://graph.instagram.com/access_token/revoke?access_token=${accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Failed to revoke token: ${response.statusText}`);
      }

      await this.removeAuthData(accessToken);
    } catch (error) {
      throw new Error(`Access revocation failed: ${error.message}`);
    }
  }

  /**
   * Removes authentication data from Supabase
   * @param accessToken - Instagram access token to remove
   * @returns {Promise<void>}
   * @throws {Error} If removal fails
   */
  private async removeAuthData(accessToken: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('instagram_auth')
        .delete()
        .match({ access_token: accessToken });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      throw new Error(`Failed to remove auth data: ${error.message}`);
    }
  }
}

/**
 * Type definitions
 */
export interface InstagramAuthResponse {
  access_token: string;
  user_id: string;
}

export interface InstagramUserProfile {
  id: string;
  username: string;
  account_type: string;
}
```