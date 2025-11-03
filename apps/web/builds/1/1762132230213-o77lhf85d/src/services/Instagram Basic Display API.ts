```typescript
/**
 * Service for interacting with the Instagram Basic Display API
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
   * @returns User profile data
   * @throws Error if request fails
   */
  public async getUserProfile(): Promise<InstagramUserProfile> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.apiVersion}/me?fields=id,username,account_type,media_count&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.statusText}`);
      }

      return await response.json() as InstagramUserProfile;
    } catch (error) {
      throw new Error(`Error fetching Instagram user profile: ${(error as Error).message}`);
    }
  }

  /**
   * Fetches user's media items
   * @param limit - Number of items to fetch (default 25, max 100)
   * @returns Array of media items
   * @throws Error if request fails
   */
  public async getMediaItems(limit = 25): Promise<InstagramMediaItem[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.apiVersion}/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&limit=${limit}&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch media items: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data as InstagramMediaItem[];
    } catch (error) {
      throw new Error(`Error fetching Instagram media items: ${(error as Error).message}`);
    }
  }

  /**
   * Fetches a specific media item by ID
   * @param mediaId - ID of the media item to fetch
   * @returns Media item data
   * @throws Error if request fails
   */
  public async getMediaById(mediaId: string): Promise<InstagramMediaItem> {
    try {
      if (!mediaId) {
        throw new Error('Media ID is required');
      }

      const response = await fetch(
        `${this.baseUrl}/${this.apiVersion}/${mediaId}?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch media item: ${response.statusText}`);
      }

      return await response.json() as InstagramMediaItem;
    } catch (error) {
      throw new Error(`Error fetching Instagram media item: ${(error as Error).message}`);
    }
  }

  /**
   * Refreshes the long-lived access token
   * @returns New access token data
   * @throws Error if request fails
   */
  public async refreshAccessToken(): Promise<InstagramTokenResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/refresh_access_token?grant_type=ig_refresh_token&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Failed to refresh access token: ${response.statusText}`);
      }

      return await response.json() as InstagramTokenResponse;
    } catch (error) {
      throw new Error(`Error refreshing Instagram access token: ${(error as Error).message}`);
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
 * Instagram media item
 */
export interface InstagramMediaItem {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp: string;
}

/**
 * Instagram access token response
 */
export interface InstagramTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Instagram API error response
 */
export interface InstagramErrorResponse {
  error: {
    message: string;
    type: string;
    code: number;
    fbtrace_id: string;
  };
}
```