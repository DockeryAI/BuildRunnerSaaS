Here's a comprehensive set of unit tests for the GmailService component using Jest:

```typescript
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { GmailService } from './GmailService';

// Mock the googleapis module
jest.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: jest.fn()
    },
    gmail: jest.fn()
  }
}));

describe('GmailService', () => {
  let gmailService: GmailService;
  let mockOAuth2Client: jest.Mocked<OAuth2Client>;
  let mockGmailAPI: jest.Mocked<any>;

  const mockConfig = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    redirectUri: 'http://localhost:3000/callback',
    refreshToken: 'test-refresh-token'
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup OAuth2Client mock
    mockOAuth2Client = {
      generateAuthUrl: jest.fn(),
      getToken: jest.fn(),
      setCredentials: jest.fn(),
    } as unknown as jest.Mocked<OAuth2Client>;

    // Setup Gmail API mock
    mockGmailAPI = {
      users: {
        messages: {
          list: jest.fn(),
          get: jest.fn(),
          send: jest.fn(),
          modify: jest.fn()
        }
      }
    };

    (google.auth.OAuth2 as jest.Mock).mockImplementation(() => mockOAuth2Client);
    (google.gmail as jest.Mock).mockImplementation(() => mockGmailAPI);

    gmailService = new GmailService(mockConfig);
  });

  describe('constructor', () => {
    it('should initialize with correct config', () => {
      expect(google.auth.OAuth2).toHaveBeenCalledWith(
        mockConfig.clientId,
        mockConfig.clientSecret,
        mockConfig.redirectUri
      );
      expect(mockOAuth2Client.setCredentials).toHaveBeenCalledWith({
        refresh_token: mockConfig.refreshToken
      });
    });
  });

  describe('getAuthUrl', () => {
    it('should generate authentication URL successfully', async () => {
      const mockUrl = 'http://mock-auth-url';
      mockOAuth2Client.generateAuthUrl.mockReturnValue(mockUrl);

      const result = await gmailService.getAuthUrl();

      expect(result).toEqual({
        client: mockOAuth2Client,
        url: mockUrl
      });
      expect(mockOAuth2Client.generateAuthUrl).toHaveBeenCalledWith({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/gmail.modify']
      });
    });

    it('should handle errors when generating auth URL', async () => {
      mockOAuth2Client.generateAuthUrl.mockImplementation(() => {
        throw new Error('Auth URL generation failed');
      });

      await expect(gmailService.getAuthUrl()).rejects.toThrow(
        'Failed to generate auth URL: Auth URL generation failed'
      );
    });
  });

  describe('getTokens', () => {
    it('should get tokens successfully', async () => {
      const mockTokens = { access_token: 'test-token' };
      mockOAuth2Client.getToken.mockResolvedValue({ tokens: mockTokens });

      const result = await gmailService.getTokens('test-code');

      expect(result).toEqual(mockTokens);
      expect(mockOAuth2Client.setCredentials).toHaveBeenCalledWith(mockTokens);
    });

    it('should handle token retrieval errors', async () => {
      mockOAuth2Client.getToken.mockRejectedValue(new Error('Token retrieval failed'));

      await expect(gmailService.getTokens('test-code')).rejects.toThrow(
        'Failed to get tokens: Token retrieval failed'
      );
    });
  });

  describe('listMessages', () => {
    it('should list messages successfully', async () => {
      const mockMessages = [{ id: 'msg1' }, { id: 'msg2' }];
      const mockMessageDetails = { id: 'msg1', snippet: 'Test message' };

      mockGmailAPI.users.messages.list.mockResolvedValue({
        data: { messages: mockMessages }
      });
      mockGmailAPI.users.messages.get.mockResolvedValue({
        data: mockMessageDetails
      });

      const result = await gmailService.listMessages('test query', 2);

      expect(result).toEqual([mockMessageDetails, mockMessageDetails]);
      expect(mockGmailAPI.users.messages.list).toHaveBeenCalledWith({
        userId: 'me',
        q: 'test query',
        maxResults: 2
      });
    });

    it('should handle list messages errors', async () => {
      mockGmailAPI.users.messages.list.mockRejectedValue(new Error('Listing failed'));

      await expect(gmailService.listMessages()).rejects.toThrow(
        'Failed to list messages: Listing failed'
      );
    });
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const mockMessageId = 'test-message-id';
      mockGmailAPI.users.messages.send.mockResolvedValue({
        data: { id: mockMessageId }
      });

      const result = await gmailService.sendEmail(
        'test@example.com',
        'Test Subject',
        'Test Body'
      );

      expect(result).toBe(mockMessageId);
      expect(mockGmailAPI.users.messages.send).toHaveBeenCalled();
    });

    it('should handle send email errors', async () => {
      mockGmailAPI.users.messages.send.mockRejectedValue(new Error('Send failed'));

      await expect(
        gmailService.sendEmail('test@example.com', 'Test', 'Body')
      ).rejects.toThrow('Failed to send email: Send failed');
    });
  });

  describe('modifyLabels', () => {
    it('should modify labels successfully', async () => {
      const mockResponse = { data: { id: 'msg1', labelIds: ['Label_1'] } };
      mockGmailAPI.users.messages.modify.mockResolvedValue(mockResponse);

      const result = await gmailService.modifyLabels(
        'msg1',
        ['Label_1'],
        ['Label_2']
      );

      expect(result).toEqual(mockResponse.data);
      expect(mockGmailAPI.users.messages.modify).toHaveBeenCalledWith({
        userId: 'me',
        id: 'msg1',
        requestBody: {
          addLabelIds: ['Label_1'],
          removeLabelIds: ['Label_2']
        }
      });
    });

    it('should handle modify labels errors', async () => {
      mockGmailAPI.users.messages.modify.mockRejectedValue(
        new Error('Modification failed')
      );

      await expect(gmailService.modifyLabels('msg1')).rejects.toThrow(
        'Failed to modify labels: Modification failed'
      );
    });
  });

  describe('getMessage', () => {
    it('should get message successfully', async () => {
      const mockMessage = { id: 'msg1', snippet: 'Test message' };
      mockGmailAPI.users.messages.get.mockResolvedValue({ data: mockMessage });

      const result = await gmailService.getMessage('msg1');

      expect(result).toEqual(mockMessage);
      expect(mockGmailAPI.users.messages.get).toHaveBeenCalledWith({
        userId: 'me',
        id: 'msg1'
      });
    });

    it('should handle get message errors', async () => {
      mockGmailAPI.users.messages.get.mockRejectedValue(
        new Error('Get message failed')
      );

      await expect(gmailService.getMessage('msg1')).rejects.toThrow(
        'Failed to get message: Get message failed'
      );
    });
  });
});
```

This test suite:

1. Mocks the googleapis module and its dependencies
2. Tests all major methods of the GmailService class
3. Includes both success and error scenarios for each method
4. Verifies correct parameter passing and return values
5. Tests error handling and error messages
6. Uses Jest's mock functions to simulate API responses
7. Follows testing best practices with beforeEach setup and proper cleanup

Key features:
- Uses TypeScript
- Includes proper type definitions
- Tests all public methods
- Verifies error handling
- Tests both successful and failed scenarios
- Verifies correct parameter passing
- Tests the constructor configuration
- Includes proper mock setup and teardown

To run these tests, you'll need to have Jest and its TypeScript dependencies installed in your project:

```bash
npm install --save-dev jest @types/jest ts-jest
```

And configure Jest in your package.json or jest.config.js to handle TypeScript files.