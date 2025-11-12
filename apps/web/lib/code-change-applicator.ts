/**
 * Code Change Applicator
 * Applies parsed code changes to project files
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import type { CodeChange } from './code-change-parser';

export class CodeChangeApplicator {
  constructor(private projectPath: string) {}

  /**
   * Apply a single code change
   */
  async applyChange(change: CodeChange): Promise<void> {
    const filePath = path.join(this.projectPath, change.file);

    // Check if file exists
    const fileExists = await this.fileExists(filePath);

    if (!fileExists) {
      // Create new file
      await this.createFile(filePath, change.newCode);
      return;
    }

    // Read current content
    const currentContent = await fs.readFile(filePath, 'utf-8');

    // Apply change
    let newContent;
    if (change.oldCode) {
      // Replace old code with new code
      newContent = currentContent.replace(change.oldCode, change.newCode);

      // Verify replacement worked
      if (newContent === currentContent) {
        throw new Error(`Could not find old code in ${change.file}`);
      }
    } else {
      // No old code specified, replace entire file
      newContent = change.newCode;
    }

    // Write updated content
    await fs.writeFile(filePath, newContent, 'utf-8');
  }

  /**
   * Apply multiple code changes
   */
  async applyChanges(changes: CodeChange[]): Promise<void> {
    for (const change of changes) {
      await this.applyChange(change);
    }
  }

  /**
   * Create a new file
   */
  private async createFile(filePath: string, content: string): Promise<void> {
    // Create directory if needed
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(filePath, content, 'utf-8');
  }

  /**
   * Check if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
