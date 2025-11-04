'use client'

import { useState, useEffect } from 'react'
import { 
  MapPin, 
  Calendar, 
  Users, 
  Cloud, 
  MessageCircle, 
  UtensilsCrossed,
  CheckCircle,
  XCircle,
  Edit,
  Share,
  Navigation,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Clock,
  User,
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

interface Task {
  id: string
  title: string
  assignedTo: string
  dueDate: string
  completed: boolean
  category: 'food' | 'equipment' | 'logistics' | 'safety'
}

interface Meal {
  id: string
  name: string
  day: string
  time: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  assignedTo: string
  ingredients: string[]
}

interface WeatherData {
  date: string
  high: number
  low: number
  condition: string
  humidity: number
  windSpeed: number
  visibility: number
  icon: string
}

interface ChatMessage {
  id: string
  userId: string
  userName: string
  message: string
  timestamp: string
  type: 'text' | 'system'
}

interface TripDetailsProps {
  tripId?: string
  initialData?: {
    name: string
    location: string
    startDate: string
    endDate: string
    description: string
    members: TripMember[]
    tasks: Task[]
    meals: Meal[]
    weather: WeatherData[]
    messages: ChatMessage[]
  }
  onUpdate?: (data: any) => void
}

export function TripDetails({
  tripId = 'trip-1',
  initialData = DEFAULT_TRIP_DATA,
  onUpdate = () => console.log('Trip updated')
}: TripDetailsProps = {}) {
  const [tripData, setTripData] = useState(initialData)
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'meals' | 'weather' | 'chat'>('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [newTask, setNewTask] = useState({ title: '', assignedTo: '', category: 'logistics' as const })
  const [showAddTask, setShowAddTask] = useState(false)

  const handleRSVP = (memberId: string, status: 'accepted' | 'declined') => {
    setTripData(prev => ({
      ...prev,
      members: prev.members.map(member =>
        member.id === memberId ? { ...member, rsvpStatus: status } : member
      )
    }))
    onUpdate({ ...tripData, members: tripData.members })
  }

  const handleTaskToggle = (taskId: string) => {
    setTripData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }))
  }

  const handleAddTask = () => {
    if (!newTask.title.trim()) return
    
    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      assignedTo: newTask.assignedTo,
      dueDate: tripData.startDate,
      completed: false,
      category: newTask.category
    }
    
    setTripData(prev => ({
      ...prev,
      tasks: [...prev.tasks, task]
    }))
    
    setNewTask({ title: '', assignedTo: '', category: 'logistics' })
    setShowAddTask(false)
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: 'current-user',
      userName: 'You',
      message: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text'
    }
    
    setTripData(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }))
    
    setNewMessage('')
  }

  const acceptedMembers = tripData.members.filter(m => m.rsvpStatus === 'accepted')
  const pendingMembers = tripData.members.filter(m => m.rsvpStatus === 'pending')

  return (
    <div className="min-h-screen bg-[#ffffff] font-medium">
      {/* Header */}
      <div className="bg-[#228b22] text-[#ffffff] p-4 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Navigation className="w-6 h-6" />
            <div>
              <h1 className="text-xl font-bold">{tripData.name}</h1>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <MapPin className="w-4 h-4" />
                <span>{tripData.location}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 rounded-lg bg-[#ffffff] bg-opacity-20 hover:bg-opacity-30 transition-colors"
            aria-label="Edit trip"
          >
            <Edit className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(tripData.startDate).toLocaleDateString()} - {new Date(tripData.endDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{acceptedMembers.length} attending</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-[#f8fafc] border-b border-[#e2e8f0] px-4">
        <div className="flex overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'tasks', label: 'Tasks', icon: CheckCircle },
            { id: 'meals', label: 'Meals', icon: UtensilsCrossed },
            { id: 'weather', label: 'Weather', icon: Cloud },
            { id: 'chat', label: 'Chat', icon: MessageCircle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors min-w-max ${
                activeTab === tab.id
                  ? 'border-[#228b22] text-[#228b22]'
                  : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Description */}
            <div className="bg-[#ffffff] rounded-lg border border-[#e2e8f0] p-4 shadow-sm">
              <h3 className="font-semibold text-[#0f172a] mb-2">Trip Description</h3>
              <p className="text-[#64748b]">{tripData.description}</p>
            </div>

            {/* RSVP Status */}
            <div className="bg-[#ffffff] rounded-lg border border-[#e2e8f0] p-4 shadow-sm">
              <h3 className="font-semibold text-[#0f172a] mb-4">RSVP Status</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-[#228b22] mb-2">Attending ({acceptedMembers.length})</h4>
                  <div className="space-y-2">
                    {acceptedMembers.map(member => (
                      <div key={member.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#228b22] rounded-full flex items-center justify-center text-[#ffffff] text-sm">
                          {member.name.charAt(0)}
                        </div>
                        <span className="text-[#0f172a]">{member.name}</span>
                        <CheckCircle className="w-4 h-4 text-[#228b22] ml-auto" />
                      </div>
                    ))}
                  </div>
                </div>

                {pendingMembers.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-[#f59e0b] mb-2">Pending ({pendingMembers.length})</h4>
                    <div className="space-y-2">
                      {pendingMembers.map(member => (
                        <div key={member.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#f1f5f9] rounded-full flex items-center justify-center text-[#64748b] text-sm">
                            {member.name.charAt(0)}
                          </div>
                          <span className="text-[#0f172a]">{member.name}</span>
                          <div className="ml-auto flex gap-2">
                            <button
                              onClick={() => handleRSVP(member.id, 'accepted')}
                              className="p-1 text-[#228b22] hover:bg-[#f0f9ff] rounded"
                              aria-label="Accept RSVP"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRSVP(member.id, 'declined')}
                              className="p-1 text-[#ef4444] hover:bg-[#fef2f2] rounded"
                              aria-label="Decline RSVP"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#ffffff] rounded-lg border border-[#e2e8f0] p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-[#228b22]" />
                  <span className="font-semibold text-[#0f172a]">Tasks</span>
                </div>
                <p className="text-2xl font-bold text-[#228b22]">
                  {tripData.tasks.filter(t => t.completed).length}/{tripData.tasks.length}
                </p>
                <p className="text-sm text-[#64748b]">Completed</p>
              </div>
              
              <div className="bg-[#ffffff] rounded-lg border border-[#e2e8f0] p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <UtensilsCrossed className="w-5 h-5 text-[#f59e0b]" />
                  <span className="font-semibold text-[#0f172a]">Meals</span>
                </div>
                <p className="text-2xl font-bold text-[#f59e0b]">{tripData.meals.length}</p>
                <p className="text-sm text-[#64748b]">Planned</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#0f172a]">Trip Tasks</h3>
              <button
                onClick={() => setShowAddTask(true)}
                className="flex items-center gap-2 px-3 py-2 bg-[#228b22] text-[#ffffff] rounded-lg hover:bg-opacity-90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>

            {showAddTask && (
              <div className="bg-[#ffffff] rounded-lg border border-[#e2e8f0] p-4 shadow-sm">
                <h4 className="font-medium text-[#0f172a] mb-3">Add New Task</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#228b22] focus:border-transparent"
                  />
                  <select
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask(prev => ({ ...prev, assignedTo: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#228b22] focus:border-transparent"
                  >
                    <option value="">Assign to...</option>
                    {tripData.members.map(member => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#228b22] focus:border-transparent"
                  >
                    <option value="logistics">Logistics</option>
                    <option value="food">Food</option>
                    <option value="equipment">Equipment</option>
                    <option value="safety">Safety</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddTask}
                      className="px-4 py-2 bg-[#228b22] text-[#ffffff] rounded-lg hover:bg-opacity-90 transition-colors"
                    >
                      Add Task
                    </button>
                    <button
                      onClick={() => setShowAddTask(false)}
                      className="px-4 py-2 border border-[#e2e8f0] text-[#64748b] rounded-lg hover:bg-[#f8fafc] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {tripData.tasks.map(task => {
                const assignedMember = tripData.members.find(m => m.id === task.assignedTo)
                return (
                  <div key={task.id} className="bg-[#ffffff] rounded-lg border border-[#e2e8f0] p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleTaskToggle(task.id)}
                        className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          task.completed
                            ? 'bg-[#228b22] border-[#228b22] text-[#ffffff]'
                            : 'border-[#e2e8f0] hover:border-[#228b22]'
                        }`}
                        aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {task.completed && <CheckCircle className="w-3 h-3" />}
                      </button>
                      <div className="flex-1">
                        <h4 className={`font-medium ${task.completed ? 'line-through text-[#64748b]' : 'text-[#0f172a]'}`}>
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-[#64748b]">
                          {assignedMember && (
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>{assignedMember.name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            task.category === 'food' ? 'bg-[#fef3c7] text-[#92400e]' :
                            task.category === 'equipment' ? 'bg-[#dbeafe] text-[#1e40af]' :
                            task.category === 'safety' ? 'bg-[#fee2e2] text-[#991b1b]' :
                            'bg-[#f3f4f6] text-[#374151]'
                          }`}>
                            {task.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'meals' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-[#0f172a]">Meal Plan</h3>
            <div className="space-y-3">
              {tripData.meals.map(meal => {
                const assignedMember = tripData.members.find(m => m.id === meal.assignedTo)
                return (
                  <div key={meal.id} className="bg-[#ffffff] rounded-lg border border-[#e2e8f0] p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-[#0f172a]">{meal.name}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-[#64748b]">
                          <span className="capitalize">{meal.day} - {meal.time}</span>
                          {assignedMember && (
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>{assignedMember.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <UtensilsCrossed className="w-5 h-5 text-[#f59e0b]" />
                    </div>
                    {meal.ingredients.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-[#0f172a] mb-1">Ingredients:</p>
                        <p className="text-sm text-[#64748b]">{meal.ingredients.join(', ')}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'weather' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-[#0f172a]">Weather Forecast</h3>
            <div className="space-y-3">
              {tripData.weather.map((day, index) => (
                <div key={index} className="bg-[#ffffff] rounded-lg border border-[#e2e8f0] p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-[#0f172a]">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h4>
                      <p className="text-sm text-[#64748b] capitalize">{day.condition}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#0f172a]">{day.high}°</p>
                      <p className="text-sm text-[#64748b]">{day.low}°</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-[#3b82f6]" />
                      <span className="text-[#64748b]">{day.humidity}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-[#64748b]" />
                      <span className="text-[#64748b]">{day.windSpeed} mph</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-[#64748b]" />
                      <span className="text-[#64748b]">{day.visibility} mi</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-[#0f172a]">Group Chat</h3>
            
            <div className="bg-[#ffffff] rounded-lg border border-[#e2e8f0] shadow-sm">
              <div className="h-96 overflow-y-auto p-4 space-y-3">
                {tripData.messages.map(message => (
                  <div key={message.id} className={`flex gap-3 ${message.userId === 'current-user' ? 'flex-row-reverse' : ''}`}>
                    <div className="w-8 h-8 bg-[#228b22] rounded-full flex items-center justify-center text-[#ffffff] text-sm flex-shrink-0">
                      {message.userName.charAt(0)}
                    </div>
                    <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                      message.userId === 'current-user'
                        ? 'bg-[#228b22] text-[#ffffff]'
                        : 'bg-[#f1f5f9] text-[#0f172a]'
                    }`}>
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.userId === 'current-user' ? 'text-[#ffffff] opacity-75' : 'text-[#64748b]'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-[#e2e8f0] p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#228b22] focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-[#228b22] text-[#ffffff] rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Send message"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const DEFAULT_TRIP_DATA = {
  name: "Moab Adventure Weekend",
  location: "Moab, Utah",
  startDate: "2024-03-15",
  endDate: "2024-03-17",
  description: "Join us for an epic off-roading adventure in Moab! We'll be exploring the famous Hell's Revenge trail and camping under the stars. Perfect for intermediate to advanced off-road enthusiasts.",
  members: [
    {
      id: "1",
      name: "Alex Johnson",
      email: "alex@example.com",
      rsvpStatus: "accepted" as const,
      tasks: ["task-1"]
    },
    {
      id: "2",
      name: "Sarah Chen",
      email: "sarah@example.com",
      rsvpStatus: "accepted" as const,
      tasks: ["task-2"]
    },
    {
      id: "3",
      name: "Mike Rodriguez",
      email: "mike@example.com",
      rsvpStatus: "pending" as const,
      tasks: []
    },
    {
      id: "4",
      name: "Emma Wilson",
      email: "emma@example.com",
      rsvpStatus: "accepted" as const,
      tasks: ["task-3"]
    }
  ],
  tasks: [
    {
      id: "task-1",
      title: "Bring firewood for campfire",
      assignedTo: "1",
      dueDate: "2024-03-15",
      completed: false,
      category: "logistics" as const
    },
    {
      id: "task-2",
      title: "Prepare Saturday lunch",
      assignedTo: "2",
      dueDate: "2024-03-16",
      completed: true,
      category: "food" as const
    },
    {
      id: "task-3",
      title: "Check tire pressure and spare",
      assignedTo: "4",
      dueDate: "2024-03-14",
      completed: false,
      category: "safety" as const
    }
  ],
  meals: [
    {
      id: "meal-1",
      name: "Campfire Breakfast Burritos",
      day: "Saturday",
      time: "breakfast" as const,
      assignedTo: "1",
      ingredients: ["eggs", "bacon", "tortillas", "cheese", "peppers"]
    },
    {
      id: "meal-2",
      name: "Trail Mix Lunch",
      day: "Saturday",
      time: "lunch" as const,
      assignedTo: "2",
      ingredients: ["sandwiches", "chips", "fruit", "water"]
    },
    {
      id: "meal-3",
      name: "BBQ Dinner",
      day: "Saturday",
      time: "dinner" as const,
      assignedTo: "4",
      ingredients: ["burgers", "hot dogs", "corn", "salad"]
    }
  ],
  weather: [
    {
      date: "2024-03-15",
      high: 68,
      low: 42,
      condition: "sunny",
      humidity: 25,
      windSpeed: 8,
      visibility: 10,
      icon: "sun"
    },
    {
      date: "2024-03-16",
      high: 72,
      low: 45,
      condition: "partly cloudy",
      humidity: 30,
      windSpeed: 12,
      visibility: 8,
      icon: "partly-cloudy"
    },
    {
      date: "2024-03-17",
      high: 65,
      low: 40,
      condition: "clear",
      humidity: 20,
      windSpeed: 6,
      visibility: 10,
      icon: "sun"
    }
  ],
  messages: [
    {
      id: "msg-1",
      userId: "1",
      userName: "Alex Johnson",
      message: "Hey everyone! Really excited for this trip. I've got the firewood covered.",
      timestamp: "2024-03-10T10:30:00Z",
      type: "text" as const
    },
    {
      id: "msg-2",
      userId: "2",
      userName: "Sarah Chen",
      message: "Perfect! I'm working on the lunch menu. Any dietary restrictions I should know about?",
      timestamp: "2024-03-10T11:15:00Z",
      type: "text" as const
    },
    {
      id: "msg-3",
      userId: "4",
      userName: "Emma Wilson",
      message: "No restrictions here! Can't wait to hit the trails 🚗",
      timestamp: "2024-03-10T14:22:00Z",
      type: "text" as const
    }
  ]
}

export default function TripDetailsDemo() {
  return <TripDetails />
}