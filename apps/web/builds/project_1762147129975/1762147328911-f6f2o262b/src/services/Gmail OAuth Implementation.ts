/**
 * @file GmailOAuth.ts
 * Gmail OAuth service implementation
 */

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

interface GmailOAuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

export class GmailOAuthService {
  private static instance: GmailOAuthService;
  private config: OAuthConfig;
  private state: GmailOAuthState;

  private constructor() {
    this.config = {
      clientId: process.env.REACT_APP_GMAIL_CLIENT_ID || '',
      clientSecret: process.env.REACT_APP_GMAIL_CLIENT_SECRET || '',
      redirectUri: `${window.location.origin}/oauth/callback`,
      scope: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.modify'
      ]
    };

    this.state = {
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      expiresAt: null
    };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): GmailOAuthService {
    if (!GmailOAuthService.instance) {
      GmailOAuthService.instance = new GmailOAuthService();
    }
    return GmailOAuthService.instance;
  }

  /**
   * Initiate OAuth flow
   */
  public async authorize(): Promise<void> {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scope.join(' '),
      access_type: 'offline',
      prompt: 'consent'
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Handle OAuth callback
   * @param code Authorization code from callback URL
   */
  public async handleCallback(code: string): Promise<void> {
    try {
      const tokenResponse = await this.exchangeCode(code);
      this.setTokens(tokenResponse);
    } catch (error) {
      throw new Error(`OAuth callback failed: ${error}`);
    }
  }

  /**
   * Exchange authorization code for tokens
   * @param code Authorization code
   */
  private async exchangeCode(code: string): Promise<TokenResponse> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.config.redirectUri
      })
    });

    if (!response.ok) {
      throw new Error('Token exchange failed');
    }

    return response.json();
  }

  /**
   * Refresh access token using refresh token
   */
  public async refreshAccessToken(): Promise<void> {
    if (!this.state.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: this.state.refreshToken,
          grant_type: 'refresh_token'
        })
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      this.setTokens(data);
    } catch (error) {
      throw new Error(`Token refresh failed: ${error}`);
    }
  }

  /**
   * Set tokens in state and localStorage
   * @param tokenResponse Token response from OAuth
   */
  private setTokens(tokenResponse: TokenResponse): void {
    const expiresAt = Date.now() + tokenResponse.expires_in * 1000;

    this.state = {
      isAuthenticated: true,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token || this.state.refreshToken,
      expiresAt
    };

    localStorage.setItem('gmail_oauth_state', JSON.stringify(this.state));
  }

  /**
   * Get current access token, refreshing if needed
   */
  public async getAccessToken(): Promise<string> {
    if (!this.state.accessToken) {
      throw new Error('Not authenticated');
    }

    if (this.state.expiresAt && Date.now() >= this.state.expiresAt) {
      await this.refreshAccessToken();
    }

    return this.state.accessToken;
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  /**
   * Sign out user
   */
  public signOut(): void {
    this.state = {
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      expiresAt: null
    };
    localStorage.removeItem('gmail_oauth_state');
  }

  /**
   * Load saved state from localStorage
   */
  public loadSavedState(): void {
    const savedState = localStorage.getItem('gmail_oauth_state');
    if (savedState) {
      this.state = JSON.parse(savedState);
    }
  }
}

export const gmailOAuth = GmailOAuthService.getInstance();