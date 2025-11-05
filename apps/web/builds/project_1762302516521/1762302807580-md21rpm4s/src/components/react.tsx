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
  Navigation,
  Settings,
  Bell
} from 'lucide-react'

interface Trip {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  participants: number
  status: 'planning' | 'confirmed' | 'active' | 'completed'
}

interface Task {
  id: string
  title: string
  assignee: string
  category: 'food' | 'equipment' | 'logistics'
  completed: boolean
  dueDate: string
}

interface WeatherData {
  day: string
  temp: number
  condition: 'sunny' | 'cloudy' | 'rainy'
  icon: any
}

interface Meal {
  id: string
  name: string
  day: string
  time: 'breakfast' | 'lunch' | 'dinner'
  assignee: string
}

interface Message {
  id: string
  sender: string
  message: string
  timestamp: string
}

const MOCK_TRIPS: Trip[] = [
  {
    id: '1',
    name: 'Moab Desert Adventure',
    location: 'Moab, Utah',
    startDate: '2024-03-15',
    endDate: '2024-03-17',
    participants: 6,
    status: 'planning'
  },
  {
    id: '2',
    name: 'Black Hills Expedition',
    location: 'South Dakota',
    startDate: '2024-04-20',
    endDate: '2024-04-22',
    participants: 4,
    status: 'confirmed'
  }
]

const MOCK_TASKS: Task[] = [
  { id: '1', title: 'Saturday Lunch Prep', assignee: 'Mike', category: 'food', completed: false, dueDate: '2024-03-15' },
  { id: '2', title: 'Firewood Collection', assignee: 'Sarah', category: 'logistics', completed: true, dueDate: '2024-03-15' },
  { id: '3', title: 'Camping Gear Check', assignee: 'John', category: 'equipment', completed: false, dueDate: '2024-03-14' }
]

const MOCK_WEATHER: WeatherData[] = [
  { day: 'Fri', temp: 72, condition: 'sunny', icon: Sun },
  { day: 'Sat', temp: 68, condition: 'cloudy', icon: Cloud },
  { day: 'Sun', temp: 65, condition: 'rainy', icon: CloudRain }
]

const MOCK_MEALS: Meal[] = [
  { id: '1', name: 'Pancakes & Bacon', day: 'Saturday', time: 'breakfast', assignee: 'Mike' },
  { id: '2', name: 'Trail Sandwiches', day: 'Saturday', time: 'lunch', assignee: 'Sarah' },
  { id: '3', name: 'Campfire Chili', day: 'Saturday', time: 'dinner', assignee: 'John' }
]

const MOCK_MESSAGES: Message[] = [
  { id: '1', sender: 'Mike', message: 'Just confirmed the campsite reservation!', timestamp: '10:30 AM' },
  { id: '2', sender: 'Sarah', message: 'Weather looks good for the weekend', timestamp: '11:15 AM' },
  { id: '3', sender: 'John', message: 'Bringing extra recovery gear just in case', timestamp: '2:45 PM' }
]

export function OffRoadTripPlanner() {
  const [activeTab, setActiveTab] = useState<'trips' | 'tasks' | 'weather' | 'meals' | 'chat'>('trips')
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(MOCK_TRIPS[0])
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS)
  const [newMessage, setNewMessage] = useState('')

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  const sendMessage = () => {
    if (!newMessage.trim()) return
    
    const message: Message = {
      id: Date.now().toString(),
      sender: 'You',
      message: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    
    setNewMessage('')
    // In real app, would send to backend
  }

  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'planning': return 'bg-[rgb(249,115,22)] text-white'
      case 'confirmed': return 'bg-[rgb(34,139,34)] text-white'
      case 'active': return 'bg-[rgb(34, 139, 34)] text-white'
      case 'completed': return 'bg-[rgb(255, 255, 255)]0 text-white'
      default: return 'bg-gray-200 text-gray-800'
    }
  }

  const getCategoryColor = (category: Task['category']) => {
    switch (category) {
      case 'food': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'equipment': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'logistics': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-[rgb(248, 250, 252)] text-gray-800 border-[rgb(226, 232, 240)]'
    }
  }

  const renderTrips = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Your Trips</h2>
        <button 
          className="p-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors"
          aria-label="Add new trip"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      
      {MOCK_TRIPS.map((trip) => (
        <div 
          key={trip.id}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedTrip?.id === trip.id 
              ? 'border-[rgb(34,139,34)] bg-[rgb(34,139,34)]/5' 
              : 'border-[rgb(226,232,240)] bg-white hover:border-[rgb(34,139,34)]/50'
          }`}
          onClick={() => setSelectedTrip(trip)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setSelectedTrip(trip)}
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-[rgb(15,23,42)]">{trip.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
              {trip.status}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{trip.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(trip.startDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{trip.participants}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderTasks = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Trip Tasks</h2>
        <button 
          className="p-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors"
          aria-label="Add new task"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      
      {tasks.map((task) => (
        <div 
          key={task.id}
          className="p-4 bg-white rounded-xl border border-[rgb(226,232,240)] hover:border-[rgb(34,139,34)]/50 transition-colors"
        >
          <div className="flex items-start gap-3">
            <button
              onClick={() => toggleTask(task.id)}
              className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                task.completed 
                  ? 'bg-[rgb(34,139,34)] border-[rgb(34,139,34)] text-white' 
                  : 'border-gray-300 hover:border-[rgb(34,139,34)]'
              }`}
              aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
            >
              {task.completed && <CheckSquare className="w-3 h-3" />}
            </button>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-[rgb(15,23,42)]'}`}>
                  {task.title}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(task.category)}`}>
                  {task.category}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Assigned to: {task.assignee}</span>
                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderWeather = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Weather Forecast</h2>
      
      <div className="grid grid-cols-3 gap-3">
        {MOCK_WEATHER.map((weather, index) => {
          const IconComponent = weather.icon
          return (
            <div key={index} className="p-4 bg-white rounded-xl border border-[rgb(226,232,240)] text-center">
              <div className="text-sm font-medium text-gray-600 mb-2">{weather.day}</div>
              <IconComponent className="w-8 h-8 mx-auto mb-2 text-[rgb(249,115,22)]" />
              <div className="text-lg font-semibold text-[rgb(15,23,42)]">{weather.temp}°F</div>
              <div className="text-xs text-gray-500 capitalize">{weather.condition}</div>
            </div>
          )
        })}
      </div>
      
      <div className="p-4 bg-[rgb(248,250,252)] rounded-xl border border-[rgb(226,232,240)]">
        <h3 className="font-medium text-[rgb(15,23,42)] mb-2">Trail Conditions</h3>
        <p className="text-sm text-gray-600">
          Dry conditions expected. Some muddy sections possible after recent rain. 
          Recommend bringing recovery gear for challenging terrain.
        </p>
      </div>
    </div>
  )

  const renderMeals = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Meal Planning</h2>
        <button 
          className="p-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors"
          aria-label="Add new meal"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      
      {MOCK_MEALS.map((meal) => (
        <div 
          key={meal.id}
          className="p-4 bg-white rounded-xl border border-[rgb(226,232,240)] hover:border-[rgb(34,139,34)]/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-[rgb(15,23,42)]">{meal.name}</h3>
            <span className="px-2 py-1 bg-[rgb(249,115,22)]/10 text-[rgb(249,115,22)] rounded-full text-xs font-medium border border-[rgb(249,115,22)]/20">
              {meal.time}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{meal.day}</span>
            <span>•</span>
            <span>Prepared by: {meal.assignee}</span>
          </div>
        </div>
      ))}
    </div>
  )

  const renderChat = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Group Chat</h2>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {MOCK_MESSAGES.map((message) => (
          <div 
            key={message.id}
            className={`p-3 rounded-xl max-w-[80%] ${
              message.sender === 'You' 
                ? 'bg-[rgb(34,139,34)] text-white ml-auto' 
                : 'bg-[rgb(248,250,252)] text-[rgb(15,23,42)]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium opacity-75">{message.sender}</span>
              <span className="text-xs opacity-60">{message.timestamp}</span>
            </div>
            <p className="text-sm">{message.message}</p>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 bg-white border border-[rgb(226,232,240)] rounded-xl text-[rgb(15,23,42)] placeholder-gray-400 focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all"
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="px-4 py-3 bg-[rgb(34,139,34)] text-white rounded-xl hover:bg-[rgb(34,139,34)]/90 transition-colors font-medium"
          aria-label="Send message"
        >
          Send
        </button>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'trips': return renderTrips()
      case 'tasks': return renderTasks()
      case 'weather': return renderWeather()
      case 'meals': return renderMeals()
      case 'chat': return renderChat()
      default: return renderTrips()
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] font-['Inter',system-ui,sans-serif]">
      {/* Header */}
      <header className="bg-white border-b border-[rgb(226,232,240)] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Navigation className="w-6 h-6 text-[rgb(34,139,34)]" />
            <h1 className="text-lg font-semibold text-[rgb(15,23,42)]">Trail Planner</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              className="p-2 text-gray-600 hover:text-[rgb(34,139,34)] transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>
            <button 
              className="p-2 text-gray-600 hover:text-[rgb(34,139,34)] transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 pb-20">
        {selectedTrip && (
          <div className="mb-6 p-4 bg-white rounded-xl border border-[rgb(226,232,240)]">
            <h2 className="font-semibold text-[rgb(15,23,42)] mb-1">{selectedTrip.name}</h2>
            <p className="text-sm text-gray-600">{selectedTrip.location} • {new Date(selectedTrip.startDate).toLocaleDateString()}</p>
          </div>
        )}
        
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[rgb(226,232,240)] px-4 py-2">
        <div className="flex items-center justify-around">
          {[
            { id: 'trips', icon: MapPin, label: 'Trips' },
            { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
            { id: 'weather', icon: Cloud, label: 'Weather' },
            { id: 'meals', icon: UtensilsCrossed, label: 'Meals' },
            { id: 'chat', icon: MessageCircle, label: 'Chat' }
          ].map((tab) => {
            const IconComponent = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors min-h-[44px] min-w-[44px] ${
                  isActive 
                    ? 'text-[rgb(34,139,34)] bg-[rgb(34,139,34)]/10' 
                    : 'text-gray-600 hover:text-[rgb(34,139,34)]'
                }`}
                aria-label={tab.label}
              >
                <IconComponent className="w-5 h-5" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default function OffRoadTripPlannerDemo() {
  return <OffRoadTripPlanner />
}