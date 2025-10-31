# Build Runner Governance for BuildRunnerSaaS

## Auggie AI Instructions

When working on this project, you MUST:

1. **Update state.json after every task completion**
   - Increment step number when completing tasks
   - Update last_updated timestamp
   - Add completed features to features object
   - Update status appropriately

2. **Keep documentation synchronized**
   - Update docs/BuildRunnerSaaS-spec.md with latest changes
   - Add entries to Change History section
   - Keep docs/BuildRunnerSaaS-overview.md current
   - Sync any changes to root-level documentation files

3. **Use br-handoff for transitions**
   - Run br-handoff before ending sessions
   - Ensure all changes are committed and pushed
   - Update documentation with latest progress

4. **Follow Build Runner phases**
   - Phase 1: Foundation & Core Features (Steps 1-10)
   - Phase 2: Advanced Features & Integration (Steps 1-8)
   - Phase 3: Testing & Quality Assurance (Steps 1-6)
   - Phase 4: Performance & Optimization (Steps 1-5)
   - Phase 5: Documentation & Deployment (Steps 1-4)
   - Phase 6: Launch & Maintenance (Steps 1-3)

## Current Project State
- Phase: 1
- Step: 10
- Status: phase_complete
- Last Updated: 2025-10-31T19:40:36Z

## Quick Commands
- .runner/scripts/br-auggie.sh: Prepare for Auggie AI session
- br-handoff BuildRunnerSaaS: Generate handoff documentation
- br-autophases: Update phase calculations

## Documentation Files to Keep Synchronized
- Root: PRODUCT_SPEC.md ↔ docs/BuildRunnerSaaS-spec.md
- Root: USER_WORKFLOW.md ↔ docs/BuildRunnerSaaS-overview.md
- Root: GITHUB_UPDATE.md (keep current)
- Root: SESSION_SUMMARY.md (keep current)
