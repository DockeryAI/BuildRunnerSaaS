import { NextRequest, NextResponse } from 'next/server';
import { BuildFileWriter } from '../../../../lib/file-writer';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    const buildId = searchParams.get('buildId');
    const filePath = searchParams.get('file');
    const action = searchParams.get('action') || 'tree';

    if (!projectId || !buildId) {
      return NextResponse.json(
        { error: 'projectId and buildId are required' },
        { status: 400 }
      );
    }

    const fileWriter = new BuildFileWriter(projectId, buildId);

    // Check if build directory exists
    const exists = await fileWriter.exists();
    if (!exists) {
      return NextResponse.json(
        { error: 'Build directory not found' },
        { status: 404 }
      );
    }

    // Get file tree
    if (action === 'tree') {
      const tree = await fileWriter.getFileTree();
      return NextResponse.json({
        success: true,
        tree,
        buildDir: fileWriter.getBuildDir(),
      });
    }

    // Read specific file
    if (action === 'read' && filePath) {
      try {
        const content = await fileWriter.readFile(filePath);
        return NextResponse.json({
          success: true,
          file: filePath,
          content,
        });
      } catch (error) {
        return NextResponse.json(
          { error: `Failed to read file: ${(error as Error).message}` },
          { status: 404 }
        );
      }
    }

    // List all files (flat list)
    if (action === 'list') {
      const files = await fileWriter.listFiles();
      return NextResponse.json({
        success: true,
        files,
        count: files.length,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('[BUILD FILES] Error:', error);
    return NextResponse.json(
      { error: `Failed to access build files: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
