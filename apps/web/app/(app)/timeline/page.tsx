'use client';

import React, { useState, useEffect } from 'react';
import { TimelineChart } from '../../../components/timeline/TimelineChart';
import { ProgressCards } from '../../../components/timeline/ProgressCards';
import { fetchTimelineData, TimelineData } from '../../../lib/timeline';
import { fetchProgressSummary, ProgressSummary } from '../../../lib/flow';
import { Button } from '../../../components/ui/button';
import { RefreshCw, Loader2, Download } from 'lucide-react';

export default function TimelinePage() {
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [progressSummary, setProgressSummary] = useState<ProgressSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [timeline, progress] = await Promise.all([
        fetchTimelineData(),
        fetchProgressSummary(),
      ]);
      
      setTimelineData(timeline);
      setProgressSummary(progress);
    } catch (err) {
      console.error('Failed to load timeline data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load timeline data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Set up auto-refresh every 60 seconds
    const interval = setInterval(() => {
      loadData();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export timeline data');
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">Loading timeline data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600">Error: {error}</p>
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!timelineData) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-600">No timeline data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">Timeline & Analytics</h1>
          <p className="text-gray-600">
            Track progress, velocity, and project milestones over time
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Progress Cards */}
      <ProgressCards 
        progressSummary={progressSummary}
        timelineData={timelineData}
      />

      {/* Timeline Chart */}
      <TimelineChart data={timelineData} />
    </div>
  );
}
