```typescript
/**
 * @fileoverview Service for managing app store metadata generation and validation
 */

export interface AppStoreMetadata {
  appName: string;
  description: string;
  keywords: string[];
  screenshotUrls: string[];
  supportUrl?: string;
  marketingUrl?: string;
  privacyPolicyUrl: string;
  version: string;
  releaseNotes?: string;
  category: AppStoreCategory;
  contentRating: ContentRating;
  languages: LanguageCode[];
}

export enum AppStoreCategory {
  BUSINESS = 'BUSINESS',
  EDUCATION = 'EDUCATION',
  ENTERTAINMENT = 'ENTERTAINMENT',
  FINANCE = 'FINANCE',
  GAMES = 'GAMES',
  HEALTH_FITNESS = 'HEALTH_FITNESS',
  LIFESTYLE = 'LIFESTYLE',
  MEDICAL = 'MEDICAL',
  MUSIC = 'MUSIC',
  NAVIGATION = 'NAVIGATION',
  NEWS = 'NEWS',
  PHOTO_VIDEO = 'PHOTO_VIDEO',
  PRODUCTIVITY = 'PRODUCTIVITY',
  REFERENCE = 'REFERENCE',
  SOCIAL = 'SOCIAL',
  SPORTS = 'SPORTS',
  TRAVEL = 'TRAVEL',
  UTILITIES = 'UTILITIES'
}

export enum ContentRating {
  EVERYONE = '4+',
  NINE_PLUS = '9+', 
  TWELVE_PLUS = '12+',
  SEVENTEEN_PLUS = '17+'
}

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'it' | 'ja' | 'ko' | 'zh' | 'ru';

export class AppStoreMetadataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppStoreMetadataError';
  }
}

export class AppStoreMetadataService {
  /**
   * Creates app store metadata with validation
   * @param metadata The metadata to validate and create
   * @throws {AppStoreMetadataError} If validation fails
   * @returns {AppStoreMetadata} The validated metadata
   */
  public static createMetadata(metadata: AppStoreMetadata): AppStoreMetadata {
    this.validateMetadata(metadata);
    return {
      ...metadata,
      keywords: this.normalizeKeywords(metadata.keywords)
    };
  }

  /**
   * Validates app store metadata
   * @param metadata The metadata to validate
   * @throws {AppStoreMetadataError} If validation fails
   */
  private static validateMetadata(metadata: AppStoreMetadata): void {
    if (!metadata.appName || metadata.appName.length > 30) {
      throw new AppStoreMetadataError('App name must be between 1 and 30 characters');
    }

    if (!metadata.description || metadata.description.length > 4000) {
      throw new AppStoreMetadataError('Description must be between 1 and 4000 characters');
    }

    if (!metadata.keywords || metadata.keywords.length === 0 || metadata.keywords.length > 100) {
      throw new AppStoreMetadataError('Must provide between 1 and 100 keywords');
    }

    if (!metadata.screenshotUrls || metadata.screenshotUrls.length < 1) {
      throw new AppStoreMetadataError('At least one screenshot URL is required');
    }

    if (!metadata.privacyPolicyUrl) {
      throw new AppStoreMetadataError('Privacy policy URL is required');
    }

    if (!metadata.version || !this.isValidVersion(metadata.version)) {
      throw new AppStoreMetadataError('Valid version number is required (e.g. 1.0.0)');
    }

    if (!metadata.languages || metadata.languages.length === 0) {
      throw new AppStoreMetadataError('At least one language must be specified');
    }
  }

  /**
   * Normalizes keywords by removing duplicates and invalid characters
   * @param keywords The keywords to normalize
   * @returns {string[]} Normalized keywords
   */
  private static normalizeKeywords(keywords: string[]): string[] {
    return [...new Set(
      keywords
        .map(k => k.toLowerCase().trim())
        .filter(k => k.length > 0)
        .map(k => k.replace(/[^a-z0-9\s]/g, ''))
    )];
  }

  /**
   * Validates version number format
   * @param version Version string to validate
   * @returns {boolean} Whether version is valid
   */
  private static isValidVersion(version: string): boolean {
    const versionRegex = /^\d+\.\d+\.\d+$/;
    return versionRegex.test(version);
  }

  /**
   * Generates keywords from app description
   * @param description App description text
   * @returns {string[]} Generated keywords
   */
  public static generateKeywordsFromDescription(description: string): string[] {
    const commonWords = new Set(['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have']);
    
    return description
      .toLowerCase()
      .split(/\W+/)
      .filter(word => 
        word.length >= 2 && 
        !commonWords.has(word)
      )
      .slice(0, 100);
  }

  /**
   * Validates screenshot URLs
   * @param urls Array of screenshot URLs to validate
   * @throws {AppStoreMetadataError} If validation fails
   * @returns {boolean} True if all URLs are valid
   */
  public static validateScreenshotUrls(urls: string[]): boolean {
    const urlRegex = /^https?:\/\/.+\.(png|jpg|jpeg)$/i;
    
    const invalidUrls = urls.filter(url => !urlRegex.test(url));
    if (invalidUrls.length > 0) {
      throw new AppStoreMetadataError(`Invalid screenshot URLs: ${invalidUrls.join(', ')}`);
    }

    return true;
  }

  /**
   * Creates a draft metadata object with required fields
   * @param appName Name of the app
   * @returns {Partial<AppStoreMetadata>} Draft metadata
   */
  public static createDraftMetadata(appName: string): Partial<AppStoreMetadata> {
    return {
      appName,
      description: '',
      keywords: [],
      screenshotUrls: [],
      privacyPolicyUrl: '',
      version: '1.0.0',
      category: AppStoreCategory.UTILITIES,
      contentRating: ContentRating.EVERYONE,
      languages: ['en']
    };
  }
}
```