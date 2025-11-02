import { NextRequest, NextResponse } from 'next/server';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';

// Store active preview servers
const activeServers = new Map<string, { process: ChildProcess; port: number }>();

/**
 * Start a preview server for a build
 * POST /api/build/preview
 * Body: { projectId, buildId }
 */
export async function POST(request: NextRequest) {
  try {
    const { projectId, buildId } = await request.json();

    if (!projectId || !buildId) {
      return NextResponse.json(
        { error: 'Missing projectId or buildId' },
        { status: 400 }
      );
    }

    const serverId = `${projectId}-${buildId}`;

    // Check if server is already running
    if (activeServers.has(serverId)) {
      const server = activeServers.get(serverId)!;
      return NextResponse.json({
        success: true,
        port: server.port,
        url: `http://localhost:${server.port}`,
        status: 'already_running',
      });
    }

    // Build directory path
    const buildDir = path.join(process.cwd(), '..', '..', 'builds', projectId, buildId);

    // Check if build directory exists
    if (!fs.existsSync(buildDir)) {
      return NextResponse.json(
        { error: 'Build directory not found', buildDir },
        { status: 404 }
      );
    }

    // Check for package.json
    const packageJsonPath = path.join(buildDir, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      return NextResponse.json(
        { error: 'Not a Node.js project (no package.json found)' },
        { status: 400 }
      );
    }

    // Read package.json to detect dev script
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const scripts = packageJson.scripts || {};

    let devCommand = 'npm';
    let devArgs: string[] = [];

    // Detect dev script
    if (scripts.dev) {
      devArgs = ['run', 'dev'];
    } else if (scripts.start) {
      devArgs = ['run', 'start'];
    } else {
      return NextResponse.json(
        { error: 'No dev or start script found in package.json' },
        { status: 400 }
      );
    }

    // Find available port (start from 3001)
    let port = 3001;
    while (activeServers.size > 0) {
      const usedPorts = Array.from(activeServers.values()).map(s => s.port);
      if (!usedPorts.includes(port)) break;
      port++;
      if (port > 3100) {
        return NextResponse.json(
          { error: 'No available ports (max 100 concurrent servers)' },
          { status: 503 }
        );
      }
    }

    // Start dev server
    const serverProcess = spawn(devCommand, devArgs, {
      cwd: buildDir,
      env: {
        ...process.env,
        PORT: port.toString(),
        NODE_ENV: 'development',
      },
      shell: true,
    });

    // Store server info
    activeServers.set(serverId, { process: serverProcess, port });

    // Handle server output
    serverProcess.stdout?.on('data', (data) => {
      console.log(`[Preview ${serverId}] ${data.toString()}`);
    });

    serverProcess.stderr?.on('data', (data) => {
      console.error(`[Preview ${serverId} ERROR] ${data.toString()}`);
    });

    serverProcess.on('close', (code) => {
      console.log(`[Preview ${serverId}] Server closed with code ${code}`);
      activeServers.delete(serverId);
    });

    serverProcess.on('error', (err) => {
      console.error(`[Preview ${serverId}] Server error:`, err);
      activeServers.delete(serverId);
    });

    // Wait a bit for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    return NextResponse.json({
      success: true,
      port,
      url: `http://localhost:${port}`,
      buildDir,
      status: 'started',
      serverId,
    });

  } catch (error) {
    console.error('Error starting preview server:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start preview server' },
      { status: 500 }
    );
  }
}

/**
 * Stop a preview server
 * DELETE /api/build/preview?serverId=...
 */
export async function DELETE(request: NextRequest) {
  try {
    const serverId = request.nextUrl.searchParams.get('serverId');

    if (!serverId) {
      return NextResponse.json(
        { error: 'Missing serverId parameter' },
        { status: 400 }
      );
    }

    const server = activeServers.get(serverId);

    if (!server) {
      return NextResponse.json(
        { error: 'Server not found' },
        { status: 404 }
      );
    }

    // Kill the process
    server.process.kill('SIGTERM');
    activeServers.delete(serverId);

    return NextResponse.json({
      success: true,
      message: 'Preview server stopped',
    });

  } catch (error) {
    console.error('Error stopping preview server:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to stop preview server' },
      { status: 500 }
    );
  }
}

/**
 * Get active preview servers
 * GET /api/build/preview
 */
export async function GET() {
  const servers = Array.from(activeServers.entries()).map(([id, server]) => ({
    serverId: id,
    port: server.port,
    url: `http://localhost:${server.port}`,
    running: !server.process.killed,
  }));

  return NextResponse.json({
    success: true,
    servers,
    count: servers.length,
  });
}
