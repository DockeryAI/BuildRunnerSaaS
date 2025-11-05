'use client'

import { useState, useEffect } from 'react'
import { MapPin, Calendar, Users, MessageCircle, Utensils, CheckCircle, Clock, Sun, Cloud, CloudRain, Star, Navigation, Tent, TreePine, Mountain } from 'lucide-react'

interface Location {
  id: string
  name: string
  coordinates: { lat: number; lng: number }
  difficulty: 'Easy' | 'Moderate' | 'Hard'
  terrain: string
  saved: boolean
}

interface GroupMember {
  id: string
  name: string
  avatar: string
  status: 'confirmed' | 'pending' | 'declined'
}

interface Task {
  id: string
  title: string
  assignedTo: string
  category: 'food' | 'equipment' | 'logistics'
  completed: boolean
  dueDate: string
}

interface WeatherData {
  day: string
  temp: { high: number; low: number }
  condition: 'sunny' | 'cloudy' | 'rainy'
  icon: any
}

interface Meal {
  id: string
  name: string
  day: string
  time: 'breakfast' | 'lunch' | 'dinner'
  assignedTo: string
}

interface ChatMessage {
  id: string
  sender: string
  message: string
  timestamp: string
  avatar: string
}

export function OffRoadTripPlanner() {
  const [activeTab, setActiveTab] = useState('locations')
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>(mockGroupMembers)
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [meals, setMeals] = useState<Meal[]>(mockMeals)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(mockChatMessages)
  const [newMessage, setNewMessage] = useState('')

  const handleLocationSave = (location: Location) => {
    setSelectedLocation({ ...location, saved: !location.saved })
  }

  const handleTaskToggle = (taskId: string) => {
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
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: '/api/placeholder/32/32'
    }
    
    setChatMessages(prev => [...prev, message])
    setNewMessage('')
  }

  const renderLocationsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Trail Locations</h2>
        <button className="p-2 bg-[rgb(34,139,34)] text-white rounded-lg">
          <MapPin className="w-5 h-5" />
        </button>
      </div>
      
      <div className="space-y-3">
        {mockLocations.map((location) => (
          <div key={location.id} className="bg-white border border-[rgb(226,232,240)] rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium text-[rgb(15,23,42)]">{location.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    location.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                    location.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {location.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{location.terrain}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleLocationSave(location)}
                className={`p-2 rounded-lg transition-colors ${
                  location.saved 
                    ? 'bg-[rgb(34,139,34)] text-white' 
                    : 'bg-[rgb(248,250,252)] text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Star className={`w-4 h-4 ${location.saved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderScheduleTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Trip Schedule</h2>
        <button className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg text-sm font-medium">
          Send Invites
        </button>
      </div>

      {/* Weather Section */}
      <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-4">
        <h3 className="font-medium text-[rgb(15,23,42)] mb-3">Weather Forecast</h3>
        <div className="grid grid-cols-3 gap-3">
          {mockWeather.map((day, index) => (
            <div key={index} className="text-center">
              <p className="text-sm font-medium text-gray-600">{day.day}</p>
              <day.icon className="w-6 h-6 mx-auto my-2 text-[rgb(245,158,11)]" />
              <p className="text-xs text-gray-500">{day.temp.high}°/{day.temp.low}°</p>
            </div>
          ))}
        </div>
      </div>

      {/* Group Members */}
      <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-4">
        <h3 className="font-medium text-[rgb(15,23,42)] mb-3">Group Members</h3>
        <div className="space-y-2">
          {groupMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">{member.name[0]}</span>
                </div>
                <span className="text-sm font-medium">{member.name}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                member.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                member.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {member.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks */}
      <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-4">
        <h3 className="font-medium text-[rgb(15,23,42)] mb-3">Tasks & Assignments</h3>
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[rgb(248,250,252)]">
              <button
                onClick={() => handleTaskToggle(task.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  task.completed 
                    ? 'bg-[rgb(34,139,34)] border-[rgb(34,139,34)] text-white' 
                    : 'border-gray-300'
                }`}
              >
                {task.completed && <CheckCircle className="w-3 h-3" />}
              </button>
              <div className="flex-1">
                <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : 'text-[rgb(15,23,42)]'}`}>
                  {task.title}
                </p>
                <p className="text-xs text-gray-500">Assigned to {task.assignedTo}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                task.category === 'food' ? 'bg-orange-100 text-orange-700' :
                task.category === 'equipment' ? 'bg-blue-100 text-blue-700' :
                'bg-purple-100 text-purple-700'
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Meal Planning</h2>
        <button className="p-2 bg-[rgb(34,139,34)] text-white rounded-lg">
          <Utensils className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {['Saturday', 'Sunday'].map((day) => (
          <div key={day} className="bg-white border border-[rgb(226,232,240)] rounded-xl p-4">
            <h3 className="font-medium text-[rgb(15,23,42)] mb-3">{day}</h3>
            <div className="space-y-3">
              {meals.filter(meal => meal.day === day).map((meal) => (
                <div key={meal.id} className="flex items-center justify-between p-3 bg-[rgb(248,250,252)] rounded-lg">
                  <div>
                    <p className="font-medium text-sm capitalize">{meal.time}</p>
                    <p className="text-sm text-gray-600">{meal.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Prepared by</p>
                    <p className="text-sm font-medium">{meal.assignedTo}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderChatTab = () => (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Group Chat</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">{groupMembers.length} online</span>
        </div>
      </div>

      <div className="flex-1 bg-white border border-[rgb(226,232,240)] rounded-xl p-4 overflow-y-auto">
        <div className="space-y-4">
          {chatMessages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.sender === 'You' ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium">{message.sender[0]}</span>
              </div>
              <div className={`max-w-[70%] ${message.sender === 'You' ? 'text-right' : ''}`}>
                <div className={`p-3 rounded-lg ${
                  message.sender === 'You' 
                    ? 'bg-[rgb(34,139,34)] text-white' 
                    : 'bg-[rgb(248,250,252)] text-[rgb(15,23,42)]'
                }`}>
                  <p className="text-sm">{message.message}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">{message.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
        />
        <button
          onClick={handleSendMessage}
          className="px-6 py-3 bg-[rgb(34,139,34)] text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)]">
      {/* Header */}
      <div className="bg-white border-b border-[rgb(226,232,240)] px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[rgb(34,139,34)] rounded-lg flex items-center justify-center">
              <Mountain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[rgb(15,23,42)]">Trail Blazers</h1>
              <p className="text-sm text-gray-600">Moab Adventure • Oct 15-17</p>
            </div>
          </div>
          <button className="p-2 bg-[rgb(248,250,252)] rounded-lg">
            <Calendar className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {activeTab === 'locations' && renderLocationsTab()}
        {activeTab === 'schedule' && renderScheduleTab()}
        {activeTab === 'meals' && renderMealsTab()}
        {activeTab === 'chat' && renderChatTab()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[rgb(226,232,240)] px-4 py-2">
        <div className="flex justify-around">
          {[
            { id: 'locations', icon: MapPin, label: 'Locations' },
            { id: 'schedule', icon: Calendar, label: 'Schedule' },
            { id: 'meals', icon: Utensils, label: 'Meals' },
            { id: 'chat', icon: MessageCircle, label: 'Chat' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
                activeTab === tab.id 
                  ? 'bg-[rgb(34,139,34)] text-white' 
                  : 'text-gray-600 hover:bg-[rgb(248,250,252)]'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Mock Data
const mockLocations: Location[] = [
  {
    id: '1',
    name: 'Hell\'s Revenge Trail',
    coordinates: { lat: 38.5816, lng: -109.5498 },
    difficulty: 'Hard',
    terrain: 'Slickrock, steep climbs, technical sections',
    saved: true
  },
  {
    id: '2',
    name: 'Corona Arch Trail',
    coordinates: { lat: 38.5935, lng: -109.5627 },
    difficulty: 'Moderate',
    terrain: 'Sandy washes, rock scrambling',
    saved: false
  },
  {
    id: '3',
    name: 'Poison Spider Mesa',
    coordinates: { lat: 38.5789, lng: -109.5234 },
    difficulty: 'Hard',
    terrain: 'Exposed ledges, technical driving',
    saved: true
  }
]

const mockGroupMembers: GroupMember[] = [
  { id: '1', name: 'Alex Chen', avatar: '', status: 'confirmed' },
  { id: '2', name: 'Sarah Johnson', avatar: '', status: 'confirmed' },
  { id: '3', name: 'Mike Rodriguez', avatar: '', status: 'pending' },
  { id: '4', name: 'Emma Davis', avatar: '', status: 'confirmed' }
]

const mockTasks: Task[] = [
  { id: '1', title: 'Saturday Lunch Prep', assignedTo: 'Sarah', category: 'food', completed: false, dueDate: '2024-10-15' },
  { id: '2', title: 'Firewood Collection', assignedTo: 'Mike', category: 'logistics', completed: true, dueDate: '2024-10-15' },
  { id: '3', title: 'Recovery Gear Check', assignedTo: 'Alex', category: 'equipment', completed: false, dueDate: '2024-10-14' },
  { id: '4', title: 'Sunday Breakfast', assignedTo: 'Emma', category: 'food', completed: false, dueDate: '2024-10-16' }
]

const mockWeather: WeatherData[] = [
  { day: 'Sat', temp: { high: 75, low: 45 }, condition: 'sunny', icon: Sun },
  { day: 'Sun', temp: { high: 72, low: 42 }, condition: 'cloudy', icon: Cloud },
  { day: 'Mon', temp: { high: 68, low: 40 }, condition: 'rainy', icon: CloudRain }
]

const mockMeals: Meal[] = [
  { id: '1', name: 'Breakfast Burritos', day: 'Saturday', time: 'breakfast', assignedTo: 'Alex' },
  { id: '2', name: 'Trail Mix & Sandwiches', day: 'Saturday', time: 'lunch', assignedTo: 'Sarah' },
  { id: '3', name: 'Campfire Chili', day: 'Saturday', time: 'dinner', assignedTo: 'Mike' },
  { id: '4', name: 'Pancakes & Bacon', day: 'Sunday', time: 'breakfast', assignedTo: 'Emma' },
  { id: '5', name: 'Grilled Burgers', day: 'Sunday', time: 'lunch', assignedTo: 'Alex' }
]

const mockChatMessages: ChatMessage[] = [
  { id: '1', sender: 'Sarah', message: 'Hey everyone! Super excited for this weekend 🏔️', timestamp: '10:30 AM', avatar: '' },
  { id: '2', sender: 'Mike', message: 'Just checked the weather - looks perfect!', timestamp: '10:32 AM', avatar: '' },
  { id: '3', sender: 'Alex', message: 'I\'ll bring extra recovery straps just in case', timestamp: '10:35 AM', avatar: '' },
  { id: '4', sender: 'Emma', message: 'Should we meet at the usual spot at 7 AM?', timestamp: '10:40 AM', avatar: '' }
]

export default function OffRoadTripPlannerDemo() {
  return <OffRoadTripPlanner />
}