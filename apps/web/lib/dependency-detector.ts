/**
 * Dependency Detector
 * Detects npm/yarn packages mentioned in code and auto-installs them
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface DetectedDependency {
  name: string;
  version?: string;
  type: 'dependency' | 'devDependency';
  source: string; // file where it was detected
}

export class DependencyDetector {

  /**
   * Detect dependencies from import statements in code
   */
  async detectFromCode(code: string, filePath: string): Promise<DetectedDependency[]> {
    const dependencies: DetectedDependency[] = [];
    const seen = new Set<string>();

    // Match import statements
    const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(code)) !== null) {
      const importPath = match[1];

      // Skip relative imports
      if (importPath.startsWith('.') || importPath.startsWith('/')) {
        continue;
      }

      // Skip Node.js built-ins
      const builtins = [
        'fs', 'path', 'http', 'https', 'crypto', 'events', 'stream', 'util',
        'os', 'child_process', 'buffer', 'url', 'querystring', 'zlib'
      ];
      if (builtins.includes(importPath)) {
        continue;
      }

      // Extract package name (handle scoped packages)
      let packageName = importPath;
      if (importPath.startsWith('@')) {
        // Scoped package: @scope/package/subpath -> @scope/package
        const parts = importPath.split('/');
        packageName = `${parts[0]}/${parts[1]}`;
      } else {
        // Regular package: package/subpath -> package
        packageName = importPath.split('/')[0];
      }

      if (!seen.has(packageName)) {
        seen.add(packageName);
        dependencies.push({
          name: packageName,
          type: this.inferDependencyType(packageName),
          source: filePath
        });
      }
    }

    // Match require statements
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = requireRegex.exec(code)) !== null) {
      const importPath = match[1];

      if (importPath.startsWith('.') || importPath.startsWith('/')) {
        continue;
      }

      let packageName = importPath;
      if (importPath.startsWith('@')) {
        const parts = importPath.split('/');
        packageName = `${parts[0]}/${parts[1]}`;
      } else {
        packageName = importPath.split('/')[0];
      }

      if (!seen.has(packageName)) {
        seen.add(packageName);
        dependencies.push({
          name: packageName,
          type: this.inferDependencyType(packageName),
          source: filePath
        });
      }
    }

    return dependencies;
  }

  /**
   * Infer if dependency should be dev or regular
   */
  private inferDependencyType(packageName: string): 'dependency' | 'devDependency' {
    const devKeywords = [
      'eslint', 'prettier', 'jest', 'vitest', 'playwright', 'cypress',
      '@types/', 'typescript', '@testing-library/', 'test', 'mock'
    ];

    const lower = packageName.toLowerCase();
    if (devKeywords.some(kw => lower.includes(kw))) {
      return 'devDependency';
    }

    return 'dependency';
  }

  /**
   * Get currently installed dependencies
   */
  async getInstalledDependencies(projectPath: string): Promise<Set<string>> {
    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      const installed = new Set<string>();

      if (packageJson.dependencies) {
        Object.keys(packageJson.dependencies).forEach(dep => installed.add(dep));
      }
      if (packageJson.devDependencies) {
        Object.keys(packageJson.devDependencies).forEach(dep => installed.add(dep));
      }

      return installed;
    } catch {
      return new Set();
    }
  }

  /**
   * Get missing dependencies
   */
  async getMissingDependencies(
    projectPath: string,
    detected: DetectedDependency[]
  ): Promise<DetectedDependency[]> {
    const installed = await this.getInstalledDependencies(projectPath);
    return detected.filter(dep => !installed.has(dep.name));
  }

  /**
   * Install dependencies
   */
  async installDependencies(
    projectPath: string,
    dependencies: DetectedDependency[]
  ): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Group by type
    const regular = dependencies.filter(d => d.type === 'dependency');
    const dev = dependencies.filter(d => d.type === 'devDependency');

    try {
      // Check if npm or yarn
      const packageManager = await this.detectPackageManager(projectPath);

      // Install regular dependencies
      if (regular.length > 0) {
        const packages = regular.map(d => d.name).join(' ');
        const cmd = packageManager === 'yarn'
          ? `yarn add ${packages}`
          : `npm install ${packages}`;

        console.log(`Installing dependencies: ${packages}`);
        await execAsync(cmd, { cwd: projectPath });
      }

      // Install dev dependencies
      if (dev.length > 0) {
        const packages = dev.map(d => d.name).join(' ');
        const cmd = packageManager === 'yarn'
          ? `yarn add -D ${packages}`
          : `npm install --save-dev ${packages}`;

        console.log(`Installing dev dependencies: ${packages}`);
        await execAsync(cmd, { cwd: projectPath });
      }

      return { success: true, errors };

    } catch (error: any) {
      errors.push(error.message);
      return { success: false, errors };
    }
  }

  /**
   * Detect package manager (npm or yarn)
   */
  private async detectPackageManager(projectPath: string): Promise<'npm' | 'yarn'> {
    try {
      await fs.access(path.join(projectPath, 'yarn.lock'));
      return 'yarn';
    } catch {
      return 'npm';
    }
  }

  /**
   * Scan project files for dependencies
   */
  async scanProject(projectPath: string): Promise<DetectedDependency[]> {
    const allDependencies: DetectedDependency[] = [];
    const seen = new Set<string>();

    const scan = async (dir: string) => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          // Skip node_modules, .git, etc.
          if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.next') {
            continue;
          }

          if (entry.isDirectory()) {
            await scan(fullPath);
          } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js') || entry.name.endsWith('.jsx')) {
            const code = await fs.readFile(fullPath, 'utf-8');
            const deps = await this.detectFromCode(code, fullPath);

            deps.forEach(dep => {
              if (!seen.has(dep.name)) {
                seen.add(dep.name);
                allDependencies.push(dep);
              }
            });
          }
        }
      } catch (error) {
        console.warn(`Failed to scan ${dir}:`, error);
      }
    };

    await scan(projectPath);
    return allDependencies;
  }

  /**
   * Auto-install missing dependencies
   */
  async autoInstall(projectPath: string): Promise<{
    installed: DetectedDependency[];
    errors: string[];
  }> {
    const detected = await this.scanProject(projectPath);
    const missing = await this.getMissingDependencies(projectPath, detected);

    if (missing.length === 0) {
      return { installed: [], errors: [] };
    }

    const result = await this.installDependencies(projectPath, missing);

    return {
      installed: result.success ? missing : [],
      errors: result.errors
    };
  }
}

export const dependencyDetector = new DependencyDetector();
