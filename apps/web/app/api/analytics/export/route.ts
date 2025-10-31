import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsStorage } from '../../../../lib/analytics/storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const projectId = searchParams.get('project_id');
    const phase = searchParams.get('phase');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!['csv', 'pdf', 'json'].includes(format)) {
      return NextResponse.json({
        error: 'Invalid format. Supported formats: csv, pdf, json',
      }, { status: 400 });
    }

    // Get analytics data
    const metricsData = await AnalyticsStorage.getMetricsSummary(
      projectId || undefined,
      phase ? parseInt(phase) : undefined
    );

    const costData = await AnalyticsStorage.getCostUsage({
      projectId: projectId || undefined,
      phase: phase ? parseInt(phase) : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    const anomalies = await AnalyticsStorage.getAnomalies({
      projectId: projectId || undefined,
      resolved: false,
    });

    // Generate export based on format
    let exportData: string | Buffer;
    let contentType: string;
    let filename: string;

    const timestamp = new Date().toISOString().split('T')[0];

    switch (format) {
      case 'csv':
        exportData = generateCSVExport(metricsData, costData, anomalies);
        contentType = 'text/csv';
        filename = `analytics-export-${timestamp}.csv`;
        break;

      case 'json':
        exportData = JSON.stringify({
          export_date: new Date().toISOString(),
          metrics: metricsData,
          costs: costData,
          anomalies: anomalies,
          summary: {
            total_projects: new Set(metricsData.map(m => m.project_id)).size,
            total_phases: metricsData.length,
            total_cost: costData.reduce((sum, c) => sum + c.usd_cost, 0),
            active_anomalies: anomalies.length,
          },
        }, null, 2);
        contentType = 'application/json';
        filename = `analytics-export-${timestamp}.json`;
        break;

      case 'pdf':
        // In production, this would generate a proper PDF
        // For now, return a simple text representation
        exportData = generatePDFExport(metricsData, costData, anomalies);
        contentType = 'application/pdf';
        filename = `analytics-export-${timestamp}.pdf`;
        break;

      default:
        throw new Error('Unsupported format');
    }

    // Log export event
    await AnalyticsStorage.logAuditEvent({
      actor: 'export-service',
      action: 'analytics_exported',
      resource_type: 'export',
      payload: {
        format,
        project_id: projectId,
        phase,
        start_date: startDate,
        end_date: endDate,
        metrics_count: metricsData.length,
        cost_entries: costData.length,
        anomalies_count: anomalies.length,
      },
      metadata: {
        export_timestamp: new Date().toISOString(),
        file_size: Buffer.byteLength(exportData),
      },
    });

    return new NextResponse(exportData, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': Buffer.byteLength(exportData).toString(),
      },
    });

  } catch (error) {
    console.error('[ANALYTICS_EXPORT] Error:', error);
    
    return NextResponse.json({
      error: 'Export failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

function generateCSVExport(
  metrics: any[], 
  costs: any[], 
  anomalies: any[]
): string {
  const lines: string[] = [];
  
  // Header
  lines.push('# BuildRunner Analytics Export');
  lines.push(`# Generated: ${new Date().toISOString()}`);
  lines.push('');
  
  // Metrics section
  lines.push('## Metrics Summary');
  lines.push('Project ID,Phase,Avg Velocity,Avg Quality,Total Cost,Total Microsteps,Unresolved Anomalies');
  
  for (const metric of metrics) {
    lines.push([
      metric.project_id,
      metric.phase,
      metric.avg_velocity?.toFixed(2) || '0',
      metric.avg_quality?.toFixed(2) || '0',
      metric.total_cost?.toFixed(2) || '0',
      metric.total_microsteps || '0',
      metric.unresolved_anomalies || '0',
    ].join(','));
  }
  
  lines.push('');
  
  // Cost section
  lines.push('## Cost Details');
  lines.push('Project ID,Provider,Service Type,Tokens Used,Compute Seconds,USD Cost,Phase,Usage Date');
  
  for (const cost of costs) {
    lines.push([
      cost.project_id,
      cost.provider,
      cost.service_type,
      cost.tokens_used || '0',
      cost.compute_seconds?.toFixed(2) || '0',
      cost.usd_cost.toFixed(2),
      cost.phase,
      cost.usage_date,
    ].join(','));
  }
  
  lines.push('');
  
  // Anomalies section
  lines.push('## Active Anomalies');
  lines.push('Project ID,Type,Title,Severity,Detected At,Threshold Value,Actual Value');
  
  for (const anomaly of anomalies) {
    lines.push([
      anomaly.project_id || '',
      anomaly.type,
      `"${anomaly.title}"`,
      anomaly.severity,
      anomaly.detected_at,
      anomaly.threshold_value?.toFixed(2) || '',
      anomaly.actual_value?.toFixed(2) || '',
    ].join(','));
  }
  
  return lines.join('\n');
}

function generatePDFExport(
  metrics: any[], 
  costs: any[], 
  anomalies: any[]
): string {
  // In production, this would use a PDF generation library like puppeteer or jsPDF
  // For now, return a text representation that simulates PDF content
  
  const lines: string[] = [];
  
  lines.push('BUILDRUNNER ANALYTICS REPORT');
  lines.push('=' .repeat(50));
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push('');
  
  // Executive Summary
  lines.push('EXECUTIVE SUMMARY');
  lines.push('-'.repeat(20));
  lines.push(`Total Projects: ${new Set(metrics.map(m => m.project_id)).size}`);
  lines.push(`Total Phases: ${metrics.length}`);
  lines.push(`Total Cost: $${costs.reduce((sum, c) => sum + c.usd_cost, 0).toFixed(2)}`);
  lines.push(`Active Anomalies: ${anomalies.length}`);
  lines.push('');
  
  // Metrics Overview
  lines.push('METRICS OVERVIEW');
  lines.push('-'.repeat(20));
  
  if (metrics.length > 0) {
    const avgVelocity = metrics.reduce((sum, m) => sum + (m.avg_velocity || 0), 0) / metrics.length;
    const avgQuality = metrics.reduce((sum, m) => sum + (m.avg_quality || 0), 0) / metrics.length;
    
    lines.push(`Average Velocity: ${avgVelocity.toFixed(2)} microsteps/week`);
    lines.push(`Average Quality: ${avgQuality.toFixed(1)}%`);
    lines.push(`Total Microsteps: ${metrics.reduce((sum, m) => sum + (m.total_microsteps || 0), 0)}`);
  }
  
  lines.push('');
  
  // Cost Breakdown
  lines.push('COST BREAKDOWN');
  lines.push('-'.repeat(20));
  
  const costByProvider = new Map<string, number>();
  for (const cost of costs) {
    costByProvider.set(cost.provider, (costByProvider.get(cost.provider) || 0) + cost.usd_cost);
  }
  
  for (const [provider, total] of costByProvider) {
    lines.push(`${provider}: $${total.toFixed(2)}`);
  }
  
  lines.push('');
  
  // Anomalies
  if (anomalies.length > 0) {
    lines.push('ACTIVE ANOMALIES');
    lines.push('-'.repeat(20));
    
    for (const anomaly of anomalies.slice(0, 10)) { // Top 10 anomalies
      lines.push(`[${anomaly.severity.toUpperCase()}] ${anomaly.title}`);
      lines.push(`  Type: ${anomaly.type}`);
      lines.push(`  Detected: ${new Date(anomaly.detected_at).toLocaleString()}`);
      lines.push('');
    }
  }
  
  lines.push('');
  lines.push('End of Report');
  
  return lines.join('\n');
}

export async function POST() {
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'Use GET with query parameters for exports',
  }, { status: 405 });
}
