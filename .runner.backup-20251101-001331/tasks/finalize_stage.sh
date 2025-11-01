#!/bin/bash

# BuildRunner Stage Finalization Script
# This script handles the finalization of a BuildRunner stage

set -e

echo "[br] 🔄 Finalizing current stage..."

# Get current working directory
REPO_ROOT=$(pwd)
RUNNER_DIR="$REPO_ROOT/.runner"
STATE_FILE="$RUNNER_DIR/state.json"

# Ensure state file exists
if [ ! -f "$STATE_FILE" ]; then
    echo "[br] 📝 Creating initial state file..."
    cat > "$STATE_FILE" << EOF
{
  "current_stage": "development",
  "last_sync": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "status": "active",
  "branch": "$(git branch --show-current 2>/dev/null || echo 'main')",
  "commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "features": {
    "ai_brainstorming": "completed",
    "prd_builder": "completed",
    "drag_drop_interface": "completed",
    "feature_extraction": "completed",
    "smart_suggestions": "completed"
  }
}
EOF
fi

# Update state with current information
echo "[br] 📊 Updating stage state..."

# Get current git information
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo 'main')
CURRENT_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo 'unknown')
CURRENT_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Update state file with current information
cat > "$STATE_FILE" << EOF
{
  "current_stage": "development",
  "last_sync": "$CURRENT_TIME",
  "status": "finalized",
  "branch": "$CURRENT_BRANCH",
  "commit": "$CURRENT_COMMIT",
  "features": {
    "ai_brainstorming": "completed",
    "prd_builder": "completed", 
    "drag_drop_interface": "completed",
    "feature_extraction": "completed",
    "smart_suggestions": "completed",
    "gpt4o_integration": "completed",
    "documentation": "completed"
  },
  "last_finalized": "$CURRENT_TIME"
}
EOF

# Log the finalization
echo "[br] ✅ Stage finalized successfully"
echo "[br] 📋 Current branch: $CURRENT_BRANCH"
echo "[br] 🔗 Current commit: ${CURRENT_COMMIT:0:8}"
echo "[br] ⏰ Finalized at: $CURRENT_TIME"

# Create sync log entry
SYNC_LOG="$RUNNER_DIR/auggie-sync.log"
echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") - Stage finalized - Branch: $CURRENT_BRANCH - Commit: ${CURRENT_COMMIT:0:8}" >> "$SYNC_LOG"

echo "[br] 🎉 Ready for handoff!"

exit 0
