```typescript
/**
 * Service for interacting with the Instagram Basic Display API
 * @see https://developers.facebook.com/docs/instagram-basic-display-api
 */
export class InstagramBasicDisplayService {
  private readonly baseUrl = 'https://graph.instagram.com';
  private readonly apiVersion = 'v18.0';

  /**
   * Creates a new Instagram Basic Display API service instance
   * @param accessToken - Instagram access token
   */
  constructor(private readonly accessToken: string) {
    if (!accessToken) {
      throw new Error('Instagram access token is required');
    }
  }

  /**
   * Fetches user profile information
   * @returns Promise containing user profile data
   * @throws Error if API request fails
   */
  public async getUserProfile(): Promise<InstagramUserProfile> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.apiVersion}/me?fields=id,username,account_type,media_count&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch user profile: ${(error as Error).message}`);
    }
  }

  /**
   * Fetches user's media items
   * @param limit - Maximum number of items to return (default 25)
   * @returns Promise containing media items
   * @throws Error if API request fails
   */
  public async getMediaItems(limit = 25): Promise<InstagramMediaResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.apiVersion}/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username&limit=${limit}&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch media items: ${(error as Error).message}`);
    }
  }

  /**
   * Fetches a specific media item by ID
   * @param mediaId - Instagram media item ID
   * @returns Promise containing media item details
   * @throws Error if API request fails
   */
  public async getMediaById(mediaId: string): Promise<InstagramMediaItem> {
    if (!mediaId) {
      throw new Error('Media ID is required');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/${this.apiVersion}/${mediaId}?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch media item: ${(error as Error).message}`);
    }
  }

  /**
   * Refreshes the long-lived access token
   * @returns Promise containing new access token data
   * @throws Error if token refresh fails
   */
  public async refreshLongLivedToken(): Promise<InstagramTokenResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/refresh_access_token?grant_type=ig_refresh_token&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Token refresh failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to refresh access token: ${(error as Error).message}`);
    }
  }
}

/**
 * Instagram user profile information
 */
export interface InstagramUserProfile {
  id: string;
  username: string;
  account_type: string;
  media_count: number;
}

/**
 * Instagram media item details
 */
export interface InstagramMediaItem {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp: string;
  username: string;
}

/**
 * Instagram media response containing paging information
 */
export interface InstagramMediaResponse {
  data: InstagramMediaItem[];
  paging: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

/**
 * Instagram token refresh response
 */
export interface InstagramTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
```