'use client'

import { useState, useEffect } from 'react'
import { MapPin, Users, Calendar, MessageSquare, Settings, Menu, X, Mountain, Compass } from 'lucide-react'

interface Trip {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  memberCount: number
  status: 'planning' | 'confirmed' | 'completed'
}

interface QuickAction {
  id: string
  title: string
  icon: React.ReactNode
  description: string
  href: string
}

interface TripPlannerDashboardProps {
  trips?: Trip[]
  userName?: string
  onCreateTrip?: () => void
  onJoinTrip?: (tripId: string) => void
  isLoading?: boolean
}

export function TripPlannerDashboard({
  trips = DEFAULT_TRIPS,
  userName = 'Trail Explorer',
  onCreateTrip = () => console.log('Create trip'),
  onJoinTrip = () => console.log('Join trip'),
  isLoading = false
}: TripPlannerDashboardProps = {}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Plan New Trip',
      icon: <MapPin className="w-6 h-6" />,
      description: 'Start planning your next adventure',
      href: '/trips/new'
    },
    {
      id: '2',
      title: 'Find Group',
      icon: <Users className="w-6 h-6" />,
      description: 'Join existing trips in your area',
      href: '/groups'
    },
    {
      id: '3',
      title: 'Weather Check',
      icon: <Compass className="w-6 h-6" />,
      description: 'Check conditions for your routes',
      href: '/weather'
    },
    {
      id: '4',
      title: 'Group Chat',
      icon: <MessageSquare className="w-6 h-6" />,
      description: 'Connect with your trail buddies',
      href: '/chat'
    }
  ]

  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'planning':
        return 'bg-accent/20 text-accent border-accent/30 dark:bg-accent/20 dark:text-accent dark:border-accent/30'
      case 'confirmed':
        return 'bg-primary/20 text-primary border-primary/30 dark:bg-primary/20 dark:text-primary dark:border-primary/30'
      case 'completed':
        return 'bg-muted/20 text-mutedForeground border-border dark:bg-muted/20 dark:text-mutedForeground dark:border-border'
      default:
        return 'bg-muted/20 text-mutedForeground border-border dark:bg-muted/20 dark:text-mutedForeground dark:border-border'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-surface border border-border rounded-xl p-6 animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="h-6 bg-muted rounded w-3/4"></div>
            <div className="h-6 bg-muted rounded-full w-16"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-2/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-1/3"></div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-background dark:bg-background font-sans transition-colors duration-300">
      {/* Header */}
      <header className="bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Mountain className="w-8 h-8 text-primary transition-colors duration-300" />
              <h1 className="text-xl font-bold text-foreground">TrailPlan</h1>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <nav className="flex items-center gap-4">
                <a 
                  href="/trips" 
                  className="text-mutedForeground hover:text-foreground transition-all duration-150 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-2 py-1"
                >
                  Trips
                </a>
                <a 
                  href="/groups" 
                  className="text-mutedForeground hover:text-foreground transition-all duration-150 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-2 py-1"
                >
                  Groups
                </a>
                <a 
                  href="/weather" 
                  className="text-mutedForeground hover:text-foreground transition-all duration-150 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-2 py-1"
                >
                  Weather
                </a>
                <a 
                  href="/chat" 
                  className="text-mutedForeground hover:text-foreground transition-all duration-150 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-2 py-1"
                >
                  Chat
                </a>
              </nav>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primaryForeground text-sm font-medium">
                    {userName.charAt(0)}
                  </span>
                </div>
                <button
                  className="p-1 text-mutedForeground hover:text-foreground transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
                  aria-label="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-mutedForeground hover:text-foreground transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-surface border-t border-border">
            <div className="px-4 py-4 space-y-3">
              <a 
                href="/trips" 
                className="block text-mutedForeground hover:text-foreground transition-all duration-150 font-medium py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
              >
                Trips
              </a>
              <a 
                href="/groups" 
                className="block text-mutedForeground hover:text-foreground transition-all duration-150 font-medium py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
              >
                Groups
              </a>
              <a 
                href="/weather" 
                className="block text-mutedForeground hover:text-foreground transition-all duration-150 font-medium py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
              >
                Weather
              </a>
              <a 
                href="/chat" 
                className="block text-mutedForeground hover:text-foreground transition-all duration-150 font-medium py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
              >
                Chat
              </a>
              <div className="border-t border-border pt-3 mt-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primaryForeground text-sm font-medium">
                      {userName.charAt(0)}
                    </span>
                  </div>
                  <span className="text-foreground font-medium">{userName}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
            Welcome back, {userName.split(' ')[0]}!
          </h2>
          <p className="text-mutedForeground text-lg">
            Ready for your next off-road adventure?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => console.log(`Navigate to ${action.href}`)}
              className="bg-surface rounded-xl border border-border p-6 hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
              aria-label={`${action.title}: ${action.description}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="text-primary group-hover:text-primary/80 transition-colors duration-150">
                  {action.icon}
                </div>
                <h3 className="text-foreground font-semibold">{action.title}</h3>
              </div>
              <p className="text-mutedForeground text-sm">{action.description}</p>
            </button>
          ))}
        </div>

        {/* Recent Trips */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-foreground tracking-tight">Your Trips</h3>
            <button
              onClick={onCreateTrip}
              className="px-4 py-2 bg-primary text-primaryForeground rounded-lg hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 font-medium shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Create new trip"
            >
              New Trip
            </button>
          </div>

          {isLoading ? (
            <LoadingSkeleton />
          ) : trips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-surface rounded-xl border border-border p-6 hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={() => setSelectedTrip(trip)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedTrip(trip)
                    }
                  }}
                  aria-label={`View details for ${trip.name}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-foreground font-semibold text-lg group-hover:text-primary transition-colors duration-150">{trip.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(trip.status)} capitalize`}>
                      {trip.status}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-mutedForeground">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{trip.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-mutedForeground">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-mutedForeground">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{trip.memberCount} members</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onJoinTrip(trip.id)
                      }}
                      className="w-full px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 font-medium text-sm border border-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      aria-label={`View details for ${trip.name}`}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                <Mountain className="w-8 h-8 text-mutedForeground" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-2">No trips yet</h4>
              <p className="text-mutedForeground mb-6">Start planning your first off-road adventure!</p>
              <button
                onClick={onCreateTrip}
                className="px-6 py-3 bg-primary text-primaryForeground rounded-lg hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 font-medium shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Plan your first trip"
              >
                Plan Your First Trip
              </button>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-surface rounded-xl border border-border p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <div className="text-3xl font-bold text-primary mb-2">
              {trips.filter(t => t.status === 'completed').length}
            </div>
            <div className="text-mutedForeground text-sm">Completed Trips</div>
          </div>
          
          <div className="bg-surface rounded-xl border border-border p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <div className="text-3xl font-bold text-accent mb-2">
              {trips.filter(t => t.status === 'planning').length}
            </div>
            <div className="text-mutedForeground text-sm">Planning</div>
          </div>
          
          <div className="bg-surface rounded-xl border border-border p-6 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <div className="text-3xl font-bold text-secondary mb-2">
              {trips.reduce((sum, trip) => sum + trip.memberCount, 0)}
            </div>
            <div className="text-mutedForeground text-sm">Total Members</div>
          </div>
        </div>
      </main>
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
    endDate: '2024-03-17',
    memberCount: 8,
    status: 'confirmed'
  },
  {
    id: '2',
    name: 'Sierra Nevada Expedition',
    location: 'Lake Tahoe, CA',
    startDate: '2024-04-20',
    endDate: '2024-04-22',
    memberCount: 6,
    status: 'planning'
  },
  {
    id: '3',
    name: 'Colorado Rockies Trail',
    location: 'Aspen, Colorado',
    startDate: '2024-02-10',
    endDate: '2024-02-12',
    memberCount: 12,
    status: 'completed'
  }
]

// Demo component for page.tsx
export default function TripPlannerDashboardDemo() {
  return <TripPlannerDashboard />
}