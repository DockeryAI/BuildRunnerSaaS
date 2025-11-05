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
  Navigation,
  Tent
} from 'lucide-react'

interface Trip {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  memberCount: number
  status: 'planning' | 'confirmed' | 'active' | 'completed'
}

interface TaskAssignment {
  id: string
  task: string
  assignee: string
  category: 'food' | 'gear' | 'logistics'
  completed: boolean
}

interface WeatherData {
  temperature: number
  condition: string
  humidity: number
}

interface OffRoadTripPlannerProps {
  initialTrips?: Trip[]
  currentUser?: string
}

export function OffRoadTripPlanner({
  initialTrips = DEFAULT_TRIPS,
  currentUser = 'John Doe'
}: OffRoadTripPlannerProps = {}) {
  const [activeTab, setActiveTab] = useState<'trips' | 'tasks' | 'chat' | 'menu'>('trips')
  const [trips, setTrips] = useState<Trip[]>(initialTrips)
  const [tasks, setTasks] = useState<TaskAssignment[]>(DEFAULT_TASKS)
  const [weather, setWeather] = useState<WeatherData>(DEFAULT_WEATHER)
  const [showNewTripForm, setShowNewTripForm] = useState(false)
  const [newTripName, setNewTripName] = useState('')
  const [newTripLocation, setNewTripLocation] = useState('')

  useEffect(() => {
    // Simulate weather data fetch
    const fetchWeather = () => {
      setWeather({
        temperature: Math.floor(Math.random() * 30) + 60,
        condition: ['Sunny', 'Partly Cloudy', 'Overcast'][Math.floor(Math.random() * 3)],
        humidity: Math.floor(Math.random() * 40) + 30
      })
    }
    fetchWeather()
  }, [])

  const handleCreateTrip = () => {
    if (newTripName && newTripLocation) {
      const newTrip: Trip = {
        id: Date.now().toString(),
        name: newTripName,
        location: newTripLocation,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        memberCount: 1,
        status: 'planning'
      }
      setTrips([newTrip, ...trips])
      setNewTripName('')
      setNewTripLocation('')
      setShowNewTripForm(false)
    }
  }

  const toggleTaskComplete = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  const renderTripsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Your Trips</h2>
        <button
          onClick={() => setShowNewTripForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg font-medium shadow-md hover:bg-[rgb(34,139,34)]/90 transition-all duration-150 active:scale-95"
          aria-label="Create new trip"
        >
          <Plus className="w-4 h-4" />
          New Trip
        </button>
      </div>

      {showNewTripForm && (
        <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-medium text-[rgb(15,23,42)] mb-4">Create New Trip</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                Trip Name
              </label>
              <input
                type="text"
                value={newTripName}
                onChange={(e) => setNewTripName(e.target.value)}
                placeholder="Enter trip name"
                className="w-full px-4 py-2.5 border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-gray-400 focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                Location
              </label>
              <input
                type="text"
                value={newTripLocation}
                onChange={(e) => setNewTripLocation(e.target.value)}
                placeholder="Enter destination"
                className="w-full px-4 py-2.5 border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-gray-400 focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreateTrip}
                className="flex-1 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg font-medium shadow-md hover:bg-[rgb(34,139,34)]/90 transition-all duration-150 active:scale-95"
              >
                Create Trip
              </button>
              <button
                onClick={() => setShowNewTripForm(false)}
                className="flex-1 px-4 py-2 bg-[rgb(245,247,250)] text-[rgb(15,23,42)] rounded-lg font-medium border border-[rgb(226,232,240)] hover:bg-[rgb(248, 250, 252)] transition-all duration-150"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[rgb(34,139,34)]/10 border border-[rgb(34,139,34)]/20 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <Cloud className="w-5 h-5 text-[rgb(34,139,34)]" />
          <span className="font-medium text-[rgb(15,23,42)]">Current Weather</span>
        </div>
        <div className="text-2xl font-bold text-[rgb(15,23,42)]">{weather.temperature}°F</div>
        <div className="text-sm text-gray-600">{weather.condition} • {weather.humidity}% humidity</div>
      </div>

      <div className="space-y-3">
        {trips.map((trip) => (
          <div
            key={trip.id}
            className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6 shadow-md hover:border-[rgb(34,139,34)]/30 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-[rgb(15,23,42)]">{trip.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <MapPin className="w-4 h-4" />
                  {trip.location}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                trip.status === 'planning' 
                  ? 'bg-[rgb(249,115,22)]/20 text-[rgb(249,115,22)] border border-[rgb(249,115,22)]/30'
                  : trip.status === 'confirmed'
                  ? 'bg-[rgb(34,139,34)]/20 text-[rgb(34,139,34)] border border-[rgb(34,139,34)]/30'
                  : 'bg-[rgb(248, 250, 252)] text-gray-600 border border-[rgb(226, 232, 240)]'
              }`}>
                {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {trip.memberCount} members
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-[rgb(34,139,34)] text-white rounded-lg text-sm font-medium shadow-md hover:bg-[rgb(34,139,34)]/90 transition-all duration-150 active:scale-95">
                View Details
              </button>
              <button className="px-3 py-2 bg-[rgb(245,247,250)] text-[rgb(15,23,42)] rounded-lg text-sm font-medium border border-[rgb(226,232,240)] hover:bg-[rgb(248, 250, 252)] transition-all duration-150">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderTasksTab = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Trip Tasks</h2>
      
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white border border-[rgb(226,232,240)] rounded-xl p-4 shadow-md"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleTaskComplete(task.id)}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-150 ${
                  task.completed
                    ? 'bg-[rgb(34,139,34)] border-[rgb(34,139,34)] text-white'
                    : 'border-[rgb(226,232,240)] hover:border-[rgb(34,139,34)]'
                }`}
                aria-label={`Mark ${task.task} as ${task.completed ? 'incomplete' : 'complete'}`}
              >
                {task.completed && <CheckSquare className="w-4 h-4" />}
              </button>
              
              <div className="flex-1">
                <div className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-[rgb(15,23,42)]'}`}>
                  {task.task}
                </div>
                <div className="text-sm text-gray-600">Assigned to: {task.assignee}</div>
              </div>
              
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                task.category === 'food' 
                  ? 'bg-[rgb(249,115,22)]/20 text-[rgb(249,115,22)]'
                  : task.category === 'gear'
                  ? 'bg-[rgb(34,139,34)]/20 text-[rgb(34,139,34)]'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {task.category}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full px-4 py-3 bg-[rgb(245,247,250)] text-[rgb(15,23,42)] rounded-xl font-medium border border-[rgb(226,232,240)] hover:bg-[rgb(248, 250, 252)] transition-all duration-150 flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" />
        Add New Task
      </button>
    </div>
  )

  const renderChatTab = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Group Chat</h2>
      
      <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-4 shadow-md min-h-[400px] flex flex-col">
        <div className="flex-1 space-y-3 mb-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-[rgb(34,139,34)] rounded-full flex items-center justify-center text-white text-sm font-medium">
              M
            </div>
            <div className="flex-1">
              <div className="bg-[rgb(248,250,252)] rounded-lg p-3">
                <div className="text-sm font-medium text-[rgb(15,23,42)] mb-1">Mike Johnson</div>
                <div className="text-sm text-gray-700">Hey everyone! Just confirmed the campsite reservation. We're all set for this weekend!</div>
              </div>
              <div className="text-xs text-gray-500 mt-1">2 hours ago</div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-[rgb(249,115,22)] rounded-full flex items-center justify-center text-white text-sm font-medium">
              S
            </div>
            <div className="flex-1">
              <div className="bg-[rgb(248,250,252)] rounded-lg p-3">
                <div className="text-sm font-medium text-[rgb(15,23,42)] mb-1">Sarah Chen</div>
                <div className="text-sm text-gray-700">Perfect! I'll bring the portable grill and extra propane tanks.</div>
              </div>
              <div className="text-xs text-gray-500 mt-1">1 hour ago</div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-gray-400 focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
          />
          <button className="px-4 py-2.5 bg-[rgb(34,139,34)] text-white rounded-lg font-medium shadow-md hover:bg-[rgb(34,139,34)]/90 transition-all duration-150 active:scale-95">
            Send
          </button>
        </div>
      </div>
    </div>
  )

  const renderMenuTab = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Meal Planning</h2>
      
      <div className="space-y-3">
        {DEFAULT_MEALS.map((meal, index) => (
          <div
            key={index}
            className="bg-white border border-[rgb(226,232,240)] rounded-xl p-4 shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-[rgb(34,139,34)]" />
                <span className="font-medium text-[rgb(15,23,42)]">{meal.name}</span>
              </div>
              <span className="text-sm text-gray-600">{meal.time}</span>
            </div>
            <div className="text-sm text-gray-700 mb-2">{meal.description}</div>
            <div className="text-xs text-gray-500">Prepared by: {meal.preparedBy}</div>
          </div>
        ))}
      </div>

      <button className="w-full px-4 py-3 bg-[rgb(245,247,250)] text-[rgb(15,23,42)] rounded-xl font-medium border border-[rgb(226,232,240)] hover:bg-[rgb(248, 250, 252)] transition-all duration-150 flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" />
        Add Meal
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] font-['Inter',system-ui,sans-serif]">
      {/* Header */}
      <div className="bg-white border-b border-[rgb(226,232,240)] px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[rgb(34,139,34)] rounded-lg flex items-center justify-center">
            <Tent className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[rgb(15,23,42)]">Trail Planner</h1>
            <p className="text-sm text-gray-600">Plan your next adventure</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 pb-20">
        {activeTab === 'trips' && renderTripsTab()}
        {activeTab === 'tasks' && renderTasksTab()}
        {activeTab === 'chat' && renderChatTab()}
        {activeTab === 'menu' && renderMenuTab()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[rgb(226,232,240)] px-4 py-2">
        <div className="flex items-center justify-around">
          {[
            { id: 'trips', icon: Navigation, label: 'Trips' },
            { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
            { id: 'chat', icon: MessageCircle, label: 'Chat' },
            { id: 'menu', icon: UtensilsCrossed, label: 'Menu' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-150 min-w-[44px] min-h-[44px] ${
                activeTab === tab.id
                  ? 'bg-[rgb(34,139,34)]/10 text-[rgb(34,139,34)]'
                  : 'text-gray-600 hover:text-[rgb(15,23,42)]'
              }`}
              aria-label={`Switch to ${tab.label} tab`}
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

// Mock data
const DEFAULT_TRIPS: Trip[] = [
  {
    id: '1',
    name: 'Moab Desert Adventure',
    location: 'Moab, Utah',
    startDate: '2024-02-15',
    endDate: '2024-02-18',
    memberCount: 6,
    status: 'confirmed'
  },
  {
    id: '2',
    name: 'Sierra Nevada Expedition',
    location: 'Mammoth Lakes, CA',
    startDate: '2024-03-01',
    endDate: '2024-03-03',
    memberCount: 4,
    status: 'planning'
  }
]

const DEFAULT_TASKS: TaskAssignment[] = [
  {
    id: '1',
    task: 'Bring lunch for Saturday',
    assignee: 'Mike Johnson',
    category: 'food',
    completed: false
  },
  {
    id: '2',
    task: 'Collect firewood',
    assignee: 'Sarah Chen',
    category: 'logistics',
    completed: true
  },
  {
    id: '3',
    task: 'Pack first aid kit',
    assignee: 'John Doe',
    category: 'gear',
    completed: false
  },
  {
    id: '4',
    task: 'Prepare breakfast Sunday',
    assignee: 'Lisa Park',
    category: 'food',
    completed: false
  }
]

const DEFAULT_WEATHER: WeatherData = {
  temperature: 72,
  condition: 'Sunny',
  humidity: 45
}

const DEFAULT_MEALS = [
  {
    name: 'Saturday Breakfast',
    time: 'Sat 8:00 AM',
    description: 'Pancakes, bacon, and fresh coffee',
    preparedBy: 'Mike Johnson'
  },
  {
    name: 'Saturday Lunch',
    time: 'Sat 12:30 PM',
    description: 'Trail sandwiches and energy bars',
    preparedBy: 'Sarah Chen'
  },
  {
    name: 'Saturday Dinner',
    time: 'Sat 7:00 PM',
    description: 'Grilled burgers and campfire beans',
    preparedBy: 'John Doe'
  },
  {
    name: 'Sunday Breakfast',
    time: 'Sun 8:30 AM',
    description: 'Oatmeal and fresh fruit',
    preparedBy: 'Lisa Park'
  }
]

// Demo component for page.tsx
export default function OffRoadTripPlannerDemo() {
  return <OffRoadTripPlanner />
}