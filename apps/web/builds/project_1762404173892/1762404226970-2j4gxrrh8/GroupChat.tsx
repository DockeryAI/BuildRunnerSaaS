'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Image, Smile, Paperclip, MessageCircle } from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: string
  timestamp: Date
}

interface GroupChatProps {
  groupId?: string
  currentUser?: string
  onSendMessage?: (message: string) => void
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
  isLoading = false
}: GroupChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey everyone! Who's bringing firewood?',
      sender: 'Mike',
      timestamp: new Date('2024-02-10T10:00:00')
    },
    {
      id: '2',
      text: 'I can grab some on the way',
      sender: 'Sarah',
      timestamp: new Date('2024-02-10T10:01:00')
    }
  ])
  const [newMessage, setNewMessage] = useState('')
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    try {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: currentUser,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, message])
      setNewMessage('')
      onSendMessage(newMessage)
      setError('')
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
      transition={{ duration: 0.3 }}
      className="flex flex-col h-[calc(100vh-4rem)] bg-[#FFFFFF] dark:bg-surface"
    >
      <div className="flex-1 overflow-y-auto p-8">
        {isLoading ? (
          <div className="space-y-8 animate-pulse">
            <div className="h-16 bg-surface dark:bg-surface rounded-xl w-3/4"></div>
            <div className="h-16 bg-surface dark:bg-surface rounded-xl w-1/2"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-16 h-16 bg-surface dark:bg-surface rounded-full mx-auto mb-8 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-4">No messages yet</h3>
            <p className="text-muted-foreground dark:text-muted-foreground">Start the conversation!</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            {messages.map(message => (
              <motion.div
                key={message.id}
                variants={messageVariants}
                className={`flex ${message.sender === currentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-8 py-4 transition-all duration-300 hover:shadow-lg ${
                    message.sender === currentUser
                      ? 'bg-[#3B82F6] text-foreground dark:bg-primary'
                      : 'bg-surface dark:bg-surface border border-[#E5E7EB] dark:border-border'
                  }`}
                >
                  <div className="text-sm font-medium mb-2 font-inter">
                    {message.sender}
                  </div>
                  <div className="text-sm leading-relaxed">{message.text}</div>
                  <div className="text-xs mt-2 opacity-70">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </motion.div>
        )}
      </div>

      {error && (
        <div className="mx-8 mb-4 rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-4">
          <p className="text-sm text-secondary dark:text-secondary">{error}</p>
        </div>
      )}

      <div className="border-t border-[#E5E7EB] dark:border-border p-8 bg-[#FFFFFF] dark:bg-surface">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-full hover:bg-surface dark:hover:bg-surface focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all duration-200"
            aria-label="Add image"
          >
            <Image className="w-5 h-5 text-muted-foreground dark:text-muted-foreground" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-full hover:bg-surface dark:hover:bg-surface focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all duration-200"
            aria-label="Add emoji"
          >
            <Smile className="w-5 h-5 text-muted-foreground dark:text-muted-foreground" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-full hover:bg-surface dark:hover:bg-surface focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all duration-200"
            aria-label="Attach file"
          >
            <Paperclip className="w-5 h-5 text-muted-foreground dark:text-muted-foreground" />
          </motion.button>

          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-8 py-4 bg-surface dark:bg-surface border border-[#E5E7EB] dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] dark:focus:border-primary transition-all duration-200 resize-none font-inter"
              rows={1}
              aria-label="Message input"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            className="p-4 rounded-full bg-[#3B82F6] dark:bg-primary text-foreground hover:bg-[#3B82F6]/90 dark:hover:bg-primary focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
            disabled={!newMessage.trim()}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default function GroupChatDemo() {
  return <GroupChat />
}