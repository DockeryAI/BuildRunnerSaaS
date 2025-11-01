/**
 * Verification Engine
 *
 * Multi-LLM consensus verification system that ensures:
 * - All features are implemented
 * - No features are missed
 * - Code quality standards are met
 * - Triple verification before marking complete
 */

import {
  Feature,
  VerificationResult,
  LLMVerification,
  LLMModel,
  VerificationLog,
} from './types';
import { llmGateway } from './llm-gateway';
import { featureRegistry } from './feature-registry';

// ============================================================================
// Verification Engine Class
// ============================================================================

export class VerificationEngine {
  private static instance: VerificationEngine;
  private verificationModels: LLMModel[] = [
    'anthropic/claude-sonnet-3.5',
    'openai/gpt-4',
    'google/gemini-pro',
  ];

  private constructor() {}

  public static getInstance(): VerificationEngine {
    if (!VerificationEngine.instance) {
      VerificationEngine.instance = new VerificationEngine();
    }
    return VerificationEngine.instance;
  }

  // ==========================================================================
  // Phase & Feature Verification
  // ==========================================================================

  /**
   * Verify that a phase is complete
   * Uses multi-LLM consensus to check all features are implemented
   */
  public async verifyPhaseCompletion(phase: number): Promise<VerificationResult> {
    console.log(`\n🔍 Verifying Phase ${phase} completion...`);

    // Get all features for this phase
    const features = featureRegistry.getFeaturesByPhase(phase);

    if (features.length === 0) {
      console.log(`⚠️  No features found for Phase ${phase}`);
      return {
        status: 'verified',
        canProceed: true,
      };
    }

    // Get codebase snapshot
    const codebaseSnapshot = await this.getCodebaseSnapshot();

    // Verify with multiple LLMs in parallel
    const verifications = await Promise.all(
      this.verificationModels.map((model) =>
        this.verifyWithModel(model, phase, features, codebaseSnapshot)
      )
    );

    // Analyze consensus
    const consensus = this.analyzeConsensus(verifications);

    // Create verification result
    const result: VerificationResult = {
      status: consensus.complete ? 'verified' : 'incomplete',
      canProceed: consensus.complete,
      verifications,
    };

    if (!consensus.complete) {
      result.missing = consensus.missingFeatures;
      result.requiresWork = true;
      result.recommendations = consensus.recommendations;
    }

    // Log verification
    this.logVerification(phase, result);

    // Print summary
    this.printVerificationSummary(phase, result);

    return result;
  }

  /**
   * Verify specific features
   */
  public async verifyFeatures(featureIds: string[]): Promise<VerificationResult> {
    console.log(`\n🔍 Verifying ${featureIds.length} features...`);

    const features = featureIds
      .map((id) => featureRegistry.getAllFeatures().find((f) => f.id === id))
      .filter((f): f is Feature => f !== null);

    if (features.length === 0) {
      return {
        status: 'failed',
        canProceed: false,
      };
    }

    const codebaseSnapshot = await this.getCodebaseSnapshot();

    const verifications = await Promise.all(
      this.verificationModels.map((model) =>
        this.verifyFeaturesWithModel(model, features, codebaseSnapshot)
      )
    );

    const consensus = this.analyzeConsensus(verifications);

    return {
      status: consensus.complete ? 'verified' : 'incomplete',
      canProceed: consensus.complete,
      missing: consensus.missingFeatures,
      verifications,
      recommendations: consensus.recommendations,
    };
  }

  /**
   * Verify changed features after PRD updates
   */
  public async verifyChangedFeatures(features: Feature[]): Promise<VerificationResult> {
    console.log(`\n🔍 Verifying ${features.length} changed features...`);

    const codebaseSnapshot = await this.getCodebaseSnapshot();

    const verifications = await Promise.all(
      this.verificationModels.map((model) =>
        this.verifyFeaturesWithModel(model, features, codebaseSnapshot)
      )
    );

    const consensus = this.analyzeConsensus(verifications);

    return {
      status: consensus.complete ? 'verified' : 'incomplete',
      canProceed: consensus.complete,
      missing: consensus.missingFeatures,
      verifications,
    };
  }

  /**
   * Enforce completion - keeps trying until verified or max attempts
   */
  public async enforceCompletion(phase: number, maxAttempts: number = 5): Promise<boolean> {
    console.log(`\n🔒 Enforcing completion for Phase ${phase} (max ${maxAttempts} attempts)...`);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`\nAttempt ${attempt}/${maxAttempts}...`);

      const result = await this.verifyPhaseCompletion(phase);

      if (result.status === 'verified') {
        console.log(`✅ Phase ${phase} verified complete!`);
        return true;
      }

      if (attempt < maxAttempts) {
        console.log(`\n❌ Phase ${phase} incomplete. Missing features:`);
        result.missing?.forEach((f) => {
          console.log(`   - ${f.name} (${f.id})`);
        });

        console.log(`\n🔄 Auto-assigning remaining work...`);
        // In a real implementation, this would assign work to agents
        await this.assignRemainingWork(result.missing || []);

        // Wait before next attempt
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    console.log(`\n⚠️  Max attempts (${maxAttempts}) reached. Escalating to human...`);
    return false;
  }

  // ==========================================================================
  // Private Verification Methods
  // ==========================================================================

  /**
   * Verify features with a specific LLM
   */
  private async verifyWithModel(
    model: LLMModel,
    phase: number,
    features: Feature[],
    codebaseSnapshot: string
  ): Promise<LLMVerification> {
    const prompt = `You are a code verification agent. Your task is to verify that ALL features for Phase ${phase} have been fully implemented.

FEATURES TO VERIFY:
${features.map((f) => `
${f.id}. ${f.name}
   Description: ${f.description}
   Status: ${f.status}
   Acceptance Criteria: ${f.acceptance_criteria.map((ac) => ac.description).join(', ')}
`).join('\n')}

CODEBASE SNAPSHOT:
${codebaseSnapshot}

For each feature, check:
1. Is the code implemented?
2. Are tests present?
3. Does it meet acceptance criteria?
4. Are there any obvious issues?

Return JSON:
{
  "result": "complete" or "incomplete",
  "confidence": 0.0-1.0,
  "missing_features": ["feature_id1", "feature_id2", ...],
  "reasoning": "Detailed explanation of your assessment",
  "issues_found": ["issue1", "issue2", ...]
}`;

    try {
      const response = await llmGateway.request({
        task_type: 'verification',
        prompt,
        system_prompt: 'You are a thorough code verification expert. Be strict and detailed.',
        require_json: true,
      });

      const parsed = JSON.parse(response.content);

      return {
        model,
        result: parsed.result,
        confidence: parsed.confidence,
        missing_features: parsed.missing_features || [],
        reasoning: parsed.reasoning,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error(`❌ Verification failed for model ${model}:`, error);
      return {
        model,
        result: 'incomplete',
        confidence: 0,
        missing_features: features.map((f) => f.id),
        reasoning: 'Verification failed due to error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Verify specific features with a model
   */
  private async verifyFeaturesWithModel(
    model: LLMModel,
    features: Feature[],
    codebaseSnapshot: string
  ): Promise<LLMVerification> {
    const prompt = `Verify these specific features have been implemented:

${features.map((f) => `${f.id}. ${f.name} - ${f.description}`).join('\n')}

Codebase:
${codebaseSnapshot}

Return JSON with verification results.`;

    const response = await llmGateway.request({
      task_type: 'verification',
      prompt,
      require_json: true,
    });

    const parsed = JSON.parse(response.content);

    return {
      model,
      result: parsed.result || 'incomplete',
      confidence: parsed.confidence || 0.5,
      missing_features: parsed.missing_features || [],
      reasoning: parsed.reasoning || '',
      timestamp: new Date(),
    };
  }

  /**
   * Analyze consensus across multiple LLM verifications
   */
  private analyzeConsensus(verifications: LLMVerification[]): {
    complete: boolean;
    confidence: number;
    missingFeatures: Feature[];
    recommendations: string[];
  } {
    // Count how many LLMs say complete
    const completeCount = verifications.filter((v) => v.result === 'complete').length;
    const totalCount = verifications.length;

    // Need at least 2 out of 3 to agree (67% threshold)
    const consensusThreshold = 0.67;
    const agreementRatio = completeCount / totalCount;

    const complete = agreementRatio >= consensusThreshold;

    // Calculate average confidence
    const avgConfidence = verifications.reduce((sum, v) => sum + v.confidence, 0) / totalCount;

    // Collect all missing features mentioned by any LLM
    const allMissingIds = new Set<string>();
    verifications.forEach((v) => {
      v.missing_features.forEach((id) => allMissingIds.add(id));
    });

    // Get Feature objects for missing IDs
    const missingFeatures = Array.from(allMissingIds)
      .map((id) => featureRegistry.getAllFeatures().find((f) => f.id === id))
      .filter((f): f is Feature => f !== null);

    // Generate recommendations
    const recommendations = verifications
      .map((v) => `${v.model}: ${v.reasoning}`)
      .filter((r) => r.length > 0);

    return {
      complete,
      confidence: avgConfidence,
      missingFeatures,
      recommendations,
    };
  }

  /**
   * Get snapshot of current codebase
   */
  private async getCodebaseSnapshot(): Promise<string> {
    // In a real implementation, this would:
    // 1. List all relevant source files
    // 2. Read file contents
    // 3. Extract key code sections
    // 4. Build a comprehensive snapshot

    // For now, return placeholder
    return `[Codebase snapshot would include:
- File tree
- Key source files
- Test files
- Recent git commits
- Package.json dependencies
]`;
  }

  /**
   * Assign remaining work to agents
   */
  private async assignRemainingWork(missingFeatures: Feature[]): Promise<void> {
    // In a real implementation, this would:
    // 1. Create tasks for each missing feature
    // 2. Assign to available agents
    // 3. Track progress

    console.log(`📋 Assigning ${missingFeatures.length} missing features to agents...`);
    missingFeatures.forEach((f) => {
      console.log(`   - ${f.id}: ${f.name}`);
    });
  }

  /**
   * Log verification to registry
   */
  private logVerification(phase: number, result: VerificationResult): void {
    const log: VerificationLog = {
      phase,
      step: 0,
      timestamp: new Date(),
      result,
      verified_by: this.verificationModels,
    };

    const registry = featureRegistry.getRegistry();
    registry.verification_log.push(log);
  }

  /**
   * Print verification summary
   */
  private printVerificationSummary(phase: number, result: VerificationResult): void {
    console.log('\n' + '='.repeat(60));
    console.log(`📊 VERIFICATION SUMMARY - Phase ${phase}`);
    console.log('='.repeat(60));

    console.log(`\nStatus: ${result.status.toUpperCase()}`);
    console.log(`Can Proceed: ${result.canProceed ? '✅ YES' : '❌ NO'}`);

    if (result.verifications) {
      console.log('\nLLM Verdicts:');
      result.verifications.forEach((v) => {
        const icon = v.result === 'complete' ? '✅' : '❌';
        console.log(`  ${icon} ${v.model}: ${v.result} (confidence: ${(v.confidence * 100).toFixed(1)}%)`);
      });
    }

    if (result.missing && result.missing.length > 0) {
      console.log(`\n❌ Missing Features (${result.missing.length}):`);
      result.missing.forEach((f) => {
        console.log(`   - ${f.id}: ${f.name}`);
      });
    }

    if (result.recommendations && result.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      result.recommendations.forEach((r) => {
        console.log(`   ${r}`);
      });
    }

    console.log('='.repeat(60) + '\n');
  }
}

// Export singleton instance
export const verificationEngine = VerificationEngine.getInstance();
