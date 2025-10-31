import { AnalyticsStorage } from './storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface AnomalyDetectionConfig {
  costSpikeThreshold: number; // Percentage increase (e.g., 50 for 50%)
  qualityDropThreshold: number; // Percentage decrease (e.g., 20 for 20%)
  velocityDropThreshold: number; // Percentage decrease (e.g., 30 for 30%)
  budgetExceededThreshold: number; // Percentage of budget (e.g., 90 for 90%)
  lookbackDays: number; // Days to look back for baseline calculation
}

export interface DetectedAnomaly {
  type: 'cost_spike' | 'quality_drop' | 'velocity_drop' | 'usage_anomaly' | 'budget_exceeded';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  project_id?: string;
  phase?: number;
  microstep_id?: string;
  threshold_value?: number;
  actual_value?: number;
  metadata: Record<string, any>;
}

/**
 * Anomaly Detection Service
 */
export class AnomalyDetector {
  private static defaultConfig: AnomalyDetectionConfig = {
    costSpikeThreshold: 50, // 50% increase
    qualityDropThreshold: 20, // 20% decrease
    velocityDropThreshold: 30, // 30% decrease
    budgetExceededThreshold: 90, // 90% of budget
    lookbackDays: 7, // 7 days for baseline
  };

  /**
   * Run comprehensive anomaly detection for a project
   */
  static async detectAnomalies(
    projectId: string, 
    config: Partial<AnomalyDetectionConfig> = {}
  ): Promise<DetectedAnomaly[]> {
    const detectionConfig = { ...this.defaultConfig, ...config };
    const anomalies: DetectedAnomaly[] = [];

    try {
      console.log(`Running anomaly detection for project ${projectId}`);

      // 1. Detect cost spikes
      const costAnomalies = await this.detectCostSpikes(projectId, detectionConfig);
      anomalies.push(...costAnomalies);

      // 2. Detect quality drops
      const qualityAnomalies = await this.detectQualityDrops(projectId, detectionConfig);
      anomalies.push(...qualityAnomalies);

      // 3. Detect velocity drops
      const velocityAnomalies = await this.detectVelocityDrops(projectId, detectionConfig);
      anomalies.push(...velocityAnomalies);

      // 4. Detect budget exceeded
      const budgetAnomalies = await this.detectBudgetExceeded(projectId, detectionConfig);
      anomalies.push(...budgetAnomalies);

      // 5. Detect usage anomalies
      const usageAnomalies = await this.detectUsageAnomalies(projectId, detectionConfig);
      anomalies.push(...usageAnomalies);

      // Store detected anomalies
      for (const anomaly of anomalies) {
        await AnalyticsStorage.createAnomaly({
          project_id: anomaly.project_id,
          type: anomaly.type,
          title: anomaly.title,
          description: anomaly.description,
          severity: anomaly.severity,
          threshold_value: anomaly.threshold_value,
          actual_value: anomaly.actual_value,
          phase: anomaly.phase,
          microstep_id: anomaly.microstep_id,
          is_resolved: false,
          metadata: anomaly.metadata,
          detected_at: new Date().toISOString(),
        });
      }

      // Send alerts for high/critical anomalies
      const criticalAnomalies = anomalies.filter(a => ['high', 'critical'].includes(a.severity));
      if (criticalAnomalies.length > 0) {
        await this.sendAnomalyAlerts(criticalAnomalies);
      }

      console.log(`Detected ${anomalies.length} anomalies (${criticalAnomalies.length} critical)`);
      return anomalies;

    } catch (error) {
      console.error('Failed to detect anomalies:', error);
      throw error;
    }
  }

  /**
   * Detect cost spikes
   */
  private static async detectCostSpikes(
    projectId: string, 
    config: AnomalyDetectionConfig
  ): Promise<DetectedAnomaly[]> {
    const anomalies: DetectedAnomaly[] = [];

    try {
      // Get recent cost data
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - config.lookbackDays * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

      const costData = await AnalyticsStorage.getCostUsage({
        projectId,
        startDate,
        endDate,
      });

      if (costData.length < 2) return anomalies;

      // Group by date and calculate daily totals
      const dailyCosts = new Map<string, number>();
      for (const cost of costData) {
        const date = cost.usage_date;
        dailyCosts.set(date, (dailyCosts.get(date) || 0) + cost.usd_cost);
      }

      const sortedDates = Array.from(dailyCosts.keys()).sort();
      if (sortedDates.length < 2) return anomalies;

      // Calculate baseline (average of previous days)
      const recentDates = sortedDates.slice(-3); // Last 3 days
      const baselineDates = sortedDates.slice(0, -1); // All but last day

      if (baselineDates.length === 0) return anomalies;

      const baselineAvg = baselineDates.reduce((sum, date) => sum + (dailyCosts.get(date) || 0), 0) / baselineDates.length;
      const latestCost = dailyCosts.get(sortedDates[sortedDates.length - 1]) || 0;

      // Check for spike
      if (baselineAvg > 0 && latestCost > baselineAvg * (1 + config.costSpikeThreshold / 100)) {
        const spikePercentage = ((latestCost / baselineAvg - 1) * 100);
        
        anomalies.push({
          type: 'cost_spike',
          title: 'Daily Cost Spike Detected',
          description: `Daily cost ($${latestCost.toFixed(2)}) exceeded baseline ($${baselineAvg.toFixed(2)}) by ${spikePercentage.toFixed(1)}%`,
          severity: this.calculateCostSpikeSeverity(spikePercentage),
          project_id: projectId,
          threshold_value: baselineAvg * (1 + config.costSpikeThreshold / 100),
          actual_value: latestCost,
          metadata: {
            baseline_avg: baselineAvg,
            spike_percentage: spikePercentage,
            detection_date: endDate,
            lookback_days: config.lookbackDays,
          },
        });
      }

    } catch (error) {
      console.error('Failed to detect cost spikes:', error);
    }

    return anomalies;
  }

  /**
   * Detect quality drops
   */
  private static async detectQualityDrops(
    projectId: string, 
    config: AnomalyDetectionConfig
  ): Promise<DetectedAnomaly[]> {
    const anomalies: DetectedAnomaly[] = [];

    try {
      // Get recent metrics data
      const { data: recentMetrics, error } = await supabase
        .from('metrics_runs')
        .select('*')
        .eq('project_id', projectId)
        .gte('created_at', new Date(Date.now() - config.lookbackDays * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error || !recentMetrics || recentMetrics.length < 2) return anomalies;

      // Group by phase and microstep
      const groupedMetrics = new Map<string, any[]>();
      for (const metric of recentMetrics) {
        const key = `${metric.phase}-${metric.microstep_id}`;
        if (!groupedMetrics.has(key)) {
          groupedMetrics.set(key, []);
        }
        groupedMetrics.get(key)!.push(metric);
      }

      // Check each group for quality drops
      for (const [key, metrics] of groupedMetrics) {
        if (metrics.length < 2) continue;

        metrics.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        
        const recent = metrics.slice(-2); // Last 2 entries
        const baseline = metrics.slice(0, -1); // All but last entry

        if (baseline.length === 0) continue;

        const baselineQuality = baseline.reduce((sum, m) => sum + m.quality, 0) / baseline.length;
        const latestQuality = recent[recent.length - 1].quality;

        // Check for quality drop
        if (baselineQuality > 0 && latestQuality < baselineQuality * (1 - config.qualityDropThreshold / 100)) {
          const dropPercentage = ((baselineQuality - latestQuality) / baselineQuality * 100);
          
          anomalies.push({
            type: 'quality_drop',
            title: 'Quality Drop Detected',
            description: `Quality score dropped from ${baselineQuality.toFixed(1)}% to ${latestQuality.toFixed(1)}% (${dropPercentage.toFixed(1)}% decrease)`,
            severity: this.calculateQualityDropSeverity(dropPercentage),
            project_id: projectId,
            phase: recent[recent.length - 1].phase,
            microstep_id: recent[recent.length - 1].microstep_id,
            threshold_value: baselineQuality * (1 - config.qualityDropThreshold / 100),
            actual_value: latestQuality,
            metadata: {
              baseline_quality: baselineQuality,
              drop_percentage: dropPercentage,
              recent_entries: recent.length,
              baseline_entries: baseline.length,
            },
          });
        }
      }

    } catch (error) {
      console.error('Failed to detect quality drops:', error);
    }

    return anomalies;
  }

  /**
   * Detect velocity drops
   */
  private static async detectVelocityDrops(
    projectId: string, 
    config: AnomalyDetectionConfig
  ): Promise<DetectedAnomaly[]> {
    const anomalies: DetectedAnomaly[] = [];

    try {
      // Get velocity trend data
      const velocityTrend = await AnalyticsStorage.getVelocityTrend(projectId, config.lookbackDays);

      if (velocityTrend.length < 3) return anomalies;

      // Calculate recent vs baseline velocity
      const recentDays = velocityTrend.slice(-2); // Last 2 days
      const baselineDays = velocityTrend.slice(0, -2); // All but last 2 days

      if (baselineDays.length === 0) return anomalies;

      const baselineVelocity = baselineDays.reduce((sum, day) => sum + (day.avg_velocity || 0), 0) / baselineDays.length;
      const recentVelocity = recentDays.reduce((sum, day) => sum + (day.avg_velocity || 0), 0) / recentDays.length;

      // Check for velocity drop
      if (baselineVelocity > 0 && recentVelocity < baselineVelocity * (1 - config.velocityDropThreshold / 100)) {
        const dropPercentage = ((baselineVelocity - recentVelocity) / baselineVelocity * 100);
        
        anomalies.push({
          type: 'velocity_drop',
          title: 'Velocity Drop Detected',
          description: `Development velocity dropped from ${baselineVelocity.toFixed(2)} to ${recentVelocity.toFixed(2)} microsteps/week (${dropPercentage.toFixed(1)}% decrease)`,
          severity: this.calculateVelocityDropSeverity(dropPercentage),
          project_id: projectId,
          threshold_value: baselineVelocity * (1 - config.velocityDropThreshold / 100),
          actual_value: recentVelocity,
          metadata: {
            baseline_velocity: baselineVelocity,
            drop_percentage: dropPercentage,
            recent_days: recentDays.length,
            baseline_days: baselineDays.length,
          },
        });
      }

    } catch (error) {
      console.error('Failed to detect velocity drops:', error);
    }

    return anomalies;
  }

  /**
   * Detect budget exceeded
   */
  private static async detectBudgetExceeded(
    projectId: string, 
    config: AnomalyDetectionConfig
  ): Promise<DetectedAnomaly[]> {
    const anomalies: DetectedAnomaly[] = [];

    try {
      const budget = await AnalyticsStorage.getProjectBudget(projectId);
      if (!budget) return anomalies;

      const usagePercentage = (budget.current_month_spend / budget.monthly_limit_usd) * 100;

      // Check if approaching or exceeding budget
      if (usagePercentage >= config.budgetExceededThreshold) {
        const severity = usagePercentage >= 100 ? 'critical' : 
                        usagePercentage >= 95 ? 'high' : 'medium';

        anomalies.push({
          type: 'budget_exceeded',
          title: usagePercentage >= 100 ? 'Budget Exceeded' : 'Budget Alert',
          description: `Monthly spend ($${budget.current_month_spend.toFixed(2)}) is ${usagePercentage.toFixed(1)}% of budget ($${budget.monthly_limit_usd.toFixed(2)})`,
          severity,
          project_id: projectId,
          threshold_value: budget.monthly_limit_usd * (config.budgetExceededThreshold / 100),
          actual_value: budget.current_month_spend,
          metadata: {
            monthly_limit: budget.monthly_limit_usd,
            current_spend: budget.current_month_spend,
            usage_percentage: usagePercentage,
            alert_threshold: config.budgetExceededThreshold,
          },
        });
      }

    } catch (error) {
      console.error('Failed to detect budget exceeded:', error);
    }

    return anomalies;
  }

  /**
   * Detect usage anomalies (unusual patterns)
   */
  private static async detectUsageAnomalies(
    projectId: string, 
    config: AnomalyDetectionConfig
  ): Promise<DetectedAnomaly[]> {
    const anomalies: DetectedAnomaly[] = [];

    try {
      // Get recent usage data
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - config.lookbackDays * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

      const usageData = await AnalyticsStorage.getCostUsage({
        projectId,
        startDate,
        endDate,
      });

      // Group by provider and detect unusual patterns
      const providerUsage = new Map<string, number[]>();
      for (const usage of usageData) {
        if (!providerUsage.has(usage.provider)) {
          providerUsage.set(usage.provider, []);
        }
        providerUsage.get(usage.provider)!.push(usage.usd_cost);
      }

      // Check each provider for anomalies
      for (const [provider, costs] of providerUsage) {
        if (costs.length < 3) continue;

        const avg = costs.reduce((sum, cost) => sum + cost, 0) / costs.length;
        const stdDev = Math.sqrt(costs.reduce((sum, cost) => sum + Math.pow(cost - avg, 2), 0) / costs.length);
        
        // Check for outliers (more than 2 standard deviations from mean)
        const outliers = costs.filter(cost => Math.abs(cost - avg) > 2 * stdDev);
        
        if (outliers.length > 0) {
          const maxOutlier = Math.max(...outliers);
          
          anomalies.push({
            type: 'usage_anomaly',
            title: `Unusual ${provider} Usage Pattern`,
            description: `Detected unusual usage pattern for ${provider}: $${maxOutlier.toFixed(2)} vs average $${avg.toFixed(2)}`,
            severity: maxOutlier > avg * 3 ? 'high' : 'medium',
            project_id: projectId,
            threshold_value: avg + 2 * stdDev,
            actual_value: maxOutlier,
            metadata: {
              provider,
              average_cost: avg,
              standard_deviation: stdDev,
              outlier_count: outliers.length,
              max_outlier: maxOutlier,
            },
          });
        }
      }

    } catch (error) {
      console.error('Failed to detect usage anomalies:', error);
    }

    return anomalies;
  }

  /**
   * Send anomaly alerts
   */
  private static async sendAnomalyAlerts(anomalies: DetectedAnomaly[]): Promise<void> {
    try {
      // Log alert event
      await supabase
        .from('runner_events')
        .insert([{
          actor: 'anomaly-detector',
          action: 'anomaly_alert_sent',
          payload: {
            anomaly_count: anomalies.length,
            critical_count: anomalies.filter(a => a.severity === 'critical').length,
            high_count: anomalies.filter(a => a.severity === 'high').length,
            anomaly_types: [...new Set(anomalies.map(a => a.type))],
          },
          metadata: {
            alert_timestamp: new Date().toISOString(),
            alert_method: 'email', // In production, would send actual emails
          },
        }]);

      console.log(`Sent alerts for ${anomalies.length} anomalies`);

    } catch (error) {
      console.error('Failed to send anomaly alerts:', error);
    }
  }

  /**
   * Calculate severity for cost spikes
   */
  private static calculateCostSpikeSeverity(spikePercentage: number): 'low' | 'medium' | 'high' | 'critical' {
    if (spikePercentage >= 200) return 'critical';
    if (spikePercentage >= 100) return 'high';
    if (spikePercentage >= 50) return 'medium';
    return 'low';
  }

  /**
   * Calculate severity for quality drops
   */
  private static calculateQualityDropSeverity(dropPercentage: number): 'low' | 'medium' | 'high' | 'critical' {
    if (dropPercentage >= 50) return 'critical';
    if (dropPercentage >= 30) return 'high';
    if (dropPercentage >= 20) return 'medium';
    return 'low';
  }

  /**
   * Calculate severity for velocity drops
   */
  private static calculateVelocityDropSeverity(dropPercentage: number): 'low' | 'medium' | 'high' | 'critical' {
    if (dropPercentage >= 60) return 'critical';
    if (dropPercentage >= 40) return 'high';
    if (dropPercentage >= 30) return 'medium';
    return 'low';
  }
}
