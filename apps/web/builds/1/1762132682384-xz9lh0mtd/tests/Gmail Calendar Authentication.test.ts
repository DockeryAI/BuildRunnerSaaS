Here's a comprehensive set of unit tests for the GmailCalendarAuth component:

```typescript
import { OAuth2Client, Credentials } from 'google-auth-library';
import { calendar_v3, google } from 'googleapis';
import { GmailCalendarAuth } from './GmailCalendarAuth';

// Mock google-auth-library and googleapis
jest.mock('google-auth-library');
jest.mock('googleapis');

describe('GmailCalendarAuth', () => {
  const mockConfig = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    redirectUri: 'http://localhost:3000/callback',
    scopes: ['https://www.googleapis.com/auth/calendar']
  };

  let gmailCalendarAuth: GmailCalendarAuth;
  let mockOAuth2Client: jest.Mocked<OAuth2Client>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock OAuth2Client
    mockOAuth2Client = {
      generateAuthUrl: jest.fn(),
      getToken: jest.fn(),
      setCredentials: jest.fn(),
      refreshAccessToken: jest.fn(),
      getTokenInfo: jest.fn(),
      revokeToken: jest.fn()
    } as unknown as jest.Mocked<OAuth2Client>;

    (google.auth.OAuth2 as jest.Mock).mockImplementation(() => mockOAuth2Client);
    (google.calendar as jest.Mock).mockReturnValue({});

    gmailCalendarAuth = new GmailCalendarAuth(mockConfig);
  });

  describe('constructor', () => {
    it('should initialize successfully with valid config', () => {
      expect(google.auth.OAuth2).toHaveBeenCalledWith(
        mockConfig.clientId,
        mockConfig.clientSecret,
        mockConfig.redirectUri
      );
      expect(google.calendar).toHaveBeenCalled();
    });

    it('should throw error when initialization fails', () => {
      (google.auth.OAuth2 as jest.Mock).mockImplementation(() => {
        throw new Error('Init failed');
      });

      expect(() => new GmailCalendarAuth(mockConfig)).toThrow('Failed to initialize Gmail Calendar Auth');
    });
  });

  describe('generateAuthUrl', () => {
    it('should generate authorization URL successfully', () => {
      const mockUrl = 'http://mock-auth-url';
      mockOAuth2Client.generateAuthUrl.mockReturnValue(mockUrl);

      const result = gmailCalendarAuth.generateAuthUrl();

      expect(result).toBe(mockUrl);
      expect(mockOAuth2Client.generateAuthUrl).toHaveBeenCalledWith({
        access_type: 'offline',
        scope: [
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/calendar.events'
        ]
      });
    });

    it('should throw error when URL generation fails', () => {
      mockOAuth2Client.generateAuthUrl.mockImplementation(() => {
        throw new Error('URL generation failed');
      });

      expect(() => gmailCalendarAuth.generateAuthUrl()).toThrow('Failed to generate auth URL');
    });
  });

  describe('getTokens', () => {
    it('should get tokens successfully', async () => {
      const mockTokens: Credentials = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token'
      };
      mockOAuth2Client.getToken.mockResolvedValue({ tokens: mockTokens });

      const result = await gmailCalendarAuth.getTokens('test-code');

      expect(result).toEqual(mockTokens);
      expect(mockOAuth2Client.getToken).toHaveBeenCalledWith('test-code');
      expect(mockOAuth2Client.setCredentials).toHaveBeenCalledWith(mockTokens);
    });

    it('should throw error when token retrieval fails', async () => {
      mockOAuth2Client.getToken.mockRejectedValue(new Error('Token retrieval failed'));

      await expect(gmailCalendarAuth.getTokens('test-code')).rejects.toThrow('Failed to get tokens');
    });
  });

  describe('verifyCredentials', () => {
    it('should return true for valid credentials', async () => {
      const futureDate = Date.now() + 3600000; // 1 hour in the future
      mockOAuth2Client.credentials = { access_token: 'valid-token' };
      mockOAuth2Client.getTokenInfo.mockResolvedValue({ expiry_date: futureDate });

      const result = await gmailCalendarAuth.verifyCredentials();

      expect(result).toBe(true);
    });

    it('should return false for expired credentials', async () => {
      const pastDate = Date.now() - 3600000; // 1 hour in the past
      mockOAuth2Client.credentials = { access_token: 'expired-token' };
      mockOAuth2Client.getTokenInfo.mockResolvedValue({ expiry_date: pastDate });

      const result = await gmailCalendarAuth.verifyCredentials();

      expect(result).toBe(false);
    });

    it('should return false when no access token exists', async () => {
      mockOAuth2Client.credentials = {};

      const result = await gmailCalendarAuth.verifyCredentials();

      expect(result).toBe(false);
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token successfully', async () => {
      const mockNewCredentials: Credentials = {
        access_token: 'new-access-token',
        refresh_token: 'refresh-token'
      };
      mockOAuth2Client.refreshAccessToken.mockResolvedValue({ credentials: mockNewCredentials });

      const result = await gmailCalendarAuth.refreshAccessToken();

      expect(result).toEqual(mockNewCredentials);
      expect(mockOAuth2Client.setCredentials).toHaveBeenCalledWith(mockNewCredentials);
    });

    it('should throw error when token refresh fails', async () => {
      mockOAuth2Client.refreshAccessToken.mockRejectedValue(new Error('Refresh failed'));

      await expect(gmailCalendarAuth.refreshAccessToken()).rejects.toThrow('Failed to refresh access token');
    });
  });

  describe('revokeToken', () => {
    it('should revoke token successfully', async () => {
      mockOAuth2Client.credentials = { access_token: 'token-to-revoke' };

      await gmailCalendarAuth.revokeToken();

      expect(mockOAuth2Client.revokeToken).toHaveBeenCalledWith('token-to-revoke');
    });

    it('should not attempt to revoke when no access token exists', async () => {
      mockOAuth2Client.credentials = {};

      await gmailCalendarAuth.revokeToken();

      expect(mockOAuth2Client.revokeToken).not.toHaveBeenCalled();
    });

    it('should throw error when token revocation fails', async () => {
      mockOAuth2Client.credentials = { access_token: 'token-to-revoke' };
      mockOAuth2Client.revokeToken.mockRejectedValue(new Error('Revocation failed'));

      await expect(gmailCalendarAuth.revokeToken()).rejects.toThrow('Failed to revoke token');
    });
  });

  describe('getter methods', () => {
    it('should return OAuth2Client instance', () => {
      const result = gmailCalendarAuth.getOAuth2Client();
      expect(result).toBe(mockOAuth2Client);
    });

    it('should return Calendar API instance', () => {
      const result = gmailCalendarAuth.getCalendarApi();
      expect(result).toBeDefined();
    });
  });
});
```

This test suite:

1. Mocks the required dependencies (google-auth-library and googleapis)
2. Tests all public methods of the GmailCalendarAuth class
3. Covers success and error cases for each method
4. Tests the constructor initialization
5. Verifies credential validation
6. Tests token management (getting, refreshing, revoking)
7. Verifies getter methods

Key features of the test suite:

- Uses Jest's mocking capabilities to mock external dependencies
- Implements beforeEach to reset mocks and set up fresh instances
- Tests both successful and error scenarios for each method
- Verifies that correct parameters are passed to underlying methods
- Tests edge cases (like missing tokens)
- Maintains good test isolation

To run these tests, you'll need to have Jest configured in your project with the following dependencies:

```json
{
  "devDependencies": {
    "@types/jest": "^27.0.0",
    "jest": "^27.0.0",
    "ts-jest": "^27.0.0"
  }
}
```

These tests provide good coverage of the component's functionality and should help catch any regressions during development.