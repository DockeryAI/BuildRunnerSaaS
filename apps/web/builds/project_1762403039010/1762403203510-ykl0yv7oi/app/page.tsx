'use client';

import { useState } from 'react';
import UserProfileManagement from '../src/components/user-profile-management';
import CreateTripForm from '../src/components/create-trip-form';
import TaskAssignmentSystem from '../src/components/task-assignment-system';
import MealPlanningSection from '../src/components/meal-planning-section';
import GroupChat from '../src/components/group-chat';
import RSVPSystem from '../src/components/rsvpsystem';
import InviteEmailTemplate from '../src/components/invite-email-template';
import TaskReminderTemplate from '../src/components/task-reminder-template';

export default function Home() {
  const [activeTab, setActiveTab] = useState('userprofilemanagement');

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Generated App</h1>

        {/* Tab Navigation */}
        <div className="mb-4 flex gap-1 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab('userprofilemanagement')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'userprofilemanagement'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              User Profile Management
            </button>
            <button
              onClick={() => setActiveTab('createtripform')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'createtripform'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Create Trip Form
            </button>
            <button
              onClick={() => setActiveTab('taskassignmentsystem')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'taskassignmentsystem'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Task Assignment System
            </button>
            <button
              onClick={() => setActiveTab('mealplanningsection')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'mealplanningsection'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Meal Planning Section
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
              onClick={() => setActiveTab('rsvpsystem')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'rsvpsystem'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              R S V P System
            </button>
            <button
              onClick={() => setActiveTab('inviteemailtemplate')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'inviteemailtemplate'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Invite Email Template
            </button>
            <button
              onClick={() => setActiveTab('taskremindertemplate')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'taskremindertemplate'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Task Reminder Template
            </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg shadow-sm border border-gray-200">
        {activeTab === 'userprofilemanagement' && (
          <div className="p-6">
            <UserProfileManagement />
          </div>
        )}
        {activeTab === 'createtripform' && (
          <div className="p-6">
            <CreateTripForm />
          </div>
        )}
        {activeTab === 'taskassignmentsystem' && (
          <div className="p-6">
            <TaskAssignmentSystem />
          </div>
        )}
        {activeTab === 'mealplanningsection' && (
          <div className="p-6">
            <MealPlanningSection />
          </div>
        )}
        {activeTab === 'groupchat' && (
          <div className="p-6">
            <GroupChat />
          </div>
        )}
        {activeTab === 'rsvpsystem' && (
          <div className="p-6">
            <RSVPSystem />
          </div>
        )}
        {activeTab === 'inviteemailtemplate' && (
          <div className="p-6">
            <InviteEmailTemplate />
          </div>
        )}
        {activeTab === 'taskremindertemplate' && (
          <div className="p-6">
            <TaskReminderTemplate />
          </div>
        )}
        </div>
      </div>
    </main>
  );
}
