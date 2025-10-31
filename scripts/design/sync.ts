#!/usr/bin/env tsx

/**
 * Design System Sync CLI
 * Orchestrates the complete design system sync workflow
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface SyncOptions {
  force?: boolean;
  skipBuild?: boolean;
  verbose?: boolean;
}

interface SyncResult {
  success: boolean;
  tokensChanged: boolean;
  themeGenerated: boolean;
  buildCompleted: boolean;
  errors: string[];
  summary: {
    totalTokens: number;
    checksum: string;
    timestamp: string;
  };
}

class DesignSystemSync {
  private options: SyncOptions;
  private result: SyncResult;

  constructor(options: SyncOptions = {}) {
    this.options = options;
    this.result = {
      success: false,
      tokensChanged: false,
      themeGenerated: false,
      buildCompleted: false,
      errors: [],
      summary: {
        totalTokens: 0,
        checksum: '',
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Run the complete sync workflow
   */
  async sync(): Promise<SyncResult> {
    console.log('🚀 Starting design system sync...\n');
    
    try {
      // Step 1: Fetch tokens from Figma
      await this.fetchTokens();
      
      // Step 2: Generate theme files
      await this.generateTheme();
      
      // Step 3: Build application (optional)
      if (!this.options.skipBuild) {
        await this.buildApplication();
      }
      
      // Step 4: Generate summary
      await this.generateSummary();
      
      this.result.success = true;
      console.log('\n✅ Design system sync completed successfully!');
      
    } catch (error) {
      this.result.errors.push(error instanceof Error ? error.message : String(error));
      console.error('\n❌ Design system sync failed:');
      console.error(error instanceof Error ? error.message : String(error));
    }
    
    return this.result;
  }

  /**
   * Fetch design tokens from Figma
   */
  private async fetchTokens(): Promise<void> {
    console.log('📥 Fetching design tokens from Figma...');
    
    // Check if tokens already exist and get current checksum
    const tokensPath = join(process.cwd(), 'design', 'tokens.json');
    let currentChecksum = '';
    
    if (existsSync(tokensPath) && !this.options.force) {
      try {
        const content = readFileSync(tokensPath, 'utf-8');
        const tokens = JSON.parse(content);
        currentChecksum = tokens.checksum || '';
        
        if (this.options.verbose) {
          console.log(`  Current checksum: ${currentChecksum}`);
        }
      } catch (error) {
        console.log('  ⚠️  Could not read existing tokens, will fetch fresh');
      }
    }

    try {
      // Run the fetch script
      const command = 'tsx scripts/design/fetch-figma-tokens.ts';
      const output = execSync(command, { 
        encoding: 'utf-8',
        stdio: this.options.verbose ? 'inherit' : 'pipe'
      });
      
      if (!this.options.verbose && output) {
        // Show summary line only
        const lines = output.split('\n');
        const summaryLine = lines.find(line => line.includes('Total:'));
        if (summaryLine) {
          console.log(`  ${summaryLine.trim()}`);
        }
      }
      
      // Check if tokens changed
      if (existsSync(tokensPath)) {
        const content = readFileSync(tokensPath, 'utf-8');
        const tokens = JSON.parse(content);
        const newChecksum = tokens.checksum || '';
        
        this.result.tokensChanged = currentChecksum !== newChecksum;
        this.result.summary.checksum = newChecksum;
        this.result.summary.totalTokens = tokens.metadata?.totalTokens || 0;
        
        if (this.result.tokensChanged) {
          console.log(`  ✅ Tokens updated (${currentChecksum.substring(0, 8)} → ${newChecksum.substring(0, 8)})`);
        } else {
          console.log('  ✅ Tokens are up to date');
        }
      }
      
    } catch (error) {
      throw new Error(`Failed to fetch tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate theme files from tokens
   */
  private async generateTheme(): Promise<void> {
    console.log('🎨 Generating theme files...');
    
    try {
      const command = 'tsx scripts/design/generate-theme.ts';
      const output = execSync(command, { 
        encoding: 'utf-8',
        stdio: this.options.verbose ? 'inherit' : 'pipe'
      });
      
      if (!this.options.verbose && output) {
        // Show summary lines only
        const lines = output.split('\n');
        const summaryLines = lines.filter(line => 
          line.includes('Colors:') || 
          line.includes('Spacing:') || 
          line.includes('Generated theme config:')
        );
        summaryLines.forEach(line => {
          if (line.trim()) {
            console.log(`  ${line.trim()}`);
          }
        });
      }
      
      this.result.themeGenerated = true;
      console.log('  ✅ Theme files generated');
      
    } catch (error) {
      throw new Error(`Failed to generate theme: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build the application to verify theme integration
   */
  private async buildApplication(): Promise<void> {
    console.log('🔨 Building application...');
    
    try {
      // Check if we're in the web app directory
      const webAppPath = join(process.cwd(), 'apps', 'web');
      const packageJsonPath = join(webAppPath, 'package.json');
      
      if (!existsSync(packageJsonPath)) {
        console.log('  ⚠️  Web app not found, skipping build');
        return;
      }
      
      // Run build command
      const command = 'cd apps/web && npm run build';
      execSync(command, { 
        encoding: 'utf-8',
        stdio: this.options.verbose ? 'inherit' : 'pipe'
      });
      
      this.result.buildCompleted = true;
      console.log('  ✅ Application built successfully');
      
    } catch (error) {
      // Build failure is not critical for sync
      console.log('  ⚠️  Build failed, but sync can continue');
      if (this.options.verbose) {
        console.log(`  Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Generate sync summary
   */
  private async generateSummary(): Promise<void> {
    const tokensPath = join(process.cwd(), 'design', 'tokens.json');
    
    if (existsSync(tokensPath)) {
      try {
        const content = readFileSync(tokensPath, 'utf-8');
        const tokens = JSON.parse(content);
        
        this.result.summary = {
          totalTokens: tokens.metadata?.totalTokens || 0,
          checksum: tokens.checksum || '',
          timestamp: tokens.timestamp || new Date().toISOString(),
        };
      } catch (error) {
        // Non-critical error
      }
    }
  }

  /**
   * Print diff summary if tokens changed
   */
  printDiffSummary(): void {
    if (!this.result.tokensChanged) {
      console.log('\n📊 No changes detected - design system is up to date');
      return;
    }

    console.log('\n📊 Sync Summary:');
    console.log(`  📥 Tokens fetched: ${this.result.tokensChanged ? 'Updated' : 'No changes'}`);
    console.log(`  🎨 Theme generated: ${this.result.themeGenerated ? 'Yes' : 'No'}`);
    console.log(`  🔨 Build completed: ${this.result.buildCompleted ? 'Yes' : 'Skipped/Failed'}`);
    console.log(`  📊 Total tokens: ${this.result.summary.totalTokens}`);
    console.log(`  🔍 Checksum: ${this.result.summary.checksum.substring(0, 16)}...`);
    
    if (this.result.errors.length > 0) {
      console.log('\n⚠️  Warnings/Errors:');
      this.result.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  const options: SyncOptions = {
    force: args.includes('--force') || args.includes('-f'),
    skipBuild: args.includes('--skip-build') || args.includes('-s'),
    verbose: args.includes('--verbose') || args.includes('-v'),
  };

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Design System Sync CLI

Usage: npm run design:sync [options]

Options:
  --force, -f       Force sync even if tokens haven't changed
  --skip-build, -s  Skip application build step
  --verbose, -v     Show detailed output
  --help, -h        Show this help message

Examples:
  npm run design:sync                    # Normal sync
  npm run design:sync --force            # Force sync
  npm run design:sync --verbose          # Verbose output
  npm run design:sync --skip-build       # Skip build step
`);
    process.exit(0);
  }

  const sync = new DesignSystemSync(options);
  const result = await sync.sync();
  
  sync.printDiffSummary();
  
  process.exit(result.success ? 0 : 1);
}

if (require.main === module) {
  main();
}
