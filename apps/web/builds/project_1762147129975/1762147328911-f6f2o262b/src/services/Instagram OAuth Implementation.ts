/**
 * Instagram OAuth service for web applications
 */

export interface InstagramAuthConfig {
  clientId: string;
  redirectUri: string;
  scope?: string[];
}

export interface InstagramTokenResponse {
  access_token: string;
  user_id: string;
}

export interface InstagramUserProfile {
  id: string;
  username: string;
  account_type: string;
}

export class InstagramAuthService {
  private config: InstagramAuthConfig;
  private static INSTAGRAM_AUTH_URL = 'https://api.instagram.com/oauth/authorize';
  private static INSTAGRAM_TOKEN_URL = 'https://api.instagram.com/oauth/access_token';
  private static INSTAGRAM_USER_PROFILE_URL = 'https://graph.instagram.com/me';

  constructor(config: InstagramAuthConfig) {
    this.config = {
      ...config,
      scope: config.scope || ['user_profile', 'user_media']
    };
  }

  /**
   * Initiates the Instagram OAuth flow by redirecting to Instagram login
   */
  public initiateLogin = (): void => {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope?.join(',') || '',
      response_type: 'code'
    });

    window.location.href = `${InstagramAuthService.INSTAGRAM_AUTH_URL}?${params.toString()}`;
  };

  /**
   * Exchanges authorization code for access token
   * @param code - Authorization code from Instagram redirect
   * @returns Promise with token response
   */
  public getAccessToken = async (code: string): Promise<InstagramTokenResponse> => {
    try {
      const response = await fetch(InstagramAuthService.INSTAGRAM_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          redirect_uri: this.config.redirectUri,
          code,
          grant_type: 'authorization_code'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Instagram OAuth error: ${(error as Error).message}`);
    }
  };

  /**
   * Gets user profile information using access token
   * @param accessToken - Instagram access token
   * @returns Promise with user profile data
   */
  public getUserProfile = async (accessToken: string): Promise<InstagramUserProfile> => {
    try {
      const response = await fetch(
        `${InstagramAuthService.INSTAGRAM_USER_PROFILE_URL}?fields=id,username,account_type&access_token=${accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Failed to get user profile: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Instagram profile error: ${(error as Error).message}`);
    }
  };

  /**
   * Handles the OAuth redirect and code exchange
   * @param urlParams - URL search params from redirect
   * @returns Promise with token and profile information
   */
  public handleRedirect = async (urlParams: URLSearchParams): Promise<{
    token: InstagramTokenResponse;
    profile: InstagramUserProfile;
  }> => {
    try {
      const code = urlParams.get('code');
      if (!code) {
        throw new Error('No authorization code present in URL');
      }

      const token = await this.getAccessToken(code);
      const profile = await this.getUserProfile(token.access_token);

      return { token, profile };
    } catch (error) {
      throw new Error(`Instagram redirect handling error: ${(error as Error).message}`);
    }
  };
}

/**
 * React hook for Instagram OAuth
 */
export const useInstagramAuth = (config: InstagramAuthConfig) => {
  const authService = React.useMemo(() => new InstagramAuthService(config), [config]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [authData, setAuthData] = React.useState<{
    token?: InstagramTokenResponse;
    profile?: InstagramUserProfile;
  }>({});

  const login = React.useCallback(() => {
    authService.initiateLogin();
  }, [authService]);

  const handleRedirect = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const data = await authService.handleRedirect(urlParams);
      setAuthData(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [authService]);

  return {
    login,
    handleRedirect,
    loading,
    error,
    token: authData.token,
    profile: authData.profile
  };
};