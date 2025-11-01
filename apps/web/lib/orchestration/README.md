# Autonomous Development Orchestration System

A revolutionary **self-healing, self-verifying AI development orchestration system** that keeps complex projects on track with minimal human intervention.

## 🎯 Core Features

### 1. **Triple-Verification**
Every feature is verified by 3 different LLMs before marking complete:
- Claude Sonnet 3.5 (best reasoning)
- GPT-4 (different perspective)
- Gemini Pro (alternative approach)
- Requires 67% consensus (2 out of 3 must agree)

### 2. **Automatic Loop Detection**
Detects and intervenes when AI agents get stuck:
- Same error repeated (threshold: 2)
- Same file edited with no progress (threshold: 3)
- No progress timeout (300 seconds)
- Circular dependencies

### 3. **Multi-LLM Problem Solving**
Consults 5 LLMs in parallel for complex problems:
- Claude Sonnet 3.5, GPT-4, Gemini Pro, O1-Mini, DeepSeek
- Synthesizes solutions using Claude Opus 4
- Creates micro-step execution plans
- Auto-executes fallbacks on failure

### 4. **Dynamic PRD Syncing**
Bi-directional sync between PRD and Feature Registry:
- PRD changes → Registry updates
- Registry completion → PRD updates
- Real-time conflict detection
- Auto-verification on changes

### 5. **Meta-Level Orchestration**
Continuous supervision of all agents:
- Monitors every 30 seconds
- Auto-assigns missing work
- Escalates critical problems
- Prevents phase progression until verified

## 📁 Architecture

```
lib/orchestration/
├── types.ts              # TypeScript type definitions
├── llm-gateway.ts        # Multi-LLM routing & caching
├── feature-registry.ts   # Central source of truth for features
├── verification-engine.ts # Multi-LLM verification system
├── state-monitor.ts      # Loop detection & action tracking
├── problem-solver.ts     # Multi-LLM problem resolution
├── orchestrator.ts       # Meta-level coordinator
├── prd-sync.ts          # Dynamic PRD-Registry syncing
├── index.ts             # Main exports
└── README.md            # This file

.runner/governance/
├── orchestration.yaml    # Orchestration configuration
└── feature-schema.yaml  # Feature validation rules

app/api/orchestration/
└── route.ts             # REST API endpoints
```

## 🚀 Quick Start

### Installation

The system is automatically available in your Next.js app.

### Initialization

```typescript
import { initializeOrchestration } from '@/lib/orchestration';

// Initialize the entire system
const system = await initializeOrchestration({
  autoExtractFeatures: false,
  startSupervision: true,
  supervisionIntervalMs: 30000,
  enablePRDSync: true,
});
```

### Quick Development Start

```typescript
import { quickStart } from '@/lib/orchestration';

// Quick start for development (no auto-supervision)
const system = await quickStart();
```

## 📚 Core Components

### 1. LLM Gateway

Intelligent routing system for multi-LLM requests.

```typescript
import { llmGateway } from '@/lib/orchestration';

// Single LLM request
const response = await llmGateway.request({
  task_type: 'code',
  prompt: 'Write a function that...',
  require_json: true,
});

// Multi-LLM consultation
const multiResponse = await llmGateway.consultMultiple(
  { task_type: 'reasoning', prompt: 'How should I...' },
  ['anthropic/claude-sonnet-3.5', 'openai/gpt-4', 'google/gemini-pro']
);

// Synthesize multiple responses
const synthesis = await llmGateway.synthesize(multiResponse, originalPrompt);
```

### 2. Feature Registry

Central source of truth for all features.

```typescript
import { featureRegistry } from '@/lib/orchestration';

// Add a feature
const feature = featureRegistry.addFeature({
  name: 'AI-Powered Chat',
  description: 'Real-time AI chat with streaming responses',
  status: 'planned',
  phase: 1,
  step: 1,
  priority: 'critical',
  sub_features: [],
  acceptance_criteria: [
    {
      description: 'Chat responds in <200ms',
      verified: false,
      verification_method: 'Performance testing',
    },
  ],
  dependencies: {
    required_features: [],
    required_packages: ['openai', '@anthropic-ai/sdk'],
  },
  blockers: [],
});

// Update feature
featureRegistry.updateFeature(feature.id, {
  status: 'in_progress',
});

// Complete feature with evidence
featureRegistry.completeFeature(feature.id, {
  files_modified: ['app/api/chat/route.ts'],
  tests_added: ['__tests__/chat.test.ts'],
  verified_by: 'anthropic/claude-sonnet-3.5',
});

// Get features by phase
const phase1Features = featureRegistry.getFeaturesByPhase(1);

// Get incomplete features
const incomplete = featureRegistry.getIncompleteFeatures(1);
```

### 3. Verification Engine

Multi-LLM consensus verification.

```typescript
import { verificationEngine } from '@/lib/orchestration';

// Verify a phase is complete
const result = await verificationEngine.verifyPhaseCompletion(1);

if (result.canProceed) {
  console.log('✅ Phase 1 complete!');
} else {
  console.log(`❌ Missing ${result.missing.length} features`);
  result.missing.forEach((f) => {
    console.log(`  - ${f.name}`);
  });
}

// Verify specific features
const featuresResult = await verificationEngine.verifyFeatures([
  'f001',
  'f002',
  'f003',
]);

// Enforce completion (keep trying until complete)
const success = await verificationEngine.enforceCompletion(1, 5); // max 5 attempts
```

### 4. State Monitor

Real-time loop detection.

```typescript
import { stateMonitor } from '@/lib/orchestration';

// Track an action
const loop = await stateMonitor.trackAction('code-builder-1', {
  agent: 'code-builder-1',
  type: 'code',
  description: 'Modified auth.ts',
  filesModified: ['lib/auth.ts'],
  outcome: 'success',
});

if (loop) {
  console.log(`🚨 Loop detected: ${loop.type}`);
}

// Get agent stats
const stats = stateMonitor.getAgentStats('code-builder-1');
console.log(`Success rate: ${(stats.success_rate * 100).toFixed(1)}%`);

// Check if stuck
const stuck = await stateMonitor.checkIfStuck('code-builder-1');
```

### 5. Problem Solver

Multi-LLM problem resolution.

```typescript
import { problemSolver } from '@/lib/orchestration';

// Solve a problem
const problem = {
  id: 'problem_001',
  agent: 'code-builder-1',
  type: 'error',
  description: 'TypeScript compilation failing',
  errors: ['Type string is not assignable to type number'],
  actionHistory: [],
  severity: 'high',
  created_at: new Date(),
};

const result = await problemSolver.solveProblem(problem);

if (result.success) {
  console.log('✅ Problem solved!');
  result.results.forEach((r) => {
    console.log(`  Step ${r.step}: ${r.success ? '✅' : '❌'}`);
  });
}
```

### 6. Orchestrator

Meta-level coordinator.

```typescript
import { orchestrator } from '@/lib/orchestration';

// Start supervision
await orchestrator.startSupervision(30000); // Every 30 seconds

// Register an agent
const agent = orchestrator.registerAgent({
  id: 'code-builder-1',
  name: 'Primary Code Builder',
  type: 'code-builder',
  model: 'anthropic/claude-sonnet-3.5',
  status: 'idle',
});

// Get dashboard summary
const dashboard = orchestrator.getDashboardSummary();
console.log(`Active agents: ${dashboard.active_agents}`);
console.log(`Completed features: ${dashboard.completed_features}`);

// Get stuck agents
const stuckAgents = orchestrator.getStuckAgents();

// Stop supervision
orchestrator.stopSupervision();
```

### 7. PRD Sync

Dynamic syncing between PRD and Registry.

```typescript
import { prdSync } from '@/lib/orchestration';

// Setup PRD watcher (integrate with Zustand store)
prdSync.setupPRDWatcher((features) => {
  // Called when PRD changes
  console.log(`PRD changed: ${features.length} features`);
});

// Check sync status
const syncStatus = await prdSync.checkSyncStatus(prdFeatures);

if (!syncStatus.in_sync) {
  console.log(`Missing in registry: ${syncStatus.missing_in_registry.length}`);
  console.log(`Conflicts: ${syncStatus.conflicts.length}`);
}

// Manual sync
await prdSync.manualSync(prdFeatures);

// Get registry features for PRD
const registryFeatures = prdSync.getRegistryFeaturesForPRD();
```

## 🌐 API Routes

### GET Endpoints

```bash
# Get dashboard
GET /api/orchestration?action=dashboard

# Get all features
GET /api/orchestration?action=features

# Get agents status
GET /api/orchestration?action=agents

# Get recent interventions
GET /api/orchestration?action=interventions&limit=10

# Get LLM costs
GET /api/orchestration?action=costs

# Check sync status
GET /api/orchestration?action=sync-status&features=[...]
```

### POST Endpoints

```bash
# Add feature
POST /api/orchestration
{
  "action": "add-feature",
  "feature": { ... }
}

# Verify phase
POST /api/orchestration
{
  "action": "verify-phase",
  "phase": 1
}

# Solve problem
POST /api/orchestration
{
  "action": "solve-problem",
  "problem": { ... }
}

# Start supervision
POST /api/orchestration
{
  "action": "start-supervision",
  "intervalMs": 30000
}

# Sync PRD
POST /api/orchestration
{
  "action": "sync-prd",
  "prdFeatures": [...],
  "direction": "to-registry" | "to-prd"
}
```

## ⚙️ Configuration

Edit `.runner/governance/orchestration.yaml` to configure:

```yaml
verification:
  require_multi_llm_consensus: true
  consensus_threshold: 0.67
  max_attempts_before_escalation: 5

loop_detection:
  same_action_threshold: 3
  same_error_threshold: 2
  no_progress_timeout_seconds: 300

intervention:
  auto_halt_on_loop: true
  multi_llm_brainstorm: true

problem_solving:
  consult_models:
    - anthropic/claude-sonnet-3.5
    - openai/gpt-4
    - google/gemini-pro
  synthesis_model: anthropic/claude-opus-4
```

## 📊 Dashboard Example

```typescript
import { getOrchestrationDashboard } from '@/lib/orchestration';

const dashboard = getOrchestrationDashboard();

console.log('🎯 ORCHESTRATION DASHBOARD');
console.log(`Active Agents: ${dashboard.summary.active_agents}`);
console.log(`Stuck Agents: ${dashboard.summary.stuck_agents}`);
console.log(`Total Features: ${dashboard.summary.total_features}`);
console.log(`Completed: ${dashboard.summary.completed_features}`);
console.log(`Blocked: ${dashboard.summary.blocked_features}`);
console.log(`Recent Interventions: ${dashboard.summary.recent_interventions}`);

console.log('\n💰 LLM COSTS:');
Object.entries(dashboard.llmCosts).forEach(([model, cost]) => {
  console.log(`  ${model}: $${cost.toFixed(4)}`);
});
```

## 🧪 Testing

```typescript
// Verify entire project
import { verifyProject } from '@/lib/orchestration';

const results = await verifyProject();
results.forEach(({ phase, result }) => {
  console.log(`Phase ${phase}: ${result.status}`);
});

// Test problem solver
import { solveProblem } from '@/lib/orchestration';

const result = await solveProblem(
  'TypeScript errors in auth module',
  ['Type string is not assignable to type number']
);
```

## 📈 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Feature Completion Accuracy | >95% | Features verified vs. spec |
| Loop Detection Rate | >90% | Loops caught automatically |
| Problem Resolution Success | >80% | Problems solved without human |
| Multi-LLM Consensus Agreement | >67% | LLMs agree on verification |
| Time to Detect Loop | <60s | From loop start to intervention |
| Interventions Per Phase | <3 | Fewer = better |

## 🔧 Troubleshooting

### Loop Detection Not Working

Check `.runner/governance/orchestration.yaml`:
```yaml
loop_detection:
  enabled: true
```

### Verification Failing

Lower consensus threshold:
```yaml
verification:
  consensus_threshold: 0.5  # 1 out of 2
```

### API Errors

Ensure OpenRouter API key is set:
```bash
OPENROUTER_API_KEY=your_key_here
```

## 📝 Best Practices

1. **Always verify before marking complete**
   ```typescript
   const result = await verificationEngine.verifyPhaseCompletion(phase);
   if (!result.canProceed) {
     console.log('Phase incomplete!');
   }
   ```

2. **Track all agent actions**
   ```typescript
   await stateMonitor.trackAction(agent, action);
   ```

3. **Use multi-LLM for critical decisions**
   ```typescript
   const multiResponse = await llmGateway.consultMultiple(request, models);
   const synthesis = await llmGateway.synthesize(multiResponse, prompt);
   ```

4. **Keep PRD and Registry in sync**
   ```typescript
   prdSync.setAutoSync(true);
   ```

5. **Monitor orchestration dashboard regularly**
   ```typescript
   const dashboard = getOrchestrationDashboard();
   ```

## 🎓 Advanced Usage

### Custom Verification Logic

```typescript
import { verificationEngine } from '@/lib/orchestration';

class CustomVerifier extends VerificationEngine {
  async customVerify(features: Feature[]) {
    // Your custom logic
  }
}
```

### Custom Problem Solver

```typescript
import { MultiLLMProblemSolver } from '@/lib/orchestration';

class CustomSolver extends MultiLLMProblemSolver {
  async customSolve(problem: Problem) {
    // Your custom logic
  }
}
```

## 📚 Additional Resources

- [Full Specification](../../docs/BuildRunnerSaaS-spec.md)
- [Governance Rules](.runner/governance/orchestration.yaml)
- [Feature Schema](.runner/governance/feature-schema.yaml)
- [API Documentation](../../app/api/orchestration/route.ts)

## 🤝 Contributing

This system is designed to be extensible. To add new features:

1. Update types in `types.ts`
2. Implement in appropriate module
3. Add API endpoint if needed
4. Update documentation
5. Add tests

## 📄 License

Part of BuildRunner SaaS - AI-Powered Product Development Platform
