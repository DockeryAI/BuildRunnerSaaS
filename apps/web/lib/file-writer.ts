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

      // Create default package.json
      const defaultPackageJson = {
        name: 'generated-project',
        version: '0.1.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint'
        },
        dependencies: {
          'next': '^14.0.0',
          'react': '^18.2.0',
          'react-dom': '^18.2.0'
        },
        devDependencies: {
          '@types/node': '^20.0.0',
          '@types/react': '^18.2.0',
          '@types/react-dom': '^18.2.0',
          'typescript': '^5.0.0'
        }
      };

      await fs.writeFile(
        path.join(this.buildDir, 'package.json'),
        JSON.stringify(defaultPackageJson, null, 2),
        'utf-8'
      );

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

  // ============================================================================
  // NEW: App Assembly Methods (Phase 1)
  // ============================================================================

  /**
   * Initialize complete project structure from templates
   */
  async initializeProjectStructure(
    appType: 'web' | 'mobile',
    framework: 'nextjs' | 'expo',
    appConfig: any
  ): Promise<void> {
    console.log(`🚀 Initializing ${framework} project structure...`);

    const templateDir = path.join(process.cwd(), 'lib', 'templates', framework);

    try {
      // Read and process templates
      const files = await fs.readdir(templateDir);

      for (const file of files) {
        if (file.endsWith('.template')) {
          const templatePath = path.join(templateDir, file);
          let content = await fs.readFile(templatePath, 'utf-8');

          // Replace placeholders
          content = this.replacePlaceholders(content, appConfig);

          // Determine output path
          const outputFile = file.replace('.template', '');
          const outputPath = this.getOutputPath(outputFile, framework);

          await this.writeFile(outputPath, content);
        }
      }

      console.log(`✅ Project structure initialized`);
    } catch (error) {
      console.error('Failed to initialize project structure:', error);
      throw error;
    }
  }

  /**
   * Replace template placeholders with actual values
   */
  private replacePlaceholders(content: string, config: any): string {
    return content
      .replace(/\{\{PROJECT_NAME\}\}/g, config.projectName || 'generated-app')
      .replace(/\{\{APP_NAME\}\}/g, config.appName || 'Generated App')
      .replace(/\{\{APP_DESCRIPTION\}\}/g, config.description || 'Generated by BuildRunner')
      .replace(/\{\{PROJECT_SLUG\}\}/g, (config.projectName || 'generated-app').toLowerCase().replace(/[^a-z0-9-]/g, '-'))
      .replace(/\{\{BUNDLE_ID\}\}/g, `com.buildrunner.${(config.projectName || 'app').toLowerCase()}`)
      .replace(/\{\{PACKAGE_NAME\}\}/g, `com.buildrunner.${(config.projectName || 'app').toLowerCase()}`);
  }

  /**
   * Get output path for template file
   */
  private getOutputPath(filename: string, framework: string): string {
    if (filename.startsWith('app-')) {
      const appFilename = filename.replace('app-', '');
      return `app/${appFilename}`;
    }
    return filename;
  }

  /**
   * Assemble components into working application
   */
  async assembleApplication(
    components: any[],
    appType: 'web' | 'mobile',
    framework: 'nextjs' | 'expo'
  ): Promise<void> {
    console.log(`🔨 Assembling ${components.length} components into ${framework} app...`);

    if (framework === 'nextjs') {
      await this.assembleNextJSApp(components);
    } else if (framework === 'expo') {
      await this.assembleExpoApp(components);
    }

    console.log(`✅ Application assembled`);
  }

  /**
   * Assemble Next.js web app
   */
  private async assembleNextJSApp(components: any[]): Promise<void> {
    // Generate imports for all components
    const imports: string[] = [];
    const componentRenders: string[] = [];

    const frontendComponents = components.filter(c =>
      c.type === 'frontend' || c.type === 'component'
    );

    for (const component of frontendComponents) {
      const componentName = this.sanitizeComponentName(component.name);
      const filePath = component.filePath || inferFilePath(component);

      // Add import
      const importPath = `../${filePath.replace('.tsx', '').replace('.jsx', '')}`;
      imports.push(`import ${componentName} from '${importPath}';`);

      // Add component render
      componentRenders.push(`        <div className="mb-8">
          <${componentName} />
        </div>`);
    }

    // Read existing page template
    let pageContent = await fs.readFile(
      path.join(this.buildDir, 'app/page.tsx'),
      'utf-8'
    );

    // Replace placeholders
    pageContent = pageContent
      .replace('{{IMPORTS}}', imports.join('\n'))
      .replace('{{COMPONENTS}}', componentRenders.join('\n'));

    // Write updated page
    await this.writeFile('app/page.tsx', pageContent);
  }

  /**
   * Assemble Expo mobile app
   */
  private async assembleExpoApp(components: any[]): Promise<void> {
    // Generate imports and tab screens
    const imports: string[] = [];
    const tabScreens: string[] = [];

    const frontendComponents = components.filter(c =>
      c.type === 'frontend' || c.type === 'component'
    ).slice(0, 5); // Max 5 tabs

    for (const component of frontendComponents) {
      const componentName = this.sanitizeComponentName(component.name);
      const filePath = component.filePath || inferFilePath(component);

      // Add import
      const importPath = `./${filePath}`;
      imports.push(`import ${componentName} from '${importPath}';`);

      // Add tab screen
      tabScreens.push(`        <Tab.Screen
          name="${componentName}"
          component={${componentName}}
          options={{ title: '${component.name}' }}
        />`);
    }

    // Read existing App template
    let appContent = await fs.readFile(
      path.join(this.buildDir, 'App.tsx'),
      'utf-8'
    );

    // Replace placeholders
    appContent = appContent
      .replace('{{IMPORTS}}', imports.join('\n'))
      .replace('{{TAB_SCREENS}}', tabScreens.join('\n'));

    // Write updated App
    await this.writeFile('App.tsx', appContent);
  }

  /**
   * Sanitize component name for use as variable
   */
  private sanitizeComponentName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^[0-9]/, 'Component$&')
      || 'Component';
  }

  /**
   * Update package.json with required dependencies
   */
  async updateDependencies(components: any[]): Promise<void> {
    console.log(`📦 Updating dependencies...`);

    const packageJsonPath = path.join(this.buildDir, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

    // Scan component code for imports
    const requiredPackages = new Set<string>();

    for (const component of components) {
      if (component.code) {
        const imports = this.extractImports(component.code);
        imports.forEach(pkg => requiredPackages.add(pkg));
      }
    }

    // Add common packages based on what we found
    const packageVersions: Record<string, string> = {
      'axios': '^1.6.0',
      '@supabase/supabase-js': '^2.38.0',
      'date-fns': '^2.30.0',
      'zod': '^3.22.0',
    };

    for (const pkg of requiredPackages) {
      if (packageVersions[pkg] && !packageJson.dependencies[pkg]) {
        packageJson.dependencies[pkg] = packageVersions[pkg];
      }
    }

    // Write updated package.json
    await fs.writeFile(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2),
      'utf-8'
    );

    console.log(`✅ Dependencies updated`);
  }

  /**
   * Extract third-party package imports from code
   */
  private extractImports(code: string): string[] {
    const imports: string[] = [];
    const importRegex = /from\s+['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(code)) !== null) {
      const importPath = match[1];

      // Only external packages (not relative imports)
      if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
        // Get root package name
        const packageName = importPath.startsWith('@')
          ? importPath.split('/').slice(0, 2).join('/')
          : importPath.split('/')[0];

        imports.push(packageName);
      }
    }

    return imports;
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
