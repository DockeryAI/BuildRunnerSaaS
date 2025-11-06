'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { Send, Image, Smile, Paperclip, MessageCircle } from 'lucide-react'

interface Message {
  id: string
  sender: string
  content: string
  timestamp: Date
  avatar?: string
}

interface GroupChatProps {
  groupId?: string
  initialMessages?: Message[]
  onSendMessage?: (content: string) => void
  currentUser?: string
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
  initialMessages = [],
  onSendMessage = () => {},
  currentUser = 'User',
  isLoading = false
}: GroupChatProps = {}) {
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

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      const message: Message = {
        id: Date.now().toString(),
        sender: currentUser,
        content: newMessage,
        timestamp: new Date(),
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
      handleSendMessage()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-[600px] bg-background dark:bg-surface rounded-xl shadow-lg border border-[#E5E7EB] dark:border-border transition-all duration-300 hover:shadow-xl"
    >
      <div className="p-16 border-b border-[#E5E7EB] dark:border-border">
        <h2 className="text-muted-foreground dark:text-foreground font-medium font-inter">Group Chat</h2>
      </div>

      {isLoading ? (
        <div className="flex-1 p-16 space-y-16 animate-pulse">
          <div className="h-16 bg-surface dark:bg-surface rounded-xl w-3/4"></div>
          <div className="h-16 bg-surface dark:bg-surface rounded-xl w-1/2"></div>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex-1 overflow-y-auto p-16 space-y-16"
        >
          {messages.length === 0 ? (
            <div className="text-center py-32">
              <div className="w-48 h-48 bg-surface dark:bg-surface rounded-full mx-auto mb-16 flex items-center justify-center">
                <MessageCircle className="w-24 h-24 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-8">No messages yet</h3>
              <p className="text-muted-foreground dark:text-muted-foreground">Start the conversation!</p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map(message => (
                <motion.div
                  key={message.id}
                  variants={messageVariants}
                  className={`flex ${message.sender === currentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${
                    message.sender === currentUser 
                      ? 'bg-[#3B82F6] text-foreground'
                      : 'bg-surface dark:bg-surface text-muted-foreground dark:text-foreground'
                  } rounded-2xl px-16 py-8 transition-all duration-200 hover:-translate-y-1`}>
                    <div className="text-sm font-medium font-inter mb-4">{message.sender}</div>
                    <div className="text-sm">{message.content}</div>
                    <div className="text-xs mt-4 opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </motion.div>
      )}

      {error && (
        <div className="mx-16 mb-8 rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-8">
          <p className="text-sm text-secondary dark:text-secondary">{error}</p>
        </div>
      )}

      <div className="p-16 border-t border-[#E5E7EB] dark:border-border">
        <div className="flex items-center gap-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-8 text-muted-foreground hover:text-muted-foreground dark:text-muted-foreground dark:hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[#3B82F6] rounded-lg transition-all duration-200"
            aria-label="Add image"
          >
            <Image size={20} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-8 text-muted-foreground hover:text-muted-foreground dark:text-muted-foreground dark:hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[#3B82F6] rounded-lg transition-all duration-200"
            aria-label="Add emoji"
          >
            <Smile size={20} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-8 text-muted-foreground hover:text-muted-foreground dark:text-muted-foreground dark:hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[#3B82F6] rounded-lg transition-all duration-200"
            aria-label="Attach file"
          >
            <Paperclip size={20} />
          </motion.button>
          
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-16 py-8 bg-surface dark:bg-surface text-muted-foreground dark:text-foreground placeholder:text-muted-foreground dark:placeholder:text-muted-foreground rounded-xl border border-[#E5E7EB] dark:border-border focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-all duration-200 resize-none font-inter"
              rows={1}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            className="p-8 bg-[#3B82F6] text-foreground rounded-full hover:bg-[#3B82F6]/90 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Send message"
            disabled={!newMessage.trim()}
          >
            <Send size={20} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default function GroupChatDemo() {
  const demoMessages: Message[] = [
    {
      id: '1',
      sender: 'John',
      content: 'Hey everyone! Who's bringing the firewood?',
      timestamp: new Date('2024-01-20T10:00:00')
    },
    {
      id: '2', 
      sender: 'Sarah',
      content: 'I can grab some on the way there',
      timestamp: new Date('2024-01-20T10:02:00')
    }
  ]

  return <GroupChat initialMessages={demoMessages} />
}