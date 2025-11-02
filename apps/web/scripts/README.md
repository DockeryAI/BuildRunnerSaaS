# Project Restoration Scripts

## restore-project.js

This script restores the current project by linking the completed build and updating project status.

### Usage

#### Option 1: Browser Console (Recommended)

1. Open your browser's developer console (F12 or Cmd+Option+I on Mac)
2. Navigate to BuildRunner in your browser
3. Paste the following code into the console:

```javascript
// Restore Project Script
function restoreProject() {
  console.log('🔧 Starting project restoration...');

  const BUILD_ID = '1762055895639-ctpi588xt';
  const PROJECT_ID = '1';
  const BUILD_DIR = `builds/${PROJECT_ID}/${BUILD_ID}`;

  try {
    const projectsData = localStorage.getItem('buildrunner_projects');
    let projects = projectsData ? JSON.parse(projectsData) : [];

    let project = projects.find(p => p.id === PROJECT_ID);

    if (!project) {
      console.error(`❌ Project ${PROJECT_ID} not found`);
      return false;
    }

    console.log(`✅ Found project: ${project.name}`);

    const buildMetadata = {
      buildId: BUILD_ID,
      timestamp: new Date().toISOString(),
      componentCount: 15,
      fileCount: 92,
      status: 'completed',
      buildDirectory: BUILD_DIR,
      duration: 0,
    };

    if (!project.builds) {
      project.builds = [];
    }

    const existingBuildIndex = project.builds.findIndex(b => b.buildId === BUILD_ID);

    if (existingBuildIndex >= 0) {
      console.log('📝 Build already exists, updating metadata...');
      project.builds[existingBuildIndex] = buildMetadata;
    } else {
      console.log('➕ Adding new build to project...');
      project.builds.unshift(buildMetadata);
    }

    project.status = 'completed';
    project.currentPhase = 'complete';
    project.lastBuildId = BUILD_ID;

    project.phaseProgress = {
      prd: true,
      plan: true,
      build: true,
    };

    project.updatedAt = new Date().toISOString();

    const projectIndex = projects.findIndex(p => p.id === PROJECT_ID);
    projects[projectIndex] = project;

    localStorage.setItem('buildrunner_projects', JSON.stringify(projects));

    console.log('✅ Project restored successfully!');
    console.log('📊 Project status:', {
      name: project.name,
      status: project.status,
      currentPhase: project.currentPhase,
      lastBuildId: project.lastBuildId,
      buildsCount: project.builds.length,
    });

    return true;
  } catch (error) {
    console.error('❌ Error restoring project:', error);
    return false;
  }
}

// Run the restoration
restoreProject();
```

4. Press Enter
5. The script will run and show you the restoration status
6. Refresh the page to see your project showing as "Complete"
7. Click on the project to be automatically redirected to the build

#### Option 2: Node.js (Alternative)

```bash
# Not recommended for browser localStorage manipulation
# Use the browser console method instead
```

### What This Script Does

1. **Finds Project**: Locates project with ID "1" in localStorage
2. **Links Build**: Associates build `1762055895639-ctpi588xt` with the project
3. **Updates Status**: Sets project status to "completed"
4. **Sets Phase**: Marks currentPhase as "complete"
5. **Adds Progress**: Marks all phases (PRD, Plan, Build) as complete
6. **Sets Last Build**: Stores the build ID for auto-redirect

### Expected Output

```
🔧 Starting project restoration...
✅ Found project: BuildRunner SaaS
➕ Adding new build to project...
✅ Project restored successfully!
📊 Project status: {
  name: 'BuildRunner SaaS',
  status: 'completed',
  currentPhase: 'complete',
  lastBuildId: '1762055895639-ctpi588xt',
  buildsCount: 1
}
```

### After Restoration

1. Navigate to `/projects` page
2. Your project should show a green "Complete" badge
3. Click "Resume" to open the completed build
4. You'll be redirected to `/workbench?buildId=1762055895639-ctpi588xt&restore=true`
5. The build with 92 files will load automatically

### Troubleshooting

**Project not found:**
- Check that you have at least one project in BuildRunner
- Verify the project ID in localStorage: `localStorage.getItem('buildrunner_projects')`

**Build directory doesn't exist:**
- Verify the build exists at `apps/web/builds/1/1762055895639-ctpi588xt/`
- Check file count: `find apps/web/builds/1/1762055895639-ctpi588xt -type f | wc -l`

**Project not showing as complete:**
- Clear browser cache and refresh
- Check the project data: `JSON.parse(localStorage.getItem('buildrunner_projects'))[0]`

### Manual Verification

After running the script, you can verify the restoration:

```javascript
// Check project data
const projects = JSON.parse(localStorage.getItem('buildrunner_projects'));
const project = projects.find(p => p.id === '1');
console.log('Current Phase:', project.currentPhase);
console.log('Status:', project.status);
console.log('Last Build ID:', project.lastBuildId);
console.log('Builds:', project.builds);
```

All values should match the expected output above.
