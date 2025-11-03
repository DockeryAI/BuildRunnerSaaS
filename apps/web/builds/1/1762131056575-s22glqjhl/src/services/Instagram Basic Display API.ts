```typescript
/**
 * Service for interacting with the Instagram Basic Display API
 * @see https://developers.facebook.com/docs/instagram-basic-display-api
 */
export class InstagramBasicDisplayService {
  private readonly baseUrl = 'https://graph.instagram.com';
  private readonly apiVersion = 'v12.0';

  /**
   * Creates an instance of InstagramBasicDisplayService
   * @param accessToken - Long-lived Instagram access token
   */
  constructor(private readonly accessToken: string) {
    if (!accessToken) {
      throw new Error('Instagram access token is required');
    }
  }

  /**
   * Fetches user profile information
   * @returns Promise containing user profile data
   * @throws Error if request fails
   */
  public async getUserProfile(): Promise<InstagramUserProfile> {
    try {
      const response = await fetch(
        `${this.baseUrl}/me?fields=id,username,account_type,media_count&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch user profile: ${(error as Error).message}`);
    }
  }

  /**
   * Fetches user's media items
   * @param limit - Number of media items to fetch (default: 25, max: 100)
   * @returns Promise containing media items
   * @throws Error if request fails
   */
  public async getMediaItems(limit = 25): Promise<InstagramMediaResponse> {
    try {
      const safeLimit = Math.min(Math.max(1, limit), 100);
      const response = await fetch(
        `${this.baseUrl}/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username&limit=${safeLimit}&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch media items: ${(error as Error).message}`);
    }
  }

  /**
   * Fetches a specific media item by ID
   * @param mediaId - ID of the media item to fetch
   * @returns Promise containing media item details
   * @throws Error if request fails
   */
  public async getMediaById(mediaId: string): Promise<InstagramMediaItem> {
    try {
      if (!mediaId) {
        throw new Error('Media ID is required');
      }

      const response = await fetch(
        `${this.baseUrl}/${mediaId}?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch media item: ${(error as Error).message}`);
    }
  }

  /**
   * Refreshes the long-lived access token
   * @returns Promise containing new token information
   * @throws Error if request fails
   */
  public async refreshAccessToken(): Promise<InstagramTokenResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/refresh_access_token?grant_type=ig_refresh_token&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to refresh access token: ${(error as Error).message}`);
    }
  }
}

export interface InstagramUserProfile {
  id: string;
  username: string;
  account_type: string;
  media_count: number;
}

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

export interface InstagramTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
```