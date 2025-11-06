'use client';

import { useState } from 'react';
import TripCreationForm from '../src/components/trip-creation-form';
import LocationSelector from '../src/components/location-selector';
import TaskAssignmentComponent from '../src/components/task-assignment-component';
import TaskListDisplay from '../src/components/task-list-display';
import CalendarCheckComponent from '../src/components/calendar-check-component';
import GroupChatFeature from '../src/components/group-chat-feature';
import RSVPManagement from '../src/components/rsvpmanagement';
import MealMenuComponent from '../src/components/meal-menu-component';

export default function Home() {
  const [activeTab, setActiveTab] = useState('tripcreationform');

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Generated App</h1>

        {/* Tab Navigation */}
        <div className="mb-4 flex gap-1 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab('tripcreationform')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'tripcreationform'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Trip Creation Form
            </button>
            <button
              onClick={() => setActiveTab('locationselector')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'locationselector'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Location Selector
            </button>
            <button
              onClick={() => setActiveTab('taskassignmentcomponent')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'taskassignmentcomponent'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Task Assignment Component
            </button>
            <button
              onClick={() => setActiveTab('tasklistdisplay')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'tasklistdisplay'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Task List Display
            </button>
            <button
              onClick={() => setActiveTab('calendarcheckcomponent')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'calendarcheckcomponent'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Calendar Check Component
            </button>
            <button
              onClick={() => setActiveTab('groupchatfeature')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'groupchatfeature'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Group Chat Feature
            </button>
            <button
              onClick={() => setActiveTab('rsvpmanagement')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'rsvpmanagement'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              R S V P Management
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
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg shadow-sm border border-gray-200">
        {activeTab === 'tripcreationform' && (
          <div className="p-6">
            <TripCreationForm />
          </div>
        )}
        {activeTab === 'locationselector' && (
          <div className="p-6">
            <LocationSelector />
          </div>
        )}
        {activeTab === 'taskassignmentcomponent' && (
          <div className="p-6">
            <TaskAssignmentComponent />
          </div>
        )}
        {activeTab === 'tasklistdisplay' && (
          <div className="p-6">
            <TaskListDisplay />
          </div>
        )}
        {activeTab === 'calendarcheckcomponent' && (
          <div className="p-6">
            <CalendarCheckComponent />
          </div>
        )}
        {activeTab === 'groupchatfeature' && (
          <div className="p-6">
            <GroupChatFeature />
          </div>
        )}
        {activeTab === 'rsvpmanagement' && (
          <div className="p-6">
            <RSVPManagement />
          </div>
        )}
        {activeTab === 'mealmenucomponent' && (
          <div className="p-6">
            <MealMenuComponent />
          </div>
        )}
        </div>
      </div>
    </main>
  );
}
