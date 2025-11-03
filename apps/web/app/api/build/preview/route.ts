import { NextRequest, NextResponse } from 'next/server';
import { spawn, ChildProcess, exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Store active preview servers
const activeServers = new Map<string, { process: ChildProcess; port: number }>();

// Check if a port is available
async function isPortAvailable(port: number): Promise<boolean> {
  try {
    const { stdout } = await execAsync(`lsof -ti:${port}`);
    return !stdout.trim(); // Port is available if no process found
  } catch (error) {
    return true; // If lsof errors, assume port is available
  }
}

// Find next available port starting from a base port
async function findAvailablePort(startPort: number = 3001): Promise<number> {
  for (let port = startPort; port < startPort + 100; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error('No available ports found');
}

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
      // Read package.json to get appType
      const buildDir = path.join(process.cwd(), 'builds', projectId, buildId);
      const packageJsonPath = path.join(buildDir, 'package.json');
      let appType = 'web';
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
        appType = (dependencies.expo || dependencies['expo-router']) ? 'mobile' : 'web';
      }
      return NextResponse.json({
        success: true,
        port: server.port,
        url: `http://localhost:${server.port}`,
        status: 'already_running',
        appType,
      });
    }

    // Build directory path (same as BuildFileWriter)
    const buildDir = path.join(process.cwd(), 'builds', projectId, buildId);
    console.log(`[Preview] Looking for build at: ${buildDir}`);

    // Check if build directory exists
    if (!fs.existsSync(buildDir)) {
      console.error(`[Preview] Build directory not found: ${buildDir}`);
      return NextResponse.json(
        { error: 'Build directory not found', buildDir },
        { status: 404 }
      );
    }
    console.log(`[Preview] ✅ Build directory found`);

    // Check for package.json
    const packageJsonPath = path.join(buildDir, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      return NextResponse.json(
        { error: 'Not a Node.js project (no package.json found)' },
        { status: 400 }
      );
    }

    // Read package.json to detect dev script and app type
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const scripts = packageJson.scripts || {};
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    // Detect if this is an Expo app
    const isExpo = dependencies.expo || dependencies['expo-router'];
    const appType = isExpo ? 'mobile' : 'web';

    let devCommand = 'npm';
    let devArgs: string[] = [];

    // Detect dev script - Expo apps use different command
    if (isExpo) {
      devCommand = 'npx';
      devArgs = ['expo', 'start', '--web'];
    } else if (scripts.dev) {
      devArgs = ['run', 'dev'];
    } else if (scripts.start) {
      devArgs = ['run', 'start'];
    } else {
      return NextResponse.json(
        { error: 'No dev or start script found in package.json' },
        { status: 400 }
      );
    }

    // Find available port (start from 3004 for web, 19006 for Expo)
    let port: number;
    try {
      port = await findAvailablePort(isExpo ? 19006 : 3004);
      console.log(`Found available port: ${port}`);
    } catch (error) {
      return NextResponse.json(
        { error: 'No available ports (max 100 concurrent servers)' },
        { status: 503 }
      );
    }

    // Start dev server (add port flag for Expo)
    if (isExpo) {
      devArgs.push('--port', port.toString());
    }

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
      appType,
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
