/**
 * @module AccessTokenHandler
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Configuration interface for access token handling
 */
interface TokenConfig {
  supabaseUrl: string;
  supabaseKey: string;
  tokenExpiryMinutes?: number;
}

/**
 * Token data structure
 */
interface TokenData {
  token: string;
  expires_at: Date;
  user_id: string;
}

/**
 * Handles access token operations including creation, validation and refresh
 */
export class AccessTokenHandler {
  private supabase: SupabaseClient;
  private tokenExpiryMinutes: number;

  /**
   * Creates an instance of AccessTokenHandler
   * @param {TokenConfig} config - Configuration options
   */
  constructor(config: TokenConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    this.tokenExpiryMinutes = config.tokenExpiryMinutes || 60;
  }

  /**
   * Generates a new access token
   * @param {string} userId - User ID to generate token for
   * @returns {Promise<TokenData>} Generated token data
   * @throws {Error} If token generation fails
   */
  public async generateToken(userId: string): Promise<TokenData> {
    try {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + this.tokenExpiryMinutes);

      const { data, error } = await this.supabase
        .from('access_tokens')
        .insert([
          {
            user_id: userId,
            token: this.generateRandomToken(),
            expires_at: expiresAt.toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      return data as TokenData;
    } catch (error) {
      throw new Error(`Failed to generate token: ${error.message}`);
    }
  }

  /**
   * Validates an existing access token
   * @param {string} token - Token to validate
   * @returns {Promise<boolean>} Validation result
   */
  public async validateToken(token: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('access_tokens')
        .select()
        .eq('token', token)
        .single();

      if (error) return false;

      const expiresAt = new Date(data.expires_at);
      return expiresAt > new Date();
    } catch {
      return false;
    }
  }

  /**
   * Refreshes an existing access token
   * @param {string} token - Token to refresh
   * @returns {Promise<TokenData>} New token data
   * @throws {Error} If token refresh fails
   */
  public async refreshToken(token: string): Promise<TokenData> {
    try {
      const { data: oldToken, error: fetchError } = await this.supabase
        .from('access_tokens')
        .select()
        .eq('token', token)
        .single();

      if (fetchError) throw new Error('Invalid token');

      const newExpiresAt = new Date();
      newExpiresAt.setMinutes(newExpiresAt.getMinutes() + this.tokenExpiryMinutes);

      const { data: newToken, error: updateError } = await this.supabase
        .from('access_tokens')
        .update({
          token: this.generateRandomToken(),
          expires_at: newExpiresAt.toISOString()
        })
        .eq('token', token)
        .select()
        .single();

      if (updateError) throw updateError;

      return newToken as TokenData;
    } catch (error) {
      throw new Error(`Failed to refresh token: ${error.message}`);
    }
  }

  /**
   * Revokes an access token
   * @param {string} token - Token to revoke
   * @returns {Promise<void>}
   * @throws {Error} If token revocation fails
   */
  public async revokeToken(token: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('access_tokens')
        .delete()
        .eq('token', token);

      if (error) throw error;
    } catch (error) {
      throw new Error(`Failed to revoke token: ${error.message}`);
    }
  }

  /**
   * Generates a random token string
   * @returns {string} Random token
   * @private
   */
  private generateRandomToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Cleans up expired tokens
   * @returns {Promise<void>}
   * @throws {Error} If cleanup fails
   */
  public async cleanupExpiredTokens(): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('access_tokens')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) throw error;
    } catch (error) {
      throw new Error(`Failed to cleanup expired tokens: ${error.message}`);
    }
  }
}

// Export types
export type { TokenConfig, TokenData };