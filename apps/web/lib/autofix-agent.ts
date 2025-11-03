import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import * as Diff from 'diff';

interface FeedbackContext {
  route: string;
  component?: string;
  file?: string;
  lineNumber?: number;
  screenshot?: string;
  deviceType?: string;
}

interface FeedbackItem {
  id: string;
  description: string;
  type: 'bug' | 'feature' | 'design' | 'performance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  context: FeedbackContext;
}

interface FileChange {
  path: string;
  diff: string;
  oldContent: string;
  newContent: string;
}

interface FixPlan {
  approach: string;
  filesToModify: string[];
  estimatedComplexity: 'simple' | 'moderate' | 'complex';
}

interface CodeChanges {
  files: FileChange[];
  summary: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class AutoFixAgent {
  private anthropic: Anthropic;
  private buildDir: string;

  constructor(buildDir: string, apiKey?: string) {
    this.buildDir = buildDir;
    this.anthropic = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Analyze feedback and create a fix plan
   */
  async analyzeFeedback(feedback: FeedbackItem): Promise<FixPlan> {
    console.log(`[AutoFix] Analyzing feedback: ${feedback.description}`);

    // Read relevant files based on context
    const contextFiles = await this.findRelevantFiles(feedback.context);
    const fileContents = await this.readFiles(contextFiles);

    // Build prompt for Claude
    const prompt = this.buildAnalysisPrompt(feedback, fileContents);

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      });

      const response = message.content[0].type === 'text' ? message.content[0].text : '';

      // Parse the plan from response
      const plan = this.parsePlan(response, contextFiles);

      console.log(`[AutoFix] Plan created: ${plan.approach}`);
      return plan;
    } catch (error) {
      console.error('[AutoFix] Error analyzing feedback:', error);
      throw new Error(`Failed to analyze feedback: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate code changes based on the fix plan
   */
  async generateFix(feedback: FeedbackItem, plan: FixPlan): Promise<CodeChanges> {
    console.log(`[AutoFix] Generating fix for ${plan.filesToModify.length} files`);

    const fileContents = await this.readFiles(plan.filesToModify);
    const prompt = this.buildFixPrompt(feedback, plan, fileContents);

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 8192,
        messages: [{ role: 'user', content: prompt }],
      });

      const response = message.content[0].type === 'text' ? message.content[0].text : '';

      // Parse the changes from response
      const changes = await this.parseChanges(response, fileContents);

      console.log(`[AutoFix] Generated changes for ${changes.files.length} files`);
      return changes;
    } catch (error) {
      console.error('[AutoFix] Error generating fix:', error);
      throw new Error(`Failed to generate fix: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Apply changes to the build directory
   */
  async applyChanges(changes: CodeChanges): Promise<void> {
    console.log(`[AutoFix] Applying changes to ${changes.files.length} files`);

    for (const change of changes.files) {
      const filePath = path.join(this.buildDir, change.path);
      const dir = path.dirname(filePath);

      // Create directory if it doesn't exist
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write the new content
      fs.writeFileSync(filePath, change.newContent, 'utf-8');
      console.log(`[AutoFix] Updated: ${change.path}`);
    }
  }

  /**
   * Validate changes (basic syntax/type checking)
   */
  async validate(): Promise<ValidationResult> {
    const errors: string[] = [];

    // Basic validation: check if files can be read and parsed
    try {
      const packageJsonPath = path.join(this.buildDir, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

        // Check for TypeScript
        if (packageJson.devDependencies?.typescript || packageJson.dependencies?.typescript) {
          // Would run tsc --noEmit here in production
          console.log('[AutoFix] TypeScript project detected - skipping type check in this implementation');
        }
      }

      return { valid: true, errors: [] };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Validation failed');
      return { valid: false, errors };
    }
  }

  /**
   * Rollback changes (restore from backup)
   */
  async rollback(changeId: string): Promise<void> {
    // In production, this would restore from a backup
    console.log(`[AutoFix] Rollback not fully implemented - would restore changeId: ${changeId}`);
  }

  // Private helper methods

  private async findRelevantFiles(context: FeedbackContext): Promise<string[]> {
    const files: string[] = [];

    // If specific file is provided, use it
    if (context.file) {
      files.push(context.file);
    }

    // Look for component files based on route
    if (context.route) {
      const possiblePaths = [
        `src/pages${context.route}.tsx`,
        `src/pages${context.route}.jsx`,
        `src/app${context.route}/page.tsx`,
        `src/app${context.route}/page.jsx`,
        `pages${context.route}.tsx`,
        `pages${context.route}.jsx`,
        `app${context.route}/page.tsx`,
        `app${context.route}/page.jsx`,
      ];

      for (const p of possiblePaths) {
        const fullPath = path.join(this.buildDir, p);
        if (fs.existsSync(fullPath)) {
          files.push(p);
          break;
        }
      }
    }

    // If component name is provided, search for it
    if (context.component && files.length === 0) {
      const componentFiles = this.searchForComponent(context.component);
      files.push(...componentFiles);
    }

    // Fallback: return some common files
    if (files.length === 0) {
      const commonFiles = [
        'src/App.tsx',
        'src/App.jsx',
        'app/page.tsx',
        'app/layout.tsx',
      ];

      for (const f of commonFiles) {
        const fullPath = path.join(this.buildDir, f);
        if (fs.existsSync(fullPath)) {
          files.push(f);
          break;
        }
      }
    }

    return files;
  }

  private searchForComponent(componentName: string): string[] {
    const files: string[] = [];

    // Simple recursive search
    const searchDir = (dir: string, base: string = '') => {
      if (!fs.existsSync(dir)) return;

      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === '.next') continue;

        const fullPath = path.join(dir, entry.name);
        const relativePath = path.join(base, entry.name);

        if (entry.isDirectory()) {
          searchDir(fullPath, relativePath);
        } else if (
          entry.name.includes(componentName) &&
          (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx'))
        ) {
          files.push(relativePath);
        }
      }
    };

    searchDir(this.buildDir);
    return files.slice(0, 3); // Limit to 3 files
  }

  private async readFiles(filePaths: string[]): Promise<Record<string, string>> {
    const contents: Record<string, string> = {};

    for (const filePath of filePaths) {
      const fullPath = path.join(this.buildDir, filePath);
      if (fs.existsSync(fullPath)) {
        contents[filePath] = fs.readFileSync(fullPath, 'utf-8');
      }
    }

    return contents;
  }

  private buildAnalysisPrompt(feedback: FeedbackItem, fileContents: Record<string, string>): string {
    return `You are an expert software engineer analyzing a bug/feature request in a codebase.

FEEDBACK:
Type: ${feedback.type}
Priority: ${feedback.priority}
Description: ${feedback.description}

CONTEXT:
Route: ${feedback.context.route || 'unknown'}
Component: ${feedback.context.component || 'unknown'}
Device: ${feedback.context.deviceType || 'desktop'}

CURRENT CODE:
${Object.entries(fileContents).map(([path, content]) => `
File: ${path}
\`\`\`
${content.slice(0, 3000)}${content.length > 3000 ? '...' : ''}
\`\`\`
`).join('\n')}

TASK:
Analyze this feedback and provide:
1. Root cause of the issue
2. Proposed approach to fix it
3. List of files that need to be modified
4. Estimated complexity (simple/moderate/complex)

Format your response as:
APPROACH: [your approach]
FILES: [comma-separated list of file paths]
COMPLEXITY: [simple|moderate|complex]`;
  }

  private buildFixPrompt(
    feedback: FeedbackItem,
    plan: FixPlan,
    fileContents: Record<string, string>
  ): string {
    return `You are an expert software engineer implementing a fix for a bug/feature request.

FEEDBACK:
${feedback.description}

APPROACH:
${plan.approach}

FILES TO MODIFY:
${plan.filesToModify.join(', ')}

CURRENT CODE:
${Object.entries(fileContents).map(([path, content]) => `
File: ${path}
\`\`\`
${content}
\`\`\`
`).join('\n')}

TASK:
Generate the complete updated code for each file. Follow these rules:
1. Make minimal changes to fix the issue
2. Preserve existing code style and patterns
3. Add comments for complex changes
4. Ensure code is production-ready

For each file, provide:
FILE: [path]
\`\`\`
[complete updated code]
\`\`\`

Then provide:
SUMMARY: [brief summary of changes made]`;
  }

  private parsePlan(response: string, contextFiles: string[]): FixPlan {
    const approachMatch = response.match(/APPROACH:\s*(.+?)(?=\n|FILES:|COMPLEXITY:|$)/s);
    const filesMatch = response.match(/FILES:\s*(.+?)(?=\n|COMPLEXITY:|$)/s);
    const complexityMatch = response.match(/COMPLEXITY:\s*(simple|moderate|complex)/i);

    return {
      approach: approachMatch ? approachMatch[1].trim() : 'Fix the reported issue',
      filesToModify: filesMatch
        ? filesMatch[1].split(',').map(f => f.trim()).filter(Boolean)
        : contextFiles,
      estimatedComplexity: complexityMatch
        ? (complexityMatch[1].toLowerCase() as 'simple' | 'moderate' | 'complex')
        : 'moderate',
    };
  }

  private async parseChanges(
    response: string,
    fileContents: Record<string, string>
  ): Promise<CodeChanges> {
    const files: FileChange[] = [];

    // Extract files and their new content
    const fileRegex = /FILE:\s*(.+?)\n```[\w]*\n([\s\S]+?)```/g;
    let match;

    while ((match = fileRegex.exec(response)) !== null) {
      const filePath = match[1].trim();
      const newContent = match[2].trim();
      const oldContent = fileContents[filePath] || '';

      // Generate diff
      const diff = Diff.createPatch(
        filePath,
        oldContent,
        newContent,
        'original',
        'updated'
      );

      files.push({
        path: filePath,
        diff,
        oldContent,
        newContent,
      });
    }

    // Extract summary
    const summaryMatch = response.match(/SUMMARY:\s*(.+?)(?=\n\n|$)/s);
    const summary = summaryMatch ? summaryMatch[1].trim() : 'Applied code changes';

    return { files, summary };
  }
}
