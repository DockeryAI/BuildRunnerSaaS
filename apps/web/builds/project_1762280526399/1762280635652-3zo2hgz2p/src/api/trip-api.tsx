'use client'

import { useState, useEffect } from 'react'
import { MapPin, Calendar, Users, MessageSquare, Utensils, Cloud, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface Location {
  id: string
  name: string
  coordinates: {
    lat: number
    lng: number
  }
  description?: string
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
  temperature: {
    high: number
    low: number
  }
  condition: string
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
  weather: WeatherData[]
  description?: string
}

interface TripAPIProps {
  onTripCreate?: (trip: Trip) => void
  onTripUpdate?: (tripId: string, updates: Partial<Trip>) => void
  onTripDelete?: (tripId: string) => void
  initialTrips?: Trip[]
}

export function TripAPI({
  onTripCreate = (trip) => console.log('Trip created:', trip),
  onTripUpdate = (id, updates) => console.log('Trip updated:', id, updates),
  onTripDelete = (id) => console.log('Trip deleted:', id),
  initialTrips = DEFAULT_TRIPS
}: TripAPIProps = {}) {
  const [trips, setTrips] = useState<Trip[]>(initialTrips)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'meals' | 'weather' | 'chat'>('overview')

  useEffect(() => {
    if (trips.length > 0 && !selectedTrip) {
      setSelectedTrip(trips[0])
    }
  }, [trips, selectedTrip])

  const createTrip = async (tripData: Omit<Trip, 'id'>) => {
    setLoading(true)
    setError(null)
    
    try {
      const newTrip: Trip = {
        ...tripData,
        id: `trip_${Date.now()}`
      }
      
      setTrips(prev => [...prev, newTrip])
      setSelectedTrip(newTrip)
      onTripCreate(newTrip)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (err) {
      setError('Failed to create trip. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateTrip = async (tripId: string, updates: Partial<Trip>) => {
    setLoading(true)
    setError(null)
    
    try {
      setTrips(prev => prev.map(trip => 
        trip.id === tripId ? { ...trip, ...updates } : trip
      ))
      
      if (selectedTrip?.id === tripId) {
        setSelectedTrip(prev => prev ? { ...prev, ...updates } : null)
      }
      
      onTripUpdate(tripId, updates)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (err) {
      setError('Failed to update trip. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const deleteTrip = async (tripId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      setTrips(prev => prev.filter(trip => trip.id !== tripId))
      
      if (selectedTrip?.id === tripId) {
        setSelectedTrip(trips.find(trip => trip.id !== tripId) || null)
      }
      
      onTripDelete(tripId)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (err) {
      setError('Failed to delete trip. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const addTask = async (tripId: string, task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: `task_${Date.now()}`
    }
    
    await updateTrip(tripId, {
      tasks: [...(selectedTrip?.tasks || []), newTask]
    })
  }

  const updateTask = async (tripId: string, taskId: string, updates: Partial<Task>) => {
    const updatedTasks = selectedTrip?.tasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    ) || []
    
    await updateTrip(tripId, { tasks: updatedTasks })
  }

  const addMeal = async (tripId: string, meal: Omit<Meal, 'id'>) => {
    const newMeal: Meal = {
      ...meal,
      id: `meal_${Date.now()}`
    }
    
    await updateTrip(tripId, {
      meals: [...(selectedTrip?.meals || []), newMeal]
    })
  }

  const inviteMember = async (tripId: string, email: string) => {
    const newMember: GroupMember = {
      id: `member_${Date.now()}`,
      name: email.split('@')[0],
      email,
      status: 'invited'
    }
    
    await updateTrip(tripId, {
      members: [...(selectedTrip?.members || []), newMember]
    })
  }

  const updateMemberStatus = async (tripId: string, memberId: string, status: GroupMember['status']) => {
    const updatedMembers = selectedTrip?.members.map(member =>
      member.id === memberId ? { ...member, status } : member
    ) || []
    
    await updateTrip(tripId, { members: updatedMembers })
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[rgb(255,255,255)] p-4">
        <div className="max-w-md mx-auto mt-8 p-6 bg-[rgb(248,250,252)] rounded-lg border border-[rgb(226,232,240)]">
          <div className="flex items-center gap-3 text-[rgb(239,68,68)]">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="mt-4 w-full px-4 py-2 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-md font-medium hover:bg-[rgb(34,139,34)]/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      {/* Header */}
      <div className="bg-[rgb(34,139,34)] text-[rgb(255,255,255)] p-4 shadow-md">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl font-bold">Off-Road Trip Planner</h1>
          {selectedTrip && (
            <p className="text-sm opacity-90 mt-1">{selectedTrip.name}</p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Trip Selection */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {trips.map(trip => (
              <button
                key={trip.id}
                onClick={() => setSelectedTrip(trip)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  selectedTrip?.id === trip.id
                    ? 'bg-[rgb(34,139,34)] text-[rgb(255,255,255)]'
                    : 'bg-[rgb(248,250,252)] text-[rgb(15,23,42)] hover:bg-[rgb(241,245,249)]'
                }`}
                aria-label={`Select ${trip.name} trip`}
              >
                {trip.name}
              </button>
            ))}
            <button
              onClick={() => createTrip({
                name: `New Trip ${trips.length + 1}`,
                location: DEFAULT_LOCATION,
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
                members: [],
                tasks: [],
                meals: [],
                weather: DEFAULT_WEATHER
              })}
              disabled={loading}
              className="px-4 py-2 bg-[rgb(245,158,11)] text-[rgb(255,255,255)] rounded-md font-medium hover:bg-[rgb(245,158,11)]/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              aria-label="Create new trip"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '+'}
              New Trip
            </button>
          </div>
        </div>

        {selectedTrip && (
          <>
            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto gap-1 mb-6 border-b border-[rgb(226,232,240)]">
              {[
                { id: 'overview', label: 'Overview', icon: MapPin },
                { id: 'tasks', label: 'Tasks', icon: CheckCircle },
                { id: 'meals', label: 'Meals', icon: Utensils },
                { id: 'weather', label: 'Weather', icon: Cloud },
                { id: 'chat', label: 'Chat', icon: MessageSquare }
              ].map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-3 font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'text-[rgb(34,139,34)] border-b-2 border-[rgb(34,139,34)]'
                        : 'text-[rgb(15,23,42)] hover:text-[rgb(34,139,34)]'
                    }`}
                    aria-label={`View ${tab.label} tab`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'overview' && (
                <OverviewTab
                  trip={selectedTrip}
                  onUpdate={(updates) => updateTrip(selectedTrip.id, updates)}
                  onInviteMember={(email) => inviteMember(selectedTrip.id, email)}
                  onUpdateMemberStatus={(memberId, status) => updateMemberStatus(selectedTrip.id, memberId, status)}
                  loading={loading}
                />
              )}

              {activeTab === 'tasks' && (
                <TasksTab
                  trip={selectedTrip}
                  onAddTask={(task) => addTask(selectedTrip.id, task)}
                  onUpdateTask={(taskId, updates) => updateTask(selectedTrip.id, taskId, updates)}
                  loading={loading}
                />
              )}

              {activeTab === 'meals' && (
                <MealsTab
                  trip={selectedTrip}
                  onAddMeal={(meal) => addMeal(selectedTrip.id, meal)}
                  loading={loading}
                />
              )}

              {activeTab === 'weather' && (
                <WeatherTab weather={selectedTrip.weather} />
              )}

              {activeTab === 'chat' && (
                <ChatTab trip={selectedTrip} />
              )}
            </div>
          </>
        )}

        {!selectedTrip && trips.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-[rgb(226,232,240)] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[rgb(15,23,42)] mb-2">No trips yet</h2>
            <p className="text-[rgb(15,23,42)]/60 mb-6">Create your first off-road adventure</p>
            <button
              onClick={() => createTrip({
                name: 'My First Trip',
                location: DEFAULT_LOCATION,
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
                members: [],
                tasks: [],
                meals: [],
                weather: DEFAULT_WEATHER
              })}
              className="px-6 py-3 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-md font-medium hover:bg-[rgb(34,139,34)]/90 transition-colors"
            >
              Create Trip
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function OverviewTab({ 
  trip, 
  onUpdate, 
  onInviteMember, 
  onUpdateMemberStatus, 
  loading 
}: {
  trip: Trip
  onUpdate: (updates: Partial<Trip>) => void
  onInviteMember: (email: string) => void
  onUpdateMemberStatus: (memberId: string, status: GroupMember['status']) => void
  loading: boolean
}) {
  const [inviteEmail, setInviteEmail] = useState('')

  const handleInvite = () => {
    if (inviteEmail.trim()) {
      onInviteMember(inviteEmail.trim())
      setInviteEmail('')
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Trip Details */}
      <div className="bg-[rgb(248,250,252)] p-6 rounded-lg border border-[rgb(226,232,240)]">
        <h3 className="text-lg font-bold text-[rgb(15,23,42)] mb-4">Trip Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
              Trip Name
            </label>
            <input
              type="text"
              value={trip.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
              aria-label="Trip name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
              Location
            </label>
            <div className="flex items-center gap-2 text-[rgb(15,23,42)]">
              <MapPin className="w-4 h-4" />
              <span>{trip.location.name}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={trip.startDate}
                onChange={(e) => onUpdate({ startDate: e.target.value })}
                className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                aria-label="Start date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
                End Date
              </label>
              <input
                type="date"
                value={trip.endDate}
                onChange={(e) => onUpdate({ endDate: e.target.value })}
                className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                aria-label="End date"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Group Members */}
      <div className="bg-[rgb(248,250,252)] p-6 rounded-lg border border-[rgb(226,232,240)]">
        <h3 className="text-lg font-bold text-[rgb(15,23,42)] mb-4">Group Members</h3>
        
        {/* Invite Form */}
        <div className="flex gap-2 mb-4">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Enter email to invite"
            className="flex-1 px-3 py-2 border border-[rgb(226,232,240)] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
            aria-label="Email to invite"
          />
          <button
            onClick={handleInvite}
            disabled={loading || !inviteEmail.trim()}
            className="px-4 py-2 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-md font-medium hover:bg-[rgb(34,139,34)]/90 transition-colors disabled:opacity-50"
            aria-label="Send invitation"
          >
            Invite
          </button>
        </div>

        {/* Members List */}
        <div className="space-y-3">
          {trip.members.map(member => (
            <div key={member.id} className="flex items-center justify-between p-3 bg-[rgb(255,255,255)] rounded-md border border-[rgb(226,232,240)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-full flex items-center justify-center text-sm font-medium">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-[rgb(15,23,42)]">{member.name}</div>
                  <div className="text-sm text-[rgb(15,23,42)]/60">{member.email}</div>
                </div>
              </div>
              <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                member.status === 'accepted' ? 'bg-green-100 text-green-800' :
                member.status === 'declined' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {member.status}
              </div>
            </div>
          ))}
          
          {trip.members.length === 0 && (
            <div className="text-center py-6 text-[rgb(15,23,42)]/60">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <p>No members invited yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TasksTab({ 
  trip, 
  onAddTask, 
  onUpdateTask, 
  loading 
}: {
  trip: Trip
  onAddTask: (task: Omit<Task, 'id'>) => void
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  loading: boolean
}) {
  const [newTask, setNewTask] = useState({
    title: '',
    assignedTo: '',
    dueDate: '',
    category: 'other' as Task['category']
  })

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      onAddTask({
        ...newTask,
        completed: false
      })
      setNewTask({
        title: '',
        assignedTo: '',
        dueDate: '',
        category: 'other'
      })
    }
  }

  const categoryColors = {
    food: 'bg-orange-100 text-orange-800',
    equipment: 'bg-blue-100 text-blue-800',
    logistics: 'bg-purple-100 text-purple-800',
    other: 'bg-[rgb(241, 245, 249)] text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Add Task Form */}
      <div className="bg-[rgb(248,250,252)] p-6 rounded-lg border border-[rgb(226,232,240)]">
        <h3 className="text-lg font-bold text-[rgb(15,23,42)] mb-4">Add New Task</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
              Task Title
            </label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Bring firewood"
              className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
              aria-label="Task title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
              Assign To
            </label>
            <select
              value={newTask.assignedTo}
              onChange={(e) => setNewTask(prev => ({ ...prev, assignedTo: e.target.value }))}
              className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
              aria-label="Assign task to member"
            >
              <option value="">Select member</option>
              {trip.members.map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
              aria-label="Due date"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
              Category
            </label>
            <select
              value={newTask.category}
              onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value as Task['category'] }))}
              className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
              aria-label="Task category"
            >
              <option value="food">Food</option>
              <option value="equipment">Equipment</option>
              <option value="logistics">Logistics</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleAddTask}
          disabled={loading || !newTask.title.trim()}
          className="mt-4 px-4 py-2 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-md font-medium hover:bg-[rgb(34,139,34)]/90 transition-colors disabled:opacity-50"
          aria-label="Add task"
        >
          Add Task
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {trip.tasks.map(task => {
          const assignedMember = trip.members.find(m => m.id === task.assignedTo)
          return (
            <div key={task.id} className="bg-[rgb(248,250,252)] p-4 rounded-lg border border-[rgb(226,232,240)]">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onUpdateTask(task.id, { completed: !task.completed })}
                  className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    task.completed 
                      ? 'bg-[rgb(34,139,34)] border-[rgb(34,139,34)] text-[rgb(255,255,255)]'
                      : 'border-[rgb(226,232,240)] hover:border-[rgb(34,139,34)]'
                  }`}
                  aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  {task.completed && <CheckCircle className="w-3 h-3" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className={`font-medium ${task.completed ? 'line-through text-[rgb(15,23,42)]/60' : 'text-[rgb(15,23,42)]'}`}>
                      {task.title}
                    </h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${categoryColors[task.category]}`}>
                      {task.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-[rgb(15,23,42)]/60">
                    {assignedMember && (
                      <span>Assigned to: {assignedMember.name}</span>
                    )}
                    {task.dueDate && (
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        
        {trip.tasks.length === 0 && (
          <div className="text-center py-8 text-[rgb(15,23,42)]/60">
            <CheckCircle className="w-12 h-12 mx-auto mb-3" />
            <p>No tasks assigned yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

function MealsTab({ 
  trip, 
  onAddMeal, 
  loading 
}: {
  trip: Trip
  onAddMeal: (meal: Omit<Meal, 'id'>) => void
  loading: boolean
}) {
  const [newMeal, setNewMeal] = useState({
    name: '',
    date: '',
    time: '',
    assignedTo: '',
    ingredients: ['']
  })

  const handleAddMeal = () => {
    if (newMeal.name.trim()) {
      onAddMeal({
        ...newMeal,
        ingredients: newMeal.ingredients.filter(i => i.trim())
      })
      setNewMeal({
        name: '',
        date: '',
        time: '',
        assignedTo: '',
        ingredients: ['']
      })
    }
  }

  const addIngredient = () => {
    setNewMeal(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }))
  }

  const updateIngredient = (index: number, value: string) => {
    setNewMeal(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => i === index ? value : ing)
    }))
  }

  return (
    <div className="space-y-6">
      {/* Add Meal Form */}
      <div className="bg-[rgb(248,250,252)] p-6 rounded-lg border border-[rgb(226,232,240)]">
        <h3 className="text-lg font-bold text-[rgb(15,23,42)] mb-4">Plan a Meal</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
              Meal Name
            </label>
            <input
              type="text"
              value={newMeal.name}
              onChange={(e) => setNewMeal(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Saturday Lunch"
              className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
              aria-label="Meal name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
              Assigned To
            </label>
            <select
              value={newMeal.assignedTo}
              onChange={(e) => setNewMeal(prev => ({ ...prev, assignedTo: e.target.value }))}
              className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
              aria-label="Assign meal to member"
            >
              <option value="">Select member</option>
              {trip.members.map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
              Date
            </label>
            <input
              type="date"
              value={newMeal.date}
              onChange={(e) => setNewMeal(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
              aria-label="Meal date"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
              Time
            </label>
            <input
              type="time"
              value={newMeal.time}
              onChange={(e) => setNewMeal(prev => ({ ...prev, time: e.target.value }))}
              className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
              aria-label="Meal time"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
            Ingredients
          </label>
          {newMeal.ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={ingredient}
                onChange={(e) => updateIngredient(index, e.target.value)}
                placeholder="Enter ingredient"
                className="flex-1 px-3 py-2 border border-[rgb(226,232,240)] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                aria-label={`Ingredient ${index + 1}`}
              />
            </div>
          ))}
          <button
            onClick={addIngredient}
            className="text-sm text-[rgb(34,139,34)] hover:underline"
            aria-label="Add ingredient"
          >
            + Add ingredient
          </button>
        </div>
        
        <button
          onClick={handleAddMeal}
          disabled={loading || !newMeal.name.trim()}
          className="mt-4 px-4 py-2 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-md font-medium hover:bg-[rgb(34,139,34)]/90 transition-colors disabled:opacity-50"
          aria-label="Add meal"
        >
          Add Meal
        </button>
      </div>

      {/* Meals List */}
      <div className="space-y-4">
        {trip.meals.map(meal => {
          const assignedMember = trip.members.find(m => m.id === meal.assignedTo)
          return (
            <div key={meal.id} className="bg-[rgb(248,250,252)] p-4 rounded-lg border border-[rgb(226,232,240)]">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-[rgb(15,23,42)]">{meal.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-[rgb(15,23,42)]/60 mt-1">
                    <span>{new Date(meal.date).toLocaleDateString()}</span>
                    <span>{meal.time}</span>
                    {assignedMember && <span>by {assignedMember.name}</span>}
                  </div>
                </div>
                <Utensils className="w-5 h-5 text-[rgb(34,139,34)]" />
              </div>
              {meal.ingredients.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-[rgb(15,23,42)] mb-2">Ingredients:</p>
                  <div className="flex flex-wrap gap-2">
                    {meal.ingredients.map((ingredient, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-[rgb(255,255,255)] text-[rgb(15,23,42)] rounded border border-[rgb(226,232,240)]"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
        
        {trip.meals.length === 0 && (
          <div className="text-center py-8 text-[rgb(15,23,42)]/60">
            <Utensils className="w-12 h-12 mx-auto mb-3" />
            <p>No meals planned yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

function WeatherTab({ weather }: { weather: WeatherData[] }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-[rgb(15,23,42)]">Weather Forecast</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {weather.map((day, index) => (
          <div key={index} className="bg-[rgb(248,250,252)] p-4 rounded-lg border border-[rgb(226,232,240)]">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-[rgb(15,23,42)]">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
              <Cloud className="w-5 h-5 text-[rgb(34,139,34)]" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-2xl font-bold text-[rgb(15,23,42)]">{day.temperature.high}°</span>
                <span className="text-lg text-[rgb(15,23,42)]/60">{day.temperature.low}°</span>
              </div>
              <p className="text-sm text-[rgb(15,23,42)]">{day.condition}</p>
              {day.precipitation > 0 && (
                <p className="text-sm text-[rgb(34,139,34)]">
                  {day.precipitation}% chance of rain
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChatTab({ trip }: { trip: Trip }) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'John',
      content: 'Looking forward to this trip!',
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      sender: 'Sarah',
      content: 'Should we bring extra water?',
      timestamp: new Date().toISOString()
    }
  ])

  const sendMessage = () => {
    if (message.trim()) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'You',
        content: message.trim(),
        timestamp: new Date().toISOString()
      }])
      setMessage('')
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-[rgb(15,23,42)]">Group Chat</h3>
      
      {/* Messages */}
      <div className="bg-[rgb(248,250,252)] rounded-lg border border-[rgb(226,232,240)] h-96 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className="flex gap-3">
            <div className="w-8 h-8 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-full flex items-center justify-center text-sm font-medium">
              {msg.sender.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-[rgb(15,23,42)]">{msg.sender}</span>
                <span className="text-xs text-[rgb(15,23,42)]/60">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-[rgb(15,23,42)]">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border border-[rgb(226,232,240)] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
          aria-label="Type message"
        />
        <button
          onClick={sendMessage}
          disabled={!message.trim()}
          className="px-4 py-2 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-md font-medium hover:bg-[rgb(34,139,34)]/90 transition-colors disabled:opacity-50"
          aria-label="Send message"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Mock data
const DEFAULT_LOCATION: Location = {
  id: 'loc_1',
  name: 'Moab, Utah',
  coordinates: { lat: 38.5733, lng: -109.5498 },
  description: 'Famous off-road destination'
}

const DEFAULT_WEATHER: WeatherData[] = [
  {
    date: new Date().toISOString().split('T')[0],
    temperature: { high: 75, low: 45 },
    condition: 'Sunny',
    precipitation: 0
  },
  {
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    temperature: { high: 72, low: 42 },
    condition: 'Partly Cloudy',
    precipitation: 10
  },
  {
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    temperature: { high: 68, low: 40 },
    condition: 'Cloudy',
    precipitation: 30
  }
]

const DEFAULT_TRIPS: Trip[] = [
  {
    id: 'trip_1',
    name: 'Moab Adventure',
    location: DEFAULT_LOCATION,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    members: [
      {
        id: 'member_1',
        name: 'John Doe',
        email: 'john@example.com',
        status: 'accepted'
      },
      {
        id: 'member_2',
        name: 'Sarah Smith',
        email: 'sarah@example.com',
        status: 'invited'
      }
    ],
    tasks: [
      {
        id: 'task_1',
        title: 'Bring firewood',
        assignedTo: 'member_1',
        dueDate: new Date().toISOString().split('T')[0],
        completed: false,
        category: 'equipment'
      },
      {
        id: 'task_2',
        title: 'Plan Saturday lunch',
        assignedTo: 'member_2',
        dueDate: new Date().toISOString().split('T')[0],
        completed: true,
        category: 'food'
      }
    ],
    meals: [
      {
        id: 'meal_1',
        name: 'Saturday Breakfast',
        date: new Date().toISOString().split('T')[0],
        time: '08:00',
        assignedTo: 'member_1',
        ingredients: ['Eggs', 'Bacon', 'Toast', 'Coffee']
      }
    ],
    weather: DEFAULT_WEATHER,
    description: 'Epic off-road adventure in Moab'
  }
]

export default function TripAPIDemo() {
  return <TripAPI />
}