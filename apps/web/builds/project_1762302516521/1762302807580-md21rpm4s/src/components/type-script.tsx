'use client'

import { useState, useEffect } from 'react'
import { MapPin, Users, Calendar, MessageCircle, CheckSquare, Cloud, Utensils, Settings } from 'lucide-react'

interface Trip {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  status: 'planning' | 'confirmed' | 'completed'
  memberCount: number
  weatherCondition: 'sunny' | 'cloudy' | 'rainy'
}

interface TaskAssignment {
  id: string
  task: string
  assignee: string
  category: 'food' | 'equipment' | 'logistics'
  completed: boolean
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
}

interface OffRoadTripPlannerProps {
  trips?: Trip[]
  tasks?: TaskAssignment[]
  meals?: Meal[]
  messages?: ChatMessage[]
  onCreateTrip?: (trip: Omit<Trip, 'id'>) => void
  onAssignTask?: (task: Omit<TaskAssignment, 'id'>) => void
  onSendMessage?: (message: string) => void
}

export function OffRoadTripPlanner({
  trips = DEFAULT_TRIPS,
  tasks = DEFAULT_TASKS,
  meals = DEFAULT_MEALS,
  messages = DEFAULT_MESSAGES,
  onCreateTrip = () => console.log('Create trip'),
  onAssignTask = () => console.log('Assign task'),
  onSendMessage = () => console.log('Send message')
}: OffRoadTripPlannerProps = {}) {
  const [activeTab, setActiveTab] = useState<'trips' | 'tasks' | 'meals' | 'chat'>('trips')
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(trips[0] || null)
  const [newMessage, setNewMessage] = useState('')
  const [showNewTripForm, setShowNewTripForm] = useState(false)
  const [newTrip, setNewTrip] = useState({
    name: '',
    location: '',
    startDate: '',
    endDate: ''
  })

  const handleCreateTrip = () => {
    if (newTrip.name && newTrip.location && newTrip.startDate && newTrip.endDate) {
      onCreateTrip({
        ...newTrip,
        status: 'planning',
        memberCount: 1,
        weatherCondition: 'sunny'
      })
      setNewTrip({ name: '', location: '', startDate: '', endDate: '' })
      setShowNewTripForm(false)
    }
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage)
      setNewMessage('')
    }
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return '☀️'
      case 'cloudy': return '☁️'
      case 'rainy': return '🌧️'
      default: return '☀️'
    }
  }

  const renderTripsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Your Trips</h2>
        <button
          onClick={() => setShowNewTripForm(true)}
          className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg font-medium text-sm shadow-md hover:bg-[rgb(29,120,29)] transition-all duration-150 active:scale-95"
          aria-label="Create new trip"
        >
          New Trip
        </button>
      </div>

      {showNewTripForm && (
        <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-[rgb(15,23,42)]">Create New Trip</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Trip name"
              value={newTrip.name}
              onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })}
              className="w-full px-4 py-3 border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-gray-400 focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/20 transition-all duration-150"
              aria-label="Trip name"
            />
            <input
              type="text"
              placeholder="Location"
              value={newTrip.location}
              onChange={(e) => setNewTrip({ ...newTrip, location: e.target.value })}
              className="w-full px-4 py-3 border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-gray-400 focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/20 transition-all duration-150"
              aria-label="Trip location"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={newTrip.startDate}
                onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })}
                className="px-4 py-3 border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/20 transition-all duration-150"
                aria-label="Start date"
              />
              <input
                type="date"
                value={newTrip.endDate}
                onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })}
                className="px-4 py-3 border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/20 transition-all duration-150"
                aria-label="End date"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreateTrip}
                className="flex-1 px-4 py-3 bg-[rgb(34,139,34)] text-white rounded-lg font-medium shadow-md hover:bg-[rgb(29,120,29)] transition-all duration-150 active:scale-95"
                aria-label="Create trip"
              >
                Create Trip
              </button>
              <button
                onClick={() => setShowNewTripForm(false)}
                className="px-4 py-3 bg-[rgb(245,247,250)] text-[rgb(15,23,42)] rounded-lg font-medium border border-[rgb(226,232,240)] hover:bg-[rgb(248, 250, 252)] transition-all duration-150"
                aria-label="Cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {trips.map((trip) => (
          <div
            key={trip.id}
            onClick={() => setSelectedTrip(trip)}
            className={`bg-white border rounded-xl p-4 shadow-md transition-all duration-200 cursor-pointer ${
              selectedTrip?.id === trip.id 
                ? 'border-[rgb(34,139,34)] ring-2 ring-[rgb(34,139,34)]/20' 
                : 'border-[rgb(226,232,240)] hover:border-[rgb(34,139,34)]/50'
            }`}
            role="button"
            tabIndex={0}
            aria-label={`Select trip ${trip.name}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-[rgb(15,23,42)] mb-1">{trip.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{trip.location}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{trip.memberCount}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-2xl">{getWeatherIcon(trip.weatherCondition)}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  trip.status === 'confirmed' 
                    ? 'bg-[rgb(34,139,34)]/20 text-[rgb(34,139,34)]'
                    : trip.status === 'planning'
                    ? 'bg-[rgb(249,115,22)]/20 text-[rgb(249,115,22)]'
                    : 'bg-[rgb(248, 250, 252)] text-gray-600'
                }`}>
                  {trip.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderTasksTab = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Task Assignments</h2>
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white border border-[rgb(226,232,240)] rounded-xl p-4 shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-150 ${
                    task.completed
                      ? 'bg-[rgb(34,139,34)] border-[rgb(34,139,34)] text-white'
                      : 'border-[rgb(226,232,240)] hover:border-[rgb(34,139,34)]'
                  }`}
                  aria-label={`Mark task ${task.task} as ${task.completed ? 'incomplete' : 'complete'}`}
                >
                  {task.completed && <CheckSquare className="w-3 h-3" />}
                </button>
                <div>
                  <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-[rgb(15,23,42)]'}`}>
                    {task.task}
                  </h3>
                  <p className="text-sm text-gray-600">Assigned to: {task.assignee}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                task.category === 'food'
                  ? 'bg-[rgb(249,115,22)]/20 text-[rgb(249,115,22)]'
                  : task.category === 'equipment'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {task.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderMealsTab = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Meal Planning</h2>
      <div className="space-y-3">
        {meals.map((meal) => (
          <div
            key={meal.id}
            className="bg-white border border-[rgb(226,232,240)] rounded-xl p-4 shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Utensils className="w-5 h-5 text-[rgb(34,139,34)]" />
                <div>
                  <h3 className="font-medium text-[rgb(15,23,42)]">{meal.name}</h3>
                  <p className="text-sm text-gray-600">{meal.day} • {meal.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-[rgb(15,23,42)]">{meal.assignedTo}</p>
                <p className="text-xs text-gray-500">Assigned</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderChatTab = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Group Chat</h2>
      <div className="bg-white border border-[rgb(226,232,240)] rounded-xl shadow-md">
        <div className="h-64 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div key={message.id} className="flex gap-3">
              <div className="w-8 h-8 bg-[rgb(34,139,34)] rounded-full flex items-center justify-center text-white text-sm font-medium">
                {message.sender[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-[rgb(15,23,42)] text-sm">{message.sender}</span>
                  <span className="text-xs text-gray-500">{message.timestamp}</span>
                </div>
                <p className="text-sm text-gray-700">{message.message}</p>
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
              className="flex-1 px-4 py-2 border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-gray-400 focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/20 transition-all duration-150"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              aria-label="Type message"
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg font-medium shadow-md hover:bg-[rgb(29,120,29)] transition-all duration-150 active:scale-95"
              aria-label="Send message"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-[rgb(34,139,34)] text-white p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">OffRoad Planner</h1>
            <Settings className="w-6 h-6" />
          </div>
          {selectedTrip && (
            <div className="mt-2">
              <p className="text-sm opacity-90">{selectedTrip.name}</p>
              <p className="text-xs opacity-75">{selectedTrip.location}</p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 pb-20">
          {activeTab === 'trips' && renderTripsTab()}
          {activeTab === 'tasks' && renderTasksTab()}
          {activeTab === 'meals' && renderMealsTab()}
          {activeTab === 'chat' && renderChatTab()}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-[rgb(226,232,240)] shadow-lg">
          <div className="grid grid-cols-4 gap-1 p-2">
            {[
              { id: 'trips', icon: MapPin, label: 'Trips' },
              { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
              { id: 'meals', icon: Utensils, label: 'Meals' },
              { id: 'chat', icon: MessageCircle, label: 'Chat' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all duration-150 ${
                  activeTab === tab.id
                    ? 'bg-[rgb(34,139,34)]/10 text-[rgb(34,139,34)]'
                    : 'text-gray-600 hover:bg-[rgb(248, 250, 252)]'
                }`}
                aria-label={`Navigate to ${tab.label}`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Mock data
const DEFAULT_TRIPS: Trip[] = [
  {
    id: '1',
    name: 'Moab Adventure',
    location: 'Moab, Utah',
    startDate: '2024-03-15',
    endDate: '2024-03-17',
    status: 'confirmed',
    memberCount: 6,
    weatherCondition: 'sunny'
  },
  {
    id: '2',
    name: 'Desert Expedition',
    location: 'Joshua Tree, CA',
    startDate: '2024-04-20',
    endDate: '2024-04-22',
    status: 'planning',
    memberCount: 4,
    weatherCondition: 'cloudy'
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
    category: 'equipment',
    completed: true
  },
  {
    id: '3',
    task: 'Book campsite reservations',
    assignee: 'Alex Rivera',
    category: 'logistics',
    completed: false
  }
]

const DEFAULT_MEALS: Meal[] = [
  {
    id: '1',
    name: 'Campfire Breakfast',
    day: 'Saturday',
    time: 'breakfast',
    assignedTo: 'Team A'
  },
  {
    id: '2',
    name: 'Trail Mix Lunch',
    day: 'Saturday',
    time: 'lunch',
    assignedTo: 'Mike Johnson'
  },
  {
    id: '3',
    name: 'BBQ Dinner',
    day: 'Saturday',
    time: 'dinner',
    assignedTo: 'Sarah Chen'
  }
]

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    sender: 'Mike',
    message: 'Hey everyone! Excited for the Moab trip. Should I bring extra water?',
    timestamp: '10:30 AM'
  },
  {
    id: '2',
    sender: 'Sarah',
    message: 'Yes definitely! Weather looks hot this weekend.',
    timestamp: '10:32 AM'
  },
  {
    id: '3',
    sender: 'Alex',
    message: 'I can bring the portable grill for Saturday dinner',
    timestamp: '10:35 AM'
  }
]

// Demo component for page.tsx
export default function OffRoadTripPlannerDemo() {
  return <OffRoadTripPlanner />
}