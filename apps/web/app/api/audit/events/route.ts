import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AuditEventSchema } from '../../../../lib/audit';

const BatchEventsSchema = z.object({
  events: z.array(AuditEventSchema),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { events } = BatchEventsSchema.parse(body);

    console.log(`[AUDIT_API] Persisting ${events.length} audit events`);

    // In production, this would insert into Supabase audit_events table
    // For now, we'll simulate the storage and log key events
    
    const criticalEvents = events.filter(e => e.metadata.severity === 'critical');
    const securityEvents = events.filter(e => e.metadata.tags.includes('security'));
    
    if (criticalEvents.length > 0) {
      console.warn(`[AUDIT_API] ${criticalEvents.length} CRITICAL events detected`);
      criticalEvents.forEach(event => {
        console.warn(`[AUDIT_CRITICAL] ${event.event_type}: ${event.action} by ${event.actor.id}`);
      });
    }

    if (securityEvents.length > 0) {
      console.warn(`[AUDIT_API] ${securityEvents.length} SECURITY events detected`);
      securityEvents.forEach(event => {
        console.warn(`[AUDIT_SECURITY] ${event.event_type}: ${event.action} - Success: ${event.success}`);
      });
    }

    // Simulate database insertion
    const insertedEvents = events.map(event => ({
      ...event,
      stored_at: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      events_stored: insertedEvents.length,
      critical_events: criticalEvents.length,
      security_events: securityEvents.length,
    });

  } catch (error) {
    console.error('[AUDIT_API] Error storing events:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to store audit events',
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const eventType = searchParams.get('event_type');
    const severity = searchParams.get('severity');
    const actorId = searchParams.get('actor_id');

    console.log(`[AUDIT_API] Fetching audit events - limit: ${limit}, offset: ${offset}`);

    // In production, this would query Supabase with filters
    // For now, return mock data based on recent system activity
    
    const mockEvents = [
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        event_type: 'user_action',
        actor: {
          type: 'user',
          id: 'admin-user',
          email: 'admin@dockeryai.com',
        },
        resource: {
          type: 'plan',
          id: 'p5',
          name: 'Flow Inspector + Timeline',
        },
        action: 'viewed_flow_graph',
        details: {
          page: '/flow',
          nodes_rendered: 25,
        },
        metadata: {
          severity: 'low',
          tags: ['user_action', 'navigation'],
        },
        success: true,
      },
      {
        id: crypto.randomUUID(),
        timestamp: new Date(Date.now() - 60000).toISOString(),
        event_type: 'system_startup',
        actor: {
          type: 'system',
          id: 'buildrunner-system',
        },
        resource: {
          type: 'system',
          id: 'web-server',
          name: 'Next.js Web Server',
        },
        action: 'server_started',
        details: {
          port: 3001,
          environment: 'development',
        },
        metadata: {
          severity: 'medium',
          tags: ['system_event', 'startup'],
        },
        success: true,
      },
    ];

    // Apply filters
    let filteredEvents = mockEvents;
    if (eventType) {
      filteredEvents = filteredEvents.filter(e => e.event_type === eventType);
    }
    if (severity) {
      filteredEvents = filteredEvents.filter(e => e.metadata.severity === severity);
    }
    if (actorId) {
      filteredEvents = filteredEvents.filter(e => e.actor.id === actorId);
    }

    // Apply pagination
    const paginatedEvents = filteredEvents.slice(offset, offset + limit);

    return NextResponse.json({
      events: paginatedEvents,
      total: filteredEvents.length,
      limit,
      offset,
      has_more: offset + limit < filteredEvents.length,
    });

  } catch (error) {
    console.error('[AUDIT_API] Error fetching events:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch audit events' },
      { status: 500 }
    );
  }
}
