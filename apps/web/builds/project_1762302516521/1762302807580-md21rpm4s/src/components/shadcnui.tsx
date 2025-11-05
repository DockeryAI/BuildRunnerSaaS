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
  Search,
  Filter,
  Bell,
  Settings,
  Home,
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

interface Task {
  id: string
  title: string
  assignee: string
  category: 'food' | 'equipment' | 'logistics'
  completed: boolean
  dueDate: string
}

interface Message {
  id: string
  sender: string
  content: string
  timestamp: string
  avatar: string
}

interface OffRoadPlannerProps {
  initialTrips?: Trip[]
  currentUser?: string
}

export function OffRoadPlanner({
  initialTrips = DEFAULT_TRIPS,
  currentUser = 'You'
}: OffRoadPlannerProps = {}) {
  const [activeTab, setActiveTab] = useState('trips')
  const [trips, setTrips] = useState<Trip[]>(initialTrips)
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS)
  const [messages, setMessages] = useState<Message[]>(DEFAULT_MESSAGES)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filteredTrips = trips.filter(trip =>
    trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleTaskToggle = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: currentUser,
      content,
      timestamp: new Date().toISOString(),
      avatar: '/api/placeholder/32/32'
    }
    setMessages(prev => [...prev, newMessage])
  }

  return (
    <div className="min-h-screen bg-[#ffffff] font-medium">
      {/* Header */}
      <header className="bg-[#ffffff] border-b border-[#e2e8f0] px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#228b22] rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#ffffff]" />
            </div>
            <h1 className="text-lg font-semibold text-[#0f172a]">OffRoad Planner</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="p-2 hover:bg-[#f8fafc] rounded-lg transition-colors duration-150"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-[#0f172a]" />
            </button>
            <button 
              className="p-2 hover:bg-[#f8fafc] rounded-lg transition-colors duration-150"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-[#0f172a]" />
            </button>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      {activeTab === 'trips' && (
        <div className="px-4 py-3 bg-[#ffffff] border-b border-[#e2e8f0]">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#64748b]" />
              <input
                type="text"
                placeholder="Search trips or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-[#0f172a] placeholder-[#64748b] focus:border-[#228b22] focus:outline-none focus:ring-1 focus:ring-[#228b22]/50 transition-all duration-150"
                aria-label="Search trips"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-lg border transition-all duration-150 ${
                showFilters 
                  ? 'bg-[#228b22] border-[#228b22] text-[#ffffff]' 
                  : 'bg-[#ffffff] border-[#e2e8f0] text-[#0f172a] hover:bg-[#f8fafc]'
              }`}
              aria-label="Toggle filters"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pb-20">
        {activeTab === 'trips' && (
          <div className="p-4 space-y-4">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 bg-[#228b22] text-[#ffffff] rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all duration-150">
                <Plus className="w-5 h-5" />
                <span className="font-medium">New Trip</span>
              </button>
              <button className="p-4 bg-[#f97316] text-[#ffffff] rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all duration-150">
                <MapPin className="w-5 h-5" />
                <span className="font-medium">Find Trails</span>
              </button>
            </div>

            {/* Trips List */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-[#0f172a]">Your Trips</h2>
              {filteredTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-[#ffffff] border border-[#e2e8f0] rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-[#f8fafc] rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-[#228b22]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#0f172a] truncate">{trip.name}</h3>
                      <p className="text-sm text-[#64748b] truncate">{trip.location}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-[#64748b]" />
                          <span className="text-xs text-[#64748b]">{trip.startDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-[#64748b]" />
                          <span className="text-xs text-[#64748b]">{trip.memberCount}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      trip.status === 'confirmed' 
                        ? 'bg-[#228b22]/20 text-[#228b22] border border-[#228b22]/30'
                        : trip.status === 'planning'
                        ? 'bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/30'
                        : 'bg-[#64748b]/20 text-[#64748b] border border-[#64748b]/30'
                    }`}>
                      {trip.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#0f172a]">Trip Tasks</h2>
              <button className="p-2 bg-[#228b22] text-[#ffffff] rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all duration-150">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-[#ffffff] border border-[#e2e8f0] rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleTaskToggle(task.id)}
                      className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-150 ${
                        task.completed
                          ? 'bg-[#228b22] border-[#228b22]'
                          : 'border-[#e2e8f0] hover:border-[#228b22]'
                      }`}
                      aria-label={`Mark task ${task.completed ? 'incomplete' : 'complete'}`}
                    >
                      {task.completed && <CheckSquare className="w-3 h-3 text-[#ffffff]" />}
                    </button>
                    <div className="flex-1">
                      <h3 className={`font-medium ${task.completed ? 'text-[#64748b] line-through' : 'text-[#0f172a]'}`}>
                        {task.title}
                      </h3>
                      <p className="text-sm text-[#64748b]">Assigned to {task.assignee}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.category === 'food'
                            ? 'bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/30'
                            : task.category === 'equipment'
                            ? 'bg-[#228b22]/20 text-[#228b22] border border-[#228b22]/30'
                            : 'bg-[#64748b]/20 text-[#64748b] border border-[#64748b]/30'
                        }`}>
                          {task.category}
                        </div>
                        <span className="text-xs text-[#64748b]">Due {task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="flex flex-col h-[calc(100vh-140px)]">
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.sender === currentUser ? 'flex-row-reverse' : ''}`}
                >
                  <div className="w-8 h-8 bg-[#228b22] rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-[#ffffff]" />
                  </div>
                  <div className={`max-w-[80%] ${message.sender === currentUser ? 'text-right' : ''}`}>
                    <div className={`p-3 rounded-xl ${
                      message.sender === currentUser
                        ? 'bg-[#228b22] text-[#ffffff]'
                        : 'bg-[#f8fafc] text-[#0f172a]'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <p className="text-xs text-[#64748b] mt-1">
                      {message.sender} • {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-[#e2e8f0] bg-[#ffffff]">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-[#0f172a] placeholder-[#64748b] focus:border-[#228b22] focus:outline-none focus:ring-1 focus:ring-[#228b22]/50 transition-all duration-150"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      handleSendMessage(e.currentTarget.value)
                      e.currentTarget.value = ''
                    }
                  }}
                />
                <button className="px-4 py-2.5 bg-[#228b22] text-[#ffffff] rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all duration-150">
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="p-4 space-y-4">
            <h2 className="text-lg font-semibold text-[#0f172a]">Trip Menu</h2>
            <div className="space-y-3">
              {DEFAULT_MEALS.map((meal) => (
                <div
                  key={meal.id}
                  className="bg-[#ffffff] border border-[#e2e8f0] rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#f97316]/20 rounded-lg flex items-center justify-center">
                      <UtensilsCrossed className="w-5 h-5 text-[#f97316]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-[#0f172a]">{meal.name}</h3>
                      <p className="text-sm text-[#64748b]">{meal.day} • {meal.time}</p>
                      <p className="text-sm text-[#64748b] mt-1">Prepared by {meal.preparedBy}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#ffffff] border-t border-[#e2e8f0] px-4 py-2">
        <div className="flex items-center justify-around">
          {[
            { id: 'trips', icon: Home, label: 'Trips' },
            { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
            { id: 'chat', icon: MessageCircle, label: 'Chat' },
            { id: 'menu', icon: UtensilsCrossed, label: 'Menu' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-150 ${
                activeTab === tab.id
                  ? 'text-[#228b22]'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
              aria-label={tab.label}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

// Mock Data
const DEFAULT_TRIPS: Trip[] = [
  {
    id: '1',
    name: 'Moab Desert Adventure',
    location: 'Moab, Utah',
    startDate: 'Mar 15',
    endDate: 'Mar 17',
    memberCount: 8,
    status: 'confirmed',
    image: '/api/placeholder/300/200'
  },
  {
    id: '2',
    name: 'Black Hills Expedition',
    location: 'South Dakota',
    startDate: 'Apr 22',
    endDate: 'Apr 24',
    memberCount: 6,
    status: 'planning',
    image: '/api/placeholder/300/200'
  },
  {
    id: '3',
    name: 'Colorado Trail Run',
    location: 'Colorado Springs',
    startDate: 'May 10',
    endDate: 'May 12',
    memberCount: 10,
    status: 'planning',
    image: '/api/placeholder/300/200'
  }
]

const DEFAULT_TASKS: Task[] = [
  {
    id: '1',
    title: 'Bring firewood for Saturday night',
    assignee: 'Mike Johnson',
    category: 'logistics',
    completed: false,
    dueDate: 'Mar 15'
  },
  {
    id: '2',
    title: 'Prepare lunch for Sunday',
    assignee: 'Sarah Chen',
    category: 'food',
    completed: true,
    dueDate: 'Mar 16'
  },
  {
    id: '3',
    title: 'Check tire pressure and spare',
    assignee: 'Alex Rivera',
    category: 'equipment',
    completed: false,
    dueDate: 'Mar 14'
  }
]

const DEFAULT_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'Mike Johnson',
    content: 'Hey everyone! Just confirmed the campsite reservation for Moab. We\'re all set!',
    timestamp: '2024-03-10T10:30:00Z',
    avatar: '/api/placeholder/32/32'
  },
  {
    id: '2',
    sender: 'Sarah Chen',
    content: 'Awesome! I\'ll start prepping the meal plan. Any dietary restrictions I should know about?',
    timestamp: '2024-03-10T10:45:00Z',
    avatar: '/api/placeholder/32/32'
  },
  {
    id: '3',
    sender: 'Alex Rivera',
    content: 'Weather looks perfect for the weekend. Clear skies and 70s!',
    timestamp: '2024-03-10T11:15:00Z',
    avatar: '/api/placeholder/32/32'
  }
]

const DEFAULT_MEALS = [
  {
    id: '1',
    name: 'Campfire Breakfast Burritos',
    day: 'Saturday',
    time: '8:00 AM',
    preparedBy: 'Sarah Chen'
  },
  {
    id: '2',
    name: 'Trail Mix Lunch',
    day: 'Saturday',
    time: '12:00 PM',
    preparedBy: 'Mike Johnson'
  },
  {
    id: '3',
    name: 'BBQ Dinner',
    day: 'Saturday',
    time: '6:00 PM',
    preparedBy: 'Alex Rivera'
  },
  {
    id: '4',
    name: 'Pancake Breakfast',
    day: 'Sunday',
    time: '9:00 AM',
    preparedBy: 'Sarah Chen'
  }
]

// Demo component for page.tsx
export default function OffRoadPlannerDemo() {
  return <OffRoadPlanner />
}