import { z } from 'zod';

// Timeline event types
export const TimelineEventSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  type: z.enum([
    'milestone_started',
    'milestone_completed',
    'step_started', 
    'step_completed',
    'microstep_started',
    'microstep_completed',
    'plan_updated',
    'drift_detected',
    'qa_run',
    'export_generated',
    'explain_generated',
    'rescope_applied',
  ]),
  phase: z.number(),
  milestone_id: z.string().optional(),
  step_id: z.string().optional(),
  microstep_id: z.string().optional(),
  actor: z.string(), // 'user', 'auggie', 'system'
  action: z.string(),
  description: z.string(),
  metadata: z.record(z.any()).optional(),
  success: z.boolean().default(true),
});

export const TimelineDataSchema = z.object({
  events: z.array(TimelineEventSchema),
  summary: z.object({
    total_events: z.number(),
    date_range: z.object({
      start: z.string(),
      end: z.string(),
    }),
    phase_progress: z.array(z.object({
      phase: z.number(),
      events_count: z.number(),
      completion_percentage: z.number(),
      last_activity: z.string(),
    })),
    activity_by_day: z.array(z.object({
      date: z.string(),
      events_count: z.number(),
      microsteps_completed: z.number(),
    })),
  }),
});

export type TimelineEvent = z.infer<typeof TimelineEventSchema>;
export type TimelineData = z.infer<typeof TimelineDataSchema>;

/**
 * Fetch timeline events from runner_events and plan updates
 */
export async function fetchTimelineData(): Promise<TimelineData> {
  try {
    // In production, this would query Supabase runner_events table
    // For now, generate mock data based on current plan state
    const mockEvents = await generateMockTimelineEvents();
    
    const summary = calculateTimelineSummary(mockEvents);
    
    const timelineData: TimelineData = {
      events: mockEvents,
      summary,
    };

    return TimelineDataSchema.parse(timelineData);
  } catch (error) {
    console.error('Failed to fetch timeline data:', error);
    throw error;
  }
}

/**
 * Generate mock timeline events for demonstration
 */
async function generateMockTimelineEvents(): Promise<TimelineEvent[]> {
  const now = new Date();
  const events: TimelineEvent[] = [];

  // Phase 1-3 historical events
  const phases = [
    { phase: 1, title: 'Setup Environment & Repo', days_ago: 30 },
    { phase: 2, title: 'Supabase Edge Functions', days_ago: 20 },
    { phase: 3, title: 'Supabase Provisioner', days_ago: 10 },
    { phase: 4, title: 'UI MVP', days_ago: 5 },
  ];

  phases.forEach((phaseInfo, phaseIndex) => {
    const phaseStartDate = new Date(now.getTime() - phaseInfo.days_ago * 24 * 60 * 60 * 1000);
    
    // Phase started
    events.push({
      id: `phase-${phaseInfo.phase}-start`,
      timestamp: phaseStartDate.toISOString(),
      type: 'milestone_started',
      phase: phaseInfo.phase,
      milestone_id: `p${phaseInfo.phase}`,
      actor: 'auggie',
      action: 'phase_started',
      description: `Started ${phaseInfo.title}`,
      success: true,
    });

    // Generate microstep completion events throughout the phase
    const phaseDuration = phaseIndex === phases.length - 1 ? phaseInfo.days_ago : 
                         phaseInfo.days_ago - (phases[phaseIndex + 1]?.days_ago || 0);
    
    const microstepsPerPhase = 6; // Average microsteps per phase
    for (let i = 0; i < microstepsPerPhase; i++) {
      const eventDate = new Date(
        phaseStartDate.getTime() + (i / microstepsPerPhase) * phaseDuration * 24 * 60 * 60 * 1000
      );
      
      events.push({
        id: `p${phaseInfo.phase}-ms${i + 1}-complete`,
        timestamp: eventDate.toISOString(),
        type: 'microstep_completed',
        phase: phaseInfo.phase,
        microstep_id: `p${phaseInfo.phase}.s${Math.floor(i / 2) + 1}.ms${(i % 2) + 1}`,
        actor: 'auggie',
        action: 'microstep_completed',
        description: `Completed microstep ${i + 1} of ${phaseInfo.title}`,
        success: true,
      });
    }

    // Phase completed
    const phaseEndDate = new Date(
      phaseStartDate.getTime() + phaseDuration * 24 * 60 * 60 * 1000
    );
    
    events.push({
      id: `phase-${phaseInfo.phase}-complete`,
      timestamp: phaseEndDate.toISOString(),
      type: 'milestone_completed',
      phase: phaseInfo.phase,
      milestone_id: `p${phaseInfo.phase}`,
      actor: 'auggie',
      action: 'phase_completed',
      description: `Completed ${phaseInfo.title}`,
      success: true,
    });
  });

  // Recent Phase 5 events
  const phase5Start = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  events.push({
    id: 'phase-5-start',
    timestamp: phase5Start.toISOString(),
    type: 'milestone_started',
    phase: 5,
    milestone_id: 'p5',
    actor: 'auggie',
    action: 'phase_started',
    description: 'Started Flow Inspector + Timeline',
    success: true,
  });

  // Recent microstep events
  events.push({
    id: 'p5-s1-ms1-complete',
    timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'microstep_completed',
    phase: 5,
    microstep_id: 'p5.s1.ms1',
    actor: 'auggie',
    action: 'microstep_completed',
    description: 'Completed Data API for flow visualization',
    success: true,
  });

  events.push({
    id: 'p5-s1-ms2-complete',
    timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
    type: 'microstep_completed',
    phase: 5,
    microstep_id: 'p5.s1.ms2',
    actor: 'auggie',
    action: 'microstep_completed',
    description: 'Completed Graph renderer with ReactFlow',
    success: true,
  });

  // Drift detection event
  events.push({
    id: 'drift-detected-1',
    timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
    type: 'drift_detected',
    phase: 4,
    microstep_id: 'p4.s1.ms2',
    actor: 'system',
    action: 'drift_detected',
    description: 'Drift detected in Auth implementation',
    metadata: { confidence: 0.9, type: 'implementation_mismatch' },
    success: false,
  });

  // Sort events by timestamp
  return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

/**
 * Calculate timeline summary statistics
 */
function calculateTimelineSummary(events: TimelineEvent[]) {
  const sortedEvents = events.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const dateRange = {
    start: sortedEvents[0]?.timestamp || new Date().toISOString(),
    end: sortedEvents[sortedEvents.length - 1]?.timestamp || new Date().toISOString(),
  };

  // Calculate phase progress
  const phaseGroups = new Map<number, TimelineEvent[]>();
  events.forEach(event => {
    if (!phaseGroups.has(event.phase)) {
      phaseGroups.set(event.phase, []);
    }
    phaseGroups.get(event.phase)!.push(event);
  });

  const phase_progress = Array.from(phaseGroups.entries()).map(([phase, phaseEvents]) => {
    const completedMicrosteps = phaseEvents.filter(e => 
      e.type === 'microstep_completed' && e.success
    ).length;
    const totalMicrosteps = 6; // Estimated microsteps per phase
    
    return {
      phase,
      events_count: phaseEvents.length,
      completion_percentage: Math.round((completedMicrosteps / totalMicrosteps) * 100),
      last_activity: phaseEvents[phaseEvents.length - 1]?.timestamp || '',
    };
  });

  // Calculate activity by day
  const activityByDay = new Map<string, { events: number; microsteps: number }>();
  events.forEach(event => {
    const date = new Date(event.timestamp).toISOString().split('T')[0];
    if (!activityByDay.has(date)) {
      activityByDay.set(date, { events: 0, microsteps: 0 });
    }
    const dayData = activityByDay.get(date)!;
    dayData.events++;
    if (event.type === 'microstep_completed' && event.success) {
      dayData.microsteps++;
    }
  });

  const activity_by_day = Array.from(activityByDay.entries()).map(([date, data]) => ({
    date,
    events_count: data.events,
    microsteps_completed: data.microsteps,
  }));

  return {
    total_events: events.length,
    date_range,
    phase_progress,
    activity_by_day,
  };
}
