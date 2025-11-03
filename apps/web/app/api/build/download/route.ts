import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Download a build as a ZIP file
 * GET /api/build/download?projectId=...&buildId=...
 */
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId');
    const buildId = request.nextUrl.searchParams.get('buildId');

    if (!projectId || !buildId) {
      return NextResponse.json(
        { error: 'Missing projectId or buildId' },
        { status: 400 }
      );
    }

    // Build directory path
    const buildDir = path.join(process.cwd(), 'builds', projectId, buildId);
    console.log(`[Download] Looking for build at: ${buildDir}`);

    // Check if build directory exists
    if (!fs.existsSync(buildDir)) {
      console.error(`[Download] Build directory not found: ${buildDir}`);
      return NextResponse.json(
        { error: 'Build directory not found', buildDir },
        { status: 404 }
      );
    }
    console.log(`[Download] ✅ Build directory found`);

    // Create zip file in temp directory
    const zipFileName = `${projectId}-${buildId}.zip`;
    const zipPath = path.join('/tmp', zipFileName);

    // Remove existing zip if it exists
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }

    console.log(`[Download] Creating ZIP file: ${zipPath}`);

    // Create ZIP archive (excluding node_modules and .next for size)
    await execAsync(
      `cd "${buildDir}" && zip -r "${zipPath}" . -x "node_modules/*" -x ".next/*" -x "*.git/*"`,
      { maxBuffer: 1024 * 1024 * 100 } // 100MB buffer
    );

    console.log(`[Download] ✅ ZIP file created successfully`);

    // Read the zip file
    const zipBuffer = fs.readFileSync(zipPath);

    // Clean up temp file
    fs.unlinkSync(zipPath);

    // Return the zip file
    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipFileName}"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error downloading build:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to download build' },
      { status: 500 }
    );
  }
}
