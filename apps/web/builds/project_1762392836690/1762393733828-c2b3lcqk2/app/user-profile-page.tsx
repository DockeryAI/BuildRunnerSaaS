'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Camera, MapPin, Calendar, Settings, Edit2, LogOut } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface UserProfile {
  id?: string
  name?: string
  email?: string
  avatar?: string
  location?: string
  bio?: string
  upcomingTrips?: number
  completedTrips?: number
  rating?: number
}

interface UserProfilePageProps {
  profile?: UserProfile
  onEdit?: (field: string, value: string) => void
  onLogout?: () => void
  isLoading?: boolean
}

const defaultProfile: UserProfile = {
  id: '1',
  name: 'Alex Thompson',
  email: 'alex@example.com',
  avatar: '/placeholder-avatar.jpg',
  location: 'Colorado Springs, CO',
  bio: 'Avid off-roader and outdoor enthusiast. Love exploring new trails and meeting fellow adventurers.',
  upcomingTrips: 3,
  completedTrips: 12,
  rating: 4.8
}

export function UserProfilePage({
  profile = defaultProfile,
  onEdit = () => console.log('Edit profile'),
  onLogout = () => console.log('Logout'),
  isLoading = false
}: UserProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#1A1D1A] p-8 space-y-8 animate-pulse">
        <div className="max-w-3xl mx-auto">
          <div className="w-32 h-32 bg-[#D2D0C8] dark:bg-[#242824] rounded-full mx-auto" />
          <div className="h-8 w-48 bg-[#D2D0C8] dark:bg-[#242824] rounded mt-4 mx-auto" />
          <div className="h-4 w-32 bg-[#D2D0C8] dark:bg-[#242824] rounded mt-2 mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="min-h-screen bg-[#F8F7F4] dark:bg-[#1A1D1A] font-sans"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      <div className="max-w-3xl mx-auto px-4 py-8">
        {error && (
          <motion.div 
            className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm text-destructive">{error}</p>
          </motion.div>
        )}

        <motion.div 
          className="relative mb-8 text-center"
          variants={itemVariants}
        >
          <motion.div
            className="relative w-32 h-32 mx-auto mb-4"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Image
              src={profile.avatar || '/placeholder-avatar.jpg'}
              alt={`${profile.name}'s profile picture`}
              fill
              className="rounded-full object-cover border-4 border-primary shadow-lg"
            />
            <motion.button
              className="absolute bottom-0 right-0 p-2 bg-primary text-primaryForeground rounded-full shadow-md
                hover:bg-primary/90 focus:ring-2 focus:ring-ring focus-visible:outline-none"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Change profile photo"
            >
              <Camera size={20} />
            </motion.button>
          </motion.div>

          <motion.h1 
            className="text-2xl font-bold text-foreground dark:text-foreground-dark mb-2"
            variants={itemVariants}
          >
            {profile.name}
          </motion.h1>

          <motion.div
            className="flex items-center justify-center gap-2 text-mutedForeground"
            variants={itemVariants}
          >
            <MapPin size={16} />
            <span>{profile.location}</span>
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="grid grid-cols-3 gap-4 mb-8"
          variants={itemVariants}
        >
          {[
            { label: 'Upcoming Trips', value: profile.upcomingTrips },
            { label: 'Completed', value: profile.completedTrips },
            { label: 'Rating', value: profile.rating }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="bg-surface dark:bg-surface-dark p-4 rounded-lg shadow-md
                hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              whileHover={{ y: -4 }}
            >
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-mutedForeground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Bio Section */}
        <motion.div
          className="bg-surface dark:bg-surface-dark p-6 rounded-lg shadow-md mb-8"
          variants={itemVariants}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-foreground dark:text-foreground-dark">About</h2>
            <motion.button
              className="text-primary hover:text-primary/80 focus:ring-2 focus:ring-ring rounded-full p-1
                focus-visible:outline-none"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(!isEditing)}
              aria-label="Edit bio"
            >
              <Edit2 size={20} />
            </motion.button>
          </div>
          
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.textarea
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full p-3 border border-border dark:border-border rounded-lg
                  focus:ring-2 focus:ring-ring focus-visible:outline-none
                  bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark"
                defaultValue={profile.bio}
                rows={4}
                aria-label="Biography"
              />
            ) : (
              <motion.p 
                className="text-mutedForeground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {profile.bio}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="space-y-4"
          variants={itemVariants}
        >
          {[
            { icon: Calendar, label: 'Trip History' },
            { icon: Settings, label: 'Settings' }
          ].map((action, index) => (
            <motion.button
              key={index}
              className="w-full p-4 bg-surface dark:bg-surface-dark text-foreground dark:text-foreground-dark
                rounded-lg shadow-md flex items-center justify-between
                hover:shadow-lg transition-all duration-200 focus:ring-2 focus:ring-ring
                focus-visible:outline-none"
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              aria-label={action.label}
            >
              <span className="flex items-center gap-3">
                <action.icon size={20} />
                {action.label}
              </span>
            </motion.button>
          ))}

          <motion.button
            className="w-full p-4 bg-accent text-accentForeground rounded-lg shadow-md
              flex items-center justify-center gap-3 hover:bg-accent/90
              transition-all duration-200 focus:ring-2 focus:ring-ring
              focus-visible:outline-none"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLogout}
            aria-label="Logout"
          >
            <LogOut size={20} />
            Logout
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function UserProfilePageDemo() {
  return <UserProfilePage />
}