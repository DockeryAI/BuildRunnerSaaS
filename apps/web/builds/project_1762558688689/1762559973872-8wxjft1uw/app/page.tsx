'use client';

import { useState } from 'react';
import RideRequest from '../components/rides/ride-request';

export default function Home() {
  const [activeTab, setActiveTab] = useState('riderequest');

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Generated App</h1>

        {/* Tab Navigation */}
        <div className="mb-4 flex gap-1 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab('riderequest')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'riderequest'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Ride Request
            </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg shadow-sm border border-gray-200">
        {activeTab === 'riderequest' && (
          <div className="p-6">
            <RideRequest />
          </div>
        )}
        </div>
      </div>
    </main>
  );
}
