'use client'

import { useState, useEffect } from 'react'
import { 
  MapPin, 
  Calendar, 
  Users, 
  MessageCircle, 
  Settings, 
  Plus,
  Cloud,
  Thermometer,
  Wind,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'

interface Trip {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  status: 'planning' | 'confirmed' | 'active' | 'completed'
  memberCount: number
  weatherCondition: 'sunny' | 'cloudy' | 'rainy' | 'snowy'
  temperature: number
  tasks: {
    pending: number
    completed: number
  }
  messages: number
}

interface WeatherData {
  condition: string
  temperature: number
  humidity: number
  windSpeed: number
  visibility: number
}

interface UserDashboardProps {
  userName?: string
  trips?: Trip[]
  weather?: WeatherData
  onCreateTrip?: () => void
  onViewTrip?: (tripId: string) => void
  onViewMessages?: () => void
}

export function UserDashboard({
  userName = 'Trail Explorer',
  trips = DEFAULT_TRIPS,
  weather = DEFAULT_WEATHER,
  onCreateTrip = () => console.log('Create trip'),
  onViewTrip = (id) => console.log('View trip:', id),
  onViewMessages = () => console.log('View messages')
}: UserDashboardProps = {}) {
  const [activeTab, setActiveTab] = useState<'trips' | 'weather' | 'tasks'>('trips')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'planning': return 'bg-accent/20 text-accent border-accent/30'
      case 'confirmed': return 'bg-primary/20 text-primary border-primary/30'
      case 'active': return 'bg-primary/20 text-primary border-primary/30'
      case 'completed': return 'bg-muted/20 text-mutedForeground border-border'
      default: return 'bg-muted/20 text-mutedForeground border-border'
    }
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return '☀️'
      case 'cloudy': return '☁️'
      case 'rainy': return '🌧️'
      case 'snowy': return '❄️'
      default: return '🌤️'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <div className="bg-surface/50 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primaryForeground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">OffRoad Planner</h1>
                <p className="text-sm text-mutedForeground">Welcome back, {userName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onViewMessages}
                className="p-2 text-mutedForeground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-150 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring/50"
                aria-label="View messages"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              <button
                className="p-2 text-mutedForeground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-150 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring/50"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-surface rounded-xl border border-border p-4 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{trips.length}</p>
                <p className="text-sm text-mutedForeground">Active Trips</p>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-border p-4 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {trips.reduce((sum, trip) => sum + trip.memberCount, 0)}
                </p>
                <p className="text-sm text-mutedForeground">Total Members</p>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-border p-4 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {trips.reduce((sum, trip) => sum + trip.tasks.pending, 0)}
                </p>
                <p className="text-sm text-mutedForeground">Pending Tasks</p>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-border p-4 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {trips.reduce((sum, trip) => sum + trip.messages, 0)}
                </p>
                <p className="text-sm text-mutedForeground">New Messages</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 bg-muted p-1 rounded-lg">
          {[
            { id: 'trips', label: 'My Trips', icon: MapPin },
            { id: 'weather', label: 'Weather', icon: Cloud },
            { id: 'tasks', label: 'Tasks', icon: CheckCircle }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring/50 ${
                activeTab === id
                  ? 'bg-primary text-primaryForeground shadow-md'
                  : 'text-mutedForeground hover:text-foreground hover:bg-surface'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        {activeTab === 'trips' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Your Trips</h2>
              <button
                onClick={onCreateTrip}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primaryForeground rounded-lg hover:bg-primary/90 transition-all duration-150 font-medium shadow-md hover:shadow-lg hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring/50"
              >
                <Plus className="w-4 h-4" />
                New Trip
              </button>
            </div>

            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-surface rounded-xl border border-border p-6 animate-pulse">
                    <div className="space-y-4">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : trips.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-mutedForeground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No trips yet</h3>
                <p className="text-mutedForeground text-sm">Get started by creating your first trip</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {trips.map((trip) => (
                  <div
                    key={trip.id}
                    onClick={() => onViewTrip(trip.id)}
                    className="bg-surface rounded-xl border border-border p-6 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer group hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {trip.name}
                        </h3>
                        <p className="text-sm text-mutedForeground flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {trip.location}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(trip.status)}`}>
                        {trip.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-mutedForeground mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {trip.memberCount}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-2xl">{getWeatherIcon(trip.weatherCondition)}</span>
                        <span className="text-foreground">{trip.temperature}°F</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-mutedForeground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {trip.tasks.pending}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {trip.messages}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'weather' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Current Weather</h2>
            
            <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{weather.temperature}°F</h3>
                  <p className="text-mutedForeground capitalize">{weather.condition}</p>
                  <p className="text-sm text-mutedForeground">
                    {currentTime.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-6xl">
                  {getWeatherIcon(weather.condition)}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Thermometer className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm text-mutedForeground">Humidity</p>
                  <p className="font-semibold text-foreground">{weather.humidity}%</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Wind className="w-6 h-6 text-secondary" />
                  </div>
                  <p className="text-sm text-mutedForeground">Wind</p>
                  <p className="font-semibold text-foreground">{weather.windSpeed} mph</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Eye className="w-6 h-6 text-accent" />
                  </div>
                  <p className="text-sm text-mutedForeground">Visibility</p>
                  <p className="font-semibold text-foreground">{weather.visibility} mi</p>
                </div>
              </div>
            </div>

            <div className="bg-accent/10 border border-accent/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <h4 className="font-medium text-accent">Weather Advisory</h4>
                  <p className="text-sm text-accent/80 mt-1">
                    Trail conditions may be muddy due to recent rainfall. Check local trail reports before heading out.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Upcoming Tasks</h2>
            
            {DEFAULT_TASKS.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-mutedForeground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No tasks yet</h3>
                <p className="text-mutedForeground text-sm">All caught up! Tasks will appear here when created.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {DEFAULT_TASKS.map((task) => (
                  <div
                    key={task.id}
                    className="bg-surface rounded-xl border border-border p-4 hover:border-border/80 transition-all duration-150 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          task.priority === 'high' ? 'bg-destructive' :
                          task.priority === 'medium' ? 'bg-accent' : 'bg-primary'
                        }`} />
                        <div>
                          <h4 className="font-medium text-foreground">{task.title}</h4>
                          <p className="text-sm text-mutedForeground">{task.trip} • Due {task.dueDate}</p>
                        </div>
                      </div>
                      <span className="text-sm text-mutedForeground">{task.assignee}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const DEFAULT_TRIPS: Trip[] = [
  {
    id: '1',
    name: 'Moab Adventure',
    location: 'Moab, Utah',
    startDate: '2024-03-15',
    endDate: '2024-03-18',
    status: 'confirmed',
    memberCount: 6,
    weatherCondition: 'sunny',
    temperature: 72,
    tasks: { pending: 3, completed: 8 },
    messages: 12
  },
  {
    id: '2',
    name: 'Desert Expedition',
    location: 'Joshua Tree, CA',
    startDate: '2024-04-02',
    endDate: '2024-04-05',
    status: 'planning',
    memberCount: 4,
    weatherCondition: 'cloudy',
    temperature: 68,
    tasks: { pending: 7, completed: 2 },
    messages: 5
  },
  {
    id: '3',
    name: 'Mountain Trail Run',
    location: 'Colorado Springs, CO',
    startDate: '2024-04-20',
    endDate: '2024-04-22',
    status: 'planning',
    memberCount: 8,
    weatherCondition: 'snowy',
    temperature: 45,
    tasks: { pending: 12, completed: 0 },
    messages: 8
  }
]

const DEFAULT_WEATHER: WeatherData = {
  condition: 'partly cloudy',
  temperature: 68,
  humidity: 45,
  windSpeed: 12,
  visibility: 10
}

const DEFAULT_TASKS = [
  {
    id: '1',
    title: 'Book campsite reservations',
    trip: 'Moab Adventure',
    dueDate: 'Mar 10',
    assignee: 'Sarah M.',
    priority: 'high' as const
  },
  {
    id: '2',
    title: 'Plan Saturday lunch menu',
    trip: 'Desert Expedition',
    dueDate: 'Mar 25',
    assignee: 'Mike R.',
    priority: 'medium' as const
  },
  {
    id: '3',
    title: 'Coordinate firewood pickup',
    trip: 'Mountain Trail Run',
    dueDate: 'Apr 15',
    assignee: 'Alex K.',
    priority: 'low' as const
  }
]

export default function UserDashboardDemo() {
  return <UserDashboard />
}