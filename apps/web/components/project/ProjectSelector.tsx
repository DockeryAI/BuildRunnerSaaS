'use client';

import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useProject } from '../../lib/project';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export function ProjectSelector() {
  const { currentProject, projects, setCurrentProject } = useProject();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentProject) {
    return (
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="text-sm text-gray-500">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 border-b border-gray-200 relative">
      <div className="text-sm text-gray-500 mb-1">Current Project</div>
      
      <Button
        variant="ghost"
        className="w-full justify-between p-0 h-auto font-medium text-gray-900 hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <div className="truncate">{currentProject.name}</div>
          {currentProject.status === 'active' && (
            <div className="ml-2 h-2 w-2 bg-green-500 rounded-full"></div>
          )}
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform",
          isOpen && "transform rotate-180"
        )} />
      </Button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute left-4 right-4 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20">
            <div className="py-1">
              {projects.map((project) => (
                <button
                  key={project.id}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                  onClick={() => {
                    setCurrentProject(project);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">
                      {project.name}
                    </div>
                    {project.status === 'active' && (
                      <div className="ml-2 h-2 w-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                  {currentProject.id === project.id && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="border-t border-gray-200 px-4 py-2">
              <button className="text-sm text-blue-600 hover:text-blue-700">
                + Create New Project
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
