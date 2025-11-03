```typescript
/**
 * @fileoverview TestFlight Beta Distribution service for managing iOS app beta distribution
 */

import { RequestOptions } from 'https';
import * as https from 'https';

/**
 * TestFlight distribution configuration options
 */
interface TestFlightConfig {
  /** Apple Developer API Key ID */
  apiKeyId: string;
  /** Apple Developer API Issuer ID */
  issuerId: string;
  /** Private key for authentication */
  privateKey: string;
  /** Bundle ID of the iOS app */
  bundleId: string;
}

/**
 * Beta tester information
 */
interface BetaTester {
  email: string;
  firstName?: string;
  lastName?: string;
  groupId?: string;
}

/**
 * Build information response
 */
interface BuildInfo {
  id: string;
  version: string;
  buildNumber: string;
  uploadedDate: Date;
  expirationDate: Date;
  status: string;
}

/**
 * Service for managing TestFlight beta distribution
 */
export class TestFlightService {
  private config: TestFlightConfig;
  private baseUrl = 'https://api.appstoreconnect.apple.com/v1';
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  /**
   * Creates a new TestFlight distribution service instance
   * @param config - Configuration options for TestFlight
   */
  constructor(config: TestFlightConfig) {
    this.config = config;
  }

  /**
   * Invites a beta tester to test the app
   * @param tester - Beta tester information
   * @throws {Error} If the API request fails
   */
  public async inviteBetaTester(tester: BetaTester): Promise<void> {
    try {
      const token = await this.getAuthToken();
      
      const options: RequestOptions = {
        hostname: 'api.appstoreconnect.apple.com',
        path: '/v1/betaTesters',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const data = {
        data: {
          type: 'betaTesters',
          attributes: {
            email: tester.email,
            firstName: tester.firstName,
            lastName: tester.lastName
          },
          relationships: {
            betaGroups: {
              data: tester.groupId ? [{
                id: tester.groupId,
                type: 'betaGroups'
              }] : []
            }
          }
        }
      };

      await this.makeRequest(options, data);
    } catch (error) {
      throw new Error(`Failed to invite beta tester: ${error.message}`);
    }
  }

  /**
   * Retrieves information about a specific build
   * @param buildId - ID of the build to retrieve
   * @returns Build information
   * @throws {Error} If the API request fails
   */
  public async getBuildInfo(buildId: string): Promise<BuildInfo> {
    try {
      const token = await this.getAuthToken();

      const options: RequestOptions = {
        hostname: 'api.appstoreconnect.apple.com',
        path: `/v1/builds/${buildId}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const response = await this.makeRequest(options);
      return this.parseBuildInfo(response);
    } catch (error) {
      throw new Error(`Failed to get build info: ${error.message}`);
    }
  }

  /**
   * Distributes a build to all beta testers
   * @param buildId - ID of the build to distribute
   * @throws {Error} If the API request fails
   */
  public async distributeBuild(buildId: string): Promise<void> {
    try {
      const token = await this.getAuthToken();

      const options: RequestOptions = {
        hostname: 'api.appstoreconnect.apple.com',
        path: `/v1/builds/${buildId}/relationships/betaGroups`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      await this.makeRequest(options, {
        data: [{
          type: 'betaGroups',
          id: 'public'
        }]
      });
    } catch (error) {
      throw new Error(`Failed to distribute build: ${error.message}`);
    }
  }

  /**
   * Makes an authenticated request to the App Store Connect API
   * @private
   */
  private async makeRequest(options: RequestOptions, data?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(responseData));
            } catch {
              resolve(responseData);
            }
          } else {
            reject(new Error(`Request failed with status ${res.statusCode}: ${responseData}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  /**
   * Gets a valid authentication token
   * @private
   */
  private async getAuthToken(): Promise<string> {
    if (this.token && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.token;
    }

    try {
      // Token generation logic would go here
      // Using JWT to generate token with config.privateKey
      // Setting this.token and this.tokenExpiry
      
      // Placeholder implementation
      this.token = 'generated-token';
      this.tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      
      return this.token;
    } catch (error) {
      throw new Error(`Failed to generate auth token: ${error.message}`);
    }
  }

  /**
   * Parses raw build information into BuildInfo object
   * @private
   */
  private parseBuildInfo(data: any): BuildInfo {
    const attributes = data.data.attributes;
    return {
      id: data.data.id,
      version: attributes.version,
      buildNumber: attributes.buildNumber,
      uploadedDate: new Date(attributes.uploadedDate),
      expirationDate: new Date(attributes.expirationDate),
      status: attributes.status
    };
  }
}
```