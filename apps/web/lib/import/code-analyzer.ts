/**
 * Code Analyzer
 *
 * Scans and analyzes project codebases to extract structure, features, and generate PRDs
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  ProjectScan,
  ProjectInfo,
  FileNode,
  Dependency,
  GitInfo,
  Documentation,
  ConfigFile,
  PackageManager,
  DetectedFeature,
  AnalysisLevel,
} from './types';

export class CodeAnalyzer {
  private readonly IGNORE_PATTERNS = [
    'node_modules',
    '.git',
    '.next',
    'build',
    'dist',
    '.vscode',
    '.idea',
    'coverage',
    '.turbo',
    '.vercel',
    '__pycache__',
    '*.pyc',
    '.DS_Store',
  ];

  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  /**
   * Scan a project directory
   */
  public async scanProject(projectPath: string): Promise<ProjectScan> {
    console.log(`🔍 Scanning project at: ${projectPath}`);

    if (!fs.existsSync(projectPath)) {
      throw new Error(`Project path does not exist: ${projectPath}`);
    }

    const projectInfo = await this.extractProjectInfo(projectPath);
    const fileStructure = await this.scanDirectory(projectPath);
    const dependencies = await this.extractDependencies(projectPath);
    const gitInfo = await this.extractGitInfo(projectPath);
    const documentation = await this.extractDocumentation(projectPath);
    const packageManagers = this.detectPackageManagers(projectPath);
    const configFiles = await this.extractConfigFiles(projectPath);

    return {
      projectInfo,
      fileStructure,
      dependencies,
      gitInfo,
      documentation,
      packageManagers,
      configFiles,
    };
  }

  /**
   * Extract project information
   */
  private async extractProjectInfo(projectPath: string): Promise<ProjectInfo> {
    const projectName = path.basename(projectPath);
    let description = '';
    let techStack: string[] = [];
    let frameworks: string[] = [];
    let languages: string[] = [];

    // Try to read package.json
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        description = packageJson.description || '';

        // Extract tech stack from dependencies
        if (packageJson.dependencies) {
          Object.keys(packageJson.dependencies).forEach(dep => {
            if (dep === 'react') frameworks.push('React');
            if (dep === 'next') frameworks.push('Next.js');
            if (dep === 'vue') frameworks.push('Vue.js');
            if (dep === '@angular/core') frameworks.push('Angular');
            if (dep === 'express') frameworks.push('Express.js');
            if (dep === '@nestjs/core') frameworks.push('NestJS');
          });
        }

        languages.push('JavaScript');
      } catch (error) {
        console.error('Failed to parse package.json:', error);
      }
    }

    // Check for TypeScript
    if (fs.existsSync(path.join(projectPath, 'tsconfig.json'))) {
      languages.push('TypeScript');
    }

    // Check for Python
    if (fs.existsSync(path.join(projectPath, 'requirements.txt')) ||
        fs.existsSync(path.join(projectPath, 'pyproject.toml'))) {
      languages.push('Python');
    }

    // Count files and lines
    const { fileCount, linesOfCode, size } = await this.countFilesAndLines(projectPath);

    // Get last modified time
    const stats = fs.statSync(projectPath);

    return {
      name: projectName,
      description,
      path: projectPath,
      techStack: [...frameworks, ...languages],
      frameworks,
      languages,
      fileCount,
      linesOfCode,
      lastModified: stats.mtime,
      size,
    };
  }

  /**
   * Scan directory structure
   */
  private async scanDirectory(dirPath: string, relativePath: string = ''): Promise<FileNode> {
    const stats = fs.statSync(dirPath);
    const name = path.basename(dirPath);

    const node: FileNode = {
      name,
      path: relativePath || name,
      type: stats.isDirectory() ? 'directory' : 'file',
    };

    if (stats.isFile()) {
      node.size = stats.size;
      node.extension = path.extname(name);
      return node;
    }

    // Directory
    const children: FileNode[] = [];
    const entries = fs.readdirSync(dirPath);

    for (const entry of entries) {
      // Skip ignored patterns
      if (this.shouldIgnore(entry)) {
        continue;
      }

      const fullPath = path.join(dirPath, entry);
      const childRelativePath = relativePath ? path.join(relativePath, entry) : entry;

      try {
        const childNode = await this.scanDirectory(fullPath, childRelativePath);
        children.push(childNode);
      } catch (error) {
        // Skip files we can't read
        console.warn(`Skipping ${fullPath}:`, error);
      }
    }

    node.children = children;
    return node;
  }

  /**
   * Extract dependencies
   */
  private async extractDependencies(projectPath: string): Promise<Dependency[]> {
    const dependencies: Dependency[] = [];

    // Node.js dependencies
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

        if (packageJson.dependencies) {
          Object.entries(packageJson.dependencies).forEach(([name, version]) => {
            dependencies.push({
              name,
              version: version as string,
              type: 'production',
              source: 'npm',
            });
          });
        }

        if (packageJson.devDependencies) {
          Object.entries(packageJson.devDependencies).forEach(([name, version]) => {
            dependencies.push({
              name,
              version: version as string,
              type: 'development',
              source: 'npm',
            });
          });
        }
      } catch (error) {
        console.error('Failed to parse package.json:', error);
      }
    }

    // Python dependencies
    const requirementsPath = path.join(projectPath, 'requirements.txt');
    if (fs.existsSync(requirementsPath)) {
      try {
        const content = fs.readFileSync(requirementsPath, 'utf-8');
        content.split('\n').forEach(line => {
          line = line.trim();
          if (line && !line.startsWith('#')) {
            const [name, version] = line.split('==');
            dependencies.push({
              name: name.trim(),
              version: version?.trim() || 'latest',
              type: 'production',
              source: 'pip',
            });
          }
        });
      } catch (error) {
        console.error('Failed to parse requirements.txt:', error);
      }
    }

    return dependencies;
  }

  /**
   * Extract Git information
   */
  private async extractGitInfo(projectPath: string): Promise<GitInfo | undefined> {
    const gitPath = path.join(projectPath, '.git');
    if (!fs.existsSync(gitPath)) {
      return undefined;
    }

    try {
      // This is a simplified version - in production you'd use a git library
      return {
        commits: 0,
        contributors: [],
        branches: ['main'],
        currentBranch: 'main',
        recentCommits: [],
      };
    } catch (error) {
      console.error('Failed to extract git info:', error);
      return undefined;
    }
  }

  /**
   * Extract documentation
   */
  private async extractDocumentation(projectPath: string): Promise<Documentation> {
    const documentation: Documentation = {
      docs: [],
    };

    // README
    const readmePath = this.findFile(projectPath, 'README.md') || this.findFile(projectPath, 'readme.md');
    if (readmePath) {
      documentation.readme = fs.readFileSync(readmePath, 'utf-8');
    }

    // CHANGELOG
    const changelogPath = this.findFile(projectPath, 'CHANGELOG.md');
    if (changelogPath) {
      documentation.changelog = fs.readFileSync(changelogPath, 'utf-8');
    }

    // CONTRIBUTING
    const contributingPath = this.findFile(projectPath, 'CONTRIBUTING.md');
    if (contributingPath) {
      documentation.contributing = fs.readFileSync(contributingPath, 'utf-8');
    }

    // Find docs directory
    const docsPath = path.join(projectPath, 'docs');
    if (fs.existsSync(docsPath)) {
      const docFiles = this.findMarkdownFiles(docsPath);
      docFiles.forEach(filePath => {
        documentation.docs.push({
          path: path.relative(projectPath, filePath),
          content: fs.readFileSync(filePath, 'utf-8'),
          type: 'markdown',
        });
      });
    }

    return documentation;
  }

  /**
   * Extract configuration files
   */
  private async extractConfigFiles(projectPath: string): Promise<ConfigFile[]> {
    const configFiles: ConfigFile[] = [];

    const configPaths = [
      'package.json',
      'tsconfig.json',
      'next.config.js',
      'next.config.mjs',
      'tailwind.config.js',
      'tailwind.config.ts',
      '.eslintrc.json',
      '.prettierrc',
      'vercel.json',
      'netlify.toml',
      'Dockerfile',
      'docker-compose.yml',
      'prisma/schema.prisma',
      'requirements.txt',
      'pyproject.toml',
    ];

    for (const configPath of configPaths) {
      const fullPath = path.join(projectPath, configPath);
      if (fs.existsSync(fullPath)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          let parsedContent: any = content;

          // Try to parse JSON
          if (fullPath.endsWith('.json')) {
            try {
              parsedContent = JSON.parse(content);
            } catch (e) {
              // Keep as string if not valid JSON
            }
          }

          configFiles.push({
            type: path.basename(configPath),
            path: configPath,
            content: parsedContent,
          });
        } catch (error) {
          console.warn(`Failed to read config file ${configPath}:`, error);
        }
      }
    }

    return configFiles;
  }

  /**
   * Detect package managers
   */
  private detectPackageManagers(projectPath: string): PackageManager[] {
    const managers: PackageManager[] = [];

    if (fs.existsSync(path.join(projectPath, 'package.json'))) {
      if (fs.existsSync(path.join(projectPath, 'package-lock.json'))) {
        managers.push({ type: 'npm', configFile: 'package.json', lockFile: 'package-lock.json' });
      } else if (fs.existsSync(path.join(projectPath, 'yarn.lock'))) {
        managers.push({ type: 'yarn', configFile: 'package.json', lockFile: 'yarn.lock' });
      } else if (fs.existsSync(path.join(projectPath, 'pnpm-lock.yaml'))) {
        managers.push({ type: 'pnpm', configFile: 'package.json', lockFile: 'pnpm-lock.yaml' });
      } else {
        managers.push({ type: 'npm', configFile: 'package.json' });
      }
    }

    if (fs.existsSync(path.join(projectPath, 'requirements.txt'))) {
      managers.push({ type: 'pip', configFile: 'requirements.txt' });
    }

    if (fs.existsSync(path.join(projectPath, 'pyproject.toml'))) {
      managers.push({ type: 'poetry', configFile: 'pyproject.toml' });
    }

    return managers;
  }

  // Helper methods

  private shouldIgnore(filename: string): boolean {
    return this.IGNORE_PATTERNS.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(filename);
      }
      return filename === pattern || filename.startsWith(pattern);
    });
  }

  private findFile(dirPath: string, filename: string): string | null {
    const filePath = path.join(dirPath, filename);
    return fs.existsSync(filePath) ? filePath : null;
  }

  private findMarkdownFiles(dirPath: string): string[] {
    const files: string[] = [];

    const scanDir = (dir: string) => {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
          scanDir(fullPath);
        } else if (fullPath.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    };

    scanDir(dirPath);
    return files;
  }

  private async countFilesAndLines(dirPath: string): Promise<{ fileCount: number; linesOfCode: number; size: number }> {
    let fileCount = 0;
    let linesOfCode = 0;
    let size = 0;

    const processFile = (filePath: string) => {
      try {
        const stats = fs.statSync(filePath);
        if (stats.size > this.MAX_FILE_SIZE) {
          return; // Skip large files
        }

        fileCount++;
        size += stats.size;

        // Count lines for code files
        const ext = path.extname(filePath);
        const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rs', '.vue', '.svelte'];
        if (codeExtensions.includes(ext)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          linesOfCode += content.split('\n').length;
        }
      } catch (error) {
        // Skip files we can't read
      }
    };

    const scanDir = (dir: string) => {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        if (this.shouldIgnore(entry)) continue;

        const fullPath = path.join(dir, entry);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
          scanDir(fullPath);
        } else {
          processFile(fullPath);
        }
      }
    };

    scanDir(dirPath);
    return { fileCount, linesOfCode, size };
  }
}

export const codeAnalyzer = new CodeAnalyzer();
