#!/usr/bin/env ts-node
/**
 * Performance Benchmark Suite
 *
 * Compares raw Claude CLI performance vs BuildRunner with various optimization levels
 *
 * Usage:
 *   npm run benchmark
 *   ts-node scripts/benchmark.ts
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const exec = promisify(require('child_process').exec);

// ============================================================
// Configuration
// ============================================================

const BENCHMARK_CONFIG = {
  outputFile: path.join(__dirname, '../benchmark-results.json'),
  testProjectPath: path.join(__dirname, '../../../test-benchmark-project'),
  iterations: 1, // Number of times to run each benchmark
  timeout: 600000, // 10 minutes max per test
};

// ============================================================
// Test Tasks
// ============================================================

const TEST_TASKS = [
  {
    id: 'task-1',
    description: 'Create a login page with email/password fields',
    prompt: 'Create a Next.js login page with email and password input fields, a submit button, and basic form validation. Use Tailwind CSS for styling.',
    estimatedMinutes: 5
  },
  {
    id: 'task-2',
    description: 'Create a dashboard page with stats cards',
    prompt: 'Create a dashboard page with 4 statistics cards showing revenue, users, orders, and growth. Use Tailwind CSS and make it responsive.',
    estimatedMinutes: 7
  },
  {
    id: 'task-3',
    description: 'Create an API route for user authentication',
    prompt: 'Create a Next.js API route at /api/auth/login that validates user credentials and returns a JWT token. Use bcrypt for password hashing.',
    estimatedMinutes: 6
  },
  {
    id: 'task-4',
    description: 'Create a user profile page',
    prompt: 'Create a user profile page with editable fields for name, email, bio, and avatar upload. Include a save button that calls an API.',
    estimatedMinutes: 8
  },
  {
    id: 'task-5',
    description: 'Create a data table component',
    prompt: 'Create a reusable data table component that displays tabular data with sorting, filtering, and pagination. Use TypeScript.',
    estimatedMinutes: 10
  },
  {
    id: 'task-6',
    description: 'Create API route for fetching users',
    prompt: 'Create a Next.js API route at /api/users that fetches a list of users from a PostgreSQL database using Prisma ORM.',
    estimatedMinutes: 5
  },
  {
    id: 'task-7',
    description: 'Create a settings page',
    prompt: 'Create a settings page with tabs for Account, Security, and Notifications. Each tab should have relevant form fields.',
    estimatedMinutes: 9
  },
  {
    id: 'task-8',
    description: 'Create a navigation header component',
    prompt: 'Create a responsive navigation header with logo, menu items, user avatar dropdown, and mobile hamburger menu. Use Tailwind CSS.',
    estimatedMinutes: 7
  },
  {
    id: 'task-9',
    description: 'Create API route for updating user',
    prompt: 'Create a Next.js API route at /api/users/[id] that handles PATCH requests to update user data in the database.',
    estimatedMinutes: 5
  },
  {
    id: 'task-10',
    description: 'Create a modal component',
    prompt: 'Create a reusable modal component that can display any content, with close button, backdrop overlay, and ESC key support.',
    estimatedMinutes: 6
  },
  {
    id: 'task-11',
    description: 'Create a form validation utility',
    prompt: 'Create a TypeScript utility for form validation with functions to validate email, password strength, required fields, and phone numbers.',
    estimatedMinutes: 4
  },
  {
    id: 'task-12',
    description: 'Create a loading skeleton component',
    prompt: 'Create a loading skeleton component that shows placeholder UI while data is loading. Should work for cards, lists, and text.',
    estimatedMinutes: 5
  },
  {
    id: 'task-13',
    description: 'Create API middleware for authentication',
    prompt: 'Create middleware for Next.js API routes that verifies JWT tokens and attaches user info to the request object.',
    estimatedMinutes: 6
  },
  {
    id: 'task-14',
    description: 'Create a toast notification system',
    prompt: 'Create a toast notification system with success, error, warning, and info variants. Should auto-dismiss after 5 seconds.',
    estimatedMinutes: 7
  },
  {
    id: 'task-15',
    description: 'Create a search input component',
    prompt: 'Create a search input component with debounced search, clear button, and keyboard navigation. Should call an API endpoint.',
    estimatedMinutes: 6
  }
];

// ============================================================
// Benchmark Runners
// ============================================================

interface BenchmarkResult {
  name: string;
  duration: number;
  tasksCompleted: number;
  errors: number;
  avgTaskDuration: number;
  timestamp: Date;
}

class BenchmarkRunner {
  async runRawClaudeCLI(): Promise<BenchmarkResult> {
    console.log('\n🔥 Running Raw Claude CLI Benchmark...\n');

    const startTime = Date.now();
    let tasksCompleted = 0;
    let errors = 0;

    // Check if claude CLI is available
    try {
      await exec('which claude');
    } catch (error) {
      console.warn('⚠️  Claude CLI not found in PATH. Skipping raw Claude benchmark.');
      console.warn('   Install Claude CLI to run this benchmark.');
      return {
        name: 'Raw Claude CLI',
        duration: 0,
        tasksCompleted: 0,
        errors: 0,
        avgTaskDuration: 0,
        timestamp: new Date()
      };
    }

    // Create test project directory
    this.setupTestProject();

    for (const task of TEST_TASKS) {
      console.log(`  → Task ${task.id}: ${task.description}`);

      try {
        const taskStart = Date.now();

        // Run claude command
        await this.executeClaudeCommand(task.prompt);

        const taskDuration = Date.now() - taskStart;
        console.log(`    ✓ Completed in ${(taskDuration / 1000).toFixed(1)}s`);

        tasksCompleted++;
      } catch (error) {
        console.error(`    ✗ Error: ${error}`);
        errors++;
      }
    }

    const duration = Date.now() - startTime;

    return {
      name: 'Raw Claude CLI',
      duration,
      tasksCompleted,
      errors,
      avgTaskDuration: duration / tasksCompleted,
      timestamp: new Date()
    };
  }

  async runBuildRunner(enableOptimizations: boolean): Promise<BenchmarkResult> {
    const name = enableOptimizations
      ? 'BuildRunner (All Optimizations)'
      : 'BuildRunner (No Optimizations)';

    console.log(`\n🏗️  Running ${name}...\n`);

    // Set environment variables
    process.env.ENABLE_PERSISTENT_SESSIONS = enableOptimizations ? 'true' : 'false';
    process.env.ENABLE_PARALLEL_EXECUTION = enableOptimizations ? 'true' : 'false';

    const startTime = Date.now();
    let tasksCompleted = 0;
    let errors = 0;

    // TODO: Integrate with actual BuildOrchestrator
    // For now, this is a placeholder that simulates BuildRunner execution

    console.log('⚠️  BuildRunner benchmark not yet implemented');
    console.log('   This requires integration with BuildOrchestrator');
    console.log('   Will be implemented in Phase 5.6');

    const duration = Date.now() - startTime;

    return {
      name,
      duration,
      tasksCompleted,
      errors,
      avgTaskDuration: duration > 0 ? duration / tasksCompleted : 0,
      timestamp: new Date()
    };
  }

  private setupTestProject() {
    // Create test project directory if it doesn't exist
    if (!fs.existsSync(BENCHMARK_CONFIG.testProjectPath)) {
      fs.mkdirSync(BENCHMARK_CONFIG.testProjectPath, { recursive: true });
    }

    // Initialize basic Next.js structure
    const appDir = path.join(BENCHMARK_CONFIG.testProjectPath, 'app');
    if (!fs.existsSync(appDir)) {
      fs.mkdirSync(appDir, { recursive: true });
    }

    // Create package.json if it doesn't exist
    const packageJsonPath = path.join(BENCHMARK_CONFIG.testProjectPath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      const packageJson = {
        name: 'benchmark-test-project',
        version: '1.0.0',
        dependencies: {
          'next': '^14.0.0',
          'react': '^18.0.0',
          'react-dom': '^18.0.0'
        }
      };
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }
  }

  private async executeClaudeCommand(prompt: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const claude = spawn('claude', ['--model', 'claude-sonnet-4'], {
        cwd: BENCHMARK_CONFIG.testProjectPath,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      claude.stdout.on('data', (data) => {
        output += data.toString();
      });

      claude.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      claude.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Claude CLI exited with code ${code}: ${errorOutput}`));
        }
      });

      claude.on('error', (error) => {
        reject(error);
      });

      // Send prompt to Claude
      claude.stdin.write(prompt + '\n');
      claude.stdin.end();

      // Timeout after 2 minutes per task
      setTimeout(() => {
        claude.kill();
        reject(new Error('Task timeout after 2 minutes'));
      }, 120000);
    });
  }
}

// ============================================================
// Results Analysis
// ============================================================

interface BenchmarkComparison {
  rawClaude: BenchmarkResult;
  buildRunnerNoOpts: BenchmarkResult;
  buildRunnerAllOpts: BenchmarkResult;
  analysis: {
    baselineTime: number;
    noOptsMultiplier: number;
    allOptsMultiplier: number;
    meetsTarget: boolean;
    targetMultiplier: number;
  };
}

function analyzeResults(
  rawClaude: BenchmarkResult,
  buildRunnerNoOpts: BenchmarkResult,
  buildRunnerAllOpts: BenchmarkResult
): BenchmarkComparison {
  const baselineTime = rawClaude.duration;
  const noOptsMultiplier = baselineTime > 0 ? buildRunnerNoOpts.duration / baselineTime : 0;
  const allOptsMultiplier = baselineTime > 0 ? buildRunnerAllOpts.duration / baselineTime : 0;
  const targetMultiplier = 1.3;
  const meetsTarget = allOptsMultiplier <= targetMultiplier;

  return {
    rawClaude,
    buildRunnerNoOpts,
    buildRunnerAllOpts,
    analysis: {
      baselineTime,
      noOptsMultiplier,
      allOptsMultiplier,
      meetsTarget,
      targetMultiplier
    }
  };
}

function printResults(comparison: BenchmarkComparison) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 BENCHMARK RESULTS');
  console.log('='.repeat(80) + '\n');

  const results = [
    comparison.rawClaude,
    comparison.buildRunnerNoOpts,
    comparison.buildRunnerAllOpts
  ];

  // Table header
  console.log('Configuration'.padEnd(40) + 'Time'.padEnd(12) + 'Tasks'.padEnd(10) + 'Multiplier');
  console.log('-'.repeat(80));

  // Raw Claude (baseline)
  const rawTime = formatDuration(comparison.rawClaude.duration);
  console.log(
    comparison.rawClaude.name.padEnd(40) +
    rawTime.padEnd(12) +
    `${comparison.rawClaude.tasksCompleted}/${TEST_TASKS.length}`.padEnd(10) +
    '1.00x (baseline)'
  );

  // BuildRunner (no optimizations)
  const noOptsTime = formatDuration(comparison.buildRunnerNoOpts.duration);
  const noOptsMultiplier = comparison.analysis.noOptsMultiplier > 0
    ? `${comparison.analysis.noOptsMultiplier.toFixed(2)}x`
    : 'N/A';
  console.log(
    comparison.buildRunnerNoOpts.name.padEnd(40) +
    noOptsTime.padEnd(12) +
    `${comparison.buildRunnerNoOpts.tasksCompleted}/${TEST_TASKS.length}`.padEnd(10) +
    noOptsMultiplier
  );

  // BuildRunner (all optimizations)
  const allOptsTime = formatDuration(comparison.buildRunnerAllOpts.duration);
  const allOptsMultiplier = comparison.analysis.allOptsMultiplier > 0
    ? `${comparison.analysis.allOptsMultiplier.toFixed(2)}x`
    : 'N/A';
  const statusIcon = comparison.analysis.meetsTarget ? '✅' : '❌';
  console.log(
    comparison.buildRunnerAllOpts.name.padEnd(40) +
    allOptsTime.padEnd(12) +
    `${comparison.buildRunnerAllOpts.tasksCompleted}/${TEST_TASKS.length}`.padEnd(10) +
    allOptsMultiplier + ' ' + statusIcon
  );

  console.log('-'.repeat(80));

  // Analysis
  console.log('\n📈 ANALYSIS\n');
  console.log(`Target: ≤${comparison.analysis.targetMultiplier}x slower than raw Claude CLI`);

  if (comparison.analysis.baselineTime > 0) {
    console.log(`Status: ${comparison.analysis.meetsTarget ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`\nOptimization Impact: ${((1 - comparison.analysis.allOptsMultiplier / comparison.analysis.noOptsMultiplier) * 100).toFixed(1)}% improvement`);
  } else {
    console.log('Status: ⚠️  Unable to determine (raw Claude benchmark skipped)');
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

function formatDuration(ms: number): string {
  if (ms === 0) return 'N/A';

  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  return `${minutes}m ${seconds}s`;
}

// ============================================================
// Main Execution
// ============================================================

async function main() {
  console.log('🎯 BuildRunnerSaaS Performance Benchmark Suite');
  console.log('='.repeat(80));
  console.log(`Test Tasks: ${TEST_TASKS.length}`);
  console.log(`Estimated Total Time: ${TEST_TASKS.reduce((sum, t) => sum + t.estimatedMinutes, 0)} minutes per benchmark`);
  console.log('='.repeat(80));

  const runner = new BenchmarkRunner();

  try {
    // Run benchmarks
    const rawClaude = await runner.runRawClaudeCLI();
    const buildRunnerNoOpts = await runner.runBuildRunner(false);
    const buildRunnerAllOpts = await runner.runBuildRunner(true);

    // Analyze results
    const comparison = analyzeResults(rawClaude, buildRunnerNoOpts, buildRunnerAllOpts);

    // Print results
    printResults(comparison);

    // Save results to file
    fs.writeFileSync(
      BENCHMARK_CONFIG.outputFile,
      JSON.stringify(comparison, null, 2)
    );

    console.log(`Results saved to: ${BENCHMARK_CONFIG.outputFile}`);

    // Exit with appropriate code
    if (comparison.analysis.baselineTime === 0) {
      console.log('\n⚠️  Benchmark incomplete (raw Claude CLI skipped)');
      process.exit(1);
    } else if (comparison.analysis.meetsTarget) {
      console.log('\n✅ Performance target met!');
      process.exit(0);
    } else {
      console.log('\n❌ Performance target not met');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Benchmark failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

// Export for testing
export { BenchmarkRunner, analyzeResults, TEST_TASKS };
