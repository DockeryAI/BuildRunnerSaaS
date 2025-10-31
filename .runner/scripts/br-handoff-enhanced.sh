#!/bin/zsh
# br-handoff-enhanced — Enhanced handoff with ChatGPT prompt and GitHub links
# Usage: br-handoff-enhanced [project_slug] [--lines N] [--no-save]

set -eu
set -o pipefail

slug="${1:-$(basename "$PWD")}"
[[ $# -gt 0 ]] && shift || true
lines=50
save=1
while (( $# )); do
  case "$1" in
    --lines) lines="${2:-50}"; shift 2;;
    --no-save) save=0; shift;;
    *) echo "Unknown arg: $1" >&2; exit 2;;
  esac
done

proj_root="$PWD"
spec="$proj_root/docs/${slug}-spec.md"
hrpo="$proj_root/docs/${slug}-overview.md"
state="$proj_root/.runner/state.json"

phase="$(jq -r '.phase // .current_phase // "?"' "$state" 2>/dev/null || echo '?')"
step="$(jq -r '.step // .current_step // "?"' "$state" 2>/dev/null || echo '?')"
total_phases="$(jq -r '.total_phases // 25' "$state" 2>/dev/null || echo '25')"
steps_in_phase="$(jq -r '.total_steps_in_current_phase // .phase_steps // "?"' "$state" 2>/dev/null || echo '?')"
last_updated="$(jq -r '.last_updated // "?"' "$state" 2>/dev/null || echo '?')"
ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

# Get GitHub repository URL
repo_url=$(git -C "$proj_root" remote get-url origin 2>/dev/null || echo "unknown")
current_branch=$(git -C "$proj_root" branch --show-current 2>/dev/null || echo 'main')
current_commit=$(git -C "$proj_root" rev-parse HEAD 2>/dev/null || echo 'unknown')

# Convert SSH URL to HTTPS for GitHub links
if [[ "$repo_url" =~ ^git@github.com:(.+)\.git$ ]]; then
    github_repo="https://github.com/${match[1]}"
elif [[ "$repo_url" =~ ^https://github.com/(.+)\.git$ ]]; then
    github_repo="https://github.com/${match[1]}"
else
    github_repo="$repo_url"
fi

# Extract Change History section (last N lines)
change_hist="$(
  awk '
    BEGIN{inCH=0}
    /^##[[:space:]]*Change History/{inCH=1; next}
    /^##[[:space:]]+/{if(inCH){inCH=0}}
    { if(inCH) print }
  ' "$spec" 2>/dev/null | tail -n "$lines"
)"

# Get current features from state
features="$(jq -r '.features // {} | to_entries[] | "- ✅ \(.key): \(.value)"' "$state" 2>/dev/null || echo '- No features tracked')"

handoff_file="$proj_root/docs/handoff-${ts}.md"

echo "# 🚀 ChatGPT Handoff: $slug Project Continuation"
echo ""
echo "## 📋 COPY THIS ENTIRE PROMPT TO CHATGPT"
echo ""
echo "\`\`\`"
echo "I'm continuing work on the $slug project. Please review the latest project state and documentation from GitHub, then help me continue development following Build Runner governance."
echo ""
echo "## 📊 Current Project Status"
echo "- **Project**: $slug"
echo "- **Phase**: $phase of $total_phases"
echo "- **Step**: $step of $steps_in_phase"
echo "- **Status**: $(jq -r '.status // "active"' "$state" 2>/dev/null || echo 'active')"
echo "- **Last Updated**: $last_updated"
echo "- **Current Branch**: $current_branch"
echo "- **Latest Commit**: ${current_commit:0:8}"
echo ""
echo "## 📚 GitHub Documentation Links"
echo "Please review these files from the repository to understand the current state:"
echo ""
echo "### Primary Documentation"
echo "- **Product Specification**: $github_repo/blob/$current_branch/docs/${slug}-spec.md"
echo "- **User Workflow**: $github_repo/blob/$current_branch/docs/${slug}-overview.md"
echo "- **GitHub Update**: $github_repo/blob/$current_branch/GITHUB_UPDATE.md"
echo "- **Session Summary**: $github_repo/blob/$current_branch/SESSION_SUMMARY.md"
echo ""
echo "### Build Runner Governance"
echo "- **State File**: $github_repo/blob/$current_branch/.runner/state.json"
echo "- **Governance**: $github_repo/blob/$current_branch/.runner/governance.md"
echo "- **Auggie Instructions**: $github_repo/blob/$current_branch/.runner/auggie-governance.md"
echo ""
echo "### Root Documentation"
echo "- **Product Spec**: $github_repo/blob/$current_branch/PRODUCT_SPEC.md"
echo "- **User Workflow**: $github_repo/blob/$current_branch/USER_WORKFLOW.md"
echo ""
echo "## 🎯 Build Runner Governance Requirements"
echo ""
echo "You MUST follow Build Runner governance protocols:"
echo ""
echo "1. **Update state after every task**: Use \`.runner/scripts/update-task-completion.sh \"task description\" [step_increment]\`"
echo "2. **Keep documentation synchronized**: Update both root and docs/ files"
echo "3. **Maintain Change History**: Add entries to spec file with date, phase, step"
echo "4. **Commit frequently**: Don't lose work, commit after each significant task"
echo "5. **Use br-handoff**: Generate handoff docs for session transitions"
echo ""
echo "## 📈 Recent Progress (Last Changes)"
echo "${change_hist:-<no change history>}"
echo ""
echo "## 🔧 Current Features Status"
echo "$features"
echo ""
echo "## 🚀 Next Steps"
echo "Based on the current phase ($phase of $total_phases, step $step of $steps_in_phase), please:"
echo ""
echo "1. Review the GitHub documentation links above to understand current state"
echo "2. Check what needs to be done next according to the Build Runner phases"
echo "3. Follow the governance protocols for any work you do"
echo "4. Update documentation and state as you complete tasks"
echo ""
echo "## 💻 Local Development"
echo "The project is located at: \`~/projects/$slug\`"
echo "You can run: \`br-auggie\` to sync governance before starting work."
echo ""
echo "Please confirm you've reviewed the GitHub documentation and are ready to continue with Build Runner governance protocols."
echo "\`\`\`"
echo ""
echo "---"
echo ""
echo "**Generated**: $ts UTC"
echo "**Build Runner Progress**: Phase $phase of $total_phases - Step $step of $steps_in_phase"

# Also save to file if requested
if [[ $save -eq 1 ]]; then
    mkdir -p "$proj_root/docs"
    cat > "$handoff_file" << EOF
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
- **Current Branch**: $current_branch
- **Latest Commit**: ${current_commit:0:8}

## 📚 GitHub Documentation Links
Please review these files from the repository to understand the current state:

### Primary Documentation
- **Product Specification**: $github_repo/blob/$current_branch/docs/${slug}-spec.md
- **User Workflow**: $github_repo/blob/$current_branch/docs/${slug}-overview.md
- **GitHub Update**: $github_repo/blob/$current_branch/GITHUB_UPDATE.md
- **Session Summary**: $github_repo/blob/$current_branch/SESSION_SUMMARY.md

### Build Runner Governance
- **State File**: $github_repo/blob/$current_branch/.runner/state.json
- **Governance**: $github_repo/blob/$current_branch/.runner/governance.md
- **Auggie Instructions**: $github_repo/blob/$current_branch/.runner/auggie-governance.md

### Root Documentation
- **Product Spec**: $github_repo/blob/$current_branch/PRODUCT_SPEC.md
- **User Workflow**: $github_repo/blob/$current_branch/USER_WORKFLOW.md

## 🎯 Build Runner Governance Requirements

You MUST follow Build Runner governance protocols:

1. **Update state after every task**: Use \`.runner/scripts/update-task-completion.sh "task description" [step_increment]\`
2. **Keep documentation synchronized**: Update both root and docs/ files
3. **Maintain Change History**: Add entries to spec file with date, phase, step
4. **Commit frequently**: Don't lose work, commit after each significant task
5. **Use br-handoff**: Generate handoff docs for session transitions

## 📈 Recent Progress (Last Changes)
${change_hist:-<no change history>}

## 🔧 Current Features Status
$features

## 🚀 Next Steps
Based on the current phase ($phase of $total_phases, step $step of $steps_in_phase), please:

1. Review the GitHub documentation links above to understand current state
2. Check what needs to be done next according to the Build Runner phases
3. Follow the governance protocols for any work you do
4. Update documentation and state as you complete tasks

## 💻 Local Development
The project is located at: \`~/projects/$slug\`
You can run: \`br-auggie\` to sync governance before starting work.

Please confirm you've reviewed the GitHub documentation and are ready to continue with Build Runner governance protocols.
\`\`\`

---

**Generated**: $ts UTC
**Build Runner Progress**: Phase $phase of $total_phases - Step $step of $steps_in_phase
EOF
    echo ""
    echo "↳ Saved handoff to $handoff_file"
fi
