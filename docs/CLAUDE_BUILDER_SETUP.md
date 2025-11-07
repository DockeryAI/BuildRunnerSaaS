# Claude Builder Setup & Usage Guide

**Version:** 1.0.0
**Last Updated:** 2025-11-06
**Status:** Ready to Use

---

## Quick Start (5 Minutes)

### Step 1: Start the Daemon (One Time Setup)

```bash
# Navigate to the Claude Builder directory
cd ~/.claude-builder

# Start the daemon (it will run in the background)
node cli.js start-daemon
```

**Expected Output:**
```
🚀 Starting Claude Builder Daemon...

✅ Daemon started successfully (PID: 12345)

📂 Watching: /Users/byronhudson/Projects/BuildRunnerProjects
🔌 WebSocket: ws://localhost:8765

Commands:
  claude-builder status       - Check status
  claude-builder logs         - View logs
  claude-builder stop-daemon  - Stop daemon
```

### Step 2: Use the BuildRunnerSaaS UI

1. Open BuildRunnerSaaS: `http://localhost:3000`
2. Create/edit your PRD using the visual interface
3. Click **"Export PRD"** button
4. Select **"🤖 Export to Claude Builder"**
5. Watch the build happen automatically!

**That's it!** The daemon detects the PRD, triggers Claude to build, and you can monitor progress.

---

## What Just Happened?

```
You (BuildRunnerSaaS UI)
   ↓ clicks "Export to Claude Builder"

PRD.md written to:
   ~/Projects/BuildRunnerProjects/YourProject/PRD.md

Daemon detects change (within 2 seconds)
   ↓

Claude CLI spawned automatically
   "PRD.md changed, sync the build"
   ↓

Claude reads PRD, builds your project
   ↓

BUILD_STATUS.md updated with progress
   ↓

UI polls BUILD_STATUS.md (every 2 seconds)
   ↓

You see real-time progress!
```

---

## Full Features

### 1. Automatic Build Triggering

When you export a PRD from the UI:
- ✅ PRD.md is written to `~/Projects/BuildRunnerProjects/{ProjectName}/`
- ✅ Daemon detects the change within 2 seconds
- ✅ Claude CLI is spawned automatically
- ✅ Build progress is tracked in BUILD_STATUS.md
- ✅ UI shows real-time progress

### 2. Build Status Monitoring

The UI shows:
- Current build status (Starting, Building, Completed, Failed)
- Progress percentage (0-100%)
- Last update timestamp
- Full status details (expandable)
- Auto-refresh every 2 seconds

### 3. Error Collection (Coming in Preview)

When errors occur in your preview app:
- Browser errors captured automatically
- Sent to command router via WebSocket
- Logged to BUGS.md with full context
- No more copy-pasting console logs!

### 4. Chat Widget (Coming in Preview)

Floating chat in preview apps:
- Report bugs: "The login button doesn't work"
- Request features: "Add dark mode"
- Get help: "How do I use this?"
- Auto-routed to PRD.md or BUGS.md

---

## Daemon Commands

### Start Daemon
```bash
cd ~/.claude-builder
node cli.js start-daemon
```

### Check Status
```bash
node cli.js status
```

**Output:**
```
Claude Builder Status

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: ✅ Running
PID: 12345

Configuration:
  Projects Root: /Users/byronhudson/Projects/BuildRunnerProjects
  WebSocket Port: 8765
  Debounce Delay: 2000ms

Watched Projects: 2
  📄 MyTestApp
  📄 E-commercePlatform

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### View Logs
```bash
node cli.js logs
```

Shows last 50 log entries:
```
📋 Daemon Logs (last 50 lines)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[2025-11-06T23:55:00.000Z] [INFO] 🚀 Starting Claude Builder Daemon
[2025-11-06T23:55:01.000Z] [INFO] Watching projects directory: /Users/...
[2025-11-06T23:55:02.000Z] [INFO] 🆕 New project detected: MyTestApp
[2025-11-06T23:55:02.000Z] [INFO] 👀 Watching MyTestApp/PRD.md
[2025-11-06T23:56:30.000Z] [INFO] 🔄 PRD changed: MyTestApp
[2025-11-06T23:56:30.000Z] [INFO] 🚀 Triggering Claude build for MyTestApp
[2025-11-06T23:58:15.000Z] [INFO] ✅ Build complete for MyTestApp (105.3s)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### List Projects
```bash
node cli.js list-projects
```

**Output:**
```
📂 Watched Projects

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MyTestApp
  PRD:    ✅
  Bugs:   ✅
  Status: ✅

E-commercePlatform
  PRD:    ✅
  Bugs:   ❌
  Status: ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Stop Daemon
```bash
node cli.js stop-daemon
```

---

## Directory Structure

```
~/.claude-builder/
├── daemon.js               # Global PRD watcher
├── command-router.js       # WebSocket server for errors/chat
├── cli.js                  # CLI management tool
├── package.json            # Dependencies
├── config.json             # Configuration
├── logs/
│   ├── daemon.log          # Daemon logs
│   └── command-router.log  # Router logs
└── templates/
    ├── error-collector.js  # Injected into preview apps
    └── chat-widget.js      # Injected into preview apps

~/Projects/BuildRunnerProjects/
├── MyProject/
│   ├── PRD.md              # Source of truth (from UI)
│   ├── BUGS.md             # Bug tracker
│   ├── BUILD_STATUS.md     # Build progress
│   ├── CHANGELOG.md        # Fix history
│   └── src/                # Generated code
└── AnotherProject/
    └── ...
```

---

## Configuration

Edit `~/.claude-builder/config.json`:

```json
{
  "projectsRoot": "/Users/byronhudson/Projects/BuildRunnerProjects",
  "debounceDelay": 2000,
  "websocketPort": 8765,
  "logLevel": "info"
}
```

**Options:**
- `projectsRoot`: Where projects are created (daemon watches this)
- `debounceDelay`: Wait time after PRD changes (milliseconds)
- `websocketPort`: Port for error collector & chat widget
- `logLevel`: "debug" | "info" | "warn" | "error"

---

## UI Workflow

### Creating a New Project

1. **Open BuildRunnerSaaS UI**
   - Navigate to `http://localhost:3000`

2. **Brainstorm & Build PRD**
   - Use AI brainstorming tools
   - Drag and drop features
   - Organize into sections

3. **Export to Claude Builder**
   - Click "Export PRD" button (top right)
   - Select "🤖 Export to Claude Builder"
   - Enter project name (or use auto-generated)

4. **Monitor Build Progress**
   - Build status widget appears automatically
   - Shows real-time progress (0-100%)
   - Updates every 2 seconds

5. **View Built Project**
   - When complete, open the project directory
   - Or add preview tab integration (Phase 3)

### Updating an Existing Project

1. **Modify PRD in UI**
   - Add/remove/edit features
   - Reorganize sections

2. **Re-export to Claude Builder**
   - Click "Export PRD" → "🤖 Export to Claude Builder"
   - Use same project name

3. **Daemon Detects Change**
   - Hash-based detection (only rebuilds on real changes)
   - Triggers minimal rebuild (only affected components)

4. **Watch Progress**
   - BUILD_STATUS.md updates in real-time
   - UI reflects current status

---

## Troubleshooting

### Daemon Won't Start

**Problem:** `claude-builder start-daemon` fails

**Solution:**
```bash
# Check if already running
cd ~/.claude-builder
node cli.js status

# If running, stop it first
node cli.js stop-daemon

# Check for port conflicts
lsof -i :8765  # WebSocket port

# Try starting again
node cli.js start-daemon

# Check logs for errors
node cli.js logs
```

### PRD Export Not Triggering Build

**Problem:** Export succeeds but no build starts

**Solutions:**

1. **Check daemon is running:**
   ```bash
   node cli.js status
   # Should show "Status: ✅ Running"
   ```

2. **Check project appears in watched list:**
   ```bash
   node cli.js list-projects
   # Your project should be listed
   ```

3. **Check logs for errors:**
   ```bash
   node cli.js logs
   # Look for error messages
   ```

4. **Verify PRD file exists:**
   ```bash
   ls ~/Projects/BuildRunnerProjects/YourProject/PRD.md
   ```

5. **Manually trigger to test:**
   ```bash
   # Modify PRD to trigger change
   echo "\n## Test" >> ~/Projects/BuildRunnerProjects/YourProject/PRD.md

   # Watch logs
   tail -f ~/.claude-builder/logs/daemon.log
   ```

### Build Status Not Updating in UI

**Problem:** UI doesn't show build progress

**Solutions:**

1. **Check BUILD_STATUS.md exists:**
   ```bash
   cat ~/Projects/BuildRunnerProjects/YourProject/BUILD_STATUS.md
   ```

2. **Verify API route works:**
   ```bash
   curl "http://localhost:3000/api/claude-builder/export-prd?projectName=YourProject"
   ```

3. **Check browser console for errors:**
   - Open DevTools (F12)
   - Look for network errors or JavaScript errors

4. **Refresh the page:**
   - Sometimes React state needs a refresh

### WebSocket Connection Failed

**Problem:** Error collector or chat widget can't connect

**Solutions:**

1. **Check WebSocket port is open:**
   ```bash
   lsof -i :8765
   # Should show node process
   ```

2. **Start command router (if not running):**
   ```bash
   cd ~/.claude-builder
   node command-router.js
   ```

3. **Check firewall settings:**
   - Allow connections on port 8765

4. **Check browser console:**
   - Look for WebSocket connection errors

---

## Advanced Usage

### Running Command Router Separately

If you want error collection & chat without the PRD watcher:

```bash
cd ~/.claude-builder
node command-router.js
```

### Custom Projects Directory

Edit `~/.claude-builder/config.json`:

```json
{
  "projectsRoot": "/path/to/your/projects"
}
```

Then restart daemon:
```bash
node cli.js stop-daemon
node cli.js start-daemon
```

### Debug Mode

Enable detailed logging:

```json
{
  "logLevel": "debug"
}
```

View debug logs:
```bash
node cli.js logs | grep DEBUG
```

### Multiple Concurrent Builds

The daemon supports multiple projects simultaneously:
- Each project has its own build lock
- Projects build in parallel (if resources allow)
- No conflicts between projects

---

## What's Next?

### Current Status: Phase 2 Complete ✅

- ✅ Global daemon watches all projects
- ✅ PRD export from UI
- ✅ Build status monitoring
- ✅ Error collector template ready
- ✅ Chat widget template ready

### Coming Soon: Phase 3

- ⏳ Preview integration (error collector + chat injected)
- ⏳ Live preview tab in UI
- ⏳ Architecture visualization
- ⏳ Bug queue management in UI
- ⏳ Feature request approval flow

---

## FAQ

**Q: Does the daemon need to run all the time?**
A: Only when you want automatic builds. Start it when working, stop it when done.

**Q: Can I use this with non-BuildRunnerSaaS projects?**
A: Yes! Just create a PRD.md manually in ~/Projects/BuildRunnerProjects/YourProject/

**Q: What if Claude CLI isn't installed?**
A: The daemon will log an error. Install Claude CLI first.

**Q: Can I customize the PRD format?**
A: Yes, edit `prd-export.ts` to change the markdown format.

**Q: How do I see what Claude is building?**
A: Check the logs: `node cli.js logs` or view BUILD_STATUS.md

**Q: Can I stop a build in progress?**
A: Not currently. Future feature: build cancellation.

**Q: What happens if I export the same project twice?**
A: The PRD is updated, daemon detects change, triggers rebuild.

---

## Support

**Logs:** `~/.claude-builder/logs/daemon.log`
**Status:** `node cli.js status`
**Docs:** See `/docs/CLAUDE_CLI_INTEGRATION.md` for architecture
**Progress:** See `/docs/BUILD_PROGRESS.md` for implementation status

---

**Happy Building! 🚀**

The daemon is watching, Claude is ready, and your projects build themselves.

Just export from the UI and let the magic happen.
