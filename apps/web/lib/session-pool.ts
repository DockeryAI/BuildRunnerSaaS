import { EventEmitter } from 'events';
import { ClaudeSession, ClaudeSessionConfig } from './claude-session';

export interface SessionPoolConfig {
  projectPath: string;
  model?: string;
  maxPoolSize?: number;
  warmStandbyCount?: number;
  healthCheckInterval?: number;
}

/**
 * Session Pool Manager
 *
 * Manages a pool of persistent Claude sessions with:
 * - Active session rotation
 * - Warm standby sessions for instant failover
 * - Automatic health monitoring
 * - Session replacement on failure
 */
export class SessionPool extends EventEmitter {
  private config: Required<SessionPoolConfig>;
  private activeSessions: Map<string, ClaudeSession> = new Map();
  private warmStandbySessions: ClaudeSession[] = [];
  private sessionIdCounter: number = 0;
  private healthCheckTimer: NodeJS.Timeout | null = null;
  private isInitialized: boolean = false;
  private allocatedSessions: Set<string> = new Set(); // Track which sessions are currently in use

  constructor(config: SessionPoolConfig) {
    super();
    this.config = {
      maxPoolSize: 3,
      warmStandbyCount: 1,
      healthCheckInterval: 30000, // 30 seconds
      ...config,
      projectPath: config.projectPath,
      model: config.model || 'sonnet'
    };
  }

  /**
   * Initialize the session pool
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.emit('log', { level: 'warn', message: '⚠️  Session pool already initialized' });
      return;
    }

    this.emit('log', {
      level: 'info',
      message: `🚀 Initializing session pool (max: ${this.config.maxPoolSize}, standby: ${this.config.warmStandbyCount})`
    });

    try {
      // Initialize primary session
      const primarySession = await this.createSession('primary');
      this.activeSessions.set('primary', primarySession);

      // For parallel execution, initialize additional active sessions up to maxPoolSize
      // But leave room for dynamic growth (start with 1, grow to maxPoolSize as needed)
      // This conserves resources while allowing expansion

      // Initialize warm standby sessions
      for (let i = 0; i < this.config.warmStandbyCount; i++) {
        const standbySession = await this.createSession(`standby-${i}`);
        this.warmStandbySessions.push(standbySession);
      }

      // Start health monitoring
      this.startHealthMonitoring();

      this.isInitialized = true;

      this.emit('pool:initialized', {
        activeSessions: this.activeSessions.size,
        standbySessions: this.warmStandbySessions.length
      });

      this.emit('log', {
        level: 'success',
        message: `✅ Session pool initialized (${this.activeSessions.size} active, ${this.warmStandbySessions.length} standby, max: ${this.config.maxPoolSize})`
      });

    } catch (error) {
      this.emit('pool:failed', { error });
      throw error;
    }
  }

  /**
   * Get a healthy session from the pool
   */
  async getHealthySession(): Promise<ClaudeSession> {
    if (!this.isInitialized) {
      throw new Error('Session pool not initialized');
    }

    // Try to get primary session
    const primary = this.activeSessions.get('primary');
    if (primary && primary.isHealthy()) {
      return primary;
    }

    // Primary unhealthy or missing - switch to standby
    this.emit('log', {
      level: 'warn',
      message: '⚠️  Primary session unhealthy, switching to standby'
    });

    return await this.switchToStandby();
  }

  /**
   * Get multiple healthy sessions for parallel execution
   * @param count Number of sessions needed
   * @returns Array of sessions (may be less than requested if pool is exhausted)
   */
  async getMultipleSessions(count: number): Promise<ClaudeSession[]> {
    if (!this.isInitialized) {
      throw new Error('Session pool not initialized');
    }

    const sessions: ClaudeSession[] = [];

    // Get available (non-allocated) healthy sessions from active pool
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (sessions.length >= count) break;

      if (!this.allocatedSessions.has(sessionId) && session.isHealthy()) {
        sessions.push(session);
        this.allocatedSessions.add(sessionId);
      }
    }

    // If we need more, promote standby sessions to active
    while (sessions.length < count && this.warmStandbySessions.length > 0) {
      const standby = this.warmStandbySessions.shift();
      if (standby && standby.isHealthy()) {
        // Promote to active
        const sessionId = standby.getMetrics().sessionId;
        this.activeSessions.set(sessionId, standby);
        this.allocatedSessions.add(sessionId);
        sessions.push(standby);

        this.emit('log', {
          level: 'info',
          message: `📈 Promoted standby session to active: ${sessionId}`
        });

        // Spawn new standby in background
        this.spawnStandbySession();
      }
    }

    // If still need more, create new sessions (up to maxPoolSize)
    while (sessions.length < count && this.activeSessions.size < this.config.maxPoolSize) {
      try {
        const newSession = await this.createSession(`parallel-${this.sessionIdCounter}`);
        const sessionId = newSession.getMetrics().sessionId;
        this.activeSessions.set(sessionId, newSession);
        this.allocatedSessions.add(sessionId);
        sessions.push(newSession);

        this.emit('log', {
          level: 'info',
          message: `🆕 Created new session for parallel execution: ${sessionId}`
        });
      } catch (error) {
        this.emit('log', {
          level: 'error',
          message: `❌ Failed to create new session: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
        break;
      }
    }

    this.emit('log', {
      level: 'info',
      message: `📦 Allocated ${sessions.length} sessions (requested: ${count}, available: ${this.activeSessions.size})`
    });

    return sessions;
  }

  /**
   * Release a session back to the pool (mark as available)
   */
  releaseSession(session: ClaudeSession): void {
    const sessionId = session.getMetrics().sessionId;
    this.allocatedSessions.delete(sessionId);

    this.emit('log', {
      level: 'debug',
      message: `♻️  Released session: ${sessionId}`
    });
  }

  /**
   * Release multiple sessions
   */
  releaseSessions(sessions: ClaudeSession[]): void {
    sessions.forEach(s => this.releaseSession(s));
  }

  /**
   * Check if a session is healthy
   * Uses the session's internal health check which properly handles actively executing sessions
   */
  async isSessionHealthy(session: ClaudeSession): Promise<boolean> {
    // Use session's isHealthy() which checks:
    // - Process is active
    // - If currently executing a task, consider healthy (tasks can take 30+ seconds)
    // - If idle, check last heartbeat is recent (within 60s)
    return session.isHealthy();
  }

  /**
   * Get pool metrics
   */
  getPoolMetrics() {
    const sessions = Array.from(this.activeSessions.values()).map(s => s.getMetrics());
    const standby = this.warmStandbySessions.map(s => s.getMetrics());

    return {
      activeSessions: sessions,
      standbySessions: standby,
      totalSessions: sessions.length + standby.length,
      healthyActiveSessions: sessions.filter(s => s.isHealthy).length,
      healthyStandbySessions: standby.filter(s => s.isHealthy).length
    };
  }

  /**
   * Terminate all sessions and cleanup
   */
  async shutdown(): Promise<void> {
    this.emit('log', { level: 'info', message: '🛑 Shutting down session pool' });

    // Stop health monitoring
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }

    // Terminate active sessions
    for (const session of this.activeSessions.values()) {
      await session.terminate();
    }
    this.activeSessions.clear();

    // Terminate standby sessions
    for (const session of this.warmStandbySessions) {
      await session.terminate();
    }
    this.warmStandbySessions = [];

    this.isInitialized = false;

    this.emit('pool:shutdown', {});
    this.emit('log', { level: 'success', message: '✅ Session pool shutdown complete' });
  }

  /**
   * Create a new session
   */
  private async createSession(role: string): Promise<ClaudeSession> {
    const sessionId = `session-${this.sessionIdCounter++}-${role}`;

    const session = new ClaudeSession({
      projectPath: this.config.projectPath,
      model: this.config.model,
      sessionId
    });

    // Forward session events
    session.on('log', (data) => this.emit('log', data));
    session.on('session:error', (data) => this.emit('session:error', data));
    session.on('session:closed', (data) => this.emit('session:closed', data));

    // Initialize the session
    await session.initialize();

    this.emit('session:created', { sessionId, role });

    return session;
  }

  /**
   * Switch to standby session (instant failover)
   */
  private async switchToStandby(): Promise<ClaudeSession> {
    // Remove unhealthy primary
    const oldPrimary = this.activeSessions.get('primary');
    if (oldPrimary) {
      await oldPrimary.terminate();
      this.activeSessions.delete('primary');
    }

    // Promote standby to primary
    const newPrimary = this.warmStandbySessions.shift();

    if (!newPrimary) {
      // No standby available - create new session immediately
      this.emit('log', {
        level: 'warn',
        message: '⚠️  No standby session available, creating new session'
      });

      const emergencySession = await this.createSession('emergency-primary');
      this.activeSessions.set('primary', emergencySession);

      // Spawn new standby in background
      this.spawnStandbySession();

      return emergencySession;
    }

    // Use standby as new primary
    this.activeSessions.set('primary', newPrimary);

    this.emit('session:failover', {
      from: oldPrimary?.getMetrics().sessionId,
      to: newPrimary.getMetrics().sessionId
    });

    this.emit('log', {
      level: 'success',
      message: `✅ Switched to standby session (0ms downtime): ${newPrimary.getMetrics().sessionId}`
    });

    // Spawn new standby in background
    this.spawnStandbySession();

    return newPrimary;
  }

  /**
   * Spawn a new standby session in the background
   */
  private async spawnStandbySession(): Promise<void> {
    try {
      if (this.warmStandbySessions.length >= this.config.warmStandbyCount) {
        return; // Already have enough standby sessions
      }

      this.emit('log', {
        level: 'info',
        message: '🔄 Spawning new standby session in background'
      });

      const standbySession = await this.createSession(`standby-${this.sessionIdCounter}`);
      this.warmStandbySessions.push(standbySession);

      this.emit('log', {
        level: 'success',
        message: `✅ Standby session ready: ${standbySession.getMetrics().sessionId}`
      });

    } catch (error) {
      this.emit('log', {
        level: 'error',
        message: `❌ Failed to spawn standby session: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Start periodic health monitoring
   */
  private startHealthMonitoring(): void {
    this.healthCheckTimer = setInterval(async () => {
      await this.performHealthCheck();
    }, this.config.healthCheckInterval);

    this.emit('log', {
      level: 'info',
      message: `🏥 Health monitoring started (interval: ${this.config.healthCheckInterval}ms)`
    });
  }

  /**
   * Perform health check on all sessions
   */
  private async performHealthCheck(): Promise<void> {
    // Check active sessions
    for (const [key, session] of this.activeSessions.entries()) {
      const isHealthy = await this.isSessionHealthy(session);

      if (!isHealthy) {
        this.emit('log', {
          level: 'warn',
          message: `⚠️  Session unhealthy: ${session.getMetrics().sessionId}`
        });

        this.emit('session:degraded', {
          sessionId: session.getMetrics().sessionId,
          metrics: session.getMetrics()
        });

        // If it's the primary, trigger failover
        if (key === 'primary') {
          this.emit('log', {
            level: 'warn',
            message: '⚠️  Primary session degraded, preparing failover'
          });
        }
      }
    }

    // Check standby sessions and replace unhealthy ones
    for (let i = 0; i < this.warmStandbySessions.length; i++) {
      const session = this.warmStandbySessions[i];
      const metrics = session.getMetrics();
      const isHealthy = await this.isSessionHealthy(session);

      // Debug logging
      this.emit('log', {
        level: 'debug',
        message: `🔍 Standby health check: ${metrics.sessionId} - healthy: ${isHealthy}, tasksExecuted: ${metrics.tasksExecuted}, uptime: ${Math.round(metrics.totalUptime / 1000)}s`
      });

      if (!isHealthy) {
        this.emit('log', {
          level: 'warn',
          message: `⚠️  Standby session unhealthy: ${session.getMetrics().sessionId}, replacing...`
        });

        // Terminate unhealthy standby
        await session.terminate();

        // Create replacement
        const replacement = await this.createSession(`standby-replacement-${this.sessionIdCounter}`);
        this.warmStandbySessions[i] = replacement;

        this.emit('log', {
          level: 'success',
          message: `✅ Standby session replaced: ${replacement.getMetrics().sessionId}`
        });
      }
    }

    // Ensure we always have enough standby sessions
    if (this.warmStandbySessions.length < this.config.warmStandbyCount) {
      this.spawnStandbySession();
    }
  }
}
