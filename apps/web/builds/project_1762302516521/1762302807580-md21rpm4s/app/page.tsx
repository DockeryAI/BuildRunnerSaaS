'use client';

import { useState } from 'react';
import AuthForms from '../src/components/auth-forms';
import CreateTripForm from '../src/components/create-trip-form';
import GroupMemberAssignment from '../src/components/group-member-assignment';
import TripSchedulingTool from '../src/components/trip-scheduling-tool';
import TripWeatherDisplay from '../src/components/trip-weather-display';
import MealMenuSection from '../src/components/meal-menu-section';
import GroupChat from '../src/components/group-chat';
import RSVPComponent from '../src/components/rsvpcomponent';

export default function Home() {
  const [activeTab, setActiveTab] = useState('authforms');

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Generated App</h1>

        {/* Tab Navigation */}
        <div className="mb-4 flex gap-1 border-b-2 border-gray-200">
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
              onClick={() => setActiveTab('groupmemberassignment')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'groupmemberassignment'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Group Member Assignment
            </button>
            <button
              onClick={() => setActiveTab('tripschedulingtool')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'tripschedulingtool'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Trip Scheduling Tool
            </button>
            <button
              onClick={() => setActiveTab('tripweatherdisplay')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'tripweatherdisplay'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Trip Weather Display
            </button>
            <button
              onClick={() => setActiveTab('mealmenusection')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'mealmenusection'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Meal Menu Section
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
              onClick={() => setActiveTab('rsvpcomponent')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'rsvpcomponent'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              R S V P Component
            </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg shadow-sm border border-gray-200">
        {activeTab === 'authforms' && (
          <div className="p-6">
            <AuthForms />
          </div>
        )}
        {activeTab === 'createtripform' && (
          <div className="p-6">
            <CreateTripForm />
          </div>
        )}
        {activeTab === 'groupmemberassignment' && (
          <div className="p-6">
            <GroupMemberAssignment />
          </div>
        )}
        {activeTab === 'tripschedulingtool' && (
          <div className="p-6">
            <TripSchedulingTool />
          </div>
        )}
        {activeTab === 'tripweatherdisplay' && (
          <div className="p-6">
            <TripWeatherDisplay />
          </div>
        )}
        {activeTab === 'mealmenusection' && (
          <div className="p-6">
            <MealMenuSection />
          </div>
        )}
        {activeTab === 'groupchat' && (
          <div className="p-6">
            <GroupChat />
          </div>
        )}
        {activeTab === 'rsvpcomponent' && (
          <div className="p-6">
            <RSVPComponent />
          </div>
        )}
        </div>
      </div>
    </main>
  );
}
