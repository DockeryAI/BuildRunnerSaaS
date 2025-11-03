```typescript
/**
 * @fileoverview Component for creating a new Xcode project with Instagram API integration
 */

import { InstagramApiConfig } from './types/instagram';
import { XcodeProjectConfig } from './types/xcode';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface CreateProjectOptions {
  projectName: string;
  bundleIdentifier: string;
  targetDirectory: string;
  instagramApiKey: string;
  teamId?: string;
}

/**
 * Creates a new Xcode project with Instagram API integration
 * @param options Project creation options
 * @returns Promise that resolves when project is created
 * @throws Error if project creation fails
 */
export async function createXcodeProject(options: CreateProjectOptions): Promise<void> {
  try {
    validateOptions(options);
    
    await createBaseProject(options);
    await configureInstagramApi(options);
    await setupProjectStructure(options);
    await updateBuildSettings(options);
    
  } catch (error) {
    throw new Error(`Failed to create Xcode project: ${error.message}`);
  }
}

/**
 * Validates the provided project options
 * @param options Options to validate
 * @throws Error if validation fails
 */
function validateOptions(options: CreateProjectOptions): void {
  if (!options.projectName) {
    throw new Error('Project name is required');
  }

  if (!options.bundleIdentifier) {
    throw new Error('Bundle identifier is required'); 
  }

  if (!options.targetDirectory) {
    throw new Error('Target directory is required');
  }

  if (!options.instagramApiKey) {
    throw new Error('Instagram API key is required');
  }
}

/**
 * Creates the base Xcode project structure
 * @param options Project options
 */
async function createBaseProject(options: CreateProjectOptions): Promise<void> {
  const { projectName, targetDirectory } = options;

  try {
    await execAsync(`xcodegen generate --spec ./templates/project.yml --project ${targetDirectory}/${projectName}`);
  } catch (error) {
    throw new Error(`Failed to create base project: ${error.message}`);
  }
}

/**
 * Configures Instagram API integration
 * @param options Project options
 */
async function configureInstagramApi(options: CreateProjectOptions): Promise<void> {
  const { projectName, targetDirectory, instagramApiKey } = options;
  const configPath = path.join(targetDirectory, projectName, 'Config');

  try {
    await fs.promises.mkdir(configPath, { recursive: true });

    const apiConfig: InstagramApiConfig = {
      apiKey: instagramApiKey,
      apiEndpoint: 'https://api.instagram.com/v1',
      scopes: ['basic', 'public_content']
    };

    await fs.promises.writeFile(
      path.join(configPath, 'InstagramConfig.plist'),
      generatePlistContent(apiConfig)
    );
  } catch (error) {
    throw new Error(`Failed to configure Instagram API: ${error.message}`);
  }
}

/**
 * Sets up the project folder structure and files
 * @param options Project options
 */
async function setupProjectStructure(options: CreateProjectOptions): Promise<void> {
  const { projectName, targetDirectory } = options;
  const directories = [
    'Sources',
    'Resources',
    'Tests',
    'Supporting Files'
  ];

  try {
    for (const dir of directories) {
      await fs.promises.mkdir(
        path.join(targetDirectory, projectName, dir),
        { recursive: true }
      );
    }

    // Copy template files
    await copyTemplateFiles(options);
  } catch (error) {
    throw new Error(`Failed to setup project structure: ${error.message}`);
  }
}

/**
 * Updates Xcode build settings
 * @param options Project options
 */
async function updateBuildSettings(options: CreateProjectOptions): Promise<void> {
  const { projectName, targetDirectory, bundleIdentifier, teamId } = options;
  
  const buildSettings: XcodeProjectConfig = {
    PRODUCT_BUNDLE_IDENTIFIER: bundleIdentifier,
    DEVELOPMENT_TEAM: teamId || '',
    SWIFT_VERSION: '5.0',
    IPHONEOS_DEPLOYMENT_TARGET: '14.0'
  };

  try {
    await fs.promises.writeFile(
      path.join(targetDirectory, projectName, 'project.pbxproj'),
      generateProjectConfig(buildSettings)
    );
  } catch (error) {
    throw new Error(`Failed to update build settings: ${error.message}`);
  }
}

/**
 * Copies template files to the new project
 * @param options Project options
 */
async function copyTemplateFiles(options: CreateProjectOptions): Promise<void> {
  const { projectName, targetDirectory } = options;
  const templateFiles = [
    'AppDelegate.swift',
    'SceneDelegate.swift',
    'InstagramService.swift',
    'Info.plist'
  ];

  try {
    for (const file of templateFiles) {
      await fs.promises.copyFile(
        path.join(__dirname, 'templates', file),
        path.join(targetDirectory, projectName, 'Sources', file)
      );
    }
  } catch (error) {
    throw new Error(`Failed to copy template files: ${error.message}`);
  }
}

/**
 * Generates plist content for Instagram configuration
 * @param config Instagram API configuration
 * @returns Formatted plist content
 */
function generatePlistContent(config: InstagramApiConfig): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>ApiKey</key>
  <string>${config.apiKey}</string>
  <key>ApiEndpoint</key>
  <string>${config.apiEndpoint}</string>
  <key>Scopes</key>
  <array>
    ${config.scopes.map(scope => `<string>${scope}</string>`).join('\n    ')}
  </array>
</dict>
</plist>`;
}

/**
 * Generates Xcode project configuration
 * @param config Build settings configuration
 * @returns Formatted project configuration
 */
function generateProjectConfig(config: XcodeProjectConfig): string {
  return `// !$*UTF8*$!
{
  archiveVersion = 1;
  classes = {
  };
  objectVersion = 54;
  objects = {
    /* Begin XCBuildConfiguration section */
    buildSettings = {
      PRODUCT_BUNDLE_IDENTIFIER = "${config.PRODUCT_BUNDLE_IDENTIFIER}";
      DEVELOPMENT_TEAM = "${config.DEVELOPMENT_TEAM}";
      SWIFT_VERSION = "${config.SWIFT_VERSION}";
      IPHONEOS_DEPLOYMENT_TARGET = "${config.IPHONEOS_DEPLOYMENT_TARGET}";
    };
    /* End XCBuildConfiguration section */
  };
  rootObject = PROJECT_ROOT_OBJECT_ID;
}`;
}
```