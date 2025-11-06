'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Calendar, MapPin, Users, MessageCircle, Utensils, Check, X } from 'lucide-react'

interface GroupMember {
  id: string
  name: string
  avatar?: string
  role: 'organizer' | 'member'
  rsvp?: 'yes' | 'no' | 'maybe'
  tasks?: string[]
}

interface GroupModelProps {
  groupId?: string
  members?: GroupMember[]
  isLoading?: boolean
  error?: string
  onMemberUpdate?: (memberId: string, updates: Partial<GroupMember>) => void
}

const defaultMembers: GroupMember[] = [
  {
    id: '1',
    name: 'John Smith',
    role: 'organizer',
    rsvp: 'yes',
    tasks: ['Firewood', 'Saturday Lunch']
  },
  {
    id: '2', 
    name: 'Sarah Wilson',
    role: 'member',
    rsvp: 'maybe',
    tasks: ['Sunday Breakfast']
  }
]

export function GroupModel({
  groupId = '1',
  members = defaultMembers,
  isLoading = false,
  error,
  onMemberUpdate = () => {}
}: GroupModelProps) {
  const [selectedMember, setSelectedMember] = useState<string | null>(null)

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

  if (error) {
    return (
      <div className="rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-24">
        <p className="text-sm text-secondary dark:text-secondary">{error}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-24 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-surface dark:bg-surface rounded-lg"></div>
        ))}
      </div>
    )
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-48">
        <div className="w-16 h-16 bg-surface dark:bg-surface rounded-full mx-auto mb-16 flex items-center justify-center">
          <Users className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-8">No members yet</h3>
        <p className="text-muted-foreground dark:text-muted-foreground text-sm">Invite some people to get started</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto bg-background dark:bg-surface p-24 rounded-lg shadow-md"
    >
      <div className="flex items-center justify-between mb-24">
        <h2 className="text-xl font-semibold text-muted-foreground dark:text-foreground">Trip Members</h2>
        <div className="flex items-center gap-8">
          <Users className="w-5 h-5 text-muted-foreground dark:text-muted-foreground" />
          <span className="text-muted-foreground dark:text-muted-foreground">{members.length}</span>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-16"
      >
        {members.map((member) => (
          <motion.div
            key={member.id}
            variants={itemVariants}
            whileHover={{ y: -2, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
            className="bg-background dark:bg-surface p-16 rounded-lg border border-border dark:border-border transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-12">
                <div className="w-40 h-40 rounded-full bg-primary dark:bg-primary flex items-center justify-center">
                  <span className="text-primary dark:text-primary font-medium">
                    {member.name.charAt(0)}
                  </span>
                </div>
                
                <div>
                  <h3 className="font-medium text-muted-foreground dark:text-foreground">{member.name}</h3>
                  <span className="text-sm text-muted-foreground dark:text-muted-foreground capitalize">
                    {member.role}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-8">
                {member.rsvp === 'yes' && (
                  <span className="inline-flex items-center px-8 py-2 rounded-full text-xs font-medium bg-primary dark:bg-primary text-primary dark:text-primary">
                    <Check className="w-3 h-3 mr-4" />
                    Going
                  </span>
                )}
                {member.rsvp === 'maybe' && (
                  <span className="inline-flex items-center px-8 py-2 rounded-full text-xs font-medium bg-accent dark:bg-accent text-accent dark:text-accent">
                    Pending
                  </span>
                )}
              </div>
            </div>

            {member.tasks && member.tasks.length > 0 && (
              <div className="mt-12 pt-12 border-t border-border dark:border-border">
                <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-8">Assigned Tasks:</p>
                <div className="flex flex-wrap gap-8">
                  {member.tasks.map((task) => (
                    <span
                      key={task}
                      className="inline-flex items-center px-8 py-2 rounded-full text-xs font-medium bg-primary dark:bg-primary text-primary dark:text-primary"
                    >
                      {task}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-24 w-full py-10 px-16 bg-primary hover:bg-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800 text-foreground rounded-lg font-medium text-sm shadow-sm transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Invite new members"
      >
        Invite Members
      </motion.button>
    </motion.div>
  )
}

export default function GroupModelDemo() {
  return <GroupModel />
}