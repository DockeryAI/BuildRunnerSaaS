'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Users, MapPin, Calendar, Settings, MoreVertical, Search, Paperclip, Smile } from 'lucide-react'

interface Message {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  timestamp: Date
  type: 'text' | 'system' | 'location' | 'task'
  metadata?: {
    taskId?: string
    locationId?: string
    taskName?: string
    locationName?: string
  }
}

interface User {
  id: string
  name: string
  avatar: string
  isOnline: boolean
  lastSeen?: Date
}

interface Trip {
  id: string
  name: string
  location: string
  startDate: Date
  endDate: Date
}

interface GroupChatProps {
  tripId?: string
  currentUserId?: string
  initialMessages?: Message[]
  groupMembers?: User[]
  trip?: Trip
  onSendMessage?: (message: string) => void
  onTaskAssign?: (taskId: string, userId: string) => void
  onLocationShare?: (location: { lat: number; lng: number; name: string }) => void
}

export function GroupChat({
  tripId = 'trip-1',
  currentUserId = 'user-1',
  initialMessages = DEFAULT_MESSAGES,
  groupMembers = DEFAULT_MEMBERS,
  trip = DEFAULT_TRIP,
  onSendMessage = () => console.log('Message sent'),
  onTaskAssign = () => console.log('Task assigned'),
  onLocationShare = () => console.log('Location shared')
}: GroupChatProps = {}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: `msg-${Date.now()}`,
      userId: currentUserId,
      userName: 'You',
      userAvatar: '/api/placeholder/32/32',
      content: newMessage,
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
    onSendMessage(newMessage)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
      }).format(date)
    }
  }

  const filteredMessages = messages.filter(message =>
    message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.userName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const groupedMessages = filteredMessages.reduce((groups: { [key: string]: Message[] }, message) => {
    const dateKey = formatDate(message.timestamp)
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(message)
    return groups
  }, {})

  const onlineMembers = groupMembers.filter(member => member.isOnline)

  return (
    <div className="flex flex-col h-screen bg-white font-medium">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[rgb(226,232,240)] bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-[rgb(34,139,34)] rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[rgb(34,139,34)] rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-xs text-white font-bold">{onlineMembers.length}</span>
            </div>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[rgb(15,23,42)]">{trip.name}</h1>
            <p className="text-sm text-gray-500">{onlineMembers.length} online</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="p-2 hover:bg-[rgb(248,250,252)] rounded-lg transition-colors"
            aria-label="View group members"
          >
            <Users className="w-5 h-5 text-gray-600" />
          </button>
          <button
            className="p-2 hover:bg-[rgb(248,250,252)] rounded-lg transition-colors"
            aria-label="Chat settings"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-[rgb(226,232,240)]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
          />
        </div>
      </div>

      {/* Members Panel */}
      {showMembers && (
        <div className="p-4 border-b border-[rgb(226,232,240)] bg-[rgb(248,250,252)]">
          <h3 className="text-sm font-semibold text-[rgb(15,23,42)] mb-3">Group Members ({groupMembers.length})</h3>
          <div className="grid grid-cols-2 gap-2">
            {groupMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-2 p-2 bg-white rounded-lg">
                <div className="relative">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  {member.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[rgb(34,139,34)] rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[rgb(15,23,42)] truncate">{member.name}</p>
                  <p className="text-xs text-gray-500">
                    {member.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            <div className="flex justify-center mb-4">
              <span className="px-3 py-1 bg-[rgb(248,250,252)] text-xs font-medium text-gray-500 rounded-full">
                {date}
              </span>
            </div>
            {dateMessages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 mb-4 ${
                  message.userId === currentUserId ? 'flex-row-reverse' : ''
                }`}
              >
                {message.userId !== currentUserId && (
                  <img
                    src={message.userAvatar}
                    alt={message.userName}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <div
                  className={`max-w-[80%] ${
                    message.userId === currentUserId
                      ? 'bg-[rgb(34,139,34)] text-white rounded-l-lg rounded-tr-lg'
                      : 'bg-[rgb(248,250,252)] text-[rgb(15,23,42)] rounded-r-lg rounded-tl-lg'
                  } p-3 shadow-sm`}
                >
                  {message.userId !== currentUserId && (
                    <p className="text-xs font-semibold mb-1 text-gray-600">{message.userName}</p>
                  )}
                  
                  {message.type === 'system' && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{message.content}</span>
                    </div>
                  )}
                  
                  {message.type === 'task' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-[rgb(249,115,22)] rounded-full"></div>
                        <span className="font-semibold">Task Assignment</span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                      {message.metadata?.taskName && (
                        <div className="bg-white/20 rounded p-2 text-xs">
                          Task: {message.metadata.taskName}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {message.type === 'location' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span className="font-semibold">Location Shared</span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                      {message.metadata?.locationName && (
                        <div className="bg-white/20 rounded p-2 text-xs">
                          📍 {message.metadata.locationName}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {message.type === 'text' && (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                  
                  <p
                    className={`text-xs mt-2 ${
                      message.userId === currentUserId
                        ? 'text-white/70'
                        : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>Someone is typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-[rgb(226,232,240)] bg-white">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-3 pr-20 bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent resize-none"
              style={{ minHeight: '44px' }}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              <button
                className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                aria-label="Attach file"
              >
                <Paperclip className="w-4 h-4 text-gray-500" />
              </button>
              <button
                className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                aria-label="Add emoji"
              >
                <Smile className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-3 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-md hover:shadow-lg active:scale-95"
            style={{ minHeight: '44px', minWidth: '44px' }}
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Mock data
const DEFAULT_TRIP: Trip = {
  id: 'trip-1',
  name: 'Moab Adventure',
  location: 'Moab, Utah',
  startDate: new Date('2024-03-15'),
  endDate: new Date('2024-03-17')
}

const DEFAULT_MEMBERS: User[] = [
  {
    id: 'user-1',
    name: 'You',
    avatar: '/api/placeholder/32/32',
    isOnline: true
  },
  {
    id: 'user-2',
    name: 'Sarah Chen',
    avatar: '/api/placeholder/32/32',
    isOnline: true
  },
  {
    id: 'user-3',
    name: 'Mike Rodriguez',
    avatar: '/api/placeholder/32/32',
    isOnline: false,
    lastSeen: new Date('2024-01-15T10:30:00')
  },
  {
    id: 'user-4',
    name: 'Emily Johnson',
    avatar: '/api/placeholder/32/32',
    isOnline: true
  },
  {
    id: 'user-5',
    name: 'David Kim',
    avatar: '/api/placeholder/32/32',
    isOnline: false,
    lastSeen: new Date('2024-01-14T15:45:00')
  },
  {
    id: 'user-6',
    name: 'Alex Thompson',
    avatar: '/api/placeholder/32/32',
    isOnline: true
  }
]

const DEFAULT_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    userId: 'system',
    userName: 'System',
    userAvatar: '',
    content: 'Trip "Moab Adventure" has been created',
    timestamp: new Date('2024-01-14T09:00:00'),
    type: 'system'
  },
  {
    id: 'msg-2',
    userId: 'user-2',
    userName: 'Sarah Chen',
    userAvatar: '/api/placeholder/32/32',
    content: 'Hey everyone! Super excited for this trip. I can handle the Saturday lunch prep if someone else wants to take care of firewood?',
    timestamp: new Date('2024-01-14T09:15:00'),
    type: 'text'
  },
  {
    id: 'msg-3',
    userId: 'user-3',
    userName: 'Mike Rodriguez',
    userAvatar: '/api/placeholder/32/32',
    content: 'I\'ll take care of firewood! Already know a good spot to get some seasoned oak.',
    timestamp: new Date('2024-01-14T09:18:00'),
    type: 'text'
  },
  {
    id: 'msg-4',
    userId: 'user-4',
    userName: 'Emily Johnson',
    userAvatar: '/api/placeholder/32/32',
    content: 'Mike has been assigned to: Firewood Collection',
    timestamp: new Date('2024-01-14T09:20:00'),
    type: 'task',
    metadata: {
      taskId: 'task-1',
      taskName: 'Firewood Collection'
    }
  },
  {
    id: 'msg-5',
    userId: 'user-6',
    userName: 'Alex Thompson',
    userAvatar: '/api/placeholder/32/32',
    content: 'Perfect! I checked the weather and it looks like clear skies all weekend. Should be perfect for some night photography.',
    timestamp: new Date('2024-01-14T10:30:00'),
    type: 'text'
  },
  {
    id: 'msg-6',
    userId: 'user-2',
    userName: 'Sarah Chen',
    userAvatar: '/api/placeholder/32/32',
    content: 'Found an amazing campsite with great views! Check this out:',
    timestamp: new Date('2024-01-14T11:45:00'),
    type: 'location',
    metadata: {
      locationId: 'loc-1',
      locationName: 'Devil\'s Garden Campground'
    }
  },
  {
    id: 'msg-7',
    userId: 'user-4',
    userName: 'Emily Johnson',
    userAvatar: '/api/placeholder/32/32',
    content: 'That looks perfect! I can bring my portable grill for the BBQ on Saturday night.',
    timestamp: new Date('2024-01-15T08:20:00'),
    type: 'text'
  },
  {
    id: 'msg-8',
    userId: 'user-5',
    userName: 'David Kim',
    userAvatar: '/api/placeholder/32/32',
    content: 'Count me in! I\'ll handle breakfast on Sunday. Thinking pancakes and bacon?',
    timestamp: new Date('2024-01-15T08:45:00'),
    type: 'text'
  }
]

// Demo component for page.tsx
export default function GroupChatDemo() {
  return <GroupChat />
}