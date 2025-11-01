/**
 * Project Configuration Store
 *
 * Manages per-project configuration (Supabase, services, database schema)
 * Each project has isolated credentials separate from BuildRunner
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ProjectConfig,
  SupabaseConfig,
  DatabaseTable,
  ServiceCredentials,
  CreateSupabaseProjectRequest,
} from '../project-config/types';
import { SupabaseManagementAPI } from '../supabase/management-api';

// ============================================================================
// Types
// ============================================================================

interface ProjectConfigState {
  // Current project
  currentProject: ProjectConfig | null;

  // All projects
  projects: ProjectConfig[];

  // Setup wizard state
  isSettingUp: boolean;
  setupStep: number;
  setupError: string | null;

  // Actions
  createProject: (name: string, description?: string) => Promise<ProjectConfig>;
  createProjectWithSupabase: (request: CreateSupabaseProjectRequest, projectName: string) => Promise<ProjectConfig>;
  setCurrentProject: (projectId: string) => void;
  updateProjectConfig: (projectId: string, updates: Partial<ProjectConfig>) => void;
  addTable: (projectId: string, table: DatabaseTable) => void;
  updateTable: (projectId: string, tableName: string, updates: Partial<DatabaseTable>) => void;
  createTablesInSupabase: (projectId: string) => Promise<void>;
  addServiceCredential: (projectId: string, service: string, credential: any) => void;
  deleteProject: (projectId: string) => void;

  // Wizard actions
  startSetup: () => void;
  setSetupStep: (step: number) => void;
  setSetupError: (error: string | null) => void;
  completeSetup: () => void;
}

// ============================================================================
// Store
// ============================================================================

export const useProjectConfigStore = create<ProjectConfigState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentProject: null,
      projects: [],
      isSettingUp: false,
      setupStep: 1,
      setupError: null,

      // ========================================================================
      // Project Actions
      // ========================================================================

      /**
       * Create a new project (without backend)
       */
      createProject: async (name, description) => {
        const project: ProjectConfig = {
          id: `project-${Date.now()}`,
          name,
          description,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          backend: {
            type: 'none',
          },
          services: {},
          database: {
            tables: [],
            migrations: [],
          },
          envVars: {},
        };

        set((state) => ({
          projects: [...state.projects, project],
          currentProject: project,
        }));

        return project;
      },

      /**
       * Create a new project with Supabase backend
       */
      createProjectWithSupabase: async (request, projectName) => {
        console.log(`🚀 Creating project with Supabase: ${projectName}`);

        set({ isSettingUp: true, setupStep: 2, setupError: null });

        try {
          // Create Supabase project via API
          const response = await fetch('/api/supabase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'create_project',
              ...request,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create Supabase project');
          }

          const { config: supabaseConfig } = await response.json();

          // Create project config
          const project: ProjectConfig = {
            id: `project-${Date.now()}`,
            name: projectName,
            description: `Project powered by Supabase`,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            backend: {
              type: 'supabase',
              supabase: supabaseConfig,
            },
            services: {},
            database: {
              tables: [],
              migrations: [],
            },
            envVars: {
              NEXT_PUBLIC_SUPABASE_URL: supabaseConfig.url,
              NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseConfig.anonKey,
              SUPABASE_SERVICE_ROLE_KEY: supabaseConfig.serviceRoleKey,
            },
          };

          set((state) => ({
            projects: [...state.projects, project],
            currentProject: project,
            isSettingUp: false,
            setupStep: 3,
          }));

          console.log('✅ Project created successfully!');
          return project;
        } catch (error: any) {
          console.error('Project creation failed:', error);
          set({
            setupError: error.message,
            isSettingUp: false,
          });
          throw error;
        }
      },

      /**
       * Set the current active project
       */
      setCurrentProject: (projectId) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (project) {
          set({ currentProject: project });
        }
      },

      /**
       * Update project configuration
       */
      updateProjectConfig: (projectId, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, ...updates, updatedAt: new Date().toISOString() }
              : p
          ),
          currentProject:
            state.currentProject?.id === projectId
              ? { ...state.currentProject, ...updates, updatedAt: new Date().toISOString() }
              : state.currentProject,
        }));
      },

      /**
       * Add a table to the project's database schema
       */
      addTable: (projectId, table) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  database: {
                    ...p.database,
                    tables: [...p.database.tables, table],
                  },
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
          currentProject:
            state.currentProject?.id === projectId
              ? {
                  ...state.currentProject,
                  database: {
                    ...state.currentProject.database,
                    tables: [...state.currentProject.database.tables, table],
                  },
                  updatedAt: new Date().toISOString(),
                }
              : state.currentProject,
        }));
      },

      /**
       * Update a table in the project's database schema
       */
      updateTable: (projectId, tableName, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  database: {
                    ...p.database,
                    tables: p.database.tables.map((t) =>
                      t.name === tableName ? { ...t, ...updates } : t
                    ),
                  },
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
          currentProject:
            state.currentProject?.id === projectId
              ? {
                  ...state.currentProject,
                  database: {
                    ...state.currentProject.database,
                    tables: state.currentProject.database.tables.map((t) =>
                      t.name === tableName ? { ...t, ...updates } : t
                    ),
                  },
                  updatedAt: new Date().toISOString(),
                }
              : state.currentProject,
        }));
      },

      /**
       * Create all pending tables in Supabase
       */
      createTablesInSupabase: async (projectId) => {
        const project = get().projects.find((p) => p.id === projectId);

        if (!project || project.backend.type !== 'supabase') {
          throw new Error('Project does not have Supabase backend');
        }

        const supabaseConfig = project.backend.supabase!;
        const pendingTables = project.database.tables.filter(
          (t) => t.status === 'pending'
        );

        console.log(`📝 Creating ${pendingTables.length} tables in Supabase...`);

        for (const table of pendingTables) {
          // Update status to creating
          get().updateTable(projectId, table.name, { status: 'creating' });

          try {
            // Create table via API
            const response = await fetch('/api/supabase', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'create_table',
                projectRef: supabaseConfig.projectRef,
                table,
              }),
            });

            const result = await response.json();

            if (result.success) {
              // Update status to created
              get().updateTable(projectId, table.name, { status: 'created' });
              console.log(`✅ Created table: ${table.name}`);
            } else {
              // Update status to error
              get().updateTable(projectId, table.name, {
                status: 'error',
                error: result.error,
              });
              console.error(`❌ Failed to create table ${table.name}:`, result.error);
            }
          } catch (error: any) {
            // Update status to error
            get().updateTable(projectId, table.name, {
              status: 'error',
              error: error.message,
            });
            console.error(`❌ Failed to create table ${table.name}:`, error);
          }

          // Wait a bit between tables
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        console.log('✅ Table creation complete');
      },

      /**
       * Add service credentials
       */
      addServiceCredential: (projectId, service, credential) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  services: {
                    ...p.services,
                    [service]: credential,
                  },
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
          currentProject:
            state.currentProject?.id === projectId
              ? {
                  ...state.currentProject,
                  services: {
                    ...state.currentProject.services,
                    [service]: credential,
                  },
                  updatedAt: new Date().toISOString(),
                }
              : state.currentProject,
        }));
      },

      /**
       * Delete a project
       */
      deleteProject: (projectId) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== projectId),
          currentProject:
            state.currentProject?.id === projectId ? null : state.currentProject,
        }));
      },

      // ========================================================================
      // Wizard Actions
      // ========================================================================

      startSetup: () => {
        set({ isSettingUp: true, setupStep: 1, setupError: null });
      },

      setSetupStep: (step) => {
        set({ setupStep: step });
      },

      setSetupError: (error) => {
        set({ setupError: error });
      },

      completeSetup: () => {
        set({ isSettingUp: false, setupStep: 1, setupError: null });
      },
    }),
    {
      name: 'project-config-storage',
      version: 1,
    }
  )
);
