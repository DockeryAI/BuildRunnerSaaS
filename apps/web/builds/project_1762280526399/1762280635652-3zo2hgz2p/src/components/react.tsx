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
  Thermometer,
  Wind,
  Eye,
  Search,
  Send,
  UserPlus,
  Settings,
  Navigation
} from 'lucide-react'

interface Location {
  id: string
  name: string
  coordinates: { lat: number; lng: number }
  description: string
  difficulty: 'Easy' | 'Moderate' | 'Difficult'
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

interface Weather {
  day: string
  high: number
  low: number
  condition: string
  icon: string
  precipitation: number
  wind: number
  visibility: number
}

interface TripPlannerProps {
  initialTrip?: any
  onSaveTrip?: (trip: any) => void
}

export function TripPlanner({
  initialTrip,
  onSaveTrip = () => console.log('Trip saved')
}: TripPlannerProps = {}) {
  const [activeTab, setActiveTab] = useState('locations')
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>(DEFAULT_MEMBERS)
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS)
  const [meals, setMeals] = useState<Meal[]>(DEFAULT_MEALS)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(DEFAULT_MESSAGES)
  const [weather, setWeather] = useState<Weather[]>(DEFAULT_WEATHER)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      message: newMessage,
      timestamp: new Date().toLocaleTimeString(),
      type: 'text'
    }
    
    setChatMessages(prev => [...prev, message])
    setNewMessage('')
  }

  const toggleTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  const toggleLocationSaved = (locationId: string) => {
    setSelectedLocation(prev => 
      prev?.id === locationId ? { ...prev, saved: !prev.saved } : prev
    )
  }

  const filteredLocations = DEFAULT_LOCATIONS.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const renderLocationsTab = () => (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] text-[rgb(15,23,42)]"
        />
      </div>

      <div className="grid gap-4">
        {filteredLocations.map((location) => (
          <div
            key={location.id}
            className="p-4 bg-white border border-[rgb(226,232,240)] rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedLocation(location)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-[rgb(15,23,42)] text-lg">{location.name}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                location.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                location.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {location.difficulty}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-3">{location.description}</p>
            <div className="flex justify-between items-center">
              <div className="flex items-center text-gray-500 text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleLocationSaved(location.id)
                }}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  location.saved 
                    ? 'bg-[rgb(34,139,34)] text-white' 
                    : 'bg-[rgb(241, 245, 249)] text-gray-700 hover:bg-gray-200'
                }`}
              >
                {location.saved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderGroupTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Group Members</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors">
          <UserPlus className="w-4 h-4" />
          Invite
        </button>
      </div>

      <div className="grid gap-3">
        {groupMembers.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-3 bg-white border border-[rgb(226,232,240)] rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[rgb(34,139,34)] rounded-full flex items-center justify-center text-white font-medium">
                {member.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-[rgb(15,23,42)]">{member.name}</p>
                <p className="text-sm text-gray-500">{member.email}</p>
              </div>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              member.status === 'confirmed' ? 'bg-green-100 text-green-800' :
              member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {member.status}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-3">Tasks</h3>
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-3 bg-white border border-[rgb(226,232,240)] rounded-lg">
              <button
                onClick={() => toggleTaskComplete(task.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  task.completed 
                    ? 'bg-[rgb(34,139,34)] border-[rgb(34,139,34)] text-white' 
                    : 'border-gray-300'
                }`}
              >
                {task.completed && <CheckSquare className="w-3 h-3" />}
              </button>
              <div className="flex-1">
                <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-[rgb(15,23,42)]'}`}>
                  {task.title}
                </p>
                <p className="text-sm text-gray-500">Assigned to: {task.assignedTo}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                task.category === 'food' ? 'bg-orange-100 text-orange-800' :
                task.category === 'equipment' ? 'bg-blue-100 text-blue-800' :
                task.category === 'logistics' ? 'bg-purple-100 text-purple-800' :
                'bg-[rgb(241, 245, 249)] text-gray-800'
              }`}>
                {task.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderMealsTab = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Meal Planning</h2>
      
      <div className="grid gap-4">
        {['Saturday', 'Sunday'].map((day) => (
          <div key={day} className="bg-white border border-[rgb(226,232,240)] rounded-lg p-4">
            <h3 className="font-semibold text-lg text-[rgb(15,23,42)] mb-3">{day}</h3>
            <div className="space-y-3">
              {meals.filter(meal => meal.day === day).map((meal) => (
                <div key={meal.id} className="flex items-center justify-between p-3 bg-[rgb(248,250,252)] rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <UtensilsCrossed className="w-4 h-4 text-[rgb(34,139,34)]" />
                      <span className="font-medium text-[rgb(15,23,42)]">{meal.name}</span>
                      <span className="text-sm text-gray-500 capitalize">({meal.time})</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Assigned to: {meal.assignedTo}</p>
                  </div>
                  <button className="text-[rgb(34,139,34)] hover:text-[rgb(34,139,34)]/80">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderChatTab = () => (
    <div className="flex flex-col h-96">
      <h2 className="text-xl font-semibold text-[rgb(15,23,42)] mb-4">Group Chat</h2>
      
      <div className="flex-1 bg-white border border-[rgb(226,232,240)] rounded-lg p-4 overflow-y-auto space-y-3">
        {chatMessages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-3 py-2 rounded-lg ${
              message.sender === 'You' 
                ? 'bg-[rgb(34,139,34)] text-white' 
                : 'bg-[rgb(241,245,249)] text-[rgb(15,23,42)]'
            }`}>
              <p className="text-sm">{message.message}</p>
              <p className={`text-xs mt-1 ${
                message.sender === 'You' ? 'text-green-100' : 'text-gray-500'
              }`}>
                {message.sender} • {message.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2 mt-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]"
        />
        <button
          onClick={handleSendMessage}
          className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

  const renderWeatherTab = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Weather Forecast</h2>
      
      <div className="grid gap-4">
        {weather.map((day) => (
          <div key={day.day} className="bg-white border border-[rgb(226,232,240)] rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-lg text-[rgb(15,23,42)]">{day.day}</h3>
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">{day.condition}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-red-500" />
                <span>{day.high}°F / {day.low}°F</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-[rgb(34, 139, 34)]" />
                <span>{day.wind} mph</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-green-500" />
                <span>{day.visibility} mi</span>
              </div>
            </div>
            
            <div className="mt-3 text-sm text-gray-600">
              Precipitation: {day.precipitation}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const tabs = [
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'group', label: 'Group', icon: Users },
    { id: 'meals', label: 'Meals', icon: UtensilsCrossed },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'weather', label: 'Weather', icon: Cloud }
  ]

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] font-medium">
      <div className="max-w-4xl mx-auto p-4">
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Navigation className="w-8 h-8 text-[rgb(34,139,34)]" />
              <h1 className="text-2xl font-bold text-[rgb(15,23,42)]">Off-Road Trip Planner</h1>
            </div>
            <button className="p-2 text-gray-500 hover:text-[rgb(34,139,34)] transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Weekend Adventure • March 15-17, 2024</span>
          </div>
        </header>

        <nav className="mb-6">
          <div className="flex overflow-x-auto gap-1 p-1 bg-white rounded-lg border border-[rgb(226,232,240)]">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-[rgb(34,139,34)] text-white'
                      : 'text-gray-600 hover:text-[rgb(34,139,34)] hover:bg-[rgb(248,250,252)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </nav>

        <main className="bg-white rounded-lg border border-[rgb(226,232,240)] p-6 shadow-sm">
          {activeTab === 'locations' && renderLocationsTab()}
          {activeTab === 'group' && renderGroupTab()}
          {activeTab === 'meals' && renderMealsTab()}
          {activeTab === 'chat' && renderChatTab()}
          {activeTab === 'weather' && renderWeatherTab()}
        </main>
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
    description: 'Stunning red rock formations with challenging terrain perfect for experienced off-roaders.',
    difficulty: 'Difficult',
    saved: false
  },
  {
    id: '2',
    name: 'Pine Valley Loop',
    coordinates: { lat: 37.3861, lng: -113.4094 },
    description: 'Scenic mountain trail through pine forests with moderate difficulty.',
    difficulty: 'Moderate',
    saved: true
  },
  {
    id: '3',
    name: 'Desert Springs',
    coordinates: { lat: 36.1699, lng: -115.1398 },
    description: 'Easy trail suitable for beginners with beautiful desert scenery.',
    difficulty: 'Easy',
    saved: false
  }
]

const DEFAULT_MEMBERS: GroupMember[] = [
  { id: '1', name: 'John Smith', email: 'john@example.com', status: 'confirmed' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', status: 'confirmed' },
  { id: '3', name: 'Mike Wilson', email: 'mike@example.com', status: 'pending' },
  { id: '4', name: 'Lisa Brown', email: 'lisa@example.com', status: 'confirmed' }
]

const DEFAULT_TASKS: Task[] = [
  { id: '1', title: 'Bring lunch for Saturday', assignedTo: 'Sarah Johnson', dueDate: '2024-03-15', completed: false, category: 'food' },
  { id: '2', title: 'Collect firewood', assignedTo: 'Mike Wilson', dueDate: '2024-03-15', completed: true, category: 'logistics' },
  { id: '3', title: 'Pack first aid kit', assignedTo: 'John Smith', dueDate: '2024-03-15', completed: false, category: 'equipment' },
  { id: '4', title: 'Check tire pressure', assignedTo: 'Lisa Brown', dueDate: '2024-03-14', completed: true, category: 'equipment' }
]

const DEFAULT_MEALS: Meal[] = [
  { id: '1', name: 'Breakfast Burritos', day: 'Saturday', time: 'breakfast', assignedTo: 'John Smith', ingredients: ['eggs', 'tortillas', 'cheese'] },
  { id: '2', name: 'Trail Mix Lunch', day: 'Saturday', time: 'lunch', assignedTo: 'Sarah Johnson', ingredients: ['sandwiches', 'chips', 'fruit'] },
  { id: '3', name: 'Campfire Chili', day: 'Saturday', time: 'dinner', assignedTo: 'Mike Wilson', ingredients: ['beans', 'beef', 'spices'] },
  { id: '4', name: 'Pancakes', day: 'Sunday', time: 'breakfast', assignedTo: 'Lisa Brown', ingredients: ['pancake mix', 'syrup', 'berries'] }
]

const DEFAULT_MESSAGES: ChatMessage[] = [
  { id: '1', sender: 'Sarah Johnson', message: 'Hey everyone! Excited for this weekend!', timestamp: '10:30 AM', type: 'text' },
  { id: '2', sender: 'Mike Wilson', message: 'Same here! Weather looks perfect.', timestamp: '10:32 AM', type: 'text' },
  { id: '3', sender: 'You', message: 'Don\'t forget to check your tire pressure before we leave!', timestamp: '10:35 AM', type: 'text' },
  { id: '4', sender: 'Lisa Brown', message: 'Already done! 👍', timestamp: '10:37 AM', type: 'text' }
]

const DEFAULT_WEATHER: Weather[] = [
  { day: 'Saturday', high: 75, low: 45, condition: 'Sunny', icon: '☀️', precipitation: 5, wind: 8, visibility: 10 },
  { day: 'Sunday', high: 72, low: 48, condition: 'Partly Cloudy', icon: '⛅', precipitation: 15, wind: 12, visibility: 8 }
]

export default function TripPlannerDemo() {
  return <TripPlanner />
}