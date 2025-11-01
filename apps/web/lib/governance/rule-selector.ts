/**
 * Smart Rule Selector
 *
 * Intelligently selects only relevant governance rules based on context
 * to minimize token usage while maintaining quality standards
 */

import {
  GovernanceRule,
  ALL_GOVERNANCE_RULES,
  ARCHITECTURE_RULES,
  SECURITY_RULES,
  ERROR_HANDLING_RULES,
} from './rules';

export interface CodeContext {
  taskType: 'api' | 'database' | 'auth' | 'ui' | 'service' | 'utility' | 'test';
  language: 'typescript' | 'javascript' | 'python' | 'sql';
  complexity: 'low' | 'medium' | 'high';
  hasUserInput?: boolean;
  hasDatabase?: boolean;
  hasExternalAPI?: boolean;
  hasAuthentication?: boolean;
  featureName?: string;
}

export interface SelectedRules {
  critical: GovernanceRule[];    // Always enforced (security, architecture)
  relevant: GovernanceRule[];    // Context-specific rules
  optional: GovernanceRule[];    // Nice-to-have, not injected in prompt
  estimatedTokens: number;       // Estimated token cost
}

export class SmartRuleSelector {
  /**
   * Select rules based on context - optimized for token efficiency
   */
  selectRules(context: CodeContext): SelectedRules {
    const critical = this.getCriticalRules(context);
    const relevant = this.getRelevantRules(context);
    const optional = this.getOptionalRules(context);

    // Estimate token usage
    const estimatedTokens = this.estimateTokens(critical, relevant);

    return {
      critical,
      relevant,
      optional,
      estimatedTokens,
    };
  }

  /**
   * Get critical rules (always enforced, ~500 tokens)
   */
  private getCriticalRules(context: CodeContext): GovernanceRule[] {
    const rules: GovernanceRule[] = [];

    // ALWAYS include these security rules
    rules.push(
      ...SECURITY_RULES.filter(r => r.severity === 'error')
    );

    // ALWAYS include error handling
    rules.push(
      ...ERROR_HANDLING_RULES.filter(r => r.id === 'error-001') // Custom error hierarchy
    );

    // Architecture rules for complex code
    if (context.complexity !== 'low') {
      rules.push(
        ...ARCHITECTURE_RULES.filter(r => r.id === 'arch-002') // SOLID principles
      );
    }

    return rules;
  }

  /**
   * Get context-specific relevant rules (~300 tokens)
   */
  private getRelevantRules(context: CodeContext): GovernanceRule[] {
    const rules: GovernanceRule[] = [];

    // User input = validation rules
    if (context.hasUserInput) {
      rules.push(...ALL_GOVERNANCE_RULES.filter(r =>
        r.id === 'security-001' || // Input validation
        r.id === 'security-002'    // SQL injection
      ));
    }

    // Database = query optimization
    if (context.hasDatabase) {
      rules.push(...ALL_GOVERNANCE_RULES.filter(r =>
        r.id === 'perf-002' // Database optimization
      ));
    }

    // External API = retry logic
    if (context.hasExternalAPI) {
      rules.push(...ALL_GOVERNANCE_RULES.filter(r =>
        r.id === 'error-003' || // Retry logic
        r.id === 'perf-001'     // Async/await
      ));
    }

    // Authentication = auth/authz rules
    if (context.hasAuthentication) {
      rules.push(...ALL_GOVERNANCE_RULES.filter(r =>
        r.id === 'security-004' // Auth & authz
      ));
    }

    // Task-specific rules
    switch (context.taskType) {
      case 'api':
        rules.push(...ALL_GOVERNANCE_RULES.filter(r =>
          r.category === 'api_design'
        ));
        break;
      case 'database':
        rules.push(...ALL_GOVERNANCE_RULES.filter(r =>
          r.category === 'database'
        ));
        break;
      case 'test':
        rules.push(...ALL_GOVERNANCE_RULES.filter(r =>
          r.category === 'testing'
        ));
        break;
    }

    // Deduplicate
    return Array.from(new Map(rules.map(r => [r.id, r])).values());
  }

  /**
   * Get optional rules (for post-generation review)
   */
  private getOptionalRules(context: CodeContext): GovernanceRule[] {
    return ALL_GOVERNANCE_RULES.filter(rule =>
      !this.getCriticalRules(context).includes(rule) &&
      !this.getRelevantRules(context).includes(rule)
    );
  }

  /**
   * Estimate token usage for rules (~4 chars per token)
   */
  private estimateTokens(
    critical: GovernanceRule[],
    relevant: GovernanceRule[]
  ): number {
    const allRules = [...critical, ...relevant];
    const totalChars = allRules.reduce((sum, rule) => {
      return sum + rule.promptGuidance.length;
    }, 0);

    return Math.ceil(totalChars / 4);
  }

  /**
   * Generate compressed prompt guidance (for token efficiency)
   */
  generateCompressedGuidance(rules: GovernanceRule[]): string {
    if (rules.length === 0) return '';

    let guidance = '## CODE QUALITY REQUIREMENTS\n\n';

    // Group by category for brevity
    const byCategory = this.groupByCategory(rules);

    for (const [category, categoryRules] of Object.entries(byCategory)) {
      guidance += `### ${category.toUpperCase()}\n`;
      categoryRules.forEach(rule => {
        // Extract only essential guidance (first 500 chars)
        const essential = this.extractEssentialGuidance(rule.promptGuidance);
        guidance += `**${rule.name}**: ${essential}\n\n`;
      });
    }

    return guidance;
  }

  /**
   * Extract essential guidance (remove verbose examples)
   */
  private extractEssentialGuidance(fullGuidance: string): string {
    // Take only the first key point
    const lines = fullGuidance.trim().split('\n').filter(l => l.trim());

    // Find first meaningful line (not just headers)
    for (const line of lines) {
      if (line.startsWith('**') || line.startsWith('MANDATORY') || line.startsWith('CRITICAL')) {
        // Take this line and next 2-3 lines
        const index = lines.indexOf(line);
        return lines.slice(index, index + 3).join(' ').substring(0, 200);
      }
    }

    // Fallback: take first 200 chars
    return fullGuidance.substring(0, 200);
  }

  /**
   * Group rules by category
   */
  private groupByCategory(rules: GovernanceRule[]): Record<string, GovernanceRule[]> {
    return rules.reduce((acc, rule) => {
      if (!acc[rule.category]) {
        acc[rule.category] = [];
      }
      acc[rule.category].push(rule);
      return acc;
    }, {} as Record<string, GovernanceRule[]>);
  }
}

export const ruleSelector = new SmartRuleSelector();
