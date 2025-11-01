#!/bin/zsh
# update-task-completion.sh — Update Build Runner state after task completion
# Usage: update-task-completion.sh "task description" [step_increment]

set -euo pipefail

TASK_DESCRIPTION="${1:-}"
STEP_INCREMENT="${2:-0}"
PROJECT_DIR="$PWD"
PROJECT_NAME="$(basename "$PROJECT_DIR")"
STATE_FILE="$PROJECT_DIR/.runner/state.json"
CURRENT_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

if [[ -z "$TASK_DESCRIPTION" ]]; then
    echo "[task-update] ❌ Task description required"
    echo "Usage: update-task-completion.sh \"task description\" [step_increment]"
    exit 1
fi

echo "[task-update] 📝 Updating task completion: $TASK_DESCRIPTION"

# Ensure state file exists
if [[ ! -f "$STATE_FILE" ]]; then
    echo "[task-update] ❌ State file not found. Run br-auggie first."
    exit 1
fi

# Update state.json
python3 - <<EOF
import json
import sys

try:
    with open("$STATE_FILE", "r") as f:
        state = json.load(f)
    
    # Update timestamps
    state["last_updated"] = "$CURRENT_TIME"
    state["last_sync"] = "$CURRENT_TIME"
    
    # Increment step if requested
    if $STEP_INCREMENT > 0:
        current_step = state.get("step", 1)
        state["step"] = current_step + $STEP_INCREMENT
        print(f"[task-update] 📈 Step incremented from {current_step} to {state['step']}")
    
    # Add to completed tasks if not already there
    if "completed_tasks" not in state:
        state["completed_tasks"] = []
    
    task_entry = f"$CURRENT_TIME: $TASK_DESCRIPTION"
    if task_entry not in state["completed_tasks"]:
        state["completed_tasks"].append(task_entry)
        print(f"[task-update] ✅ Added task: $TASK_DESCRIPTION")
    
    # Update status based on step progress
    current_step = state.get("step", 1)
    total_steps = state.get("total_steps_in_current_phase", 10)
    
    if current_step >= total_steps:
        state["status"] = "phase_complete"
        print(f"[task-update] 🎉 Phase {state.get('phase', 1)} completed!")
    else:
        state["status"] = "active"
    
    with open("$STATE_FILE", "w") as f:
        json.dump(state, f, indent=2)
    
    print(f"[task-update] ✅ State updated successfully")
    
except Exception as e:
    print(f"[task-update] ❌ Error updating state: {e}")
    sys.exit(1)
EOF

# Update spec file with latest task
SPEC_FILE="$PROJECT_DIR/docs/${PROJECT_NAME}-spec.md"
if [[ -f "$SPEC_FILE" ]]; then
    echo "[task-update] 📋 Updating spec file with latest task..."
    
    # Add task to Change History section
    python3 - <<EOF
import re
from datetime import datetime

try:
    with open("$SPEC_FILE", "r") as f:
        content = f.read()
    
    # Find the latest date entry in Change History
    today = datetime.now().strftime("%Y-%m-%d")
    phase = $(jq -r '.phase // 1' "$STATE_FILE")
    step = $(jq -r '.step // 1' "$STATE_FILE")
    total_steps = $(jq -r '.total_steps_in_current_phase // 10' "$STATE_FILE")
    
    # Look for today's entry
    today_pattern = f"### {today} - Phase {phase} of 6 - Step {step} of {total_steps}"
    
    if today_pattern in content:
        # Add to existing entry
        task_line = f"- ✅ $TASK_DESCRIPTION"
        # Find the section and add the task
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if today_pattern in line:
                # Find the next section or end of current section
                j = i + 1
                while j < len(lines) and not lines[j].startswith('###'):
                    j += 1
                # Insert before the next section
                lines.insert(j - 1, task_line)
                break
        content = '\n'.join(lines)
    else:
        # Create new entry
        new_entry = f"""
### {today} - Phase {phase} of 6 - Step {step} of {total_steps}
- ✅ $TASK_DESCRIPTION
"""
        # Find Change History section and add after it
        if "## Change History" in content:
            content = content.replace("## Change History", f"## Change History{new_entry}")
    
    with open("$SPEC_FILE", "w") as f:
        f.write(content)
    
    print("[task-update] ✅ Spec file updated")
    
except Exception as e:
    print(f"[task-update] ❌ Error updating spec: {e}")
EOF
fi

# Sync documentation
echo "[task-update] 🔄 Syncing documentation..."
"$PROJECT_DIR/.runner/scripts/br-auggie.sh" >/dev/null 2>&1 || true

echo "[task-update] ✅ Task completion update finished"
