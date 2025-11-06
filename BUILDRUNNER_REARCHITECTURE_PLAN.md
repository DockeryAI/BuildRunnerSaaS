# BuildRunner Re-Architecture: From Consensus to Speed

## Executive Summary

BuildRunner is transitioning from a slow, consensus-based architecture to a fast, intelligent multi-agent system that delivers professional-quality apps in under 60 seconds.

**Current State:**
- ✅ Visual PRD builder (working great)
- ✅ Design profile detection (working but disconnected)
- ✅ Pattern library (10MB, 100+ patterns)
- ❌ 5-10 minute builds (too slow)
- ❌ Generic-looking apps (design tokens not applied)
- ❌ Sequential generation (inefficient)
- ❌ 7-LLM consensus (expensive, slow)

**Target State:**
- ⚡ <60 second builds
- 🎨 Professional designs matching detected profile
- 🤖 Multi-agent parallel generation
- 🔍 Contextual debugging (no context switching)
- 💰 <$0.30 per build (from ~$2)

---

## Phase 1: Critical Bug Fixes (IMMEDIATE)

### 1.1 Fix Model IDs ✅ COMPLETED
**Status:** Done
**Files Fixed:**
- build-orchestrator.ts
- ai-component-generator.ts
- design-intelligence.ts
- design-polisher.ts
- design-system-generator.ts
- hero-generator.ts
- component-designer.ts
- post-build-review.ts
- smart-consensus.ts
- consensus-learning-enhanced.ts
- profile-detector.ts
- learning-engine.ts
- continuous-learning.ts

**Changes:**
- `'anthropic/claude-sonnet-4-20250514'` → `'claude-3-5-sonnet-20240620'`
- `'anthropic/claude-sonnet-4'` → `'anthropic/claude-3.5-sonnet'`
- `'anthropic/claude-sonnet-4.5'` → `'anthropic/claude-3.5-sonnet'`

### 1.2 Fix Design Token Injection ✅ COMPLETED
**Status:** Done
**File:** `lib/design-token-injector.ts`

**Changes:**
- Ensure build directory exists before writing
- Fix spacing structure compatibility (base/unit)
- Add detailed logging
- Better error handling

**Result:** `tailwind.config.ts` and `globals.css` now successfully created

### 1.3 Connect Design Profile to Generation ✅ COMPLETED
**Status:** Done
**Files Modified:**
- `lib/build-orchestrator.ts` - Store design profile
- `lib/context-builder.ts` - Add profile section to prompts
- `lib/ai-component-generator.ts` - Pass profile to generation

**Result:** Components now receive detailed design guidance including:
- Target audience and emotional tone
- Visual style requirements
- Reference app quality standards
- Color psychology and reasoning
- Component pattern specifications

### 1.4 Add Framer Motion Requirements ✅ COMPLETED
**Status:** Done
**File:** `lib/context-builder.ts`

**Added to all prompts:**
- Entry animations with motion.div
- Hover effects on interactive elements
- AnimatePresence for conditional rendering
- Stagger animations for lists
- Smooth transitions with custom easing

### 1.5 Intelligent Model Routing ✅ COMPLETED
**Status:** Done
**File:** `lib/ai-component-generator.ts`

**Routing Logic:**
- Simple UI (buttons, inputs) → Haiku (fast & cheap)
- Critical (auth, payments) → Sonnet (best quality)
- Design-critical (hero, landing) → Sonnet (balanced)
- Default → Sonnet (balanced quality/cost)

**Expected Savings:** 40-60% cost reduction

---

## Phase 2: Speed Optimization (KEEP EXISTING CODE)

### 2.1 Pattern Library ✅ EXISTS
**Status:** Already implemented
**Location:** `lib/learned-patterns/patterns-library.json`
**Size:** 10MB, 33,994 lines, 100+ patterns

**Includes:**
- Email Authentication
- User Profile Management
- CRUD Table with Pagination
- And many more...

**How it works:**
- 70% confidence threshold for matches
- Instant generation for matched patterns
- Learning from successful builds

### 2.2 Parallel Building ✅ EXISTS
**Status:** Already implemented
**Files:**
- `lib/parallel-builder.ts`
- `lib/dependency-analyzer.ts`
- `lib/build-orchestrator.ts`

**How it works:**
- Analyzes component dependencies
- Creates execution batches
- Builds independent components in parallel
- Respects dependency order

### 2.3 Bypass Consensus (CONDITIONAL) ⚠️ NEEDS FLAG
**Status:** Code exists, needs bypass flag
**File:** `lib/build-orchestrator.ts`

**Required Changes:**
```typescript
const DEFAULT_CONFIG: OrchestrationConfig = {
  verification: {
    require_multi_llm_consensus: false,  // ✅ Already disabled
    // Keep consensus code for future selective use
  }
};
```

**Result:** Consensus disabled by default, can enable for critical components

---

## Phase 3: Multi-Agent Parallel System (NEW)

### 3.1 Intelligent Agent Orchestration 📋 TODO
**Priority:** HIGH
**New File:** `lib/multi-agent-orchestrator.ts`

**Features:**
- **Dependency-aware waves:** Build components in parallel batches
- **Lock management:** Prevent resource conflicts
- **Smart model selection:** Right model for each component
- **Real-time monitoring:** Track all agent progress
- **Conflict resolution:** Handle race conditions

**Key Components:**
```typescript
export class MultiAgentOrchestrator {
  // Build dependency graph
  private analyzeDependencies(components: Component[]): DependencyGraph

  // Create execution waves (parallel batches)
  private createExecutionWaves(): Component[][]

  // Execute wave in parallel
  async executeWave(wave: Component[]): Promise<Result[]>

  // Prevent conflicts
  private lockManager: LockManager

  // Monitor progress
  getAgentStatus(): AgentStatus[]
}
```

**Success Metrics:**
- 5-10x speed improvement
- Zero dependency conflicts
- <5% build failures

### 3.2 Individual Agent System 📋 TODO
**Priority:** HIGH
**New File:** `lib/agent.ts`

**Agent Capabilities:**
- Acquire resource locks
- Check pattern library first
- Generate with appropriate model
- Validate no conflicts
- Report errors with context

**Integration:**
- Works with existing pattern library
- Respects design profiles
- Uses smart model routing
- Feeds into contextual debugger

---

## Phase 4: Contextual Debugging System (NEW)

### 4.1 Context-Aware Debugger 📋 TODO
**Priority:** HIGH
**New File:** `lib/contextual-debugger.ts`

**The Problem It Solves:**
- No more switching between browser and IDE
- No more copying console errors
- No more explaining context repeatedly
- AI knows exactly where you are and what you're doing

**Features:**
- **Context tracking:** Page, component, user actions
- **Automatic error capture:** With full context
- **Smart fix generation:** Based on what user was doing
- **Floating debug panel:** In-context chat
- **One-click fixes:** Apply or add to PRD

**Implementation:**
```typescript
export class ContextualDebugger {
  // Inject into every preview page
  getContextTrackerScript(): string

  // Track user interactions
  trackComponentInteraction(component: string)

  // Capture errors with context
  captureErrorWithContext(error: Error): ErrorWithContext

  // Generate contextual fix
  async generateContextualFix(error: ErrorWithContext): Promise<Fix>

  // Show debug panel
  async showDebugPanel(error: ErrorWithContext): Promise<DebugPanel>
}
```

**UI Component:**
```typescript
export function DebugChat() {
  // Floating chat that knows:
  // - What page user is on
  // - What component they're interacting with
  // - What error just happened
  // User can just say "fix it" or "make it blue"
}
```

### 4.2 Auto-Healing Integration 📋 TODO
**Priority:** MEDIUM
**Builds on:** Contextual Debugger

**Features:**
- Detect errors in preview automatically
- Generate fixes with full context
- Apply fixes and rebuild affected components
- Update PRD with fixes
- Learn from failures to prevent recurrence

---

## Phase 5: Failure Prevention System (NEW)

### 5.1 Intelligent Failure Preventor 📋 TODO
**Priority:** MEDIUM
**New File:** `lib/failure-preventor.ts`

**Features:**
- **Preflight checks:** Detect problems before building
- **Dependency validation:** Missing auth, type mismatches
- **Resource conflict detection:** Multiple agents accessing same resource
- **Failure learning:** Pattern library of what NOT to do
- **Preemptive suggestions:** "This looks like it will fail, here's how to fix"

**Integration:**
- Runs before multi-agent orchestration
- Prevents costly build failures
- Feeds learning back to pattern library
- Suggests PRD improvements

---

## Phase 6: Enhancement of Existing Features

### 6.1 Auto-Animate Integration 📋 TODO
**Priority:** LOW
**File:** `lib/context-builder.ts`

**Add to component prompts:**
```typescript
const AUTO_ANIMATE_PATTERN = `
For any component with a dynamic list, use auto-animate:

import { useAutoAnimate } from '@formkit/auto-animate/react';

function ListComponent() {
  const [parent] = useAutoAnimate();

  return (
    <ul ref={parent}>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
`;
```

### 6.2 Design System TypeScript Module 📋 TODO
**Priority:** LOW
**New File:** `lib/design-system.ts`

**Generate TypeScript module:**
```typescript
export class DesignSystem {
  static generateFromProfile(profile: DesignProfile): string {
    return `
export const designSystem = {
  colors: {
    primary: '${profile.colorScheme.primary}',
    secondary: '${profile.colorScheme.secondary}',
    accent: '${profile.colorScheme.accent}',
  },
  typography: {
    fontFamily: '${profile.typography.fontRecommendations.sans}',
  },
  spacing: { xs: '0.5rem', sm: '1rem', md: '1.5rem', lg: '2rem', xl: '3rem' },
  animation: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    easing: [0.25, 0.1, 0.25, 1],
  },
  components: {
    card: 'rounded-2xl bg-white shadow-xl p-6',
    button: 'px-4 py-2 rounded-lg font-medium transition-all',
    input: 'w-full px-4 py-2 rounded-lg border focus:ring-2',
  }
};`;
  }
}
```

**Note:** Lower priority since we have Tailwind token injection working.

### 6.3 Preview Server Fixes 📋 TODO
**Priority:** MEDIUM
**File:** `app/api/build/preview/route.ts`

**Current Issues:**
- Port 3009 not starting consistently
- CORS errors
- Dependencies not installing

**Required Fixes:**
- Ensure npm install completes before starting server
- Add proper CORS headers
- Better error handling
- Retry logic for port conflicts

---

## What We Keep (DON'T DELETE)

### Working Systems ✅
- Visual PRD builder (drag-and-drop)
- Design profile detector
- Pattern library (10MB)
- Parallel builder infrastructure
- Dependency analyzer
- Design token injector
- All installed packages (Framer Motion, Tailwind UI, etc.)
- Consensus system code (bypass but keep for future)

### Why Keep Consensus Code
- Can enable selectively for critical components (payments, auth)
- Useful for high-stakes decisions
- Future feature: user-selectable quality levels

---

## Implementation Priority

### Sprint 1: Foundation (Week 1) ✅ COMPLETED
- [x] Fix model IDs
- [x] Fix design token injection
- [x] Connect design profiles
- [x] Add Framer Motion
- [x] Intelligent model routing

### Sprint 2: Multi-Agent System (Week 2) 📋 NEXT
- [ ] Build multi-agent orchestrator
- [ ] Implement dependency-aware waves
- [ ] Add lock management
- [ ] Create individual agent system
- [ ] Real-time progress monitoring

### Sprint 3: Contextual Debugging (Week 3)
- [ ] Build contextual debugger
- [ ] Implement context tracking
- [ ] Create floating debug panel
- [ ] Add one-click fix system
- [ ] Integrate with auto-healing

### Sprint 4: Polish & Prevention (Week 4)
- [ ] Add failure prevention system
- [ ] Implement auto-animate
- [ ] Fix preview server issues
- [ ] Create design system TS module
- [ ] Testing and optimization

---

## Success Metrics

### Performance
- **Build Time:** <60 seconds (from 5-10 minutes)
- **Cost per Build:** <$0.30 (from ~$2)
- **Parallel Speed:** 5-10x improvement
- **Cache Hit Rate:** >40% of components

### Quality
- **Design Consistency:** Zero hardcoded colors
- **Build Failures:** <5%
- **Dependency Conflicts:** Zero
- **Design Profile Match:** >90%

### User Experience
- **Debugging Time:** 90% reduction
- **Context Switches:** Zero (no leaving preview)
- **Manual Fixes:** <10% (vs ~70% currently)
- **Preview Success:** >95%

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   User Updates PRD                      │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│              Design Profile Detector                    │
│  • Analyzes app purpose, audience, industry            │
│  • Generates color psychology, typography               │
│  • Selects reference apps (Linear, Stripe, etc.)       │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│             Failure Prevention System                   │
│  • Preflight checks (dependencies, types)              │
│  • Learn from past failures                            │
│  • Suggest preemptive fixes                            │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│          Multi-Agent Orchestrator                       │
│  • Analyze dependencies                                │
│  • Create execution waves                              │
│  • Launch parallel agents                              │
└─────────┬───────┬───────┬───────┬───────────────────────┘
          │       │       │       │
          ▼       ▼       ▼       ▼
    ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
    │Agent│ │Agent│ │Agent│ │Agent│  (Wave 1: Independent)
    │  1  │ │  2  │ │  3  │ │  4  │
    └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘
       │       │       │       │
       │  Each Agent:          │
       │  1. Check pattern library
       │  2. Smart model selection
       │  3. Generate component
       │  4. Validate no conflicts
       │       │       │       │
       └───────┴───────┴───────┘
                  │
                  ▼
          ┌─────────────┐
          │   Wave 2    │  (Dependent components)
          └──────┬──────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│              Design Token Injection                     │
│  • Generate tailwind.config.ts                         │
│  • Create globals.css with design variables            │
│  • Ensure components use tokens (not hardcoded)        │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│                 Preview Server                          │
│  • Inject contextual debugger                          │
│  • Track user interactions                             │
│  • Capture errors with context                         │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │   Error Detected    │
        └─────────┬───────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│           Contextual Debugger                           │
│  • Know exactly what user was doing                    │
│  • Generate fix with full context                      │
│  • One-click apply or add to PRD                       │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│              Auto-Healing System                        │
│  • Apply fix and rebuild affected components           │
│  • Update PRD with fix                                 │
│  • Learn to prevent similar issues                     │
└─────────────────────────────────────────────────────────┘
```

---

## Key Innovations

### 1. Context-Aware Everything
- Debugger knows what you're doing
- Agents know their dependencies
- System learns from failures
- No manual context provision

### 2. Intelligent Parallelization
- Fast but safe
- Dependency-aware waves
- Resource conflict prevention
- Real-time monitoring

### 3. Zero Babysitting
- Multi-agent system handles complexity
- Auto-healing fixes issues
- Failure prevention stops problems before they start
- Learning system improves over time

### 4. Design Profile Integration
- Detected profiles actually used
- Color psychology applied
- Reference app quality matched
- Consistent design tokens

---

## Risk Mitigation

### Technical Risks
- **Agent conflicts:** Lock manager prevents
- **Dependency cycles:** Detection + prevention
- **Build failures:** Preflight checks + learning
- **Cost overruns:** Smart model routing

### Process Risks
- **Breaking existing features:** Keep all working code
- **User disruption:** Enhance, don't rebuild
- **Timeline slippage:** Prioritize by impact

---

## Next Steps

1. **Review & Approve Plan** ← YOU ARE HERE
2. **Sprint 2: Multi-Agent System**
   - Build orchestrator
   - Implement agents
   - Add monitoring
3. **Sprint 3: Contextual Debugging**
   - Build debugger
   - Create UI
   - Add auto-healing
4. **Sprint 4: Polish**
   - Fix remaining issues
   - Optimize performance
   - User testing

---

## For Future Claude Instances

When you see this plan:
- **Keep** all existing working features
- **Build** on the foundation we have
- **Enhance** rather than rebuild
- **Test** incrementally
- **Learn** from failures

The goal is professional apps in <60 seconds with zero babysitting.
