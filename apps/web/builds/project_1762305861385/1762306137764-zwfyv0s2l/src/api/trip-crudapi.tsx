'use client'

import { useState, useEffect } from 'react'
import { MapPin, Calendar, Users, MessageSquare, Utensils, CloudRain, Plus, Edit2, Trash2, Save, X } from 'lucide-react'

interface Location {
  id: string
  name: string
  coordinates: { lat: number; lng: number }
  description: string
  difficulty: 'Easy' | 'Moderate' | 'Hard'
  terrain: string
}

interface GroupMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'organizer' | 'member'
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

interface Trip {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: Location
  organizer: string
  members: GroupMember[]
  tasks: Task[]
  meals: Meal[]
  status: 'planning' | 'confirmed' | 'active' | 'completed' | 'cancelled'
  weatherForecast?: any
  rsvpResponses: Record<string, 'yes' | 'no' | 'maybe'>
}

interface TripCRUDAPIProps {
  initialTrips?: Trip[]
  onTripCreate?: (trip: Trip) => void
  onTripUpdate?: (trip: Trip) => void
  onTripDelete?: (tripId: string) => void
}

const DEFAULT_LOCATIONS: Location[] = [
  {
    id: '1',
    name: 'Moab Desert Trail',
    coordinates: { lat: 38.5733, lng: -109.5498 },
    description: 'Challenging red rock terrain with stunning views',
    difficulty: 'Hard',
    terrain: 'Rocky desert'
  },
  {
    id: '2',
    name: 'Pine Valley Loop',
    coordinates: { lat: 40.2731, lng: -111.6435 },
    description: 'Moderate forest trail perfect for beginners',
    difficulty: 'Moderate',
    terrain: 'Forest paths'
  }
]

const DEFAULT_MEMBERS: GroupMember[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex@example.com', role: 'organizer' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@example.com', role: 'member' },
  { id: '3', name: 'Mike Rodriguez', email: 'mike@example.com', role: 'member' }
]

export function TripCRUDAPI({
  initialTrips = [],
  onTripCreate = () => {},
  onTripUpdate = () => {},
  onTripDelete = () => {}
}: TripCRUDAPIProps = {}) {
  const [trips, setTrips] = useState<Trip[]>(initialTrips)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'meals' | 'members' | 'chat'>('overview')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state for creating/editing trips
  const [formData, setFormData] = useState<Partial<Trip>>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: DEFAULT_LOCATIONS[0],
    members: DEFAULT_MEMBERS,
    tasks: [],
    meals: [],
    status: 'planning',
    rsvpResponses: {}
  })

  useEffect(() => {
    // Simulate API call to fetch trips
    const fetchTrips = async () => {
      setLoading(true)
      try {
        // Mock API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const mockTrips: Trip[] = [
          {
            id: '1',
            title: 'Moab Adventure Weekend',
            description: 'Epic off-road adventure through red rock country',
            startDate: '2024-03-15',
            endDate: '2024-03-17',
            location: DEFAULT_LOCATIONS[0],
            organizer: DEFAULT_MEMBERS[0].id,
            members: DEFAULT_MEMBERS,
            tasks: [
              {
                id: '1',
                title: 'Bring lunch for Saturday',
                assignedTo: DEFAULT_MEMBERS[1].id,
                dueDate: '2024-03-15',
                completed: false,
                category: 'food'
              },
              {
                id: '2',
                title: 'Collect firewood',
                assignedTo: DEFAULT_MEMBERS[2].id,
                dueDate: '2024-03-15',
                completed: false,
                category: 'logistics'
              }
            ],
            meals: [
              {
                id: '1',
                name: 'Campfire Breakfast',
                day: '2024-03-16',
                time: 'breakfast',
                assignedTo: DEFAULT_MEMBERS[0].id,
                ingredients: ['Eggs', 'Bacon', 'Toast', 'Coffee']
              }
            ],
            status: 'planning',
            rsvpResponses: {
              [DEFAULT_MEMBERS[0].id]: 'yes',
              [DEFAULT_MEMBERS[1].id]: 'maybe',
              [DEFAULT_MEMBERS[2].id]: 'yes'
            }
          }
        ]
        
        setTrips(mockTrips)
      } catch (err) {
        setError('Failed to load trips')
      } finally {
        setLoading(false)
      }
    }

    if (initialTrips.length === 0) {
      fetchTrips()
    }
  }, [initialTrips.length])

  const handleCreateTrip = async () => {
    if (!formData.title || !formData.startDate || !formData.endDate) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const newTrip: Trip = {
        id: Date.now().toString(),
        title: formData.title!,
        description: formData.description || '',
        startDate: formData.startDate!,
        endDate: formData.endDate!,
        location: formData.location || DEFAULT_LOCATIONS[0],
        organizer: DEFAULT_MEMBERS[0].id,
        members: formData.members || DEFAULT_MEMBERS,
        tasks: formData.tasks || [],
        meals: formData.meals || [],
        status: 'planning',
        rsvpResponses: {}
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setTrips(prev => [...prev, newTrip])
      onTripCreate(newTrip)
      setIsCreating(false)
      setFormData({})
      setError(null)
    } catch (err) {
      setError('Failed to create trip')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTrip = async () => {
    if (!selectedTrip || !formData.title) return

    setLoading(true)
    try {
      const updatedTrip: Trip = {
        ...selectedTrip,
        ...formData
      } as Trip

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setTrips(prev => prev.map(trip => 
        trip.id === selectedTrip.id ? updatedTrip : trip
      ))
      onTripUpdate(updatedTrip)
      setSelectedTrip(updatedTrip)
      setIsEditing(false)
      setError(null)
    } catch (err) {
      setError('Failed to update trip')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm('Are you sure you want to delete this trip?')) return

    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setTrips(prev => prev.filter(trip => trip.id !== tripId))
      onTripDelete(tripId)
      if (selectedTrip?.id === tripId) {
        setSelectedTrip(null)
      }
      setError(null)
    } catch (err) {
      setError('Failed to delete trip')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = (tripId: string, task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString()
    }

    setTrips(prev => prev.map(trip => 
      trip.id === tripId 
        ? { ...trip, tasks: [...trip.tasks, newTask] }
        : trip
    ))

    if (selectedTrip?.id === tripId) {
      setSelectedTrip(prev => prev ? {
        ...prev,
        tasks: [...prev.tasks, newTask]
      } : null)
    }
  }

  const handleAddMeal = (tripId: string, meal: Omit<Meal, 'id'>) => {
    const newMeal: Meal = {
      ...meal,
      id: Date.now().toString()
    }

    setTrips(prev => prev.map(trip => 
      trip.id === tripId 
        ? { ...trip, meals: [...trip.meals, newMeal] }
        : trip
    ))

    if (selectedTrip?.id === tripId) {
      setSelectedTrip(prev => prev ? {
        ...prev,
        meals: [...prev.meals, newMeal]
      } : null)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-[rgb(34,139,34)] text-white'
      case 'Moderate': return 'bg-[rgb(245,158,11)] text-white'
      case 'Hard': return 'bg-[rgb(220,38,38)] text-white'
      default: return 'bg-[rgb(241,245,249)] text-[rgb(15,23,42)]'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-[rgb(245,158,11)] text-white'
      case 'confirmed': return 'bg-[rgb(34,139,34)] text-white'
      case 'active': return 'bg-[rgb(34, 139, 34)] text-white'
      case 'completed': return 'bg-[rgb(255, 255, 255)]0 text-white'
      case 'cancelled': return 'bg-[rgb(220,38,38)] text-white'
      default: return 'bg-[rgb(241,245,249)] text-[rgb(15,23,42)]'
    }
  }

  if (loading && trips.length === 0) {
    return (
      <div className="min-h-screen bg-[rgb(255,255,255)] p-4">
        <div className="max-w-md mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[rgb(241,245,249)] rounded"></div>
            <div className="h-32 bg-[rgb(241,245,249)] rounded-lg"></div>
            <div className="h-32 bg-[rgb(241,245,249)] rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[rgb(255,255,255)] p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-[rgb(220,38,38)] text-lg font-medium mb-2">Error</div>
          <div className="text-[rgb(15,23,42)] mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (isCreating || isEditing) {
    return (
      <div className="min-h-screen bg-[rgb(255,255,255)] p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-[rgb(15,23,42)]">
              {isCreating ? 'Create Trip' : 'Edit Trip'}
            </h1>
            <button
              onClick={() => {
                setIsCreating(false)
                setIsEditing(false)
                setFormData({})
                setError(null)
              }}
              className="p-2 text-[rgb(15,23,42)] hover:bg-[rgb(241,245,249)] rounded-lg transition-colors"
              aria-label="Close form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                Trip Title *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-gray-400 focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all"
                placeholder="Enter trip title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-gray-400 focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all resize-none"
                placeholder="Describe your adventure"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                Location
              </label>
              <select
                value={formData.location?.id || DEFAULT_LOCATIONS[0].id}
                onChange={(e) => {
                  const location = DEFAULT_LOCATIONS.find(l => l.id === e.target.value)
                  setFormData(prev => ({ ...prev, location }))
                }}
                className="w-full px-4 py-3 border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all"
              >
                {DEFAULT_LOCATIONS.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name} - {location.difficulty}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="p-3 bg-[rgb(220,38,38)]/10 border border-[rgb(220,38,38)]/20 rounded-lg">
                <div className="text-[rgb(220,38,38)] text-sm">{error}</div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={isCreating ? handleCreateTrip : handleUpdateTrip}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : isCreating ? 'Create Trip' : 'Update Trip'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (selectedTrip) {
    return (
      <div className="min-h-screen bg-[rgb(255,255,255)]">
        {/* Header */}
        <div className="bg-[rgb(248,250,252)] border-b border-[rgb(226,232,240)] p-4">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setSelectedTrip(null)}
                className="p-2 text-[rgb(15,23,42)] hover:bg-[rgb(241,245,249)] rounded-lg transition-colors"
                aria-label="Back to trips"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFormData(selectedTrip)
                    setIsEditing(true)
                  }}
                  className="p-2 text-[rgb(15,23,42)] hover:bg-[rgb(241,245,249)] rounded-lg transition-colors"
                  aria-label="Edit trip"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTrip(selectedTrip.id)}
                  className="p-2 text-[rgb(220,38,38)] hover:bg-[rgb(220,38,38)]/10 rounded-lg transition-colors"
                  aria-label="Delete trip"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h1 className="text-xl font-bold text-[rgb(15,23,42)] mb-2">{selectedTrip.title}</h1>
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTrip.status)}`}>
                {selectedTrip.status}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedTrip.location.difficulty)}`}>
                {selectedTrip.location.difficulty}
              </span>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex gap-1 bg-[rgb(241,245,249)] p-1 rounded-lg">
              {[
                { id: 'overview', label: 'Overview', icon: MapPin },
                { id: 'tasks', label: 'Tasks', icon: Calendar },
                { id: 'meals', label: 'Meals', icon: Utensils },
                { id: 'members', label: 'Members', icon: Users },
                { id: 'chat', label: 'Chat', icon: MessageSquare }
              ].map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 px-2 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                      activeTab === tab.id
                        ? 'bg-white text-[rgb(34,139,34)] shadow-sm'
                        : 'text-[rgb(15,23,42)] hover:bg-white/50'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          <div className="max-w-md mx-auto">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="bg-[rgb(248,250,252)] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-[rgb(34,139,34)]" />
                    <span className="font-medium text-[rgb(15,23,42)]">Location</span>
                  </div>
                  <div className="text-sm text-[rgb(15,23,42)] mb-1">{selectedTrip.location.name}</div>
                  <div className="text-xs text-gray-500">{selectedTrip.location.description}</div>
                </div>

                <div className="bg-[rgb(248,250,252)] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-[rgb(34,139,34)]" />
                    <span className="font-medium text-[rgb(15,23,42)]">Dates</span>
                  </div>
                  <div className="text-sm text-[rgb(15,23,42)]">
                    {new Date(selectedTrip.startDate).toLocaleDateString()} - {new Date(selectedTrip.endDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="bg-[rgb(248,250,252)] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CloudRain className="w-4 h-4 text-[rgb(34,139,34)]" />
                    <span className="font-medium text-[rgb(15,23,42)]">Weather</span>
                  </div>
                  <div className="text-sm text-gray-500">Forecast will be available closer to trip date</div>
                </div>

                {selectedTrip.description && (
                  <div className="bg-[rgb(248,250,252)] rounded-lg p-4">
                    <div className="font-medium text-[rgb(15,23,42)] mb-2">Description</div>
                    <div className="text-sm text-[rgb(15,23,42)]">{selectedTrip.description}</div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-medium text-[rgb(15,23,42)]">Trip Tasks</h2>
                  <button
                    onClick={() => handleAddTask(selectedTrip.id, {
                      title: 'New Task',
                      assignedTo: selectedTrip.members[0].id,
                      dueDate: selectedTrip.startDate,
                      completed: false,
                      category: 'logistics'
                    })}
                    className="p-2 text-[rgb(34,139,34)] hover:bg-[rgb(34,139,34)]/10 rounded-lg transition-colors"
                    aria-label="Add task"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {selectedTrip.tasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <div className="text-sm">No tasks assigned yet</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedTrip.tasks.map(task => {
                      const assignedMember = selectedTrip.members.find(m => m.id === task.assignedTo)
                      return (
                        <div key={task.id} className="bg-[rgb(248,250,252)] rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="font-medium text-[rgb(15,23,42)]">{task.title}</div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              task.category === 'food' ? 'bg-[rgb(245,158,11)] text-white' :
                              task.category === 'equipment' ? 'bg-[rgb(34, 139, 34)] text-white' :
                              task.category === 'safety' ? 'bg-[rgb(220,38,38)] text-white' :
                              'bg-[rgb(34,139,34)] text-white'
                            }`}>
                              {task.category}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mb-1">
                            Assigned to: {assignedMember?.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'meals' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-medium text-[rgb(15,23,42)]">Meal Plan</h2>
                  <button
                    onClick={() => handleAddMeal(selectedTrip.id, {
                      name: 'New Meal',
                      day: selectedTrip.startDate,
                      time: 'lunch',
                      assignedTo: selectedTrip.members[0].id,
                      ingredients: []
                    })}
                    className="p-2 text-[rgb(34,139,34)] hover:bg-[rgb(34,139,34)]/10 rounded-lg transition-colors"
                    aria-label="Add meal"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {selectedTrip.meals.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Utensils className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <div className="text-sm">No meals planned yet</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedTrip.meals.map(meal => {
                      const assignedMember = selectedTrip.members.find(m => m.id === meal.assignedTo)
                      return (
                        <div key={meal.id} className="bg-[rgb(248,250,252)] rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="font-medium text-[rgb(15,23,42)]">{meal.name}</div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              meal.time === 'breakfast' ? 'bg-yellow-500 text-white' :
                              meal.time === 'lunch' ? 'bg-[rgb(245,158,11)] text-white' :
                              meal.time === 'dinner' ? 'bg-[rgb(34,139,34)] text-white' :
                              'bg-[rgb(34, 139, 34)] text-white'
                            }`}>
                              {meal.time}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mb-1">
                            {new Date(meal.day).toLocaleDateString()} • {assignedMember?.name}
                          </div>
                          {meal.ingredients.length > 0 && (
                            <div className="text-xs text-gray-400">
                              {meal.ingredients.join(', ')}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'members' && (
              <div className="space-y-4">
                <h2 className="font-medium text-[rgb(15,23,42)]">Group Members</h2>
                
                <div className="space-y-3">
                  {selectedTrip.members.map(member => {
                    const rsvp = selectedTrip.rsvpResponses[member.id]
                    return (
                      <div key={member.id} className="bg-[rgb(248,250,252)] rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[rgb(34,139,34)] rounded-full flex items-center justify-center text-white font-medium">
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-[rgb(15,23,42)]">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.email}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {member.role === 'organizer' && (
                              <span className="px-2 py-1 bg-[rgb(34,139,34)] text-white rounded-full text-xs font-medium">
                                Organizer
                              </span>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              rsvp === 'yes' ? 'bg-[rgb(34,139,34)] text-white' :
                              rsvp === 'no' ? 'bg-[rgb(220,38,38)] text-white' :
                              rsvp === 'maybe' ? 'bg-[rgb(245,158,11)] text-white' :
                              'bg-[rgb(241,245,249)] text-[rgb(15,23,42)]'
                            }`}>
                              {rsvp || 'pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="space-y-4">
                <h2 className="font-medium text-[rgb(15,23,42)]">Group Chat</h2>
                
                <div className="bg-[rgb(248,250,252)] rounded-lg p-4 min-h-[300px] flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <div className="text-sm">Chat feature coming soon</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[rgb(15,23,42)]">Off-Road Trips</h1>
          <button
            onClick={() => setIsCreating(true)}
            className="p-3 bg-[rgb(34,139,34)] text-white rounded-full hover:bg-[rgb(34,139,34)]/90 transition-colors shadow-md hover:shadow-lg active:scale-95"
            aria-label="Create new trip"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Trip List */}
        {trips.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-[rgb(15,23,42)] mb-2">No trips planned</h3>
            <p className="text-gray-500 mb-6">Create your first off-road adventure</p>
            <button
              onClick={() => setIsCreating(true)}
              className="px-6 py-3 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors font-medium"
            >
              Plan Your First Trip
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map(trip => (
              <div
                key={trip.id}
                onClick={() => setSelectedTrip(trip)}
                className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6 hover:border-[rgb(34,139,34)]/50 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-[rgb(15,23,42)] text-lg">{trip.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                    {trip.status}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-[rgb(34,139,34)]" />
                  <span className="text-sm text-[rgb(15,23,42)]">{trip.location.name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(trip.location.difficulty)}`}>
                    {trip.location.difficulty}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{trip.members.length} members</span>
                  </div>
                </div>
                
                {trip.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{trip.description}</p>
                )}
                
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[rgb(226,232,240)]">
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-500">
                      {Object.values(trip.rsvpResponses).filter(r => r === 'yes').length} confirmed
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setFormData(trip)
                        setIsEditing(true)
                      }}
                      className="p-2 text-[rgb(15,23,42)] hover:bg-[rgb(241,245,249)] rounded-lg transition-colors"
                      aria-label="Edit trip"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteTrip(trip.id)
                      }}
                      className="p-2 text-[rgb(220,38,38)] hover:bg-[rgb(220,38,38)]/10 rounded-lg transition-colors"
                      aria-label="Delete trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function TripCRUDAPIDemo() {
  return <TripCRUDAPI />
}