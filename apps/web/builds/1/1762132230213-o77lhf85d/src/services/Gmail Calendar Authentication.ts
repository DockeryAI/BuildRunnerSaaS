```typescript
/**
 * @fileoverview Gmail Calendar Authentication Service
 */

import { OAuth2Client, Credentials } from 'google-auth-library';
import { calendar_v3, google } from 'googleapis';

/**
 * Configuration interface for Gmail Calendar authentication
 */
interface GCalAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
}

/**
 * Service for handling Gmail Calendar authentication and authorization
 */
export class GCalAuthService {
  private oauth2Client: OAuth2Client;
  private calendar: calendar_v3.Calendar;

  /**
   * Creates an instance of GCalAuthService
   * @param config - Authentication configuration options
   */
  constructor(config: GCalAuthConfig) {
    try {
      this.oauth2Client = new google.auth.OAuth2(
        config.clientId,
        config.clientSecret,
        config.redirectUri
      );

      this.calendar = google.calendar({
        version: 'v3',
        auth: this.oauth2Client
      });
    } catch (error) {
      throw new Error(`Failed to initialize GCalAuthService: ${error.message}`);
    }
  }

  /**
   * Generates the authorization URL for Gmail Calendar access
   * @returns The authorization URL string
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
   * Exchanges authorization code for access tokens
   * @param code - Authorization code from OAuth2 callback
   * @returns Promise resolving to OAuth2 credentials
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
   * Sets OAuth2 credentials for authenticated requests
   * @param credentials - OAuth2 credentials
   */
  public setCredentials(credentials: Credentials): void {
    try {
      this.oauth2Client.setCredentials(credentials);
    } catch (error) {
      throw new Error(`Failed to set credentials: ${error.message}`);
    }
  }

  /**
   * Refreshes the access token using the refresh token
   * @returns Promise resolving to new OAuth2 credentials
   */
  public async refreshAccessToken(): Promise<Credentials | null> {
    try {
      if (!this.oauth2Client.credentials.refresh_token) {
        return null;
      }

      const { credentials } = await this.oauth2Client.refreshAccessToken();
      this.oauth2Client.setCredentials(credentials);
      return credentials;
    } catch (error) {
      throw new Error(`Failed to refresh access token: ${error.message}`);
    }
  }

  /**
   * Revokes the current OAuth2 tokens
   */
  public async revokeTokens(): Promise<void> {
    try {
      if (this.oauth2Client.credentials.access_token) {
        await this.oauth2Client.revokeToken(
          this.oauth2Client.credentials.access_token
        );
      }
      this.oauth2Client.credentials = {};
    } catch (error) {
      throw new Error(`Failed to revoke tokens: ${error.message}`);
    }
  }

  /**
   * Checks if the current access token is valid
   * @returns Boolean indicating token validity
   */
  public async isTokenValid(): Promise<boolean> {
    try {
      const { credentials } = this.oauth2Client;
      
      if (!credentials.access_token) {
        return false;
      }

      const tokenInfo = await this.oauth2Client.getTokenInfo(
        credentials.access_token
      );
      
      return Boolean(tokenInfo.expiry_date && tokenInfo.expiry_date > Date.now());
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets the current OAuth2 credentials
   * @returns Current credentials object
   */
  public getCredentials(): Credentials {
    return this.oauth2Client.credentials;
  }

  /**
   * Gets the calendar service instance
   * @returns Google Calendar API service instance
   */
  public getCalendarService(): calendar_v3.Calendar {
    return this.calendar;
  }
}

export default GCalAuthService;
```