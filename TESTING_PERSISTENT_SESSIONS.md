# Testing Guide: Persistent Claude Sessions

**Feature:** Persistent Claude CLI sessions for faster builds
**Expected Performance Gain:** 10% (39min → ~35min)
**Status:** ✅ Implementation complete, ready for testing

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Test Plan Overview](#test-plan-overview)
3. [Test 1: Baseline (Persistent Sessions Disabled)](#test-1-baseline-persistent-sessions-disabled)
4. [Test 2: Persistent Sessions Enabled](#test-2-persistent-sessions-enabled)
5. [Test 3: Session Failure Recovery](#test-3-session-failure-recovery)
6. [Test 4: Critical Task Handling](#test-4-critical-task-handling)
7. [Verification Checklist](#verification-checklist)
8. [Performance Metrics](#performance-metrics)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Setup
1. BuildRunner web app running (`npm run dev` in `apps/web`)
2. Valid `OPENROUTER_API_KEY` in `.env.local`
3. Claude CLI installed and authenticated
4. Test project with a typical build (15-20 tasks recommended)

### Files to Check
- ✅ `/apps/web/.env.example` - Feature flag documented
- ✅ `/apps/web/lib/circuit-breaker.ts` - Circuit breaker implemented
- ✅ `/apps/web/lib/claude-session.ts` - Persistent session wrapper
- ✅ `/apps/web/lib/session-pool.ts` - Session pool manager
- ✅ `/apps/web/lib/claude-cli-engine.ts` - Dual-mode execution
- ✅ `/apps/web/lib/build-orchestrator.ts` - Session lifecycle integration

---

## Test Plan Overview

We'll run 4 tests to validate the persistent sessions feature:

| Test | Purpose | Expected Outcome |
|------|---------|------------------|
| **Test 1** | Baseline performance | Measure current build time (~39min) |
| **Test 2** | Persistent sessions | Verify 10% speedup (~35min) |
| **Test 3** | Failure recovery | Circuit breaker auto-degradation works |
| **Test 4** | Critical tasks | Quality gates always use fresh sessions |

---

## Test 1: Baseline (Persistent Sessions Disabled)

### Purpose
Establish baseline performance with persistent sessions **disabled**.

### Setup
1. Edit `apps/web/.env.local`:
   ```bash
   ENABLE_PERSISTENT_SESSIONS=false
   ```

2. Restart the dev server:
   ```bash
   cd apps/web
   npm run dev
   ```

### Execution Steps
1. Navigate to BuildRunner UI: http://localhost:3005
2. Create a new project with a realistic feature:
   - Example: "E-commerce product catalog with cart and checkout"
   - Should generate 15-20 tasks
3. Start the build
4. Monitor the workbench terminal for:
   - ✅ "🆕 Using fresh session for task: ..." (should appear for ALL tasks)
   - ❌ NO "♻️  Using persistent session" messages
   - ❌ NO "♻️  Initializing persistent session pool..." message

### Success Criteria
- [ ] Build completes successfully
- [ ] All tasks use fresh sessions
- [ ] Build time recorded: _______ minutes
- [ ] No session pool initialization messages
- [ ] No session-related errors

### Recording Baseline
**Build Time:** _______ minutes
**Tasks Completed:** _______
**Failed Tasks:** _______

---

## Test 2: Persistent Sessions Enabled

### Purpose
Verify persistent sessions provide ~10% speedup without quality regression.

### Setup
1. Edit `apps/web/.env.local`:
   ```bash
   ENABLE_PERSISTENT_SESSIONS=true
   ```

2. Restart the dev server:
   ```bash
   cd apps/web
   npm run dev
   ```

### Execution Steps
1. Create a **NEW** project with the **SAME** feature as Test 1
   - Use identical project description for fair comparison
2. Start the build
3. Monitor the workbench terminal for:
   - ✅ "♻️  Initializing persistent session pool..." (at build start)
   - ✅ "✅ Session pool initialized (1 active, 1 standby)" (after initialization)
   - ✅ "♻️  Using persistent session for task: ..." (for most tasks)
   - ✅ "🆕 Using fresh session for task: ... (critical task)" (for quality gates)
   - ✅ "✅ Session pool shutdown complete" (at build end)

### Success Criteria
- [ ] Session pool initializes successfully
- [ ] Most tasks use persistent sessions
- [ ] Critical tasks (quality gates, tests) use fresh sessions
- [ ] Build completes successfully
- [ ] Build time is ~10% faster than baseline
- [ ] Session pool shuts down cleanly
- [ ] Generated code quality is identical to baseline

### Recording Results
**Build Time:** _______ minutes
**Baseline Time:** _______ minutes (from Test 1)
**Speedup:** _______%
**Tasks with Persistent Sessions:** _______
**Tasks with Fresh Sessions:** _______
**Session Failures:** _______

### Performance Validation
```
Expected: ~35 minutes (10% faster than 39min baseline)
Actual:   _______ minutes
Status:   [ ] PASS  [ ] FAIL
```

---

## Test 3: Session Failure Recovery

### Purpose
Verify circuit breaker detects failures and auto-degrades gracefully.

### Setup
1. Keep `ENABLE_PERSISTENT_SESSIONS=true`
2. Restart dev server

### Execution Steps
1. Start a new build
2. Wait for session pool to initialize
3. **Simulate session failure** (choose one method):

   **Option A: Kill Claude process**
   ```bash
   # Find Claude processes
   ps aux | grep claude

   # Kill the primary session process
   kill -9 <pid>
   ```

   **Option B: Force session timeout**
   - Let build run for 2-3 tasks
   - Kill Claude process mid-task
   - Watch for automatic recovery

### Expected Behavior
1. **Immediate Failover:**
   - ✅ "⚠️  Primary session unhealthy, switching to standby"
   - ✅ "✅ Switched to standby session (0ms downtime): ..."
   - ✅ "🔄 Spawning new standby session in background"

2. **If Failures Continue (3+ consecutive):**
   - ✅ "⚠️  Persistent session failed, retrying with fresh session"
   - ✅ "[CircuitBreaker] State transition: CLOSED → OPEN"
   - ✅ "🆕 Using fresh session for task: ... (circuit breaker open)"

3. **Build Continues:**
   - ✅ Build does NOT fail
   - ✅ Tasks complete using fresh sessions
   - ✅ No data loss or task re-execution

### Success Criteria
- [ ] Session failure detected within 10 seconds
- [ ] Standby session promotes to primary (0ms downtime)
- [ ] New standby spawned in background
- [ ] If 3+ failures: circuit breaker opens
- [ ] Build continues with fresh sessions
- [ ] No tasks lost or duplicated
- [ ] Build completes successfully

### Recording Results
**Time to Detect Failure:** _______ seconds
**Failover Downtime:** _______ ms (should be ~0ms)
**Circuit Breaker Triggered:** [ ] YES [ ] NO
**Build Outcome:** [ ] SUCCESS [ ] FAILED

---

## Test 4: Critical Task Handling

### Purpose
Verify quality gates and tests ALWAYS use fresh sessions for maximum reliability.

### Setup
1. Keep `ENABLE_PERSISTENT_SESSIONS=true`
2. Use a project with quality gates enabled

### Execution Steps
1. Start a build
2. Monitor logs specifically for quality gate tasks
3. Look for task types: `quality_gate`, `test`, `integration_test`, `e2e_test`

### Expected Behavior
**For Quality Gate Tasks:**
```
🆕 Using fresh session for task: quality_gate_1 (critical task)
📝 Task prompt written (XXXX chars)
🚀 Spawning: claude --model sonnet
✅ Task completed: Run quality gate 1 (0 files)
```

**For Regular Tasks:**
```
♻️  Using persistent session for task: component_1
✅ Task completed with persistent session: Build component 1 (2 files)
```

### Success Criteria
- [ ] All `quality_gate` tasks use fresh sessions
- [ ] All `test` tasks use fresh sessions
- [ ] Regular tasks (`component`, `page`, `api`) use persistent sessions
- [ ] Quality gates pass successfully
- [ ] No false positives from reused session state

### Recording Results
**Critical Tasks Found:** _______
**Critical Tasks Using Fresh Sessions:** _______
**Regular Tasks Using Persistent Sessions:** _______
**Quality Gates Passed:** [ ] YES [ ] NO

---

## Verification Checklist

### Implementation Completeness
- [x] CircuitBreaker class implemented
- [x] ClaudeSession class implemented
- [x] SessionPool class implemented
- [x] ClaudeCLIEngine supports dual-mode execution
- [x] BuildOrchestrator initializes/shuts down sessions
- [x] ENABLE_PERSISTENT_SESSIONS env var documented
- [x] Event forwarding (SessionPool → UI)
- [x] Critical task detection
- [x] Graceful degradation on failures

### Code Quality
- [x] TypeScript compilation passes
- [x] No linting errors
- [x] Comprehensive logging throughout
- [x] Error handling in all async operations
- [x] Resource cleanup (session shutdown)

### Safety Features
- [x] Circuit breaker prevents cascading failures
- [x] Session pooling eliminates single point of failure
- [x] Warm standby for zero-downtime failover
- [x] Critical tasks always use fresh sessions
- [x] Automatic fallback to per-task sessions
- [x] Feature flag defaults to disabled

### Documentation
- [x] Architecture documented in `PERSISTENT_SESSIONS_IMPLEMENTATION.md`
- [x] Feature flag usage in `.env.example`
- [x] Testing guide (this document)
- [x] Implementation progress tracking
- [ ] User-facing release notes (pending)

---

## Performance Metrics

### Target Metrics
| Metric | Baseline | With Persistent Sessions | Target Improvement |
|--------|----------|-------------------------|-------------------|
| **Build Time** | 39 min | ~35 min | -10% |
| **Session Spawns** | 16 | 1-3 | -80% |
| **Context Loading** | 16x | 1x | -94% |
| **Failover Time** | N/A | <100ms | 0ms downtime |
| **Success Rate** | 100% | 100% | No regression |

### Actual Results (Record After Testing)
| Metric | Test 1 (Disabled) | Test 2 (Enabled) | Improvement |
|--------|-------------------|------------------|-------------|
| **Build Time** | _____ min | _____ min | _____ % |
| **Session Spawns** | _____ | _____ | _____ % |
| **Failed Tasks** | _____ | _____ | _____ |
| **Quality Score** | _____ | _____ | _____ |

---

## Troubleshooting

### Issue: Session Pool Fails to Initialize

**Symptoms:**
```
❌ Failed to initialize session pool: Session initialization timeout
```

**Causes:**
- Claude CLI not installed or not in PATH
- Claude CLI not authenticated
- System resources (too many processes)

**Fix:**
```bash
# Verify Claude CLI
which claude

# Test Claude CLI manually
claude --version

# Re-authenticate if needed
claude auth login

# Check system resources
ps aux | grep claude | wc -l  # Should be <5
```

---

### Issue: Circuit Breaker Opens Immediately

**Symptoms:**
```
[CircuitBreaker] State transition: CLOSED → OPEN
🆕 Using fresh session for task: ... (circuit breaker open)
```

**Causes:**
- Claude CLI repeatedly failing
- Network connectivity issues
- Rate limiting from Anthropic API

**Fix:**
```bash
# Check Claude CLI health
claude "respond with OK"

# Check rate limits
# Wait 5-10 minutes and retry

# Disable persistent sessions temporarily
ENABLE_PERSISTENT_SESSIONS=false
```

---

### Issue: No Performance Improvement

**Symptoms:**
- Build time is same or slower with persistent sessions

**Possible Causes:**
1. **Too Few Tasks:** Persistent sessions have overhead for <10 tasks
2. **Network Bottleneck:** Session reuse doesn't help if network is slow
3. **Critical Tasks:** If most tasks are critical, they'll use fresh sessions anyway

**Diagnosis:**
```bash
# Count tasks using persistent sessions
grep "Using persistent session" build.log | wc -l

# Count tasks using fresh sessions
grep "Using fresh session" build.log | wc -l

# Persistent sessions should be >70% of tasks
```

**Fix:**
- Verify task distribution (most should be non-critical)
- Check network latency to Anthropic API
- Ensure at least 15+ tasks in build for measurable improvement

---

### Issue: Session Errors Not Recovering

**Symptoms:**
```
❌ Task failed: Session stdout not available
❌ Task failed: Session stdout not available
(repeating errors)
```

**Causes:**
- Claude CLI process crashed
- File descriptor limits exceeded
- Session pool not recovering

**Fix:**
```bash
# Kill all Claude processes
pkill -9 claude

# Increase file descriptor limit
ulimit -n 4096

# Restart dev server
npm run dev

# Disable persistent sessions if issue persists
ENABLE_PERSISTENT_SESSIONS=false
```

---

## Next Steps After Testing

### If All Tests Pass ✅
1. Document results in this file
2. Update `PERSISTENT_SESSIONS_IMPLEMENTATION.md` with test outcomes
3. Create release notes for users
4. Consider enabling by default in future releases
5. Monitor production metrics for 1-2 weeks
6. Consider A/B testing with real users

### If Tests Fail ❌
1. Document failure symptoms
2. Check logs for error patterns
3. Verify all implementation files are present
4. Run TypeScript compilation: `npm run build`
5. Review circuit breaker configuration
6. Consider increasing failure thresholds
7. Report issues with detailed logs

---

## Summary

This testing guide covers:
- ✅ Baseline performance measurement
- ✅ Persistent sessions functionality
- ✅ Failure recovery and circuit breaker
- ✅ Critical task safety
- ✅ Performance validation
- ✅ Troubleshooting common issues

**Estimated Testing Time:** 2-3 hours
**Required Resources:** 2 test projects, ~70min of build time
**Success Rate Target:** 100% (no quality regression)

---

**Ready to Test!** 🚀

Follow each test in sequence, record results, and verify all success criteria before moving to production.
