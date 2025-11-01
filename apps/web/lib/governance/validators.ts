/**
 * Fast Code Validators
 *
 * Automated checks that run AFTER code generation (no AI token cost)
 * Catches critical issues quickly
 */

import { RuleViolation } from './rules';

export interface ValidationResult {
  passed: boolean;
  violations: RuleViolation[];
  metrics: CodeMetrics;
  executionTime: number; // ms
}

export interface CodeMetrics {
  lines: number;
  functions: number;
  maxComplexity: number;
  hasTests: boolean;
  hasErrorHandling: boolean;
}

export class FastValidator {
  /**
   * Run all fast validators (< 100ms execution time)
   */
  async validate(code: string, filename: string): Promise<ValidationResult> {
    const startTime = Date.now();
    const violations: RuleViolation[] = [];

    // Run validators in parallel for speed
    const results = await Promise.all([
      this.validateSecurity(code),
      this.validateErrorHandling(code),
      this.validateComplexity(code),
      this.validateNaming(code),
      this.validateImports(code),
    ]);

    // Flatten violations
    results.forEach(result => violations.push(...result));

    // Calculate metrics
    const metrics = this.calculateMetrics(code);

    const executionTime = Date.now() - startTime;

    return {
      passed: violations.filter(v => v.severity === 'error').length === 0,
      violations,
      metrics,
      executionTime,
    };
  }

  /**
   * Security validator - catches dangerous patterns
   */
  private async validateSecurity(code: string): Promise<RuleViolation[]> {
    const violations: RuleViolation[] = [];

    // Check for hardcoded secrets (regex patterns)
    const secretPatterns = [
      { pattern: /(sk-[a-zA-Z0-9]{32,})/, name: 'API Key' },
      { pattern: /(password\s*=\s*['"][^'"]+['"])/, name: 'Hardcoded Password' },
      { pattern: /(token\s*=\s*['"][^'"]+['"])/, name: 'Hardcoded Token' },
      { pattern: /(api[_-]?key\s*=\s*['"][^'"]+['"])/, name: 'API Key' },
    ];

    secretPatterns.forEach(({ pattern, name }) => {
      const matches = code.match(new RegExp(pattern, 'gi'));
      if (matches) {
        violations.push({
          ruleId: 'security-003',
          severity: 'error',
          message: `Hardcoded secret detected: ${name}. Use environment variables.`,
          suggestion: 'const apiKey = process.env.API_KEY;',
        });
      }
    });

    // Check for SQL injection vulnerabilities
    if (code.includes('SELECT') || code.includes('INSERT') || code.includes('UPDATE')) {
      const sqlInjectionPattern = /['"`]\s*\+\s*\w+|template\s*literal.*SELECT/i;
      if (sqlInjectionPattern.test(code)) {
        violations.push({
          ruleId: 'security-002',
          severity: 'error',
          message: 'Potential SQL injection vulnerability. Use parameterized queries.',
          suggestion: 'db.query("SELECT * FROM users WHERE id = $1", [userId])',
        });
      }
    }

    // Check for dangerous eval/exec
    if (code.includes('eval(') || code.includes('exec(')) {
      violations.push({
        ruleId: 'security-005',
        severity: 'error',
        message: 'Use of eval() or exec() is dangerous. Avoid dynamic code execution.',
        suggestion: 'Use safer alternatives like JSON.parse() or validated function calls',
      });
    }

    return violations;
  }

  /**
   * Error handling validator
   */
  private async validateErrorHandling(code: string): Promise<RuleViolation[]> {
    const violations: RuleViolation[] = [];

    // Check for async functions without try-catch
    const asyncFunctions = code.match(/async\s+function\s+\w+\s*\([^)]*\)\s*{/g) || [];
    const asyncArrows = code.match(/async\s+\([^)]*\)\s*=>/g) || [];
    const totalAsync = asyncFunctions.length + asyncArrows.length;

    const tryCatchCount = (code.match(/try\s*{/g) || []).length;

    if (totalAsync > 0 && tryCatchCount === 0) {
      violations.push({
        ruleId: 'error-002',
        severity: 'error',
        message: 'Async functions must have try-catch blocks for error handling',
        suggestion: 'Wrap async operations in try-catch and handle errors appropriately',
      });
    }

    // Check for throwing raw strings
    const throwStringPattern = /throw\s+['"`]/;
    if (throwStringPattern.test(code)) {
      violations.push({
        ruleId: 'error-001',
        severity: 'error',
        message: 'Never throw raw strings. Use custom error classes.',
        suggestion: 'throw new ValidationError("message")',
      });
    }

    // Check for .catch() handlers
    const promisesWithoutCatch = code.match(/\.then\([^)]+\)(?!\s*\.catch)/g) || [];
    if (promisesWithoutCatch.length > 0) {
      violations.push({
        ruleId: 'error-002',
        severity: 'warning',
        message: 'Promise chains should have .catch() handlers',
        suggestion: 'Use async/await with try-catch instead of .then() chains',
      });
    }

    return violations;
  }

  /**
   * Complexity validator
   */
  private async validateComplexity(code: string): Promise<RuleViolation[]> {
    const violations: RuleViolation[] = [];

    // Calculate cyclomatic complexity (simplified)
    const functions = this.extractFunctions(code);

    functions.forEach(func => {
      const complexity = this.calculateCyclomaticComplexity(func.body);

      if (complexity > 10) {
        violations.push({
          ruleId: 'quality-003',
          severity: 'error',
          message: `Function "${func.name}" has complexity ${complexity} (max 10). Break it down.`,
          suggestion: 'Extract conditions into separate functions',
        });
      }

      // Check function length
      const lines = func.body.split('\n').length;
      if (lines > 50) {
        violations.push({
          ruleId: 'quality-002',
          severity: 'warning',
          message: `Function "${func.name}" has ${lines} lines (max 50). Consider splitting.`,
          suggestion: 'Extract helper functions for better readability',
        });
      }
    });

    return violations;
  }

  /**
   * Naming convention validator
   */
  private async validateNaming(code: string): Promise<RuleViolation[]> {
    const violations: RuleViolation[] = [];

    // Check for bad variable names
    const badNamePattern = /(?:const|let|var)\s+([a-z]|[A-Z]{2,})\s*=/g;
    const matches = code.matchAll(badNamePattern);

    for (const match of matches) {
      const varName = match[1];
      if (varName.length < 2) {
        violations.push({
          ruleId: 'quality-004',
          severity: 'warning',
          message: `Variable name "${varName}" is too short. Use descriptive names.`,
          suggestion: 'Use meaningful names like "userData" instead of "d"',
        });
      }
    }

    // Check for camelCase in functions
    const functionNamePattern = /function\s+([A-Z][a-zA-Z0-9]*)/g;
    const funcMatches = code.matchAll(functionNamePattern);

    for (const match of funcMatches) {
      violations.push({
        ruleId: 'quality-004',
        severity: 'warning',
        message: `Function "${match[1]}" should be camelCase, not PascalCase`,
        suggestion: 'Use camelCase for function names: getData() not GetData()',
      });
    }

    return violations;
  }

  /**
   * Import validator
   */
  private async validateImports(code: string): Promise<RuleViolation[]> {
    const violations: RuleViolation[] = [];

    // Check for unused imports (simplified)
    const imports = code.match(/import\s+{([^}]+)}\s+from/g) || [];

    // Check for wildcard imports
    if (code.includes('import * as')) {
      violations.push({
        ruleId: 'quality-005',
        severity: 'info',
        message: 'Avoid wildcard imports. Import only what you need.',
        suggestion: 'import { specific, items } from "module"',
      });
    }

    return violations;
  }

  /**
   * Calculate code metrics
   */
  private calculateMetrics(code: string): CodeMetrics {
    const lines = code.split('\n').length;
    const functions = (code.match(/function\s+\w+|=>\s*{/g) || []).length;

    const functionBodies = this.extractFunctions(code);
    const maxComplexity = Math.max(
      ...functionBodies.map(f => this.calculateCyclomaticComplexity(f.body)),
      0
    );

    const hasTests = code.includes('describe(') || code.includes('it(') || code.includes('test(');
    const hasErrorHandling = code.includes('try') && code.includes('catch');

    return {
      lines,
      functions,
      maxComplexity,
      hasTests,
      hasErrorHandling,
    };
  }

  /**
   * Extract functions from code (simplified)
   */
  private extractFunctions(code: string): Array<{ name: string; body: string }> {
    const functions: Array<{ name: string; body: string }> = [];

    // Match function declarations
    const funcPattern = /function\s+(\w+)\s*\([^)]*\)\s*{([^}]*)}/g;
    let match;

    while ((match = funcPattern.exec(code)) !== null) {
      functions.push({
        name: match[1],
        body: match[2],
      });
    }

    // Match arrow functions
    const arrowPattern = /const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*{([^}]*)}/g;

    while ((match = arrowPattern.exec(code)) !== null) {
      functions.push({
        name: match[1],
        body: match[2],
      });
    }

    return functions;
  }

  /**
   * Calculate cyclomatic complexity (simplified)
   */
  private calculateCyclomaticComplexity(code: string): number {
    // Count decision points
    const decisions = [
      /\bif\b/g,
      /\belse\b/g,
      /\bfor\b/g,
      /\bwhile\b/g,
      /\bcase\b/g,
      /\bcatch\b/g,
      /&&/g,
      /\|\|/g,
      /\?/g,
    ];

    let complexity = 1; // Base complexity

    decisions.forEach(pattern => {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }
}

export const fastValidator = new FastValidator();
