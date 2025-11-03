```typescript
/**
 * @file projectSetup.ts
 * @description Handles initial project structure setup and configuration
 */

import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

interface ProjectConfig {
  name: string;
  rootDir: string;
  directories: string[];
  files: {
    path: string;
    content: string;
  }[];
}

/**
 * @class ProjectSetup
 * @description Manages project structure creation and initial setup
 */
export class ProjectSetup {
  private config: ProjectConfig;

  /**
   * @constructor
   * @param {ProjectConfig} config - Project configuration options
   */
  constructor(config: ProjectConfig) {
    this.config = config;
  }

  /**
   * Creates the base project directory structure
   * @returns {Promise<void>}
   * @throws {Error} If directory creation fails
   */
  private async createDirectories(): Promise<void> {
    try {
      for (const dir of this.config.directories) {
        const fullPath = path.join(this.config.rootDir, dir);
        await mkdir(fullPath, { recursive: true });
      }
    } catch (error) {
      throw new Error(`Failed to create directories: ${(error as Error).message}`);
    }
  }

  /**
   * Creates initial project files with provided content
   * @returns {Promise<void>}
   * @throws {Error} If file creation fails
   */
  private async createFiles(): Promise<void> {
    try {
      for (const file of this.config.files) {
        const fullPath = path.join(this.config.rootDir, file.path);
        await writeFile(fullPath, file.content, 'utf8');
      }
    } catch (error) {
      throw new Error(`Failed to create files: ${(error as Error).message}`);
    }
  }

  /**
   * Validates project configuration
   * @returns {boolean}
   * @throws {Error} If configuration is invalid
   */
  private validateConfig(): boolean {
    if (!this.config.name || typeof this.config.name !== 'string') {
      throw new Error('Invalid project name');
    }

    if (!this.config.rootDir || typeof this.config.rootDir !== 'string') {
      throw new Error('Invalid root directory');
    }

    if (!Array.isArray(this.config.directories)) {
      throw new Error('Directories must be an array');
    }

    if (!Array.isArray(this.config.files)) {
      throw new Error('Files must be an array');
    }

    return true;
  }

  /**
   * Initializes the project structure
   * @returns {Promise<void>}
   * @throws {Error} If initialization fails
   */
  public async initialize(): Promise<void> {
    try {
      this.validateConfig();
      await this.createDirectories();
      await this.createFiles();
    } catch (error) {
      throw new Error(`Project initialization failed: ${(error as Error).message}`);
    }
  }

  /**
   * Cleans up project structure in case of failure
   * @returns {Promise<void>}
   */
  public async cleanup(): Promise<void> {
    try {
      const rimraf = promisify(require('rimraf'));
      await rimraf(this.config.rootDir);
    } catch (error) {
      console.error(`Cleanup failed: ${(error as Error).message}`);
    }
  }
}

/**
 * Creates a new project setup instance with default configuration
 * @param {string} name - Project name
 * @param {string} rootDir - Project root directory
 * @returns {ProjectSetup}
 */
export const createDefaultSetup = (name: string, rootDir: string): ProjectSetup => {
  const defaultConfig: ProjectConfig = {
    name,
    rootDir,
    directories: [
      'src',
      'src/controllers',
      'src/models',
      'src/services',
      'src/utils',
      'tests',
      'config',
      'docs'
    ],
    files: [
      {
        path: 'package.json',
        content: JSON.stringify({
          name,
          version: '1.0.0',
          main: 'src/index.ts',
          scripts: {
            start: 'ts-node src/index.ts',
            test: 'jest',
            build: 'tsc'
          }
        }, null, 2)
      },
      {
        path: 'tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {
            target: 'es2020',
            module: 'commonjs',
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true,
            outDir: './dist'
          },
          include: ['src/**/*'],
          exclude: ['node_modules', 'tests']
        }, null, 2)
      },
      {
        path: 'src/index.ts',
        content: `console.log('Project ${name} initialized');`
      }
    ]
  };

  return new ProjectSetup(defaultConfig);
};
```