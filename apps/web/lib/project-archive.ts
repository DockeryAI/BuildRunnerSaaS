import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ArchiveMetadata {
  projectId: string;
  projectName: string;
  archivedAt: string;
  archivedBy?: string;
  reason?: string;
  originalPath: string;
  archivePath: string;
  size: number;
  fileCount?: number;
  gitPushed?: boolean;
  gitPushMessage?: string;
}

export class ProjectArchiver {
  private archiveRoot: string;

  constructor(archiveRoot?: string) {
    this.archiveRoot = archiveRoot || path.join(process.cwd(), 'builds', '.archives');
  }

  /**
   * Check if directory is a git repository and push to GitHub
   */
  private async pushToGitHub(projectPath: string, projectName: string): Promise<{ pushed: boolean; message: string }> {
    try {
      // Check if it's a git repository
      await execAsync(`git -C "${projectPath}" rev-parse --git-dir 2>/dev/null`);
      console.log(`📂 Found git repository: ${projectPath}`);

      // Check for uncommitted changes
      const { stdout: statusOutput } = await execAsync(`git -C "${projectPath}" status --porcelain`);

      if (statusOutput.trim()) {
        console.log('📝 Committing uncommitted changes before archival...');

        // Add all changes
        await execAsync(`git -C "${projectPath}" add -A`);

        // Commit with archival message
        const commitMessage = `chore: Auto-commit before project archival\n\n🤖 Generated with Claude Code\nProject archived on ${new Date().toISOString()}`;
        await execAsync(`git -C "${projectPath}" commit -m "${commitMessage}"`);
        console.log('✅ Changes committed');
      }

      // Check if there's a remote
      const { stdout: remoteOutput } = await execAsync(`git -C "${projectPath}" remote -v`);

      if (remoteOutput.trim()) {
        console.log('🚀 Pushing to GitHub...');

        // Get current branch
        const { stdout: branchOutput } = await execAsync(`git -C "${projectPath}" branch --show-current`);
        const branch = branchOutput.trim();

        // Push to remote
        await execAsync(`git -C "${projectPath}" push origin ${branch}`);
        console.log(`✅ Pushed to GitHub (branch: ${branch})`);

        return { pushed: true, message: `Committed and pushed to GitHub (${branch})` };
      } else {
        console.log('⚠️  No remote configured, skipping push');
        return { pushed: false, message: 'Git repository but no remote configured' };
      }
    } catch (error) {
      const errorMessage = (error as Error).message;

      // Not a git repo - this is fine
      if (errorMessage.includes('not a git repository')) {
        console.log('ℹ️  Not a git repository, skipping GitHub push');
        return { pushed: false, message: 'Not a git repository' };
      }

      // Other git errors (auth, network, etc.)
      console.warn(`⚠️  Failed to push to GitHub: ${errorMessage}`);
      return { pushed: false, message: `Git error: ${errorMessage}` };
    }
  }

  /**
   * Archive a project directory before deletion
   * Now archives BOTH BuildRunner metadata AND Claude-generated code
   */
  async archiveProject(
    projectId: string,
    projectName: string,
    options?: {
      reason?: string;
      archivedBy?: string;
      claudeProjectPath?: string; // Path to Claude-generated code
    }
  ): Promise<ArchiveMetadata> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveName = `${projectId}-${timestamp}`;
    const projectPath = path.join(process.cwd(), 'builds', projectId);

    // Claude project path (where actual code is)
    const homeDir = require('os').homedir();
    const claudeProjectPath = options?.claudeProjectPath ||
      path.join(homeDir, 'Projects', 'BuildRunnerProjects', projectName);

    // Ensure archive directory exists
    await fs.mkdir(this.archiveRoot, { recursive: true });

    // Push to GitHub before archiving (if it's a git repo)
    let gitPushResult = null;
    try {
      await fs.access(claudeProjectPath);
      console.log('🔍 Checking for GitHub repository...');
      gitPushResult = await this.pushToGitHub(claudeProjectPath, projectName);
    } catch (error) {
      console.log('ℹ️  Claude project directory not found, skipping GitHub push');
    }

    // Check if BuildRunner metadata exists
    let hasMetadata = false;
    try {
      await fs.access(projectPath);
      hasMetadata = true;
    } catch (error) {
      console.warn(`BuildRunner metadata not found: ${projectPath}`);
    }

    // Check if Claude project exists
    let hasClaudeCode = false;
    try {
      await fs.access(claudeProjectPath);
      hasClaudeCode = true;
      console.log(`✅ Found Claude project code at: ${claudeProjectPath}`);
    } catch (error) {
      console.warn(`Claude project not found: ${claudeProjectPath}`);
    }

    if (!hasMetadata && !hasClaudeCode) {
      throw new Error(`No project files found to archive for ${projectName}`);
    }

    // Count files in both locations
    let fileCount = 0;
    try {
      if (hasMetadata) {
        const { stdout: stdout1 } = await execAsync(`find "${projectPath}" -type f 2>/dev/null | wc -l`);
        fileCount += parseInt(stdout1.trim() || '0');
      }
      if (hasClaudeCode) {
        const { stdout: stdout2 } = await execAsync(`find "${claudeProjectPath}" -type f 2>/dev/null | wc -l`);
        fileCount += parseInt(stdout2.trim() || '0');
      }
    } catch (error) {
      console.warn('Could not count files:', error);
    }

    // Create tar.gz archive with BOTH directories
    const archivePath = path.join(this.archiveRoot, `${archiveName}.tar.gz`);

    console.log(`📦 Creating archive: ${archivePath}`);
    console.log(`   - BuildRunner metadata: ${hasMetadata ? '✓' : '✗'}`);
    console.log(`   - Claude project code: ${hasClaudeCode ? '✓' : '✗'}`);

    try {
      // Build tar command to include both directories
      const tarCommands: string[] = [];

      if (hasMetadata) {
        const buildsDir = path.join(process.cwd(), 'builds');
        tarCommands.push(`-C "${buildsDir}" "${projectId}"`);
      }

      if (hasClaudeCode) {
        const projectsRoot = path.join(homeDir, 'Projects', 'BuildRunnerProjects');
        tarCommands.push(`-C "${projectsRoot}" "${projectName}"`);
      }

      // Create archive with both directories
      await execAsync(`tar -czf "${archivePath}" ${tarCommands.join(' ')}`);
      console.log(`✅ Archive created with ${fileCount} files`);
    } catch (error) {
      throw new Error(`Failed to create archive: ${(error as Error).message}`);
    }

    // Get archive size
    const stats = await fs.stat(archivePath);
    const size = stats.size;

    // Create metadata file
    const metadata: ArchiveMetadata = {
      projectId,
      projectName,
      archivedAt: new Date().toISOString(),
      archivedBy: options?.archivedBy,
      reason: options?.reason || 'Project deleted',
      originalPath: projectPath,
      archivePath,
      size,
      fileCount,
      gitPushed: gitPushResult?.pushed || false,
      gitPushMessage: gitPushResult?.message,
    };

    const metadataPath = path.join(this.archiveRoot, `${archiveName}.json`);
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    console.log(`✅ Archive created: ${path.basename(archivePath)} (${(size / 1024 / 1024).toFixed(2)} MB)`);

    return metadata;
  }

  /**
   * Restore an archived project
   */
  async restoreProject(archiveId: string): Promise<{ projectId: string; restoredPath: string }> {
    const archivePath = path.join(this.archiveRoot, `${archiveId}.tar.gz`);
    const metadataPath = path.join(this.archiveRoot, `${archiveId}.json`);

    // Check if archive exists
    try {
      await fs.access(archivePath);
      await fs.access(metadataPath);
    } catch (error) {
      throw new Error(`Archive not found: ${archiveId}`);
    }

    // Read metadata
    const metadataContent = await fs.readFile(metadataPath, 'utf-8');
    const metadata: ArchiveMetadata = JSON.parse(metadataContent);

    // Check if project directory already exists
    const restorePath = path.join(process.cwd(), 'builds', metadata.projectId);
    try {
      await fs.access(restorePath);
      throw new Error(`Project already exists: ${metadata.projectId}. Delete it first or use a different project ID.`);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error; // Re-throw if it's not a "file doesn't exist" error
      }
    }

    console.log(`📦 Restoring archive: ${archiveId}`);

    // Extract archive
    const buildsDir = path.join(process.cwd(), 'builds');
    try {
      // Extract tar.gz archive
      // -xzf: extract, gzip, file
      // -C: extract to directory
      await execAsync(`tar -xzf "${archivePath}" -C "${buildsDir}"`);
    } catch (error) {
      throw new Error(`Failed to restore archive: ${(error as Error).message}`);
    }

    console.log(`✅ Project restored: ${metadata.projectId}`);

    return {
      projectId: metadata.projectId,
      restoredPath: restorePath,
    };
  }

  /**
   * List all archived projects
   */
  async listArchives(): Promise<ArchiveMetadata[]> {
    try {
      await fs.access(this.archiveRoot);
    } catch (error) {
      return []; // No archives directory yet
    }

    const files = await fs.readdir(this.archiveRoot);
    const metadataFiles = files.filter(f => f.endsWith('.json'));

    const archives: ArchiveMetadata[] = [];

    for (const file of metadataFiles) {
      try {
        const content = await fs.readFile(path.join(this.archiveRoot, file), 'utf-8');
        const metadata: ArchiveMetadata = JSON.parse(content);
        archives.push(metadata);
      } catch (error) {
        console.error(`Failed to read metadata file ${file}:`, error);
      }
    }

    // Sort by archived date, newest first
    archives.sort((a, b) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime());

    return archives;
  }

  /**
   * Delete an archive permanently
   */
  async deleteArchive(archiveId: string): Promise<void> {
    const archivePath = path.join(this.archiveRoot, `${archiveId}.tar.gz`);
    const metadataPath = path.join(this.archiveRoot, `${archiveId}.json`);

    try {
      await fs.unlink(archivePath);
      await fs.unlink(metadataPath);
      console.log(`✅ Archive permanently deleted: ${archiveId}`);
    } catch (error) {
      throw new Error(`Failed to delete archive: ${(error as Error).message}`);
    }
  }

  /**
   * Clean up old archives (retention policy)
   */
  async cleanupOldArchives(olderThanDays: number = 30): Promise<number> {
    const archives = await this.listArchives();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    let deletedCount = 0;

    for (const archive of archives) {
      const archivedDate = new Date(archive.archivedAt);
      if (archivedDate < cutoffDate) {
        const archiveId = path.basename(archive.archivePath, '.tar.gz');
        try {
          await this.deleteArchive(archiveId);
          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete old archive ${archiveId}:`, error);
        }
      }
    }

    console.log(`🧹 Cleaned up ${deletedCount} archives older than ${olderThanDays} days`);
    return deletedCount;
  }

  /**
   * Get total size of all archives
   */
  async getArchivesSize(): Promise<{ totalSize: number; count: number }> {
    const archives = await this.listArchives();
    const totalSize = archives.reduce((sum, a) => sum + a.size, 0);
    return { totalSize, count: archives.length };
  }
}

// Singleton instance
export const projectArchiver = new ProjectArchiver();
