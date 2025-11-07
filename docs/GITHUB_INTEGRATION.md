# GitHub Integration & Project Management

**Version:** 1.0.0
**Status:** ✅ Active

---

## Overview

Claude Builder now automatically creates projects in `~/Projects`, initializes them with BuildRunner, creates GitHub repositories, and keeps them synced.

## What Happens Automatically

When you export a PRD from the BuildRunnerSaaS UI:

### 1. Project Creation
- **Location**: `~/Projects/{ProjectName}` (not ~/Projects/BuildRunnerProjects)
- PRD.md and other files are copied from BuildRunnerProjects
- Project directory is created if it doesn't exist

### 2. Git Initialization
- Git repository is initialized
- Main branch created (not master)
- `.gitignore` file created with sensible defaults:
  - node_modules/
  - .env files
  - build/dist directories
  - logs and cache

### 3. GitHub Repository Creation
- Private repository created on GitHub
- Named exactly as your project
- Remote origin set automatically
- Uses GitHub CLI (`gh`) for creation

**Requirements:**
- GitHub CLI installed: `brew install gh`
- Authenticated: `gh auth login`
- Token with `repo` scope

### 4. BuildRunner Initialization
- `.buildrunner` directory created
- `features.json` initialized
- BuildRunner config set up

If `buildrunner` command exists, it will run `buildrunner init`. Otherwise, it creates the basic structure manually.

### 5. Initial Commit
- README.md created with project info
- All files committed
- Pushed to GitHub automatically
- Commit message: "Initial commit: Project initialized by Claude Builder"

### 6. Auto-Sync After Build
After each successful build:
- All changes are staged (`git add -A`)
- Committed with message: "Build completed: {ProjectName}"
- Automatically pushed to GitHub
- Commit includes "🤖 Auto-synced by Claude Builder" footer

---

## Complete Workflow

```
1. User creates PRD in BuildRunnerSaaS UI
   ↓
2. Clicks "Export PRD" → "🤖 Export to Claude Builder"
   ↓
3. PRD written to ~/Projects/BuildRunnerProjects/{ProjectName}/PRD.md
   ↓
4. Daemon detects change
   ↓
5. ProjectInitializer runs:
   - Creates ~/Projects/{ProjectName}
   - Copies PRD and related files
   - Initializes git repo
   - Creates GitHub repo (private)
   - Sets up BuildRunner
   - Initial commit & push
   ↓
6. Claude CLI spawned in ~/Projects/{ProjectName}
   - Reads PRD.md
   - Builds project according to PRD
   - Updates BUILD_STATUS.md as it works
   ↓
7. Build completes
   ↓
8. Auto-sync to GitHub:
   - git add -A
   - git commit -m "Build completed..."
   - git push origin main
```

---

## File Locations

### PRD Source (Watched by Daemon)
```
~/Projects/BuildRunnerProjects/{ProjectName}/
├── PRD.md                 # Source of truth
├── BUILD_STATUS.md        # Build progress
├── BUGS.md               # Bug tracking
└── FEATURE_REQUESTS.md   # Feature requests
```

### Actual Project (Built by Claude)
```
~/Projects/{ProjectName}/
├── .git/                 # Git repository
├── .buildrunner/         # BuildRunner config
├── .gitignore
├── README.md
├── PRD.md               # Copied from source
├── BUILD_STATUS.md      # Synced during build
├── package.json         # Created by Claude
├── src/                 # Built by Claude
└── ... (rest of project)
```

---

## GitHub Repository Details

### Repository Settings
- **Visibility**: Private (default)
- **Default branch**: main
- **Remote**: origin
- **Protocol**: HTTPS (via gh CLI)

### Auto-Commit Messages
```
Initial commit:
"Initial commit: Project initialized by Claude Builder"

Build completion:
"Build completed: {ProjectName}

🤖 Auto-synced by Claude Builder"

Custom syncs (future):
"{Your custom message}

🤖 Auto-synced by Claude Builder"
```

### GitHub Username
Auto-detected from `gh` CLI:
```bash
gh api user --jq .login
```

---

## Manual Operations

### View Project on GitHub
```bash
cd ~/Projects/{ProjectName}
gh repo view --web
```

### Manual Sync (if needed)
```bash
cd ~/Projects/{ProjectName}
git add -A
git commit -m "Manual changes"
git push origin main
```

### Change Visibility
```bash
cd ~/Projects/{ProjectName}
gh repo edit --visibility public
```

### Delete Repository
```bash
gh repo delete {username}/{ProjectName}
```

---

## Troubleshooting

### GitHub Repo Not Created

**Problem**: Daemon logs show "GitHub CLI (gh) not installed"

**Solution**:
```bash
# Install GitHub CLI
brew install gh

# Authenticate
gh auth login

# Restart daemon
cd ~/.claude-builder
node cli.js stop-daemon
node cli.js start-daemon
```

### Authentication Failed

**Problem**: "gh repo create" fails with authentication error

**Solution**:
```bash
# Re-authenticate with repo scope
gh auth login --scopes repo

# Or refresh token
gh auth refresh
```

### Push Failed

**Problem**: Build completes but push to GitHub fails

**Causes:**
1. No GitHub repo exists
2. Not authenticated
3. No internet connection
4. Branch protection rules

**Solution**:
```bash
# Check remote
cd ~/Projects/{ProjectName}
git remote -v

# If no remote, create repo manually
gh repo create {ProjectName} --private --source=. --remote=origin

# Try push again
git push origin main
```

### Wrong GitHub Account

**Problem**: Repo created under wrong GitHub account

**Solution**:
```bash
# Check current account
gh auth status

# Switch accounts
gh auth logout
gh auth login
```

---

## Configuration

### Change Default Visibility

Edit `~/.claude-builder/project-initializer.js`:

```javascript
// Change this line:
execSync(`gh repo create ${this.projectName} --private --source=. --remote=origin`, {

// To public:
execSync(`gh repo create ${this.projectName} --public --source=. --remote=origin`, {
```

### Disable Auto-Sync

Edit `~/.claude-builder/daemon.js`:

Comment out the auto-sync section in the `claude.on('close')` handler:

```javascript
// Auto-sync to GitHub
// const initializer = new ProjectInitializer(this.projectName, this.logger);
// const syncResult = await initializer.sync(`Build completed: ${this.projectName}`);
```

### Change Project Location

Edit `~/.claude-builder/project-initializer.js`:

```javascript
// Change this line in constructor:
this.projectPath = path.join(this.homeDir, 'Projects', projectName);

// To your preferred location:
this.projectPath = path.join(this.homeDir, 'MyCustomFolder', projectName);
```

---

## API Usage (Advanced)

### Using ProjectInitializer Programmatically

```javascript
const ProjectInitializer = require('~/.claude-builder/project-initializer');
const logger = console; // or your logger

const initializer = new ProjectInitializer('MyProject', logger);

// Initialize project
const result = await initializer.initialize();
if (result.success) {
  console.log('Project created at:', result.projectPath);
}

// Sync changes
const syncResult = await initializer.sync('My custom commit message');
```

---

## Best Practices

### 1. Use Meaningful Project Names
- Project name becomes GitHub repo name
- Use kebab-case: `my-awesome-app`
- Avoid special characters

### 2. Review Before First Push
- Check `.gitignore` includes sensitive files
- Review README.md
- Verify no secrets in initial commit

### 3. Branch Strategy
- Default branch is `main`
- Create feature branches for major changes
- Keep `main` for production-ready code

### 4. Regular Syncs
- Builds auto-sync on completion
- Manually sync during development
- Don't let local changes pile up

### 5. GitHub Settings
- Enable branch protection on `main`
- Set up GitHub Actions for CI/CD
- Configure repo secrets for deployments

---

## Future Enhancements

### Phase 4 (Planned)
- [ ] Custom commit message templates
- [ ] Branch creation for features
- [ ] Pull request automation
- [ ] GitHub Issues integration
- [ ] GitHub Actions workflow generation
- [ ] Multi-remote support (GitLab, Bitbucket)
- [ ] Conflict resolution automation
- [ ] Team collaboration features

---

## FAQ

**Q: Why two directories (BuildRunnerProjects and Projects)?**
A: BuildRunnerProjects is for PRD management and UI monitoring. Projects is where actual code lives and gets pushed to GitHub.

**Q: Can I use an existing GitHub repo?**
A: Yes, the initializer checks if repo exists before creating. If it exists, it just sets up the remote.

**Q: What if I don't have GitHub CLI?**
A: Project will still be created and built, but GitHub repo creation will be skipped. You can create it manually later.

**Q: Is everything private by default?**
A: Yes, all repos are created as private. Change to public in settings or via `gh repo edit`.

**Q: Can I customize the auto-commit messages?**
A: Currently no, but this is planned for Phase 4. You can manually edit the code in daemon.js for now.

**Q: What happens if git push fails?**
A: Build completes successfully. The error is logged. You can manually push later with `git push origin main`.

---

## Support

**Logs**: Check daemon logs for GitHub-related errors:
```bash
cd ~/.claude-builder
node cli.js logs | grep -i github
```

**GitHub CLI Help**:
```bash
gh --help
gh repo --help
gh auth --help
```

**Issue Reporting**: If something goes wrong, capture logs and report at:
- GitHub Issues: [your-repo]/issues
- Daemon logs: `~/.claude-builder/logs/daemon.log`

---

**Happy Building! 🚀**

Your projects are now automatically backed up to GitHub and ready for collaboration!
