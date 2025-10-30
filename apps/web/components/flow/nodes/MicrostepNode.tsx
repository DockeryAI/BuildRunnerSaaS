'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FlowNode } from '../../../lib/flow';
import { Badge } from '../../ui/badge';
import { cn } from '../../../lib/utils';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';

export function MicrostepNode({ data }: NodeProps<FlowNode>) {
  const statusColors = {
    todo: 'bg-white border-gray-200 text-gray-700',
    doing: 'bg-amber-25 border-amber-200 text-amber-700',
    done: 'bg-green-25 border-green-200 text-green-700',
  };

  const statusIcons = {
    todo: Clock,
    doing: Clock,
    done: CheckCircle,
  };

  const StatusIcon = statusIcons[data.status];

  const priorityColors = {
    P1: 'bg-red-100 text-red-700 border-red-200',
    P2: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    P3: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  const riskColors = {
    high: 'text-red-600',
    medium: 'text-yellow-600',
    low: 'text-green-600',
  };

  return (
    <div 
      className={cn(
        'px-3 py-2 rounded border min-w-[140px] max-w-[180px] cursor-pointer transition-all hover:shadow-sm',
        statusColors[data.status]
      )}
      onClick={data.onClick}
    >
      <Handle type="target" position={Position.Top} className="w-1.5 h-1.5" />
      
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <StatusIcon className="w-3 h-3" />
            <span className="text-xs font-medium">MS</span>
          </div>
          
          <div className="flex items-center gap-1">
            {data.priority && (
              <Badge 
                variant="outline" 
                className={cn("text-xs px-1 py-0", priorityColors[data.priority])}
              >
                {data.priority}
              </Badge>
            )}
            {data.risk_level && data.risk_level !== 'low' && (
              <AlertTriangle 
                className={cn("w-3 h-3", riskColors[data.risk_level])} 
              />
            )}
          </div>
        </div>
        
        <h5 className="font-medium text-xs leading-tight line-clamp-2">
          {data.title}
        </h5>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          {data.criteria && (
            <span>{data.criteria.length} AC</span>
          )}
          {data.effort_points && (
            <span>{data.effort_points}pt</span>
          )}
        </div>
        
        {data.owner && (
          <div className="text-xs text-gray-500 truncate">
            @{data.owner}
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-1.5 h-1.5" />
    </div>
  );
}
