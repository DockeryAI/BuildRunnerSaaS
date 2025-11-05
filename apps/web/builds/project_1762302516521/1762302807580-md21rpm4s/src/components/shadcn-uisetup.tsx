'use client'

import { useState } from 'react'
import { MapPin, Users, Calendar, MessageCircle, Settings, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface TripPlannerProps {
  initialTrips?: Trip[]
  onTripCreate?: (trip: Trip) => void
  onTripUpdate?: (tripId: string, updates: Partial<Trip>) => void
}

interface Trip {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  status: 'planning' | 'confirmed' | 'completed'
  memberCount: number
  tasksCompleted: number
  totalTasks: number
}

interface QuickAction {
  id: string
  title: string
  icon: React.ReactNode
  color: string
  description: string
}

const DEFAULT_TRIPS: Trip[] = [
  {
    id: '1',
    name: 'Moab Desert Adventure',
    location: 'Moab, Utah',
    startDate: '2024-03-15',
    endDate: '2024-03-17',
    status: 'planning',
    memberCount: 6,
    tasksCompleted: 3,
    totalTasks: 8
  },
  {
    id: '2',
    name: 'Sierra Nevada Trail',
    location: 'California',
    startDate: '2024-04-20',
    endDate: '2024-04-22',
    status: 'confirmed',
    memberCount: 4,
    tasksCompleted: 8,
    totalTasks: 8
  }
]

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'new-trip',
    title: 'Plan New Trip',
    icon: <MapPin className="w-6 h-6" />,
    color: 'bg-[rgb(34,139,34)]',
    description: 'Start planning your next adventure'
  },
  {
    id: 'invite-members',
    title: 'Invite Members',
    icon: <Users className="w-6 h-6" />,
    color: 'bg-[rgb(249,115,22)]',
    description: 'Add friends to your trips'
  },
  {
    id: 'check-weather',
    title: 'Weather Check',
    icon: <Calendar className="w-6 h-6" />,
    color: 'bg-[rgb(34, 139, 34)]',
    description: 'View weather forecasts'
  },
  {
    id: 'group-chat',
    title: 'Group Chat',
    icon: <MessageCircle className="w-6 h-6" />,
    color: 'bg-purple-500',
    description: 'Chat with your group'
  }
]

export function TripPlannerDashboard({
  initialTrips = DEFAULT_TRIPS,
  onTripCreate = () => console.log('Trip created'),
  onTripUpdate = () => console.log('Trip updated')
}: TripPlannerProps = {}) {
  const [trips, setTrips] = useState<Trip[]>(initialTrips)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'trips' | 'chat' | 'profile'>('dashboard')

  const getStatusIcon = (status: Trip['status']) => {
    switch (status) {
      case 'planning':
        return <Clock className="w-4 h-4 text-[rgb(249,115,22)]" />
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-[rgb(34,139,34)]" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-gray-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'planning':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'completed':
        return 'bg-[rgb(248, 250, 252)] text-gray-700 border-[rgb(226, 232, 240)]'
      default:
        return 'bg-[rgb(248, 250, 252)] text-gray-700 border-[rgb(226, 232, 240)]'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    })
  }

  const handleQuickAction = (actionId: string) => {
    console.log(`Quick action: ${actionId}`)
    // Handle navigation or action based on actionId
  }

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      {/* Header */}
      <header className="bg-[rgb(255,255,255)] border-b border-[rgb(226,232,240)] px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[rgb(15,23,42)]">Trail Planner</h1>
            <p className="text-sm text-gray-600">Plan your next adventure</p>
          </div>
          <button 
            className="p-2 rounded-lg bg-[rgb(245,247,250)] hover:bg-gray-200 transition-colors duration-150"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-[rgb(15,23,42)]" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 pb-20">
        {/* Quick Actions Grid */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action.id)}
                className="p-4 bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-xl hover:border-[rgb(34,139,34)] transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 text-left"
                style={{ minHeight: '44px' }}
              >
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                  <div className="text-white">
                    {action.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-[rgb(15,23,42)] text-sm mb-1">{action.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{action.description}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Upcoming Trips */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[rgb(15,23,42)]">Upcoming Trips</h2>
            <button className="text-sm text-[rgb(34,139,34)] font-medium hover:text-green-700 transition-colors duration-150">
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {trips.filter(trip => trip.status !== 'completed').map((trip) => (
              <div
                key={trip.id}
                className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-xl p-4 hover:border-[rgb(34,139,34)] transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[rgb(15,23,42)] mb-1">{trip.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {trip.location}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(trip.status)}`}>
                    {getStatusIcon(trip.status)}
                    {trip.status}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {trip.memberCount} members
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Trip Planning Progress</span>
                    <span>{trip.tasksCompleted}/{trip.totalTasks} tasks</span>
                  </div>
                  <div className="w-full bg-[rgb(245,247,250)] rounded-full h-2">
                    <div 
                      className="bg-[rgb(34,139,34)] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(trip.tasksCompleted / trip.totalTasks) * 100}%` }}
                    />
                  </div>
                </div>

                <button className="w-full py-2 bg-[rgb(245,247,250)] text-[rgb(15,23,42)] rounded-lg hover:bg-gray-200 transition-colors duration-150 text-sm font-medium">
                  View Trip Details
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[rgb(34,139,34)] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[rgb(15,23,42)]">Sarah completed "Bring firewood" task</p>
                  <p className="text-xs text-gray-600">Moab Desert Adventure • 2 hours ago</p>
                </div>
              </div>
            </div>

            <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[rgb(249,115,22)] rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[rgb(15,23,42)]">New message in group chat</p>
                  <p className="text-xs text-gray-600">Sierra Nevada Trail • 4 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[rgb(255,255,255)] border-t border-[rgb(226,232,240)] px-4 py-2">
        <div className="flex items-center justify-around">
          {[
            { id: 'dashboard', icon: MapPin, label: 'Dashboard' },
            { id: 'trips', icon: Calendar, label: 'Trips' },
            { id: 'chat', icon: MessageCircle, label: 'Chat' },
            { id: 'profile', icon: Users, label: 'Profile' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors duration-150 ${
                activeTab === tab.id 
                  ? 'text-[rgb(34,139,34)] bg-green-50' 
                  : 'text-gray-600 hover:text-[rgb(15,23,42)]'
              }`}
              style={{ minHeight: '44px', minWidth: '44px' }}
              aria-label={tab.label}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default function TripPlannerDemo() {
  return <TripPlannerDashboard />
}