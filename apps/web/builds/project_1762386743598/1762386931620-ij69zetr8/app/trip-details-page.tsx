'use client'

import { useState, useEffect } from 'react'
import { 
  MapPin, 
  Calendar, 
  Users, 
  MessageSquare, 
  Cloud, 
  ChefHat, 
  CheckSquare,
  ArrowLeft,
  Edit3,
  Share2,
  MoreVertical,
  Clock,
  Thermometer,
  Droplets,
  Wind,
  UserCheck,
  UserX,
  Plus,
  Trash2
} from 'lucide-react'

interface TripMember {
  id: string
  name: string
  email: string
  avatar?: string
  rsvpStatus: 'pending' | 'accepted' | 'declined'
  tasks: string[]
}

interface WeatherData {
  date: string
  high: number
  low: number
  condition: string
  precipitation: number
  windSpeed: number
  icon: string
}

interface Meal {
  id: string
  name: string
  day: string
  time: 'breakfast' | 'lunch' | 'dinner'
  assignedTo: string
  ingredients: string[]
}

interface Task {
  id: string
  name: string
  assignedTo: string
  completed: boolean
  dueDate: string
}

interface Trip {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  description: string
  members: TripMember[]
  weather: WeatherData[]
  meals: Meal[]
  tasks: Task[]
  chatMessages: number
}

interface TripDetailsPageProps {
  tripId?: string
  trip?: Trip
  onBack?: () => void
  onEdit?: () => void
  onShare?: () => void
}

const MOCK_TRIP: Trip = {
  id: '1',
  name: 'Moab Desert Adventure',
  location: 'Moab, Utah',
  startDate: '2024-03-15',
  endDate: '2024-03-17',
  description: 'Epic off-road adventure through the red rocks of Moab. We\'ll tackle Hell\'s Revenge trail and camp under the stars.',
  members: [
    {
      id: '1',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      rsvpStatus: 'accepted',
      tasks: ['Firewood', 'Navigation']
    },
    {
      id: '2',
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      rsvpStatus: 'accepted',
      tasks: ['Saturday Lunch']
    },
    {
      id: '3',
      name: 'Mike Rodriguez',
      email: 'mike@example.com',
      rsvpStatus: 'pending',
      tasks: []
    },
    {
      id: '4',
      name: 'Emma Wilson',
      email: 'emma@example.com',
      rsvpStatus: 'declined',
      tasks: []
    }
  ],
  weather: [
    {
      date: '2024-03-15',
      high: 68,
      low: 42,
      condition: 'Sunny',
      precipitation: 0,
      windSpeed: 8,
      icon: '☀️'
    },
    {
      date: '2024-03-16',
      high: 72,
      low: 45,
      condition: 'Partly Cloudy',
      precipitation: 10,
      windSpeed: 12,
      icon: '⛅'
    },
    {
      date: '2024-03-17',
      high: 65,
      low: 40,
      condition: 'Clear',
      precipitation: 0,
      windSpeed: 6,
      icon: '☀️'
    }
  ],
  meals: [
    {
      id: '1',
      name: 'Campfire Breakfast Burritos',
      day: 'Saturday',
      time: 'breakfast',
      assignedTo: 'Alex Johnson',
      ingredients: ['Eggs', 'Tortillas', 'Cheese', 'Bacon']
    },
    {
      id: '2',
      name: 'Trail Mix Lunch',
      day: 'Saturday',
      time: 'lunch',
      assignedTo: 'Sarah Chen',
      ingredients: ['Sandwiches', 'Chips', 'Fruit', 'Water']
    },
    {
      id: '3',
      name: 'BBQ Dinner',
      day: 'Saturday',
      time: 'dinner',
      assignedTo: 'Mike Rodriguez',
      ingredients: ['Steaks', 'Vegetables', 'Potatoes']
    }
  ],
  tasks: [
    {
      id: '1',
      name: 'Bring firewood',
      assignedTo: 'Alex Johnson',
      completed: true,
      dueDate: '2024-03-15'
    },
    {
      id: '2',
      name: 'Pack first aid kit',
      assignedTo: 'Sarah Chen',
      completed: false,
      dueDate: '2024-03-15'
    },
    {
      id: '3',
      name: 'Download offline maps',
      assignedTo: 'Alex Johnson',
      completed: true,
      dueDate: '2024-03-14'
    }
  ],
  chatMessages: 12
}

export function TripDetailsPage({
  tripId = '1',
  trip = MOCK_TRIP,
  onBack = () => console.log('Back clicked'),
  onEdit = () => console.log('Edit clicked'),
  onShare = () => console.log('Share clicked')
}: TripDetailsPageProps = {}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'weather' | 'meals' | 'tasks' | 'members'>('overview')
  const [showMenu, setShowMenu] = useState(false)

  const acceptedMembers = trip.members.filter(m => m.rsvpStatus === 'accepted')
  const pendingMembers = trip.members.filter(m => m.rsvpStatus === 'pending')
  const declinedMembers = trip.members.filter(m => m.rsvpStatus === 'declined')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDaysBetween = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  useEffect(() => {
    const handleClickOutside = () => setShowMenu(false)
    if (showMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showMenu])

  return (
    <div className="min-h-screen bg-background dark:bg-background font-sans">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 dark:bg-background/95 backdrop-blur-sm border-b border-border dark:border-border">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-surface dark:bg-surface hover:bg-muted dark:hover:bg-muted transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-foreground dark:text-foreground" />
          </button>
          
          <h1 className="text-lg font-semibold text-foreground dark:text-foreground truncate mx-4 flex-1">
            {trip.name}
          </h1>
          
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-surface dark:bg-surface hover:bg-muted dark:hover:bg-muted transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5 text-foreground dark:text-foreground" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-12 w-48 bg-surface dark:bg-surface rounded-lg border border-border dark:border-border shadow-lg z-10">
                <button
                  onClick={() => {
                    onEdit()
                    setShowMenu(false)
                  }}
                  className="flex items-center w-full px-4 py-3 text-left text-foreground dark:text-foreground hover:bg-muted dark:hover:bg-muted rounded-t-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring"
                >
                  <Edit3 className="w-4 h-4 mr-3" />
                  Edit Trip
                </button>
                <button
                  onClick={() => {
                    onShare()
                    setShowMenu(false)
                  }}
                  className="flex items-center w-full px-4 py-3 text-left text-foreground dark:text-foreground hover:bg-muted dark:hover:bg-muted rounded-b-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring"
                >
                  <Share2 className="w-4 h-4 mr-3" />
                  Share Trip
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trip Header Info */}
      <div className="p-4 border-b border-border dark:border-border">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex items-center justify-center w-12 h-12 bg-primary/20 dark:bg-primary/20 rounded-xl border border-primary/30 dark:border-primary/30">
            <MapPin className="w-6 h-6 text-primary dark:text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-foreground dark:text-foreground mb-1">{trip.name}</h2>
            <p className="text-mutedForeground dark:text-mutedForeground text-sm mb-2">{trip.location}</p>
            <div className="flex items-center gap-4 text-sm text-mutedForeground dark:text-mutedForeground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{getDaysBetween(trip.startDate, trip.endDate)} days</span>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-foreground dark:text-foreground text-sm leading-relaxed mb-4">
          {trip.description}
        </p>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface dark:bg-surface rounded-lg p-3 text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-primary dark:text-primary" />
            </div>
            <div className="text-lg font-semibold text-foreground dark:text-foreground">{acceptedMembers.length}</div>
            <div className="text-xs text-mutedForeground dark:text-mutedForeground">Going</div>
          </div>
          <div className="bg-surface dark:bg-surface rounded-lg p-3 text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-center mb-1">
              <MessageSquare className="w-4 h-4 text-accent dark:text-accent" />
            </div>
            <div className="text-lg font-semibold text-foreground dark:text-foreground">{trip.chatMessages}</div>
            <div className="text-xs text-mutedForeground dark:text-mutedForeground">Messages</div>
          </div>
          <div className="bg-surface dark:bg-surface rounded-lg p-3 text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-center mb-1">
              <CheckSquare className="w-4 h-4 text-secondary dark:text-secondary" />
            </div>
            <div className="text-lg font-semibold text-foreground dark:text-foreground">{trip.tasks.filter(t => t.completed).length}/{trip.tasks.length}</div>
            <div className="text-xs text-mutedForeground dark:text-mutedForeground">Tasks</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border dark:border-border">
        <div className="flex overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: MapPin },
            { id: 'weather', label: 'Weather', icon: Cloud },
            { id: 'meals', label: 'Meals', icon: ChefHat },
            { id: 'tasks', label: 'Tasks', icon: CheckSquare },
            { id: 'members', label: 'Members', icon: Users }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-150 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring ${
                activeTab === id
                  ? 'text-primary dark:text-primary border-primary dark:border-primary'
                  : 'text-mutedForeground dark:text-mutedForeground border-transparent hover:text-foreground dark:hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 pb-20">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Weather Preview */}
            <div className="bg-surface dark:bg-surface rounded-xl p-4 border border-border dark:border-border hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-3 flex items-center gap-2">
                <Cloud className="w-5 h-5 text-accent dark:text-accent" />
                Weather Forecast
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {trip.weather.map((day, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-mutedForeground dark:text-mutedForeground mb-1">
                      {formatDate(day.date)}
                    </div>
                    <div className="text-2xl mb-1">{day.icon}</div>
                    <div className="text-sm text-foreground dark:text-foreground font-medium">
                      {day.high}°/{day.low}°
                    </div>
                    <div className="text-xs text-mutedForeground dark:text-mutedForeground">{day.condition}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-surface dark:bg-surface rounded-xl p-4 border border-border dark:border-border hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-3 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-secondary dark:text-secondary" />
                Pending Tasks
              </h3>
              <div className="space-y-2">
                {trip.tasks.filter(task => !task.completed).slice(0, 3).map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-2 bg-muted/50 dark:bg-muted/50 rounded-lg hover:bg-muted dark:hover:bg-muted transition-colors duration-150">
                    <div className="w-4 h-4 border border-border dark:border-border rounded"></div>
                    <div className="flex-1">
                      <div className="text-sm text-foreground dark:text-foreground">{task.name}</div>
                      <div className="text-xs text-mutedForeground dark:text-mutedForeground">Assigned to {task.assignedTo}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Preview */}
            <div className="bg-surface dark:bg-surface rounded-xl p-4 border border-border dark:border-border hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-accent dark:text-accent" />
                Group Chat
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary dark:bg-primary rounded-full flex items-center justify-center text-primaryForeground dark:text-primaryForeground text-xs font-medium">
                    A
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-foreground dark:text-foreground">Alex Johnson</div>
                    <div className="text-sm text-foreground dark:text-foreground">Just downloaded the offline maps for Hell's Revenge!</div>
                    <div className="text-xs text-mutedForeground dark:text-mutedForeground mt-1">2 hours ago</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-secondary dark:bg-secondary rounded-full flex items-center justify-center text-secondaryForeground dark:text-secondaryForeground text-xs font-medium">
                    S
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-foreground dark:text-foreground">Sarah Chen</div>
                    <div className="text-sm text-foreground dark:text-foreground">Perfect! I'll bring extra snacks for the trail.</div>
                    <div className="text-xs text-mutedForeground dark:text-mutedForeground mt-1">1 hour ago</div>
                  </div>
                </div>
              </div>
              <button className="w-full mt-3 py-2 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring">
                Open Chat
              </button>
            </div>
          </div>
        )}

        {activeTab === 'weather' && (
          <div className="space-y-4">
            {trip.weather.map((day, index) => (
              <div key={index} className="bg-surface dark:bg-surface rounded-xl p-4 border border-border dark:border-border hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground dark:text-foreground">
                      {formatDate(day.date)}
                    </h3>
                    <p className="text-sm text-mutedForeground dark:text-mutedForeground">{day.condition}</p>
                  </div>
                  <div className="text-4xl">{day.icon}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Thermometer className="w-4 h-4 text-destructive dark:text-destructive" />
                    </div>
                    <div className="text-lg font-semibold text-foreground dark:text-foreground">{day.high}°F</div>
                    <div className="text-xs text-mutedForeground dark:text-mutedForeground">High</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Droplets className="w-4 h-4 text-accent dark:text-accent" />
                    </div>
                    <div className="text-lg font-semibold text-foreground dark:text-foreground">{day.precipitation}%</div>
                    <div className="text-xs text-mutedForeground dark:text-mutedForeground">Rain</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Wind className="w-4 h-4 text-mutedForeground dark:text-mutedForeground" />
                    </div>
                    <div className="text-lg font-semibold text-foreground dark:text-foreground">{day.windSpeed} mph</div>
                    <div className="text-xs text-mutedForeground dark:text-mutedForeground">Wind</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'meals' && (
          <div className="space-y-4">
            {['Saturday', 'Sunday'].map(day => (
              <div key={day} className="bg-surface dark:bg-surface rounded-xl p-4 border border-border dark:border-border hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-3">{day}</h3>
                <div className="space-y-3">
                  {trip.meals.filter(meal => meal.day === day).map(meal => (
                    <div key={meal.id} className="bg-muted/50 dark:bg-muted/50 rounded-lg p-3 hover:bg-muted dark:hover:bg-muted transition-colors duration-150">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="text-foreground dark:text-foreground font-medium capitalize">{meal.time}</h4>
                          <p className="text-sm text-foreground dark:text-foreground">{meal.name}</p>
                        </div>
                        <ChefHat className="w-5 h-5 text-primary dark:text-primary" />
                      </div>
                      <div className="text-xs text-mutedForeground dark:text-mutedForeground mb-2">
                        Assigned to: {meal.assignedTo}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {meal.ingredients.map((ingredient, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary/20 dark:bg-primary/20 text-primary dark:text-primary rounded text-xs border border-primary/30 dark:border-primary/30"
                          >
                            {ingredient}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground dark:text-foreground">Trip Tasks</h3>
              <button className="flex items-center gap-2 px-3 py-2 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring">
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>
            
            <div className="space-y-3">
              {trip.tasks.map(task => (
                <div key={task.id} className="bg-surface dark:bg-surface rounded-lg p-4 border border-border dark:border-border hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors duration-150 ${
                      task.completed 
                        ? 'bg-primary dark:bg-primary border-primary dark:border-primary' 
                        : 'border-border dark:border-border hover:border-primary dark:hover:border-primary'
                    }`}>
                      {task.completed && (
                        <CheckSquare className="w-3 h-3 text-primaryForeground dark:text-primaryForeground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        task.completed ? 'text-mutedForeground dark:text-mutedForeground line-through' : 'text-foreground dark:text-foreground'
                      }`}>
                        {task.name}
                      </h4>
                      <div className="text-sm text-mutedForeground dark:text-mutedForeground mt-1">
                        Assigned to: {task.assignedTo}
                      </div>
                      <div className="text-xs text-mutedForeground dark:text-mutedForeground mt-1">
                        Due: {formatDate(task.dueDate)}
                      </div>
                    </div>
                    <button className="text-mutedForeground dark:text-mutedForeground hover:text-destructive dark:hover:text-destructive transition-colors duration-150 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-6">
            {/* Going */}
            <div>
              <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-3 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary dark:text-primary" />
                Going ({acceptedMembers.length})
              </h3>
              <div className="space-y-3">
                {acceptedMembers.map(member => (
                  <div key={member.id} className="bg-surface dark:bg-surface rounded-lg p-4 border border-border dark:border-border hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary dark:bg-primary rounded-full flex items-center justify-center text-primaryForeground dark:text-primaryForeground font-medium">
                        {member.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-foreground dark:text-foreground font-medium">{member.name}</h4>
                        <p className="text-sm text-mutedForeground dark:text-mutedForeground">{member.email}</p>
                      </div>
                      <div className="px-2 py-1 bg-primary/20 dark:bg-primary/20 text-primary dark:text-primary rounded text-xs border border-primary/30 dark:border-primary/30">
                        Going
                      </div>
                    </div>
                    {member.tasks.length > 0 && (
                      <div>
                        <div className="text-xs text-mutedForeground dark:text-mutedForeground mb-2">Assigned Tasks:</div>
                        <div className="flex flex-wrap gap-1">
                          {member.tasks.map((task, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-muted dark:bg-muted text-foreground dark:text-foreground rounded text-xs"
                            >
                              {task}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pending */}
            {pendingMembers.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-secondary dark:text-secondary" />
                  Pending ({pendingMembers.length})
                </h3>
                <div className="space-y-3">
                  {pendingMembers.map(member => (
                    <div key={member.id} className="bg-surface dark:bg-surface rounded-lg p-4 border border-border dark:border-border hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary dark:bg-secondary rounded-full flex items-center justify-center text-secondaryForeground dark:text-secondaryForeground font-medium">
                          {member.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-foreground dark:text-foreground font-medium">{member.name}</h4>
                          <p className="text-sm text-mutedForeground dark:text-mutedForeground">{member.email}</p>
                        </div>
                        <div className="px-2 py-1 bg-secondary/20 dark:bg-secondary/20 text-secondary dark:text-secondary rounded text-xs border border-secondary/30 dark:border-secondary/30">
                          Pending
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Declined */}
            {declinedMembers.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-3 flex items-center gap-2">
                  <UserX className="w-5 h-5 text-destructive dark:text-destructive" />
                  Can't Make It ({declinedMembers.length})
                </h3>
                <div className="space-y-3">
                  {declinedMembers.map(member => (
                    <div key={member.id} className="bg-surface dark:bg-surface rounded-lg p-4 border border-border dark:border-border opacity-60 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-destructive dark:bg-destructive rounded-full flex items-center justify-center text-destructiveForeground dark:text-destructiveForeground font-medium">
                          {member.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-foreground dark:text-foreground font-medium">{member.name}</h4>
                          <p className="text-sm text-mutedForeground dark:text-mutedForeground">{member.email}</p>
                        </div>
                        <div className="px-2 py-1 bg-destructive/20 dark:bg-destructive/20 text-destructive dark:text-destructive rounded text-xs border border-destructive/30 dark:border-destructive/30">
                          Declined
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <button className="w-14 h-14 bg-primary dark:bg-primary hover:bg-primary/90 dark:hover:bg-primary/90 text-primaryForeground dark:text-primaryForeground rounded-full shadow-lg flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring">
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}

export default function TripDetailsPageDemo() {
  return <TripDetailsPage />
}