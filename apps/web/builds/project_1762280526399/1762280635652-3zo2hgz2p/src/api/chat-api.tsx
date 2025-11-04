'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, MessageCircle, Users, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

interface ChatMessage {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  timestamp: Date
  type: 'text' | 'system' | 'task_assignment' | 'location_update'
  metadata?: {
    taskId?: string
    locationId?: string
    assignedTo?: string[]
  }
}

interface ChatUser {
  id: string
  name: string
  avatar?: string
  isOnline: boolean
  lastSeen?: Date
}

interface ChatAPIProps {
  tripId?: string
  currentUserId?: string
  onMessageSent?: (message: ChatMessage) => void
  onTypingUpdate?: (userId: string, isTyping: boolean) => void
  className?: string
}

export function ChatAPI({
  tripId = 'demo-trip-1',
  currentUserId = 'user-1',
  onMessageSent = () => {},
  onTypingUpdate = () => {},
  className = ''
}: ChatAPIProps = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>(DEFAULT_MESSAGES)
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<ChatUser[]>(DEFAULT_USERS)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Simulate real-time message updates
    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        addSystemMessage()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const addSystemMessage = () => {
    const systemMessages = [
      'Weather update: Clear skies expected for the weekend!',
      'New location added to the trip plan',
      'Task assignment updated: Firewood collection',
      'RSVP reminder: Please confirm your attendance'
    ]
    
    const randomMessage = systemMessages[Math.floor(Math.random() * systemMessages.length)]
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: 'system',
      userName: 'Trip Assistant',
      content: randomMessage,
      timestamp: new Date(),
      type: 'system'
    }
    
    setMessages(prev => [...prev, newMsg])
    setUnreadCount(prev => prev + 1)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return

    setIsLoading(true)
    
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: currentUserId,
      userName: 'You',
      content: newMessage.trim(),
      timestamp: new Date(),
      type: 'text'
    }

    // Optimistic update
    setMessages(prev => [...prev, message])
    setNewMessage('')
    onMessageSent(message)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Simulate response from another user occasionally
      if (Math.random() > 0.7) {
        setTimeout(() => {
          const responses = [
            'Sounds good!',
            'I can help with that',
            'Great idea!',
            'Count me in',
            'What time works best?'
          ]
          
          const responseMsg: ChatMessage = {
            id: `msg-${Date.now()}-response`,
            userId: 'user-2',
            userName: 'Alex',
            content: responses[Math.floor(Math.random() * responses.length)],
            timestamp: new Date(),
            type: 'text'
          }
          
          setMessages(prev => [...prev, responseMsg])
        }, 1000)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      // Remove optimistic update on error
      setMessages(prev => prev.filter(m => m.id !== message.id))
    } finally {
      setIsLoading(false)
    }
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

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'system':
        return <AlertCircle className="w-4 h-4 text-[rgb(245,158,11)]" />
      case 'task_assignment':
        return <CheckCircle2 className="w-4 h-4 text-[rgb(34,139,34)]" />
      case 'location_update':
        return <Clock className="w-4 h-4 text-[rgb(34,139,34)]" />
      default:
        return null
    }
  }

  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: { [key: string]: ChatMessage[] } = {}
    
    messages.forEach(message => {
      const dateKey = message.timestamp.toDateString()
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(message)
    })
    
    return groups
  }

  const messageGroups = groupMessagesByDate(messages)

  return (
    <div className={`flex flex-col h-full bg-[rgb(255,255,255)] ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[rgb(226,232,240)] bg-[rgb(248,250,252)]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <MessageCircle className="w-6 h-6 text-[rgb(34,139,34)]" />
            {unreadCount > 0 && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-[rgb(239,68,68)] text-white text-xs font-medium rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[rgb(15,23,42)]">Trip Chat</h2>
            <p className="text-sm text-[rgb(100,116,139)]">
              {users.filter(u => u.isOnline).length} online
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[rgb(34,139,34)]' : 'bg-[rgb(239,68,68)]'}`} />
          <span className="text-sm text-[rgb(100,116,139)]">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Online Users */}
      <div className="flex items-center gap-2 p-3 bg-[rgb(248,250,252)] border-b border-[rgb(226,232,240)] overflow-x-auto">
        <Users className="w-4 h-4 text-[rgb(100,116,139)] flex-shrink-0" />
        <div className="flex gap-2">
          {users.filter(u => u.isOnline).map(user => (
            <div
              key={user.id}
              className="flex items-center gap-1 px-2 py-1 bg-white rounded-full border border-[rgb(226,232,240)]"
            >
              <div className="w-6 h-6 bg-[rgb(34,139,34)] rounded-full flex items-center justify-center text-white text-xs font-medium">
                {user.name.charAt(0)}
              </div>
              <span className="text-xs text-[rgb(15,23,42)] whitespace-nowrap">{user.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(messageGroups).map(([dateKey, dayMessages]) => (
          <div key={dateKey}>
            {/* Date Separator */}
            <div className="flex items-center justify-center my-4">
              <div className="px-3 py-1 bg-[rgb(241,245,249)] text-[rgb(100,116,139)] text-sm rounded-full">
                {formatDate(new Date(dateKey))}
              </div>
            </div>
            
            {/* Messages for this date */}
            {dayMessages.map((message, index) => {
              const isCurrentUser = message.userId === currentUserId
              const isSystem = message.type === 'system'
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser && !isSystem ? 'justify-end' : 'justify-start'} mb-3`}
                >
                  <div
                    className={`max-w-[80%] sm:max-w-[70%] ${
                      isSystem
                        ? 'bg-[rgb(245,158,11)] bg-opacity-10 border border-[rgb(245,158,11)] border-opacity-20'
                        : isCurrentUser
                        ? 'bg-[rgb(34,139,34)] text-white'
                        : 'bg-[rgb(248,250,252)] border border-[rgb(226,232,240)]'
                    } rounded-lg p-3 shadow-sm`}
                  >
                    {!isCurrentUser && !isSystem && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 bg-[rgb(34,139,34)] rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {message.userName.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-[rgb(15,23,42)]">
                          {message.userName}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-2">
                      {getMessageIcon(message.type)}
                      <div className="flex-1">
                        <p className={`text-sm ${
                          isSystem 
                            ? 'text-[rgb(15,23,42)]' 
                            : isCurrentUser 
                            ? 'text-white' 
                            : 'text-[rgb(15,23,42)]'
                        }`}>
                          {message.content}
                        </p>
                        
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-xs ${
                            isSystem 
                              ? 'text-[rgb(100,116,139)]' 
                              : isCurrentUser 
                              ? 'text-white text-opacity-70' 
                              : 'text-[rgb(100,116,139)]'
                          }`}>
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
        
        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-[rgb(100,116,139)]">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-[rgb(100,116,139)] rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-[rgb(100,116,139)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-[rgb(100,116,139)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-[rgb(226,232,240)] bg-[rgb(248,250,252)]">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading || !isOnline}
              className="w-full px-4 py-3 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent resize-none bg-white text-[rgb(15,23,42)] placeholder-[rgb(100,116,139)] disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Type your message"
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isLoading || !isOnline}
            className="min-w-[44px] h-12 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            aria-label="Send message"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {!isOnline && (
          <div className="mt-2 text-sm text-[rgb(239,68,68)] flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            You're offline. Messages will be sent when connection is restored.
          </div>
        )}
      </div>
    </div>
  )
}

// Mock data
const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    userId: 'user-2',
    userName: 'Alex',
    content: 'Hey everyone! Really excited about this weekend\'s trip. Has anyone checked the weather forecast?',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: 'text'
  },
  {
    id: 'msg-2',
    userId: 'system',
    userName: 'Trip Assistant',
    content: 'Weather update: Sunny skies with temperatures ranging from 65-78°F. Perfect conditions for off-roading!',
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    type: 'system'
  },
  {
    id: 'msg-3',
    userId: 'user-3',
    userName: 'Sarah',
    content: 'Perfect! I\'ll bring the camping chairs and cooler. Who\'s handling the firewood?',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    type: 'text'
  },
  {
    id: 'msg-4',
    userId: 'user-1',
    userName: 'You',
    content: 'I can take care of the firewood. Should I grab some kindling too?',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    type: 'text'
  },
  {
    id: 'msg-5',
    userId: 'system',
    userName: 'Trip Assistant',
    content: 'Task assigned: Firewood collection → You',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    type: 'task_assignment',
    metadata: {
      taskId: 'task-1',
      assignedTo: ['user-1']
    }
  }
]

const DEFAULT_USERS: ChatUser[] = [
  {
    id: 'user-1',
    name: 'You',
    isOnline: true
  },
  {
    id: 'user-2',
    name: 'Alex',
    isOnline: true
  },
  {
    id: 'user-3',
    name: 'Sarah',
    isOnline: true
  },
  {
    id: 'user-4',
    name: 'Mike',
    isOnline: false,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: 'user-5',
    name: 'Emma',
    isOnline: true
  }
]

// Demo component for page.tsx
export default function ChatAPIDemo() {
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const handleMessageSent = (message: ChatMessage) => {
    console.log('Message sent:', message)
    setMessages(prev => [...prev, message])
  }

  const handleTypingUpdate = (userId: string, isTyping: boolean) => {
    console.log('Typing update:', userId, isTyping)
  }

  return (
    <div className="h-screen max-h-screen bg-[rgb(241,245,249)]">
      <ChatAPI
        tripId="demo-trip"
        currentUserId="user-1"
        onMessageSent={handleMessageSent}
        onTypingUpdate={handleTypingUpdate}
        className="h-full"
      />
    </div>
  )
}