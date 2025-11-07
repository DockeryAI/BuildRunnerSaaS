# BuildRunner SaaS - Product Roadmap

**Current Version:** v1.1.0 (P0 MVP in progress)
**Last Updated:** 2025-01-07

---

## Current Focus: P0 MVP (82% Complete)

**Goal:** Ship minimal viable product with core PRD → Plan → Build workflow

### ✅ Completed (27 features)
- Interactive PRD Builder with AI suggestions
- Claude-powered Oracle for brainstorming
- 5-model consensus plan generation & verification
- Project plan visualization with milestones/steps
- Claude Builder daemon integration
- Material Design 3 color system (Phases 1-2)
- Project archival with GitHub push
- Build progress tracking
- Architecture visualization
- **Intelligent LLM Model Routing** (OpenRouter 500+ models) 🆕

### 🚧 In Progress (0 features)
- Testing current MVP
- Bug fixes and polish

### 📋 Planned for P0 (9 features)
- Build preview system
- Component details modal
- Consensus log viewer
- File browser
- Terminal panel improvements
- Live build status updates
- Build artifact download
- Build restoration from archives
- Error handling improvements

---

## Future Releases

### **Phase 1: Reusable Component Library** 🆕
> **Status:** Design complete, awaiting P0 completion
> **Timeline:** 8 weeks after P0 launch
> **Priority:** High

**Problem Solved:**
Every build starts from scratch, rebuilding the same patterns (auth, payments, LLM routing, etc.). No way to leverage previous work across projects.

**Solution:**
Intelligent component library that:
1. Analyzes PRD and suggests matching components from your library
2. Auto-integrates battle-tested code into new builds
3. Extracts reusable patterns from completed builds
4. Saves 20-40% build time by reusing proven components

**Key Features:**

#### 1.1 Component Matching & Selection (Weeks 1-2)
- **AI-powered PRD analysis** → requirement extraction
- **Semantic search** through component library
- **Confidence scoring** for matches (90%+ = high, 70-89% = medium, <70% = low)
- **Component Match Review UI** (`/component-match`)
  - Shows between PRD and Plan pages
  - Preview component code
  - See integration requirements (env vars, dependencies)
  - Estimated time savings
  - Select which components to include

#### 1.2 Library Storage & Management (Weeks 3-4)
- **Component metadata structure:**
  - Code files
  - Dependencies (npm packages, env vars)
  - Setup instructions & usage examples
  - Quality score (unverified → verified → battle-tested)
  - Usage analytics (times used, last used)
  - Tags & categories for search
- **Storage location:** `~/.buildrunner/library/`
- **Library Browser UI** (`/library`)
  - Browse all components
  - Search & filter by category/tags
  - Edit metadata
  - Delete components
  - View usage statistics

#### 1.3 Build Integration (Weeks 5-6)
- **Enhanced plan generation** with library components
- **Automatic code injection** into new builds
- **Dependency management** (package.json updates)
- **Env var documentation** (.env.example generation)
- **Integration README** auto-created
- **Visual indicators** in plan/workbench showing library components

#### 1.4 Post-Build Component Extraction (Weeks 7-8)
- **AI code analysis** to detect reusable patterns
- **Extraction criteria:**
  - Self-contained modules
  - Single-purpose functions/classes
  - No hard-coded project values
  - Tests present
  - Documentation present
- **Post-Build Extraction UI** (modal after build completes)
  - AI suggests components to save
  - User reviews, names, tags
  - Add to library for future use

**Success Metrics:**
- Component reuse rate: ≥60% of builds use ≥1 library component
- Time saved: Average 20+ hours per build
- Library growth: 5+ components added per month
- Quality: 95%+ of reused components work without issues

**See Full Design:** `docs/COMPONENT_LIBRARY_DESIGN.md`

---

### **Phase 2: Material Design 3 Enhancement Engine**
> **Status:** Phases 1-2 complete, 3-5 planned
> **Timeline:** 12 weeks
> **Priority:** Medium

#### ✅ Completed: Phases 1-2 (Color System)
- Official Material Color Utilities integration
- Industry-specific color recommendations
- Dynamic theme generation (light/dark)
- HCT color space for perceptual accuracy
- Accessibility (WCAG AA compliance)

#### 📋 Planned: Phases 3-5
- **Phase 3:** Component Enhancement Engine (4-5 weeks)
  - AST-based component analysis & transformation
  - Material Design component suggestions
  - Automated component upgrades
  - *Risk: High complexity, may delay timeline*

- **Phase 4:** CLI Commands (2-3 weeks)
  - `buildrunner design upgrade`
  - `buildrunner design generate-palette`
  - `buildrunner design analyze`

- **Phase 5:** Testing & Documentation (3-4 weeks)
  - Comprehensive test coverage
  - Developer documentation
  - Design system guide

---

### **Phase 3: Team Collaboration**
> **Timeline:** TBD
> **Priority:** Medium

- **Multi-user workspaces**
- **Shared component libraries**
- **Real-time build monitoring**
- **Build handoff between team members**
- **Component reviews & approvals**
- **Usage analytics dashboard**

---

### **Phase 4: Cloud Infrastructure**
> **Timeline:** TBD
> **Priority:** Medium-Low

- **Supabase-backed component library**
  - Sync components across machines
  - Team libraries
  - Public component marketplace
- **Cloud build execution**
- **Hosted preview deployments**
- **Build artifact cloud storage**

---

### **Phase 5: Advanced Build Features**
> **Timeline:** TBD
> **Priority:** Low

- **Multi-framework support**
  - Vue, Angular, Svelte
  - Python (Django, Flask, FastAPI)
  - Ruby on Rails
- **Mobile app builds** (React Native, Flutter)
- **Desktop app builds** (Electron, Tauri)
- **Microservices architecture support**
- **Database schema generation**
- **API documentation auto-generation**

---

## Decision Log

### 2025-01-07: Intelligent LLM Model Routing 🆕
**Decision:** Implement smart model routing across OpenRouter's 500+ models
**Rationale:**
- **Cost optimization**: 48% cost reduction vs using Sonnet for everything
- **Quality maintenance**: Premium models (Opus) only for critical code (auth/payments)
- **Free tier leverage**: Gemini 2.0 Flash Thinking is FREE with excellent reasoning
- **Speed improvements**: Fast models (DeepSeek, Haiku) for simple tasks

**Model Selection Strategy:**
- **Trivial tasks** (boilerplate, config) → Gemini Flash Free ($0)
- **Standard components** (CRUD, UI) → DeepSeek Chat ($0.27/1M)
- **Complex reasoning** (architecture, schemas) → Gemini 2.0 Flash Thinking ($0)
- **Critical code** (auth, payments) → Claude Opus 4 ($15/1M)

**Cost Comparison** (14-component app):
- Old (all Sonnet): $3.27
- New (intelligent routing): $1.71
- **Savings: 48%**

**Implementation:**
- `lib/model-router.ts`: Task → model mapping system
- `lib/ai-component-generator.ts`: Integrated with component generation
- Real-time cost tracking via `modelRouter.getCostSummary()`

**See Full Guide:** `docs/INTELLIGENT_MODEL_ROUTING.md`

### 2025-01-07: Component Library System Design
**Decision:** Implement component library as Phase 1 after P0 MVP
**Rationale:**
- High user value (20-40% time savings)
- Natural fit with current workflow
- Differentiator from competitors
- Compounds value over time (library grows)

**Implementation approach:**
- Start with local filesystem storage (simple, fast)
- Add cloud sync in Phase 4 (if needed)
- Focus on AI-powered matching (core value prop)
- Manual component addition first, auto-extraction later

**Open questions:**
1. Matching threshold for auto-include vs. user review?
2. Should components require tests to be added to library?
3. How to handle component versioning/updates?

### 2025-01-05: Material Design 3 Phases 3-5 Deferred
**Decision:** Complete Phases 1-2 only, defer 3-5 until after Component Library
**Rationale:**
- Phase 3 (AST manipulation) is high-risk, complex
- Color system (Phases 1-2) provides 80% of value
- Component Library has higher ROI
- Can revisit MD3 enhancement after Component Library ships

---

## Version History

### v1.1.0 (In Progress) - P0 MVP
- Core PRD → Plan → Build workflow
- 5-model consensus verification
- Material Design 3 color system
- Project archival & GitHub integration

### v1.0.0 - Initial Release
- Basic PRD builder
- Simple plan generation
- Manual Claude Builder integration

---

## Contributing

See `COMPONENT_LIBRARY_DESIGN.md` for detailed specifications on the component library system.

**Questions?** Open an issue or discussion.
