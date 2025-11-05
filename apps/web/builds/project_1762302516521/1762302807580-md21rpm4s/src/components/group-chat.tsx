'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Smile, MoreVertical, MapPin, Calendar, Users } from 'lucide-react'

interface Message {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  timestamp: Date
  type: 'text' | 'location' | 'task' | 'system'
  metadata?: {
    location?: { name: string; coordinates: [number, number] }
    task?: { name: string; assignee: string; dueDate: string }
  }
}

interface GroupChatProps {
  tripId?: string
  messages?: Message[]
  currentUserId?: string
  onSendMessage?: (content: string, type?: Message['type'], metadata?: Message['metadata']) => void
  onLoadMore?: () => void
  isLoading?: boolean
}

const DEFAULT_MESSAGES: Message[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Sarah Chen',
    userAvatar: 'SC',
    content: 'Hey everyone! Super excited for our Moab trip next weekend 🏔️',
    timestamp: new Date(Date.now() - 3600000),
    type: 'text'
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Mike Rodriguez',
    userAvatar: 'MR',
    content: 'Same here! I just checked the weather and it looks perfect',
    timestamp: new Date(Date.now() - 3000000),
    type: 'text'
  },
  {
    id: '3',
    userId: 'system',
    userName: 'System',
    userAvatar: '🤖',
    content: 'Mike Rodriguez was assigned to bring firewood for Saturday',
    timestamp: new Date(Date.now() - 2400000),
    type: 'system'
  },
  {
    id: '4',
    userId: 'user3',
    userName: 'Alex Thompson',
    userAvatar: 'AT',
    content: 'I found this amazing campsite spot!',
    timestamp: new Date(Date.now() - 1800000),
    type: 'location',
    metadata: {
      location: {
        name: 'Devils Garden Campground',
        coordinates: [38.7331, -109.5925]
      }
    }
  },
  {
    id: '5',
    userId: 'user1',
    userName: 'Sarah Chen',
    userAvatar: 'SC',
    content: 'Perfect! That\'s close to the trails we wanted to hit',
    timestamp: new Date(Date.now() - 1200000),
    type: 'text'
  }
]

export function GroupChat({
  tripId = 'trip-1',
  messages = DEFAULT_MESSAGES,
  currentUserId = 'user1',
  onSendMessage = (content, type, metadata) => console.log('Send message:', { content, type, metadata }),
  onLoadMore = () => console.log('Load more messages'),
  isLoading = false
}: GroupChatProps = {}) {
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    
    onSendMessage(newMessage.trim())
    setNewMessage('')
    inputRef.current?.focus()
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

  const renderMessage = (message: Message, index: number) => {
    const isCurrentUser = message.userId === currentUserId
    const isSystem = message.type === 'system'
    const showAvatar = index === 0 || messages[index - 1].userId !== message.userId
    const showDate = index === 0 || 
      formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp)

    return (
      <div key={message.id} className="space-y-2">
        {showDate && (
          <div className="flex justify-center py-2">
            <span className="px-3 py-1 text-xs font-medium text-[rgb(100,116,139)] bg-[rgb(248,250,252)] rounded-full">
              {formatDate(message.timestamp)}
            </span>
          </div>
        )}
        
        {isSystem ? (
          <div className="flex justify-center py-1">
            <div className="px-4 py-2 bg-[rgb(245,247,250)] rounded-lg max-w-xs">
              <p className="text-sm text-[rgb(100,116,139)] text-center">
                {message.content}
              </p>
            </div>
          </div>
        ) : (
          <div className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
            {showAvatar && !isCurrentUser && (
              <div className="w-8 h-8 rounded-full bg-[rgb(34,139,34)] flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                {message.userAvatar}
              </div>
            )}
            
            <div className={`flex flex-col max-w-[75%] ${isCurrentUser ? 'items-end' : ''}`}>
              {showAvatar && !isCurrentUser && (
                <span className="text-sm font-medium text-[rgb(71,85,105)] mb-1">
                  {message.userName}
                </span>
              )}
              
              <div className={`rounded-2xl px-4 py-2 ${
                isCurrentUser 
                  ? 'bg-[rgb(34,139,34)] text-white' 
                  : 'bg-[rgb(248,250,252)] text-[rgb(15,23,42)]'
              }`}>
                {message.type === 'location' && message.metadata?.location ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">Location Shared</span>
                    </div>
                    <p className="text-sm opacity-90">{message.metadata.location.name}</p>
                    <button 
                      className={`text-xs underline ${
                        isCurrentUser ? 'text-white/80' : 'text-[rgb(34,139,34)]'
                      }`}
                      onClick={() => console.log('Open location:', message.metadata?.location)}
                    >
                      View on map
                    </button>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed">{message.content}</p>
                )}
              </div>
              
              <span className={`text-xs text-[rgb(100,116,139)] mt-1 ${
                isCurrentUser ? 'text-right' : ''
              }`}>
                {formatTime(message.timestamp)}
              </span>
            </div>
            
            {showAvatar && isCurrentUser && (
              <div className="w-8 h-8 rounded-full bg-[rgb(34,139,34)] flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                {message.userAvatar}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[rgb(226,232,240)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[rgb(34,139,34)] flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-[rgb(15,23,42)]">Moab Adventure</h2>
            <p className="text-sm text-[rgb(100,116,139)]">4 members</p>
          </div>
        </div>
        
        <button 
          className="p-2 hover:bg-[rgb(248,250,252)] rounded-lg transition-colors"
          aria-label="Chat options"
        >
          <MoreVertical className="w-5 h-5 text-[rgb(100,116,139)]" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin w-6 h-6 border-2 border-[rgb(34,139,34)] border-t-transparent rounded-full"></div>
          </div>
        )}
        
        {messages.map((message, index) => renderMessage(message, index))}
        
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[rgb(100,116,139)] flex items-center justify-center text-white text-sm">
              ?
            </div>
            <div className="bg-[rgb(248,250,252)] rounded-2xl px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[rgb(100,116,139)] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[rgb(100,116,139)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-[rgb(100,116,139)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[rgb(226,232,240)]">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-3 pr-12 bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] rounded-2xl text-[rgb(15,23,42)] placeholder-[rgb(100,116,139)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent resize-none"
              style={{ minHeight: '44px' }}
            />
            
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button 
                className="p-1 hover:bg-[rgb(226,232,240)] rounded-lg transition-colors"
                aria-label="Add attachment"
              >
                <Paperclip className="w-4 h-4 text-[rgb(100,116,139)]" />
              </button>
              <button 
                className="p-1 hover:bg-[rgb(226,232,240)] rounded-lg transition-colors"
                aria-label="Add emoji"
              >
                <Smile className="w-4 h-4 text-[rgb(100,116,139)]" />
              </button>
            </div>
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="w-11 h-11 bg-[rgb(34,139,34)] text-white rounded-full flex items-center justify-center hover:bg-[rgb(34,139,34)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-md hover:shadow-lg active:scale-95"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          <button 
            className="flex items-center gap-2 px-3 py-2 bg-[rgb(248,250,252)] text-[rgb(71,85,105)] rounded-full text-sm font-medium hover:bg-[rgb(226,232,240)] transition-colors whitespace-nowrap"
            onClick={() => console.log('Share location')}
          >
            <MapPin className="w-4 h-4" />
            Share Location
          </button>
          <button 
            className="flex items-center gap-2 px-3 py-2 bg-[rgb(248,250,252)] text-[rgb(71,85,105)] rounded-full text-sm font-medium hover:bg-[rgb(226,232,240)] transition-colors whitespace-nowrap"
            onClick={() => console.log('Create task')}
          >
            <Calendar className="w-4 h-4" />
            Create Task
          </button>
        </div>
      </div>
    </div>
  )
}

export default function GroupChatDemo() {
  return (
    <div className="h-screen max-w-md mx-auto bg-white">
      <GroupChat />
    </div>
  )
}