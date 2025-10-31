import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportConfig {
  project_id?: string;
  report_type: 'daily' | 'weekly' | 'monthly';
  format: 'pdf' | 'csv';
  recipients: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    const reportDate = today.toISOString().split('T')[0];
    
    console.log(`Starting scheduled report generation for ${reportDate}`);

    // Get all active projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, metadata')
      .eq('is_active', true);

    if (projectsError) {
      throw new Error(`Failed to fetch projects: ${projectsError.message}`);
    }

    const reports: any[] = [];

    // Generate reports for each project
    for (const project of projects || []) {
      console.log(`Generating reports for project: ${project.name} (${project.id})`);

      // Daily report
      if (shouldGenerateReport('daily', today)) {
        const dailyReport = await generateReport(supabase, {
          project_id: project.id,
          report_type: 'daily',
          format: 'pdf',
          recipients: ['admin@buildrunner.com'], // In production, get from project settings
        });
        
        if (dailyReport) {
          reports.push(dailyReport);
        }
      }

      // Weekly report (Mondays)
      if (shouldGenerateReport('weekly', today)) {
        const weeklyReport = await generateReport(supabase, {
          project_id: project.id,
          report_type: 'weekly',
          format: 'pdf',
          recipients: ['admin@buildrunner.com'],
        });
        
        if (weeklyReport) {
          reports.push(weeklyReport);
        }
      }

      // Monthly report (1st of month)
      if (shouldGenerateReport('monthly', today)) {
        const monthlyReport = await generateReport(supabase, {
          project_id: project.id,
          report_type: 'monthly',
          format: 'pdf',
          recipients: ['admin@buildrunner.com'],
        });
        
        if (monthlyReport) {
          reports.push(monthlyReport);
        }
      }
    }

    // Log scheduler event
    await supabase
      .from('runner_events')
      .insert([{
        actor: 'report-scheduler',
        action: 'reports_generated',
        payload: {
          generation_date: reportDate,
          projects_processed: projects?.length || 0,
          reports_generated: reports.length,
          report_types: [...new Set(reports.map(r => r.report_type))],
        },
        metadata: {
          scheduler_version: '1.0.0',
          execution_timestamp: new Date().toISOString(),
        },
      }]);

    return new Response(
      JSON.stringify({
        success: true,
        generation_date: reportDate,
        projects_processed: projects?.length || 0,
        reports_generated: reports.length,
        reports: reports.map(r => ({
          id: r.id,
          project_id: r.project_id,
          type: r.report_type,
          format: r.format,
          status: r.status,
        })),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Report scheduler error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Check if a report should be generated based on type and date
function shouldGenerateReport(type: 'daily' | 'weekly' | 'monthly', date: Date): boolean {
  switch (type) {
    case 'daily':
      return true; // Generate daily reports every day
    
    case 'weekly':
      return date.getDay() === 1; // Monday
    
    case 'monthly':
      return date.getDate() === 1; // 1st of month
    
    default:
      return false;
  }
}

// Generate and store a report
async function generateReport(supabase: any, config: ReportConfig): Promise<any | null> {
  try {
    const reportId = crypto.randomUUID();
    const startTime = Date.now();

    // Create report record
    const { data: reportRecord, error: createError } = await supabase
      .from('analytics_reports')
      .insert([{
        id: reportId,
        project_id: config.project_id,
        report_type: config.report_type,
        format: config.format,
        recipients: config.recipients,
        status: 'generating',
      }])
      .select()
      .single();

    if (createError) {
      throw new Error(`Failed to create report record: ${createError.message}`);
    }

    // Get analytics data
    const analyticsData = await fetchAnalyticsData(supabase, config);
    
    // Generate report content
    const reportContent = generateReportContent(config, analyticsData);
    
    // In production, this would:
    // 1. Save the report file to storage (S3, Supabase Storage, etc.)
    // 2. Send email with attachment
    // For now, simulate these operations
    
    const filePath = `reports/${config.project_id}/${config.report_type}-${new Date().toISOString().split('T')[0]}.${config.format}`;
    const fileSize = Buffer.byteLength(reportContent);
    const generationTime = Date.now() - startTime;

    // Update report record
    await supabase
      .from('analytics_reports')
      .update({
        file_path: filePath,
        file_size_bytes: fileSize,
        generation_time_ms: generationTime,
        status: 'completed',
        generated_at: new Date().toISOString(),
        sent_at: new Date().toISOString(), // Simulate immediate sending
      })
      .eq('id', reportId);

    // Log report generation
    await supabase
      .from('runner_events')
      .insert([{
        actor: 'report-scheduler',
        action: 'report_sent',
        payload: {
          report_id: reportId,
          project_id: config.project_id,
          report_type: config.report_type,
          format: config.format,
          recipients_count: config.recipients.length,
          file_size_bytes: fileSize,
          generation_time_ms: generationTime,
        },
        metadata: {
          file_path: filePath,
          sent_timestamp: new Date().toISOString(),
        },
      }]);

    console.log(`Generated ${config.report_type} report for project ${config.project_id}`);
    
    return {
      id: reportId,
      project_id: config.project_id,
      report_type: config.report_type,
      format: config.format,
      status: 'completed',
      file_path: filePath,
      file_size_bytes: fileSize,
      generation_time_ms: generationTime,
    };

  } catch (error) {
    console.error(`Failed to generate ${config.report_type} report:`, error);
    
    // Update report record with error
    try {
      await supabase
        .from('analytics_reports')
        .update({
          status: 'failed',
          error_message: error.message,
        })
        .eq('project_id', config.project_id)
        .eq('report_type', config.report_type)
        .eq('status', 'generating');
    } catch (updateError) {
      console.error('Failed to update report status:', updateError);
    }
    
    return null;
  }
}

// Fetch analytics data for report generation
async function fetchAnalyticsData(supabase: any, config: ReportConfig) {
  const endDate = new Date().toISOString().split('T')[0];
  let startDate: string;

  // Calculate date range based on report type
  switch (config.report_type) {
    case 'daily':
      startDate = endDate; // Same day
      break;
    case 'weekly':
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      startDate = weekAgo.toISOString().split('T')[0];
      break;
    case 'monthly':
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      startDate = monthAgo.toISOString().split('T')[0];
      break;
    default:
      startDate = endDate;
  }

  // Fetch metrics summary
  const { data: metrics, error: metricsError } = await supabase
    .from('metrics_summary')
    .select('*')
    .eq('project_id', config.project_id);

  if (metricsError) {
    console.error('Failed to fetch metrics:', metricsError);
  }

  // Fetch cost usage
  const { data: costs, error: costsError } = await supabase
    .from('cost_usage')
    .select('*')
    .eq('project_id', config.project_id)
    .gte('usage_date', startDate)
    .lte('usage_date', endDate);

  if (costsError) {
    console.error('Failed to fetch costs:', costsError);
  }

  // Fetch anomalies
  const { data: anomalies, error: anomaliesError } = await supabase
    .from('anomalies')
    .select('*')
    .eq('project_id', config.project_id)
    .eq('is_resolved', false);

  if (anomaliesError) {
    console.error('Failed to fetch anomalies:', anomaliesError);
  }

  return {
    metrics: metrics || [],
    costs: costs || [],
    anomalies: anomalies || [],
    date_range: { start: startDate, end: endDate },
  };
}

// Generate report content
function generateReportContent(config: ReportConfig, data: any): string {
  const lines: string[] = [];
  
  // Header
  lines.push(`BUILDRUNNER ${config.report_type.toUpperCase()} REPORT`);
  lines.push('='.repeat(50));
  lines.push(`Project: ${config.project_id}`);
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push(`Period: ${data.date_range.start} to ${data.date_range.end}`);
  lines.push('');

  // Summary
  lines.push('SUMMARY');
  lines.push('-'.repeat(20));
  
  if (data.metrics.length > 0) {
    const totalCost = data.costs.reduce((sum: number, c: any) => sum + c.usd_cost, 0);
    const avgVelocity = data.metrics.reduce((sum: number, m: any) => sum + (m.avg_velocity || 0), 0) / data.metrics.length;
    const avgQuality = data.metrics.reduce((sum: number, m: any) => sum + (m.avg_quality || 0), 0) / data.metrics.length;
    
    lines.push(`Total Cost: $${totalCost.toFixed(2)}`);
    lines.push(`Average Velocity: ${avgVelocity.toFixed(2)} microsteps/week`);
    lines.push(`Average Quality: ${avgQuality.toFixed(1)}%`);
    lines.push(`Active Anomalies: ${data.anomalies.length}`);
  } else {
    lines.push('No metrics data available for this period.');
  }

  lines.push('');

  // Cost breakdown
  if (data.costs.length > 0) {
    lines.push('COST BREAKDOWN');
    lines.push('-'.repeat(20));
    
    const costByProvider = new Map<string, number>();
    for (const cost of data.costs) {
      costByProvider.set(cost.provider, (costByProvider.get(cost.provider) || 0) + cost.usd_cost);
    }
    
    for (const [provider, total] of costByProvider) {
      lines.push(`${provider}: $${total.toFixed(2)}`);
    }
    
    lines.push('');
  }

  // Anomalies
  if (data.anomalies.length > 0) {
    lines.push('ACTIVE ANOMALIES');
    lines.push('-'.repeat(20));
    
    for (const anomaly of data.anomalies.slice(0, 5)) {
      lines.push(`[${anomaly.severity.toUpperCase()}] ${anomaly.title}`);
      lines.push(`  Detected: ${new Date(anomaly.detected_at).toLocaleString()}`);
    }
    
    if (data.anomalies.length > 5) {
      lines.push(`... and ${data.anomalies.length - 5} more anomalies`);
    }
    
    lines.push('');
  }

  lines.push('End of Report');
  
  return lines.join('\n');
}
