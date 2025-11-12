# OpenRouter Architecture - ARCHIVED

**Archived Date:** 2025-11-11
**Reason:** Replaced with Claude CLI direct integration
**Status:** Preserved for reference only

---

## What This Was

The OpenRouter-based build architecture used a multi-model approach with intelligent routing to generate code components:

- **Provider:** OpenRouter (access to 500+ models via single API)
- **Models Used:**
  - DeepSeek Chat (default, $0.27/1M tokens)
  - Claude Sonnet 4 (important tasks, $3/1M tokens)
  - Claude Opus 4 (critical security, $15/1M tokens)
  - Gemini 2.0 Flash Thinking (free reasoning)

- **Approach:** One-shot generation with extensive context
- **Execution:** Parallel component waves for speed
- **Context:** Design system + PRD + component requirements

---

## Why It Was Archived

### Problems Identified:

1. **Quality Gap:**
   - One-shot generation couldn't match iterative refinement of Claude CLI
   - No opportunity for Claude to see and improve its own output
   - Generated apps looked worse than Claude CLI direct builds

2. **No True Design Coherence:**
   - Design system existed but wasn't effectively enforced
   - Parallel execution lost context between components
   - DeepSeek didn't follow design guidelines as well as Claude

3. **Limited Iteration:**
   - No polish pass
   - No refinement loop
   - Can't critique and improve

4. **Speed vs Quality Tradeoff:**
   - Optimized for speed (parallel)
   - Sacrificed quality for performance

### The Fundamental Issue:
**Architecture mismatch** - BuildRunner optimized for speed, but users want Claude CLI quality.

---

## What It Did Well

✅ **Intelligent Model Routing** - Used right model for right task (cost-effective)
✅ **Design System Generation** - Created comprehensive design specs
✅ **Parallel Execution** - Fast builds (minutes vs hours)
✅ **Multi-Model Consensus** - (When enabled) validated critical code
✅ **Component Catalog** - Tracked available components

---

## Archived Files

1. **ai-component-generator.ts** (29,900 bytes)
   - Main component generation engine
   - Model selection logic
   - Quality verification
   - Design token enforcement

2. **design-system-generator.ts** (12,774 bytes)
   - Generated design systems from PRD
   - Color palettes, typography, patterns
   - Design profile analysis

3. **multi-agent-orchestrator.ts** (12,511 bytes)
   - Wave-based parallel execution
   - Dependency resolution
   - Build batching logic

4. **openrouter.ts** (server/lib)
   - OpenRouter API wrapper
   - Request/response handling
   - Error retry logic

---

## How To Restore (If Needed)

If you need to go back to the OpenRouter approach:

1. **Move files back:**
   ```bash
   mv apps/web/lib/archived/openrouter/*.ts apps/web/lib/
   mv apps/web/lib/archived/openrouter/openrouter.ts apps/server/lib/
   ```

2. **Reinstall dependencies:**
   ```bash
   # OpenRouter used fetch, no special deps needed
   # Just ensure OPENROUTER_API_KEY is in .env
   ```

3. **Revert build-orchestrator.ts:**
   - Restore `startBuild()` method
   - Restore `buildComponentsWithMultiAgent()` method
   - Remove Claude CLI calls

4. **Update API routes:**
   - Restore `/api/build/start` to use OpenRouter
   - Remove Claude-specific endpoints

5. **Environment:**
   - Set `OPENROUTER_API_KEY` in `.env.local`
   - Remove `ANTHROPIC_API_KEY` requirement

---

## Key Learnings

### What We Learned:

1. **One-shot generation has limits** - No amount of context can replace iterative refinement
2. **Design systems need enforcement** - Prompting isn't enough, need validation
3. **Model quality matters** - Cheaper models don't match Claude for UI work
4. **Speed vs Quality** - Can't have both without tradeoffs

### What To Keep:

- Design system generation concept (but with Claude)
- Task-based orchestration (but sequential, not parallel)
- Quality gates (TypeScript, lint, test)
- Component catalog tracking
- Build logging and monitoring

### What To Change:

- Sequential execution (not parallel)
- Iterative refinement (not one-shot)
- Claude CLI integration (not OpenRouter multi-model)
- Direct conversation (not stateless API calls)
- Polish passes (not single generation)

---

## Replacement: Claude CLI Architecture

The new system uses:

- **Claude CLI** as build engine (direct Anthropic API)
- **Sequential task execution** (quality over speed)
- **Conversation continuity** via handoffs
- **Iterative refinement** with quality gates
- **Git integration** (commit per task)
- **Full streaming** (see everything Claude does)
- **PRD as source of truth** (tasks update when PRD changes)

**Goal:** Match Claude CLI quality while adding BuildRunner orchestration and project management.

---

## References

- Original implementation: November 2025
- Migration to Claude CLI: November 2025
- Documentation: This file

**Status:** Archived but preserved for reference and potential restoration if needed.

---

*Archived by: Claude Code*
*Date: 2025-11-11*
*Reason: Quality > Speed*
