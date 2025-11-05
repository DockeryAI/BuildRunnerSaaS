'use client'

import { useState, useEffect } from 'react'
import { MapPin, Users, Calendar, MessageCircle, Settings, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

interface TripLocation {
  id: string
  name: string
  coordinates: { lat: number; lng: number }
  difficulty: 'easy' | 'moderate' | 'hard'
  description: string
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

interface TripPlannerProps {
  initialLocation?: TripLocation
  members?: GroupMember[]
  tasks?: Task[]
}

export function TripPlanner({
  initialLocation,
  members = DEFAULT_MEMBERS,
  tasks = DEFAULT_TASKS
}: TripPlannerProps = {}) {
  const [activeTab, setActiveTab] = useState('locations')
  const [selectedLocation, setSelectedLocation] = useState<TripLocation | null>(initialLocation || null)
  const [tripMembers, setTripMembers] = useState<GroupMember[]>(members)
  const [tripTasks, setTripTasks] = useState<Task[]>(tasks)
  const [isLoading, setIsLoading] = useState(false)

  const handleLocationSelect = (location: TripLocation) => {
    setSelectedLocation(location)
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const handleTaskToggle = (taskId: string) => {
    setTripTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed }
          : task
      )
    )
  }

  const handleRSVP = (memberId: string, status: 'confirmed' | 'declined') => {
    setTripMembers(prev =>
      prev.map(member =>
        member.id === memberId
          ? { ...member, status }
          : member
      )
    )
  }

  const renderLocationsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Trail Locations</h2>
        <button className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg font-medium text-sm shadow-md hover:bg-[rgb(29,120,29)] transition-colors duration-150 active:scale-95">
          Add Location
        </button>
      </div>
      
      <div className="grid gap-4">
        {SAMPLE_LOCATIONS.map((location) => (
          <div
            key={location.id}
            className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
              selectedLocation?.id === location.id 
                ? 'border-[rgb(34,139,34)] ring-2 ring-[rgb(34,139,34)]/20' 
                : 'border-[rgb(226,232,240)]'
            }`}
            onClick={() => handleLocationSelect(location)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-[rgb(34,139,34)]" />
                  <h3 className="font-medium text-[rgb(15,23,42)]">{location.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    location.difficulty === 'easy' 
                      ? 'bg-green-100 text-green-700'
                      : location.difficulty === 'moderate'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {location.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{location.description}</p>
                <div className="text-xs text-gray-500">
                  {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}
                </div>
              </div>
              <button
                className={`p-2 rounded-lg transition-colors duration-150 ${
                  location.saved
                    ? 'bg-[rgb(34,139,34)] text-white'
                    : 'bg-[rgb(241,245,249)] text-gray-600 hover:bg-[rgb(226,232,240)]'
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  // Handle save/unsave
                }}
              >
                <CheckCircle2 className="w-4 h-4" />
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
        <button className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg font-medium text-sm shadow-md hover:bg-[rgb(29,120,29)] transition-colors duration-150 active:scale-95">
          Add Task
        </button>
      </div>

      <div className="space-y-3">
        {tripTasks.map((task) => {
          const assignedMember = tripMembers.find(m => m.id === task.assignedTo)
          return (
            <div
              key={task.id}
              className="bg-white border border-[rgb(226,232,240)] rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleTaskToggle(task.id)}
                  className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-150 ${
                    task.completed
                      ? 'bg-[rgb(34,139,34)] border-[rgb(34,139,34)] text-white'
                      : 'border-[rgb(226,232,240)] hover:border-[rgb(34,139,34)]'
                  }`}
                >
                  {task.completed && <CheckCircle2 className="w-3 h-3" />}
                </button>
                
                <div className="flex-1">
                  <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-[rgb(15,23,42)]'}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[rgb(245,158,11)] flex items-center justify-center text-white text-xs font-medium">
                        {assignedMember?.name.charAt(0) || '?'}
                      </div>
                      <span className="text-sm text-gray-600">{assignedMember?.name || 'Unassigned'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {task.dueDate}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.category === 'food'
                        ? 'bg-blue-100 text-blue-700'
                        : task.category === 'equipment'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-orange-100 text-orange-700'
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

  const renderMembersTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Group Members</h2>
        <button className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg font-medium text-sm shadow-md hover:bg-[rgb(29,120,29)] transition-colors duration-150 active:scale-95">
          Invite
        </button>
      </div>

      <div className="space-y-3">
        {tripMembers.map((member) => (
          <div
            key={member.id}
            className="bg-white border border-[rgb(226,232,240)] rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[rgb(245,158,11)] flex items-center justify-center text-white font-medium">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium text-[rgb(15,23,42)]">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  member.status === 'confirmed'
                    ? 'bg-green-100 text-green-700'
                    : member.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {member.status}
                </span>
                
                {member.status === 'pending' && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleRSVP(member.id, 'confirmed')}
                      className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 transition-colors duration-150"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRSVP(member.id, 'declined')}
                      className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 transition-colors duration-150"
                    >
                      Decline
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
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Group Chat</h2>
      
      <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-4 shadow-sm min-h-[400px] flex flex-col">
        <div className="flex-1 space-y-4 mb-4">
          {SAMPLE_MESSAGES.map((message) => (
            <div key={message.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[rgb(245,158,11)] flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                {message.sender.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-[rgb(15,23,42)]">{message.sender}</span>
                  <span className="text-xs text-gray-500">{message.time}</span>
                </div>
                <p className="text-sm text-gray-700">{message.content}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-[rgb(226,232,240)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/20 focus:border-[rgb(34,139,34)]"
          />
          <button className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg font-medium text-sm shadow-md hover:bg-[rgb(29,120,29)] transition-colors duration-150 active:scale-95">
            Send
          </button>
        </div>
      </div>
    </div>
  )

  const tabs = [
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle2 },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
  ]

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)]">
      {/* Header */}
      <div className="bg-white border-b border-[rgb(226,232,240)] px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[rgb(15,23,42)]">Trip Planner</h1>
            {selectedLocation && (
              <p className="text-sm text-gray-600">{selectedLocation.name}</p>
            )}
          </div>
          <button className="p-2 text-gray-600 hover:text-[rgb(15,23,42)] transition-colors duration-150">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-[rgb(226,232,240)] rounded-xl p-4 shadow-sm animate-pulse">
                <div className="h-4 bg-[rgb(241,245,249)] rounded mb-2"></div>
                <div className="h-3 bg-[rgb(241,245,249)] rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {activeTab === 'locations' && renderLocationsTab()}
            {activeTab === 'tasks' && renderTasksTab()}
            {activeTab === 'members' && renderMembersTab()}
            {activeTab === 'chat' && renderChatTab()}
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[rgb(226,232,240)] px-4 py-2">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors duration-150 min-w-[44px] min-h-[44px] ${
                  isActive
                    ? 'text-[rgb(34,139,34)] bg-[rgb(34,139,34)]/10'
                    : 'text-gray-600 hover:text-[rgb(15,23,42)]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-20"></div>
    </div>
  )
}

// Mock data
const DEFAULT_MEMBERS: GroupMember[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex@example.com', avatar: '', status: 'confirmed' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@example.com', avatar: '', status: 'pending' },
  { id: '3', name: 'Mike Rodriguez', email: 'mike@example.com', avatar: '', status: 'confirmed' },
]

const DEFAULT_TASKS: Task[] = [
  { id: '1', title: 'Bring lunch for Saturday', assignedTo: '1', category: 'food', completed: false, dueDate: 'Sat 9:00 AM' },
  { id: '2', title: 'Pack firewood', assignedTo: '2', category: 'equipment', completed: true, dueDate: 'Fri 6:00 PM' },
  { id: '3', title: 'Check weather forecast', assignedTo: '3', category: 'logistics', completed: false, dueDate: 'Thu 8:00 PM' },
]

const SAMPLE_LOCATIONS: TripLocation[] = [
  {
    id: '1',
    name: 'Moab Desert Trail',
    coordinates: { lat: 38.5733, lng: -109.5498 },
    difficulty: 'moderate',
    description: 'Scenic desert trail with red rock formations and challenging terrain.',
    saved: true
  },
  {
    id: '2',
    name: 'Pine Ridge Loop',
    coordinates: { lat: 39.7392, lng: -104.9903 },
    difficulty: 'easy',
    description: 'Family-friendly loop trail through pine forests with mountain views.',
    saved: false
  },
  {
    id: '3',
    name: 'Black Diamond Pass',
    coordinates: { lat: 40.7608, lng: -111.8910 },
    difficulty: 'hard',
    description: 'Advanced trail with steep climbs and technical rock sections.',
    saved: true
  },
]

const SAMPLE_MESSAGES = [
  { id: '1', sender: 'Alex Johnson', content: 'Hey everyone! Excited for this weekend\'s trip. Weather looks perfect!', time: '2:30 PM' },
  { id: '2', sender: 'Sarah Chen', content: 'Should I bring extra water bottles? I have a few cases.', time: '2:45 PM' },
  { id: '3', sender: 'Mike Rodriguez', content: 'That would be great Sarah! I\'ll handle the snacks.', time: '3:00 PM' },
]

// Demo component for page.tsx
export default function TripPlannerDemo() {
  return <TripPlanner />
}