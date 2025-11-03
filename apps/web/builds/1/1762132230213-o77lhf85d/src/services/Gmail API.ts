```typescript
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Base64 } from 'js-base64';

/**
 * Service class for interacting with Gmail API
 */
export class GmailService {
  private oauth2Client: OAuth2Client;
  private gmail: any;

  /**
   * Creates an instance of GmailService
   * @param {string} clientId - OAuth 2.0 client ID
   * @param {string} clientSecret - OAuth 2.0 client secret
   * @param {string} redirectUri - OAuth 2.0 redirect URI
   */
  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly redirectUri: string
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  /**
   * Sets credentials for OAuth2 client
   * @param {string} accessToken - OAuth2 access token
   * @param {string} refreshToken - OAuth2 refresh token
   */
  public setCredentials(accessToken: string, refreshToken: string): void {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });
  }

  /**
   * Generates OAuth2 authentication URL
   * @returns {string} Authentication URL
   */
  public getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes
    });
  }

  /**
   * Gets OAuth2 tokens from authorization code
   * @param {string} code - Authorization code
   * @returns {Promise<{access_token: string, refresh_token: string}>} Token response
   */
  public async getTokens(code: string): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      return {
        access_token: tokens.access_token!,
        refresh_token: tokens.refresh_token!
      };
    } catch (error) {
      throw new Error(`Failed to get tokens: ${error}`);
    }
  }

  /**
   * Sends an email
   * @param {string} to - Recipient email address
   * @param {string} subject - Email subject
   * @param {string} body - Email body
   * @param {boolean} isHtml - Whether body is HTML
   * @returns {Promise<string>} Message ID
   */
  public async sendEmail(
    to: string,
    subject: string,
    body: string,
    isHtml: boolean = false
  ): Promise<string> {
    try {
      const contentType = isHtml ? 'text/html' : 'text/plain';
      const email = [
        'Content-Type: text/plain; charset="UTF-8"',
        'MIME-Version: 1.0',
        'Content-Transfer-Encoding: 7bit',
        `to: ${to}`,
        `subject: ${subject}`,
        '',
        body
      ].join('\n');

      const encodedEmail = Base64.encodeURI(email);

      const res = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedEmail
        }
      });

      return res.data.id;
    } catch (error) {
      throw new Error(`Failed to send email: ${error}`);
    }
  }

  /**
   * Lists email messages
   * @param {number} maxResults - Maximum number of messages to return
   * @returns {Promise<Array<{id: string, threadId: string}>>} List of messages
   */
  public async listMessages(maxResults: number = 100): Promise<Array<{
    id: string;
    threadId: string;
  }>> {
    try {
      const res = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults
      });
      return res.data.messages || [];
    } catch (error) {
      throw new Error(`Failed to list messages: ${error}`);
    }
  }

  /**
   * Gets a specific message
   * @param {string} messageId - ID of message to retrieve
   * @returns {Promise<any>} Message data
   */
  public async getMessage(messageId: string): Promise<any> {
    try {
      const res = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId
      });
      return res.data;
    } catch (error) {
      throw new Error(`Failed to get message: ${error}`);
    }
  }

  /**
   * Modifies labels of a message
   * @param {string} messageId - ID of message to modify
   * @param {string[]} addLabelIds - Labels to add
   * @param {string[]} removeLabelIds - Labels to remove
   * @returns {Promise<void>}
   */
  public async modifyMessageLabels(
    messageId: string,
    addLabelIds: string[] = [],
    removeLabelIds: string[] = []
  ): Promise<void> {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          addLabelIds,
          removeLabelIds
        }
      });
    } catch (error) {
      throw new Error(`Failed to modify message labels: ${error}`);
    }
  }

  /**
   * Trashes a message
   * @param {string} messageId - ID of message to trash
   * @returns {Promise<void>}
   */
  public async trashMessage(messageId: string): Promise<void> {
    try {
      await this.gmail.users.messages.trash({
        userId: 'me',
        id: messageId
      });
    } catch (error) {
      throw new Error(`Failed to trash message: ${error}`);
    }
  }

  /**
   * Gets user profile
   * @returns {Promise<{emailAddress: string, messagesTotal: number, threadsTotal: number}>}
   */
  public async getProfile(): Promise<{
    emailAddress: string;
    messagesTotal: number;
    threadsTotal: number;
  }> {
    try {
      const res = await this.gmail.users.getProfile({
        userId: 'me'
      });
      return res.data;
    } catch (error) {
      throw new Error(`Failed to get profile: ${error}`);
    }
  }
}
```