'use client'

import { useState, useEffect } from 'react'
import { MapPin, Calendar, Users, MessageCircle, Utensils, CheckCircle, Clock, Sun, Cloud, CloudRain, Snow, Thermometer } from 'lucide-react'

interface Trip {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  status: 'planning' | 'confirmed' | 'completed'
  memberCount: number
  weatherForecast: WeatherData[]
}

interface WeatherData {
  date: string
  temp: number
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy'
  description: string
}

interface Task {
  id: string
  title: string
  assignee: string
  category: 'food' | 'equipment' | 'logistics'
  completed: boolean
  dueDate: string
}

interface Meal {
  id: string
  name: string
  day: string
  time: 'breakfast' | 'lunch' | 'dinner'
  assignee: string
}

interface Message {
  id: string
  sender: string
  content: string
  timestamp: string
}

interface Member {
  id: string
  name: string
  avatar: string
  rsvpStatus: 'pending' | 'accepted' | 'declined'
}

interface TripPlannerProps {
  initialTrip?: Trip
  onTripUpdate?: (trip: Trip) => void
}

export function TripPlanner({
  initialTrip = DEFAULT_TRIP,
  onTripUpdate = () => console.log('Trip updated')
}: TripPlannerProps = {}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'meals' | 'chat' | 'members'>('overview')
  const [trip, setTrip] = useState<Trip>(initialTrip)
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS)
  const [meals, setMeals] = useState<Meal[]>(DEFAULT_MEALS)
  const [messages, setMessages] = useState<Message[]>(DEFAULT_MESSAGES)
  const [members, setMembers] = useState<Member[]>(DEFAULT_MEMBERS)
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleTaskToggle = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    
    const message: Message = {
      id: Date.now().toString(),
      sender: 'You',
      content: newMessage,
      timestamp: new Date().toISOString()
    }
    
    setMessages(prev => [...prev, message])
    setNewMessage('')
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-5 h-5 text-yellow-500" />
      case 'cloudy': return <Cloud className="w-5 h-5 text-gray-500" />
      case 'rainy': return <CloudRain className="w-5 h-5 text-[rgb(34, 139, 34)]" />
      case 'snowy': return <Snow className="w-5 h-5 text-blue-200" />
      default: return <Sun className="w-5 h-5 text-yellow-500" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="min-h-screen bg-[#ffffff] font-medium">
      {/* Header */}
      <div className="bg-[#228b22] text-[#ffffff] p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{trip.name}</h1>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <MapPin className="w-4 h-4" />
              <span>{trip.location}</span>
            </div>
          </div>
          <div className="text-right text-sm">
            <div>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</div>
            <div className="flex items-center gap-1 justify-end mt-1">
              <Users className="w-4 h-4" />
              <span>{trip.memberCount} members</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-20">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Weather Forecast */}
            <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-lg p-4 shadow-md">
              <h3 className="text-lg font-semibold text-[#0f172a] mb-3 flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-[#228b22]" />
                Weather Forecast
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {trip.weatherForecast.map((weather, index) => (
                  <div key={index} className="text-center p-3 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
                    <div className="text-sm text-[#64748b] mb-1">{formatDate(weather.date)}</div>
                    <div className="flex justify-center mb-2">{getWeatherIcon(weather.condition)}</div>
                    <div className="text-lg font-semibold text-[#0f172a]">{weather.temp}°F</div>
                    <div className="text-xs text-[#64748b]">{weather.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-lg p-4 shadow-md">
                <div className="text-2xl font-bold text-[#228b22]">
                  {tasks.filter(t => t.completed).length}/{tasks.length}
                </div>
                <div className="text-sm text-[#64748b]">Tasks Complete</div>
              </div>
              <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-lg p-4 shadow-md">
                <div className="text-2xl font-bold text-[#228b22]">
                  {members.filter(m => m.rsvpStatus === 'accepted').length}/{members.length}
                </div>
                <div className="text-sm text-[#64748b]">RSVPs Confirmed</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-lg p-4 shadow-md">
              <h3 className="text-lg font-semibold text-[#0f172a] mb-3">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-[#f8fafc] rounded-lg">
                  <CheckCircle className="w-5 h-5 text-[#228b22]" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#0f172a]">Sarah completed "Bring firewood"</div>
                    <div className="text-xs text-[#64748b]">2 hours ago</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-[#f8fafc] rounded-lg">
                  <MessageCircle className="w-5 h-5 text-[#f59e0b]" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#0f172a]">New message in group chat</div>
                    <div className="text-xs text-[#64748b]">4 hours ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#0f172a]">Trip Tasks</h2>
              <button className="px-4 py-2 bg-[#228b22] text-[#ffffff] rounded-lg text-sm font-medium shadow-md hover:bg-[#1e7b1e] transition-colors duration-150 active:scale-95">
                Add Task
              </button>
            </div>
            
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="bg-[#ffffff] border border-[#e2e8f0] rounded-lg p-4 shadow-md">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleTaskToggle(task.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-150 ${
                        task.completed 
                          ? 'bg-[#228b22] border-[#228b22]' 
                          : 'border-[#e2e8f0] hover:border-[#228b22]'
                      }`}
                      aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {task.completed && <CheckCircle className="w-4 h-4 text-[#ffffff]" />}
                    </button>
                    <div className="flex-1">
                      <div className={`font-medium ${task.completed ? 'line-through text-[#64748b]' : 'text-[#0f172a]'}`}>
                        {task.title}
                      </div>
                      <div className="text-sm text-[#64748b] mt-1">
                        Assigned to: {task.assignee} • Due: {formatDate(task.dueDate)}
                      </div>
                      <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                        task.category === 'food' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' :
                        task.category === 'equipment' ? 'bg-[#228b22]/20 text-[#228b22]' :
                        'bg-[#64748b]/20 text-[#64748b]'
                      }`}>
                        {task.category}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'meals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#0f172a]">Meal Plan</h2>
              <button className="px-4 py-2 bg-[#228b22] text-[#ffffff] rounded-lg text-sm font-medium shadow-md hover:bg-[#1e7b1e] transition-colors duration-150 active:scale-95">
                Add Meal
              </button>
            </div>

            <div className="space-y-4">
              {['Saturday', 'Sunday'].map((day) => (
                <div key={day} className="bg-[#ffffff] border border-[#e2e8f0] rounded-lg p-4 shadow-md">
                  <h3 className="text-lg font-semibold text-[#0f172a] mb-3">{day}</h3>
                  <div className="space-y-3">
                    {meals.filter(meal => meal.day === day).map((meal) => (
                      <div key={meal.id} className="flex items-center justify-between p-3 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
                        <div className="flex items-center gap-3">
                          <Utensils className="w-5 h-5 text-[#f59e0b]" />
                          <div>
                            <div className="font-medium text-[#0f172a]">{meal.name}</div>
                            <div className="text-sm text-[#64748b] capitalize">{meal.time}</div>
                          </div>
                        </div>
                        <div className="text-sm text-[#64748b]">
                          by {meal.assignee}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#0f172a]">Group Chat</h2>
            
            <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-lg shadow-md">
              <div className="p-4 border-b border-[#e2e8f0] max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-3 py-2 rounded-lg ${
                        message.sender === 'You' 
                          ? 'bg-[#228b22] text-[#ffffff]' 
                          : 'bg-[#f8fafc] text-[#0f172a] border border-[#e2e8f0]'
                      }`}>
                        <div className="text-sm font-medium mb-1">{message.sender}</div>
                        <div className="text-sm">{message.content}</div>
                        <div className={`text-xs mt-1 ${message.sender === 'You' ? 'text-[#ffffff]/70' : 'text-[#64748b]'}`}>
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-[#0f172a] placeholder-[#64748b] focus:border-[#228b22] focus:outline-none focus:ring-1 focus:ring-[#228b22]/50 transition-all duration-150"
                    aria-label="Type a message"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-[#228b22] text-[#ffffff] rounded-lg font-medium shadow-md hover:bg-[#1e7b1e] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    aria-label="Send message"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#0f172a]">Trip Members</h2>
              <button className="px-4 py-2 bg-[#228b22] text-[#ffffff] rounded-lg text-sm font-medium shadow-md hover:bg-[#1e7b1e] transition-colors duration-150 active:scale-95">
                Invite
              </button>
            </div>

            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="bg-[#ffffff] border border-[#e2e8f0] rounded-lg p-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#228b22] rounded-full flex items-center justify-center text-[#ffffff] font-semibold">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-[#0f172a]">{member.name}</div>
                        <div className={`text-sm ${
                          member.rsvpStatus === 'accepted' ? 'text-[#228b22]' :
                          member.rsvpStatus === 'declined' ? 'text-[#dc2626]' :
                          'text-[#f59e0b]'
                        }`}>
                          {member.rsvpStatus === 'accepted' ? 'Confirmed' :
                           member.rsvpStatus === 'declined' ? 'Declined' :
                           'Pending RSVP'}
                        </div>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      member.rsvpStatus === 'accepted' ? 'bg-[#228b22]' :
                      member.rsvpStatus === 'declined' ? 'bg-[#dc2626]' :
                      'bg-[#f59e0b]'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#ffffff] border-t border-[#e2e8f0] shadow-lg">
        <div className="flex">
          {[
            { id: 'overview', icon: Calendar, label: 'Overview' },
            { id: 'tasks', icon: CheckCircle, label: 'Tasks' },
            { id: 'meals', icon: Utensils, label: 'Meals' },
            { id: 'chat', icon: MessageCircle, label: 'Chat' },
            { id: 'members', icon: Users, label: 'Members' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex flex-col items-center justify-center py-3 px-2 transition-colors duration-150 ${
                activeTab === tab.id 
                  ? 'text-[#228b22] bg-[#228b22]/5' 
                  : 'text-[#64748b] hover:text-[#228b22]'
              }`}
              aria-label={`Switch to ${tab.label} tab`}
            >
              <tab.icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Mock data
const DEFAULT_TRIP: Trip = {
  id: '1',
  name: 'Moab Adventure',
  location: 'Moab, Utah',
  startDate: '2024-03-15',
  endDate: '2024-03-17',
  status: 'planning',
  memberCount: 6,
  weatherForecast: [
    { date: '2024-03-15', temp: 65, condition: 'sunny', description: 'Clear skies' },
    { date: '2024-03-16', temp: 58, condition: 'cloudy', description: 'Partly cloudy' },
    { date: '2024-03-17', temp: 62, condition: 'sunny', description: 'Sunny' }
  ]
}

const DEFAULT_TASKS: Task[] = [
  { id: '1', title: 'Bring firewood for campfire', assignee: 'Sarah', category: 'equipment', completed: true, dueDate: '2024-03-14' },
  { id: '2', title: 'Prepare Saturday lunch', assignee: 'Mike', category: 'food', completed: false, dueDate: '2024-03-15' },
  { id: '3', title: 'Book campsite reservations', assignee: 'Alex', category: 'logistics', completed: true, dueDate: '2024-03-10' },
  { id: '4', title: 'Pack first aid kit', assignee: 'Emma', category: 'equipment', completed: false, dueDate: '2024-03-14' }
]

const DEFAULT_MEALS: Meal[] = [
  { id: '1', name: 'Pancakes & Bacon', day: 'Saturday', time: 'breakfast', assignee: 'Sarah' },
  { id: '2', name: 'Trail Mix Sandwiches', day: 'Saturday', time: 'lunch', assignee: 'Mike' },
  { id: '3', name: 'Campfire Chili', day: 'Saturday', time: 'dinner', assignee: 'Alex' },
  { id: '4', name: 'Oatmeal & Coffee', day: 'Sunday', time: 'breakfast', assignee: 'Emma' },
  { id: '5', name: 'Grilled Burgers', day: 'Sunday', time: 'lunch', assignee: 'Tom' }
]

const DEFAULT_MESSAGES: Message[] = [
  { id: '1', sender: 'Sarah', content: 'Just picked up the firewood! Ready for some epic campfires 🔥', timestamp: '2024-03-12T14:30:00Z' },
  { id: '2', sender: 'Mike', content: 'Weather looks perfect for the weekend. Can\'t wait!', timestamp: '2024-03-12T15:45:00Z' },
  { id: '3', sender: 'Alex', content: 'Campsite is confirmed. We\'re all set!', timestamp: '2024-03-12T16:20:00Z' },
  { id: '4', sender: 'You', content: 'Thanks everyone! This is going to be amazing 🏔️', timestamp: '2024-03-12T16:25:00Z' }
]

const DEFAULT_MEMBERS: Member[] = [
  { id: '1', name: 'Sarah Johnson', avatar: '', rsvpStatus: 'accepted' },
  { id: '2', name: 'Mike Chen', avatar: '', rsvpStatus: 'accepted' },
  { id: '3', name: 'Alex Rivera', avatar: '', rsvpStatus: 'accepted' },
  { id: '4', name: 'Emma Davis', avatar: '', rsvpStatus: 'pending' },
  { id: '5', name: 'Tom Wilson', avatar: '', rsvpStatus: 'accepted' },
  { id: '6', name: 'Lisa Park', avatar: '', rsvpStatus: 'declined' }
]

// Demo component for page.tsx
export default function TripPlannerDemo() {
  return <TripPlanner />
}