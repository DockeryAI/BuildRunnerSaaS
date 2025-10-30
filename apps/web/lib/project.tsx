'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Project {
  id: string;
  name: string;
  ref?: string;
  url?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

interface ProjectContextType {
  currentProject: Project | null;
  projects: Project[];
  setCurrentProject: (project: Project) => void;
  loading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load projects from localStorage or API
    const loadProjects = async () => {
      try {
        // For demo, use mock data
        const mockProjects: Project[] = [
          {
            id: '1',
            name: 'BuildRunner SaaS',
            ref: 'buildrunner-main',
            url: 'https://buildrunner-main.supabase.co',
            status: 'active',
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Demo Project',
            status: 'inactive',
            created_at: new Date().toISOString(),
          },
        ];

        setProjects(mockProjects);
        
        // Set current project from localStorage or default to first
        const savedProjectId = localStorage.getItem('currentProjectId');
        const savedProject = mockProjects.find(p => p.id === savedProjectId);
        setCurrentProject(savedProject || mockProjects[0]);
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const handleSetCurrentProject = (project: Project) => {
    setCurrentProject(project);
    localStorage.setItem('currentProjectId', project.id);
  };

  return (
    <ProjectContext.Provider value={{
      currentProject,
      projects,
      setCurrentProject: handleSetCurrentProject,
      loading,
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
