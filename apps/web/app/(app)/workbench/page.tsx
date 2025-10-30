'use client';

import React from 'react';

export default function WorkbenchPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Workbench</h1>
        <p className="text-gray-600">
          Execute microsteps with Auggie's help. Send tasks, open PRs, and run tests.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Ready to Execute</h2>
        <div className="text-gray-500">
          Microstep queue will be implemented here
        </div>
      </div>
    </div>
  );
}
