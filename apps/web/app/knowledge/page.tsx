'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Maximize2, 
  Minimize2, 
  RotateCcw,
  Download,
  Share2,
  Info,
  Network,
  Brain,
  Zap,
  Target,
  BookOpen,
  Users,
  TrendingUp,
  Eye,
  EyeOff
} from 'lucide-react';

interface KnowledgeNode {
  id: string;
  type: string;
  label: string;
  description?: string;
  metadata: any;
  popularity_score: number;
  quality_score: number;
  x?: number;
  y?: number;
}

interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
  weight: number;
}

interface GraphData {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

const nodeTypeColors = {
  project: '#3B82F6',      // Blue
  milestone: '#10B981',    // Green
  step: '#F59E0B',         // Amber
  microstep: '#EF4444',    // Red
  template: '#8B5CF6',     // Purple
  pack: '#06B6D4',         // Cyan
  integration: '#F97316',  // Orange
  user: '#EC4899',         // Pink
  skill: '#84CC16',        // Lime
  topic: '#6366F1',        // Indigo
  technology: '#14B8A6',   // Teal
  pattern: '#A855F7',      // Violet
  insight: '#F43F5E',      // Rose
};

const nodeTypeIcons = {
  project: Target,
  milestone: TrendingUp,
  step: Zap,
  microstep: Brain,
  template: BookOpen,
  pack: Network,
  integration: Share2,
  user: Users,
  skill: Target,
  topic: Brain,
  technology: Zap,
  pattern: Network,
  insight: Info,
};

export default function KnowledgePage() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [showLabels, setShowLabels] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const graphRef = useRef<HTMLDivElement>(null);

  // Load knowledge graph data
  useEffect(() => {
    loadGraphData();
  }, [filterType]);

  const loadGraphData = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (filterType !== 'all') {
        params.append('type', filterType);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      const response = await fetch(`/api/knowledge/graph?${params}`);
      const data = await response.json();
      
      setGraphData(data);
    } catch (error) {
      console.error('Error loading graph data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadGraphData();
  };

  const handleNodeClick = (node: KnowledgeNode) => {
    setSelectedNode(node);
  };

  const resetGraph = () => {
    setSearchQuery('');
    setFilterType('all');
    setSelectedNode(null);
    loadGraphData();
  };

  const exportGraph = () => {
    const dataStr = JSON.stringify(graphData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'knowledge-graph.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Get unique node types for filter
  const nodeTypes = Array.from(new Set(graphData.nodes.map(node => node.type))).sort();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Network className="h-8 w-8 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading knowledge graph...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-gray-50`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Network className="h-8 w-8 text-blue-600 mr-3" />
                Knowledge Explorer
              </h1>
              <p className="text-gray-600 mt-2">
                Explore the interconnected knowledge graph of your BuildRunner ecosystem
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowLabels(!showLabels)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  showLabels 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {showLabels ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <span>Labels</span>
              </button>
              
              <button
                onClick={resetGraph}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>
              
              <button
                onClick={exportGraph}
                className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                <span>{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="space-y-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search nodes..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSearch}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Node Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  {nodeTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Graph Stats */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Graph Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Nodes</span>
                <span className="text-sm font-medium text-gray-900">{graphData.nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Edges</span>
                <span className="text-sm font-medium text-gray-900">{graphData.edges.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Node Types</span>
                <span className="text-sm font-medium text-gray-900">{nodeTypes.length}</span>
              </div>
            </div>
          </div>

          {/* Node Details */}
          {selectedNode && (
            <div className="p-6 flex-1 overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Node Details</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: nodeTypeColors[selectedNode.type] || '#6B7280' }}
                    ></div>
                    <span className="text-sm font-medium text-gray-900">{selectedNode.label}</span>
                  </div>
                  <p className="text-sm text-gray-600">{selectedNode.description || 'No description available'}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">Type:</span>
                  <span className="ml-2 text-sm text-gray-600 capitalize">{selectedNode.type}</span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">Popularity Score:</span>
                  <span className="ml-2 text-sm text-gray-600">{selectedNode.popularity_score.toFixed(2)}</span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">Quality Score:</span>
                  <span className="ml-2 text-sm text-gray-600">{selectedNode.quality_score.toFixed(2)}</span>
                </div>

                {selectedNode.metadata && Object.keys(selectedNode.metadata).length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 block mb-2">Metadata:</span>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                        {JSON.stringify(selectedNode.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Graph Visualization */}
        <div className="flex-1 relative">
          <div 
            ref={graphRef}
            className="w-full h-full bg-white"
            style={{ minHeight: isFullscreen ? '100vh' : 'calc(100vh - 120px)' }}
          >
            {/* Placeholder for graph visualization */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Network className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Interactive Graph Visualization</h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  This would render an interactive force-directed graph using a library like D3.js, 
                  vis.js, or react-force-graph showing the knowledge nodes and their relationships.
                </p>
                
                {/* Mock graph representation */}
                <div className="bg-gray-50 rounded-lg p-8 max-w-2xl mx-auto">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {graphData.nodes.slice(0, 9).map((node, index) => {
                      const IconComponent = nodeTypeIcons[node.type] || Brain;
                      return (
                        <div
                          key={node.id}
                          onClick={() => handleNodeClick(node)}
                          className="flex flex-col items-center p-3 bg-white rounded-lg border cursor-pointer hover:shadow-md transition-shadow"
                        >
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center mb-2"
                            style={{ backgroundColor: nodeTypeColors[node.type] || '#6B7280' }}
                          >
                            <IconComponent className="h-4 w-4 text-white" />
                          </div>
                          {showLabels && (
                            <span className="text-xs text-gray-600 text-center truncate w-full">
                              {node.label}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    Click on nodes to explore their details and connections
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Graph Controls */}
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border p-2">
            <div className="flex space-x-2">
              <button
                onClick={() => {/* Zoom in */}}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                title="Zoom In"
              >
                +
              </button>
              <button
                onClick={() => {/* Zoom out */}}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                title="Zoom Out"
              >
                -
              </button>
              <button
                onClick={() => {/* Reset zoom */}}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                title="Reset View"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
