'use client'

import { useState, useEffect } from 'react'
import { 
  Mountain, 
  MapPin, 
  Users, 
  Calendar, 
  MessageCircle, 
  Settings,
  Plus,
  Search,
  Filter,
  Bell,
  User
} from 'lucide-react'

interface Trip {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  memberCount: number
  status: 'planning' | 'confirmed' | 'completed'
  image: string
}

interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  badge?: number
}

interface OffRoadPlannerProps {
  trips?: Trip[]
  currentUser?: {
    name: string
    avatar: string
  }
  onTripSelect?: (tripId: string) => void
  onCreateTrip?: () => void
}

export function OffRoadPlanner({
  trips = DEFAULT_TRIPS,
  currentUser = DEFAULT_USER,
  onTripSelect = (id) => console.log('Trip selected:', id),
  onCreateTrip = () => console.log('Create new trip')
}: OffRoadPlannerProps = {}) {
  const [activeTab, setActiveTab] = useState('trips')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const navigationItems: NavigationItem[] = [
    { id: 'trips', label: 'Trips', icon: Mountain, href: '/trips' },
    { id: 'locations', label: 'Locations', icon: MapPin, href: '/locations' },
    { id: 'group', label: 'Group', icon: Users, href: '/group' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, href: '/calendar' },
    { id: 'chat', label: 'Chat', icon: MessageCircle, href: '/chat', badge: 3 }
  ]

  const filteredTrips = trips.filter(trip =>
    trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'planning':
        return 'bg-accent/10 text-accent border-accent/20 dark:bg-accent/20 dark:text-accent dark:border-accent/30'
      case 'confirmed':
        return 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30'
      case 'completed':
        return 'bg-muted text-mutedForeground border-border dark:bg-muted dark:text-mutedForeground dark:border-border'
      default:
        return 'bg-muted text-mutedForeground border-border dark:bg-muted dark:text-mutedForeground dark:border-border'
    }
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background font-sans">
      {/* Header */}
      <header className="bg-surface/80 dark:bg-surface/80 backdrop-blur-sm border-b border-border dark:border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 dark:from-primary dark:to-primary/80 rounded-lg flex items-center justify-center">
                <Mountain className="w-5 h-5 text-primaryForeground dark:text-primaryForeground" />
              </div>
              <h1 className="text-xl font-bold text-foreground dark:text-foreground">TrailPlan</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                className="relative p-2 text-mutedForeground dark:text-mutedForeground hover:text-foreground dark:hover:text-foreground hover:bg-muted dark:hover:bg-muted rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background active:scale-95"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive dark:bg-destructive rounded-full"></span>
              </button>
              
              <button 
                className="flex items-center gap-2 p-2 text-mutedForeground dark:text-mutedForeground hover:text-foreground dark:hover:text-foreground hover:bg-muted dark:hover:bg-muted rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background active:scale-95"
                aria-label="User menu"
              >
                <div className="w-6 h-6 bg-primary dark:bg-primary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primaryForeground dark:text-primaryForeground" />
                </div>
                <span className="hidden sm:block text-sm font-medium">{currentUser.name}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Actions */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-mutedForeground dark:text-mutedForeground" />
                <input
                  type="text"
                  placeholder="Search trips or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface dark:bg-surface border border-border dark:border-border rounded-lg text-foreground dark:text-foreground placeholder-mutedForeground dark:placeholder-mutedForeground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background active:scale-95 ${
                  showFilters 
                    ? 'bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground shadow-md hover:shadow-lg' 
                    : 'bg-surface dark:bg-surface text-mutedForeground dark:text-mutedForeground hover:text-foreground dark:hover:text-foreground hover:bg-muted dark:hover:bg-muted border border-border dark:border-border'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>
              
              <button
                onClick={onCreateTrip}
                className="px-4 py-2.5 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:bg-primary/90 dark:hover:bg-primary/90 transition-all duration-150 font-medium text-sm shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Trip</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-muted/50 dark:bg-muted/50 p-1 rounded-lg">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-md font-medium text-sm transition-all duration-150 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-muted dark:focus:ring-offset-muted active:scale-95 ${
                    activeTab === item.id
                      ? 'bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground shadow-md'
                      : 'text-mutedForeground dark:text-mutedForeground hover:text-foreground dark:hover:text-foreground hover:bg-background dark:hover:bg-background'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive dark:bg-destructive text-destructiveForeground dark:text-destructiveForeground text-xs rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-surface dark:bg-surface border border-border dark:border-border rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-muted dark:bg-muted"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted dark:bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted dark:bg-muted rounded w-1/2"></div>
                  <div className="flex justify-between">
                    <div className="h-6 bg-muted dark:bg-muted rounded w-16"></div>
                    <div className="h-4 bg-muted dark:bg-muted rounded w-8"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Trip Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => onTripSelect(trip.id)}
                  className="bg-surface dark:bg-surface backdrop-blur-sm border border-border dark:border-border rounded-xl overflow-hidden hover:border-ring dark:hover:border-ring transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background"
                  tabIndex={0}
                  role="button"
                  aria-label={`View trip ${trip.name}`}
                >
                  <div className="aspect-video bg-gradient-to-br from-primary/20 dark:from-primary/20 to-primary/30 dark:to-primary/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-primary dark:group-hover:text-primary transition-colors">
                        {trip.name}
                      </h3>
                      <div className="flex items-center gap-1 text-white/80">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{trip.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(trip.status)}`}>
                        {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                      </span>
                      <div className="flex items-center gap-1 text-mutedForeground dark:text-mutedForeground">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{trip.memberCount}</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-mutedForeground dark:text-mutedForeground">
                      <div className="flex items-center gap-1 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="text-xs">
                        {Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredTrips.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted dark:bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Mountain className="w-8 h-8 text-mutedForeground dark:text-mutedForeground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-2">No trips found</h3>
                <p className="text-mutedForeground dark:text-mutedForeground mb-6">
                  {searchQuery ? 'Try adjusting your search terms' : 'Start planning your first off-road adventure'}
                </p>
                <button
                  onClick={onCreateTrip}
                  className="px-6 py-3 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:bg-primary/90 dark:hover:bg-primary/90 transition-all duration-150 font-medium shadow-md hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background"
                >
                  Plan Your First Trip
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface/90 dark:bg-surface/90 backdrop-blur-sm border-t border-border dark:border-border md:hidden">
        <div className="flex items-center justify-around py-2">
          {navigationItems.slice(0, 5).map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center gap-1 p-2 min-h-[44px] min-w-[44px] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-surface active:scale-95 ${
                  activeTab === item.id
                    ? 'text-primary dark:text-primary'
                    : 'text-mutedForeground dark:text-mutedForeground hover:text-foreground dark:hover:text-foreground'
                }`}
                aria-label={item.label}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
                {item.badge && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-destructive dark:bg-destructive text-destructiveForeground dark:text-destructiveForeground text-xs rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

// Mock data
const DEFAULT_TRIPS: Trip[] = [
  {
    id: '1',
    name: 'Moab Desert Adventure',
    location: 'Moab, Utah',
    startDate: '2024-03-15',
    endDate: '2024-03-18',
    memberCount: 8,
    status: 'confirmed',
    image: '/api/placeholder/400/240'
  },
  {
    id: '2',
    name: 'Sierra Nevada Expedition',
    location: 'California',
    startDate: '2024-04-22',
    endDate: '2024-04-25',
    memberCount: 6,
    status: 'planning',
    image: '/api/placeholder/400/240'
  },
  {
    id: '3',
    name: 'Colorado Rockies Trail',
    location: 'Colorado',
    startDate: '2024-02-10',
    endDate: '2024-02-12',
    memberCount: 4,
    status: 'completed',
    image: '/api/placeholder/400/240'
  }
]

const DEFAULT_USER = {
  name: 'Alex Chen',
  avatar: '/api/placeholder/32/32'
}

// Demo component for page.tsx
export default function OffRoadPlannerDemo() {
  return <OffRoadPlanner />
}