'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Smile, MoreVertical, Users, MapPin } from 'lucide-react'

interface Message {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  timestamp: Date
  type: 'text' | 'system' | 'location' | 'task'
  metadata?: {
    taskId?: string
    taskName?: string
    assignee?: string
    location?: {
      name: string
      coordinates: [number, number]
    }
  }
}

interface GroupMember {
  id: string
  name: string
  avatar?: string
  isOnline: boolean
  lastSeen?: Date
}

interface GroupChatProps {
  tripId?: string
  groupMembers?: GroupMember[]
  currentUserId?: string
  onSendMessage?: (message: Omit<Message, 'id' | 'timestamp'>) => void
  onLocationShare?: () => void
  onTaskMention?: (taskId: string) => void
}

export function GroupChat({
  tripId = 'trip-1',
  groupMembers = DEFAULT_MEMBERS,
  currentUserId = 'user-1',
  onSendMessage = () => console.log('Message sent'),
  onLocationShare = () => console.log('Location shared'),
  onTaskMention = () => console.log('Task mentioned')
}: GroupChatProps = {}) {
  const [messages, setMessages] = useState<Message[]>(DEFAULT_MESSAGES)
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: Omit<Message, 'id' | 'timestamp'> = {
      userId: currentUserId,
      userName: groupMembers.find(m => m.id === currentUserId)?.name || 'You',
      content: newMessage.trim(),
      type: 'text'
    }

    const fullMessage: Message = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, fullMessage])
    onSendMessage(message)
    setNewMessage('')
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

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {}
    
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
  const currentUser = groupMembers.find(m => m.id === currentUserId)
  const onlineCount = groupMembers.filter(m => m.isOnline).length

  return (
    <div className="flex flex-col h-full bg-white border border-[rgb(226,232,240)] rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[rgb(226,232,240)] bg-[rgb(248,250,252)]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Users className="w-6 h-6 text-[rgb(34,139,34)]" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[rgb(34,139,34)] rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-medium">{onlineCount}</span>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-[rgb(15,23,42)]">Trip Chat</h3>
            <p className="text-sm text-gray-600">{onlineCount} online</p>
          </div>
        </div>
        <button
          onClick={() => setShowMembers(!showMembers)}
          className="p-2 hover:bg-[rgb(241, 245, 249)] rounded-lg transition-colors"
          aria-label="View group members"
        >
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Members Panel */}
      {showMembers && (
        <div className="p-4 border-b border-[rgb(226,232,240)] bg-[rgb(248,250,252)]">
          <h4 className="font-medium text-[rgb(15,23,42)] mb-3">Group Members</h4>
          <div className="space-y-2">
            {groupMembers.map(member => (
              <div key={member.id} className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 bg-[rgb(34,139,34)] rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {member.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[rgb(15,23,42)]">{member.name}</p>
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
        {Object.entries(messageGroups).map(([dateKey, dayMessages]) => (
          <div key={dateKey}>
            {/* Date Separator */}
            <div className="flex items-center justify-center my-4">
              <div className="px-3 py-1 bg-[rgb(241,245,249)] rounded-full">
                <span className="text-xs font-medium text-gray-600">
                  {formatDate(new Date(dateKey))}
                </span>
              </div>
            </div>

            {/* Messages for this date */}
            {dayMessages.map(message => {
              const isCurrentUser = message.userId === currentUserId
              const member = groupMembers.find(m => m.id === message.userId)

              if (message.type === 'system') {
                return (
                  <div key={message.id} className="flex justify-center">
                    <div className="px-3 py-1 bg-[rgb(241,245,249)] rounded-full max-w-xs">
                      <p className="text-sm text-gray-600 text-center">{message.content}</p>
                    </div>
                  </div>
                )
              }

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                >
                  {!isCurrentUser && (
                    <div className="w-8 h-8 bg-[rgb(34,139,34)] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-white">
                        {message.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  <div className={`flex-1 max-w-xs ${isCurrentUser ? 'text-right' : ''}`}>
                    {!isCurrentUser && (
                      <p className="text-sm font-medium text-[rgb(15,23,42)] mb-1">
                        {message.userName}
                      </p>
                    )}
                    
                    <div
                      className={`p-3 rounded-lg ${
                        isCurrentUser
                          ? 'bg-[rgb(34,139,34)] text-white'
                          : 'bg-[rgb(241,245,249)] text-[rgb(15,23,42)]'
                      }`}
                    >
                      {message.type === 'location' && message.metadata?.location && (
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {message.metadata.location.name}
                          </span>
                        </div>
                      )}
                      
                      {message.type === 'task' && message.metadata?.taskName && (
                        <div className="flex items-center gap-2 mb-2 p-2 bg-black/10 rounded">
                          <span className="text-sm">📋 Task: {message.metadata.taskName}</span>
                        </div>
                      )}
                      
                      <p className="text-sm">{message.content}</p>
                    </div>
                    
                    <p className={`text-xs text-gray-500 mt-1 ${isCurrentUser ? 'text-right' : ''}`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm">...</span>
            </div>
            <div className="bg-[rgb(241,245,249)] p-3 rounded-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[rgb(226,232,240)] bg-[rgb(248,250,252)]">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 bg-white border border-[rgb(226,232,240)] rounded-lg p-2">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 outline-none text-sm"
                aria-label="Type a message"
              />
              <div className="flex items-center gap-1">
                <button
                  onClick={onLocationShare}
                  className="p-1.5 hover:bg-[rgb(241, 245, 249)] rounded transition-colors"
                  aria-label="Share location"
                >
                  <MapPin className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  className="p-1.5 hover:bg-[rgb(241, 245, 249)] rounded transition-colors"
                  aria-label="Add attachment"
                >
                  <Paperclip className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  className="p-1.5 hover:bg-[rgb(241, 245, 249)] rounded transition-colors"
                  aria-label="Add emoji"
                >
                  <Smile className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-3 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

const DEFAULT_MEMBERS: GroupMember[] = [
  { id: 'user-1', name: 'Alex Johnson', isOnline: true },
  { id: 'user-2', name: 'Sarah Chen', isOnline: true },
  { id: 'user-3', name: 'Mike Rodriguez', isOnline: false, lastSeen: new Date(Date.now() - 3600000) },
  { id: 'user-4', name: 'Emma Davis', isOnline: true },
  { id: 'user-5', name: 'Chris Wilson', isOnline: false, lastSeen: new Date(Date.now() - 7200000) }
]

const DEFAULT_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    userId: 'system',
    userName: 'System',
    content: 'Trip chat created for Moab Adventure 2024',
    timestamp: new Date(Date.now() - 86400000),
    type: 'system'
  },
  {
    id: 'msg-2',
    userId: 'user-2',
    userName: 'Sarah Chen',
    content: 'Hey everyone! Super excited for this trip. Has anyone checked the weather forecast?',
    timestamp: new Date(Date.now() - 82800000),
    type: 'text'
  },
  {
    id: 'msg-3',
    userId: 'user-3',
    userName: 'Mike Rodriguez',
    content: 'Just checked - looks like clear skies all weekend! Perfect for off-roading 🌞',
    timestamp: new Date(Date.now() - 82200000),
    type: 'text'
  },
  {
    id: 'msg-4',
    userId: 'user-4',
    userName: 'Emma Davis',
    content: 'I can handle lunch on Saturday. Thinking sandwiches and snacks?',
    timestamp: new Date(Date.now() - 81600000),
    type: 'task',
    metadata: {
      taskId: 'task-1',
      taskName: 'Saturday Lunch',
      assignee: 'Emma Davis'
    }
  },
  {
    id: 'msg-5',
    userId: 'user-1',
    userName: 'Alex Johnson',
    content: 'Sounds perfect Emma! I\'ll bring the firewood and camping gear.',
    timestamp: new Date(Date.now() - 3600000),
    type: 'text'
  },
  {
    id: 'msg-6',
    userId: 'user-2',
    userName: 'Sarah Chen',
    content: 'Found a great camping spot near the trails',
    timestamp: new Date(Date.now() - 1800000),
    type: 'location',
    metadata: {
      location: {
        name: 'Moab Rim Campground',
        coordinates: [38.5733, -109.5498]
      }
    }
  },
  {
    id: 'msg-7',
    userId: 'user-5',
    userName: 'Chris Wilson',
    content: 'Perfect! What time should we meet up on Friday?',
    timestamp: new Date(Date.now() - 900000),
    type: 'text'
  }
]

export default function GroupChatDemo() {
  return (
    <div className="h-screen max-w-md mx-auto bg-[rgb(255, 255, 255)] p-4">
      <GroupChat />
    </div>
  )
}