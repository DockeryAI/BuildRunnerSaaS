'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Code,
  Eye,
  Bug,
  Lightbulb,
  Network,
  FileText,
} from 'lucide-react';
import BuildStatusMonitor from '@/components/BuildStatusMonitor';
import LivePreviewTab from '@/components/LivePreviewTab';
import ArchitectureVisualization from '@/components/ArchitectureVisualization';
import BugQueueManager from '@/components/BugQueueManager';
import FeatureRequestFlow from '@/components/FeatureRequestFlow';
import PRDWatcherIndicator from '@/components/PRDWatcherIndicator';

type TabType = 'preview' | 'architecture' | 'bugs' | 'features' | 'status';

export default function ProjectDashboard() {
  const params = useParams();
  const projectId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabType>('preview');

  const tabs = [
    { id: 'preview' as TabType, label: 'Live Preview', icon: Eye },
    { id: 'architecture' as TabType, label: 'Architecture', icon: Network },
    { id: 'bugs' as TabType, label: 'Bugs', icon: Bug },
    { id: 'features' as TabType, label: 'Features', icon: Lightbulb },
    { id: 'status' as TabType, label: 'Build Status', icon: Code },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{projectId}</h1>
            <p className="text-sm text-gray-600 mt-1">
              Claude Builder Project Dashboard
            </p>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={`/create?projectId=${projectId}`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Edit PRD
            </a>
          </div>
        </div>
      </div>

      {/* Build Status Banner */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <BuildStatusMonitor projectName={projectId} />
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'preview' && (
          <LivePreviewTab projectName={projectId} />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureVisualization projectName={projectId} />
        )}

        {activeTab === 'bugs' && (
          <BugQueueManager projectName={projectId} />
        )}

        {activeTab === 'features' && (
          <FeatureRequestFlow projectName={projectId} />
        )}

        {activeTab === 'status' && (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Build Status Details
              </h2>
              <BuildStatusMonitor
                projectName={projectId}
                refreshInterval={2000}
              />
            </div>
          </div>
        )}
      </div>

      {/* PRD Watcher Indicator (floating) */}
      <PRDWatcherIndicator
        buildId={projectId}
        projectPath={`~/Projects/${projectId}`}
      />
    </div>
  );
}
