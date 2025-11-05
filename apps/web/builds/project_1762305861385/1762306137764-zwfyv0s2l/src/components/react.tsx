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
  Bell,
  Search,
  Filter,
  Star,
  Navigation,
  Clock,
  UserPlus,
  Send,
  Check,
  X,
  CloudRain,
  Sun,
  CloudSnow
} from 'lucide-react'

// TypeScript Interfaces
interface Trip {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  status: 'planning' | 'confirmed' | 'active' | 'completed'
  memberCount: number
  imageUrl?: string
  difficulty: 'easy' | 'moderate' | 'hard'
  weather?: WeatherData
}

interface WeatherData {
  temperature: number
  condition: 'sunny' | 'rainy' | 'snowy' | 'cloudy'
  humidity: number
}

interface Task {
  id: string
  title: string
  assignedTo: string
  dueDate: string
  completed: boolean
  category: 'food' | 'equipment' | 'logistics' | 'safety'
}

interface Message {
  id: string
  sender: string
  content: string
  timestamp: string
  avatar?: string
}

interface Meal {
  id: string
  name: string
  day: string
  time: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  assignedTo: string
  ingredients: string[]
}

interface Member {
  id: string
  name: string
  avatar?: string
  rsvpStatus: 'pending' | 'accepted' | 'declined'
  role: 'organizer' | 'member'
}

// Mock Data
const MOCK_TRIPS: Trip[] = [
  {
    id: '1',
    name: 'Moab Desert Adventure',
    location: 'Moab, Utah',
    startDate: '2024-03-15',
    endDate: '2024-03-17',
    status: 'planning',
    memberCount: 6,
    difficulty: 'moderate',
    weather: { temperature: 72, condition: 'sunny', humidity: 35 }
  },
  {
    id: '2',
    name: 'Rocky Mountain Trail',
    location: 'Colorado Springs, CO',
    startDate: '2024-04-20',
    endDate: '2024-04-22',
    status: 'confirmed',
    memberCount: 4,
    difficulty: 'hard',
    weather: { temperature: 58, condition: 'cloudy', humidity: 65 }
  }
]

const MOCK_TASKS: Task[] = [
  { id: '1', title: 'Bring lunch for Saturday', assignedTo: 'Sarah M.', dueDate: '2024-03-14', completed: false, category: 'food' },
  { id: '2', title: 'Pack firewood', assignedTo: 'Mike R.', dueDate: '2024-03-14', completed: true, category: 'equipment' },
  { id: '3', title: 'Check tire pressure', assignedTo: 'You', dueDate: '2024-03-14', completed: false, category: 'safety' }
]

const MOCK_MESSAGES: Message[] = [
  { id: '1', sender: 'Sarah M.', content: 'Hey everyone! Excited for this weekend. Should I bring extra water?', timestamp: '10:30 AM' },
  { id: '2', sender: 'Mike R.', content: 'Weather looks perfect! I\'ll handle the firewood as planned.', timestamp: '10:45 AM' },
  { id: '3', sender: 'You', content: 'Sounds good! Don\'t forget to check the trail conditions.', timestamp: '11:00 AM' }
]

const MOCK_MEALS: Meal[] = [
  { id: '1', name: 'Campfire Breakfast Burritos', day: 'Saturday', time: 'breakfast', assignedTo: 'Sarah M.', ingredients: ['eggs', 'tortillas', 'cheese', 'bacon'] },
  { id: '2', name: 'Trail Mix Lunch', day: 'Saturday', time: 'lunch', assignedTo: 'Mike R.', ingredients: ['sandwiches', 'fruit', 'chips'] },
  { id: '3', name: 'BBQ Dinner', day: 'Saturday', time: 'dinner', assignedTo: 'You', ingredients: ['burgers', 'hot dogs', 'vegetables'] }
]

const MOCK_MEMBERS: Member[] = [
  { id: '1', name: 'Sarah Martinez', rsvpStatus: 'accepted', role: 'member' },
  { id: '2', name: 'Mike Rodriguez', rsvpStatus: 'accepted', role: 'member' },
  { id: '3', name: 'Emma Chen', rsvpStatus: 'pending', role: 'member' },
  { id: '4', name: 'You', rsvpStatus: 'accepted', role: 'organizer' }
]

export function OffRoadTripPlanner() {
  const [activeTab, setActiveTab] = useState<'trips' | 'tasks' | 'chat' | 'meals' | 'members'>('trips')
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(MOCK_TRIPS[0])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewTripModal, setShowNewTripModal] = useState(false)

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-4 h-4 text-yellow-500" />
      case 'rainy': return <CloudRain className="w-4 h-4 text-[rgb(34, 139, 34)]" />
      case 'snowy': return <CloudSnow className="w-4 h-4 text-blue-300" />
      default: return <Sun className="w-4 h-4 text-gray-400" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200'
      case 'moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'hard': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-[rgb(241, 245, 249)] text-gray-700 border-[rgb(226, 232, 240)]'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200'
      case 'active': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'completed': return 'bg-[rgb(241, 245, 249)] text-gray-700 border-[rgb(226, 232, 240)]'
      default: return 'bg-[rgb(241, 245, 249)] text-gray-700 border-[rgb(226, 232, 240)]'
    }
  }

  const sendMessage = () => {
    if (newMessage.trim()) {
      // In real app, this would send to backend
      console.log('Sending message:', newMessage)
      setNewMessage('')
    }
  }

  const toggleTaskComplete = (taskId: string) => {
    // In real app, this would update backend
    console.log('Toggling task:', taskId)
  }

  const inviteMember = () => {
    // In real app, this would send calendar invite
    console.log('Sending calendar invite')
  }

  // Trips Tab Content
  const TripsContent = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Your Trips</h2>
        <button 
          onClick={() => setShowNewTripModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg font-medium shadow-md hover:shadow-lg active:scale-95 transition-all duration-150"
          aria-label="Create new trip"
        >
          <Plus className="w-4 h-4" />
          New Trip
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search trips..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-gray-400 focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
        />
      </div>

      <div className="space-y-3">
        {MOCK_TRIPS.map((trip) => (
          <div
            key={trip.id}
            onClick={() => setSelectedTrip(trip)}
            className={`p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
              selectedTrip?.id === trip.id ? 'border-[rgb(34,139,34)] ring-1 ring-[rgb(34,139,34)]/20' : 'border-[rgb(226,232,240)]'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-[rgb(15,23,42)] mb-1">{trip.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {trip.location}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {trip.weather && getWeatherIcon(trip.weather.condition)}
                <span className="text-sm font-medium">{trip.weather?.temperature}°F</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(trip.status)}`}>
                  {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(trip.difficulty)}`}>
                  {trip.difficulty.charAt(0).toUpperCase() + trip.difficulty.slice(1)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                {trip.memberCount}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // Tasks Tab Content
  const TasksContent = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Trip Tasks</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg font-medium shadow-md hover:shadow-lg active:scale-95 transition-all duration-150">
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      <div className="space-y-3">
        {MOCK_TASKS.map((task) => (
          <div key={task.id} className="p-4 bg-white border border-[rgb(226,232,240)] rounded-xl shadow-sm">
            <div className="flex items-start gap-3">
              <button
                onClick={() => toggleTaskComplete(task.id)}
                className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-150 ${
                  task.completed 
                    ? 'bg-[rgb(34,139,34)] border-[rgb(34,139,34)] text-white' 
                    : 'border-gray-300 hover:border-[rgb(34,139,34)]'
                }`}
                aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
              >
                {task.completed && <Check className="w-3 h-3" />}
              </button>
              
              <div className="flex-1">
                <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-[rgb(15,23,42)]'}`}>
                  {task.title}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span>Assigned to: {task.assignedTo}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                </div>
                <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium border ${
                  task.category === 'food' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                  task.category === 'equipment' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                  task.category === 'logistics' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                  'bg-red-100 text-red-700 border-red-200'
                }`}>
                  {task.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // Chat Tab Content
  const ChatContent = () => (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Group Chat</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          4 online
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto mb-4">
        {MOCK_MESSAGES.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.sender === 'You' ? 'flex-row-reverse' : ''}`}>
            <div className="w-8 h-8 bg-[rgb(34,139,34)] rounded-full flex items-center justify-center text-white text-sm font-medium">
              {message.sender.charAt(0)}
            </div>
            <div className={`flex-1 max-w-xs ${message.sender === 'You' ? 'text-right' : ''}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-[rgb(15,23,42)]">{message.sender}</span>
                <span className="text-xs text-gray-500">{message.timestamp}</span>
              </div>
              <div className={`p-3 rounded-lg ${
                message.sender === 'You' 
                  ? 'bg-[rgb(34,139,34)] text-white' 
                  : 'bg-[rgb(248,250,252)] text-[rgb(15,23,42)]'
              }`}>
                {message.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-1 px-4 py-3 bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-gray-400 focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-3 bg-[rgb(34,139,34)] text-white rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all duration-150"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

  // Meals Tab Content
  const MealsContent = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Meal Planning</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg font-medium shadow-md hover:shadow-lg active:scale-95 transition-all duration-150">
          <Plus className="w-4 h-4" />
          Add Meal
        </button>
      </div>

      <div className="space-y-3">
        {MOCK_MEALS.map((meal) => (
          <div key={meal.id} className="p-4 bg-white border border-[rgb(226,232,240)] rounded-xl shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-[rgb(15,23,42)] mb-1">{meal.name}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="capitalize">{meal.day} • {meal.time}</span>
                  <span>By: {meal.assignedTo}</span>
                </div>
              </div>
              <UtensilsCrossed className="w-5 h-5 text-[rgb(34,139,34)]" />
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-[rgb(15,23,42)] mb-2">Ingredients:</h4>
              <div className="flex flex-wrap gap-2">
                {meal.ingredients.map((ingredient, index) => (
                  <span key={index} className="px-2 py-1 bg-[rgb(248,250,252)] text-[rgb(15,23,42)] rounded text-sm border border-[rgb(226,232,240)]">
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

  // Members Tab Content
  const MembersContent = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Trip Members</h2>
        <button 
          onClick={inviteMember}
          className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg font-medium shadow-md hover:shadow-lg active:scale-95 transition-all duration-150"
        >
          <UserPlus className="w-4 h-4" />
          Invite
        </button>
      </div>

      <div className="space-y-3">
        {MOCK_MEMBERS.map((member) => (
          <div key={member.id} className="p-4 bg-white border border-[rgb(226,232,240)] rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[rgb(34,139,34)] rounded-full flex items-center justify-center text-white font-medium">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium text-[rgb(15,23,42)]">{member.name}</h3>
                  <span className="text-sm text-gray-600 capitalize">{member.role}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  member.rsvpStatus === 'accepted' ? 'bg-green-100 text-green-700 border-green-200' :
                  member.rsvpStatus === 'declined' ? 'bg-red-100 text-red-700 border-red-200' :
                  'bg-yellow-100 text-yellow-700 border-yellow-200'
                }`}>
                  {member.rsvpStatus}
                </span>
                {member.role === 'organizer' && (
                  <Star className="w-4 h-4 text-[rgb(245,158,11)]" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] font-medium">
      {/* Header */}
      <header className="bg-white border-b border-[rgb(226,232,240)] px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Navigation className="w-6 h-6 text-[rgb(34,139,34)]" />
            <h1 className="text-lg font-semibold text-[rgb(15,23,42)]">OffRoad Planner</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-600 hover:text-[rgb(34,139,34)] transition-colors duration-150" aria-label="Notifications">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-[rgb(34,139,34)] transition-colors duration-150" aria-label="Settings">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        {activeTab === 'trips' && <TripsContent />}
        {activeTab === 'tasks' && <TasksContent />}
        {activeTab === 'chat' && <ChatContent />}
        {activeTab === 'meals' && <MealsContent />}
        {activeTab === 'members' && <MembersContent />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[rgb(226,232,240)] px-4 py-2 shadow-lg">
        <div className="flex items-center justify-around">
          {[
            { id: 'trips', icon: MapPin, label: 'Trips' },
            { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
            { id: 'chat', icon: MessageCircle, label: 'Chat' },
            { id: 'meals', icon: UtensilsCrossed, label: 'Meals' },
            { id: 'members', icon: Users, label: 'Members' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all duration-150 ${
                activeTab === tab.id
                  ? 'text-[rgb(34,139,34)] bg-[rgb(34,139,34)]/10'
                  : 'text-gray-600 hover:text-[rgb(34,139,34)]'
              }`}
              aria-label={tab.label}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* New Trip Modal */}
      {showNewTripModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[rgb(15,23,42)]">Create New Trip</h3>
              <button
                onClick={() => setShowNewTripModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-150"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Trip name"
                className="w-full px-4 py-3 bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-gray-400 focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
              />
              <input
                type="text"
                placeholder="Location"
                className="w-full px-4 py-3 bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-gray-400 focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  className="px-4 py-3 bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
                />
                <input
                  type="date"
                  className="px-4 py-3 bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowNewTripModal(false)}
                  className="flex-1 px-4 py-3 bg-[rgb(248,250,252)] text-[rgb(15,23,42)] rounded-lg font-medium border border-[rgb(226,232,240)] hover:bg-[rgb(241, 245, 249)] transition-all duration-150"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('Creating new trip')
                    setShowNewTripModal(false)
                  }}
                  className="flex-1 px-4 py-3 bg-[rgb(34,139,34)] text-white rounded-lg font-medium shadow-md hover:shadow-lg active:scale-95 transition-all duration-150"
                >
                  Create Trip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function OffRoadTripPlannerDemo() {
  return <OffRoadTripPlanner />
}