'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Image, Smile, Paperclip, MessageSquare } from 'lucide-react'

interface Message {
  id: string
  sender: string
  content: string
  timestamp: Date
  avatar?: string
}

interface GroupChatProps {
  groupId?: string
  currentUser?: string
  onSendMessage?: (message: string) => void
  initialMessages?: Message[]
  isLoading?: boolean
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
  currentUser = 'User',
  onSendMessage = () => {},
  initialMessages = DEFAULT_MESSAGES,
  isLoading = false
}: GroupChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim()) return
    
    try {
      const message: Message = {
        id: Date.now().toString(),
        sender: currentUser,
        content: newMessage,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, message])
      setNewMessage('')
      await onSendMessage(newMessage)
      setError(null)
    } catch (err) {
      setError('Failed to send message. Please try again.')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-[600px] bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg border border-border dark:border-border/20 overflow-hidden font-sans transition-colors duration-200"
    >
      <div className="p-4 border-b border-border dark:border-border/20 bg-primary text-primaryForeground">
        <h2 className="text-lg font-semibold">Group Chat</h2>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20 dark:bg-muted/5"
      >
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 bg-muted dark:bg-muted/20 rounded-lg w-3/4" />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="w-16 h-16 bg-muted dark:bg-muted/20 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-mutedForeground" />
            </div>
            <h3 className="text-lg font-medium text-foreground-light dark:text-foreground-dark">No messages yet</h3>
            <p className="text-sm text-mutedForeground">Start the conversation!</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map(message => (
              <motion.div
                key={message.id}
                variants={messageVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.sender === currentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] ${
                  message.sender === currentUser 
                    ? 'bg-primary text-primaryForeground rounded-l-lg rounded-tr-lg' 
                    : 'bg-surface-light dark:bg-surface-dark border border-border dark:border-border/20 rounded-r-lg rounded-tl-lg'
                } p-3 shadow-sm hover:-translate-y-0.5 transition-all duration-200`}>
                  <div className="text-sm font-medium mb-1">{message.sender}</div>
                  <div className="text-sm break-words">{message.content}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </AnimatePresence>
        )}
        
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive p-3 mt-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </motion.div>

      <div className="p-4 border-t border-border dark:border-border/20 bg-surface-light dark:bg-surface-dark">
        <div className="flex items-center gap-2">
          {[
            { icon: Image, label: "Add image" },
            { icon: Smile, label: "Add emoji" },
            { icon: Paperclip, label: "Attach file" }
          ].map(({ icon: Icon, label }) => (
            <motion.button
              key={label}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-secondary hover:bg-muted rounded-full transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              aria-label={label}
            >
              <Icon size={20} />
            </motion.button>
          ))}
          
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 p-2 border border-border dark:border-border/20 rounded-lg bg-surface-light dark:bg-surface-dark text-foreground-light dark:text-foreground-dark placeholder:text-mutedForeground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
            aria-label="Message input"
          />
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="p-2 bg-primary text-primaryForeground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label="Send message"
          >
            <Send size={20} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

const DEFAULT_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'Trail Guide',
    content: 'Welcome to the group chat! This is where we'll coordinate our upcoming off-road adventure.',
    timestamp: new Date('2024-01-20T09:00:00')
  },
  {
    id: '2',
    sender: 'User',
    content: 'Thanks! Looking forward to the trip.',
    timestamp: new Date('2024-01-20T09:01:00')
  }
]

export default function GroupChatDemo() {
  return <GroupChat />
}