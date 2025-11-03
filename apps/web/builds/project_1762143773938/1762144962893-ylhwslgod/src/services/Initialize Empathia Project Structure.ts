```typescript
/**
 * @fileoverview Service for initializing Empathia project structure
 */

import fs from 'fs/promises';
import path from 'path';

interface ProjectConfig {
  name: string;
  rootDir: string;
  template?: 'basic' | 'full';
}

interface DirectoryStructure {
  [key: string]: DirectoryStructure | null;
}

/**
 * Service class for initializing Empathia project structure
 */
export class ProjectInitializer {
  private readonly baseStructure: DirectoryStructure = {
    src: {
      components: {
        common: null,
        layouts: null,
        pages: null
      },
      services: null,
      utils: null,
      types: null,
      constants: null,
      hooks: null,
      assets: {
        images: null,
        styles: null
      }
    },
    tests: {
      unit: null,
      integration: null,
      e2e: null
    },
    docs: null,
    config: null
  };

  /**
   * Creates directory structure for new Empathia project
   * @param {ProjectConfig} config - Project configuration options
   * @throws {Error} If directory creation fails
   */
  public async initializeProject(config: ProjectConfig): Promise<void> {
    try {
      await this.validateConfig(config);
      await this.createDirectoryStructure(config.rootDir, this.baseStructure);
      await this.initializeGitignore(config.rootDir);
      await this.initializePackageJson(config);
      await this.initializeTsConfig(config.rootDir);
    } catch (error) {
      throw new Error(`Failed to initialize project: ${(error as Error).message}`);
    }
  }

  /**
   * Validates project configuration
   * @param {ProjectConfig} config - Project configuration to validate
   * @throws {Error} If configuration is invalid
   */
  private async validateConfig(config: ProjectConfig): Promise<void> {
    if (!config.name || !config.rootDir) {
      throw new Error('Project name and root directory are required');
    }

    try {
      await fs.access(config.rootDir);
      const stats = await fs.stat(config.rootDir);
      const files = await fs.readdir(config.rootDir);

      if (!stats.isDirectory()) {
        throw new Error('Root path must be a directory');
      }

      if (files.length > 0) {
        throw new Error('Root directory must be empty');
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        await fs.mkdir(config.rootDir, { recursive: true });
      } else {
        throw error;
      }
    }
  }

  /**
   * Recursively creates directory structure
   * @param {string} basePath - Base path for directory creation
   * @param {DirectoryStructure} structure - Directory structure to create
   */
  private async createDirectoryStructure(
    basePath: string,
    structure: DirectoryStructure
  ): Promise<void> {
    for (const [dir, subDirs] of Object.entries(structure)) {
      const currentPath = path.join(basePath, dir);
      await fs.mkdir(currentPath, { recursive: true });

      if (subDirs) {
        await this.createDirectoryStructure(currentPath, subDirs);
      }
    }
  }

  /**
   * Initializes .gitignore file
   * @param {string} rootDir - Project root directory
   */
  private async initializeGitignore(rootDir: string): Promise<void> {
    const gitignoreContent = [
      'node_modules/',
      'dist/',
      '.env',
      '.env.local',
      '.env.*.local',
      '*.log',
      '.DS_Store',
      'coverage/',
      '.idea/',
      '.vscode/',
      '*.swp',
      '*.swo'
    ].join('\n');

    await fs.writeFile(path.join(rootDir, '.gitignore'), gitignoreContent);
  }

  /**
   * Initializes package.json
   * @param {ProjectConfig} config - Project configuration
   */
  private async initializePackageJson(config: ProjectConfig): Promise<void> {
    const packageJson = {
      name: config.name,
      version: '0.1.0',
      private: true,
      scripts: {
        start: 'react-scripts start',
        build: 'react-scripts build',
        test: 'react-scripts test',
        eject: 'react-scripts eject',
        lint: 'eslint . --ext .ts,.tsx',
        format: 'prettier --write "src/**/*.{ts,tsx}"'
      },
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        'react-router-dom': '^6.4.0',
        typescript: '^4.9.0'
      },
      devDependencies: {
        '@types/react': '^18.0.0',
        '@types/react-dom': '^18.0.0',
        '@typescript-eslint/eslint-plugin': '^5.0.0',
        '@typescript-eslint/parser': '^5.0.0',
        eslint: '^8.0.0',
        'eslint-config-prettier': '^8.0.0',
        'eslint-plugin-react': '^7.0.0',
        prettier: '^2.0.0'
      }
    };

    await fs.writeFile(
      path.join(config.rootDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  }

  /**
   * Initializes tsconfig.json
   * @param {string} rootDir - Project root directory
   */
  private async initializeTsConfig(rootDir: string): Promise<void> {
    const tsConfig = {
      compilerOptions: {
        target: 'es5',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noFallthroughCasesInSwitch: true,
        module: 'esnext',
        moduleResolution: 'node',
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'react-jsx',
        baseUrl: 'src'
      },
      include: ['src'],
      exclude: ['node_modules', 'build', 'dist', 'scripts', 'acceptance-tests']
    };

    await fs.writeFile(
      path.join(rootDir, 'tsconfig.json'),
      JSON.stringify(tsConfig, null, 2)
    );
  }
}

export default ProjectInitializer;
```