Here's a comprehensive set of unit tests for the AppStoreSubmissionManager component using Jest:

```typescript
import { AppStoreSubmissionManager } from './AppStoreSubmissionManager';
import { InstagramApiClient } from './instagram-api-client';

// Mock InstagramApiClient
jest.mock('./instagram-api-client');

describe('AppStoreSubmissionManager', () => {
  let manager: AppStoreSubmissionManager;
  const mockConfig = {
    appId: 'test-app-id',
    bundleId: 'com.test.app',
    version: '1.0.0',
    apiKey: 'test-api-key',
    assets: []
  };

  const mockSubmission = {
    metadata: {
      name: 'Test App',
      description: 'Test Description',
      category: 'Test Category'
    },
    assets: [
      { type: 'icon', data: Buffer.from('icon') },
      { type: 'screenshots', data: Buffer.from('screenshots') },
      { type: 'preview', data: Buffer.from('preview') }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new AppStoreSubmissionManager(mockConfig);
  });

  describe('validateSubmission', () => {
    it('should validate a valid submission successfully', async () => {
      (InstagramApiClient as jest.Mock).mockImplementation(() => ({
        validateConnection: jest.fn().resolves(true)
      }));

      const result = await manager.validateSubmission(mockSubmission);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should detect missing required assets', async () => {
      const invalidSubmission = {
        ...mockSubmission,
        assets: [{ type: 'icon', data: Buffer.from('icon') }]
      };

      const result = await manager.validateSubmission(invalidSubmission);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required asset: screenshots');
      expect(result.errors).toContain('Missing required asset: preview');
    });

    it('should validate metadata requirements', async () => {
      const invalidSubmission = {
        ...mockSubmission,
        metadata: {
          name: '',
          description: '',
          category: ''
        }
      };

      const result = await manager.validateSubmission(invalidSubmission);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required metadata: name');
      expect(result.errors).toContain('Missing required metadata: description');
      expect(result.errors).toContain('Missing required metadata: category');
    });

    it('should validate description length', async () => {
      const longDescription = 'a'.repeat(4001);
      const invalidSubmission = {
        ...mockSubmission,
        metadata: {
          ...mockSubmission.metadata,
          description: longDescription
        }
      };

      const result = await manager.validateSubmission(invalidSubmission);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Description exceeds maximum length of 4000 characters');
    });

    it('should handle Instagram API validation failure', async () => {
      (InstagramApiClient as jest.Mock).mockImplementation(() => ({
        validateConnection: jest.fn().rejects(new Error('API Error'))
      }));

      const result = await manager.validateSubmission(mockSubmission);

      expect(result.warnings).toContain('Instagram API validation failed: API Error');
    });
  });

  describe('prepareSubmission', () => {
    it('should prepare a valid submission package', async () => {
      (InstagramApiClient as jest.Mock).mockImplementation(() => ({
        validateConnection: jest.fn().resolves(true)
      }));

      const result = await manager.prepareSubmission(mockSubmission);

      expect(result).toBeInstanceOf(Buffer);
      expect(JSON.parse(result.toString())).toMatchObject({
        bundleId: mockConfig.bundleId,
        version: mockConfig.version
      });
    });

    it('should throw error for invalid submission', async () => {
      const invalidSubmission = {
        ...mockSubmission,
        assets: []
      };

      await expect(manager.prepareSubmission(invalidSubmission))
        .rejects
        .toThrow('Submission validation failed');
    });

    it('should process all assets correctly', async () => {
      (InstagramApiClient as jest.Mock).mockImplementation(() => ({
        validateConnection: jest.fn().resolves(true)
      }));

      const result = await manager.prepareSubmission(mockSubmission);
      const parsed = JSON.parse(result.toString());

      expect(parsed.assets).toHaveLength(mockSubmission.assets.length);
      parsed.assets.forEach((asset: any, index: number) => {
        expect(asset.type).toBe(mockSubmission.assets[index].type);
        expect(asset.data).toBeTruthy();
      });
    });
  });

  describe('error handling', () => {
    it('should handle validation errors gracefully', async () => {
      const errorMessage = 'Validation error';
      (InstagramApiClient as jest.Mock).mockImplementation(() => ({
        validateConnection: jest.fn().rejects(new Error(errorMessage))
      }));

      await expect(manager.validateSubmission(mockSubmission))
        .resolves
        .toMatchObject({
          isValid: true,
          warnings: expect.arrayContaining([`Instagram API validation failed: ${errorMessage}`])
        });
    });

    it('should handle asset processing errors', async () => {
      const invalidAsset = {
        type: 'unknown',
        data: Buffer.from('invalid')
      };

      const invalidSubmission = {
        ...mockSubmission,
        assets: [...mockSubmission.assets, invalidAsset]
      };

      await expect(manager.prepareSubmission(invalidSubmission))
        .rejects
        .toThrow('Failed to prepare submission');
    });
  });
});
```

This test suite includes:

1. Basic setup with mocks for InstagramApiClient
2. Tests for submission validation:
   - Valid submission case
   - Missing required assets
   - Metadata validation
   - Description length validation
   - Instagram API integration validation
3. Tests for submission preparation:
   - Valid submission package generation
   - Invalid submission handling
   - Asset processing
4. Error handling tests:
   - Validation errors
   - Asset processing errors

Additional considerations:

1. Add more specific test cases for each asset type (icon, screenshots, preview)
2. Add tests for edge cases in metadata validation
3. Add tests for different Instagram API response scenarios
4. Add tests for package generation with different submission configurations

To run these tests:

```bash
npm test
```

Make sure to have Jest configured in your project with the following in your package.json:

```json
{
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "moduleFileExtensions": ["ts", "tsx", "js", "jsx", "json", "node"]
  }
}
```