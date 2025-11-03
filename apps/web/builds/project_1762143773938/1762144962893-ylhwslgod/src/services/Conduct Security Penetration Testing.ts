```typescript
/**
 * @file SecurityPenetrationTesting.ts
 * @description Service for conducting security penetration testing
 */

import { randomBytes } from 'crypto';

export interface VulnerabilityReport {
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedComponent: string;
  remediation: string;
  timestamp: Date;
}

export interface PenetrationTestConfig {
  targetUrl: string;
  scanDepth: number;
  timeout: number;
  excludePaths?: string[];
  authToken?: string;
}

export interface TestResult {
  vulnerabilities: VulnerabilityReport[];
  scanDuration: number;
  timestamp: Date;
  targetUrl: string;
  scanId: string;
}

/**
 * Service class for conducting security penetration testing
 */
export class SecurityPenetrationTesting {
  private config: PenetrationTestConfig;
  
  /**
   * Creates an instance of SecurityPenetrationTesting
   * @param config - Configuration for penetration testing
   */
  constructor(config: PenetrationTestConfig) {
    this.validateConfig(config);
    this.config = config;
  }

  /**
   * Validates the penetration testing configuration
   * @param config - Configuration to validate
   * @throws Error if configuration is invalid
   */
  private validateConfig(config: PenetrationTestConfig): void {
    if (!config.targetUrl) {
      throw new Error('Target URL is required');
    }

    if (!config.scanDepth || config.scanDepth < 1) {
      throw new Error('Scan depth must be greater than 0');
    }

    if (!config.timeout || config.timeout < 1000) {
      throw new Error('Timeout must be at least 1000ms');
    }
  }

  /**
   * Initiates a security penetration test
   * @returns Promise resolving to test results
   */
  public async runTest(): Promise<TestResult> {
    try {
      const startTime = Date.now();
      const scanId = this.generateScanId();

      const vulnerabilities = await this.performScan();
      
      return {
        vulnerabilities,
        scanDuration: Date.now() - startTime,
        timestamp: new Date(),
        targetUrl: this.config.targetUrl,
        scanId
      };
    } catch (error) {
      throw new Error(`Penetration test failed: ${error.message}`);
    }
  }

  /**
   * Performs the actual security scan
   * @returns Promise resolving to array of vulnerability reports
   */
  private async performScan(): Promise<VulnerabilityReport[]> {
    const vulnerabilities: VulnerabilityReport[] = [];

    try {
      // SQL Injection test
      await this.testSqlInjection(vulnerabilities);

      // XSS test  
      await this.testXss(vulnerabilities);

      // CSRF test
      await this.testCsrf(vulnerabilities);

      return vulnerabilities;
    } catch (error) {
      throw new Error(`Scan failed: ${error.message}`);
    }
  }

  /**
   * Tests for SQL injection vulnerabilities
   * @param vulnerabilities - Array to add found vulnerabilities to
   */
  private async testSqlInjection(vulnerabilities: VulnerabilityReport[]): Promise<void> {
    // Implementation of SQL injection testing
    // This would contain actual testing logic
  }

  /**
   * Tests for XSS vulnerabilities
   * @param vulnerabilities - Array to add found vulnerabilities to
   */
  private async testXss(vulnerabilities: VulnerabilityReport[]): Promise<void> {
    // Implementation of XSS testing
    // This would contain actual testing logic
  }

  /**
   * Tests for CSRF vulnerabilities
   * @param vulnerabilities - Array to add found vulnerabilities to
   */
  private async testCsrf(vulnerabilities: VulnerabilityReport[]): Promise<void> {
    // Implementation of CSRF testing
    // This would contain actual testing logic
  }

  /**
   * Generates a unique scan ID
   * @returns Unique scan identifier
   */
  private generateScanId(): string {
    return randomBytes(16).toString('hex');
  }

  /**
   * Stops an ongoing penetration test
   * @param scanId - ID of scan to stop
   * @returns Promise resolving when scan is stopped
   */
  public async stopTest(scanId: string): Promise<void> {
    try {
      // Implementation of test stopping logic
      // This would contain actual stopping logic
    } catch (error) {
      throw new Error(`Failed to stop test: ${error.message}`);
    }
  }

  /**
   * Retrieves the status of a running or completed test
   * @param scanId - ID of scan to check
   * @returns Promise resolving to current test status
   */
  public async getTestStatus(scanId: string): Promise<{
    status: 'running' | 'completed' | 'failed' | 'stopped';
    progress: number;
    message?: string;
  }> {
    try {
      // Implementation of status checking logic
      // This would contain actual status checking logic
      return {
        status: 'running',
        progress: 0
      };
    } catch (error) {
      throw new Error(`Failed to get test status: ${error.message}`);
    }
  }

  /**
   * Exports test results to specified format
   * @param result - Test result to export
   * @param format - Format to export to
   * @returns Promise resolving to exported data
   */
  public async exportResults(
    result: TestResult,
    format: 'pdf' | 'json' | 'xml'
  ): Promise<Buffer> {
    try {
      // Implementation of result export logic
      // This would contain actual export logic
      return Buffer.from('');
    } catch (error) {
      throw new Error(`Failed to export results: ${error.message}`);
    }
  }
}
```