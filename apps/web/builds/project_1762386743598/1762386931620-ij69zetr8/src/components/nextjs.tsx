'use client'

import { useState, useEffect } from 'react'
import { MapPin, Users, Calendar, MessageCircle, Cloud, CheckCircle, Plus, Settings, Bell, Search, Filter, ChevronRight, Star, Clock, User, Utensils, Flame, Tent, Navigation, AlertCircle, Loader2 } from 'lucide-react'

interface Location {
  id: string
  name: string
  coordinates: { lat: number; lng: number }
  difficulty: 'Easy' | 'Moderate' | 'Hard'
  rating: number
  distance: string
  terrain: string
  saved: boolean
}

interface Trip {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  participants: number
  status: 'Planning' | 'Confirmed' | 'In Progress' | 'Completed'
  weather: string
  tasks: Task[]
}

interface Task {
  id: string
  title: string
  assignee: string
  category: 'Food' | 'Equipment' | 'Setup' | 'Safety'
  completed: boolean
  dueDate: string
}

interface GroupMember {
  id: string
  name: string
  avatar: string
  status: 'Confirmed' | 'Pending' | 'Declined'
  role: string
}

interface Message {
  id: string
  sender: string
  content: string
  timestamp: string
  avatar: string
}

export function OffroadTripPlanner() {
  const [activeTab, setActiveTab] = useState('discover')
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [locations, setLocations] = useState<Location[]>(mockLocations)
  const [trips, setTrips] = useState<Trip[]>(mockTrips)
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleLocationSave = (locationId: string) => {
    setLocations(prev => prev.map(loc => 
      loc.id === locationId ? { ...loc, saved: !loc.saved } : loc
    ))
  }

  const sendMessage = () => {
    if (!newMessage.trim()) return
    
    const message: Message = {
      id: Date.now().toString(),
      sender: 'You',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: '/api/placeholder/32/32'
    }
    
    setMessages(prev => [...prev, message])
    setNewMessage('')
  }

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.terrain.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background dark:bg-background text-foreground dark:text-foreground font-sans">
      {/* Header */}
      <header className="bg-surface/80 dark:bg-surface/80 backdrop-blur-sm border-b border-border dark:border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary dark:bg-primary rounded-lg flex items-center justify-center">
                <Navigation className="w-5 h-5 text-primaryForeground dark:text-primaryForeground" />
              </div>
              <h1 className="text-xl font-bold text-foreground dark:text-foreground">TrailPlan</h1>
            </div>
            <div className="flex items-center gap-3">
              <button 
                className="p-2 text-mutedForeground dark:text-mutedForeground hover:text-foreground dark:hover:text-foreground transition-colors duration-150 rounded-lg hover:bg-muted dark:hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
              </button>
              <button 
                className="p-2 text-mutedForeground dark:text-mutedForeground hover:text-foreground dark:hover:text-foreground transition-colors duration-150 rounded-lg hover:bg-muted dark:hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface/95 dark:bg-surface/95 backdrop-blur-sm border-t border-border dark:border-border z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-around h-16">
            {[
              { id: 'discover', icon: MapPin, label: 'Discover' },
              { id: 'trips', icon: Calendar, label: 'Trips' },
              { id: 'group', icon: Users, label: 'Group' },
              { id: 'chat', icon: MessageCircle, label: 'Chat' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 p-2 min-w-[44px] min-h-[44px] transition-all duration-150 rounded-lg hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-surface ${
                  activeTab === tab.id 
                    ? 'text-primary dark:text-primary bg-primary/10 dark:bg-primary/10' 
                    : 'text-mutedForeground dark:text-mutedForeground hover:text-foreground dark:hover:text-foreground hover:bg-muted dark:hover:bg-muted'
                }`}
                aria-label={tab.label}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pb-20 pt-6">
        {activeTab === 'discover' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Search and Filters */}
            <div className="mb-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mutedForeground dark:text-mutedForeground w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search trails, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface dark:bg-surface border border-border dark:border-border rounded-lg text-foreground dark:text-foreground placeholder-mutedForeground dark:placeholder-mutedForeground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-150"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-150 font-medium text-sm hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background ${
                    showFilters 
                      ? 'bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground shadow-md' 
                      : 'bg-surface dark:bg-surface text-foreground dark:text-foreground hover:bg-muted dark:hover:bg-muted border border-border dark:border-border'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
                <div className="flex gap-2 overflow-x-auto">
                  {['All', 'Easy', 'Moderate', 'Hard'].map(filter => (
                    <button
                      key={filter}
                      className="px-3 py-1 bg-surface dark:bg-surface text-foreground dark:text-foreground rounded-full text-sm font-medium whitespace-nowrap hover:bg-muted dark:hover:bg-muted transition-all duration-150 border border-border dark:border-border hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background"
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="rounded-lg bg-destructive/10 dark:bg-destructive/10 border border-destructive/20 dark:border-destructive/20 p-4 mb-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive dark:text-destructive" />
                  <p className="text-sm text-destructive dark:text-destructive">{error}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-4 animate-pulse">
                    <div className="h-4 bg-muted dark:bg-muted rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-muted dark:bg-muted rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-muted dark:bg-muted rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : filteredLocations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted dark:bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-mutedForeground dark:text-mutedForeground" />
                </div>
                <h3 className="text-lg font-medium text-foreground dark:text-foreground mb-2">No locations found</h3>
                <p className="text-mutedForeground dark:text-mutedForeground text-sm">Try adjusting your search or filters</p>
              </div>
            ) : (
              /* Locations Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLocations.map(location => (
                  <div
                    key={location.id}
                    className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-4 hover:border-ring/50 dark:hover:border-ring/50 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground dark:text-foreground mb-1">{location.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-mutedForeground dark:text-mutedForeground">
                          <Star className="w-4 h-4 text-accent dark:text-accent fill-current" />
                          <span>{location.rating}</span>
                          <span>•</span>
                          <span>{location.distance}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleLocationSave(location.id)}
                        className={`p-2 rounded-lg transition-all duration-150 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-surface ${
                          location.saved 
                            ? 'bg-accent dark:bg-accent text-accentForeground dark:text-accentForeground shadow-md' 
                            : 'bg-muted dark:bg-muted text-mutedForeground dark:text-mutedForeground hover:bg-secondary dark:hover:bg-secondary hover:text-secondaryForeground dark:hover:text-secondaryForeground'
                        }`}
                        aria-label={location.saved ? 'Remove from saved' : 'Save location'}
                      >
                        <Star className={`w-4 h-4 ${location.saved ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    
                    <div className="mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        location.difficulty === 'Easy' 
                          ? 'bg-primary/10 dark:bg-primary/10 text-primary dark:text-primary border-primary/20 dark:border-primary/20'
                          : location.difficulty === 'Moderate'
                          ? 'bg-accent/10 dark:bg-accent/10 text-accent dark:text-accent border-accent/20 dark:border-accent/20'
                          : 'bg-destructive/10 dark:bg-destructive/10 text-destructive dark:text-destructive border-destructive/20 dark:border-destructive/20'
                      }`}>
                        {location.difficulty}
                      </span>
                    </div>
                    
                    <p className="text-mutedForeground dark:text-mutedForeground text-sm mb-4">{location.terrain}</p>
                    
                    <button className="w-full px-4 py-2 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:bg-primary/90 dark:hover:bg-primary/90 transition-all duration-150 font-medium text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-surface">
                      Plan Trip Here
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'trips' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground dark:text-foreground">Your Trips</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:bg-primary/90 dark:hover:bg-primary/90 transition-all duration-150 font-medium text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background">
                <Plus className="w-4 h-4" />
                New Trip
              </button>
            </div>

            {trips.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted dark:bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-mutedForeground dark:text-mutedForeground" />
                </div>
                <h3 className="text-lg font-medium text-foreground dark:text-foreground mb-2">No trips yet</h3>
                <p className="text-mutedForeground dark:text-mutedForeground text-sm">Get started by planning your first adventure</p>
              </div>
            ) : (
              <div className="space-y-4">
                {trips.map(trip => (
                  <div
                    key={trip.id}
                    className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 hover:border-ring/50 dark:hover:border-ring/50 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-2">{trip.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-mutedForeground dark:text-mutedForeground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{trip.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{trip.startDate} - {trip.endDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{trip.participants} people</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        trip.status === 'Planning' 
                          ? 'bg-secondary/10 dark:bg-secondary/10 text-secondary dark:text-secondary border-secondary/20 dark:border-secondary/20'
                          : trip.status === 'Confirmed'
                          ? 'bg-primary/10 dark:bg-primary/10 text-primary dark:text-primary border-primary/20 dark:border-primary/20'
                          : trip.status === 'In Progress'
                          ? 'bg-accent/10 dark:bg-accent/10 text-accent dark:text-accent border-accent/20 dark:border-accent/20'
                          : 'bg-muted/10 dark:bg-muted/10 text-mutedForeground dark:text-mutedForeground border-border dark:border-border'
                      }`}>
                        {trip.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-muted/50 dark:bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-mutedForeground dark:text-mutedForeground text-xs mb-1">
                          <Cloud className="w-3 h-3" />
                          Weather
                        </div>
                        <div className="text-foreground dark:text-foreground font-medium">{trip.weather}</div>
                      </div>
                      <div className="bg-muted/50 dark:bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-mutedForeground dark:text-mutedForeground text-xs mb-1">
                          <CheckCircle className="w-3 h-3" />
                          Tasks
                        </div>
                        <div className="text-foreground dark:text-foreground font-medium">
                          {trip.tasks.filter(t => t.completed).length}/{trip.tasks.length}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedTrip(trip)}
                      className="flex items-center gap-2 text-primary dark:text-primary hover:text-primary/80 dark:hover:text-primary/80 transition-colors duration-150 font-medium text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-surface rounded-lg px-2 py-1"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'group' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground dark:text-foreground">Group Members</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:bg-primary/90 dark:hover:bg-primary/90 transition-all duration-150 font-medium text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background">
                <Plus className="w-4 h-4" />
                Invite
              </button>
            </div>

            <div className="space-y-4 mb-8">
              {mockGroupMembers.map(member => (
                <div
                  key={member.id}
                  className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-4 hover:border-ring/50 dark:hover:border-ring/50 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted dark:bg-muted rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-mutedForeground dark:text-mutedForeground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground dark:text-foreground">{member.name}</h3>
                      <p className="text-mutedForeground dark:text-mutedForeground text-sm">{member.role}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      member.status === 'Confirmed' 
                        ? 'bg-primary/10 dark:bg-primary/10 text-primary dark:text-primary border-primary/20 dark:border-primary/20'
                        : member.status === 'Pending'
                        ? 'bg-accent/10 dark:bg-accent/10 text-accent dark:text-accent border-accent/20 dark:border-accent/20'
                        : 'bg-destructive/10 dark:bg-destructive/10 text-destructive dark:text-destructive border-destructive/20 dark:border-destructive/20'
                    }`}>
                      {member.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Task Assignment */}
            <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-4">Task Assignments</h3>
              <div className="space-y-3">
                {mockTasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-muted/50 dark:bg-muted/50 rounded-lg hover:bg-muted dark:hover:bg-muted transition-colors duration-150"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        task.category === 'Food' ? 'bg-accent/20 dark:bg-accent/20 text-accent dark:text-accent' :
                        task.category === 'Equipment' ? 'bg-secondary/20 dark:bg-secondary/20 text-secondary dark:text-secondary' :
                        task.category === 'Setup' ? 'bg-primary/20 dark:bg-primary/20 text-primary dark:text-primary' :
                        'bg-destructive/20 dark:bg-destructive/20 text-destructive dark:text-destructive'
                      }`}>
                        {task.category === 'Food' ? <Utensils className="w-4 h-4" /> :
                         task.category === 'Equipment' ? <Tent className="w-4 h-4" /> :
                         task.category === 'Setup' ? <Settings className="w-4 h-4" /> :
                         <Flame className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-foreground dark:text-foreground font-medium">{task.title}</div>
                        <div className="text-mutedForeground dark:text-mutedForeground text-sm">Assigned to {task.assignee}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-mutedForeground dark:text-mutedForeground text-sm">{task.dueDate}</span>
                      <button
                        className={`w-5 h-5 rounded border-2 transition-all duration-150 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-muted dark:focus:ring-offset-muted ${
                          task.completed 
                            ? 'bg-primary dark:bg-primary border-primary dark:border-primary' 
                            : 'border-border dark:border-border hover:border-primary dark:hover:border-primary'
                        }`}
                        aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {task.completed && <CheckCircle className="w-3 h-3 text-primaryForeground dark:text-primaryForeground" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border h-[calc(100vh-200px)] flex flex-col shadow-sm">
              {/* Chat Header */}
              <div className="p-4 border-b border-border dark:border-border">
                <h2 className="text-lg font-semibold text-foreground dark:text-foreground">Group Chat</h2>
                <p className="text-mutedForeground dark:text-mutedForeground text-sm">5 members online</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.sender === 'You' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className="w-8 h-8 bg-muted dark:bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-mutedForeground dark:text-mutedForeground" />
                    </div>
                    <div className={`max-w-xs lg:max-w-md ${message.sender === 'You' ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground dark:text-foreground">{message.sender}</span>
                        <span className="text-xs text-mutedForeground dark:text-mutedForeground">{message.timestamp}</span>
                      </div>
                      <div className={`p-3 rounded-lg transition-all duration-150 hover:scale-[1.02] ${
                        message.sender === 'You' 
                          ? 'bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground shadow-md' 
                          : 'bg-muted dark:bg-muted text-foreground dark:text-foreground'
                      }`}>
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-border dark:border-border">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1 px-4 py-2 bg-muted dark:bg-muted border border-border dark:border-border rounded-lg text-foreground dark:text-foreground placeholder-mutedForeground dark:placeholder-mutedForeground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-150"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:bg-primary/90 dark:hover:bg-primary/90 disabled:bg-muted dark:disabled:bg-muted disabled:text-mutedForeground dark:disabled:text-mutedForeground disabled:cursor-not-allowed transition-all duration-150 font-medium shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-surface"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// Mock Data
const mockLocations: Location[] = [
  {
    id: '1',
    name: 'Moab Desert Trail',
    coordinates: { lat: 38.5733, lng: -109.5498 },
    difficulty: 'Moderate',
    rating: 4.8,
    distance: '12.5 miles',
    terrain: 'Red rock formations, desert landscape',
    saved: false
  },
  {
    id: '2',
    name: 'Black Hills Adventure',
    coordinates: { lat: 43.8791, lng: -103.4591 },
    difficulty: 'Hard',
    rating: 4.6,
    distance: '18.2 miles',
    terrain: 'Mountain trails, forest paths',
    saved: true
  },
  {
    id: '3',
    name: 'Sedona Red Rocks',
    coordinates: { lat: 34.8697, lng: -111.7610 },
    difficulty: 'Easy',
    rating: 4.9,
    distance: '8.3 miles',
    terrain: 'Scenic red rock formations',
    saved: false
  }
]

const mockTrips: Trip[] = [
  {
    id: '1',
    name: 'Moab Weekend Adventure',
    location: 'Moab, Utah',
    startDate: 'Mar 15',
    endDate: 'Mar 17',
    participants: 6,
    status: 'Planning',
    weather: '72°F Sunny',
    tasks: [
      { id: '1', title: 'Saturday Lunch', assignee: 'Sarah', category: 'Food', completed: false, dueDate: 'Mar 15' },
      { id: '2', title: 'Firewood Collection', assignee: 'Mike', category: 'Setup', completed: true, dueDate: 'Mar 15' }
    ]
  },
  {
    id: '2',
    name: 'Black Hills Expedition',
    location: 'South Dakota',
    startDate: 'Apr 5',
    endDate: 'Apr 8',
    participants: 8,
    status: 'Confirmed',
    weather: '65°F Partly Cloudy',
    tasks: [
      { id: '3', title: 'Camping Equipment', assignee: 'John', category: 'Equipment', completed: false, dueDate: 'Apr 5' }
    ]
  }
]

const mockGroupMembers: GroupMember[] = [
  { id: '1', name: 'Sarah Johnson', avatar: '', status: 'Confirmed', role: 'Trip Leader' },
  { id: '2', name: 'Mike Chen', avatar: '', status: 'Confirmed', role: 'Navigator' },
  { id: '3', name: 'Emily Davis', avatar: '', status: 'Pending', role: 'Cook' },
  { id: '4', name: 'John Smith', avatar: '', status: 'Confirmed', role: 'Safety Officer' }
]

const mockTasks: Task[] = [
  { id: '1', title: 'Saturday Lunch Prep', assignee: 'Sarah', category: 'Food', completed: true, dueDate: 'Mar 15' },
  { id: '2', title: 'Firewood Collection', assignee: 'Mike', category: 'Setup', completed: false, dueDate: 'Mar 15' },
  { id: '3', title: 'First Aid Kit Check', assignee: 'John', category: 'Safety', completed: false, dueDate: 'Mar 14' },
  { id: '4', title: 'Tent Setup', assignee: 'Emily', category: 'Equipment', completed: true, dueDate: 'Mar 15' }
]

const mockMessages: Message[] = [
  {
    id: '1',
    sender: 'Sarah',
    content: 'Hey everyone! Just confirmed the campsite for this weekend. We\'re all set!',
    timestamp: '10:30 AM',
    avatar: ''
  },
  {
    id: '2',
    sender: 'Mike',
    content: 'Awesome! I\'ll bring the portable grill and extra propane.',
    timestamp: '10:32 AM',
    avatar: ''
  },
  {
    id: '3',
    sender: 'Emily',
    content: 'Should I bring vegetarian options for lunch on Saturday?',
    timestamp: '10:35 AM',
    avatar: ''
  },
  {
    id: '4',
    sender: 'John',
    content: 'Yes please! Also, weather looks perfect for the weekend 🌞',
    timestamp: '10:37 AM',
    avatar: ''
  }
]

export default function OffroadTripPlannerDemo() {
  return <OffroadTripPlanner />
}