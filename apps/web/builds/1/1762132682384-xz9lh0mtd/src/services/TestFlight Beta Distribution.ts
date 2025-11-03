```typescript
/**
 * @fileoverview TestFlight Beta Distribution service for managing iOS app beta testing
 */

import { randomUUID } from 'crypto';

/**
 * Interface for TestFlight distribution configuration
 */
interface TestFlightConfig {
  appId: string;
  apiKey: string;
  isExternalTesting: boolean;
  expirationDays?: number;
}

/**
 * Interface for beta tester details
 */
interface BetaTester {
  email: string;
  firstName?: string;
  lastName?: string;
  groupId?: string;
}

/**
 * Interface for build information
 */
interface BuildInfo {
  buildNumber: string;
  version: string;
  notes?: string;
}

/**
 * Error class for TestFlight-specific errors
 */
class TestFlightError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TestFlightError';
  }
}

/**
 * Service class for managing TestFlight beta distribution
 */
export class TestFlightDistributionService {
  private readonly config: TestFlightConfig;
  private readonly baseUrl = 'https://api.appstoreconnect.apple.com/v1';

  /**
   * Creates an instance of TestFlightDistributionService
   * @param config - Configuration options for TestFlight
   */
  constructor(config: TestFlightConfig) {
    this.validateConfig(config);
    this.config = {
      ...config,
      expirationDays: config.expirationDays || 30
    };
  }

  /**
   * Validates the provided configuration
   * @param config - Configuration to validate
   * @throws {TestFlightError} If configuration is invalid
   */
  private validateConfig(config: TestFlightConfig): void {
    if (!config.appId) {
      throw new TestFlightError('App ID is required');
    }
    if (!config.apiKey) {
      throw new TestFlightError('API key is required');
    }
  }

  /**
   * Invites a new beta tester
   * @param tester - Beta tester information
   * @returns Promise resolving to the invitation ID
   * @throws {TestFlightError} If invitation fails
   */
  public async inviteBetaTester(tester: BetaTester): Promise<string> {
    try {
      if (!tester.email) {
        throw new TestFlightError('Tester email is required');
      }

      // Generate unique invitation ID
      const invitationId = randomUUID();

      await this.sendInvitation(tester, invitationId);

      return invitationId;
    } catch (error) {
      throw new TestFlightError(
        `Failed to invite beta tester: ${(error as Error).message}`
      );
    }
  }

  /**
   * Distributes a new build to beta testers
   * @param buildInfo - Information about the build to distribute
   * @param groupIds - Optional array of group IDs to distribute to
   * @returns Promise resolving when distribution is complete
   * @throws {TestFlightError} If distribution fails
   */
  public async distributeBuild(
    buildInfo: BuildInfo,
    groupIds?: string[]
  ): Promise<void> {
    try {
      this.validateBuildInfo(buildInfo);

      await this.uploadBuild(buildInfo);

      if (groupIds?.length) {
        await this.assignBuildToGroups(buildInfo.buildNumber, groupIds);
      }

      await this.notifyTesters(buildInfo);
    } catch (error) {
      throw new TestFlightError(
        `Failed to distribute build: ${(error as Error).message}`
      );
    }
  }

  /**
   * Removes a beta tester
   * @param email - Email of tester to remove
   * @returns Promise resolving when tester is removed
   * @throws {TestFlightError} If removal fails
   */
  public async removeBetaTester(email: string): Promise<void> {
    try {
      if (!email) {
        throw new TestFlightError('Tester email is required');
      }

      await this.deleteTesterAccess(email);
    } catch (error) {
      throw new TestFlightError(
        `Failed to remove beta tester: ${(error as Error).message}`
      );
    }
  }

  /**
   * Validates build information
   * @param buildInfo - Build information to validate
   * @throws {TestFlightError} If build info is invalid
   */
  private validateBuildInfo(buildInfo: BuildInfo): void {
    if (!buildInfo.buildNumber) {
      throw new TestFlightError('Build number is required');
    }
    if (!buildInfo.version) {
      throw new TestFlightError('Version number is required');
    }
  }

  /**
   * Sends invitation to beta tester
   * @param tester - Beta tester information
   * @param invitationId - Generated invitation ID
   */
  private async sendInvitation(
    tester: BetaTester,
    invitationId: string
  ): Promise<void> {
    // Implementation would integrate with TestFlight API
    // to send actual invitation
  }

  /**
   * Uploads build to TestFlight
   * @param buildInfo - Build information
   */
  private async uploadBuild(buildInfo: BuildInfo): Promise<void> {
    // Implementation would integrate with TestFlight API
    // to upload build
  }

  /**
   * Assigns build to specific tester groups
   * @param buildNumber - Build number to assign
   * @param groupIds - Group IDs to assign build to
   */
  private async assignBuildToGroups(
    buildNumber: string,
    groupIds: string[]
  ): Promise<void> {
    // Implementation would integrate with TestFlight API
    // to assign build to groups
  }

  /**
   * Notifies testers about new build
   * @param buildInfo - Information about the new build
   */
  private async notifyTesters(buildInfo: BuildInfo): Promise<void> {
    // Implementation would integrate with TestFlight API
    // to notify testers
  }

  /**
   * Removes tester access
   * @param email - Email of tester to remove
   */
  private async deleteTesterAccess(email: string): Promise<void> {
    // Implementation would integrate with TestFlight API
    // to remove tester access
  }
}
```