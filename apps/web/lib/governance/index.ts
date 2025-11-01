/**
 * Governance System - Public API
 *
 * Easy-to-use governance for AI code generation
 */

export { GovernanceEngine, governanceEngine, createGovernanceEngine } from './governance-engine';
export type { GovernanceConfig, EnrichedPrompt, GovernanceResult } from './governance-engine';

export { ruleSelector } from './rule-selector';
export type { CodeContext, SelectedRules } from './rule-selector';

export { fastValidator } from './validators';
export type { ValidationResult, CodeMetrics } from './validators';

export {
  ALL_GOVERNANCE_RULES,
  ARCHITECTURE_RULES,
  SECURITY_RULES,
  CODE_QUALITY_RULES,
  ERROR_HANDLING_RULES,
  PERFORMANCE_RULES,
  getRulesByCategory,
  getRuleBySeverity,
} from './rules';

export type { GovernanceRule, RuleViolation } from './rules';

/**
 * USAGE EXAMPLE
 *
 * ```typescript
 * import { governanceEngine } from '@/lib/governance';
 * import { llmGateway } from '@/lib/orchestration/llm-gateway';
 *
 * // Example 1: Simple usage
 * async function generateSecureAPI() {
 *   const result = await governanceEngine.govern(
 *     'Create a REST API endpoint for user registration',
 *     {
 *       taskType: 'api',
 *       language: 'typescript',
 *       complexity: 'medium',
 *       hasUserInput: true,
 *       hasAuthentication: true
 *     },
 *     async (enrichedPrompt) => {
 *       // AI generates code with governance rules injected
 *       const response = await llmGateway.request({
 *         task_type: 'code',
 *         prompt: enrichedPrompt
 *       });
 *       return response.content;
 *     }
 *   );
 *
 *   console.log('Code passed validation:', result.passed);
 *   console.log('Tokens used:', result.tokensUsed);
 *   console.log('Violations:', result.validation.violations);
 *
 *   return result.codeGenerated;
 * }
 *
 * // Example 2: Manual control
 * async function generateWithManualControl() {
 *   // Step 1: Enrich prompt
 *   const enriched = governanceEngine.enrichPrompt(
 *     'Create a database query function',
 *     {
 *       taskType: 'database',
 *       language: 'typescript',
 *       complexity: 'medium',
 *       hasDatabase: true
 *     }
 *   );
 *
 *   console.log('Token overhead:', enriched.tokenOverhead); // ~500-800 tokens
 *
 *   // Step 2: Generate code
 *   const code = await llmGateway.request({
 *     task_type: 'code',
 *     prompt: enriched.enrichedPrompt
 *   });
 *
 *   // Step 3: Validate (fast, no tokens)
 *   const validation = await governanceEngine.validateCode(code.content);
 *
 *   if (!validation.passed) {
 *     console.error('Validation failed:', validation.violations);
 *   }
 *
 *   return code.content;
 * }
 *
 * // Example 3: Different modes
 * import { createGovernanceEngine } from '@/lib/governance';
 *
 * // Strict mode (full rules, higher token cost)
 * const strictEngine = createGovernanceEngine({ enforceMode: 'strict' });
 *
 * // Lenient mode (critical rules only, lower token cost)
 * const lenientEngine = createGovernanceEngine({ enforceMode: 'lenient' });
 *
 * // Prototyping mode (no validation, minimal tokens)
 * const prototypeEngine = createGovernanceEngine({
 *   enforceMode: 'lenient',
 *   skipValidation: true
 * });
 * ```
 */
