import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    console.log('🧹 Cleaning up builds for project:', projectId);

    // Delete the project's build directory
    const buildsDir = path.join(process.cwd(), 'builds', projectId);

    try {
      await fs.access(buildsDir);
      await fs.rm(buildsDir, { recursive: true, force: true });
      console.log(`✅ Deleted build directory: ${buildsDir}`);
    } catch (error) {
      // Directory doesn't exist, that's fine
      console.log(`ℹ️  Build directory doesn't exist: ${buildsDir}`);
    }

    // Clean up localStorage keys (instructing client to do this)
    return NextResponse.json({
      success: true,
      message: `Build directory cleaned up for project ${projectId}`,
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
