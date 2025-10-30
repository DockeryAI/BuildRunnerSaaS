'use client';

import React from 'react';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Configure connections, health checks, and system preferences.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Connections</h2>
          <div className="text-gray-500">
            Supabase and GitHub connection status will be shown here
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Health Checks</h2>
          <div className="text-gray-500">
            System health monitoring will be implemented here
          </div>
        </div>
      </div>
    </div>
  );
}
