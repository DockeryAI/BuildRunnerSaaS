'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { exportToMarkdown } from './prd-export';

interface ProjectContext {
  projectName?: string;
  projectId?: string;
  currentPage?: string;
  prdContent?: string;
  buildStatus?: string;
}

interface OracleContextType {
  projectContext: ProjectContext;
  updateProjectContext: (updates: Partial<ProjectContext>) => void;
  setPRDContent: (content: string) => void;
  setBuildStatus: (status: string) => void;
}

const OracleContext = createContext<OracleContextType | undefined>(undefined);

export function OracleProvider({ children }: { children: React.ReactNode }) {
  const [projectContext, setProjectContext] = useState<ProjectContext>({});
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Auto-detect project context from URL and load PRD + build status
  useEffect(() => {
    // Extract project info from pathname
    // /create?projectId=123 -> projectId: 123
    // /project/MyProject -> projectName: MyProject

    const projectIdFromParams = searchParams?.get('projectId');
    const projectNameFromPath = pathname?.match(/\/project\/([^/]+)/)?.[1];

    // Get current project ID (prefer URL param, fallback to localStorage)
    const currentProjectId = projectIdFromParams || localStorage.getItem('currentProjectId');

    // Load project data
    let projectName = projectNameFromPath;
    let prdContent = '';
    let buildStatus = '';

    if (currentProjectId) {
      // Load project info
      const savedProjects = JSON.parse(localStorage.getItem('buildrunner_projects') || '[]');
      const project = savedProjects.find((p: any) => p.id === currentProjectId);

      if (project) {
        projectName = project.productName || project.name || projectName;

        // Load PRD content from cache
        const prdCacheKey = `prd_cache_${currentProjectId}`;
        const cachedPRDData = localStorage.getItem(prdCacheKey);

        if (cachedPRDData) {
          try {
            const fullPRD = JSON.parse(cachedPRDData);
            // Convert PRD to markdown for context
            prdContent = exportToMarkdown({
              productName: fullPRD.productName || project.productName || project.name || 'Product',
              productIdea: fullPRD.productIdea || project.productIdea || '',
              prdSections: fullPRD.prdSections || {},
            });
          } catch (e) {
            console.warn('Failed to parse PRD cache:', e);
          }
        } else if (project.productIdea) {
          // Fallback to basic product idea
          prdContent = `# ${projectName}\n\n## Product Idea\n${project.productIdea}`;
        }

        // Load build status from project
        const statusKey = project.status || 'idle';
        const phaseKey = project.currentPhase || 'prd';
        buildStatus = `Status: ${statusKey}, Phase: ${phaseKey}`;

        // Check for plan
        const savedPlan = localStorage.getItem(`buildrunner_plan_${currentProjectId}`);
        if (savedPlan) {
          try {
            const plan = JSON.parse(savedPlan);
            const componentCount = plan.components?.length || 0;
            buildStatus += `\n${componentCount} components planned`;
          } catch (e) {
            console.warn('Failed to parse plan:', e);
          }
        }

        // Check for builds
        if (project.builds && project.builds.length > 0) {
          const latestBuild = project.builds[0];
          buildStatus += `\nLast build: ${new Date(latestBuild.timestamp).toLocaleString()}`;
          buildStatus += `\n${latestBuild.componentCount || 0} components built`;
        }
      }
    }

    setProjectContext({
      currentPage: pathname,
      projectId: currentProjectId || undefined,
      projectName,
      prdContent,
      buildStatus,
    });
  }, [pathname, searchParams]);

  const updateProjectContext = (updates: Partial<ProjectContext>) => {
    setProjectContext((prev) => ({ ...prev, ...updates }));
  };

  const setPRDContent = (content: string) => {
    setProjectContext((prev) => ({ ...prev, prdContent: content }));
  };

  const setBuildStatus = (status: string) => {
    setProjectContext((prev) => ({ ...prev, buildStatus: status }));
  };

  return (
    <OracleContext.Provider
      value={{
        projectContext,
        updateProjectContext,
        setPRDContent,
        setBuildStatus,
      }}
    >
      {children}
    </OracleContext.Provider>
  );
}

export function useOracle() {
  const context = useContext(OracleContext);
  if (context === undefined) {
    throw new Error('useOracle must be used within an OracleProvider');
  }
  return context;
}
