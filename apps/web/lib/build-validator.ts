/**
 * Build Validator
 * Runs TypeScript validation after component generation and auto-fixes common issues
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ValidationError {
  file: string;
  line: number;
  column: number;
  message: string;
  code: string;
}

export interface ValidationResult {
  success: boolean;
  errors: ValidationError[];
  fixed: string[];
}

export class BuildValidator {
  /**
   * Validate and auto-fix TypeScript errors in generated project
   */
  async validateAndFix(projectPath: string, maxRetries: number = 3): Promise<ValidationResult> {
    const fixed: string[] = [];

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`\n🔍 TypeScript validation attempt ${attempt}/${maxRetries}...`);

      const errors = await this.runTypeScriptCheck(projectPath);

      if (errors.length === 0) {
        console.log('✅ TypeScript validation passed!');
        return { success: true, errors: [], fixed };
      }

      console.log(`⚠️  Found ${errors.length} TypeScript errors`);

      // Try to auto-fix common issues
      const fixResults = await this.autoFixErrors(projectPath, errors);
      fixed.push(...fixResults);

      if (fixResults.length > 0) {
        console.log(`🔧 Auto-fixed ${fixResults.length} issues`);
      } else if (attempt < maxRetries) {
        console.log(`⏭️  No auto-fixes available, will retry...`);
      }
    }

    // Final check after all retries
    const finalErrors = await this.runTypeScriptCheck(projectPath);
    return {
      success: false,
      errors: finalErrors,
      fixed
    };
  }

  /**
   * Run TypeScript compiler to check for errors
   */
  private async runTypeScriptCheck(projectPath: string): Promise<ValidationError[]> {
    try {
      // Run tsc with --noEmit to check types without generating output
      const { stdout, stderr } = await execAsync(
        'npx tsc --noEmit --pretty false',
        { cwd: projectPath, timeout: 30000 }
      );

      // If no errors, stdout/stderr will be empty or just info
      return [];
    } catch (error: any) {
      // tsc exits with non-zero code when there are errors
      const output = error.stdout || error.stderr || '';
      return this.parseTypeScriptErrors(output);
    }
  }

  /**
   * Parse TypeScript compiler output into structured errors
   */
  private parseTypeScriptErrors(output: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const lines = output.split('\n');

    for (const line of lines) {
      // Match format: "path/file.ts(line,col): error TSxxxx: message"
      const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/);
      if (match) {
        errors.push({
          file: match[1],
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          code: match[4],
          message: match[5]
        });
      }
    }

    return errors;
  }

  /**
   * Auto-fix common TypeScript errors
   */
  private async autoFixErrors(projectPath: string, errors: ValidationError[]): Promise<string[]> {
    const fixed: string[] = [];

    for (const error of errors) {
      const filePath = path.join(projectPath, error.file);

      try {
        // Check if file exists before trying to fix
        await fs.access(filePath);

        // Apply fixes based on error type
        if (error.message.includes('missing the following properties')) {
          // Fix: Component needs props but none provided
          if (await this.fixMissingProps(filePath, error)) {
            fixed.push(`${error.file}: Made props optional`);
          }
        } else if (error.message.includes('is not exported from')) {
          // Fix: Invalid import
          if (await this.fixInvalidImport(filePath, error)) {
            fixed.push(`${error.file}: Fixed invalid import`);
          }
        } else if (error.message.includes('is not assignable to type')) {
          // Fix: Type mismatch (e.g., number[] vs [number, number])
          if (await this.fixTypeMismatch(filePath, error)) {
            fixed.push(`${error.file}: Fixed type mismatch`);
          }
        } else if (error.message.includes('does not have any construct or call signatures')) {
          // Fix: Trying to use non-component as JSX
          if (await this.fixNonComponentUsage(filePath, error)) {
            fixed.push(`${error.file}: Removed non-component from JSX`);
          }
        }
      } catch (err) {
        console.warn(`⚠️  Could not fix error in ${error.file}:`, err);
      }
    }

    return fixed;
  }

  /**
   * Fix missing props by making component props optional
   */
  private async fixMissingProps(filePath: string, error: ValidationError): Promise<boolean> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');

      // Find interface definition and make all props optional
      const interfaceRegex = /interface\s+(\w+Props)\s*\{([^}]+)\}/g;
      let modified = content;
      let changed = false;

      modified = modified.replace(interfaceRegex, (match, interfaceName, props) => {
        // Make each prop optional if not already
        const fixedProps = props.replace(/(\w+):\s*([^;]+);/g, (propMatch: string, propName: string, propType: string) => {
          if (!propMatch.includes('?:')) {
            changed = true;
            return `${propName}?: ${propType};`;
          }
          return propMatch;
        });
        return `interface ${interfaceName} {${fixedProps}}`;
      });

      if (changed) {
        await fs.writeFile(filePath, modified, 'utf-8');
        return true;
      }
    } catch (err) {
      console.error('Error fixing missing props:', err);
    }
    return false;
  }

  /**
   * Fix invalid imports (e.g., @heroicons → lucide-react)
   */
  private async fixInvalidImport(filePath: string, error: ValidationError): Promise<boolean> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');

      const importReplacements: Record<string, string> = {
        '@heroicons/react/24/outline': 'lucide-react',
        '@heroicons/react/24/solid': 'lucide-react',
        '@heroicons/react/20/solid': 'lucide-react',
      };

      const iconReplacements: Record<string, string> = {
        'MessageCircleIcon': 'MessageCircle',
        'UtensilsIcon': 'Utensils',
        'ChevronDownIcon': 'ChevronDown',
        'ChevronUpIcon': 'ChevronUp',
        'CheckIcon': 'Check',
        'XMarkIcon': 'X',
        'MapPinIcon': 'MapPin',
        'CalendarIcon': 'Calendar',
        'UsersIcon': 'Users',
        'CloudIcon': 'Cloud',
      };

      let modified = content;
      let changed = false;

      // Replace import sources
      for (const [oldImport, newImport] of Object.entries(importReplacements)) {
        if (modified.includes(oldImport)) {
          modified = modified.replace(new RegExp(oldImport, 'g'), newImport);
          changed = true;
        }
      }

      // Replace icon names
      for (const [oldIcon, newIcon] of Object.entries(iconReplacements)) {
        if (modified.includes(oldIcon)) {
          modified = modified.replace(new RegExp(oldIcon, 'g'), newIcon);
          changed = true;
        }
      }

      if (changed) {
        await fs.writeFile(filePath, modified, 'utf-8');
        return true;
      }
    } catch (err) {
      console.error('Error fixing invalid import:', err);
    }
    return false;
  }

  /**
   * Fix type mismatches (e.g., adding type assertions)
   */
  private async fixTypeMismatch(filePath: string, error: ValidationError): Promise<boolean> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');

      // Fix number[] → [number, number] for coordinates
      if (error.message.includes('number[]') && error.message.includes('[number, number]')) {
        const modified = content.replace(
          /coordinates:\s*\[([-\d.]+),\s*([-\d.]+)\]/g,
          'coordinates: [$1, $2] as [number, number]'
        );

        if (modified !== content) {
          await fs.writeFile(filePath, modified, 'utf-8');
          return true;
        }
      }
    } catch (err) {
      console.error('Error fixing type mismatch:', err);
    }
    return false;
  }

  /**
   * Fix non-component being used as JSX (remove from page.tsx)
   */
  private async fixNonComponentUsage(filePath: string, error: ValidationError): Promise<boolean> {
    try {
      if (!filePath.includes('page.tsx')) {
        return false; // Only fix in page files
      }

      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      // Find the problematic component name from error
      const componentMatch = error.message.match(/JSX element type '(\w+)'/);
      if (!componentMatch) return false;

      const componentName = componentMatch[1];

      // Remove import
      const importRegex = new RegExp(`import\\s+${componentName}\\s+from.*?;\\n?`, 'g');
      let modified = content.replace(importRegex, '');

      // Remove usage (component and its wrapper div)
      const usageRegex = new RegExp(`\\s*<div[^>]*>\\s*<${componentName}\\s*\\/?>\\s*<\\/div>\\s*\\n?`, 'g');
      modified = modified.replace(usageRegex, '');

      if (modified !== content) {
        await fs.writeFile(filePath, modified, 'utf-8');
        return true;
      }
    } catch (err) {
      console.error('Error fixing non-component usage:', err);
    }
    return false;
  }
}
