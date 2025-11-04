# Consensus Learning System

## Overview

The learning system extracts patterns from **every consensus discussion** and automatically improves prompts over time. This creates a continuous feedback loop that reduces consensus failures and improves code quality.

## How It Works

### 1. Pattern Extraction (After Each Consensus)

When consensus completes (pass or fail), the system extracts patterns from AI model discussions:

**From FAIL votes:**
- File path issues (e.g., "middleware.ts should be at root")
- Dependency problems (e.g., "circular dependency detected")
- Architecture violations (e.g., "design system should be first")
- Direct quotes about what's wrong

**From PASS votes:**
- Successful patterns (e.g., "design-first architecture correct")
- Positive examples (e.g., "all paths follow Next.js 14 conventions")

### 2. Pattern Weighting

Each pattern is scored by:
- **Confidence** (0-100): AI model confidence level
- **Occurrences**: How many times mentioned
- **Success Rate** (0-100): Correlation with consensus success
- **Impact Score**: `(confidence/100) * occurrences * (successRate/100)`

Top patterns are automatically selected for injection.

### 3. Automatic Prompt Enhancement

Before generating plans or code, learned rules are **automatically injected** into system prompts:

```
=== LEARNED RULES (from consensus history) ===

These patterns have been learned from past consensus discussions:

**File Paths**:
❌ middleware.ts MUST be at project root (not in app/ or lib/) [5x, 85% conf]
✅ All file paths follow Next.js 14 App Router conventions [3x, 92% conf]

**Dependencies**:
❌ ZERO circular dependencies allowed (must form DAG) [4x, 90% conf]
✅ Clean dependency graph with no circular references [2x, 88% conf]
```

### 4. Continuous Improvement

The system tracks metrics over time:
- Success rate (% of consensus achieved)
- Average iterations to consensus
- Patterns learned
- Recent trend (improving/stable/declining)

## Storage Structure

```
lib/learned-patterns/
├── patterns.json       # All learned patterns with scores
├── sessions.json       # Last 100 learning sessions
└── metrics.json        # Performance metrics over time
```

## Integration Points

### Plan Generation (`app/api/prd/generate-plan/route.ts`)
```typescript
const { enhancedPrompt, appliedPatternIds } = injectLearnedRules(baseSystemPrompt, 'plan_verification');
// Enhanced prompt used for OpenRouter API call
```

### Plan Verification (`app/api/plan/verify/route.ts`)
```typescript
recordLearningSession(
  verificationResult.consensusLog,
  'plan_verification',
  appliedPatternIds,
  plan
);
```

### Build Orchestrator (TODO)
Same pattern will be applied to:
- Component building consensus
- Code review consensus
- Quality analysis feedback

## Pattern Types

### 1. **Rules** (📋)
General patterns extracted from discussions

### 2. **Examples** (✅)
Positive patterns from successful consensus

### 3. **Anti-Patterns** (❌)
Patterns from failures (what NOT to do)

## Pattern Categories

- `file-paths`: File naming and location conventions
- `dependencies`: Dependency management and ordering
- `criticality`: Component criticality classification
- `architecture`: High-level structure decisions
- `naming`: Component and variable naming
- `general`: Other patterns

## Example Learning Flow

1. **First Plan Generation:**
   - No learned patterns yet
   - AI generates plan with `lib/design-system.ts`
   - Consensus FAILS (5 models reject)
   - Pattern extracted: "Modular libs should use lib/[module]/index.ts"

2. **Second Plan Generation:**
   - Learned rule injected into prompt
   - AI generates plan with `lib/design-system/index.ts`
   - Consensus PASSES (5 models approve)
   - Pattern reinforced, confidence increased

3. **After 10 Plans:**
   - System has learned top 10 most common issues
   - Success rate improves from 30% → 80%
   - Average iterations drop from 2.5 → 1.2

## Expected Improvements

### Short Term (First 20 Plans)
- Learn common file path issues
- Learn dependency ordering requirements
- Learn criticality classification patterns
- **Target:** 60-70% first-iteration success rate

### Medium Term (50-100 Plans)
- Refine architecture patterns
- Learn framework-specific conventions
- Learn successful tech stack combinations
- **Target:** 80-90% first-iteration success rate

### Long Term (200+ Plans)
- Highly optimized prompts
- Rare consensus failures
- Automatic adaptation to new standards
- **Target:** 95%+ first-iteration success rate

## Monitoring

Check learning progress:

```bash
cat lib/learned-patterns/metrics.json
```

View learned patterns:

```bash
cat lib/learned-patterns/patterns.json
```

View recent sessions:

```bash
cat lib/learned-patterns/sessions.json
```

## Future Enhancements

1. **RAG Integration:**
   - Store successful plans as examples
   - Retrieve similar plans for context

2. **Pattern Decay:**
   - Reduce confidence of old patterns over time
   - Adapt to changing standards

3. **Cross-Type Learning:**
   - Learn from component building to improve plan generation
   - Share patterns across consensus types

4. **User Feedback:**
   - Allow manual pattern injection
   - Vote on pattern importance

5. **A/B Testing:**
   - Test different prompt strategies
   - Measure impact of specific patterns

## Benefits

- ✅ **Automatic Improvement**: No manual prompt engineering needed
- ✅ **Continuous Learning**: Gets better with every consensus
- ✅ **Cost Reduction**: Fewer iterations = fewer API calls
- ✅ **Time Savings**: Faster consensus = faster builds
- ✅ **Quality Increase**: Better prompts = better code
- ✅ **Adaptable**: Learns new standards automatically
