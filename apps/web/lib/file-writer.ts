import fs from 'fs/promises';
import path from 'path';

export interface FileToWrite {
  path: string; // Relative path like 'src/components/Button.tsx'
  content: string;
}

export class BuildFileWriter {
  private buildDir: string;

  constructor(projectId: string, buildId: string) {
    // For local development: ./builds/{projectId}/{buildId}/
    // For production: This could be a temp dir before pushing to GitHub
    this.buildDir = path.join(process.cwd(), 'builds', projectId, buildId);
  }

  /**
   * Initialize the build directory structure
   */
  async initialize(): Promise<void> {
    try {
      // Create base directory
      await fs.mkdir(this.buildDir, { recursive: true });

      // Create standard directories
      const standardDirs = [
        'src/components',
        'src/services',
        'src/api',
        'src/lib',
        'src/types',
        'src/utils',
        'public',
        'tests',
      ];

      for (const dir of standardDirs) {
        await fs.mkdir(path.join(this.buildDir, dir), { recursive: true });
      }

      console.log(`✅ Initialized build directory: ${this.buildDir}`);
    } catch (error) {
      console.error('Failed to initialize build directory:', error);
      throw error;
    }
  }

  /**
   * Write a single file
   */
  async writeFile(relativePath: string, content: string): Promise<void> {
    try {
      const fullPath = path.join(this.buildDir, relativePath);
      const dir = path.dirname(fullPath);

      // Ensure directory exists
      await fs.mkdir(dir, { recursive: true });

      // Write file
      await fs.writeFile(fullPath, content, 'utf-8');

      console.log(`✅ Wrote file: ${relativePath}`);
    } catch (error) {
      console.error(`Failed to write file ${relativePath}:`, error);
      throw error;
    }
  }

  /**
   * Write multiple files at once
   */
  async writeFiles(files: FileToWrite[]): Promise<void> {
    try {
      await Promise.all(
        files.map(file => this.writeFile(file.path, file.content))
      );
      console.log(`✅ Wrote ${files.length} files`);
    } catch (error) {
      console.error('Failed to write files:', error);
      throw error;
    }
  }

  /**
   * Write package.json
   */
  async writePackageJson(packageConfig: any): Promise<void> {
    const content = JSON.stringify(packageConfig, null, 2);
    await this.writeFile('package.json', content);
  }

  /**
   * Write README.md
   */
  async writeReadme(content: string): Promise<void> {
    await this.writeFile('README.md', content);
  }

  /**
   * Get the full path to the build directory
   */
  getBuildDir(): string {
    return this.buildDir;
  }

  /**
   * List all files in the build directory
   */
  async listFiles(subDir: string = ''): Promise<string[]> {
    try {
      const dirPath = path.join(this.buildDir, subDir);
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      const files: string[] = [];

      for (const entry of entries) {
        const relativePath = path.join(subDir, entry.name);

        if (entry.isDirectory()) {
          const subFiles = await this.listFiles(relativePath);
          files.push(...subFiles);
        } else {
          files.push(relativePath);
        }
      }

      return files;
    } catch (error) {
      console.error(`Failed to list files in ${subDir}:`, error);
      return [];
    }
  }

  /**
   * Read a specific file
   */
  async readFile(relativePath: string): Promise<string> {
    try {
      const fullPath = path.join(this.buildDir, relativePath);
      const content = await fs.readFile(fullPath, 'utf-8');
      return content;
    } catch (error) {
      console.error(`Failed to read file ${relativePath}:`, error);
      throw error;
    }
  }

  /**
   * Get file tree structure for UI display
   */
  async getFileTree(subDir: string = ''): Promise<FileTreeNode[]> {
    try {
      const dirPath = path.join(this.buildDir, subDir);
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      const tree: FileTreeNode[] = [];

      for (const entry of entries) {
        const relativePath = path.join(subDir, entry.name);

        if (entry.isDirectory()) {
          const children = await this.getFileTree(relativePath);
          tree.push({
            name: entry.name,
            path: relativePath,
            type: 'directory',
            children,
          });
        } else {
          const stats = await fs.stat(path.join(dirPath, entry.name));
          tree.push({
            name: entry.name,
            path: relativePath,
            type: 'file',
            size: stats.size,
            modified: stats.mtime,
          });
        }
      }

      return tree.sort((a, b) => {
        // Directories first, then alphabetical
        if (a.type === 'directory' && b.type === 'file') return -1;
        if (a.type === 'file' && b.type === 'directory') return 1;
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error(`Failed to get file tree for ${subDir}:`, error);
      return [];
    }
  }

  /**
   * Check if build directory exists
   */
  async exists(): Promise<boolean> {
    try {
      await fs.access(this.buildDir);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete the entire build directory
   */
  async cleanup(): Promise<void> {
    try {
      await fs.rm(this.buildDir, { recursive: true, force: true });
      console.log(`✅ Cleaned up build directory: ${this.buildDir}`);
    } catch (error) {
      console.error('Failed to cleanup build directory:', error);
      throw error;
    }
  }
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: Date;
  children?: FileTreeNode[];
}

/**
 * Infer file path from component metadata
 */
export function inferFilePath(component: {
  name: string;
  type: string;
  language?: string;
}): string {
  const { name, type, language = 'typescript' } = component;
  const ext = language === 'typescript' ? 'ts' : 'js';
  const tsxExt = language === 'typescript' ? 'tsx' : 'jsx';

  switch (type) {
    case 'frontend':
    case 'component':
      return `src/components/${name}.${tsxExt}`;

    case 'api':
    case 'endpoint':
      return `src/api/${name}.${ext}`;

    case 'service':
      return `src/services/${name}.${ext}`;

    case 'backend':
    case 'server':
      return `src/server/${name}.${ext}`;

    case 'database':
    case 'schema':
      return `src/database/${name}.${ext}`;

    case 'util':
    case 'helper':
      return `src/utils/${name}.${ext}`;

    case 'type':
    case 'interface':
      return `src/types/${name}.${ext}`;

    case 'test':
      return `tests/${name}.test.${ext}`;

    default:
      return `src/${name}.${ext}`;
  }
}
