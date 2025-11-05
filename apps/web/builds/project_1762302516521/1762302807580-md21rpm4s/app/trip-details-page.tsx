'use client'

import { useState, useEffect } from 'react'
import { 
  MapPin, 
  Calendar, 
  Users, 
  MessageCircle, 
  UtensilsCrossed, 
  CheckSquare, 
  Cloud, 
  ArrowLeft,
  Edit3,
  Share2,
  Settings,
  Plus,
  Clock,
  Thermometer,
  Wind,
  Droplets
} from 'lucide-react'

interface TripMember {
  id: string
  name: string
  avatar: string
  status: 'confirmed' | 'pending' | 'declined'
  role?: string
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
  day: string
  high: number
  low: number
  condition: string
  precipitation: number
  wind: number
}

interface ChatMessage {
  id: string
  sender: string
  message: string
  timestamp: string
  avatar: string
}

interface TripDetailsPageProps {
  tripId?: string
  initialData?: {
    title: string
    location: string
    startDate: string
    endDate: string
    description: string
  }
}

export function TripDetailsPage({ 
  tripId = 'trip-1',
  initialData = {
    title: 'Moab Desert Adventure',
    location: 'Moab, Utah',
    startDate: '2024-03-15',
    endDate: '2024-03-17',
    description: 'Epic off-road adventure through the red rocks of Moab'
  }
}: TripDetailsPageProps = {}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'meals' | 'chat' | 'weather'>('overview')
  const [members] = useState<TripMember[]>([
    { id: '1', name: 'Alex Chen', avatar: 'AC', status: 'confirmed', role: 'Trip Leader' },
    { id: '2', name: 'Sarah Johnson', avatar: 'SJ', status: 'confirmed', role: 'Navigator' },
    { id: '3', name: 'Mike Rodriguez', avatar: 'MR', status: 'pending' },
    { id: '4', name: 'Emma Wilson', avatar: 'EW', status: 'confirmed' },
    { id: '5', name: 'David Kim', avatar: 'DK', status: 'declined' }
  ])

  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Saturday Lunch Prep', assignedTo: 'Sarah Johnson', dueDate: '2024-03-15', completed: false, category: 'food' },
    { id: '2', title: 'Firewood Collection', assignedTo: 'Mike Rodriguez', dueDate: '2024-03-15', completed: true, category: 'logistics' },
    { id: '3', title: 'First Aid Kit Check', assignedTo: 'Alex Chen', dueDate: '2024-03-14', completed: false, category: 'safety' },
    { id: '4', title: 'Camping Gear Setup', assignedTo: 'Emma Wilson', dueDate: '2024-03-15', completed: false, category: 'equipment' }
  ])

  const [meals] = useState<Meal[]>([
    { id: '1', name: 'Campfire Breakfast Burritos', day: 'Saturday', time: 'breakfast', assignedTo: 'Alex Chen', ingredients: ['Eggs', 'Tortillas', 'Cheese', 'Sausage'] },
    { id: '2', name: 'Trail Mix & Sandwiches', day: 'Saturday', time: 'lunch', assignedTo: 'Sarah Johnson', ingredients: ['Bread', 'Turkey', 'Cheese', 'Trail Mix'] },
    { id: '3', name: 'BBQ Steaks & Veggies', day: 'Saturday', time: 'dinner', assignedTo: 'Mike Rodriguez', ingredients: ['Steaks', 'Bell Peppers', 'Onions', 'Potatoes'] },
    { id: '4', name: 'Pancakes & Coffee', day: 'Sunday', time: 'breakfast', assignedTo: 'Emma Wilson', ingredients: ['Pancake Mix', 'Syrup', 'Coffee', 'Bacon'] }
  ])

  const [weather] = useState<WeatherData[]>([
    { day: 'Friday', high: 72, low: 45, condition: 'Sunny', precipitation: 0, wind: 8 },
    { day: 'Saturday', high: 75, low: 48, condition: 'Partly Cloudy', precipitation: 10, wind: 12 },
    { day: 'Sunday', high: 68, low: 42, condition: 'Clear', precipitation: 0, wind: 6 }
  ])

  const [chatMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'Alex Chen', message: 'Hey everyone! Just confirmed our campsite reservation. We\'re all set!', timestamp: '2:30 PM', avatar: 'AC' },
    { id: '2', sender: 'Sarah Johnson', message: 'Awesome! I\'ll pick up the lunch supplies tomorrow. Any dietary restrictions I should know about?', timestamp: '2:45 PM', avatar: 'SJ' },
    { id: '3', sender: 'Mike Rodriguez', message: 'I\'m vegetarian, but I can handle my own meals if needed', timestamp: '3:15 PM', avatar: 'MR' },
    { id: '4', sender: 'Emma Wilson', message: 'No worries Mike! I\'ll make sure we have veggie options for everything', timestamp: '3:20 PM', avatar: 'EW' }
  ])

  const [newMessage, setNewMessage] = useState('')

  const toggleTaskComplete = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  const sendMessage = () => {
    if (newMessage.trim()) {
      // In real app, this would send to backend
      setNewMessage('')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-[rgb(34,139,34)] text-white'
      case 'pending': return 'bg-[rgb(249,115,22)] text-white'
      case 'declined': return 'bg-[rgb(220,38,38)] text-white'
      default: return 'bg-[rgb(226,232,240)] text-[rgb(15,23,42)]'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'food': return 'bg-[rgb(249,115,22)]/10 text-[rgb(249,115,22)] border-[rgb(249,115,22)]/20'
      case 'equipment': return 'bg-[rgb(34,139,34)]/10 text-[rgb(34,139,34)] border-[rgb(34,139,34)]/20'
      case 'logistics': return 'bg-[rgb(34, 139, 34)]/10 text-[rgb(34, 139, 34)] border-[rgb(34, 139, 34)]/20'
      case 'safety': return 'bg-[rgb(220,38,38)]/10 text-[rgb(220,38,38)] border-[rgb(220,38,38)]/20'
      default: return 'bg-[rgb(226,232,240)] text-[rgb(15,23,42)]'
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      {/* Header */}
      <div className="bg-[rgb(34,139,34)] text-white p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between mb-3">
          <button 
            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-150"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <button 
              className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-150"
              aria-label="Share trip"
            >
              <Share2 size={20} />
            </button>
            <button 
              className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-150"
              aria-label="Trip settings"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">{initialData.title}</h1>
            <button 
              className="p-1 hover:bg-white/10 rounded transition-colors duration-150"
              aria-label="Edit trip"
            >
              <Edit3 size={16} />
            </button>
          </div>
          <div className="flex items-center gap-4 text-sm opacity-90">
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{initialData.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>Mar 15-17</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-[rgb(226,232,240)] sticky top-[88px] z-40">
        <div className="flex overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Users },
            { id: 'tasks', label: 'Tasks', icon: CheckSquare },
            { id: 'meals', label: 'Meals', icon: UtensilsCrossed },
            { id: 'chat', label: 'Chat', icon: MessageCircle },
            { id: 'weather', label: 'Weather', icon: Cloud }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-150 ${
                activeTab === id
                  ? 'border-[rgb(34,139,34)] text-[rgb(34,139,34)]'
                  : 'border-transparent text-[rgb(15,23,42)]/60 hover:text-[rgb(15,23,42)]'
              }`}
              aria-label={`View ${label.toLowerCase()}`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-20">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Trip Info */}
            <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6 shadow-md">
              <h2 className="text-lg font-semibold mb-3">Trip Details</h2>
              <p className="text-[rgb(15,23,42)]/70 mb-4">{initialData.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[rgb(15,23,42)]/60">Start Date</span>
                  <p className="font-medium">March 15, 2024</p>
                </div>
                <div>
                  <span className="text-[rgb(15,23,42)]/60">End Date</span>
                  <p className="font-medium">March 17, 2024</p>
                </div>
              </div>
            </div>

            {/* Members */}
            <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Members ({members.filter(m => m.status === 'confirmed').length})</h2>
                <button 
                  className="p-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors duration-150"
                  aria-label="Add member"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[rgb(34,139,34)] text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {member.avatar}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        {member.role && (
                          <p className="text-xs text-[rgb(15,23,42)]/60">{member.role}</p>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                      {member.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-4 shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <CheckSquare size={16} className="text-[rgb(34,139,34)]" />
                  <span className="text-sm text-[rgb(15,23,42)]/60">Tasks</span>
                </div>
                <p className="text-2xl font-semibold">{tasks.filter(t => t.completed).length}/{tasks.length}</p>
              </div>
              <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-4 shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <UtensilsCrossed size={16} className="text-[rgb(249,115,22)]" />
                  <span className="text-sm text-[rgb(15,23,42)]/60">Meals</span>
                </div>
                <p className="text-2xl font-semibold">{meals.length}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Trip Tasks</h2>
              <button 
                className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors duration-150 text-sm font-medium"
                aria-label="Add new task"
              >
                Add Task
              </button>
            </div>
            
            {tasks.map((task) => (
              <div key={task.id} className="bg-white border border-[rgb(226,232,240)] rounded-xl p-4 shadow-md">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors duration-150 ${
                      task.completed
                        ? 'bg-[rgb(34,139,34)] border-[rgb(34,139,34)] text-white'
                        : 'border-[rgb(226,232,240)] hover:border-[rgb(34,139,34)]'
                    }`}
                    aria-label={`Mark task ${task.completed ? 'incomplete' : 'complete'}`}
                  >
                    {task.completed && <CheckSquare size={12} />}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-medium ${task.completed ? 'line-through text-[rgb(15,23,42)]/50' : ''}`}>
                        {task.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(task.category)}`}>
                        {task.category}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-[rgb(15,23,42)]/60">
                      <div className="flex items-center gap-1">
                        <Users size={12} />
                        <span>{task.assignedTo}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'meals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Meal Plan</h2>
              <button 
                className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors duration-150 text-sm font-medium"
                aria-label="Add new meal"
              >
                Add Meal
              </button>
            </div>
            
            {['Saturday', 'Sunday'].map((day) => (
              <div key={day} className="space-y-3">
                <h3 className="font-semibold text-[rgb(15,23,42)]/80">{day}</h3>
                {meals
                  .filter(meal => meal.day === day)
                  .map((meal) => (
                    <div key={meal.id} className="bg-white border border-[rgb(226,232,240)] rounded-xl p-4 shadow-md">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{meal.name}</h4>
                          <p className="text-sm text-[rgb(15,23,42)]/60 capitalize">{meal.time}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{meal.assignedTo}</p>
                          <p className="text-xs text-[rgb(15,23,42)]/60">Chef</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-[rgb(15,23,42)]/60 mb-2">Ingredients:</p>
                        <div className="flex flex-wrap gap-2">
                          {meal.ingredients.map((ingredient, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-[rgb(248,250,252)] text-[rgb(15,23,42)] rounded text-xs border border-[rgb(226,232,240)]"
                            >
                              {ingredient}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Group Chat</h2>
            
            <div className="bg-white border border-[rgb(226,232,240)] rounded-xl shadow-md">
              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {chatMessages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <div className="w-8 h-8 bg-[rgb(34,139,34)] text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {message.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{message.sender}</span>
                        <span className="text-xs text-[rgb(15,23,42)]/60">{message.timestamp}</span>
                      </div>
                      <p className="text-sm text-[rgb(15,23,42)]/80">{message.message}</p>
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
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-[rgb(226,232,240)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/20 focus:border-[rgb(34,139,34)]"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    aria-label="Type message"
                  />
                  <button
                    onClick={sendMessage}
                    className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors duration-150 text-sm font-medium"
                    aria-label="Send message"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'weather' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Weather Forecast</h2>
            
            {weather.map((day, index) => (
              <div key={index} className="bg-white border border-[rgb(226,232,240)] rounded-xl p-4 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{day.day}</h3>
                  <span className="text-sm text-[rgb(15,23,42)]/60">{day.condition}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Thermometer size={16} className="text-[rgb(249,115,22)]" />
                      <span className="text-sm">Temperature</span>
                    </div>
                    <p className="text-lg font-semibold">{day.high}°F / {day.low}°F</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Wind size={16} className="text-[rgb(34, 139, 34)]" />
                      <span className="text-sm">Wind</span>
                    </div>
                    <p className="text-lg font-semibold">{day.wind} mph</p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-[rgb(226,232,240)]">
                  <div className="flex items-center gap-2">
                    <Droplets size={16} className="text-[rgb(34, 139, 34)]" />
                    <span className="text-sm">Precipitation: {day.precipitation}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function TripDetailsPageDemo() {
  return <TripDetailsPage />
}