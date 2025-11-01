/**
 * GitHub OAuth Integration
 *
 * Allows users to authenticate with GitHub and create repositories
 * without leaving BuildRunner
 */

import type {
  GitHubRepository,
  CreateGitHubRepoRequest,
  UserConnection,
} from './types';

export class GitHubOAuthClient {
  private baseUrl = 'https://api.github.com';

  /**
   * Get GitHub OAuth authorization URL
   */
  static getAuthorizationUrl(state: string): string {
    // GitHub OAuth App credentials should be in env (BuildRunner's app, not user's)
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`;

    const scopes = [
      'repo', // Full control of repositories
      'user:email', // Access user email
      'read:org', // Read org membership
    ];

    const params = new URLSearchParams({
      client_id: clientId!,
      redirect_uri: redirectUri,
      scope: scopes.join(' '),
      state,
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  static async exchangeCodeForToken(code: string): Promise<{
    accessToken: string;
    tokenType: string;
    scope: string;
  }> {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`;

    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error_description || data.error);
    }

    return {
      accessToken: data.access_token,
      tokenType: data.token_type,
      scope: data.scope,
    };
  }

  /**
   * Get authenticated user info
   */
  async getUser(accessToken: string): Promise<{
    login: string;
    name: string;
    email: string;
    avatarUrl: string;
    bio?: string;
  }> {
    const response = await fetch(`${this.baseUrl}/user`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    const data = await response.json();

    return {
      login: data.login,
      name: data.name || data.login,
      email: data.email,
      avatarUrl: data.avatar_url,
      bio: data.bio,
    };
  }

  /**
   * Create a new repository
   */
  async createRepository(
    accessToken: string,
    request: CreateGitHubRepoRequest
  ): Promise<GitHubRepository> {
    const response = await fetch(`${this.baseUrl}/user/repos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: request.name,
        description: request.description,
        private: request.private ?? true,
        auto_init: request.autoInit ?? true,
        gitignore_template: request.gitignoreTemplate,
        license_template: request.licenseTemplate,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create repository');
    }

    const data = await response.json();

    return {
      id: data.id,
      name: data.name,
      fullName: data.full_name,
      private: data.private,
      htmlUrl: data.html_url,
      defaultBranch: data.default_branch,
      createdAt: data.created_at,
    };
  }

  /**
   * List user's repositories
   */
  async listRepositories(
    accessToken: string,
    options?: {
      type?: 'all' | 'owner' | 'member';
      sort?: 'created' | 'updated' | 'pushed' | 'full_name';
      per_page?: number;
    }
  ): Promise<GitHubRepository[]> {
    const params = new URLSearchParams({
      type: options?.type || 'owner',
      sort: options?.sort || 'updated',
      per_page: String(options?.per_page || 30),
    });

    const response = await fetch(`${this.baseUrl}/user/repos?${params}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to list repositories');
    }

    const data = await response.json();

    return data.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      private: repo.private,
      htmlUrl: repo.html_url,
      defaultBranch: repo.default_branch,
      createdAt: repo.created_at,
    }));
  }

  /**
   * Create or update a file in a repository
   */
  async createOrUpdateFile(
    accessToken: string,
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    branch?: string,
    sha?: string // Required for updates
  ): Promise<void> {
    const encodedContent = Buffer.from(content).toString('base64');

    const body: any = {
      message,
      content: encodedContent,
      branch: branch || 'main',
    };

    if (sha) {
      body.sha = sha;
    }

    const response = await fetch(
      `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create/update file');
    }
  }

  /**
   * Create multiple files in a repository (via tree API for batch)
   */
  async createMultipleFiles(
    accessToken: string,
    owner: string,
    repo: string,
    files: Array<{ path: string; content: string }>,
    commitMessage: string,
    branch: string = 'main'
  ): Promise<void> {
    // Get the latest commit SHA
    const refResponse = await fetch(
      `${this.baseUrl}/repos/${owner}/${repo}/git/refs/heads/${branch}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!refResponse.ok) {
      throw new Error('Failed to get branch reference');
    }

    const refData = await refResponse.json();
    const latestCommitSha = refData.object.sha;

    // Create blobs for each file
    const blobs = await Promise.all(
      files.map(async (file) => {
        const blobResponse = await fetch(
          `${this.baseUrl}/repos/${owner}/${repo}/git/blobs`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content: Buffer.from(file.content).toString('base64'),
              encoding: 'base64',
            }),
          }
        );

        const blobData = await blobResponse.json();
        return {
          path: file.path,
          mode: '100644',
          type: 'blob',
          sha: blobData.sha,
        };
      })
    );

    // Create tree
    const treeResponse = await fetch(
      `${this.baseUrl}/repos/${owner}/${repo}/git/trees`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base_tree: latestCommitSha,
          tree: blobs,
        }),
      }
    );

    const treeData = await treeResponse.json();

    // Create commit
    const commitResponse = await fetch(
      `${this.baseUrl}/repos/${owner}/${repo}/git/commits`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: commitMessage,
          tree: treeData.sha,
          parents: [latestCommitSha],
        }),
      }
    );

    const commitData = await commitResponse.json();

    // Update branch reference
    await fetch(
      `${this.baseUrl}/repos/${owner}/${repo}/git/refs/heads/${branch}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sha: commitData.sha,
          force: false,
        }),
      }
    );
  }

  /**
   * Initialize repository with common project structure
   */
  async initializeProjectStructure(
    accessToken: string,
    owner: string,
    repo: string,
    projectType: 'nextjs' | 'react' | 'node' | 'python'
  ): Promise<void> {
    const files: Array<{ path: string; content: string }> = [];

    // Add .gitignore
    files.push({
      path: '.gitignore',
      content: this.getGitignoreTemplate(projectType),
    });

    // Add README
    files.push({
      path: 'README.md',
      content: `# ${repo}\n\nGenerated by BuildRunner\n\n## Getting Started\n\nTODO: Add setup instructions\n`,
    });

    // Add package.json for Node projects
    if (projectType === 'nextjs' || projectType === 'react' || projectType === 'node') {
      files.push({
        path: 'package.json',
        content: JSON.stringify(
          {
            name: repo,
            version: '0.1.0',
            private: true,
            scripts: {},
            dependencies: {},
            devDependencies: {},
          },
          null,
          2
        ),
      });
    }

    await this.createMultipleFiles(
      accessToken,
      owner,
      repo,
      files,
      'Initial commit - project structure'
    );
  }

  private getGitignoreTemplate(projectType: string): string {
    const common = `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
build/
dist/

# Environment
.env
.env.local
.env*.local

# Logs
*.log

# OS
.DS_Store
Thumbs.db`;

    if (projectType === 'nextjs') {
      return `${common}

# Next.js
.next/
out/
.vercel/`;
    }

    if (projectType === 'python') {
      return `${common}

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/`;
    }

    return common;
  }
}

export const githubOAuth = new GitHubOAuthClient();
