import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Base64 } from 'js-base64';

/**
 * Service for interacting with the Gmail API
 */
export class GmailService {
  private auth: OAuth2Client;
  private gmail: any;

  /**
   * Creates an instance of GmailService
   * @param clientId - OAuth 2.0 client ID
   * @param clientSecret - OAuth 2.0 client secret
   * @param redirectUri - OAuth 2.0 redirect URI
   * @param refreshToken - OAuth 2.0 refresh token
   */
  constructor(
    private clientId: string,
    private clientSecret: string,
    private redirectUri: string,
    private refreshToken?: string
  ) {
    this.auth = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );

    if (this.refreshToken) {
      this.auth.setCredentials({
        refresh_token: this.refreshToken
      });
    }

    this.gmail = google.gmail({ version: 'v1', auth: this.auth });
  }

  /**
   * Generates OAuth2 URL for authentication
   * @param scopes - Array of OAuth scopes
   * @returns Authorization URL
   */
  public getAuthUrl(scopes: string[]): string {
    return this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
  }

  /**
   * Gets OAuth2 tokens from authorization code
   * @param code - Authorization code
   * @returns OAuth2 tokens
   */
  public async getTokens(code: string): Promise<any> {
    try {
      const { tokens } = await this.auth.getToken(code);
      this.auth.setCredentials(tokens);
      return tokens;
    } catch (error) {
      throw new Error(`Failed to get tokens: ${error.message}`);
    }
  }

  /**
   * Sends an email
   * @param to - Recipient email address
   * @param subject - Email subject
   * @param body - Email body content
   * @param isHtml - Whether body content is HTML
   * @returns Message ID
   */
  public async sendEmail(
    to: string,
    subject: string,
    body: string,
    isHtml = false
  ): Promise<string> {
    try {
      const utf8Subject = `=?utf-8?B?${Base64.encode(subject)}?=`;
      const messageParts = [
        `To: ${to}`,
        'Content-Type: text/plain; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${utf8Subject}`,
        '',
        body
      ];

      if (isHtml) {
        messageParts[1] = 'Content-Type: text/html; charset=utf-8';
      }

      const message = messageParts.join('\n');
      const encodedMessage = Base64.encodeURI(message);

      const res = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage
        }
      });

      return res.data.id;
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Lists email messages
   * @param query - Search query
   * @param maxResults - Maximum number of results
   * @returns List of messages
   */
  public async listMessages(query = '', maxResults = 10): Promise<any[]> {
    try {
      const res = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults
      });

      return res.data.messages || [];
    } catch (error) {
      throw new Error(`Failed to list messages: ${error.message}`);
    }
  }

  /**
   * Gets email message details
   * @param messageId - Message ID
   * @returns Message details
   */
  public async getMessage(messageId: string): Promise<any> {
    try {
      const res = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId
      });

      return res.data;
    } catch (error) {
      throw new Error(`Failed to get message: ${error.message}`);
    }
  }

  /**
   * Creates a draft email
   * @param to - Recipient email address
   * @param subject - Email subject
   * @param body - Email body content
   * @param isHtml - Whether body content is HTML
   * @returns Draft ID
   */
  public async createDraft(
    to: string,
    subject: string,
    body: string,
    isHtml = false
  ): Promise<string> {
    try {
      const utf8Subject = `=?utf-8?B?${Base64.encode(subject)}?=`;
      const messageParts = [
        `To: ${to}`,
        'Content-Type: text/plain; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${utf8Subject}`,
        '',
        body
      ];

      if (isHtml) {
        messageParts[1] = 'Content-Type: text/html; charset=utf-8';
      }

      const message = messageParts.join('\n');
      const encodedMessage = Base64.encodeURI(message);

      const res = await this.gmail.users.drafts.create({
        userId: 'me',
        requestBody: {
          message: {
            raw: encodedMessage
          }
        }
      });

      return res.data.id;
    } catch (error) {
      throw new Error(`Failed to create draft: ${error.message}`);
    }
  }

  /**
   * Deletes an email message
   * @param messageId - Message ID
   * @returns void
   */
  public async deleteMessage(messageId: string): Promise<void> {
    try {
      await this.gmail.users.messages.delete({
        userId: 'me',
        id: messageId
      });
    } catch (error) {
      throw new Error(`Failed to delete message: ${error.message}`);
    }
  }

  /**
   * Gets user profile information
   * @returns User profile
   */
  public async getProfile(): Promise<any> {
    try {
      const res = await this.gmail.users.getProfile({
        userId: 'me'
      });

      return res.data;
    } catch (error) {
      throw new Error(`Failed to get profile: ${error.message}`);
    }
  }
}