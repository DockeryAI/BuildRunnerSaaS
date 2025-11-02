'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { RecoveryManager } from '../lib/autosave';

interface RecoveryItem {
  type: 'build' | 'prd' | 'plan';
  projectId: string;
  buildId?: string;
  lastUpdate: string;
  progress?: number;
  stage?: string;
}

export default function RecoveryBanner() {
  const router = useRouter();
  const [recoveryItems, setRecoveryItems] = useState<RecoveryItem[]>([]);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    checkForRecovery();
  }, []);

  function checkForRecovery() {
    const items: RecoveryItem[] = [];

    // Check for interrupted builds
    const interruptedBuilds = RecoveryManager.checkInterruptedBuilds();
    interruptedBuilds.forEach((build) => {
      items.push({
        type: 'build',
        projectId: build.projectId,
        buildId: build.buildId,
        lastUpdate: build.lastUpdate,
        progress: build.progress,
      });
    });

    // Check for unsaved PRDs
    const unsavedPRDs = RecoveryManager.checkUnsavedPRDs();
    unsavedPRDs.forEach((prd) => {
      items.push({
        type: 'prd',
        projectId: prd.projectId,
        lastUpdate: prd.lastUpdate,
      });
    });

    // Check for interrupted plans
    const interruptedPlans = RecoveryManager.checkInterruptedPlans();
    interruptedPlans.forEach((plan) => {
      items.push({
        type: 'plan',
        projectId: plan.projectId,
        lastUpdate: plan.lastUpdate,
        stage: plan.stage,
      });
    });

    setRecoveryItems(items);
  }

  function handleRecover(item: RecoveryItem) {
    // Set the current project ID
    localStorage.setItem('currentProjectId', item.projectId);

    if (item.type === 'build' && item.buildId) {
      router.push(`/workbench?buildId=${item.buildId}&resume=true`);
    } else if (item.type === 'prd') {
      router.push(`/create`);
    } else if (item.type === 'plan') {
      router.push(`/plan`);
    }
  }

  function handleDismiss() {
    setIsDismissed(true);
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    return date.toLocaleString();
  }

  if (recoveryItems.length === 0 || isDismissed) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-900 mb-2">
                Recovery Available
              </h3>
              <p className="text-sm text-yellow-800 mb-3">
                We found {recoveryItems.length} interrupted work session{recoveryItems.length > 1 ? 's' : ''} that can be recovered:
              </p>
              <div className="space-y-2">
                {recoveryItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-yellow-200"
                  >
                    <div>
                      <div className="font-medium text-sm text-gray-900">
                        {item.type === 'build' && `Interrupted Build ${item.progress ? `(${item.progress}% complete)` : ''}`}
                        {item.type === 'prd' && 'Unsaved PRD Draft'}
                        {item.type === 'plan' && `Interrupted Plan Generation ${item.stage ? `(${item.stage})` : ''}`}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Project ID: {item.projectId} • Last updated {formatDate(item.lastUpdate)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRecover(item)}
                      className="ml-4 px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                    >
                      Recover
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="ml-4 text-yellow-600 hover:text-yellow-800 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
