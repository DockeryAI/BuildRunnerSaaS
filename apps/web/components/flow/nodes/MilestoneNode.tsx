'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FlowNode } from '../../../lib/flow';
import { Badge } from '../../ui/badge';
import { cn } from '../../../lib/utils';

export function MilestoneNode({ data }: NodeProps<FlowNode>) {
  const statusColors = {
    todo: 'bg-gray-100 border-gray-300 text-gray-700',
    doing: 'bg-amber-100 border-amber-300 text-amber-700',
    done: 'bg-green-100 border-green-300 text-green-700',
  };

  return (
    <div 
      className={cn(
        'px-4 py-3 rounded-lg border-2 min-w-[200px] cursor-pointer transition-all hover:shadow-lg',
        statusColors[data.status]
      )}
      onClick={data.onClick}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            Milestone
          </Badge>
          <Badge 
            variant={data.status === 'done' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {data.status.toUpperCase()}
          </Badge>
        </div>
        
        <h3 className="font-semibold text-sm leading-tight">
          {data.title}
        </h3>
        
        {data.children && (
          <div className="text-xs text-gray-600">
            {data.children.length} steps
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}
