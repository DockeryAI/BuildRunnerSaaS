```typescript
/**
 * @file InstagramApiRegistration.ts
 * @description Handles Instagram API registration and authentication
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config';

interface InstagramCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface InstagramTokenResponse {
  access_token: string;
  user_id: string;
}

interface InstagramUser {
  id: string;
  username: string;
  account_type: string;
}

export class InstagramApiRegistration {
  private supabase: SupabaseClient;
  private credentials: InstagramCredentials;

  /**
   * Initialize Instagram API registration
   * @param credentials Instagram API credentials
   */
  constructor(credentials: InstagramCredentials) {
    this.credentials = credentials;
    this.supabase = createClient(
      config.supabase.url,
      config.supabase.key
    );
  }

  /**
   * Generate Instagram authorization URL
   * @returns Authorization URL string
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
   * @param code Authorization code from Instagram
   * @returns Instagram token response
   * @throws Error if token exchange fails
   */
  public async exchangeCodeForToken(code: string): Promise<InstagramTokenResponse> {
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
        throw new Error('Failed to exchange code for token');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Token exchange failed: ${error.message}`);
    }
  }

  /**
   * Get Instagram user details
   * @param accessToken Instagram access token
   * @returns Instagram user details
   * @throws Error if user details fetch fails
   */
  public async getUserDetails(accessToken: string): Promise<InstagramUser> {
    try {
      const response = await fetch(
        `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${accessToken}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`User details fetch failed: ${error.message}`);
    }
  }

  /**
   * Store Instagram credentials in Supabase
   * @param userId Supabase user ID
   * @param instagramData Instagram user and token data
   * @throws Error if storage fails
   */
  public async storeCredentials(
    userId: string,
    instagramData: InstagramTokenResponse & InstagramUser
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('instagram_credentials')
        .upsert({
          user_id: userId,
          instagram_user_id: instagramData.id,
          instagram_username: instagramData.username,
          access_token: instagramData.access_token,
          account_type: instagramData.account_type,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      throw new Error(`Failed to store credentials: ${error.message}`);
    }
  }

  /**
   * Complete Instagram registration flow
   * @param code Authorization code from Instagram
   * @param userId Supabase user ID
   * @throws Error if registration fails
   */
  public async completeRegistration(code: string, userId: string): Promise<void> {
    try {
      const tokenData = await this.exchangeCodeForToken(code);
      const userData = await this.getUserDetails(tokenData.access_token);
      
      await this.storeCredentials(userId, {
        ...tokenData,
        ...userData
      });
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }
}

export default InstagramApiRegistration;
```