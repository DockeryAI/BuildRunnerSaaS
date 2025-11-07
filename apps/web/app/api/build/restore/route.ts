import { NextRequest, NextResponse } from 'next/server';
import { projectArchiver } from '@/lib/project-archive';

/**
 * POST /api/build/restore
 * Restore an archived project
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { archiveId } = body;

    if (!archiveId) {
      return NextResponse.json(
        { error: 'archiveId is required' },
        { status: 400 }
      );
    }

    console.log('📦 Restoring archive:', archiveId);

    const result = await projectArchiver.restoreProject(archiveId);

    return NextResponse.json({
      success: true,
      message: `Project ${result.projectId} restored successfully`,
      projectId: result.projectId,
      restoredPath: result.restoredPath,
    });
  } catch (error) {
    console.error('Error restoring archive:', error);
    return NextResponse.json(
      { error: `Failed to restore archive: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
