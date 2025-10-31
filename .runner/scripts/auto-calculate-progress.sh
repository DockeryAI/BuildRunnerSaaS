#!/bin/zsh
# auto-calculate-progress.sh — Auto-calculate phases and steps based on actual completion
# This analyzes the Change History to determine real progress

set -euo pipefail

PROJECT_DIR="${1:-$PWD}"
PROJECT_NAME="$(basename "$PROJECT_DIR")"
SPEC_FILE="$PROJECT_DIR/docs/${PROJECT_NAME}-spec.md"
STATE_FILE="$PROJECT_DIR/.runner/state.json"

# Function to count completed tasks from Change History
count_completed_tasks() {
    if [[ ! -f "$SPEC_FILE" ]]; then
        echo "0"
        return
    fi
    
    # Count all ✅ entries in Change History section
    awk '
        BEGIN{inCH=0; count=0}
        /^##[[:space:]]*Change History/{inCH=1; next}
        /^##[[:space:]]+/{if(inCH){inCH=0}}
        { 
            if(inCH && /^[[:space:]]*-[[:space:]]*✅/) {
                count++
            }
        }
        END{print count}
    ' "$SPEC_FILE"
}

# Function to count unique dates (phases)
count_phases() {
    if [[ ! -f "$SPEC_FILE" ]]; then
        echo "1"
        return
    fi
    
    # Count unique dates in Change History (each date = 1 phase)
    awk '
        BEGIN{inCH=0}
        /^##[[:space:]]*Change History/{inCH=1; next}
        /^##[[:space:]]+/{if(inCH){inCH=0}}
        {
            if(inCH && /^###[[:space:]]*[0-9]{4}-[0-9]{2}-[0-9]{2}/) {
                if(match($0, /[0-9]{4}-[0-9]{2}-[0-9]{2}/)) {
                    date = substr($0, RSTART, RLENGTH)
                    dates[date] = 1
                }
            }
        }
        END{if(length(dates) > 0) print length(dates); else print 1}
    ' "$SPEC_FILE"
}

# Function to get current step within current phase
get_current_step() {
    if [[ ! -f "$SPEC_FILE" ]]; then
        echo "1"
        return
    fi
    
    # Get the most recent date and count steps for that date
    awk '
        BEGIN{inCH=0; latest_date=""; step_count=0; in_latest=0}
        /^##[[:space:]]*Change History/{inCH=1; next}
        /^##[[:space:]]+/{if(inCH){inCH=0}}
        {
            if(inCH && /^###[[:space:]]*[0-9]{4}-[0-9]{2}-[0-9]{2}/) {
                if(match($0, /[0-9]{4}-[0-9]{2}-[0-9]{2}/)) {
                    date = substr($0, RSTART, RLENGTH)
                    if(latest_date == "" || date >= latest_date) {
                        if(date > latest_date) {
                            latest_date = date
                            step_count = 0
                        }
                        in_latest = 1
                    } else {
                        in_latest = 0
                    }
                }
            } else if(inCH && in_latest && /^[[:space:]]*-[[:space:]]*✅/) {
                step_count++
            }
        }
        END{if(step_count > 0) print step_count; else print 1}
    ' "$SPEC_FILE"
}

# Function to determine project status
get_project_status() {
    local completed_tasks="$1"
    local current_phase="$2"
    local current_step="$3"
    
    if [[ $completed_tasks -gt 50 ]]; then
        echo "production_ready"
    elif [[ $completed_tasks -gt 30 ]]; then
        echo "advanced_development"
    elif [[ $completed_tasks -gt 15 ]]; then
        echo "core_complete"
    elif [[ $completed_tasks -gt 5 ]]; then
        echo "foundation_complete"
    else
        echo "early_development"
    fi
}

# Calculate actual progress
COMPLETED_TASKS=$(count_completed_tasks)
TOTAL_PHASES=$(count_phases)
CURRENT_PHASE=$TOTAL_PHASES  # We're always on the latest phase
CURRENT_STEP=$(get_current_step)
PROJECT_STATUS=$(get_project_status "$COMPLETED_TASKS" "$CURRENT_PHASE" "$CURRENT_STEP")

# Estimate total phases based on project maturity
if [[ $COMPLETED_TASKS -gt 30 ]]; then
    ESTIMATED_TOTAL_PHASES=$((TOTAL_PHASES + 2))  # Near completion
elif [[ $COMPLETED_TASKS -gt 15 ]]; then
    ESTIMATED_TOTAL_PHASES=$((TOTAL_PHASES + 5))  # Mid development
else
    ESTIMATED_TOTAL_PHASES=$((TOTAL_PHASES + 10)) # Early development
fi

# Update state.json with calculated values
CURRENT_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
CURRENT_BRANCH=$(git -C "$PROJECT_DIR" branch --show-current 2>/dev/null || echo 'main')
CURRENT_COMMIT=$(git -C "$PROJECT_DIR" rev-parse HEAD 2>/dev/null || echo 'unknown')

# Create or update state.json
cat > "$STATE_FILE" << EOF
{
  "phase": $CURRENT_PHASE,
  "step": $CURRENT_STEP,
  "total_phases": $ESTIMATED_TOTAL_PHASES,
  "total_steps_in_current_phase": $CURRENT_STEP,
  "completed_tasks_count": $COMPLETED_TASKS,
  "current_stage": "auto_calculated",
  "last_sync": "$CURRENT_TIME",
  "status": "$PROJECT_STATUS",
  "branch": "$CURRENT_BRANCH",
  "commit": "$CURRENT_COMMIT",
  "project": {
    "name": "$PROJECT_NAME"
  },
  "spec_path": "docs/${PROJECT_NAME}-spec.md",
  "calculation_method": "auto_from_change_history",
  "last_updated": "$CURRENT_TIME"
}
EOF

echo "[auto-calc] 📊 Progress calculated from Change History:"
echo "[auto-calc] 📈 Completed tasks: $COMPLETED_TASKS"
echo "[auto-calc] 📅 Current phase: $CURRENT_PHASE of $ESTIMATED_TOTAL_PHASES"
echo "[auto-calc] 📝 Current step: $CURRENT_STEP"
echo "[auto-calc] 🎯 Status: $PROJECT_STATUS"
echo "[auto-calc] ✅ State updated: $STATE_FILE"
