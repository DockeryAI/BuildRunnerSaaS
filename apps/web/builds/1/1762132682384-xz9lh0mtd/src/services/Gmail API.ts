```typescript
import { google, gmail_v1 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { JWT } from 'google-auth-library';

/**
 * Service for interacting with Gmail API
 */
export class GmailService {
  private gmail: gmail_v1.Gmail;
  private auth: OAuth2Client | JWT;

  /**
   * Creates an instance of GmailService
   * @param credentials - OAuth2 credentials
   * @param token - OAuth2 token
   */
  constructor(credentials: {
    client_id: string;
    client_secret: string;
    redirect_uri: string;
  }, token?: any) {
    this.auth = new google.auth.OAuth2(
      credentials.client_id,
      credentials.client_secret, 
      credentials.redirect_uri
    );

    if (token) {
      this.auth.setCredentials(token);
    }

    this.gmail = google.gmail({ version: 'v1', auth: this.auth });
  }

  /**
   * Gets Gmail authorization URL
   * @param scopes - OAuth2 scopes to request
   * @returns Authorization URL
   */
  public getAuthUrl(scopes: string[]): string {
    return this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: scopes
    });
  }

  /**
   * Gets OAuth2 token from authorization code
   * @param code - Authorization code
   * @returns OAuth2 token
   */
  public async getToken(code: string): Promise<any> {
    try {
      const { tokens } = await this.auth.getToken(code);
      this.auth.setCredentials(tokens);
      return tokens;
    } catch (error) {
      throw new Error(`Failed to get token: ${error.message}`);
    }
  }

  /**
   * Lists messages in user's Gmail inbox
   * @param query - Search query
   * @param maxResults - Maximum number of results
   * @returns List of messages
   */
  public async listMessages(query = '', maxResults = 10): Promise<gmail_v1.Schema$Message[]> {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults
      });

      return response.data.messages || [];
    } catch (error) {
      throw new Error(`Failed to list messages: ${error.message}`);
    }
  }

  /**
   * Gets message details by ID
   * @param messageId - Gmail message ID
   * @returns Message details
   */
  public async getMessage(messageId: string): Promise<gmail_v1.Schema$Message> {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get message: ${error.message}`);
    }
  }

  /**
   * Sends an email
   * @param options - Email options
   * @returns Sent message details
   */
  public async sendEmail(options: {
    to: string;
    subject: string;
    body: string;
  }): Promise<gmail_v1.Schema$Message> {
    try {
      const message = [
        'Content-Type: text/plain; charset="UTF-8"\n',
        'MIME-Version: 1.0\n',
        'Content-Transfer-Encoding: 7bit\n',
        `To: ${options.to}\n`,
        `Subject: ${options.subject}\n\n`,
        options.body
      ].join('');

      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Modifies message labels
   * @param messageId - Gmail message ID
   * @param addLabels - Labels to add
   * @param removeLabels - Labels to remove
   * @returns Modified message
   */
  public async modifyLabels(
    messageId: string,
    addLabels: string[] = [],
    removeLabels: string[] = []
  ): Promise<gmail_v1.Schema$Message> {
    try {
      const response = await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          addLabelIds: addLabels,
          removeLabelIds: removeLabels
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to modify labels: ${error.message}`);
    }
  }

  /**
   * Gets all labels in the user's mailbox
   * @returns List of labels
   */
  public async listLabels(): Promise<gmail_v1.Schema$Label[]> {
    try {
      const response = await this.gmail.users.labels.list({
        userId: 'me'
      });

      return response.data.labels || [];
    } catch (error) {
      throw new Error(`Failed to list labels: ${error.message}`);
    }
  }

  /**
   * Trashes a message
   * @param messageId - Gmail message ID
   * @returns Trashed message
   */
  public async trashMessage(messageId: string): Promise<gmail_v1.Schema$Message> {
    try {
      const response = await this.gmail.users.messages.trash({
        userId: 'me',
        id: messageId
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to trash message: ${error.message}`);
    }
  }
}

export default GmailService;
```