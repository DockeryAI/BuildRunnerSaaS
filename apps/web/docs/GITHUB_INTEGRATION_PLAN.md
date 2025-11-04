# GitHub Integration - Complete Implementation Plan

**Priority:** P1 (After Enhanced Preview Mode)
**Status:** Planning
**Date:** 2025-11-04
**Estimated Time:** 4-6 weeks

---

## Executive Summary

GitHub integration is a **critical architectural enhancement** that transforms BuildRunner from a code generator into a complete development platform. This feature solves multiple fundamental problems:

1. **State Management** - Version control for all generated code
2. **Collaboration** - Enable human-AI teamwork
3. **Learning System** - Cross-project pattern analysis
4. **Enterprise Readiness** - Audit trails and compliance

---

## Why This is Essential

### Problem 1: The "State Problem"

**Current Limitations:**
- BuildRunner generates code in isolation
- No version history
- Can't track changes between builds
- No rollback capability
- AI has no memory of previous iterations

**With GitHub Integration:**
- Every build becomes a commit/branch
- Complete evolution history
- Diff between versions
- Easy rollback to working versions
- AI can read commit history for context

### Problem 2: Collaboration Gap

**Current Limitations:**
- Single user building in isolation
- No way to share progress
- Can't collaborate with human developers
- No code review process

**With GitHub Integration:**
- PRs for each feature addition
- Human developers can contribute
- Code review by team members
- Fork and improve patterns

### Problem 3: Learning System Effectiveness

**Current Learning:**
- Patterns stored locally only
- No cross-project learning
- Can't learn from community

**With GitHub Integration:**
- Analyze successful repos
- Learn from stars/forks
- Track which patterns succeed
- Community contributions

---

## Implementation Phases

## Phase 1: Basic Integration (Week 1)

### 1.1 Core GitHub Service

**File:** `apps/web/lib/github-integration.ts`

```typescript
import { Octokit } from '@octokit/rest';

export interface GitHubConfig {
  token: string;
  owner: string;
  defaultBranch: string;
}

export interface BuildResult {
  files: Record<string, string>;
  testsPass: boolean;
  buildSummary: string;
}

export interface BuildHistory {
  id: string;
  message: string;
  timestamp: string;
  changes: {
    additions: number;
    deletions: number;
    total: number;
  };
  buildData: any;
}

export class GitHubIntegration {
  private octokit: Octokit;
  private owner: string;
  private repoName: string;

  constructor(config: GitHubConfig) {
    this.octokit = new Octokit({ auth: config.token });
    this.owner = config.owner;
  }

  /**
   * Initialize a new GitHub repository for a BuildRunner project
   */
  async initializeProject(projectId: string, prd: any) {
    console.log(`🚀 Initializing GitHub repo for project: ${projectId}`);

    // Create repo from PRD name
    const repo = await this.octokit.repos.createForAuthenticatedUser({
      name: `${prd.projectName}-buildrunner`,
      description: prd.description,
      private: true,
      auto_init: true,
      gitignore_template: 'Node',
      license_template: 'mit',
    });

    console.log(`✅ Created repo: ${repo.data.html_url}`);

    // Create initial structure
    await this.createInitialStructure(repo.data.full_name);

    // Store PRD as README
    await this.commitFile(
      repo.data.full_name,
      'PRD.md',
      this.formatPRDAsMarkdown(prd),
      'Initial PRD documentation'
    );

    // Create .buildrunner config
    await this.commitFile(
      repo.data.full_name,
      '.buildrunner/config.json',
      JSON.stringify({
        version: '1.0.0',
        projectId,
        createdAt: new Date().toISOString(),
        framework: prd.framework || 'nextjs',
      }, null, 2),
      'Add BuildRunner configuration'
    );

    return repo.data;
  }

  /**
   * Commit a build result to GitHub
   */
  async commitBuild(
    projectId: string,
    buildResult: BuildResult,
    message?: string
  ) {
    const branch = `build-${Date.now()}`;

    console.log(`📝 Creating branch: ${branch}`);

    // Create branch for this build
    await this.createBranch(projectId, branch);

    // Commit all generated files
    const commitPromises = Object.entries(buildResult.files).map(([path, content]) =>
      this.commitFile(
        projectId,
        path,
        content,
        `Generated: ${path}`
      )
    );

    await Promise.all(commitPromises);

    // Create PR with build summary
    const pr = await this.createPullRequest(projectId, {
      title: message || `Build: ${new Date().toISOString()}`,
      body: this.generatePRDescription(buildResult),
      base: 'main',
      head: branch,
    });

    console.log(`✅ Created PR: ${pr.data.html_url}`);

    // Auto-merge if tests pass
    if (buildResult.testsPass) {
      console.log('✅ Tests passed, auto-merging...');
      await this.autoMerge(pr.data);
    }

    return pr.data;
  }

  /**
   * Get build history from GitHub commits
   */
  async getBuildHistory(projectId: string): Promise<BuildHistory[]> {
    const commits = await this.octokit.repos.listCommits({
      owner: this.owner,
      repo: this.getRepoName(projectId),
      per_page: 50,
    });

    return commits.data.map(commit => ({
      id: commit.sha,
      message: commit.commit.message,
      timestamp: commit.commit.author?.date || '',
      changes: {
        additions: commit.stats?.additions || 0,
        deletions: commit.stats?.deletions || 0,
        total: commit.stats?.total || 0,
      },
      buildData: this.extractBuildData(commit),
    }));
  }

  /**
   * Rollback to a specific commit
   */
  async rollbackToBuild(projectId: string, commitSha: string) {
    console.log(`⏮️  Rolling back to commit: ${commitSha}`);

    const repoName = this.getRepoName(projectId);

    // Create revert commit
    await this.octokit.repos.createCommit({
      owner: this.owner,
      repo: repoName,
      message: `Rollback to ${commitSha}`,
      tree: commitSha,
      parents: ['HEAD'],
    });

    console.log(`✅ Rolled back successfully`);
  }

  // Helper methods

  private async createInitialStructure(repoFullName: string) {
    const [owner, repo] = repoFullName.split('/');

    const structure = [
      { path: 'src/.gitkeep', content: '' },
      { path: 'tests/.gitkeep', content: '' },
      { path: 'docs/.gitkeep', content: '' },
      { path: '.buildrunner/.gitkeep', content: '' },
    ];

    for (const file of structure) {
      await this.commitFile(repoFullName, file.path, file.content, 'Initial structure');
    }
  }

  private async commitFile(
    repoFullName: string,
    path: string,
    content: string,
    message: string
  ) {
    const [owner, repo] = repoFullName.split('/');

    try {
      // Try to get existing file (for updates)
      const { data: existingFile } = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
      });

      // Update existing file
      await this.octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: Buffer.from(content).toString('base64'),
        sha: Array.isArray(existingFile) ? undefined : existingFile.sha,
      });
    } catch (error) {
      // File doesn't exist, create it
      await this.octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: Buffer.from(content).toString('base64'),
      });
    }
  }

  private async createBranch(projectId: string, branchName: string) {
    const repoName = this.getRepoName(projectId);

    // Get main branch ref
    const { data: ref } = await this.octokit.git.getRef({
      owner: this.owner,
      repo: repoName,
      ref: 'heads/main',
    });

    // Create new branch
    await this.octokit.git.createRef({
      owner: this.owner,
      repo: repoName,
      ref: `refs/heads/${branchName}`,
      sha: ref.object.sha,
    });
  }

  private async createPullRequest(projectId: string, options: {
    title: string;
    body: string;
    base: string;
    head: string;
  }) {
    const repoName = this.getRepoName(projectId);

    return this.octokit.pulls.create({
      owner: this.owner,
      repo: repoName,
      title: options.title,
      body: options.body,
      base: options.base,
      head: options.head,
    });
  }

  private async autoMerge(pr: any) {
    await this.octokit.pulls.merge({
      owner: pr.base.repo.owner.login,
      repo: pr.base.repo.name,
      pull_number: pr.number,
      merge_method: 'squash',
    });
  }

  private generatePRDescription(buildResult: BuildResult): string {
    return `
## BuildRunner Auto-Build

**Status:** ${buildResult.testsPass ? '✅ Tests Passed' : '❌ Tests Failed'}

### Files Changed
${Object.keys(buildResult.files).map(path => `- \`${path}\``).join('\n')}

### Build Summary
${buildResult.buildSummary}

---
*Generated by BuildRunner - AI-Powered Development Platform*
    `.trim();
  }

  private formatPRDAsMarkdown(prd: any): string {
    return `# ${prd.projectName}

## Description
${prd.description}

## Target Audience
${prd.targetAudience || 'Not specified'}

## Key Features
${prd.features?.map((f: any) => `- ${f.name}: ${f.description}`).join('\n') || 'No features specified'}

## Technical Stack
- Framework: ${prd.framework || 'Not specified'}
- Database: ${prd.database || 'Not specified'}
- Authentication: ${prd.authentication || 'Not specified'}

---
*Generated by BuildRunner*
    `.trim();
  }

  private extractBuildData(commit: any): any {
    // Parse build metadata from commit message
    try {
      const match = commit.commit.message.match(/\[BuildRunner:(.+?)\]/);
      if (match) {
        return JSON.parse(match[1]);
      }
    } catch (e) {
      // Ignore parse errors
    }
    return null;
  }

  private getRepoName(projectId: string): string {
    return `buildrunner-${projectId}`;
  }
}
```

### 1.2 API Routes

**File:** `apps/web/app/api/github/init/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { GitHubIntegration } from '@/lib/github-integration';

export async function POST(request: NextRequest) {
  try {
    const { projectId, prd, githubToken } = await request.json();

    if (!githubToken) {
      return NextResponse.json(
        { error: 'GitHub token required' },
        { status: 400 }
      );
    }

    const github = new GitHubIntegration({
      token: githubToken,
      owner: 'user', // From authenticated user
      defaultBranch: 'main',
    });

    const repo = await github.initializeProject(projectId, prd);

    return NextResponse.json({
      success: true,
      repo: {
        url: repo.html_url,
        name: repo.name,
        fullName: repo.full_name,
      },
    });
  } catch (error) {
    console.error('GitHub init error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to initialize GitHub repo' },
      { status: 500 }
    );
  }
}
```

**File:** `apps/web/app/api/github/commit/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { GitHubIntegration } from '@/lib/github-integration';

export async function POST(request: NextRequest) {
  try {
    const { projectId, buildResult, githubToken } = await request.json();

    const github = new GitHubIntegration({
      token: githubToken,
      owner: 'user',
      defaultBranch: 'main',
    });

    const pr = await github.commitBuild(projectId, buildResult);

    return NextResponse.json({
      success: true,
      pr: {
        url: pr.html_url,
        number: pr.number,
      },
    });
  } catch (error) {
    console.error('GitHub commit error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to commit to GitHub' },
      { status: 500 }
    );
  }
}
```

---

## Phase 2: Smart Branching Strategy (Week 2)

### 2.1 PRD-Driven Branching

**File:** `apps/web/lib/github-prd-sync.ts`

```typescript
import { GitHubIntegration } from './github-integration';

export interface PRDDelta {
  addedBlocks: Array<{ name: string; type: string; description: string }>;
  removedBlocks: string[];
  modifiedBlocks: Array<{ name: string; changes: string }>;
  dependencies: string[];
}

export type BranchStrategy = 'feature' | 'hotfix' | 'experiment';

export class GitHubPRDSync {
  constructor(private github: GitHubIntegration) {}

  /**
   * Sync PRD changes to GitHub with appropriate branching strategy
   */
  async syncPRDChange(projectId: string, prdDelta: PRDDelta) {
    const branchStrategy = this.determineBranchStrategy(prdDelta);

    console.log(`📋 PRD change detected: ${branchStrategy} branch`);

    switch (branchStrategy) {
      case 'feature':
        return await this.createFeatureBranch(projectId, prdDelta);

      case 'hotfix':
        return await this.createHotfixBranch(projectId, prdDelta);

      case 'experiment':
        return await this.createExperimentalBranch(projectId, prdDelta);
    }
  }

  /**
   * Determine appropriate branch strategy based on PRD changes
   */
  private determineBranchStrategy(delta: PRDDelta): BranchStrategy {
    // Critical fixes = hotfix
    if (delta.addedBlocks.some(b => b.name.toLowerCase().includes('fix'))) {
      return 'hotfix';
    }

    // Major architectural changes = experiment
    if (delta.modifiedBlocks.length > 5 || delta.removedBlocks.length > 3) {
      return 'experiment';
    }

    // Default = feature
    return 'feature';
  }

  /**
   * Create feature branch for new PRD feature
   */
  private async createFeatureBranch(projectId: string, delta: PRDDelta) {
    const featureName = delta.addedBlocks[0].name
      .toLowerCase()
      .replace(/\s+/g, '-');

    const branchName = `feature/${featureName}`;

    console.log(`🌿 Creating feature branch: ${branchName}`);

    // Generate only the new feature
    const featureCode = await this.buildFeature(delta.addedBlocks[0]);

    // Create PR with preview link
    const pr = await this.github.createPullRequest(projectId, {
      title: `Feature: ${delta.addedBlocks[0].name}`,
      body: this.generateFeaturePRBody(delta, projectId, branchName),
      base: 'main',
      head: branchName,
    });

    return pr;
  }

  /**
   * Create hotfix branch for critical fixes
   */
  private async createHotfixBranch(projectId: string, delta: PRDDelta) {
    const branchName = `hotfix/${Date.now()}`;

    console.log(`🔥 Creating hotfix branch: ${branchName}`);

    // Generate fix code
    const hotfixCode = await this.buildHotfix(delta);

    // Create PR with urgent flag
    const pr = await this.github.createPullRequest(projectId, {
      title: `[URGENT] Hotfix: ${delta.addedBlocks[0].name}`,
      body: this.generateHotfixPRBody(delta),
      base: 'main',
      head: branchName,
    });

    return pr;
  }

  /**
   * Create experimental branch for major changes
   */
  private async createExperimentalBranch(projectId: string, delta: PRDDelta) {
    const branchName = `experiment/${Date.now()}`;

    console.log(`🧪 Creating experimental branch: ${branchName}`);

    // Generate experimental code
    const experimentCode = await this.buildExperiment(delta);

    // Create PR with review required flag
    const pr = await this.github.createPullRequest(projectId, {
      title: `[EXPERIMENT] ${delta.addedBlocks[0].name}`,
      body: this.generateExperimentPRBody(delta),
      base: 'main',
      head: branchName,
    });

    return pr;
  }

  // Helper methods

  private async buildFeature(block: any) {
    // TODO: Integrate with BuildOrchestrator
    return {};
  }

  private async buildHotfix(delta: PRDDelta) {
    // TODO: Integrate with BuildOrchestrator
    return {};
  }

  private async buildExperiment(delta: PRDDelta) {
    // TODO: Integrate with BuildOrchestrator
    return {};
  }

  private generateFeaturePRBody(delta: PRDDelta, projectId: string, branchName: string): string {
    return `
## New Feature Added to PRD

**Preview**: https://preview.buildrunner.com/${projectId}/${branchName}

### Changes:
${delta.addedBlocks.map(b => `- Added ${b.type} component: **${b.name}**`).join('\n')}

### Dependencies:
${delta.dependencies.length > 0 ? delta.dependencies.join(', ') : 'None'}

### Testing Checklist:
- [ ] Component renders without errors
- [ ] No console errors in browser
- [ ] Integrates with existing features
- [ ] Responsive design works on mobile
- [ ] Accessibility checks pass

---
*Auto-generated by BuildRunner*
    `.trim();
  }

  private generateHotfixPRBody(delta: PRDDelta): string {
    return `
## 🔥 Critical Hotfix

### Issue:
${delta.addedBlocks[0].description}

### Fix Applied:
${delta.modifiedBlocks.map(b => `- ${b.changes}`).join('\n')}

### Testing:
- [ ] Issue is resolved
- [ ] No regressions introduced

**⚠️ Requires immediate review and merge**

---
*Auto-generated by BuildRunner*
    `.trim();
  }

  private generateExperimentPRBody(delta: PRDDelta): string {
    return `
## 🧪 Experimental Changes

**WARNING:** This PR contains major architectural changes. Thorough review required.

### Changes:
${delta.modifiedBlocks.map(b => `- Modified: ${b.name}`).join('\n')}

### Removed:
${delta.removedBlocks.map(name => `- Removed: ${name}`).join('\n')}

### Review Checklist:
- [ ] Architecture changes are sound
- [ ] Breaking changes documented
- [ ] Migration path provided
- [ ] Performance impact assessed
- [ ] Security implications reviewed

---
*Auto-generated by BuildRunner*
    `.trim();
  }
}
```

---

## Phase 3: GitHub Actions Integration (Week 3)

### 3.1 Workflow Configuration

**File:** `.github/workflows/buildrunner.yml`

```yaml
name: BuildRunner Auto-Build

on:
  push:
    paths:
      - 'PRD.md'
      - '.buildrunner/prd.json'
  workflow_dispatch:
    inputs:
      force_rebuild:
        description: 'Force full rebuild'
        required: false
        default: 'false'

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      prd_changed: ${{ steps.check.outputs.prd_changed }}
      changes: ${{ steps.diff.outputs.changes }}

    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 2

      - name: Check PRD Changes
        id: check
        run: |
          if git diff HEAD^ HEAD -- PRD.md .buildrunner/prd.json | grep -q .; then
            echo "prd_changed=true" >> $GITHUB_OUTPUT
          else
            echo "prd_changed=false" >> $GITHUB_OUTPUT
          fi

      - name: Get PRD Diff
        id: diff
        if: steps.check.outputs.prd_changed == 'true'
        run: |
          CHANGES=$(git diff HEAD^ HEAD -- PRD.md .buildrunner/prd.json)
          echo "changes<<EOF" >> $GITHUB_OUTPUT
          echo "$CHANGES" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

  trigger-build:
    needs: detect-changes
    if: needs.detect-changes.outputs.prd_changed == 'true'
    runs-on: ubuntu-latest

    steps:
      - name: Trigger BuildRunner
        id: trigger
        run: |
          RESPONSE=$(curl -X POST https://api.buildrunner.com/webhook/build \
            -H "Authorization: Bearer ${{ secrets.BUILDRUNNER_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{
              "repo": "${{ github.repository }}",
              "branch": "${{ github.ref }}",
              "commit": "${{ github.sha }}",
              "prd_changes": ${{ toJson(needs.detect-changes.outputs.changes) }}
            }')

          BUILD_ID=$(echo $RESPONSE | jq -r '.buildId')
          echo "build_id=$BUILD_ID" >> $GITHUB_OUTPUT

      - name: Wait for Build Completion
        id: wait
        run: |
          BUILD_ID="${{ steps.trigger.outputs.build_id }}"
          MAX_WAIT=3600  # 1 hour
          ELAPSED=0

          while [ $ELAPSED -lt $MAX_WAIT ]; do
            STATUS=$(curl -s https://api.buildrunner.com/builds/$BUILD_ID/status \
              -H "Authorization: Bearer ${{ secrets.BUILDRUNNER_API_KEY }}" \
              | jq -r '.status')

            echo "Build status: $STATUS (${ELAPSED}s elapsed)"

            if [ "$STATUS" = "completed" ]; then
              echo "status=success" >> $GITHUB_OUTPUT
              exit 0
            elif [ "$STATUS" = "failed" ]; then
              echo "status=failure" >> $GITHUB_OUTPUT
              exit 1
            fi

            sleep 30
            ELAPSED=$((ELAPSED + 30))
          done

          echo "status=timeout" >> $GITHUB_OUTPUT
          exit 1

      - name: Download Build Artifacts
        if: steps.wait.outputs.status == 'success'
        run: |
          curl -L https://api.buildrunner.com/builds/${{ steps.trigger.outputs.build_id }}/artifacts \
            -H "Authorization: Bearer ${{ secrets.BUILDRUNNER_API_KEY }}" \
            -o artifacts.zip

          unzip artifacts.zip -d ./

      - name: Commit Generated Code
        if: steps.wait.outputs.status == 'success'
        run: |
          git config --global user.name 'BuildRunner[bot]'
          git config --global user.email 'bot@buildrunner.com'

          git add .
          git commit -m "🤖 BuildRunner: Auto-generated from PRD changes

          Build ID: ${{ steps.trigger.outputs.build_id }}
          Commit: ${{ github.sha }}

          Co-Authored-By: BuildRunner <bot@buildrunner.com>"

          git push

      - name: Create Summary
        if: always()
        run: |
          echo "## BuildRunner Auto-Build" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Status:** ${{ steps.wait.outputs.status }}" >> $GITHUB_STEP_SUMMARY
          echo "**Build ID:** ${{ steps.trigger.outputs.build_id }}" >> $GITHUB_STEP_SUMMARY
          echo "**Branch:** ${{ github.ref }}" >> $GITHUB_STEP_SUMMARY
          echo "**Commit:** ${{ github.sha }}" >> $GITHUB_STEP_SUMMARY
```

---

## Phase 4: Community Features (Month 2)

### 4.1 Public Pattern Library

**File:** `apps/web/lib/community-patterns.ts`

```typescript
import { Octokit } from '@octokit/rest';

export interface Pattern {
  name: string;
  description: string;
  category: string;
  code: string;
  usage: string;
  tags: string[];
}

export interface CommunityPattern extends Pattern {
  stars: number;
  forks: number;
  source: string;
  author: string;
  lastUpdated: string;
}

export class CommunityPatterns {
  private octokit: Octokit;

  constructor(githubToken?: string) {
    this.octokit = new Octokit({ auth: githubToken });
  }

  /**
   * Search for BuildRunner patterns in public GitHub repos
   */
  async searchPublicPatterns(query: string): Promise<CommunityPattern[]> {
    console.log(`🔍 Searching for patterns: ${query}`);

    // Search GitHub for BuildRunner patterns
    const results = await this.octokit.search.repos({
      q: `topic:buildrunner-pattern ${query}`,
      sort: 'stars',
      order: 'desc',
      per_page: 20,
    });

    const patterns: CommunityPattern[] = [];

    for (const repo of results.data.items) {
      try {
        const pattern = await this.extractPattern(repo);
        patterns.push({
          ...pattern,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          source: repo.html_url,
          author: repo.owner.login,
          lastUpdated: repo.updated_at,
        });
      } catch (error) {
        console.warn(`Failed to extract pattern from ${repo.full_name}:`, error);
      }
    }

    return patterns;
  }

  /**
   * Contribute a pattern to the community library
   */
  async contributePattern(pattern: Pattern, githubToken: string) {
    console.log(`📤 Contributing pattern: ${pattern.name}`);

    // Create public repo for pattern
    const repo = await this.octokit.repos.createForAuthenticatedUser({
      name: `buildrunner-pattern-${pattern.name.toLowerCase().replace(/\s+/g, '-')}`,
      description: pattern.description,
      public: true,
      auto_init: true,
      topics: ['buildrunner-pattern', pattern.category, ...pattern.tags],
    });

    console.log(`✅ Created pattern repo: ${repo.data.html_url}`);

    // Add pattern files
    await this.commitPatternFiles(repo.data.full_name, pattern);

    // Submit to BuildRunner registry
    await this.submitToRegistry(repo.data);

    return repo.data;
  }

  /**
   * Fork and customize a community pattern
   */
  async forkPattern(patternRepo: string, customizations: Partial<Pattern>) {
    console.log(`🍴 Forking pattern: ${patternRepo}`);

    const [owner, repo] = patternRepo.split('/');

    // Fork the repo
    const fork = await this.octokit.repos.createFork({
      owner,
      repo,
    });

    console.log(`✅ Forked to: ${fork.data.html_url}`);

    // Apply customizations
    if (Object.keys(customizations).length > 0) {
      await this.applyCustomizations(fork.data.full_name, customizations);
    }

    return fork.data;
  }

  // Helper methods

  private async extractPattern(repo: any): Promise<Pattern> {
    const [owner, repoName] = repo.full_name.split('/');

    // Read pattern.json from repo
    const { data: patternFile } = await this.octokit.repos.getContent({
      owner,
      repo: repoName,
      path: 'pattern.json',
    });

    if ('content' in patternFile) {
      const content = Buffer.from(patternFile.content, 'base64').toString();
      return JSON.parse(content);
    }

    throw new Error('pattern.json not found');
  }

  private async commitPatternFiles(repoFullName: string, pattern: Pattern) {
    const [owner, repo] = repoFullName.split('/');

    // Create pattern.json
    await this.octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: 'pattern.json',
      message: 'Add pattern definition',
      content: Buffer.from(JSON.stringify(pattern, null, 2)).toString('base64'),
    });

    // Create README.md
    const readme = this.generatePatternReadme(pattern);
    await this.octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: 'README.md',
      message: 'Add pattern documentation',
      content: Buffer.from(readme).toString('base64'),
    });

    // Create code files
    await this.octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: 'pattern.ts',
      message: 'Add pattern implementation',
      content: Buffer.from(pattern.code).toString('base64'),
    });
  }

  private async submitToRegistry(repo: any) {
    // Submit to BuildRunner pattern registry API
    await fetch('https://api.buildrunner.com/patterns/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repoUrl: repo.html_url,
        name: repo.name,
        description: repo.description,
        topics: repo.topics,
      }),
    });
  }

  private async applyCustomizations(repoFullName: string, customizations: Partial<Pattern>) {
    const [owner, repo] = repoFullName.split('/');

    // Read current pattern
    const { data: patternFile } = await this.octokit.repos.getContent({
      owner,
      repo,
      path: 'pattern.json',
    });

    if ('content' in patternFile) {
      const currentPattern = JSON.parse(
        Buffer.from(patternFile.content, 'base64').toString()
      );

      const updatedPattern = { ...currentPattern, ...customizations };

      // Update pattern.json
      await this.octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: 'pattern.json',
        message: 'Apply customizations',
        content: Buffer.from(JSON.stringify(updatedPattern, null, 2)).toString('base64'),
        sha: patternFile.sha,
      });
    }
  }

  private generatePatternReadme(pattern: Pattern): string {
    return `# ${pattern.name}

${pattern.description}

## Category
${pattern.category}

## Usage

\`\`\`typescript
${pattern.usage}
\`\`\`

## Tags
${pattern.tags.map(tag => `\`${tag}\``).join(' ')}

---

Built with [BuildRunner](https://buildrunner.com)
    `.trim();
  }
}
```

---

## Implementation Checklist

### Week 1: Basic Integration
- [ ] Install @octokit/rest package
- [ ] Create GitHubIntegration class
- [ ] Implement initializeProject()
- [ ] Implement commitBuild()
- [ ] Implement getBuildHistory()
- [ ] Implement rollbackToBuild()
- [ ] Create API routes (/api/github/*)
- [ ] Add GitHub token to user settings
- [ ] Test with real GitHub repo

### Week 2: Smart Branching
- [ ] Create GitHubPRDSync class
- [ ] Implement branch strategy detection
- [ ] Implement feature branch creation
- [ ] Implement hotfix branch creation
- [ ] Implement experimental branch creation
- [ ] Generate PR descriptions
- [ ] Test PRD change detection
- [ ] Integrate with existing PRD system

### Week 3: GitHub Actions
- [ ] Create workflow file
- [ ] Set up PRD change detection
- [ ] Implement webhook endpoint
- [ ] Test auto-build trigger
- [ ] Test artifact download
- [ ] Test auto-commit
- [ ] Add workflow status badge
- [ ] Document setup process

### Week 4: Community Features
- [ ] Create CommunityPatterns class
- [ ] Implement pattern search
- [ ] Implement pattern contribution
- [ ] Implement pattern forking
- [ ] Create pattern registry API
- [ ] Build pattern browser UI
- [ ] Test end-to-end flow
- [ ] Write documentation

---

## UI Components

### GitHub Settings Panel

**File:** `apps/web/components/github/GitHubSettingsPanel.tsx`

```typescript
'use client';

import { useState } from 'react';

export function GitHubSettingsPanel() {
  const [token, setToken] = useState('');
  const [owner, setOwner] = useState('');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');

  const handleConnect = async () => {
    setStatus('connecting');

    try {
      const response = await fetch('/api/github/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, owner }),
      });

      if (response.ok) {
        setStatus('connected');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">GitHub Integration</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            GitHub Token
          </label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="ghp_..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            GitHub Username
          </label>
          <input
            type="text"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="username"
          />
        </div>

        <button
          onClick={handleConnect}
          disabled={!token || !owner || status === 'connecting'}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {status === 'connecting' ? 'Connecting...' : 'Connect GitHub'}
        </button>

        {status === 'connected' && (
          <div className="text-green-600">
            ✅ Connected successfully
          </div>
        )}

        {status === 'error' && (
          <div className="text-red-600">
            ❌ Connection failed
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Testing Plan

### Unit Tests
- [ ] GitHubIntegration class methods
- [ ] GitHubPRDSync branch strategy
- [ ] CommunityPatterns search/contribute
- [ ] API route handlers

### Integration Tests
- [ ] Full build → commit → PR flow
- [ ] PRD change → branch creation
- [ ] Pattern contribution → registry
- [ ] Webhook → auto-build → commit

### End-to-End Tests
- [ ] User connects GitHub account
- [ ] User creates project → repo created
- [ ] User builds project → code committed
- [ ] User searches patterns → results shown
- [ ] User contributes pattern → repo created

---

## Success Metrics

### Technical Metrics
- ✅ GitHub API calls succeed 99%+ of time
- ✅ Auto-commits happen within 5 minutes
- ✅ PR creation takes < 10 seconds
- ✅ Pattern search returns results < 2 seconds

### User Metrics
- ✅ 80%+ of users connect GitHub within first session
- ✅ 50%+ of projects have GitHub integration
- ✅ 10+ community patterns contributed per month
- ✅ 90%+ satisfaction with version control

---

## Documentation

### For Users
- [ ] "Getting Started with GitHub Integration" guide
- [ ] "How to Create a Pattern" tutorial
- [ ] "Understanding Branch Strategies" explainer
- [ ] "Troubleshooting GitHub Issues" FAQ

### For Developers
- [ ] API documentation (GitHub routes)
- [ ] Integration guide (how to extend)
- [ ] Pattern schema specification
- [ ] Webhook setup instructions

---

## Dependencies

### New Packages
```json
{
  "dependencies": {
    "@octokit/rest": "^20.0.2",
    "@octokit/auth-token": "^4.0.0"
  }
}
```

### Environment Variables
```env
# GitHub Integration
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# Pattern Registry
PATTERN_REGISTRY_URL=https://api.buildrunner.com/patterns
```

---

## Risk Mitigation

### Risk 1: GitHub API Rate Limits
**Mitigation:**
- Cache GitHub responses
- Use conditional requests (ETags)
- Implement exponential backoff
- Upgrade to GitHub App for higher limits

### Risk 2: Large Repos
**Mitigation:**
- Limit file size per commit (10MB)
- Use Git LFS for large assets
- Batch commits for multiple files
- Stream large diffs

### Risk 3: Merge Conflicts
**Mitigation:**
- Always create branches (never commit to main)
- Use PR workflow for review
- Implement conflict detection
- Provide manual resolution UI

### Risk 4: Security (Token Storage)
**Mitigation:**
- Encrypt tokens at rest
- Never log tokens
- Use short-lived tokens
- Implement token refresh flow

---

## Future Enhancements

### Phase 5: Advanced Features
- [ ] GitLab integration
- [ ] Bitbucket integration
- [ ] GitHub Copilot integration
- [ ] Code review automation
- [ ] Automated testing on PR
- [ ] Deploy preview environments
- [ ] Dependency updates via Dependabot
- [ ] Security scanning via CodeQL

---

## Questions for Review

1. Should we support GitLab/Bitbucket in Phase 1 or wait for Phase 5?
2. Do we want private pattern libraries (enterprise feature)?
3. Should GitHub integration be required or optional?
4. What's the backup plan if GitHub is down?
5. How do we handle users without GitHub accounts?

---

**Status:** Ready for implementation
**Next Steps:** Review with team → Start Phase 1 development
**Timeline:** 4-6 weeks to full production deployment
