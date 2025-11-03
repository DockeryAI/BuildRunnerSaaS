Here's a comprehensive set of unit tests for the GmailService component using Jest:

```typescript
import { google } from 'googleapis';
import { GmailService } from './GmailService';

// Mock googleapis
jest.mock('googleapis');

describe('GmailService', () => {
  let gmailService: GmailService;
  let mockAuth: any;
  let mockGmail: any;

  const mockCredentials = {
    client_id: 'test-client-id',
    client_secret: 'test-client-secret',
    redirect_uri: 'http://localhost:3000/callback'
  };

  const mockToken = {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token'
  };

  beforeEach(() => {
    // Setup mock auth
    mockAuth = {
      generateAuthUrl: jest.fn(),
      getToken: jest.fn(),
      setCredentials: jest.fn()
    };

    // Setup mock Gmail client
    mockGmail = {
      users: {
        messages: {
          list: jest.fn(),
          get: jest.fn(),
          send: jest.fn(),
          modify: jest.fn(),
          trash: jest.fn()
        },
        labels: {
          list: jest.fn()
        }
      }
    };

    // Mock Google OAuth2 constructor
    (google.auth.OAuth2 as jest.Mock).mockImplementation(() => mockAuth);
    
    // Mock Gmail constructor
    (google.gmail as jest.Mock).mockImplementation(() => mockGmail);

    gmailService = new GmailService(mockCredentials, mockToken);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with credentials and token', () => {
      expect(google.auth.OAuth2).toHaveBeenCalledWith(
        mockCredentials.client_id,
        mockCredentials.client_secret,
        mockCredentials.redirect_uri
      );
      expect(mockAuth.setCredentials).toHaveBeenCalledWith(mockToken);
    });
  });

  describe('getAuthUrl', () => {
    it('should generate authorization URL with correct scopes', () => {
      const scopes = ['https://www.googleapis.com/auth/gmail.readonly'];
      const mockUrl = 'https://accounts.google.com/o/oauth2/auth';
      
      mockAuth.generateAuthUrl.mockReturnValue(mockUrl);
      
      const result = gmailService.getAuthUrl(scopes);
      
      expect(mockAuth.generateAuthUrl).toHaveBeenCalledWith({
        access_type: 'offline',
        scope: scopes
      });
      expect(result).toBe(mockUrl);
    });
  });

  describe('getToken', () => {
    it('should get and set token successfully', async () => {
      const mockCode = 'test-auth-code';
      mockAuth.getToken.mockResolvedValue({ tokens: mockToken });

      const result = await gmailService.getToken(mockCode);

      expect(mockAuth.getToken).toHaveBeenCalledWith(mockCode);
      expect(mockAuth.setCredentials).toHaveBeenCalledWith(mockToken);
      expect(result).toEqual(mockToken);
    });

    it('should handle token retrieval error', async () => {
      const mockCode = 'invalid-code';
      const error = new Error('Invalid code');
      mockAuth.getToken.mockRejectedValue(error);

      await expect(gmailService.getToken(mockCode))
        .rejects
        .toThrow('Failed to get token: Invalid code');
    });
  });

  describe('listMessages', () => {
    it('should list messages successfully', async () => {
      const mockMessages = [{ id: '1' }, { id: '2' }];
      mockGmail.users.messages.list.mockResolvedValue({
        data: { messages: mockMessages }
      });

      const result = await gmailService.listMessages('test query', 2);

      expect(mockGmail.users.messages.list).toHaveBeenCalledWith({
        userId: 'me',
        q: 'test query',
        maxResults: 2
      });
      expect(result).toEqual(mockMessages);
    });

    it('should handle empty message list', async () => {
      mockGmail.users.messages.list.mockResolvedValue({ data: {} });

      const result = await gmailService.listMessages();

      expect(result).toEqual([]);
    });
  });

  describe('getMessage', () => {
    it('should get message details successfully', async () => {
      const mockMessage = { id: '1', payload: {} };
      mockGmail.users.messages.get.mockResolvedValue({ data: mockMessage });

      const result = await gmailService.getMessage('1');

      expect(mockGmail.users.messages.get).toHaveBeenCalledWith({
        userId: 'me',
        id: '1'
      });
      expect(result).toEqual(mockMessage);
    });
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const mockEmailOptions = {
        to: 'test@example.com',
        subject: 'Test Subject',
        body: 'Test Body'
      };
      const mockResponse = { id: '1' };
      mockGmail.users.messages.send.mockResolvedValue({ data: mockResponse });

      const result = await gmailService.sendEmail(mockEmailOptions);

      expect(mockGmail.users.messages.send).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('modifyLabels', () => {
    it('should modify labels successfully', async () => {
      const mockResponse = { id: '1', labelIds: ['Label_1'] };
      mockGmail.users.messages.modify.mockResolvedValue({ data: mockResponse });

      const result = await gmailService.modifyLabels('1', ['Label_1'], ['Label_2']);

      expect(mockGmail.users.messages.modify).toHaveBeenCalledWith({
        userId: 'me',
        id: '1',
        requestBody: {
          addLabelIds: ['Label_1'],
          removeLabelIds: ['Label_2']
        }
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('listLabels', () => {
    it('should list labels successfully', async () => {
      const mockLabels = [{ id: '1', name: 'Label1' }];
      mockGmail.users.labels.list.mockResolvedValue({ data: { labels: mockLabels } });

      const result = await gmailService.listLabels();

      expect(mockGmail.users.labels.list).toHaveBeenCalledWith({
        userId: 'me'
      });
      expect(result).toEqual(mockLabels);
    });
  });

  describe('trashMessage', () => {
    it('should trash message successfully', async () => {
      const mockResponse = { id: '1', labelIds: ['TRASH'] };
      mockGmail.users.messages.trash.mockResolvedValue({ data: mockResponse });

      const result = await gmailService.trashMessage('1');

      expect(mockGmail.users.messages.trash).toHaveBeenCalledWith({
        userId: 'me',
        id: '1'
      });
      expect(result).toEqual(mockResponse);
    });
  });
});
```

This test suite:

1. Mocks the `googleapis` package to avoid actual API calls
2. Tests all public methods of the GmailService class
3. Includes positive and negative test cases
4. Verifies proper error handling
5. Checks correct parameter passing
6. Verifies return values
7. Uses Jest's mocking capabilities to simulate API responses

Key features of the tests:

- Uses `beforeEach` to set up fresh mocks for each test
- Uses `afterEach` to clear mocks between tests
- Tests both successful and error scenarios
- Verifies that the correct parameters are passed to API calls
- Checks that responses are properly handled and returned
- Tests edge cases like empty responses

To run these tests, you'll need to have Jest configured in your project with the appropriate TypeScript settings. You can run them using:

```bash
npm test
```

or

```bash
jest
```

Remember to install the necessary dependencies:

```bash
npm install --save-dev jest @types/jest ts-jest
```