```typescript
/**
 * @file setupProject.ts
 * @description Sets up initial project structure and configuration
 */

import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

interface ProjectConfig {
  name: string;
  description?: string;
  version?: string;
  author?: string;
  directories: string[];
  files: {
    path: string;
    content: string;
  }[];
}

/**
 * @class ProjectSetup
 * @description Handles creation of project structure and files
 */
export class ProjectSetup {
  private config: ProjectConfig;
  private basePath: string;

  /**
   * @constructor
   * @param {ProjectConfig} config - Project configuration options
   * @param {string} basePath - Base directory path for project
   */
  constructor(config: ProjectConfig, basePath: string) {
    this.config = config;
    this.basePath = basePath;
  }

  /**
   * Creates project directory structure
   * @returns {Promise<void>}
   * @throws {Error} If directory creation fails
   */
  private async createDirectories(): Promise<void> {
    try {
      for (const dir of this.config.directories) {
        const fullPath = path.join(this.basePath, dir);
        await mkdir(fullPath, { recursive: true });
      }
    } catch (error) {
      throw new Error(`Failed to create directories: ${(error as Error).message}`);
    }
  }

  /**
   * Creates initial project files
   * @returns {Promise<void>}
   * @throws {Error} If file creation fails
   */
  private async createFiles(): Promise<void> {
    try {
      for (const file of this.config.files) {
        const fullPath = path.join(this.basePath, file.path);
        await writeFile(fullPath, file.content, 'utf8');
      }
    } catch (error) {
      throw new Error(`Failed to create files: ${(error as Error).message}`);
    }
  }

  /**
   * Creates package.json file with project metadata
   * @returns {Promise<void>}
   * @throws {Error} If package.json creation fails
   */
  private async createPackageJson(): Promise<void> {
    try {
      const packageJson = {
        name: this.config.name,
        version: this.config.version || '1.0.0',
        description: this.config.description || '',
        author: this.config.author || '',
        scripts: {
          start: 'node dist/index.js',
          build: 'tsc',
          dev: 'ts-node src/index.ts'
        },
        dependencies: {},
        devDependencies: {}
      };

      await writeFile(
        path.join(this.basePath, 'package.json'),
        JSON.stringify(packageJson, null, 2),
        'utf8'
      );
    } catch (error) {
      throw new Error(`Failed to create package.json: ${(error as Error).message}`);
    }
  }

  /**
   * Initializes the project setup
   * @returns {Promise<void>}
   * @throws {Error} If project setup fails
   */
  public async initialize(): Promise<void> {
    try {
      await this.createDirectories();
      await this.createFiles();
      await this.createPackageJson();
    } catch (error) {
      throw new Error(`Project setup failed: ${(error as Error).message}`);
    }
  }

  /**
   * Validates project configuration
   * @returns {boolean}
   * @throws {Error} If configuration is invalid
   */
  public validateConfig(): boolean {
    if (!this.config.name) {
      throw new Error('Project name is required');
    }

    if (!Array.isArray(this.config.directories)) {
      throw new Error('Directories must be an array');
    }

    if (!Array.isArray(this.config.files)) {
      throw new Error('Files must be an array');
    }

    return true;
  }
}

/**
 * Creates a new project setup instance
 * @param {ProjectConfig} config - Project configuration
 * @param {string} basePath - Project base path
 * @returns {ProjectSetup}
 */
export const createProjectSetup = (
  config: ProjectConfig,
  basePath: string
): ProjectSetup => {
  return new ProjectSetup(config, basePath);
};

export type { ProjectConfig };
```