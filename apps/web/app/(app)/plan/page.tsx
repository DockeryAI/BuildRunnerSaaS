'use client';

import React from 'react';

export default function PlanPage() {
  return (
    <div className="h-full flex">
      {/* Tree View */}
      <div className="w-1/3 bg-white rounded-lg shadow mr-6 p-4">
        <h2 className="text-lg font-semibold mb-4">Project Structure</h2>
        <div className="space-y-2">
          <div className="text-sm text-gray-500">Milestones → Steps → Microsteps</div>
          <div className="text-sm text-gray-400">Tree view will be implemented here</div>
        </div>
      </div>

      {/* Detail Panel */}
      <div className="flex-1 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Details</h2>
        <div className="text-gray-500">
          Select an item from the tree to edit its details
        </div>
      </div>
    </div>
  );
}
