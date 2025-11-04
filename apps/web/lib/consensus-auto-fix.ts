/**
 * Within-Iteration Learning System
 *
 * Instead of sending the same plan 3 times hoping for different results,
 * this system auto-fixes the plan based on consensus feedback from
 * previous iterations.
 *
 * This is the SINGLE BIGGEST improvement to the learning system.
 *
 * PHASE 3 ENHANCEMENTS:
 * - Architectural fixes (milestone restructuring, component splitting)
 * - AST-based code fixes (future)
 */

import { LearnedPattern } from './consensus-learning';
import {
  fixMilestoneArchitecture,
  splitComplexComponents
} from './consensus-learning-phase3';

// ============================================================================
// Types
// ============================================================================

export interface ConsensusIssue {
  type: 'file-path' | 'dependency' | 'criticality' | 'architecture' | 'general';
  severity: 'critical' | 'warning';
  description: string;
  affectedComponents?: string[]; // Component IDs
  suggestedFix?: string;
  modelConfidence: number; // 0-100
}

export interface AutoFixResult {
  fixed: boolean;
  planBefore: any;
  planAfter: any;
  fixesApplied: FixApplied[];
  remainingIssues: ConsensusIssue[];
}

export interface FixApplied {
  issueType: string;
  fix: string;
  affectedComponents: string[];
  confidence: number;
}

// ============================================================================
// Issue Extraction from Consensus Feedback
// ============================================================================

/**
 * Extract structured issues from consensus discussion
 */
export function extractIssuesFromConsensus(consensusResult: any): ConsensusIssue[] {
  const issues: ConsensusIssue[] = [];

  consensusResult.responses?.forEach((response: any) => {
    if (response.response.includes('VERDICT: FAIL')) {
      const reasoning = response.response.match(/REASON:\s*(.+)/is)?.[1] || '';
      const confidence = parseInt(response.response.match(/CONFIDENCE:\s*(\d+)/)?.[1] || '0');

      // Extract file path issues
      const filePathIssues = extractFilePathIssues(reasoning, confidence);
      issues.push(...filePathIssues);

      // Extract dependency issues
      const depIssues = extractDependencyIssues(reasoning, confidence);
      issues.push(...depIssues);

      // Extract criticality issues
      const criticalityIssues = extractCriticalityIssues(reasoning, confidence);
      issues.push(...criticalityIssues);

      // Extract architecture issues
      const archIssues = extractArchitectureIssues(reasoning, confidence);
      issues.push(...archIssues);
    }
  });

  // Deduplicate and prioritize by confidence
  return deduplicateIssues(issues);
}

function extractFilePathIssues(reasoning: string, confidence: number): ConsensusIssue[] {
  const issues: ConsensusIssue[] = [];

  // Middleware in wrong location
  if (/middleware\.ts.*(?:should|must) be at (?:project )?root/i.test(reasoning)) {
    issues.push({
      type: 'file-path',
      severity: 'critical',
      description: 'middleware.ts must be at project root',
      suggestedFix: 'Move to middleware.ts (not app/middleware.ts or lib/middleware.ts)',
      modelConfidence: confidence
    });
  }

  // lib/module.ts instead of lib/module/index.ts
  const modulePath = reasoning.match(/lib\/([^/]+)\.ts.*should.*lib\/\1\/index\.ts/i);
  if (modulePath) {
    const moduleName = modulePath[1];
    issues.push({
      type: 'file-path',
      severity: 'critical',
      description: `Modular lib should use lib/${moduleName}/index.ts`,
      affectedComponents: findComponentsWithPath(`lib/${moduleName}.ts`),
      suggestedFix: `Change lib/${moduleName}.ts to lib/${moduleName}/index.ts`,
      modelConfidence: confidence
    });
  }

  // .sql files as components
  if (/\.sql.*not valid.*component/i.test(reasoning)) {
    issues.push({
      type: 'file-path',
      severity: 'critical',
      description: 'SQL files should not be components',
      suggestedFix: 'Use .ts files with Drizzle/Prisma schemas instead of .sql',
      modelConfidence: confidence
    });
  }

  // manifest.json instead of manifest.ts
  if (/manifest\.json.*should.*app\/manifest\.ts/i.test(reasoning)) {
    issues.push({
      type: 'file-path',
      severity: 'critical',
      description: 'PWA manifest should be app/manifest.ts',
      suggestedFix: 'Change public/manifest.json to app/manifest.ts',
      modelConfidence: confidence
    });
  }

  return issues;
}

function extractDependencyIssues(reasoning: string, confidence: number): ConsensusIssue[] {
  const issues: ConsensusIssue[] = [];

  // Circular dependencies
  if (/circular dependency|depends on itself/i.test(reasoning)) {
    const components = reasoning.match(/(?:component|id)\s+['"]([^'"]+)['"]/gi) || [];
    issues.push({
      type: 'dependency',
      severity: 'critical',
      description: 'Circular dependency detected',
      affectedComponents: components.map(c => c.match(/['"]([^'"]+)['"]/)?.[1] || ''),
      suggestedFix: 'Remove circular dependency to form DAG',
      modelConfidence: confidence
    });
  }

  // Invalid dependency IDs
  if (/dependency.*not found|invalid.*dependency/i.test(reasoning)) {
    issues.push({
      type: 'dependency',
      severity: 'critical',
      description: 'Dependencies reference invalid component IDs',
      suggestedFix: 'Ensure all dependencies reference valid component IDs',
      modelConfidence: confidence
    });
  }

  return issues;
}

function extractCriticalityIssues(reasoning: string, confidence: number): ConsensusIssue[] {
  const issues: ConsensusIssue[] = [];

  // Missing criticality
  if (/missing criticality|no criticality/i.test(reasoning)) {
    issues.push({
      type: 'criticality',
      severity: 'critical',
      description: 'Components missing criticality classification',
      suggestedFix: 'Add criticality field to all components',
      modelConfidence: confidence
    });
  }

  // Wrong criticality level
  if (/(password|payment|auth).*should be.*(ULTRA_)?CRITICAL/i.test(reasoning)) {
    issues.push({
      type: 'criticality',
      severity: 'critical',
      description: 'Security-sensitive components need higher criticality',
      suggestedFix: 'Set criticality to CRITICAL or ULTRA_CRITICAL for auth/payment components',
      modelConfidence: confidence
    });
  }

  return issues;
}

function extractArchitectureIssues(reasoning: string, confidence: number): ConsensusIssue[] {
  const issues: ConsensusIssue[] = [];

  // Design system not first
  if (/design.?system.*should be first/i.test(reasoning)) {
    issues.push({
      type: 'architecture',
      severity: 'critical',
      description: 'Design system must be first component in Milestone 1',
      suggestedFix: 'Move design-system component to first position in Milestone 1',
      modelConfidence: confidence
    });
  }

  // First milestone not "Design System & Infrastructure"
  if (/milestone.*should.*design.*infrastructure/i.test(reasoning)) {
    issues.push({
      type: 'architecture',
      severity: 'critical',
      description: 'First milestone must be "Design System & Infrastructure"',
      suggestedFix: 'Rename first milestone to "Design System & Infrastructure"',
      modelConfidence: confidence
    });
  }

  return issues;
}

function deduplicateIssues(issues: ConsensusIssue[]): ConsensusIssue[] {
  const seen = new Map<string, ConsensusIssue>();

  issues.forEach(issue => {
    const key = `${issue.type}:${issue.description}`;
    const existing = seen.get(key);

    if (!existing || issue.modelConfidence > existing.modelConfidence) {
      seen.set(key, issue);
    }
  });

  return Array.from(seen.values()).sort((a, b) => {
    // Sort by severity then confidence
    if (a.severity === 'critical' && b.severity !== 'critical') return -1;
    if (a.severity !== 'critical' && b.severity === 'critical') return 1;
    return b.modelConfidence - a.modelConfidence;
  });
}

function findComponentsWithPath(pattern: string): string[] {
  // Helper to find component IDs matching a file path pattern
  // Implementation depends on plan structure
  return [];
}

// ============================================================================
// Automatic Plan Fixing
// ============================================================================

/**
 * Automatically fix plan based on consensus issues
 * PHASE 3: Now includes architectural fixes and component splitting
 */
export function autoFixPlan(plan: any, issues: ConsensusIssue[]): AutoFixResult {
  const fixesApplied: FixApplied[] = [];
  const remainingIssues: ConsensusIssue[] = [];
  const planBefore = JSON.parse(JSON.stringify(plan));
  const planAfter = JSON.parse(JSON.stringify(plan));

  // Apply issue-specific fixes
  issues.forEach(issue => {
    const fixed = applyFix(planAfter, issue);

    if (fixed) {
      fixesApplied.push({
        issueType: issue.type,
        fix: issue.suggestedFix || issue.description,
        affectedComponents: issue.affectedComponents || [],
        confidence: issue.modelConfidence
      });
    } else {
      remainingIssues.push(issue);
    }
  });

  // PHASE 3: Apply architectural improvements
  const archFixed = fixMilestoneArchitecture(planAfter);
  if (archFixed) {
    fixesApplied.push({
      issueType: 'architecture',
      fix: 'Restructured milestones and component order',
      affectedComponents: [],
      confidence: 90
    });
    console.log('🏗️  Applied architectural fixes');
  }

  // PHASE 3: Split complex components
  const complexFixed = splitComplexComponents(planAfter, 300);
  if (complexFixed) {
    fixesApplied.push({
      issueType: 'architecture',
      fix: 'Split overly complex components into smaller units',
      affectedComponents: [],
      confidence: 85
    });
    console.log('✂️  Split complex components');
  }

  return {
    fixed: fixesApplied.length > 0,
    planBefore,
    planAfter,
    fixesApplied,
    remainingIssues
  };
}

function applyFix(plan: any, issue: ConsensusIssue): boolean {
  try {
    switch (issue.type) {
      case 'file-path':
        return fixFilePaths(plan, issue);

      case 'dependency':
        return fixDependencies(plan, issue);

      case 'criticality':
        return fixCriticality(plan, issue);

      case 'architecture':
        return fixArchitecture(plan, issue);

      default:
        return false;
    }
  } catch (error) {
    console.error(`Failed to apply fix for ${issue.type}:`, error);
    return false;
  }
}

function fixFilePaths(plan: any, issue: ConsensusIssue): boolean {
  if (!plan.milestones) return false;

  let fixed = false;

  plan.milestones.forEach((milestone: any) => {
    milestone.components?.forEach((component: any) => {
      // Fix lib/module.ts → lib/module/index.ts
      if (component.filePath && component.filePath.match(/^lib\/([^/]+)\.ts$/)) {
        const match = component.filePath.match(/^lib\/([^/]+)\.ts$/);
        if (match) {
          const moduleName = match[1];
          component.filePath = `lib/${moduleName}/index.ts`;
          fixed = true;
        }
      }

      // Fix middleware in wrong location
      if (component.filePath && component.filePath.includes('middleware.ts') && component.filePath !== 'middleware.ts') {
        component.filePath = 'middleware.ts';
        fixed = true;
      }

      // Remove .sql files
      if (component.filePath && component.filePath.endsWith('.sql')) {
        const baseName = component.filePath.replace(/\.sql$/, '');
        component.filePath = `lib/db/${baseName}.ts`;
        fixed = true;
      }

      // Fix manifest.json → manifest.ts
      if (component.filePath && component.filePath === 'public/manifest.json') {
        component.filePath = 'app/manifest.ts';
        component.type = 'metadata';
        fixed = true;
      }
    });
  });

  return fixed;
}

function fixDependencies(plan: any, issue: ConsensusIssue): boolean {
  if (!plan.milestones) return false;

  let fixed = false;

  // Build component ID map
  const componentIds = new Set<string>();
  plan.milestones.forEach((m: any) => {
    m.components?.forEach((c: any) => {
      if (c.id) componentIds.add(c.id);
    });
  });

  // Fix invalid dependencies
  plan.milestones.forEach((milestone: any) => {
    milestone.components?.forEach((component: any) => {
      if (component.dependencies) {
        // Remove invalid dependencies
        const validDeps = component.dependencies.filter((dep: string) => componentIds.has(dep));

        if (validDeps.length !== component.dependencies.length) {
          component.dependencies = validDeps;
          fixed = true;
        }
      }
    });
  });

  // TODO: Detect and break circular dependencies
  // This requires cycle detection and intelligent edge removal

  return fixed;
}

function fixCriticality(plan: any, issue: ConsensusIssue): boolean {
  if (!plan.milestones) return false;

  let fixed = false;

  plan.milestones.forEach((milestone: any) => {
    milestone.components?.forEach((component: any) => {
      // Add missing criticality
      if (!component.criticality) {
        // Auto-infer based on description
        const description = (component.description || '').toLowerCase();

        if (/password|encrypt|payment|stripe|admin|oauth/i.test(description)) {
          component.criticality = 'ULTRA_CRITICAL';
        } else if (/auth|login|signup|jwt|session|database|sql|upload|download|pii/i.test(description)) {
          component.criticality = 'CRITICAL';
        } else if (/api|endpoint|validation|business/i.test(description)) {
          component.criticality = 'IMPORTANT';
        } else {
          component.criticality = 'STANDARD';
        }

        fixed = true;
      }

      // Upgrade criticality for security-sensitive components
      const description = (component.description || '').toLowerCase();
      if (/password|payment|admin|oauth/i.test(description) && component.criticality !== 'ULTRA_CRITICAL') {
        component.criticality = 'ULTRA_CRITICAL';
        fixed = true;
      } else if (/auth|database|upload|pii/i.test(description) && !['ULTRA_CRITICAL', 'CRITICAL'].includes(component.criticality)) {
        component.criticality = 'CRITICAL';
        fixed = true;
      }
    });
  });

  return fixed;
}

function fixArchitecture(plan: any, issue: ConsensusIssue): boolean {
  if (!plan.milestones || plan.milestones.length === 0) return false;

  let fixed = false;
  const firstMilestone = plan.milestones[0];

  // Fix first milestone name
  if (issue.description.includes('Design System & Infrastructure')) {
    if (firstMilestone.name !== 'Design System & Infrastructure') {
      firstMilestone.name = 'Design System & Infrastructure';
      fixed = true;
    }
  }

  // Fix design system not first
  if (issue.description.includes('design system')) {
    const designSystemIndex = firstMilestone.components?.findIndex((c: any) =>
      c.type === 'design-system' || c.id === 'design-system'
    );

    if (designSystemIndex > 0) {
      // Move design system to first position
      const [designSystem] = firstMilestone.components.splice(designSystemIndex, 1);
      firstMilestone.components.unshift(designSystem);
      fixed = true;
    }
  }

  return fixed;
}

// ============================================================================
// Learning from Fixes
// ============================================================================

/**
 * Record which fixes were successful for future learning
 */
export function recordFixPattern(issue: ConsensusIssue, fixApplied: FixApplied, success: boolean): void {
  // Store fix pattern for future use
  const pattern: LearnedPattern = {
    id: `fix_${issue.type}_${Date.now()}`,
    type: success ? 'example' : 'anti-pattern',
    category: issue.type,
    pattern: `When seeing "${issue.description}", apply fix: "${fixApplied.fix}"`,
    confidence: fixApplied.confidence,
    occurrences: 1,
    successRate: success ? 100 : 0,
    sources: ['auto-fix-system'],
    firstSeen: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    consensusType: 'plan_verification'
  };

  // TODO: Store this pattern
  console.log(`📚 Learned fix pattern: ${pattern.pattern} (success: ${success})`);
}
