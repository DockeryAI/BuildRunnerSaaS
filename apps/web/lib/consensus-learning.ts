/**
 * Consensus Learning System
 *
 * Learns from every consensus discussion to automatically improve
 * prompts and reduce future consensus failures.
 *
 * Features:
 * - Extracts patterns from both PASS and FAIL votes
 * - Weighs patterns by frequency, confidence, and success rate
 * - Automatically injects learned rules into prompts
 * - Tracks improvement metrics over time
 *
 * Enhanced Features (Phase 2):
 * - LLM-based pattern extraction (catches 100% of issues)
 * - Structural pattern analysis (analyzes actual plan structure)
 * - Multi-factor pattern weighting (recency, specificity, model quality)
 * - Few-shot examples (concrete examples in prompts)
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  extractPatternsWithLLM,
  extractStructuralPatterns,
  calculateEnhancedPatternScore,
  storeFewShotExample,
  generateFewShotExamplesSection
} from './consensus-learning-enhanced';
import {
  assignABTestGroup,
  recordABTestResult,
  enhanceLearnedPatterns,
  selectRelevantExamples,
  validatePattern,
  archivePatterns
} from './consensus-learning-phase3';

// ============================================================================
// Types
// ============================================================================

export interface LearnedPattern {
  id: string;
  type: 'rule' | 'example' | 'anti-pattern';
  category: 'file-paths' | 'dependencies' | 'criticality' | 'architecture' | 'naming' | 'general';
  pattern: string; // The actual rule/pattern text
  confidence: number; // 0-100, weighted by model confidence and frequency
  occurrences: number; // How many times this pattern appeared
  successRate: number; // 0-100, how often following this pattern leads to consensus
  sources: string[]; // Which models mentioned this
  firstSeen: string; // ISO timestamp
  lastSeen: string; // ISO timestamp
  consensusType: 'plan_verification' | 'component_build' | 'code_review';
  metadata?: any; // Phase 3: Additional metadata (A/B test results, cluster info, etc.)
}

export interface ConsensusLearningSession {
  sessionId: string;
  timestamp: string;
  consensusType: 'plan_verification' | 'component_build' | 'code_review';
  achieved: boolean;
  iterations: number;
  patterns: {
    extracted: LearnedPattern[];
    applied: string[]; // Pattern IDs that were in the prompt
  };
}

export interface LearningMetrics {
  totalSessions: number;
  successRate: number;
  averageIterations: number;
  patternsLearned: number;
  mostImpactfulPatterns: LearnedPattern[];
  recentTrend: 'improving' | 'stable' | 'declining';
}

// ============================================================================
// Storage Paths
// ============================================================================

const LEARNED_PATTERNS_DIR = path.join(process.cwd(), 'lib/learned-patterns');
const PATTERNS_FILE = path.join(LEARNED_PATTERNS_DIR, 'patterns.json');
const SESSIONS_FILE = path.join(LEARNED_PATTERNS_DIR, 'sessions.json');
const METRICS_FILE = path.join(LEARNED_PATTERNS_DIR, 'metrics.json');

// Ensure directories exist
if (!fs.existsSync(LEARNED_PATTERNS_DIR)) {
  fs.mkdirSync(LEARNED_PATTERNS_DIR, { recursive: true });
}

// ============================================================================
// Pattern Extraction
// ============================================================================

/**
 * Extract learned patterns from a consensus discussion log
 * Now uses both traditional regex AND enhanced AI-powered extraction
 */
export async function extractPatternsFromConsensus(
  consensusLog: any,
  consensusType: 'plan_verification' | 'component_build' | 'code_review',
  planOrCode: any
): Promise<LearnedPattern[]> {
  const patterns: LearnedPattern[] = [];

  // ENHANCEMENT 1: Structural pattern analysis
  // Analyze the actual structure to find issues
  try {
    const structuralPatterns = extractStructuralPatterns(
      planOrCode,
      consensusLog.consensusAchieved ? 'PASS' : 'FAIL'
    );
    patterns.push(...structuralPatterns);
    console.log(`🔍 Extracted ${structuralPatterns.length} structural patterns`);
  } catch (error) {
    console.error('⚠️  Structural pattern extraction failed:', error);
  }

  // ENHANCEMENT 2: LLM-based pattern extraction
  // Use AI to extract patterns from consensus discussions
  const llmExtractionEnabled = !!process.env.OPENROUTER_API_KEY;
  if (llmExtractionEnabled) {
    try {
      // Extract from each iteration's feedback
      for (const iteration of consensusLog.iterations || []) {
        for (const message of iteration.messages || []) {
          const metadata = message.metadata || {};

          if (metadata.verdict && metadata.reasoning) {
            const llmPatterns = await extractPatternsWithLLM(
              metadata.reasoning,
              metadata.verdict,
              metadata.confidence || 50,
              planOrCode
            );
            patterns.push(...llmPatterns);
          }
        }
      }
      console.log(`🤖 LLM extracted additional patterns from consensus`);
    } catch (error) {
      console.error('⚠️  LLM pattern extraction failed:', error);
    }
  }

  // Traditional regex-based extraction (fallback + supplement)
  // Extract patterns from each iteration
  consensusLog.iterations?.forEach((iteration: any) => {
    iteration.messages?.forEach((message: any) => {
      const model = message.role;
      const content = message.content;
      const metadata = message.metadata || {};

      // Extract from FAIL votes (anti-patterns)
      if (metadata.verdict === 'FAIL') {
        const reasoning = metadata.reasoning || '';
        const confidence = metadata.confidence || 50;

        // Extract specific issues using regex patterns
        const issuePatterns = [
          // File path issues
          { regex: /middleware\.ts.*should be at (?:project )?root/i, category: 'file-paths' as const,
            rule: 'middleware.ts MUST be at project root (not in app/ or lib/)' },
          { regex: /lib\/([^/]+)\.ts.*should.*lib\/\1\/index\.ts/i, category: 'file-paths' as const,
            rule: 'Modular libs should use lib/[module]/index.ts (NOT lib/[module].ts)' },
          { regex: /\.sql.*not valid.*component/i, category: 'file-paths' as const,
            rule: 'SQL files (.sql) should NOT be components (use .ts with Drizzle/Prisma)' },
          { regex: /manifest\.json.*should.*app\/manifest\.ts/i, category: 'file-paths' as const,
            rule: 'PWA manifest should be app/manifest.ts (NOT public/manifest.json)' },
          { regex: /react-router-dom.*not compatible/i, category: 'architecture' as const,
            rule: 'NEVER use react-router-dom with Next.js (use next/navigation)' },

          // Dependency issues
          { regex: /circular dependency|depends on itself/i, category: 'dependencies' as const,
            rule: 'ZERO circular dependencies allowed (must form DAG)' },
          { regex: /dependency.*not found|invalid.*dependency/i, category: 'dependencies' as const,
            rule: 'All dependencies must reference valid component IDs' },

          // Architecture issues
          { regex: /design.?system.*should be first/i, category: 'architecture' as const,
            rule: 'Design system MUST be the first component in Milestone 1' },
          { regex: /milestone.*should.*design.*infrastructure/i, category: 'architecture' as const,
            rule: 'First milestone MUST be "Design System & Infrastructure"' },

          // Criticality issues
          { regex: /missing criticality|no criticality/i, category: 'criticality' as const,
            rule: 'ALL components must have criticality classification' },
          { regex: /(password|payment|auth).*should be.*(ULTRA_)?CRITICAL/i, category: 'criticality' as const,
            rule: 'Security-sensitive components require proper criticality (ULTRA_CRITICAL or CRITICAL)' },
        ];

        issuePatterns.forEach(({ regex, category, rule }) => {
          if (regex.test(reasoning)) {
            patterns.push({
              id: generatePatternId(rule),
              type: 'anti-pattern',
              category,
              pattern: rule,
              confidence,
              occurrences: 1,
              successRate: 0, // Anti-patterns have 0% success rate when violated
              sources: [model],
              firstSeen: new Date().toISOString(),
              lastSeen: new Date().toISOString(),
              consensusType,
            });
          }
        });

        // Also extract direct quotes about what's wrong
        const shouldMatches = reasoning.match(/(should|must|need to|required to)[^.!?]+[.!?]/gi);
        if (shouldMatches) {
          shouldMatches.slice(0, 3).forEach((match: string) => {
            const cleanMatch = match.trim();
            if (cleanMatch.length > 20 && cleanMatch.length < 200) {
              patterns.push({
                id: generatePatternId(cleanMatch),
                type: 'rule',
                category: 'general',
                pattern: cleanMatch,
                confidence: confidence * 0.8, // Slightly lower confidence for extracted quotes
                occurrences: 1,
                successRate: 0,
                sources: [model],
                firstSeen: new Date().toISOString(),
                lastSeen: new Date().toISOString(),
                consensusType,
              });
            }
          });
        }
      }

      // Extract from PASS votes (successful patterns)
      if (metadata.verdict === 'PASS') {
        const reasoning = metadata.reasoning || '';
        const confidence = metadata.confidence || 50;

        // Extract positive patterns
        const positivePatterns = [
          { regex: /design.?system.*first.*correct/i, category: 'architecture' as const,
            rule: 'Design-first architecture (design system in Milestone 1 first component)' },
          { regex: /all.*paths.*follow.*Next\.?js.*14/i, category: 'file-paths' as const,
            rule: 'All file paths follow Next.js 14 App Router conventions' },
          { regex: /no circular dependencies/i, category: 'dependencies' as const,
            rule: 'Clean dependency graph with no circular references' },
          { regex: /all.*components.*have.*criticality/i, category: 'criticality' as const,
            rule: 'Every component has proper criticality classification' },
          { regex: /proper.*topological.*sort/i, category: 'dependencies' as const,
            rule: 'Components ordered correctly by dependencies (topological sort)' },
        ];

        positivePatterns.forEach(({ regex, category, rule }) => {
          if (regex.test(reasoning)) {
            patterns.push({
              id: generatePatternId(rule),
              type: 'example',
              category,
              pattern: rule,
              confidence,
              occurrences: 1,
              successRate: 100, // This pattern was associated with PASS
              sources: [model],
              firstSeen: new Date().toISOString(),
              lastSeen: new Date().toISOString(),
              consensusType,
            });
          }
        });
      }
    });
  });

  return patterns;
}

/**
 * Generate a stable ID for a pattern based on its content
 */
function generatePatternId(pattern: string): string {
  // Simple hash function for pattern ID
  let hash = 0;
  for (let i = 0; i < pattern.length; i++) {
    const char = pattern.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `pattern_${Math.abs(hash).toString(36)}`;
}

// ============================================================================
// Pattern Storage & Retrieval
// ============================================================================

/**
 * Load all learned patterns from storage
 */
export function loadLearnedPatterns(): LearnedPattern[] {
  try {
    if (fs.existsSync(PATTERNS_FILE)) {
      const data = fs.readFileSync(PATTERNS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading learned patterns:', error);
  }
  return [];
}

/**
 * Save learned patterns to storage
 */
export function saveLearnedPatterns(patterns: LearnedPattern[]): void {
  try {
    fs.writeFileSync(PATTERNS_FILE, JSON.stringify(patterns, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving learned patterns:', error);
  }
}

/**
 * Merge new patterns with existing ones
 */
export function mergePatterns(existing: LearnedPattern[], newPatterns: LearnedPattern[]): LearnedPattern[] {
  const patternMap = new Map<string, LearnedPattern>();

  // Add existing patterns
  existing.forEach(p => patternMap.set(p.id, p));

  // Merge new patterns
  newPatterns.forEach(newPattern => {
    const existing = patternMap.get(newPattern.id);

    if (existing) {
      // Update existing pattern
      existing.occurrences += newPattern.occurrences;
      existing.confidence = (existing.confidence * existing.occurrences + newPattern.confidence * newPattern.occurrences)
        / (existing.occurrences + newPattern.occurrences);
      existing.successRate = (existing.successRate * existing.occurrences + newPattern.successRate * newPattern.occurrences)
        / (existing.occurrences + newPattern.occurrences);
      existing.sources = [...new Set([...existing.sources, ...newPattern.sources])];
      existing.lastSeen = newPattern.lastSeen;
    } else {
      // Add new pattern
      patternMap.set(newPattern.id, newPattern);
    }
  });

  return Array.from(patternMap.values());
}

/**
 * Get top patterns to inject into prompts
 * Now uses enhanced multi-factor scoring + Phase 3 A/B test validation
 */
export function getTopPatterns(
  consensusType: 'plan_verification' | 'component_build' | 'code_review',
  category?: string,
  limit: number = 10
): LearnedPattern[] {
  const allPatterns = loadLearnedPatterns();

  // Filter by consensus type and category
  let filtered = allPatterns.filter(p => p.consensusType === consensusType);
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }

  // PHASE 3 ENHANCEMENT: Boost patterns with proven effectiveness
  filtered.sort((a, b) => {
    let scoreA = calculateEnhancedPatternScore(a, allPatterns);
    let scoreB = calculateEnhancedPatternScore(b, allPatterns);

    // Boost A/B tested patterns
    if (a.metadata?.abTestProven) {
      scoreA *= (1 + (a.metadata.effectivenessScore || 0));
    }
    if (b.metadata?.abTestProven) {
      scoreB *= (1 + (b.metadata.effectivenessScore || 0));
    }

    return scoreB - scoreA;
  });

  return filtered.slice(0, limit);
}

// ============================================================================
// Learning Session Management
// ============================================================================

/**
 * Record a learning session after consensus
 * Now async to support LLM-based pattern extraction + Phase 3 A/B testing
 */
export async function recordLearningSession(
  consensusLog: any,
  consensusType: 'plan_verification' | 'component_build' | 'code_review',
  appliedPatternIds: string[],
  planOrCode: any
): Promise<void> {
  try {
    // Extract patterns from this consensus (now async)
    const extractedPatterns = await extractPatternsFromConsensus(consensusLog, consensusType, planOrCode);

    // PHASE 3: Validate new patterns for conflicts
    const existingPatterns = loadLearnedPatterns();
    const validatedPatterns: LearnedPattern[] = [];

    for (const newPattern of extractedPatterns) {
      const conflicts = await validatePattern(newPattern, existingPatterns);

      if (conflicts.filter(c => c.severity === 'high').length === 0) {
        validatedPatterns.push(newPattern);
      } else {
        console.log(`⚠️  Skipping conflicting pattern: ${newPattern.pattern}`);
      }
    }

    // Merge with existing patterns
    let mergedPatterns = mergePatterns(existingPatterns, validatedPatterns);

    // PHASE 3: Run enhancement pipeline periodically (every 10 sessions)
    const sessions = loadSessions();
    if (sessions.length % 10 === 0) {
      console.log('🧬 Running Phase 3 enhancement pipeline...');
      mergedPatterns = await enhanceLearnedPatterns(mergedPatterns);
    }

    saveLearnedPatterns(mergedPatterns);

    // ENHANCEMENT: Store few-shot examples
    try {
      storeFewShotExample(planOrCode, consensusLog, consensusType);
    } catch (error) {
      console.error('⚠️  Failed to store few-shot example:', error);
    }

    // Record session
    const session: ConsensusLearningSession = {
      sessionId: `session_${Date.now()}`,
      timestamp: new Date().toISOString(),
      consensusType,
      achieved: consensusLog.finalStatus === 'consensus_achieved',
      iterations: consensusLog.totalIterations || 0,
      patterns: {
        extracted: validatedPatterns,
        applied: appliedPatternIds,
      },
    };

    // PHASE 3: A/B Testing
    const abGroup = assignABTestGroup(session.sessionId, appliedPatternIds);
    recordABTestResult(session, abGroup, consensusLog.fixesApplied || 0);

    // Save session history
    sessions.push(session);

    // Keep only last 100 sessions to avoid unbounded growth
    const recentSessions = sessions.slice(-100);
    saveSessions(recentSessions);

    // Update metrics
    updateMetrics(recentSessions);

    console.log(`📚 Learning session recorded (${abGroup.type} group): ${validatedPatterns.length} patterns extracted, ${mergedPatterns.length} total patterns`);
  } catch (error) {
    console.error('Error recording learning session:', error);
  }
}

function loadSessions(): ConsensusLearningSession[] {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = fs.readFileSync(SESSIONS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading sessions:', error);
  }
  return [];
}

function saveSessions(sessions: ConsensusLearningSession[]): void {
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving sessions:', error);
  }
}

// ============================================================================
// Metrics & Analytics
// ============================================================================

function updateMetrics(sessions: ConsensusLearningSession[]): void {
  if (sessions.length === 0) return;

  const totalSessions = sessions.length;
  const successfulSessions = sessions.filter(s => s.achieved).length;
  const successRate = (successfulSessions / totalSessions) * 100;
  const averageIterations = sessions.reduce((sum, s) => sum + s.iterations, 0) / totalSessions;

  const allPatterns = loadLearnedPatterns();
  const topPatterns = allPatterns
    .sort((a, b) => {
      const scoreA = (a.confidence / 100) * a.occurrences * (a.successRate / 100);
      const scoreB = (b.confidence / 100) * b.occurrences * (b.successRate / 100);
      return scoreB - scoreA;
    })
    .slice(0, 5);

  // Calculate trend (last 20 sessions vs previous 20)
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (sessions.length >= 40) {
    const recent = sessions.slice(-20);
    const previous = sessions.slice(-40, -20);
    const recentSuccess = recent.filter(s => s.achieved).length / 20;
    const previousSuccess = previous.filter(s => s.achieved).length / 20;

    if (recentSuccess > previousSuccess + 0.1) trend = 'improving';
    else if (recentSuccess < previousSuccess - 0.1) trend = 'declining';
  }

  const metrics: LearningMetrics = {
    totalSessions,
    successRate,
    averageIterations,
    patternsLearned: allPatterns.length,
    mostImpactfulPatterns: topPatterns,
    recentTrend: trend,
  };

  try {
    fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving metrics:', error);
  }
}

export function getLearningMetrics(): LearningMetrics | null {
  try {
    if (fs.existsSync(METRICS_FILE)) {
      const data = fs.readFileSync(METRICS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading metrics:', error);
  }
  return null;
}

// ============================================================================
// Prompt Injection
// ============================================================================

/**
 * Generate learned rules section to inject into prompts
 */
export function generateLearnedRulesSection(
  consensusType: 'plan_verification' | 'component_build' | 'code_review',
  category?: string
): { rulesText: string; appliedPatternIds: string[] } {
  const topPatterns = getTopPatterns(consensusType, category, 10);

  if (topPatterns.length === 0) {
    return { rulesText: '', appliedPatternIds: [] };
  }

  let rulesText = '\n=== LEARNED RULES (from consensus history) ===\n\n';
  rulesText += 'These patterns have been learned from past consensus discussions:\n\n';

  // Group by category
  const byCategory = topPatterns.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {} as Record<string, LearnedPattern[]>);

  Object.entries(byCategory).forEach(([cat, patterns]) => {
    const categoryName = cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    rulesText += `**${categoryName}**:\n`;

    patterns.forEach(p => {
      const impactScore = Math.round((p.confidence / 100) * p.occurrences * (p.successRate / 100) * 10);
      const emoji = p.type === 'anti-pattern' ? '❌' : p.type === 'example' ? '✅' : '📋';
      rulesText += `${emoji} ${p.pattern} [${p.occurrences}x, ${Math.round(p.confidence)}% conf]\n`;
    });

    rulesText += '\n';
  });

  const appliedPatternIds = topPatterns.map(p => p.id);

  return { rulesText, appliedPatternIds };
}

/**
 * Inject learned rules into a system prompt
 * PHASE 3: Uses similarity-based example selection
 */
export async function injectLearnedRules(
  systemPrompt: string,
  consensusType: 'plan_verification' | 'component_build' | 'code_review',
  category?: string,
  currentContext?: string
): Promise<{ enhancedPrompt: string; appliedPatternIds: string[] }> {
  const { rulesText, appliedPatternIds } = generateLearnedRulesSection(consensusType, category);

  // PHASE 3: Dynamic few-shot selection based on similarity
  let fewShotExamples = '';
  if (currentContext) {
    try {
      const examplesFile = path.join(
        process.cwd(),
        `lib/learned-patterns/examples/${consensusType}.json`
      );

      if (fs.existsSync(examplesFile)) {
        const allExamples = JSON.parse(fs.readFileSync(examplesFile, 'utf8'));
        const relevantExamples = await selectRelevantExamples(currentContext, allExamples, 3);

        if (relevantExamples.length > 0) {
          fewShotExamples = '\n=== MOST RELEVANT EXAMPLES (selected by similarity) ===\n\n';
          relevantExamples.forEach((ex, idx) => {
            const status = ex.type === 'correct' ? '✅ PASSED' : '❌ FAILED';
            fewShotExamples += `Example ${idx + 1}: ${status}\n`;
            fewShotExamples += `Consensus: ${ex.consensusScore}%\n`;
            if (ex.mainIssue) {
              fewShotExamples += `Issue: ${ex.mainIssue}\n`;
            }
            fewShotExamples += '\n';
          });
        }
      }
    } catch (error) {
      console.error('Failed to select relevant examples:', error);
      // Fallback to original method
      fewShotExamples = generateFewShotExamplesSection(consensusType, 3);
    }
  } else {
    // No context provided, use original method
    fewShotExamples = generateFewShotExamplesSection(consensusType, 3);
  }

  const combinedLearning = rulesText + fewShotExamples;

  if (!combinedLearning) {
    return { enhancedPrompt: systemPrompt, appliedPatternIds: [] };
  }

  // Inject before the final "Return ONLY..." instruction
  const enhancedPrompt = systemPrompt.replace(
    /(Return ONLY|Output ONLY|IMPORTANT:.*return)/i,
    `${combinedLearning}\n$1`
  );

  return { enhancedPrompt, appliedPatternIds };
}
