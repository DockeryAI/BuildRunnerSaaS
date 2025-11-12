# BuildRunnerSaaS - 100% Completion Implementation Plan

**Created:** 2025-11-12
**Status:** Planning Complete - Awaiting User Approval
**Estimated Timeline:** 2-3 weeks (10-16 development days)
**Current Completion:** 70% → Target: 100%

---

## Executive Summary

This plan transforms BuildRunnerSaaS from a partially implemented system into a fully functional Claude CLI orchestration platform that meets all four core requirements:

1. ✅ **PRD as Single Source of Truth** - Auto-rebuild on PRD changes
2. ✅ **Post-Build PRD Verification** - Claude checks and continues until complete
3. ✅ **Preview Chat with Claude** - Contextual chat interface for live changes
4. ✅ **Performance: ≤1.3x Claude CLI** - Measure baseline and optimize

**Current State:** 70% complete (infrastructure built, integration missing)
**Missing:** PRD watcher, verification loop, chat backend, performance baseline
**Strategy:** Build missing pieces, integrate systems, validate end-to-end

---

## Phase 1: Performance Baseline & Optimization (Days 1-2)

**Objective:** Establish performance baseline and enable existing optimizations

**Why First:** Quick wins, establishes success criteria, no dependencies

### Tasks

#### Task 1.1: Create Performance Benchmark Suite
**File:** `/apps/web/scripts/benchmark.ts`
**Description:** Build automated benchmark comparing raw Claude CLI vs BuildRunner

**Implementation:**
```typescript
// Create benchmark script that:
// 1. Defines 15 standard test tasks (login page, dashboard, API routes, etc.)
// 2. Runs tasks with raw `claude` command (measure baseline)
// 3. Runs tasks with BuildRunner (no optimizations)
// 4. Runs tasks with BuildRunner (all optimizations enabled)
// 5. Outputs comparison table with multipliers

// Expected output:
// Raw Claude CLI: 15.2 minutes
// BuildRunner (no opts): 48.7 minutes (3.2x slower)
// BuildRunner (persistent sessions): 35.1 minutes (2.3x slower)
// BuildRunner (all opts): 19.8 minutes (1.3x slower) ✓
```

**Acceptance Criteria:**
- [ ] Script runs without errors
- [ ] Measures raw Claude CLI baseline
- [ ] Tests BuildRunner with/without optimizations
- [ ] Outputs comparison table
- [ ] Saves results to `benchmark-results.json`

**Verification:**
```bash
npm run benchmark
# Should output results table and save JSON
```

---

#### Task 1.2: Enable Performance Optimizations by Default
**Files:**
- `/apps/web/.env.example`
- `/apps/web/lib/build-orchestrator.ts`

**Description:** Change default configuration to enable performance features

**Implementation:**
1. Update `.env.example`:
   ```bash
   # Performance Optimizations (ENABLED by default for production)
   ENABLE_PERSISTENT_SESSIONS=true
   ENABLE_PARALLEL_EXECUTION=true
   ```

2. Update BuildOrchestrator to log optimization status:
   ```typescript
   // In startClaudeBuild():
   this.emit('log', {
     message: `Performance optimizations: Persistent Sessions=${config.enablePersistentSessions}, Parallel=${config.enableParallelExecution}`
   });
   ```

**Acceptance Criteria:**
- [ ] `.env.example` defaults updated
- [ ] BuildOrchestrator logs optimization status
- [ ] Test build runs with optimizations enabled
- [ ] No errors or crashes

**Verification:**
```bash
# Remove .env.local to test defaults
mv apps/web/.env.local apps/web/.env.local.backup
npm run dev
# Check logs show optimizations enabled
```

---

#### Task 1.3: Add Performance Metrics Collection
**File:** `/apps/web/lib/performance-metrics.ts` (new)
**Description:** Add timing instrumentation to measure bottlenecks

**Implementation:**
```typescript
// Create PerformanceMetrics class:
export class PerformanceMetrics extends EventEmitter {
  private metrics: Map<string, number[]> = new Map();

  startTimer(name: string): () => void {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.recordMetric(name, duration);
    };
  }

  recordMetric(name: string, duration: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);
  }

  getReport() {
    // Generate performance report with:
    // - Total build time
    // - Per-task average
    // - Slowest tasks
    // - Optimization effectiveness
  }
}

// Integrate into BuildOrchestrator:
// - Time each task execution
// - Time quality gates
// - Time git commits
// - Time Claude CLI calls
```

**Acceptance Criteria:**
- [ ] PerformanceMetrics class created
- [ ] Integrated into BuildOrchestrator
- [ ] Integrated into ClaudeTaskExecutorV2
- [ ] Generates detailed performance report
- [ ] Emits metrics via events for UI display

**Verification:**
```typescript
// Run test build and check metrics
const orchestrator = new BuildOrchestrator(config);
orchestrator.on('metrics:report', (report) => {
  console.log(report); // Should show timing breakdown
});
```

---

## Phase 2: PRD Watcher System (Days 3-5)

**Objective:** Auto-detect PRD changes and trigger incremental rebuilds

**Dependencies:** Phase 1 complete

### Tasks

#### Task 2.1: Create PRD Watcher Class
**File:** `/apps/web/lib/prd-watcher.ts` (new)
**Description:** File system watcher that monitors PRD.md for changes

**Implementation:**
```typescript
import { FSWatcher, watch } from 'fs';
import { EventEmitter } from 'events';
import { PRDChangeDetector } from './prd-change-detector';

export class PRDWatcher extends EventEmitter {
  private watcher: FSWatcher | null = null;
  private prdPath: string;
  private buildId: string;
  private debounceTimer: NodeJS.Timeout | null = null;
  private lastHash: string | null = null;

  constructor(prdPath: string, buildId: string) {
    super();
    this.prdPath = prdPath;
    this.buildId = buildId;
  }

  async start() {
    // 1. Get initial PRD hash
    this.lastHash = await this.calculateHash();

    // 2. Start watching file
    this.watcher = watch(this.prdPath, async (event) => {
      // 3. Debounce changes (2s delay)
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = setTimeout(async () => {
        await this.handleChange();
      }, 2000);
    });

    this.emit('watcher:started', { path: this.prdPath });
  }

  private async handleChange() {
    // 1. Calculate new hash
    const newHash = await this.calculateHash();

    // 2. Compare with last hash
    if (newHash === this.lastHash) {
      return; // No actual change
    }

    // 3. Detect what changed
    const changeDetector = new PRDChangeDetector();
    const changes = await changeDetector.detectChanges(
      this.prdPath,
      `${this.prdPath}.previous`
    );

    // 4. Emit change event
    this.emit('prd:changed', {
      buildId: this.buildId,
      changes,
      timestamp: new Date()
    });

    // 5. Save current version as previous
    this.lastHash = newHash;
  }

  stop() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.emit('watcher:stopped');
  }
}
```

**Acceptance Criteria:**
- [ ] PRDWatcher class created with EventEmitter
- [ ] Watches PRD.md file for changes
- [ ] Debounces changes (2s delay)
- [ ] Uses hash comparison to detect real changes
- [ ] Emits 'prd:changed' events with change details
- [ ] Can be started/stopped cleanly

**Verification:**
```typescript
const watcher = new PRDWatcher('/path/to/PRD.md', 'build-123');
watcher.on('prd:changed', (changes) => {
  console.log('PRD changed:', changes);
});
watcher.start();
// Edit PRD.md → should see event after 2s
```

---

#### Task 2.2: Integrate PRD Watcher with Build Orchestrator
**File:** `/apps/web/lib/build-orchestrator.ts`
**Description:** Hook PRD watcher into build orchestrator lifecycle

**Implementation:**
```typescript
// In BuildOrchestrator class:

private prdWatcher: PRDWatcher | null = null;

async startClaudeBuild(config: BuildOrchestratorConfig) {
  // ... existing code ...

  // After initial build completes, start watching PRD
  if (config.watchPRD !== false) {
    await this.startPRDWatcher(config.projectPath);
  }
}

private async startPRDWatcher(projectPath: string) {
  const prdPath = path.join(projectPath, 'PRD.md');

  // Check if PRD.md exists
  if (!fs.existsSync(prdPath)) {
    this.emit('log', {
      message: 'PRD.md not found, skipping watcher',
      level: 'warn'
    });
    return;
  }

  // Create and start watcher
  this.prdWatcher = new PRDWatcher(prdPath, this.buildId);

  this.prdWatcher.on('prd:changed', async (event) => {
    this.emit('log', {
      message: `PRD changed detected: ${event.changes.summary}`,
      level: 'info'
    });

    // Trigger incremental rebuild
    await this.handlePRDChange(event.changes);
  });

  await this.prdWatcher.start();
}

private async handlePRDChange(changes: PRDChanges) {
  // 1. Analyze changes
  this.emit('prd:analyzing-changes', { changes });

  // 2. Determine impact
  const impactedFeatures = this.analyzeImpact(changes);

  // 3. Generate new tasks for changed features
  const taskGenerator = new TaskListGeneratorV2(this.config);
  const newTasks = await taskGenerator.generateForChanges(
    impactedFeatures,
    this.projectPlan
  );

  // 4. Execute new tasks
  this.emit('prd:rebuilding', {
    taskCount: newTasks.length,
    features: impactedFeatures
  });

  await this.executeTasks(newTasks);

  // 5. Verify completion
  await this.verifyBuildCompleteness();
}

async stop() {
  // Stop PRD watcher when build stops
  if (this.prdWatcher) {
    this.prdWatcher.stop();
    this.prdWatcher = null;
  }
  // ... existing cleanup ...
}
```

**Acceptance Criteria:**
- [ ] BuildOrchestrator starts PRD watcher after initial build
- [ ] Watches PRD.md in project directory
- [ ] Detects and logs PRD changes
- [ ] Triggers handlePRDChange on changes
- [ ] Stops watcher when build stops
- [ ] Emits events for UI updates

**Verification:**
```typescript
// Start build with PRD watching enabled
const orchestrator = new BuildOrchestrator(config);
orchestrator.on('prd:changed', (event) => console.log(event));
await orchestrator.startClaudeBuild({ watchPRD: true });
// Edit PRD.md → should trigger rebuild
```

---

#### Task 2.3: Add Incremental Task Generation
**File:** `/apps/web/lib/task-list-generator-v2.ts`
**Description:** Enhance task generator to create tasks only for changed features

**Implementation:**
```typescript
// Add new method to TaskListGeneratorV2:

async generateForChanges(
  changes: PRDChanges,
  currentPlan: ProjectPlan
): Promise<BuildTask[]> {
  const tasks: BuildTask[] = [];

  // Handle added features
  for (const addedFeature of changes.added) {
    const featureTasks = await this.generateTasksForFeature(
      addedFeature,
      currentPlan
    );
    tasks.push(...featureTasks);
  }

  // Handle modified features
  for (const modifiedFeature of changes.modified) {
    // Regenerate tasks for this feature
    const featureTasks = await this.generateTasksForFeature(
      modifiedFeature,
      currentPlan
    );
    tasks.push(...featureTasks);
  }

  // Handle removed features
  for (const removedFeature of changes.removed) {
    // Generate cleanup tasks
    const cleanupTasks = await this.generateCleanupTasks(
      removedFeature,
      currentPlan
    );
    tasks.push(...cleanupTasks);
  }

  return tasks;
}

private async generateTasksForFeature(
  feature: PRDFeature,
  plan: ProjectPlan
): Promise<BuildTask[]> {
  // Use existing task generation logic but scoped to one feature
  const prompt = this.buildFeatureTaskPrompt(feature, plan);
  const response = await this.llmClient.complete(prompt);
  return this.parseTasksFromResponse(response);
}

private async generateCleanupTasks(
  feature: PRDFeature,
  plan: ProjectPlan
): Promise<BuildTask[]> {
  // Generate tasks to remove files/code for deleted feature
  return [{
    id: `cleanup-${feature.id}`,
    type: 'cleanup',
    description: `Remove code for deleted feature: ${feature.name}`,
    prompt: `The feature "${feature.name}" has been removed from the PRD. Remove all related files and code.`,
    estimatedMinutes: 5
  }];
}
```

**Acceptance Criteria:**
- [ ] generateForChanges() method added
- [ ] Handles added features → generates new tasks
- [ ] Handles modified features → regenerates tasks
- [ ] Handles removed features → generates cleanup tasks
- [ ] Returns properly formatted BuildTask array

**Verification:**
```typescript
const generator = new TaskListGeneratorV2(config);
const changes = {
  added: [{ id: 'feature-1', name: 'Login Page' }],
  modified: [],
  removed: []
};
const tasks = await generator.generateForChanges(changes, plan);
console.log(tasks); // Should have tasks for login page
```

---

#### Task 2.4: Create PRD Export API Endpoint
**File:** `/apps/web/app/api/build/prd/export/route.ts` (new)
**Description:** API endpoint to export PRD and trigger watcher

**Implementation:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { exportToClaudeBuilder } from '@/lib/prd-export';
import { orchestratorManager } from '@/lib/orchestrator-manager';

export async function POST(request: NextRequest) {
  try {
    const { buildId, prdData, projectName } = await request.json();

    // 1. Export PRD to project directory
    const result = await exportToClaudeBuilder(prdData, projectName);

    // 2. Get orchestrator instance
    const orchestrator = orchestratorManager.get(buildId);

    if (orchestrator) {
      // 3. Start PRD watcher if not already started
      await orchestrator.startPRDWatcher(result.exportPath);
    }

    return NextResponse.json({
      success: true,
      message: 'PRD exported and watcher started',
      path: result.exportPath
    });

  } catch (error) {
    console.error('PRD export failed:', error);
    return NextResponse.json(
      { error: 'Failed to export PRD' },
      { status: 500 }
    );
  }
}
```

**Acceptance Criteria:**
- [ ] API endpoint created at `/api/build/prd/export`
- [ ] Accepts buildId, prdData, projectName
- [ ] Exports PRD to file system
- [ ] Starts PRD watcher on orchestrator
- [ ] Returns success response with path
- [ ] Handles errors gracefully

**Verification:**
```bash
curl -X POST http://localhost:3002/api/build/prd/export \
  -H "Content-Type: application/json" \
  -d '{"buildId":"test-123","prdData":{...},"projectName":"TestApp"}'
# Should return success with export path
```

---

## Phase 3: Post-Build Verification Loop (Days 6-8)

**Objective:** Claude checks PRD after builds and continues until all requirements met

**Dependencies:** Phase 2 complete (PRD watcher working)

### Tasks

#### Task 3.1: Create Build Verification System
**File:** `/apps/web/lib/build-verifier.ts` (new)
**Description:** System to verify build completeness against PRD

**Implementation:**
```typescript
import { ClaudeCLIEngine } from './claude-cli-engine';
import { PRDData } from './types';

export interface VerificationResult {
  complete: boolean;
  gaps: VerificationGap[];
  confidence: number;
  analysis: string;
}

export interface VerificationGap {
  feature: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  suggestedTasks: string[];
}

export class BuildVerifier extends EventEmitter {
  constructor(
    private claudeEngine: ClaudeCLIEngine,
    private projectPath: string
  ) {
    super();
  }

  async verifyAgainstPRD(prd: PRDData): Promise<VerificationResult> {
    this.emit('verification:started', { featureCount: prd.features.length });

    // 1. Load build state
    const buildState = await this.loadBuildState();

    // 2. Generate verification prompt
    const prompt = this.buildVerificationPrompt(prd, buildState);

    // 3. Ask Claude to verify
    const response = await this.claudeEngine.executeTask({
      id: 'verify-completeness',
      type: 'quality_gate',
      description: 'Verify build completeness against PRD',
      prompt
    });

    // 4. Parse Claude's response
    const result = this.parseVerificationResponse(response.output);

    this.emit('verification:completed', result);

    return result;
  }

  private buildVerificationPrompt(prd: PRDData, buildState: BuildState): string {
    return `
# Build Completeness Verification

You are verifying that a build satisfies all PRD requirements.

## PRD Requirements

${this.formatPRDFeatures(prd)}

## Build State

**Completed Tasks:** ${buildState.completedTasks.length}
${buildState.completedTasks.map(t => `- ${t.description}`).join('\n')}

**Files Created:** ${buildState.filesCreated.length}
${buildState.filesCreated.slice(0, 20).join('\n')}

**Technology Stack:** ${buildState.techStack.join(', ')}

## Verification Instructions

1. **Check each PRD feature:** Is it fully implemented?
2. **Identify gaps:** What's missing or incomplete?
3. **Assess quality:** Does implementation match PRD specifications?
4. **Determine next steps:** What tasks are needed to complete gaps?

## Response Format (JSON)

{
  "complete": true/false,
  "confidence": 0-100,
  "gaps": [
    {
      "feature": "User Authentication",
      "description": "Login page exists but signup missing",
      "severity": "high",
      "suggestedTasks": [
        "Create signup page",
        "Add password reset flow"
      ]
    }
  ],
  "analysis": "Overall assessment..."
}

**Respond ONLY with valid JSON.**
`;
  }

  private parseVerificationResponse(output: string): VerificationResult {
    // Parse JSON response from Claude
    try {
      const json = JSON.parse(this.extractJSON(output));
      return {
        complete: json.complete,
        gaps: json.gaps || [],
        confidence: json.confidence || 0,
        analysis: json.analysis || ''
      };
    } catch (error) {
      // Fallback if parsing fails
      return {
        complete: false,
        gaps: [],
        confidence: 0,
        analysis: 'Failed to parse verification response'
      };
    }
  }

  private async loadBuildState(): Promise<BuildState> {
    // Load state from build-state.json or build-status.json
    const statePath = path.join(this.projectPath, 'build-state.json');
    if (fs.existsSync(statePath)) {
      return JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    }
    return this.scanBuildState();
  }

  private async scanBuildState(): Promise<BuildState> {
    // Scan project directory to determine build state
    const files = await this.listProjectFiles();
    const packageJson = this.loadPackageJson();

    return {
      completedTasks: [], // Load from task log if available
      filesCreated: files,
      techStack: packageJson?.dependencies ? Object.keys(packageJson.dependencies) : []
    };
  }
}
```

**Acceptance Criteria:**
- [ ] BuildVerifier class created
- [ ] Loads PRD and build state
- [ ] Generates verification prompt for Claude
- [ ] Parses Claude's JSON response
- [ ] Returns VerificationResult with gaps
- [ ] Emits events for UI updates

**Verification:**
```typescript
const verifier = new BuildVerifier(claudeEngine, '/path/to/project');
const result = await verifier.verifyAgainstPRD(prdData);
console.log(result);
// Should show { complete: false, gaps: [...] }
```

---

#### Task 3.2: Implement Verification Loop in Build Orchestrator
**File:** `/apps/web/lib/build-orchestrator.ts`
**Description:** Add continuous verification loop after task execution

**Implementation:**
```typescript
// In BuildOrchestrator class:

private buildVerifier: BuildVerifier | null = null;
private maxVerificationIterations = 5;
private currentIteration = 0;

async startClaudeBuild(config: BuildOrchestratorConfig) {
  // ... existing initialization ...

  // Create verifier
  this.buildVerifier = new BuildVerifier(
    this.claudeEngine,
    config.projectPath
  );

  // Execute initial tasks
  await executor.executeAll();

  // Start verification loop
  await this.verificationLoop();
}

private async verificationLoop() {
  this.currentIteration = 0;

  while (this.currentIteration < this.maxVerificationIterations) {
    this.currentIteration++;

    this.emit('verification:iteration', {
      iteration: this.currentIteration,
      max: this.maxVerificationIterations
    });

    // 1. Verify build against PRD
    const result = await this.buildVerifier!.verifyAgainstPRD(this.prdData);

    // 2. Check if complete
    if (result.complete && result.confidence >= 85) {
      this.emit('build:verified-complete', {
        iterations: this.currentIteration,
        confidence: result.confidence
      });
      return; // All done!
    }

    // 3. Check if we found gaps
    if (result.gaps.length === 0) {
      // No gaps identified but not marked complete
      // Possible false negative, log and exit
      this.emit('log', {
        message: 'No gaps found but build not marked complete',
        level: 'warn'
      });
      break;
    }

    // 4. Generate tasks for gaps
    this.emit('verification:gaps-found', {
      gapCount: result.gaps.length,
      gaps: result.gaps
    });

    const newTasks = await this.generateTasksForGaps(result.gaps);

    // 5. Execute gap-filling tasks
    await this.executeTasks(newTasks);

    // 6. Loop back to verify again
  }

  // Max iterations reached
  this.emit('verification:max-iterations-reached', {
    iterations: this.currentIteration
  });
}

private async generateTasksForGaps(gaps: VerificationGap[]): Promise<BuildTask[]> {
  const tasks: BuildTask[] = [];

  for (const gap of gaps) {
    // Use gap's suggested tasks or generate new ones
    if (gap.suggestedTasks.length > 0) {
      gap.suggestedTasks.forEach((taskDesc, idx) => {
        tasks.push({
          id: `gap-${gap.feature}-${idx}`,
          type: 'implementation',
          description: taskDesc,
          prompt: this.buildGapFillingPrompt(gap, taskDesc),
          estimatedMinutes: this.estimateTaskTime(gap.severity)
        });
      });
    } else {
      // Fallback: ask Claude to determine tasks
      tasks.push({
        id: `gap-${gap.feature}`,
        type: 'implementation',
        description: `Address gap: ${gap.description}`,
        prompt: this.buildGapFillingPrompt(gap),
        estimatedMinutes: this.estimateTaskTime(gap.severity)
      });
    }
  }

  return tasks;
}

private buildGapFillingPrompt(gap: VerificationGap, taskDesc?: string): string {
  return `
# Gap Resolution Task

**Feature:** ${gap.feature}
**Gap:** ${gap.description}
**Severity:** ${gap.severity}
${taskDesc ? `**Task:** ${taskDesc}` : ''}

Please implement the missing functionality to address this gap.
Ensure the implementation is complete and matches PRD requirements.
`;
}

private estimateTaskTime(severity: string): number {
  switch (severity) {
    case 'critical': return 30;
    case 'high': return 20;
    case 'medium': return 10;
    case 'low': return 5;
    default: return 15;
  }
}
```

**Acceptance Criteria:**
- [ ] verificationLoop() method added to BuildOrchestrator
- [ ] Calls BuildVerifier after task execution
- [ ] Analyzes verification results
- [ ] Generates tasks for identified gaps
- [ ] Executes gap-filling tasks
- [ ] Loops until complete or max iterations reached
- [ ] Emits events for each stage

**Verification:**
```typescript
const orchestrator = new BuildOrchestrator(config);
orchestrator.on('verification:iteration', (data) => console.log(data));
orchestrator.on('build:verified-complete', (data) => console.log('DONE:', data));
await orchestrator.startClaudeBuild(config);
// Should loop through verification until complete
```

---

#### Task 3.3: Add Verification UI Components
**File:** `/apps/web/components/VerificationPanel.tsx` (new)
**Description:** UI to display verification progress and gaps

**Implementation:**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface VerificationPanelProps {
  buildId: string;
}

interface VerificationState {
  status: 'idle' | 'verifying' | 'complete' | 'gaps-found';
  iteration: number;
  maxIterations: number;
  confidence: number;
  gaps: VerificationGap[];
  complete: boolean;
}

export function VerificationPanel({ buildId }: VerificationPanelProps) {
  const [state, setState] = useState<VerificationState>({
    status: 'idle',
    iteration: 0,
    maxIterations: 5,
    confidence: 0,
    gaps: [],
    complete: false
  });

  useEffect(() => {
    // Listen to verification events from build orchestrator
    const eventSource = new EventSource(`/api/build/events?buildId=${buildId}`);

    eventSource.addEventListener('verification:iteration', (e) => {
      const data = JSON.parse(e.data);
      setState(prev => ({
        ...prev,
        status: 'verifying',
        iteration: data.iteration,
        maxIterations: data.max
      }));
    });

    eventSource.addEventListener('verification:gaps-found', (e) => {
      const data = JSON.parse(e.data);
      setState(prev => ({
        ...prev,
        status: 'gaps-found',
        gaps: data.gaps
      }));
    });

    eventSource.addEventListener('build:verified-complete', (e) => {
      const data = JSON.parse(e.data);
      setState(prev => ({
        ...prev,
        status: 'complete',
        complete: true,
        confidence: data.confidence
      }));
    });

    return () => eventSource.close();
  }, [buildId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {state.status === 'verifying' && <Loader2 className="h-5 w-5 animate-spin" />}
          {state.status === 'complete' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
          {state.status === 'gaps-found' && <AlertCircle className="h-5 w-5 text-yellow-500" />}
          Build Verification
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Iteration progress */}
        <div className="mb-4">
          <div className="text-sm text-muted-foreground mb-2">
            Verification Iteration {state.iteration} / {state.maxIterations}
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${(state.iteration / state.maxIterations) * 100}%` }}
            />
          </div>
        </div>

        {/* Status */}
        {state.status === 'complete' && (
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
              Build Verified Complete!
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Confidence: {state.confidence}% | Iterations: {state.iteration}
            </p>
          </div>
        )}

        {/* Gaps */}
        {state.gaps.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Identified Gaps ({state.gaps.length})</h3>
            {state.gaps.map((gap, idx) => (
              <div key={idx} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{gap.feature}</h4>
                  <Badge variant={gap.severity === 'critical' ? 'destructive' : 'secondary'}>
                    {gap.severity}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{gap.description}</p>
                {gap.suggestedTasks.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <strong>Tasks:</strong>
                    <ul className="list-disc list-inside ml-2">
                      {gap.suggestedTasks.map((task, tidx) => (
                        <li key={tidx}>{task}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

**Acceptance Criteria:**
- [ ] VerificationPanel component created
- [ ] Connects to SSE events from build API
- [ ] Displays verification iteration progress
- [ ] Shows completion status with confidence
- [ ] Lists identified gaps with severity
- [ ] Shows suggested tasks for each gap
- [ ] Updates in real-time

**Verification:**
```typescript
// Add to workbench page
<VerificationPanel buildId={buildId} />
// Run build → should see verification progress
```

---

## Phase 4: Preview Chat Backend (Days 9-12)

**Objective:** Contextual chat interface that sends changes to Claude CLI

**Dependencies:** Phase 3 complete (verification loop working)

### Tasks

#### Task 4.1: Create Chat Context Collector
**File:** `/apps/web/lib/chat-context-collector.ts` (new)
**Description:** Collect contextual information about preview state

**Implementation:**
```typescript
export interface ChatContext {
  route: string;
  component: string | null;
  viewport: 'mobile' | 'tablet' | 'desktop';
  screenshot?: string;
  visibleElements: string[];
  recentActions: string[];
  buildState: {
    completedTasks: number;
    currentPhase: string;
  };
}

export class ChatContextCollector {
  async collectContext(buildId: string): Promise<ChatContext> {
    // 1. Get current route from preview iframe
    const route = await this.getCurrentRoute(buildId);

    // 2. Detect active component
    const component = await this.detectComponent(route);

    // 3. Get viewport size
    const viewport = this.getViewportSize();

    // 4. List visible elements
    const visibleElements = await this.getVisibleElements(buildId);

    // 5. Get recent user actions
    const recentActions = this.getRecentActions(buildId);

    // 6. Get build state
    const buildState = await this.getBuildState(buildId);

    return {
      route,
      component,
      viewport,
      visibleElements,
      recentActions,
      buildState
    };
  }

  private async getCurrentRoute(buildId: string): Promise<string> {
    // Query preview manager for current route
    const preview = previewManager.get(buildId);
    return preview?.currentRoute || '/';
  }

  private async detectComponent(route: string): Promise<string | null> {
    // Map route to component file
    // e.g., '/login' → 'app/login/page.tsx'
    const routeMap: Record<string, string> = {
      '/': 'app/page.tsx',
      '/login': 'app/login/page.tsx',
      '/dashboard': 'app/dashboard/page.tsx'
    };
    return routeMap[route] || null;
  }

  private getViewportSize(): 'mobile' | 'tablet' | 'desktop' {
    // Get from preview settings
    return 'desktop'; // TODO: Get from actual state
  }

  private async getVisibleElements(buildId: string): Promise<string[]> {
    // Analyze DOM to identify visible elements
    // Could use screenshot analysis or DOM traversal
    return ['header', 'navigation', 'main-content', 'footer'];
  }

  private getRecentActions(buildId: string): string[] {
    // Get last N user actions from action log
    return [];
  }

  private async getBuildState(buildId: string): Promise<any> {
    const orchestrator = orchestratorManager.get(buildId);
    return {
      completedTasks: orchestrator?.completedTaskCount || 0,
      currentPhase: orchestrator?.currentPhase || 'idle'
    };
  }
}
```

**Acceptance Criteria:**
- [ ] ChatContextCollector class created
- [ ] Collects current route from preview
- [ ] Detects active component
- [ ] Identifies viewport size
- [ ] Lists visible elements
- [ ] Gets build state information
- [ ] Returns complete ChatContext object

**Verification:**
```typescript
const collector = new ChatContextCollector();
const context = await collector.collectContext('build-123');
console.log(context);
// Should show route, component, viewport, etc.
```

---

#### Task 4.2: Create Preview Chat API Endpoint
**File:** `/apps/web/app/api/build/chat/route.ts` (new)
**Description:** API endpoint to handle chat messages and execute changes

**Implementation:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { orchestratorManager } from '@/lib/orchestrator-manager';
import { ChatContextCollector } from '@/lib/chat-context-collector';
import { CodeChangeParser } from '@/lib/code-change-parser';

export async function POST(request: NextRequest) {
  try {
    const { buildId, message, context } = await request.json();

    // 1. Get orchestrator
    const orchestrator = orchestratorManager.get(buildId);
    if (!orchestrator) {
      return NextResponse.json(
        { error: 'Build not found' },
        { status: 404 }
      );
    }

    // 2. Collect full context
    const contextCollector = new ChatContextCollector();
    const fullContext = {
      ...context,
      ...(await contextCollector.collectContext(buildId))
    };

    // 3. Build context-aware prompt
    const prompt = buildChatPrompt(message, fullContext);

    // 4. Execute with Claude
    const response = await orchestrator.claudeEngine.executeTask({
      id: `chat-${Date.now()}`,
      type: 'chat',
      description: 'Preview chat interaction',
      prompt
    });

    // 5. Parse response for code changes
    const parser = new CodeChangeParser();
    const changes = parser.parse(response.output);

    // 6. Apply changes if user approves
    if (changes.length > 0) {
      // Return changes for user approval
      return NextResponse.json({
        message: response.output,
        changes,
        requiresApproval: true
      });
    }

    // 7. Return conversational response
    return NextResponse.json({
      message: response.output,
      changes: [],
      requiresApproval: false
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Chat request failed' },
      { status: 500 }
    );
  }
}

function buildChatPrompt(userMessage: string, context: ChatContext): string {
  return `
# Preview Chat Context

You are helping the user modify their application in real-time.

## Current State

**Route:** ${context.route}
**Component:** ${context.component || 'Unknown'}
**Viewport:** ${context.viewport}
**Visible Elements:** ${context.visibleElements.join(', ')}

## Build Progress

- Completed Tasks: ${context.buildState.completedTasks}
- Current Phase: ${context.buildState.currentPhase}

## User Message

"${userMessage}"

## Instructions

1. Understand what the user wants to change
2. Identify which files need modification
3. Provide specific code changes
4. Explain the changes clearly

If code changes are needed, format them as:

\`\`\`change
FILE: path/to/file.tsx
OLD:
[code to replace]
NEW:
[replacement code]
\`\`\`

Otherwise, provide a conversational response explaining what you'd do.
`;
}
```

**Acceptance Criteria:**
- [ ] API endpoint created at `/api/build/chat`
- [ ] Accepts buildId, message, context
- [ ] Collects full chat context
- [ ] Builds context-aware prompt
- [ ] Executes with Claude CLI
- [ ] Parses code changes from response
- [ ] Returns changes for approval or conversational response
- [ ] Handles errors gracefully

**Verification:**
```bash
curl -X POST http://localhost:3002/api/build/chat \
  -H "Content-Type: application/json" \
  -d '{"buildId":"test","message":"Make the header blue","context":{"route":"/"}}'
# Should return Claude response with suggested changes
```

---

#### Task 4.3: Create Code Change Parser
**File:** `/apps/web/lib/code-change-parser.ts` (new)
**Description:** Parse Claude's response for code changes

**Implementation:**
```typescript
export interface CodeChange {
  file: string;
  oldCode: string;
  newCode: string;
  description?: string;
}

export class CodeChangeParser {
  parse(claudeResponse: string): CodeChange[] {
    const changes: CodeChange[] = [];

    // Match code change blocks:
    // ```change
    // FILE: path/to/file.tsx
    // OLD:
    // [code]
    // NEW:
    // [code]
    // ```

    const changeBlockRegex = /```change\n([\s\S]*?)```/g;
    let match;

    while ((match = changeBlockRegex.exec(claudeResponse)) !== null) {
      const block = match[1];
      const change = this.parseChangeBlock(block);
      if (change) {
        changes.push(change);
      }
    }

    return changes;
  }

  private parseChangeBlock(block: string): CodeChange | null {
    // Extract FILE, OLD, NEW sections
    const fileMatch = block.match(/FILE:\s*(.+)/);
    const oldMatch = block.match(/OLD:\n([\s\S]*?)(?:NEW:|$)/);
    const newMatch = block.match(/NEW:\n([\s\S]*?)$/);

    if (!fileMatch || !newMatch) {
      return null;
    }

    return {
      file: fileMatch[1].trim(),
      oldCode: oldMatch ? oldMatch[1].trim() : '',
      newCode: newMatch[1].trim()
    };
  }
}
```

**Acceptance Criteria:**
- [ ] CodeChangeParser class created
- [ ] Parses ```change``` blocks from Claude response
- [ ] Extracts FILE, OLD, NEW sections
- [ ] Returns array of CodeChange objects
- [ ] Handles malformed blocks gracefully

**Verification:**
```typescript
const parser = new CodeChangeParser();
const response = `
\`\`\`change
FILE: app/page.tsx
OLD:
<h1>Hello</h1>
NEW:
<h1 className="text-blue-500">Hello</h1>
\`\`\`
`;
const changes = parser.parse(response);
console.log(changes); // Should show parsed change
```

---

#### Task 4.4: Create Code Change Applicator
**File:** `/apps/web/lib/code-change-applicator.ts` (new)
**Description:** Apply parsed code changes to project files

**Implementation:**
```typescript
import fs from 'fs';
import path from 'path';

export class CodeChangeApplicator {
  constructor(private projectPath: string) {}

  async applyChange(change: CodeChange): Promise<void> {
    const filePath = path.join(this.projectPath, change.file);

    // 1. Check if file exists
    if (!fs.existsSync(filePath)) {
      // Create new file
      await this.createFile(filePath, change.newCode);
      return;
    }

    // 2. Read current content
    const currentContent = fs.readFileSync(filePath, 'utf-8');

    // 3. Apply change
    let newContent;
    if (change.oldCode) {
      // Replace old code with new code
      newContent = currentContent.replace(change.oldCode, change.newCode);

      // Verify replacement worked
      if (newContent === currentContent) {
        throw new Error(`Could not find old code in ${change.file}`);
      }
    } else {
      // No old code specified, replace entire file
      newContent = change.newCode;
    }

    // 4. Write updated content
    fs.writeFileSync(filePath, newContent, 'utf-8');
  }

  async applyChanges(changes: CodeChange[]): Promise<void> {
    for (const change of changes) {
      await this.applyChange(change);
    }
  }

  private async createFile(filePath: string, content: string): Promise<void> {
    // Create directory if needed
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(filePath, content, 'utf-8');
  }
}
```

**Acceptance Criteria:**
- [ ] CodeChangeApplicator class created
- [ ] Applies code changes to files
- [ ] Creates new files if needed
- [ ] Replaces old code with new code
- [ ] Verifies replacements worked
- [ ] Throws errors if changes fail

**Verification:**
```typescript
const applicator = new CodeChangeApplicator('/path/to/project');
await applicator.applyChange({
  file: 'app/page.tsx',
  oldCode: '<h1>Hello</h1>',
  newCode: '<h1 className="text-blue-500">Hello</h1>'
});
// Check file was updated
```

---

#### Task 4.5: Integrate Chat with UI
**File:** `/apps/web/components/ChatPanel.tsx`
**Description:** Connect ChatPanel to backend API

**Implementation:**
```typescript
// Update ChatPanel component:

const handleSendMessage = async () => {
  if (!inputMessage.trim() || isSending) return;

  setIsSending(true);

  try {
    // 1. Add user message to UI
    const userMsg: BuildMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    // 2. Send to API
    const response = await fetch('/api/build/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buildId,
        message: inputMessage,
        context: {
          route: currentRoute,
          viewport: currentViewport
        }
      })
    });

    const data = await response.json();

    // 3. Add assistant response
    const assistantMsg: BuildMessage = {
      role: 'assistant',
      content: data.message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, assistantMsg]);

    // 4. Show changes if any
    if (data.changes && data.changes.length > 0) {
      setPendingChanges(data.changes);
      setShowChangeApproval(true);
    }

    setInputMessage('');
  } catch (error) {
    console.error('Chat error:', error);
    // Show error toast
  } finally {
    setIsSending(false);
  }
};

const handleApproveChanges = async () => {
  try {
    // Apply changes via API
    await fetch('/api/build/apply-changes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buildId,
        changes: pendingChanges
      })
    });

    // Reload preview
    if (onPreviewReload) {
      onPreviewReload();
    }

    setShowChangeApproval(false);
    setPendingChanges([]);
  } catch (error) {
    console.error('Apply changes error:', error);
  }
};
```

**Acceptance Criteria:**
- [ ] ChatPanel sends messages to `/api/build/chat`
- [ ] Displays user and assistant messages
- [ ] Shows pending changes for approval
- [ ] Applies changes when user approves
- [ ] Reloads preview after changes applied
- [ ] Handles errors gracefully

**Verification:**
```typescript
// Use ChatPanel in preview
<ChatPanel buildId="test" onPreviewReload={() => window.location.reload()} />
// Type message → should get response → approve changes → preview updates
```

---

#### Task 4.6: Create Apply Changes API Endpoint
**File:** `/apps/web/app/api/build/apply-changes/route.ts` (new)
**Description:** API endpoint to apply approved code changes

**Implementation:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { orchestratorManager } from '@/lib/orchestrator-manager';
import { CodeChangeApplicator } from '@/lib/code-change-applicator';

export async function POST(request: NextRequest) {
  try {
    const { buildId, changes } = await request.json();

    // 1. Get orchestrator
    const orchestrator = orchestratorManager.get(buildId);
    if (!orchestrator) {
      return NextResponse.json(
        { error: 'Build not found' },
        { status: 404 }
      );
    }

    // 2. Apply changes
    const applicator = new CodeChangeApplicator(orchestrator.projectPath);
    await applicator.applyChanges(changes);

    // 3. Trigger hot reload in preview
    // (Next.js dev server will auto-reload)

    return NextResponse.json({
      success: true,
      message: `Applied ${changes.length} changes`
    });

  } catch (error) {
    console.error('Apply changes error:', error);
    return NextResponse.json(
      { error: 'Failed to apply changes' },
      { status: 500 }
    );
  }
}
```

**Acceptance Criteria:**
- [ ] API endpoint created at `/api/build/apply-changes`
- [ ] Accepts buildId and changes array
- [ ] Applies changes to project files
- [ ] Returns success response
- [ ] Handles errors gracefully

**Verification:**
```bash
curl -X POST http://localhost:3002/api/build/apply-changes \
  -H "Content-Type: application/json" \
  -d '{"buildId":"test","changes":[{...}]}'
# Should apply changes to files
```

---

## Phase 5: Integration & Testing (Days 13-14)

**Objective:** Connect all systems and validate end-to-end functionality

**Dependencies:** Phases 1-4 complete

### Tasks

#### Task 5.1: Integration Testing - PRD Auto-Update Flow
**File:** `/tests/integration/prd-auto-update.test.ts` (new)
**Description:** End-to-end test of PRD watching and auto-rebuild

**Test Cases:**
1. ✅ Start build with PRD watching enabled
2. ✅ Modify PRD.md (add new feature)
3. ✅ Verify watcher detects change
4. ✅ Verify new tasks generated
5. ✅ Verify tasks executed
6. ✅ Verify files created for new feature

**Verification:**
```bash
npm run test:integration -- prd-auto-update
# Should pass all test cases
```

---

#### Task 5.2: Integration Testing - Verification Loop
**File:** `/tests/integration/verification-loop.test.ts` (new)
**Description:** End-to-end test of post-build verification

**Test Cases:**
1. ✅ Complete initial build
2. ✅ Trigger verification
3. ✅ Verify gaps identified (intentionally incomplete PRD)
4. ✅ Verify new tasks generated for gaps
5. ✅ Verify tasks executed
6. ✅ Verify second verification pass
7. ✅ Verify completion when all requirements met

**Verification:**
```bash
npm run test:integration -- verification-loop
# Should pass all test cases
```

---

#### Task 5.3: Integration Testing - Preview Chat Flow
**File:** `/tests/integration/preview-chat.test.ts` (new)
**Description:** End-to-end test of preview chat functionality

**Test Cases:**
1. ✅ Start build and preview
2. ✅ Send chat message: "Make the header blue"
3. ✅ Verify context collected (route, component)
4. ✅ Verify Claude response received
5. ✅ Verify code changes parsed
6. ✅ Apply changes
7. ✅ Verify preview updates

**Verification:**
```bash
npm run test:integration -- preview-chat
# Should pass all test cases
```

---

#### Task 5.4: API Endpoint Validation
**Description:** Verify all new API endpoints are properly configured

**Endpoints to Validate:**
- [ ] `POST /api/build/prd/export` - Exports PRD and starts watcher
- [ ] `POST /api/build/chat` - Handles preview chat messages
- [ ] `POST /api/build/apply-changes` - Applies code changes
- [ ] `GET /api/build/events` - SSE events include verification events

**Verification:**
```bash
# Test each endpoint with curl
npm run test:api
```

---

#### Task 5.5: UI Integration Verification
**Description:** Verify all UI components connected to backend

**Components to Verify:**
- [ ] VerificationPanel - Displays verification progress
- [ ] ChatPanel - Sends/receives messages
- [ ] InteractivePreview - Applies changes and reloads
- [ ] BuildCanvas - Shows verification events

**Verification:**
```typescript
// Manual testing in browser
// 1. Start build
// 2. Verify VerificationPanel shows progress
// 3. Chat in preview → verify changes applied
// 4. Edit PRD → verify auto-rebuild
```

---

#### Task 5.6: Performance Validation
**Description:** Run benchmarks and verify performance meets requirements

**Metrics to Measure:**
- [ ] Raw Claude CLI baseline time
- [ ] BuildRunner time (all optimizations enabled)
- [ ] Multiplier: BuildRunner / Raw Claude
- [ ] Target: ≤1.3x

**Verification:**
```bash
npm run benchmark
# Check: multiplier ≤ 1.3x
```

---

## Phase 6: Validation & Documentation (Days 15-16)

**Objective:** Gap analysis, commit, and comprehensive documentation

**Dependencies:** Phase 5 complete (all tests passing)

### Tasks

#### Task 6.1: Comprehensive Gap Analysis
**File:** `/GAP_ANALYSIS.md` (new)
**Description:** Compare implementation vs original plan

**Analysis Sections:**
1. **Requirement 1: PRD Auto-Update**
   - ✅ Implemented features
   - ✅ Test results
   - ✅ Known limitations

2. **Requirement 2: Post-Build Verification**
   - ✅ Implemented features
   - ✅ Test results
   - ✅ Known limitations

3. **Requirement 3: Preview Chat**
   - ✅ Implemented features
   - ✅ Test results
   - ✅ Known limitations

4. **Requirement 4: Performance**
   - ✅ Benchmark results
   - ✅ Actual multiplier
   - ✅ Optimization effectiveness

**Acceptance Criteria:**
- [ ] All requirements analyzed
- [ ] Implementation completeness documented
- [ ] Test coverage documented
- [ ] Known issues/limitations documented
- [ ] Future improvements documented

---

#### Task 6.2: Update Project Documentation
**Files:**
- `/README.md`
- `/docs/CLAUDE_CLI_INTEGRATION.md`
- `/docs/PRD_ORCHESTRATION.md` (new)
- `/docs/VERIFICATION_SYSTEM.md` (new)
- `/docs/PREVIEW_CHAT.md` (new)

**Updates:**
- [ ] README with new features
- [ ] Claude CLI integration guide
- [ ] PRD orchestration documentation
- [ ] Verification system documentation
- [ ] Preview chat documentation
- [ ] Performance benchmarks

---

#### Task 6.3: Update Build Runner Status
**Files:**
- `/.buildrunner/features.json`
- `/.buildrunner/STATUS.md`

**Updates:**
1. Mark all implemented features as "complete"
2. Update component counts
3. Update API endpoint counts
4. Regenerate STATUS.md
5. Update version to 1.2.0

**Verification:**
```bash
node .buildrunner/scripts/generate-status.mjs
# Should show updated completion percentage
```

---

#### Task 6.4: Create Implementation Overview Document
**File:** `/IMPLEMENTATION_OVERVIEW.md` (new)
**Description:** High-level summary of what was built

**Sections:**
1. **Executive Summary**
   - What was built
   - Time taken
   - Key achievements

2. **Architecture Changes**
   - New systems added
   - Integration points
   - Data flow diagrams

3. **Performance Results**
   - Benchmark data
   - Optimization effectiveness
   - Comparison to requirements

4. **Testing Results**
   - Integration tests
   - API tests
   - UI tests

5. **User Guide**
   - How to use PRD auto-update
   - How to use verification loop
   - How to use preview chat

6. **Known Issues & Future Work**
   - Current limitations
   - Planned improvements
   - Technical debt

**Acceptance Criteria:**
- [ ] Document created with all sections
- [ ] Clear and comprehensive
- [ ] Includes examples and screenshots
- [ ] Ready for user review

---

#### Task 6.5: Git Commit & Push
**Description:** Commit all changes with proper commit message

**Commit Steps:**
```bash
# 1. Stage all changes
git add .

# 2. Commit with semantic versioning
git commit -m "feat: Complete PRD orchestration system with auto-update, verification loop, and preview chat

- PRD Watcher: Auto-detect PRD changes and trigger incremental rebuilds
- Verification Loop: Claude checks PRD after builds and continues until complete
- Preview Chat: Contextual chat interface for live changes
- Performance: Benchmarked at 1.3x raw Claude CLI with optimizations
- Integration: All systems connected and tested end-to-end

Closes #[issue-number]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 3. Regenerate status
node .buildrunner/scripts/generate-status.mjs

# 4. Commit status update
git add .buildrunner/
git commit -m "chore: Update BuildRunner status to v1.2.0"

# 5. Push to remote
git push origin feat/prd-orchestration
```

**Acceptance Criteria:**
- [ ] All changes committed
- [ ] Commit message follows standards
- [ ] Status files updated
- [ ] Pushed to remote
- [ ] Clean git status

---

## Task Execution Checklist

**Before Starting Each Task:**
- [ ] Read task description and acceptance criteria
- [ ] Check dependencies are complete
- [ ] Load relevant files for context
- [ ] Understand integration points

**During Task Execution:**
- [ ] Implement according to specification
- [ ] Write clear, documented code
- [ ] Follow TypeScript best practices
- [ ] Add error handling
- [ ] Emit events for UI updates

**After Task Completion:**
- [ ] Verify all acceptance criteria met
- [ ] Run verification steps
- [ ] Test integration with other systems
- [ ] Update todo list (mark complete)
- [ ] Document any deviations or issues

---

## Success Criteria (Final Validation)

**Requirement 1: PRD Auto-Update**
- [ ] PRD watcher detects changes within 2s
- [ ] Incremental tasks generated correctly
- [ ] Build continues automatically
- [ ] No manual intervention required

**Requirement 2: Post-Build Verification**
- [ ] Claude verifies PRD after builds
- [ ] Identifies gaps accurately
- [ ] Generates tasks for gaps
- [ ] Loops until complete
- [ ] Max 5 iterations

**Requirement 3: Preview Chat**
- [ ] Chat interface functional
- [ ] Context collected correctly
- [ ] Claude responses relevant
- [ ] Code changes parsed
- [ ] Changes applied successfully
- [ ] Preview updates in real-time

**Requirement 4: Performance**
- [ ] Benchmark completed
- [ ] Raw Claude baseline measured
- [ ] BuildRunner ≤1.3x slower
- [ ] Optimizations enabled by default
- [ ] Performance metrics collected

**General Quality:**
- [ ] All tests passing
- [ ] All APIs working
- [ ] UI components connected
- [ ] Documentation complete
- [ ] No critical bugs
- [ ] Ready for production

---

## Risk Mitigation

**High-Risk Areas:**
1. **PRD Change Detection** - False positives/negatives
   - Mitigation: Hash-based comparison + debouncing

2. **Verification Loop** - Infinite loops or false completions
   - Mitigation: Max iteration limit + confidence thresholds

3. **Preview Chat** - Claude responses not parseable
   - Mitigation: Structured prompts + fallback parsing

4. **Performance** - Optimizations cause instability
   - Mitigation: Feature flags + gradual rollout

**Contingency Plans:**
- If PRD watcher unstable → Manual trigger endpoint as fallback
- If verification loop problematic → Optional feature flag
- If chat parsing fails → Return raw response to user
- If performance target missed → Document and iterate

---

## Timeline Summary

| Phase | Duration | Tasks | Status |
|-------|----------|-------|--------|
| 1. Performance Baseline | 2 days | 3 | Pending |
| 2. PRD Watcher | 3 days | 4 | Pending |
| 3. Verification Loop | 3 days | 3 | Pending |
| 4. Preview Chat | 4 days | 6 | Pending |
| 5. Integration & Testing | 2 days | 6 | Pending |
| 6. Validation & Documentation | 2 days | 5 | Pending |
| **Total** | **16 days** | **27 tasks** | **0% Complete** |

---

## Notes for Future Claude Instances

**If you're taking over this implementation:**

1. **Check todo list first** - See what's been completed
2. **Read GAP_ANALYSIS.md** - Understand current state vs plan
3. **Run tests** - Verify nothing broke
4. **Check git log** - See recent changes
5. **Continue from next pending task** - Don't skip ahead

**Critical Files to Understand:**
- `/apps/web/lib/build-orchestrator.ts` - Core orchestration
- `/apps/web/lib/claude-cli-engine.ts` - Claude CLI integration
- `/apps/web/lib/prd-watcher.ts` - PRD monitoring (new)
- `/apps/web/lib/build-verifier.ts` - Verification system (new)

**Common Issues:**
- Session pool exhaustion → Check circuit breaker
- PRD watcher stuck → Check debounce timer
- Verification loop infinite → Check max iterations
- Chat not responding → Check API endpoint

---

**END OF PLAN**

*This is a comprehensive, production-ready implementation plan. All tasks are atomic, verifiable, and optimized for Claude execution. Any Claude instance can pick up at any point using the todo list as the source of truth.*
