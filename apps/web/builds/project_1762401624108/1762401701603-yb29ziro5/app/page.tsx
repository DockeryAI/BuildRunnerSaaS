'use client';

import { useState } from 'react';
import LocationManagement from '../src/components/location-management';
import TaskManagement from '../src/components/task-management';
import SchedulingComponent from '../src/components/scheduling-component';
import GroupChatComponent from '../src/components/group-chat-component';
import MealMenuComponent from '../src/components/meal-menu-component';
import RsvpManagementComponent from '../src/components/rsvp-management-component';
import WeatherDisplayComponent from '../src/components/weather-display-component';

export default function Home() {
  const [activeTab, setActiveTab] = useState('locationmanagement');

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Generated App</h1>

        {/* Tab Navigation */}
        <div className="mb-4 flex gap-1 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab('locationmanagement')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'locationmanagement'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Location Management
            </button>
            <button
              onClick={() => setActiveTab('taskmanagement')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'taskmanagement'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Task Management
            </button>
            <button
              onClick={() => setActiveTab('schedulingcomponent')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'schedulingcomponent'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Scheduling Component
            </button>
            <button
              onClick={() => setActiveTab('groupchatcomponent')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'groupchatcomponent'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Group Chat Component
            </button>
            <button
              onClick={() => setActiveTab('mealmenucomponent')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'mealmenucomponent'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Meal Menu Component
            </button>
            <button
              onClick={() => setActiveTab('rsvpmanagementcomponent')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'rsvpmanagementcomponent'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Rsvp Management Component
            </button>
            <button
              onClick={() => setActiveTab('weatherdisplaycomponent')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'weatherdisplaycomponent'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Weather Display Component
            </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg shadow-sm border border-gray-200">
        {activeTab === 'locationmanagement' && (
          <div className="p-6">
            <LocationManagement />
          </div>
        )}
        {activeTab === 'taskmanagement' && (
          <div className="p-6">
            <TaskManagement />
          </div>
        )}
        {activeTab === 'schedulingcomponent' && (
          <div className="p-6">
            <SchedulingComponent />
          </div>
        )}
        {activeTab === 'groupchatcomponent' && (
          <div className="p-6">
            <GroupChatComponent />
          </div>
        )}
        {activeTab === 'mealmenucomponent' && (
          <div className="p-6">
            <MealMenuComponent />
          </div>
        )}
        {activeTab === 'rsvpmanagementcomponent' && (
          <div className="p-6">
            <RsvpManagementComponent />
          </div>
        )}
        {activeTab === 'weatherdisplaycomponent' && (
          <div className="p-6">
            <WeatherDisplayComponent />
          </div>
        )}
        </div>
      </div>
    </main>
  );
}
