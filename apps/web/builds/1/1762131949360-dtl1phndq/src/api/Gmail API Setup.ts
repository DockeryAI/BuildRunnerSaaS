```typescript
/**
 * @file gmailSetup.ts
 * @description Gmail API setup and authentication utilities
 */

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { createClient } from '@supabase/supabase-js';

interface GmailConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken?: string;
}

interface GmailSetupResponse {
  success: boolean;
  client?: OAuth2Client;
  error?: Error;
}

/**
 * Gmail API client configuration
 */
const GMAIL_CONFIG: GmailConfig = {
  clientId: process.env.GMAIL_CLIENT_ID || '',
  clientSecret: process.env.GMAIL_CLIENT_SECRET || '',
  redirectUri: process.env.GMAIL_REDIRECT_URI || '',
};

/**
 * Supabase client instance
 */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

/**
 * Creates and configures Gmail API OAuth2 client
 * @param config - Gmail configuration options
 * @returns Promise resolving to GmailSetupResponse
 */
export async function setupGmailClient(
  config: GmailConfig = GMAIL_CONFIG
): Promise<GmailSetupResponse> {
  try {
    if (!config.clientId || !config.clientSecret || !config.redirectUri) {
      throw new Error('Missing required Gmail configuration');
    }

    const oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret, 
      config.redirectUri
    );

    if (config.refreshToken) {
      oauth2Client.setCredentials({
        refresh_token: config.refreshToken
      });
    }

    return {
      success: true,
      client: oauth2Client
    };

  } catch (error) {
    console.error('Gmail setup error:', error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error occurred')
    };
  }
}

/**
 * Generates Gmail OAuth2 authorization URL
 * @param oauth2Client - Configured OAuth2 client
 * @returns Authorization URL string
 */
export function getAuthUrl(oauth2Client: OAuth2Client): string {
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
}

/**
 * Exchanges authorization code for tokens
 * @param oauth2Client - Configured OAuth2 client
 * @param code - Authorization code
 * @returns Promise resolving to token response
 */
export async function getTokensFromCode(
  oauth2Client: OAuth2Client,
  code: string
) {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    if (tokens.refresh_token) {
      // Store refresh token in Supabase
      const { error } = await supabase
        .from('gmail_tokens')
        .upsert({ 
          refresh_token: tokens.refresh_token,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    }

    return tokens;

  } catch (error) {
    console.error('Error getting tokens:', error);
    throw error;
  }
}

/**
 * Refreshes access token using stored refresh token
 * @param oauth2Client - Configured OAuth2 client
 * @returns Promise resolving to new credentials
 */
export async function refreshAccessToken(
  oauth2Client: OAuth2Client
): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('gmail_tokens')
      .select('refresh_token')
      .single();

    if (error) throw error;
    if (!data?.refresh_token) throw new Error('No refresh token found');

    oauth2Client.setCredentials({
      refresh_token: data.refresh_token
    });

    await oauth2Client.refreshAccessToken();

  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}

/**
 * Revokes Gmail OAuth2 access
 * @param oauth2Client - Configured OAuth2 client
 */
export async function revokeAccess(
  oauth2Client: OAuth2Client
): Promise<void> {
  try {
    await oauth2Client.revokeCredentials();
    
    const { error } = await supabase
      .from('gmail_tokens')
      .delete()
      .match({ refresh_token: oauth2Client.credentials.refresh_token });

    if (error) throw error;

  } catch (error) {
    console.error('Error revoking access:', error);
    throw error;
  }
}

export default {
  setupGmailClient,
  getAuthUrl,
  getTokensFromCode, 
  refreshAccessToken,
  revokeAccess
};
```