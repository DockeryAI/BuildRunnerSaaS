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
  CheckCircle,
  XCircle
} from 'lucide-react'

interface Trip {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  status: 'planning' | 'confirmed' | 'completed'
}

interface GroupMember {
  id: string
  name: string
  email: string
  avatar?: string
  rsvpStatus: 'pending' | 'accepted' | 'declined'
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
}

interface ChatMessage {
  id: string
  sender: string
  message: string
  timestamp: string
}

interface WeatherData {
  day: string
  condition: 'sunny' | 'cloudy' | 'rainy'
  high: number
  low: number
}

interface TripPlannerProps {
  initialTrip?: Trip
  onTripUpdate?: (trip: Trip) => void
}

export function TripPlanner({
  initialTrip = DEFAULT_TRIP,
  onTripUpdate = () => console.log('Trip updated')
}: TripPlannerProps = {}) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [trip, setTrip] = useState<Trip>(initialTrip)
  const [members, setMembers] = useState<GroupMember[]>(DEFAULT_MEMBERS)
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS)
  const [meals, setMeals] = useState<Meal[]>(DEFAULT_MEALS)
  const [messages, setMessages] = useState<ChatMessage[]>(DEFAULT_MESSAGES)
  const [newMessage, setNewMessage] = useState('')
  const [weather, setWeather] = useState<WeatherData[]>(DEFAULT_WEATHER)

  const tabs = [
    { id: 'overview', label: 'Overview', icon: MapPin },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'meals', label: 'Meals', icon: UtensilsCrossed },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'weather', label: 'Weather', icon: Cloud }
  ]

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      message: newMessage,
      timestamp: new Date().toISOString()
    }
    
    setMessages(prev => [...prev, message])
    setNewMessage('')
  }

  const toggleTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  const updateRSVP = (memberId: string, status: 'accepted' | 'declined') => {
    setMembers(prev => prev.map(member =>
      member.id === memberId ? { ...member, rsvpStatus: status } : member
    ))
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return Sun
      case 'cloudy': return Cloud
      case 'rainy': return CloudRain
      default: return Cloud
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
        <h2 className="text-xl font-semibold text-[rgb(15,23,42)] mb-4">Trip Details</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-[rgb(34,139,34)]" />
            <span className="text-[rgb(15,23,42)]">{trip.location}</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-[rgb(34,139,34)]" />
            <span className="text-[rgb(15,23,42)]">{trip.startDate} - {trip.endDate}</span>
          </div>
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-[rgb(34,139,34)]" />
            <span className="text-[rgb(15,23,42)]">{members.length} members</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
        <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[rgb(34,139,34)]">
              {tasks.filter(t => t.completed).length}/{tasks.length}
            </div>
            <div className="text-sm text-[rgb(100,116,139)]">Tasks Complete</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[rgb(34,139,34)]">
              {members.filter(m => m.rsvpStatus === 'accepted').length}
            </div>
            <div className="text-sm text-[rgb(100,116,139)]">Confirmed</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTasks = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Tasks</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors">
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>
      
      <div className="space-y-3">
        {tasks.map(task => (
          <div key={task.id} className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-4">
            <div className="flex items-start gap-3">
              <button
                onClick={() => toggleTaskComplete(task.id)}
                className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                  task.completed 
                    ? 'bg-[rgb(34,139,34)] border-[rgb(34,139,34)] text-white' 
                    : 'border-[rgb(226,232,240)] hover:border-[rgb(34,139,34)]'
                }`}
                aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
              >
                {task.completed && <CheckCircle className="w-3 h-3" />}
              </button>
              <div className="flex-1">
                <h3 className={`font-medium ${task.completed ? 'line-through text-[rgb(100,116,139)]' : 'text-[rgb(15,23,42)]'}`}>
                  {task.title}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-[rgb(100,116,139)]">
                  <span>Assigned to: {task.assignedTo}</span>
                  <span>Due: {task.dueDate}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderMeals = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Meal Plan</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors">
          <Plus className="w-4 h-4" />
          Add Meal
        </button>
      </div>
      
      <div className="space-y-3">
        {meals.map(meal => (
          <div key={meal.id} className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-[rgb(15,23,42)]">{meal.name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-[rgb(100,116,139)]">
                  <span className="capitalize">{meal.day} {meal.time}</span>
                  <span>By: {meal.assignedTo}</span>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                meal.time === 'breakfast' ? 'bg-yellow-100 text-yellow-800' :
                meal.time === 'lunch' ? 'bg-blue-100 text-blue-800' :
                meal.time === 'dinner' ? 'bg-purple-100 text-purple-800' :
                'bg-green-100 text-green-800'
              }`}>
                {meal.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderMembers = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Group Members</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors">
          <UserPlus className="w-4 h-4" />
          Invite
        </button>
      </div>
      
      <div className="space-y-3">
        {members.map(member => (
          <div key={member.id} className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[rgb(34,139,34)] rounded-full flex items-center justify-center text-white font-semibold">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium text-[rgb(15,23,42)]">{member.name}</h3>
                  <p className="text-sm text-[rgb(100,116,139)]">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {member.rsvpStatus === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateRSVP(member.id, 'accepted')}
                      className="p-2 text-[rgb(34,139,34)] hover:bg-green-50 rounded-lg transition-colors"
                      aria-label="Accept RSVP"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updateRSVP(member.id, 'declined')}
                      className="p-2 text-[rgb(239,68,68)] hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Decline RSVP"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  member.rsvpStatus === 'accepted' ? 'bg-green-100 text-green-800' :
                  member.rsvpStatus === 'declined' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {member.rsvpStatus}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderChat = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Group Chat</h2>
      
      <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] h-96 flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map(message => (
            <div key={message.id} className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'You' 
                  ? 'bg-[rgb(34,139,34)] text-white' 
                  : 'bg-[rgb(241,245,249)] text-[rgb(15,23,42)]'
              }`}>
                <p className="text-sm">{message.message}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'You' ? 'text-green-100' : 'text-[rgb(100,116,139)]'
                }`}>
                  {message.sender} • {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-[rgb(226,232,240)]">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderWeather = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Weather Forecast</h2>
      
      <div className="grid gap-4">
        {weather.map((day, index) => {
          const WeatherIcon = getWeatherIcon(day.condition)
          return (
            <div key={index} className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <WeatherIcon className="w-8 h-8 text-[rgb(245,158,11)]" />
                  <div>
                    <h3 className="font-medium text-[rgb(15,23,42)]">{day.day}</h3>
                    <p className="text-sm text-[rgb(100,116,139)] capitalize">{day.condition}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-[rgb(15,23,42)]">{day.high}°</div>
                  <div className="text-sm text-[rgb(100,116,139)]">{day.low}°</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview()
      case 'tasks': return renderTasks()
      case 'meals': return renderMeals()
      case 'members': return renderMembers()
      case 'chat': return renderChat()
      case 'weather': return renderWeather()
      default: return renderOverview()
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] font-medium">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-[rgb(226,232,240)] p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-[rgb(15,23,42)]">{trip.name}</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-[rgb(241,245,249)] rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[rgb(226,232,240)] p-4">
          <div className="grid grid-cols-2 gap-2">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[rgb(34,139,34)] text-white'
                      : 'text-[rgb(100,116,139)] hover:bg-[rgb(241,245,249)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 bg-white border-r border-[rgb(226,232,240)] min-h-screen">
          <div className="p-6">
            <h1 className="text-xl font-semibold text-[rgb(15,23,42)] mb-6">{trip.name}</h1>
            <nav className="space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[rgb(34,139,34)] text-white'
                        : 'text-[rgb(100,116,139)] hover:bg-[rgb(241,245,249)]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

// Mock data
const DEFAULT_TRIP: Trip = {
  id: '1',
  name: 'Moab Adventure',
  location: 'Moab, Utah',
  startDate: '2024-03-15',
  endDate: '2024-03-18',
  status: 'planning'
}

const DEFAULT_MEMBERS: GroupMember[] = [
  { id: '1', name: 'John Smith', email: 'john@example.com', rsvpStatus: 'accepted' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', rsvpStatus: 'accepted' },
  { id: '3', name: 'Mike Wilson', email: 'mike@example.com', rsvpStatus: 'pending' },
  { id: '4', name: 'Emily Davis', email: 'emily@example.com', rsvpStatus: 'declined' }
]

const DEFAULT_TASKS: Task[] = [
  { id: '1', title: 'Book campsite reservations', assignedTo: 'John Smith', dueDate: '2024-03-01', completed: true, category: 'logistics' },
  { id: '2', title: 'Prepare Saturday lunch', assignedTo: 'Sarah Johnson', dueDate: '2024-03-14', completed: false, category: 'food' },
  { id: '3', title: 'Bring firewood', assignedTo: 'Mike Wilson', dueDate: '2024-03-15', completed: false, category: 'equipment' },
  { id: '4', title: 'Plan hiking routes', assignedTo: 'Emily Davis', dueDate: '2024-03-10', completed: false, category: 'logistics' }
]

const DEFAULT_MEALS: Meal[] = [
  { id: '1', name: 'Pancakes & Bacon', day: 'Saturday', time: 'breakfast', assignedTo: 'John Smith' },
  { id: '2', name: 'Trail Mix Sandwiches', day: 'Saturday', time: 'lunch', assignedTo: 'Sarah Johnson' },
  { id: '3', name: 'Campfire Chili', day: 'Saturday', time: 'dinner', assignedTo: 'Mike Wilson' },
  { id: '4', name: 'Oatmeal & Coffee', day: 'Sunday', time: 'breakfast', assignedTo: 'Emily Davis' }
]

const DEFAULT_MESSAGES: ChatMessage[] = [
  { id: '1', sender: 'John Smith', message: 'Hey everyone! Excited for the trip!', timestamp: '2024-02-20T10:00:00Z' },
  { id: '2', sender: 'Sarah Johnson', message: 'Same here! I\'ll bring extra snacks', timestamp: '2024-02-20T10:15:00Z' },
  { id: '3', sender: 'You', message: 'Perfect! Don\'t forget to check the weather', timestamp: '2024-02-20T10:30:00Z' }
]

const DEFAULT_WEATHER: WeatherData[] = [
  { day: 'Friday', condition: 'sunny', high: 68, low: 42 },
  { day: 'Saturday', condition: 'cloudy', high: 65, low: 38 },
  { day: 'Sunday', condition: 'sunny', high: 72, low: 45 },
  { day: 'Monday', condition: 'rainy', high: 58, low: 35 }
]

// Demo component for page.tsx
export default function TripPlannerDemo() {
  return <TripPlanner />
}