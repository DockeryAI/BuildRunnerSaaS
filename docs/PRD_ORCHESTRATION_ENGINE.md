# PRD-Driven Autonomous Orchestration Engine

**Version:** 1.2.0
**Status:** Planned (Next Priority - Before Auto-Healing)
**Priority:** Critical
**Target:** Ship within 3 weeks

---

## The Core Problem

### Current State (What's Broken)

**BuildRunner today is a stateless instruction follower, not an intelligent project manager:**

❌ **Forgets context between sessions**
- No memory of why components were built
- Can't recall architectural decisions
- Loses understanding of dependencies

❌ **Needs constant human orchestration**
- User must manually trigger rebuilds
- User must remember what depends on what
- User must coordinate build order

❌ **Can't detect when requirements change**
- PRD changes don't trigger automatic updates
- No awareness of what changed in the PRD
- No understanding of change impact

❌ **Doesn't understand project dependencies holistically**
- Treats components as isolated units
- Doesn't infer implicit relationships
- Rebuilds entire project when only one thing changed

### Pain Point Example

**User changes PRD:** Adds "User Authentication" block

**Current BuildRunner:**
```
1. User drags authentication block into PRD ✅
2. User clicks "Generate Plan" ✅
3. User waits for plan ✅
4. User clicks "Start Build" ✅
5. Build completes ✅
6. ❌ Existing dashboard page doesn't have auth
7. ❌ API routes aren't protected
8. ❌ Database has no user table
9. User realizes nothing was updated 😡
10. User manually asks to rebuild everything 😡
11. Entire project rebuilds (wastes time) 😡
```

**What SHOULD happen:**
```
1. User drags authentication block into PRD ✅
2. System detects change automatically ✅
3. System analyzes impact (dashboard, API, database need updates) ✅
4. System rebuilds ONLY affected components ✅
5. System validates everything still works ✅
6. User reviews the result ✅
```

---

## The Vision: What BuildRunner SHOULD Be

### The Dream Workflow

```yaml
The User's Experience:
1. User updates PRD blocks (drag/drop/modify)
2. System automatically:
   - Detects what changed
   - Recalculates entire dependency graph
   - Updates build plan
   - Rebuilds ONLY affected components
   - Maintains everything else working
3. User just reviews the result

Zero manual orchestration needed.
```

### Example: Adding Authentication

**User Action:** Drags "User Authentication" block into PRD

**System Response (Autonomous):**
```
🔍 Detected PRD change: Added authentication block

📊 Impact Analysis:
   - Database: needs users table, sessions table
   - API: needs auth middleware on all routes
   - Frontend: needs login page, protected route wrapper
   - Existing: dashboard needs auth check, profile needs user context

📋 Execution Plan:
   Phase 1: Database (must go first)
     - Create users table migration
     - Create sessions table migration

   Phase 2: Backend (depends on database)
     - Create auth middleware
     - Update all API routes
     - Create login/logout endpoints

   Phase 3: Frontend (depends on backend)
     - Create login page
     - Create protected route wrapper
     - Update dashboard to use auth
     - Update profile to use user context

🚀 Executing plan autonomously...
   ✅ Phase 1 complete (2 migrations)
   ✅ Phase 2 complete (auth middleware + 5 routes)
   ✅ Phase 3 complete (login page + 2 component updates)

✅ Build complete - all components updated coherently
```

**User sees:** Everything just works, no manual intervention needed.

---

## Architecture: The Missing Pieces

### 1. PRDOrchestrator - The Brain

**File:** `apps/web/lib/prd-orchestrator.ts`

**What it does:**
- Watches PRD for any changes (add/remove/modify blocks)
- Compares new PRD with last known state
- Triggers impact analysis
- Creates minimal execution plan
- Executes autonomously without human prompts

**Key Methods:**

```typescript
export class PRDOrchestrator {
  private lastPRD: PRD;
  private buildState: BuildState;

  async syncWithPRD(prd: PRD): Promise<void> {
    // Compare with last known state
    const changes = this.detectChanges(prd);

    if (changes.none) return;

    // Create execution plan
    const plan = await this.createExecutionPlan(changes);

    // Execute without human intervention
    await this.executeAutonomously(plan);
  }

  private detectChanges(newPRD: PRD): PRDChanges {
    const changes = {
      added: [],
      removed: [],
      modified: [],
      reordered: []
    };

    // Smart diff - not just text comparison
    for (const block of newPRD.blocks) {
      const previous = this.lastPRD.blocks.find(b => b.id === block.id);

      if (!previous) {
        changes.added.push(block);
        // Check if this affects existing components
        if (block.type === 'authentication') {
          changes.modified.push(...this.findAuthDependents());
        }
      } else if (!deepEqual(previous, block)) {
        changes.modified.push({ old: previous, new: block });
      }
    }

    return changes;
  }

  private async createExecutionPlan(changes: PRDChanges): Promise<ExecutionPlan> {
    const plan = {
      phases: [],
      validations: [],
      rollbackPoints: []
    };

    // Smart ordering based on dependencies
    if (changes.added.some(b => b.type === 'database')) {
      plan.phases.push({
        name: 'DATABASE_FIRST',
        components: ['schema', 'migrations'],
        reason: 'Everything depends on data model'
      });
    }

    // Add remaining in dependency order
    const sorted = this.topologicalSort(changes);
    plan.phases.push(...sorted);

    return plan;
  }

  async executeAutonomously(plan: ExecutionPlan): Promise<void> {
    console.log('🤖 PRD changed, executing autonomous rebuild...');

    for (const phase of plan.phases) {
      console.log(`📦 Phase: ${phase.name}`);

      // Build components
      const results = await this.buildPhase(phase);

      // Validate before proceeding
      const valid = await this.validatePhase(results);

      if (!valid) {
        // Auto-fix or rollback
        await this.handleFailure(phase, results);
      }

      // Update state
      this.buildState.completePhase(phase);
    }

    console.log('✅ PRD sync complete - all components updated');
  }
}
```

### 2. DependencyIntelligence - The Understanding

**File:** `apps/web/lib/dependency-intelligence.ts`

**What it does:**
- Infers implicit dependencies (e.g., "payments" needs "authentication")
- Builds complete dependency graph
- Determines correct build order using topological sort
- Identifies parallel build opportunities (waves)

**Dependency Rules:**

```typescript
export class DependencyIntelligence {
  private graph: Map<string, Set<string>> = new Map();

  // Comprehensive dependency rules
  private readonly DEPENDENCY_RULES = {
    // Core infrastructure
    'database': [],
    'authentication': ['database'],
    'authorization': ['authentication'],

    // User features
    'user-profile': ['authentication'],
    'user-settings': ['authentication', 'user-profile'],
    'payments': ['authentication', 'user-profile'],
    'subscriptions': ['payments'],

    // Admin features
    'admin-panel': ['authentication', 'authorization'],
    'user-management': ['admin-panel'],
    'analytics': ['admin-panel'],

    // Content features
    'blog': ['database'],
    'comments': ['authentication', 'blog'],
    'notifications': ['authentication'],

    // API features
    'api': ['database'],
    'api-auth': ['api', 'authentication'],
    'webhooks': ['api'],

    // Frontend features
    'dashboard': ['api', 'authentication'],
    'navigation': [],
    'theme': [],
    'forms': [],
  };

  async buildFromPRD(prd: PRD): Promise<DependencyGraph> {
    // Understand implicit dependencies
    for (const block of prd.blocks) {
      const deps = await this.inferDependencies(block);
      this.graph.set(block.id, new Set(deps));
    }

    return this.graph;
  }

  private async inferDependencies(block: PRDBlock): Promise<string[]> {
    const deps = this.DEPENDENCY_RULES[block.type] || [];

    // Also check for explicit relationships in PRD
    if (block.connections?.requires) {
      deps.push(...block.connections.requires);
    }

    // Infer from content
    if (block.description.includes('user profile')) {
      deps.push('user-profile');
    }
    if (block.description.includes('payment') || block.description.includes('subscription')) {
      deps.push('payments');
    }

    return deps;
  }

  getBuildOrder(blocks: PRDBlock[]): PRDBlock[][] {
    // Return waves of blocks that can be built in parallel
    const waves = [];
    const built = new Set();
    const remaining = new Set(blocks);

    while (remaining.size > 0) {
      const wave = [];

      for (const block of remaining) {
        const deps = this.graph.get(block.id) || new Set();
        const ready = Array.from(deps).every(d => built.has(d));

        if (ready) {
          wave.push(block);
        }
      }

      if (wave.length === 0 && remaining.size > 0) {
        throw new Error('Circular dependency detected');
      }

      wave.forEach(b => {
        remaining.delete(b);
        built.add(b.id);
      });

      waves.push(wave);
    }

    return waves;
  }

  getAffectedComponents(changedBlock: PRDBlock): Set<string> {
    // Find all components that depend on this block
    const affected = new Set<string>();

    for (const [blockId, deps] of this.graph.entries()) {
      if (deps.has(changedBlock.id)) {
        affected.add(blockId);
        // Recursively find dependents
        this.getAffectedComponents({ id: blockId } as PRDBlock)
          .forEach(id => affected.add(id));
      }
    }

    return affected;
  }
}
```

### 3. ProjectStateManager - The Memory

**File:** `apps/web/lib/project-state-manager.ts`

**What it does:**
- Maintains complete project memory across sessions
- Stores PRD history (all versions)
- Stores build history (what was built, when, why)
- Stores architectural decisions
- Tracks component states

**State Structure:**

```typescript
export class ProjectStateManager {
  private projectMemory: {
    prdHistory: PRDVersion[];
    buildHistory: BuildResult[];
    componentStates: Map<string, ComponentState>;
    dependencies: DependencyGraph;
    decisions: ArchitecturalDecision[];
  };

  async saveState(projectId: string): Promise<void> {
    await supabase
      .from('project_state')
      .upsert({
        project_id: projectId,
        prd_history: this.projectMemory.prdHistory,
        build_history: this.projectMemory.buildHistory,
        component_states: Array.from(this.projectMemory.componentStates.entries()),
        dependencies: this.serializeDependencyGraph(),
        decisions: this.projectMemory.decisions,
        updated_at: new Date()
      });
  }

  async loadState(projectId: string): Promise<void> {
    const { data } = await supabase
      .from('project_state')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (data) {
      this.projectMemory = {
        prdHistory: data.prd_history,
        buildHistory: data.build_history,
        componentStates: new Map(data.component_states),
        dependencies: this.deserializeDependencyGraph(data.dependencies),
        decisions: data.decisions
      };
    }
  }

  async understandProject(projectId: string): Promise<ProjectContext> {
    await this.loadState(projectId);

    return {
      currentState: await this.getCurrentState(),
      requirements: await this.extractAllRequirements(),
      gaps: await this.identifyGaps(),
      plan: await this.createCompletePlan()
    };
  }

  async detectPRDChange(newPRD: PRD): Promise<ChangeStrategy> {
    const current = this.projectMemory.prdHistory[this.projectMemory.prdHistory.length - 1];
    const diff = this.diffPRD(current.prd, newPRD);

    // Smart understanding of changes
    if (diff.addedAuthentication) {
      return {
        strategy: 'ADD_AUTH_LAYER',
        affects: ['all-routes', 'database', 'api'],
        prerequisites: ['user-table', 'session-management'],
        order: ['database-first', 'then-backend', 'then-frontend']
      };
    }

    if (diff.addedPayments) {
      return {
        strategy: 'ADD_PAYMENT_FLOW',
        affects: ['billing-pages', 'subscription-logic', 'webhooks'],
        prerequisites: ['stripe-setup', 'database-updates'],
        order: ['database-first', 'then-stripe', 'then-frontend']
      };
    }

    // Not just "rebuild everything"
    return this.createMinimalChangeStrategy(diff);
  }
}
```

### 4. ImpactAnalyzer - The Planner

**File:** `apps/web/lib/impact-analyzer.ts`

**What it does:**
- Analyzes what components are affected by PRD changes
- Determines new dependencies needed
- Identifies obsolete components to delete
- Creates minimal rebuild sequence

```typescript
export class ImpactAnalyzer {
  async analyzeImpact(changes: PRDChanges): Promise<ImpactAnalysis> {
    const dependencyGraph = new DependencyIntelligence();

    return {
      // What components are affected?
      affectedComponents: this.getAffectedComponents(changes, dependencyGraph),

      // What new dependencies are needed?
      newDependencies: this.detectNewDependencies(changes),

      // What can be deleted?
      obsoleteComponents: this.findObsolete(changes),

      // What order to rebuild?
      rebuildSequence: this.createRebuildSequence(changes, dependencyGraph)
    };
  }

  private getAffectedComponents(
    changes: PRDChanges,
    graph: DependencyIntelligence
  ): ComponentImpact[] {
    const affected = [];

    for (const addedBlock of changes.added) {
      // What existing components depend on this?
      const dependents = graph.getAffectedComponents(addedBlock);

      affected.push({
        block: addedBlock,
        reason: 'newly_added',
        mustRebuild: [],
        shouldUpdate: Array.from(dependents)
      });
    }

    for (const modifiedBlock of changes.modified) {
      // What components use this block?
      const dependents = graph.getAffectedComponents(modifiedBlock.new);

      affected.push({
        block: modifiedBlock.new,
        reason: 'modified',
        mustRebuild: Array.from(dependents),
        shouldUpdate: []
      });
    }

    return affected;
  }

  private createRebuildSequence(
    changes: PRDChanges,
    graph: DependencyIntelligence
  ): RebuildPhase[] {
    const phases = [];

    // Phase 1: Database changes (always first)
    const dbChanges = changes.added.filter(b =>
      b.type === 'database' || b.category === 'data'
    );
    if (dbChanges.length > 0) {
      phases.push({
        name: 'Database Updates',
        components: dbChanges,
        parallel: false,
        reason: 'Everything depends on data schema'
      });
    }

    // Phase 2: Backend/API changes
    const backendChanges = changes.added.filter(b =>
      b.type === 'api' || b.category === 'backend'
    );
    if (backendChanges.length > 0) {
      phases.push({
        name: 'Backend Updates',
        components: backendChanges,
        parallel: true,
        reason: 'Frontend depends on API'
      });
    }

    // Phase 3: Frontend changes
    const frontendChanges = changes.added.filter(b =>
      b.type === 'page' || b.type === 'component'
    );
    if (frontendChanges.length > 0) {
      phases.push({
        name: 'Frontend Updates',
        components: frontendChanges,
        parallel: true,
        reason: 'Can build UI components in parallel'
      });
    }

    return phases;
  }
}
```

---

## Integration with Current BuildRunner

### Hook into PRD Builder

**Modify:** `apps/web/app/(app)/create/page.tsx`

```typescript
export function PRDBuilder() {
  const [prd, setPRD] = useState<PRD>();
  const orchestrator = useRef(new PRDOrchestrator());

  // Auto-sync on PRD changes
  useEffect(() => {
    if (!prd) return;

    const syncDebounced = debounce(async () => {
      // This happens automatically when PRD changes
      await orchestrator.current.syncWithPRD(prd);
    }, 2000); // Wait 2 seconds after changes stop

    syncDebounced();
  }, [prd]);

  const handleBlockChange = (block: PRDBlock) => {
    // Update PRD
    setPRD(prev => ({
      ...prev,
      blocks: prev.blocks.map(b =>
        b.id === block.id ? block : b
      )
    }));

    // System automatically handles the rest
    // No need to manually trigger rebuilds
  };

  return (
    <div>
      {/* Your existing drag-drop interface */}

      {/* New: Real-time sync status */}
      <SyncStatus
        isProcessing={orchestrator.current.isProcessing}
        currentPhase={orchestrator.current.currentPhase}
        progress={orchestrator.current.progress}
      />
    </div>
  );
}
```

### UI Components

**File:** `apps/web/components/orchestration/SyncStatus.tsx`

```typescript
export function SyncStatus({ isProcessing, currentPhase, progress }) {
  if (!isProcessing) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg">
      <div className="flex items-center gap-3">
        <Loader2 className="animate-spin" />
        <div>
          <div className="font-semibold">PRD → Build Sync Active</div>
          <div className="text-sm opacity-90">{currentPhase}</div>
          <div className="mt-2 w-64 bg-blue-600 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

**File:** `apps/web/components/orchestration/DependencyVisualizer.tsx`

```typescript
export function DependencyVisualizer({ graph }) {
  return (
    <ReactFlow
      nodes={graph.blocks.map(b => ({
        id: b.id,
        data: { label: b.name },
        position: calculatePosition(b, graph)
      }))}
      edges={graph.edges.map(e => ({
        id: e.id,
        source: e.from,
        target: e.to,
        label: e.reason
      }))}
    />
  );
}
```

---

## API Endpoints

### POST /api/orchestration/sync
**Purpose:** Manually trigger PRD sync

**Request:**
```json
{
  "projectId": "proj_123",
  "prd": { /* full PRD object */ }
}
```

**Response:**
```json
{
  "success": true,
  "impactAnalysis": {
    "affectedComponents": 5,
    "newDependencies": ["authentication", "database"],
    "rebuildPhases": 3
  },
  "executionPlan": { /* ... */ }
}
```

### POST /api/orchestration/analyze-impact
**Purpose:** Preview what would change without executing

**Request:**
```json
{
  "projectId": "proj_123",
  "changes": {
    "added": [/* blocks */],
    "removed": [/* blocks */],
    "modified": [/* blocks */]
  }
}
```

**Response:**
```json
{
  "affectedComponents": [
    {
      "id": "dashboard",
      "reason": "needs_auth_check",
      "impact": "must_rebuild"
    }
  ],
  "estimatedTime": "45 seconds",
  "warnings": []
}
```

### GET /api/orchestration/dependencies
**Purpose:** Get current dependency graph

**Response:**
```json
{
  "graph": {
    "nodes": [/* blocks */],
    "edges": [/* dependencies */]
  },
  "buildOrder": [
    ["database"],
    ["authentication", "api"],
    ["dashboard", "profile"]
  ]
}
```

### GET /api/orchestration/state
**Purpose:** Get current project state

**Response:**
```json
{
  "prdVersion": 5,
  "lastBuild": "2025-11-04T19:30:00Z",
  "componentStates": {
    "dashboard": "built",
    "profile": "needs_rebuild",
    "auth": "building"
  },
  "decisions": [/* architectural decisions */]
}
```

---

## Implementation Timeline

### Week 1: PRD Change Detection & Reactivity
**Goal:** PRD changes are detected and categorized

**Tasks:**
- [x] Implement PRD change detection with smart diffing
- [x] Add debounced auto-sync (2s after changes stop)
- [x] Categorize changes (added/removed/modified/reordered)
- [x] Integrate with existing PRD builder drag-drop interface
- [x] Create SyncStatus UI component

**Deliverable:** PRD changes trigger auto-sync, user sees sync status

### Week 2: Dependency Intelligence & Impact Analysis
**Goal:** System understands what needs rebuilding and why

**Tasks:**
- [ ] Build DependencyIntelligence with comprehensive rules
- [ ] Implement topological sort for build order
- [ ] Create ImpactAnalyzer for change impact analysis
- [ ] Build smart execution planner (phases, validations)
- [ ] Create DependencyVisualizer UI component

**Deliverable:** System shows impact analysis before executing

### Week 3: Autonomous Execution & Self-Healing
**Goal:** Ship production-ready autonomous orchestrator

**Tasks:**
- [ ] Implement autonomous rebuild execution
- [ ] Add phase-by-phase validation with auto-rollback
- [ ] Build ProjectStateManager with persistence
- [ ] Create ImpactPanel UI component
- [ ] Add comprehensive error handling
- [ ] Test with complex PRD changes

**Deliverable:** Full autonomous orchestration in production

---

## Expected Impact

### Before (Current BuildRunner)
```
User changes PRD → Nothing happens
User clicks "Generate Plan" → Full rebuild
User clicks "Start Build" → Rebuilds everything (5-10 min)
User discovers existing components unchanged → Frustration
User manually requests specific updates → Another rebuild
```

**Total time:** 20-30 minutes of manual work

### After (PRD-Driven Orchestrator)
```
User changes PRD → Auto-detected (2s debounce)
System analyzes impact → Shows affected components
System executes minimal rebuild → Only changed components (30-60s)
User reviews result → Everything coherent
```

**Total time:** 30-60 seconds, fully autonomous

### Metrics

**Autonomy:**
- 100% autonomous rebuilds (no manual intervention)
- 0 human prompts needed for dependency changes

**Intelligence:**
- System knows why each component exists
- System understands how components relate
- System remembers architectural decisions

**Efficiency:**
- Minimal rebuilds (only affected components)
- Parallel build opportunities identified
- 90% time savings vs full rebuilds

**Stateful Memory:**
- PRD history tracked
- Build history persisted
- Decisions remembered across sessions

---

## Success Criteria

### Phase 1 (Week 1)
- [ ] PRD changes detected within 2 seconds
- [ ] Changes categorized correctly (add/remove/modify)
- [ ] Sync status visible to user
- [ ] No false positive detections

### Phase 2 (Week 2)
- [ ] Dependency graph built with 95%+ accuracy
- [ ] Build order correct (respects dependencies)
- [ ] Impact analysis shows all affected components
- [ ] Zero circular dependencies

### Phase 3 (Week 3)
- [ ] Autonomous rebuilds work 90%+ of time
- [ ] Phase validations catch errors before proceeding
- [ ] Rollback mechanism tested and working
- [ ] Project state persists across sessions

---

## Advanced Features (Future)

### Smart Conflict Resolution
When PRD changes conflict with existing code:
```
System detects: Authentication block removed
System checks: Dashboard still references auth
System decides: Keep auth, mark as orphaned, suggest removal
```

### Predictive Rebuilds
System predicts what you'll add next:
```
User adds: Payment block
System suggests: "Should I add subscription management too?"
```

### Cross-Project Learning
Learn patterns across all BuildRunner projects:
```
Pattern detected: 90% of projects with payments also add subscriptions
Suggestion: "Add subscription management?"
```

---

## Dependencies

**Required:**
- ✅ build-orchestrator (existing)
- ✅ prd-builder (existing)

**Optional Enhancements:**
- auto-healing-error-detection (fixes errors in rebuilt components)
- plan-validation-quality (validates execution plans)

---

## Technical Debt & Risks

### Potential Issues

1. **PRD Change Detection Too Sensitive**
   - Mitigated by 2s debounce
   - Mitigated by smart diffing (not text comparison)

2. **Incorrect Dependency Inference**
   - Mitigated by comprehensive rule set
   - Mitigated by user override capability

3. **Build Failures During Autonomous Execution**
   - Mitigated by phase-by-phase validation
   - Mitigated by automatic rollback

4. **State Management Complexity**
   - Mitigated by Supabase persistence
   - Mitigated by versioned state snapshots

### Rollback Strategy
Every autonomous build creates a snapshot:
```typescript
await this.createSnapshot(projectId); // Before execution
await this.executePhases(plan);       // Execute
await this.validateResult();          // Validate

if (failed) {
  await this.rollbackToSnapshot();    // Restore
}
```

---

## The Bottom Line

This PRD-Driven Orchestration Engine transforms BuildRunner from a **stateless instruction follower** into an **intelligent project manager** that:

✅ **Watches** for PRD changes automatically
✅ **Understands** what those changes mean
✅ **Plans** the minimal rebuild needed
✅ **Executes** without human intervention
✅ **Validates** everything still works coherently
✅ **Learns** from decisions and remembers context

**This is the missing piece that makes BuildRunner truly autonomous.**

---

**Documentation Version:** 1.0.0
**Last Updated:** 2025-11-04
**Author:** BuildRunner Team
