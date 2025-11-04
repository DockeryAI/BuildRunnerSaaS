'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlusCircleIcon,
  FolderIcon,
  ClockIcon,
  TrashIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import RecentBuilds from '@/components/RecentBuilds';
import { setProjectContext } from '@/lib/multi-tab-manager';

interface BuildMetadata {
  buildId: string;
  timestamp: string;
  componentCount: number;
  fileCount: number;
  status: 'completed' | 'failed' | 'partial';
  buildDirectory: string;
  duration?: number;
}

interface SavedProject {
  id: string;
  name: string;
  productIdea: string;
  currentPhase: number;
  createdAt: string;
  updatedAt: string;
  prdSections?: any;
  allSuggestions?: any;
  builds?: BuildMetadata[];
}

export default function ProjectsLibraryPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  function loadProjects() {
    const savedProjects = JSON.parse(localStorage.getItem('buildrunner_projects') || '[]');
    // Sort by most recently updated
    savedProjects.sort((a: SavedProject, b: SavedProject) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    setProjects(savedProjects);
  }

  function handleNewProject() {
    router.push('/create');
  }

  function handleResumeProject(project: SavedProject) {
    // Auto-redirect based on project phase and status
    const currentPhase = (project as any).currentPhase;
    const lastBuildId = (project as any).lastBuildId;

    // If project is complete and has a last build, open that build
    if (currentPhase === 'complete' && lastBuildId) {
      setProjectContext(project.id, 'build');
      router.push(`/workbench?projectId=${project.id}&buildId=${lastBuildId}&restore=true`);
      return;
    }

    // If in build phase, check for in-progress build
    if (currentPhase === 'build') {
      // Check for in-progress build autosave
      const buildProgressKeys = Object.keys(localStorage).filter(key =>
        key.startsWith('build_progress_') && key.includes(project.id)
      );

      if (buildProgressKeys.length > 0) {
        // Ask user if they want to resume
        const resumeBuild = confirm('You have an in-progress build. Do you want to resume it?');
        if (resumeBuild) {
          const buildId = buildProgressKeys[0].replace('build_progress_', '');
          setProjectContext(project.id, 'build');
          router.push(`/workbench?projectId=${project.id}&buildId=${buildId}&resume=true`);
          return;
        }
      }

      // Otherwise, go to workbench for new build
      setProjectContext(project.id, 'build');
      router.push(`/workbench?projectId=${project.id}`);
      return;
    }

    // If in plan phase, go to plan page
    if (currentPhase === 'plan') {
      setProjectContext(project.id, 'plan');
      router.push(`/plan?projectId=${project.id}`);
      return;
    }

    // Default: go to PRD builder (handles 'prd' phase and no phase set)
    // Store project data in a temporary location for the create page to load
    sessionStorage.setItem('resuming_project', JSON.stringify(project));
    setProjectContext(project.id, 'prd');
    router.push(`/create?projectId=${project.id}`);
  }

  async function handleDeleteProject(projectId: string) {
    // Call cleanup API to delete build files
    try {
      const response = await fetch('/api/build/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Build cleanup successful:', data);

        // Clean up localStorage keys
        localStorage.removeItem(`last_build_${projectId}`);
        localStorage.removeItem(`buildrunner_plan_${projectId}`);
        localStorage.removeItem(`buildrunner_prd_${projectId}`);
        localStorage.removeItem(`planGenerationProgress_${projectId}`); // FIX: Clean up interrupted plan generation state

        // Remove all build progress keys for this project
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(`build_progress_`) ||
              key.startsWith(`showPreviewButton_${projectId}`) ||
              key.startsWith(`appType_${projectId}`)) {
            localStorage.removeItem(key);
          }
        });
      } else {
        console.error('Failed to cleanup builds:', await response.text());
      }
    } catch (error) {
      console.error('Error calling cleanup API:', error);
    }

    // Remove project from localStorage
    const updatedProjects = projects.filter(p => p.id !== projectId);
    localStorage.setItem('buildrunner_projects', JSON.stringify(updatedProjects));
    setProjects(updatedProjects);
    setShowDeleteConfirm(null);
  }

  function handleRestoreBuild(projectId: string, buildId: string) {
    setProjectContext(projectId, 'build');
    router.push(`/workbench?projectId=${projectId}&buildId=${buildId}&restore=true`);
  }

  async function handleDeleteBuild(projectId: string, buildId: string) {
    // Clean up localStorage for this specific build
    localStorage.removeItem(`build_progress_${buildId}`);
    localStorage.removeItem(`showPreviewButton_${projectId}_${buildId}`);
    localStorage.removeItem(`appType_${projectId}_${buildId}`);

    // If this was the last build, also remove the last_build key
    const lastBuildKey = `last_build_${projectId}`;
    if (localStorage.getItem(lastBuildKey) === buildId) {
      localStorage.removeItem(lastBuildKey);
    }

    // Update projects list
    const updatedProjects = projects.map(p => {
      if (p.id === projectId && p.builds) {
        return {
          ...p,
          builds: p.builds.filter(b => b.buildId !== buildId),
        };
      }
      return p;
    });
    localStorage.setItem('buildrunner_projects', JSON.stringify(updatedProjects));
    setProjects(updatedProjects);
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
  }

  const phaseNames = ['', 'Context', 'Shape', 'Evidence', 'Launch'];
  const phaseLabels: Record<string, string> = {
    'prd': 'PRD Phase',
    'plan': 'Planning',
    'build': 'Building',
    'complete': 'Complete',
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-1">Your PRD projects library</p>
          </div>
          <button
            onClick={handleNewProject}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <FolderIcon className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No projects yet</h2>
          <p className="text-gray-600 mb-8">Get started by creating your first PRD project</p>
          <button
            onClick={handleNewProject}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span>Create Your First Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="p-6">
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {project.productIdea}
                    </p>
                  </div>
                </div>

                {/* Project Meta */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    <span>Updated {formatDate(project.updatedAt)}</span>
                  </div>
                  <div className="flex items-center">
                    {(project as any).currentPhase ? (
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        (project as any).currentPhase === 'complete'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {phaseLabels[(project as any).currentPhase] || phaseLabels['prd']}
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                        Phase {project.currentPhase}: {phaseNames[project.currentPhase] || 'Unknown'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleResumeProject(project)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-1"
                  >
                    <span>Resume</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </button>
                  {project.builds && project.builds.length > 0 && (
                    <button
                      onClick={() => setSelectedProjectId(selectedProjectId === project.id ? null : project.id)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      {project.builds.length} Builds
                    </button>
                  )}
                  <button
                    onClick={() => setShowDeleteConfirm(project.id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Recent Builds (expanded) */}
              {selectedProjectId === project.id && project.builds && project.builds.length > 0 && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <RecentBuilds
                    projectId={project.id}
                    builds={project.builds}
                    onRestore={(buildId) => handleRestoreBuild(project.id, buildId)}
                    onDelete={(buildId) => handleDeleteBuild(project.id, buildId)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Project?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleDeleteProject(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
