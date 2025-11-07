# Reusable Component Library System - Design Document

## Overview

A system that identifies, stores, and reuses battle-tested components across multiple BuildRunner projects. When starting a new build, the system automatically detects which components from your library can be reused, dramatically speeding up development and ensuring consistency.

---

## The Problem

**Current State:**
- Every build starts from scratch
- Same patterns get rebuilt (auth systems, LLM routers, payment integrations, etc.)
- No way to leverage previous work
- Inconsistent implementations across projects

**Example:**
You build an intelligent LLM routing system for Project A that detects the best LLM for each job. Then for Project B, you need the same thing - but BuildRunner rebuilds it from scratch instead of reusing what already works.

---

## The Solution: Component Library System

### Core Concept

```
┌─────────────────────────────────────────────────────────────────┐
│                    BUILD WORKFLOW (ENHANCED)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User creates PRD                                            │
│  2. System generates project plan                               │
│  3. 🆕 LIBRARY SCAN                                            │
│     ├─ Analyze PRD requirements                                │
│     ├─ Search library for matching components                  │
│     ├─ Present matches to user for approval                    │
│     └─ Inject approved components into build plan              │
│  4. Build starts with library components pre-integrated         │
│  5. Build completes                                             │
│  6. 🆕 COMPONENT EXTRACTION (post-build)                       │
│     ├─ AI analyzes built code                                  │
│     ├─ Identifies reusable patterns                            │
│     ├─ User reviews and tags components                        │
│     └─ Components saved to library                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Library Structure

### What Gets Stored

Each component in the library contains:

```javascript
{
  id: "llm-router-v1",
  name: "Intelligent LLM Router",
  description: "Routes requests to optimal LLM based on task complexity, cost, and latency requirements",
  category: "AI/ML",
  tags: ["llm", "routing", "openai", "anthropic", "optimization"],

  // Metadata
  createdFrom: "project_1234",
  createdAt: "2025-01-15",
  timesUsed: 5,
  lastUsed: "2025-01-20",
  quality: "verified", // unverified | verified | battle-tested

  // Code & Files
  files: [
    {
      path: "lib/llm-router.ts",
      content: "...",
      language: "typescript"
    },
    {
      path: "lib/llm-router.test.ts",
      content: "...",
      language: "typescript"
    }
  ],

  // Dependencies
  npmPackages: ["openai", "@anthropic-ai/sdk"],
  envVars: ["OPENAI_API_KEY", "ANTHROPIC_API_KEY"],

  // Integration
  setupInstructions: "1. Add env vars\n2. Import router\n3. Use router.route(prompt)",
  usageExample: `
    import { llmRouter } from '@/lib/llm-router';
    const result = await llmRouter.route(prompt, { budget: 'low' });
  `,

  // Matching keywords (AI-generated)
  keywords: [
    "language model routing",
    "ai model selection",
    "llm optimization",
    "cost-effective ai calls",
    "model switching"
  ]
}
```

---

## How It Works: Step by Step

### PHASE 1: PRD Analysis & Component Matching

**When:** After PRD is created, before plan generation starts

**What Happens:**

1. **AI analyzes the PRD** and extracts requirements:
   ```
   Requirements detected:
   - User authentication (email/password)
   - Payment processing (Stripe)
   - LLM integration for content generation
   - File uploads to S3
   - Real-time notifications
   ```

2. **Semantic search** through component library:
   ```
   Searching for:
   - "authentication system"
   - "stripe payment integration"
   - "llm routing" or "language model integration"
   - "file upload s3"
   - "real-time notifications"
   ```

3. **Ranking matches** by relevance:
   ```
   High confidence (90%+):
   ✓ "Next.js Auth with Supabase" - 95% match
   ✓ "Stripe Checkout Integration" - 92% match

   Medium confidence (70-89%):
   ⚠ "Intelligent LLM Router" - 85% match
   ⚠ "S3 Upload with Progress" - 78% match

   Low confidence (<70%):
   ? "WebSocket Notifications" - 65% match
   ```

---

### PHASE 2: User Review & Selection (UI)

**Where:** New screen between PRD and Plan pages: `/component-match`

**UI Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│  Component Library Matches                                  │
│                                                              │
│  We found 5 components from your library that match this   │
│  project. Review and select which ones to include:          │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ✅ Next.js Auth with Supabase            95% match    │ │
│  │    Used in: 3 projects • Last used: 5 days ago        │ │
│  │    Saves: ~8 hours                                     │ │
│  │    [View Code] [Integration Guide]                     │ │
│  │    ☑ Include in build                                 │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ⚠ Intelligent LLM Router                 85% match    │ │
│  │    Used in: 1 project • Last used: 12 days ago        │ │
│  │    Saves: ~4 hours                                     │ │
│  │    Note: Requires OPENAI_API_KEY, ANTHROPIC_API_KEY   │ │
│  │    [View Code] [Integration Guide]                     │ │
│  │    ☐ Include in build                                 │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  [Skip This Step] [Continue with Selected (2)] ───────────→ │
└─────────────────────────────────────────────────────────────┘
```

**User Actions:**
- Preview component code
- Read integration docs
- See what env vars/dependencies are needed
- Check/uncheck components to include
- See estimated time saved
- Continue to plan generation

---

### PHASE 3: Plan Generation (Enhanced)

**What Changes:**

The plan generation API receives:
```javascript
{
  prdSections: {...},
  selectedLibraryComponents: [
    { id: "llm-router-v1", category: "AI/ML" },
    { id: "next-auth-supabase-v2", category: "Auth" }
  ]
}
```

**Plan is modified:**
- Components marked as "reusable from library" are shown differently
- Estimated time is reduced
- Dependencies auto-added to tech stack
- Integration steps added to relevant milestones

**Example Plan Output:**
```
Milestone 1: Core Infrastructure
  Step 1: Authentication System
    ✨ Using library component: "Next.js Auth with Supabase"
    ├─ Microstep 1: Configure environment variables (0.5h)
    ├─ Microstep 2: Integrate auth provider (1h)
    └─ Microstep 3: Add login/signup pages (2h)
    Total: 3.5 hours (saved 4.5 hours)

  Step 2: LLM Integration
    ✨ Using library component: "Intelligent LLM Router"
    ├─ Microstep 1: Install dependencies (0.25h)
    ├─ Microstep 2: Configure API keys (0.5h)
    └─ Microstep 3: Integrate into content generation flow (2h)
    Total: 2.75 hours (saved 3 hours)
```

---

### PHASE 4: Build Execution (Automated Integration)

**What Happens:**

When build starts, library components are **automatically injected**:

1. **Files copied** to project:
   ```
   ~/Projects/BuildRunnerProjects/NewProject/
     ├─ lib/
     │   ├─ llm-router.ts        ← from library
     │   ├─ llm-router.test.ts   ← from library
     │   └─ auth-provider.tsx    ← from library
   ```

2. **Dependencies added** to package.json:
   ```json
   {
     "dependencies": {
       "openai": "^4.20.0",
       "@anthropic-ai/sdk": "^0.9.0",
       "@supabase/supabase-js": "^2.38.0"
     }
   }
   ```

3. **Env vars documented** in .env.example:
   ```
   # Required for LLM Router component
   OPENAI_API_KEY=your_key_here
   ANTHROPIC_API_KEY=your_key_here
   ```

4. **Integration README created**:
   ```markdown
   # Library Components Integrated

   ## Intelligent LLM Router
   - Location: `lib/llm-router.ts`
   - Setup: Add OPENAI_API_KEY and ANTHROPIC_API_KEY to .env
   - Usage: See examples in lib/llm-router.test.ts
   ```

Claude Builder builds around these pre-integrated components.

---

### PHASE 5: Post-Build Component Extraction

**When:** After build completes successfully

**UI Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│  Build Complete! 🎉                                         │
│                                                              │
│  Would you like to save reusable components to your library?│
│                                                              │
│  AI detected 3 potentially reusable components:             │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 💡 Webhook Signature Validator                        │ │
│  │    Files: lib/webhook-validator.ts                    │ │
│  │    Purpose: Validates webhook signatures from Stripe  │ │
│  │    Reusability: High                                   │ │
│  │                                                         │ │
│  │    Name: [Stripe Webhook Validator_________]          │ │
│  │    Category: [Payments ▼]                             │ │
│  │    Tags: stripe, webhook, security                    │ │
│  │    ☑ Add to library                                   │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  [Skip] [Save Selected (2 components)] ─────────────────→   │
└─────────────────────────────────────────────────────────────┘
```

**AI Detection Logic:**
- Scans built code for self-contained modules
- Looks for:
  - Single-purpose functions/classes
  - Clear interfaces
  - No hard-coded project-specific values
  - Tests present
  - Documentation present
- Suggests name, category, and tags
- User reviews and approves

---

## UI Integration Points

### New Pages/Modals

1. **Component Match Screen** (`/component-match`)
   - Shows after PRD, before Plan
   - Lists matched components
   - Selection interface
   - Preview & details

2. **Component Library Browser** (`/library`)
   - Browse all saved components
   - Search & filter
   - View details
   - Edit tags/metadata
   - Delete components
   - Export components

3. **Post-Build Extraction Modal**
   - Shows after successful build
   - AI suggestions for components to save
   - Quick edit & tag interface
   - Save or skip

### Enhanced Existing Pages

1. **Plan Page** - Shows which components come from library with badges
2. **Workbench** - Indicates library components in build progress
3. **Settings** - Library storage location, auto-extract settings

---

## Data Storage

### Where Components Live

```
~/.buildrunner/
  ├─ library/
  │   ├─ index.json          ← Component metadata
  │   ├─ llm-router-v1/
  │   │   ├─ files/
  │   │   │   ├─ llm-router.ts
  │   │   │   └─ llm-router.test.ts
  │   │   └─ metadata.json
  │   ├─ next-auth-v2/
  │   │   ├─ files/
  │   │   └─ metadata.json
  │   └─ ...
```

### Alternative: Supabase Storage (Future)
- Cloud-backed component library
- Share components across machines
- Team libraries
- Public component marketplace

---

## Technical Architecture

### New Files Needed (Future Implementation)

```
apps/web/
  ├─ lib/
  │   ├─ component-library.ts      ← Core library management
  │   ├─ component-matcher.ts      ← Semantic matching logic
  │   └─ component-extractor.ts    ← Post-build extraction
  │
  ├─ app/
  │   ├─ (app)/
  │   │   ├─ component-match/
  │   │   │   └─ page.tsx          ← Match review UI
  │   │   └─ library/
  │   │       └─ page.tsx          ← Library browser UI
  │   │
  │   └─ api/
  │       ├─ library/
  │       │   ├─ search/route.ts   ← Search components
  │       │   ├─ add/route.ts      ← Add component
  │       │   └─ get/route.ts      ← Get component
  │       └─ prd/
  │           └─ match-components/
  │               └─ route.ts      ← PRD → components matching
```

---

## User Workflow Example

### Scenario: Building a SaaS with AI Features

**1. User creates PRD:**
- Features: User auth, Stripe billing, AI content generation, file uploads

**2. Component Match Screen appears:**
```
Found 4 matching components:

✅ Next.js + Supabase Auth (95% match) - SELECTED
  Saves: 8 hours

✅ Stripe Subscription Manager (92% match) - SELECTED
  Saves: 12 hours

⚠ Intelligent LLM Router (88% match) - SELECTED
  Saves: 4 hours

⚠ S3 Upload with Progress (75% match) - NOT SELECTED
  (User decides to build custom uploader)
```

**3. Plan generated with library components:**
```
Total Estimated Time: 120 hours
Time Saved by Library: 24 hours ✨
Actual Build Time: 96 hours
```

**4. Build executes:**
- Library components automatically integrated
- Claude Builder focuses on custom logic
- Build completes in 96 hours instead of 120

**5. Post-build extraction:**
```
AI suggests saving:
- Custom Image Optimizer (lib/image-optimizer.ts)
- Webhook Event Queue (lib/webhook-queue.ts)

User adds both to library for future projects.
```

---

## Benefits

### Time Savings
- **20-40% faster builds** by reusing proven components
- No rebuilding auth, payments, common integrations
- Focus effort on unique business logic

### Quality Improvements
- **Battle-tested code** - components used across multiple projects
- Consistent patterns across all your projects
- Fewer bugs in foundational systems

### Knowledge Retention
- Capture good solutions as you build them
- Don't lose great code when projects end
- Build your personal/team component ecosystem

---

## Implementation Phases (Future)

### Phase 1: Basic Library (Weeks 1-2)
- Component storage system
- Manual component addition
- Simple keyword search
- Basic library browser UI

### Phase 2: Smart Matching (Weeks 3-4)
- AI-powered PRD analysis
- Semantic component matching
- Component match review UI
- Integration into build workflow

### Phase 3: Auto-Extraction (Weeks 5-6)
- Post-build code analysis
- Component detection AI
- Extraction UI
- Quality scoring

### Phase 4: Advanced Features (Weeks 7-8)
- Cloud sync (Supabase)
- Team libraries
- Component versioning
- Usage analytics
- Public marketplace

---

## Open Questions for Discussion

1. **Storage:** Local files vs. Supabase cloud storage?
2. **Matching threshold:** What % match requires user approval vs. auto-include?
3. **Versioning:** How to handle component updates/improvements?
4. **Testing:** Should components require tests to be added to library?
5. **Privacy:** How to handle components with sensitive logic/API keys?

---

## Success Metrics

After implementation:
- **Component reuse rate:** % of builds using ≥1 library component
- **Time saved:** Average hours saved per build
- **Library growth:** New components added per month
- **Component quality:** Components that cause zero issues when reused

---

**Status:** Design phase - not implemented
**Next Step:** Review design, update build plan, then implement Phase 1
