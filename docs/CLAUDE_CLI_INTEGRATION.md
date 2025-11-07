# Claude CLI Integration - Implementation Plan

**Status:** In Progress
**Priority:** Critical
**Version:** 1.2.0
**Last Updated:** 2025-11-06

---

## Overview

This document describes the integration between BuildRunnerSaaS UI and Claude CLI to create a hybrid system where:
- **BuildRunnerSaaS UI** = Visual PRD builder and project planning interface
- **Claude CLI** = Autonomous code generator that watches PRD and builds projects
- **Self-Healing System** = Automatic error detection, bug tracking, and feature request management

---

## Architecture

```
BuildRunnerSaaS UI (web app)
    ↓ exports PRD.md
Projects Directory (watched by daemon)
    ↓ detects changes
Claude CLI Daemon
    ↓ builds code
Generated Project (with preview)
    ↓ errors & chat messages
Self-Healing System
    ↓ updates
PRD.md (features) & BUGS.md (bugs)
    ↓ triggers rebuild
Claude CLI Daemon (loop)
```

---

## Component 1: Global PRD Watcher Daemon

### Purpose
Single daemon that watches all project directories for PRD.md changes and automatically triggers Claude CLI builds.

### File Structure
```
~/.claude-builder/
├── daemon.js              # Main daemon process
├── config.json            # Configuration (projects root, etc.)
├── daemon.pid             # Process ID for management
└── logs/                  # Daemon logs
    └── daemon.log

/Users/byronhudson/Projects/BuildRunnerProjects/
├── Project1/
│   ├── PRD.md            # Watched by daemon
│   ├── BUILD_STATUS.md   # Written by Claude
│   └── src/              # Generated code
└── Project2/
    ├── PRD.md
    └── ...
```

### Features
- Watches a designated projects root directory
- Auto-detects new project directories
- Spawns PRD watchers for each project
- Debounces file changes (2 second delay)
- Hash-based change detection (no false triggers)
- Build locking (prevents concurrent builds)
- Logs all activity

### Setup Workflow
```bash
# One-time install
npm install -g @buildrunner/claude-daemon

# Start daemon (stays running)
claude-builder start-daemon

# Daemon now watches all projects automatically
# User just uses BuildRunnerSaaS UI
```

### Daemon Commands
```bash
claude-builder start-daemon    # Start watching
claude-builder stop-daemon     # Stop watching
claude-builder status          # Check if running
claude-builder logs            # View logs
claude-builder list-projects   # Show all watched projects
```

---

## Component 2: BuildRunnerSaaS UI Integration

### PRD Export
When user builds or modifies PRD in UI, automatically export to project directory.

**Location:** `apps/web/lib/prd-export.ts`

**New Function:**
```typescript
exportToClaudeProject(prdData: PRDData, projectName: string): void
```

**Behavior:**
- Exports PRD.md to `/Users/byronhudson/Projects/BuildRunnerProjects/{projectName}/PRD.md`
- Daemon auto-detects and triggers Claude build
- No manual CLI interaction needed

### Status Monitor
UI reads BUILD_STATUS.md from project directory to show real-time progress.

**Location:** `apps/web/components/BuildStatusMonitor.tsx`

**Features:**
- Polls BUILD_STATUS.md every 2 seconds
- Shows progress bars per feature
- Displays component completion status
- Shows current build phase
- Error notifications

### Preview Integration
Add new "Live Preview" tab that shows the built project with error collector and chat widget.

**Location:** `apps/web/app/(app)/preview/page.tsx`

---

## Component 3: Self-Healing System

### Error Collector
Injected into every preview app to capture errors automatically.

**File:** `.claude-builder/error-collector.js`

**Captures:**
- console.error logs
- Uncaught exceptions
- Unhandled promise rejections
- React errors
- Full context (page, component, user state, form data, chat history, DOM snapshot)

**Sends to:** WebSocket server (command router) at `ws://localhost:8765/errors`

### Contextual Chat Widget
Floating chat interface in preview that knows full context.

**File:** `.claude-builder/chat-widget.js`

**Features:**
- Always visible in bottom-right corner
- Shows current context (page, component)
- Observes navigation and component changes
- Captures visible elements in viewport
- Sends messages with full context to command router

**User Commands:**
- "This button doesn't work" → Bug report
- "Add dark mode" → Feature request
- "The chart isn't loading" → Bug report with auto-captured error

### Command Router (The Brain)
Receives errors and chat messages, intelligently routes them.

**File:** `.claude-builder/command-router.js`

**WebSocket Server:** Port 8765

**Routing Logic:**

**For Errors:**
1. Categorize error type (import, null reference, API, React, etc.)
2. Attempt simple auto-fix OR
3. Add to BUGS.md with full context

**For Chat Messages:**
1. Call Claude to classify intent
2. If FEATURE_REQUEST → Add to PRD.md
3. If BUG_REPORT → Add to BUGS.md
4. If QUESTION → Answer with context

### File Artifacts

**PRD.md** - Source of truth for features
- Written by BuildRunnerSaaS UI
- Read by Claude daemon
- Feature requests from chat auto-append here
- Changes trigger automatic rebuilds

**BUGS.md** - Bug tracker (best practices)
```markdown
# Bug Tracker

## Open (count)
### BUG-{timestamp} - {PRIORITY}
{description}
**Context:** {page, component}
**Created:** {timestamp}

## In Progress (count)
### BUG-{timestamp} - {PRIORITY}
{description}
**Status:** Attempting fix...

## Fixed (count)
### BUG-{timestamp} - {PRIORITY}
{description}
**Fixed:** {timestamp}
**Fix:** {explanation}
```

**BUILD_STATUS.md** - Real-time build progress
```markdown
# Build Status
**Progress:** 75%
**Status:** Building

## Phase 1: Authentication ✅
- [x] User model
- [x] Login endpoints
- [x] Protected routes

## Phase 2: Dashboard 🚧
- [x] Dashboard page
- [ ] Charts (building...)
```

**CHANGELOG.md** - All fixes logged
```markdown
# Changelog

## BUG-{id} - {timestamp}
**Bug:** {description}
**Fix:** {what was changed}
**Files changed:** {list}
**Test results:** {passed/failed}
```

---

## Implementation Phases

### Phase 1: Daemon + PRD Watching (Week 1)
**Deliverables:**
- [x] Global daemon that watches projects directory
- [x] PRD.md watcher with debouncing and hash-based change detection
- [x] Build trigger integration with Claude CLI
- [x] Daemon management commands (start/stop/status)
- [x] UI PRD export to project directory
- [x] BUILD_STATUS.md generation by Claude

**Success Criteria:**
- User edits PRD in UI → auto-exports
- Daemon detects change within 2 seconds
- Claude CLI builds project automatically
- UI shows build progress in real-time

**Timeline:** 3-4 days

---

### Phase 2: Error Collector + Chat Widget (Week 2)
**Deliverables:**
- [x] Error collector script injection
- [x] WebSocket server (command router)
- [x] Contextual chat widget
- [x] Context detection (page, component, visible elements)
- [x] BUGS.md and CHANGELOG.md generation

**Success Criteria:**
- Errors captured automatically (no copy-paste)
- Chat widget appears in preview
- Chat knows current context accurately
- Errors sent to command router with full context

**Timeline:** 4-5 days

---

### Phase 3: Command Router + Smart Categorization (Week 2-3)
**Deliverables:**
- [x] Intent classification using Claude
- [x] Feature request routing to PRD.md
- [x] Bug report routing to BUGS.md
- [x] Error categorization (import, null ref, API, React)
- [x] Simple auto-fix attempts (optional - if time allows)

**Success Criteria:**
- Feature requests automatically added to PRD.md
- Bugs automatically logged in BUGS.md with priority
- PRD changes trigger rebuilds
- 90%+ accurate intent classification

**Timeline:** 3-4 days

---

### Phase 4: UI Integration + Preview Tab (Week 3-4)
**Deliverables:**
- [x] BuildStatusMonitor component in UI
- [x] Live preview tab with error collector + chat
- [x] Real-time bug queue display in UI
- [x] Feature request approval flow in UI
- [x] Visual dependency graph

**Success Criteria:**
- UI shows real-time build progress
- Preview tab displays working app with chat
- Bugs visible in UI dashboard
- Full end-to-end workflow functional

**Timeline:** 4-5 days

---

## Total Timeline: 2-3 Weeks

---

## User Workflows

### Workflow 1: New Project from Scratch
```
1. User opens BuildRunnerSaaS UI
2. User brainstorms and builds PRD visually
3. User clicks "Start Building"
4. UI exports PRD.md to /BuildRunnerProjects/MyProject/
5. Daemon detects new project
6. Claude reads PRD, builds project autonomously
7. UI shows progress in real-time
8. User clicks "Preview" to see working app
9. Chat widget appears in preview
10. User can report bugs or request features via chat
```

### Workflow 2: Error Happens in Preview
```
1. User testing preview, clicks button
2. Error occurs: "Cannot read property 'map' of undefined"
3. Error collector captures error + full context
4. Sends to command router via WebSocket
5. Router categorizes: NULL_REFERENCE in Dashboard/ChartComponent
6. Attempts simple fix OR adds to BUGS.md
7. If added to BUGS.md:
   - Logs: BUG-12345 - HIGH - Dashboard chart not rendering
   - User sees in UI bug dashboard
   - Can manually trigger fix or wait for Phase 5 (auto-fix worker)
```

### Workflow 3: Feature Request via Chat
```
1. User in preview on Settings page
2. Types in chat: "Add dark mode toggle"
3. Chat sends message + context to router
4. Router calls Claude: "Classify intent"
5. Claude responds: FEATURE_REQUEST - medium priority
6. Router adds to PRD.md:
   ### Dark Mode Toggle
   **Context:** Settings page
   **Priority:** medium
   Add theme toggle to settings panel
7. Daemon detects PRD.md changed
8. Claude builds dark mode feature
9. UI shows progress
10. User refreshes preview, sees dark mode toggle
```

### Workflow 4: Modifying Existing Feature
```
1. User edits PRD in UI
2. Changes "Authentication" → add OAuth support
3. UI exports updated PRD.md
4. Daemon detects change
5. Claude diffs: "OAuth added to Authentication feature"
6. Claude identifies affected components:
   - Login page needs OAuth button
   - Auth middleware needs OAuth handler
   - Database needs OAuth provider field
7. Claude rebuilds only affected components
8. UI shows incremental progress
9. Preview updates with OAuth login
```

---

## Technical Details

### Daemon Process Management
```javascript
// Start daemon as detached process
const daemon = spawn('node', ['daemon.js'], {
  detached: true,
  stdio: 'ignore'
});
daemon.unref();

// Save PID for later management
fs.writeFileSync('~/.claude-builder/daemon.pid', daemon.pid);
```

### WebSocket Communication
```javascript
// Client (error collector / chat widget)
const ws = new WebSocket('ws://localhost:8765');
ws.send(JSON.stringify({
  type: 'ERROR' | 'CHAT',
  data: { ... },
  context: { ... }
}));

// Server (command router)
wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    const message = JSON.parse(data);
    if (message.type === 'ERROR') handleError(message);
    if (message.type === 'CHAT') handleChat(message);
  });
});
```

### PRD Change Detection
```javascript
// Hash-based comparison
const currentHash = crypto.createHash('md5')
  .update(fs.readFileSync('PRD.md', 'utf8'))
  .digest('hex');

if (currentHash !== lastHash) {
  // Real change detected
  triggerClaudeBuild();
  lastHash = currentHash;
}
```

### Intent Classification
```javascript
// Call Claude API to classify user message
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4',
  messages: [{
    role: 'user',
    content: `
Classify this message from a user in a preview app:
"${userMessage}"

Context: ${JSON.stringify(context)}

Return JSON:
{
  "type": "FEATURE_REQUEST" | "BUG_REPORT" | "QUESTION",
  "priority": "high" | "medium" | "low",
  "description": "extracted description",
  "affected_component": "component name"
}
    `
  }]
});

const classification = JSON.parse(response.content);
```

---

## Success Metrics

### Phase 1 Success:
- ✅ PRD changes detected within 2 seconds
- ✅ Builds trigger automatically 100% of time
- ✅ UI shows progress accurately
- ✅ Zero manual CLI commands needed

### Phase 2 Success:
- ✅ 100% of errors captured (no copy-paste needed)
- ✅ Chat widget knows context 95%+ accuracy
- ✅ WebSocket communication <100ms latency

### Phase 3 Success:
- ✅ 90%+ accurate intent classification
- ✅ Feature requests added to PRD automatically
- ✅ Bugs logged with full context
- ✅ PRD changes trigger builds

### Phase 4 Success:
- ✅ UI displays real-time build status
- ✅ Preview tab works with chat + error collector
- ✅ End-to-end workflow smooth
- ✅ User never touches CLI

---

## Future Enhancements (Phase 5+)

### Auto-Fix Worker
- Automatically fixes bugs from queue
- Tests fixes before committing
- Learns from successful fixes
- Expected: 80-90% success rate on simple bugs

### Cross-Project Learning
- Learn patterns across all projects
- Suggest features based on similar projects
- Improve fix success rate over time

### Advanced Context Awareness
- Screen recording of user actions before error
- Visual regression detection
- Network request interception
- Performance monitoring

---

## Risk Mitigation

### Daemon Crashes
- Auto-restart on failure
- Log all crashes for debugging
- Health check endpoint

### WebSocket Connection Loss
- Auto-reconnect with exponential backoff
- Queue messages while disconnected
- Show connection status in chat widget

### Build Failures
- Rollback mechanism
- Save snapshots before builds
- Clear error messages in BUILD_STATUS.md

### False Classifications
- User can override in UI
- Learn from corrections
- Confidence scores on classifications

---

## Dependencies

**Required:**
- Node.js 20+
- chokidar (file watching)
- ws (WebSocket server)
- @anthropic-ai/sdk (Claude API)

**Optional:**
- html2canvas (screenshot capture)
- React DevTools API (component detection)

---

## File Locations

**Daemon:**
- `~/.claude-builder/daemon.js`
- `~/.claude-builder/command-router.js`
- `~/.claude-builder/config.json`

**Templates (copied to projects):**
- `~/.claude-builder/templates/error-collector.js`
- `~/.claude-builder/templates/chat-widget.js`

**BuildRunnerSaaS UI Changes:**
- `apps/web/lib/prd-export.ts` (add exportToClaudeProject)
- `apps/web/components/BuildStatusMonitor.tsx` (new)
- `apps/web/app/(app)/preview/page.tsx` (new tab)

**Generated in Each Project:**
- `PRD.md` (from UI)
- `BUGS.md` (from command router)
- `BUILD_STATUS.md` (from Claude CLI)
- `CHANGELOG.md` (from command router)
- `ARCHITECTURE.md` (from Claude CLI)

---

## Getting Started (For New Claude Instances)

When a new Claude Code session starts and sees this project:

1. **Read this document first** to understand the full architecture
2. **Check `.buildrunner/features.json`** for implementation status
3. **Check git log** for recent changes
4. **Current phase** is documented in features.json status
5. **Next steps** are in the "planned" section of features.json

**If user says "continue building":**
- Check which phase is marked "in_progress"
- Read the relevant code files
- Continue from where the last session left off
- Update BUILD_STATUS.md as you work
- Commit when phase is complete

---

## Questions & Answers

**Q: Does the daemon need to run on the same machine as the UI?**
A: Yes, for now. Future versions could support remote daemons.

**Q: What if user has multiple BuildRunnerSaaS instances?**
A: Daemon watches a single projects directory. All UI instances export to same location.

**Q: Can user manually edit PRD.md?**
A: Yes! Daemon watches the file regardless of how it's edited.

**Q: What happens if Claude CLI isn't installed?**
A: Daemon will log error and skip that project. User needs Claude CLI installed.

**Q: How are secrets handled?**
A: Claude CLI uses user's existing API keys. No secrets in daemon.

**Q: Can this work offline?**
A: No, requires Claude API access for intent classification and building.

---

**Document Version:** 1.0.0
**Author:** Roy (burnt-out sysadmin who's actually impressed by this architecture)
**Status:** Ready to build
