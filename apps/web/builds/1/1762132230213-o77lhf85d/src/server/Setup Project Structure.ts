```typescript
/**
 * @file project-setup.ts
 * @description Sets up initial project structure and configuration
 */

import fs from 'fs';
import path from 'path';
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
    name: string;
    content: string;
    path?: string;
  }[];
}

/**
 * @class ProjectSetup
 * @description Handles creation of project structure and configuration files
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
   * Creates the project directory structure
   * @returns {Promise<void>}
   * @throws {Error} If directory creation fails
   */
  public async createDirectories(): Promise<void> {
    try {
      for (const dir of this.config.directories) {
        const fullPath = path.join(this.basePath, dir);
        await mkdir(fullPath, { recursive: true });
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create directories: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Creates initial project files
   * @returns {Promise<void>}
   * @throws {Error} If file creation fails
   */
  public async createFiles(): Promise<void> {
    try {
      for (const file of this.config.files) {
        const filePath = file.path 
          ? path.join(this.basePath, file.path, file.name)
          : path.join(this.basePath, file.name);
          
        await writeFile(filePath, file.content, 'utf8');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create files: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Initializes the complete project setup
   * @returns {Promise<void>}
   */
  public async initialize(): Promise<void> {
    try {
      await this.createDirectories();
      await this.createFiles();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Project initialization failed: ${error.message}`);
      }
      throw error;
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
export const createProjectSetup = (config: ProjectConfig, basePath: string): ProjectSetup => {
  return new ProjectSetup(config, basePath);
};

/**
 * Default project configuration
 */
export const DEFAULT_CONFIG: ProjectConfig = {
  name: 'new-project',
  version: '1.0.0',
  directories: [
    'src',
    'test',
    'config',
    'docs'
  ],
  files: [
    {
      name: 'package.json',
      content: JSON.stringify({
        name: 'new-project',
        version: '1.0.0',
        main: 'index.js',
        scripts: {
          test: 'echo "Error: no test specified" && exit 1'
        }
      }, null, 2)
    },
    {
      name: 'README.md',
      content: '# New Project\n\nProject description goes here.'
    },
    {
      name: '.gitignore',
      content: 'node_modules\ndist\n.env\n'
    },
    {
      name: 'tsconfig.json',
      content: JSON.stringify({
        compilerOptions: {
          target: 'es2020',
          module: 'commonjs',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true
        }
      }, null, 2)
    }
  ]
};
```