#!/usr/bin/env node

/**
 * Flaky Test Analysis Script
 * Analyzes QA run history to detect unreliable tests and flag them for triage
 */

import { z } from 'zod';

// Configuration schema
const AnalysisConfigSchema = z.object({
  lookback_days: z.number().default(30),
  failure_threshold: z.number().min(0).max(1).default(0.1), // 10% failure rate
  min_runs: z.number().default(5), // Minimum runs to consider
  consecutive_failures: z.number().default(2), // Flag if 2+ non-consecutive failures
  output_format: z.enum(['console', 'json', 'csv']).default('console'),
  update_database: z.boolean().default(true),
});

type AnalysisConfig = z.infer<typeof AnalysisConfigSchema>;

// Flaky test result schema
const FlakyTestSchema = z.object({
  test_id: z.string(),
  test_name: z.string(),
  total_runs: z.number(),
  failed_runs: z.number(),
  failure_rate: z.number(),
  last_failure_at: z.string().datetime().optional(),
  failure_pattern: z.enum(['intermittent', 'recent_regression', 'consistently_failing']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  recommended_action: z.string(),
  metadata: z.record(z.any()),
});

type FlakyTest = z.infer<typeof FlakyTestSchema>;

/**
 * Flaky Test Analyzer
 */
export class FlakyTestAnalyzer {
  private config: AnalysisConfig;

  constructor(config: Partial<AnalysisConfig> = {}) {
    this.config = AnalysisConfigSchema.parse(config);
  }

  /**
   * Run flaky test analysis
   */
  async analyze(): Promise<FlakyTest[]> {
    console.log('[FLAKY_ANALYZER] Starting flaky test analysis');
    console.log(`[FLAKY_ANALYZER] Lookback period: ${this.config.lookback_days} days`);
    console.log(`[FLAKY_ANALYZER] Failure threshold: ${this.config.failure_threshold * 100}%`);

    try {
      // Fetch QA run data
      const qaRuns = await this.fetchQARunData();
      console.log(`[FLAKY_ANALYZER] Analyzing ${qaRuns.length} QA runs`);

      // Group runs by test
      const testGroups = this.groupRunsByTest(qaRuns);
      console.log(`[FLAKY_ANALYZER] Found ${Object.keys(testGroups).length} unique tests`);

      // Analyze each test for flakiness
      const flakyTests: FlakyTest[] = [];
      
      for (const [testId, runs] of Object.entries(testGroups)) {
        const analysis = this.analyzeTestFlakiness(testId, runs);
        if (analysis) {
          flakyTests.push(analysis);
        }
      }

      console.log(`[FLAKY_ANALYZER] Detected ${flakyTests.length} flaky tests`);

      // Sort by severity and failure rate
      flakyTests.sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
        if (severityDiff !== 0) return severityDiff;
        return b.failure_rate - a.failure_rate;
      });

      // Output results
      await this.outputResults(flakyTests);

      // Update database if configured
      if (this.config.update_database) {
        await this.updateFlakyTestsDatabase(flakyTests);
      }

      return flakyTests;

    } catch (error) {
      console.error('[FLAKY_ANALYZER] Analysis failed:', error);
      throw error;
    }
  }

  /**
   * Fetch QA run data from the last N days
   */
  private async fetchQARunData(): Promise<any[]> {
    // In production, this would query Supabase qa_runs table
    // For now, simulate with mock data
    
    const mockRuns = [];
    const now = new Date();
    const lookbackMs = this.config.lookback_days * 24 * 60 * 60 * 1000;
    
    // Generate mock QA runs for the last N days
    for (let i = 0; i < 50; i++) {
      const runDate = new Date(now.getTime() - Math.random() * lookbackMs);
      
      mockRuns.push({
        id: `run_${i}`,
        microstep_id: `p${Math.floor(Math.random() * 6) + 1}.s${Math.floor(Math.random() * 3) + 1}.ms${Math.floor(Math.random() * 4) + 1}`,
        criteria: [
          {
            id: `test_api_validation_${Math.floor(Math.random() * 5)}`,
            description: 'API returns valid JSON response',
            status: Math.random() > 0.15 ? 'passed' : 'failed', // 15% failure rate
          },
          {
            id: `test_ui_rendering_${Math.floor(Math.random() * 3)}`,
            description: 'UI component renders correctly',
            status: Math.random() > 0.05 ? 'passed' : 'failed', // 5% failure rate
          },
          {
            id: 'test_flaky_network',
            description: 'Network request completes successfully',
            status: Math.random() > 0.25 ? 'passed' : 'failed', // 25% failure rate (flaky!)
          },
        ],
        started_at: runDate.toISOString(),
        environment: 'development',
      });
    }

    return mockRuns;
  }

  /**
   * Group QA runs by individual test
   */
  private groupRunsByTest(qaRuns: any[]): Record<string, any[]> {
    const testGroups: Record<string, any[]> = {};

    for (const run of qaRuns) {
      for (const criterion of run.criteria || []) {
        const testId = criterion.id;
        
        if (!testGroups[testId]) {
          testGroups[testId] = [];
        }

        testGroups[testId].push({
          run_id: run.id,
          microstep_id: run.microstep_id,
          test_id: testId,
          test_name: criterion.description,
          status: criterion.status,
          started_at: run.started_at,
          environment: run.environment,
        });
      }
    }

    return testGroups;
  }

  /**
   * Analyze a specific test for flakiness
   */
  private analyzeTestFlakiness(testId: string, runs: any[]): FlakyTest | null {
    if (runs.length < this.config.min_runs) {
      return null; // Not enough data
    }

    const totalRuns = runs.length;
    const failedRuns = runs.filter(r => r.status === 'failed').length;
    const failureRate = failedRuns / totalRuns;

    // Check if failure rate exceeds threshold
    if (failureRate < this.config.failure_threshold) {
      return null; // Not flaky enough
    }

    // Analyze failure pattern
    const failurePattern = this.analyzeFailurePattern(runs);
    const severity = this.calculateSeverity(failureRate, failurePattern, totalRuns);
    const recommendedAction = this.getRecommendedAction(severity, failurePattern);

    // Find last failure
    const failedRunsSorted = runs
      .filter(r => r.status === 'failed')
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
    
    const lastFailureAt = failedRunsSorted.length > 0 ? failedRunsSorted[0].started_at : undefined;

    return {
      test_id: testId,
      test_name: runs[0].test_name,
      total_runs: totalRuns,
      failed_runs: failedRuns,
      failure_rate: Math.round(failureRate * 10000) / 100, // Round to 2 decimal places
      last_failure_at: lastFailureAt,
      failure_pattern: failurePattern,
      severity: severity,
      recommended_action: recommendedAction,
      metadata: {
        environments: [...new Set(runs.map(r => r.environment))],
        microsteps: [...new Set(runs.map(r => r.microstep_id))],
        first_seen: runs.sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime())[0].started_at,
        last_seen: runs.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())[0].started_at,
      },
    };
  }

  /**
   * Analyze the pattern of failures
   */
  private analyzeFailurePattern(runs: any[]): 'intermittent' | 'recent_regression' | 'consistently_failing' {
    const sortedRuns = runs.sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime());
    
    // Check recent runs (last 25%)
    const recentCount = Math.max(1, Math.floor(runs.length * 0.25));
    const recentRuns = sortedRuns.slice(-recentCount);
    const recentFailureRate = recentRuns.filter(r => r.status === 'failed').length / recentRuns.length;

    if (recentFailureRate > 0.8) {
      return 'consistently_failing';
    }

    // Check if failures are recent (last 50% of runs have higher failure rate)
    const midPoint = Math.floor(runs.length / 2);
    const earlyRuns = sortedRuns.slice(0, midPoint);
    const laterRuns = sortedRuns.slice(midPoint);
    
    const earlyFailureRate = earlyRuns.filter(r => r.status === 'failed').length / earlyRuns.length;
    const laterFailureRate = laterRuns.filter(r => r.status === 'failed').length / laterRuns.length;

    if (laterFailureRate > earlyFailureRate * 2) {
      return 'recent_regression';
    }

    return 'intermittent';
  }

  /**
   * Calculate severity based on failure rate and pattern
   */
  private calculateSeverity(failureRate: number, pattern: string, totalRuns: number): 'low' | 'medium' | 'high' | 'critical' {
    if (pattern === 'consistently_failing' && failureRate > 0.8) {
      return 'critical';
    }

    if (failureRate > 0.5) {
      return 'high';
    }

    if (failureRate > 0.25 || pattern === 'recent_regression') {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Get recommended action based on analysis
   */
  private getRecommendedAction(severity: string, pattern: string): string {
    switch (severity) {
      case 'critical':
        return 'Immediate investigation required - test is consistently failing';
      case 'high':
        return 'High priority - investigate root cause and fix';
      case 'medium':
        if (pattern === 'recent_regression') {
          return 'Medium priority - recent regression detected, review recent changes';
        }
        return 'Medium priority - investigate intermittent failures';
      case 'low':
        return 'Low priority - monitor for trend changes';
      default:
        return 'Review and monitor';
    }
  }

  /**
   * Output analysis results
   */
  private async outputResults(flakyTests: FlakyTest[]): Promise<void> {
    switch (this.config.output_format) {
      case 'json':
        console.log(JSON.stringify(flakyTests, null, 2));
        break;
      
      case 'csv':
        this.outputCSV(flakyTests);
        break;
      
      default:
        this.outputConsole(flakyTests);
    }
  }

  /**
   * Output results to console in human-readable format
   */
  private outputConsole(flakyTests: FlakyTest[]): void {
    if (flakyTests.length === 0) {
      console.log('\n✅ No flaky tests detected!');
      return;
    }

    console.log('\n🚨 FLAKY TESTS DETECTED\n');
    console.log('=' .repeat(80));

    for (const test of flakyTests) {
      const severityEmoji = {
        critical: '🔴',
        high: '🟠', 
        medium: '🟡',
        low: '🟢'
      }[test.severity];

      console.log(`\n${severityEmoji} ${test.severity.toUpperCase()}: ${test.test_name}`);
      console.log(`   Test ID: ${test.test_id}`);
      console.log(`   Failure Rate: ${test.failure_rate}% (${test.failed_runs}/${test.total_runs} runs)`);
      console.log(`   Pattern: ${test.failure_pattern}`);
      console.log(`   Action: ${test.recommended_action}`);
      
      if (test.last_failure_at) {
        console.log(`   Last Failure: ${new Date(test.last_failure_at).toLocaleString()}`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log(`Total flaky tests: ${flakyTests.length}`);
    
    const severityCounts = flakyTests.reduce((acc, test) => {
      acc[test.severity] = (acc[test.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('Severity breakdown:', severityCounts);
  }

  /**
   * Output results in CSV format
   */
  private outputCSV(flakyTests: FlakyTest[]): void {
    const headers = [
      'test_id',
      'test_name', 
      'failure_rate',
      'total_runs',
      'failed_runs',
      'severity',
      'failure_pattern',
      'last_failure_at',
      'recommended_action'
    ];

    console.log(headers.join(','));

    for (const test of flakyTests) {
      const row = [
        test.test_id,
        `"${test.test_name}"`,
        test.failure_rate,
        test.total_runs,
        test.failed_runs,
        test.severity,
        test.failure_pattern,
        test.last_failure_at || '',
        `"${test.recommended_action}"`
      ];
      console.log(row.join(','));
    }
  }

  /**
   * Update flaky tests database
   */
  private async updateFlakyTestsDatabase(flakyTests: FlakyTest[]): Promise<void> {
    try {
      console.log(`[FLAKY_ANALYZER] Updating database with ${flakyTests.length} flaky tests`);

      // In production, this would update the qa_flaky_tests table
      for (const test of flakyTests) {
        console.log(`[FLAKY_ANALYZER] Recording flaky test: ${test.test_id} (${test.failure_rate}% failure rate)`);
        
        // Simulate database update
        // await supabase.from('qa_flaky_tests').upsert({
        //   test_id: test.test_id,
        //   test_name: test.test_name,
        //   failure_rate: test.failure_rate / 100,
        //   total_runs: test.total_runs,
        //   failed_runs: test.failed_runs,
        //   last_failure_at: test.last_failure_at,
        //   status: 'active',
        //   metadata: test.metadata,
        // });
      }

      // Log audit event
      console.log('[FLAKY_ANALYZER] Audit event: flaky_analysis_completed');

    } catch (error) {
      console.error('[FLAKY_ANALYZER] Failed to update database:', error);
    }
  }
}

/**
 * CLI Entry Point
 */
async function main() {
  const args = process.argv.slice(2);
  
  const config: Partial<AnalysisConfig> = {};

  // Parse CLI arguments
  for (const arg of args) {
    if (arg.startsWith('--lookback-days=')) {
      config.lookback_days = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--threshold=')) {
      config.failure_threshold = parseFloat(arg.split('=')[1]);
    } else if (arg.startsWith('--min-runs=')) {
      config.min_runs = parseInt(arg.split('=')[1]);
    } else if (arg === '--json') {
      config.output_format = 'json';
    } else if (arg === '--csv') {
      config.output_format = 'csv';
    } else if (arg === '--no-update') {
      config.update_database = false;
    }
  }

  const analyzer = new FlakyTestAnalyzer(config);
  
  try {
    const flakyTests = await analyzer.analyze();
    
    // Exit with error code if critical flaky tests found
    const criticalTests = flakyTests.filter(t => t.severity === 'critical');
    if (criticalTests.length > 0) {
      console.error(`\n❌ Found ${criticalTests.length} critical flaky tests`);
      process.exit(1);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('Flaky test analysis failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { FlakyTestAnalyzer, FlakyTestSchema, AnalysisConfigSchema };
