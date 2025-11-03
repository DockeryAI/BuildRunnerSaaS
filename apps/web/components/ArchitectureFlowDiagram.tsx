'use client';

import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ArchComponent {
  id: string;
  name: string;
  description: string;
  dependencies?: string[];
  steps: string[];
}

interface ArchNode {
  id: string;
  name: string;
  subtitle?: string;
  description?: string;
  type: 'user' | 'webapp' | 'gateway' | 'service' | 'database' | 'cache' | 'external';
  layer: 'user' | 'presentation' | 'application' | 'data' | 'integration';
  x: number;
  y: number;
  progress: number; // 0-100
  steps?: string[];
  components?: ArchComponent[];
}

interface ArchConnection {
  from: string;
  to: string;
  type: 'sync' | 'async';
  label?: string;
}

const LAYERS = [
  { id: 'user', name: 'User Layer', color: '#E9F3FF', textColor: '#1E40AF' },
  { id: 'presentation', name: 'Presentation Layer', color: '#EFE9FF', textColor: '#6B21A8' },
  { id: 'application', name: 'Application Layer', color: '#EAF8F0', textColor: '#047857' },
  { id: 'data', name: 'Data Layer', color: '#E6F7F6', textColor: '#0F766E' },
  { id: 'integration', name: 'Integration Layer', color: '#F1F3F5', textColor: '#374151' },
];

const DEFAULT_NODES: ArchNode[] = [
  {
    id: 'user',
    name: 'User',
    description: 'End user interacting with the application',
    type: 'user',
    layer: 'user',
    x: 100,
    y: 100,
    progress: 0, // User doesn't have progress
    steps: ['User authentication', 'User interface interaction', 'Data input/output']
  },
  {
    id: 'webapp',
    name: 'Web App',
    subtitle: 'React/Next.js',
    description: 'Frontend application built with React and Next.js',
    type: 'webapp',
    layer: 'presentation',
    x: 100,
    y: 300,
    progress: 0,
    steps: ['Setup Next.js project', 'Create component structure', 'Implement routing', 'Add state management', 'Connect to API'],
    components: [
      {
        id: 'webapp-routing',
        name: 'Routing System',
        description: 'App router for navigation between pages',
        dependencies: ['Next.js 14'],
        steps: ['Configure app directory structure', 'Create page components', 'Setup dynamic routes', 'Add navigation components']
      },
      {
        id: 'webapp-auth',
        name: 'Authentication UI',
        description: 'Login, signup, and user profile components',
        dependencies: ['Supabase Auth'],
        steps: ['Create login form', 'Create signup form', 'Add session management', 'Build user profile page']
      },
      {
        id: 'webapp-dashboard',
        name: 'Dashboard',
        description: 'Main application dashboard with data visualization',
        dependencies: ['API Gateway', 'State Management'],
        steps: ['Design dashboard layout', 'Add data fetching', 'Create charts and metrics', 'Implement real-time updates']
      }
    ]
  },
  {
    id: 'gateway',
    name: 'API Gateway',
    subtitle: 'REST/GraphQL',
    description: 'API gateway for routing and authentication',
    type: 'gateway',
    layer: 'application',
    x: 100,
    y: 500,
    progress: 0,
    steps: ['Setup API routes', 'Implement authentication middleware', 'Add rate limiting', 'Configure CORS']
  },
  {
    id: 'service',
    name: 'Service',
    subtitle: 'Business Logic',
    description: 'Core business logic and data processing',
    type: 'service',
    layer: 'application',
    x: 500,
    y: 500,
    progress: 0,
    steps: ['Define service interfaces', 'Implement business rules', 'Add validation logic', 'Write unit tests']
  },
  {
    id: 'database',
    name: 'Database',
    subtitle: 'PostgreSQL',
    description: 'Primary data storage using PostgreSQL',
    type: 'database',
    layer: 'data',
    x: 300,
    y: 700,
    progress: 0,
    steps: ['Design database schema', 'Create migrations', 'Setup connection pool', 'Add indexes', 'Configure backups']
  },
  {
    id: 'cache',
    name: 'Cache',
    subtitle: 'Redis',
    description: 'In-memory caching layer for performance',
    type: 'cache',
    layer: 'data',
    x: 700,
    y: 700,
    progress: 0,
    steps: ['Setup Redis instance', 'Define caching strategy', 'Implement cache invalidation']
  },
  {
    id: 'external',
    name: 'External API',
    subtitle: '3rd Party',
    description: 'Third-party API integrations',
    type: 'external',
    layer: 'integration',
    x: 900,
    y: 500,
    progress: 0,
    steps: ['Research API documentation', 'Obtain API keys', 'Implement API client', 'Add error handling', 'Write integration tests']
  },
];

const DEFAULT_CONNECTIONS: ArchConnection[] = [
  { from: 'user', to: 'webapp', type: 'sync' },
  { from: 'webapp', to: 'gateway', type: 'sync' },
  { from: 'gateway', to: 'service', type: 'sync' },
  { from: 'service', to: 'database', type: 'sync' },
  { from: 'service', to: 'cache', type: 'sync' },
  { from: 'service', to: 'external', type: 'async', label: 'Queue' },
];

export default function ArchitectureFlowDiagram() {
  const [nodes] = useState<ArchNode[]>(DEFAULT_NODES);
  const [connections] = useState<ArchConnection[]>(DEFAULT_CONNECTIONS);
  const [selectedNode, setSelectedNode] = useState<ArchNode | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<ArchComponent | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.min(Math.max(prev * delta, 0.5), 3));
  };

  useEffect(() => {
    const svg = svgRef.current;
    if (svg) {
      svg.addEventListener('wheel', handleWheel, { passive: false });
      return () => svg.removeEventListener('wheel', handleWheel);
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Allow dragging from background areas (not on interactive node elements)
    const target = e.target as SVGElement;
    const isNodeElement = target.closest('g[data-node-id]');
    const isLayerElement = target.closest('g.layer-group');

    if (!isNodeElement && !isLayerElement) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      setPan(prev => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));

      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleNodeDoubleClick = (node: ArchNode) => {
    setSelectedNode(node);
  };

  const handleLayerClick = (layerId: string) => {
    setSelectedLayer(layerId);
  };

  const handleNodeClickFromLayer = (node: ArchNode) => {
    setSelectedLayer(null);
    setSelectedNode(node);
  };

  const getNodesInLayer = (layerId: string) => {
    return nodes.filter(node => node.layer === layerId);
  };

  const renderNode = (node: ArchNode) => {
    const getNodeShape = () => {
      const shadow = "filter='url(#dropShadow)'";

      switch (node.type) {
        case 'user':
          return (
            <>
              <rect
                x={node.x}
                y={node.y}
                width="120"
                height="80"
                rx="8"
                fill="#DBEAFE"
                stroke="#3B82F6"
                strokeWidth="2"
                filter="url(#dropShadow)"
              />
            </>
          );
        case 'webapp':
          return (
            <rect
              x={node.x}
              y={node.y}
              width="140"
              height="80"
              rx="8"
              fill="#DDD6FE"
              stroke="#8B5CF6"
              strokeWidth="2"
              filter="url(#dropShadow)"
            />
          );
        case 'gateway':
        case 'service':
          return (
            <rect
              x={node.x}
              y={node.y}
              width="140"
              height="80"
              rx="8"
              fill={node.type === 'gateway' ? '#BFDBFE' : '#99F6E4'}
              stroke={node.type === 'gateway' ? '#3B82F6' : '#14B8A6'}
              strokeWidth="2"
              filter="url(#dropShadow)"
            />
          );
        case 'database':
          return (
            <g filter="url(#dropShadow)">
              <ellipse
                cx={node.x + 70}
                cy={node.y + 15}
                rx="70"
                ry="15"
                fill="#5EEAD4"
                stroke="#14B8A6"
                strokeWidth="2"
              />
              <rect
                x={node.x}
                y={node.y + 15}
                width="140"
                height="65"
                fill="#5EEAD4"
                stroke="#14B8A6"
                strokeWidth="2"
              />
              <ellipse
                cx={node.x + 70}
                cy={node.y + 80}
                rx="70"
                ry="15"
                fill="#5EEAD4"
                stroke="#14B8A6"
                strokeWidth="2"
              />
            </g>
          );
        case 'cache':
          return (
            <g filter="url(#dropShadow)">
              <rect
                x={node.x}
                y={node.y}
                width="120"
                height="80"
                rx="8"
                fill="#FCA5A5"
                stroke="#EF4444"
                strokeWidth="2"
              />
              <path
                d={`M${node.x + 50} ${node.y + 20} L${node.x + 65} ${node.y + 40} L${node.x + 55} ${node.y + 40} L${node.x + 70} ${node.y + 60} L${node.x + 45} ${node.y + 45} L${node.x + 55} ${node.y + 45} Z`}
                fill="#FBBF24"
                stroke="#F59E0B"
                strokeWidth="1"
              />
            </g>
          );
        case 'external':
          return (
            <polygon
              points={`${node.x + 30},${node.y} ${node.x + 110},${node.y} ${node.x + 140},${node.y + 40} ${node.x + 110},${node.y + 80} ${node.x + 30},${node.y + 80} ${node.x},${node.y + 40}`}
              fill="#E5E7EB"
              stroke="#6B7280"
              strokeWidth="2"
              filter="url(#dropShadow)"
            />
          );
      }
    };

    const centerX = node.x + (node.type === 'database' ? 70 : node.type === 'external' ? 70 : node.type === 'cache' ? 60 : 70);
    const centerY = node.y + 40;

    return (
      <g
        key={node.id}
        data-node-id={node.id}
        onDoubleClick={() => handleNodeDoubleClick(node)}
        className="cursor-pointer hover:opacity-90 transition-opacity"
      >
        {getNodeShape()}
        <text
          x={centerX}
          y={node.y + 30}
          textAnchor="middle"
          className="font-bold text-sm pointer-events-none"
          fill="#1F2937"
        >
          {node.name}
        </text>
        {node.subtitle && (
          <text
            x={centerX}
            y={node.y + 48}
            textAnchor="middle"
            className="text-xs pointer-events-none"
            fill="#6B7280"
          >
            {node.subtitle}
          </text>
        )}

        {/* Progress bar - skip for user layer */}
        {node.type !== 'user' && (
          <g>
            <rect
              x={node.x + 10}
              y={node.y + 60}
              width={node.type === 'cache' ? 100 : node.type === 'database' ? 120 : 120}
              height="6"
              rx="3"
              fill="#E5E7EB"
            />
            <rect
              x={node.x + 10}
              y={node.y + 60}
              width={(node.type === 'cache' ? 100 : node.type === 'database' ? 120 : 120) * (node.progress / 100)}
              height="6"
              rx="3"
              fill={node.progress === 100 ? '#10B981' : node.progress > 50 ? '#3B82F6' : '#F59E0B'}
            />
            <text
              x={centerX}
              y={node.y + 75}
              textAnchor="middle"
              className="text-[10px] font-medium pointer-events-none"
              fill="#6B7280"
            >
              {node.progress}%
            </text>
          </g>
        )}
      </g>
    );
  };

  const renderConnection = (conn: ArchConnection) => {
    const fromNode = nodes.find(n => n.id === conn.from);
    const toNode = nodes.find(n => n.id === conn.to);

    if (!fromNode || !toNode) return null;

    const fromX = fromNode.x + (fromNode.type === 'database' ? 70 : fromNode.type === 'external' ? 70 : fromNode.type === 'cache' ? 60 : 70);
    const fromY = fromNode.y + 80;
    const toX = toNode.x + (toNode.type === 'database' ? 70 : toNode.type === 'external' ? 70 : toNode.type === 'cache' ? 60 : 70);
    const toY = toNode.y;

    const isAsync = conn.type === 'async';

    return (
      <g key={`${conn.from}-${conn.to}`}>
        <defs>
          <marker
            id={`arrow-${conn.from}-${conn.to}`}
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <path
              d="M0,0 L0,6 L9,3 z"
              fill={isAsync ? '#F97316' : '#3B82F6'}
            />
          </marker>
        </defs>

        <path
          d={`M ${fromX} ${fromY} L ${toX} ${toY}`}
          stroke={isAsync ? '#F97316' : '#3B82F6'}
          strokeWidth="2"
          strokeDasharray={isAsync ? '5,5' : '0'}
          fill="none"
          markerEnd={`url(#arrow-${conn.from}-${conn.to})`}
        />

        {conn.label && (
          <>
            <rect
              x={(fromX + toX) / 2 - 30}
              y={(fromY + toY) / 2 - 12}
              width="60"
              height="24"
              rx="4"
              fill="#FFF7ED"
              stroke="#F97316"
              strokeWidth="1"
            />
            <text
              x={(fromX + toX) / 2}
              y={(fromY + toY) / 2 + 5}
              textAnchor="middle"
              className="text-xs font-medium"
              fill="#EA580C"
            >
              {conn.label}
            </text>
          </>
        )}
      </g>
    );
  };

  return (
    <div className="w-full h-full bg-[#F4F6F8] overflow-hidden relative">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2">
        <button
          onClick={() => setZoom(prev => Math.min(prev * 1.2, 3))}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
        >
          +
        </button>
        <div className="text-xs text-center text-gray-600">{Math.round(zoom * 100)}%</div>
        <button
          onClick={() => setZoom(prev => Math.max(prev / 1.2, 0.5))}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
        >
          −
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs font-medium"
        >
          Reset
        </button>
      </div>

      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 1920 1080"
        className="cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="2" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Layer zones */}
          {LAYERS.map((layer, index) => (
            <g key={layer.id}>
              <rect
                x="50"
                y={50 + index * 200}
                width="1820"
                height="180"
                rx="12"
                fill={layer.color}
                opacity="0.5"
                className="pointer-events-none"
              />
              <g
                onClick={() => handleLayerClick(layer.id)}
                className="cursor-pointer layer-group"
              >
                <rect
                  x="50"
                  y={50 + index * 200}
                  width="200"
                  height="40"
                  rx="8"
                  fill="transparent"
                  className="hover:fill-white/20 transition-all"
                />
                <text
                  x="70"
                  y={80 + index * 200}
                  className="font-semibold text-sm uppercase tracking-wide pointer-events-none"
                  fill={layer.textColor}
                >
                  {layer.name}
                </text>
              </g>
            </g>
          ))}

          {/* Connections */}
          {connections.map(conn => renderConnection(conn))}

          {/* Nodes */}
          {nodes.map(node => renderNode(node))}
        </g>
      </svg>

      {/* Layer Details Modal */}
      {selectedLayer && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto">
            <div className="p-6 border-b border-gray-200 flex items-start justify-between bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-xl">
              <div>
                <h2 className="text-2xl font-bold">
                  {LAYERS.find(l => l.id === selectedLayer)?.name}
                </h2>
                <p className="text-sm opacity-90 mt-1">
                  {getNodesInLayer(selectedLayer).length} component{getNodesInLayer(selectedLayer).length !== 1 ? 's' : ''} in this layer
                </p>
              </div>
              <button
                onClick={() => setSelectedLayer(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Components</h3>
              <div className="space-y-3">
                {getNodesInLayer(selectedLayer).map((node) => (
                  <button
                    key={node.id}
                    onClick={() => handleNodeClickFromLayer(node)}
                    className="w-full text-left p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{node.name}</h4>
                        {node.subtitle && (
                          <p className="text-sm text-gray-500 mb-2">{node.subtitle}</p>
                        )}
                        <p className="text-sm text-gray-700">{node.description}</p>
                        {node.type !== 'user' && (
                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  node.progress === 100 ? 'bg-green-500' : node.progress > 50 ? 'bg-blue-500' : 'bg-orange-500'
                                }`}
                                style={{ width: `${node.progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-600">{node.progress}%</span>
                          </div>
                        )}
                      </div>
                      <svg className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end">
              <button
                onClick={() => setSelectedLayer(null)}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Component Details Modal */}
      {selectedComponent && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto">
            <div className="p-6 border-b border-gray-200 flex items-start justify-between bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-t-xl">
              <div>
                <h2 className="text-2xl font-bold">{selectedComponent.name}</h2>
                <p className="text-sm opacity-90 mt-1">Component Details</p>
              </div>
              <button
                onClick={() => setSelectedComponent(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Description</h3>
                <p className="text-gray-900">{selectedComponent.description}</p>
              </div>

              {selectedComponent.dependencies && selectedComponent.dependencies.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Dependencies</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedComponent.dependencies.map((dep, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Implementation Steps</h3>
                <ol className="space-y-2">
                  {selectedComponent.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-semibold">
                        {idx + 1}
                      </span>
                      <span className="text-gray-900 pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end">
              <button
                onClick={() => setSelectedComponent(null)}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Node Details Modal */}
      {selectedNode && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto">
            <div className="p-6 border-b border-gray-200 flex items-start justify-between bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
              <div>
                <h2 className="text-2xl font-bold">{selectedNode.name}</h2>
                {selectedNode.subtitle && (
                  <p className="text-sm opacity-90 mt-1">{selectedNode.subtitle}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Description</h3>
                <p className="text-gray-900">{selectedNode.description}</p>
              </div>

              {selectedNode.type !== 'user' && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Progress</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full transition-all ${
                          selectedNode.progress === 100 ? 'bg-green-500' : selectedNode.progress > 50 ? 'bg-blue-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${selectedNode.progress}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold text-gray-900">{selectedNode.progress}%</span>
                  </div>
                </div>
              )}

              {selectedNode.components && selectedNode.components.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Components</h3>
                  <div className="space-y-2">
                    {selectedNode.components.map((component) => (
                      <button
                        key={component.id}
                        onClick={() => {
                          setSelectedComponent(component);
                          setSelectedNode(null);
                        }}
                        className="w-full text-left p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{component.name}</h4>
                            <p className="text-sm text-gray-700">{component.description}</p>
                          </div>
                          <svg className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedNode.steps && !selectedNode.components && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Implementation Steps</h3>
                  <ol className="space-y-2">
                    {selectedNode.steps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold">
                          {idx + 1}
                        </span>
                        <span className="text-gray-900 pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end">
              <button
                onClick={() => setSelectedNode(null)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
