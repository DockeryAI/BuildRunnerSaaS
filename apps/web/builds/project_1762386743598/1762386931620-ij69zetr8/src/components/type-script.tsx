'use client'

import { useState, useEffect } from 'react'
import { MapPin, Calendar, Users, MessageCircle, Utensils, CheckCircle, Clock, AlertCircle, Navigation, Mountain } from 'lucide-react'

interface Location {
  id: string
  name: string
  coordinates: { lat: number; lng: number }
  difficulty: 'Easy' | 'Moderate' | 'Difficult'
  terrain: string
  saved: boolean
}

interface GroupMember {
  id: string
  name: string
  email: string
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

interface WeatherData {
  day: string
  high: number
  low: number
  condition: string
  icon: string
}

interface OffRoadTripPlannerProps {
  initialLocation?: Location
  groupMembers?: GroupMember[]
  tasks?: Task[]
  meals?: Meal[]
  messages?: ChatMessage[]
  weather?: WeatherData[]
}

export function OffRoadTripPlanner({
  initialLocation,
  groupMembers = DEFAULT_MEMBERS,
  tasks = DEFAULT_TASKS,
  meals = DEFAULT_MEALS,
  messages = DEFAULT_MESSAGES,
  weather = DEFAULT_WEATHER
}: OffRoadTripPlannerProps = {}) {
  const [activeTab, setActiveTab] = useState('map')
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation || null)
  const [savedLocations, setSavedLocations] = useState<Location[]>(DEFAULT_LOCATIONS)
  const [tripTasks, setTripTasks] = useState<Task[]>(tasks)
  const [tripMeals, setTripMeals] = useState<Meal[]>(meals)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(messages)
  const [newMessage, setNewMessage] = useState('')
  const [members, setMembers] = useState<GroupMember[]>(groupMembers)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSaveLocation = (location: Location) => {
    setSavedLocations(prev => prev.map(loc => 
      loc.id === location.id ? { ...loc, saved: !loc.saved } : loc
    ))
  }

  const handleTaskComplete = (taskId: string) => {
    setTripTasks(prev => prev.map(task =>
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

  const handleRSVP = (memberId: string, status: 'confirmed' | 'declined') => {
    setMembers(prev => prev.map(member =>
      member.id === memberId ? { ...member, status } : member
    ))
  }

  const renderMapView = () => (
    <div className="space-y-6 font-sans">
      <div className="bg-white dark:bg-surface rounded-xl border border-border dark:border-border p-6 shadow-md hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground dark:text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary dark:text-primary" />
            Trail Locations
          </h3>
          <button className="px-3 py-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary rounded-full text-xs font-medium border border-primary/20 dark:border-primary/30 hover:bg-primary/20 dark:hover:bg-primary/30 transition-all duration-150">
            {savedLocations.filter(l => l.saved).length} Saved
          </button>
        </div>
        
        <div className="bg-muted dark:bg-muted rounded-lg h-48 mb-6 flex items-center justify-center border border-border dark:border-border">
          <div className="text-center text-mutedForeground dark:text-mutedForeground">
            <Mountain className="w-12 h-12 mx-auto mb-2 text-primary dark:text-primary" />
            <p className="text-sm font-medium">Interactive Trail Map</p>
            <p className="text-xs text-mutedForeground dark:text-mutedForeground">Tap locations to explore</p>
          </div>
        </div>

        <div className="space-y-3">
          {savedLocations.map((location) => (
            <div key={location.id} className="bg-surface dark:bg-muted rounded-lg p-4 border border-border dark:border-border hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground dark:text-foreground mb-1">{location.name}</h4>
                  <p className="text-sm text-mutedForeground dark:text-mutedForeground mb-2">{location.terrain}</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      location.difficulty === 'Easy' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' :
                      location.difficulty === 'Moderate' ? 'bg-accent/10 text-accent dark:text-accent border border-accent/20' :
                      'bg-destructive/10 text-destructive dark:text-destructive border border-destructive/20'
                    }`}>
                      {location.difficulty}
                    </span>
                    <span className="text-xs text-mutedForeground dark:text-mutedForeground">
                      {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleSaveLocation(location)}
                  className={`p-2 rounded-lg transition-all duration-150 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring/50 ${
                    location.saved 
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary border border-primary/20 dark:border-primary/30' 
                      : 'bg-muted dark:bg-surface text-mutedForeground dark:text-mutedForeground border border-border dark:border-border hover:bg-surface dark:hover:bg-muted'
                  }`}
                  aria-label={location.saved ? 'Remove from saved' : 'Save location'}
                >
                  <MapPin className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-surface rounded-xl border border-border dark:border-border p-6 shadow-md hover:shadow-lg transition-all duration-300">
        <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-4 flex items-center gap-2">
          <Navigation className="w-5 h-5 text-primary dark:text-primary" />
          Weather Forecast
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {weather.map((day, index) => (
            <div key={index} className="bg-surface dark:bg-muted rounded-lg p-3 text-center border border-border dark:border-border hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <p className="text-xs text-mutedForeground dark:text-mutedForeground mb-1">{day.day}</p>
              <div className="text-2xl mb-1">{day.icon}</div>
              <p className="text-sm text-foreground dark:text-foreground font-medium">{day.high}°/{day.low}°</p>
              <p className="text-xs text-mutedForeground dark:text-mutedForeground">{day.condition}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderTasksView = () => (
    <div className="space-y-6 font-sans">
      <div className="bg-white dark:bg-surface rounded-xl border border-border dark:border-border p-6 shadow-md hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground dark:text-foreground flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary dark:text-primary" />
            Trip Tasks
          </h3>
          <span className="px-3 py-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary rounded-full text-xs font-medium border border-primary/20 dark:border-primary/30">
            {tripTasks.filter(t => t.completed).length}/{tripTasks.length} Complete
          </span>
        </div>

        <div className="space-y-3">
          {tripTasks.map((task) => (
            <div key={task.id} className="bg-surface dark:bg-muted rounded-lg p-4 border border-border dark:border-border hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleTaskComplete(task.id)}
                  className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring/50 ${
                    task.completed 
                      ? 'bg-primary border-primary dark:bg-primary dark:border-primary' 
                      : 'border-border dark:border-border hover:border-primary dark:hover:border-primary'
                  }`}
                  aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {task.completed && <CheckCircle className="w-3 h-3 text-primaryForeground dark:text-primaryForeground" />}
                </button>
                <div className="flex-1">
                  <h4 className={`font-medium mb-1 ${task.completed ? 'text-mutedForeground dark:text-mutedForeground line-through' : 'text-foreground dark:text-foreground'}`}>
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-mutedForeground dark:text-mutedForeground">Assigned to:</span>
                    <span className="text-primary dark:text-primary font-medium">{task.assignedTo}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.category === 'food' ? 'bg-accent/10 text-accent dark:text-accent border border-accent/20' :
                      task.category === 'equipment' ? 'bg-secondary/10 text-secondary dark:text-secondary border border-secondary/20' :
                      'bg-primary/10 text-primary dark:text-primary border border-primary/20'
                    }`}>
                      {task.category}
                    </span>
                  </div>
                  <p className="text-xs text-mutedForeground dark:text-mutedForeground mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Due: {task.dueDate}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-surface rounded-xl border border-border dark:border-border p-6 shadow-md hover:shadow-lg transition-all duration-300">
        <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary dark:text-primary" />
          Group Members
        </h3>
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="bg-surface dark:bg-muted rounded-lg p-4 border border-border dark:border-border hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={member.avatar} 
                    alt={member.name}
                    className="w-10 h-10 rounded-full border border-border dark:border-border"
                  />
                  <div>
                    <h4 className="font-medium text-foreground dark:text-foreground">{member.name}</h4>
                    <p className="text-sm text-mutedForeground dark:text-mutedForeground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    member.status === 'confirmed' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' :
                    member.status === 'pending' ? 'bg-accent/10 text-accent dark:text-accent border border-accent/20' :
                    'bg-destructive/10 text-destructive dark:text-destructive border border-destructive/20'
                  }`}>
                    {member.status}
                  </span>
                  {member.status === 'pending' && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleRSVP(member.id, 'confirmed')}
                        className="p-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded border border-green-500/20 hover:bg-green-500/20 transition-all duration-150 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                        aria-label="Confirm RSVP"
                      >
                        <CheckCircle className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRSVP(member.id, 'declined')}
                        className="p-1 bg-destructive/10 text-destructive dark:text-destructive rounded border border-destructive/20 hover:bg-destructive/20 transition-all duration-150 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-destructive/50"
                        aria-label="Decline RSVP"
                      >
                        <AlertCircle className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderMealsView = () => (
    <div className="bg-white dark:bg-surface rounded-xl border border-border dark:border-border p-6 shadow-md hover:shadow-lg transition-all duration-300 font-sans">
      <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-6 flex items-center gap-2">
        <Utensils className="w-5 h-5 text-primary dark:text-primary" />
        Meal Planning
      </h3>
      
      <div className="space-y-4">
        {['Saturday', 'Sunday'].map((day) => (
          <div key={day} className="bg-surface dark:bg-muted rounded-lg p-4 border border-border dark:border-border">
            <h4 className="font-medium text-foreground dark:text-foreground mb-3">{day}</h4>
            <div className="space-y-2">
              {tripMeals.filter(meal => meal.day === day).map((meal) => (
                <div key={meal.id} className="flex items-center justify-between p-3 bg-white dark:bg-surface rounded-lg border border-border dark:border-border hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  <div>
                    <p className="font-medium text-foreground dark:text-foreground">{meal.name}</p>
                    <p className="text-sm text-mutedForeground dark:text-mutedForeground capitalize">{meal.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-primary dark:text-primary font-medium">{meal.assignedTo}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      meal.time === 'breakfast' ? 'bg-accent/10 text-accent dark:text-accent border border-accent/20' :
                      meal.time === 'lunch' ? 'bg-secondary/10 text-secondary dark:text-secondary border border-secondary/20' :
                      'bg-primary/10 text-primary dark:text-primary border border-primary/20'
                    }`}>
                      {meal.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderChatView = () => (
    <div className="bg-white dark:bg-surface rounded-xl border border-border dark:border-border shadow-md flex flex-col h-96 font-sans">
      <div className="p-4 border-b border-border dark:border-border">
        <h3 className="text-lg font-semibold text-foreground dark:text-foreground flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary dark:text-primary" />
          Group Chat
        </h3>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {chatMessages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted dark:bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-mutedForeground dark:text-mutedForeground" />
            </div>
            <h3 className="text-lg font-medium text-foreground dark:text-foreground mb-2">No messages yet</h3>
            <p className="text-mutedForeground dark:text-mutedForeground text-sm">Start the conversation with your group</p>
          </div>
        ) : (
          chatMessages.map((message) => (
            <div key={message.id} className="flex items-start gap-3">
              <img 
                src={message.avatar} 
                alt={message.sender}
                className="w-8 h-8 rounded-full border border-border dark:border-border flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground dark:text-foreground text-sm">{message.sender}</span>
                  <span className="text-xs text-mutedForeground dark:text-mutedForeground">{message.timestamp}</span>
                </div>
                <p className="text-sm text-foreground dark:text-foreground bg-surface dark:bg-muted rounded-lg p-2 border border-border dark:border-border">
                  {message.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-4 border-t border-border dark:border-border">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 mb-3">
            <p className="text-sm text-destructive dark:text-destructive">{error}</p>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-surface dark:bg-muted border border-border dark:border-border rounded-lg text-foreground dark:text-foreground placeholder-mutedForeground dark:placeholder-mutedForeground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all duration-200"
            aria-label="Type message"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:scale-105 active:scale-95 transition-all duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring/50"
            aria-label="Send message"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background dark:bg-background font-sans">
      <div className="max-w-md mx-auto bg-surface dark:bg-surface min-h-screen">
        <div className="bg-white dark:bg-surface border-b border-border dark:border-border p-4 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-foreground dark:text-foreground text-center">Off-Road Trip Planner</h1>
        </div>

        <div className="bg-white dark:bg-surface border-b border-border dark:border-border px-2 py-2">
          <div className="flex gap-1">
            {[
              { id: 'map', label: 'Map', icon: MapPin },
              { id: 'tasks', label: 'Tasks', icon: CheckCircle },
              { id: 'meals', label: 'Meals', icon: Utensils },
              { id: 'chat', label: 'Chat', icon: MessageCircle }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-150 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring/50 ${
                  activeTab === id
                    ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary border border-primary/20 dark:border-primary/30'
                    : 'text-mutedForeground dark:text-mutedForeground hover:text-foreground dark:hover:text-foreground hover:bg-muted dark:hover:bg-muted'
                }`}
                aria-label={`Switch to ${label} tab`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'map' && renderMapView()}
          {activeTab === 'tasks' && renderTasksView()}
          {activeTab === 'meals' && renderMealsView()}
          {activeTab === 'chat' && renderChatView()}
        </div>
      </div>
    </div>
  )
}

const DEFAULT_LOCATIONS: Location[] = [
  {
    id: '1',
    name: 'Moab Desert Trail',
    coordinates: { lat: 38.5733, lng: -109.5498 },
    difficulty: 'Moderate',
    terrain: 'Red rock slickrock and sand',
    saved: true
  },
  {
    id: '2',
    name: 'Black Bear Pass',
    coordinates: { lat: 37.9069, lng: -107.7123 },
    difficulty: 'Difficult',
    terrain: 'High altitude mountain pass',
    saved: false
  },
  {
    id: '3',
    name: 'Rubicon Trail',
    coordinates: { lat: 39.0916, lng: -120.1628 },
    difficulty: 'Difficult',
    terrain: 'Granite boulders and technical rock',
    saved: true
  }
]

const DEFAULT_MEMBERS: GroupMember[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex@example.com', avatar: '/api/placeholder/40/40', status: 'confirmed' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@example.com', avatar: '/api/placeholder/40/40', status: 'pending' },
  { id: '3', name: 'Mike Rodriguez', email: 'mike@example.com', avatar: '/api/placeholder/40/40', status: 'confirmed' },
  { id: '4', name: 'Emma Wilson', email: 'emma@example.com', avatar: '/api/placeholder/40/40', status: 'declined' }
]

const DEFAULT_TASKS: Task[] = [
  { id: '1', title: 'Bring lunch for Saturday', assignedTo: 'Alex Johnson', category: 'food', completed: false, dueDate: 'Sat 8:00 AM' },
  { id: '2', title: 'Pack recovery gear', assignedTo: 'Mike Rodriguez', category: 'equipment', completed: true, dueDate: 'Fri 6:00 PM' },
  { id: '3', title: 'Collect firewood', assignedTo: 'Sarah Chen', category: 'logistics', completed: false, dueDate: 'Sat 4:00 PM' },
  { id: '4', title: 'Prepare breakfast Sunday', assignedTo: 'Emma Wilson', category: 'food', completed: false, dueDate: 'Sun 7:00 AM' }
]

const DEFAULT_MEALS: Meal[] = [
  { id: '1', name: 'Pancakes & Bacon', day: 'Saturday', time: 'breakfast', assignedTo: 'Alex Johnson' },
  { id: '2', name: 'Trail Mix Sandwiches', day: 'Saturday', time: 'lunch', assignedTo: 'Sarah Chen' },
  { id: '3', name: 'Campfire Chili', day: 'Saturday', time: 'dinner', assignedTo: 'Mike Rodriguez' },
  { id: '4', name: 'Oatmeal & Coffee', day: 'Sunday', time: 'breakfast', assignedTo: 'Emma Wilson' }
]

const DEFAULT_MESSAGES: ChatMessage[] = [
  { id: '1', sender: 'Alex Johnson', message: 'Hey everyone! Excited for this weekend. Weather looks perfect!', timestamp: '10:30 AM', avatar: '/api/placeholder/32/32' },
  { id: '2', sender: 'Sarah Chen', message: 'Should we meet at the trailhead at 8 AM?', timestamp: '10:45 AM', avatar: '/api/placeholder/32/32' },
  { id: '3', sender: 'Mike Rodriguez', message: 'Sounds good! I\'ll bring extra recovery straps just in case.', timestamp: '11:15 AM', avatar: '/api/placeholder/32/32' }
]

const DEFAULT_WEATHER: WeatherData[] = [
  { day: 'Fri', high: 72, low: 45, condition: 'Sunny', icon: '☀️' },
  { day: 'Sat', high: 75, low: 48, condition: 'Clear', icon: '🌤️' },
  { day: 'Sun', high: 68, low: 42, condition: 'Partly Cloudy', icon: '⛅' }
]

export default function OffRoadTripPlannerDemo() {
  return <OffRoadTripPlanner />
}