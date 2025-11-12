# Task-Based Orchestration Implementation Plan

**Goal:** Ensure Claude Code produces highest quality code without skipping steps or making mistakes through deterministic task-based execution.

---

## Overview

Transform BuildRunner from parallel AI chaos into sequential, traceable, task-based orchestration.

**Current Problem:**
- Components generated in parallel without clear ordering
- No visibility into what's being built
- No recovery mechanism if build fails
- No way to verify completeness
- PRD changes aren't tracked against progress

**Solution:**
- Generate detailed task list from PRD
- Execute tasks sequentially with clear dependencies
- Log every step in BUILD_LOG.md
- Perform gap analysis after build
- Re-sync when PRD changes

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  PRD (Source of Truth)                                          │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. TASK LIST GENERATOR                                         │
│  - Parse PRD into atomic tasks                                  │
│  - Identify dependencies                                        │
│  - Estimate complexity                                          │
│  - Output: TASKS.md (checklist format)                          │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. TASK EXECUTOR                                               │
│  - Execute tasks ONE AT A TIME                                  │
│  - Mark completion in TASKS.md                                  │
│  - Log detailed output to BUILD_LOG.md                          │
│  - Pause on errors with clear context                           │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. GAP ANALYZER                                                │
│  - Compare built artifacts vs TASKS.md                          │
│  - Check all endpoints exist                                    │
│  - Verify UI → API connections                                  │
│  - Generate missing pieces                                      │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. VERIFICATION SYSTEM                                         │
│  - Test all API endpoints (smoke tests)                         │
│  - Verify UI components render                                  │
│  - Check for missing dependencies                               │
│  - Report: BUILD_VERIFICATION.md                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Tasks

### **MILESTONE 1: Fix User Input Bug (30 min)**

#### Task 1.1: Fix intervention event to include question
- **File:** `apps/web/lib/build-orchestrator.ts`
- **Change:** When emitting `intervention:user_input_required`, include actual question in `data.message`
- **Test:** Trigger intervention, verify question shows in UI

---

### **MILESTONE 2: Task List Generator (2-3 hours)**

#### Task 2.1: Create TaskListGenerator class
- **File:** `apps/web/lib/task-list-generator.ts`
- **Inputs:** PRD object
- **Outputs:** TASKS.md file
- **Logic:**
  ```typescript
  interface Task {
    id: string;
    title: string;
    description: string;
    type: 'setup' | 'component' | 'api' | 'integration' | 'verification';
    dependencies: string[]; // Task IDs this depends on
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    estimatedMinutes: number;
    completedAt?: string;
    errorMessage?: string;
  }
  ```

#### Task 2.2: Implement PRD → Tasks parsing
- Extract features from PRD
- Break each feature into atomic tasks:
  - Backend API endpoint
  - Database models (if needed)
  - Frontend component
  - API integration in component
  - Error handling
  - Loading states
- Order by dependencies (topological sort)

#### Task 2.3: Generate TASKS.md format
```markdown
# Build Tasks for [Project Name]

Generated: 2025-11-11 21:55:00
Total Tasks: 23
Completed: 0/23 (0%)

---

## Setup Tasks

- [ ] Task 1: Create project structure
  - ID: setup-001
  - Type: setup
  - Dependencies: none
  - Status: pending

- [ ] Task 2: Install dependencies
  - ID: setup-002
  - Type: setup
  - Dependencies: setup-001
  - Status: pending

---

## Backend API Tasks

- [ ] Task 3: Create /api/products endpoint
  - ID: api-001
  - Type: api
  - Dependencies: setup-002
  - Status: pending
  - Details: GET endpoint to fetch products with carbon footprint data

...
```

#### Task 2.4: Store tasks in build directory
- Location: `builds/{projectId}/TASKS.md`
- Also store JSON version: `builds/{projectId}/tasks.json`

---

### **MILESTONE 3: Sequential Task Executor (3-4 hours)**

#### Task 3.1: Create TaskExecutor class
- **File:** `apps/web/lib/task-executor.ts`
- **Responsibilities:**
  - Load TASKS.md
  - Find next pending task (respecting dependencies)
  - Execute task
  - Update status in TASKS.md
  - Log to BUILD_LOG.md
  - Handle errors gracefully

#### Task 3.2: Implement task execution logic
```typescript
class TaskExecutor {
  async executeNextTask(projectId: string): Promise<TaskResult> {
    // 1. Load tasks.json
    const tasks = await this.loadTasks(projectId);

    // 2. Find next executable task (all dependencies completed)
    const nextTask = this.findNextTask(tasks);

    if (!nextTask) {
      return { done: true, message: 'All tasks completed' };
    }

    // 3. Mark task as in_progress
    await this.updateTaskStatus(projectId, nextTask.id, 'in_progress');

    // 4. Execute task based on type
    try {
      const result = await this.executeTask(nextTask);

      // 5. Mark as completed
      await this.updateTaskStatus(projectId, nextTask.id, 'completed');
      await this.logSuccess(projectId, nextTask, result);

      return { success: true, task: nextTask, result };
    } catch (error) {
      // 6. Mark as failed
      await this.updateTaskStatus(projectId, nextTask.id, 'failed', error.message);
      await this.logError(projectId, nextTask, error);

      return { success: false, task: nextTask, error };
    }
  }

  private async executeTask(task: Task): Promise<any> {
    switch (task.type) {
      case 'setup':
        return await this.executeSetupTask(task);
      case 'api':
        return await this.executeApiTask(task);
      case 'component':
        return await this.executeComponentTask(task);
      case 'integration':
        return await this.executeIntegrationTask(task);
      case 'verification':
        return await this.executeVerificationTask(task);
    }
  }
}
```

#### Task 3.3: Implement BUILD_LOG.md logging
```markdown
# Build Log for [Project Name]

Started: 2025-11-11 21:55:00

---

## Task 1: Create project structure (setup-001)
**Started:** 21:55:05
**Status:** ✅ Completed
**Duration:** 3s

Created directories:
- src/
- src/components/
- src/api/
- src/lib/

**Completed:** 21:55:08

---

## Task 2: Install dependencies (setup-002)
**Started:** 21:55:10
**Status:** ✅ Completed
**Duration:** 45s

Installed packages:
- react@18.2.0
- next@14.2.24
- tailwindcss@3.3.0

**Completed:** 21:55:55

---

## Task 3: Create /api/products endpoint (api-001)
**Started:** 21:56:00
**Status:** 🔄 In Progress

Generating API endpoint with Claude...

```

#### Task 3.4: Integrate with existing build-orchestrator.ts
- Replace parallel component generation with sequential task execution
- Emit SSE events for each task start/completion
- Update UI to show current task progress

---

### **MILESTONE 4: Gap Analysis System (2 hours)**

#### Task 4.1: Create GapAnalyzer class
- **File:** `apps/web/lib/gap-analyzer.ts`
- **Purpose:** Compare what was supposed to be built vs what exists

#### Task 4.2: Implement analysis logic
```typescript
class GapAnalyzer {
  async analyzeGaps(projectId: string): Promise<GapAnalysisReport> {
    const tasks = await this.loadTasks(projectId);
    const buildDir = this.getBuildDirectory(projectId);

    const gaps: Gap[] = [];

    // Check each completed task
    for (const task of tasks.filter(t => t.status === 'completed')) {
      // Verify expected artifacts exist
      if (task.type === 'api') {
        const apiPath = path.join(buildDir, task.expectedFile);
        if (!fs.existsSync(apiPath)) {
          gaps.push({
            taskId: task.id,
            type: 'missing_file',
            severity: 'high',
            message: `API endpoint file missing: ${task.expectedFile}`
          });
        }
      }

      if (task.type === 'component') {
        const componentPath = path.join(buildDir, task.expectedFile);
        if (!fs.existsSync(componentPath)) {
          gaps.push({
            taskId: task.id,
            type: 'missing_file',
            severity: 'high',
            message: `Component file missing: ${task.expectedFile}`
          });
        }

        // Check if component imports the API
        if (task.dependencies.some(d => tasks.find(t => t.id === d && t.type === 'api'))) {
          const content = fs.readFileSync(componentPath, 'utf-8');
          const apiTask = tasks.find(t => task.dependencies.includes(t.id) && t.type === 'api');
          const apiImportCheck = content.includes(apiTask.expectedFile.replace('.ts', ''));

          if (!apiImportCheck) {
            gaps.push({
              taskId: task.id,
              type: 'missing_integration',
              severity: 'medium',
              message: `Component ${task.title} doesn't import API ${apiTask.title}`
            });
          }
        }
      }
    }

    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      gaps: gaps,
      severity: gaps.some(g => g.severity === 'high') ? 'high' : 'low'
    };
  }

  async fillGaps(projectId: string, report: GapAnalysisReport): Promise<void> {
    // Generate missing pieces
    for (const gap of report.gaps) {
      if (gap.type === 'missing_file') {
        await this.regenerateTask(projectId, gap.taskId);
      } else if (gap.type === 'missing_integration') {
        await this.fixIntegration(projectId, gap.taskId);
      }
    }
  }
}
```

#### Task 4.3: Generate GAP_ANALYSIS.md report
```markdown
# Gap Analysis Report

Project: Grocery Delivery Platform
Analyzed: 2025-11-11 22:30:00

---

## Summary

- **Total Tasks:** 23
- **Completed:** 23
- **Failed:** 0
- **Gaps Found:** 3

---

## Critical Gaps (High Severity)

### Gap 1: Missing API endpoint
- **Task:** api-003 (Create /api/rewards endpoint)
- **Issue:** Expected file `src/api/rewards/route.ts` not found
- **Action:** Regenerating endpoint...

---

## Minor Gaps (Medium Severity)

### Gap 2: Missing API integration
- **Task:** component-005 (RewardsDashboard component)
- **Issue:** Component doesn't import /api/rewards endpoint
- **Action:** Adding API integration...

---

## Verification

All gaps will be filled and re-verified.
```

---

### **MILESTONE 5: Verification System (1-2 hours)**

#### Task 5.1: Create VerificationSystem class
- **File:** `apps/web/lib/verification-system.ts`

#### Task 5.2: Implement endpoint verification
```typescript
class VerificationSystem {
  async verifyEndpoints(projectId: string): Promise<EndpointVerification[]> {
    const tasks = await this.loadTasks(projectId);
    const apiTasks = tasks.filter(t => t.type === 'api');

    const results: EndpointVerification[] = [];

    for (const task of apiTasks) {
      const endpoint = task.endpoint; // e.g., '/api/products'

      try {
        // Check if route file exists
        const routePath = path.join(this.getBuildDirectory(projectId), task.expectedFile);
        const exists = fs.existsSync(routePath);

        if (!exists) {
          results.push({
            endpoint,
            status: 'missing',
            message: 'Route file not found'
          });
          continue;
        }

        // Parse file to check for HTTP methods
        const content = fs.readFileSync(routePath, 'utf-8');
        const hasGET = /export\s+async\s+function\s+GET/.test(content);
        const hasPOST = /export\s+async\s+function\s+POST/.test(content);

        results.push({
          endpoint,
          status: 'verified',
          methods: {
            GET: hasGET,
            POST: hasPOST
          }
        });
      } catch (error) {
        results.push({
          endpoint,
          status: 'error',
          message: error.message
        });
      }
    }

    return results;
  }

  async verifyUIConnections(projectId: string): Promise<UIVerification[]> {
    const tasks = await this.loadTasks(projectId);
    const componentTasks = tasks.filter(t => t.type === 'component');

    const results: UIVerification[] = [];

    for (const task of componentTasks) {
      const componentPath = path.join(this.getBuildDirectory(projectId), task.expectedFile);

      if (!fs.existsSync(componentPath)) {
        results.push({
          component: task.title,
          status: 'missing',
          message: 'Component file not found'
        });
        continue;
      }

      const content = fs.readFileSync(componentPath, 'utf-8');

      // Check for required API integrations
      const apiDependencies = task.dependencies
        .map(depId => tasks.find(t => t.id === depId && t.type === 'api'))
        .filter(Boolean);

      const missingAPIs = apiDependencies.filter(apiTask => {
        const apiName = apiTask.endpoint.split('/').pop();
        return !content.includes(apiName);
      });

      if (missingAPIs.length > 0) {
        results.push({
          component: task.title,
          status: 'incomplete',
          message: `Missing API integrations: ${missingAPIs.map(a => a.endpoint).join(', ')}`
        });
      } else {
        results.push({
          component: task.title,
          status: 'verified',
          message: 'All API integrations present'
        });
      }
    }

    return results;
  }
}
```

#### Task 5.3: Generate VERIFICATION_REPORT.md
```markdown
# Build Verification Report

Project: Grocery Delivery Platform
Verified: 2025-11-11 22:45:00

---

## API Endpoints

### ✅ Verified (5/6)
- `/api/products` - GET, POST
- `/api/cart` - GET, POST, DELETE
- `/api/rewards` - GET, POST
- `/api/carbon-footprint` - GET
- `/api/seasonal-products` - GET

### ❌ Issues (1/6)
- `/api/checkout` - **Missing POST method**

---

## UI Components

### ✅ Verified (8/10)
- ProductList - All APIs integrated
- ShoppingCart - All APIs integrated
- RewardsDashboard - All APIs integrated
- CarbonTracker - All APIs integrated
- SeasonalProducts - All APIs integrated
- CheckoutForm - All APIs integrated
- OrderHistory - All APIs integrated
- Profile - All APIs integrated

### ❌ Issues (2/10)
- **NavBar** - Missing API: /api/cart (for cart count)
- **Dashboard** - Missing API: /api/rewards (for points display)

---

## Overall Status

- **Endpoints:** 5/6 verified (83%)
- **Components:** 8/10 verified (80%)
- **Ready for Testing:** ⚠️ NO (2 issues must be fixed)

---

## Action Items

1. Add POST method to /api/checkout
2. Integrate /api/cart into NavBar component
3. Integrate /api/rewards into Dashboard component
```

---

### **MILESTONE 6: PRD Change Detection (2 hours)**

#### Task 6.1: Create PRDWatcher class
- **File:** `apps/web/lib/prd-watcher.ts`
- **Purpose:** Detect when PRD changes and update TASKS.md accordingly

#### Task 6.2: Implement PRD diffing
```typescript
class PRDWatcher {
  async detectChanges(projectId: string, newPRD: PRD): Promise<PRDDiff> {
    const oldPRD = await this.loadPreviousPRD(projectId);

    return {
      addedFeatures: this.findAddedFeatures(oldPRD, newPRD),
      removedFeatures: this.findRemovedFeatures(oldPRD, newPRD),
      modifiedFeatures: this.findModifiedFeatures(oldPRD, newPRD)
    };
  }

  async updateTaskList(projectId: string, diff: PRDDiff): Promise<void> {
    const tasks = await this.loadTasks(projectId);

    // Add new tasks for added features
    for (const feature of diff.addedFeatures) {
      const newTasks = await this.generateTasksForFeature(feature);
      tasks.push(...newTasks);
    }

    // Mark removed feature tasks as obsolete
    for (const feature of diff.removedFeatures) {
      const featureTasks = tasks.filter(t => t.featureId === feature.id);
      featureTasks.forEach(t => t.status = 'obsolete');
    }

    // Update modified feature tasks
    for (const feature of diff.modifiedFeatures) {
      // Re-generate tasks for this feature
      const updatedTasks = await this.generateTasksForFeature(feature);

      // Replace old tasks
      const oldTasks = tasks.filter(t => t.featureId === feature.id);
      oldTasks.forEach(t => t.status = 'obsolete');
      tasks.push(...updatedTasks);
    }

    await this.saveTasks(projectId, tasks);
    await this.logPRDChange(projectId, diff);
  }
}
```

---

### **MILESTONE 7: UI Integration (1 hour)**

#### Task 7.1: Update workbench page to show task progress
- Add task list sidebar showing:
  - Current task being executed
  - Completed tasks (with checkmarks)
  - Pending tasks (grayed out)
  - Failed tasks (with red X)

#### Task 7.2: Add real-time task updates via SSE
```typescript
// In build-orchestrator.ts
async executeTaskBasedBuild(projectId: string) {
  const executor = new TaskExecutor();

  while (true) {
    const result = await executor.executeNextTask(projectId);

    if (result.done) {
      // All tasks completed, run gap analysis
      this.emitEvent({
        type: 'build:gap_analysis_start',
        projectId
      });

      const analyzer = new GapAnalyzer();
      const gapReport = await analyzer.analyzeGaps(projectId);

      if (gapReport.gaps.length > 0) {
        this.emitEvent({
          type: 'build:gaps_found',
          projectId,
          gaps: gapReport.gaps
        });

        await analyzer.fillGaps(projectId, gapReport);
      }

      // Run verification
      this.emitEvent({
        type: 'build:verification_start',
        projectId
      });

      const verifier = new VerificationSystem();
      const endpointVerification = await verifier.verifyEndpoints(projectId);
      const uiVerification = await verifier.verifyUIConnections(projectId);

      this.emitEvent({
        type: 'build:complete',
        projectId,
        verification: {
          endpoints: endpointVerification,
          ui: uiVerification
        }
      });

      break;
    }

    if (!result.success) {
      // Task failed, pause and ask user
      this.emitEvent({
        type: 'intervention:user_input_required',
        projectId,
        message: `Task "${result.task.title}" failed: ${result.error.message}. How should we proceed? (retry/skip/abort)`,
        data: {
          taskId: result.task.id,
          error: result.error
        }
      });

      // Wait for user response
      await this.waitForUserInput(projectId);
    }

    // Emit task progress
    this.emitEvent({
      type: 'build:task_completed',
      projectId,
      task: result.task,
      progress: await this.calculateProgress(projectId)
    });
  }
}
```

---

## Implementation Timeline

### Week 1: Core Infrastructure
- **Day 1-2:** Milestone 1 (Fix user input) + Milestone 2 (Task list generator)
- **Day 3-4:** Milestone 3 (Sequential executor)
- **Day 5:** Testing and debugging

### Week 2: Quality Assurance
- **Day 1-2:** Milestone 4 (Gap analyzer)
- **Day 3:** Milestone 5 (Verification system)
- **Day 4:** Milestone 6 (PRD change detection)
- **Day 5:** Milestone 7 (UI integration) + End-to-end testing

---

## Success Criteria

✅ **Build Reliability**
- 0% of steps skipped
- 100% traceability (every action logged)
- Automatic recovery from failures

✅ **User Experience**
- Clear visibility into current task
- Estimated time remaining
- Pause/resume capability

✅ **Quality Assurance**
- All API endpoints verified working
- All UI components verified connected to APIs
- Gap analysis catches 100% of missing pieces

✅ **PRD Synchronization**
- PRD changes automatically update task list
- No manual intervention needed
- Progress preserved across PRD updates

---

## File Structure After Implementation

```
builds/
  {projectId}/
    TASKS.md                 # Human-readable task checklist
    tasks.json               # Machine-readable task state
    BUILD_LOG.md            # Detailed execution log
    GAP_ANALYSIS.md         # Gap analysis report
    VERIFICATION_REPORT.md  # Verification results
    PRD_HISTORY.json        # PRD change history

    src/                    # Generated code
      api/
      components/
      lib/
```

---

## Next Steps

**IMMEDIATE (Fix user input bug):**
1. Fix `build-orchestrator.ts` to include question in intervention events
2. Test that questions show properly in UI

**SHORT-TERM (Implement task orchestration):**
1. Create `task-list-generator.ts`
2. Create `task-executor.ts`
3. Create `gap-analyzer.ts`
4. Create `verification-system.ts`
5. Integrate with existing `build-orchestrator.ts`

**LONG-TERM (Production hardening):**
1. Add retry logic for transient failures
2. Add cost tracking per task
3. Add performance benchmarks per task
4. Add A/B testing for different task orderings

---

Generated: 2025-11-11
Status: Ready for Implementation
