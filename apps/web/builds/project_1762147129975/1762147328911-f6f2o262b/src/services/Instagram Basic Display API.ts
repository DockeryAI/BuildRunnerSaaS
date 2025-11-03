/**
 * Instagram Basic Display API service
 * Handles authentication and fetching data from Instagram Basic Display API
 */

interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp: string;
  username: string;
}

interface InstagramApiResponse {
  data: InstagramMedia[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next: string;
  };
}

export class InstagramService {
  private accessToken: string;
  private baseUrl = 'https://graph.instagram.com';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Fetches media from Instagram Basic Display API
   * @param limit Number of media items to fetch (max 25)
   * @returns Promise with Instagram media items
   */
  public async getMedia(limit: number = 25): Promise<InstagramMedia[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username&access_token=${this.accessToken}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.statusText}`);
      }

      const data: InstagramApiResponse = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching Instagram media:', error);
      throw error;
    }
  }

  /**
   * Fetches a single media item by ID
   * @param mediaId Instagram media ID
   * @returns Promise with Instagram media item
   */
  public async getMediaById(mediaId: string): Promise<InstagramMedia> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${mediaId}?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.statusText}`);
      }

      const data: InstagramMedia = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Instagram media by ID:', error);
      throw error;
    }
  }

  /**
   * Refreshes long-lived access token
   * @returns Promise with new access token
   */
  public async refreshLongLivedToken(): Promise<string> {
    try {
      const response = await fetch(
        `${this.baseUrl}/refresh_access_token?grant_type=ig_refresh_token&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Error refreshing token: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      return data.access_token;
    } catch (error) {
      console.error('Error refreshing Instagram access token:', error);
      throw error;
    }
  }

  /**
   * Gets basic profile information
   * @returns Promise with profile data
   */
  public async getProfile(): Promise<{
    id: string;
    username: string;
    account_type: string;
  }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/me?fields=id,username,account_type&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching Instagram profile:', error);
      throw error;
    }
  }

  /**
   * Validates if the access token is valid and not expired
   * @returns Promise<boolean>
   */
  public async validateAccessToken(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/me?fields=id&access_token=${this.accessToken}`
      );
      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * Custom hook to use Instagram service in React components
 * @param accessToken Instagram access token
 * @returns InstagramService instance
 */
export const useInstagram = (accessToken: string): InstagramService => {
  const [service] = React.useState(() => new InstagramService(accessToken));
  return service;
};