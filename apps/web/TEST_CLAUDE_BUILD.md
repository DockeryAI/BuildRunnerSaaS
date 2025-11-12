# End-to-End Test Plan - Claude Build Engine

**Purpose**: Verify Claude build engine works end-to-end
**Date**: November 11, 2025
**Status**: Ready for testing

---

## Prerequisites

1. ✅ ANTHROPIC_API_KEY set in .env.local
2. ✅ Server running on port 3001
3. ✅ ~/Projects/ directory accessible
4. ✅ gh CLI installed (optional, for GitHub integration)
5. ✅ Git configured locally

---

## Test 1: Simple Build via API

### Objective
Test basic Claude build via API endpoint

### Steps

1. **Start the server**
   ```bash
   npm run dev
   ```

2. **Send build request**
   ```bash
   curl -X POST http://localhost:3001/api/build/start \
     -H "Content-Type: application/json" \
     -d '{
       "buildEngine": "claude",
       "projectName": "TestTodoApp",
       "productIdea": "A simple todo list app with add, complete, and delete functionality",
       "prd": {
         "productName": "TestTodoApp",
         "productIdea": "A simple todo list app",
         "features": [
           {
             "name": "Add Todo",
             "description": "Users can add new todos with a text input"
           },
           {
             "name": "Complete Todo",
             "description": "Users can mark todos as complete"
           }
         ]
       },
       "projectPlan": {}
     }'
   ```

3. **Watch the build**
   - Check terminal output
   - Should see: "Build started with ID: claude_XXXXX"

4. **Monitor via SSE**
   ```bash
   curl http://localhost:3001/api/build/status?buildId=<buildId>
   ```

5. **Verify project created**
   ```bash
   ls -la ~/Projects/TestTodoApp
   ```

### Expected Results

- ✅ Project created in ~/Projects/TestTodoApp/
- ✅ .buildrunner/ directory with all documents
- ✅ BUILD_STATE.json tracking progress
- ✅ Tasks executing sequentially
- ✅ Git commits being created
- ✅ Dependencies auto-installed
- ✅ TypeScript passing
- ✅ Build completes or pauses gracefully

---

## Test 2: Resume from Handoff

### Objective
Test pause and resume functionality

### Steps

1. **Start a build (as above)**

2. **Stop the server mid-build** (Ctrl+C)

3. **Verify handoff created**
   ```bash
   cat ~/Projects/TestTodoApp/.buildrunner/HANDOFF.md
   ```

4. **Restart server**

5. **Resume the build**
   ```bash
   curl -X POST http://localhost:3001/api/claude/build \
     -H "Content-Type: application/json" \
     -d '{
       "action": "resume",
       "projectPath": "~/Projects/TestTodoApp"
     }'
   ```

6. **Verify resume works**
   - Should read handoff
   - Should continue from where it left off
   - Should not re-do completed tasks

### Expected Results

- ✅ Handoff document exists
- ✅ Resume API accepts request
- ✅ Build continues from last checkpoint
- ✅ No duplicate work
- ✅ Completes successfully

---

## Test 3: PRD Change Detection

### Objective
Test task list updates when PRD changes

### Steps

1. **Complete a build**

2. **Modify PRD**
   - Add a new feature to prd.features array
   - Call parse-prompt API with updated PRD

3. **Verify task list updates**
   ```bash
   cat ~/Projects/TestTodoApp/.buildrunner/TASKS.md
   ```

### Expected Results

- ✅ New tasks added for new feature
- ✅ Existing completed tasks remain completed
- ✅ BUILD_STATE.json updated with new tasks
- ✅ Can resume to build new feature

---

## Test 4: Dependency Auto-Installation

### Objective
Test automatic npm package installation

### Steps

1. **Create a component that uses a new package**
   - E.g., uses 'date-fns' for date formatting

2. **Verify dependency detector finds it**
   - Check logs for "📦 Installing X missing dependencies"

3. **Verify package.json updated**
   ```bash
   cat ~/Projects/TestTodoApp/package.json | grep date-fns
   ```

4. **Verify node_modules has it**
   ```bash
   ls ~/Projects/TestTodoApp/node_modules/ | grep date-fns
   ```

### Expected Results

- ✅ Dependency detected from import statement
- ✅ Automatically added to package.json
- ✅ npm install runs successfully
- ✅ Build continues without manual intervention

---

## Test 5: Quality Gates

### Objective
Test TypeScript and ESLint checks

### Steps

1. **Build should run TypeScript check after each task**
   - Watch logs for "📝 TypeScript check..."

2. **Build should run ESLint**
   - Watch logs for "🔍 ESLint check..."

3. **If errors occur, should be logged**
   - Not blocking (warnings only)

### Expected Results

- ✅ TypeScript runs after each task
- ✅ ESLint runs after each task
- ✅ Errors logged but non-blocking
- ✅ Final build has no type errors

---

## Test 6: Git Integration

### Objective
Test semantic git commits

### Steps

1. **After build completes**
   ```bash
   cd ~/Projects/TestTodoApp
   git log --oneline
   ```

2. **Verify commits**
   - Each task should have a commit
   - Commit messages should be semantic (feat:, chore:, etc.)
   - Should have "Generated with BuildRunner + Claude CLI" footer

3. **Check GitHub repo (if gh CLI available)**
   ```bash
   gh repo view
   ```

### Expected Results

- ✅ One commit per task
- ✅ Semantic commit messages
- ✅ BuildRunner co-authorship
- ✅ GitHub repo created (if gh available)
- ✅ Can push to remote

---

## Test 7: Gap Analysis

### Objective
Test gap detection and reporting

### Steps

1. **After build completes**
   ```bash
   cat ~/Projects/TestTodoApp/.buildrunner/GAP_ANALYSIS.md
   ```

2. **Verify report shows**
   - Total tasks vs completed
   - Any missing files
   - Any incomplete integrations
   - Recommendations

3. **Fix gaps if any**
   - Follow recommendations
   - Re-run gap analysis

### Expected Results

- ✅ GAP_ANALYSIS.md generated
- ✅ Shows comprehensive analysis
- ✅ Identifies real gaps
- ✅ Provides actionable recommendations
- ✅ Zero gaps for complete build

---

## Test 8: UI Integration (if UI updated)

### Objective
Test workbench UI with Claude events

### Steps

1. **Start build via UI**
   - Navigate to /workbench
   - Click "Start Build"
   - Select "Claude" as engine

2. **Watch real-time updates**
   - Task list updates
   - Terminal shows Claude output
   - Progress bar updates

3. **Test pause/resume**
   - Click pause
   - Verify handoff created
   - Click resume
   - Verify continues

### Expected Results

- ✅ UI shows real-time progress
- ✅ Claude events displayed in terminal
- ✅ Task list updates live
- ✅ Pause creates handoff
- ✅ Resume continues from checkpoint
- ✅ Clean UX, no errors

---

## Test 9: Streaming Output

### Objective
Test Claude streaming to terminal

### Steps

1. **Watch terminal during build**
2. **Should see streaming chunks**
   - "💭 Creating component..."
   - "💭 Adding styles..."
   - etc.

### Expected Results

- ✅ Streaming chunks appear in real-time
- ✅ Not just summaries - full output
- ✅ Terminal accumulates chunks correctly
- ✅ User can follow Claude's thinking

---

## Test 10: Complete Build Verification

### Objective
Verify complete build works end-to-end

### Steps

1. **Build completes**

2. **Navigate to project**
   ```bash
   cd ~/Projects/TestTodoApp
   ```

3. **Install dependencies (if not auto-installed)**
   ```bash
   npm install
   ```

4. **Run TypeScript check**
   ```bash
   npx tsc --noEmit
   ```
   - Should pass with no errors

5. **Run build**
   ```bash
   npm run build
   ```
   - Should build successfully

6. **Run dev server**
   ```bash
   npm run dev
   ```
   - Should start on localhost:3000

7. **Test the app**
   - Open browser to localhost:3000
   - Test all features work
   - Check responsive design
   - Verify styling matches design system

### Expected Results

- ✅ TypeScript: 0 errors
- ✅ Build: successful
- ✅ Dev server: runs
- ✅ App: works as specified
- ✅ UI: matches design system
- ✅ Features: all functional
- ✅ Quality: Linear/Stripe level

---

## Success Criteria

For the test to PASS, all of the following must be true:

1. ✅ Build starts and runs via API
2. ✅ Project created in ~/Projects/
3. ✅ All build documents generated
4. ✅ Tasks execute sequentially
5. ✅ Dependencies auto-installed
6. ✅ Git commits per task
7. ✅ Quality gates run
8. ✅ Can pause and resume
9. ✅ Handoffs work for continuity
10. ✅ Gap analysis identifies issues
11. ✅ Final app builds and runs
12. ✅ UI/features work as specified

---

## Known Issues / Limitations

1. **No automatic tests generated yet** - Tests must be written manually
2. **Gap analyzer doesn't auto-fix** - Just reports issues
3. **UI integration pending** - Must test via API for now
4. **No multi-agent** - Sequential only, no parallel subtasks

---

## Troubleshooting

### Build fails immediately
- Check ANTHROPIC_API_KEY is set
- Check API key has credits
- Check network connectivity

### Project not created
- Check ~/Projects/ permissions
- Check disk space
- Check BUILD_STATE.json for errors

### Dependencies not installing
- Check npm/yarn is available
- Check package.json is valid
- Run `npm install` manually

### Git commits fail
- Check git is configured (`git config --list`)
- Initialize git manually if needed
- Check file permissions

### Resume doesn't work
- Check HANDOFF.md exists
- Check BUILD_STATE.json is valid
- Check projectPath parameter is correct

---

## Next Steps After Testing

1. Document any bugs found
2. Fix critical issues
3. Optimize for performance
4. Add test coverage
5. Enhance UI integration
6. Add more sophisticated features

---

*Test plan maintained for AI continuity*
*Update this document with actual test results*
