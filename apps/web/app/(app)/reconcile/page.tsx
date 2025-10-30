'use client';

import React from 'react';

export default function ReconcilePage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reconcile</h1>
        <p className="text-gray-600">
          Detect and reconcile drift between your plan and actual implementation.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Drift Detection</h2>
        <div className="text-gray-500">
          Drift list and reconciliation tools will be implemented here
        </div>
      </div>
    </div>
  );
}
