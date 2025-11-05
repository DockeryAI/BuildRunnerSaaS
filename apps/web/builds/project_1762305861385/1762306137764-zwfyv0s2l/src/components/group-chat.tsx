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
    task?: { title: string; assignee: string; dueDate: string }
  }
}

interface User {
  id: string
  name: string
  avatar: string
  status: 'online' | 'offline' | 'away'
}

interface GroupChatProps {
  tripId?: string
  users?: User[]
  messages?: Message[]
  currentUserId?: string
  onSendMessage?: (content: string, type?: Message['type'], metadata?: Message['metadata']) => void
  onTyping?: (isTyping: boolean) => void
}

const DEFAULT_USERS: User[] = [
  { id: '1', name: 'Alex Chen', avatar: 'AC', status: 'online' },
  { id: '2', name: 'Sarah Johnson', avatar: 'SJ', status: 'online' },
  { id: '3', name: 'Mike Rodriguez', avatar: 'MR', status: 'away' },
  { id: '4', name: 'Emma Wilson', avatar: 'EW', status: 'offline' }
]

const DEFAULT_MESSAGES: Message[] = [
  {
    id: '1',
    userId: 'system',
    userName: 'System',
    userAvatar: 'SY',
    content: 'Trip planning chat created for Moab Adventure Weekend',
    timestamp: new Date(Date.now() - 86400000),
    type: 'system'
  },
  {
    id: '2',
    userId: '2',
    userName: 'Sarah Johnson',
    userAvatar: 'SJ',
    content: 'Hey everyone! Super excited for this trip. I can handle breakfast on Saturday if someone wants to take dinner?',
    timestamp: new Date(Date.now() - 3600000),
    type: 'text'
  },
  {
    id: '3',
    userId: '3',
    userName: 'Mike Rodriguez',
    userAvatar: 'MR',
    content: 'I\'ll take dinner Saturday! Already have some great camping recipes in mind 🔥',
    timestamp: new Date(Date.now() - 3000000),
    type: 'text'
  },
  {
    id: '4',
    userId: '1',
    userName: 'Alex Chen',
    userAvatar: 'AC',
    content: 'Perfect! I found this amazing spot for our base camp',
    timestamp: new Date(Date.now() - 1800000),
    type: 'location',
    metadata: {
      location: { name: 'Arches National Park - Fiery Furnace Area', coordinates: [38.7331, -109.5925] }
    }
  },
  {
    id: '5',
    userId: '4',
    userName: 'Emma Wilson',
    userAvatar: 'EW',
    content: 'Don\'t forget we need someone to bring firewood and camping chairs',
    timestamp: new Date(Date.now() - 900000),
    type: 'task',
    metadata: {
      task: { title: 'Bring firewood & camping chairs', assignee: 'Unassigned', dueDate: 'Friday' }
    }
  }
]

export function GroupChat({
  tripId = 'moab-adventure-2024',
  users = DEFAULT_USERS,
  messages = DEFAULT_MESSAGES,
  currentUserId = '1',
  onSendMessage = (content, type, metadata) => console.log('Send message:', { content, type, metadata }),
  onTyping = (isTyping) => console.log('Typing:', isTyping)
}: GroupChatProps = {}) {
  const [messageInput, setMessageInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [showQuickActions, setShowQuickActions] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!messageInput.trim()) return

    onSendMessage(messageInput.trim())
    setMessageInput('')
    setIsTyping(false)
    onTyping(false)
  }

  const handleInputChange = (value: string) => {
    setMessageInput(value)
    
    if (value.length > 0 && !isTyping) {
      setIsTyping(true)
      onTyping(true)
    } else if (value.length === 0 && isTyping) {
      setIsTyping(false)
      onTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'online': return 'bg-[rgb(34,139,34)]'
      case 'away': return 'bg-[rgb(245,158,11)]'
      case 'offline': return 'bg-[rgb(148,163,184)]'
      default: return 'bg-[rgb(148,163,184)]'
    }
  }

  const renderMessage = (message: Message) => {
    const isCurrentUser = message.userId === currentUserId
    const isSystem = message.type === 'system'

    if (isSystem) {
      return (
        <div key={message.id} className="flex justify-center my-4">
          <div className="px-3 py-1 bg-[rgb(241,245,249)] text-[rgb(71,85,105)] text-sm rounded-full font-medium">
            {message.content}
          </div>
        </div>
      )
    }

    return (
      <div key={message.id} className={`flex gap-3 mb-4 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-[rgb(34,139,34)] flex items-center justify-center text-white text-sm font-medium">
            {message.userAvatar}
          </div>
        </div>
        
        <div className={`flex-1 max-w-[80%] ${isCurrentUser ? 'text-right' : ''}`}>
          <div className={`flex items-center gap-2 mb-1 ${isCurrentUser ? 'justify-end' : ''}`}>
            <span className="text-sm font-medium text-[rgb(51,65,85)]">{message.userName}</span>
            <span className="text-xs text-[rgb(148,163,184)]">{formatTime(message.timestamp)}</span>
          </div>
          
          <div className={`inline-block px-4 py-2 rounded-2xl ${
            isCurrentUser 
              ? 'bg-[rgb(34,139,34)] text-white' 
              : 'bg-[rgb(248,250,252)] text-[rgb(15,23,42)]'
          }`}>
            {message.type === 'location' && message.metadata?.location && (
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">Shared Location</span>
              </div>
            )}
            
            {message.type === 'task' && message.metadata?.task && (
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4" />
                <span className="font-medium">Task Assignment</span>
              </div>
            )}
            
            <p className="text-sm leading-relaxed">{message.content}</p>
            
            {message.metadata?.location && (
              <div className="mt-2 p-2 bg-black/10 rounded-lg">
                <p className="text-xs font-medium">{message.metadata.location.name}</p>
                <p className="text-xs opacity-75">
                  {message.metadata.location.coordinates[0]}, {message.metadata.location.coordinates[1]}
                </p>
              </div>
            )}
            
            {message.metadata?.task && (
              <div className="mt-2 p-2 bg-black/10 rounded-lg">
                <p className="text-xs font-medium">{message.metadata.task.title}</p>
                <p className="text-xs opacity-75">
                  Assigned to: {message.metadata.task.assignee} • Due: {message.metadata.task.dueDate}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-[rgb(255,255,255)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[rgb(226,232,240)] bg-[rgb(248,250,252)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[rgb(34,139,34)] flex items-center justify-center text-white font-medium">
            MT
          </div>
          <div>
            <h1 className="font-semibold text-[rgb(15,23,42)]">Moab Trip Chat</h1>
            <p className="text-sm text-[rgb(100,116,139)]">
              {users.filter(u => u.status === 'online').length} online
            </p>
          </div>
        </div>
        
        <button 
          className="p-2 hover:bg-[rgb(226,232,240)] rounded-lg transition-colors"
          aria-label="Chat options"
        >
          <MoreVertical className="w-5 h-5 text-[rgb(100,116,139)]" />
        </button>
      </div>

      {/* Online Users */}
      <div className="flex gap-2 p-3 border-b border-[rgb(226,232,240)] overflow-x-auto">
        {users.map((user) => (
          <div key={user.id} className="flex-shrink-0 flex flex-col items-center gap-1">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-[rgb(34,139,34)] flex items-center justify-center text-white text-xs font-medium">
                {user.avatar}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`} />
            </div>
            <span className="text-xs text-[rgb(100,116,139)] max-w-[60px] truncate">
              {user.name.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.map(renderMessage)}
        
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-[rgb(100,116,139)]">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-[rgb(148,163,184)] rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-[rgb(148,163,184)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-[rgb(148,163,184)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {showQuickActions && (
        <div className="p-4 border-t border-[rgb(226,232,240)] bg-[rgb(248,250,252)]">
          <div className="grid grid-cols-3 gap-2">
            <button 
              className="flex items-center gap-2 p-3 bg-white rounded-lg border border-[rgb(226,232,240)] hover:bg-[rgb(241,245,249)] transition-colors"
              onClick={() => {
                onSendMessage('📍 Shared current location', 'location', {
                  location: { name: 'Current Location', coordinates: [38.7331, -109.5925] }
                })
                setShowQuickActions(false)
              }}
            >
              <MapPin className="w-4 h-4 text-[rgb(34,139,34)]" />
              <span className="text-sm font-medium">Location</span>
            </button>
            
            <button 
              className="flex items-center gap-2 p-3 bg-white rounded-lg border border-[rgb(226,232,240)] hover:bg-[rgb(241,245,249)] transition-colors"
              onClick={() => {
                onSendMessage('📅 Created new task assignment', 'task', {
                  task: { title: 'New Task', assignee: 'Unassigned', dueDate: 'TBD' }
                })
                setShowQuickActions(false)
              }}
            >
              <Users className="w-4 h-4 text-[rgb(245,158,11)]" />
              <span className="text-sm font-medium">Task</span>
            </button>
            
            <button 
              className="flex items-center gap-2 p-3 bg-white rounded-lg border border-[rgb(226,232,240)] hover:bg-[rgb(241,245,249)] transition-colors"
              onClick={() => {
                onSendMessage('📅 Shared calendar event', 'text')
                setShowQuickActions(false)
              }}
            >
              <Calendar className="w-4 h-4 text-[rgb(34,139,34)]" />
              <span className="text-sm font-medium">Event</span>
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-[rgb(226,232,240)] bg-white">
        <div className="flex items-end gap-2">
          <button 
            className="p-2 hover:bg-[rgb(241,245,249)] rounded-lg transition-colors"
            onClick={() => setShowQuickActions(!showQuickActions)}
            aria-label="Quick actions"
          >
            <Paperclip className="w-5 h-5 text-[rgb(100,116,139)]" />
          </button>
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={messageInput}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-3 bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] rounded-2xl text-[rgb(15,23,42)] placeholder-[rgb(148,163,184)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150 resize-none"
              style={{ minHeight: '44px' }}
            />
          </div>
          
          <button 
            className="p-2 hover:bg-[rgb(241,245,249)] rounded-lg transition-colors"
            aria-label="Add emoji"
          >
            <Smile className="w-5 h-5 text-[rgb(100,116,139)]" />
          </button>
          
          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            className="p-3 bg-[rgb(34,139,34)] text-white rounded-2xl hover:bg-[rgb(34,139,34)]/90 disabled:bg-[rgb(148,163,184)] disabled:cursor-not-allowed transition-all duration-150 shadow-md hover:shadow-lg active:scale-95"
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

export default function GroupChatDemo() {
  return <GroupChat />
}