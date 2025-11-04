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
  Menu,
  X,
  Send,
  UserPlus,
  Clock,
  ChevronRight
} from 'lucide-react'

interface Location {
  id: string
  name: string
  coordinates: { lat: number; lng: number }
  description: string
  saved: boolean
}

interface GroupMember {
  id: string
  name: string
  email: string
  avatar?: string
  status: 'confirmed' | 'pending' | 'declined'
}

interface Task {
  id: string
  title: string
  assignedTo: string
  dueDate: string
  completed: boolean
  category: 'food' | 'equipment' | 'logistics' | 'other'
}

interface Meal {
  id: string
  name: string
  day: string
  time: 'breakfast' | 'lunch' | 'dinner'
  assignedTo: string
  ingredients: string[]
}

interface ChatMessage {
  id: string
  sender: string
  message: string
  timestamp: string
}

interface Weather {
  day: string
  high: number
  low: number
  condition: 'sunny' | 'cloudy' | 'rainy'
  precipitation: number
}

interface TripPlannerProps {
  initialTrip?: {
    name: string
    startDate: string
    endDate: string
    location?: Location
  }
  onSaveTrip?: (trip: any) => void
}

export function TripPlanner({
  initialTrip = {
    name: 'Desert Adventure',
    startDate: '2024-03-15',
    endDate: '2024-03-17',
    location: DEFAULT_LOCATIONS[0]
  },
  onSaveTrip = () => console.log('Trip saved')
}: TripPlannerProps = {}) {
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [trip, setTrip] = useState(initialTrip)
  const [locations, setLocations] = useState(DEFAULT_LOCATIONS)
  const [groupMembers, setGroupMembers] = useState(DEFAULT_MEMBERS)
  const [tasks, setTasks] = useState(DEFAULT_TASKS)
  const [meals, setMeals] = useState(DEFAULT_MEALS)
  const [chatMessages, setChatMessages] = useState(DEFAULT_MESSAGES)
  const [weather, setWeather] = useState(DEFAULT_WEATHER)
  const [newMessage, setNewMessage] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      message: newMessage,
      timestamp: new Date().toLocaleTimeString()
    }
    
    setChatMessages(prev => [...prev, message])
    setNewMessage('')
  }

  const handleInviteMember = () => {
    if (!newMemberEmail.trim()) return
    
    const newMember: GroupMember = {
      id: Date.now().toString(),
      name: newMemberEmail.split('@')[0],
      email: newMemberEmail,
      status: 'pending'
    }
    
    setGroupMembers(prev => [...prev, newMember])
    setNewMemberEmail('')
  }

  const toggleTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  const saveLocation = (locationId: string) => {
    setLocations(prev => prev.map(loc => 
      loc.id === locationId ? { ...loc, saved: !loc.saved } : loc
    ))
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-5 h-5 text-yellow-500" />
      case 'cloudy': return <Cloud className="w-5 h-5 text-gray-500" />
      case 'rainy': return <CloudRain className="w-5 h-5 text-[rgb(34, 139, 34)]" />
      default: return <Sun className="w-5 h-5 text-yellow-500" />
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: MapPin },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'group', label: 'Group', icon: Users },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'meals', label: 'Meals', icon: UtensilsCrossed },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'weather', label: 'Weather', icon: Cloud }
  ]

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      {/* Mobile Header */}
      <div className="lg:hidden bg-[rgb(34,139,34)] text-[rgb(255,255,255)] p-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">{trip.name}</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-[rgb(34,139,34)]/80 rounded-md"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[rgb(248,250,252)] border-r border-[rgb(226,232,240)]
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6 border-b border-[rgb(226,232,240)]">
            <h1 className="text-xl font-bold text-[rgb(15,23,42)]">{trip.name}</h1>
            <p className="text-sm text-[rgb(15,23,42)]/60 mt-1">
              {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
            </p>
          </div>
          
          <nav className="p-4 space-y-2">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setSidebarOpen(false)
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors
                    ${activeTab === tab.id 
                      ? 'bg-[rgb(34,139,34)] text-[rgb(255,255,255)]' 
                      : 'text-[rgb(15,23,42)] hover:bg-[rgb(241,245,249)]'
                    }
                  `}
                  aria-label={`Navigate to ${tab.label}`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <div className="p-4 lg:p-8 max-w-6xl mx-auto">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-[rgb(255,255,255)] p-6 rounded-lg shadow-md border border-[rgb(226,232,240)]">
                    <div className="flex items-center gap-3 mb-4">
                      <MapPin className="w-6 h-6 text-[rgb(34,139,34)]" />
                      <h3 className="font-semibold text-[rgb(15,23,42)]">Location</h3>
                    </div>
                    <p className="text-[rgb(15,23,42)]">{trip.location?.name || 'Not selected'}</p>
                    <p className="text-sm text-[rgb(15,23,42)]/60 mt-1">
                      {trip.location?.description || 'Select a location to get started'}
                    </p>
                  </div>

                  <div className="bg-[rgb(255,255,255)] p-6 rounded-lg shadow-md border border-[rgb(226,232,240)]">
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="w-6 h-6 text-[rgb(34,139,34)]" />
                      <h3 className="font-semibold text-[rgb(15,23,42)]">Group</h3>
                    </div>
                    <p className="text-[rgb(15,23,42)]">{groupMembers.length} members</p>
                    <p className="text-sm text-[rgb(15,23,42)]/60 mt-1">
                      {groupMembers.filter(m => m.status === 'confirmed').length} confirmed
                    </p>
                  </div>

                  <div className="bg-[rgb(255,255,255)] p-6 rounded-lg shadow-md border border-[rgb(226,232,240)]">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckSquare className="w-6 h-6 text-[rgb(34,139,34)]" />
                      <h3 className="font-semibold text-[rgb(15,23,42)]">Tasks</h3>
                    </div>
                    <p className="text-[rgb(15,23,42)]">
                      {tasks.filter(t => t.completed).length}/{tasks.length} complete
                    </p>
                    <div className="w-full bg-[rgb(241,245,249)] rounded-full h-2 mt-2">
                      <div 
                        className="bg-[rgb(34,139,34)] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-[rgb(255,255,255)] p-6 rounded-lg shadow-md border border-[rgb(226,232,240)]">
                    <h3 className="font-semibold text-[rgb(15,23,42)] mb-4">Upcoming Tasks</h3>
                    <div className="space-y-3">
                      {tasks.slice(0, 3).map(task => (
                        <div key={task.id} className="flex items-center gap-3">
                          <button
                            onClick={() => toggleTaskComplete(task.id)}
                            className={`
                              w-5 h-5 rounded border-2 flex items-center justify-center
                              ${task.completed 
                                ? 'bg-[rgb(34,139,34)] border-[rgb(34,139,34)]' 
                                : 'border-[rgb(226,232,240)]'
                              }
                            `}
                            aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                          >
                            {task.completed && <CheckSquare className="w-3 h-3 text-[rgb(255,255,255)]" />}
                          </button>
                          <span className={`flex-1 ${task.completed ? 'line-through text-[rgb(15,23,42)]/60' : 'text-[rgb(15,23,42)]'}`}>
                            {task.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[rgb(255,255,255)] p-6 rounded-lg shadow-md border border-[rgb(226,232,240)]">
                    <h3 className="font-semibold text-[rgb(15,23,42)] mb-4">Weather Forecast</h3>
                    <div className="space-y-3">
                      {weather.slice(0, 3).map(day => (
                        <div key={day.day} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getWeatherIcon(day.condition)}
                            <span className="text-[rgb(15,23,42)]">{day.day}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[rgb(15,23,42)]">{day.high}°/{day.low}°</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Locations Tab */}
            {activeTab === 'locations' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[rgb(15,23,42)]">Locations</h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-md hover:bg-[rgb(34,139,34)]/90 transition-colors">
                    <Plus className="w-4 h-4" />
                    Add Location
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {locations.map(location => (
                    <div key={location.id} className="bg-[rgb(255,255,255)] p-6 rounded-lg shadow-md border border-[rgb(226,232,240)]">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-[rgb(15,23,42)]">{location.name}</h3>
                          <p className="text-sm text-[rgb(15,23,42)]/60 mt-1">{location.description}</p>
                        </div>
                        <button
                          onClick={() => saveLocation(location.id)}
                          className={`
                            p-2 rounded-md transition-colors
                            ${location.saved 
                              ? 'bg-[rgb(245,158,11)] text-[rgb(255,255,255)]' 
                              : 'bg-[rgb(241,245,249)] text-[rgb(15,23,42)] hover:bg-[rgb(226,232,240)]'
                            }
                          `}
                          aria-label={`${location.saved ? 'Remove from' : 'Add to'} saved locations`}
                        >
                          <MapPin className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[rgb(15,23,42)]/60">
                          {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}
                        </span>
                        <button className="text-[rgb(34,139,34)] hover:text-[rgb(34,139,34)]/80 transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Group Tab */}
            {activeTab === 'group' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[rgb(15,23,42)]">Group Members</h2>
                </div>

                <div className="bg-[rgb(255,255,255)] p-6 rounded-lg shadow-md border border-[rgb(226,232,240)]">
                  <h3 className="font-semibold text-[rgb(15,23,42)] mb-4">Invite New Member</h3>
                  <div className="flex gap-3">
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="flex-1 px-3 py-2 border border-[rgb(226,232,240)] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                      aria-label="Email address for invitation"
                    />
                    <button
                      onClick={handleInviteMember}
                      className="px-4 py-2 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-md hover:bg-[rgb(34,139,34)]/90 transition-colors flex items-center gap-2"
                      aria-label="Send invitation"
                    >
                      <UserPlus className="w-4 h-4" />
                      Invite
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {groupMembers.map(member => (
                    <div key={member.id} className="bg-[rgb(255,255,255)] p-4 rounded-lg shadow-md border border-[rgb(226,232,240)] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[rgb(34,139,34)] rounded-full flex items-center justify-center text-[rgb(255,255,255)] font-semibold">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-[rgb(15,23,42)]">{member.name}</p>
                          <p className="text-sm text-[rgb(15,23,42)]/60">{member.email}</p>
                        </div>
                      </div>
                      <span className={`
                        px-2 py-1 text-xs font-semibold rounded-full
                        ${member.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                          member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}
                      `}>
                        {member.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[rgb(15,23,42)]">Tasks</h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-md hover:bg-[rgb(34,139,34)]/90 transition-colors">
                    <Plus className="w-4 h-4" />
                    Add Task
                  </button>
                </div>

                <div className="space-y-4">
                  {tasks.map(task => (
                    <div key={task.id} className="bg-[rgb(255,255,255)] p-4 rounded-lg shadow-md border border-[rgb(226,232,240)]">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleTaskComplete(task.id)}
                          className={`
                            w-5 h-5 rounded border-2 flex items-center justify-center mt-1
                            ${task.completed 
                              ? 'bg-[rgb(34,139,34)] border-[rgb(34,139,34)]' 
                              : 'border-[rgb(226,232,240)]'
                            }
                          `}
                          aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                        >
                          {task.completed && <CheckSquare className="w-3 h-3 text-[rgb(255,255,255)]" />}
                        </button>
                        <div className="flex-1">
                          <h3 className={`font-medium ${task.completed ? 'line-through text-[rgb(15,23,42)]/60' : 'text-[rgb(15,23,42)]'}`}>
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-[rgb(15,23,42)]/60">
                            <span>Assigned to: {task.assignedTo}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.dueDate}
                            </span>
                            <span className={`
                              px-2 py-1 rounded-full text-xs
                              ${task.category === 'food' ? 'bg-orange-100 text-orange-800' :
                                task.category === 'equipment' ? 'bg-blue-100 text-blue-800' :
                                task.category === 'logistics' ? 'bg-purple-100 text-purple-800' :
                                'bg-[rgb(241, 245, 249)] text-gray-800'}
                            `}>
                              {task.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meals Tab */}
            {activeTab === 'meals' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[rgb(15,23,42)]">Meal Planning</h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-md hover:bg-[rgb(34,139,34)]/90 transition-colors">
                    <Plus className="w-4 h-4" />
                    Add Meal
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {meals.map(meal => (
                    <div key={meal.id} className="bg-[rgb(255,255,255)] p-4 rounded-lg shadow-md border border-[rgb(226,232,240)]">
                      <div className="flex items-center gap-2 mb-3">
                        <UtensilsCrossed className="w-5 h-5 text-[rgb(34,139,34)]" />
                        <h3 className="font-medium text-[rgb(15,23,42)]">{meal.name}</h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="text-[rgb(15,23,42)]/60">
                          <span className="font-medium">{meal.day}</span> - {meal.time}
                        </p>
                        <p className="text-[rgb(15,23,42)]/60">
                          Assigned to: <span className="font-medium">{meal.assignedTo}</span>
                        </p>
                        <div>
                          <p className="font-medium text-[rgb(15,23,42)] mb-1">Ingredients:</p>
                          <ul className="text-[rgb(15,23,42)]/60 space-y-1">
                            {meal.ingredients.map((ingredient, index) => (
                              <li key={index}>• {ingredient}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[rgb(15,23,42)]">Group Chat</h2>
                
                <div className="bg-[rgb(255,255,255)] rounded-lg shadow-md border border-[rgb(226,232,240)] h-96 flex flex-col">
                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {chatMessages.map(message => (
                      <div key={message.id} className="flex gap-3">
                        <div className="w-8 h-8 bg-[rgb(34,139,34)] rounded-full flex items-center justify-center text-[rgb(255,255,255)] text-sm font-semibold">
                          {message.sender.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-[rgb(15,23,42)]">{message.sender}</span>
                            <span className="text-xs text-[rgb(15,23,42)]/60">{message.timestamp}</span>
                          </div>
                          <p className="text-[rgb(15,23,42)]">{message.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 border-t border-[rgb(226,232,240)]">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-[rgb(226,232,240)] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                        aria-label="Type your message"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="px-4 py-2 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-md hover:bg-[rgb(34,139,34)]/90 transition-colors"
                        aria-label="Send message"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Weather Tab */}
            {activeTab === 'weather' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[rgb(15,23,42)]">Weather Forecast</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {weather.map(day => (
                    <div key={day.day} className="bg-[rgb(255,255,255)] p-6 rounded-lg shadow-md border border-[rgb(226,232,240)]">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-[rgb(15,23,42)]">{day.day}</h3>
                        {getWeatherIcon(day.condition)}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-[rgb(15,23,42)]/60">High</span>
                          <span className="font-medium text-[rgb(15,23,42)]">{day.high}°F</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[rgb(15,23,42)]/60">Low</span>
                          <span className="font-medium text-[rgb(15,23,42)]">{day.low}°F</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[rgb(15,23,42)]/60">Precipitation</span>
                          <span className="font-medium text-[rgb(15,23,42)]">{day.precipitation}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[rgb(15,23,42)]/60">Condition</span>
                          <span className="font-medium text-[rgb(15,23,42)] capitalize">{day.condition}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Mock data
const DEFAULT_LOCATIONS: Location[] = [
  {
    id: '1',
    name: 'Moab Desert Trail',
    coordinates: { lat: 38.5733, lng: -109.5498 },
    description: 'Stunning red rock formations and challenging terrain',
    saved: true
  },
  {
    id: '2',
    name: 'Death Valley Adventure',
    coordinates: { lat: 36.5054, lng: -117.0794 },
    description: 'Extreme desert conditions and unique landscapes',
    saved: false
  },
  {
    id: '3',
    name: 'Joshua Tree National Park',
    coordinates: { lat: 33.8734, lng: -115.9010 },
    description: 'Iconic desert trees and rock climbing opportunities',
    saved: true
  }
]

const DEFAULT_MEMBERS: GroupMember[] = [
  { id: '1', name: 'John Smith', email: 'john@example.com', status: 'confirmed' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', status: 'confirmed' },
  { id: '3', name: 'Mike Wilson', email: 'mike@example.com', status: 'pending' },
  { id: '4', name: 'Emily Davis', email: 'emily@example.com', status: 'confirmed' }
]

const DEFAULT_TASKS: Task[] = [
  { id: '1', title: 'Bring lunch for Saturday', assignedTo: 'John Smith', dueDate: '2024-03-15', completed: false, category: 'food' },
  { id: '2', title: 'Collect firewood', assignedTo: 'Mike Wilson', dueDate: '2024-03-15', completed: true, category: 'equipment' },
  { id: '3', title: 'Check vehicle maintenance', assignedTo: 'Sarah Johnson', dueDate: '2024-03-14', completed: false, category: 'logistics' },
  { id: '4', title: 'Pack first aid kit', assignedTo: 'Emily Davis', dueDate: '2024-03-14', completed: true, category: 'equipment' }
]

const DEFAULT_MEALS: Meal[] = [
  {
    id: '1',
    name: 'Campfire Breakfast',
    day: 'Saturday',
    time: 'breakfast',
    assignedTo: 'Sarah Johnson',
    ingredients: ['Eggs', 'Bacon', 'Toast', 'Coffee']
  },
  {
    id: '2',
    name: 'Trail Lunch',
    day: 'Saturday',
    time: 'lunch',
    assignedTo: 'John Smith',
    ingredients: ['Sandwiches', 'Trail mix', 'Water', 'Fruit']
  },
  {
    id: '3',
    name: 'BBQ Dinner',
    day: 'Saturday',
    time: 'dinner',
    assignedTo: 'Mike Wilson',
    ingredients: ['Burgers', 'Hot dogs', 'Vegetables', 'Beer']
  }
]

const DEFAULT_MESSAGES: ChatMessage[] = [
  { id: '1', sender: 'John Smith', message: 'Hey everyone! Excited for the trip!', timestamp: '10:30 AM' },
  { id: '2', sender: 'Sarah Johnson', message: 'Same here! I\'ve got all the breakfast supplies ready.', timestamp: '10:32 AM' },
  { id: '3', sender: 'Mike Wilson', message: 'Weather looks perfect for the weekend 🌞', timestamp: '10:35 AM' },
  { id: '4', sender: 'Emily Davis', message: 'Don\'t forget to bring extra water bottles!', timestamp: '10:40 AM' }
]

const DEFAULT_WEATHER: Weather[] = [
  { day: 'Friday', high: 75, low: 45, condition: 'sunny', precipitation: 0 },
  { day: 'Saturday', high: 78, low: 48, condition: 'sunny', precipitation: 5 },
  { day: 'Sunday', high: 72, low: 44, condition: 'cloudy', precipitation: 15 },
  { day: 'Monday', high: 68, low: 42, condition: 'rainy', precipitation: 60 }
]

export default function TripPlannerDemo() {
  return <TripPlanner />
}