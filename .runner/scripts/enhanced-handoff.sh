#!/bin/zsh
# enhanced-handoff.sh — Generate comprehensive handoff with GitHub links and ChatGPT prompt
# Usage: enhanced-handoff.sh [project_slug]

set -euo pipefail

PROJECT_DIR="$PWD"
PROJECT_NAME="$(basename "$PROJECT_DIR")"
slug="${1:-$PROJECT_NAME}"

# Get project info
state="$PROJECT_DIR/.runner/state.json"
spec="$PROJECT_DIR/docs/${slug}-spec.md"
hrpo="$PROJECT_DIR/docs/${slug}-overview.md"

# Get git info
REPO_URL=$(git remote get-url origin 2>/dev/null || echo "unknown")
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo 'main')
CURRENT_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo 'unknown')

# Convert SSH URL to HTTPS for GitHub links
if [[ "$REPO_URL" =~ ^git@github.com:(.+)\.git$ ]]; then
    GITHUB_REPO="https://github.com/${match[1]}"
elif [[ "$REPO_URL" =~ ^https://github.com/(.+)\.git$ ]]; then
    GITHUB_REPO="https://github.com/${match[1]}"
else
    GITHUB_REPO="$REPO_URL"
fi

# Get state info
phase="$(jq -r '.phase // 1' "$state" 2>/dev/null || echo '1')"
step="$(jq -r '.step // 1' "$state" 2>/dev/null || echo '1')"
total_phases="$(jq -r '.total_phases // 6' "$state" 2>/dev/null || echo '6')"
steps_in_phase="$(jq -r '.total_steps_in_current_phase // 10' "$state" 2>/dev/null || echo '10')"
last_updated="$(jq -r '.last_updated // "unknown"' "$state" 2>/dev/null || echo 'unknown')"
ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

# Extract Change History section (last 50 lines for comprehensive context)
change_hist="$(
  awk '
    BEGIN{inCH=0}
    /^##[[:space:]]*Change History/{inCH=1; next}
    /^##[[:space:]]+/{if(inCH){inCH=0}}
    { if(inCH) print }
  ' "$spec" 2>/dev/null | tail -n 50
)"

# Get current features from state
features="$(jq -r '.features // {} | to_entries[] | "- ✅ \(.key): \(.value)"' "$state" 2>/dev/null || echo '- No features tracked')"

handoff_file="$PROJECT_DIR/docs/handoff-${ts}.md"

# Build comprehensive handoff document
cat <<HANDOFF | tee "$handoff_file"
# 🚀 ChatGPT Handoff: $slug Project Continuation

## 📋 COPY THIS ENTIRE PROMPT TO CHATGPT

\`\`\`
I'm continuing work on the $slug project. Please review the latest project state and documentation from GitHub, then help me continue development following Build Runner governance.

## 📊 Current Project Status
- **Project**: $slug
- **Phase**: $phase of $total_phases
- **Step**: $step of $steps_in_phase
- **Status**: $(jq -r '.status // "active"' "$state" 2>/dev/null || echo 'active')
- **Last Updated**: $last_updated
- **Current Branch**: $CURRENT_BRANCH
- **Latest Commit**: ${CURRENT_COMMIT:0:8}

## 📚 GitHub Documentation Links
Please review these files from the repository to understand the current state:

### Primary Documentation
- **Product Specification**: $GITHUB_REPO/blob/$CURRENT_BRANCH/docs/${slug}-spec.md
- **User Workflow**: $GITHUB_REPO/blob/$CURRENT_BRANCH/docs/${slug}-overview.md
- **GitHub Update**: $GITHUB_REPO/blob/$CURRENT_BRANCH/GITHUB_UPDATE.md
- **Session Summary**: $GITHUB_REPO/blob/$CURRENT_BRANCH/SESSION_SUMMARY.md

### Build Runner Governance
- **State File**: $GITHUB_REPO/blob/$CURRENT_BRANCH/.runner/state.json
- **Governance**: $GITHUB_REPO/blob/$CURRENT_BRANCH/.runner/governance.md
- **Auggie Instructions**: $GITHUB_REPO/blob/$CURRENT_BRANCH/.runner/auggie-governance.md

### Root Documentation
- **Product Spec**: $GITHUB_REPO/blob/$CURRENT_BRANCH/PRODUCT_SPEC.md
- **User Workflow**: $GITHUB_REPO/blob/$CURRENT_BRANCH/USER_WORKFLOW.md

## 🎯 Build Runner Governance Requirements

You MUST follow Build Runner governance protocols:

1. **Update state after every task**: Use \`.runner/scripts/update-task-completion.sh "task description" [step_increment]\`
2. **Keep documentation synchronized**: Update both root and docs/ files
3. **Maintain Change History**: Add entries to spec file with date, phase, step
4. **Commit frequently**: Don't lose work, commit after each significant task
5. **Use br-handoff**: Generate handoff docs for session transitions

## 📈 Recent Progress (Last Changes)
$change_hist

## 🔧 Current Features Status
$features

## 🚀 Next Steps
Based on the current phase ($phase of $total_phases, step $step of $steps_in_phase), please:

1. Review the GitHub documentation links above to understand current state
2. Check what needs to be done next according to the Build Runner phases
3. Follow the governance protocols for any work you do
4. Update documentation and state as you complete tasks

## 💻 Local Development
The project is located at: \`~/Projects/$slug\`
You can run: \`br-auggie\` to sync governance before starting work.

Please confirm you've reviewed the GitHub documentation and are ready to continue with Build Runner governance protocols.
\`\`\`

## 📋 Local Context (for reference)

**Working Directory**: $PROJECT_DIR
**Repository**: $GITHUB_REPO
**Branch**: $CURRENT_BRANCH
**Commit**: $CURRENT_COMMIT

**Local Files**:
- Spec: $spec
- Overview: $hrpo
- State: $state

**Quick Commands**:
- \`br-auggie\` - Sync governance
- \`br-handoff $slug\` - Generate handoff
- \`git status\` - Check changes
- \`git log --oneline -10\` - Recent commits

---

**Generated**: $ts UTC
**Handoff File**: $handoff_file
HANDOFF

echo ""
echo "🎉 Enhanced handoff generated!"
echo "📋 Handoff file: $handoff_file"
echo "📋 Copy the ChatGPT prompt section above to continue work in a new thread"
echo "🔗 GitHub Repository: $GITHUB_REPO"
echo ""
echo "✅ The ChatGPT prompt includes direct GitHub links to all current documentation"
echo "✅ New AI session will have complete context and governance protocols"
