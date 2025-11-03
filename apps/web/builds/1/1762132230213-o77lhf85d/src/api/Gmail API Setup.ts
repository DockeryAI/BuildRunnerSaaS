```typescript
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { GaxiosResponse } from 'gaxios';

/**
 * Configuration interface for Gmail API credentials
 */
interface GmailConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken?: string;
}

/**
 * Gmail API service wrapper class
 */
export class GmailService {
  private oauth2Client: OAuth2Client;
  private gmail: any;

  /**
   * Creates a new GmailService instance
   * @param {GmailConfig} config - Gmail API configuration object
   */
  constructor(config: GmailConfig) {
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    if (config.refreshToken) {
      this.oauth2Client.setCredentials({
        refresh_token: config.refreshToken
      });
    }

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  /**
   * Generates OAuth2 authentication URL
   * @param {string[]} scopes - Array of required Gmail API scopes
   * @returns {string} Authentication URL
   */
  getAuthUrl(scopes: string[]): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
  }

  /**
   * Exchanges authorization code for tokens
   * @param {string} code - Authorization code from OAuth2 callback
   * @returns {Promise<any>} Token response
   * @throws {Error} If token exchange fails
   */
  async getTokens(code: string): Promise<any> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      return tokens;
    } catch (error) {
      throw new Error(`Failed to exchange code for tokens: ${error.message}`);
    }
  }

  /**
   * Sends an email using Gmail API
   * @param {string} to - Recipient email address
   * @param {string} subject - Email subject
   * @param {string} body - Email body content
   * @param {boolean} isHtml - Whether body content is HTML
   * @returns {Promise<string>} Message ID of sent email
   * @throws {Error} If sending email fails
   */
  async sendEmail(
    to: string,
    subject: string,
    body: string,
    isHtml: boolean = false
  ): Promise<string> {
    try {
      const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
      const messageParts = [
        `To: ${to}`,
        'From: me',
        'Content-Type: text/plain; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${utf8Subject}`,
        '',
        body,
      ];

      if (isHtml) {
        messageParts[2] = 'Content-Type: text/html; charset=utf-8';
      }

      const message = messageParts.join('\n');
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const res: GaxiosResponse<any> = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      return res.data.id;
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Lists messages in the user's mailbox
   * @param {number} maxResults - Maximum number of messages to return
   * @returns {Promise<any>} List of messages
   * @throws {Error} If fetching messages fails
   */
  async listMessages(maxResults: number = 10): Promise<any> {
    try {
      const response: GaxiosResponse<any> = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to list messages: ${error.message}`);
    }
  }

  /**
   * Gets a specific message by ID
   * @param {string} messageId - ID of the message to retrieve
   * @returns {Promise<any>} Message data
   * @throws {Error} If fetching message fails
   */
  async getMessage(messageId: string): Promise<any> {
    try {
      const response: GaxiosResponse<any> = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get message: ${error.message}`);
    }
  }

  /**
   * Refreshes access token using refresh token
   * @returns {Promise<string>} New access token
   * @throws {Error} If token refresh fails
   */
  async refreshAccessToken(): Promise<string> {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      return credentials.access_token as string;
    } catch (error) {
      throw new Error(`Failed to refresh access token: ${error.message}`);
    }
  }
}

/**
 * Creates and configures Gmail service instance
 * @param {GmailConfig} config - Gmail API configuration
 * @returns {GmailService} Configured Gmail service instance
 */
export const createGmailService = (config: GmailConfig): GmailService => {
  return new GmailService(config);
};
```