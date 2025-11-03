```typescript
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Credentials } from 'google-auth-library/build/src/auth/credentials';

/**
 * Service for interacting with the Gmail API
 */
export class GmailService {
  private static readonly SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify'
  ];

  private auth: OAuth2Client;
  private gmail: any;

  /**
   * Creates a new GmailService instance
   * @param clientId OAuth 2.0 client ID
   * @param clientSecret OAuth 2.0 client secret 
   * @param redirectUri OAuth 2.0 redirect URI
   */
  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly redirectUri: string
  ) {
    this.auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    this.gmail = google.gmail({ version: 'v1', auth: this.auth });
  }

  /**
   * Generates OAuth 2.0 URL for user authorization
   * @returns Authorization URL
   */
  public getAuthUrl(): string {
    return this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: GmailService.SCOPES
    });
  }

  /**
   * Sets credentials for Gmail API access
   * @param credentials OAuth 2.0 credentials
   */
  public setCredentials(credentials: Credentials): void {
    this.auth.setCredentials(credentials);
  }

  /**
   * Gets OAuth 2.0 tokens from authorization code
   * @param code Authorization code
   * @returns OAuth 2.0 tokens
   */
  public async getTokens(code: string): Promise<Credentials> {
    try {
      const { tokens } = await this.auth.getToken(code);
      return tokens;
    } catch (error) {
      throw new Error(`Failed to get tokens: ${error.message}`);
    }
  }

  /**
   * Sends an email
   * @param to Recipient email address
   * @param subject Email subject
   * @param body Email body (HTML supported)
   * @returns Message ID
   */
  public async sendEmail(to: string, subject: string, body: string): Promise<string> {
    try {
      const encodedMessage = Buffer.from(
        `To: ${to}\r\n` +
        `Subject: ${subject}\r\n` +
        'Content-Type: text/html; charset=utf-8\r\n\r\n' +
        body
      ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

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
   * Lists messages in the user's mailbox
   * @param query Search query (optional)
   * @param maxResults Maximum number of results (default: 10)
   * @returns List of messages
   */
  public async listMessages(query?: string, maxResults: number = 10): Promise<any[]> {
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
   * Gets a message by ID
   * @param messageId Message ID
   * @returns Message details
   */
  public async getMessage(messageId: string): Promise<any> {
    try {
      const res = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
      });

      return res.data;
    } catch (error) {
      throw new Error(`Failed to get message: ${error.message}`);
    }
  }

  /**
   * Modifies labels of a message
   * @param messageId Message ID
   * @param addLabelIds Labels to add
   * @param removeLabelIds Labels to remove
   */
  public async modifyLabels(
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
      throw new Error(`Failed to modify labels: ${error.message}`);
    }
  }

  /**
   * Moves a message to trash
   * @param messageId Message ID
   */
  public async trashMessage(messageId: string): Promise<void> {
    try {
      await this.gmail.users.messages.trash({
        userId: 'me',
        id: messageId
      });
    } catch (error) {
      throw new Error(`Failed to trash message: ${error.message}`);
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
```