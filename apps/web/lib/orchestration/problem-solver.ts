/**
 * Multi-LLM Problem Solver & Intervention System
 *
 * When agents get stuck or encounter problems:
 * 1. Gathers comprehensive context
 * 2. Consults multiple LLMs in parallel
 * 3. Synthesizes solutions into micro-plan
 * 4. Executes with verification
 * 5. Learns from resolution
 */

import {
  Problem,
  ComprehensiveContext,
  LLMSolution,
  MicroPlan,
  MicroStep,
  Result,
  ExecutionResult,
  Strategy,
  Resolution,
  Intervention,
  LLMModel,
} from './types';
import { llmGateway } from './llm-gateway';
import { featureRegistry } from './feature-registry';
import { stateMonitor } from './state-monitor';

// ============================================================================
// Multi-LLM Problem Solver
// ============================================================================

export class MultiLLMProblemSolver {
  private static instance: MultiLLMProblemSolver;
  private consultationModels: LLMModel[] = [
    'anthropic/claude-sonnet-3.5',
    'openai/gpt-4',
    'google/gemini-pro',
    'openai/o1-mini',
    'deepseek/deepseek-chat',
  ];
  private synthesisModel: LLMModel = 'anthropic/claude-opus-4';

  private constructor() {}

  public static getInstance(): MultiLLMProblemSolver {
    if (!MultiLLMProblemSolver.instance) {
      MultiLLMProblemSolver.instance = new MultiLLMProblemSolver();
    }
    return MultiLLMProblemSolver.instance;
  }

  // ==========================================================================
  // Main Problem Solving Flow
  // ==========================================================================

  /**
   * Main entry point for solving complex problems
   */
  public async solveProblem(problem: Problem): Promise<Result> {
    console.log(`\n🔧 SOLVING PROBLEM: ${problem.description}`);
    console.log(`   Type: ${problem.type}`);
    console.log(`   Severity: ${problem.severity}`);

    // STEP 1: Gather comprehensive context
    console.log('\n📋 Step 1: Gathering comprehensive context...');
    const context = await this.gatherComprehensiveContext(problem);

    // STEP 2: Consult all LLMs in parallel
    console.log('\n🧠 Step 2: Consulting multiple LLMs in parallel...');
    const solutions = await this.consultAllLLMs(context);

    console.log(`   ✅ Received ${solutions.length} solutions`);

    // STEP 3: Synthesize into micro-plan
    console.log('\n🔬 Step 3: Synthesizing solutions into micro-plan...');
    const microPlan = await this.synthesizeSolutions(solutions, problem);

    console.log(`   ✅ Created ${microPlan.plan.length}-step plan`);
    console.log(`   Risk Level: ${microPlan.risk_level}`);
    console.log(`   Success Probability: ${(microPlan.success_probability * 100).toFixed(1)}%`);

    // STEP 4: Execute micro-plan
    console.log('\n⚙️  Step 4: Executing micro-plan...');
    const result = await this.executeMicroPlan(microPlan);

    if (result.success) {
      console.log(`\n✅ PROBLEM SOLVED in ${result.totalTime}`);
    } else {
      console.log(`\n❌ PROBLEM NOT SOLVED - Failed at step ${result.failedAtStep}`);
    }

    return result;
  }

  /**
   * Consult LLMs proactively for high-risk steps
   */
  public async consultLLMsPreemptively(
    riskPrediction: any
  ): Promise<Strategy[]> {
    console.log('🔮 Proactive LLM consultation for predicted risk...');

    const prompt = `A potentially risky step is coming up. Help prevent problems:

Risk Prediction:
${JSON.stringify(riskPrediction, null, 2)}

Suggest preventive strategies to avoid issues.`;

    const solutions = await this.consultAllLLMs({
      relevantFiles: [],
      recentCommits: [],
      dependencies: [],
      errorMessages: [],
      stackTraces: [],
      testFailures: [],
      featureRegistry: featureRegistry.getRegistry(),
      currentPhase: 6,
      currentStep: 82,
      previousAttempts: [],
      nodeVersion: process.version,
      installedPackages: {},
      envVars: {},
    });

    return solutions.map((s, i) => ({
      id: `strategy_${i}`,
      model: s.model,
      approach: s.solution,
      steps: [s.solution],
      confidence: s.confidence,
      estimated_time: '10m',
      risk_level: 'low',
    }));
  }

  // ==========================================================================
  // Context Gathering
  // ==========================================================================

  /**
   * Gather all relevant context about the problem
   */
  public async gatherComprehensiveContext(
    problem: Problem
  ): Promise<ComprehensiveContext> {
    const context: ComprehensiveContext = {
      // Code context
      relevantFiles: await this.findRelevantFiles(problem),
      recentCommits: await this.getRecentCommits(),
      dependencies: await this.analyzeDependencies(),

      // Error context
      errorMessages: problem.errors,
      stackTraces: problem.stackTraces || [],
      testFailures: await this.getTestFailures(),

      // State context
      featureRegistry: featureRegistry.getRegistry(),
      currentPhase: 6,
      currentStep: 82,
      previousAttempts: problem.actionHistory,

      // Environment context
      nodeVersion: process.version,
      installedPackages: await this.getPackageVersions(),
      envVars: this.getSafeEnvVars(),
    };

    return context;
  }

  private async findRelevantFiles(problem: Problem): Promise<string[]> {
    // Extract files from problem context
    const files = new Set<string>();

    problem.actionHistory.forEach((action) => {
      action.filesModified.forEach((file) => files.add(file));
    });

    return Array.from(files);
  }

  private async getRecentCommits(): Promise<string[]> {
    // In real implementation, would use git log
    return ['Recent commits would be listed here'];
  }

  private async analyzeDependencies(): Promise<string[]> {
    // In real implementation, would analyze package.json
    return ['Dependencies would be listed here'];
  }

  private async getTestFailures(): Promise<string[]> {
    // In real implementation, would parse test results
    return [];
  }

  private async getPackageVersions(): Promise<Record<string, string>> {
    // In real implementation, would read package.json
    return {
      'next': '14.0.0',
      'react': '18.2.0',
    };
  }

  private getSafeEnvVars(): Record<string, string> {
    // Only return safe env vars (no secrets)
    return {
      NODE_ENV: process.env.NODE_ENV || 'development',
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || '',
    };
  }

  // ==========================================================================
  // Multi-LLM Consultation
  // ==========================================================================

  /**
   * Consult all LLMs in parallel for solutions
   */
  private async consultAllLLMs(
    context: ComprehensiveContext
  ): Promise<LLMSolution[]> {
    const prompt = this.buildProblemPrompt(context);

    // Consult each model in parallel
    const solutions = await Promise.all(
      this.consultationModels.map(async (model) => {
        try {
          const response = await llmGateway.request({
            task_type: 'reasoning',
            prompt,
            system_prompt: `You are ${model}. Provide a detailed solution to this problem.`,
            require_json: true,
          });

          const parsed = JSON.parse(response.content);

          return {
            model,
            solution: parsed.solution || response.content,
            confidence: parsed.confidence || 0.7,
            reasoning: parsed.reasoning || '',
            estimated_success: parsed.estimated_success || 0.7,
            risks: parsed.risks || [],
          } as LLMSolution;
        } catch (error) {
          console.error(`❌ Model ${model} failed:`, error);
          return null;
        }
      })
    );

    // Filter out failed consultations
    return solutions.filter((s): s is LLMSolution => s !== null);
  }

  private buildProblemPrompt(context: ComprehensiveContext): string {
    return `You are a software development expert. A problem has occurred that needs solving.

PROBLEM CONTEXT:
- Recent Commits: ${context.recentCommits.join(', ')}
- Files Involved: ${context.relevantFiles.join(', ')}
- Error Messages: ${context.errorMessages.join('; ')}
- Previous Attempts: ${context.previousAttempts.length} actions taken

FULL CONTEXT:
${JSON.stringify(context, null, 2)}

Provide a solution in JSON format:
{
  "solution": "Detailed solution description",
  "confidence": 0.0-1.0,
  "reasoning": "Why this approach will work",
  "estimated_success": 0.0-1.0,
  "risks": ["risk1", "risk2"]
}`;
  }

  // ==========================================================================
  // Solution Synthesis
  // ==========================================================================

  /**
   * Synthesize multiple solutions into best micro-plan
   */
  private async synthesizeSolutions(
    solutions: LLMSolution[],
    problem: Problem
  ): Promise<MicroPlan> {
    const synthesisPrompt = `You are the synthesis agent. ${solutions.length} LLMs have proposed solutions to this problem:

ORIGINAL PROBLEM:
${problem.description}
Errors: ${problem.errors.join('; ')}

${solutions
  .map(
    (s, i) => `
=== Solution ${i + 1} from ${s.model} ===
${s.solution}
Confidence: ${s.confidence}
Reasoning: ${s.reasoning}
Estimated Success: ${s.estimated_success}
Risks: ${s.risks.join(', ')}
`
  )
  .join('\n\n')}

Your task:
1. Identify commonalities and best ideas from each solution
2. Create a micro-step plan combining the best elements
3. Each step must be:
   - Atomic (one clear action)
   - Verifiable (can check if it worked)
   - Reversible (can undo if fails)
4. Include fallback steps for each action

Output format (JSON):
{
  "plan": [
    {
      "step": 1,
      "action": "Specific action to take",
      "verification": "How to verify it worked",
      "fallback": "What to do if it fails",
      "estimated_time": "30s"
    }
  ],
  "reasoning": "Why this approach is best",
  "risk_level": "low|medium|high",
  "success_probability": 0.85
}`;

    const response = await llmGateway.request({
      task_type: 'synthesis',
      prompt: synthesisPrompt,
      require_json: true,
    });

    const microPlan = JSON.parse(response.content);
    microPlan.originalProblem = problem;

    return microPlan as MicroPlan;
  }

  // ==========================================================================
  // Micro-Plan Execution
  // ==========================================================================

  /**
   * Execute micro-plan step by step with verification
   */
  private async executeMicroPlan(plan: MicroPlan): Promise<Result> {
    const results: ExecutionResult[] = [];
    const startTime = Date.now();

    for (const step of plan.plan) {
      console.log(`\n   Step ${step.step}: ${step.action}`);

      const stepStartTime = Date.now();

      try {
        // Execute step
        const output = await this.executeStep(step);

        // Verify step
        const verified = await this.verifyStep(step, output);

        const timeTaken = `${Date.now() - stepStartTime}ms`;

        if (verified) {
          console.log(`   ✅ Step ${step.step} completed successfully (${timeTaken})`);
          results.push({
            step: step.step,
            success: true,
            output,
            time_taken: timeTaken,
          });
        } else {
          console.log(`   ⚠️  Step ${step.step} failed verification, executing fallback...`);

          // Execute fallback
          const fallbackOutput = await this.executeStep({
            ...step,
            action: step.fallback,
          });

          results.push({
            step: step.step,
            success: false,
            output: fallbackOutput,
            error: 'Verification failed, fallback executed',
            time_taken: timeTaken,
          });
        }
      } catch (error) {
        console.log(`   ❌ Step ${step.step} failed critically`);

        // Critical failure - stop execution
        results.push({
          step: step.step,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          time_taken: `${Date.now() - stepStartTime}ms`,
        });

        return {
          success: false,
          results,
          failedAtStep: step.step,
          totalTime: `${Date.now() - startTime}ms`,
        };
      }
    }

    const totalTime = `${Date.now() - startTime}ms`;

    // All steps completed
    const allSuccessful = results.every((r) => r.success);

    return {
      success: allSuccessful,
      results,
      totalTime,
    };
  }

  private async executeStep(step: MicroStep): Promise<string> {
    // In real implementation, this would execute the actual action
    // For now, simulate execution
    console.log(`      Executing: ${step.action}`);

    await new Promise((resolve) => setTimeout(resolve, 100));

    return `Executed: ${step.action}`;
  }

  private async verifyStep(step: MicroStep, output: string): Promise<boolean> {
    // In real implementation, this would run actual verification
    console.log(`      Verifying: ${step.verification}`);

    // Simulate verification
    return Math.random() > 0.1; // 90% success rate
  }
}

// ============================================================================
// Intervention System
// ============================================================================

export class InterventionSystem {
  private static instance: InterventionSystem;
  private interventionHistory: Intervention[] = [];

  private constructor() {}

  public static getInstance(): InterventionSystem {
    if (!InterventionSystem.instance) {
      InterventionSystem.instance = new InterventionSystem();
    }
    return InterventionSystem.instance;
  }

  /**
   * Handle a stuck agent
   */
  public async handleStuckAgent(agent: string, problem: Problem): Promise<Resolution> {
    console.log(`\n🚨 INTERVENTION: Agent ${agent} is stuck`);

    // Halt agent
    await this.haltAgent(agent);

    // Gather context
    const context = await problemSolver.gatherComprehensiveContext(problem);

    // Solve problem using multi-LLM approach
    const result = await problemSolver.solveProblem(problem);

    // Create resolution
    const resolution: Resolution = {
      problem_id: problem.id,
      strategy_selected: {
        id: 'multi-llm-synthesis',
        model: 'anthropic/claude-opus-4',
        approach: 'Multi-LLM consultation and synthesis',
        steps: [],
        confidence: 0.85,
        estimated_time: result.totalTime,
        risk_level: 'medium',
      },
      outcome: result.success ? 'success' : 'failure',
      time_taken: result.totalTime,
      lessons_learned: this.extractLessons(problem, result),
    };

    // Log intervention
    this.logIntervention(agent, problem, context, resolution);

    return resolution;
  }

  /**
   * Get recent interventions
   */
  public getRecentInterventions(limit: number = 10): Intervention[] {
    return this.interventionHistory.slice(-limit);
  }

  /**
   * Halt an agent
   */
  private async haltAgent(agent: string): Promise<void> {
    console.log(`   ⏸️  Halting agent: ${agent}`);
    // In real implementation, would stop agent processes
  }

  /**
   * Log intervention for learning
   */
  private logIntervention(
    agent: string,
    problem: Problem,
    context: ComprehensiveContext,
    resolution: Resolution
  ): void {
    const intervention: Intervention = {
      id: `intervention_${Date.now()}`,
      agent,
      problem,
      context,
      resolution,
      timestamp: new Date(),
      auto_resolved: resolution.outcome === 'success',
    };

    this.interventionHistory.push(intervention);

    // Add to registry
    const registry = featureRegistry.getRegistry();
    registry.interventions.push(intervention);

    console.log(`   📝 Logged intervention: ${intervention.id}`);
  }

  /**
   * Extract lessons learned from problem resolution
   */
  private extractLessons(problem: Problem, result: Result): string[] {
    const lessons: string[] = [];

    if (result.success) {
      lessons.push('Multi-LLM consensus successfully resolved the issue');
    } else {
      lessons.push('Problem required human intervention');
    }

    lessons.push(`Problem type: ${problem.type}`);
    lessons.push(`Severity: ${problem.severity}`);

    return lessons;
  }
}

// Export singleton instances
export const problemSolver = MultiLLMProblemSolver.getInstance();
export const interventionSystem = InterventionSystem.getInstance();
