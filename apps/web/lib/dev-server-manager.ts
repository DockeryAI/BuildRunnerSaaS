import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';

interface DevServer {
  buildId: string;
  projectId: string;
  port: number;
  process: ChildProcess;
  url: string;
  status: 'starting' | 'running' | 'error' | 'stopped';
  startedAt: Date;
}

/**
 * Manages dev servers for generated builds
 */
export class DevServerManager {
  private servers: Map<string, DevServer> = new Map();
  private readonly basePort = 4000; // Start allocating ports from 4000
  private usedPorts: Set<number> = new Set();

  /**
   * Start a dev server for a specific build
   */
  public async startDevServer(projectId: string, buildId: string): Promise<{ url: string; port: number }> {
    const serverKey = `${projectId}-${buildId}`;

    // Check if server is already running
    const existing = this.servers.get(serverKey);
    if (existing && existing.status === 'running') {
      console.log(`✅ Dev server already running for ${serverKey} at ${existing.url}`);
      return { url: existing.url, port: existing.port };
    }

    // Allocate a port
    const port = this.allocatePort();
    const buildPath = path.join(process.cwd(), 'builds', projectId, buildId);
    const url = `http://localhost:${port}`;

    console.log(`🚀 Starting dev server for ${serverKey} at ${url}`);
    console.log(`📁 Build path: ${buildPath}`);

    // Start the dev process
    const devProcess = spawn('npm', ['run', 'dev'], {
      cwd: buildPath,
      env: {
        ...process.env,
        PORT: String(port),
        BROWSER: 'none', // Don't auto-open browser
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const server: DevServer = {
      buildId,
      projectId,
      port,
      process: devProcess,
      url,
      status: 'starting',
      startedAt: new Date(),
    };

    this.servers.set(serverKey, server);
    this.usedPorts.add(port);

    // Handle process output
    devProcess.stdout?.on('data', (data) => {
      const output = data.toString();
      console.log(`[Dev Server ${serverKey}]:`, output);

      // Check if server is ready
      if (output.includes('Ready in') || output.includes('compiled') || output.includes('Local:')) {
        server.status = 'running';
        console.log(`✅ Dev server ${serverKey} is now running at ${url}`);
      }
    });

    devProcess.stderr?.on('data', (data) => {
      console.error(`[Dev Server ${serverKey} Error]:`, data.toString());
    });

    devProcess.on('error', (error) => {
      console.error(`❌ Failed to start dev server for ${serverKey}:`, error);
      server.status = 'error';
    });

    devProcess.on('exit', (code) => {
      console.log(`🛑 Dev server ${serverKey} exited with code ${code}`);
      server.status = 'stopped';
      this.usedPorts.delete(port);
    });

    // Wait a bit for the server to start
    await this.waitForServer(server, 30000); // 30 second timeout

    return { url, port };
  }

  /**
   * Stop a dev server
   */
  public stopDevServer(projectId: string, buildId: string): boolean {
    const serverKey = `${projectId}-${buildId}`;
    const server = this.servers.get(serverKey);

    if (!server) {
      console.log(`⚠️  No dev server found for ${serverKey}`);
      return false;
    }

    console.log(`🛑 Stopping dev server for ${serverKey}`);
    server.process.kill('SIGTERM');
    this.servers.delete(serverKey);
    this.usedPorts.delete(server.port);

    return true;
  }

  /**
   * Stop all running dev servers
   */
  public stopAllServers(): void {
    console.log(`🛑 Stopping all ${this.servers.size} dev servers`);
    for (const [key, server] of this.servers.entries()) {
      server.process.kill('SIGTERM');
    }
    this.servers.clear();
    this.usedPorts.clear();
  }

  /**
   * Get status of a dev server
   */
  public getServerStatus(projectId: string, buildId: string): DevServer | null {
    const serverKey = `${projectId}-${buildId}`;
    return this.servers.get(serverKey) || null;
  }

  /**
   * List all running servers
   */
  public listServers(): DevServer[] {
    return Array.from(this.servers.values());
  }

  /**
   * Allocate an available port
   */
  private allocatePort(): number {
    let port = this.basePort;
    while (this.usedPorts.has(port)) {
      port++;
    }
    return port;
  }

  /**
   * Wait for server to be ready
   */
  private async waitForServer(server: DevServer, timeout: number): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (server.status === 'running') {
        return;
      }
      if (server.status === 'error' || server.status === 'stopped') {
        throw new Error(`Dev server failed to start: ${server.status}`);
      }
      // Wait 500ms before checking again
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Timeout - still mark as running and let user try
    console.log(`⚠️  Dev server taking longer than expected, but continuing...`);
    server.status = 'running';
  }
}

// Singleton instance
export const devServerManager = new DevServerManager();

// Cleanup on process exit
process.on('exit', () => {
  devServerManager.stopAllServers();
});

process.on('SIGINT', () => {
  devServerManager.stopAllServers();
  process.exit(0);
});

process.on('SIGTERM', () => {
  devServerManager.stopAllServers();
  process.exit(0);
});
