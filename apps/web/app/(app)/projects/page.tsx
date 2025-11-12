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

interface ArchivedProject {
  projectId: string;
  projectName: string;
  archivedAt: string;
  size: number;
  archivePath: string;
}

export default function ProjectsLibraryPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [archives, setArchives] = useState<ArchivedProject[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'projects' | 'archives'>('projects');
  const [isLoadingArchives, setIsLoadingArchives] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
    if (activeTab === 'archives') {
      loadArchives();
    }
  }, [activeTab]);

  function loadProjects() {
    const savedProjects = JSON.parse(localStorage.getItem('buildrunner_projects') || '[]');
    // Sort by most recently updated
    savedProjects.sort((a: SavedProject, b: SavedProject) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    setProjects(savedProjects);
  }

  async function loadArchives() {
    setIsLoadingArchives(true);
    try {
      const response = await fetch('/api/build/archives');
      if (response.ok) {
        const data = await response.json();
        setArchives(data.archives || []);
      } else {
        console.error('Failed to load archives');
      }
    } catch (error) {
      console.error('Error loading archives:', error);
    } finally {
      setIsLoadingArchives(false);
    }
  }

  async function handleRestoreArchive(archiveId: string) {
    if (!confirm('Restore this archived project? It will be added back to your projects list.')) {
      return;
    }

    try {
      const response = await fetch('/api/build/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ archiveId }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Project restored successfully!\n\nProject ID: ${data.projectId}\n\nNote: You may need to refresh localStorage data.`);
        loadArchives(); // Reload archives list
      } else {
        const error = await response.json();
        alert(`Failed to restore archive:\n${error.error}`);
      }
    } catch (error) {
      console.error('Error restoring archive:', error);
      alert('Failed to restore archive');
    }
  }

  async function handleDeleteArchive(archiveId: string) {
    if (!confirm('PERMANENTLY delete this archive? This cannot be undone!')) {
      return;
    }

    try {
      const response = await fetch(`/api/build/archives?archiveId=${archiveId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Archive permanently deleted');
        loadArchives(); // Reload archives list
      } else {
        const error = await response.json();
        alert(`Failed to delete archive:\n${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting archive:', error);
      alert('Failed to delete archive');
    }
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
    // Prevent double-clicks
    if (deletingProjectId) {
      console.log('⚠️ Delete already in progress, ignoring duplicate request');
      return;
    }

    // Find project to get name for archive
    const project = projects.find(p => p.id === projectId);

    // Set loading state
    setDeletingProjectId(projectId);

    // Call cleanup API to delete build files (which now archives first)
    try {
      const response = await fetch('/api/build/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          projectName: project?.name || projectId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Build cleanup successful:', data);

        // Show success message with archive info
        if (data.archived) {
          alert(`Project deleted and archived!\n\nArchive: ${data.archiveInfo?.archivePath}\nSize: ${(data.archiveInfo?.size / 1024 / 1024).toFixed(2)} MB\n\nYou can restore it from the Archives tab within 30 days.`);
        }

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
        const errorText = await response.text();
        console.error('Failed to cleanup builds:', errorText);
        alert(`Failed to delete project: ${errorText}`);
      }
    } catch (error) {
      console.error('Error calling cleanup API:', error);
      alert(`Error deleting project: ${(error as Error).message}`);
    } finally {
      // Clear loading state
      setDeletingProjectId(null);
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

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('projects')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'projects'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Active Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('archives')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'archives'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Archives ({archives.length})
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {activeTab === 'projects' && (
        <>
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
        </>
      )}

      {/* Archives Grid */}
      {activeTab === 'archives' && (
        <>
          {isLoadingArchives ? (
            <div className="text-center py-16">
              <p className="text-gray-600">Loading archives...</p>
            </div>
          ) : archives.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <FolderIcon className="h-24 w-24 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">No archived projects</h2>
              <p className="text-gray-600">Deleted projects will be archived here for 30 days</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {archives.map((archive) => {
                const archiveId = archive.archivePath.split('/').pop()?.replace('.tar.gz', '') || '';
                return (
                  <div
                    key={archiveId}
                    className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    <div className="p-6">
                      {/* Archive Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                            {archive.projectName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Project ID: {archive.projectId}
                          </p>
                        </div>
                      </div>

                      {/* Archive Meta */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <ClockIcon className="h-4 w-4 mr-2" />
                          <span>Archived {formatDate(archive.archivedAt)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-mono">{(archive.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                        <div className="flex items-center">
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                            Archived
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRestoreArchive(archiveId)}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handleDeleteArchive(archiveId)}
                          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Project?</h3>
            <p className="text-gray-600 mb-6">
              {deletingProjectId ? (
                <>Archiving project and deleting files... This may take up to a minute for large projects.</>
              ) : (
                <>Are you sure you want to delete this project? It will be archived and can be restored within 30 days.</>
              )}
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleDeleteProject(showDeleteConfirm)}
                disabled={deletingProjectId !== null}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {deletingProjectId ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={deletingProjectId !== null}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
