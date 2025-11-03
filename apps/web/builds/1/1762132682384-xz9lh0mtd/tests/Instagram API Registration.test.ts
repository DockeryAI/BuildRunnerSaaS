Here's a comprehensive set of unit tests for the InstagramApiRegistration component using Jest:

```typescript
// InstagramApiRegistration.test.ts

import { InstagramApiRegistration } from './InstagramApiRegistration';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

// Mock Supabase
jest.mock('@supabase/supabase-js');

// Mock fetch
global.fetch = jest.fn();

describe('InstagramApiRegistration', () => {
  let instagramApi: InstagramApiRegistration;
  const mockCredentials = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    redirectUri: 'http://localhost:3000/callback'
  };

  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    upsert: jest.fn()
  };

  beforeEach(() => {
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    instagramApi = new InstagramApiRegistration(mockCredentials);
    jest.clearAllMocks();
  });

  describe('getAuthorizationUrl', () => {
    it('should generate correct authorization URL', () => {
      const url = instagramApi.getAuthorizationUrl();
      const expectedParams = new URLSearchParams({
        client_id: mockCredentials.clientId,
        redirect_uri: mockCredentials.redirectUri,
        scope: 'basic',
        response_type: 'code'
      });

      expect(url).toBe(`https://api.instagram.com/oauth/authorize?${expectedParams.toString()}`);
    });
  });

  describe('exchangeCodeForToken', () => {
    const mockCode = 'test-auth-code';
    const mockTokenResponse = {
      access_token: 'test-access-token',
      user_id: 'test-user-id'
    };

    it('should exchange code for token successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse)
      });

      const result = await instagramApi.exchangeCodeForToken(mockCode);

      expect(result).toEqual(mockTokenResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.instagram.com/oauth/access_token',
        expect.any(Object)
      );
    });

    it('should throw error when token exchange fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      await expect(instagramApi.exchangeCodeForToken(mockCode))
        .rejects
        .toThrow('Failed to exchange code for token');
    });
  });

  describe('getUserDetails', () => {
    const mockAccessToken = 'test-access-token';
    const mockUserDetails = {
      id: 'test-id',
      username: 'test-username',
      account_type: 'BUSINESS'
    };

    it('should fetch user details successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserDetails)
      });

      const result = await instagramApi.getUserDetails(mockAccessToken);

      expect(result).toEqual(mockUserDetails);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${mockAccessToken}`
      );
    });

    it('should throw error when user details fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      await expect(instagramApi.getUserDetails(mockAccessToken))
        .rejects
        .toThrow('Failed to fetch user details');
    });
  });

  describe('storeCredentials', () => {
    const mockUserId = 'test-user-id';
    const mockInstagramData = {
      id: 'test-instagram-id',
      username: 'test-username',
      access_token: 'test-access-token',
      account_type: 'BUSINESS',
      user_id: 'test-user-id'
    };

    it('should store credentials successfully', async () => {
      mockSupabase.upsert.mockResolvedValueOnce({ error: null });

      await instagramApi.storeCredentials(mockUserId, mockInstagramData);

      expect(mockSupabase.from).toHaveBeenCalledWith('instagram_credentials');
      expect(mockSupabase.upsert).toHaveBeenCalledWith(expect.objectContaining({
        user_id: mockUserId,
        instagram_user_id: mockInstagramData.id,
        instagram_username: mockInstagramData.username,
        access_token: mockInstagramData.access_token,
        account_type: mockInstagramData.account_type
      }));
    });

    it('should throw error when storage fails', async () => {
      mockSupabase.upsert.mockResolvedValueOnce({ 
        error: { message: 'Storage failed' } 
      });

      await expect(instagramApi.storeCredentials(mockUserId, mockInstagramData))
        .rejects
        .toThrow('Failed to store credentials: Storage failed');
    });
  });

  describe('completeRegistration', () => {
    const mockCode = 'test-auth-code';
    const mockUserId = 'test-user-id';
    const mockTokenResponse = {
      access_token: 'test-access-token',
      user_id: 'test-user-id'
    };
    const mockUserDetails = {
      id: 'test-id',
      username: 'test-username',
      account_type: 'BUSINESS'
    };

    it('should complete registration successfully', async () => {
      // Mock successful responses for all steps
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTokenResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockUserDetails)
        });
      
      mockSupabase.upsert.mockResolvedValueOnce({ error: null });

      await instagramApi.completeRegistration(mockCode, mockUserId);

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(mockSupabase.upsert).toHaveBeenCalledTimes(1);
    });

    it('should throw error when registration fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      await expect(instagramApi.completeRegistration(mockCode, mockUserId))
        .rejects
        .toThrow('Registration failed: Token exchange failed: API Error');
    });
  });
});
```

This test suite includes:

1. Proper mocking of dependencies (Supabase and fetch)
2. Tests for all public methods
3. Both success and error scenarios for each method
4. Verification of correct parameter passing
5. Testing of the complete registration flow
6. Proper cleanup between tests

Key testing patterns used:

- `beforeEach` to set up fresh instances and clear mocks
- Mock implementations for external dependencies
- Async/await testing patterns
- Error handling verification
- Input/output validation
- Integration testing of the complete flow

To run these tests:

1. Make sure you have Jest and its TypeScript dependencies installed
2. Add the following to your Jest configuration:

```json
{
  "preset": "ts-jest",
  "testEnvironment": "node",
  "setupFilesAfterEnv": ["<rootDir>/jest.setup.ts"]
}
```

3. Create a `jest.setup.ts` file with:

```typescript
global.fetch = jest.fn();
```

4. Run `jest` or `npm test`

Remember to add appropriate error handling and edge cases based on your specific requirements.