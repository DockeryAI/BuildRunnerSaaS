```typescript
/**
 * @fileoverview Gmail Calendar Authentication Service
 * Handles OAuth2 authentication flow for Gmail Calendar API
 */

import { OAuth2Client, Credentials } from 'google-auth-library';
import { google } from 'googleapis';

export interface CalendarAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
}

export class GmailCalendarAuth {
  private oauth2Client: OAuth2Client;
  private static instance: GmailCalendarAuth;

  /**
   * Creates an instance of GmailCalendarAuth.
   * @param {CalendarAuthConfig} config - OAuth2 configuration
   */
  private constructor(config: CalendarAuthConfig) {
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );
  }

  /**
   * Gets singleton instance of GmailCalendarAuth
   * @param {CalendarAuthConfig} config - OAuth2 configuration
   * @returns {GmailCalendarAuth} Singleton instance
   */
  public static getInstance(config: CalendarAuthConfig): GmailCalendarAuth {
    if (!GmailCalendarAuth.instance) {
      GmailCalendarAuth.instance = new GmailCalendarAuth(config);
    }
    return GmailCalendarAuth.instance;
  }

  /**
   * Generates OAuth2 authorization URL
   * @returns {string} Authorization URL
   */
  public generateAuthUrl(): string {
    try {
      return this.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar'],
        prompt: 'consent'
      });
    } catch (error) {
      throw new Error(`Failed to generate auth URL: ${error.message}`);
    }
  }

  /**
   * Gets OAuth2 tokens using authorization code
   * @param {string} code - Authorization code
   * @returns {Promise<Credentials>} OAuth2 credentials
   */
  public async getTokens(code: string): Promise<Credentials> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      return tokens;
    } catch (error) {
      throw new Error(`Failed to get tokens: ${error.message}`);
    }
  }

  /**
   * Sets OAuth2 credentials
   * @param {Credentials} credentials - OAuth2 credentials
   */
  public setCredentials(credentials: Credentials): void {
    try {
      this.oauth2Client.setCredentials(credentials);
    } catch (error) {
      throw new Error(`Failed to set credentials: ${error.message}`);
    }
  }

  /**
   * Refreshes access token using refresh token
   * @returns {Promise<Credentials>} New OAuth2 credentials
   */
  public async refreshAccessToken(): Promise<Credentials> {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      this.oauth2Client.setCredentials(credentials);
      return credentials;
    } catch (error) {
      throw new Error(`Failed to refresh access token: ${error.message}`);
    }
  }

  /**
   * Gets OAuth2 client instance
   * @returns {OAuth2Client} OAuth2 client
   */
  public getClient(): OAuth2Client {
    return this.oauth2Client;
  }

  /**
   * Revokes OAuth2 tokens
   * @returns {Promise<void>}
   */
  public async revokeTokens(): Promise<void> {
    try {
      const credentials = this.oauth2Client.credentials;
      if (credentials.access_token) {
        await this.oauth2Client.revokeToken(credentials.access_token);
      }
      if (credentials.refresh_token) {
        await this.oauth2Client.revokeToken(credentials.refresh_token);
      }
      this.oauth2Client.setCredentials({});
    } catch (error) {
      throw new Error(`Failed to revoke tokens: ${error.message}`);
    }
  }

  /**
   * Checks if client has valid credentials
   * @returns {boolean} True if credentials exist and are valid
   */
  public hasValidCredentials(): boolean {
    const credentials = this.oauth2Client.credentials;
    return !!(
      credentials &&
      credentials.access_token &&
      (!credentials.expiry_date || credentials.expiry_date > Date.now())
    );
  }
}

export default GmailCalendarAuth;
```