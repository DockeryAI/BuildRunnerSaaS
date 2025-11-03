```typescript
import React, { useState, useEffect } from 'react';
import { 
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { OpenRouterClient } from '../services/openRouterClient';
import { 
  AnalyticsData,
  TimeSeriesMetric,
  MetricBreakdown
} from '../types/analytics';

interface AnalyticsDashboardProps {
  /** API key for OpenRouter authentication */
  apiKey: string;
  /** Time range in days to display analytics for */
  timeRange?: number;
  /** Callback when error occurs */
  onError?: (error: Error) => void;
}

/**
 * Advanced Analytics Dashboard component that displays key metrics and trends
 * using OpenRouter API data
 */
export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  apiKey,
  timeRange = 30,
  onError
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const client = new OpenRouterClient(apiKey);
        const data = await client.getAnalytics(timeRange);
        setAnalyticsData(data);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch analytics');
        setError(error);
        onError?.(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [apiKey, timeRange]);

  if (loading) {
    return <div className="analytics-loading">Loading analytics data...</div>;
  }

  if (error) {
    return (
      <div className="analytics-error">
        Error loading analytics: {error.message}
      </div>
    );
  }

  if (!analyticsData) {
    return null;
  }

  const { timeSeriesData, metricBreakdowns } = analyticsData;

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <div className="time-range">
          Last {timeRange} days
        </div>
      </div>

      <div className="metrics-overview">
        <div className="metric-card">
          <h3>Total Requests</h3>
          <div className="metric-value">
            {analyticsData.totalRequests.toLocaleString()}
          </div>
        </div>
        <div className="metric-card">
          <h3>Success Rate</h3>
          <div className="metric-value">
            {(analyticsData.successRate * 100).toFixed(1)}%
          </div>
        </div>
        <div className="metric-card">
          <h3>Avg. Response Time</h3>
          <div className="metric-value">
            {analyticsData.avgResponseTime.toFixed(2)}ms
          </div>
        </div>
      </div>

      <div className="time-series-chart">
        <h2>Request Volume Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="requests"
              stroke="#8884d8"
              name="Requests"
            />
            <Line
              type="monotone" 
              dataKey="errors"
              stroke="#ff0000"
              name="Errors"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="breakdown-chart">
        <h2>Request Distribution by Model</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={metricBreakdowns}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <style jsx>{`
        .analytics-dashboard {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .metrics-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .metric-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: #8884d8;
        }

        .time-series-chart,
        .breakdown-chart {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }

        .analytics-loading,
        .analytics-error {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
          font-size: 18px;
        }

        .analytics-error {
          color: #ff0000;
        }
      `}</style>
    </div>
  );
};

export default AnalyticsDashboard;
```