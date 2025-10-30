'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FlowNode } from '../../../lib/flow';
import { Badge } from '../../ui/badge';
import { cn } from '../../../lib/utils';

export function StepNode({ data }: NodeProps<FlowNode>) {
  const statusColors = {
    todo: 'bg-gray-50 border-gray-200 text-gray-600',
    doing: 'bg-amber-50 border-amber-200 text-amber-600',
    done: 'bg-green-50 border-green-200 text-green-600',
  };

  return (
    <div 
      className={cn(
        'px-3 py-2 rounded-md border min-w-[160px] cursor-pointer transition-all hover:shadow-md',
        statusColors[data.status]
      )}
      onClick={data.onClick}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            Step
          </Badge>
          <Badge 
            variant={data.status === 'done' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {data.status.toUpperCase()}
          </Badge>
        </div>
        
        <h4 className="font-medium text-xs leading-tight">
          {data.title}
        </h4>
        
        {data.children && (
          <div className="text-xs text-gray-500">
            {data.children.length} microsteps
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
}
