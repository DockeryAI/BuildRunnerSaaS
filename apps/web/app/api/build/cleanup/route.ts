import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { projectArchiver } from '@/lib/project-archive';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, projectName, skipArchive } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    console.log('🧹 Cleaning up builds for project:', projectId);

    const buildsDir = path.join(process.cwd(), 'builds', projectId);
    const homeDir = require('os').homedir();
    const claudeProjectPath = path.join(homeDir, 'Projects', 'BuildRunnerProjects', projectName || projectId);

    let archiveMetadata = null;

    // Archive BOTH directories before deletion (unless explicitly skipped)
    if (!skipArchive) {
      try {
        console.log('📦 Archiving project (metadata + code) before deletion...');
        archiveMetadata = await projectArchiver.archiveProject(
          projectId,
          projectName || projectId,
          {
            reason: 'Project deleted by user',
          }
        );
        console.log(`✅ Project archived: ${archiveMetadata.archivePath}`);
      } catch (archiveError) {
        console.error('⚠️  Failed to archive project:', archiveError);
        // Cancel deletion if archive fails (safety first!)
        return NextResponse.json({
          success: false,
          error: 'Failed to archive project before deletion. Deletion cancelled for safety.',
          archiveError: (archiveError as Error).message,
        }, { status: 500 });
      }
    }

    // Delete BuildRunner metadata directory
    try {
      await fs.access(buildsDir);
      await fs.rm(buildsDir, { recursive: true, force: true });
      console.log(`✅ Deleted BuildRunner metadata: ${buildsDir}`);
    } catch (error) {
      console.log(`ℹ️  BuildRunner metadata doesn't exist: ${buildsDir}`);
    }

    // Delete Claude project directory
    try {
      await fs.access(claudeProjectPath);
      await fs.rm(claudeProjectPath, { recursive: true, force: true });
      console.log(`✅ Deleted Claude project code: ${claudeProjectPath}`);
    } catch (error) {
      console.log(`ℹ️  Claude project doesn't exist: ${claudeProjectPath}`);
    }

    // Clean up localStorage keys (instructing client to do this)
    return NextResponse.json({
      success: true,
      message: `Build directory cleaned up for project ${projectId}`,
      archived: !!archiveMetadata,
      archiveInfo: archiveMetadata ? {
        archivePath: path.basename(archiveMetadata.archivePath),
        size: archiveMetadata.size,
        archivedAt: archiveMetadata.archivedAt,
        gitPushed: archiveMetadata.gitPushed,
        gitPushMessage: archiveMetadata.gitPushMessage,
      } : null,
      localStorageKeysToRemove: [
        `last_build_${projectId}`,
        `build_progress_*`, // Pattern to match all build progress keys for this project
        `showPreviewButton_${projectId}_*`,
        `appType_${projectId}_*`,
      ]
    });

  } catch (error) {
    console.error('Error cleaning up builds:', error);
    return NextResponse.json(
      { error: `Failed to cleanup builds: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

// Cleanup ALL old builds (maintenance endpoint)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const olderThanDays = parseInt(searchParams.get('olderThanDays') || '7');

    console.log(`🧹 Cleaning up builds older than ${olderThanDays} days...`);

    const buildsDir = path.join(process.cwd(), 'builds');
    const projects = await fs.readdir(buildsDir);

    let deletedCount = 0;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    for (const projectId of projects) {
      if (projectId === 'README.md') continue;

      const projectDir = path.join(buildsDir, projectId);
      const stats = await fs.stat(projectDir);

      if (stats.isDirectory() && stats.mtime < cutoffDate) {
        await fs.rm(projectDir, { recursive: true, force: true });
        console.log(`✅ Deleted old project: ${projectId}`);
        deletedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} old project build directories`,
      deletedCount
    });

  } catch (error) {
    console.error('Error cleaning up old builds:', error);
    return NextResponse.json(
      { error: `Failed to cleanup old builds: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
