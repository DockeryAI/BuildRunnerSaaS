```typescript
/**
 * @fileoverview Service for submitting apps to various beta testing platforms
 */

import { AxiosInstance, AxiosError } from 'axios';

/**
 * Supported beta testing platforms
 */
export enum BetaPlatform {
  TESTFLIGHT = 'testflight',
  FIREBASE_APP_DISTRIBUTION = 'firebase',
  GOOGLE_PLAY_INTERNAL = 'google_play',
}

/**
 * Build configuration for app submission
 */
export interface BuildConfig {
  appId: string;
  version: string;
  buildNumber: string;
  platform: BetaPlatform;
  buildPath: string;
  releaseNotes?: string;
}

/**
 * Response from beta platform submission
 */
export interface SubmissionResult {
  success: boolean;
  submissionId?: string;
  error?: string;
  url?: string;
}

/**
 * Service for submitting apps to beta testing platforms
 */
export class BetaSubmissionService {
  private readonly axios: AxiosInstance;
  private readonly apiKeys: Map<BetaPlatform, string>;

  /**
   * Creates an instance of BetaSubmissionService
   * @param axios - Axios instance for making HTTP requests
   * @param apiKeys - Map of platform API keys
   */
  constructor(axios: AxiosInstance, apiKeys: Map<BetaPlatform, string>) {
    this.axios = axios;
    this.apiKeys = apiKeys;
  }

  /**
   * Submits an app build to the specified beta testing platform
   * @param config - Build configuration
   * @returns Submission result
   * @throws Error if platform is not supported or submission fails
   */
  public async submitBuild(config: BuildConfig): Promise<SubmissionResult> {
    try {
      switch (config.platform) {
        case BetaPlatform.TESTFLIGHT:
          return await this.submitToTestFlight(config);
        case BetaPlatform.FIREBASE_APP_DISTRIBUTION:
          return await this.submitToFirebase(config);
        case BetaPlatform.GOOGLE_PLAY_INTERNAL:
          return await this.submitToGooglePlay(config);
        default:
          throw new Error(`Unsupported platform: ${config.platform}`);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`API Error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Submits build to TestFlight
   * @param config - Build configuration
   * @returns Submission result
   */
  private async submitToTestFlight(config: BuildConfig): Promise<SubmissionResult> {
    const apiKey = this.apiKeys.get(BetaPlatform.TESTFLIGHT);
    if (!apiKey) {
      throw new Error('TestFlight API key not configured');
    }

    try {
      const response = await this.axios.post('/testflight/submit', {
        api_key: apiKey,
        app_id: config.appId,
        version: config.version,
        build_number: config.buildNumber,
        build_path: config.buildPath,
        release_notes: config.releaseNotes
      });

      return {
        success: true,
        submissionId: response.data.submission_id,
        url: response.data.url
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Submits build to Firebase App Distribution
   * @param config - Build configuration
   * @returns Submission result
   */
  private async submitToFirebase(config: BuildConfig): Promise<SubmissionResult> {
    const apiKey = this.apiKeys.get(BetaPlatform.FIREBASE_APP_DISTRIBUTION);
    if (!apiKey) {
      throw new Error('Firebase API key not configured');
    }

    try {
      const response = await this.axios.post('/firebase/distribute', {
        api_key: apiKey,
        app_id: config.appId,
        version: config.version,
        build_path: config.buildPath,
        release_notes: config.releaseNotes
      });

      return {
        success: true,
        submissionId: response.data.distribution_id,
        url: response.data.console_url
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Submits build to Google Play Internal Testing
   * @param config - Build configuration
   * @returns Submission result
   */
  private async submitToGooglePlay(config: BuildConfig): Promise<SubmissionResult> {
    const apiKey = this.apiKeys.get(BetaPlatform.GOOGLE_PLAY_INTERNAL);
    if (!apiKey) {
      throw new Error('Google Play API key not configured');
    }

    try {
      const response = await this.axios.post('/google-play/internal', {
        api_key: apiKey,
        package_name: config.appId,
        version_code: config.buildNumber,
        version_name: config.version,
        aab_path: config.buildPath,
        release_notes: config.releaseNotes
      });

      return {
        success: true,
        submissionId: response.data.edit_id,
        url: response.data.track_url
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Checks submission status
   * @param submissionId - ID of the submission
   * @param platform - Beta testing platform
   * @returns Current status of the submission
   */
  public async checkSubmissionStatus(
    submissionId: string,
    platform: BetaPlatform
  ): Promise<string> {
    const apiKey = this.apiKeys.get(platform);
    if (!apiKey) {
      throw new Error(`API key not configured for platform: ${platform}`);
    }

    try {
      const response = await this.axios.get(`/${platform}/status/${submissionId}`, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      return response.data.status;
    } catch (error) {
      throw new Error(`Failed to check submission status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
```