/**
 * @file PrepareAppStoreSubmission.ts
 * Handles preparation of app assets and metadata for App Store submission
 */

import { promises as fs } from 'fs';
import path from 'path';

interface AppMetadata {
  name: string;
  version: string;
  buildNumber: string;
  description: string;
  keywords: string[];
  supportUrl: string;
  marketingUrl: string;
  privacyPolicyUrl: string;
}

interface ScreenshotSet {
  deviceType: string;
  screenshots: string[];
}

interface AppStoreAssets {
  appIcon: string;
  screenshots: ScreenshotSet[];
}

export class PrepareAppStoreSubmission {
  private metadata: AppMetadata;
  private assets: AppStoreAssets;
  private outputDir: string;

  /**
   * Creates a new PrepareAppStoreSubmission instance
   * @param metadata - App store metadata
   * @param assets - App assets including icons and screenshots
   * @param outputDir - Directory to save prepared submission
   */
  constructor(metadata: AppMetadata, assets: AppStoreAssets, outputDir: string) {
    this.metadata = metadata;
    this.assets = assets;
    this.outputDir = outputDir;
  }

  /**
   * Validates all required metadata fields are present
   * @throws Error if required fields are missing
   */
  private validateMetadata(): void {
    const requiredFields: (keyof AppMetadata)[] = [
      'name',
      'version',
      'buildNumber',
      'description',
      'privacyPolicyUrl'
    ];

    for (const field of requiredFields) {
      if (!this.metadata[field]) {
        throw new Error(`Missing required metadata field: ${field}`);
      }
    }
  }

  /**
   * Validates app icon and screenshot assets
   * @throws Error if required assets are missing or invalid
   */
  private async validateAssets(): Promise<void> {
    if (!this.assets.appIcon) {
      throw new Error('App icon is required');
    }

    try {
      await fs.access(this.assets.appIcon);
    } catch {
      throw new Error(`App icon file not found: ${this.assets.appIcon}`);
    }

    if (!this.assets.screenshots || this.assets.screenshots.length === 0) {
      throw new Error('At least one screenshot set is required');
    }

    for (const screenshotSet of this.assets.screenshots) {
      if (!screenshotSet.deviceType) {
        throw new Error('Screenshot set missing device type');
      }
      if (!screenshotSet.screenshots || screenshotSet.screenshots.length === 0) {
        throw new Error(`No screenshots provided for device type: ${screenshotSet.deviceType}`);
      }

      for (const screenshot of screenshotSet.screenshots) {
        try {
          await fs.access(screenshot);
        } catch {
          throw new Error(`Screenshot file not found: ${screenshot}`);
        }
      }
    }
  }

  /**
   * Creates the output directory structure
   */
  private async createDirectoryStructure(): Promise<void> {
    const dirs = [
      this.outputDir,
      path.join(this.outputDir, 'metadata'),
      path.join(this.outputDir, 'assets'),
      path.join(this.outputDir, 'assets/screenshots')
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  /**
   * Copies and processes all assets to the output directory
   */
  private async processAssets(): Promise<void> {
    // Copy app icon
    await fs.copyFile(
      this.assets.appIcon,
      path.join(this.outputDir, 'assets', 'icon.png')
    );

    // Copy screenshots
    for (const screenshotSet of this.assets.screenshots) {
      const deviceDir = path.join(
        this.outputDir,
        'assets/screenshots',
        screenshotSet.deviceType
      );
      await fs.mkdir(deviceDir, { recursive: true });

      for (const [index, screenshot] of screenshotSet.screenshots.entries()) {
        await fs.copyFile(
          screenshot,
          path.join(deviceDir, `screenshot_${index + 1}.png`)
        );
      }
    }
  }

  /**
   * Writes metadata files
   */
  private async writeMetadata(): Promise<void> {
    const metadataPath = path.join(this.outputDir, 'metadata', 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(this.metadata, null, 2));
  }

  /**
   * Prepares the complete app store submission package
   * @returns Promise that resolves when preparation is complete
   * @throws Error if validation fails or there are file system errors
   */
  public async prepare(): Promise<void> {
    try {
      await this.validateMetadata();
      await this.validateAssets();
      await this.createDirectoryStructure();
      await this.processAssets();
      await this.writeMetadata();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to prepare app store submission: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Cleans up the output directory
   */
  public async cleanup(): Promise<void> {
    try {
      await fs.rm(this.outputDir, { recursive: true, force: true });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to cleanup submission directory: ${error.message}`);
      }
      throw error;
    }
  }
}