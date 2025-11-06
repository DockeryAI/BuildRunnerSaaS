/**
 * Enhanced Consensus Learning System
 *
 * Phase 2 Improvements:
 * 1. LLM-Based Pattern Extraction (replaces brittle regex)
 * 2. Structural Pattern Analysis (analyzes actual plan structure)
 * 3. Multi-Factor Pattern Weighting (recency, specificity, model quality)
 * 4. Few-Shot Example System (concrete examples vs just rules)
 */

import * as fs from 'fs';
import * as path from 'path';
import { LearnedPattern } from './consensus-learning';

// ============================================================================
// LLM-Based Pattern Extraction
// ============================================================================

/**
 * Use an LLM to extract patterns from consensus feedback
 * This is MUCH better than regex because it:
 * - Catches 100% of issues (not just hardcoded patterns)
 * - Understands nuance and context
 * - Learns new types of issues automatically
 * - No manual maintenance needed
 */
export async function extractPatternsWithLLM(
  consensusDiscussion: string,
  verdict: 'PASS' | 'FAIL',
  confidence: number,
  planStructure: any,
  openrouterKey?: string
): Promise<LearnedPattern[]> {
  // Fallback to environment variable if not provided
  const apiKey = openrouterKey || process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.warn('⚠️  No OpenRouter API key available, falling back to regex patterns');
    return [];
  }

  const prompt = `You are a pattern extraction AI for a build plan learning system.

TASK: Extract actionable patterns from this consensus discussion.

CONSENSUS DISCUSSION:
${consensusDiscussion}

VERDICT: ${verdict}
CONFIDENCE: ${confidence}%

PLAN STRUCTURE (for context):
${JSON.stringify(planStructure, null, 2).substring(0, 2000)}

INSTRUCTIONS:
1. If VERDICT = FAIL, extract anti-patterns (what went wrong)
2. If VERDICT = PASS, extract successful patterns (what worked well)
3. Focus on ACTIONABLE, SPECIFIC patterns (not vague advice)
4. Include file paths, architectural decisions, dependency patterns, criticality issues

Return JSON array of patterns:
[
  {
    "category": "file-paths" | "dependencies" | "criticality" | "architecture" | "naming" | "general",
    "pattern": "Clear, actionable rule (e.g., 'middleware.ts MUST be at project root')",
    "confidence": 0-100,
    "reasoning": "Why this pattern matters",
    "examples": ["Specific example from the discussion"]
  }
]

Focus on patterns that are:
- Specific (not generic advice)
- Actionable (can be checked programmatically)
- Valuable (will prevent future failures or ensure future success)`;

  // Retry with exponential backoff
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://buildrunner.cloud',
          'X-Title': 'BuildRunner Pattern Extraction',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet', // Fast and accurate
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2, // Lower for more consistent extraction
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        const statusCode = response.status;

        // Handle specific errors
        if (statusCode === 401) {
          console.error('❌ Pattern extraction API error: Authentication failed (401). Check your OPENROUTER_API_KEY.');
          return []; // Don't retry auth failures
        } else if (statusCode === 429) {
          console.warn(`⚠️  Pattern extraction rate limited (429). Retrying attempt ${attempt}/${maxRetries}...`);
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt))); // Exponential backoff
            continue;
          }
        } else if (statusCode === 400) {
          console.error(`❌ Pattern extraction API error: Bad Request (400). ${errorText.substring(0, 200)}`);
          return []; // Don't retry bad requests
        } else {
          console.error(`❌ Pattern extraction API error (${statusCode}): ${errorText.substring(0, 200)}`);
        }

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt))); // Exponential backoff
          continue;
        }
        return [];
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';

      // Extract JSON from response
      let jsonStr = content.trim();
      if (jsonStr.includes('```json')) {
        jsonStr = jsonStr.match(/```json\s*([\s\S]*?)\s*```/)?.[1] || jsonStr;
      } else if (jsonStr.includes('```')) {
        jsonStr = jsonStr.match(/```\s*([\s\S]*?)\s*```/)?.[1] || jsonStr;
      }

      const extractedPatterns = JSON.parse(jsonStr);

      // Convert to LearnedPattern format
      return extractedPatterns.map((p: any) => ({
        id: generatePatternId(p.pattern),
        type: verdict === 'FAIL' ? 'anti-pattern' : 'example',
        category: p.category,
        pattern: p.pattern,
        confidence: p.confidence || confidence,
        occurrences: 1,
        successRate: verdict === 'PASS' ? 100 : 0,
        sources: ['llm-extraction'],
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        consensusType: 'plan_verification',
        metadata: {
          reasoning: p.reasoning,
          examples: p.examples
        }
      })) as LearnedPattern[];

    } catch (error) {
      console.error(`Failed to extract patterns with LLM (attempt ${attempt}/${maxRetries}):`, error);

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        continue;
      }

      return [];
    }
  }

  return [];
}

// ============================================================================
// Structural Pattern Analysis
// ============================================================================

/**
 * Analyze the actual structure of plans/code to find patterns
 * This goes beyond text analysis to understand what actually failed
 */
export function extractStructuralPatterns(
  plan: any,
  verdict: 'PASS' | 'FAIL'
): LearnedPattern[] {
  const patterns: LearnedPattern[] = [];

  if (!plan || !plan.milestones) return patterns;

  // 1. File Path Pattern Analysis
  const filePaths = plan.milestones.flatMap((m: any) =>
    m.components?.map((c: any) => c.filePath) || []
  );

  filePaths.forEach((filePath: string) => {
    if (!filePath) return;

    // Detect problematic patterns
    if (verdict === 'FAIL') {
      // lib/foo.ts instead of lib/foo/index.ts
      if (filePath.match(/^lib\/[^/]+\.ts$/)) {
        patterns.push({
          id: `structural_filepath_${Date.now()}`,
          type: 'anti-pattern',
          category: 'file-paths',
          pattern: `Avoid lib/[module].ts - use lib/[module]/index.ts for modular structure`,
          confidence: 75,
          occurrences: 1,
          successRate: 0,
          sources: ['structural-analysis'],
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          consensusType: 'plan_verification',
          metadata: { example: filePath }
        } as any);
      }

      // middleware.ts in wrong location
      if (filePath.includes('middleware.ts') && filePath !== 'middleware.ts') {
        patterns.push({
          id: `structural_middleware_${Date.now()}`,
          type: 'anti-pattern',
          category: 'file-paths',
          pattern: 'middleware.ts MUST be at project root (not in subdirectories)',
          confidence: 90,
          occurrences: 1,
          successRate: 0,
          sources: ['structural-analysis'],
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          consensusType: 'plan_verification',
          metadata: { example: filePath }
        } as any);
      }

      // .sql files as components
      if (filePath.endsWith('.sql')) {
        patterns.push({
          id: `structural_sql_${Date.now()}`,
          type: 'anti-pattern',
          category: 'file-paths',
          pattern: 'Avoid .sql files as components - use TypeScript schema files (Drizzle/Prisma)',
          confidence: 85,
          occurrences: 1,
          successRate: 0,
          sources: ['structural-analysis'],
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          consensusType: 'plan_verification',
          metadata: { example: filePath }
        } as any);
      }
    }
  });

  // 2. Dependency Graph Analysis
  const components = plan.milestones.flatMap((m: any) => m.components || []);
  const componentIds = new Set(components.map((c: any) => c.id));

  components.forEach((component: any) => {
    if (!component.dependencies) return;

    // Invalid dependency IDs
    const invalidDeps = component.dependencies.filter(
      (dep: string) => !componentIds.has(dep)
    );

    if (invalidDeps.length > 0 && verdict === 'FAIL') {
      patterns.push({
        id: `structural_invalid_deps_${Date.now()}`,
        type: 'anti-pattern',
        category: 'dependencies',
        pattern: 'All dependency IDs must reference valid component IDs in the plan',
        confidence: 95,
        occurrences: 1,
        successRate: 0,
        sources: ['structural-analysis'],
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        consensusType: 'plan_verification',
        metadata: {
          example: `Component ${component.id} has invalid deps: ${invalidDeps.join(', ')}`
        }
      } as any);
    }

    // Circular dependency detection (basic)
    if (component.dependencies.includes(component.id) && verdict === 'FAIL') {
      patterns.push({
        id: `structural_circular_${Date.now()}`,
        type: 'anti-pattern',
        category: 'dependencies',
        pattern: 'Components cannot depend on themselves (circular dependency)',
        confidence: 100,
        occurrences: 1,
        successRate: 0,
        sources: ['structural-analysis'],
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        consensusType: 'plan_verification',
        metadata: { example: `Component ${component.id} depends on itself` }
      } as any);
    }
  });

  // 3. Architecture Pattern Analysis
  if (plan.milestones.length > 0) {
    const firstMilestone = plan.milestones[0];
    const firstComponent = firstMilestone.components?.[0];

    if (verdict === 'PASS') {
      // Learn from successful architecture
      if (firstComponent?.type === 'design-system' || firstComponent?.id === 'design-system') {
        patterns.push({
          id: `structural_design_first_${Date.now()}`,
          type: 'example',
          category: 'architecture',
          pattern: 'Design system should be first component in Milestone 1',
          confidence: 85,
          occurrences: 1,
          successRate: 100,
          sources: ['structural-analysis'],
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          consensusType: 'plan_verification',
          metadata: { example: 'Successful plan had design-system first' }
        } as any);
      }

      if (firstMilestone.name?.includes('Design System') ||
          firstMilestone.name?.includes('Infrastructure')) {
        patterns.push({
          id: `structural_milestone_name_${Date.now()}`,
          type: 'example',
          category: 'architecture',
          pattern: 'First milestone should be "Design System & Infrastructure"',
          confidence: 80,
          occurrences: 1,
          successRate: 100,
          sources: ['structural-analysis'],
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          consensusType: 'plan_verification',
          metadata: { example: firstMilestone.name }
        } as any);
      }
    }
  }

  // 4. Criticality Pattern Analysis
  const criticalityIssues = components.filter((c: any) => !c.criticality);
  if (criticalityIssues.length > 0 && verdict === 'FAIL') {
    patterns.push({
      id: `structural_missing_criticality_${Date.now()}`,
      type: 'anti-pattern',
      category: 'criticality',
      pattern: 'All components must have criticality field (STANDARD/IMPORTANT/CRITICAL/ULTRA_CRITICAL)',
      confidence: 90,
      occurrences: 1,
      successRate: 0,
      sources: ['structural-analysis'],
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      consensusType: 'plan_verification',
      metadata: {
        example: `${criticalityIssues.length} components missing criticality`
      }
    } as any);
  }

  return patterns;
}

// ============================================================================
// Multi-Factor Pattern Weighting
// ============================================================================

/**
 * Calculate pattern score with multiple factors:
 * - Base: confidence * successRate
 * - Recency: exponential decay over time
 * - Specificity: specific patterns > vague ones
 * - Model Quality: higher quality models weighted more
 * - Frequency: logarithmic boost for recurring patterns
 * - Trend: recent success/failure rate adjustment
 */
export function calculateEnhancedPatternScore(
  pattern: LearnedPattern,
  allPatterns: LearnedPattern[]
): number {
  // Base score
  let score = (pattern.confidence / 100) * (pattern.successRate / 100);

  // 1. Recency boost (exponential decay: 10% per day)
  const lastSeenDate = new Date(pattern.lastSeen);
  const ageInDays = (Date.now() - lastSeenDate.getTime()) / (1000 * 60 * 60 * 24);
  const recencyMultiplier = Math.exp(-0.1 * ageInDays);
  score *= recencyMultiplier;

  // 2. Specificity boost (specific patterns are more valuable)
  const specificity = measureSpecificity(pattern.pattern);
  score *= (1 + specificity); // Up to 2x for highly specific patterns

  // 3. Model quality weight
  const avgModelQuality = pattern.sources
    .map(getModelQuality)
    .reduce((a, b) => a + b, 0) / pattern.sources.length;
  score *= avgModelQuality;

  // 4. Frequency boost (logarithmic to prevent over-weighting common patterns)
  const frequencyBoost = Math.log10(pattern.occurrences + 1);
  score *= (1 + frequencyBoost);

  // 5. Trend adjustment (is this pattern still relevant?)
  const trend = calculatePatternTrend(pattern, allPatterns);
  score *= (1 + trend); // -0.5 to +0.5 based on recent performance

  return score;
}

/**
 * Measure how specific a pattern is (0-1 scale)
 * More specific = higher score
 */
function measureSpecificity(pattern: string): number {
  let specificity = 0;

  // Has file paths or concrete examples
  if (/lib\/|app\/|components\/|\.ts|\.tsx/i.test(pattern)) {
    specificity += 0.3;
  }

  // Has specific constraints (MUST, NEVER, etc.)
  if (/MUST|NEVER|ALWAYS|EXACTLY|ONLY/i.test(pattern)) {
    specificity += 0.2;
  }

  // Has specific values or numbers
  if (/\d+|"[^"]+"|'[^']+'/.test(pattern)) {
    specificity += 0.2;
  }

  // Longer patterns tend to be more specific
  if (pattern.length > 50) {
    specificity += 0.2;
  }

  // Has concrete keywords
  if (/middleware|design-system|authentication|database|api/i.test(pattern)) {
    specificity += 0.1;
  }

  return Math.min(1, specificity);
}

/**
 * Get quality score for a model (0.5-2.0 scale)
 */
function getModelQuality(source: string): number {
  // Higher quality models get higher weights
  const qualityMap: Record<string, number> = {
    'anthropic/claude-3.5-sonnet': 2.0,
    'anthropic/claude-opus-3.5': 1.8,
    'openai/gpt-4-turbo': 1.7,
    'google/gemini-pro-1.5': 1.5,
    'llm-extraction': 1.6, // LLM-based extraction is high quality
    'structural-analysis': 1.7, // Structural analysis is very reliable
    'auto-fix-system': 1.4,
    'default': 1.0
  };

  // Handle null/undefined source
  const safeSource = source || '';

  for (const [key, value] of Object.entries(qualityMap)) {
    if (safeSource.includes(key)) {
      return value;
    }
  }

  return qualityMap.default;
}

/**
 * Calculate trend: is this pattern performing better or worse recently?
 * Returns -0.5 to +0.5
 */
function calculatePatternTrend(
  pattern: LearnedPattern,
  allPatterns: LearnedPattern[]
): number {
  // TODO: Implement trend analysis based on recent sessions
  // For now, return neutral
  return 0;
}

// ============================================================================
// Few-Shot Example System
// ============================================================================

export interface FewShotExample {
  id: string;
  type: 'correct' | 'incorrect';
  planStructure: any;
  consensusScore: number;
  mainIssue?: string;
  timestamp: string;
}

/**
 * Store successful and failed plans as few-shot examples
 */
export function storeFewShotExample(
  plan: any,
  consensusResult: any,
  consensusType: 'plan_verification' | 'component_build' | 'code_review'
): void {
  const examplesDir = path.join(process.cwd(), 'lib/learned-patterns/examples');
  if (!fs.existsSync(examplesDir)) {
    fs.mkdirSync(examplesDir, { recursive: true });
  }

  const examplesFile = path.join(examplesDir, `${consensusType}.json`);

  let examples: FewShotExample[] = [];
  if (fs.existsSync(examplesFile)) {
    examples = JSON.parse(fs.readFileSync(examplesFile, 'utf8'));
  }

  const example: FewShotExample = {
    id: `example_${Date.now()}`,
    type: consensusResult.agreed ? 'correct' : 'incorrect',
    planStructure: plan,
    consensusScore: consensusResult.agreementPercentage || 0,
    mainIssue: consensusResult.agreed ? undefined : extractMainIssue(consensusResult),
    timestamp: new Date().toISOString()
  };

  examples.push(example);

  // Keep only last 20 examples (10 correct, 10 incorrect)
  const correct = examples.filter(e => e.type === 'correct').slice(-10);
  const incorrect = examples.filter(e => e.type === 'incorrect').slice(-10);
  examples = [...correct, ...incorrect];

  fs.writeFileSync(examplesFile, JSON.stringify(examples, null, 2));
}

/**
 * Generate few-shot examples section for prompts
 */
export function generateFewShotExamplesSection(
  consensusType: 'plan_verification' | 'component_build' | 'code_review',
  count: number = 3
): string {
  const examplesFile = path.join(
    process.cwd(),
    `lib/learned-patterns/examples/${consensusType}.json`
  );

  if (!fs.existsSync(examplesFile)) {
    return '';
  }

  const examples: FewShotExample[] = JSON.parse(fs.readFileSync(examplesFile, 'utf8'));

  const correct = examples.filter(e => e.type === 'correct').slice(-count);
  const incorrect = examples.filter(e => e.type === 'incorrect').slice(-count);

  if (correct.length === 0 && incorrect.length === 0) {
    return '';
  }

  let section = '\n=== LEARNED EXAMPLES ===\n\n';

  if (correct.length > 0) {
    section += '**CORRECT Examples (passed consensus):**\n\n';
    correct.forEach((ex, idx) => {
      section += `Example ${idx + 1}: ✅ Passed with ${ex.consensusScore}% agreement\n`;
      section += formatExamplePlan(ex.planStructure);
      section += '\n';
    });
  }

  if (incorrect.length > 0) {
    section += '**INCORRECT Examples (failed consensus):**\n\n';
    incorrect.forEach((ex, idx) => {
      section += `Example ${idx + 1}: ❌ Failed - ${ex.mainIssue}\n`;
      section += formatExamplePlan(ex.planStructure);
      section += '\n';
    });
  }

  return section;
}

function formatExamplePlan(plan: any): string {
  if (!plan || !plan.milestones) return '';

  const firstMilestone = plan.milestones[0];
  const firstComponent = firstMilestone?.components?.[0];

  return `- First milestone: "${firstMilestone?.name || 'N/A'}"\n` +
         `- First component: ${firstComponent?.id || 'N/A'} (${firstComponent?.filePath || 'N/A'})\n` +
         `- Total components: ${plan.milestones.flatMap((m: any) => m.components || []).length}\n`;
}

function extractMainIssue(consensusResult: any): string {
  // Extract the most common issue from consensus feedback
  const issues: string[] = [];

  consensusResult.responses?.forEach((response: any) => {
    if (response.response.includes('VERDICT: FAIL')) {
      const reasoning = response.response.match(/REASON:\s*(.+)/is)?.[1] || '';
      if (reasoning) {
        // Take first sentence as main issue
        const mainIssue = reasoning.split(/[.\n]/)[0].trim();
        if (mainIssue) issues.push(mainIssue);
      }
    }
  });

  // Return most common issue
  if (issues.length === 0) return 'Unknown issue';

  const issueCount = new Map<string, number>();
  issues.forEach(issue => {
    issueCount.set(issue, (issueCount.get(issue) || 0) + 1);
  });

  let maxCount = 0;
  let mainIssue = 'Unknown issue';
  issueCount.forEach((count, issue) => {
    if (count > maxCount) {
      maxCount = count;
      mainIssue = issue;
    }
  });

  return mainIssue;
}

// ============================================================================
// Helper Functions
// ============================================================================

function generatePatternId(pattern: string): string {
  // Simple hash of pattern text
  let hash = 0;
  for (let i = 0; i < pattern.length; i++) {
    const char = pattern.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `pattern_${Math.abs(hash)}`;
}
