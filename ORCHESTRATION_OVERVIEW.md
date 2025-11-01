# 🎯 Multi-LLM Routing & Multi-Code Builder System Overview

## Table of Contents
- [Multi-LLM Routing System](#multi-llm-routing-system)
- [Multi-Code Builder Routing](#multi-code-builder-routing)
- [Task-Based Model Selection Matrix](#task-based-model-selection-matrix)
- [Cost Optimization Strategy](#cost-optimization-strategy)
- [Fallback Chain Architecture](#fallback-chain-architecture)
- [Real-World Examples](#real-world-examples)

---

## Multi-LLM Routing System

### Overview
The **LLM Gateway** (`lib/orchestration/llm-gateway.ts`) is an intelligent routing system that automatically selects the optimal LLM for each task type, with built-in fallback chains, caching, and cost tracking.

### Architecture Flow

```
User Request
    ↓
┌───────────────────────────────────────┐
│   LLMGateway.request(task_type)      │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  Task Type Detection                  │
│  - reasoning                          │
│  - code                               │
│  - synthesis                          │
│  - extraction                         │
│  - verification                       │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  Cache Check (if enabled)             │
│  - 5 minute TTL                       │
│  - 90% cost savings on cache hit      │
└───────────────────────────────────────┘
    ↓
    Cache Miss
    ↓
┌───────────────────────────────────────┐
│  Primary Model Selection              │
│  Based on task type                   │
└───────────────────────────────────────┘
    ↓
    ┌──────────── Success ────────────┐
    │                                  │
    ↓                                  ↓
Success Path                    Failure Path
    ↓                                  ↓
Cache Response              Try Fallback Models
    ↓                       (in order)
Return Result                   ↓
                        ┌────────────────┐
                        │ Fallback #1    │
                        │ Fallback #2    │
                        │ Fallback #3... │
                        └────────────────┘
                                ↓
                        Success or Final Error
```

---

## Task-Based Model Selection Matrix

### 1. **REASONING Tasks**
Used for: Strategic decisions, problem analysis, architecture planning

| Model | Role | Config |
|-------|------|--------|
| **Primary:** Claude Sonnet 3.5 | Best reasoning model | temp: 0.3, tokens: 4096, caching: ✅ |
| **Fallback 1:** GPT-4 | Different perspective | temp: 0.3, tokens: 4096 |
| **Fallback 2:** O1-Mini | Deep reasoning | temp: 0.3, tokens: 4096 |

**Cost per 1M tokens:**
- Claude Sonnet 3.5: $9/M avg (input: $3, output: $15)
- GPT-4: $45/M avg (input: $30, output: $60)
- O1-Mini: $7.5/M avg (input: $3, output: $12)

**Example Usage:**
```typescript
const response = await llmGateway.request({
  task_type: 'reasoning',
  prompt: 'How should we architect the authentication system?',
  system_prompt: 'You are a senior software architect.'
});
```

**When to use:**
- Strategic planning
- Architecture decisions
- Complex problem analysis
- Code review and recommendations
- System design

---

### 2. **CODE Tasks**
Used for: Writing code, refactoring, debugging

| Model | Role | Config |
|-------|------|--------|
| **Primary:** DeepSeek Chat | Code-specialized | temp: 0.2, tokens: 8192, caching: ✅ |
| **Fallback 1:** Claude Sonnet 3.5 | General excellence | temp: 0.2, tokens: 8192 |
| **Fallback 2:** GPT-4 | Proven code quality | temp: 0.2, tokens: 8192 |

**Cost per 1M tokens:**
- DeepSeek: $0.21/M avg (input: $0.14, output: $0.28) ⚡ **CHEAPEST**
- Claude Sonnet 3.5: $9/M avg
- GPT-4: $45/M avg

**Example Usage:**
```typescript
const response = await llmGateway.request({
  task_type: 'code',
  prompt: 'Write a React hook for real-time WebSocket connection',
  require_json: false
});
```

**When to use:**
- Writing new code
- Refactoring existing code
- Debugging code issues
- Code generation
- Implementation tasks

**Why DeepSeek Primary?**
- 43x cheaper than GPT-4
- Specialized for code generation
- Excellent performance on coding benchmarks
- Fast response times

---

### 3. **SYNTHESIS Tasks**
Used for: Combining multiple LLM responses into one best answer

| Model | Role | Config |
|-------|------|--------|
| **Primary:** Claude Opus 4 | Best at synthesis | temp: 0.4, tokens: 8192, caching: ❌ |
| **Fallback 1:** Claude Sonnet 3.5 | Quality alternative | temp: 0.4, tokens: 8192 |

**Cost per 1M tokens:**
- Claude Opus 4: $45/M avg (input: $15, output: $75) 💎 **PREMIUM**
- Claude Sonnet 3.5: $9/M avg

**Example Usage:**
```typescript
// First, consult multiple LLMs
const multiResponse = await llmGateway.consultMultiple(
  { task_type: 'reasoning', prompt: 'How to solve X?' },
  ['anthropic/claude-sonnet-3.5', 'openai/gpt-4', 'google/gemini-pro']
);

// Then synthesize into one best answer
const synthesis = await llmGateway.synthesize(multiResponse, originalPrompt);
```

**When to use:**
- Combining multiple LLM opinions
- Problem-solving consensus
- Decision-making with multiple perspectives
- Critical architectural decisions

**Why Opus for Synthesis?**
- Best at understanding nuance
- Excellent at combining ideas
- Superior reasoning about trade-offs
- Worth the premium cost for critical decisions

---

### 4. **EXTRACTION Tasks**
Used for: Parsing specs, extracting features, data extraction

| Model | Role | Config |
|-------|------|--------|
| **Primary:** Claude Haiku | Fast & accurate | temp: 0.2, tokens: 2048, caching: ✅ |
| **Fallback 1:** Gemini Flash 2.0 | Speed alternative | temp: 0.2, tokens: 2048 |

**Cost per 1M tokens:**
- Claude Haiku: $0.75/M avg (input: $0.25, output: $1.25) ⚡ **FAST & CHEAP**
- Gemini Flash 2.0: $0.19/M avg (input: $0.075, output: $0.3)

**Example Usage:**
```typescript
const response = await llmGateway.request({
  task_type: 'extraction',
  prompt: 'Extract all features from this spec document...',
  require_json: true
});

const features = JSON.parse(response.content);
```

**When to use:**
- Extracting features from specs
- Parsing PRD documents
- Data extraction from text
- Quick analysis tasks
- JSON generation

**Why Haiku Primary?**
- 4x faster than Sonnet
- 20x cheaper than Sonnet
- Excellent at structured extraction
- Perfect for quick tasks

---

### 5. **VERIFICATION Tasks**
Used for: Multi-LLM consensus verification (special case)

| Model | Role | Config |
|-------|------|--------|
| **Primary:** Multi-LLM Consensus | Parallel verification | temp: 0.1, tokens: 2048, caching: ❌ |

**Consults 3 models in parallel:**
1. Claude Sonnet 3.5
2. GPT-4
3. Gemini Pro

**Cost per verification:** ~$0.03 (3 models × ~1000 tokens × avg cost)

**Example Usage:**
```typescript
const result = await verificationEngine.verifyPhaseCompletion(phase);
// Automatically uses multi-LLM consensus

// Behind the scenes:
// ✅ Claude: "Feature complete"
// ✅ GPT-4: "Feature complete"
// ❌ Gemini: "Missing tests"
// → Result: Incomplete (only 2/3 agree)
```

**Consensus Rules:**
- Requires 67% agreement (2 out of 3)
- If ANY LLM says incomplete → mark incomplete
- Prevents missing features
- Prevents false positives

**When to use:**
- Verifying phase completion
- Checking feature implementation
- Quality assurance
- Before marking milestones complete

---

## Multi-Code Builder Routing

### Overview
The system supports **multiple code builder agents** that can work in parallel or be assigned different tasks based on their specializations.

### Configured Agents

```yaml
# From .runner/governance/orchestration.yaml

code_builders:
  - id: code-builder-1
    name: "Primary Code Builder"
    model: anthropic/claude-sonnet-3.5
    capabilities:
      - code
      - tests
      - refactoring
    max_loop_iterations: 3
    supervised_by: orchestrator

  - id: code-builder-2
    name: "Secondary Code Builder"
    model: openai/gpt-4
    capabilities:
      - code
      - documentation
      - debugging
    max_loop_iterations: 3
    supervised_by: orchestrator
```

### Agent Specialization Matrix

| Agent | Model | Specialization | Use Cases | Cost/Speed |
|-------|-------|----------------|-----------|------------|
| **code-builder-1** | Claude Sonnet 3.5 | Code + Tests + Refactoring | Primary development, test writing, refactoring | Medium cost, fast |
| **code-builder-2** | GPT-4 | Code + Docs + Debugging | Documentation, debugging, alternative perspectives | High cost, reliable |

### Routing Strategy

```typescript
// Orchestrator auto-assigns work based on:
// 1. Agent availability (idle vs working)
// 2. Agent capabilities (matches task type)
// 3. Agent performance (success rate tracking)

const feature = {
  type: 'code_with_tests',
  complexity: 'high'
};

// Orchestrator routes to:
// - code-builder-1 if available (has 'tests' capability)
// - code-builder-2 if code-builder-1 is stuck/busy
```

### Parallel Work Distribution

```
Feature Registry: 10 features pending
    ↓
Orchestrator assigns:
    ↓
┌──────────────────────┬──────────────────────┐
│  code-builder-1      │  code-builder-2      │
├──────────────────────┼──────────────────────┤
│  f001: Auth system   │  f006: User profile  │
│  f002: API endpoints │  f007: Settings page │
│  f003: Database      │  f008: Notifications │
│  f004: Tests         │  f009: Analytics     │
│  f005: Refactor auth │  f010: Export feature│
└──────────────────────┴──────────────────────┘
    ↓                        ↓
State Monitor watches both for loops
    ↓
If code-builder-1 stuck on f003:
    ↓
Intervention System halts it
    ↓
Problem Solver consults 5 LLMs
    ↓
Synthesizes solution
    ↓
code-builder-1 continues with fix
```

---

## Cost Optimization Strategy

### Automatic Cost Optimization

The system automatically optimizes costs through:

#### 1. **Prompt Caching (90% savings)**
```typescript
// First call: Full cost
const result1 = await llmGateway.request({
  task_type: 'reasoning',
  system_prompt: LONG_SYSTEM_PROMPT, // 2000 tokens
  prompt: 'Question 1'
});
// Cost: $0.018

// Second call within 5 minutes: Cached system prompt
const result2 = await llmGateway.request({
  task_type: 'reasoning',
  system_prompt: LONG_SYSTEM_PROMPT, // 2000 tokens (cached!)
  prompt: 'Question 2'
});
// Cost: $0.002 (90% savings!)
```

#### 2. **Task-Based Model Selection**
```typescript
// BAD: Using GPT-4 for everything
const extraction = await gpt4('Extract features...'); // $0.045
const reasoning = await gpt4('Analyze architecture...'); // $0.045
// Total: $0.090

// GOOD: Using optimal model per task
const extraction = await llmGateway.request({
  task_type: 'extraction' // Uses Haiku
}); // $0.00075

const reasoning = await llmGateway.request({
  task_type: 'reasoning' // Uses Sonnet 3.5
}); // $0.009

// Total: $0.01 (89% savings!)
```

#### 3. **Response Caching (5-minute TTL)**
```typescript
// Same request within 5 minutes = instant, free response
const result = await llmGateway.request({
  task_type: 'code',
  prompt: 'Write auth function'
});
// First call: $0.009, 3000ms

const result2 = await llmGateway.request({
  task_type: 'code',
  prompt: 'Write auth function'
});
// Cache hit: $0.000, 1ms
```

### Cost Comparison: Before vs After

| Task | Before (GPT-4 for all) | After (Smart routing) | Savings |
|------|------------------------|----------------------|---------|
| Feature extraction | $0.045 | $0.00075 | 98% |
| Code generation | $0.045 | $0.00021 | 99% |
| Reasoning | $0.045 | $0.009 | 80% |
| Verification (3 LLMs) | $0.135 | $0.027 | 80% |
| Synthesis | $0.045 | $0.045 | 0% (worth it) |
| **Overall Average** | **$0.045/task** | **$0.007/task** | **84%** |

### Monthly Cost Projection

For a project with **1000 AI requests/day**:

```
Before (GPT-4 for all):
1000 requests × $0.045 × 30 days = $1,350/month

After (Smart routing):
1000 requests × $0.007 × 30 days = $210/month

Savings: $1,140/month (84%)
```

---

## Fallback Chain Architecture

### How Fallbacks Work

```typescript
// Request comes in
llmGateway.request({ task_type: 'code', prompt: '...' })
    ↓
Try Primary: DeepSeek Chat
    ↓
    ├─ Success ✅ → Return result
    │
    └─ Failure ❌ → Try Fallback 1: Claude Sonnet 3.5
          ↓
          ├─ Success ✅ → Return result
          │
          └─ Failure ❌ → Try Fallback 2: GPT-4
                ↓
                ├─ Success ✅ → Return result
                │
                └─ Failure ❌ → Throw error (all models failed)
```

### Fallback Chain Summary

| Task Type | Primary → Fallback 1 → Fallback 2 |
|-----------|-------------------------------------|
| **Reasoning** | Claude Sonnet 3.5 → GPT-4 → O1-Mini |
| **Code** | DeepSeek → Claude Sonnet 3.5 → GPT-4 |
| **Synthesis** | Claude Opus 4 → Claude Sonnet 3.5 |
| **Extraction** | Claude Haiku → Gemini Flash 2.0 |
| **Verification** | Multi-LLM (no fallback, uses 3 in parallel) |

### Error Recovery Example

```typescript
// Real scenario: DeepSeek API down
const result = await llmGateway.request({
  task_type: 'code',
  prompt: 'Write authentication middleware'
});

// Console logs:
// ❌ Primary model deepseek/deepseek-chat failed: API timeout
// 🔄 Trying fallback model: anthropic/claude-sonnet-3.5
// ✅ anthropic/claude-sonnet-3.5 responded in 2500ms

// User never sees the failure - seamless fallback!
```

---

## Real-World Examples

### Example 1: Building a Feature End-to-End

```typescript
// 1. EXTRACTION: Parse feature from spec (Claude Haiku - Fast & Cheap)
const features = await featureRegistry.extractFeaturesFromSpec(specContent);
// Cost: $0.00075, Time: 500ms

// 2. CODE: Implement the feature (DeepSeek - Cheapest code model)
const implementation = await llmGateway.request({
  task_type: 'code',
  prompt: `Implement ${features[0].name}...`
});
// Cost: $0.00021, Time: 3000ms

// 3. CODE: Write tests (DeepSeek - Same model, cached context)
const tests = await llmGateway.request({
  task_type: 'code',
  prompt: `Write tests for ${features[0].name}...`,
  system_prompt: CACHED_SYSTEM_PROMPT // 90% savings!
});
// Cost: $0.00003 (cached!), Time: 2000ms

// 4. VERIFICATION: Check implementation (3 LLMs in parallel)
const verified = await verificationEngine.verifyFeatures([features[0].id]);
// Cost: $0.027 (3 models), Time: 4000ms (parallel)

// Total: $0.028, Time: 9.5s
// vs GPT-4 for all: $0.180, Time: 15s
// Savings: 84% cost, 37% faster
```

### Example 2: Problem Solving with Multi-LLM

```typescript
// Agent stuck in loop
const problem = {
  id: 'p001',
  type: 'loop',
  description: 'TypeScript errors keep recurring',
  errors: ['Type X is not assignable to Y'],
  severity: 'high'
};

// MULTI-LLM CONSULTATION: 5 models in parallel
const solutions = await problemSolver.solveProblem(problem);

// Behind the scenes:
// 🧠 Claude Sonnet 3.5: "Update type definitions..." ($0.009)
// 🧠 GPT-4: "Use type guards..." ($0.045)
// 🧠 Gemini Pro: "Refactor interface..." ($0.002)
// 🧠 O1-Mini: "Add strict type checks..." ($0.008)
// 🧠 DeepSeek: "Fix import statements..." ($0.0002)

// SYNTHESIS: Combine all ideas (Claude Opus 4)
// Creates micro-plan with best elements from all 5
// Cost: $0.045

// Total: $0.109 for 6 LLM calls
// Worth it for: Critical problems, stuck agents, complex issues
```

### Example 3: Verification with Consensus

```typescript
// Verify Phase 1 complete
const result = await verificationEngine.verifyPhaseCompletion(1);

// Behind the scenes:
// ✅ Claude Sonnet 3.5: "Complete" (confidence: 0.95)
// ✅ GPT-4: "Complete" (confidence: 0.90)
// ❌ Gemini Pro: "Incomplete - missing tests" (confidence: 0.85)

// Consensus: 2/3 agree (67%) → INCOMPLETE
// Result: Cannot proceed, missing features identified

// Why this matters:
// - Prevents false positives
// - Catches missed features
// - Ensures quality
// - Worth $0.027 to avoid shipping incomplete features
```

---

## Performance Metrics

### Speed Comparison

| Task Type | Model | Avg Response Time |
|-----------|-------|-------------------|
| Extraction | Claude Haiku | 500ms ⚡ |
| Extraction | Claude Sonnet | 2000ms |
| Code | DeepSeek | 3000ms |
| Code | GPT-4 | 4000ms |
| Reasoning | Claude Sonnet 3.5 | 2500ms |
| Reasoning | O1-Mini | 8000ms |
| Synthesis | Claude Opus 4 | 5000ms |
| Verification (3 parallel) | Multi-LLM | 4000ms |

### Cache Performance

| Metric | Value |
|--------|-------|
| Cache Hit Rate | ~40% (typical) |
| Cache Duration | 5 minutes |
| Cost Savings on Hit | 90% |
| Response Time on Hit | <10ms |

---

## Summary: When to Use What

### Quick Reference

```
Need to extract data fast?
  → extraction task → Claude Haiku ($0.0007/call)

Need to write code?
  → code task → DeepSeek ($0.0002/call)

Need strategic advice?
  → reasoning task → Claude Sonnet 3.5 ($0.009/call)

Need to verify something is complete?
  → verification task → Multi-LLM ($0.027/call)

Agent stuck on hard problem?
  → Problem solver → 5 LLMs + synthesis ($0.109/call)

Need to combine multiple opinions?
  → synthesis task → Claude Opus 4 ($0.045/call)
```

### Cost-Benefit Matrix

| Scenario | Use | Why | Cost |
|----------|-----|-----|------|
| Parse spec document | Haiku | 20x cheaper, 4x faster | $0.0007 |
| Write boilerplate code | DeepSeek | 200x cheaper than GPT-4 | $0.0002 |
| Complex architectural decision | Sonnet 3.5 | Best reasoning, reasonable cost | $0.009 |
| Critical multi-perspective problem | 5 LLMs + Opus synthesis | Worth it for complex issues | $0.109 |
| Verify phase completion | 3 LLMs parallel | Prevents missing features | $0.027 |
| Combine expert opinions | Opus | Best at nuance and synthesis | $0.045 |

---

## Configuration

All routing is configured in:
- **LLM Routes:** `lib/orchestration/llm-gateway.ts` (lines 25-66)
- **Agent Config:** `.runner/governance/orchestration.yaml` (lines 91-112)
- **Cost Tracking:** Automatic via `llmGateway.getCostStats()`

To modify routing, edit the `LLM_ROUTES` array in `llm-gateway.ts`.

---

## Monitoring & Observability

```typescript
// Get cost statistics
const costs = llmGateway.getCostStats();
console.log(costs);
// {
//   'anthropic/claude-haiku': 0.0023,
//   'deepseek/deepseek-chat': 0.0018,
//   'anthropic/claude-sonnet-3.5': 0.0456,
//   ...
// }

// Get agent statistics
const agentStats = stateMonitor.getAgentStats('code-builder-1');
console.log(agentStats);
// {
//   total_actions: 145,
//   successful_actions: 132,
//   failed_actions: 13,
//   success_rate: 0.91,
//   recent_loop_detected: false
// }

// Get dashboard
const dashboard = getOrchestrationDashboard();
// Complete system overview
```

---

This system intelligently routes requests to optimize for **cost, speed, and quality** while providing **automatic fallbacks** and **multi-LLM consensus** when needed. The multi-code builder system enables **parallel work** with automatic **loop detection and intervention**.
