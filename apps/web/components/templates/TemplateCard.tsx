'use client';

import React from 'react';
import {
  Package,
  Download,
  Star,
  Calendar,
  User,
  Tag,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { type TemplateDef, type TemplatePack } from '../../lib/templates/schemas';

interface TemplateCardProps {
  template?: TemplateDef;
  pack?: TemplatePack;
  onInstall: (id: string, type: 'template' | 'pack') => void;
  onViewDetails: (id: string, type: 'template' | 'pack') => void;
}

export function TemplateCard({ template, pack, onInstall, onViewDetails }: TemplateCardProps) {
  const item = template || pack;
  const type = template ? 'template' : 'pack';
  
  if (!item) return null;

  const handleInstall = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInstall(item.id, type);
  };

  const handleViewDetails = () => {
    onViewDetails(item.id, type);
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleViewDetails}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${type === 'template' ? 'bg-blue-100' : 'bg-purple-100'}`}>
            <Package className={`h-6 w-6 ${type === 'template' ? 'text-blue-600' : 'text-purple-600'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{item.title}</h3>
            <p className="text-sm text-gray-600">@{item.author_id || 'system'}</p>
          </div>
        </div>
        
        {item.is_featured && (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Star className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-700 mb-4 line-clamp-2">
        {item.description || 'No description available'}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {item.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">
            <Tag className="h-3 w-3 mr-1" />
            {tag}
          </Badge>
        ))}
        {item.tags.length > 3 && (
          <Badge variant="outline" className="text-xs text-gray-500">
            +{item.tags.length - 3} more
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>{item.installs_count.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(item.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        
        {type === 'template' && (
          <div className="text-xs text-gray-500">
            Template
          </div>
        )}
        
        {type === 'pack' && pack && (
          <div className="text-xs text-gray-500">
            Pack • {pack.json_patch.length} operations
          </div>
        )}
      </div>

      {/* Dependencies & Conflicts (for packs) */}
      {type === 'pack' && pack && (pack.dependencies.length > 0 || pack.conflicts.length > 0) && (
        <div className="mb-4 space-y-2">
          {pack.dependencies.length > 0 && (
            <div className="text-xs">
              <span className="text-gray-600">Requires:</span>
              <span className="ml-1 text-blue-600">{pack.dependencies.join(', ')}</span>
            </div>
          )}
          {pack.conflicts.length > 0 && (
            <div className="text-xs">
              <span className="text-gray-600">Conflicts with:</span>
              <span className="ml-1 text-red-600">{pack.conflicts.join(', ')}</span>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button 
          onClick={handleInstall}
          className="flex-1"
          size="sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Install
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleViewDetails}
          size="sm"
        >
          <Eye className="h-4 w-4 mr-2" />
          Details
        </Button>
      </div>
    </div>
  );
}
