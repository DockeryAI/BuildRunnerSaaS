'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Smile, Paperclip, Image as ImageIcon } from 'lucide-react'

interface Message {
  id: string
  sender: string
  content: string
  timestamp: Date
  avatar?: string
}

interface GroupChatProps {
  groupId?: string
  messages?: Message[]
  onSendMessage?: (content: string) => void
  currentUser?: {
    id: string
    name: string
    avatar?: string
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function GroupChat({
  groupId = 'default',
  messages = DEFAULT_MESSAGES,
  onSendMessage = () => {},
  currentUser = DEFAULT_USER
}: GroupChatProps) {
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      onSendMessage(newMessage)
      setNewMessage('')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-[calc(100vh-8rem)] bg-background rounded-lg shadow-lg border border-border"
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-medium text-foreground">Group Chat</h2>
        <span className="text-sm text-muted-foreground">{messages.length} messages</span>
      </div>

      {/* Messages Container */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              variants={messageVariants}
              className={`flex items-start gap-3 ${
                message.sender === currentUser.name ? 'flex-row-reverse' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
                {message.avatar || message.sender[0].toUpperCase()}
              </div>
              
              <div className={`max-w-[70%] ${
                message.sender === currentUser.name 
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface text-foreground'
              } rounded-lg p-3 shadow-sm`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    {message.sender}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm">{message.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </motion.div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            className="p-2 rounded-full hover:bg-surface text-muted-foreground"
            aria-label="Add emoji"
          >
            <Smile size={20} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            className="p-2 rounded-full hover:bg-surface text-muted-foreground"
            aria-label="Attach file"
          >
            <Paperclip size={20} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button" 
            className="p-2 rounded-full hover:bg-surface text-muted-foreground"
            aria-label="Add image"
          >
            <ImageIcon size={20} />
          </motion.button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 bg-surface rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            disabled={!newMessage.trim()}
            aria-label="Send message"
          >
            <Send size={20} />
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}

const DEFAULT_USER = {
  id: '1',
  name: 'John Doe',
  avatar: 'JD'
}

const DEFAULT_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'John Doe',
    content: 'Hey everyone! Who's bringing the firewood for Saturday?',
    timestamp: new Date('2024-01-20T09:00:00')
  },
  {
    id: '2', 
    sender: 'Sarah Smith',
    content: 'I can bring some! How much do we need?',
    timestamp: new Date('2024-01-20T09:02:00')
  },
  {
    id: '3',
    sender: 'Mike Johnson',
    content: 'I'll bring some extra just in case. Better to have too much than too little!',
    timestamp: new Date('2024-01-20T09:05:00')
  }
]

export default function GroupChatDemo() {
  return <GroupChat />
}