/**
 * Integration Test: Verification Loop
 *
 * Tests end-to-end post-build verification and gap-filling functionality.
 *
 * Test Flow:
 * 1. Complete initial build (intentionally incomplete)
 * 2. Trigger verification
 * 3. Verify gaps identified
 * 4. Verify new tasks generated for gaps
 * 5. Verify tasks executed
 * 6. Verify second verification pass
 * 7. Verify completion when all requirements met
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { BuildOrchestrator } from '@/lib/build-orchestrator';
import { BuildVerifier } from '@/lib/build-verifier';
import { ClaudeCLIEngine } from '@/lib/claude-cli-engine';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('Verification Loop Integration', () => {
  const TEST_PROJECT_PATH = path.join(__dirname, '../fixtures/verification-project');

  let orchestrator: BuildOrchestrator;
  let verifier: BuildVerifier;
  let claudeEngine: ClaudeCLIEngine;

  const testPRD = {
    features: [
      {
        id: 'auth',
        name: 'User Authentication',
        description: 'Login, signup, and logout functionality',
        requirements: [
          'Login page with email/password',
          'Signup page with validation',
          'Logout functionality',
          'Password reset flow'
        ]
      },
      {
        id: 'dashboard',
        name: 'Dashboard',
        description: 'User dashboard with stats',
        requirements: [
          'Stats cards showing key metrics',
          'Recent activity feed',
          'Quick actions panel'
        ]
      }
    ]
  };

  beforeAll(async () => {
    await fs.mkdir(TEST_PROJECT_PATH, { recursive: true });

    claudeEngine = new ClaudeCLIEngine({
      projectId: 'test-verification',
      projectName: 'Verification Test',
      projectPath: TEST_PROJECT_PATH,
      model: 'sonnet',
    });

    verifier = new BuildVerifier(claudeEngine, TEST_PROJECT_PATH);
  });

  afterAll(async () => {
    if (orchestrator) {
      await orchestrator.stop();
    }
    await fs.rm(TEST_PROJECT_PATH, { recursive: true, force: true });
  });

  it('should identify gaps in incomplete build', async () => {
    // Simulate incomplete build state
    const buildState = {
      completedTasks: [
        { id: '1', description: 'Create login page', status: 'completed' },
        { id: '2', description: 'Add logout button', status: 'completed' },
      ],
      filesCreated: [
        'app/login/page.tsx',
        'components/LogoutButton.tsx',
      ],
      techStack: ['next', 'react', 'typescript']
    };

    // Save build state
    await fs.writeFile(
      path.join(TEST_PROJECT_PATH, 'build-state.json'),
      JSON.stringify(buildState, null, 2)
    );

    // Verify against PRD
    const result = await verifier.verifyAgainstPRD(testPRD);

    // Should identify missing features
    expect(result.complete).toBe(false);
    expect(result.gaps.length).toBeGreaterThan(0);

    // Verify specific gaps found
    const gapDescriptions = result.gaps.map(g => g.description.toLowerCase());
    expect(gapDescriptions.some(d => d.includes('signup'))).toBe(true);
    expect(gapDescriptions.some(d => d.includes('password reset'))).toBe(true);
    expect(gapDescriptions.some(d => d.includes('dashboard'))).toBe(true);
  });

  it('should generate appropriate tasks for each gap', async () => {
    orchestrator = new BuildOrchestrator({
      projectId: 'test-verification',
      projectName: 'Verification Test',
      projectPath: TEST_PROJECT_PATH,
    });

    const gaps = [
      {
        feature: 'User Authentication',
        description: 'Signup page missing',
        severity: 'high' as const,
        suggestedTasks: [
          'Create signup page component',
          'Add form validation',
          'Integrate with auth API'
        ]
      },
      {
        feature: 'Dashboard',
        description: 'Stats cards not implemented',
        severity: 'medium' as const,
        suggestedTasks: [
          'Create StatsCard component',
          'Fetch stats data from API'
        ]
      }
    ];

    const tasks = (orchestrator as any).generateTasksForGaps(gaps);

    // Verify tasks generated
    expect(tasks.length).toBeGreaterThan(0);

    // Verify task structure
    tasks.forEach((task: any) => {
      expect(task.id).toBeDefined();
      expect(task.description).toBeDefined();
      expect(task.prompt).toBeDefined();
    });

    // Verify tasks reference the gaps
    const taskDescriptions = tasks.map((t: any) => t.description.toLowerCase());
    expect(taskDescriptions.some((d: string) => d.includes('signup'))).toBe(true);
    expect(taskDescriptions.some((d: string) => d.includes('stats'))).toBe(true);
  });

  it('should execute verification loop until complete', async () => {
    const iterations: any[] = [];
    const gapsFound: any[] = [];

    orchestrator = new BuildOrchestrator({
      projectId: 'test-verification',
      projectName: 'Verification Test',
      projectPath: TEST_PROJECT_PATH,
    });

    orchestrator.on('verification:iteration', (event) => {
      iterations.push(event);
    });

    orchestrator.on('verification:gaps-found', (event) => {
      gapsFound.push(event);
    });

    const completionPromise = new Promise((resolve) => {
      orchestrator.on('build:verified-complete', (event) => {
        resolve(event);
      });
    });

    // Start build with verification
    await orchestrator.startClaudeBuild({
      projectId: 'test-verification',
      projectName: 'Verification Test',
      projectPath: TEST_PROJECT_PATH,
      enableVerification: true,
    });

    // Wait for completion or timeout
    const result: any = await Promise.race([
      completionPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Verification timeout')), 30000)
      )
    ]);

    // Verify iterations occurred
    expect(iterations.length).toBeGreaterThan(0);
    expect(iterations.length).toBeLessThanOrEqual(5); // Max 5 iterations

    // Verify final completion
    expect(result).toBeDefined();
    expect(result.confidence).toBeGreaterThanOrEqual(85);
  });

  it('should stop after max iterations even if incomplete', async () => {
    const iterations: any[] = [];

    orchestrator = new BuildOrchestrator({
      projectId: 'test-max-iterations',
      projectName: 'Max Iterations Test',
      projectPath: TEST_PROJECT_PATH,
    });

    orchestrator.on('verification:iteration', (event) => {
      iterations.push(event);
    });

    const maxIterationsPromise = new Promise((resolve) => {
      orchestrator.on('verification:max-iterations-reached', (event) => {
        resolve(event);
      });
    });

    // Mock verifier to always return gaps (simulating never-complete scenario)
    const originalVerify = verifier.verifyAgainstPRD.bind(verifier);
    verifier.verifyAgainstPRD = async () => ({
      complete: false,
      confidence: 50,
      gaps: [
        {
          feature: 'Test',
          description: 'Always incomplete',
          severity: 'high',
          suggestedTasks: ['Fix this']
        }
      ],
      analysis: 'Never complete'
    });

    await orchestrator.startClaudeBuild({
      projectId: 'test-max-iterations',
      projectName: 'Max Iterations Test',
      projectPath: TEST_PROJECT_PATH,
      enableVerification: true,
    });

    const result: any = await maxIterationsPromise;

    // Restore original
    verifier.verifyAgainstPRD = originalVerify;

    // Verify stopped after 5 iterations
    expect(iterations.length).toBe(5);
    expect(result.iterations).toBe(5);
  });

  it('should emit proper events during verification', async () => {
    const events: Record<string, any[]> = {
      'verification:iteration': [],
      'verification:gaps-found': [],
      'build:verified-complete': []
    };

    orchestrator = new BuildOrchestrator({
      projectId: 'test-events',
      projectName: 'Events Test',
      projectPath: TEST_PROJECT_PATH,
    });

    Object.keys(events).forEach(eventName => {
      orchestrator.on(eventName, (event) => {
        events[eventName].push(event);
      });
    });

    await orchestrator.startClaudeBuild({
      projectId: 'test-events',
      projectName: 'Events Test',
      projectPath: TEST_PROJECT_PATH,
      enableVerification: true,
    });

    // Give it time to complete
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Verify events were emitted
    expect(events['verification:iteration'].length).toBeGreaterThan(0);

    // Either gaps found or completed
    const totalEvents = events['verification:gaps-found'].length +
                        events['build:verified-complete'].length;
    expect(totalEvents).toBeGreaterThan(0);
  });

  it('should improve confidence score with each iteration', async () => {
    const confidenceScores: number[] = [];

    orchestrator = new BuildOrchestrator({
      projectId: 'test-confidence',
      projectName: 'Confidence Test',
      projectPath: TEST_PROJECT_PATH,
    });

    orchestrator.on('verification:gaps-found', (event: any) => {
      confidenceScores.push(event.confidence || 0);
    });

    await orchestrator.startClaudeBuild({
      projectId: 'test-confidence',
      projectName: 'Confidence Test',
      projectPath: TEST_PROJECT_PATH,
      enableVerification: true,
    });

    await new Promise(resolve => setTimeout(resolve, 10000));

    if (confidenceScores.length > 1) {
      // Verify confidence generally increases
      const firstScore = confidenceScores[0];
      const lastScore = confidenceScores[confidenceScores.length - 1];
      expect(lastScore).toBeGreaterThanOrEqual(firstScore);
    }
  });
});
