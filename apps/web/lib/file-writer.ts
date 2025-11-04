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

      // Create default package.json with shadcn/ui and design dependencies
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
          'react-dom': '^18.2.0',
          // shadcn/ui dependencies
          '@radix-ui/react-alert-dialog': '^1.0.5',
          '@radix-ui/react-avatar': '^1.0.4',
          '@radix-ui/react-dialog': '^1.0.5',
          '@radix-ui/react-dropdown-menu': '^2.0.6',
          '@radix-ui/react-label': '^2.0.2',
          '@radix-ui/react-select': '^2.0.0',
          '@radix-ui/react-slot': '^1.0.2',
          '@radix-ui/react-tabs': '^1.0.4',
          'class-variance-authority': '^0.7.0',
          'clsx': '^2.1.0',
          'tailwind-merge': '^2.2.0',
          'lucide-react': '^0.344.0',
          // Animations
          'framer-motion': '^11.0.3'
        },
        devDependencies: {
          '@types/node': '^20.0.0',
          '@types/react': '^18.2.0',
          '@types/react-dom': '^18.2.0',
          'typescript': '^5.0.0',
          'tailwindcss': '^3.4.0',
          'tailwindcss-animate': '^1.0.7',
          'autoprefixer': '^10.4.17',
          'postcss': '^8.4.33'
        }
      };

      await fs.writeFile(
        path.join(this.buildDir, 'package.json'),
        JSON.stringify(defaultPackageJson, null, 2),
        'utf-8'
      );

      // Initialize shadcn/ui configuration and components
      await this.initializeShadcnUI();

      console.log(`✅ Initialized build directory: ${this.buildDir}`);
    } catch (error) {
      console.error('Failed to initialize build directory:', error);
      throw error;
    }
  }

  /**
   * Initialize shadcn/ui configuration and base components
   */
  async initializeShadcnUI(): Promise<void> {
    try {
      // Create components.json for shadcn/ui
      const componentsJson = {
        "$schema": "https://ui.shadcn.com/schema.json",
        "style": "default",
        "rsc": true,
        "tsx": true,
        "tailwind": {
          "config": "tailwind.config.ts",
          "css": "app/globals.css",
          "baseColor": "slate",
          "cssVariables": true
        },
        "aliases": {
          "components": "@/components",
          "utils": "@/lib/utils"
        }
      };

      await this.writeFile('components.json', JSON.stringify(componentsJson, null, 2));

      // Create lib/utils.ts (required for shadcn/ui)
      const utilsContent = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`;
      await this.writeFile('lib/utils.ts', utilsContent);

      // Create enhanced globals.css with design tokens
      const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 262.1 83.3% 57.8%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 262.1 83.3% 57.8%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 262.1 83.3% 57.8%;
    --primary-foreground: 210 40% 98%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 262.1 83.3% 57.8%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
`;
      await this.writeFile('app/globals.css', globalsCss);

      // Create tailwind.config.ts
      const tailwindConfig = `import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
`;
      await this.writeFile('tailwind.config.ts', tailwindConfig);

      // Create base shadcn/ui components
      await this.createShadcnComponents();

      console.log('✅ shadcn/ui initialized successfully');
    } catch (error) {
      console.error('Failed to initialize shadcn/ui:', error);
      throw error;
    }
  }

  /**
   * Create essential shadcn/ui components
   */
  private async createShadcnComponents(): Promise<void> {
    const componentsDir = 'components/ui';
    await fs.mkdir(path.join(this.buildDir, componentsDir), { recursive: true });

    // Button component
    const buttonComponent = `import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
`;
    await this.writeFile(`${componentsDir}/button.tsx`, buttonComponent);

    // Card component
    const cardComponent = `import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
`;
    await this.writeFile(`${componentsDir}/card.tsx`, cardComponent);

    // Input component
    const inputComponent = `import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
`;
    await this.writeFile(`${componentsDir}/input.tsx`, inputComponent);

    // Label component
    const labelComponent = `import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
`;
    await this.writeFile(`${componentsDir}/label.tsx`, labelComponent);

    console.log('✅ Created base shadcn/ui components');
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

      // Run TypeScript validation and auto-fix errors (Layer 2)
      if (process.env.VALIDATION_ENABLED !== 'false') {
        await this.validateAndFixTypeScript();
      }
    } catch (error) {
      console.error('Failed to write files:', error);
      throw error;
    }
  }

  /**
   * Validate TypeScript and auto-fix common errors (Layer 2)
   */
  private async validateAndFixTypeScript(): Promise<void> {
    try {
      const { BuildValidator } = await import('./build-validator');
      const validator = new BuildValidator();

      const result = await validator.validateAndFix(this.buildPath);

      if (result.success) {
        console.log('✅ TypeScript validation passed');
      } else if (result.fixed.length > 0) {
        console.log(`🔧 Auto-fixed ${result.fixed.length} issues, ${result.errors.length} remaining`);
      } else {
        console.warn(`⚠️  ${result.errors.length} TypeScript errors remain (no auto-fixes available)`);
      }
    } catch (error) {
      console.warn('⚠️  TypeScript validation skipped:', error);
      // Don't fail the build if validation fails
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
    // Special handling for globals.css - it should go in app/ directory for Next.js
    if (filename === 'globals.css' && framework === 'nextjs') {
      return 'app/globals.css';
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
   * Assemble Next.js web app (Layer 3: Smart Page Generation)
   */
  private async assembleNextJSApp(components: any[]): Promise<void> {
    const frontendComponents = components.filter(c =>
      c.type === 'frontend' || c.type === 'component'
    );

    // Generate tabs-based layout (Layer 3)
    const pageContent = this.generateTabsPage(frontendComponents);

    // Write smart page
    await this.writeFile('app/page.tsx', pageContent);
  }

  /**
   * Generate smart tabs-based page layout (Layer 3)
   * Instead of dumping all components vertically, use organized tabs
   * Built with Tailwind CSS (no shadcn dependencies)
   */
  private generateTabsPage(components: any[]): string {
    const imports: string[] = [
      `'use client';`,
      ``,
      `import { useState } from 'react';`
    ];

    const componentImports: string[] = [];
    const tabButtons: string[] = [];
    const tabContents: string[] = [];

    for (const [index, component] of components.entries()) {
      const componentName = this.sanitizeComponentName(component.name);
      const filePath = component.filePath || inferFilePath(component);
      const importPath = `../${filePath.replace('.tsx', '').replace('.jsx', '')}`;

      // Add import
      componentImports.push(`import ${componentName} from '${importPath}';`);

      // Generate tab ID from component name
      const tabId = componentName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const tabLabel = componentName
        .replace(/([A-Z])/g, ' $1')
        .trim();

      // Add tab button
      tabButtons.push(`            <button
              onClick={() => setActiveTab('${tabId}')}
              className={\`px-4 py-2 rounded-t-lg font-medium transition-colors \${
                activeTab === '${tabId}'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }\`}
            >
              ${tabLabel}
            </button>`);

      // Add tab content
      tabContents.push(`        {activeTab === '${tabId}' && (
          <div className="p-6">
            <${componentName} />
          </div>
        )}`);
    }

    // Combine all imports
    const allImports = [...imports, ...componentImports].join('\n');

    // Default to first tab
    const defaultTab = components.length > 0
      ? this.sanitizeComponentName(components[0].name).toLowerCase().replace(/[^a-z0-9]/g, '-')
      : 'home';

    // Generate complete page
    return `${allImports}

export default function Home() {
  const [activeTab, setActiveTab] = useState('${defaultTab}');

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Generated App</h1>

        {/* Tab Navigation */}
        <div className="mb-4 flex gap-1 border-b-2 border-gray-200">
${tabButtons.join('\n')}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg shadow-sm border border-gray-200">
${tabContents.join('\n')}
        </div>
      </div>
    </main>
  );
}
`;
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
      // HTTP & API
      'axios': '^1.6.0',

      // Database & Backend
      '@supabase/supabase-js': '^2.38.0',
      'firebase': '^10.7.0',

      // Utilities
      'date-fns': '^2.30.0',
      'zod': '^3.22.0',
      'clsx': '^2.0.0',
      'class-variance-authority': '^0.7.0',
      'tailwind-merge': '^2.2.0',

      // Icons
      'lucide-react': '^0.294.0',
      '@heroicons/react': '^2.1.0',

      // UI Components (Radix)
      '@radix-ui/react-dialog': '^1.0.5',
      '@radix-ui/react-dropdown-menu': '^2.0.6',
      '@radix-ui/react-label': '^2.0.2',
      '@radix-ui/react-select': '^2.0.0',
      '@radix-ui/react-slot': '^1.0.2',
      '@radix-ui/react-tabs': '^1.0.4',
      '@radix-ui/react-toast': '^1.1.5',
      '@radix-ui/react-tooltip': '^1.0.7',

      // Maps
      'leaflet': '^1.9.4',
      'react-leaflet': '^4.2.1',

      // Forms
      'react-hook-form': '^7.48.0',

      // State Management
      'zustand': '^4.4.7',
      'jotai': '^2.6.0',

      // Charts & Visualization
      'recharts': '^2.10.0',
      'chart.js': '^4.4.0',
      'react-chartjs-2': '^5.2.0',

      // Calendar & Date
      'react-datepicker': '^4.21.0',
      'react-day-picker': '^8.9.1',

      // File Upload
      'react-dropzone': '^14.2.3',

      // Animation
      'framer-motion': '^10.16.0',

      // Authentication
      'next-auth': '^4.24.0',

      // Payments
      'stripe': '^14.0.0',
      '@stripe/stripe-js': '^2.2.0',

      // Mobile (React Native / Expo)
      'expo': '~50.0.0',
      'expo-router': '~3.4.0',
      'react-native-safe-area-context': '4.8.2',
      'react-native-screens': '~3.29.0',
    };

    // Add detected packages to dependencies
    console.log(`📦 Detected ${requiredPackages.size} required packages:`, Array.from(requiredPackages));

    for (const pkg of requiredPackages) {
      // Skip if already in dependencies or devDependencies
      if (packageJson.dependencies[pkg] || packageJson.devDependencies[pkg]) {
        continue;
      }

      // Use known version or fallback to latest
      const version = packageVersions[pkg] || 'latest';
      packageJson.dependencies[pkg] = version;
      console.log(`  ✓ Adding: ${pkg}@${version}`);
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

      // Skip relative imports, absolute paths, and path aliases
      if (importPath.startsWith('.') || importPath.startsWith('/') || importPath.startsWith('@/')) {
        continue;
      }

      // Only external packages
      if (importPath && !importPath.startsWith('node:')) {
        // Get root package name
        const packageName = importPath.startsWith('@')
          ? importPath.split('/').slice(0, 2).join('/')  // @org/package
          : importPath.split('/')[0];  // package or package/subpath

        if (packageName) {
          imports.push(packageName);
        }
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

  // Sanitize component name to kebab-case for file paths
  // "React with Vite" → "react-with-vite"
  const sanitizedName = name
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1-$2')  // camelCase → kebab-case
    .replace(/[\s_]+/g, '-')               // spaces/underscores → hyphens
    .replace(/[^a-zA-Z0-9-]/g, '')         // remove special chars
    .toLowerCase()
    .replace(/^-+|-+$/g, '');              // trim hyphens

  switch (type) {
    case 'frontend':
    case 'component':
      return `src/components/${sanitizedName}.${tsxExt}`;

    case 'api':
    case 'endpoint':
      return `src/api/${sanitizedName}.${ext}`;

    case 'service':
      return `src/services/${sanitizedName}.${ext}`;

    case 'backend':
    case 'server':
      return `src/server/${sanitizedName}.${ext}`;

    case 'database':
    case 'schema':
      return `src/database/${sanitizedName}.${ext}`;

    case 'util':
    case 'helper':
      return `src/utils/${sanitizedName}.${ext}`;

    case 'type':
    case 'interface':
      return `src/types/${sanitizedName}.${ext}`;

    case 'test':
      return `tests/${sanitizedName}.test.${ext}`;

    default:
      return `src/${sanitizedName}.${ext}`;
  }
}
