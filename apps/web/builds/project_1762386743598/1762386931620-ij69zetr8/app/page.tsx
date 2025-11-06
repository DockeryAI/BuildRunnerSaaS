'use client';

import { useState } from 'react';
import AuthProvider from '../src/components/auth-provider';
import AuthForms from '../src/components/auth-forms';
import CreateEditTripForm from '../src/components/create-edit-trip-form';
import TaskManagement from '../src/components/task-management';
import GroupChat from '../src/components/group-chat';
import InvitationSystem from '../src/components/invitation-system';
import RsvpManagement from '../src/components/rsvp-management';
import MealMenu from '../src/components/meal-menu';
import LocationManager from '../src/components/location-manager';

export default function Home() {
  const [activeTab, setActiveTab] = useState('authprovider');

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Generated App</h1>

        {/* Tab Navigation */}
        <div className="mb-4 flex gap-1 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab('authprovider')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'authprovider'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Auth Provider
            </button>
            <button
              onClick={() => setActiveTab('authforms')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'authforms'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Auth Forms
            </button>
            <button
              onClick={() => setActiveTab('createedittripform')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'createedittripform'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Create Edit Trip Form
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
              onClick={() => setActiveTab('invitationsystem')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'invitationsystem'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Invitation System
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
              onClick={() => setActiveTab('mealmenu')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'mealmenu'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Meal Menu
            </button>
            <button
              onClick={() => setActiveTab('locationmanager')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'locationmanager'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Location Manager
            </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg shadow-sm border border-gray-200">
        {activeTab === 'authprovider' && (
          <div className="p-6">
            <AuthProvider />
          </div>
        )}
        {activeTab === 'authforms' && (
          <div className="p-6">
            <AuthForms />
          </div>
        )}
        {activeTab === 'createedittripform' && (
          <div className="p-6">
            <CreateEditTripForm />
          </div>
        )}
        {activeTab === 'taskmanagement' && (
          <div className="p-6">
            <TaskManagement />
          </div>
        )}
        {activeTab === 'groupchat' && (
          <div className="p-6">
            <GroupChat />
          </div>
        )}
        {activeTab === 'invitationsystem' && (
          <div className="p-6">
            <InvitationSystem />
          </div>
        )}
        {activeTab === 'rsvpmanagement' && (
          <div className="p-6">
            <RsvpManagement />
          </div>
        )}
        {activeTab === 'mealmenu' && (
          <div className="p-6">
            <MealMenu />
          </div>
        )}
        {activeTab === 'locationmanager' && (
          <div className="p-6">
            <LocationManager />
          </div>
        )}
        </div>
      </div>
    </main>
  );
}
