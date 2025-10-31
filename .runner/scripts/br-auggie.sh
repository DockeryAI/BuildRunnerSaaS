#!/bin/zsh
# br-auggie — Prepare project for Auggie AI with Build Runner governance
# This command ensures all documentation is synchronized and up-to-date
# Usage: br-auggie [project_dir]

set -euo pipefail

# Get project directory (current dir if not specified)
PROJECT_DIR="${1:-$PWD}"
PROJECT_NAME="$(basename "$PROJECT_DIR")"

echo "[br-auggie] 🤖 Preparing $PROJECT_NAME for Auggie AI with Build Runner governance..."

# Ensure we're in a git repository
if ! git -C "$PROJECT_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "[br-auggie] ❌ Not a git repository: $PROJECT_DIR"
    exit 1
fi

# Ensure .runner directory exists
RUNNER_DIR="$PROJECT_DIR/.runner"
mkdir -p "$RUNNER_DIR"

# Create or update state.json with proper Build Runner format
STATE_FILE="$RUNNER_DIR/state.json"
CURRENT_BRANCH=$(git -C "$PROJECT_DIR" branch --show-current 2>/dev/null || echo 'main')
CURRENT_COMMIT=$(git -C "$PROJECT_DIR" rev-parse HEAD 2>/dev/null || echo 'unknown')
CURRENT_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Update existing state.json
if [[ -f "$STATE_FILE" ]]; then
    echo "[br-auggie] 🔄 Updating existing state.json..."
    # Update timestamp, branch, and commit in existing state
    python3 - <<EOF
import json
import sys

try:
    with open("$STATE_FILE", "r") as f:
        state = json.load(f)
    
    state["last_sync"] = "$CURRENT_TIME"
    state["branch"] = "$CURRENT_BRANCH"
    state["commit"] = "$CURRENT_COMMIT"
    state["last_updated"] = "$CURRENT_TIME"
    
    # Ensure required fields exist
    if "project" not in state:
        state["project"] = {"name": "$PROJECT_NAME"}
    if "spec_path" not in state:
        state["spec_path"] = "docs/${PROJECT_NAME}-spec.md"
    if "phase" not in state:
        state["phase"] = 1
    if "step" not in state:
        state["step"] = 1
    if "total_phases" not in state:
        state["total_phases"] = 6
    if "total_steps_in_current_phase" not in state:
        state["total_steps_in_current_phase"] = 10
    
    with open("$STATE_FILE", "w") as f:
        json.dump(state, f, indent=2)
    
    print("[br-auggie] ✅ State updated successfully")
except Exception as e:
    print(f"[br-auggie] ❌ Error updating state: {e}")
    sys.exit(1)
EOF
fi

# Ensure docs directory exists
DOCS_DIR="$PROJECT_DIR/docs"
mkdir -p "$DOCS_DIR"

# Sync root documentation files to docs directory
echo "[br-auggie] 📋 Synchronizing documentation files..."

# Sync spec files
for spec_file in "PRODUCT_SPEC.md" "README.md" "spec.md"; do
    if [[ -f "$PROJECT_DIR/$spec_file" ]]; then
        echo "[br-auggie] 📄 Syncing $spec_file to docs/${PROJECT_NAME}-spec.md"
        cp "$PROJECT_DIR/$spec_file" "$DOCS_DIR/${PROJECT_NAME}-spec.md"
        break
    fi
done

# Sync workflow/overview files
for workflow_file in "USER_WORKFLOW.md" "WORKFLOW.md" "OVERVIEW.md"; do
    if [[ -f "$PROJECT_DIR/$workflow_file" ]]; then
        echo "[br-auggie] 📄 Syncing $workflow_file to docs/${PROJECT_NAME}-overview.md"
        cp "$PROJECT_DIR/$workflow_file" "$DOCS_DIR/${PROJECT_NAME}-overview.md"
        break
    fi
done

# Run autophases to update totals
echo "[br-auggie] 🔢 Updating phase calculations..."
"$HOME/.br/bin/br-autophases" "$PROJECT_DIR" || true

# Create governance reminder file
GOVERNANCE_FILE="$RUNNER_DIR/governance.md"
cat > "$GOVERNANCE_FILE" << EOF
# Build Runner Governance for $PROJECT_NAME

## Auggie AI Instructions

When working on this project, you MUST:

1. **Update state.json after every task completion**
   - Increment step number when completing tasks
   - Update last_updated timestamp
   - Add completed features to features object
   - Update status appropriately

2. **Keep documentation synchronized**
   - Update docs/${PROJECT_NAME}-spec.md with latest changes
   - Add entries to Change History section
   - Keep docs/${PROJECT_NAME}-overview.md current
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
- Phase: $(jq -r '.phase // 1' "$STATE_FILE")
- Step: $(jq -r '.step // 1' "$STATE_FILE")
- Status: $(jq -r '.status // "active"' "$STATE_FILE")
- Last Updated: $(jq -r '.last_updated // "unknown"' "$STATE_FILE")

## Quick Commands
- .runner/scripts/br-auggie.sh: Prepare for Auggie AI session
- br-handoff $PROJECT_NAME: Generate handoff documentation
- br-autophases: Update phase calculations

## Documentation Files to Keep Synchronized
- Root: PRODUCT_SPEC.md ↔ docs/${PROJECT_NAME}-spec.md
- Root: USER_WORKFLOW.md ↔ docs/${PROJECT_NAME}-overview.md
- Root: GITHUB_UPDATE.md (keep current)
- Root: SESSION_SUMMARY.md (keep current)
EOF

echo "[br-auggie] 📚 Created governance documentation at $GOVERNANCE_FILE"

echo "[br-auggie] ✅ $PROJECT_NAME is ready for Auggie AI with Build Runner governance!"
echo "[br-auggie] 📋 Governance file: $GOVERNANCE_FILE"
echo "[br-auggie] 📊 State file: $STATE_FILE"
echo "[br-auggie] 📖 Spec file: $DOCS_DIR/${PROJECT_NAME}-spec.md"
echo "[br-auggie] 📝 Overview file: $DOCS_DIR/${PROJECT_NAME}-overview.md"
echo ""
echo "[br-auggie] 🤖 You can now start Auggie AI and it will automatically follow Build Runner governance!"
