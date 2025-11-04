'use client';

import { useState } from 'react';
import Nextjs from '../src/components/nextjs';
import React from '../src/components/react';
import TypeScript from '../src/components/type-script';
import TailwindCSS from '../src/components/tailwind-css';
import shadcnui from '../src/components/shadcnui';
import ReactHookForm from '../src/components/react-hook-form';
import ShadcnSetup from '../src/components/shadcn-setup';
import TaskManagement from '../src/components/task-management';
import GroupManagement from '../src/components/group-management';
import GroupChat from '../src/components/group-chat';
import InvitationSystem from '../src/components/invitation-system';
import MenuPlanner from '../src/components/menu-planner';
import MobileNavigation from '../src/components/mobile-navigation';
import ResponsiveLayout from '../src/components/responsive-layout';

export default function Home() {
  const [activeTab, setActiveTab] = useState('nextjs');

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Generated App</h1>

        {/* Tab Navigation */}
        <div className="mb-4 flex gap-1 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab('nextjs')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'nextjs'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Nextjs
            </button>
            <button
              onClick={() => setActiveTab('react')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'react'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              React
            </button>
            <button
              onClick={() => setActiveTab('typescript')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'typescript'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Type Script
            </button>
            <button
              onClick={() => setActiveTab('tailwindcss')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'tailwindcss'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tailwind C S S
            </button>
            <button
              onClick={() => setActiveTab('shadcnui')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'shadcnui'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              shadcnui
            </button>
            <button
              onClick={() => setActiveTab('reacthookform')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'reacthookform'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              React Hook Form
            </button>
            <button
              onClick={() => setActiveTab('shadcnsetup')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'shadcnsetup'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Shadcn Setup
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
              onClick={() => setActiveTab('groupmanagement')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'groupmanagement'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Group Management
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
              onClick={() => setActiveTab('menuplanner')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'menuplanner'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Menu Planner
            </button>
            <button
              onClick={() => setActiveTab('mobilenavigation')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'mobilenavigation'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Mobile Navigation
            </button>
            <button
              onClick={() => setActiveTab('responsivelayout')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'responsivelayout'
                  ? 'bg-white text-blue-600 border-t-2 border-x-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Responsive Layout
            </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg shadow-sm border border-gray-200">
        {activeTab === 'nextjs' && (
          <div className="p-6">
            <Nextjs />
          </div>
        )}
        {activeTab === 'react' && (
          <div className="p-6">
            <React />
          </div>
        )}
        {activeTab === 'typescript' && (
          <div className="p-6">
            <TypeScript />
          </div>
        )}
        {activeTab === 'tailwindcss' && (
          <div className="p-6">
            <TailwindCSS />
          </div>
        )}
        {activeTab === 'shadcnui' && (
          <div className="p-6">
            <shadcnui />
          </div>
        )}
        {activeTab === 'reacthookform' && (
          <div className="p-6">
            <ReactHookForm />
          </div>
        )}
        {activeTab === 'shadcnsetup' && (
          <div className="p-6">
            <ShadcnSetup />
          </div>
        )}
        {activeTab === 'taskmanagement' && (
          <div className="p-6">
            <TaskManagement />
          </div>
        )}
        {activeTab === 'groupmanagement' && (
          <div className="p-6">
            <GroupManagement />
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
        {activeTab === 'menuplanner' && (
          <div className="p-6">
            <MenuPlanner />
          </div>
        )}
        {activeTab === 'mobilenavigation' && (
          <div className="p-6">
            <MobileNavigation />
          </div>
        )}
        {activeTab === 'responsivelayout' && (
          <div className="p-6">
            <ResponsiveLayout />
          </div>
        )}
        </div>
      </div>
    </main>
  );
}
