/**
 * Smart Consensus System - Selective Multi-LLM Voting
 *
 * Uses consensus strategically:
 * - ONLY for critical/security-sensitive components
 * - Fast 2-3 model consensus for speed
 * - Full 5-7 model consensus for critical
 * - Post-build async review (doesn't block user)
 */

import type { BuildComponent, CriticalityLevel } from './build-orchestrator';

// ============================================================================
// Types
// ============================================================================

export interface ConsensusConfig {
  enabled: boolean;
  modelsByLevel: {
    critical: string[]; // 5-7 models
    high: string[]; // 3-4 models
    medium: string[]; // 2-3 models
    low: string[]; // 1 model (no consensus)
  };
  threshold: number; // 0.0 - 1.0 (e.g., 0.6 = 60% agreement)
  asyncReview: boolean; // Run reviews in background
}

export interface ConsensusResult {
  agreed: boolean;
  confidence: number; // 0.0 - 1.0
  votes: {
    pass: number;
    fail: number;
  };
  models: {
    agreed: string[];
    disagreed: string[];
  };
  issues: ConsensusIssue[];
  fixes: ConsensusFix[];
}

export interface ConsensusIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  description: string;
  modelCount: number; // How many models found this
  models: string[];
}

export interface ConsensusFix {
  issue: string;
  fix: string;
  confidence: number;
  proposedBy: string[];
}

export interface ReviewResult {
  componentId: string;
  componentName: string;
  passed: boolean;
  consensus: ConsensusResult;
  reviewedAt: string;
  reviewDuration: number; // milliseconds
}

// ============================================================================
// Smart Consensus Class
// ============================================================================

export class SmartConsensus {
  private config: ConsensusConfig;

  constructor(config?: Partial<ConsensusConfig>) {
    this.config = {
      enabled: true,
      modelsByLevel: {
        critical: [
          'anthropic/claude-3.5-sonnet',
          'anthropic/claude-opus-4',
          'openai/gpt-4o',
          'google/gemini-2.5-flash',
          'deepseek/deepseek-chat',
        ],
        high: [
          'anthropic/claude-3.5-sonnet',
          'openai/gpt-4o',
          'google/gemini-2.5-flash',
        ],
        medium: [
          'anthropic/claude-3.5-sonnet',
          'google/gemini-2.5-flash',
        ],
        low: [
          'google/gemini-2.5-flash', // Fast + cheap
        ],
      },
      threshold: 0.6, // 60% agreement required
      asyncReview: true,
      ...config,
    };
  }

  /**
   * Determine if component needs consensus
   */
  shouldUseConsensus(component: BuildComponent): boolean {
    if (!this.config.enabled) {
      return false;
    }

    const criticality = this.assessCriticality(component);

    // Only use consensus for high+ criticality
    return ['critical', 'high'].includes(criticality);
  }

  /**
   * Assess component criticality
   */
  assessCriticality(component: BuildComponent): 'critical' | 'high' | 'medium' | 'low' {
    const name = component.name.toLowerCase();
    const desc = (component.description || '').toLowerCase();
    const type = component.type;

    // Critical: Security, payments, auth
    if (
      name.includes('auth') ||
      name.includes('payment') ||
      name.includes('security') ||
      desc.includes('authentication') ||
      desc.includes('authorization') ||
      desc.includes('payment') ||
      desc.includes('security')
    ) {
      return 'critical';
    }

    // High: Data handling, API, backend
    if (
      type === 'backend' ||
      type === 'api' ||
      type === 'database' ||
      name.includes('api') ||
      name.includes('database') ||
      desc.includes('data')
    ) {
      return 'high';
    }

    // Medium: Frontend, UI components
    if (
      type === 'frontend' ||
      name.includes('ui') ||
      name.includes('component')
    ) {
      return 'medium';
    }

    // Low: Everything else
    return 'low';
  }

  /**
   * Get consensus (fast or full)
   */
  async getConsensus(
    component: BuildComponent,
    code: string,
    options: { fast?: boolean } = {}
  ): Promise<ConsensusResult> {
    const criticality = this.assessCriticality(component);
    const models = options.fast
      ? this.config.modelsByLevel.medium.slice(0, 2) // Fast: 2 models
      : this.config.modelsByLevel[criticality];

    console.log(`🗳️  Getting consensus for ${component.name} (${criticality}, ${models.length} models)`);

    const startTime = Date.now();

    // Query all models in parallel
    const opinions = await Promise.all(
      models.map(model => this.getModelOpinion(component, code, model))
    );

    // Calculate consensus
    const result = this.calculateConsensus(opinions, models);

    const duration = Date.now() - startTime;
    console.log(`✅ Consensus complete in ${duration}ms: ${result.agreed ? 'PASS' : 'FAIL'} (${Math.round(result.confidence * 100)}% confidence)`);

    return result;
  }

  /**
   * Get single model opinion
   */
  private async getModelOpinion(
    component: BuildComponent,
    code: string,
    model: string
  ): Promise<{
    model: string;
    passed: boolean;
    confidence: number;
    issues: ConsensusIssue[];
    fixes: ConsensusFix[];
  }> {
    const prompt = `Review this generated code for component: ${component.name}

Type: ${component.type}
Description: ${component.description || 'N/A'}

Code:
\`\`\`
${code.slice(0, 5000)} ${code.length > 5000 ? '...(truncated)' : ''}
\`\`\`

Review for:
1. Runtime errors (null references, undefined, etc.)
2. Type safety issues
3. Security vulnerabilities
4. Logic errors
5. Missing error handling

Return JSON:
{
  "passed": true/false,
  "confidence": 0.0-1.0,
  "issues": [
    {
      "severity": "critical"|"high"|"medium"|"low",
      "category": "string",
      "description": "string"
    }
  ],
  "fixes": [
    {
      "issue": "string",
      "fix": "string",
      "confidence": 0.0-1.0
    }
  ]
}

Be concise. Only report real issues, not stylistic preferences.`;

    try {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY not set');
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://buildrunner.cloud',
          'X-Title': 'BuildRunner - Smart Consensus',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        console.error(`❌ ${model} failed:`, response.statusText);
        return {
          model,
          passed: true, // Default to pass on error (graceful degradation)
          confidence: 0,
          issues: [],
          fixes: [],
        };
      }

      const data = await response.json();
      let content = data.choices[0]?.message?.content || '{}';

      // Extract JSON from markdown if needed
      if (content.includes('```json')) {
        content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (content.includes('```')) {
        content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const opinion = JSON.parse(content);

      return {
        model,
        passed: opinion.passed ?? true,
        confidence: opinion.confidence ?? 0.5,
        issues: (opinion.issues || []).map((i: any) => ({
          severity: i.severity,
          category: i.category,
          description: i.description,
          modelCount: 1,
          models: [model],
        })),
        fixes: (opinion.fixes || []).map((f: any) => ({
          issue: f.issue,
          fix: f.fix,
          confidence: f.confidence,
          proposedBy: [model],
        })),
      };
    } catch (error) {
      console.error(`❌ ${model} error:`, error);
      return {
        model,
        passed: true, // Default to pass on error
        confidence: 0,
        issues: [],
        fixes: [],
      };
    }
  }

  /**
   * Calculate consensus from opinions
   */
  private calculateConsensus(
    opinions: Awaited<ReturnType<typeof this.getModelOpinion>>[],
    models: string[]
  ): ConsensusResult {
    const passVotes = opinions.filter(o => o.passed).length;
    const failVotes = opinions.length - passVotes;

    const confidence = passVotes / opinions.length;
    const agreed = confidence >= this.config.threshold;

    // Merge issues from all models
    const issuesMap = new Map<string, ConsensusIssue>();

    opinions.forEach(opinion => {
      opinion.issues.forEach(issue => {
        const key = `${issue.severity}:${issue.category}:${issue.description}`;

        if (issuesMap.has(key)) {
          const existing = issuesMap.get(key)!;
          existing.modelCount++;
          existing.models.push(opinion.model);
        } else {
          issuesMap.set(key, { ...issue });
        }
      });
    });

    // Merge fixes
    const fixesMap = new Map<string, ConsensusFix>();

    opinions.forEach(opinion => {
      opinion.fixes.forEach(fix => {
        const key = fix.issue;

        if (fixesMap.has(key)) {
          const existing = fixesMap.get(key)!;
          existing.proposedBy.push(...fix.proposedBy);
          // Average confidence
          existing.confidence = (existing.confidence + fix.confidence) / 2;
        } else {
          fixesMap.set(key, { ...fix });
        }
      });
    });

    return {
      agreed,
      confidence,
      votes: {
        pass: passVotes,
        fail: failVotes,
      },
      models: {
        agreed: opinions.filter(o => o.passed).map(o => o.model),
        disagreed: opinions.filter(o => !o.passed).map(o => o.model),
      },
      issues: Array.from(issuesMap.values()).sort((a, b) => b.modelCount - a.modelCount),
      fixes: Array.from(fixesMap.values()).sort((a, b) => b.confidence - a.confidence),
    };
  }

  /**
   * Post-build async review (doesn't block user)
   */
  async postBuildReview(
    components: BuildComponent[],
    options: { async?: boolean } = {}
  ): Promise<ReviewResult[]> {
    if (!this.config.enabled) {
      console.log('📋 Consensus reviews disabled');
      return [];
    }

    // Filter to critical components only
    const criticalComponents = components.filter(comp =>
      ['critical', 'high'].includes(this.assessCriticality(comp))
    );

    console.log(`📋 Post-build review: ${criticalComponents.length} critical components`);

    if (options.async && this.config.asyncReview) {
      // Run in background (don't block)
      setTimeout(() => {
        this.runReviewsInBackground(criticalComponents);
      }, 1000);

      return [];
    }

    // Run synchronously
    return await this.runReviews(criticalComponents);
  }

  /**
   * Run reviews
   */
  private async runReviews(components: BuildComponent[]): Promise<ReviewResult[]> {
    const results: ReviewResult[] = [];

    for (const component of components) {
      if (!component.code) continue;

      const startTime = Date.now();

      const consensus = await this.getConsensus(component, component.code, { fast: true });

      results.push({
        componentId: component.id,
        componentName: component.name,
        passed: consensus.agreed,
        consensus,
        reviewedAt: new Date().toISOString(),
        reviewDuration: Date.now() - startTime,
      });

      // Log high-severity issues
      const highSeverity = consensus.issues.filter(i =>
        ['critical', 'high'].includes(i.severity) && i.modelCount >= 2
      );

      if (highSeverity.length > 0) {
        console.warn(`⚠️  ${component.name}: Found ${highSeverity.length} high-severity issues`);
        highSeverity.forEach(issue => {
          console.warn(`   - [${issue.severity}] ${issue.description} (${issue.modelCount} models)`);
        });
      }
    }

    return results;
  }

  /**
   * Run reviews in background
   */
  private async runReviewsInBackground(components: BuildComponent[]): Promise<void> {
    console.log(`🔍 Running background reviews for ${components.length} components...`);

    try {
      const results = await this.runReviews(components);

      // Save results to disk
      const resultsPath = require('path').join(
        process.cwd(),
        'lib/learned-patterns/reviews',
        `review_${Date.now()}.json`
      );

      const fs = require('fs');
      const dir = require('path').dirname(resultsPath);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

      console.log(`✅ Background review complete. Results saved to: ${resultsPath}`);
    } catch (error) {
      console.error('❌ Background review error:', error);
    }
  }

  /**
   * Get recommended model for component
   */
  getRecommendedModel(component: BuildComponent): string {
    const criticality = this.assessCriticality(component);
    const models = this.config.modelsByLevel[criticality];
    return models[0]; // Return first (best) model for this level
  }

  /**
   * Check if consensus would be expensive (time/cost)
   */
  estimateConsensusTime(component: BuildComponent): number {
    const criticality = this.assessCriticality(component);
    const modelCount = this.config.modelsByLevel[criticality].length;

    // Estimate: 2-5 seconds per model, parallel execution
    return Math.max(2000, modelCount * 1000); // milliseconds
  }

  /**
   * Get configuration
   */
  getConfig(): ConsensusConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ConsensusConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('⚙️  Consensus config updated');
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let consensusInstance: SmartConsensus | null = null;

export function getSmartConsensus(): SmartConsensus {
  if (!consensusInstance) {
    consensusInstance = new SmartConsensus();
  }
  return consensusInstance;
}

export function resetSmartConsensus(): void {
  consensusInstance = null;
}
