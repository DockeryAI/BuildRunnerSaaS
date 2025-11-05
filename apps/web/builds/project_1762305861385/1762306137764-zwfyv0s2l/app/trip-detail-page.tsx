'use client'

import { useState, useEffect } from 'react'
import { 
  MapPin, 
  Calendar, 
  Users, 
  MessageSquare, 
  CheckSquare, 
  Cloud, 
  UtensilsCrossed,
  Edit3,
  Share2,
  ArrowLeft,
  Clock,
  Thermometer,
  Droplets,
  Wind,
  User,
  Plus,
  Check,
  X
} from 'lucide-react'

interface TripMember {
  id: string
  name: string
  email: string
  avatar?: string
  rsvpStatus: 'pending' | 'accepted' | 'declined'
}

interface Task {
  id: string
  title: string
  assignedTo?: string
  completed: boolean
  dueDate: string
  category: 'food' | 'equipment' | 'logistics' | 'other'
}

interface Meal {
  id: string
  name: string
  day: string
  time: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  assignedTo?: string
  ingredients: string[]
}

interface WeatherData {
  day: string
  high: number
  low: number
  condition: string
  precipitation: number
  windSpeed: number
}

interface ChatMessage {
  id: string
  sender: string
  message: string
  timestamp: string
}

interface Trip {
  id: string
  title: string
  location: string
  startDate: string
  endDate: string
  description: string
  members: TripMember[]
  tasks: Task[]
  meals: Meal[]
  weather: WeatherData[]
  chat: ChatMessage[]
}

interface TripDetailPageProps {
  tripId?: string
  initialTrip?: Trip
}

export function TripDetailPage({ 
  tripId = 'trip-1',
  initialTrip 
}: TripDetailPageProps = {}) {
  const [trip, setTrip] = useState<Trip>(initialTrip || DEFAULT_TRIP)
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'meals' | 'weather' | 'chat'>('overview')
  const [newMessage, setNewMessage] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState('')

  useEffect(() => {
    // Simulate loading trip data
    if (!initialTrip) {
      // In real app, fetch trip data by tripId
      console.log('Loading trip:', tripId)
    }
  }, [tripId, initialTrip])

  const handleRSVP = (memberId: string, status: 'accepted' | 'declined') => {
    setTrip(prev => ({
      ...prev,
      members: prev.members.map(member =>
        member.id === memberId ? { ...member, rsvpStatus: status } : member
      )
    }))
  }

  const handleTaskToggle = (taskId: string) => {
    setTrip(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }))
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      message: newMessage,
      timestamp: new Date().toLocaleTimeString()
    }
    
    setTrip(prev => ({
      ...prev,
      chat: [...prev.chat, message]
    }))
    setNewMessage('')
  }

  const handleInviteMember = () => {
    if (!newMemberEmail.trim()) return
    
    const newMember: TripMember = {
      id: Date.now().toString(),
      name: newMemberEmail.split('@')[0],
      email: newMemberEmail,
      rsvpStatus: 'pending'
    }
    
    setTrip(prev => ({
      ...prev,
      members: [...prev.members, newMember]
    }))
    setNewMemberEmail('')
    setShowInviteModal(false)
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return '☀️'
      case 'cloudy': return '☁️'
      case 'rainy': return '🌧️'
      default: return '⛅'
    }
  }

  const TabButton = ({ tab, label, icon: Icon }: { tab: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 text-xs font-medium transition-colors ${
        activeTab === tab
          ? 'text-[rgb(34,139,34)] border-b-2 border-[rgb(34,139,34)]'
          : 'text-[rgb(100,116,139)] hover:text-[rgb(15,23,42)]'
      }`}
      aria-label={`View ${label}`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  )

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      {/* Header */}
      <div className="bg-[rgb(34,139,34)] text-white p-4 shadow-md">
        <div className="flex items-center gap-3 mb-3">
          <button 
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">{trip.title}</h1>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <MapPin size={14} />
              <span>{trip.location}</span>
            </div>
          </div>
          <button 
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Share trip"
          >
            <Share2 size={20} />
          </button>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{trip.members.length} members</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-[rgb(226,232,240)] sticky top-0 z-10">
        <div className="flex">
          <TabButton tab="overview" label="Overview" icon={MapPin} />
          <TabButton tab="tasks" label="Tasks" icon={CheckSquare} />
          <TabButton tab="meals" label="Meals" icon={UtensilsCrossed} />
          <TabButton tab="weather" label="Weather" icon={Cloud} />
          <TabButton tab="chat" label="Chat" icon={MessageSquare} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-20">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Trip Description */}
            <div className="bg-[rgb(248,250,252)] rounded-lg p-4">
              <h3 className="font-semibold text-[rgb(15,23,42)] mb-2">Trip Description</h3>
              <p className="text-[rgb(100,116,139)] text-sm leading-relaxed">{trip.description}</p>
            </div>

            {/* Members & RSVP */}
            <div className="bg-white border border-[rgb(226,232,240)] rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[rgb(15,23,42)]">Members ({trip.members.length})</h3>
                <button 
                  onClick={() => setShowInviteModal(true)}
                  className="p-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors"
                  aria-label="Invite member"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-3">
                {trip.members.map(member => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[rgb(34,139,34)] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-[rgb(15,23,42)] text-sm">{member.name}</div>
                        <div className="text-xs text-[rgb(100,116,139)]">{member.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.rsvpStatus === 'pending' && (
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleRSVP(member.id, 'accepted')}
                            className="p-1 bg-[rgb(34,139,34)] text-white rounded hover:bg-[rgb(34,139,34)]/90 transition-colors"
                            aria-label="Accept RSVP"
                          >
                            <Check size={12} />
                          </button>
                          <button 
                            onClick={() => handleRSVP(member.id, 'declined')}
                            className="p-1 bg-[rgb(220,38,38)] text-white rounded hover:bg-[rgb(220,38,38)]/90 transition-colors"
                            aria-label="Decline RSVP"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                      {member.rsvpStatus === 'accepted' && (
                        <span className="px-2 py-1 bg-[rgb(34,139,34)]/10 text-[rgb(34,139,34)] rounded-full text-xs font-medium">
                          Going
                        </span>
                      )}
                      {member.rsvpStatus === 'declined' && (
                        <span className="px-2 py-1 bg-[rgb(220,38,38)]/10 text-[rgb(220,38,38)] rounded-full text-xs font-medium">
                          Can't go
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-[rgb(226,232,240)] rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-[rgb(34,139,34)]">
                  {trip.tasks.filter(t => t.completed).length}/{trip.tasks.length}
                </div>
                <div className="text-sm text-[rgb(100,116,139)]">Tasks Complete</div>
              </div>
              <div className="bg-white border border-[rgb(226,232,240)] rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-[rgb(245,158,11)]">
                  {trip.meals.length}
                </div>
                <div className="text-sm text-[rgb(100,116,139)]">Meals Planned</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[rgb(15,23,42)]">Trip Tasks</h3>
              <button className="px-3 py-2 bg-[rgb(34,139,34)] text-white rounded-lg text-sm font-medium hover:bg-[rgb(34,139,34)]/90 transition-colors">
                Add Task
              </button>
            </div>
            
            {trip.tasks.map(task => (
              <div key={task.id} className="bg-white border border-[rgb(226,232,240)] rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <button 
                    onClick={() => handleTaskToggle(task.id)}
                    className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      task.completed 
                        ? 'bg-[rgb(34,139,34)] border-[rgb(34,139,34)] text-white' 
                        : 'border-[rgb(226,232,240)] hover:border-[rgb(34,139,34)]'
                    }`}
                    aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {task.completed && <Check size={12} />}
                  </button>
                  <div className="flex-1">
                    <div className={`font-medium ${task.completed ? 'line-through text-[rgb(100,116,139)]' : 'text-[rgb(15,23,42)]'}`}>
                      {task.title}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-[rgb(100,116,139)]">
                      {task.assignedTo && (
                        <div className="flex items-center gap-1">
                          <User size={12} />
                          <span>{task.assignedTo}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.category === 'food' ? 'bg-[rgb(245,158,11)]/10 text-[rgb(245,158,11)]' :
                        task.category === 'equipment' ? 'bg-[rgb(34,139,34)]/10 text-[rgb(34,139,34)]' :
                        'bg-[rgb(100,116,139)]/10 text-[rgb(100,116,139)]'
                      }`}>
                        {task.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'meals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[rgb(15,23,42)]">Meal Plan</h3>
              <button className="px-3 py-2 bg-[rgb(34,139,34)] text-white rounded-lg text-sm font-medium hover:bg-[rgb(34,139,34)]/90 transition-colors">
                Add Meal
              </button>
            </div>
            
            {trip.meals.map(meal => (
              <div key={meal.id} className="bg-white border border-[rgb(226,232,240)] rounded-lg p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-medium text-[rgb(15,23,42)]">{meal.name}</div>
                    <div className="text-sm text-[rgb(100,116,139)]">
                      {meal.day} • {meal.time.charAt(0).toUpperCase() + meal.time.slice(1)}
                    </div>
                  </div>
                  {meal.assignedTo && (
                    <div className="flex items-center gap-1 text-sm text-[rgb(100,116,139)]">
                      <User size={12} />
                      <span>{meal.assignedTo}</span>
                    </div>
                  )}
                </div>
                <div className="text-sm text-[rgb(100,116,139)]">
                  <strong>Ingredients:</strong> {meal.ingredients.join(', ')}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'weather' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-[rgb(15,23,42)]">Weather Forecast</h3>
            
            {trip.weather.map((day, index) => (
              <div key={index} className="bg-white border border-[rgb(226,232,240)] rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getWeatherIcon(day.condition)}</span>
                    <div>
                      <div className="font-medium text-[rgb(15,23,42)]">{day.day}</div>
                      <div className="text-sm text-[rgb(100,116,139)]">{day.condition}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-[rgb(15,23,42)]">
                      {day.high}°/{day.low}°
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-[rgb(100,116,139)]">
                    <Droplets size={14} />
                    <span>{day.precipitation}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-[rgb(100,116,139)]">
                    <Wind size={14} />
                    <span>{day.windSpeed} mph</span>
                  </div>
                  <div className="flex items-center gap-2 text-[rgb(100,116,139)]">
                    <Thermometer size={14} />
                    <span>Feels like {day.high + 2}°</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-[rgb(15,23,42)]">Group Chat</h3>
            
            <div className="bg-white border border-[rgb(226,232,240)] rounded-lg shadow-sm">
              <div className="p-4 border-b border-[rgb(226,232,240)] max-h-96 overflow-y-auto space-y-3">
                {trip.chat.map(message => (
                  <div key={message.id} className="flex gap-3">
                    <div className="w-8 h-8 bg-[rgb(34,139,34)] text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {message.sender.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-[rgb(15,23,42)] text-sm">{message.sender}</span>
                        <span className="text-xs text-[rgb(100,116,139)]">{message.timestamp}</span>
                      </div>
                      <div className="text-sm text-[rgb(15,23,42)]">{message.message}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-[rgb(226,232,240)]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-[rgb(226,232,240)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/50 focus:border-[rgb(34,139,34)]"
                    aria-label="Type message"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg text-sm font-medium hover:bg-[rgb(34,139,34)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Send message"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="font-semibold text-[rgb(15,23,42)] mb-4">Invite Member</h3>
            <input
              type="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/50 focus:border-[rgb(34,139,34)] mb-4"
              aria-label="Email address"
            />
            <div className="flex gap-2">
              <button 
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 border border-[rgb(226,232,240)] text-[rgb(100,116,139)] rounded-lg text-sm font-medium hover:bg-[rgb(248,250,252)] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleInviteMember}
                disabled={!newMemberEmail.trim()}
                className="flex-1 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg text-sm font-medium hover:bg-[rgb(34,139,34)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Mock data
const DEFAULT_TRIP: Trip = {
  id: 'trip-1',
  title: 'Moab Adventure Weekend',
  location: 'Moab, Utah',
  startDate: '2024-03-15',
  endDate: '2024-03-17',
  description: 'Epic off-roading adventure through the red rocks of Moab. We\'ll tackle Hell\'s Revenge trail, explore Arches National Park, and camp under the stars. Perfect for intermediate to advanced drivers.',
  members: [
    { id: '1', name: 'Alex Johnson', email: 'alex@example.com', rsvpStatus: 'accepted' },
    { id: '2', name: 'Sarah Chen', email: 'sarah@example.com', rsvpStatus: 'accepted' },
    { id: '3', name: 'Mike Rodriguez', email: 'mike@example.com', rsvpStatus: 'pending' },
    { id: '4', name: 'Emma Wilson', email: 'emma@example.com', rsvpStatus: 'declined' }
  ],
  tasks: [
    { id: '1', title: 'Bring firewood for Saturday night', assignedTo: 'Alex Johnson', completed: false, dueDate: '2024-03-15', category: 'logistics' },
    { id: '2', title: 'Pack lunch for Sunday trail ride', assignedTo: 'Sarah Chen', completed: true, dueDate: '2024-03-17', category: 'food' },
    { id: '3', title: 'Check tire pressure and spare', assignedTo: 'Mike Rodriguez', completed: false, dueDate: '2024-03-14', category: 'equipment' },
    { id: '4', title: 'Download offline maps', assignedTo: 'Emma Wilson', completed: true, dueDate: '2024-03-14', category: 'logistics' }
  ],
  meals: [
    { id: '1', name: 'Campfire Breakfast Burritos', day: 'Saturday', time: 'breakfast', assignedTo: 'Sarah Chen', ingredients: ['eggs', 'bacon', 'tortillas', 'cheese', 'salsa'] },
    { id: '2', name: 'Trail Mix & Sandwiches', day: 'Saturday', time: 'lunch', assignedTo: 'Alex Johnson', ingredients: ['bread', 'turkey', 'cheese', 'trail mix', 'water'] },
    { id: '3', name: 'BBQ Steaks & Veggies', day: 'Saturday', time: 'dinner', assignedTo: 'Mike Rodriguez', ingredients: ['steaks', 'bell peppers', 'onions', 'corn', 'beer'] },
    { id: '4', name: 'Pancakes & Coffee', day: 'Sunday', time: 'breakfast', assignedTo: 'Emma Wilson', ingredients: ['pancake mix', 'syrup', 'coffee', 'orange juice'] }
  ],
  weather: [
    { day: 'Friday', high: 68, low: 42, condition: 'Sunny', precipitation: 0, windSpeed: 8 },
    { day: 'Saturday', high: 72, low: 45, condition: 'Partly Cloudy', precipitation: 10, windSpeed: 12 },
    { day: 'Sunday', high: 69, low: 41, condition: 'Sunny', precipitation: 0, windSpeed: 6 }
  ],
  chat: [
    { id: '1', sender: 'Alex Johnson', message: 'Hey everyone! Super excited for this weekend. Just confirmed my Jeep is ready to go.', timestamp: '2:30 PM' },
    { id: '2', sender: 'Sarah Chen', message: 'Same here! I\'ve got all the breakfast stuff. Should we meet at the gas station at 7 AM?', timestamp: '2:45 PM' },
    { id: '3', sender: 'Mike Rodriguez', message: 'Sounds good. I\'ll bring extra recovery gear just in case. Weather looks perfect!', timestamp: '3:15 PM' }
  ]
}

export default function TripDetailPageDemo() {
  return <TripDetailPage />
}