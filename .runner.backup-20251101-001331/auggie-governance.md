# 🤖 Auggie AI - Build Runner Governance Protocol

## MANDATORY INSTRUCTIONS FOR AUGGIE AI

You are now operating under **Build Runner Governance**. This means you MUST follow these protocols for every task and session:

### 📊 STATE MANAGEMENT (CRITICAL)

**After EVERY task completion, you MUST:**

1. **Update .runner/state.json** with:
   ```bash
   .runner/scripts/update-task-completion.sh "Description of completed task" [step_increment]
   ```

2. **Key fields to maintain:**
   - `step`: Increment when completing significant tasks
   - `last_updated`: Always update to current timestamp
   - `features`: Add completed features
   - `status`: Update based on progress
   - `completed_tasks`: Add task descriptions

### 📚 DOCUMENTATION SYNCHRONIZATION (CRITICAL)

**You MUST keep these files synchronized:**

1. **Root ↔ Docs Sync:**
   - `PRODUCT_SPEC.md` ↔ `docs/BuildRunnerSaaS-spec.md`
   - `USER_WORKFLOW.md` ↔ `docs/BuildRunnerSaaS-overview.md`
   - `GITHUB_UPDATE.md` (keep current in root)
   - `SESSION_SUMMARY.md` (keep current in root)

2. **After every change:**
   ```bash
   br-auggie  # Sync all documentation
   ```

3. **Update Change History:**
   - Add entries to spec file Change History section
   - Include date, phase, step, and completed tasks
   - Use format: `### YYYY-MM-DD - Phase X of 6 - Step Y of Z`

### 🔄 SESSION WORKFLOW (MANDATORY)

**At session start:**
1. Run `br-auggie` to ensure sync
2. Check `.runner/governance.md` for current state
3. Review current phase/step from `.runner/state.json`

**During work:**
1. Complete tasks systematically
2. Update state after each significant task
3. Keep documentation synchronized
4. Commit changes regularly

**At session end:**
1. Run `br-handoff BuildRunnerSaaS` for transition documentation
2. Ensure all changes are committed and pushed
3. Update state with session summary

### 📋 BUILD RUNNER PHASES

**Phase 1: Foundation & Core Features (Steps 1-10)**
- ✅ Project setup and architecture
- ✅ Core AI integration
- ✅ Basic UI and functionality
- ✅ Documentation framework

**Phase 2: Advanced Features & Integration (Steps 1-8)**
- Advanced AI capabilities
- Enhanced user experience
- Integration improvements
- Performance optimization

**Phase 3: Testing & Quality Assurance (Steps 1-6)**
- Comprehensive testing
- Bug fixes and stability
- User experience refinement
- Quality validation

**Phase 4: Performance & Optimization (Steps 1-5)**
- Performance tuning
- Scalability improvements
- Resource optimization
- Monitoring setup

**Phase 5: Documentation & Deployment (Steps 1-4)**
- Complete documentation
- Deployment preparation
- User guides and tutorials
- Launch readiness

**Phase 6: Launch & Maintenance (Steps 1-3)**
- Production launch
- Monitoring and maintenance
- User feedback integration
- Continuous improvement

### 🎯 CURRENT PROJECT STATUS

**Project:** BuildRunnerSaaS
**Current Phase:** 1 of 6
**Current Step:** 10 of 10
**Status:** Phase 1 Complete - Ready for Phase 2

**Completed Features:**
- ✅ AI-powered brainstorming system with GPT-4o
- ✅ Drag-and-drop PRD builder
- ✅ Intelligent feature extraction
- ✅ Smart suggestion management
- ✅ Compact expandable suggestion cards
- ✅ Professional UI with 2-column layout
- ✅ Complete documentation synchronization
- ✅ Build Runner governance integration

### 🚨 CRITICAL REMINDERS

1. **NEVER skip state updates** - Update `.runner/state.json` after every task
2. **ALWAYS sync documentation** - Keep root and docs files synchronized
3. **COMMIT frequently** - Don't lose work, commit after each task
4. **USE br-handoff** - Generate handoff docs for session transitions
5. **FOLLOW phases** - Respect the Build Runner phase structure

### 🛠️ QUICK COMMANDS

```bash
# Prepare for Auggie session
br-auggie

# Update task completion
.runner/scripts/update-task-completion.sh "Task description" 1

# Generate handoff documentation
br-handoff BuildRunnerSaaS

# Check current state
cat .runner/state.json | jq '.'

# View governance
cat .runner/governance.md
```

### 📖 DOCUMENTATION REQUIREMENTS

**Every change must be reflected in:**
1. `.runner/state.json` - Current state and progress
2. `docs/BuildRunnerSaaS-spec.md` - Technical specification
3. `docs/BuildRunnerSaaS-overview.md` - User workflow
4. Root documentation files (PRODUCT_SPEC.md, USER_WORKFLOW.md, etc.)

**Change History format:**
```markdown
### 2025-10-31 - Phase 1 of 6 - Step 10 of 10
- ✅ Completed task description
- ✅ Another completed task
```

---

## 🎉 YOU ARE NOW UNDER BUILD RUNNER GOVERNANCE

**This protocol ensures:**
- ✅ Consistent state tracking
- ✅ Synchronized documentation
- ✅ Seamless session transitions
- ✅ Professional project management
- ✅ Complete audit trail

**Remember: Every task completion = State update + Documentation sync + Commit**
