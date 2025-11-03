/**
 * OAuth service for handling authentication flows
 */
export class OAuthService {
  private static readonly OAUTH_ENDPOINTS = {
    authorize: 'https://oauth.example.com/authorize',
    token: 'https://oauth.example.com/token',
    userInfo: 'https://oauth.example.com/userinfo'
  };

  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private state: string;
  private codeVerifier: string;

  constructor(config: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  }) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret; 
    this.redirectUri = config.redirectUri;
    this.state = '';
    this.codeVerifier = '';
  }

  /**
   * Generates random string for state parameter
   * @returns Random string
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  /**
   * Generates code verifier for PKCE
   * @returns Code verifier string
   */
  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Generates code challenge from verifier
   * @param verifier Code verifier string
   * @returns Code challenge string
   */
  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Initiates OAuth flow by redirecting to authorization endpoint
   * @param scope Requested scopes
   * @returns Authorization URL
   */
  public async initiateOAuthFlow(scope: string[]): Promise<string> {
    try {
      this.state = this.generateState();
      this.codeVerifier = this.generateCodeVerifier();
      const codeChallenge = await this.generateCodeChallenge(this.codeVerifier);

      const params = new URLSearchParams({
        response_type: 'code',
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        scope: scope.join(' '),
        state: this.state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
      });

      return `${OAuthService.OAUTH_ENDPOINTS.authorize}?${params.toString()}`;
    } catch (error) {
      throw new Error(`Failed to initiate OAuth flow: ${error.message}`);
    }
  }

  /**
   * Handles OAuth callback and exchanges code for tokens
   * @param code Authorization code
   * @param state State parameter for validation
   * @returns Token response
   */
  public async handleOAuthCallback(code: string, state: string): Promise<IOAuthTokens> {
    try {
      if (state !== this.state) {
        throw new Error('Invalid state parameter');
      }

      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code_verifier: this.codeVerifier
      });

      const response = await fetch(OAuthService.OAUTH_ENDPOINTS.token, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to handle OAuth callback: ${error.message}`);
    }
  }

  /**
   * Refreshes access token using refresh token
   * @param refreshToken Refresh token
   * @returns New token response
   */
  public async refreshAccessToken(refreshToken: string): Promise<IOAuthTokens> {
    try {
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret
      });

      const response = await fetch(OAuthService.OAUTH_ENDPOINTS.token, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to refresh access token: ${error.message}`);
    }
  }

  /**
   * Gets user info using access token
   * @param accessToken Access token
   * @returns User info
   */
  public async getUserInfo(accessToken: string): Promise<IUserInfo> {
    try {
      const response = await fetch(OAuthService.OAUTH_ENDPOINTS.userInfo, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`User info request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get user info: ${error.message}`);
    }
  }
}

interface IOAuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface IUserInfo {
  sub: string;
  name: string;
  email: string;
  [key: string]: any;
}

export default OAuthService;