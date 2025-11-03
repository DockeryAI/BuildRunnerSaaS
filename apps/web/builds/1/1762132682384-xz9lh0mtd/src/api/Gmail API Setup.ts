```typescript
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { GaxiosResponse } from 'gaxios';

/**
 * Gmail API configuration and authentication types
 */
interface GmailConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken?: string;
}

interface GmailAuthResponse {
  client: OAuth2Client;
  url?: string;
}

interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload?: {
    headers: {name: string, value: string}[];
    body: {data?: string};
    parts?: any[];
  };
}

/**
 * Gmail API service class for handling Gmail operations
 */
export class GmailService {
  private oauth2Client: OAuth2Client;
  private gmail: any;

  /**
   * Initialize Gmail service with OAuth2 credentials
   * @param {GmailConfig} config - Gmail API configuration
   */
  constructor(private readonly config: GmailConfig) {
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
   * Get OAuth2 authentication URL and client
   * @returns {Promise<GmailAuthResponse>} Authentication URL and OAuth client
   */
  async getAuthUrl(): Promise<GmailAuthResponse> {
    try {
      const url = this.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/gmail.modify']
      });

      return {
        client: this.oauth2Client,
        url
      };
    } catch (error) {
      throw new Error(`Failed to generate auth URL: ${error.message}`);
    }
  }

  /**
   * Get OAuth2 tokens from authorization code
   * @param {string} code - Authorization code from OAuth flow
   * @returns {Promise<any>} OAuth tokens
   */
  async getTokens(code: string): Promise<any> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      return tokens;
    } catch (error) {
      throw new Error(`Failed to get tokens: ${error.message}`);
    }
  }

  /**
   * List messages in Gmail inbox
   * @param {string} query - Search query
   * @param {number} maxResults - Maximum number of results
   * @returns {Promise<GmailMessage[]>} List of messages
   */
  async listMessages(query = '', maxResults = 10): Promise<GmailMessage[]> {
    try {
      const response: GaxiosResponse = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults
      });

      const messages = await Promise.all(
        response.data.messages.map(async (message: {id: string}) => {
          const details: GaxiosResponse = await this.gmail.users.messages.get({
            userId: 'me',
            id: message.id
          });
          return details.data;
        })
      );

      return messages;
    } catch (error) {
      throw new Error(`Failed to list messages: ${error.message}`);
    }
  }

  /**
   * Send email using Gmail API
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} body - Email body
   * @returns {Promise<string>} Message ID
   */
  async sendEmail(to: string, subject: string, body: string): Promise<string> {
    try {
      const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
      const messageParts = [
        `To: ${to}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${utf8Subject}`,
        '',
        body
      ];
      const message = messageParts.join('\n');
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

      return response.data.id;
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Modify message labels
   * @param {string} messageId - Message ID
   * @param {string[]} addLabels - Labels to add
   * @param {string[]} removeLabels - Labels to remove
   * @returns {Promise<GmailMessage>} Updated message
   */
  async modifyLabels(
    messageId: string,
    addLabels: string[] = [],
    removeLabels: string[] = []
  ): Promise<GmailMessage> {
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
   * Get message by ID
   * @param {string} messageId - Message ID
   * @returns {Promise<GmailMessage>} Message details
   */
  async getMessage(messageId: string): Promise<GmailMessage> {
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
}
```