'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon, ExclamationTriangleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

export default function RestorePage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Restoring your completed project...');

  useEffect(() => {
    restoreProject();
  }, []);

  const restoreProject = () => {
    try {
      const projectsData = localStorage.getItem('buildrunner_projects');
      let projects = projectsData ? JSON.parse(projectsData) : [];

      let project = projects.find((p: any) => p.id === '1' || p.id === 1);

      // Create project if it doesn't exist
      if (!project) {
        project = {
          id: '1',
          name: 'Restored Completed Project',
          productIdea: 'Completed build with 92 files',
          currentPhase: 'complete',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'completed',
          lastBuildId: '1762055895639-ctpi588xt',
          phaseProgress: {
            prd: true,
            plan: true,
            build: true,
          },
          builds: [],
        };
        projects.push(project);
      } else {
        // Update existing project with completed build
        project.status = 'completed';
        project.currentPhase = 'complete';
        project.lastBuildId = '1762055895639-ctpi588xt';
        project.updatedAt = new Date().toISOString();
        project.phaseProgress = {
          prd: true,
          plan: true,
          build: true,
        };
      }

      // Add build metadata if not exists
      if (!project.builds) {
        project.builds = [];
      }

      const existingBuild = project.builds.find((b: any) => b.buildId === '1762055895639-ctpi588xt');

      if (!existingBuild) {
        project.builds.unshift({
          buildId: '1762055895639-ctpi588xt',
          timestamp: '2025-11-01T22:58:00.000Z',
          componentCount: 46,
          fileCount: 92,
          status: 'completed',
          buildDirectory: 'builds/1/1762055895639-ctpi588xt',
          duration: 0,
        });
      }

      localStorage.setItem('buildrunner_projects', JSON.stringify(projects));
      localStorage.setItem('currentProjectId', '1');

      setStatus('success');
      setMessage('Project restored successfully! Redirecting to workbench...');

      // Redirect to workbench after 1 second
      setTimeout(() => {
        router.push(`/workbench?buildId=1762055895639-ctpi588xt&restore=true`);
      }, 1000);

    } catch (error) {
      console.error('Restoration error:', error);
      setStatus('error');
      setMessage(`Restoration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Cog6ToothIcon className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Restoring Project</h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
              <p className="text-gray-600">{message}</p>
              <div className="mt-4">
                <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Redirecting...</span>
                </div>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <ExclamationTriangleIcon className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Restoration Failed</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <button
                onClick={() => router.push('/projects')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Go to Projects
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
