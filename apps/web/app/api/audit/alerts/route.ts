import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AuditEventSchema } from '../../../../lib/audit';

const AlertRequestSchema = z.object({
  event: AuditEventSchema,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event } = AlertRequestSchema.parse(body);

    console.log(`[AUDIT_ALERTS] Processing alert for ${event.event_type}: ${event.action}`);

    // Determine alert channels based on severity and event type
    const alertChannels = determineAlertChannels(event);
    
    // Send alerts through configured channels
    const alertResults = await Promise.allSettled(
      alertChannels.map(channel => sendAlert(channel, event))
    );

    const successfulAlerts = alertResults.filter(result => result.status === 'fulfilled').length;
    const failedAlerts = alertResults.filter(result => result.status === 'rejected').length;

    console.log(`[AUDIT_ALERTS] Sent ${successfulAlerts} alerts, ${failedAlerts} failed`);

    return NextResponse.json({
      success: true,
      alerts_sent: successfulAlerts,
      alerts_failed: failedAlerts,
      channels: alertChannels,
    });

  } catch (error) {
    console.error('[AUDIT_ALERTS] Error processing alert:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process alert' },
      { status: 500 }
    );
  }
}

function determineAlertChannels(event: any): string[] {
  const channels: string[] = [];

  // Always log to console in development
  if (process.env.NODE_ENV === 'development') {
    channels.push('console');
  }

  // Critical events go to all channels
  if (event.metadata.severity === 'critical') {
    channels.push('email', 'slack', 'webhook');
  }

  // Security events get special handling
  if (event.metadata.tags.includes('security')) {
    channels.push('security_log', 'email');
  }

  // High severity events get email alerts
  if (event.metadata.severity === 'high') {
    channels.push('email');
  }

  return [...new Set(channels)]; // Remove duplicates
}

async function sendAlert(channel: string, event: any): Promise<void> {
  switch (channel) {
    case 'console':
      console.warn(`[ALERT] ${event.metadata.severity.toUpperCase()}: ${event.event_type} - ${event.action}`);
      break;

    case 'email':
      // In production, integrate with email service (SendGrid, etc.)
      console.log(`[ALERT_EMAIL] Would send email alert for: ${event.action}`);
      break;

    case 'slack':
      // In production, integrate with Slack webhook
      console.log(`[ALERT_SLACK] Would send Slack alert for: ${event.action}`);
      break;

    case 'webhook':
      // In production, call configured webhook endpoints
      console.log(`[ALERT_WEBHOOK] Would send webhook alert for: ${event.action}`);
      break;

    case 'security_log':
      // In production, write to dedicated security log
      console.warn(`[SECURITY_ALERT] ${event.event_type}: ${event.action} by ${event.actor.id}`);
      break;

    default:
      console.warn(`[ALERT] Unknown channel: ${channel}`);
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return alert configuration and recent alerts
    const alertConfig = {
      enabled: true,
      channels: {
        email: {
          enabled: true,
          recipients: ['admin@dockeryai.com'],
          severity_threshold: 'high',
        },
        slack: {
          enabled: false,
          webhook_url: '[CONFIGURED]',
          severity_threshold: 'critical',
        },
        webhook: {
          enabled: false,
          endpoints: [],
          severity_threshold: 'critical',
        },
      },
      rate_limits: {
        per_minute: 10,
        per_hour: 100,
        per_day: 1000,
      },
    };

    return NextResponse.json({
      config: alertConfig,
      status: 'operational',
      last_alert: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[AUDIT_ALERTS] Error fetching alert config:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch alert config' },
      { status: 500 }
    );
  }
}
