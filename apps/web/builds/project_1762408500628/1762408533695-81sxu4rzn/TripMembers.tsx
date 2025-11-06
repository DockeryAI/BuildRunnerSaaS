'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { UserPlus, X, Check, Mail, UserMinus, Loader2 } from 'lucide-react'

interface Member {
  id: string
  name: string
  email: string
  role: string
  status: 'invited' | 'confirmed' | 'declined'
  avatar?: string
}

interface TripMembersProps {
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
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0 }
}

export function TripMembers({
  members = DEFAULT_MEMBERS,
  onInvite = () => {},
  onRemove = () => {},
  isLoading = false
}: TripMembersProps = {}) {
  const [email, setEmail] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [error, setError] = useState('')

  const handleInvite = () => {
    if (!email) {
      setError('Please enter an email address')
      return
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    onInvite(email)
    setEmail('')
    setShowInvite(false)
    setError('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto p-8 font-inter"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold text-muted-foreground dark:text-foreground">Trip Members</h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-foreground rounded-lg shadow-sm hover:bg-[#3B82F6]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Invite member"
        >
          <UserPlus size={18} />
          <span>Invite</span>
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {showInvite && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <div className="flex gap-2 p-4 bg-background dark:bg-surface rounded-lg border border-[#E5E7EB] dark:border-border">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1 px-4 py-2 bg-background dark:bg-surface border border-[#E5E7EB] dark:border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 dark:text-foreground transition-all duration-200"
                aria-label="Email address"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleInvite}
                disabled={!email}
                className="px-4 py-2 bg-[#3B82F6] text-foreground rounded-md shadow-sm hover:bg-[#3B82F6]/90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all duration-150"
                aria-label="Send invitation"
              >
                Send
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowInvite(false)}
                className="p-2 text-muted-foreground hover:text-muted-foreground dark:text-muted-foreground dark:hover:text-muted-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50"
                aria-label="Close invitation form"
              >
                <X size={20} />
              </motion.button>
            </div>
            {error && (
              <div className="mt-2 rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-4">
                <p className="text-sm text-secondary dark:text-secondary">{error}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[72px] bg-surface dark:bg-surface rounded-lg"></div>
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
              whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
              className="flex items-center justify-between p-4 bg-background dark:bg-surface rounded-lg border border-[#E5E7EB] dark:border-border transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20 flex items-center justify-center text-[#3B82F6] font-medium">
                  {member.name[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground dark:text-foreground">{member.name}</h3>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">{member.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {member.status === 'invited' ? (
                  <span className="px-3 py-1 text-xs bg-accent dark:bg-accent/20 text-accent dark:text-accent rounded-full">
                    Pending
                  </span>
                ) : member.status === 'confirmed' ? (
                  <span className="px-3 py-1 text-xs bg-primary dark:bg-primary/20 text-primary dark:text-primary rounded-full">
                    Confirmed
                  </span>
                ) : (
                  <span className="px-3 py-1 text-xs bg-secondary dark:bg-secondary/20 text-secondary dark:text-secondary rounded-full">
                    Declined
                  </span>
                )}

                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onRemove(member.id)}
                  className="p-2 text-muted-foreground hover:text-secondary dark:text-muted-foreground dark:hover:text-secondary rounded-full focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  aria-label={`Remove ${member.name}`}
                >
                  <UserMinus size={18} />
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
    role: 'Trip Leader',
    status: 'confirmed'
  },
  {
    id: '2',
    name: 'John Smith',
    email: 'john@example.com',
    role: 'Member',
    status: 'invited'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    role: 'Member',
    status: 'declined'
  }
]

export default function TripMembersDemo() {
  return <TripMembers />
}