'use client'

import { useState, useEffect } from 'react'
import { MapPin, Calendar, Users, MessageCircle, Utensils, CheckCircle, Clock, Star, Navigation } from 'lucide-react'

interface TripLocation {
  id: string
  name: string
  coordinates: { lat: number; lng: number }
  difficulty: 'Easy' | 'Moderate' | 'Hard'
  rating: number
  description: string
  isFavorite: boolean
}

interface GroupMember {
  id: string
  name: string
  avatar: string
  role: string
  status: 'confirmed' | 'pending' | 'declined'
}

interface Task {
  id: string
  title: string
  assignedTo: string
  dueDate: string
  completed: boolean
  category: 'food' | 'equipment' | 'logistics'
}

interface WeatherData {
  date: string
  temp: { high: number; low: number }
  condition: string
  icon: string
  precipitation: number
}

interface TripPlannerProps {
  initialLocation?: TripLocation
  groupMembers?: GroupMember[]
  weatherData?: WeatherData[]
  onLocationSave?: (location: TripLocation) => void
  onTaskAssign?: (task: Task) => void
  onRSVP?: (memberId: string, status: string) => void
}

export function TripPlanner({
  initialLocation,
  groupMembers = DEFAULT_MEMBERS,
  weatherData = DEFAULT_WEATHER,
  onLocationSave = () => console.log('Location saved'),
  onTaskAssign = () => console.log('Task assigned'),
  onRSVP = () => console.log('RSVP updated')
}: TripPlannerProps = {}) {
  const [activeTab, setActiveTab] = useState('locations')
  const [selectedLocation, setSelectedLocation] = useState<TripLocation | null>(initialLocation || null)
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS)
  const [members, setMembers] = useState<GroupMember[]>(groupMembers)
  const [chatMessages, setChatMessages] = useState(DEFAULT_MESSAGES)
  const [newMessage, setNewMessage] = useState('')

  const handleLocationSelect = (location: TripLocation) => {
    setSelectedLocation(location)
    onLocationSave(location)
  }

  const handleTaskToggle = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  const handleRSVPUpdate = (memberId: string, status: 'confirmed' | 'pending' | 'declined') => {
    setMembers(prev => prev.map(member =>
      member.id === memberId ? { ...member, status } : member
    ))
    onRSVP(memberId, status)
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        sender: 'You',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: '/api/placeholder/32/32'
      }
      setChatMessages(prev => [...prev, message])
      setNewMessage('')
    }
  }

  const renderLocationsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Trail Locations</h2>
        <button className="p-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors">
          <MapPin className="w-5 h-5" />
        </button>
      </div>
      
      <div className="space-y-3">
        {DEFAULT_LOCATIONS.map((location) => (
          <div
            key={location.id}
            className={`p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
              selectedLocation?.id === location.id ? 'border-[rgb(34,139,34)] bg-[rgb(34,139,34)]/5' : 'border-[rgb(226,232,240)]'
            }`}
            onClick={() => handleLocationSelect(location)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium text-[rgb(15,23,42)]">{location.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    location.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                    location.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {location.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{location.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current text-[rgb(245,158,11)]" />
                    <span>{location.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Navigation className="w-4 h-4" />
                    <span>{location.coordinates.lat.toFixed(3)}, {location.coordinates.lng.toFixed(3)}</span>
                  </div>
                </div>
              </div>
              <button
                className={`p-2 rounded-lg transition-colors ${
                  location.isFavorite ? 'text-[rgb(245,158,11)]' : 'text-gray-400 hover:text-[rgb(245,158,11)]'
                }`}
              >
                <Star className={`w-5 h-5 ${location.isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderTasksTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Trip Tasks</h2>
        <button className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors text-sm font-medium">
          Add Task
        </button>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => {
          const assignedMember = members.find(m => m.id === task.assignedTo)
          return (
            <div key={task.id} className="p-4 bg-white border border-[rgb(226,232,240)] rounded-xl shadow-sm">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleTaskToggle(task.id)}
                  className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    task.completed 
                      ? 'bg-[rgb(34,139,34)] border-[rgb(34,139,34)] text-white' 
                      : 'border-gray-300 hover:border-[rgb(34,139,34)]'
                  }`}
                >
                  {task.completed && <CheckCircle className="w-3 h-3" />}
                </button>
                <div className="flex-1">
                  <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-[rgb(15,23,42)]'}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    {assignedMember && (
                      <div className="flex items-center gap-2">
                        <img src={assignedMember.avatar} alt={assignedMember.name} className="w-6 h-6 rounded-full" />
                        <span>{assignedMember.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{task.dueDate}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.category === 'food' ? 'bg-orange-100 text-orange-700' :
                      task.category === 'equipment' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
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
  )

  const renderGroupTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Group Members</h2>
        <button className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors text-sm font-medium">
          Invite
        </button>
      </div>

      <div className="space-y-3">
        {members.map((member) => (
          <div key={member.id} className="p-4 bg-white border border-[rgb(226,232,240)] rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full" />
                <div>
                  <h3 className="font-medium text-[rgb(15,23,42)]">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                  member.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  member.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {member.status}
                </span>
                {member.status === 'pending' && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleRSVPUpdate(member.id, 'confirmed')}
                      className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => handleRSVPUpdate(member.id, 'declined')}
                      className="px-2 py-1 bg-[rgb(220, 38, 38)] text-white rounded text-xs hover:bg-[rgb(220, 38, 38)] transition-colors"
                    >
                      ✗
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderChatTab = () => (
    <div className="space-y-4 h-full flex flex-col">
      <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Group Chat</h2>
      
      <div className="flex-1 bg-white border border-[rgb(226,232,240)] rounded-xl p-4 space-y-3 max-h-96 overflow-y-auto">
        {chatMessages.map((msg) => (
          <div key={msg.id} className="flex items-start gap-3">
            <img src={msg.avatar} alt={msg.sender} className="w-8 h-8 rounded-full" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm text-[rgb(15,23,42)]">{msg.sender}</span>
                <span className="text-xs text-gray-500">{msg.timestamp}</span>
              </div>
              <p className="text-sm text-gray-700">{msg.message}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/50 focus:border-[rgb(34,139,34)]"
        />
        <button
          onClick={handleSendMessage}
          className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  )

  const renderWeatherTab = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Weather Forecast</h2>
      
      <div className="space-y-3">
        {weatherData.map((day, index) => (
          <div key={index} className="p-4 bg-white border border-[rgb(226,232,240)] rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{day.icon}</div>
                <div>
                  <h3 className="font-medium text-[rgb(15,23,42)]">{day.date}</h3>
                  <p className="text-sm text-gray-600">{day.condition}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-[rgb(15,23,42)]">
                  {day.temp.high}°/{day.temp.low}°
                </div>
                <div className="text-sm text-[rgb(34, 139, 34)]">{day.precipitation}% rain</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const tabs = [
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle },
    { id: 'group', label: 'Group', icon: Users },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'weather', label: 'Weather', icon: Calendar }
  ]

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] font-['Inter',system-ui,sans-serif]">
      <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col">
        {/* Header */}
        <div className="p-4 bg-[rgb(34,139,34)] text-white">
          <h1 className="text-xl font-semibold">Off-Road Trip Planner</h1>
          {selectedLocation && (
            <p className="text-sm opacity-90 mt-1">{selectedLocation.name}</p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 pb-20">
          {activeTab === 'locations' && renderLocationsTab()}
          {activeTab === 'tasks' && renderTasksTab()}
          {activeTab === 'group' && renderGroupTab()}
          {activeTab === 'chat' && renderChatTab()}
          {activeTab === 'weather' && renderWeatherTab()}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-[rgb(226,232,240)]">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 p-3 flex flex-col items-center gap-1 transition-colors ${
                    activeTab === tab.id
                      ? 'text-[rgb(34,139,34)] bg-[rgb(34,139,34)]/5'
                      : 'text-gray-500 hover:text-[rgb(34,139,34)]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// Mock data
const DEFAULT_LOCATIONS: TripLocation[] = [
  {
    id: '1',
    name: 'Moab Desert Trail',
    coordinates: { lat: 38.5733, lng: -109.5498 },
    difficulty: 'Moderate',
    rating: 4.8,
    description: 'Stunning red rock formations with challenging terrain perfect for experienced off-roaders.',
    isFavorite: true
  },
  {
    id: '2',
    name: 'Black Hills Adventure',
    coordinates: { lat: 43.8791, lng: -103.4591 },
    difficulty: 'Hard',
    rating: 4.6,
    description: 'Dense forest trails with steep climbs and technical rock sections.',
    isFavorite: false
  },
  {
    id: '3',
    name: 'Sedona Red Rocks',
    coordinates: { lat: 34.8697, lng: -111.7610 },
    difficulty: 'Easy',
    rating: 4.9,
    description: 'Scenic beginner-friendly trails with breathtaking views of red rock formations.',
    isFavorite: true
  }
]

const DEFAULT_MEMBERS: GroupMember[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    avatar: '/api/placeholder/48/48',
    role: 'Trip Leader',
    status: 'confirmed'
  },
  {
    id: '2',
    name: 'Sarah Chen',
    avatar: '/api/placeholder/48/48',
    role: 'Navigator',
    status: 'confirmed'
  },
  {
    id: '3',
    name: 'Mike Rodriguez',
    avatar: '/api/placeholder/48/48',
    role: 'Equipment Manager',
    status: 'pending'
  },
  {
    id: '4',
    name: 'Emma Wilson',
    avatar: '/api/placeholder/48/48',
    role: 'Safety Officer',
    status: 'confirmed'
  }
]

const DEFAULT_TASKS: Task[] = [
  {
    id: '1',
    title: 'Prepare Saturday lunch for 8 people',
    assignedTo: '2',
    dueDate: 'Sat 9:00 AM',
    completed: false,
    category: 'food'
  },
  {
    id: '2',
    title: 'Collect firewood for evening campfire',
    assignedTo: '3',
    dueDate: 'Sat 6:00 PM',
    completed: false,
    category: 'logistics'
  },
  {
    id: '3',
    title: 'Check tire pressure and spare tires',
    assignedTo: '1',
    dueDate: 'Fri 8:00 PM',
    completed: true,
    category: 'equipment'
  },
  {
    id: '4',
    title: 'Pack first aid kit and emergency supplies',
    assignedTo: '4',
    dueDate: 'Fri 10:00 PM',
    completed: true,
    category: 'equipment'
  }
]

const DEFAULT_WEATHER: WeatherData[] = [
  {
    date: 'Friday',
    temp: { high: 78, low: 52 },
    condition: 'Sunny',
    icon: '☀️',
    precipitation: 5
  },
  {
    date: 'Saturday',
    temp: { high: 82, low: 55 },
    condition: 'Partly Cloudy',
    icon: '⛅',
    precipitation: 15
  },
  {
    date: 'Sunday',
    temp: { high: 75, low: 48 },
    condition: 'Clear',
    icon: '☀️',
    precipitation: 0
  }
]

const DEFAULT_MESSAGES = [
  {
    id: '1',
    sender: 'Alex Johnson',
    message: 'Hey everyone! Just confirmed our campsite reservation for this weekend. Site #12 at Red Rock Canyon.',
    timestamp: '2:30 PM',
    avatar: '/api/placeholder/32/32'
  },
  {
    id: '2',
    sender: 'Sarah Chen',
    message: 'Perfect! I\'ve got the trail maps downloaded offline. Weather looks great for Saturday.',
    timestamp: '2:35 PM',
    avatar: '/api/placeholder/32/32'
  },
  {
    id: '3',
    sender: 'Emma Wilson',
    message: 'Don\'t forget to bring extra water. The forecast shows it might be warmer than expected.',
    timestamp: '3:15 PM',
    avatar: '/api/placeholder/32/32'
  }
]

export default function TripPlannerDemo() {
  return <TripPlanner />
}