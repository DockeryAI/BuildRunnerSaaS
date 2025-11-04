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
  Sun,
  CloudRain,
  Wind,
  Thermometer,
  Clock,
  UserCheck,
  UserX,
  Send,
  Edit3,
  Trash2,
  Star,
  Navigation
} from 'lucide-react'

interface Location {
  id: string
  name: string
  coordinates: { lat: number; lng: number }
  description: string
  difficulty: 'Easy' | 'Moderate' | 'Hard'
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
  time: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  assignedTo: string
  ingredients: string[]
}

interface ChatMessage {
  id: string
  sender: string
  message: string
  timestamp: string
  type: 'text' | 'system'
}

interface WeatherData {
  day: string
  temp: { high: number; low: number }
  condition: 'sunny' | 'cloudy' | 'rainy' | 'windy'
  precipitation: number
}

interface TripPlannerProps {
  initialTrip?: any
  onSave?: (trip: any) => void
}

export function TripPlanner({
  initialTrip,
  onSave = () => console.log('Trip saved')
}: TripPlannerProps = {}) {
  const [activeTab, setActiveTab] = useState('locations')
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>(DEFAULT_MEMBERS)
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS)
  const [meals, setMeals] = useState<Meal[]>(DEFAULT_MEALS)
  const [messages, setMessages] = useState<ChatMessage[]>(DEFAULT_MESSAGES)
  const [newMessage, setNewMessage] = useState('')
  const [weather, setWeather] = useState<WeatherData[]>(DEFAULT_WEATHER)
  const [locations, setLocations] = useState<Location[]>(DEFAULT_LOCATIONS)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)

  const handleSaveLocation = (location: Location) => {
    setLocations(prev => prev.map(loc => 
      loc.id === location.id ? { ...loc, saved: !loc.saved } : loc
    ))
  }

  const handleAssignTask = (taskId: string, memberId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, assignedTo: memberId } : task
    ))
  }

  const handleToggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      message: newMessage,
      timestamp: new Date().toLocaleTimeString(),
      type: 'text'
    }
    
    setMessages(prev => [...prev, message])
    setNewMessage('')
  }

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      assignedTo: '',
      dueDate: new Date().toISOString().split('T')[0],
      completed: false,
      category: 'other'
    }
    
    setTasks(prev => [...prev, task])
    setNewTaskTitle('')
    setShowNewTaskForm(false)
  }

  const handleRSVP = (memberId: string, status: 'confirmed' | 'declined') => {
    setGroupMembers(prev => prev.map(member =>
      member.id === memberId ? { ...member, status } : member
    ))
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-5 h-5 text-yellow-500" />
      case 'cloudy': return <Cloud className="w-5 h-5 text-gray-500" />
      case 'rainy': return <CloudRain className="w-5 h-5 text-[rgb(34, 139, 34)]" />
      case 'windy': return <Wind className="w-5 h-5 text-gray-600" />
      default: return <Sun className="w-5 h-5 text-yellow-500" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Moderate': return 'bg-yellow-100 text-yellow-800'
      case 'Hard': return 'bg-red-100 text-red-800'
      default: return 'bg-[rgb(241, 245, 249)] text-gray-800'
    }
  }

  const tabs = [
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'group', label: 'Group', icon: Users },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'meals', label: 'Meals', icon: UtensilsCrossed },
    { id: 'weather', label: 'Weather', icon: Cloud },
    { id: 'chat', label: 'Chat', icon: MessageCircle }
  ]

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      {/* Header */}
      <div className="bg-[rgb(34,139,34)] text-[rgb(255,255,255)] p-4 shadow-md">
        <h1 className="text-xl font-bold">Off-Road Trip Planner</h1>
        <p className="text-sm opacity-90">Plan your next adventure</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-[rgb(248,250,252)] border-b border-[rgb(226,232,240)] overflow-x-auto">
        <div className="flex min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors min-w-max ${
                  activeTab === tab.id
                    ? 'text-[rgb(34,139,34)] border-b-2 border-[rgb(34,139,34)] bg-[rgb(255,255,255)]'
                    : 'text-[rgb(15,23,42)] hover:text-[rgb(34,139,34)]'
                }`}
                aria-label={`Switch to ${tab.label} tab`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Locations Tab */}
        {activeTab === 'locations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[rgb(15,23,42)]">Trail Locations</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors">
                <Plus className="w-4 h-4" />
                Add Location
              </button>
            </div>
            
            <div className="grid gap-4">
              {locations.map((location) => (
                <div key={location.id} className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-4 shadow-md">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-[rgb(15,23,42)]">{location.name}</h3>
                      <p className="text-sm text-[rgb(15,23,42)]/70 mt-1">{location.description}</p>
                    </div>
                    <button
                      onClick={() => handleSaveLocation(location)}
                      className={`p-2 rounded-lg transition-colors ${
                        location.saved 
                          ? 'text-[rgb(245,158,11)] bg-[rgb(245,158,11)]/10' 
                          : 'text-[rgb(15,23,42)]/50 hover:text-[rgb(245,158,11)]'
                      }`}
                      aria-label={location.saved ? 'Remove from saved' : 'Save location'}
                    >
                      <Star className={`w-5 h-5 ${location.saved ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(location.difficulty)}`}>
                        {location.difficulty}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-[rgb(15,23,42)]/70">
                        <Navigation className="w-4 h-4" />
                        {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedLocation(location)}
                      className="px-3 py-1 text-sm bg-[rgb(248,250,252)] text-[rgb(15,23,42)] rounded hover:bg-[rgb(241,245,249)] transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Group Tab */}
        {activeTab === 'group' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[rgb(15,23,42)]">Group Members</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors">
                <Plus className="w-4 h-4" />
                Invite Member
              </button>
            </div>
            
            <div className="grid gap-3">
              {groupMembers.map((member) => (
                <div key={member.id} className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-full flex items-center justify-center font-bold">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-medium text-[rgb(15,23,42)]">{member.name}</h3>
                        <p className="text-sm text-[rgb(15,23,42)]/70">{member.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {member.status === 'pending' ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleRSVP(member.id, 'confirmed')}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            aria-label="Confirm attendance"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRSVP(member.id, 'declined')}
                            className="p-1 text-[rgb(255, 255, 255)] hover:bg-red-50 rounded"
                            aria-label="Decline attendance"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          member.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {member.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[rgb(15,23,42)]">Trip Tasks</h2>
              <button
                onClick={() => setShowNewTaskForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>

            {showNewTaskForm && (
              <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-4 shadow-md">
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Task title..."
                    className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddTask}
                      className="px-4 py-2 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded hover:bg-[rgb(34,139,34)]/90 transition-colors"
                    >
                      Add Task
                    </button>
                    <button
                      onClick={() => setShowNewTaskForm(false)}
                      className="px-4 py-2 bg-[rgb(248,250,252)] text-[rgb(15,23,42)] rounded hover:bg-[rgb(241,245,249)] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid gap-3">
              {tasks.map((task) => (
                <div key={task.id} className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-4 shadow-md">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        task.completed
                          ? 'bg-[rgb(34,139,34)] border-[rgb(34,139,34)] text-[rgb(255,255,255)]'
                          : 'border-[rgb(226,232,240)] hover:border-[rgb(34,139,34)]'
                      }`}
                      aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {task.completed && <CheckSquare className="w-3 h-3" />}
                    </button>
                    
                    <div className="flex-1">
                      <h3 className={`font-medium ${task.completed ? 'line-through text-[rgb(15,23,42)]/50' : 'text-[rgb(15,23,42)]'}`}>
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[rgb(15,23,42)]/70">Due: {task.dueDate}</span>
                        {task.assignedTo && (
                          <span className="text-xs bg-[rgb(248,250,252)] px-2 py-1 rounded">
                            Assigned to: {groupMembers.find(m => m.id === task.assignedTo)?.name || 'Unknown'}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <select
                      value={task.assignedTo}
                      onChange={(e) => handleAssignTask(task.id, e.target.value)}
                      className="text-sm border border-[rgb(226,232,240)] rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]"
                    >
                      <option value="">Assign to...</option>
                      {groupMembers.map((member) => (
                        <option key={member.id} value={member.id}>{member.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meals Tab */}
        {activeTab === 'meals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[rgb(15,23,42)]">Meal Planning</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors">
                <Plus className="w-4 h-4" />
                Add Meal
              </button>
            </div>
            
            <div className="grid gap-4">
              {['Saturday', 'Sunday'].map((day) => (
                <div key={day} className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-4 shadow-md">
                  <h3 className="font-bold text-[rgb(15,23,42)] mb-3">{day}</h3>
                  <div className="space-y-3">
                    {meals.filter(meal => meal.day === day).map((meal) => (
                      <div key={meal.id} className="flex items-center justify-between p-3 bg-[rgb(248,250,252)] rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium capitalize text-[rgb(15,23,42)]">{meal.time}</span>
                            <span className="text-sm text-[rgb(15,23,42)]/70">•</span>
                            <span className="text-sm font-medium text-[rgb(15,23,42)]">{meal.name}</span>
                          </div>
                          <p className="text-xs text-[rgb(15,23,42)]/70 mt-1">
                            Assigned to: {groupMembers.find(m => m.id === meal.assignedTo)?.name || 'Unassigned'}
                          </p>
                        </div>
                        <button className="p-1 text-[rgb(15,23,42)]/50 hover:text-[rgb(15,23,42)] transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weather Tab */}
        {activeTab === 'weather' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[rgb(15,23,42)]">Weather Forecast</h2>
            
            <div className="grid gap-3">
              {weather.map((day, index) => (
                <div key={index} className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getWeatherIcon(day.condition)}
                      <div>
                        <h3 className="font-medium text-[rgb(15,23,42)]">{day.day}</h3>
                        <p className="text-sm text-[rgb(15,23,42)]/70 capitalize">{day.condition}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm">
                        <Thermometer className="w-4 h-4 text-[rgb(15,23,42)]/70" />
                        <span className="font-medium text-[rgb(15,23,42)]">{day.temp.high}°</span>
                        <span className="text-[rgb(15,23,42)]/70">/ {day.temp.low}°</span>
                      </div>
                      {day.precipitation > 0 && (
                        <p className="text-xs text-[rgb(34, 139, 34)] mt-1">{day.precipitation}% rain</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[rgb(15,23,42)]">Group Chat</h2>
            
            <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg shadow-md">
              <div className="h-96 overflow-y-auto p-4 space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                      message.sender === 'You'
                        ? 'bg-[rgb(34,139,34)] text-[rgb(255,255,255)]'
                        : 'bg-[rgb(248,250,252)] text-[rgb(15,23,42)]'
                    }`}>
                      {message.sender !== 'You' && (
                        <p className="text-xs font-medium mb-1">{message.sender}</p>
                      )}
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'You' ? 'text-[rgb(255,255,255)]/70' : 'text-[rgb(15,23,42)]/50'
                      }`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-[rgb(226,232,240)] p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-[rgb(226,232,240)] rounded focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded hover:bg-[rgb(34,139,34)]/90 transition-colors"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
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

// Mock data
const DEFAULT_LOCATIONS: Location[] = [
  {
    id: '1',
    name: 'Moab Desert Trail',
    coordinates: { lat: 38.5733, lng: -109.5498 },
    description: 'Challenging red rock terrain with stunning views',
    difficulty: 'Hard',
    saved: true
  },
  {
    id: '2',
    name: 'Pine Valley Loop',
    coordinates: { lat: 37.3861, lng: -113.3094 },
    description: 'Family-friendly forest trail with creek crossings',
    difficulty: 'Easy',
    saved: false
  },
  {
    id: '3',
    name: 'Black Diamond Pass',
    coordinates: { lat: 39.1911, lng: -106.8175 },
    description: 'Technical mountain pass requiring 4WD experience',
    difficulty: 'Moderate',
    saved: true
  }
]

const DEFAULT_MEMBERS: GroupMember[] = [
  { id: '1', name: 'John Smith', email: 'john@example.com', status: 'confirmed' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', status: 'confirmed' },
  { id: '3', name: 'Mike Wilson', email: 'mike@example.com', status: 'pending' },
  { id: '4', name: 'Lisa Brown', email: 'lisa@example.com', status: 'declined' }
]

const DEFAULT_TASKS: Task[] = [
  { id: '1', title: 'Bring firewood for Saturday night', assignedTo: '1', dueDate: '2024-01-15', completed: false, category: 'equipment' },
  { id: '2', title: 'Prepare lunch for Sunday', assignedTo: '2', dueDate: '2024-01-16', completed: true, category: 'food' },
  { id: '3', title: 'Check tire pressure and spare', assignedTo: '', dueDate: '2024-01-14', completed: false, category: 'logistics' },
  { id: '4', title: 'Pack first aid kit', assignedTo: '3', dueDate: '2024-01-15', completed: false, category: 'equipment' }
]

const DEFAULT_MEALS: Meal[] = [
  { id: '1', name: 'Pancakes & Bacon', day: 'Saturday', time: 'breakfast', assignedTo: '2', ingredients: ['pancake mix', 'bacon', 'syrup'] },
  { id: '2', name: 'Trail Sandwiches', day: 'Saturday', time: 'lunch', assignedTo: '1', ingredients: ['bread', 'deli meat', 'cheese'] },
  { id: '3', name: 'Campfire Chili', day: 'Saturday', time: 'dinner', assignedTo: '3', ingredients: ['ground beef', 'beans', 'tomatoes'] },
  { id: '4', name: 'Oatmeal & Coffee', day: 'Sunday', time: 'breakfast', assignedTo: '4', ingredients: ['oatmeal', 'coffee', 'fruit'] }
]

const DEFAULT_MESSAGES: ChatMessage[] = [
  { id: '1', sender: 'John Smith', message: 'Hey everyone! Excited for this weekend\'s trip!', timestamp: '10:30 AM', type: 'text' },
  { id: '2', sender: 'Sarah Johnson', message: 'Same here! I\'ll bring extra water just in case', timestamp: '10:32 AM', type: 'text' },
  { id: '3', sender: 'You', message: 'Perfect! Don\'t forget to check the weather forecast', timestamp: '10:35 AM', type: 'text' },
  { id: '4', sender: 'Mike Wilson', message: 'Will do! My Jeep is ready to go 🚙', timestamp: '10:40 AM', type: 'text' }
]

const DEFAULT_WEATHER: WeatherData[] = [
  { day: 'Saturday', temp: { high: 75, low: 45 }, condition: 'sunny', precipitation: 0 },
  { day: 'Sunday', temp: { high: 68, low: 42 }, condition: 'cloudy', precipitation: 20 },
  { day: 'Monday', temp: { high: 62, low: 38 }, condition: 'rainy', precipitation: 80 }
]

// Demo component for page.tsx
export default function TripPlannerDemo() {
  return <TripPlanner />
}