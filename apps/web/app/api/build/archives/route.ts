import { NextRequest, NextResponse } from 'next/server';
import { projectArchiver } from '@/lib/project-archive';

/**
 * GET /api/build/archives
 * List all archived projects
 */
export async function GET(request: NextRequest) {
  try {
    const archives = await projectArchiver.listArchives();

    return NextResponse.json({
      success: true,
      archives,
      count: archives.length,
    });
  } catch (error) {
    console.error('Error listing archives:', error);
    return NextResponse.json(
      { error: `Failed to list archives: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/build/archives?archiveId=xxx
 * Permanently delete an archive
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const archiveId = searchParams.get('archiveId');

    if (!archiveId) {
      return NextResponse.json(
        { error: 'archiveId is required' },
        { status: 400 }
      );
    }

    await projectArchiver.deleteArchive(archiveId);

    return NextResponse.json({
      success: true,
      message: `Archive ${archiveId} permanently deleted`,
    });
  } catch (error) {
    console.error('Error deleting archive:', error);
    return NextResponse.json(
      { error: `Failed to delete archive: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
