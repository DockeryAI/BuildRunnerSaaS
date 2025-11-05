'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Users, MapPin, Calendar, Utensils, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

interface ChatMessage {
  id: string
  userId: string
  userName: string
  message: string
  timestamp: Date
  type: 'text' | 'location' | 'task' | 'meal' | 'rsvp'
  metadata?: {
    locationName?: string
    taskName?: string
    assignedTo?: string
    mealType?: string
    rsvpStatus?: 'yes' | 'no' | 'maybe'
  }
}

interface ChatUser {
  id: string
  name: string
  avatar: string
  isOnline: boolean
}

interface ChatAPIProps {
  tripId?: string
  currentUserId?: string
  onMessageSent?: (message: ChatMessage) => void
  onTypingUpdate?: (userId: string, isTyping: boolean) => void
}

export function ChatAPI({
  tripId = 'trip-123',
  currentUserId = 'user-1',
  onMessageSent = () => {},
  onTypingUpdate = () => {}
}: ChatAPIProps = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>(DEFAULT_MESSAGES)
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [users] = useState<ChatUser[]>(DEFAULT_USERS)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Simulate WebSocket connection
    const interval = setInterval(() => {
      setIsConnected(Math.random() > 0.1) // 90% uptime simulation
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: currentUserId,
      userName: 'You',
      message: newMessage.trim(),
      timestamp: new Date(),
      type: 'text'
    }

    setIsLoading(true)
    setMessages(prev => [...prev, message])
    setNewMessage('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      onMessageSent(message)
    } catch (error) {
      console.error('Failed to send message:', error)
      // Remove message on error
      setMessages(prev => prev.filter(m => m.id !== message.id))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'location': return <MapPin className="w-4 h-4" />
      case 'task': return <CheckCircle2 className="w-4 h-4" />
      case 'meal': return <Utensils className="w-4 h-4" />
      case 'rsvp': return <Calendar className="w-4 h-4" />
      default: return null
    }
  }

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'location': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'task': return 'bg-green-100 text-green-800 border-green-200'
      case 'meal': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'rsvp': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-[rgb(241, 245, 249)] text-gray-800 border-[rgb(226, 232, 240)]'
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white font-medium">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[rgb(226,232,240)] bg-[rgb(248,250,252)]">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {users.slice(0, 3).map((user) => (
              <div
                key={user.id}
                className="relative w-8 h-8 rounded-full bg-[rgb(34,139,34)] flex items-center justify-center text-white text-sm font-medium border-2 border-white"
                aria-label={`${user.name} avatar`}
              >
                {user.name.charAt(0)}
                {user.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
            ))}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[rgb(15,23,42)]">Trip Chat</h2>
            <p className="text-sm text-gray-600">{users.length} members</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-[rgb(220, 38, 38)]'}`} />
          <span className="text-xs text-gray-600">
            {isConnected ? 'Connected' : 'Reconnecting...'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.userId === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md ${message.userId === currentUserId ? 'order-2' : 'order-1'}`}>
              {message.userId !== currentUserId && (
                <p className="text-xs text-gray-600 mb-1 px-3">{message.userName}</p>
              )}
              
              <div
                className={`px-4 py-3 rounded-2xl shadow-sm ${
                  message.userId === currentUserId
                    ? 'bg-[rgb(34,139,34)] text-white'
                    : 'bg-[rgb(241,245,249)] text-[rgb(15,23,42)]'
                }`}
              >
                {message.type !== 'text' && (
                  <div className={`flex items-center gap-2 mb-2 px-2 py-1 rounded-lg text-xs font-medium ${getMessageTypeColor(message.type)}`}>
                    {getMessageIcon(message.type)}
                    <span className="capitalize">{message.type}</span>
                  </div>
                )}
                
                <p className="text-sm leading-relaxed">{message.message}</p>
                
                {message.metadata && (
                  <div className="mt-2 text-xs opacity-80">
                    {message.metadata.locationName && (
                      <p>📍 {message.metadata.locationName}</p>
                    )}
                    {message.metadata.taskName && (
                      <p>✅ {message.metadata.taskName} → {message.metadata.assignedTo}</p>
                    )}
                    {message.metadata.mealType && (
                      <p>🍽️ {message.metadata.mealType}</p>
                    )}
                    {message.metadata.rsvpStatus && (
                      <p>📅 RSVP: {message.metadata.rsvpStatus}</p>
                    )}
                  </div>
                )}
              </div>
              
              <p className="text-xs text-gray-500 mt-1 px-3">
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <span className="text-sm text-gray-600">
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[rgb(226,232,240)] bg-[rgb(248,250,252)]">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={!isConnected || isLoading}
              className="w-full px-4 py-3 bg-white border border-[rgb(226,232,240)] rounded-2xl text-[rgb(15,23,42)] placeholder-gray-500 focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/20 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Type your message"
            />
          </div>
          
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !isConnected || isLoading}
            className="min-w-[48px] h-12 bg-[rgb(34,139,34)] text-white rounded-2xl hover:bg-[rgb(34,139,34)]/90 transition-all duration-150 font-medium shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {!isConnected && (
          <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-[rgb(255, 255, 255)]" />
            <span className="text-sm text-red-700">Connection lost. Trying to reconnect...</span>
          </div>
        )}
      </div>
    </div>
  )
}

const DEFAULT_USERS: ChatUser[] = [
  { id: 'user-1', name: 'You', avatar: '', isOnline: true },
  { id: 'user-2', name: 'Sarah', avatar: '', isOnline: true },
  { id: 'user-3', name: 'Mike', avatar: '', isOnline: false },
  { id: 'user-4', name: 'Alex', avatar: '', isOnline: true },
  { id: 'user-5', name: 'Emma', avatar: '', isOnline: true }
]

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    userId: 'user-2',
    userName: 'Sarah',
    message: 'Hey everyone! Super excited for this weekend\'s trip to Moab!',
    timestamp: new Date(Date.now() - 3600000),
    type: 'text'
  },
  {
    id: '2',
    userId: 'user-3',
    userName: 'Mike',
    message: 'I\'ve added the campsite location to our trip plan',
    timestamp: new Date(Date.now() - 3000000),
    type: 'location',
    metadata: { locationName: 'Sand Flats Recreation Area' }
  },
  {
    id: '3',
    userId: 'user-4',
    userName: 'Alex',
    message: 'I can handle Saturday dinner prep',
    timestamp: new Date(Date.now() - 2400000),
    type: 'task',
    metadata: { taskName: 'Saturday Dinner', assignedTo: 'Alex' }
  },
  {
    id: '4',
    userId: 'user-5',
    userName: 'Emma',
    message: 'Weather looks perfect! 75°F and sunny all weekend 🌞',
    timestamp: new Date(Date.now() - 1800000),
    type: 'text'
  },
  {
    id: '5',
    userId: 'user-1',
    userName: 'You',
    message: 'Confirmed for the trip!',
    timestamp: new Date(Date.now() - 1200000),
    type: 'rsvp',
    metadata: { rsvpStatus: 'yes' }
  }
]

export default function ChatAPIDemo() {
  return (
    <div className="h-screen">
      <ChatAPI />
    </div>
  )
}