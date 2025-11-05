'use client';

import { useState } from 'react';
import TripForm from '../src/components/trip-form';
import TripList from '../src/components/trip-list';
import TaskList from '../src/components/task-list';
import GroupMemberManagement from '../src/components/group-member-management';
import GroupChat from '../src/components/group-chat';
import RsvpManagement from '../src/components/rsvp-management';
import MealPlanner from '../src/components/meal-planner';

export default function Home() {
  const [activeTab, setActiveTab] = useState('tripform');

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Generated App</h1>

        {/* Tab Navigation */}
        <div className="mb-4 flex gap-1 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab('tripform')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'tripform'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Trip Form
            </button>
            <button
              onClick={() => setActiveTab('triplist')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'triplist'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Trip List
            </button>
            <button
              onClick={() => setActiveTab('tasklist')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'tasklist'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Task List
            </button>
            <button
              onClick={() => setActiveTab('groupmembermanagement')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'groupmembermanagement'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Group Member Management
            </button>
            <button
              onClick={() => setActiveTab('groupchat')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'groupchat'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Group Chat
            </button>
            <button
              onClick={() => setActiveTab('rsvpmanagement')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'rsvpmanagement'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Rsvp Management
            </button>
            <button
              onClick={() => setActiveTab('mealplanner')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'mealplanner'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Meal Planner
            </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg shadow-sm border border-gray-200">
        {activeTab === 'tripform' && (
          <div className="p-6">
            <TripForm />
          </div>
        )}
        {activeTab === 'triplist' && (
          <div className="p-6">
            <TripList />
          </div>
        )}
        {activeTab === 'tasklist' && (
          <div className="p-6">
            <TaskList />
          </div>
        )}
        {activeTab === 'groupmembermanagement' && (
          <div className="p-6">
            <GroupMemberManagement />
          </div>
        )}
        {activeTab === 'groupchat' && (
          <div className="p-6">
            <GroupChat />
          </div>
        )}
        {activeTab === 'rsvpmanagement' && (
          <div className="p-6">
            <RsvpManagement />
          </div>
        )}
        {activeTab === 'mealplanner' && (
          <div className="p-6">
            <MealPlanner />
          </div>
        )}
        </div>
      </div>
    </main>
  );
}
