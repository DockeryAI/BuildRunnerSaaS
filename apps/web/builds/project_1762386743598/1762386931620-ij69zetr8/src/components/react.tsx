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
  Settings,
  Cloud,
  Sun,
  CloudRain,
  Navigation,
  Tent,
  Mountain,
  AlertCircle
} from 'lucide-react'

interface Trip {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  status: 'planning' | 'confirmed' | 'completed'
  memberCount: number
  weatherForecast: string
}

interface Task {
  id: string
  title: string
  assignee: string
  category: 'food' | 'gear' | 'logistics'
  completed: boolean
  dueDate: string
}

interface Message {
  id: string
  sender: string
  content: string
  timestamp: string
}

interface Meal {
  id: string
  name: string
  day: string
  time: 'breakfast' | 'lunch' | 'dinner'
  assignee: string
}

interface OffRoadTripPlannerProps {
  initialTrips?: Trip[]
  userId?: string
  userName?: string
}

export function OffRoadTripPlanner({
  initialTrips = DEFAULT_TRIPS,
  userId = 'user-1',
  userName = 'Trail Explorer'
}: OffRoadTripPlannerProps = {}) {
  const [activeTab, setActiveTab] = useState<'trips' | 'tasks' | 'chat' | 'meals'>('trips')
  const [trips, setTrips] = useState<Trip[]>(initialTrips)
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS)
  const [messages, setMessages] = useState<Message[]>(DEFAULT_MESSAGES)
  const [meals, setMeals] = useState<Meal[]>(DEFAULT_MEALS)
  const [newMessage, setNewMessage] = useState('')
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(trips[0] || null)
  const [showNewTripForm, setShowNewTripForm] = useState(false)
  const [newTripName, setNewTripName] = useState('')
  const [newTripLocation, setNewTripLocation] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        sender: userName,
        content: newMessage,
        timestamp: new Date().toLocaleTimeString()
      }
      setMessages(prev => [...prev, message])
      setNewMessage('')
    }
  }

  const handleCreateTrip = () => {
    if (newTripName.trim() && newTripLocation.trim()) {
      setError('')
      const trip: Trip = {
        id: Date.now().toString(),
        name: newTripName,
        location: newTripLocation,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        status: 'planning',
        memberCount: 1,
        weatherForecast: 'sunny'
      }
      setTrips(prev => [...prev, trip])
      setSelectedTrip(trip)
      setShowNewTripForm(false)
      setNewTripName('')
      setNewTripLocation('')
    } else {
      setError('Please fill in all required fields')
    }
  }

  const toggleTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  const getWeatherIcon = (forecast: string) => {
    switch (forecast) {
      case 'sunny': return <Sun className="w-4 h-4 text-accent" />
      case 'cloudy': return <Cloud className="w-4 h-4 text-mutedForeground dark:text-mutedForeground" />
      case 'rainy': return <CloudRain className="w-4 h-4 text-primary dark:text-primary" />
      default: return <Sun className="w-4 h-4 text-accent" />
    }
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background font-sans">
      {/* Header */}
      <div className="bg-surface/90 dark:bg-surface/90 backdrop-blur-sm border-b border-border dark:border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary dark:bg-primary rounded-lg flex items-center justify-center shadow-sm">
                <Mountain className="w-5 h-5 text-primaryForeground dark:text-primaryForeground" />
              </div>
              <h1 className="text-xl font-bold text-foreground dark:text-foreground">TrailPlan</h1>
            </div>
            <button 
              className="p-2 text-mutedForeground dark:text-mutedForeground hover:text-foreground dark:hover:text-foreground transition-colors duration-150 rounded-md hover:bg-muted dark:hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Trip Selection */}
        {selectedTrip && (
          <div className="mb-6">
            <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground dark:text-foreground mb-2">{selectedTrip.name}</h2>
                  <div className="flex items-center gap-4 text-sm text-mutedForeground dark:text-mutedForeground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedTrip.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedTrip.startDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {selectedTrip.memberCount} members
                    </div>
                    <div className="flex items-center gap-1">
                      {getWeatherIcon(selectedTrip.weatherForecast)}
                      {selectedTrip.weatherForecast}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    selectedTrip.status === 'planning' 
                      ? 'bg-accent/10 dark:bg-accent/10 text-accent dark:text-accent border-accent/30 dark:border-accent/30'
                      : selectedTrip.status === 'confirmed'
                      ? 'bg-primary/10 dark:bg-primary/10 text-primary dark:text-primary border-primary/30 dark:border-primary/30'
                      : 'bg-muted dark:bg-muted text-mutedForeground dark:text-mutedForeground border-border dark:border-border'
                  }`}>
                    {selectedTrip.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="bg-surface/40 dark:bg-surface/40 backdrop-blur-sm rounded-xl border border-border dark:border-border p-1">
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: 'trips', label: 'Trips', icon: Navigation },
                { id: 'tasks', label: 'Tasks', icon: CheckSquare },
                { id: 'chat', label: 'Chat', icon: MessageCircle },
                { id: 'meals', label: 'Meals', icon: UtensilsCrossed }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background ${
                    activeTab === id
                      ? 'bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground shadow-md'
                      : 'text-mutedForeground dark:text-mutedForeground hover:text-foreground dark:hover:text-foreground hover:bg-muted/50 dark:hover:bg-muted/50'
                  }`}
                  aria-label={`Switch to ${label} tab`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Trips Tab */}
          {activeTab === 'trips' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground dark:text-foreground">Your Trips</h3>
                <button
                  onClick={() => setShowNewTripForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 font-medium shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background"
                  aria-label="Create new trip"
                >
                  <Plus className="w-4 h-4" />
                  New Trip
                </button>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 dark:bg-destructive/10 border border-destructive/20 dark:border-destructive/20 p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive dark:text-destructive" />
                    <p className="text-sm text-destructive dark:text-destructive">{error}</p>
                  </div>
                </div>
              )}

              {showNewTripForm && (
                <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 shadow-md">
                  <h4 className="text-lg font-semibold text-foreground dark:text-foreground mb-4">Create New Trip</h4>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Trip name"
                      value={newTripName}
                      onChange={(e) => setNewTripName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-background dark:bg-background border border-border dark:border-border rounded-lg text-foreground dark:text-foreground placeholder-mutedForeground dark:placeholder-mutedForeground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-200"
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={newTripLocation}
                      onChange={(e) => setNewTripLocation(e.target.value)}
                      className="w-full px-4 py-2.5 bg-background dark:bg-background border border-border dark:border-border rounded-lg text-foreground dark:text-foreground placeholder-mutedForeground dark:placeholder-mutedForeground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-200"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleCreateTrip}
                        className="px-4 py-2 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 font-medium focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background"
                      >
                        Create Trip
                      </button>
                      <button
                        onClick={() => {
                          setShowNewTripForm(false)
                          setError('')
                        }}
                        className="px-4 py-2 bg-secondary dark:bg-secondary text-secondaryForeground dark:text-secondaryForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 font-medium focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {trips.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted dark:bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Mountain className="w-8 h-8 text-mutedForeground dark:text-mutedForeground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground dark:text-foreground mb-2">No trips yet</h3>
                  <p className="text-mutedForeground dark:text-mutedForeground text-sm">Get started by creating your first adventure</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {trips.map((trip) => (
                    <div
                      key={trip.id}
                      onClick={() => setSelectedTrip(trip)}
                      className={`bg-surface dark:bg-surface rounded-xl border p-6 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background ${
                        selectedTrip?.id === trip.id
                          ? 'border-ring dark:border-ring bg-primary/5 dark:bg-primary/5'
                          : 'border-border dark:border-border hover:border-ring/30 dark:hover:border-ring/30'
                      }`}
                      tabIndex={0}
                      role="button"
                      aria-label={`Select trip ${trip.name}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-foreground dark:text-foreground">{trip.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          trip.status === 'planning' 
                            ? 'bg-accent/20 dark:bg-accent/20 text-accent dark:text-accent'
                            : trip.status === 'confirmed'
                            ? 'bg-primary/20 dark:bg-primary/20 text-primary dark:text-primary'
                            : 'bg-muted dark:bg-muted text-mutedForeground dark:text-mutedForeground'
                        }`}>
                          {trip.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-mutedForeground dark:text-mutedForeground">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {trip.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(trip.startDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {trip.memberCount} members
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground dark:text-foreground">Trip Tasks</h3>
              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted dark:bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                    <CheckSquare className="w-8 h-8 text-mutedForeground dark:text-mutedForeground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground dark:text-foreground mb-2">No tasks yet</h3>
                  <p className="text-mutedForeground dark:text-mutedForeground text-sm">Tasks will appear here when you create them</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-4 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleTaskComplete(task.id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-150 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background ${
                            task.completed
                              ? 'bg-primary dark:bg-primary border-primary dark:border-primary'
                              : 'border-border dark:border-border hover:border-primary dark:hover:border-primary'
                          }`}
                          aria-label={`Mark task ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                        >
                          {task.completed && <CheckSquare className="w-3 h-3 text-primaryForeground dark:text-primaryForeground" />}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-medium transition-all duration-150 ${task.completed ? 'text-mutedForeground dark:text-mutedForeground line-through' : 'text-foreground dark:text-foreground'}`}>
                              {task.title}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              task.category === 'food'
                                ? 'bg-accent/20 dark:bg-accent/20 text-accent dark:text-accent'
                                : task.category === 'gear'
                                ? 'bg-primary/20 dark:bg-primary/20 text-primary dark:text-primary'
                                : 'bg-secondary/20 dark:bg-secondary/20 text-secondary dark:text-secondary'
                            }`}>
                              {task.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-mutedForeground dark:text-mutedForeground">
                            <span>Assigned to: {task.assignee}</span>
                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground dark:text-foreground">Group Chat</h3>
              <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border shadow-md">
                <div className="p-4 border-b border-border dark:border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary dark:bg-primary rounded-full"></div>
                    <span className="text-sm text-mutedForeground dark:text-mutedForeground">4 members online</span>
                  </div>
                </div>
                <div className="h-64 overflow-y-auto p-4 space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === userName ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs px-3 py-2 rounded-lg transition-all duration-150 ${
                        message.sender === userName
                          ? 'bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground'
                          : 'bg-muted dark:bg-muted text-foreground dark:text-foreground'
                      }`}>
                        <div className="text-xs opacity-75 mb-1">{message.sender}</div>
                        <div className="text-sm">{message.content}</div>
                        <div className="text-xs opacity-75 mt-1">{message.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-border dark:border-border">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 px-3 py-2 bg-background dark:bg-background border border-border dark:border-border rounded-lg text-foreground dark:text-foreground placeholder-mutedForeground dark:placeholder-mutedForeground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-200"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Meals Tab */}
          {activeTab === 'meals' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground dark:text-foreground">Meal Planning</h3>
              {meals.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted dark:bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                    <UtensilsCrossed className="w-8 h-8 text-mutedForeground dark:text-mutedForeground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground dark:text-foreground mb-2">No meals planned</h3>
                  <p className="text-mutedForeground dark:text-mutedForeground text-sm">Start planning your trip meals</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {meals.map((meal) => (
                    <div
                      key={meal.id}
                      className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-4 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-foreground dark:text-foreground">{meal.name}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-mutedForeground dark:text-mutedForeground">
                            <span className="capitalize">{meal.day} {meal.time}</span>
                            <span>Prepared by: {meal.assignee}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          meal.time === 'breakfast'
                            ? 'bg-accent/20 dark:bg-accent/20 text-accent dark:text-accent'
                            : meal.time === 'lunch'
                            ? 'bg-accent/20 dark:bg-accent/20 text-accent dark:text-accent'
                            : 'bg-secondary/20 dark:bg-secondary/20 text-secondary dark:text-secondary'
                        }`}>
                          {meal.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Mock data
const DEFAULT_TRIPS: Trip[] = [
  {
    id: '1',
    name: 'Moab Adventure',
    location: 'Moab, Utah',
    startDate: '2024-03-15',
    endDate: '2024-03-17',
    status: 'confirmed',
    memberCount: 6,
    weatherForecast: 'sunny'
  },
  {
    id: '2',
    name: 'Desert Expedition',
    location: 'Joshua Tree, CA',
    startDate: '2024-04-20',
    endDate: '2024-04-22',
    status: 'planning',
    memberCount: 4,
    weatherForecast: 'cloudy'
  },
  {
    id: '3',
    name: 'Mountain Trail Run',
    location: 'Colorado Rockies',
    startDate: '2024-05-10',
    endDate: '2024-05-12',
    status: 'planning',
    memberCount: 8,
    weatherForecast: 'rainy'
  }
]

const DEFAULT_TASKS: Task[] = [
  {
    id: '1',
    title: 'Bring lunch for Saturday',
    assignee: 'Sarah M.',
    category: 'food',
    completed: false,
    dueDate: '2024-03-14'
  },
  {
    id: '2',
    title: 'Collect firewood',
    assignee: 'Mike R.',
    category: 'logistics',
    completed: true,
    dueDate: '2024-03-15'
  },
  {
    id: '3',
    title: 'Pack first aid kit',
    assignee: 'Jenny L.',
    category: 'gear',
    completed: false,
    dueDate: '2024-03-14'
  },
  {
    id: '4',
    title: 'Prepare breakfast Sunday',
    assignee: 'Tom K.',
    category: 'food',
    completed: false,
    dueDate: '2024-03-16'
  }
]

const DEFAULT_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'Sarah M.',
    content: 'Hey everyone! Just confirmed the campsite reservation for Moab.',
    timestamp: '10:30 AM'
  },
  {
    id: '2',
    sender: 'Mike R.',
    content: 'Awesome! I can bring the portable grill for Saturday night.',
    timestamp: '10:32 AM'
  },
  {
    id: '3',
    sender: 'Jenny L.',
    content: 'Weather looks perfect for the weekend. Should be sunny and 75°F.',
    timestamp: '10:35 AM'
  },
  {
    id: '4',
    sender: 'Trail Explorer',
    content: 'Perfect! Looking forward to this trip.',
    timestamp: '10:40 AM'
  }
]

const DEFAULT_MEALS: Meal[] = [
  {
    id: '1',
    name: 'Pancakes & Coffee',
    day: 'Saturday',
    time: 'breakfast',
    assignee: 'Sarah M.'
  },
  {
    id: '2',
    name: 'Trail Mix & Sandwiches',
    day: 'Saturday',
    time: 'lunch',
    assignee: 'Mike R.'
  },
  {
    id: '3',
    name: 'Grilled Burgers & Veggies',
    day: 'Saturday',
    time: 'dinner',
    assignee: 'Jenny L.'
  },
  {
    id: '4',
    name: 'Oatmeal & Fruit',
    day: 'Sunday',
    time: 'breakfast',
    assignee: 'Tom K.'
  },
  {
    id: '5',
    name: 'Wraps & Chips',
    day: 'Sunday',
    time: 'lunch',
    assignee: 'Trail Explorer'
  }
]

// Demo component for page.tsx
export default function OffRoadTripPlannerDemo() {
  return <OffRoadTripPlanner />
}