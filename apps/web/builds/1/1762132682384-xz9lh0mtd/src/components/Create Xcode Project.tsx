```typescript
/**
 * @fileoverview Component for creating new Xcode projects
 */

import { InstagramAPI } from '../apis/instagram';
import { Project, ProjectConfig } from '../types/project';

interface XcodeProjectOptions {
  name: string;
  bundleId: string;
  teamId?: string;
  deploymentTarget: string;
  devices: ('iPhone' | 'iPad')[];
  capabilities?: string[];
}

export class XcodeProjectCreator {
  private instagramApi: InstagramAPI;
  
  constructor(instagramApi: InstagramAPI) {
    this.instagramApi = instagramApi;
  }

  /**
   * Creates a new Xcode project with the specified configuration
   * @param options - Project configuration options
   * @returns Promise resolving to the created Project
   * @throws Error if project creation fails
   */
  public async createProject(options: XcodeProjectOptions): Promise<Project> {
    try {
      this.validateOptions(options);

      const projectConfig: ProjectConfig = {
        name: options.name,
        bundleId: options.bundleId,
        teamId: options.teamId || '',
        deploymentTarget: options.deploymentTarget,
        devices: [...options.devices],
        capabilities: options.capabilities || [],
        instagramApiKey: await this.instagramApi.getApiKey()
      };

      const project = await this.generateXcodeProject(projectConfig);
      
      return project;

    } catch (error) {
      throw new Error(`Failed to create Xcode project: ${error.message}`);
    }
  }

  /**
   * Validates the provided project options
   * @param options - Project options to validate
   * @throws Error if options are invalid
   */
  private validateOptions(options: XcodeProjectOptions): void {
    if (!options.name) {
      throw new Error('Project name is required');
    }

    if (!options.bundleId) {
      throw new Error('Bundle ID is required'); 
    }

    if (!options.deploymentTarget) {
      throw new Error('Deployment target is required');
    }

    if (!options.devices?.length) {
      throw new Error('At least one device type must be specified');
    }
  }

  /**
   * Generates the Xcode project files and configuration
   * @param config - Project configuration
   * @returns Promise resolving to the created Project
   */
  private async generateXcodeProject(config: ProjectConfig): Promise<Project> {
    try {
      // Create project directory
      const projectPath = await this.createProjectDirectory(config.name);

      // Generate project structure
      await this.generateProjectStructure(projectPath, config);

      // Create project files
      await this.createProjectFiles(projectPath, config);

      return {
        name: config.name,
        path: projectPath,
        config
      };

    } catch (error) {
      throw new Error(`Failed to generate Xcode project: ${error.message}`);
    }
  }

  /**
   * Creates the project directory structure
   * @param projectName - Name of the project
   * @returns Promise resolving to the project path
   */
  private async createProjectDirectory(projectName: string): Promise<string> {
    try {
      const path = `./projects/${projectName}`;
      // Create directory logic here
      return path;
    } catch (error) {
      throw new Error(`Failed to create project directory: ${error.message}`);
    }
  }

  /**
   * Generates the internal project structure
   * @param projectPath - Path to project directory
   * @param config - Project configuration
   */
  private async generateProjectStructure(
    projectPath: string, 
    config: ProjectConfig
  ): Promise<void> {
    try {
      const directories = [
        'Sources',
        'Resources',
        'Tests',
        'Configuration'
      ];

      // Create directory structure logic here

    } catch (error) {
      throw new Error(`Failed to generate project structure: ${error.message}`);
    }
  }

  /**
   * Creates the required project files
   * @param projectPath - Path to project directory
   * @param config - Project configuration
   */
  private async createProjectFiles(
    projectPath: string,
    config: ProjectConfig
  ): Promise<void> {
    try {
      const files = [
        'project.pbxproj',
        'Info.plist',
        'AppDelegate.swift',
        'SceneDelegate.swift'
      ];

      // Create files logic here

    } catch (error) {
      throw new Error(`Failed to create project files: ${error.message}`);
    }
  }
}

export default XcodeProjectCreator;
```