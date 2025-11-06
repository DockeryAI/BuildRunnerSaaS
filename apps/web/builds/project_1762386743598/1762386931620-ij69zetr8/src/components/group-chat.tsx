'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Paperclip, Image, MapPin, Calendar, Users, MoreVertical } from 'lucide-react'

interface Message {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  timestamp: Date
  type: 'text' | 'image' | 'location' | 'event'
  metadata?: {
    imageUrl?: string
    location?: { lat: number; lng: number; name: string }
    eventId?: string
    eventTitle?: string
  }
}

interface GroupChatProps {
  tripId?: string
  groupMembers?: Array<{
    id: string
    name: string
    avatar: string
    isOnline: boolean
  }>
  onSendMessage?: (message: Omit<Message, 'id' | 'timestamp'>) => void
  onLocationShare?: () => void
  onImageShare?: () => void
}

export function GroupChat({
  tripId = 'trip-1',
  groupMembers = DEFAULT_MEMBERS,
  onSendMessage = () => console.log('Message sent'),
  onLocationShare = () => console.log('Location shared'),
  onImageShare = () => console.log('Image shared')
}: GroupChatProps = {}) {
  const [messages, setMessages] = useState<Message[]>(DEFAULT_MESSAGES)
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showAttachments, setShowAttachments] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const message: Omit<Message, 'id' | 'timestamp'> = {
        userId: 'current-user',
        userName: 'You',
        userAvatar: '/avatars/current-user.jpg',
        content: newMessage.trim(),
        type: 'text'
      }

      const fullMessage: Message = {
        ...message,
        id: `msg-${Date.now()}`,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, fullMessage])
      setNewMessage('')
      onSendMessage(message)
      setShowAttachments(false)
    } catch (err) {
      setError('Failed to send message. Please try again.')
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

  const handleLocationShare = () => {
    const locationMessage: Message = {
      id: `msg-${Date.now()}`,
      userId: 'current-user',
      userName: 'You',
      userAvatar: '/avatars/current-user.jpg',
      content: 'Shared current location',
      timestamp: new Date(),
      type: 'location',
      metadata: {
        location: {
          lat: 40.7128,
          lng: -74.0060,
          name: 'Moab Trail Head'
        }
      }
    }

    setMessages(prev => [...prev, locationMessage])
    onLocationShare()
    setShowAttachments(false)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
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
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const renderMessage = (message: Message) => {
    const isCurrentUser = message.userId === 'current-user'

    return (
      <div
        key={message.id}
        className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} transition-all duration-300 hover:bg-muted/30 rounded-lg p-2 -m-2`}
      >
        {!isCurrentUser && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium shadow-sm">
              {message.userName.charAt(0)}
            </div>
          </div>
        )}

        <div className={`flex flex-col max-w-[75%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
          {!isCurrentUser && (
            <span className="text-xs text-muted-foreground mb-1 px-1 font-medium">
              {message.userName}
            </span>
          )}

          <div
            className={`rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md ${
              isCurrentUser
                ? 'bg-primary text-primary-foreground'
                : 'bg-surface dark:bg-surface text-foreground border border-border'
            }`}
          >
            {message.type === 'text' && (
              <p className="text-sm leading-relaxed">{message.content}</p>
            )}

            {message.type === 'location' && message.metadata?.location && (
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isCurrentUser ? 'bg-primary-foreground/20' : 'bg-primary/10'}`}>
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{message.metadata.location.name}</p>
                  <p className="text-xs opacity-75">Location shared</p>
                </div>
              </div>
            )}

            {message.type === 'event' && message.metadata?.eventTitle && (
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isCurrentUser ? 'bg-primary-foreground/20' : 'bg-accent/10'}`}>
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{message.metadata.eventTitle}</p>
                  <p className="text-xs opacity-75">Event shared</p>
                </div>
              </div>
            )}
          </div>

          <span className="text-xs text-muted-foreground mt-1 px-1">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    )
  }

  const groupMessagesByDate = (messages: Message[]) => {
    const grouped: { [key: string]: Message[] } = {}

    messages.forEach(message => {
      const dateKey = message.timestamp.toDateString()
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(message)
    })

    return grouped
  }

  const groupedMessages = groupMessagesByDate(messages)

  return (
    <div className="flex flex-col h-full bg-background font-sans">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-surface shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {groupMembers.slice(0, 3).map((member, index) => (
              <div
                key={member.id}
                className="w-8 h-8 rounded-full bg-primary text-primary-foreground border-2 border-background flex items-center justify-center text-xs font-medium shadow-sm transition-transform duration-200 hover:scale-110"
                style={{ zIndex: 10 - index }}
              >
                {member.name.charAt(0)}
                {member.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                )}
              </div>
            ))}
            {groupMembers.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground border-2 border-background flex items-center justify-center text-xs font-medium shadow-sm">
                +{groupMembers.length - 3}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-lg">Trip Chat</h3>
            <p className="text-xs text-muted-foreground">
              {groupMembers.filter(m => m.isOnline).length} online
            </p>
          </div>
        </div>

        <button
          className="p-2 hover:bg-muted rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 active:scale-95"
          aria-label="Chat options"
        >
          <MoreVertical className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="mx-4 mt-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {isLoading && messages.length === 0 ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-12 bg-muted rounded-2xl w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No messages yet</h3>
            <p className="text-muted-foreground text-sm">Start the conversation with your trip group</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([dateKey, dayMessages]) => (
            <div key={dateKey}>
              <div className="flex justify-center mb-6">
                <span className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full font-medium shadow-sm">
                  {formatDate(new Date(dateKey))}
                </span>
              </div>
              <div className="space-y-4">
                {dayMessages.map(renderMessage)}
              </div>
            </div>
          ))
        )}

        {isTyping && (
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
            <span className="text-sm text-muted-foreground">Someone is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attachments Menu */}
      {showAttachments && (
        <div className="p-4 border-t border-border bg-surface animate-slide-up">
          <div className="flex gap-4">
            <button
              onClick={handleLocationShare}
              className="flex flex-col items-center gap-2 p-3 bg-background rounded-xl shadow-sm hover:shadow-md transition-all duration-200 min-w-[80px] hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 active:scale-95"
              aria-label="Share location"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">Location</span>
            </button>

            <button
              onClick={onImageShare}
              className="flex flex-col items-center gap-2 p-3 bg-background rounded-xl shadow-sm hover:shadow-md transition-all duration-200 min-w-[80px] hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 active:scale-95"
              aria-label="Share image"
            >
              <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                <Image className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">Photo</span>
            </button>

            <button
              className="flex flex-col items-center gap-2 p-3 bg-background rounded-xl shadow-sm hover:shadow-md transition-all duration-200 min-w-[80px] hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 active:scale-95"
              aria-label="Share event"
            >
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-accent" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">Event</span>
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border bg-surface">
        <div className="flex items-end gap-3">
          <button
            onClick={() => setShowAttachments(!showAttachments)}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 active:scale-95 ${
              showAttachments ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'
            }`}
            aria-label="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={isLoading}
              className="w-full px-4 py-3 bg-background border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Type a message"
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isLoading}
            className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

const DEFAULT_MEMBERS = [
  { id: '1', name: 'Alex Chen', avatar: '/avatars/alex.jpg', isOnline: true },
  { id: '2', name: 'Sarah Wilson', avatar: '/avatars/sarah.jpg', isOnline: true },
  { id: '3', name: 'Mike Rodriguez', avatar: '/avatars/mike.jpg', isOnline: false },
  { id: '4', name: 'Emma Thompson', avatar: '/avatars/emma.jpg', isOnline: true },
  { id: '5', name: 'David Park', avatar: '/avatars/david.jpg', isOnline: false }
]

const DEFAULT_MESSAGES: Message[] = [
  {
    id: '1',
    userId: 'alex-1',
    userName: 'Alex Chen',
    userAvatar: '/avatars/alex.jpg',
    content: 'Hey everyone! Just confirmed our campsite reservation for this weekend. We\'re all set for site #12 at Moab.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: 'text'
  },
  {
    id: '2',
    userId: 'sarah-2',
    userName: 'Sarah Wilson',
    userAvatar: '/avatars/sarah.jpg',
    content: 'Awesome! I\'ll bring the camp chairs and portable table. Should I also grab extra firewood?',
    timestamp: new Date(Date.now() - 90 * 60 * 1000),
    type: 'text'
  },
  {
    id: '3',
    userId: 'mike-3',
    userName: 'Mike Rodriguez',
    userAvatar: '/avatars/mike.jpg',
    content: 'I can handle the firewood. Already have a truck full from last weekend. What about food prep?',
    timestamp: new Date(Date.now() - 75 * 60 * 1000),
    type: 'text'
  },
  {
    id: '4',
    userId: 'emma-4',
    userName: 'Emma Thompson',
    userAvatar: '/avatars/emma.jpg',
    content: 'I\'ve got Saturday breakfast covered - thinking pancakes and bacon. David, you still good for Saturday dinner?',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    type: 'text'
  },
  {
    id: '5',
    userId: 'alex-1',
    userName: 'Alex Chen',
    userAvatar: '/avatars/alex.jpg',
    content: 'Perfect! Weather looks great too - sunny and 75°F both days. Can\'t wait!',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    type: 'text'
  },
  {
    id: '6',
    userId: 'sarah-2',
    userName: 'Sarah Wilson',
    userAvatar: '/avatars/sarah.jpg',
    content: 'Trail Head Location',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    type: 'location',
    metadata: {
      location: {
        lat: 40.7128,
        lng: -74.0060,
        name: 'Moab Trail Head'
      }
    }
  }
]

export default function GroupChatDemo() {
  return (
    <div className="h-screen bg-background">
      <GroupChat />
    </div>
  )
}