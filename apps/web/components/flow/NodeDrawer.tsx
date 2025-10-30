'use client';

import React from 'react';
import { X, ExternalLink, User, Clock, Target, AlertTriangle } from 'lucide-react';
import { FlowNode } from '../../lib/flow';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface NodeDrawerProps {
  node: FlowNode | null;
  isOpen: boolean;
  onClose: () => void;
}

export function NodeDrawer({ node, isOpen, onClose }: NodeDrawerProps) {
  if (!node) return null;

  const statusColors = {
    todo: 'bg-gray-100 text-gray-700',
    doing: 'bg-amber-100 text-amber-700',
    done: 'bg-green-100 text-green-700',
  };

  const priorityColors = {
    P1: 'bg-red-100 text-red-700',
    P2: 'bg-yellow-100 text-yellow-700',
    P3: 'bg-blue-100 text-blue-700',
  };

  const riskColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700',
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {node.type}
              </Badge>
              <Badge className={cn("capitalize", statusColors[node.status])}>
                {node.status}
              </Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Title */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {node.title}
              </h2>
              <p className="text-sm text-gray-600">
                ID: {node.id}
              </p>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4">
              {node.priority && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Priority
                  </label>
                  <Badge className={cn("w-fit", priorityColors[node.priority])}>
                    {node.priority}
                  </Badge>
                </div>
              )}

              {node.risk_level && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Risk Level
                  </label>
                  <Badge className={cn("w-fit", riskColors[node.risk_level])}>
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {node.risk_level}
                  </Badge>
                </div>
              )}

              {node.effort_points && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Effort Points
                  </label>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-sm font-medium">{node.effort_points}</span>
                  </div>
                </div>
              )}

              {node.impact_score && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Impact Score
                  </label>
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3 text-gray-400" />
                    <span className="text-sm font-medium">{node.impact_score}/10</span>
                  </div>
                </div>
              )}
            </div>

            {/* Owner */}
            {node.owner && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Owner
                </label>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{node.owner}</span>
                </div>
              </div>
            )}

            {/* Acceptance Criteria */}
            {node.criteria && node.criteria.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Acceptance Criteria ({node.criteria.length})
                </label>
                <ul className="space-y-1">
                  {node.criteria.map((criterion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>{criterion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Dependencies */}
            {node.depends_on && node.depends_on.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Dependencies ({node.depends_on.length})
                </label>
                <div className="space-y-1">
                  {node.depends_on.map((depId) => (
                    <Badge key={depId} variant="outline" className="text-xs">
                      {depId}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            {node.links && Object.keys(node.links).length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Links
                </label>
                <div className="space-y-2">
                  {Object.entries(node.links).map(([label, url]) => (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Children */}
            {node.children && node.children.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Contains ({node.children.length})
                </label>
                <div className="space-y-1">
                  {node.children.map((childId) => (
                    <Badge key={childId} variant="outline" className="text-xs">
                      {childId}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Drift Status */}
            {node.drift_status !== 'none' && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Drift Status
                </label>
                <Badge 
                  className={cn(
                    "w-fit",
                    node.drift_status === 'confirmed' ? 'bg-red-100 text-red-700' :
                    node.drift_status === 'suspected' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  )}
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {node.drift_status}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
