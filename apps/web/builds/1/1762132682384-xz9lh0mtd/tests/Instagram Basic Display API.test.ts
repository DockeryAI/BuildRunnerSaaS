Here's a comprehensive set of unit tests for the Instagram Service component using Jest:

```typescript
import { InstagramService } from './instagram.service';

describe('InstagramService', () => {
  let service: InstagramService;
  let mockFetch: jest.Mock;
  const validAccessToken = 'valid-access-token';

  beforeEach(() => {
    // Mock global fetch
    mockFetch = jest.fn();
    global.fetch = mockFetch;
    
    // Create service instance
    service = new InstagramService(validAccessToken);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('constructor', () => {
    it('should create an instance with valid access token', () => {
      expect(service).toBeInstanceOf(InstagramService);
    });

    it('should throw error if access token is not provided', () => {
      expect(() => new InstagramService('')).toThrow('Instagram access token is required');
    });
  });

  describe('getUserProfile', () => {
    const mockProfile = {
      id: '123',
      username: 'testuser',
      account_type: 'BUSINESS',
      media_count: 42
    };

    it('should fetch user profile successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProfile)
      });

      const result = await service.getUserProfile();
      
      expect(result).toEqual(mockProfile);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/me?fields=id,username,account_type,media_count')
      );
    });

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      });

      await expect(service.getUserProfile()).rejects.toThrow('Instagram API error: Not Found');
    });

    it('should throw error on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.getUserProfile()).rejects.toThrow('Failed to fetch Instagram user profile');
    });
  });

  describe('getUserMedia', () => {
    const mockMediaResponse = {
      data: [{
        id: 'media123',
        media_type: 'IMAGE',
        media_url: 'https://example.com/image.jpg',
        permalink: 'https://instagram.com/p/123',
        timestamp: '2023-01-01T00:00:00Z'
      }],
      paging: {
        cursors: {
          before: 'before123',
          after: 'after123'
        }
      }
    };

    it('should fetch user media with default limit', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMediaResponse)
      });

      const result = await service.getUserMedia();
      
      expect(result).toEqual(mockMediaResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=25')
      );
    });

    it('should fetch user media with custom limit', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMediaResponse)
      });

      await service.getUserMedia(10);
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=10')
      );
    });

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request'
      });

      await expect(service.getUserMedia()).rejects.toThrow('Instagram API error');
    });
  });

  describe('getMediaById', () => {
    const mockMediaItem = {
      id: 'media123',
      media_type: 'IMAGE',
      media_url: 'https://example.com/image.jpg',
      permalink: 'https://instagram.com/p/123',
      timestamp: '2023-01-01T00:00:00Z'
    };

    it('should fetch media item by ID successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMediaItem)
      });

      const result = await service.getMediaById('media123');
      
      expect(result).toEqual(mockMediaItem);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/media123?fields=')
      );
    });

    it('should throw error if media ID is not provided', async () => {
      await expect(service.getMediaById('')).rejects.toThrow('Media ID is required');
    });

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      });

      await expect(service.getMediaById('invalid-id')).rejects.toThrow('Instagram API error');
    });
  });

  describe('refreshLongLivedToken', () => {
    const mockTokenResponse = {
      access_token: 'new-token',
      token_type: 'bearer',
      expires_in: 5184000
    };

    it('should refresh token successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse)
      });

      const result = await service.refreshLongLivedToken();
      
      expect(result).toEqual(mockTokenResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/refresh_access_token?grant_type=ig_refresh_token')
      );
    });

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized'
      });

      await expect(service.refreshLongLivedToken()).rejects.toThrow('Instagram API error');
    });

    it('should throw error on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.refreshLongLivedToken()).rejects.toThrow('Failed to refresh Instagram access token');
    });
  });
});
```

This test suite includes:

1. Proper setup and teardown using `beforeEach` and `afterEach`
2. Mocking of the global `fetch` function
3. Tests for constructor validation
4. Tests for all public methods:
   - getUserProfile
   - getUserMedia
   - getMediaById
   - refreshLongLivedToken
5. Tests for successful cases and error scenarios
6. Validation of API call parameters
7. Error handling tests
8. Response parsing tests

Each test case follows the Arrange-Act-Assert pattern and includes:
- Setup of mock responses
- Execution of the method being tested
- Verification of the results
- Verification of error cases
- Checking if the correct URLs and parameters are being used

To run these tests, you'll need to have Jest configured in your project with the appropriate TypeScript setup.