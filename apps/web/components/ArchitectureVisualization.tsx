'use client';

import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Loader2, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

interface ArchitectureVisualizationProps {
  projectName: string;
}

interface ArchitectureNode {
  id: string;
  type: 'component' | 'page' | 'api' | 'util' | 'database';
  label: string;
  description?: string;
  dependencies?: string[];
}

export default function ArchitectureVisualization({
  projectName,
}: ArchitectureVisualizationProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const fetchArchitecture = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/claude-builder/architecture?projectName=${encodeURIComponent(projectName)}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch architecture');
      }

      const data = await response.json();

      if (data.exists && data.architecture) {
        // Convert architecture data to ReactFlow nodes and edges
        const flowNodes = convertToFlowNodes(data.architecture);
        const flowEdges = convertToFlowEdges(data.architecture);

        setNodes(flowNodes);
        setEdges(flowEdges);
      } else {
        // Show default architecture if none exists yet
        setNodes(getDefaultNodes());
        setEdges(getDefaultEdges());
      }
    } catch (err) {
      console.error('Error fetching architecture:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');

      // Show default architecture on error
      setNodes(getDefaultNodes());
      setEdges(getDefaultEdges());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArchitecture();
  }, [projectName]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading architecture...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={fetchArchitecture}
          className="px-3 py-2 bg-white text-gray-700 rounded-lg shadow-md hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        className="bg-gray-50"
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

// Helper functions
function convertToFlowNodes(architecture: ArchitectureNode[]): Node[] {
  const nodesByType: Record<string, ArchitectureNode[]> = {
    page: [],
    component: [],
    api: [],
    util: [],
    database: [],
  };

  // Group by type
  architecture.forEach((node) => {
    nodesByType[node.type]?.push(node);
  });

  const flowNodes: Node[] = [];
  let yOffset = 0;

  // Create nodes for each type
  Object.entries(nodesByType).forEach(([type, nodes]) => {
    if (nodes.length === 0) return;

    nodes.forEach((node, index) => {
      flowNodes.push({
        id: node.id,
        type: 'default',
        position: { x: index * 250, y: yOffset },
        data: {
          label: (
            <div className="text-center">
              <div className="font-semibold">{node.label}</div>
              {node.description && (
                <div className="text-xs text-gray-500 mt-1">{node.description}</div>
              )}
            </div>
          ),
        },
        style: {
          background: getNodeColor(type),
          border: '2px solid #fff',
          borderRadius: '8px',
          padding: '10px',
          minWidth: '180px',
        },
      });
    });

    yOffset += 150;
  });

  return flowNodes;
}

function convertToFlowEdges(architecture: ArchitectureNode[]): Edge[] {
  const edges: Edge[] = [];

  architecture.forEach((node) => {
    node.dependencies?.forEach((depId) => {
      edges.push({
        id: `${node.id}-${depId}`,
        source: node.id,
        target: depId,
        animated: true,
      });
    });
  });

  return edges;
}

function getNodeColor(type: string): string {
  const colors: Record<string, string> = {
    page: '#dbeafe',
    component: '#dcfce7',
    api: '#fef3c7',
    util: '#e0e7ff',
    database: '#fce7f3',
  };
  return colors[type] || '#f3f4f6';
}

function getDefaultNodes(): Node[] {
  return [
    {
      id: '1',
      type: 'input',
      position: { x: 250, y: 0 },
      data: { label: 'Project Root' },
      style: { background: '#dbeafe', border: '2px solid #3b82f6' },
    },
    {
      id: '2',
      position: { x: 100, y: 100 },
      data: { label: 'Pages' },
      style: { background: '#dcfce7', border: '2px solid #22c55e' },
    },
    {
      id: '3',
      position: { x: 400, y: 100 },
      data: { label: 'Components' },
      style: { background: '#fef3c7', border: '2px solid #eab308' },
    },
    {
      id: '4',
      position: { x: 100, y: 200 },
      data: { label: 'API Routes' },
      style: { background: '#e0e7ff', border: '2px solid #6366f1' },
    },
    {
      id: '5',
      position: { x: 400, y: 200 },
      data: { label: 'Utils' },
      style: { background: '#fce7f3', border: '2px solid #ec4899' },
    },
  ];
}

function getDefaultEdges(): Edge[] {
  return [
    { id: 'e1-2', source: '1', target: '2', animated: true },
    { id: 'e1-3', source: '1', target: '3', animated: true },
    { id: 'e2-4', source: '2', target: '4', animated: true },
    { id: 'e3-5', source: '3', target: '5', animated: true },
  ];
}
