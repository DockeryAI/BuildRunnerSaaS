import { NextRequest, NextResponse } from 'next/server';
import { BuildOrchestrator } from '../../../../lib/build-orchestrator';
import { recordLearningSession } from '../../../../lib/consensus-learning';

/**
 * POST /api/plan/verify
 * Verify a build plan with 5-model consensus BEFORE building starts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, productIdea, productName } = body;

    // Get API keys from headers
    const apiKeysHeader = request.headers.get('x-api-keys');
    if (!apiKeysHeader) {
      return NextResponse.json(
        { error: 'API keys required' },
        { status: 400 }
      );
    }

    const apiKeys = JSON.parse(apiKeysHeader);
    const openrouterKey = apiKeys.openrouter;

    if (!openrouterKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key required' },
        { status: 400 }
      );
    }

    console.log('🔍 Verifying build plan with 5-model consensus...');

    // Create a temporary orchestrator just for verification
    const orchestrator = new BuildOrchestrator(
      openrouterKey,
      undefined, // Use default config
      'plan-verification'
    );

    // Set product idea and app config for context
    (orchestrator as any).productIdea = productIdea;
    (orchestrator as any).appConfig = {
      appType: plan.appType || 'web',
      framework: plan.framework || 'nextjs'
    };

    // Format plan for verification
    const planSummary = formatPlanForVerification(plan);

    console.log('📋 Plan summary for verification:', planSummary.substring(0, 500));

    // Run consensus verification with CRITICAL tier (5 models)
    const verificationResult = await orchestrator.verifyBuildPlanWithConsensus(
      planSummary,
      plan,
      'CRITICAL' // Always use 5 models for plan verification
    );

    console.log('✅ Verification complete:', {
      consensusAchieved: verificationResult.consensusAchieved,
      iterations: verificationResult.iterations,
      issues: verificationResult.issuesFound,
    });

    // Record learning session for continuous improvement
    try {
      // Get applied pattern IDs from the request (passed from plan generator)
      const appliedPatternIds = body.appliedPatternIds || [];

      await recordLearningSession(
        verificationResult.consensusLog,
        'plan_verification',
        appliedPatternIds,
        plan
      );
      console.log(`📚 Learning patterns recorded with enhanced extraction (LLM + structural + regex)`);
    } catch (learningError) {
      console.error('⚠️  Failed to record learning session:', learningError);
      // Don't fail the request if learning fails
    }

    // Return verification results
    return NextResponse.json({
      success: verificationResult.consensusAchieved,
      consensusAchieved: verificationResult.consensusAchieved,
      iterations: verificationResult.iterations,
      finalPlan: verificationResult.finalPlan,
      issuesFound: verificationResult.issuesFound,
      issuesResolved: verificationResult.issuesResolved,
      consensusLog: verificationResult.consensusLog,
      healthScore: calculatePlanHealthScore(verificationResult),
    });

  } catch (error) {
    console.error('❌ Plan verification error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Plan verification failed',
        success: false,
      },
      { status: 500 }
    );
  }
}

/**
 * Format plan into a clear text summary for AI verification
 * Includes ALL validation checks from best practices
 */
function formatPlanForVerification(plan: any): string {
  let summary = `Build Plan Verification - Production Standards Validation\n\n`;

  summary += `**Product**: ${plan.productName || 'Unnamed'}\n`;
  summary += `**Type**: ${plan.appType || 'web'} app using ${plan.framework || 'Next.js'}\n\n`;

  summary += `**Architecture**:\n`;
  if (plan.architecture) {
    summary += `- Frontend: ${plan.architecture.frontend || 'Not specified'}\n`;
    summary += `- Backend: ${plan.architecture.backend || 'Not specified'}\n`;
    summary += `- Database: ${plan.architecture.database || 'Not specified'}\n`;
    summary += `- Authentication: ${plan.architecture.authentication || 'Not specified'}\n`;
    summary += `- Hosting: ${plan.architecture.hosting || 'Not specified'}\n\n`;
  }

  // Validate design-first architecture
  const validationChecks: string[] = [];
  if (plan.milestones && plan.milestones.length > 0) {
    const firstMilestone = plan.milestones[0];
    const hasDesignSystem = firstMilestone.components?.some((c: any) =>
      c.type === 'design-system' || c.name?.toLowerCase().includes('design')
    );

    if (hasDesignSystem) {
      validationChecks.push('✅ Design-first architecture (design system in Milestone 1)');
    } else {
      validationChecks.push('❌ CRITICAL: Missing design system in Milestone 1');
    }
  }

  // Validate component criticality classification
  const allComponents = plan.milestones?.flatMap((m: any) => m.components || []) || [];
  const componentsWithCriticality = allComponents.filter((c: any) => c.criticality);
  if (componentsWithCriticality.length === allComponents.length) {
    validationChecks.push('✅ All components have criticality classification');
  } else {
    validationChecks.push(`⚠️  ${allComponents.length - componentsWithCriticality.length} components missing criticality`);
  }

  // Validate quality requirements
  const componentsWithQuality = allComponents.filter((c: any) => c.qualityRequirements);
  if (componentsWithQuality.length === allComponents.length) {
    validationChecks.push('✅ All components have quality requirements');
  } else {
    validationChecks.push(`⚠️  ${allComponents.length - componentsWithQuality.length} components missing quality requirements`);
  }

  // Check for circular dependencies
  const circularDeps = detectCircularDependencies(plan.milestones || []);
  if (circularDeps.length === 0) {
    validationChecks.push('✅ No circular dependencies detected');
  } else {
    validationChecks.push(`❌ CRITICAL: Circular dependencies found: ${circularDeps.join(', ')}`);
  }

  // Validate file paths follow Next.js 14 conventions
  const invalidPaths = allComponents.filter((c: any) =>
    c.filePath && !isValidNextJsPath(c.filePath, c.type)
  );
  if (invalidPaths.length === 0) {
    validationChecks.push('✅ All file paths follow Next.js 14 App Router conventions');
  } else {
    validationChecks.push(`⚠️  ${invalidPaths.length} components have invalid file paths`);
  }

  summary += `**Validation Checks**:\n${validationChecks.join('\n')}\n\n`;

  summary += `**Milestones** (${plan.milestones?.length || 0} total):\n`;
  if (plan.milestones) {
    plan.milestones.forEach((milestone: any, idx: number) => {
      summary += `\n${idx + 1}. ${milestone.name} (${milestone.components?.length || 0} components)\n`;
      if (milestone.components) {
        milestone.components.forEach((comp: any) => {
          const criticalityBadge = comp.criticality ? `[${comp.criticality}]` : '[NO_CRITICALITY]';
          summary += `   - ${comp.name} [${comp.type}] ${criticalityBadge}\n`;
          summary += `     Path: ${comp.filePath || 'NOT_SPECIFIED'}\n`;
          if (comp.dependencies && comp.dependencies.length > 0) {
            summary += `     Deps: ${comp.dependencies.join(', ')}\n`;
          }
        });
      }
    });
  }

  summary += `\n**Total Components**: ${getTotalComponents(plan)}\n`;

  // Criticality breakdown
  const criticalityCounts = {
    ULTRA_CRITICAL: allComponents.filter((c: any) => c.criticality === 'ULTRA_CRITICAL').length,
    CRITICAL: allComponents.filter((c: any) => c.criticality === 'CRITICAL').length,
    IMPORTANT: allComponents.filter((c: any) => c.criticality === 'IMPORTANT').length,
    STANDARD: allComponents.filter((c: any) => c.criticality === 'STANDARD').length,
  };
  summary += `**Criticality Distribution**:\n`;
  summary += `- ULTRA_CRITICAL (7 models): ${criticalityCounts.ULTRA_CRITICAL}\n`;
  summary += `- CRITICAL (5 models): ${criticalityCounts.CRITICAL}\n`;
  summary += `- IMPORTANT (3 models): ${criticalityCounts.IMPORTANT}\n`;
  summary += `- STANDARD (1 model): ${criticalityCounts.STANDARD}\n\n`;

  summary += `**VERIFICATION REQUIREMENTS**:\n`;
  summary += `1. Design system MUST be first component in Milestone 1\n`;
  summary += `2. All components MUST have valid criticality classification\n`;
  summary += `3. All components MUST have quality requirements specified\n`;
  summary += `4. ZERO circular dependencies allowed\n`;
  summary += `5. All file paths MUST follow Next.js 14 App Router conventions\n`;
  summary += `6. Component dependencies MUST reference existing component IDs\n`;
  summary += `7. Components MUST be ordered by dependencies (topological sort)\n`;
  summary += `8. No forbidden libraries (react-router-dom, etc.)\n\n`;

  summary += `VERIFY this plan meets ALL requirements above. If ANY critical issue exists, vote FAIL and explain.`;

  return summary;
}

/**
 * Detect circular dependencies in component graph
 */
function detectCircularDependencies(milestones: any[]): string[] {
  const allComponents = milestones.flatMap(m => m.components || []);
  const componentMap = new Map(allComponents.map((c: any) => [c.id, c]));
  const circular: string[] = [];

  function hasCycle(id: string, visited: Set<string>, recStack: Set<string>): boolean {
    if (!visited.has(id)) {
      visited.add(id);
      recStack.add(id);

      const component = componentMap.get(id);
      if (component?.dependencies) {
        for (const depId of component.dependencies) {
          if (!visited.has(depId)) {
            if (hasCycle(depId, visited, recStack)) {
              return true;
            }
          } else if (recStack.has(depId)) {
            circular.push(`${id} → ${depId}`);
            return true;
          }
        }
      }
    }
    recStack.delete(id);
    return false;
  }

  const visited = new Set<string>();
  for (const component of allComponents) {
    if (!visited.has(component.id)) {
      hasCycle(component.id, visited, new Set());
    }
  }

  return circular;
}

/**
 * Validate Next.js 14 App Router file path conventions
 */
function isValidNextJsPath(filePath: string, type: string): boolean {
  // Middleware MUST be at project root
  if (filePath.includes('middleware') && filePath !== 'middleware.ts') {
    return false;
  }

  // Reject .sql or .json files as components
  if (filePath.match(/\.(sql|json)$/)) {
    return false;
  }

  // Pages should be in app/ with page.tsx (route groups like (app) are OK)
  if (type === 'page' && !filePath.match(/^app\/(\([^)]+\)\/)?.*\/page\.tsx$/)) {
    return false;
  }

  // Layouts should be in app/ with layout.tsx (route groups OK)
  if (type === 'layout' && !filePath.match(/^app\/(\([^)]+\)\/)?.*\/layout\.tsx$/)) {
    return false;
  }

  // API routes should be in app/api/ with route.ts
  if (type === 'api' && !filePath.match(/^app\/api\/.*\/route\.ts$/)) {
    return false;
  }

  // Components should be in components/ or app/ (.tsx)
  if (type === 'component' && !filePath.match(/^(components|app)\/.*\.tsx$/)) {
    return false;
  }

  // Services/libs should be in lib/ (.ts) - accept both modular and simple
  if (type === 'service' && !filePath.match(/^lib\/.*\.ts$/)) {
    return false;
  }

  // Design systems should use modular structure
  if (type === 'design-system' && !filePath.match(/^lib\/design-system\/(index\.ts|.*\.ts)$/)) {
    return false;
  }

  // Database schemas must be .ts files (Drizzle/Prisma), not .sql
  if (type === 'database' && !filePath.match(/^lib\/db\/.*\.ts$/)) {
    return false;
  }

  return true;
}

/**
 * Calculate total components in plan
 */
function getTotalComponents(plan: any): number {
  if (!plan.milestones) return 0;
  return plan.milestones.reduce((total: number, m: any) =>
    total + (m.components?.length || 0), 0
  );
}

/**
 * Calculate plan health score based on verification results
 */
function calculatePlanHealthScore(result: any): {
  score: number;
  grade: string;
  issues: string[];
  strengths: string[];
} {
  let score = 100;
  const issues: string[] = [];
  const strengths: string[] = [];

  // Deduct points for issues
  if (!result.consensusAchieved) {
    score -= 30;
    issues.push('Consensus not achieved - plan has critical issues');
  } else {
    strengths.push('All 5 AI models approved the plan');
  }

  if (result.iterations > 1) {
    score -= (result.iterations - 1) * 5;
    issues.push(`Required ${result.iterations} iterations to reach consensus`);
  } else {
    strengths.push('Plan approved on first review');
  }

  if (result.issuesFound > 0) {
    score -= result.issuesFound * 3;
    issues.push(`${result.issuesFound} issues found during verification`);
  }

  if (result.issuesResolved === result.issuesFound && result.issuesFound > 0) {
    score += 10; // Bonus for resolving all issues
    strengths.push('All identified issues were resolved');
  }

  // Cap score at 0-100
  score = Math.max(0, Math.min(100, score));

  let grade = 'F';
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';

  return { score, grade, issues, strengths };
}
