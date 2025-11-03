```typescript
/**
 * Service for interacting with the Instagram Basic Display API
 * @see https://developers.facebook.com/docs/instagram-basic-display-api
 */
export class InstagramService {
  private readonly baseUrl = 'https://graph.instagram.com';
  private readonly apiVersion = 'v12.0';

  /**
   * Creates a new Instagram service instance
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
   * @throws Error if the API request fails
   */
  public async getUserProfile(): Promise<InstagramUserProfile> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.apiVersion}/me?fields=id,username,account_type,media_count&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch Instagram user profile: ${error.message}`);
    }
  }

  /**
   * Fetches user media items
   * @param limit - Maximum number of items to return (default: 25)
   * @returns Promise containing array of media items
   * @throws Error if the API request fails
   */
  public async getUserMedia(limit: number = 25): Promise<InstagramMediaResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.apiVersion}/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&limit=${limit}&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch Instagram media: ${error.message}`);
    }
  }

  /**
   * Fetches a specific media item by ID
   * @param mediaId - ID of the media item to fetch
   * @returns Promise containing media item data
   * @throws Error if the API request fails
   */
  public async getMediaById(mediaId: string): Promise<InstagramMediaItem> {
    if (!mediaId) {
      throw new Error('Media ID is required');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/${this.apiVersion}/${mediaId}?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch Instagram media item: ${error.message}`);
    }
  }

  /**
   * Refreshes a long-lived access token
   * @returns Promise containing new access token data
   * @throws Error if the API request fails
   */
  public async refreshLongLivedToken(): Promise<InstagramTokenResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/refresh_access_token?grant_type=ig_refresh_token&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to refresh Instagram access token: ${error.message}`);
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
 * Instagram media response containing pagination
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