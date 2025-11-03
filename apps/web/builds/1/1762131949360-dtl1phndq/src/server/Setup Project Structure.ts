```typescript
/**
 * @file setupProject.ts
 * @description Sets up initial project structure and configuration
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

interface ProjectConfig {
  name: string;
  rootDir: string;
  directories: string[];
  files: {
    [key: string]: string;
  };
}

/**
 * @class ProjectSetup
 * @description Handles creation of project structure and base files
 */
export class ProjectSetup {
  private config: ProjectConfig;

  /**
   * @constructor
   * @param {ProjectConfig} config - Project configuration object
   */
  constructor(config: ProjectConfig) {
    this.config = config;
  }

  /**
   * Creates the project directory structure
   * @throws {Error} If directory creation fails
   */
  public async createDirectories(): Promise<void> {
    try {
      await mkdir(this.config.rootDir, { recursive: true });

      const dirPromises = this.config.directories.map(async (dir) => {
        const fullPath = path.join(this.config.rootDir, dir);
        await mkdir(fullPath, { recursive: true });
      });

      await Promise.all(dirPromises);
    } catch (error) {
      throw new Error(`Failed to create directories: ${(error as Error).message}`);
    }
  }

  /**
   * Creates initial project files
   * @throws {Error} If file creation fails
   */
  public async createFiles(): Promise<void> {
    try {
      const filePromises = Object.entries(this.config.files).map(async ([filename, content]) => {
        const fullPath = path.join(this.config.rootDir, filename);
        await writeFile(fullPath, content, 'utf8');
      });

      await Promise.all(filePromises);
    } catch (error) {
      throw new Error(`Failed to create files: ${(error as Error).message}`);
    }
  }

  /**
   * Initializes the complete project structure
   * @returns {Promise<void>}
   */
  public async initialize(): Promise<void> {
    try {
      await this.createDirectories();
      await this.createFiles();
    } catch (error) {
      throw new Error(`Project setup failed: ${(error as Error).message}`);
    }
  }

  /**
   * Validates project configuration
   * @throws {Error} If configuration is invalid
   */
  public validateConfig(): void {
    if (!this.config.name) {
      throw new Error('Project name is required');
    }

    if (!this.config.rootDir) {
      throw new Error('Root directory is required');
    }

    if (!Array.isArray(this.config.directories)) {
      throw new Error('Directories must be an array');
    }

    if (typeof this.config.files !== 'object') {
      throw new Error('Files must be an object');
    }
  }
}

/**
 * @function createDefaultConfig
 * @description Creates a default project configuration
 * @returns {ProjectConfig}
 */
export function createDefaultConfig(name: string): ProjectConfig {
  return {
    name,
    rootDir: path.join(process.cwd(), name),
    directories: [
      'src',
      'src/controllers',
      'src/models',
      'src/services',
      'src/middleware',
      'src/utils',
      'tests',
      'config'
    ],
    files: {
      'package.json': JSON.stringify({
        name,
        version: '1.0.0',
        main: 'src/index.ts',
        scripts: {
          start: 'ts-node src/index.ts',
          build: 'tsc',
          test: 'jest'
        }
      }, null, 2),
      'tsconfig.json': JSON.stringify({
        compilerOptions: {
          target: 'es2020',
          module: 'commonjs',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          outDir: './dist',
          rootDir: './src'
        },
        include: ['src/**/*'],
        exclude: ['node_modules', 'tests']
      }, null, 2),
      'src/index.ts': `import express from 'express';\n\nconst app = express();\n\napp.listen(3000, () => {\n  console.log('Server running on port 3000');\n});`
    }
  };
}

export default ProjectSetup;
```