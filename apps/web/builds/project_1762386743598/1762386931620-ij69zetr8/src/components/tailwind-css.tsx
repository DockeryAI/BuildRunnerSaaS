'use client'

import { useState, useEffect } from 'react'
import { MapPin, Calendar, Users, MessageCircle, Utensils, CheckSquare, Cloud, Navigation, Loader2 } from 'lucide-react'

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
  day: string
  temp: string
  condition: string
  icon: string
}

interface OffRoadTripPlannerProps {
  trips?: Trip[]
  onCreateTrip?: (trip: Omit<Trip, 'id'>) => void
  onSelectTrip?: (tripId: string) => void
}

export function OffRoadTripPlanner({
  trips = DEFAULT_TRIPS,
  onCreateTrip = () => console.log('Create trip'),
  onSelectTrip = () => console.log('Select trip')
}: OffRoadTripPlannerProps = {}) {
  const [activeTab, setActiveTab] = useState<'trips' | 'current' | 'chat'>('trips')
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(trips[0] || null)
  const [showNewTripForm, setShowNewTripForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [newTrip, setNewTrip] = useState({
    name: '',
    location: '',
    startDate: '',
    endDate: ''
  })

  const handleCreateTrip = async () => {
    if (newTrip.name && newTrip.location && newTrip.startDate && newTrip.endDate) {
      setIsLoading(true)
      setError('')
      try {
        const trip: Omit<Trip, 'id'> = {
          ...newTrip,
          memberCount: 1,
          status: 'planning'
        }
        await new Promise(resolve => setTimeout(resolve, 1000))
        onCreateTrip(trip)
        setNewTrip({ name: '', location: '', startDate: '', endDate: '' })
        setShowNewTripForm(false)
      } catch (err) {
        setError('Failed to create trip. Please try again.')
      } finally {
        setIsLoading(false)
      }
    } else {
      setError('Please fill in all fields.')
    }
  }

  const renderTripsList = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground dark:text-white">Your Trips</h2>
        <button
          onClick={() => setShowNewTripForm(true)}
          className="px-4 py-2 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 font-medium text-sm shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background"
          aria-label="Create new trip"
        >
          New Trip
        </button>
      </div>

      {showNewTripForm && (
        <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 space-y-4 shadow-lg">
          <h3 className="text-lg font-medium text-foreground dark:text-white">Create New Trip</h3>
          
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Trip name"
              value={newTrip.name}
              onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })}
              className="w-full px-4 py-3 bg-background dark:bg-background border border-border dark:border-border rounded-lg text-foreground dark:text-foreground placeholder-mutedForeground dark:placeholder-mutedForeground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-200"
              aria-label="Trip name"
              disabled={isLoading}
            />
            <input
              type="text"
              placeholder="Location"
              value={newTrip.location}
              onChange={(e) => setNewTrip({ ...newTrip, location: e.target.value })}
              className="w-full px-4 py-3 bg-background dark:bg-background border border-border dark:border-border rounded-lg text-foreground dark:text-foreground placeholder-mutedForeground dark:placeholder-mutedForeground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-200"
              aria-label="Trip location"
              disabled={isLoading}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={newTrip.startDate}
                onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })}
                className="px-4 py-3 bg-background dark:bg-background border border-border dark:border-border rounded-lg text-foreground dark:text-foreground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-200"
                aria-label="Start date"
                disabled={isLoading}
              />
              <input
                type="date"
                value={newTrip.endDate}
                onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })}
                className="px-4 py-3 bg-background dark:bg-background border border-border dark:border-border rounded-lg text-foreground dark:text-foreground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-200"
                aria-label="End date"
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreateTrip}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background flex items-center justify-center gap-2"
              aria-label="Create trip"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Trip
            </button>
            <button
              onClick={() => setShowNewTripForm(false)}
              disabled={isLoading}
              className="px-4 py-3 bg-muted dark:bg-muted text-mutedForeground dark:text-mutedForeground rounded-lg hover:bg-muted/80 dark:hover:bg-muted/80 transition-all duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background"
              aria-label="Cancel"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {trips.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted dark:bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-mutedForeground dark:text-mutedForeground" />
            </div>
            <h3 className="text-lg font-medium text-foreground dark:text-white mb-2">No trips yet</h3>
            <p className="text-mutedForeground dark:text-mutedForeground text-sm">Get started by creating your first adventure</p>
          </div>
        ) : (
          trips.map((trip) => (
            <div
              key={trip.id}
              onClick={() => {
                setSelectedTrip(trip)
                onSelectTrip(trip.id)
                setActiveTab('current')
              }}
              className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 hover:border-ring/50 dark:hover:border-ring/50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer group"
              role="button"
              tabIndex={0}
              aria-label={`Select ${trip.name} trip`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedTrip(trip)
                  onSelectTrip(trip.id)
                  setActiveTab('current')
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-foreground dark:text-white mb-2 group-hover:text-primary dark:group-hover:text-primary transition-colors duration-200">{trip.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-mutedForeground dark:text-mutedForeground mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{trip.location}</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-mutedForeground dark:text-mutedForeground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{trip.memberCount} members</span>
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  trip.status === 'planning' ? 'bg-accent/20 dark:bg-accent/20 text-accent dark:text-accent border-accent/30 dark:border-accent/30' :
                  trip.status === 'confirmed' ? 'bg-primary/20 dark:bg-primary/20 text-primary dark:text-primary border-primary/30 dark:border-primary/30' :
                  trip.status === 'active' ? 'bg-secondary/20 dark:bg-secondary/20 text-secondary dark:text-secondary border-secondary/30 dark:border-secondary/30' :
                  'bg-muted/20 dark:bg-muted/20 text-mutedForeground dark:text-mutedForeground border-border dark:border-border'
                }`}>
                  {trip.status}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const renderCurrentTrip = () => {
    if (!selectedTrip) {
      return (
        <div className="text-center py-12">
          <Navigation className="w-12 h-12 text-mutedForeground dark:text-mutedForeground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground dark:text-white mb-2">No Trip Selected</h3>
          <p className="text-mutedForeground dark:text-mutedForeground mb-6">Select a trip to view details and manage tasks</p>
          <button
            onClick={() => setActiveTab('trips')}
            className="px-4 py-2 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 font-medium focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background"
          >
            View Trips
          </button>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-foreground dark:text-white mb-6">{selectedTrip.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary dark:text-primary" />
              <span className="text-foreground dark:text-foreground">{selectedTrip.location}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary dark:text-primary" />
              <span className="text-foreground dark:text-foreground">
                {new Date(selectedTrip.startDate).toLocaleDateString()} - {new Date(selectedTrip.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-muted dark:bg-muted rounded-lg p-4 text-center hover:bg-muted/80 dark:hover:bg-muted/80 transition-colors duration-200">
              <Users className="w-6 h-6 text-primary dark:text-primary mx-auto mb-2" />
              <div className="text-xl font-semibold text-foreground dark:text-white">{selectedTrip.memberCount}</div>
              <div className="text-sm text-mutedForeground dark:text-mutedForeground">Members</div>
            </div>
            <div className="bg-muted dark:bg-muted rounded-lg p-4 text-center hover:bg-muted/80 dark:hover:bg-muted/80 transition-colors duration-200">
              <CheckSquare className="w-6 h-6 text-secondary dark:text-secondary mx-auto mb-2" />
              <div className="text-xl font-semibold text-foreground dark:text-white">5/8</div>
              <div className="text-sm text-mutedForeground dark:text-mutedForeground">Tasks</div>
            </div>
            <div className="bg-muted dark:bg-muted rounded-lg p-4 text-center hover:bg-muted/80 dark:hover:bg-muted/80 transition-colors duration-200">
              <Utensils className="w-6 h-6 text-accent dark:text-accent mx-auto mb-2" />
              <div className="text-xl font-semibold text-foreground dark:text-white">6</div>
              <div className="text-sm text-mutedForeground dark:text-mutedForeground">Meals</div>
            </div>
            <div className="bg-muted dark:bg-muted rounded-lg p-4 text-center hover:bg-muted/80 dark:hover:bg-muted/80 transition-colors duration-200">
              <Cloud className="w-6 h-6 text-secondary dark:text-secondary mx-auto mb-2" />
              <div className="text-xl font-semibold text-foreground dark:text-white">72°F</div>
              <div className="text-sm text-mutedForeground dark:text-mutedForeground">Weather</div>
            </div>
          </div>
        </div>

        <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 shadow-sm">
          <h3 className="text-lg font-medium text-foreground dark:text-white mb-4">Task Assignments</h3>
          <div className="space-y-3">
            {TASK_ASSIGNMENTS.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-muted dark:bg-muted rounded-lg hover:bg-muted/80 dark:hover:bg-muted/80 transition-colors duration-200">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => {}}
                    className="w-4 h-4 text-primary dark:text-primary bg-background dark:bg-background border-border dark:border-border rounded focus:ring-primary dark:focus:ring-primary focus:ring-2 transition-colors duration-200"
                    aria-label={`Mark ${task.task} as complete`}
                  />
                  <div>
                    <div className={`font-medium ${task.completed ? 'text-mutedForeground dark:text-mutedForeground line-through' : 'text-foreground dark:text-white'}`}>
                      {task.task}
                    </div>
                    <div className="text-sm text-mutedForeground dark:text-mutedForeground">Assigned to {task.assignee}</div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  task.category === 'food' ? 'bg-accent/20 dark:bg-accent/20 text-accent dark:text-accent' :
                  task.category === 'gear' ? 'bg-secondary/20 dark:bg-secondary/20 text-secondary dark:text-secondary' :
                  'bg-primary/20 dark:bg-primary/20 text-primary dark:text-primary'
                }`}>
                  {task.category}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 shadow-sm">
          <h3 className="text-lg font-medium text-foreground dark:text-white mb-4">Weather Forecast</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {WEATHER_DATA.map((weather, index) => (
              <div key={index} className="bg-muted dark:bg-muted rounded-lg p-4 text-center hover:bg-muted/80 dark:hover:bg-muted/80 transition-colors duration-200">
                <div className="text-sm text-mutedForeground dark:text-mutedForeground mb-1">{weather.day}</div>
                <div className="text-2xl mb-2">{weather.icon}</div>
                <div className="text-lg font-semibold text-foreground dark:text-white">{weather.temp}</div>
                <div className="text-sm text-mutedForeground dark:text-mutedForeground">{weather.condition}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderChat = () => (
    <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 h-96 flex flex-col shadow-sm">
      <h3 className="text-lg font-medium text-foreground dark:text-white mb-4">Group Chat</h3>
      <div className="flex-1 space-y-4 overflow-y-auto mb-4">
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-primary dark:bg-primary rounded-full flex items-center justify-center text-primaryForeground dark:text-primaryForeground text-sm font-medium">
            J
          </div>
          <div className="flex-1">
            <div className="bg-muted dark:bg-muted rounded-lg p-3">
              <div className="text-sm text-mutedForeground dark:text-mutedForeground mb-1">John • 2h ago</div>
              <div className="text-foreground dark:text-white">Hey everyone! Just confirmed the campsite reservation. We're all set for this weekend!</div>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-secondary dark:bg-secondary rounded-full flex items-center justify-center text-secondaryForeground dark:text-secondaryForeground text-sm font-medium">
            S
          </div>
          <div className="flex-1">
            <div className="bg-muted dark:bg-muted rounded-lg p-3">
              <div className="text-sm text-mutedForeground dark:text-mutedForeground mb-1">Sarah • 1h ago</div>
              <div className="text-foreground dark:text-white">Awesome! I'll bring the portable grill and extra propane tanks.</div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 bg-background dark:bg-background border border-border dark:border-border rounded-lg text-foreground dark:text-foreground placeholder-mutedForeground dark:placeholder-mutedForeground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-200"
          aria-label="Type message"
        />
        <button
          className="px-4 py-3 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 font-medium shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background"
          aria-label="Send message"
        >
          Send
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background dark:bg-background font-sans">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground dark:text-white mb-2">Off-Road Trip Planner</h1>
          <p className="text-mutedForeground dark:text-mutedForeground text-lg">Plan, organize, and coordinate your outdoor adventures</p>
        </div>

        <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-2 mb-8 shadow-sm">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setActiveTab('trips')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-150 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-surface ${
                activeTab === 'trips'
                  ? 'bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground shadow-sm'
                  : 'text-mutedForeground dark:text-mutedForeground hover:text-foreground dark:hover:text-white hover:bg-muted dark:hover:bg-muted'
              }`}
              aria-label="View trips"
            >
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Trips</span>
            </button>
            <button
              onClick={() => setActiveTab('current')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-150 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-surface ${
                activeTab === 'current'
                  ? 'bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground shadow-sm'
                  : 'text-mutedForeground dark:text-mutedForeground hover:text-foreground dark:hover:text-white hover:bg-muted dark:hover:bg-muted'
              }`}
              aria-label="View current trip"
            >
              <CheckSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Current</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-150 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-surface ${
                activeTab === 'chat'
                  ? 'bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground shadow-sm'
                  : 'text-mutedForeground dark:text-mutedForeground hover:text-foreground dark:hover:text-white hover:bg-muted dark:hover:bg-muted'
              }`}
              aria-label="View group chat"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </button>
          </div>
        </div>

        <div>
          {activeTab === 'trips' && renderTripsList()}
          {activeTab === 'current' && renderCurrentTrip()}
          {activeTab === 'chat' && renderChat()}
        </div>
      </div>
    </div>
  )
}

const DEFAULT_TRIPS: Trip[] = [
  {
    id: '1',
    name: 'Moab Desert Adventure',
    location: 'Moab, Utah',
    startDate: '2024-03-15',
    endDate: '2024-03-17',
    memberCount: 6,
    status: 'confirmed'
  },
  {
    id: '2',
    name: 'Black Hills Expedition',
    location: 'Black Hills, South Dakota',
    startDate: '2024-04-20',
    endDate: '2024-04-22',
    memberCount: 4,
    status: 'planning'
  },
  {
    id: '3',
    name: 'Colorado Trail Run',
    location: 'Colorado Springs, CO',
    startDate: '2024-05-10',
    endDate: '2024-05-12',
    memberCount: 8,
    status: 'planning'
  }
]

const TASK_ASSIGNMENTS: TaskAssignment[] = [
  { id: '1', task: 'Saturday Lunch Prep', assignee: 'John', category: 'food', completed: true },
  { id: '2', task: 'Firewood Collection', assignee: 'Sarah', category: 'logistics', completed: false },
  { id: '3', task: 'Camping Gear Check', assignee: 'Mike', category: 'gear', completed: true },
  { id: '4', task: 'Sunday Breakfast', assignee: 'Lisa', category: 'food', completed: false },
  { id: '5', task: 'Trail Maps & GPS', assignee: 'Dave', category: 'logistics', completed: false }
]

const WEATHER_DATA: WeatherData[] = [
  { day: 'Fri', temp: '68°F', condition: 'Sunny', icon: '☀️' },
  { day: 'Sat', temp: '72°F', condition: 'Partly Cloudy', icon: '⛅' },
  { day: 'Sun', temp: '65°F', condition: 'Cloudy', icon: '☁️' },
  { day: 'Mon', temp: '70°F', condition: 'Sunny', icon: '☀️' }
]

export default function OffRoadTripPlannerDemo() {
  return <OffRoadTripPlanner />
}