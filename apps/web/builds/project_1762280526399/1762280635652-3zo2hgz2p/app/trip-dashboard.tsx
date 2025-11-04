'use client'

import { useState, useEffect } from 'react'
import { 
  MapPin, 
  Calendar, 
  Users, 
  MessageSquare, 
  ChefHat, 
  CloudSun,
  Plus,
  Settings,
  Bell,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

interface Trip {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  status: 'planning' | 'confirmed' | 'active' | 'completed'
  memberCount: number
  tasksCompleted: number
  totalTasks: number
  weatherCondition: 'sunny' | 'cloudy' | 'rainy'
  temperature: number
}

interface QuickAction {
  id: string
  title: string
  icon: React.ReactNode
  color: string
  count?: number
}

interface TripDashboardProps {
  trips?: Trip[]
  onTripSelect?: (tripId: string) => void
  onCreateTrip?: () => void
}

export function TripDashboard({
  trips = DEFAULT_TRIPS,
  onTripSelect = (id) => console.log('Trip selected:', id),
  onCreateTrip = () => console.log('Create new trip')
}: TripDashboardProps = {}) {
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(trips[0] || null)
  const [notifications, setNotifications] = useState(3)

  const quickActions: QuickAction[] = [
    {
      id: 'locations',
      title: 'Locations',
      icon: <MapPin className="w-5 h-5" />,
      color: 'bg-[rgb(34,139,34)]'
    },
    {
      id: 'schedule',
      title: 'Schedule',
      icon: <Calendar className="w-5 h-5" />,
      color: 'bg-[rgb(245,158,11)]'
    },
    {
      id: 'members',
      title: 'Members',
      icon: <Users className="w-5 h-5" />,
      color: 'bg-[rgb(34,139,34)]',
      count: selectedTrip?.memberCount
    },
    {
      id: 'chat',
      title: 'Group Chat',
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'bg-[rgb(245,158,11)]',
      count: 5
    },
    {
      id: 'meals',
      title: 'Meals',
      icon: <ChefHat className="w-5 h-5" />,
      color: 'bg-[rgb(34,139,34)]'
    },
    {
      id: 'weather',
      title: 'Weather',
      icon: <CloudSun className="w-5 h-5" />,
      color: 'bg-[rgb(245,158,11)]'
    }
  ]

  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'planning':
        return 'bg-[rgb(245,158,11)] text-white'
      case 'confirmed':
        return 'bg-[rgb(34,139,34)] text-white'
      case 'active':
        return 'bg-[rgb(34,139,34)] text-white'
      case 'completed':
        return 'bg-[rgb(241,245,249)] text-[rgb(15,23,42)]'
      default:
        return 'bg-[rgb(241,245,249)] text-[rgb(15,23,42)]'
    }
  }

  const getStatusIcon = (status: Trip['status']) => {
    switch (status) {
      case 'planning':
        return <Clock className="w-4 h-4" />
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />
      case 'active':
        return <AlertCircle className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      {/* Header */}
      <header className="bg-[rgb(255,255,255)] border-b border-[rgb(226,232,240)] px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[rgb(15,23,42)]">Off-Road Planner</h1>
            <p className="text-sm text-[rgb(15,23,42)]/60">Plan your next adventure</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              className="relative p-2 rounded-lg bg-[rgb(248,250,252)] hover:bg-[rgb(241,245,249)] transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-[rgb(15,23,42)]" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[rgb(239,68,68)] text-white text-xs rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>
            <button 
              className="p-2 rounded-lg bg-[rgb(248,250,252)] hover:bg-[rgb(241,245,249)] transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-[rgb(15,23,42)]" />
            </button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Current Trip Card */}
        {selectedTrip && (
          <div className="bg-[rgb(255,255,255)] rounded-lg border border-[rgb(226,232,240)] p-4 shadow-md">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-lg font-bold text-[rgb(15,23,42)]">{selectedTrip.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-[rgb(15,23,42)]/60" />
                  <span className="text-sm text-[rgb(15,23,42)]/60">{selectedTrip.location}</span>
                </div>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTrip.status)}`}>
                {getStatusIcon(selectedTrip.status)}
                <span className="capitalize">{selectedTrip.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-[rgb(15,23,42)]/60 mb-1">Start Date</p>
                <p className="text-sm font-medium text-[rgb(15,23,42)]">{formatDate(selectedTrip.startDate)}</p>
              </div>
              <div>
                <p className="text-xs text-[rgb(15,23,42)]/60 mb-1">End Date</p>
                <p className="text-sm font-medium text-[rgb(15,23,42)]">{formatDate(selectedTrip.endDate)}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[rgb(15,23,42)]/60">Trip Progress</span>
                <span className="text-sm font-medium text-[rgb(15,23,42)]">
                  {selectedTrip.tasksCompleted}/{selectedTrip.totalTasks} tasks
                </span>
              </div>
              <div className="w-full bg-[rgb(241,245,249)] rounded-full h-2">
                <div 
                  className="bg-[rgb(34,139,34)] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(selectedTrip.tasksCompleted / selectedTrip.totalTasks) * 100}%` }}
                />
              </div>
            </div>

            {/* Weather Info */}
            <div className="flex items-center justify-between p-3 bg-[rgb(248,250,252)] rounded-lg">
              <div className="flex items-center gap-2">
                <CloudSun className="w-5 h-5 text-[rgb(245,158,11)]" />
                <span className="text-sm font-medium text-[rgb(15,23,42)]">Weather</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-[rgb(15,23,42)]">{selectedTrip.temperature}°F</p>
                <p className="text-xs text-[rgb(15,23,42)]/60 capitalize">{selectedTrip.weatherCondition}</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions Grid */}
        <div>
          <h3 className="text-lg font-bold text-[rgb(15,23,42)] mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                className="flex flex-col items-center justify-center p-4 bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg hover:shadow-md transition-all duration-200 min-h-[88px]"
                onClick={() => console.log('Action:', action.id)}
                aria-label={action.title}
              >
                <div className={`p-2 rounded-lg ${action.color} text-white mb-2`}>
                  {action.icon}
                </div>
                <span className="text-sm font-medium text-[rgb(15,23,42)] text-center">{action.title}</span>
                {action.count && (
                  <span className="text-xs text-[rgb(15,23,42)]/60 mt-1">{action.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Trips */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-[rgb(15,23,42)]">Your Trips</h3>
            <button
              onClick={onCreateTrip}
              className="flex items-center gap-2 px-3 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors text-sm font-medium"
              aria-label="Create new trip"
            >
              <Plus className="w-4 h-4" />
              New Trip
            </button>
          </div>
          
          <div className="space-y-3">
            {trips.map((trip) => (
              <button
                key={trip.id}
                onClick={() => {
                  setSelectedTrip(trip)
                  onTripSelect(trip.id)
                }}
                className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                  selectedTrip?.id === trip.id
                    ? 'border-[rgb(34,139,34)] bg-[rgb(34,139,34)]/5'
                    : 'border-[rgb(226,232,240)] bg-[rgb(255,255,255)] hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-[rgb(15,23,42)]">{trip.name}</h4>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(trip.status)}`}>
                    {getStatusIcon(trip.status)}
                    <span className="capitalize">{trip.status}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-[rgb(15,23,42)]/60 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{trip.location}</span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-[rgb(15,23,42)]/60">
                  <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                  <span>{trip.memberCount} members</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Mock data for demo
const DEFAULT_TRIPS: Trip[] = [
  {
    id: '1',
    name: 'Moab Desert Adventure',
    location: 'Moab, Utah',
    startDate: '2024-03-15',
    endDate: '2024-03-18',
    status: 'confirmed',
    memberCount: 8,
    tasksCompleted: 12,
    totalTasks: 18,
    weatherCondition: 'sunny',
    temperature: 72
  },
  {
    id: '2',
    name: 'Rocky Mountain Trail',
    location: 'Colorado Springs, CO',
    startDate: '2024-04-20',
    endDate: '2024-04-23',
    status: 'planning',
    memberCount: 6,
    tasksCompleted: 5,
    totalTasks: 15,
    weatherCondition: 'cloudy',
    temperature: 58
  },
  {
    id: '3',
    name: 'Death Valley Expedition',
    location: 'Death Valley, CA',
    startDate: '2024-02-10',
    endDate: '2024-02-12',
    status: 'completed',
    memberCount: 4,
    tasksCompleted: 20,
    totalTasks: 20,
    weatherCondition: 'sunny',
    temperature: 85
  }
]

// Demo component for page.tsx
export default function TripDashboardDemo() {
  return <TripDashboard />
}