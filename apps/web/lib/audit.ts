import { z } from 'zod';

// Audit event types for comprehensive tracking
export const AuditEventSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event_type: z.enum([
    // User actions
    'user_login',
    'user_logout', 
    'user_action',
    'user_permission_change',
    
    // Plan modifications
    'plan_created',
    'plan_updated',
    'plan_deleted',
    'microstep_status_changed',
    'milestone_completed',
    
    // System events
    'system_startup',
    'system_shutdown',
    'backup_created',
    'backup_restored',
    'migration_applied',
    
    // Security events
    'auth_failure',
    'permission_denied',
    'rate_limit_exceeded',
    'suspicious_activity',
    
    // Data events
    'data_export',
    'data_import',
    'data_corruption_detected',
    'integrity_check_failed',
    
    // API events
    'api_call',
    'api_error',
    'webhook_received',
    'external_integration',
  ]),
  actor: z.object({
    type: z.enum(['user', 'system', 'api', 'webhook']),
    id: z.string(),
    email: z.string().optional(),
    ip_address: z.string().optional(),
    user_agent: z.string().optional(),
  }),
  resource: z.object({
    type: z.enum(['plan', 'microstep', 'user', 'project', 'system', 'api_endpoint']),
    id: z.string(),
    name: z.string().optional(),
  }),
  action: z.string(),
  details: z.record(z.any()),
  metadata: z.object({
    session_id: z.string().optional(),
    request_id: z.string().optional(),
    correlation_id: z.string().optional(),
    source: z.string().optional(),
    severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    tags: z.array(z.string()).default([]),
  }),
  before_state: z.record(z.any()).optional(),
  after_state: z.record(z.any()).optional(),
  success: z.boolean(),
  error_message: z.string().optional(),
  duration_ms: z.number().optional(),
});

export type AuditEvent = z.infer<typeof AuditEventSchema>;

// Audit configuration
export const AuditConfigSchema = z.object({
  enabled: z.boolean().default(true),
  retention_days: z.number().default(365),
  log_level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  sensitive_fields: z.array(z.string()).default(['password', 'token', 'secret']),
  excluded_events: z.array(z.string()).default([]),
  real_time_alerts: z.boolean().default(true),
});

export type AuditConfig = z.infer<typeof AuditConfigSchema>;

/**
 * Audit Logger - Central logging system for all governance events
 */
export class AuditLogger {
  private config: AuditConfig;
  private buffer: AuditEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<AuditConfig> = {}) {
    this.config = AuditConfigSchema.parse(config);
    this.startBufferFlush();
  }

  /**
   * Log an audit event
   */
  async log(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    if (!this.config.enabled) return;

    const auditEvent: AuditEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      details: this.sanitizeDetails(event.details),
      before_state: event.before_state ? this.sanitizeDetails(event.before_state) : undefined,
      after_state: event.after_state ? this.sanitizeDetails(event.after_state) : undefined,
    };

    // Validate the event
    const validatedEvent = AuditEventSchema.parse(auditEvent);

    // Add to buffer for batch processing
    this.buffer.push(validatedEvent);

    // Immediate flush for critical events
    if (validatedEvent.metadata.severity === 'critical') {
      await this.flush();
    }

    // Real-time alerts for high severity events
    if (this.config.real_time_alerts && 
        ['high', 'critical'].includes(validatedEvent.metadata.severity)) {
      await this.sendAlert(validatedEvent);
    }
  }

  /**
   * Log user action with context
   */
  async logUserAction(
    userId: string,
    action: string,
    resource: { type: string; id: string; name?: string },
    details: Record<string, any> = {},
    request?: { ip?: string; userAgent?: string; sessionId?: string }
  ): Promise<void> {
    await this.log({
      event_type: 'user_action',
      actor: {
        type: 'user',
        id: userId,
        ip_address: request?.ip,
        user_agent: request?.userAgent,
      },
      resource: {
        type: resource.type as any,
        id: resource.id,
        name: resource.name,
      },
      action,
      details,
      metadata: {
        session_id: request?.sessionId,
        severity: 'medium',
        tags: ['user_action'],
      },
      success: true,
    });
  }

  /**
   * Log system event
   */
  async logSystemEvent(
    eventType: AuditEvent['event_type'],
    action: string,
    details: Record<string, any> = {},
    severity: AuditEvent['metadata']['severity'] = 'medium'
  ): Promise<void> {
    await this.log({
      event_type: eventType,
      actor: {
        type: 'system',
        id: 'buildrunner-system',
      },
      resource: {
        type: 'system',
        id: 'buildrunner',
        name: 'BuildRunner System',
      },
      action,
      details,
      metadata: {
        severity,
        tags: ['system_event'],
      },
      success: true,
    });
  }

  /**
   * Log security event
   */
  async logSecurityEvent(
    eventType: AuditEvent['event_type'],
    actor: Partial<AuditEvent['actor']>,
    action: string,
    details: Record<string, any> = {},
    success: boolean = false
  ): Promise<void> {
    await this.log({
      event_type: eventType,
      actor: {
        type: actor.type || 'user',
        id: actor.id || 'unknown',
        email: actor.email,
        ip_address: actor.ip_address,
        user_agent: actor.user_agent,
      },
      resource: {
        type: 'system',
        id: 'security',
        name: 'Security System',
      },
      action,
      details,
      metadata: {
        severity: success ? 'medium' : 'high',
        tags: ['security', success ? 'success' : 'failure'],
      },
      success,
      error_message: success ? undefined : `Security event: ${action}`,
    });
  }

  /**
   * Sanitize sensitive data from details
   */
  private sanitizeDetails(details: Record<string, any>): Record<string, any> {
    const sanitized = { ...details };
    
    this.config.sensitive_fields.forEach(field => {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Start buffer flush interval
   */
  private startBufferFlush(): void {
    this.flushInterval = setInterval(() => {
      if (this.buffer.length > 0) {
        this.flush();
      }
    }, 5000); // Flush every 5 seconds
  }

  /**
   * Flush buffer to storage
   */
  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const events = [...this.buffer];
    this.buffer = [];

    try {
      // In production, this would write to Supabase audit_events table
      await this.persistEvents(events);
    } catch (error) {
      console.error('[AUDIT] Failed to persist events:', error);
      // Re-add events to buffer for retry
      this.buffer.unshift(...events);
    }
  }

  /**
   * Persist events to storage
   */
  private async persistEvents(events: AuditEvent[]): Promise<void> {
    // For now, log to console in development
    if (process.env.NODE_ENV === 'development') {
      events.forEach(event => {
        console.log(`[AUDIT] ${event.event_type}: ${event.action} by ${event.actor.id}`);
      });
      return;
    }

    // In production, batch insert to Supabase
    const response = await fetch('/api/audit/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
    });

    if (!response.ok) {
      throw new Error(`Failed to persist audit events: ${response.statusText}`);
    }
  }

  /**
   * Send real-time alert for critical events
   */
  private async sendAlert(event: AuditEvent): Promise<void> {
    try {
      await fetch('/api/audit/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event }),
      });
    } catch (error) {
      console.error('[AUDIT] Failed to send alert:', error);
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    
    // Final flush
    this.flush();
  }
}

// Global audit logger instance
export const auditLogger = new AuditLogger({
  enabled: true,
  retention_days: 365,
  log_level: 'info',
  real_time_alerts: true,
});

// Convenience functions
export const logUserAction = auditLogger.logUserAction.bind(auditLogger);
export const logSystemEvent = auditLogger.logSystemEvent.bind(auditLogger);
export const logSecurityEvent = auditLogger.logSecurityEvent.bind(auditLogger);
