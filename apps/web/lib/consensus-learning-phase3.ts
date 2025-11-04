/**
 * Consensus Learning System - Phase 3 Improvements
 *
 * Implements high-consensus improvements from 7 LLMs:
 * 1. Pattern Effectiveness A/B Testing (86% consensus - CRITICAL)
 * 2. Semantic Pattern Clustering with Embeddings (100% consensus - CRITICAL)
 * 3. Expanded Auto-Fix Capabilities (86% consensus - CRITICAL)
 * 4. Dynamic Few-Shot Example Selection (71% consensus - HIGH)
 * 5. Pattern Validation & Conflict Detection (71% consensus - HIGH)
 *
 * These improvements make the learning system self-regulating and provably effective.
 */

import * as fs from 'fs';
import * as path from 'path';
import { LearnedPattern, ConsensusLearningSession } from './consensus-learning';
import { FewShotExample } from './consensus-learning-enhanced';

// ============================================================================
// 1. Pattern Effectiveness A/B Testing (86% consensus - CRITICAL)
// ============================================================================

export interface ABTestGroup {
  id: string;
  type: 'control' | 'test';
  patterns: string[]; // Pattern IDs applied
  timestamp: string;
}

export interface ABTestResult {
  sessionId: string;
  group: ABTestGroup;
  achieved: boolean;
  iterations: number;
  fixesApplied: number;
  timestamp: string;
}

export interface PatternEffectivenessMetrics {
  patternId: string;
  controlSuccessRate: number;
  testSuccessRate: number;
  effectivenessScore: number; // -1 to +1 (test vs control)
  sampleSize: number;
  statisticalSignificance: boolean; // p < 0.05
  confidenceInterval: [number, number];
}

const AB_TEST_DIR = path.join(process.cwd(), 'lib/learned-patterns/ab-tests');

/**
 * Determine if this session should be control or test group
 * Uses 50/50 split with stable hashing
 */
export function assignABTestGroup(sessionId: string, appliedPatternIds: string[]): ABTestGroup {
  // Use simple hash of session ID for deterministic 50/50 split
  const hash = sessionId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const isControl = hash % 2 === 0;

  return {
    id: `ab_${sessionId}`,
    type: isControl ? 'control' : 'test',
    patterns: isControl ? [] : appliedPatternIds,
    timestamp: new Date().toISOString()
  };
}

/**
 * Record A/B test result after consensus
 */
export function recordABTestResult(
  session: ConsensusLearningSession,
  group: ABTestGroup,
  fixesApplied: number
): void {
  if (!fs.existsSync(AB_TEST_DIR)) {
    fs.mkdirSync(AB_TEST_DIR, { recursive: true });
  }

  const result: ABTestResult = {
    sessionId: session.sessionId,
    group,
    achieved: session.achieved,
    iterations: session.iterations,
    fixesApplied,
    timestamp: session.timestamp
  };

  const resultsFile = path.join(AB_TEST_DIR, 'results.json');
  let results: ABTestResult[] = [];

  if (fs.existsSync(resultsFile)) {
    results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
  }

  results.push(result);

  // Keep last 500 results
  results = results.slice(-500);

  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));

  console.log(`🧪 A/B test recorded: ${group.type} group, achieved: ${session.achieved}`);
}

/**
 * Calculate pattern effectiveness using A/B test data
 */
export function calculatePatternEffectiveness(
  patternId: string
): PatternEffectivenessMetrics | null {
  const resultsFile = path.join(AB_TEST_DIR, 'results.json');

  if (!fs.existsSync(resultsFile)) {
    return null;
  }

  const allResults: ABTestResult[] = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));

  // Split into control and test groups that used this pattern
  const controlResults = allResults.filter(r => r.group.type === 'control');
  const testResults = allResults.filter(r =>
    r.group.type === 'test' && r.group.patterns.includes(patternId)
  );

  if (testResults.length < 10) {
    // Not enough data yet
    return null;
  }

  // Calculate success rates
  const controlSuccess = controlResults.filter(r => r.achieved).length;
  const testSuccess = testResults.filter(r => r.achieved).length;

  const controlSuccessRate = controlResults.length > 0 ? controlSuccess / controlResults.length : 0;
  const testSuccessRate = testSuccess / testResults.length;

  // Effectiveness score: how much better is test vs control?
  const effectivenessScore = testSuccessRate - controlSuccessRate;

  // Calculate statistical significance (simple chi-square test)
  const significance = calculateStatisticalSignificance(
    controlSuccess,
    controlResults.length,
    testSuccess,
    testResults.length
  );

  // Wilson score interval for confidence
  const confidenceInterval = calculateWilsonInterval(testSuccess, testResults.length);

  return {
    patternId,
    controlSuccessRate,
    testSuccessRate,
    effectivenessScore,
    sampleSize: testResults.length,
    statisticalSignificance: significance.pValue < 0.05,
    confidenceInterval
  };
}

/**
 * Simple chi-square test for statistical significance
 */
function calculateStatisticalSignificance(
  controlSuccess: number,
  controlTotal: number,
  testSuccess: number,
  testTotal: number
): { pValue: number; chiSquare: number } {
  const controlFailure = controlTotal - controlSuccess;
  const testFailure = testTotal - testSuccess;

  // Expected values under null hypothesis
  const totalSuccess = controlSuccess + testSuccess;
  const totalFailure = controlFailure + testFailure;
  const total = controlTotal + testTotal;

  const expectedControlSuccess = (controlTotal * totalSuccess) / total;
  const expectedControlFailure = (controlTotal * totalFailure) / total;
  const expectedTestSuccess = (testTotal * totalSuccess) / total;
  const expectedTestFailure = (testTotal * totalFailure) / total;

  // Chi-square statistic
  const chiSquare =
    Math.pow(controlSuccess - expectedControlSuccess, 2) / expectedControlSuccess +
    Math.pow(controlFailure - expectedControlFailure, 2) / expectedControlFailure +
    Math.pow(testSuccess - expectedTestSuccess, 2) / expectedTestSuccess +
    Math.pow(testFailure - expectedTestFailure, 2) / expectedTestFailure;

  // Approximate p-value (1 degree of freedom)
  // Using simple approximation: p ≈ 1 - (1 - e^(-χ²/2))
  const pValue = 1 - (1 - Math.exp(-chiSquare / 2));

  return { pValue, chiSquare };
}

/**
 * Wilson score interval for confidence interval
 */
function calculateWilsonInterval(successes: number, total: number): [number, number] {
  const p = successes / total;
  const z = 1.96; // 95% confidence
  const denominator = 1 + (z * z) / total;

  const center = (p + (z * z) / (2 * total)) / denominator;
  const margin = (z * Math.sqrt((p * (1 - p)) / total + (z * z) / (4 * total * total))) / denominator;

  return [
    Math.max(0, center - margin),
    Math.min(1, center + margin)
  ];
}

/**
 * Get patterns that are provably effective (p < 0.05)
 */
export function getProvenEffectivePatterns(): string[] {
  const resultsFile = path.join(AB_TEST_DIR, 'results.json');

  if (!fs.existsSync(resultsFile)) {
    return [];
  }

  const allResults: ABTestResult[] = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));

  // Get all pattern IDs that have been tested
  const patternIds = new Set<string>();
  allResults.forEach(r => {
    if (r.group.type === 'test') {
      r.group.patterns.forEach(p => patternIds.add(p));
    }
  });

  // Filter to patterns with proven effectiveness
  const effectivePatterns = Array.from(patternIds)
    .map(id => ({ id, metrics: calculatePatternEffectiveness(id) }))
    .filter(p => p.metrics && p.metrics.statisticalSignificance && p.metrics.effectivenessScore > 0.1)
    .map(p => p.id);

  return effectivePatterns;
}

/**
 * Remove patterns that are provably harmful (p < 0.05, negative effectiveness)
 */
export function identifyHarmfulPatterns(): string[] {
  const resultsFile = path.join(AB_TEST_DIR, 'results.json');

  if (!fs.existsSync(resultsFile)) {
    return [];
  }

  const allResults: ABTestResult[] = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));

  const patternIds = new Set<string>();
  allResults.forEach(r => {
    if (r.group.type === 'test') {
      r.group.patterns.forEach(p => patternIds.add(p));
    }
  });

  const harmfulPatterns = Array.from(patternIds)
    .map(id => ({ id, metrics: calculatePatternEffectiveness(id) }))
    .filter(p => p.metrics && p.metrics.statisticalSignificance && p.metrics.effectivenessScore < -0.1)
    .map(p => p.id);

  return harmfulPatterns;
}

// ============================================================================
// 2. Semantic Pattern Clustering with Embeddings (100% consensus - CRITICAL)
// ============================================================================

export interface PatternCluster {
  clusterId: string;
  patterns: string[]; // Pattern IDs
  centroid: string; // Representative pattern text
  semantic_theme: string; // What this cluster is about
  size: number;
}

/**
 * Generate embedding for a pattern using OpenRouter
 * Falls back to simple TF-IDF if API unavailable
 */
export async function generatePatternEmbedding(
  pattern: string,
  openrouterKey?: string
): Promise<number[] | null> {
  const apiKey = openrouterKey || process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    // Fallback: simple TF-IDF representation
    return generateSimpleEmbedding(pattern);
  }

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
          'X-Title': 'BuildRunner Pattern Embedding',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-sonnet-4-20250514',
          messages: [{
            role: 'user',
            content: `Generate a semantic embedding vector (10 dimensions) for this pattern. Return only a JSON array of 10 numbers between -1 and 1 representing the semantic meaning:\n\n"${pattern}"`
          }],
          temperature: 0.1,
          max_tokens: 100
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        const statusCode = response.status;

        // Handle specific errors
        if (statusCode === 401) {
          console.error('❌ Embedding API error: Authentication failed (401). Check your OPENROUTER_API_KEY.');
          return generateSimpleEmbedding(pattern); // Fall back immediately
        } else if (statusCode === 429) {
          console.warn(`⚠️  Embedding API rate limited (429). Retrying attempt ${attempt}/${maxRetries}...`);
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
            continue;
          }
        } else if (statusCode === 400) {
          console.error(`❌ Embedding API error: Bad Request (400). ${errorText.substring(0, 200)}`);
          return generateSimpleEmbedding(pattern); // Fall back immediately
        } else {
          console.warn(`⚠️  Embedding API error (${statusCode}): ${errorText.substring(0, 200)}`);
        }

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
          continue;
        }

        console.warn('Embedding API failed after retries, using fallback');
        return generateSimpleEmbedding(pattern);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';

      // Extract JSON array
      const match = content.match(/\[[\s\S]*?\]/);
      if (match) {
        const embedding = JSON.parse(match[0]);
        if (Array.isArray(embedding) && embedding.length >= 10) {
          return embedding.slice(0, 10);
        }
      }

      return generateSimpleEmbedding(pattern);

    } catch (error) {
      console.error(`Failed to generate embedding (attempt ${attempt}/${maxRetries}):`, error);

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        continue;
      }

      return generateSimpleEmbedding(pattern);
    }
  }

  return generateSimpleEmbedding(pattern);
}

/**
 * Fallback: simple keyword-based embedding
 */
function generateSimpleEmbedding(pattern: string): number[] {
  const keywords = [
    'middleware', 'design-system', 'dependency', 'criticality', 'file-path',
    'authentication', 'database', 'api', 'architecture', 'naming'
  ];

  const embedding = keywords.map(keyword => {
    const count = (pattern.toLowerCase().match(new RegExp(keyword, 'g')) || []).length;
    return Math.min(1, count * 0.5);
  });

  return embedding;
}

/**
 * Calculate cosine similarity between two embeddings
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Cluster patterns by semantic similarity
 */
export async function clusterPatterns(
  patterns: LearnedPattern[],
  similarityThreshold: number = 0.8
): Promise<PatternCluster[]> {
  if (patterns.length === 0) return [];

  console.log(`🔬 Clustering ${patterns.length} patterns by semantic similarity...`);

  // Generate embeddings for all patterns
  const patternEmbeddings = await Promise.all(
    patterns.map(async p => ({
      pattern: p,
      embedding: await generatePatternEmbedding(p.pattern)
    }))
  );

  // Simple agglomerative clustering
  const clusters: PatternCluster[] = [];
  const assigned = new Set<string>();

  for (const { pattern: p1, embedding: e1 } of patternEmbeddings) {
    if (assigned.has(p1.id) || !e1) continue;

    // Start a new cluster
    const clusterPatterns = [p1.id];
    assigned.add(p1.id);

    // Find similar patterns
    for (const { pattern: p2, embedding: e2 } of patternEmbeddings) {
      if (assigned.has(p2.id) || !e2) continue;

      const similarity = cosineSimilarity(e1, e2);
      if (similarity >= similarityThreshold) {
        clusterPatterns.push(p2.id);
        assigned.add(p2.id);
      }
    }

    // Extract semantic theme
    const clusterTexts = patterns
      .filter(p => clusterPatterns.includes(p.id))
      .map(p => p.pattern);

    const theme = extractSemanticTheme(clusterTexts);

    clusters.push({
      clusterId: `cluster_${Date.now()}_${clusters.length}`,
      patterns: clusterPatterns,
      centroid: p1.pattern, // Use first pattern as representative
      semantic_theme: theme,
      size: clusterPatterns.length
    });
  }

  console.log(`✅ Created ${clusters.length} semantic clusters`);

  return clusters;
}

/**
 * Extract common theme from pattern cluster
 */
function extractSemanticTheme(patterns: string[]): string {
  // Simple keyword extraction
  const allWords = patterns.join(' ').toLowerCase().split(/\s+/);
  const wordCounts = new Map<string, number>();

  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'must', 'can', 'may', 'might']);

  allWords.forEach(word => {
    if (word.length > 3 && !stopWords.has(word)) {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }
  });

  // Get top 3 keywords
  const topKeywords = Array.from(wordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word);

  return topKeywords.join(', ') || 'general patterns';
}

/**
 * Merge duplicate patterns in the same cluster
 */
export function deduplicateClusteredPatterns(
  patterns: LearnedPattern[],
  clusters: PatternCluster[]
): LearnedPattern[] {
  const deduplicated: LearnedPattern[] = [];
  const processed = new Set<string>();

  clusters.forEach(cluster => {
    const clusterPatterns = patterns.filter(p => cluster.patterns.includes(p.id));

    if (clusterPatterns.length === 1) {
      deduplicated.push(clusterPatterns[0]);
      processed.add(clusterPatterns[0].id);
    } else {
      // Merge patterns in cluster
      const merged = mergeClusterPatterns(clusterPatterns, cluster.semantic_theme);
      deduplicated.push(merged);
      clusterPatterns.forEach(p => processed.add(p.id));
    }
  });

  // Add unclustered patterns
  patterns.forEach(p => {
    if (!processed.has(p.id)) {
      deduplicated.push(p);
    }
  });

  console.log(`📦 Deduplicated ${patterns.length} → ${deduplicated.length} patterns (${patterns.length - deduplicated.length} merged)`);

  return deduplicated;
}

function mergeClusterPatterns(patterns: LearnedPattern[], theme: string): LearnedPattern {
  // Take the pattern with highest confidence as base
  const best = patterns.reduce((a, b) => a.confidence > b.confidence ? a : b);

  return {
    ...best,
    pattern: `[${theme}] ${best.pattern}`,
    confidence: patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length,
    occurrences: patterns.reduce((sum, p) => sum + p.occurrences, 0),
    successRate: patterns.reduce((sum, p) => sum + p.successRate * p.occurrences, 0) /
                  patterns.reduce((sum, p) => sum + p.occurrences, 0),
    sources: [...new Set(patterns.flatMap(p => p.sources))],
    metadata: {
      ...best.metadata,
      mergedFrom: patterns.map(p => p.id),
      clusterTheme: theme
    }
  } as any;
}

// ============================================================================
// 3. Expanded Auto-Fix Capabilities (86% consensus - CRITICAL)
// ============================================================================

/**
 * AST-based code fixes using TypeScript compiler API
 * Placeholder - full implementation would use @typescript-eslint/parser
 */
export function fixWithAST(code: string, issue: string): string | null {
  // TODO: Implement AST transformation for:
  // - Naming conventions (camelCase, PascalCase)
  // - Import statement fixes
  // - Type definition additions
  // - API pattern corrections

  console.log('🔧 AST-based fix not yet implemented, issue:', issue);
  return null;
}

/**
 * Architectural fixes: milestone restructuring
 */
export function fixMilestoneArchitecture(plan: any): boolean {
  if (!plan.milestones || plan.milestones.length === 0) return false;

  let fixed = false;

  // Ensure first milestone is "Design System & Infrastructure"
  const firstMilestone = plan.milestones[0];
  const milestoneName = firstMilestone.name || '';
  if (!milestoneName.includes('Design System') && !milestoneName.includes('Infrastructure')) {
    firstMilestone.name = 'Design System & Infrastructure';
    fixed = true;
  }

  // Ensure design system component exists and is first
  const allComponents = plan.milestones.flatMap((m: any) => m.components || []);
  const designSystem = allComponents.find((c: any) =>
    c.id === 'design-system' || c.type === 'design-system' || c.description?.toLowerCase().includes('design system')
  );

  if (designSystem) {
    // Remove from current position
    plan.milestones.forEach((m: any) => {
      if (m.components) {
        m.components = m.components.filter((c: any) => c.id !== designSystem.id);
      }
    });

    // Add to first position of first milestone
    if (!firstMilestone.components) {
      firstMilestone.components = [];
    }
    firstMilestone.components.unshift(designSystem);
    fixed = true;
  }

  return fixed;
}

/**
 * Split overly complex components
 */
export function splitComplexComponents(plan: any, maxComplexity: number = 300): boolean {
  if (!plan.milestones) return false;

  let fixed = false;

  plan.milestones.forEach((milestone: any) => {
    const componentsToSplit: any[] = [];

    milestone.components?.forEach((component: any) => {
      // Estimate complexity from description length
      const complexity = (component.description || '').length;

      if (complexity > maxComplexity) {
        componentsToSplit.push(component);
      }
    });

    componentsToSplit.forEach(complex => {
      // Simple split: create a base and helper component
      const baseComponent = { ...complex };
      const helperComponent = {
        ...complex,
        id: `${complex.id}-helper`,
        name: `${complex.name} Helper Functions`,
        description: `Helper utilities for ${complex.name}`,
        filePath: complex.filePath.replace('.ts', '-helpers.ts'),
        dependencies: [complex.id]
      };

      // Remove complex component and add split components
      const index = milestone.components.indexOf(complex);
      milestone.components.splice(index, 1, baseComponent, helperComponent);

      fixed = true;
    });
  });

  if (fixed) {
    console.log('🔨 Split complex components into smaller units');
  }

  return fixed;
}

// ============================================================================
// 4. Dynamic Few-Shot Example Selection (71% consensus - HIGH)
// ============================================================================

/**
 * Select most relevant few-shot examples using semantic similarity
 */
export async function selectRelevantExamples(
  currentContext: string,
  allExamples: FewShotExample[],
  count: number = 3
): Promise<FewShotExample[]> {
  if (allExamples.length === 0) return [];

  // Generate embedding for current context
  const contextEmbedding = await generatePatternEmbedding(currentContext);
  if (!contextEmbedding) {
    // Fallback to random selection
    return allExamples.slice(0, count);
  }

  // Score each example by similarity
  const scoredExamples = await Promise.all(
    allExamples.map(async example => {
      const exampleText = JSON.stringify(example.planStructure);
      const exampleEmbedding = await generatePatternEmbedding(exampleText);

      const similarity = exampleEmbedding ?
        cosineSimilarity(contextEmbedding, exampleEmbedding) : 0;

      return { example, similarity };
    })
  );

  // Sort by similarity and take top N
  scoredExamples.sort((a, b) => b.similarity - a.similarity);

  return scoredExamples.slice(0, count).map(s => s.example);
}

// ============================================================================
// 5. Pattern Validation & Conflict Detection (71% consensus - HIGH)
// ============================================================================

export interface PatternConflict {
  pattern1: LearnedPattern;
  pattern2: LearnedPattern;
  conflictType: 'contradiction' | 'overlap' | 'obsolescence';
  severity: 'high' | 'medium' | 'low';
  recommendation: string;
}

/**
 * Check if a new pattern conflicts with existing patterns
 */
export async function validatePattern(
  newPattern: LearnedPattern,
  existingPatterns: LearnedPattern[]
): Promise<PatternConflict[]> {
  const conflicts: PatternConflict[] = [];

  for (const existing of existingPatterns) {
    // Check for contradictions
    if (detectContradiction(newPattern, existing)) {
      conflicts.push({
        pattern1: newPattern,
        pattern2: existing,
        conflictType: 'contradiction',
        severity: 'high',
        recommendation: `Resolve contradiction between patterns before adding new pattern`
      });
    }

    // Check for significant overlap
    if (await detectOverlap(newPattern, existing)) {
      conflicts.push({
        pattern1: newPattern,
        pattern2: existing,
        conflictType: 'overlap',
        severity: 'medium',
        recommendation: `Consider merging similar patterns to reduce redundancy`
      });
    }

    // Check if new pattern makes old one obsolete
    if (detectObsolescence(newPattern, existing)) {
      conflicts.push({
        pattern1: newPattern,
        pattern2: existing,
        conflictType: 'obsolescence',
        severity: 'low',
        recommendation: `Archive obsolete pattern: ${existing.id}`
      });
    }
  }

  return conflicts;
}

/**
 * Detect contradictory patterns (e.g., "MUST use X" vs "NEVER use X")
 */
function detectContradiction(p1: LearnedPattern, p2: LearnedPattern): boolean {
  const text1 = p1.pattern.toLowerCase();
  const text2 = p2.pattern.toLowerCase();

  // Look for opposing directives
  const hasMust1 = /\bmust\b|\balways\b/.test(text1);
  const hasNever1 = /\bnever\b|\bavoid\b|\bdon't\b/.test(text1);
  const hasMust2 = /\bmust\b|\balways\b/.test(text2);
  const hasNever2 = /\bnever\b|\bavoid\b|\bdon't\b/.test(text2);

  // Check for same subject matter
  const extractKeywords = (text: string) =>
    text.match(/\b\w{4,}\b/g)?.slice(0, 5) || [];

  const keywords1 = new Set(extractKeywords(text1));
  const keywords2 = new Set(extractKeywords(text2));

  const overlap = Array.from(keywords1).filter(k => keywords2.has(k)).length;

  // If they talk about the same thing but with opposite directives
  return overlap >= 2 && ((hasMust1 && hasNever2) || (hasNever1 && hasMust2));
}

/**
 * Detect overlapping patterns (high semantic similarity)
 */
async function detectOverlap(p1: LearnedPattern, p2: LearnedPattern): Promise<boolean> {
  const e1 = await generatePatternEmbedding(p1.pattern);
  const e2 = await generatePatternEmbedding(p2.pattern);

  if (!e1 || !e2) return false;

  const similarity = cosineSimilarity(e1, e2);

  return similarity > 0.9; // 90% similar
}

/**
 * Detect if new pattern makes old one obsolete
 */
function detectObsolescence(newer: LearnedPattern, older: LearnedPattern): boolean {
  // If newer pattern has much better metrics and covers similar ground
  const newerBetter =
    newer.confidence > older.confidence + 20 &&
    newer.successRate > older.successRate + 20;

  const newerDate = new Date(newer.firstSeen).getTime();
  const olderDate = new Date(older.firstSeen).getTime();
  const ageGap = newerDate - olderDate;

  // Newer pattern is at least 7 days newer and much better
  return newerBetter && ageGap > 7 * 24 * 60 * 60 * 1000;
}

/**
 * Archive obsolete or harmful patterns
 */
export function archivePatterns(
  patternIds: string[],
  reason: 'obsolete' | 'harmful' | 'conflicting'
): void {
  const archiveDir = path.join(process.cwd(), 'lib/learned-patterns/archived');
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }

  const archiveFile = path.join(archiveDir, `${reason}.json`);
  let archived: any[] = [];

  if (fs.existsSync(archiveFile)) {
    archived = JSON.parse(fs.readFileSync(archiveFile, 'utf8'));
  }

  archived.push({
    patternIds,
    reason,
    timestamp: new Date().toISOString()
  });

  fs.writeFileSync(archiveFile, JSON.stringify(archived, null, 2));

  console.log(`🗄️  Archived ${patternIds.length} patterns (reason: ${reason})`);
}

// ============================================================================
// Orchestration: Combine All Phase 3 Improvements
// ============================================================================

/**
 * Run full Phase 3 enhancement pipeline
 */
export async function enhanceLearnedPatterns(patterns: LearnedPattern[]): Promise<LearnedPattern[]> {
  console.log('🚀 Running Phase 3 pattern enhancement pipeline...');

  // Step 1: Remove provably harmful patterns
  const harmful = identifyHarmfulPatterns();
  if (harmful.length > 0) {
    console.log(`⚠️  Removing ${harmful.length} provably harmful patterns`);
    archivePatterns(harmful, 'harmful');
    patterns = patterns.filter(p => !harmful.includes(p.id));
  }

  // Step 2: Cluster patterns semantically
  const clusters = await clusterPatterns(patterns, 0.85);

  // Step 3: Deduplicate within clusters
  patterns = deduplicateClusteredPatterns(patterns, clusters);

  // Step 4: Validate for conflicts
  const allConflicts: PatternConflict[] = [];
  for (let i = 0; i < patterns.length; i++) {
    const conflicts = await validatePattern(patterns[i], patterns.slice(0, i));
    allConflicts.push(...conflicts);
  }

  if (allConflicts.length > 0) {
    console.log(`⚠️  Found ${allConflicts.length} pattern conflicts`);

    // Archive high-severity conflicts
    const highSeverity = allConflicts.filter(c => c.severity === 'high');
    if (highSeverity.length > 0) {
      const conflictingIds = highSeverity.map(c => c.pattern2.id);
      archivePatterns(conflictingIds, 'conflicting');
      patterns = patterns.filter(p => !conflictingIds.includes(p.id));
    }
  }

  // Step 5: Weight by proven effectiveness
  const effectivePatterns = getProvenEffectivePatterns();
  patterns = patterns.map(p => {
    if (effectivePatterns.includes(p.id)) {
      const metrics = calculatePatternEffectiveness(p.id);
      if (metrics) {
        return {
          ...p,
          confidence: Math.min(100, p.confidence * (1 + metrics.effectivenessScore)),
          metadata: {
            ...p.metadata,
            abTestProven: true,
            effectivenessScore: metrics.effectivenessScore
          }
        } as any;
      }
    }
    return p;
  });

  console.log(`✅ Phase 3 enhancement complete: ${patterns.length} high-quality patterns`);

  return patterns;
}
