'use client'

import { useState, useEffect } from 'react'
import { MapPin, Users, Calendar, MessageCircle, Utensils, Cloud, CheckCircle, X, Plus, Edit3, Trash2, UserPlus, Send } from 'lucide-react'

interface Trip {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  participants: Participant[]
  tasks: Task[]
  meals: Meal[]
  weather: WeatherData[]
  messages: Message[]
}

interface Participant {
  id: string
  name: string
  email: string
  avatar: string
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
  date: string
  time: string
  assignedTo: string
  ingredients: string[]
}

interface WeatherData {
  date: string
  high: number
  low: number
  condition: string
  icon: string
}

interface Message {
  id: string
  sender: string
  content: string
  timestamp: string
  avatar: string
}

interface OffRoadTripPlannerProps {
  initialTrip?: Trip
  onSaveTrip?: (trip: Trip) => void
}

export function OffRoadTripPlanner({
  initialTrip,
  onSaveTrip = () => console.log('Trip saved')
}: OffRoadTripPlannerProps = {}) {
  const [activeTab, setActiveTab] = useState('overview')
  const [trip, setTrip] = useState<Trip>(initialTrip || DEFAULT_TRIP)
  const [newMessage, setNewMessage] = useState('')
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAddMeal, setShowAddMeal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)

  const handleRSVP = (participantId: string, status: 'accepted' | 'declined') => {
    setTrip(prev => ({
      ...prev,
      participants: prev.participants.map(p =>
        p.id === participantId ? { ...p, rsvpStatus: status } : p
      )
    }))
  }

  const handleTaskComplete = (taskId: string) => {
    setTrip(prev => ({
      ...prev,
      tasks: prev.tasks.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    }))
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    
    const message: Message = {
      id: Date.now().toString(),
      sender: 'You',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString(),
      avatar: '/api/placeholder/32/32'
    }
    
    setTrip(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }))
    setNewMessage('')
  }

  const TabButton = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 ${
        activeTab === id
          ? 'bg-[rgb(34,139,34)] text-white shadow-md'
          : 'text-[rgb(15,23,42)] hover:bg-[rgb(248,250,252)]'
      }`}
      aria-label={`Switch to ${label} tab`}
    >
      <Icon size={20} />
      <span className="text-xs font-medium">{label}</span>
    </button>
  )

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Trip Header */}
      <div className="bg-gradient-to-r from-[rgb(34,139,34)] to-[rgb(249,115,22)] rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">{trip.name}</h1>
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={16} />
          <span className="text-sm">{trip.location}</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span>{trip.startDate} - {trip.endDate}</span>
          <span>{trip.participants.length} participants</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-[rgb(226,232,240)] rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-[rgb(34,139,34)]" />
            <span className="text-sm font-medium">Tasks</span>
          </div>
          <div className="text-2xl font-bold text-[rgb(15,23,42)]">
            {trip.tasks.filter(t => t.completed).length}/{trip.tasks.length}
          </div>
        </div>
        <div className="bg-white border border-[rgb(226,232,240)] rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-[rgb(249,115,22)]" />
            <span className="text-sm font-medium">RSVP</span>
          </div>
          <div className="text-2xl font-bold text-[rgb(15,23,42)]">
            {trip.participants.filter(p => p.rsvpStatus === 'accepted').length}/{trip.participants.length}
          </div>
        </div>
      </div>

      {/* Weather Forecast */}
      <div className="bg-white border border-[rgb(226,232,240)] rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Cloud size={16} />
          Weather Forecast
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {trip.weather.map((day, index) => (
            <div key={index} className="text-center p-2 bg-[rgb(248,250,252)] rounded-lg">
              <div className="text-xs text-[rgb(15,23,42)] mb-1">{day.date}</div>
              <div className="text-2xl mb-1">{day.icon}</div>
              <div className="text-sm font-medium">{day.high}°/{day.low}°</div>
              <div className="text-xs text-gray-600">{day.condition}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderParticipants = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Participants</h2>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors duration-200 shadow-sm"
          aria-label="Invite new participant"
        >
          <UserPlus size={16} />
          <span className="text-sm font-medium">Invite</span>
        </button>
      </div>

      <div className="space-y-3">
        {trip.participants.map((participant) => (
          <div key={participant.id} className="bg-white border border-[rgb(226,232,240)] rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={participant.avatar}
                  alt={participant.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="font-medium text-[rgb(15,23,42)]">{participant.name}</div>
                  <div className="text-sm text-gray-600">{participant.email}</div>
                </div>
              </div>
              <div className="flex gap-2">
                {participant.rsvpStatus === 'pending' && (
                  <>
                    <button
                      onClick={() => handleRSVP(participant.id, 'accepted')}
                      className="px-3 py-1 bg-[rgb(34,139,34)] text-white rounded-full text-xs font-medium hover:bg-[rgb(34,139,34)]/90 transition-colors duration-200"
                      aria-label={`Accept RSVP for ${participant.name}`}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRSVP(participant.id, 'declined')}
                      className="px-3 py-1 bg-[rgb(220,38,38)] text-white rounded-full text-xs font-medium hover:bg-[rgb(220,38,38)]/90 transition-colors duration-200"
                      aria-label={`Decline RSVP for ${participant.name}`}
                    >
                      Decline
                    </button>
                  </>
                )}
                {participant.rsvpStatus === 'accepted' && (
                  <span className="px-3 py-1 bg-[rgb(34,139,34)]/20 text-[rgb(34,139,34)] rounded-full text-xs font-medium border border-[rgb(34,139,34)]/30">
                    Accepted
                  </span>
                )}
                {participant.rsvpStatus === 'declined' && (
                  <span className="px-3 py-1 bg-[rgb(220,38,38)]/20 text-[rgb(220,38,38)] rounded-full text-xs font-medium border border-[rgb(220,38,38)]/30">
                    Declined
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderTasks = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Tasks</h2>
        <button
          onClick={() => setShowAddTask(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors duration-200 shadow-sm"
          aria-label="Add new task"
        >
          <Plus size={16} />
          <span className="text-sm font-medium">Add Task</span>
        </button>
      </div>

      <div className="space-y-3">
        {trip.tasks.map((task) => (
          <div key={task.id} className="bg-white border border-[rgb(226,232,240)] rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <button
                  onClick={() => handleTaskComplete(task.id)}
                  className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200 ${
                    task.completed
                      ? 'bg-[rgb(34,139,34)] border-[rgb(34,139,34)] text-white'
                      : 'border-[rgb(226,232,240)] hover:border-[rgb(34,139,34)]'
                  }`}
                  aria-label={`Mark task ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                >
                  {task.completed && <CheckCircle size={12} />}
                </button>
                <div className="flex-1">
                  <div className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-[rgb(15,23,42)]'}`}>
                    {task.title}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Assigned to: {task.assignedTo} • Due: {task.dueDate}
                  </div>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                    task.category === 'food' ? 'bg-[rgb(249,115,22)]/20 text-[rgb(249,115,22)]' :
                    task.category === 'equipment' ? 'bg-blue-100 text-blue-700' :
                    task.category === 'logistics' ? 'bg-purple-100 text-purple-700' :
                    'bg-[rgb(248, 250, 252)] text-gray-700'
                  }`}>
                    {task.category}
                  </span>
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
        <h2 className="text-xl font-bold">Meal Planning</h2>
        <button
          onClick={() => setShowAddMeal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors duration-200 shadow-sm"
          aria-label="Add new meal"
        >
          <Plus size={16} />
          <span className="text-sm font-medium">Add Meal</span>
        </button>
      </div>

      <div className="space-y-3">
        {trip.meals.map((meal) => (
          <div key={meal.id} className="bg-white border border-[rgb(226,232,240)] rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-medium text-[rgb(15,23,42)]">{meal.name}</div>
                <div className="text-sm text-gray-600">{meal.date} at {meal.time}</div>
                <div className="text-sm text-[rgb(249,115,22)] mt-1">Assigned to: {meal.assignedTo}</div>
              </div>
              <Utensils size={20} className="text-[rgb(249,115,22)]" />
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Ingredients:</div>
              <div className="flex flex-wrap gap-2">
                {meal.ingredients.map((ingredient, index) => (
                  <span key={index} className="px-2 py-1 bg-[rgb(248,250,252)] text-[rgb(15,23,42)] rounded text-xs">
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderChat = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Group Chat</h2>
      
      <div className="bg-white border border-[rgb(226,232,240)] rounded-lg shadow-sm">
        <div className="h-96 overflow-y-auto p-4 space-y-3">
          {trip.messages.map((message) => (
            <div key={message.id} className="flex gap-3">
              <img
                src={message.avatar}
                alt={message.sender}
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-[rgb(15,23,42)]">{message.sender}</span>
                  <span className="text-xs text-gray-500">{message.timestamp}</span>
                </div>
                <div className="text-sm text-[rgb(15,23,42)]">{message.content}</div>
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
              className="flex-1 px-3 py-2 border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-gray-400 focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-200"
              aria-label="Type a message"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] font-medium">
      {/* Main Content */}
      <div className="pb-20">
        <div className="max-w-md mx-auto p-4">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'participants' && renderParticipants()}
          {activeTab === 'tasks' && renderTasks()}
          {activeTab === 'meals' && renderMeals()}
          {activeTab === 'chat' && renderChat()}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[rgb(226,232,240)] shadow-lg">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="grid grid-cols-5 gap-2">
            <TabButton id="overview" label="Overview" icon={MapPin} />
            <TabButton id="participants" label="People" icon={Users} />
            <TabButton id="tasks" label="Tasks" icon={CheckCircle} />
            <TabButton id="meals" label="Meals" icon={Utensils} />
            <TabButton id="chat" label="Chat" icon={MessageCircle} />
          </div>
        </div>
      </div>
    </div>
  )
}

// Mock data
const DEFAULT_TRIP: Trip = {
  id: '1',
  name: 'Moab Adventure Weekend',
  location: 'Moab, Utah',
  startDate: 'Oct 15',
  endDate: 'Oct 17',
  participants: [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      avatar: '/api/placeholder/40/40',
      rsvpStatus: 'accepted'
    },
    {
      id: '2',
      name: 'Mike Chen',
      email: 'mike@example.com',
      avatar: '/api/placeholder/40/40',
      rsvpStatus: 'pending'
    },
    {
      id: '3',
      name: 'Emily Davis',
      email: 'emily@example.com',
      avatar: '/api/placeholder/40/40',
      rsvpStatus: 'accepted'
    }
  ],
  tasks: [
    {
      id: '1',
      title: 'Bring lunch for Saturday',
      assignedTo: 'Sarah Johnson',
      dueDate: 'Oct 15',
      completed: false,
      category: 'food'
    },
    {
      id: '2',
      title: 'Pack firewood',
      assignedTo: 'Mike Chen',
      dueDate: 'Oct 15',
      completed: true,
      category: 'equipment'
    },
    {
      id: '3',
      title: 'Reserve campsite',
      assignedTo: 'Emily Davis',
      dueDate: 'Oct 10',
      completed: true,
      category: 'logistics'
    }
  ],
  meals: [
    {
      id: '1',
      name: 'Saturday Breakfast',
      date: 'Oct 15',
      time: '8:00 AM',
      assignedTo: 'Sarah Johnson',
      ingredients: ['Eggs', 'Bacon', 'Toast', 'Coffee']
    },
    {
      id: '2',
      name: 'Saturday Dinner',
      date: 'Oct 15',
      time: '6:00 PM',
      assignedTo: 'Mike Chen',
      ingredients: ['Steaks', 'Potatoes', 'Vegetables', 'Beer']
    }
  ],
  weather: [
    {
      date: 'Oct 15',
      high: 75,
      low: 45,
      condition: 'Sunny',
      icon: '☀️'
    },
    {
      date: 'Oct 16',
      high: 72,
      low: 42,
      condition: 'Partly Cloudy',
      icon: '⛅'
    },
    {
      date: 'Oct 17',
      high: 68,
      low: 38,
      condition: 'Clear',
      icon: '🌙'
    }
  ],
  messages: [
    {
      id: '1',
      sender: 'Sarah Johnson',
      content: 'Hey everyone! Super excited for this trip. I\'ll bring extra snacks.',
      timestamp: '2:30 PM',
      avatar: '/api/placeholder/32/32'
    },
    {
      id: '2',
      sender: 'Mike Chen',
      content: 'Awesome! I\'ve got the firewood covered. Should we meet at 7 AM?',
      timestamp: '2:45 PM',
      avatar: '/api/placeholder/32/32'
    },
    {
      id: '3',
      sender: 'Emily Davis',
      content: 'Perfect! Campsite is confirmed. See you all bright and early!',
      timestamp: '3:00 PM',
      avatar: '/api/placeholder/32/32'
    }
  ]
}

// Demo component for page.tsx
export default function OffRoadTripPlannerDemo() {
  return <OffRoadTripPlanner />
}