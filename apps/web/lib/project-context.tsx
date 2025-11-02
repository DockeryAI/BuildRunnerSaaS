/**
 * Tab-Safe Project Context Provider
 * Replaces lib/project.tsx with multi-tab support
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getProjectIdFromContext,
  setProjectContext,
  getOtherTabsWithProject,
  cleanupProjectData,
  enableCrossTabSync,
  closeCrossTabSync,
  promptForTabSync,
  loadProjectDataFromIndexedDB,
  saveProjectDataToIndexedDB,
  migrateProjectToIndexedDB,
  getTabId,
} from './multi-tab-manager';

export interface Technology {
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'infrastructure' | 'service';
  reasoning: string;
  difficulty: 'easy' | 'medium' | 'advanced';
  setupRequired: boolean;
  status?: 'already_setup' | 'standard_tool' | 'likely_installed' | 'needs_account';
}

export interface Microstep {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  dependencies: string[];
  status: 'pending' | 'in_progress' | 'completed';
}

export interface Step {
  id: string;
  title: string;
  description: string;
  estimatedDays: number;
  microsteps: Microstep[];
  dependencies: string[];
  status: 'pending' | 'in_progress' | 'completed';
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  estimatedWeeks: number;
  steps: Step[];
  dependencies: string[];
  status: 'pending' | 'in_progress' | 'completed';
}

export interface Architecture {
  recommendedStack: string;
  technologies: Technology[];
}

export interface ProjectPlan {
  architecture?: Architecture;
  milestones: Milestone[];
  totalEstimatedWeeks: number;
  generatedAt: string;
}

export interface BuildMetadata {
  buildId: string;
  timestamp: string;
  componentCount: number;
  fileCount: number;
  status: 'completed' | 'failed' | 'partial';
  buildDirectory: string;
  duration?: number;
}

export interface Project {
  id: string;
  name: string;
  ref?: string;
  url?: string;
  status: 'active' | 'inactive' | 'completed' | 'archived';
  created_at: string;
  updated_at?: string;
  plan?: ProjectPlan;
  builds?: BuildMetadata[];
  currentPhase?: 'prd' | 'plan' | 'build' | 'complete';
  lastBuildId?: string;
  phaseProgress?: {
    prd: boolean;
    plan: boolean;
    build: boolean;
  };
}

interface TabSafeProjectContextType {
  currentProject: Project | null;
  projects: Project[];
  setCurrentProject: (project: Project) => void;
  loading: boolean;
  loadPlan: () => Promise<void>;
  savePlan: (plan: ProjectPlan) => Promise<void>;
  tabId: string;
  otherTabs: any[];
  syncFromOtherTab: () => Promise<void>;
}

const TabSafeProjectContext = createContext<TabSafeProjectContextType | undefined>(undefined);

export function TabSafeProjectProvider({ children }: { children: React.ReactNode }) {
  const [currentProject, setCurrentProjectState] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [otherTabs, setOtherTabs] = useState<any[]>([]);
  const tabIdRef = React.useRef(getTabId());

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Set up cross-tab communication
  useEffect(() => {
    if (!currentProject) return;

    const channel = enableCrossTabSync(currentProject.id, (data) => {
      console.log('Received from other tab:', data);

      // Handle different message types
      if (data.type === 'project_updated') {
        // Optionally reload project data
        loadProjectById(currentProject.id);
      }
    });

    return () => {
      closeCrossTabSync();
    };
  }, [currentProject?.id]);

  // Check for other tabs periodically
  useEffect(() => {
    if (!currentProject) return;

    const checkOtherTabs = () => {
      const others = getOtherTabsWithProject(currentProject.id);
      setOtherTabs(others);
    };

    checkOtherTabs();
    const interval = setInterval(checkOtherTabs, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [currentProject?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentProject) {
        cleanupProjectData(currentProject.id);
      }
    };
  }, [currentProject?.id]);

  const loadProjects = async () => {
    try {
      // Load from localStorage (eventually migrate to Supabase)
      const savedProjects = localStorage.getItem('buildrunner_projects');
      const projectsList: Project[] = savedProjects ? JSON.parse(savedProjects) : [];
      setProjects(projectsList);

      // Check URL for project ID
      const projectIdFromUrl = getProjectIdFromContext();

      if (projectIdFromUrl) {
        const project = projectsList.find(p => p.id === projectIdFromUrl);
        if (project) {
          setCurrentProjectState(project);

          // Check if project is open in other tabs
          const others = getOtherTabsWithProject(projectIdFromUrl);
          if (others.length > 0) {
            const shouldSync = await promptForTabSync(others);
            if (shouldSync) {
              await syncFromOtherTabData(projectIdFromUrl);
            }
          }

          // Migrate to IndexedDB if not already done
          await migrateProjectToIndexedDB(projectIdFromUrl);
        }
      } else if (projectsList.length > 0) {
        // Default to first project
        setCurrentProjectState(projectsList[0]);
        setProjectContext(projectsList[0].id);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectById = async (projectId: string) => {
    try {
      const savedProjects = localStorage.getItem('buildrunner_projects');
      const projectsList: Project[] = savedProjects ? JSON.parse(savedProjects) : [];
      const project = projectsList.find(p => p.id === projectId);

      if (project) {
        // Try to load from IndexedDB first
        const indexedDBData = await loadProjectDataFromIndexedDB(projectId, `project_${projectId}`);
        if (indexedDBData) {
          setCurrentProjectState({ ...project, ...indexedDBData });
        } else {
          setCurrentProjectState(project);
        }
      }
    } catch (error) {
      console.error('Failed to load project:', error);
    }
  };

  const handleSetCurrentProject = useCallback((project: Project) => {
    setCurrentProjectState(project);
    setProjectContext(project.id);
  }, []);

  const loadPlan = async () => {
    if (!currentProject) return;

    try {
      // Try IndexedDB first
      const planKey = `buildrunner_plan_${currentProject.id}`;
      const planData = await loadProjectDataFromIndexedDB(currentProject.id, planKey);

      if (planData) {
        setCurrentProjectState({
          ...currentProject,
          plan: planData,
        });
      } else {
        // Fallback to localStorage
        const savedPlan = localStorage.getItem(planKey);
        if (savedPlan) {
          const plan: ProjectPlan = JSON.parse(savedPlan);
          setCurrentProjectState({
            ...currentProject,
            plan,
          });
          // Save to IndexedDB for next time
          await saveProjectDataToIndexedDB(currentProject.id, planKey, plan);
        }
      }
    } catch (error) {
      console.error('Failed to load plan:', error);
    }
  };

  const savePlan = async (plan: ProjectPlan) => {
    if (!currentProject) return;

    try {
      const planKey = `buildrunner_plan_${currentProject.id}`;

      // Save to IndexedDB
      await saveProjectDataToIndexedDB(currentProject.id, planKey, plan);

      // Also save to localStorage for backwards compatibility
      localStorage.setItem(planKey, JSON.stringify(plan));

      // Update state
      setCurrentProjectState({
        ...currentProject,
        plan,
      });
    } catch (error) {
      console.error('Failed to save plan:', error);
    }
  };

  const syncFromOtherTabData = async (projectId: string) => {
    try {
      // Load latest data from IndexedDB
      const planKey = `buildrunner_plan_${projectId}`;
      const planData = await loadProjectDataFromIndexedDB(projectId, planKey);

      if (planData && currentProject) {
        setCurrentProjectState({
          ...currentProject,
          plan: planData,
        });
      }
    } catch (error) {
      console.error('Failed to sync from other tab:', error);
    }
  };

  return (
    <TabSafeProjectContext.Provider
      value={{
        currentProject,
        projects,
        setCurrentProject: handleSetCurrentProject,
        loading,
        loadPlan,
        savePlan,
        tabId: tabIdRef.current,
        otherTabs,
        syncFromOtherTab: () => syncFromOtherTabData(currentProject?.id || ''),
      }}
    >
      {children}
    </TabSafeProjectContext.Provider>
  );
}

export function useTabSafeProject() {
  const context = useContext(TabSafeProjectContext);
  if (context === undefined) {
    throw new Error('useTabSafeProject must be used within a TabSafeProjectProvider');
  }
  return context;
}
