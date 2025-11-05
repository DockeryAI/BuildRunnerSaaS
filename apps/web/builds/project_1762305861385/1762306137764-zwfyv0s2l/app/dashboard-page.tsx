'use client'

import { useState, useEffect } from 'react'
import { 
  MapPin, 
  Calendar, 
  Users, 
  MessageCircle, 
  UtensilsCrossed, 
  CheckSquare,
  Plus,
  Cloud,
  Thermometer,
  Wind,
  Eye,
  Settings,
  Bell
} from 'lucide-react'

interface Trip {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  memberCount: number
  status: 'planning' | 'confirmed' | 'active' | 'completed'
  weather?: {
    temp: number
    condition: string
    icon: string
  }
}

interface TaskSummary {
  total: number
  completed: number
  pending: number
}

interface WeatherData {
  current: {
    temp: number
    condition: string
    humidity: number
    windSpeed: number
    visibility: number
  }
  forecast: Array<{
    day: string
    high: number
    low: number
    condition: string
  }>
}

interface DashboardPageProps {
  currentTrip?: Trip
  upcomingTrips?: Trip[]
  taskSummary?: TaskSummary
  weatherData?: WeatherData
  unreadMessages?: number
  onCreateTrip?: () => void
  onViewTrip?: (tripId: string) => void
  onViewTasks?: () => void
  onViewChat?: () => void
  onViewMenu?: () => void
}

export function DashboardPage({
  currentTrip = DEFAULT_CURRENT_TRIP,
  upcomingTrips = DEFAULT_UPCOMING_TRIPS,
  taskSummary = DEFAULT_TASK_SUMMARY,
  weatherData = DEFAULT_WEATHER,
  unreadMessages = 3,
  onCreateTrip = () => console.log('Create trip'),
  onViewTrip = (id) => console.log('View trip:', id),
  onViewTasks = () => console.log('View tasks'),
  onViewChat = () => console.log('View chat'),
  onViewMenu = () => console.log('View menu')
}: DashboardPageProps = {}) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'planning':
        return 'bg-[rgb(245,158,11)] text-white'
      case 'confirmed':
        return 'bg-[rgb(34,139,34)] text-white'
      case 'active':
        return 'bg-[rgb(34,139,34)] text-white'
      case 'completed':
        return 'bg-[rgb(226,232,240)] text-[rgb(15,23,42)]'
      default:
        return 'bg-[rgb(241,245,249)] text-[rgb(15,23,42)]'
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      {/* Header */}
      <div className="bg-[rgb(34,139,34)] text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">Off-Road Adventures</h1>
            <p className="text-sm opacity-90">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-150"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[rgb(220,38,38)] text-white text-xs rounded-full flex items-center justify-center">
                  {unreadMessages}
                </span>
              )}
            </button>
            <button 
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-150"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current Trip Card */}
        {currentTrip && (
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-lg">{currentTrip.name}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(currentTrip.status)}`}>
                {currentTrip.status.charAt(0).toUpperCase() + currentTrip.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm opacity-90">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{currentTrip.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(currentTrip.startDate)} - {formatDate(currentTrip.endDate)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{currentTrip.memberCount}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={onViewTasks}
            className="bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] rounded-xl p-4 text-left hover:bg-[rgb(241,245,249)] transition-colors duration-150 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <CheckSquare className="w-6 h-6 text-[rgb(34,139,34)]" />
              <span className="text-xs text-[rgb(15,23,42)] opacity-60">
                {taskSummary.completed}/{taskSummary.total}
              </span>
            </div>
            <h3 className="font-semibold text-[rgb(15,23,42)] mb-1">Tasks</h3>
            <p className="text-sm text-[rgb(15,23,42)] opacity-70">
              {taskSummary.pending} pending
            </p>
          </button>

          <button
            onClick={onViewChat}
            className="bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] rounded-xl p-4 text-left hover:bg-[rgb(241,245,249)] transition-colors duration-150 shadow-sm relative"
          >
            <div className="flex items-center justify-between mb-2">
              <MessageCircle className="w-6 h-6 text-[rgb(34,139,34)]" />
              {unreadMessages > 0 && (
                <span className="w-5 h-5 bg-[rgb(220,38,38)] text-white text-xs rounded-full flex items-center justify-center">
                  {unreadMessages}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-[rgb(15,23,42)] mb-1">Group Chat</h3>
            <p className="text-sm text-[rgb(15,23,42)] opacity-70">
              {unreadMessages} new messages
            </p>
          </button>

          <button
            onClick={onViewMenu}
            className="bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] rounded-xl p-4 text-left hover:bg-[rgb(241,245,249)] transition-colors duration-150 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <UtensilsCrossed className="w-6 h-6 text-[rgb(34,139,34)]" />
            </div>
            <h3 className="font-semibold text-[rgb(15,23,42)] mb-1">Menu</h3>
            <p className="text-sm text-[rgb(15,23,42)] opacity-70">
              Plan meals
            </p>
          </button>

          <button
            onClick={onCreateTrip}
            className="bg-[rgb(34,139,34)] text-white rounded-xl p-4 text-left hover:bg-[rgb(34,139,34)]/90 transition-colors duration-150 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-1">New Trip</h3>
            <p className="text-sm opacity-90">
              Start planning
            </p>
          </button>
        </div>

        {/* Weather Section */}
        <div className="bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] rounded-xl p-4 mb-6 shadow-sm">
          <h3 className="font-semibold text-[rgb(15,23,42)] mb-3 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-[rgb(34,139,34)]" />
            Weather Forecast
          </h3>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-[rgb(15,23,42)]">
                {weatherData.current.temp}°F
              </span>
              <span className="text-[rgb(15,23,42)] opacity-70">
                {weatherData.current.condition}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Thermometer className="w-4 h-4 text-[rgb(34,139,34)]" />
                <span className="text-[rgb(15,23,42)] opacity-70">{weatherData.current.humidity}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Wind className="w-4 h-4 text-[rgb(34,139,34)]" />
                <span className="text-[rgb(15,23,42)] opacity-70">{weatherData.current.windSpeed} mph</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-[rgb(34,139,34)]" />
                <span className="text-[rgb(15,23,42)] opacity-70">{weatherData.current.visibility} mi</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {weatherData.forecast.map((day, index) => (
              <div key={index} className="text-center p-2 bg-white rounded-lg">
                <div className="text-xs text-[rgb(15,23,42)] opacity-60 mb-1">{day.day}</div>
                <div className="text-sm font-semibold text-[rgb(15,23,42)]">
                  {day.high}°/{day.low}°
                </div>
                <div className="text-xs text-[rgb(15,23,42)] opacity-70">{day.condition}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Trips */}
        <div>
          <h3 className="font-semibold text-[rgb(15,23,42)] mb-3">Upcoming Trips</h3>
          <div className="space-y-3">
            {upcomingTrips.map((trip) => (
              <button
                key={trip.id}
                onClick={() => onViewTrip(trip.id)}
                className="w-full bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] rounded-xl p-4 text-left hover:bg-[rgb(241,245,249)] transition-colors duration-150 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-[rgb(15,23,42)]">{trip.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                    {trip.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-[rgb(15,23,42)] opacity-70">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{trip.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(trip.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{trip.memberCount}</span>
                  </div>
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
const DEFAULT_CURRENT_TRIP: Trip = {
  id: '1',
  name: 'Moab Desert Adventure',
  location: 'Moab, Utah',
  startDate: '2024-03-15',
  endDate: '2024-03-17',
  memberCount: 8,
  status: 'confirmed'
}

const DEFAULT_UPCOMING_TRIPS: Trip[] = [
  {
    id: '2',
    name: 'Black Hills Expedition',
    location: 'Black Hills, SD',
    startDate: '2024-04-20',
    endDate: '2024-04-22',
    memberCount: 6,
    status: 'planning'
  },
  {
    id: '3',
    name: 'Colorado Trail Run',
    location: 'Silverton, CO',
    startDate: '2024-05-10',
    endDate: '2024-05-12',
    memberCount: 10,
    status: 'planning'
  }
]

const DEFAULT_TASK_SUMMARY: TaskSummary = {
  total: 12,
  completed: 8,
  pending: 4
}

const DEFAULT_WEATHER: WeatherData = {
  current: {
    temp: 72,
    condition: 'Partly Cloudy',
    humidity: 45,
    windSpeed: 8,
    visibility: 10
  },
  forecast: [
    { day: 'Fri', high: 75, low: 52, condition: 'Sunny' },
    { day: 'Sat', high: 78, low: 55, condition: 'Clear' },
    { day: 'Sun', high: 73, low: 48, condition: 'Cloudy' }
  ]
}

// Demo component for page.tsx
export default function DashboardPageDemo() {
  return <DashboardPage />
}