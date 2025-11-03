```typescript
/**
 * @file gmailApi.ts
 * Gmail API setup and authentication utilities
 */

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { createClient } from '@supabase/supabase-js';

/**
 * Gmail API configuration interface
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
  private supabase;

  /**
   * Initialize Gmail service with OAuth2 credentials
   * @param config - Gmail API configuration
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
    
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || ''
    );
  }

  /**
   * Generate OAuth2 authorization URL
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
   * Exchange authorization code for tokens
   * @param code - Authorization code from OAuth2 callback
   * @returns OAuth2 tokens
   */
  public async getTokens(code: string): Promise<any> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      return tokens;
    } catch (error) {
      throw new Error(`Failed to get tokens: ${error}`);
    }
  }

  /**
   * Send email via Gmail API
   * @param to - Recipient email address
   * @param subject - Email subject
   * @param body - Email body content
   * @returns Message ID if successful
   */
  public async sendEmail(to: string, subject: string, body: string): Promise<string> {
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

      const res = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage
        }
      });

      return res.data.id;
    } catch (error) {
      throw new Error(`Failed to send email: ${error}`);
    }
  }

  /**
   * List emails from Gmail inbox
   * @param maxResults - Maximum number of emails to retrieve
   * @returns Array of email messages
   */
  public async listEmails(maxResults: number = 10): Promise<any[]> {
    try {
      const res = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults
      });

      const messages = await Promise.all(
        res.data.messages.map(async (message: any) => {
          const details = await this.gmail.users.messages.get({
            userId: 'me',
            id: message.id
          });
          return details.data;
        })
      );

      return messages;
    } catch (error) {
      throw new Error(`Failed to list emails: ${error}`);
    }
  }

  /**
   * Store Gmail credentials in Supabase
   * @param userId - User ID to associate credentials with
   * @param tokens - OAuth2 tokens to store
   */
  public async storeCredentials(userId: string, tokens: any): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('gmail_credentials')
        .upsert({
          user_id: userId,
          refresh_token: tokens.refresh_token,
          access_token: tokens.access_token,
          expiry_date: tokens.expiry_date
        });

      if (error) throw error;
    } catch (error) {
      throw new Error(`Failed to store credentials: ${error}`);
    }
  }

  /**
   * Load Gmail credentials from Supabase
   * @param userId - User ID to load credentials for
   * @returns OAuth2 tokens
   */
  public async loadCredentials(userId: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('gmail_credentials')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      
      if (data) {
        this.oauth2Client.setCredentials({
          refresh_token: data.refresh_token,
          access_token: data.access_token,
          expiry_date: data.expiry_date
        });
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to load credentials: ${error}`);
    }
  }
}

export default GmailService;
```