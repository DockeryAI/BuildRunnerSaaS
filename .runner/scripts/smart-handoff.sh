#!/bin/zsh
# smart-handoff.sh — Smart handoff with auto-calculated progress and clear ChatGPT prompt
# Usage: smart-handoff.sh [project_name]

set -euo pipefail

PROJECT_DIR="$PWD"
PROJECT_NAME="${1:-$(basename "$PROJECT_DIR")}"

echo "[smart-handoff] 🤖 Generating smart handoff for $PROJECT_NAME..."

# Auto-calculate progress first
"$PROJECT_DIR/.runner/scripts/auto-calculate-progress.sh" "$PROJECT_DIR"

# Get calculated values
STATE_FILE="$PROJECT_DIR/.runner/state.json"
SPEC_FILE="$PROJECT_DIR/docs/${PROJECT_NAME}-spec.md"

# Extract values from state
CURRENT_PHASE=$(jq -r '.phase // 1' "$STATE_FILE")
CURRENT_STEP=$(jq -r '.step // 1' "$STATE_FILE")
TOTAL_PHASES=$(jq -r '.total_phases // 1' "$STATE_FILE")
COMPLETED_TASKS=$(jq -r '.completed_tasks_count // 0' "$STATE_FILE")
PROJECT_STATUS=$(jq -r '.status // "unknown"' "$STATE_FILE")
LAST_UPDATED=$(jq -r '.last_updated // "unknown"' "$STATE_FILE")

# Get git info
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo 'main')
CURRENT_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo 'unknown')
REPO_URL=$(git remote get-url origin 2>/dev/null || echo "unknown")

# Convert SSH URL to HTTPS for GitHub links
if [[ "$REPO_URL" =~ ^git@github.com:(.+)\.git$ ]]; then
    GITHUB_REPO="https://github.com/${match[1]}"
elif [[ "$REPO_URL" =~ ^https://github.com/(.+)\.git$ ]]; then
    GITHUB_REPO="https://github.com/${match[1]}"
else
    GITHUB_REPO="$REPO_URL"
fi

# Get recent progress (last 10 entries)
RECENT_PROGRESS="$(
  awk '
    BEGIN{inCH=0; count=0}
    /^##[[:space:]]*Change History/{inCH=1; next}
    /^##[[:space:]]+/{if(inCH){inCH=0}}
    { 
        if(inCH) {
            print
            if(/^[[:space:]]*-[[:space:]]*✅/) count++
            if(count >= 10) exit
        }
    }
  ' "$SPEC_FILE" 2>/dev/null || echo "No recent progress found"
)"

# Generate timestamp
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "🚀 CHATGPT HANDOFF PROMPT - COPY EVERYTHING BELOW THIS LINE"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "I'm continuing work on the $PROJECT_NAME project. Please review the latest project state and documentation from GitHub, then help me continue development."
echo ""
echo "## 📊 AUTO-CALCULATED PROJECT STATUS"
echo "- **Project**: $PROJECT_NAME"
echo "- **Phase**: $CURRENT_PHASE of $TOTAL_PHASES (auto-calculated from completion)"
echo "- **Step**: $CURRENT_STEP (current phase progress)"
echo "- **Completed Tasks**: $COMPLETED_TASKS total"
echo "- **Status**: $PROJECT_STATUS"
echo "- **Last Updated**: $LAST_UPDATED"
echo "- **Current Branch**: $CURRENT_BRANCH"
echo "- **Latest Commit**: ${CURRENT_COMMIT:0:8}"
echo ""
echo "## 📚 GITHUB DOCUMENTATION LINKS"
echo "Please review these files from the repository to understand the current state:"
echo ""
echo "### Primary Documentation"
echo "- **Product Specification**: $GITHUB_REPO/blob/$CURRENT_BRANCH/docs/${PROJECT_NAME}-spec.md"
echo "- **User Workflow**: $GITHUB_REPO/blob/$CURRENT_BRANCH/docs/${PROJECT_NAME}-overview.md"
echo "- **GitHub Update**: $GITHUB_REPO/blob/$CURRENT_BRANCH/GITHUB_UPDATE.md"
echo "- **Session Summary**: $GITHUB_REPO/blob/$CURRENT_BRANCH/SESSION_SUMMARY.md"
echo ""
echo "### Build Runner Governance"
echo "- **State File**: $GITHUB_REPO/blob/$CURRENT_BRANCH/.runner/state.json"
echo "- **Governance**: $GITHUB_REPO/blob/$CURRENT_BRANCH/.runner/governance.md"
echo "- **Auggie Instructions**: $GITHUB_REPO/blob/$CURRENT_BRANCH/.runner/auggie-governance.md"
echo ""
echo "### Root Documentation"
echo "- **Product Spec**: $GITHUB_REPO/blob/$CURRENT_BRANCH/PRODUCT_SPEC.md"
echo "- **User Workflow**: $GITHUB_REPO/blob/$CURRENT_BRANCH/USER_WORKFLOW.md"
echo ""
echo "## 🎯 BUILD RUNNER GOVERNANCE REQUIREMENTS"
echo ""
echo "You MUST follow Build Runner governance protocols:"
echo ""
echo "1. **Auto-calculate progress**: Use \`.runner/scripts/auto-calculate-progress.sh\` to update phases/steps based on actual completion"
echo "2. **Update after every task**: Use \`.runner/scripts/update-task-completion.sh \"task description\"\` to add completed work"
echo "3. **Keep documentation synchronized**: Update both root and docs/ files"
echo "4. **Maintain Change History**: Add entries to spec file with date and completed tasks"
echo "5. **Commit frequently**: Don't lose work, commit after each significant task"
echo "6. **Use smart handoff**: Use \`.runner/scripts/smart-handoff.sh\` for session transitions"
echo ""
echo "## 📈 RECENT PROGRESS (Last 10 Completed Tasks)"
echo "$RECENT_PROGRESS"
echo ""
echo "## 🚀 NEXT STEPS"
echo "Based on the auto-calculated progress (Phase $CURRENT_PHASE of $TOTAL_PHASES, $COMPLETED_TASKS tasks completed), please:"
echo ""
echo "1. Review the GitHub documentation links above to understand current state"
echo "2. Identify what needs to be done next based on project status: $PROJECT_STATUS"
echo "3. Follow the governance protocols for any work you do"
echo "4. Use auto-calculation to track real progress, not hardcoded phases"
echo "5. Update documentation and state as you complete tasks"
echo ""
echo "## 💻 LOCAL DEVELOPMENT"
echo "The project is located at: \`$PROJECT_DIR\`"
echo "Key commands:"
echo "- \`br-auggie\` - Sync governance"
echo "- \`.runner/scripts/smart-handoff.sh\` - Generate this handoff"
echo "- \`.runner/scripts/auto-calculate-progress.sh\` - Recalculate progress"
echo ""
echo "Please confirm you've reviewed the GitHub documentation and are ready to continue with auto-calculated progress tracking."
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "🚀 END OF CHATGPT PROMPT - COPY EVERYTHING ABOVE THIS LINE"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "[smart-handoff] ✅ Generated at: $TIMESTAMP"
echo "[smart-handoff] 📊 Auto-calculated: Phase $CURRENT_PHASE of $TOTAL_PHASES"
echo "[smart-handoff] 📈 Completed tasks: $COMPLETED_TASKS"
echo "[smart-handoff] 🎯 Status: $PROJECT_STATUS"

# Save to file
HANDOFF_FILE="$PROJECT_DIR/docs/smart-handoff-${TIMESTAMP}.md"
cat > "$HANDOFF_FILE" << EOF
# Smart Handoff: $PROJECT_NAME

Generated: $TIMESTAMP
Auto-calculated Progress: Phase $CURRENT_PHASE of $TOTAL_PHASES
Completed Tasks: $COMPLETED_TASKS
Status: $PROJECT_STATUS

## ChatGPT Prompt

I'm continuing work on the $PROJECT_NAME project. Please review the latest project state and documentation from GitHub, then help me continue development.

## 📊 AUTO-CALCULATED PROJECT STATUS
- **Project**: $PROJECT_NAME
- **Phase**: $CURRENT_PHASE of $TOTAL_PHASES (auto-calculated from completion)
- **Step**: $CURRENT_STEP (current phase progress)
- **Completed Tasks**: $COMPLETED_TASKS total
- **Status**: $PROJECT_STATUS
- **Last Updated**: $LAST_UPDATED
- **Current Branch**: $CURRENT_BRANCH
- **Latest Commit**: ${CURRENT_COMMIT:0:8}

## 📚 GITHUB DOCUMENTATION LINKS
Please review these files from the repository to understand the current state:

### Primary Documentation
- **Product Specification**: $GITHUB_REPO/blob/$CURRENT_BRANCH/docs/${PROJECT_NAME}-spec.md
- **User Workflow**: $GITHUB_REPO/blob/$CURRENT_BRANCH/docs/${PROJECT_NAME}-overview.md
- **GitHub Update**: $GITHUB_REPO/blob/$CURRENT_BRANCH/GITHUB_UPDATE.md
- **Session Summary**: $GITHUB_REPO/blob/$CURRENT_BRANCH/SESSION_SUMMARY.md

### Build Runner Governance
- **State File**: $GITHUB_REPO/blob/$CURRENT_BRANCH/.runner/state.json
- **Governance**: $GITHUB_REPO/blob/$CURRENT_BRANCH/.runner/governance.md
- **Auggie Instructions**: $GITHUB_REPO/blob/$CURRENT_BRANCH/.runner/auggie-governance.md

### Root Documentation
- **Product Spec**: $GITHUB_REPO/blob/$CURRENT_BRANCH/PRODUCT_SPEC.md
- **User Workflow**: $GITHUB_REPO/blob/$CURRENT_BRANCH/USER_WORKFLOW.md

## 🎯 BUILD RUNNER GOVERNANCE REQUIREMENTS

You MUST follow Build Runner governance protocols:

1. **Auto-calculate progress**: Use \`.runner/scripts/auto-calculate-progress.sh\` to update phases/steps based on actual completion
2. **Update after every task**: Use \`.runner/scripts/update-task-completion.sh "task description"\` to add completed work
3. **Keep documentation synchronized**: Update both root and docs/ files
4. **Maintain Change History**: Add entries to spec file with date and completed tasks
5. **Commit frequently**: Don't lose work, commit after each significant task
6. **Use smart handoff**: Use \`.runner/scripts/smart-handoff.sh\` for session transitions

## 📈 RECENT PROGRESS (Last 10 Completed Tasks)
$RECENT_PROGRESS

## 🚀 NEXT STEPS
Based on the auto-calculated progress (Phase $CURRENT_PHASE of $TOTAL_PHASES, $COMPLETED_TASKS tasks completed), please:

1. Review the GitHub documentation links above to understand current state
2. Identify what needs to be done next based on project status: $PROJECT_STATUS
3. Follow the governance protocols for any work you do
4. Use auto-calculation to track real progress, not hardcoded phases
5. Update documentation and state as you complete tasks

## 💻 LOCAL DEVELOPMENT
The project is located at: \`$PROJECT_DIR\`
Key commands:
- \`br-auggie\` - Sync governance
- \`.runner/scripts/smart-handoff.sh\` - Generate this handoff
- \`.runner/scripts/auto-calculate-progress.sh\` - Recalculate progress

Please confirm you've reviewed the GitHub documentation and are ready to continue with auto-calculated progress tracking.
EOF

echo "[smart-handoff] 💾 Saved to: $HANDOFF_FILE"
