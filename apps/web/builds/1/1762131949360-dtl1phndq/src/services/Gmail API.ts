```typescript
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Base64 } from 'js-base64';

/**
 * Service class for interacting with the Gmail API
 */
export class GmailService {
  private readonly oauth2Client: OAuth2Client;
  private readonly gmail: any;

  /**
   * Creates an instance of the Gmail service
   * @param clientId - OAuth 2.0 client ID
   * @param clientSecret - OAuth 2.0 client secret
   * @param redirectUri - OAuth 2.0 redirect URI
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

    this.gmail = google.gmail({
      version: 'v1',
      auth: this.oauth2Client
    });
  }

  /**
   * Sets the access token for API requests
   * @param token - OAuth 2.0 access token
   */
  public setAccessToken(token: string): void {
    this.oauth2Client.setCredentials({
      access_token: token
    });
  }

  /**
   * Gets the Gmail authorization URL
   * @returns Authorization URL string
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
   * Gets an access token using an authorization code
   * @param code - Authorization code
   * @returns Promise resolving to token response
   */
  public async getToken(code: string): Promise<any> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      return tokens;
    } catch (error) {
      throw new Error(`Failed to get token: ${error.message}`);
    }
  }

  /**
   * Sends an email
   * @param to - Recipient email address
   * @param subject - Email subject
   * @param body - Email body content
   * @returns Promise resolving to the sent message
   */
  public async sendEmail(to: string, subject: string, body: string): Promise<any> {
    try {
      const email = [
        'Content-Type: text/plain; charset="UTF-8"\n',
        'MIME-Version: 1.0\n',
        'Content-Transfer-Encoding: 7bit\n',
        `To: ${to}\n`,
        `Subject: ${subject}\n\n`,
        body
      ].join('');

      const encodedEmail = Base64.encodeURI(email);

      const res = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedEmail
        }
      });

      return res.data;
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Lists messages in the user's mailbox
   * @param query - Search query (optional)
   * @param maxResults - Maximum number of results to return
   * @returns Promise resolving to list of messages
   */
  public async listMessages(query = '', maxResults = 10): Promise<any> {
    try {
      const res = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults
      });

      return res.data;
    } catch (error) {
      throw new Error(`Failed to list messages: ${error.message}`);
    }
  }

  /**
   * Gets a specific message by ID
   * @param messageId - ID of the message to retrieve
   * @returns Promise resolving to message details
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
   * Modifies labels on a message
   * @param messageId - ID of the message to modify
   * @param addLabels - Labels to add
   * @param removeLabels - Labels to remove
   * @returns Promise resolving to the modified message
   */
  public async modifyLabels(
    messageId: string, 
    addLabels: string[] = [], 
    removeLabels: string[] = []
  ): Promise<any> {
    try {
      const res = await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          addLabelIds: addLabels,
          removeLabelIds: removeLabels
        }
      });

      return res.data;
    } catch (error) {
      throw new Error(`Failed to modify labels: ${error.message}`);
    }
  }

  /**
   * Trashes a message
   * @param messageId - ID of the message to trash
   * @returns Promise resolving to the trashed message
   */
  public async trashMessage(messageId: string): Promise<any> {
    try {
      const res = await this.gmail.users.messages.trash({
        userId: 'me',
        id: messageId
      });

      return res.data;
    } catch (error) {
      throw new Error(`Failed to trash message: ${error.message}`);
    }
  }

  /**
   * Gets user profile information
   * @returns Promise resolving to user profile
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

export default GmailService;
```