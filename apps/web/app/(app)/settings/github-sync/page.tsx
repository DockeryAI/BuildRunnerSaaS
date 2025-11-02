'use client';

import { useState, useEffect } from 'react';
import { GitHubConfig, initializeGitHubSync } from '@/lib/github-auto-sync';
import { SyncStatusWidget } from '@/components/github-sync/SyncStatusWidget';

export default function GitHubSyncSettingsPage() {
  const [config, setConfig] = useState<GitHubConfig>({
    owner: '',
    repo: '',
    branch: 'main',
    token: '',
    autoSync: false,
    syncInterval: 300000, // 5 minutes
  });
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load saved config
    const savedConfig = localStorage.getItem('github_sync_config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }

    // Fetch current sync status
    fetchSyncStatus();
  }, []);

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/github/sync');
      const data = await response.json();
      setSyncStatus(data);
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
    }
  };

  const handleSave = () => {
    localStorage.setItem('github_sync_config', JSON.stringify(config));
    
    if (config.autoSync) {
      initializeGitHubSync(config);
    }
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleManualSync = async () => {
    try {
      const response = await fetch('/api/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const result = await response.json();
      alert(`Sync successful! Commit: ${result.commitHash}`);
      fetchSyncStatus();
    } catch (error) {
      alert('Sync failed: ' + error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">GitHub Auto-Sync Settings</h1>
      <p className="text-gray-600 mb-8">
        Configure automatic synchronization of your Build Runner state to GitHub
      </p>

      {syncStatus && (
        <div className="mb-8">
          <SyncStatusWidget status={syncStatus} onManualSync={handleManualSync} />
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GitHub Owner/Organization
          </label>
          <input
            type="text"
            value={config.owner}
            onChange={(e) => setConfig({ ...config, owner: e.target.value })}
            placeholder="your-username"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Repository Name
          </label>
          <input
            type="text"
            value={config.repo}
            onChange={(e) => setConfig({ ...config, repo: e.target.value })}
            placeholder="my-project"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Branch
          </label>
          <input
            type="text"
            value={config.branch}
            onChange={(e) => setConfig({ ...config, branch: e.target.value })}
            placeholder="main"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GitHub Personal Access Token
          </label>
          <input
            type="password"
            value={config.token}
            onChange={(e) => setConfig({ ...config, token: e.target.value })}
            placeholder="ghp_xxxxxxxxxxxx"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Requires repo scope. Create at: https://github.com/settings/tokens
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.autoSync}
              onChange={(e) => setConfig({ ...config, autoSync: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">Enable Auto-Sync</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sync Interval
          </label>
          <select
            value={config.syncInterval}
            onChange={(e) => setConfig({ ...config, syncInterval: Number(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={60000}>Every 1 minute (testing)</option>
            <option value={300000}>Every 5 minutes (recommended)</option>
            <option value={600000}>Every 10 minutes</option>
            <option value={1800000}>Every 30 minutes</option>
            <option value={3600000}>Every hour</option>
          </select>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {saved ? '✓ Saved!' : 'Save Configuration'}
          </button>
          <button
            onClick={handleManualSync}
            disabled={!config.owner || !config.repo || !config.token}
            className="flex-1 px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Manual Sync Now
          </button>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">How Auto-Sync Works</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Automatically commits Build Runner state files to your repository</li>
          <li>• Includes features.json, STATUS.md, and other tracking files</li>
          <li>• Detects conflicts and notifies you for manual resolution</li>
          <li>• Provides real-time sync status in the header</li>
          <li>• All commits include attribution to Build Runner</li>
        </ul>
      </div>
    </div>
  );
}
