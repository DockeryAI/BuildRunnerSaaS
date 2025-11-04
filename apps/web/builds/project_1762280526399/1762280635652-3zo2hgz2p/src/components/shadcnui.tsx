'use client'

import { useState, useEffect } from 'react'
import { MapPin, Calendar, Users, MessageCircle, Utensils, CheckCircle, X, Plus, Edit, Trash2, Cloud, Sun, CloudRain, Snow, Wind } from 'lucide-react'

interface Location {
  id: string
  name: string
  coordinates: { lat: number; lng: number }
  description: string
  difficulty: 'easy' | 'moderate' | 'hard'
}

interface GroupMember {
  id: string
  name: string
  email: string
  avatar?: string
  status: 'invited' | 'accepted' | 'declined'
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

interface ChatMessage {
  id: string
  userId: string
  userName: string
  message: string
  timestamp: string
}

interface WeatherData {
  day: string
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy'
  high: number
  low: number
  precipitation: number
}

interface Trip {
  id: string
  name: string
  location: Location
  startDate: string
  endDate: string
  members: GroupMember[]
  tasks: Task[]
  meals: Meal[]
  chat: ChatMessage[]
  weather: WeatherData[]
}

interface TripPlannerProps {
  initialTrip?: Trip
  onSaveTrip?: (trip: Trip) => void
  onInviteMembers?: (emails: string[]) => void
}

export function TripPlanner({
  initialTrip = DEFAULT_TRIP,
  onSaveTrip = () => console.log('Trip saved'),
  onInviteMembers = () => console.log('Members invited')
}: TripPlannerProps = {}) {
  const [trip, setTrip] = useState<Trip>(initialTrip)
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'meals' | 'chat' | 'weather'>('overview')
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showMealModal, setShowMealModal] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)

  const handleLocationSelect = (location: Location) => {
    setTrip(prev => ({ ...prev, location }))
    setShowLocationModal(false)
  }

  const handleAddMember = (member: GroupMember) => {
    setTrip(prev => ({
      ...prev,
      members: [...prev.members, member]
    }))
    setShowMemberModal(false)
  }

  const handleTaskToggle = (taskId: string) => {
    setTrip(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }))
  }

  const handleAddTask = (task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: Date.now().toString() }
    setTrip(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }))
    setShowTaskModal(false)
    setEditingTask(null)
  }

  const handleAddMeal = (meal: Omit<Meal, 'id'>) => {
    const newMeal = { ...meal, id: Date.now().toString() }
    setTrip(prev => ({
      ...prev,
      meals: [...prev.meals, newMeal]
    }))
    setShowMealModal(false)
    setEditingMeal(null)
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: 'You',
      message: newMessage,
      timestamp: new Date().toISOString()
    }
    
    setTrip(prev => ({
      ...prev,
      chat: [...prev.chat, message]
    }))
    setNewMessage('')
  }

  const getWeatherIcon = (condition: WeatherData['condition']) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-6 h-6 text-yellow-500" />
      case 'cloudy': return <Cloud className="w-6 h-6 text-gray-500" />
      case 'rainy': return <CloudRain className="w-6 h-6 text-[rgb(34, 139, 34)]" />
      case 'snowy': return <Snow className="w-6 h-6 text-blue-200" />
      case 'windy': return <Wind className="w-6 h-6 text-gray-600" />
      default: return <Sun className="w-6 h-6 text-yellow-500" />
    }
  }

  const TabButton = ({ tab, label, icon }: { tab: typeof activeTab, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        activeTab === tab
          ? 'bg-[rgb(34,139,34)] text-white'
          : 'bg-[rgb(248,250,252)] text-[rgb(15,23,42)] hover:bg-[rgb(241,245,249)]'
      }`}
      aria-label={`Switch to ${label} tab`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      {/* Header */}
      <div className="bg-[rgb(34,139,34)] text-white p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">{trip.name}</h1>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{trip.location.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{trip.members.length} members</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-[rgb(226,232,240)] p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-2 overflow-x-auto">
            <TabButton tab="overview" label="Overview" icon={<MapPin className="w-4 h-4" />} />
            <TabButton tab="tasks" label="Tasks" icon={<CheckCircle className="w-4 h-4" />} />
            <TabButton tab="meals" label="Meals" icon={<Utensils className="w-4 h-4" />} />
            <TabButton tab="chat" label="Chat" icon={<MessageCircle className="w-4 h-4" />} />
            <TabButton tab="weather" label="Weather" icon={<Cloud className="w-4 h-4" />} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Location Card */}
            <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Location</h2>
                <button
                  onClick={() => setShowLocationModal(true)}
                  className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors"
                  aria-label="Change location"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">{trip.location.name}</h3>
                <p className="text-[rgb(15,23,42)]/70">{trip.location.description}</p>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    trip.location.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    trip.location.difficulty === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {trip.location.difficulty}
                  </span>
                </div>
              </div>
            </div>

            {/* Members Card */}
            <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Group Members</h2>
                <button
                  onClick={() => setShowMemberModal(true)}
                  className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors"
                  aria-label="Add member"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="grid gap-3">
                {trip.members.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-[rgb(248,250,252)] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[rgb(34,139,34)] text-white rounded-full flex items-center justify-center font-semibold">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold">{member.name}</div>
                        <div className="text-sm text-[rgb(15,23,42)]/70">{member.email}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      member.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      member.status === 'declined' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {member.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Tasks</h2>
              <button
                onClick={() => setShowTaskModal(true)}
                className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors flex items-center gap-2"
                aria-label="Add task"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>

            <div className="grid gap-4">
              {trip.tasks.map(task => (
                <div key={task.id} className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleTaskToggle(task.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          task.completed
                            ? 'bg-[rgb(34,139,34)] border-[rgb(34,139,34)] text-white'
                            : 'border-[rgb(226,232,240)] hover:border-[rgb(34,139,34)]'
                        }`}
                        aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {task.completed && <CheckCircle className="w-4 h-4" />}
                      </button>
                      <div>
                        <h3 className={`font-semibold ${task.completed ? 'line-through text-[rgb(15,23,42)]/50' : ''}`}>
                          {task.title}
                        </h3>
                        <div className="text-sm text-[rgb(15,23,42)]/70">
                          Assigned to: {trip.members.find(m => m.id === task.assignedTo)?.name || 'Unassigned'}
                        </div>
                        <div className="text-sm text-[rgb(15,23,42)]/70">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        task.category === 'food' ? 'bg-orange-100 text-orange-800' :
                        task.category === 'equipment' ? 'bg-blue-100 text-blue-800' :
                        task.category === 'logistics' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {task.category}
                      </span>
                      <button
                        onClick={() => {
                          setEditingTask(task)
                          setShowTaskModal(true)
                        }}
                        className="p-1 text-[rgb(15,23,42)]/50 hover:text-[rgb(15,23,42)]"
                        aria-label="Edit task"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'meals' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Meal Planning</h2>
              <button
                onClick={() => setShowMealModal(true)}
                className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors flex items-center gap-2"
                aria-label="Add meal"
              >
                <Plus className="w-4 h-4" />
                Add Meal
              </button>
            </div>

            <div className="grid gap-4">
              {trip.meals.map(meal => (
                <div key={meal.id} className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{meal.name}</h3>
                      <div className="text-sm text-[rgb(15,23,42)]/70">
                        {meal.day} - {meal.time}
                      </div>
                      <div className="text-sm text-[rgb(15,23,42)]/70">
                        Prepared by: {trip.members.find(m => m.id === meal.assignedTo)?.name || 'Unassigned'}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setEditingMeal(meal)
                        setShowMealModal(true)
                      }}
                      className="p-1 text-[rgb(15,23,42)]/50 hover:text-[rgb(15,23,42)]"
                      aria-label="Edit meal"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Ingredients:</h4>
                    <div className="flex flex-wrap gap-2">
                      {meal.ingredients.map((ingredient, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-[rgb(248,250,252)] rounded-full">
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Group Chat</h2>
            
            <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] h-96 flex flex-col">
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {trip.chat.map(message => (
                  <div key={message.id} className="flex gap-3">
                    <div className="w-8 h-8 bg-[rgb(34,139,34)] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {message.userName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{message.userName}</span>
                        <span className="text-xs text-[rgb(15,23,42)]/50">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{message.message}</p>
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
                    className="flex-1 px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]"
                    aria-label="Type message"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors"
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
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Weather Forecast</h2>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {trip.weather.map((day, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{day.day}</h3>
                    {getWeatherIcon(day.condition)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-[rgb(15,23,42)]/70">High</span>
                      <span className="font-semibold">{day.high}°F</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[rgb(15,23,42)]/70">Low</span>
                      <span className="font-semibold">{day.low}°F</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[rgb(15,23,42)]/70">Precipitation</span>
                      <span className="font-semibold">{day.precipitation}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Select Location</h3>
              <button
                onClick={() => setShowLocationModal(false)}
                className="p-1 text-[rgb(15,23,42)]/50 hover:text-[rgb(15,23,42)]"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {SAMPLE_LOCATIONS.map(location => (
                <button
                  key={location.id}
                  onClick={() => handleLocationSelect(location)}
                  className="w-full text-left p-3 border border-[rgb(226,232,240)] rounded-lg hover:bg-[rgb(248,250,252)] transition-colors"
                >
                  <div className="font-semibold">{location.name}</div>
                  <div className="text-sm text-[rgb(15,23,42)]/70">{location.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Add Member</h3>
              <button
                onClick={() => setShowMemberModal(false)}
                className="p-1 text-[rgb(15,23,42)]/50 hover:text-[rgb(15,23,42)]"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const member: GroupMember = {
                id: Date.now().toString(),
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                status: 'invited'
              }
              handleAddMember(member)
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editingTask ? 'Edit Task' : 'Add Task'}</h3>
              <button
                onClick={() => {
                  setShowTaskModal(false)
                  setEditingTask(null)
                }}
                className="p-1 text-[rgb(15,23,42)]/50 hover:text-[rgb(15,23,42)]"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const task = {
                title: formData.get('title') as string,
                assignedTo: formData.get('assignedTo') as string,
                dueDate: formData.get('dueDate') as string,
                category: formData.get('category') as Task['category'],
                completed: editingTask?.completed || false
              }
              handleAddTask(task)
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingTask?.title}
                    required
                    className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Assigned To</label>
                  <select
                    name="assignedTo"
                    defaultValue={editingTask?.assignedTo}
                    required
                    className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]"
                  >
                    <option value="">Select member</option>
                    {trip.members.map(member => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    defaultValue={editingTask?.dueDate}
                    required
                    className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    name="category"
                    defaultValue={editingTask?.category}
                    required
                    className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]"
                  >
                    <option value="food">Food</option>
                    <option value="equipment">Equipment</option>
                    <option value="logistics">Logistics</option>
                    <option value="safety">Safety</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors"
                >
                  {editingTask ? 'Update Task' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Meal Modal */}
      {showMealModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editingMeal ? 'Edit Meal' : 'Add Meal'}</h3>
              <button
                onClick={() => {
                  setShowMealModal(false)
                  setEditingMeal(null)
                }}
                className="p-1 text-[rgb(15,23,42)]/50 hover:text-[rgb(15,23,42)]"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const ingredients = (formData.get('ingredients') as string).split(',').map(i => i.trim())
              const meal = {
                name: formData.get('name') as string,
                day: formData.get('day') as string,
                time: formData.get('time') as Meal['time'],
                assignedTo: formData.get('assignedTo') as string,
                ingredients
              }
              handleAddMeal(meal)
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Meal Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingMeal?.name}
                    required
                    className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Day</label>
                  <input
                    type="text"
                    name="day"
                    defaultValue={editingMeal?.day}
                    placeholder="e.g., Saturday"
                    required
                    className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time</label>
                  <select
                    name="time"
                    defaultValue={editingMeal?.time}
                    required
                    className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Assigned To</label>
                  <select
                    name="assignedTo"
                    defaultValue={editingMeal?.assignedTo}
                    required
                    className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]"
                  >
                    <option value="">Select member</option>
                    {trip.members.map(member => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ingredients (comma separated)</label>
                  <textarea
                    name="ingredients"
                    defaultValue={editingMeal?.ingredients.join(', ')}
                    rows={3}
                    className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors"
                >
                  {editingMeal ? 'Update Meal' : 'Add Meal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Sample data
const SAMPLE_LOCATIONS: Location[] = [
  {
    id: '1',
    name: 'Moab, Utah',
    coordinates: { lat: 38.5733, lng: -109.5498 },
    description: 'Famous for its red rock formations and challenging trails',
    difficulty: 'moderate'
  },
  {
    id: '2',
    name: 'Rubicon Trail, California',
    coordinates: { lat: 39.0916, lng: -120.1625 },
    description: 'One of the most challenging off-road trails in the US',
    difficulty: 'hard'
  },
  {
    id: '3',
    name: 'Big Bear, California',
    coordinates: { lat: 34.2439, lng: -116.9114 },
    description: 'Mountain trails with beautiful lake views',
    difficulty: 'easy'
  }
]

const DEFAULT_TRIP: Trip = {
  id: '1',
  name: 'Moab Adventure Weekend',
  location: SAMPLE_LOCATIONS[0],
  startDate: '2024-03-15',
  endDate: '2024-03-17',
  members: [
    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'accepted' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'accepted' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', status: 'invited' }
  ],
  tasks: [
    { id: '1', title: 'Bring firewood', assignedTo: '1', dueDate: '2024-03-15', completed: false, category: 'logistics' },
    { id: '2', title: 'Prepare lunch for Saturday', assignedTo: '2', dueDate: '2024-03-16', completed: false, category: 'food' },
    { id: '3', title: 'Check tire pressure', assignedTo: '3', dueDate: '2024-03-14', completed: true, category: 'safety' }
  ],
  meals: [
    { id: '1', name: 'Campfire Breakfast', day: 'Saturday', time: 'breakfast', assignedTo: '1', ingredients: ['eggs', 'bacon', 'toast', 'coffee'] },
    { id: '2', name: 'Trail Lunch', day: 'Saturday', time: 'lunch', assignedTo: '2', ingredients: ['sandwiches', 'chips', 'water', 'fruit'] },
    { id: '3', name: 'BBQ Dinner', day: 'Saturday', time: 'dinner', assignedTo: '3', ingredients: ['burgers', 'hot dogs', 'vegetables', 'beer'] }
  ],
  chat: [
    { id: '1', userId: '1', userName: 'John Doe', message: 'Hey everyone! Looking forward to this trip!', timestamp: '2024-03-10T10:00:00Z' },
    { id: '2', userId: '2', userName: 'Jane Smith', message: 'Same here! I\'ll bring extra water just in case.', timestamp: '2024-03-10T10:15:00Z' },
    { id: '3', userId: '3', userName: 'Mike Johnson', message: 'Should we meet at 7 AM on Friday?', timestamp: '2024-03-10T11:00:00Z' }
  ],
  weather: [
    { day: 'Friday', condition: 'sunny', high: 75, low: 45, precipitation: 0 },
    { day: 'Saturday', condition: 'cloudy', high: 72, low: 48, precipitation: 20 },
    { day: 'Sunday', condition: 'sunny', high: 78, low: 50, precipitation: 5 }
  ]
}

export default function TripPlannerDemo() {
  return <TripPlanner />
}