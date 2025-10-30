'use client';

import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { FlowData, FlowNode, FlowEdge } from '../../lib/flow';
import { MilestoneNode } from './nodes/MilestoneNode';
import { StepNode } from './nodes/StepNode';
import { MicrostepNode } from './nodes/MicrostepNode';

const nodeTypes: NodeTypes = {
  milestone: MilestoneNode,
  step: StepNode,
  microstep: MicrostepNode,
};

interface FlowGraphProps {
  data: FlowData;
  onNodeClick?: (node: FlowNode) => void;
  className?: string;
}

export function FlowGraph({ data, onNodeClick, className = '' }: FlowGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Convert FlowData to ReactFlow format
  useEffect(() => {
    const reactFlowNodes: Node[] = data.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position || { x: 0, y: 0 },
      data: {
        ...node,
        onClick: () => onNodeClick?.(node),
      },
      style: {
        border: node.drift_status === 'confirmed' ? '2px solid #ef4444' : 
               node.drift_status === 'suspected' ? '2px solid #f59e0b' : undefined,
      },
    }));

    const reactFlowEdges: Edge[] = data.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type === 'dependency' ? 'smoothstep' : 'default',
      style: {
        stroke: edge.type === 'dependency' ? '#6366f1' : '#64748b',
        strokeWidth: edge.type === 'dependency' ? 2 : 1,
        strokeDasharray: edge.type === 'dependency' ? '5,5' : undefined,
      },
      markerEnd: {
        type: 'arrowclosed',
        color: edge.type === 'dependency' ? '#6366f1' : '#64748b',
      },
    }));

    setNodes(reactFlowNodes);
    setEdges(reactFlowEdges);
  }, [data, onNodeClick, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className={`h-full w-full ${className}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            const status = node.data?.status;
            switch (status) {
              case 'done': return '#10b981';
              case 'doing': return '#f59e0b';
              default: return '#6b7280';
            }
          }}
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
}
