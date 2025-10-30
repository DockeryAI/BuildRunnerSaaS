'use client';

import React, { useState, useEffect } from 'react';
import { FlowGraph } from '../../../components/flow/FlowGraph';
import { NodeDrawer } from '../../../components/flow/NodeDrawer';
import { fetchFlowData, FlowData, FlowNode } from '../../../lib/flow';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { RefreshCw, Loader2 } from 'lucide-react';

export default function FlowPage() {
  const [flowData, setFlowData] = useState<FlowData | null>(null);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFlowData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchFlowData();
      setFlowData(data);
    } catch (err) {
      console.error('Failed to load flow data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load flow data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFlowData();

    // Set up auto-refresh every 60 seconds
    const interval = setInterval(() => {
      loadFlowData();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleNodeClick = (node: FlowNode) => {
    setSelectedNode(node);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedNode(null);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">Loading flow data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600">Error: {error}</p>
          <Button onClick={loadFlowData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!flowData) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-600">No flow data available</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Flow Inspector</h1>
          <p className="text-sm text-gray-600">
            Visual representation of project milestones, steps, and microsteps
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Metadata */}
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {flowData.metadata.total_nodes} nodes
            </Badge>
            <Badge 
              variant={flowData.metadata.completion_percentage >= 80 ? 'default' : 'secondary'}
            >
              {flowData.metadata.completion_percentage}% complete
            </Badge>
            {flowData.metadata.drift_count > 0 && (
              <Badge variant="destructive">
                {flowData.metadata.drift_count} drift issues
              </Badge>
            )}
          </div>
          
          <Button onClick={loadFlowData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Graph */}
      <div className="flex-1 relative">
        <FlowGraph 
          data={flowData}
          onNodeClick={handleNodeClick}
          className="w-full h-full"
        />
        
        {/* Legend */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">Legend</h3>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
              <span>Todo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-100 border border-amber-300 rounded"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
              <span>Done</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-red-500 rounded"></div>
              <span>Drift Detected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Node Drawer */}
      <NodeDrawer 
        node={selectedNode}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}
