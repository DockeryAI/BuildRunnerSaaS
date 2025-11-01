/**
 * Governance Engine
 *
 * Lightweight integration that enforces best practices efficiently:
 * 1. Smart rule injection (before generation) - ~500-800 tokens
 * 2. Fast validation (after generation) - 0 tokens, <100ms
 * 3. Token usage tracking
 */

import { ruleSelector, CodeContext } from './rule-selector';
import { fastValidator, ValidationResult } from './validators';
import { GovernanceRule } from './rules';

export interface GovernanceConfig {
  enforceMode: 'strict' | 'standard' | 'lenient';
  autoFix: boolean;
  skipValidation: boolean; // For quick prototyping
}

export interface EnrichedPrompt {
  originalPrompt: string;
  enrichedPrompt: string;
  rulesApplied: GovernanceRule[];
  estimatedTokens: number;
  tokenOverhead: number; // Extra tokens added by governance
}

export interface GovernanceResult {
  codeGenerated: string;
  validation: ValidationResult;
  rulesApplied: GovernanceRule[];
  tokensUsed: number;
  passed: boolean;
  autoFixed?: boolean;
}

export class GovernanceEngine {
  constructor(
    private config: GovernanceConfig = {
      enforceMode: 'standard',
      autoFix: true,
      skipValidation: false,
    }
  ) {}

  /**
   * STEP 1: Enrich prompt with governance rules (before AI call)
   * Adds ~500-800 tokens depending on context
   */
  enrichPrompt(
    originalPrompt: string,
    context: CodeContext
  ): EnrichedPrompt {
    // Select relevant rules
    const selected = ruleSelector.selectRules(context);

    // Build rules guidance
    let rulesGuidance = '';

    // Critical rules (always included)
    if (selected.critical.length > 0) {
      rulesGuidance += this.buildRulesSection(
        'CRITICAL REQUIREMENTS',
        selected.critical,
        'compact' // Compact format for efficiency
      );
    }

    // Relevant rules (context-specific)
    if (selected.relevant.length > 0 && this.config.enforceMode !== 'lenient') {
      rulesGuidance += this.buildRulesSection(
        'BEST PRACTICES',
        selected.relevant,
        'compact'
      );
    }

    // Build enriched prompt
    const enrichedPrompt = `${rulesGuidance}\n\n${originalPrompt}`;

    const originalTokens = Math.ceil(originalPrompt.length / 4);
    const enrichedTokens = Math.ceil(enrichedPrompt.length / 4);

    return {
      originalPrompt,
      enrichedPrompt,
      rulesApplied: [...selected.critical, ...selected.relevant],
      estimatedTokens: enrichedTokens,
      tokenOverhead: enrichedTokens - originalTokens,
    };
  }

  /**
   * STEP 2: Validate generated code (after AI call)
   * Takes <100ms, uses 0 AI tokens
   */
  async validateCode(
    code: string,
    filename: string = 'generated.ts'
  ): Promise<ValidationResult> {
    if (this.config.skipValidation) {
      return {
        passed: true,
        violations: [],
        metrics: {
          lines: 0,
          functions: 0,
          maxComplexity: 0,
          hasTests: false,
          hasErrorHandling: false,
        },
        executionTime: 0,
      };
    }

    return await fastValidator.validate(code, filename);
  }

  /**
   * COMPLETE FLOW: Govern code generation end-to-end
   */
  async govern(
    originalPrompt: string,
    context: CodeContext,
    generateFn: (enrichedPrompt: string) => Promise<string>
  ): Promise<GovernanceResult> {
    // Step 1: Enrich prompt
    const enriched = this.enrichPrompt(originalPrompt, context);

    // Step 2: Generate code with enriched prompt
    const codeGenerated = await generateFn(enriched.enrichedPrompt);

    // Step 3: Validate generated code (fast, no tokens)
    const validation = await this.validateCode(codeGenerated);

    // Step 4: Auto-fix if configured and validation failed
    let finalCode = codeGenerated;
    let autoFixed = false;

    if (!validation.passed && this.config.autoFix) {
      const fixAttempt = await this.attemptAutoFix(codeGenerated, validation);
      if (fixAttempt.fixed) {
        finalCode = fixAttempt.code;
        autoFixed = true;
      }
    }

    return {
      codeGenerated: finalCode,
      validation,
      rulesApplied: enriched.rulesApplied,
      tokensUsed: enriched.estimatedTokens,
      passed: validation.passed || autoFixed,
      autoFixed,
    };
  }

  /**
   * Build compact rules section (token-efficient)
   */
  private buildRulesSection(
    title: string,
    rules: GovernanceRule[],
    format: 'full' | 'compact'
  ): string {
    if (rules.length === 0) return '';

    let section = `\n## ${title}\n\n`;

    if (format === 'compact') {
      // Compact format: one-liners with key points only
      rules.forEach(rule => {
        const keyPoint = this.extractKeyPoint(rule.promptGuidance);
        section += `• **${rule.name}**: ${keyPoint}\n`;
      });
    } else {
      // Full format (for strict mode)
      rules.forEach(rule => {
        section += `### ${rule.name}\n${rule.promptGuidance}\n\n`;
      });
    }

    return section;
  }

  /**
   * Extract the most important point from guidance (first meaningful sentence)
   */
  private extractKeyPoint(guidance: string): string {
    // Remove markdown formatting
    const cleaned = guidance
      .replace(/[*#`]/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    // Find first sentence with actual content
    const sentences = cleaned.split(/[.!?]/);
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (trimmed.length > 20 && !trimmed.startsWith('Example')) {
        return trimmed.substring(0, 100); // Max 100 chars
      }
    }

    return cleaned.substring(0, 100);
  }

  /**
   * Attempt to auto-fix common issues
   */
  private async attemptAutoFix(
    code: string,
    validation: ValidationResult
  ): Promise<{ fixed: boolean; code: string }> {
    let fixedCode = code;
    let anyFixed = false;

    for (const violation of validation.violations) {
      if (violation.suggestion && violation.severity === 'warning') {
        // Apply simple regex-based fixes
        const fixed = this.applySimpleFix(fixedCode, violation);
        if (fixed !== fixedCode) {
          fixedCode = fixed;
          anyFixed = true;
        }
      }
    }

    return {
      fixed: anyFixed,
      code: fixedCode,
    };
  }

  /**
   * Apply simple regex-based fixes
   */
  private applySimpleFix(code: string, violation: any): string {
    // Example: Fix missing semicolons (if that were a rule)
    // This is simplified - real fixes would be more sophisticated

    // For now, return unchanged (validators catch issues, AI fixes on retry)
    return code;
  }

  /**
   * Get governance statistics for monitoring
   */
  getStats(): {
    mode: string;
    averageTokenOverhead: number;
    validationSpeed: number;
  } {
    return {
      mode: this.config.enforceMode,
      averageTokenOverhead: 600, // Estimated average
      validationSpeed: 50, // ms
    };
  }
}

// Export singleton with default config
export const governanceEngine = new GovernanceEngine();

// Export factory for custom configs
export function createGovernanceEngine(config: Partial<GovernanceConfig>): GovernanceEngine {
  return new GovernanceEngine({
    enforceMode: config.enforceMode || 'standard',
    autoFix: config.autoFix ?? true,
    skipValidation: config.skipValidation ?? false,
  });
}
