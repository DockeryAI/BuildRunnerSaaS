'use client';

import { useState } from 'react';

export default function TrailSyncPreview() {
  const [activeTab, setActiveTab] = useState<'trips' | 'budget' | 'calendar'>('trips');
  const [selectedTrip, setSelectedTrip] = useState<number | null>(null);

  const mockTrips = [
    {
      id: 1,
      name: 'Colorado Rockies Adventure',
      dates: 'Aug 15-22, 2024',
      budget: 1200,
      spent: 850,
      location: 'Rocky Mountain National Park',
      weather: 'Sunny, 72°F',
      image: '🏔️'
    },
    {
      id: 2,
      name: 'Pacific Coast Highway',
      dates: 'Sep 5-12, 2024',
      budget: 1800,
      spent: 0,
      location: 'California Coast',
      weather: 'Partly Cloudy, 68°F',
      image: '🌊'
    },
    {
      id: 3,
      name: 'Grand Canyon Expedition',
      dates: 'Oct 10-15, 2024',
      budget: 950,
      spent: 0,
      location: 'Grand Canyon, AZ',
      weather: 'Clear, 85°F',
      image: '🏜️'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Mobile Phone Frame */}
      <div className="w-[380px] h-[800px] bg-black rounded-[50px] p-4 shadow-2xl">
        {/* Phone Notch */}
        <div className="w-full h-6 bg-black flex justify-center items-center mb-1">
          <div className="w-32 h-5 bg-black rounded-full"></div>
        </div>

        {/* Phone Screen */}
        <div className="w-full h-full bg-white rounded-[36px] overflow-hidden flex flex-col">
          {/* Status Bar */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 px-6 py-3 flex justify-between items-center text-white text-xs">
            <span>9:41 AM</span>
            <span className="flex gap-1">
              <span>📶</span>
              <span>📡</span>
              <span>🔋</span>
            </span>
          </div>

          {/* App Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 px-6 py-4 text-white">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              🥾 TrailSync
            </h1>
            <p className="text-sm text-green-50">Your Adventure Companion</p>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white border-b border-gray-200 flex">
            {[
              { key: 'trips', label: 'Trips', icon: '🗺️' },
              { key: 'budget', label: 'Budget', icon: '💰' },
              { key: 'calendar', label: 'Calendar', icon: '📅' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 py-3 text-center transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <div className="text-lg">{tab.icon}</div>
                <div className="text-xs font-medium">{tab.label}</div>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {activeTab === 'trips' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Your Trips</h2>
                  <button className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    + New Trip
                  </button>
                </div>

                {mockTrips.map(trip => (
                  <div
                    key={trip.id}
                    onClick={() => setSelectedTrip(trip.id === selectedTrip ? null : trip.id)}
                    className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-4xl">{trip.image}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{trip.name}</h3>
                        <p className="text-sm text-gray-500">{trip.dates}</p>
                        <p className="text-xs text-gray-400 mt-1">📍 {trip.location}</p>
                      </div>
                    </div>

                    {selectedTrip === trip.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Weather:</span>
                          <span className="font-medium">{trip.weather}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Budget:</span>
                          <span className="font-medium">${trip.budget}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Spent:</span>
                          <span className={trip.spent > 0 ? 'font-medium text-blue-600' : 'text-gray-400'}>
                            ${trip.spent}
                          </span>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex gap-2">
                            <button className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg text-xs font-medium">
                              View Details
                            </button>
                            <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-xs font-medium">
                              Edit Trip
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 bg-blue-50 rounded-lg p-3">
                          <div className="text-xs font-medium text-blue-900 mb-2">Recent Activity</div>
                          <div className="space-y-1.5">
                            <div className="text-xs text-blue-700 flex items-start gap-2">
                              <span>📸</span>
                              <span>3 Instagram posts synced</span>
                            </div>
                            <div className="text-xs text-blue-700 flex items-start gap-2">
                              <span>📧</span>
                              <span>Gmail confirmation imported</span>
                            </div>
                            <div className="text-xs text-blue-700 flex items-start gap-2">
                              <span>🤖</span>
                              <span>AI extracted 5 expenses</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'budget' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Trip Budgets</h2>

                {mockTrips.map(trip => (
                  <div key={trip.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{trip.image}</span>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">{trip.name}</h3>
                          <p className="text-xs text-gray-500">{trip.dates}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Budget:</span>
                        <span className="font-bold text-gray-900">${trip.budget}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Spent:</span>
                        <span className="font-bold text-blue-600">${trip.spent}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Remaining:</span>
                        <span className="font-bold text-green-600">${trip.budget - trip.spent}</span>
                      </div>

                      {/* Budget Progress Bar */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${(trip.spent / trip.budget) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-center">
                          {Math.round((trip.spent / trip.budget) * 100)}% used
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'calendar' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Trip Calendar</h2>

                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-gray-900">August 2024</h3>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                      <div key={day} className="text-xs font-bold text-gray-500 py-2">{day}</div>
                    ))}

                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                      const isTrip = (day >= 15 && day <= 22);
                      return (
                        <div
                          key={day}
                          className={`text-xs py-2 rounded ${
                            isTrip
                              ? 'bg-green-500 text-white font-bold'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🏔️</span>
                    <div>
                      <h3 className="font-bold text-blue-900">Colorado Rockies</h3>
                      <p className="text-sm text-blue-700">Aug 15-22 • 8 days</p>
                      <div className="mt-2 space-y-1">
                        <div className="text-xs text-blue-600 flex items-center gap-2">
                          <span>📧</span>
                          <span>Flight confirmed</span>
                        </div>
                        <div className="text-xs text-blue-600 flex items-center gap-2">
                          <span>🏨</span>
                          <span>Hotel booked</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Nav */}
          <div className="bg-white border-t border-gray-200 flex justify-around py-2 px-4">
            {[
              { icon: '🏠', label: 'Home' },
              { icon: '🔍', label: 'Explore' },
              { icon: '➕', label: 'Add' },
              { icon: '💬', label: 'Chat' },
              { icon: '👤', label: 'Profile' }
            ].map(item => (
              <button key={item.label} className="flex flex-col items-center py-1 px-2 text-gray-500 hover:text-blue-600 transition-colors">
                <span className="text-xl">{item.icon}</span>
                <span className="text-[10px]">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="fixed bottom-4 right-4 max-w-md bg-white rounded-lg shadow-xl p-4 border-l-4 border-green-500">
        <div className="flex items-start gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <h3 className="font-bold text-gray-900">TrailSync iOS App Preview</h3>
            <p className="text-sm text-gray-600 mt-1">
              This is an interactive preview of the mobile app generated by BuildRunner
            </p>
            <div className="mt-2 flex gap-2 text-xs">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">42 Components</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">React Native</span>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">SwiftUI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
