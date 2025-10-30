'use client';

import React from 'react';

export default function TestsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tests & QA</h1>
        <p className="text-gray-600">
          Review acceptance criteria and run quality assurance checks.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Acceptance Criteria</h2>
        <div className="text-gray-500">
          AC checklist and QA tools will be implemented here
        </div>
      </div>
    </div>
  );
}
