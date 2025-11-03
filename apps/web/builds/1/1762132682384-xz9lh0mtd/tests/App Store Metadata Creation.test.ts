Here's a comprehensive set of unit tests for the AppStoreMetadataService:

```typescript
import { 
  AppStoreMetadataService, 
  AppStoreMetadata, 
  AppStoreCategory, 
  ContentRating, 
  AppStoreMetadataError 
} from './AppStoreMetadataService';

describe('AppStoreMetadataService', () => {
  let validMetadata: AppStoreMetadata;

  beforeEach(() => {
    validMetadata = {
      appName: 'Test App',
      description: 'A test application',
      keywords: ['test', 'app'],
      screenshotUrls: ['https://example.com/screenshot.png'],
      privacyPolicyUrl: 'https://example.com/privacy',
      version: '1.0.0',
      category: AppStoreCategory.UTILITIES,
      contentRating: ContentRating.EVERYONE,
      languages: ['en']
    };
  });

  describe('createMetadata', () => {
    it('should create metadata with valid input', () => {
      const result = AppStoreMetadataService.createMetadata(validMetadata);
      expect(result).toEqual(validMetadata);
    });

    it('should normalize keywords', () => {
      const metadata = {
        ...validMetadata,
        keywords: ['Test', 'APP', 'test', 'Special@#$']
      };
      const result = AppStoreMetadataService.createMetadata(metadata);
      expect(result.keywords).toEqual(['test', 'app', 'special']);
    });
  });

  describe('validateMetadata', () => {
    it('should throw error for invalid app name length', () => {
      const metadata = {
        ...validMetadata,
        appName: 'This is a very long app name that exceeds thirty characters'
      };
      expect(() => AppStoreMetadataService.createMetadata(metadata))
        .toThrow(AppStoreMetadataError);
    });

    it('should throw error for empty description', () => {
      const metadata = {
        ...validMetadata,
        description: ''
      };
      expect(() => AppStoreMetadataService.createMetadata(metadata))
        .toThrow(AppStoreMetadataError);
    });

    it('should throw error for too many keywords', () => {
      const metadata = {
        ...validMetadata,
        keywords: Array(101).fill('keyword')
      };
      expect(() => AppStoreMetadataService.createMetadata(metadata))
        .toThrow(AppStoreMetadataError);
    });

    it('should throw error for missing screenshots', () => {
      const metadata = {
        ...validMetadata,
        screenshotUrls: []
      };
      expect(() => AppStoreMetadataService.createMetadata(metadata))
        .toThrow(AppStoreMetadataError);
    });

    it('should throw error for invalid version format', () => {
      const metadata = {
        ...validMetadata,
        version: '1.0'
      };
      expect(() => AppStoreMetadataService.createMetadata(metadata))
        .toThrow(AppStoreMetadataError);
    });
  });

  describe('generateKeywordsFromDescription', () => {
    it('should generate keywords from description', () => {
      const description = 'This is a great app for productivity and time management';
      const keywords = AppStoreMetadataService.generateKeywordsFromDescription(description);
      expect(keywords).toContain('great');
      expect(keywords).toContain('productivity');
      expect(keywords).toContain('time');
      expect(keywords).toContain('management');
      expect(keywords).not.toContain('is');
      expect(keywords).not.toContain('a');
    });

    it('should limit keywords to 100', () => {
      const longDescription = Array(200).fill('word').join(' ');
      const keywords = AppStoreMetadataService.generateKeywordsFromDescription(longDescription);
      expect(keywords.length).toBeLessThanOrEqual(100);
    });
  });

  describe('validateScreenshotUrls', () => {
    it('should validate correct screenshot URLs', () => {
      const urls = [
        'https://example.com/screenshot1.png',
        'http://example.com/screenshot2.jpg',
        'https://example.com/screenshot3.jpeg'
      ];
      expect(AppStoreMetadataService.validateScreenshotUrls(urls)).toBe(true);
    });

    it('should throw error for invalid screenshot URLs', () => {
      const urls = [
        'https://example.com/screenshot1.png',
        'invalid-url',
        'https://example.com/screenshot.gif'
      ];
      expect(() => AppStoreMetadataService.validateScreenshotUrls(urls))
        .toThrow(AppStoreMetadataError);
    });
  });

  describe('createDraftMetadata', () => {
    it('should create draft metadata with required fields', () => {
      const draft = AppStoreMetadataService.createDraftMetadata('New App');
      expect(draft).toEqual({
        appName: 'New App',
        description: '',
        keywords: [],
        screenshotUrls: [],
        privacyPolicyUrl: '',
        version: '1.0.0',
        category: AppStoreCategory.UTILITIES,
        contentRating: ContentRating.EVERYONE,
        languages: ['en']
      });
    });

    it('should use provided app name', () => {
      const draft = AppStoreMetadataService.createDraftMetadata('Custom App Name');
      expect(draft.appName).toBe('Custom App Name');
    });
  });

  describe('isValidVersion', () => {
    it.each([
      ['1.0.0', true],
      ['10.20.30', true],
      ['1.0', false],
      ['1.0.0.0', false],
      ['1.0.a', false],
      ['invalid', false]
    ])('should validate version %s as %s', (version, expected) => {
      const metadata = {
        ...validMetadata,
        version
      };
      if (expected) {
        expect(() => AppStoreMetadataService.createMetadata(metadata)).not.toThrow();
      } else {
        expect(() => AppStoreMetadataService.createMetadata(metadata))
          .toThrow(AppStoreMetadataError);
      }
    });
  });
});
```

This test suite includes:

1. Test setup with a valid metadata object for reuse
2. Tests for metadata creation and validation
3. Tests for keyword normalization
4. Tests for validation error cases
5. Tests for keyword generation from description
6. Tests for screenshot URL validation
7. Tests for draft metadata creation
8. Tests for version number validation

Key testing patterns used:

- Arrange-Act-Assert pattern
- Error case testing
- Boundary testing
- Parameter validation
- Edge cases
- Input normalization
- Data transformation

The tests cover all public methods and most important private methods through their public interfaces. They verify both successful cases and error conditions.

You can run these tests using Jest with:

```bash
npm test
```

Make sure you have Jest configured in your project with TypeScript support.