'use client';

import React from 'react';
import Link from 'next/link';
import {
  KeyIcon,
  CogIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CreditCardIcon,
  PuzzlePieceIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const settingsSections = [
  {
    title: 'API Keys',
    description: 'Configure external service integrations for AI brainstorming',
    href: '/settings/api-keys',
    icon: KeyIcon,
    status: 'Setup required',
    statusColor: 'text-yellow-600',
  },
  {
    title: 'Models',
    description: 'AI model configuration and preferences',
    href: '/settings/models',
    icon: CogIcon,
    status: 'Available',
    statusColor: 'text-green-600',
  },
  {
    title: 'Security',
    description: 'Authentication and access control settings',
    href: '/settings/security',
    icon: ShieldCheckIcon,
    status: 'Available',
    statusColor: 'text-green-600',
  },
  {
    title: 'Governance',
    description: 'Compliance and policy management',
    href: '/settings/governance',
    icon: ChartBarIcon,
    status: 'Available',
    statusColor: 'text-green-600',
  },
  {
    title: 'Billing',
    description: 'Subscription and usage management',
    href: '/settings/billing',
    icon: CreditCardIcon,
    status: 'Available',
    statusColor: 'text-green-600',
  },
  {
    title: 'Integrations',
    description: 'Third-party service connections',
    href: '/settings/integrations',
    icon: PuzzlePieceIcon,
    status: 'Available',
    statusColor: 'text-green-600',
  },
];

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Configure connections, health checks, and system preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsSections.map((section) => {
          const IconComponent = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-6 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <IconComponent className="h-6 w-6 text-gray-600 group-hover:text-blue-600" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-900">
                      {section.title}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {section.description}
                    </p>
                    <div className="mt-2">
                      <span className={`text-sm font-medium ${section.statusColor}`}>
                        {section.status}
                      </span>
                    </div>
                  </div>
                </div>

                <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Setup Banner */}
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <KeyIcon className="h-6 w-6 text-blue-600" />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Quick Setup for AI Brainstorming
            </h3>
            <p className="text-blue-800 mb-4">
              To get started with AI-powered brainstorming, you'll need to configure your API keys first.
            </p>

            <Link
              href="/settings/api-keys"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <KeyIcon className="h-4 w-4" />
              <span>Configure API Keys</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
