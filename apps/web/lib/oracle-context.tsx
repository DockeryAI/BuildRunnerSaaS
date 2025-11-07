'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

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

  // Auto-detect project context from URL
  useEffect(() => {
    // Extract project info from pathname
    // /create?projectId=123 -> projectId: 123
    // /project/MyProject -> projectName: MyProject

    const projectIdFromParams = searchParams?.get('projectId');
    const projectNameFromPath = pathname?.match(/\/project\/([^/]+)/)?.[1];

    setProjectContext((prev) => ({
      ...prev,
      currentPage: pathname,
      ...(projectIdFromParams && { projectId: projectIdFromParams }),
      ...(projectNameFromPath && { projectName: projectNameFromPath }),
    }));
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
