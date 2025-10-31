import { AnalyticsStorage } from './storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface MetricsCalculation {
  project_id: string;
  phase: number;
  microstep_id: string;
  velocity: number; // microsteps per week
  quality: number; // percentage (0-100)
  duration_hours: number;
  ac_passed: number;
  ac_total: number;
  metadata: Record<string, any>;
}

/**
 * Metrics Collector Service
 */
export class MetricsCollector {
  /**
   * Calculate and store velocity metrics for a project
   */
  static async calculateVelocityMetrics(projectId: string, phase?: number): Promise<MetricsCalculation[]> {
    try {
      console.log(`Calculating velocity metrics for project ${projectId}, phase ${phase || 'all'}`);

      // Get runner events for microstep completions
      let query = supabase
        .from('runner_events')
        .select('*')
        .eq('action', 'microstep_completed')
        .eq('payload->>project_id', projectId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

      if (phase) {
        query = query.eq('payload->>phase', phase.toString());
      }

      const { data: events, error } = await query.order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch microstep events: ${error.message}`);
      }

      if (!events || events.length === 0) {
        console.log('No microstep completion events found');
        return [];
      }

      // Group events by phase and microstep
      const groupedEvents = this.groupEventsByPhaseAndMicrostep(events);
      const calculations: MetricsCalculation[] = [];

      for (const [phaseKey, phaseEvents] of Object.entries(groupedEvents)) {
        const phaseNumber = parseInt(phaseKey);
        
        for (const [microstepKey, microstepEvents] of Object.entries(phaseEvents)) {
          const calculation = this.calculateMicrostepMetrics(
            projectId,
            phaseNumber,
            microstepKey,
            microstepEvents
          );
          
          if (calculation) {
            calculations.push(calculation);
          }
        }
      }

      // Store calculations in database
      for (const calc of calculations) {
        await AnalyticsStorage.createMetricsRun({
          project_id: calc.project_id,
          phase: calc.phase,
          microstep_id: calc.microstep_id,
          velocity: calc.velocity,
          quality: calc.quality,
          duration_hours: calc.duration_hours,
          ac_passed: calc.ac_passed,
          ac_total: calc.ac_total,
          created_by: 'metrics-collector',
          metadata: calc.metadata,
        });
      }

      console.log(`Calculated metrics for ${calculations.length} microsteps`);
      return calculations;

    } catch (error) {
      console.error('Failed to calculate velocity metrics:', error);
      throw error;
    }
  }

  /**
   * Calculate quality metrics based on test results and acceptance criteria
   */
  static async calculateQualityMetrics(projectId: string, phase?: number): Promise<void> {
    try {
      console.log(`Calculating quality metrics for project ${projectId}, phase ${phase || 'all'}`);

      // Get test run events
      let testQuery = supabase
        .from('runner_events')
        .select('*')
        .eq('action', 'test_run')
        .eq('payload->>project_id', projectId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

      if (phase) {
        testQuery = testQuery.eq('payload->>phase', phase.toString());
      }

      const { data: testEvents, error: testError } = await testQuery.order('created_at', { ascending: false });

      if (testError) {
        throw new Error(`Failed to fetch test events: ${testError.message}`);
      }

      // Get QA run events
      let qaQuery = supabase
        .from('runner_events')
        .select('*')
        .eq('action', 'qa_run')
        .eq('payload->>project_id', projectId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (phase) {
        qaQuery = qaQuery.eq('payload->>phase', phase.toString());
      }

      const { data: qaEvents, error: qaError } = await qaQuery.order('created_at', { ascending: false });

      if (qaError) {
        throw new Error(`Failed to fetch QA events: ${qaError.message}`);
      }

      // Calculate quality scores
      const qualityMetrics = this.calculateQualityScores(testEvents || [], qaEvents || []);

      // Update existing metrics runs with quality data
      for (const metric of qualityMetrics) {
        // Find existing metrics run for this microstep
        const existingMetrics = await supabase
          .from('metrics_runs')
          .select('*')
          .eq('project_id', projectId)
          .eq('phase', metric.phase)
          .eq('microstep_id', metric.microstep_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (existingMetrics.data) {
          // Update existing record
          await supabase
            .from('metrics_runs')
            .update({
              quality: metric.quality,
              ac_passed: metric.ac_passed,
              ac_total: metric.ac_total,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingMetrics.data.id);
        } else {
          // Create new metrics run with quality data
          await AnalyticsStorage.createMetricsRun({
            project_id: projectId,
            phase: metric.phase,
            microstep_id: metric.microstep_id,
            velocity: 0, // Will be calculated separately
            quality: metric.quality,
            duration_hours: 0,
            ac_passed: metric.ac_passed,
            ac_total: metric.ac_total,
            created_by: 'quality-collector',
            metadata: metric.metadata,
          });
        }
      }

      console.log(`Updated quality metrics for ${qualityMetrics.length} microsteps`);

    } catch (error) {
      console.error('Failed to calculate quality metrics:', error);
      throw error;
    }
  }

  /**
   * Run full metrics collection for a project
   */
  static async collectAllMetrics(projectId: string, phase?: number): Promise<void> {
    try {
      console.log(`Starting full metrics collection for project ${projectId}`);

      // Calculate velocity metrics
      await this.calculateVelocityMetrics(projectId, phase);

      // Calculate quality metrics
      await this.calculateQualityMetrics(projectId, phase);

      // Log collection event
      await supabase
        .from('runner_events')
        .insert([{
          actor: 'metrics-collector',
          action: 'metrics_collected',
          payload: {
            project_id: projectId,
            phase: phase,
            collection_type: 'full',
            timestamp: new Date().toISOString(),
          },
          metadata: {
            collector_version: '1.0.0',
            collection_scope: phase ? 'phase' : 'project',
          },
        }]);

      console.log(`Completed metrics collection for project ${projectId}`);

    } catch (error) {
      console.error('Failed to collect metrics:', error);
      throw error;
    }
  }

  /**
   * Group events by phase and microstep
   */
  private static groupEventsByPhaseAndMicrostep(events: any[]): Record<string, Record<string, any[]>> {
    const grouped: Record<string, Record<string, any[]>> = {};

    for (const event of events) {
      const phase = event.payload?.phase?.toString() || '0';
      const microstepId = event.payload?.microstep_id || 'unknown';

      if (!grouped[phase]) {
        grouped[phase] = {};
      }

      if (!grouped[phase][microstepId]) {
        grouped[phase][microstepId] = [];
      }

      grouped[phase][microstepId].push(event);
    }

    return grouped;
  }

  /**
   * Calculate metrics for a specific microstep
   */
  private static calculateMicrostepMetrics(
    projectId: string,
    phase: number,
    microstepId: string,
    events: any[]
  ): MetricsCalculation | null {
    if (events.length === 0) return null;

    // Sort events by timestamp
    events.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const firstEvent = events[0];
    const lastEvent = events[events.length - 1];

    // Calculate duration
    const startTime = new Date(firstEvent.created_at);
    const endTime = new Date(lastEvent.created_at);
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    // Calculate velocity (microsteps per week)
    const weeksSinceStart = Math.max(1, durationMs / (1000 * 60 * 60 * 24 * 7));
    const velocity = events.length / weeksSinceStart;

    // Extract quality metrics from events
    let totalAC = 0;
    let passedAC = 0;
    let qualitySum = 0;
    let qualityCount = 0;

    for (const event of events) {
      if (event.payload?.ac_total) {
        totalAC += event.payload.ac_total;
        passedAC += event.payload.ac_passed || 0;
      }

      if (event.payload?.quality_score) {
        qualitySum += event.payload.quality_score;
        qualityCount++;
      }
    }

    // Calculate quality percentage
    let quality = 0;
    if (qualityCount > 0) {
      quality = qualitySum / qualityCount;
    } else if (totalAC > 0) {
      quality = (passedAC / totalAC) * 100;
    } else {
      quality = 85; // Default quality score if no data
    }

    return {
      project_id: projectId,
      phase,
      microstep_id: microstepId,
      velocity,
      quality: Math.min(100, Math.max(0, quality)),
      duration_hours: durationHours,
      ac_passed: passedAC,
      ac_total: totalAC,
      metadata: {
        events_count: events.length,
        start_time: firstEvent.created_at,
        end_time: lastEvent.created_at,
        calculation_method: 'event_based',
        calculation_timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Calculate quality scores from test and QA events
   */
  private static calculateQualityScores(testEvents: any[], qaEvents: any[]): Array<{
    phase: number;
    microstep_id: string;
    quality: number;
    ac_passed: number;
    ac_total: number;
    metadata: Record<string, any>;
  }> {
    const qualityMetrics: Array<{
      phase: number;
      microstep_id: string;
      quality: number;
      ac_passed: number;
      ac_total: number;
      metadata: Record<string, any>;
    }> = [];

    // Group events by phase and microstep
    const allEvents = [...testEvents, ...qaEvents];
    const grouped = this.groupEventsByPhaseAndMicrostep(allEvents);

    for (const [phaseKey, phaseEvents] of Object.entries(grouped)) {
      const phase = parseInt(phaseKey);

      for (const [microstepId, events] of Object.entries(phaseEvents)) {
        let totalTests = 0;
        let passedTests = 0;
        let totalAC = 0;
        let passedAC = 0;

        for (const event of events) {
          if (event.action === 'test_run') {
            totalTests += event.payload?.total_tests || 0;
            passedTests += event.payload?.passed_tests || 0;
          } else if (event.action === 'qa_run') {
            totalAC += event.payload?.total_criteria || 0;
            passedAC += event.payload?.passed_criteria || 0;
          }
        }

        // Calculate overall quality score
        let quality = 0;
        if (totalTests > 0 && totalAC > 0) {
          const testPassRate = (passedTests / totalTests) * 100;
          const acPassRate = (passedAC / totalAC) * 100;
          quality = (testPassRate + acPassRate) / 2; // Average of test and AC pass rates
        } else if (totalTests > 0) {
          quality = (passedTests / totalTests) * 100;
        } else if (totalAC > 0) {
          quality = (passedAC / totalAC) * 100;
        } else {
          quality = 90; // Default if no test data
        }

        qualityMetrics.push({
          phase,
          microstep_id: microstepId,
          quality: Math.min(100, Math.max(0, quality)),
          ac_passed: passedAC,
          ac_total: totalAC,
          metadata: {
            total_tests: totalTests,
            passed_tests: passedTests,
            test_events: events.filter(e => e.action === 'test_run').length,
            qa_events: events.filter(e => e.action === 'qa_run').length,
            calculation_timestamp: new Date().toISOString(),
          },
        });
      }
    }

    return qualityMetrics;
  }
}
