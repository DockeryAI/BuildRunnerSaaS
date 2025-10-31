'use client';

import React, { useState } from 'react';
import { Shield, Settings, BarChart3, FileText } from 'lucide-react';
import { PolicyEditor } from '../../../../components/governance/PolicyEditor';
import { StatusWidgets } from '../../../../components/governance/StatusWidgets';

type TabType = 'status' | 'policy' | 'settings';

export default function GovernancePage() {
  const [activeTab, setActiveTab] = useState<TabType>('status');

  const tabs = [
    {
      id: 'status' as TabType,
      name: 'Status & Checks',
      icon: BarChart3,
      description: 'View current governance status and CI checks',
    },
    {
      id: 'policy' as TabType,
      name: 'Policy Editor',
      icon: FileText,
      description: 'Edit and validate governance policy configuration',
    },
    {
      id: 'settings' as TabType,
      name: 'Settings',
      icon: Settings,
      description: 'Configure governance rules and preferences',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Governance & Safety</h1>
          <p className="text-gray-600">Manage governance policies, security controls, and compliance</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon
                  className={`-ml-0.5 mr-2 h-5 w-5 ${
                    activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'status' && (
          <div>
            <StatusWidgets />
          </div>
        )}

        {activeTab === 'policy' && (
          <div>
            <PolicyEditor />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Governance Settings</h2>
              <p className="text-gray-600">Configure governance rules and preferences</p>
            </div>

            {/* Settings sections would go here */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Approval Settings */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Required Approvals
                    </label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                      <option value="1">1 Approval</option>
                      <option value="2">2 Approvals</option>
                      <option value="3">3 Approvals</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm text-gray-700">Require code owner reviews</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm text-gray-700">Dismiss stale reviews</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm text-gray-700">Enable secrets scanning</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm text-gray-700">Block merges on secret detection</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm text-gray-700">Require microstep IDs</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Risk Management */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Management</h3>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm text-gray-700">Require rollback plans for risky changes</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm text-gray-700">Require post-deployment checks</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      High Risk Threshold
                    </label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                      <option value="medium">Medium Risk and Above</option>
                      <option value="high">High Risk Only</option>
                      <option value="critical">Critical Risk Only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm text-gray-700">Email notifications</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700">Slack notifications</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm text-gray-700">GitHub issue creation</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
