# Real-Time Error Detection & Auto-Fix Loop

**Version:** 1.2.0
**Status:** Planned (Next Priority)
**Priority:** Critical
**Target:** Ship within 3 weeks after Plan Validation stabilizes

---

## Problem Statement

### Current State (Without Auto-Healing)
When BuildRunner generates an app, users face a frustrating debugging cycle:

1. ❌ Preview loads with errors
2. ❌ User opens browser console
3. ❌ User copies error messages
4. ❌ User pastes to chat
5. ❌ Wait for AI to analyze
6. ❌ Wait for AI to generate fix
7. ❌ Apply fix manually
8. ❌ **Repeat 5-10 times** (20-30 minutes of manual work)

**Pain Points:**
- Manual context switching between preview → console → chat
- Copy-paste overhead
- Each error requires separate fix request
- No learning from previous fixes
- User frustration kills product momentum

### Target State (With Auto-Healing)
Preview loads → System detects errors → Auto-fixes in background → **User sees app self-heal in 30-60 seconds**

---

## Solution: 3-Layer Auto-Healing System

```
Architecture Overview:
Preview Loads → Inject Error Collector → Capture Console Errors → Send to AI →
Apply Fix → Hot Reload → Verify Fix → Repeat if Needed
```

---

## Layer 1: Browser Error Collection

### BrowserErrorCollector
**File:** `apps/web/lib/error-collector.ts`

#### What It Does
- Injects JavaScript into every preview app
- Captures ALL browser errors in real-time:
  - `console.error()` calls
  - Unhandled runtime errors (`window.error`)
  - Promise rejections (`unhandledrejection`)
  - React component errors (via Error Boundary)
- Sends errors to BuildRunner backend via WebSocket
- Deduplicates repeated errors

#### Implementation

```typescript
export class BrowserErrorCollector {
  private ws: WebSocket;
  private errors: Map<string, ErrorContext> = new Map();

  // Inject this script into every preview
  getCollectorScript(): string {
    return `
      <script>
        (function() {
          const ws = new WebSocket('ws://localhost:8081/errors');
          const collectedErrors = new Set();

          // Capture console errors
          const originalError = console.error;
          console.error = function(...args) {
            originalError.apply(console, args);
            const errorMsg = args.map(a => String(a)).join(' ');
            if (!collectedErrors.has(errorMsg)) {
              collectedErrors.add(errorMsg);
              ws.send(JSON.stringify({
                type: 'console.error',
                message: errorMsg,
                stack: new Error().stack,
                timestamp: Date.now(),
                url: window.location.href
              }));
            }
          };

          // Capture unhandled errors
          window.addEventListener('error', (e) => {
            ws.send(JSON.stringify({
              type: 'runtime.error',
              message: e.message,
              filename: e.filename,
              line: e.lineno,
              column: e.colno,
              stack: e.error?.stack,
              timestamp: Date.now()
            }));
          });

          // Capture React errors
          window.addEventListener('unhandledrejection', (e) => {
            ws.send(JSON.stringify({
              type: 'promise.rejection',
              reason: e.reason?.toString(),
              stack: e.reason?.stack,
              timestamp: Date.now()
            }));
          });

          // Send heartbeat to confirm connection
          setInterval(() => {
            ws.send(JSON.stringify({ type: 'heartbeat' }));
          }, 30000);
        })();
      </script>
    `;
  }

  startCollecting(projectId: string): void {
    const wss = new WebSocketServer({ port: 8081 });

    wss.on('connection', (ws) => {
      ws.on('message', async (data) => {
        const error = JSON.parse(data.toString());

        if (error.type === 'heartbeat') return;

        // Deduplicate errors
        const errorKey = `${error.type}:${error.message}`;
        if (!this.errors.has(errorKey)) {
          this.errors.set(errorKey, error);

          // Trigger auto-fix
          await this.triggerAutoFix(projectId, error);
        }
      });
    });
  }
}
```

---

## Layer 2: Intelligent Auto-Fixer

### AutoFixer
**File:** `apps/web/lib/auto-fixer.ts`

#### What It Does
- Categorizes errors into 6 types (imports, props, JSX, runtime, hooks, unknown)
- Selects optimal fix strategy for each error category
- Generates AI fix with strategy hints
- Applies fix with hot reload
- Retries up to 3 times with different strategies
- Tracks fix attempts to prevent infinite loops

#### Error Categories & Fix Strategies

| Category | Indicators | Fix Strategy | Hint |
|----------|-----------|--------------|------|
| **IMPORT_ERROR** | "cannot find module", "import" | Fix import paths, check named vs default exports | Common: @/ alias might need to be ./ |
| **PROP_ERROR** | "prop", "required" | Make props optional, add defaults | All props should have defaults or be optional |
| **JSX_ERROR** | "expected", "jsx" | Fix JSX syntax, ensure PascalCase | Component names must start with capital |
| **RUNTIME_ERROR** | "is not a function", "undefined" | Add null checks, initialize variables | Check if objects exist before accessing |
| **HOOK_ERROR** | "hook", "use" | Fix hook usage, check dependencies | Hooks must be at function component top level |
| **UNKNOWN** | Other | Analyze error and fix root cause | Read error carefully |

#### Implementation

```typescript
export class AutoFixer {
  private fixAttempts: Map<string, number> = new Map();
  private maxAttempts = 3;

  async fixError(projectId: string, error: ErrorContext): Promise<FixResult> {
    const errorKey = this.getErrorKey(error);
    const attempts = this.fixAttempts.get(errorKey) || 0;

    if (attempts >= this.maxAttempts) {
      console.log(`❌ Max fix attempts reached for ${errorKey}`);
      return { success: false, reason: 'max_attempts' };
    }

    // Categorize error
    const category = this.categorizeError(error);

    // Get fix strategy
    const strategy = this.getFixStrategy(category, error);

    // Generate fix with AI
    const fix = await this.generateFix(projectId, error, strategy);

    // Apply fix
    const applied = await this.applyFix(projectId, fix);

    // Increment attempts
    this.fixAttempts.set(errorKey, attempts + 1);

    // Verify fix worked (wait for reload)
    setTimeout(async () => {
      const stillBroken = await this.checkIfErrorPersists(projectId, errorKey);
      if (stillBroken && attempts < this.maxAttempts - 1) {
        // Try different strategy
        await this.fixError(projectId, {
          ...error,
          previousFixes: [...(error.previousFixes || []), fix]
        });
      }
    }, 3000);

    return { success: applied, fix };
  }

  private categorizeError(error: ErrorContext): ErrorCategory {
    const message = error.message.toLowerCase();

    if (message.includes('cannot find module') || message.includes('import')) {
      return 'IMPORT_ERROR';
    }
    if (message.includes('is not a function') || message.includes('undefined')) {
      return 'RUNTIME_ERROR';
    }
    if (message.includes('expected') || message.includes('jsx')) {
      return 'JSX_ERROR';
    }
    if (message.includes('prop') || message.includes('required')) {
      return 'PROP_ERROR';
    }
    if (message.includes('hook') || message.includes('use')) {
      return 'HOOK_ERROR';
    }

    return 'UNKNOWN';
  }

  private async generateFix(
    projectId: string,
    error: ErrorContext,
    strategy: FixStrategy
  ): Promise<CodeFix> {
    // Get the problematic file
    const filePath = this.extractFilePath(error);
    const currentCode = await this.getFileContent(projectId, filePath);

    const prompt = `
Fix this error in a Next.js/React application:

ERROR:
${error.message}

${error.stack ? `STACK TRACE:\n${error.stack}` : ''}

CURRENT CODE:
\`\`\`tsx
${currentCode}
\`\`\`

${strategy.hint ? `HINT: ${strategy.hint}` : ''}

${error.previousFixes ? `
PREVIOUS FIX ATTEMPTS THAT DIDN'T WORK:
${error.previousFixes.map(f => `- ${f.description}`).join('\n')}
` : ''}

Generate ONLY the corrected code. No explanations.
Focus on fixing: ${strategy.focus}
`;

    const response = await this.callLLM(prompt, 'claude-3.5-sonnet');

    return {
      filePath,
      newCode: this.extractCode(response),
      description: strategy.description,
      category: strategy.category
    };
  }

  private async applyFix(projectId: string, fix: CodeFix): Promise<boolean> {
    try {
      const fullPath = `/builds/${projectId}/${fix.filePath}`;

      // Backup original
      await this.backupFile(fullPath);

      // Write fix
      await fs.writeFile(fullPath, fix.newCode);

      // Trigger hot reload
      await this.triggerHotReload(projectId, fix.filePath);

      // Log fix attempt
      await this.logFixAttempt(projectId, fix);

      return true;
    } catch (error) {
      console.error('❌ Failed to apply fix:', error);
      return false;
    }
  }
}
```

---

## Layer 3: Learning from Fixes

### FixLearner
**File:** `apps/web/lib/fix-learner.ts`

#### What It Does
- Stores successful fix patterns in database
- Normalizes error patterns (removes specifics like strings, numbers, stack traces)
- Builds confidence scores (0.0 - 1.0) based on usage count
- Suggests known fixes for similar errors
- Learns across ALL projects (not just one)

#### How Learning Works

1. **Error Pattern Extraction**
   ```typescript
   Original: "Cannot find module '@/components/UserDashboard' at line 42"
   Normalized: "Cannot find module STRING at line NUMBER"
   ```

2. **Fix Pattern Storage**
   ```typescript
   {
     errorPattern: "Cannot find module STRING",
     fixPattern: "Change @/ to ./ or ../../",
     category: "IMPORT_ERROR",
     confidence: 0.85,
     usageCount: 23
   }
   ```

3. **Pattern Matching**
   - Exact match: confidence boost +0.10
   - Similar match: confidence boost +0.05
   - After 5 successful uses: confidence ≥ 0.8 (auto-apply without asking)

#### Implementation

```typescript
export class FixLearner {
  private successfulFixes: Map<string, FixPattern> = new Map();

  async learnFromFix(error: ErrorContext, fix: CodeFix, worked: boolean) {
    if (worked) {
      // Store successful fix pattern
      const pattern: FixPattern = {
        errorPattern: this.extractErrorPattern(error),
        fixPattern: this.extractFixPattern(fix),
        category: fix.category,
        confidence: 0.8,
        usageCount: 1
      };

      const key = this.getPatternKey(pattern.errorPattern);
      const existing = this.successfulFixes.get(key);

      if (existing) {
        existing.usageCount++;
        existing.confidence = Math.min(0.95, existing.confidence + 0.05);
      } else {
        this.successfulFixes.set(key, pattern);
      }

      // Persist to database
      await this.savePattern(pattern);
    }
  }

  async getSuggestedFix(error: ErrorContext): Promise<FixPattern | null> {
    const errorPattern = this.extractErrorPattern(error);
    const key = this.getPatternKey(errorPattern);

    // Check if we've seen this before
    const knownFix = this.successfulFixes.get(key);
    if (knownFix && knownFix.confidence > 0.7) {
      return knownFix;
    }

    // Check similar patterns
    const similar = this.findSimilarPatterns(errorPattern);
    if (similar.length > 0) {
      return similar[0];
    }

    return null;
  }

  private extractErrorPattern(error: ErrorContext): ErrorPattern {
    return {
      type: error.type,
      messagePattern: error.message
        .replace(/['"`](.*?)['"`]/g, 'STRING') // Normalize strings
        .replace(/\d+/g, 'NUMBER') // Normalize numbers
        .replace(/at\s+.*?\s+\(.*?\)/g, '') // Remove stack specifics
        .trim(),
      category: this.categorizeError(error)
    };
  }
}
```

---

## Integration with BuildRunner

### PreviewManager
**File:** `apps/web/lib/preview-manager.ts`

```typescript
export class PreviewManager {
  private errorCollector: BrowserErrorCollector;
  private autoFixer: AutoFixer;
  private fixLearner: FixLearner;

  async launchPreview(projectId: string, code: ProjectCode): Promise<void> {
    // Start error collection
    this.errorCollector.startCollecting(projectId);

    // Inject error collector script into HTML
    const indexHtml = code['index.html'] || code['app/layout.tsx'];
    const modifiedHtml = this.injectErrorCollector(indexHtml);

    // Launch preview with modified HTML
    await this.startPreviewServer(projectId, {
      ...code,
      'index.html': modifiedHtml
    });

    // Start auto-fix monitor
    this.startAutoFixMonitor(projectId);
  }

  private startAutoFixMonitor(projectId: string) {
    // Monitor for errors and auto-fix
    const monitor = setInterval(async () => {
      const errors = await this.errorCollector.getErrors(projectId);

      if (errors.length === 0) {
        console.log(`✅ No errors detected for ${projectId}`);
        clearInterval(monitor);
        return;
      }

      console.log(`🔧 Auto-fixing ${errors.length} errors...`);

      for (const error of errors) {
        // Check if we've seen this error before
        const knownFix = await this.fixLearner.getSuggestedFix(error);

        if (knownFix) {
          // Apply known fix immediately
          await this.autoFixer.applyKnownFix(projectId, error, knownFix);
        } else {
          // Generate new fix with AI
          await this.autoFixer.fixError(projectId, error);
        }
      }
    }, 5000); // Check every 5 seconds

    // Stop monitoring after 2 minutes
    setTimeout(() => clearInterval(monitor), 120000);
  }
}
```

---

## UI Components

### FixMonitor Component
**File:** `apps/web/components/auto-healing/FixMonitor.tsx`

**Purpose:** Real-time display of auto-healing progress

**Features:**
- Live error count
- Fix status per error (detecting → fixing → verifying → ✅)
- Time elapsed
- Success/failure badges
- Ability to pause auto-fixing
- Manual rollback button

**Example UI:**
```
┌─────────────────────────────────────────┐
│ 🔧 Auto-Healing in Progress            │
├─────────────────────────────────────────┤
│ ✅ Import error (Button.tsx)      2.3s  │
│ 🔄 Fixing prop error (Header.tsx)       │
│ ⏳ Detected JSX error (Layout.tsx)      │
├─────────────────────────────────────────┤
│ 3 errors detected • 1 fixed • 1 active  │
│ [Pause] [View Details]                  │
└─────────────────────────────────────────┘
```

### FixHistoryPanel Component
**File:** `apps/web/components/auto-healing/FixHistoryPanel.tsx`

**Purpose:** Review all fixes applied to a project

**Features:**
- Chronological fix list
- Before/after code diffs
- Success rate per fix category
- Ability to rollback specific fixes
- Export fix log

---

## API Endpoints

### POST /api/auto-fix/collect
**Purpose:** Receive errors from browser error collector

**Request:**
```json
{
  "projectId": "proj_123",
  "error": {
    "type": "console.error",
    "message": "Cannot find module '@/components/Button'",
    "stack": "...",
    "timestamp": 1762284255000
  }
}
```

### POST /api/auto-fix/apply
**Purpose:** Apply a generated fix

**Request:**
```json
{
  "projectId": "proj_123",
  "fix": {
    "filePath": "components/Header.tsx",
    "newCode": "...",
    "description": "Fixed import path"
  }
}
```

### POST /api/auto-fix/rollback
**Purpose:** Rollback a specific fix

**Request:**
```json
{
  "projectId": "proj_123",
  "fixId": "fix_abc123"
}
```

### GET /api/auto-fix/patterns
**Purpose:** Get learned fix patterns

**Response:**
```json
{
  "patterns": [
    {
      "errorPattern": "Cannot find module STRING",
      "fixPattern": "Change @/ to ./",
      "confidence": 0.92,
      "usageCount": 47
    }
  ]
}
```

---

## Implementation Timeline

### Week 1: Basic Auto-Healing
**Goal:** Catch and auto-fix 50% of common errors

- [x] BrowserErrorCollector with WebSocket
- [x] Error injection script
- [x] Simple AutoFixer for imports and props
- [x] Hot reload integration
- [x] Fix attempt tracking

**Deliverable:** Preview apps with basic auto-healing (imports, props)

### Week 2: Smart Fixing
**Goal:** 80% auto-fix success rate with learning

- [ ] Error categorization (6 categories)
- [ ] Fix strategy selection with hints
- [ ] FixLearner implementation
- [ ] Cross-project pattern database
- [ ] Retry logic with different strategies

**Deliverable:** Intelligent fixes that improve over time

### Week 3: Production Ready
**Goal:** Ship to production with monitoring

- [ ] Rollback mechanism
- [ ] Fix confidence scoring
- [ ] FixMonitor UI component
- [ ] FixHistoryPanel UI component
- [ ] Dashboard integration
- [ ] Visual regression detection (stretch)
- [ ] Test generation from fixes (stretch)

**Deliverable:** Production-ready auto-healing system

---

## Expected Impact

### Time Savings
- **Before:** 20-30 minutes manual debugging
- **After:** 30-60 seconds automatic healing
- **Reduction:** 95% time savings

### Error Fix Rate
- **Week 1:** 50% auto-fix on first attempt
- **Week 2:** 70% auto-fix with learning
- **Week 3:** 85% auto-fix with confidence scoring

### User Experience
- Apps "self-heal" in preview
- Reduced frustration
- Faster iteration cycles
- Better first impression

### Learning Curve
- System improves over time
- Cross-project knowledge sharing
- Rare errors become known patterns

---

## Advanced Features (Future)

### Visual Regression Detection
- Screenshot before/after fixes
- Ensure fixes don't break UI
- Rollback if visual regression detected

### Test Generation
- After fixes stabilize, generate tests
- Prevent regression in future builds
- Build comprehensive test suite automatically

### Fix Confidence Scoring
- **High confidence (≥0.8):** Apply immediately
- **Medium confidence (0.5-0.8):** Apply with rollback option
- **Low confidence (<0.5):** Ask user permission

### Cross-Project Learning
- Learn fix patterns across all BuildRunner projects
- Pre-emptively fix known issues before they occur
- Build a "fix knowledge base"

---

## Success Metrics

### Phase 1 (Week 1)
- [ ] 50% of errors auto-fixed on first attempt
- [ ] Average fix time < 10 seconds
- [ ] 0 infinite fix loops
- [ ] Preview hot-reload working

### Phase 2 (Week 2)
- [ ] 70% of errors auto-fixed
- [ ] 20+ learned fix patterns
- [ ] 80% fix confidence on known errors
- [ ] 3 or fewer retry attempts per error

### Phase 3 (Week 3)
- [ ] 85% of errors auto-fixed
- [ ] Fix monitoring dashboard live
- [ ] Rollback working correctly
- [ ] User satisfaction score > 8/10

---

## Dependencies

**Required Features:**
- ✅ Plan Validation & Quality Control (reduces errors at generation time)
- ✅ Build Orchestrator (provides code generation pipeline)

**Optional Enhancements:**
- Preview Server (for live preview testing)
- File Storage System (for fix backups)

---

## Technical Debt & Risks

### Potential Issues
1. **Infinite Fix Loops:** Mitigated by max 3 attempts per error
2. **Bad Fixes:** Mitigated by rollback mechanism
3. **Performance Impact:** WebSocket overhead minimal (~1KB/error)
4. **False Positives:** Learning system reduces over time

### Rollback Strategy
Every fix is backed up before applying:
```typescript
await this.backupFile(fullPath); // Save original
await fs.writeFile(fullPath, fix.newCode); // Apply fix
```

If fix fails or causes new errors:
```typescript
await this.restoreBackup(fullPath); // Restore original
```

---

## Questions & Answers

**Q: What if the auto-fixer makes things worse?**
A: Every fix is backed up. Users can rollback via the FixHistoryPanel. After 3 failed attempts, system stops trying.

**Q: How do we prevent infinite loops?**
A: Track attempts per error (max 3). If error persists after 3 fixes, mark as "needs manual intervention".

**Q: What about security? Can malicious errors exploit this?**
A: Error collector runs in sandboxed WebSocket. Fixes are code-only (no system commands). AI generates code, not executes it.

**Q: How much will this cost in AI calls?**
A: ~$0.01 per fix (Claude Haiku). Typical app with 5-10 errors = $0.05-0.10. ROI: saves 20-30 min of user time.

**Q: Can users disable auto-healing?**
A: Yes. Settings option to disable, or pause button in FixMonitor.

---

**Documentation Version:** 1.0.0
**Last Updated:** 2025-11-04
**Author:** BuildRunner Team
