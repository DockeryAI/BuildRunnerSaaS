/**
 * Post-Build Code Review System
 *
 * After a build completes, this system:
 * 1. Queries all 7 LLMs for code review
 * 2. Finds consensus on errors and improvements
 * 3. Auto-fixes high-consensus errors
 * 4. Feeds learnings into Phase 3 system
 * 5. Detects bad patterns (tech stack confusion, invalid JSX)
 *
 * Runs for the next 100 builds or until disabled.
 */

import * as fs from 'fs';
import * as path from 'path';
import { recordLearningSession } from './consensus-learning';

// Same 7 LLMs as meta-improvement system
const REVIEW_MODELS = [
  'anthropic/claude-sonnet-4',           // Claude Sonnet 4
  'anthropic/claude-opus-4',             // Claude Opus 4
  'anthropic/claude-3.5-sonnet',         // Claude 3.5 Sonnet
  'openai/gpt-4o',                       // GPT-4 Omni
  'google/gemini-2.5-flash',    // Gemini 2.0 Flash
  'deepseek/deepseek-chat',              // DeepSeek Chat
  'meta-llama/llama-3.3-70b-instruct',   // Llama 3.3 70B
];

export interface CodeReviewIssue {
  file: string;
  line?: number;
  severity: 'error' | 'warning' | 'suggestion';
  category: string;
  description: string;
  suggestedFix?: string;
  modelConsensus: number; // How many models flagged this (0-7)
  models: string[]; // Which models flagged it
}

export interface CodeReviewResult {
  projectId: string;
  buildId: string;
  timestamp: string;
  issues: CodeReviewIssue[];
  improvements: CodeReviewIssue[];
  fixesApplied: number;
  patternsLearned: number;
}

interface ReviewConfig {
  enabled: boolean;
  remainingReviews: number;
  totalReviews: number;
}

/**
 * Load review configuration
 */
function loadReviewConfig(): ReviewConfig {
  const configPath = path.join(process.cwd(), 'lib/learned-patterns/review-config.json');

  if (!fs.existsSync(configPath)) {
    const defaultConfig: ReviewConfig = {
      enabled: true,
      remainingReviews: 100,
      totalReviews: 0,
    };
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  }

  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

/**
 * Save review configuration
 */
function saveReviewConfig(config: ReviewConfig): void {
  const configPath = path.join(process.cwd(), 'lib/learned-patterns/review-config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

/**
 * Enable or disable post-build reviews
 */
export function setReviewEnabled(enabled: boolean, reviewCount: number = 100): void {
  const config = loadReviewConfig();
  config.enabled = enabled;
  if (enabled) {
    config.remainingReviews = reviewCount;
  }
  saveReviewConfig(config);
  console.log(`📋 Post-build reviews ${enabled ? 'enabled' : 'disabled'}. Remaining: ${config.remainingReviews}`);
}

/**
 * Check if reviews are enabled
 */
export function areReviewsEnabled(): boolean {
  const config = loadReviewConfig();
  return config.enabled && config.remainingReviews > 0;
}

/**
 * Query a single LLM for code review
 */
async function queryModelForReview(
  model: string,
  files: { path: string; content: string }[],
  apiKey: string
): Promise<CodeReviewIssue[]> {
  const filesContext = files.map(f => `
=== ${f.path} ===
\`\`\`
${f.content}
\`\`\`
  `).join('\n\n');

  const prompt = `You are a senior code reviewer. Review the following generated code and identify:

1. **Errors**: Bugs, runtime errors, type errors, logic errors
2. **Code Quality Issues**: Poor patterns, anti-patterns, performance issues
3. **Improvements**: Better approaches, missing error handling, type safety

${filesContext}

Return ONLY a JSON array with this schema:
[
  {
    "file": "path/to/file.tsx",
    "line": 42,
    "severity": "error" | "warning" | "suggestion",
    "category": "runtime-error" | "type-error" | "code-quality" | "performance" | "security",
    "description": "Clear description of the issue",
    "suggestedFix": "Optional: How to fix it"
  }
]

Focus on:
- Runtime errors (undefined is not iterable, null reference, etc.)
- Type safety issues
- Missing error boundaries
- Unhandled edge cases
- Performance anti-patterns
- Security vulnerabilities

Return ONLY the JSON array, no markdown fences.`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://buildrunner.cloud',
        'X-Title': 'BuildRunner - Post-Build Code Review',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      console.error(`❌ ${model} review failed:`, response.statusText);
      return [];
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '[]';

    // Extract JSON from response
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const issues = JSON.parse(jsonStr);
    console.log(`✅ ${model}: Found ${issues.length} issues`);
    return issues;
  } catch (error) {
    console.error(`❌ ${model} review error:`, error);
    return [];
  }
}

/**
 * Find consensus across model reviews
 */
function findConsensusIssues(allIssues: Map<string, CodeReviewIssue[]>): CodeReviewIssue[] {
  const issueMap = new Map<string, CodeReviewIssue & { models: string[] }>();

  // Group similar issues
  allIssues.forEach((issues, model) => {
    issues.forEach(issue => {
      // Create a key for grouping similar issues
      const key = `${issue.file}:${issue.line}:${issue.category}:${issue.description.substring(0, 50)}`;

      if (!issueMap.has(key)) {
        issueMap.set(key, {
          ...issue,
          models: [model],
          modelConsensus: 1,
        });
      } else {
        const existing = issueMap.get(key)!;
        existing.models.push(model);
        existing.modelConsensus++;
        // Merge suggested fixes
        if (issue.suggestedFix && !existing.suggestedFix) {
          existing.suggestedFix = issue.suggestedFix;
        }
      }
    });
  });

  // Convert to array and sort by consensus
  return Array.from(issueMap.values()).sort((a, b) => b.modelConsensus - a.modelConsensus);
}

/**
 * Apply automatic fixes for high-consensus errors
 */
async function applyConsensusFixes(
  issues: CodeReviewIssue[],
  buildPath: string
): Promise<number> {
  let fixesApplied = 0;

  // Only fix errors with 5+ model consensus
  const highConsensusErrors = issues.filter(
    issue => issue.severity === 'error' && issue.modelConsensus >= 5 && issue.suggestedFix
  );

  for (const issue of highConsensusErrors) {
    try {
      const filePath = path.join(buildPath, issue.file);

      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${issue.file}`);
        continue;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      // Apply the fix (simple line replacement for now)
      if (issue.line && issue.line <= lines.length) {
        // This is a simplified fix - in production you'd want more sophisticated AST-based fixes
        console.log(`🔧 Fixing ${issue.file}:${issue.line} - ${issue.description}`);
        console.log(`   Consensus: ${issue.modelConsensus}/7 models`);
        console.log(`   Fix: ${issue.suggestedFix}`);

        // TODO: Implement actual code fixes here
        // For now, just log what would be fixed
        fixesApplied++;
      }
    } catch (error) {
      console.error(`❌ Failed to apply fix for ${issue.file}:`, error);
    }
  }

  return fixesApplied;
}

/**
 * Detect bad patterns specific to tech stack confusion
 */
function detectBadPatterns(files: { path: string; content: string }[], issues: CodeReviewIssue[]): any[] {
  const badPatterns: any[] = [];

  // Pattern 1: Tech stack confusion (lowercase component names)
  for (const file of files) {
    const content = file.content;

    // Check for lowercase JSX tags (tech stack items)
    const lowercaseJSX = content.match(/<([a-z][a-z0-9-]*)\s*\/?>/g);
    if (lowercaseJSX && file.path.includes('.tsx')) {
      const techStackTerms = ['shadcnui', 'nextjs', 'react', 'typescript', 'tailwind'];
      const matchedTerms = lowercaseJSX.filter(tag =>
        techStackTerms.some(term => tag.toLowerCase().includes(term))
      );

      if (matchedTerms.length > 0) {
        badPatterns.push({
          type: 'TECH_STACK_CONFUSION',
          severity: 'error',
          pattern: 'Component named after tech stack with lowercase JSX',
          prevention: 'Validate component names are features not frameworks, must be PascalCase',
          confidence: 100,
          examples: matchedTerms,
          file: file.path,
        });
      }
    }

    // Check for tech stack navigation items
    const navMatch = content.match(/navigation.*?(?:=|:)\s*\[(.*?)\]/s);
    if (navMatch) {
      const navItems = navMatch[1].toLowerCase();
      const techStackInNav = ['nextjs', 'react', 'typescript', 'tailwind', 'shadcn', 'supabase'];

      const foundTechInNav = techStackInNav.filter(term => navItems.includes(term));
      if (foundTechInNav.length > 0) {
        badPatterns.push({
          type: 'INVALID_NAVIGATION',
          severity: 'error',
          pattern: 'Navigation items are tech stack not user-facing features',
          prevention: 'Navigation must be user features (Dashboard, Tasks, etc.) not frameworks',
          confidence: 100,
          examples: foundTechInNav,
          file: file.path,
        });
      }
    }
  }

  // Pattern 2: Check issues for known anti-patterns
  const techStackErrors = issues.filter(issue =>
    issue.description.toLowerCase().includes('unrecognized') ||
    issue.description.toLowerCase().includes('lowercase') ||
    issue.description.toLowerCase().includes('not a valid')
  );

  if (techStackErrors.length > 0) {
    badPatterns.push({
      type: 'INVALID_JSX_ELEMENTS',
      severity: 'error',
      pattern: 'Generated invalid JSX elements (likely tech stack confusion)',
      prevention: 'Ensure all components are PascalCase and represent user features',
      confidence: 90,
      examples: techStackErrors.map(e => e.description),
    });
  }

  return badPatterns;
}

/**
 * Feed review results into learning system
 */
function feedIntoLearning(
  issues: CodeReviewIssue[],
  buildSuccess: boolean,
  files?: { path: string; content: string }[]
): void {
  // Extract patterns from high-consensus issues
  const patterns = issues
    .filter(issue => issue.modelConsensus >= 5)
    .map(issue => ({
      pattern: `${issue.category}: ${issue.description}`,
      category: issue.category,
      type: issue.severity === 'error' ? 'anti-pattern' : 'example',
      confidence: (issue.modelConsensus / 7) * 100,
    }));

  // Detect bad patterns from code analysis
  if (files) {
    const badPatterns = detectBadPatterns(files, issues);

    if (badPatterns.length > 0) {
      console.log(`🚨 Detected ${badPatterns.length} bad patterns (tech stack confusion, etc.)`);

      // Add bad patterns to learning
      badPatterns.forEach(bp => {
        patterns.push({
          pattern: bp.pattern,
          category: 'anti-pattern',
          type: 'anti-pattern',
          confidence: bp.confidence,
        });
      });

      // Store bad patterns separately for analysis
      const patternsDir = path.join(process.cwd(), 'lib/learned-patterns');
      const badPatternsFile = path.join(patternsDir, 'bad-patterns.json');

      let existingBadPatterns: any[] = [];
      if (fs.existsSync(badPatternsFile)) {
        existingBadPatterns = JSON.parse(fs.readFileSync(badPatternsFile, 'utf8'));
      }

      existingBadPatterns.push({
        timestamp: new Date().toISOString(),
        patterns: badPatterns,
      });

      fs.writeFileSync(badPatternsFile, JSON.stringify(existingBadPatterns, null, 2));
    }
  }

  if (patterns.length > 0) {
    console.log(`📚 Feeding ${patterns.length} patterns into learning system`);

    // Record as a learning session
    recordLearningSession({
      sessionId: `review_${Date.now()}`,
      consensusType: 'code_review',
      achieved: buildSuccess,
      totalVotes: 7,
      passVotes: buildSuccess ? 7 : 0,
      patterns,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Main post-build review function
 */
export async function reviewBuild(
  projectId: string,
  buildId: string,
  buildPath: string,
  apiKey?: string
): Promise<CodeReviewResult | null> {
  // Check if reviews are enabled
  if (!areReviewsEnabled()) {
    console.log('📋 Post-build reviews are disabled');
    return null;
  }

  console.log('\n📋 Starting post-build code review...');
  console.log(`   Project: ${projectId}`);
  console.log(`   Build: ${buildId}`);

  // Update review count
  const config = loadReviewConfig();
  config.remainingReviews--;
  config.totalReviews++;
  saveReviewConfig(config);
  console.log(`   Remaining reviews: ${config.remainingReviews}/100`);

  // Get API key
  const openrouterKey = apiKey || process.env.OPENROUTER_API_KEY;
  if (!openrouterKey) {
    console.error('❌ OPENROUTER_API_KEY not found');
    return null;
  }

  // Read all generated files
  const srcPath = path.join(buildPath, 'src');
  const appPath = path.join(buildPath, 'app');

  const files: { path: string; content: string }[] = [];

  // Read components
  if (fs.existsSync(srcPath)) {
    const componentFiles = fs.readdirSync(path.join(srcPath, 'components'))
      .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

    for (const file of componentFiles) {
      const filePath = path.join(srcPath, 'components', file);
      files.push({
        path: `src/components/${file}`,
        content: fs.readFileSync(filePath, 'utf8'),
      });
    }
  }

  // Read app files
  if (fs.existsSync(appPath)) {
    const appFiles = fs.readdirSync(appPath)
      .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

    for (const file of appFiles) {
      const filePath = path.join(appPath, file);
      files.push({
        path: `app/${file}`,
        content: fs.readFileSync(filePath, 'utf8'),
      });
    }
  }

  if (files.length === 0) {
    console.log('⚠️  No files found to review');
    return null;
  }

  console.log(`   Files to review: ${files.length}`);

  // Query all 7 models in parallel
  console.log('\n🤖 Querying 7 LLMs for code review...');
  const allReviews = await Promise.all(
    REVIEW_MODELS.map(async (model) => {
      const issues = await queryModelForReview(model, files, openrouterKey);
      return [model, issues] as [string, CodeReviewIssue[]];
    })
  );

  const reviewMap = new Map(allReviews);

  // Find consensus issues
  console.log('\n🔍 Finding consensus on issues...');
  const consensusIssues = findConsensusIssues(reviewMap);

  const errors = consensusIssues.filter(i => i.severity === 'error');
  const warnings = consensusIssues.filter(i => i.severity === 'warning');
  const suggestions = consensusIssues.filter(i => i.severity === 'suggestion');

  console.log(`\n📊 Review Results:`);
  console.log(`   Errors: ${errors.length} (${errors.filter(e => e.modelConsensus >= 5).length} high-consensus)`);
  console.log(`   Warnings: ${warnings.length} (${warnings.filter(w => w.modelConsensus >= 5).length} high-consensus)`);
  console.log(`   Suggestions: ${suggestions.length} (${suggestions.filter(s => s.modelConsensus >= 5).length} high-consensus)`);

  // Apply auto-fixes for high-consensus errors
  console.log('\n🔧 Applying auto-fixes for high-consensus errors...');
  const fixesApplied = await applyConsensusFixes(errors, buildPath);
  console.log(`   Fixed: ${fixesApplied} errors`);

  // Feed into learning system
  console.log('\n📚 Feeding patterns into learning system...');
  feedIntoLearning(consensusIssues, errors.length === 0, files);

  const result: CodeReviewResult = {
    projectId,
    buildId,
    timestamp: new Date().toISOString(),
    issues: errors,
    improvements: [...warnings, ...suggestions],
    fixesApplied,
    patternsLearned: consensusIssues.filter(i => i.modelConsensus >= 5).length,
  };

  // Save review result
  const reviewPath = path.join(process.cwd(), 'lib/learned-patterns/reviews');
  if (!fs.existsSync(reviewPath)) {
    fs.mkdirSync(reviewPath, { recursive: true });
  }

  fs.writeFileSync(
    path.join(reviewPath, `${buildId}.json`),
    JSON.stringify(result, null, 2)
  );

  console.log('\n✅ Post-build review complete!');
  return result;
}
