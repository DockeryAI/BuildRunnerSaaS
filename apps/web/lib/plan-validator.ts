/**
 * Plan Validator
 *
 * Lightweight sanity checker that prevents common plan generation errors
 * without requiring full multi-model consensus (keeps build speed fast).
 *
 * Catches:
 * - Tech stack items being treated as features
 * - Invalid component naming (lowercase, non-PascalCase)
 * - Plans with no actual user-facing features
 * - Common anti-patterns learned from failed builds
 */

export interface ValidationError {
  type: 'TECH_AS_FEATURE' | 'INVALID_COMPONENT_NAME' | 'NO_REAL_FEATURES' | 'DUPLICATE_COMPONENTS' | 'INVALID_NAVIGATION';
  severity: 'error' | 'warning';
  component?: string;
  components?: string[];
  message: string;
  fix: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  shouldRegenerate: boolean;
  regenerationPrompt?: string;
}

export interface BuildPlan {
  milestones: Array<{
    name: string;
    components: Array<{
      id: string;
      name: string;
      type: string;
      description?: string;
    }>;
  }>;
  techStack?: {
    frontend?: string[];
    backend?: string[];
    database?: string[];
  };
}

export class PlanValidator {
  // Tech stack terms that should NEVER be component names
  private techStackTerms = [
    // Frontend frameworks
    'nextjs', 'next.js', 'react', 'vue', 'angular', 'svelte',
    // Styling
    'tailwind', 'tailwindcss', 'css', 'sass', 'scss', 'styled-components',
    // UI Libraries
    'shadcn', 'shadcnui', 'mui', 'materialui', 'chakra', 'antd', 'radix',
    // Languages
    'typescript', 'javascript', 'python', 'java', 'go', 'rust',
    // Backend
    'nodejs', 'node.js', 'express', 'fastapi', 'django', 'flask',
    // Databases
    'mongodb', 'postgresql', 'mysql', 'redis', 'supabase', 'firebase',
    // Build tools
    'webpack', 'vite', 'turbopack', 'esbuild', 'rollup',
    // Package managers
    'npm', 'yarn', 'pnpm', 'bun',
    // Forms
    'reacthookform', 'formik', 'yup', 'zod',
    // State management
    'redux', 'zustand', 'recoil', 'jotai',
    // Testing
    'jest', 'vitest', 'cypress', 'playwright',
  ];

  // Valid feature keywords (user-facing functionality)
  private validFeatureKeywords = [
    'dashboard', 'auth', 'login', 'signup', 'profile', 'settings',
    'user', 'admin', 'account', 'team', 'group', 'organization',
    'task', 'project', 'todo', 'kanban', 'calendar', 'schedule',
    'chat', 'message', 'notification', 'alert', 'email',
    'data', 'report', 'analytics', 'chart', 'graph', 'metrics',
    'search', 'filter', 'sort', 'table', 'list', 'grid',
    'form', 'input', 'button', 'modal', 'dialog', 'drawer',
    'upload', 'download', 'export', 'import', 'share',
    'payment', 'checkout', 'cart', 'order', 'invoice',
    'product', 'item', 'category', 'inventory', 'catalog',
    'comment', 'review', 'rating', 'feedback', 'survey',
  ];

  /**
   * Validate a build plan for common errors
   */
  async validatePlan(plan: BuildPlan): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Check 1: No tech stack as features
    const techAsFeatureErrors = this.checkTechStackAsFeatures(plan);
    errors.push(...techAsFeatureErrors);

    // Check 2: Component names must be PascalCase
    const namingErrors = this.checkComponentNaming(plan);
    errors.push(...namingErrors);

    // Check 3: Must have actual features
    const realFeatureErrors = this.checkHasRealFeatures(plan);
    errors.push(...realFeatureErrors);

    // Check 4: No duplicate component names
    const duplicateWarnings = this.checkDuplicateComponents(plan);
    warnings.push(...duplicateWarnings);

    // Check 5: Valid navigation items
    const navigationErrors = this.checkNavigationItems(plan);
    errors.push(...navigationErrors);

    // Determine if regeneration is needed
    const shouldRegenerate = errors.some(e =>
      e.type === 'TECH_AS_FEATURE' ||
      e.type === 'NO_REAL_FEATURES' ||
      e.severity === 'error'
    );

    // Generate regeneration prompt if needed
    const regenerationPrompt = shouldRegenerate ? this.generateRegenerationPrompt(errors) : undefined;

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      shouldRegenerate,
      regenerationPrompt,
    };
  }

  /**
   * Check if tech stack terms are being used as feature names
   */
  private checkTechStackAsFeatures(plan: BuildPlan): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const milestone of plan.milestones) {
      for (const component of milestone.components) {
        const nameLower = component.name.toLowerCase().replace(/[\s-_.]/g, '');

        const matchedTechTerm = this.techStackTerms.find(term =>
          nameLower.includes(term.replace(/[.\s-_]/g, ''))
        );

        if (matchedTechTerm) {
          errors.push({
            type: 'TECH_AS_FEATURE',
            severity: 'error',
            component: component.name,
            message: `Component "${component.name}" appears to be a tech stack item, not a user feature`,
            fix: `Replace with actual user-facing feature. Tech stack should be in implementation details, not component names.`,
          });
        }
      }
    }

    return errors;
  }

  /**
   * Check component naming conventions
   */
  private checkComponentNaming(plan: BuildPlan): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const milestone of plan.milestones) {
      for (const component of milestone.components) {
        const nameWithoutSpaces = component.name.replace(/\s/g, '');

        // Check if it's PascalCase (starts with uppercase)
        if (!/^[A-Z]/.test(nameWithoutSpaces)) {
          errors.push({
            type: 'INVALID_COMPONENT_NAME',
            severity: 'error',
            component: component.name,
            message: `Component name "${component.name}" must start with uppercase letter (PascalCase)`,
            fix: `Rename to "${nameWithoutSpaces.charAt(0).toUpperCase() + nameWithoutSpaces.slice(1)}"`,
          });
        }

        // Check for invalid characters
        if (/[^a-zA-Z0-9\s]/.test(component.name)) {
          errors.push({
            type: 'INVALID_COMPONENT_NAME',
            severity: 'error',
            component: component.name,
            message: `Component name "${component.name}" contains invalid characters`,
            fix: `Use only letters, numbers, and spaces. React components must be valid JavaScript identifiers.`,
          });
        }
      }
    }

    return errors;
  }

  /**
   * Check if plan has actual user-facing features
   */
  private checkHasRealFeatures(plan: BuildPlan): ValidationError[] {
    const errors: ValidationError[] = [];

    let hasRealFeatures = false;

    for (const milestone of plan.milestones) {
      for (const component of milestone.components) {
        const nameLower = component.name.toLowerCase();
        const descLower = (component.description || '').toLowerCase();

        // Check if component name or description contains valid feature keywords
        const hasFeatureKeyword = this.validFeatureKeywords.some(keyword =>
          nameLower.includes(keyword) || descLower.includes(keyword)
        );

        if (hasFeatureKeyword) {
          hasRealFeatures = true;
          break;
        }
      }
      if (hasRealFeatures) break;
    }

    if (!hasRealFeatures) {
      errors.push({
        type: 'NO_REAL_FEATURES',
        severity: 'error',
        message: 'Plan does not contain any recognizable user-facing features',
        fix: `Include actual application features like Dashboard, User Profile, Task Management, etc. Not tech stack documentation.`,
      });
    }

    return errors;
  }

  /**
   * Check for duplicate component names
   */
  private checkDuplicateComponents(plan: BuildPlan): ValidationError[] {
    const warnings: ValidationError[] = [];
    const componentNames = new Set<string>();
    const duplicates = new Set<string>();

    for (const milestone of plan.milestones) {
      for (const component of milestone.components) {
        const normalizedName = component.name.toLowerCase().replace(/\s/g, '');

        if (componentNames.has(normalizedName)) {
          duplicates.add(component.name);
        } else {
          componentNames.add(normalizedName);
        }
      }
    }

    if (duplicates.size > 0) {
      warnings.push({
        type: 'DUPLICATE_COMPONENTS',
        severity: 'warning',
        components: Array.from(duplicates),
        message: `Found duplicate component names: ${Array.from(duplicates).join(', ')}`,
        fix: `Ensure each component has a unique name to avoid conflicts.`,
      });
    }

    return warnings;
  }

  /**
   * Check navigation items (if present in plan)
   */
  private checkNavigationItems(plan: BuildPlan): ValidationError[] {
    const errors: ValidationError[] = [];

    // This would check navigation if it's part of the plan structure
    // For now, we'll validate based on component names that will likely become nav items

    return errors;
  }

  /**
   * Generate a prompt for plan regeneration with specific fixes
   */
  private generateRegenerationPrompt(errors: ValidationError[]): string {
    const errorSummary = errors.map(e => `- ${e.type}: ${e.message}`).join('\n');
    const fixes = errors.map(e => `- ${e.fix}`).join('\n');

    return `
The previous plan was INVALID. Critical problems found:

${errorSummary}

REQUIRED FIXES:
${fixes}

IMPORTANT GUIDELINES FOR NEW PLAN:
1. Generate ACTUAL USER FEATURES like:
   ✓ User Dashboard - shows user data and stats
   ✓ Task Management - create, edit, delete tasks
   ✓ Team Collaboration - chat, comments, sharing
   ✓ Settings Panel - user preferences and config
   ✓ Data Analytics - charts, reports, insights

2. DO NOT use tech stack items as features:
   ✗ Next.js, React, TypeScript (these are implementation details)
   ✗ Tailwind CSS, shadcn/ui (these are styling tools)
   ✗ Supabase, PostgreSQL (these are infrastructure)

3. Component names must be:
   ✓ PascalCase (UserDashboard, TaskList, SettingsPanel)
   ✓ Descriptive of USER-FACING functionality
   ✓ Valid React component names

4. Think: "What does the USER do?" not "What framework do I use?"

Generate a new plan following these rules.
`;
  }

  /**
   * Get a validation report as a formatted string
   */
  getValidationReport(result: ValidationResult): string {
    let report = '';

    if (result.valid) {
      report = '✅ Plan validation passed!\n';
    } else {
      report = '❌ Plan validation failed!\n\n';

      if (result.errors.length > 0) {
        report += `ERRORS (${result.errors.length}):\n`;
        result.errors.forEach((error, i) => {
          report += `${i + 1}. [${error.type}] ${error.message}\n`;
          report += `   Fix: ${error.fix}\n\n`;
        });
      }
    }

    if (result.warnings.length > 0) {
      report += `WARNINGS (${result.warnings.length}):\n`;
      result.warnings.forEach((warning, i) => {
        report += `${i + 1}. [${warning.type}] ${warning.message}\n`;
        report += `   Suggestion: ${warning.fix}\n\n`;
      });
    }

    if (result.shouldRegenerate) {
      report += '\n🔄 Plan should be regenerated with fixes applied.\n';
    }

    return report;
  }
}

/**
 * Quick validation function for use in API routes
 */
export async function validateBuildPlan(plan: BuildPlan): Promise<ValidationResult> {
  const validator = new PlanValidator();
  return await validator.validatePlan(plan);
}
