#!/usr/bin/env node

/**
 * BuildRunner QA Runner
 * Automated test execution engine for acceptance criteria validation
 */

import { z } from 'zod';
import fs from 'fs-extra';
import path from 'path';

// QA Run Configuration Schema
const QAConfigSchema = z.object({
  project_id: z.string().uuid().optional(),
  environment: z.enum(['development', 'staging', 'production']).default('development'),
  parallel: z.boolean().default(false),
  timeout_ms: z.number().default(300000), // 5 minutes
  retry_count: z.number().default(1),
  evidence_collection: z.boolean().default(true),
  filters: z.object({
    microstep_ids: z.array(z.string()).optional(),
    priorities: z.array(z.enum(['P1', 'P2', 'P3'])).optional(),
    test_methods: z.array(z.string()).optional(),
    automation_levels: z.array(z.enum(['manual', 'semi_automated', 'fully_automated'])).optional(),
  }).optional(),
});

type QAConfig = z.infer<typeof QAConfigSchema>;

// QA Run Result Schema
const QAResultSchema = z.object({
  run_id: z.string().uuid(),
  microstep_id: z.string(),
  criteria: z.array(z.object({
    id: z.string(),
    description: z.string(),
    status: z.enum(['passed', 'failed', 'skipped', 'error']),
    execution_time_ms: z.number(),
    error_message: z.string().optional(),
    evidence: z.array(z.object({
      type: z.string(),
      path: z.string(),
      description: z.string(),
    })).optional(),
  })),
  overall_status: z.enum(['passed', 'failed', 'error']),
  started_at: z.string().datetime(),
  completed_at: z.string().datetime(),
  duration_ms: z.number(),
  environment: z.string(),
  runner_version: z.string(),
  metadata: z.record(z.any()),
});

type QAResult = z.infer<typeof QAResultSchema>;

/**
 * QA Runner Engine
 */
export class QARunner {
  private config: QAConfig;
  private runId: string;
  private results: QAResult[] = [];

  constructor(config: Partial<QAConfig> = {}) {
    this.config = QAConfigSchema.parse(config);
    this.runId = crypto.randomUUID();
  }

  /**
   * Execute QA run for all eligible microsteps
   */
  async run(): Promise<{ summary: any; results: QAResult[] }> {
    console.log(`[QA_RUNNER] Starting QA run ${this.runId}`);
    console.log(`[QA_RUNNER] Environment: ${this.config.environment}`);
    
    const startTime = Date.now();
    
    try {
      // Load plan data
      const planData = await this.loadPlanData();
      
      // Find microsteps with status="doing" or matching filters
      const eligibleMicrosteps = this.findEligibleMicrosteps(planData);
      
      console.log(`[QA_RUNNER] Found ${eligibleMicrosteps.length} eligible microsteps`);
      
      if (eligibleMicrosteps.length === 0) {
        console.log('[QA_RUNNER] No microsteps to test');
        return { summary: this.generateSummary(0, 0, 0), results: [] };
      }

      // Execute tests for each microstep
      for (const microstep of eligibleMicrosteps) {
        await this.executeMicrostepTests(microstep);
      }

      // Generate summary
      const summary = this.generateSummary(
        this.results.length,
        this.results.filter(r => r.overall_status === 'passed').length,
        this.results.filter(r => r.overall_status === 'failed').length
      );

      // Store results
      await this.storeResults();

      const duration = Date.now() - startTime;
      console.log(`[QA_RUNNER] Completed in ${duration}ms`);
      
      return { summary, results: this.results };

    } catch (error) {
      console.error('[QA_RUNNER] Fatal error:', error);
      throw error;
    }
  }

  /**
   * Load plan data from local file or API
   */
  private async loadPlanData(): Promise<any> {
    const planPath = path.join(process.cwd(), 'buildrunner/specs/plan.json');
    
    if (await fs.pathExists(planPath)) {
      return await fs.readJSON(planPath);
    }
    
    // Fallback to API if local file not found
    const response = await fetch('/api/plans/local');
    if (!response.ok) {
      throw new Error('Failed to load plan data');
    }
    
    return await response.json();
  }

  /**
   * Find microsteps eligible for testing
   */
  private findEligibleMicrosteps(planData: any): any[] {
    const microsteps: any[] = [];
    
    for (const milestone of planData.milestones || []) {
      for (const step of milestone.steps || []) {
        for (const microstep of step.microsteps || []) {
          // Include microsteps with status="doing" or matching filters
          if (this.shouldTestMicrostep(microstep)) {
            microsteps.push({
              ...microstep,
              milestone_id: milestone.id,
              step_id: step.id,
            });
          }
        }
      }
    }
    
    return microsteps;
  }

  /**
   * Check if microstep should be tested
   */
  private shouldTestMicrostep(microstep: any): boolean {
    // Always test microsteps with status="doing"
    if (microstep.status === 'doing') {
      return true;
    }

    // Apply filters if specified
    const filters = this.config.filters;
    if (!filters) return false;

    if (filters.microstep_ids && !filters.microstep_ids.includes(microstep.id)) {
      return false;
    }

    // Additional filter logic would go here
    return false;
  }

  /**
   * Execute tests for a specific microstep
   */
  private async executeMicrostepTests(microstep: any): Promise<void> {
    console.log(`[QA_RUNNER] Testing microstep: ${microstep.id}`);
    
    const startTime = Date.now();
    const criteriaResults: any[] = [];
    
    try {
      // Get acceptance criteria for this microstep
      const criteria = microstep.criteria || [];
      
      for (const criterion of criteria) {
        const criterionResult = await this.executeCriterion(microstep, criterion);
        criteriaResults.push(criterionResult);
      }

      // Determine overall status
      const overallStatus = criteriaResults.some(c => c.status === 'failed') ? 'failed' : 'passed';
      
      const result: QAResult = {
        run_id: this.runId,
        microstep_id: microstep.id,
        criteria: criteriaResults,
        overall_status: overallStatus,
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime,
        environment: this.config.environment,
        runner_version: '1.0.0',
        metadata: {
          milestone_id: microstep.milestone_id,
          step_id: microstep.step_id,
          title: microstep.title,
        },
      };

      this.results.push(result);
      
      console.log(`[QA_RUNNER] Microstep ${microstep.id}: ${overallStatus}`);

    } catch (error) {
      console.error(`[QA_RUNNER] Error testing microstep ${microstep.id}:`, error);
      
      const errorResult: QAResult = {
        run_id: this.runId,
        microstep_id: microstep.id,
        criteria: criteriaResults,
        overall_status: 'error',
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime,
        environment: this.config.environment,
        runner_version: '1.0.0',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };

      this.results.push(errorResult);
    }
  }

  /**
   * Execute a single acceptance criterion
   */
  private async executeCriterion(microstep: any, criterion: string): Promise<any> {
    const startTime = Date.now();
    
    try {
      // For now, simulate test execution
      // In production, this would integrate with actual test frameworks
      
      console.log(`[QA_RUNNER]   Testing criterion: ${criterion}`);
      
      // Simulate test execution time
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      
      // Simulate test result (90% pass rate for demo)
      const passed = Math.random() > 0.1;
      
      const evidence = this.config.evidence_collection ? await this.collectEvidence(microstep, criterion) : [];
      
      return {
        id: `criterion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        description: criterion,
        status: passed ? 'passed' : 'failed',
        execution_time_ms: Date.now() - startTime,
        error_message: passed ? undefined : 'Simulated test failure',
        evidence,
      };

    } catch (error) {
      return {
        id: `criterion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        description: criterion,
        status: 'error',
        execution_time_ms: Date.now() - startTime,
        error_message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Collect evidence for a test execution
   */
  private async collectEvidence(microstep: any, criterion: string): Promise<any[]> {
    const evidence: any[] = [];
    
    // Simulate evidence collection
    if (Math.random() > 0.5) {
      evidence.push({
        type: 'screenshot',
        path: `/evidence/${this.runId}/${microstep.id}_screenshot.png`,
        description: `Screenshot for criterion: ${criterion}`,
      });
    }
    
    if (Math.random() > 0.7) {
      evidence.push({
        type: 'log_file',
        path: `/evidence/${this.runId}/${microstep.id}_logs.txt`,
        description: `Execution logs for criterion: ${criterion}`,
      });
    }
    
    return evidence;
  }

  /**
   * Store results to Supabase
   */
  private async storeResults(): Promise<void> {
    try {
      // In production, this would store to Supabase qa_runs table
      console.log(`[QA_RUNNER] Storing ${this.results.length} results`);
      
      // For now, just log the results
      for (const result of this.results) {
        console.log(`[QA_RUNNER] Result: ${result.microstep_id} - ${result.overall_status}`);
      }
      
      // Simulate API call
      // await fetch('/api/qa/results', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ results: this.results }),
      // });

    } catch (error) {
      console.error('[QA_RUNNER] Failed to store results:', error);
    }
  }

  /**
   * Generate run summary
   */
  private generateSummary(total: number, passed: number, failed: number) {
    return {
      run_id: this.runId,
      total_tests: total,
      passed_tests: passed,
      failed_tests: failed,
      error_tests: total - passed - failed,
      pass_rate: total > 0 ? Math.round((passed / total) * 100) : 0,
      environment: this.config.environment,
      started_at: new Date().toISOString(),
      runner_version: '1.0.0',
    };
  }
}

/**
 * CLI Entry Point
 */
async function main() {
  const args = process.argv.slice(2);
  const configFile = args.find(arg => arg.startsWith('--config='))?.split('=')[1];
  
  let config: Partial<QAConfig> = {};
  
  if (configFile && await fs.pathExists(configFile)) {
    config = await fs.readJSON(configFile);
  }

  // Override with CLI args
  if (args.includes('--parallel')) {
    config.parallel = true;
  }
  
  if (args.includes('--environment=development')) {
    config.environment = 'development';
  }
  
  if (args.includes('--environment=staging')) {
    config.environment = 'staging';
  }
  
  if (args.includes('--environment=production')) {
    config.environment = 'production';
  }

  const runner = new QARunner(config);
  
  try {
    const { summary, results } = await runner.run();
    
    console.log('\n=== QA RUN SUMMARY ===');
    console.log(`Run ID: ${summary.run_id}`);
    console.log(`Environment: ${summary.environment}`);
    console.log(`Total Tests: ${summary.total_tests}`);
    console.log(`Passed: ${summary.passed_tests}`);
    console.log(`Failed: ${summary.failed_tests}`);
    console.log(`Pass Rate: ${summary.pass_rate}%`);
    
    // Output JSON for CI consumption
    if (args.includes('--json')) {
      console.log('\n=== JSON OUTPUT ===');
      console.log(JSON.stringify({ summary, results }, null, 2));
    }
    
    // Exit with error code if tests failed
    process.exit(summary.failed_tests > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('QA Runner failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { QARunner, QAConfigSchema, QAResultSchema };
