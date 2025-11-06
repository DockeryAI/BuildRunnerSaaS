'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { UserPlus, X, Check, Mail, AlertCircle, Loader2 } from 'lucide-react'

interface Member {
  id: string
  name: string
  email: string
  role: string
  status: 'pending' | 'active'
}

interface GroupMemberManagementProps {
  members?: Member[]
  onInvite?: (email: string) => void
  onRemove?: (id: string) => void
  isLoading?: boolean
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
}

export function GroupMemberManagement({
  members = DEFAULT_MEMBERS,
  onInvite = () => {},
  onRemove = () => {},
  isLoading = false
}: GroupMemberManagementProps = {}) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const handleInvite = () => {
    if (!email.includes('@')) {
      setError('Please enter a valid email')
      return
    }
    
    onInvite(email)
    setEmail('')
    setError('')
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto p-8"
    >
      <div className="mb-8">
        <h2 className="font-inter text-2xl font-semibold text-muted-foreground dark:text-foreground mb-2">Trip Members</h2>
        <p className="font-inter text-muted-foreground dark:text-muted-foreground">Invite and manage trip participants</p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className="w-full px-4 py-3 rounded-lg bg-background dark:bg-surface border border-border dark:border-border text-muted-foreground dark:text-foreground placeholder:text-muted-foreground dark:placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
            aria-label="Email address"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleInvite}
            className="absolute right-2 top-2 px-4 py-1 bg-primary hover:bg-primary text-foreground rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send invitation"
          >
            Invite
          </motion.button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-4 rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary"
            >
              <AlertCircle size={16} className="text-secondary dark:text-secondary" />
              <span className="text-secondary dark:text-secondary">{error}</span>
            </motion.div>
          )}

          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-4 rounded-lg bg-primary dark:bg-primary/20 border border-primary dark:border-primary"
            >
              <Check size={16} className="text-primary dark:text-primary" />
              <span className="text-primary dark:text-primary">Invitation sent successfully!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-surface dark:bg-surface rounded-lg"></div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-surface dark:bg-surface rounded-full mx-auto mb-4 flex items-center justify-center">
            <UserPlus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-2">No members yet</h3>
          <p className="text-muted-foreground dark:text-muted-foreground text-sm">Start by inviting team members</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {members.map((member) => (
            <motion.div
              key={member.id}
              variants={itemVariants}
              className="flex items-center justify-between p-4 bg-background dark:bg-surface rounded-lg border border-border dark:border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary dark:bg-primary/30 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-primary dark:text-primary" />
                </div>
                <div>
                  <p className="font-medium text-muted-foreground dark:text-foreground">{member.name}</p>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={`text-xs px-3 py-1 rounded-full ${
                  member.status === 'active' 
                    ? 'bg-primary dark:bg-primary/30 text-primary dark:text-primary'
                    : 'bg-accent dark:bg-accent/30 text-accent dark:text-accent'
                }`}>
                  {member.status}
                </span>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onRemove(member.id)}
                  className="p-2 hover:bg-secondary dark:hover:bg-secondary/30 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  aria-label={`Remove ${member.name}`}
                >
                  <X className="w-4 h-4 text-secondary dark:text-secondary" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

const DEFAULT_MEMBERS: Member[] = [
  {
    id: '1',
    name: 'Sarah Connor',
    email: 'sarah@example.com',
    role: 'Organizer',
    status: 'active'
  },
  {
    id: '2', 
    name: 'John Smith',
    email: 'john@example.com',
    role: 'Member',
    status: 'pending'
  }
]

export default function GroupMemberManagementDemo() {
  return <GroupMemberManagement />
}