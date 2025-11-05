'use client'

import { useState, useEffect } from 'react'
import { 
  MapPin, 
  Calendar, 
  Users, 
  MessageCircle, 
  Settings, 
  Plus,
  Search,
  Filter,
  Bell,
  Menu,
  X,
  ChevronRight,
  Star,
  Clock,
  CheckCircle
} from 'lucide-react'

interface Trip {
  id: string
  title: string
  location: string
  startDate: string
  endDate: string
  participants: number
  status: 'planning' | 'confirmed' | 'completed'
  image?: string
  difficulty: 'easy' | 'moderate' | 'hard'
  distance: string
}

interface QuickAction {
  id: string
  title: string
  icon: React.ReactNode
  color: string
  href: string
}

interface TripPlannerDashboardProps {
  trips?: Trip[]
  onCreateTrip?: () => void
  onTripSelect?: (tripId: string) => void
  onQuickAction?: (actionId: string) => void
}

export function TripPlannerDashboard({
  trips = DEFAULT_TRIPS,
  onCreateTrip = () => console.log('Create trip'),
  onTripSelect = (id) => console.log('Trip selected:', id),
  onQuickAction = (id) => console.log('Quick action:', id)
}: TripPlannerDashboardProps = {}) {
  const [activeTab, setActiveTab] = useState('trips')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [notifications, setNotifications] = useState(3)

  const quickActions: QuickAction[] = [
    {
      id: 'new-trip',
      title: 'Plan New Trip',
      icon: <Plus className="w-5 h-5" />,
      color: 'bg-[rgb(34,139,34)]',
      href: '/trips/new'
    },
    {
      id: 'find-trails',
      title: 'Find Trails',
      icon: <MapPin className="w-5 h-5" />,
      color: 'bg-[rgb(245,158,11)]',
      href: '/trails'
    },
    {
      id: 'weather',
      title: 'Weather',
      icon: <Clock className="w-5 h-5" />,
      color: 'bg-[rgb(34, 139, 34)]',
      href: '/weather'
    },
    {
      id: 'group-chat',
      title: 'Group Chat',
      icon: <MessageCircle className="w-5 h-5" />,
      color: 'bg-purple-500',
      href: '/chat'
    }
  ]

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trip.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || trip.status === selectedFilter
    return matchesSearch && matchesFilter
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200'
      case 'moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'hard': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-[rgb(241, 245, 249)] text-gray-700 border-[rgb(226, 232, 240)]'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200'
      case 'completed': return 'bg-[rgb(241, 245, 249)] text-gray-700 border-[rgb(226, 232, 240)]'
      default: return 'bg-[rgb(241, 245, 249)] text-gray-700 border-[rgb(226, 232, 240)]'
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      {/* Header */}
      <header className="bg-[rgb(255,255,255)] border-b border-[rgb(226,232,240)] px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[rgb(34,139,34)] rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[rgb(255,255,255)]" />
            </div>
            <h1 className="text-lg font-semibold text-[rgb(15,23,42)]">TrailPlan</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="relative p-2 rounded-lg hover:bg-[rgb(241,245,249)] transition-colors duration-150"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-[rgb(15,23,42)]" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[rgb(220,38,38)] text-[rgb(255,255,255)] text-xs rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>
            <button 
              className="p-2 rounded-lg hover:bg-[rgb(241,245,249)] transition-colors duration-150"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5 text-[rgb(15,23,42)]" />
            </button>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="px-4 py-4 bg-[rgb(248,250,252)] border-b border-[rgb(226,232,240)]">
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search trips or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-gray-400 focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-lg border transition-all duration-150 ${
              showFilters 
                ? 'bg-[rgb(34,139,34)] border-[rgb(34,139,34)] text-[rgb(255,255,255)]' 
                : 'bg-[rgb(255,255,255)] border-[rgb(226,232,240)] text-[rgb(15,23,42)] hover:bg-[rgb(241,245,249)]'
            }`}
            aria-label="Toggle filters"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {showFilters && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['all', 'planning', 'confirmed', 'completed'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                  selectedFilter === filter
                    ? 'bg-[rgb(34,139,34)] text-[rgb(255,255,255)]'
                    : 'bg-[rgb(255,255,255)] text-[rgb(15,23,42)] border border-[rgb(226,232,240)] hover:bg-[rgb(241,245,249)]'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-4">
        <h2 className="text-sm font-semibold text-[rgb(15,23,42)] mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => onQuickAction(action.id)}
              className="flex items-center gap-3 p-4 bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-xl hover:border-[rgb(34,139,34)]/50 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
            >
              <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center text-[rgb(255,255,255)]`}>
                {action.icon}
              </div>
              <span className="text-sm font-medium text-[rgb(15,23,42)]">{action.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Trips List */}
      <div className="px-4 pb-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[rgb(15,23,42)]">Your Trips</h2>
          <button
            onClick={onCreateTrip}
            className="flex items-center gap-2 px-3 py-1.5 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors duration-150 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Trip
          </button>
        </div>

        {filteredTrips.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-2">No trips found</h3>
            <p className="text-gray-500 mb-4">Start planning your next adventure!</p>
            <button
              onClick={onCreateTrip}
              className="px-6 py-2.5 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors duration-150 font-medium"
            >
              Plan Your First Trip
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTrips.map((trip) => (
              <div
                key={trip.id}
                onClick={() => onTripSelect(trip.id)}
                className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-xl p-4 hover:border-[rgb(34,139,34)]/50 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[rgb(15,23,42)] mb-1">{trip.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                      <MapPin className="w-4 h-4" />
                      {trip.location}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(trip.difficulty)}`}>
                    {trip.difficulty}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(trip.status)}`}>
                    {trip.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(trip.startDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {trip.participants}
                    </div>
                  </div>
                  <span className="text-xs">{trip.distance}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[rgb(255,255,255)] border-t border-[rgb(226,232,240)] px-4 py-2">
        <div className="flex items-center justify-around">
          {[
            { id: 'trips', icon: MapPin, label: 'Trips' },
            { id: 'calendar', icon: Calendar, label: 'Calendar' },
            { id: 'chat', icon: MessageCircle, label: 'Chat' },
            { id: 'profile', icon: Users, label: 'Profile' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors duration-150 ${
                activeTab === tab.id
                  ? 'text-[rgb(34,139,34)]'
                  : 'text-gray-500 hover:text-[rgb(15,23,42)]'
              }`}
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

const DEFAULT_TRIPS: Trip[] = [
  {
    id: '1',
    title: 'Moab Desert Adventure',
    location: 'Moab, Utah',
    startDate: '2024-03-15',
    endDate: '2024-03-17',
    participants: 6,
    status: 'confirmed',
    difficulty: 'moderate',
    distance: '45 miles'
  },
  {
    id: '2',
    title: 'Sierra Nevada Expedition',
    location: 'California',
    startDate: '2024-04-20',
    endDate: '2024-04-23',
    participants: 4,
    status: 'planning',
    difficulty: 'hard',
    distance: '78 miles'
  },
  {
    id: '3',
    title: 'Blue Ridge Parkway',
    location: 'North Carolina',
    startDate: '2024-02-10',
    endDate: '2024-02-12',
    participants: 8,
    status: 'completed',
    difficulty: 'easy',
    distance: '32 miles'
  }
]

export default function TripPlannerDashboardDemo() {
  return <TripPlannerDashboard />
}